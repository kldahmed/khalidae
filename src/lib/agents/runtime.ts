import {
  appendAgentLog,
  updateSiteState,
} from "@/lib/agents/memory";
import {
  ExternalApiError,
  fetchPageLinks,
  fetchPageMetadata,
  fetchRobotsTxt,
  fetchSecurityHeaders,
  fetchSitemapXml,
  fetchStructuredData,
  fetchPageStatus,
  githubListFiles,
  githubReadFile,
  githubWriteFile,
  vercelGetBuildLogs,
  vercelGetDeployments,
  vercelGetRuntimeLogs,
} from "@/lib/agents/tools";
import {
  type AgentExecutionInput,
  type AgentName,
  type AgentResult,
  type AgentStatus,
  type AgentToolCall,
  type OwnerLanguage,
} from "@/lib/agents/types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const ANTHROPIC_COOLDOWN_MS = 90_000;
let lastRateLimitAt: number | null = null;
type ToolDefinition = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};

type ToolHandler = (input: Record<string, unknown>) => Promise<unknown>;

type AnthropicTextBlock = {
  type: "text";
  text: string;
};

type AnthropicToolUseBlock = {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
};

type AnthropicContentBlock = AnthropicTextBlock | AnthropicToolUseBlock;

type AnthropicMessage = {
  role: "user" | "assistant";
  content: unknown;
};

type AnthropicResponse = {
  content: AnthropicContentBlock[];
  stop_reason: string | null;
};

const CONTENT_AGENT_PROMPT =
  "You are the Content Agent for khalidae.com. You write, update, and improve content on the site. You have access to GitHub to read and modify content files. Always maintain the site's tone: precise, minimal, technical, no fluff.";

const SEO_AGENT_PROMPT =
  "You are the SEO Agent for khalidae.com. You analyze and improve all SEO-related aspects of the site. You fix metadata, titles, descriptions, og tags, and structured data. You ensure no duplicate titles and all pages have proper meta descriptions.";

const SEO_AGENT_PUBLIC_AUDIT_PROMPT =
  "You are the SEO Agent for khalidae.com in PUBLIC AUDIT mode. Analyze only the live/public website. Use website inspection tools only and do not attempt GitHub/source-code actions.";

const SEO_AGENT_SOURCE_FIX_PROMPT =
  "You are the SEO Agent for khalidae.com in SOURCE-CODE FIX mode. The owner explicitly asked to modify source files. Use GitHub tools as needed and keep changes minimal and safe.";

const DEV_AGENT_PROMPT =
  "You are the Dev Agent for khalidae.com. You fix bugs, implement features, and maintain code quality. You work with Next.js 16, TypeScript, and Tailwind CSS. Always read the file before editing. Never break existing functionality.";

const MONITOR_AGENT_PROMPT =
  "You are the Monitor Agent for khalidae.com. You watch the site health: deployments, errors, and performance. You check Vercel runtime logs, build logs, and deployment status. Report findings clearly with severity levels: critical, warning, info.";

function requireAnthropicKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new ExternalApiError("Missing required environment variable: ANTHROPIC_API_KEY");
  }
  return key;
}

export function detectLanguage(input: string): OwnerLanguage {
  return /[\u0600-\u06FF]/.test(input) ? "ar" : "en";
}

function summarizeOutput(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 240) || "No summary returned.";
}

async function anthropicRequest(body: Record<string, unknown>): Promise<AnthropicResponse> {
  const now = Date.now();
  if (lastRateLimitAt && now - lastRateLimitAt < ANTHROPIC_COOLDOWN_MS) {
    throw new ExternalApiError("System cooling down after rate limit", 429);
  }

  const apiKey = requireAnthropicKey();
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    if (response.status === 429) {
      lastRateLimitAt = Date.now();
      throw new ExternalApiError("System cooling down after rate limit", 429, details);
    }
    throw new ExternalApiError(`Anthropic request failed: ${response.status}`, response.status, details);
  }

  // Successful request clears cooldown state.
  lastRateLimitAt = null;

  return (await response.json()) as AnthropicResponse;
}

async function runAnthropicToolLoop(options: {
  systemPrompt: string;
  language: OwnerLanguage;
  task: string;
  context?: string;
  tools: ToolDefinition[];
  toolHandlers: Record<string, ToolHandler>;
}): Promise<{ output: string; toolCalls: AgentToolCall[] }> {
  const messages: AnthropicMessage[] = [
    {
      role: "user",
      content: [
        {
          type: "text",
          text:
            options.language === "ar"
              ? `تعليمات المالك: ${options.task}\n\nالسياق: ${options.context ?? "لا يوجد سياق إضافي."}\n\nيجب أن يكون الرد النهائي بالعربية.`
              : `Owner instruction: ${options.task}\n\nContext: ${options.context ?? "No additional context."}\n\nYour final answer must be in English.`,
        },
      ],
    },
  ];

  const toolCalls: AgentToolCall[] = [];
  const assistantTexts: string[] = [];

  for (let iteration = 0; iteration < 8; iteration += 1) {
    const response = await anthropicRequest({
      model: MODEL,
      max_tokens: 1800,
      system: options.systemPrompt,
      messages,
      tools: options.tools,
    });

    const textBlocks = response.content.filter(
      (block): block is AnthropicTextBlock => block.type === "text",
    );
    const toolUseBlocks = response.content.filter(
      (block): block is AnthropicToolUseBlock => block.type === "tool_use",
    );

    const cycleText = textBlocks.map((block) => block.text.trim()).filter(Boolean).join("\n\n");
    if (cycleText) {
      assistantTexts.push(cycleText);
    }

    if (toolUseBlocks.length === 0) {
      return {
        output: assistantTexts.join("\n\n").trim(),
        toolCalls,
      };
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults = await Promise.all(
      toolUseBlocks.map(async (toolUse) => {
        const handler = options.toolHandlers[toolUse.name];
        if (!handler) {
          throw new ExternalApiError(`No handler registered for tool: ${toolUse.name}`);
        }

        const result = await handler(toolUse.input);
        toolCalls.push({
          name: toolUse.name,
          input: toolUse.input,
          output: result,
          at: new Date().toISOString(),
        });

        return {
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        };
      }),
    );

    messages.push({ role: "user", content: toolResults });
  }

  throw new ExternalApiError("Anthropic tool loop exceeded maximum iterations.");
}

function baseTools() {
  return {
    github_read_file: {
      definition: {
        name: "github_read_file",
        description: "Read a file from the khalidae GitHub repository.",
        input_schema: {
          type: "object",
          properties: { path: { type: "string" } },
          required: ["path"],
        },
      },
      handler: async (input: Record<string, unknown>) =>
        githubReadFile(String(input.path ?? "")),
    },
    github_write_file: {
      definition: {
        name: "github_write_file",
        description: "Create or update a file in the khalidae GitHub repository.",
        input_schema: {
          type: "object",
          properties: {
            path: { type: "string" },
            content: { type: "string" },
            commit_message: { type: "string" },
          },
          required: ["path", "content", "commit_message"],
        },
      },
      handler: async (input: Record<string, unknown>) =>
        githubWriteFile(
          String(input.path ?? ""),
          String(input.content ?? ""),
          String(input.commit_message ?? "Update file"),
        ),
    },
    github_list_files: {
      definition: {
        name: "github_list_files",
        description: "List files in a repository directory.",
        input_schema: {
          type: "object",
          properties: { directory: { type: "string" } },
          required: ["directory"],
        },
      },
      handler: async (input: Record<string, unknown>) =>
        githubListFiles(String(input.directory ?? "")),
    },
    fetch_page_metadata: {
      definition: {
        name: "fetch_page_metadata",
        description: "Fetch the public metadata for a page URL.",
        input_schema: {
          type: "object",
          properties: { url: { type: "string" } },
          required: ["url"],
        },
      },
      handler: async (input: Record<string, unknown>) =>
        fetchPageMetadata(String(input.url ?? "")),
    },
    vercel_get_build_logs: {
      definition: {
        name: "vercel_get_build_logs",
        description: "Fetch build logs for a Vercel deployment.",
        input_schema: {
          type: "object",
          properties: { deployment_id: { type: "string" } },
          required: ["deployment_id"],
        },
      },
      handler: async (input: Record<string, unknown>) =>
        vercelGetBuildLogs(String(input.deployment_id ?? "")),
    },
    vercel_get_runtime_logs: {
      definition: {
        name: "vercel_get_runtime_logs",
        description: "Fetch recent runtime logs for the site.",
        input_schema: {
          type: "object",
          properties: { filter: { type: "string" } },
        },
      },
      handler: async (input: Record<string, unknown>) =>
        vercelGetRuntimeLogs(String(input.filter ?? "")),
    },
    vercel_get_deployments: {
      definition: {
        name: "vercel_get_deployments",
        description: "Fetch recent Vercel deployments for khalidae.com.",
        input_schema: {
          type: "object",
          properties: {},
        },
      },
      handler: async () => vercelGetDeployments(),
    },
    fetch_page_status: {
      definition: {
        name: "fetch_page_status",
        description: "Check the HTTP status of a page URL.",
        input_schema: {
          type: "object",
          properties: { url: { type: "string" } },
          required: ["url"],
        },
      },
      handler: async (input: Record<string, unknown>) =>
        fetchPageStatus(String(input.url ?? "")),
    },
    fetch_page_links: {
      definition: {
        name: "fetch_page_links",
        description: "Extract links from a public page URL.",
        input_schema: {
          type: "object",
          properties: { url: { type: "string" } },
          required: ["url"],
        },
      },
      handler: async (input: Record<string, unknown>) =>
        fetchPageLinks(String(input.url ?? "")),
    },
    fetch_robots_txt: {
      definition: {
        name: "fetch_robots_txt",
        description: "Fetch robots.txt from a site origin.",
        input_schema: {
          type: "object",
          properties: { url: { type: "string" } },
          required: ["url"],
        },
      },
      handler: async (input: Record<string, unknown>) =>
        fetchRobotsTxt(String(input.url ?? "")),
    },
    fetch_sitemap_xml: {
      definition: {
        name: "fetch_sitemap_xml",
        description: "Fetch sitemap.xml from a site origin.",
        input_schema: {
          type: "object",
          properties: { url: { type: "string" } },
          required: ["url"],
        },
      },
      handler: async (input: Record<string, unknown>) =>
        fetchSitemapXml(String(input.url ?? "")),
    },
    fetch_security_headers: {
      definition: {
        name: "fetch_security_headers",
        description: "Fetch key security headers from a public page URL.",
        input_schema: {
          type: "object",
          properties: { url: { type: "string" } },
          required: ["url"],
        },
      },
      handler: async (input: Record<string, unknown>) =>
        fetchSecurityHeaders(String(input.url ?? "")),
    },
    fetch_structured_data: {
      definition: {
        name: "fetch_structured_data",
        description: "Extract JSON-LD structured data from a public page URL.",
        input_schema: {
          type: "object",
          properties: { url: { type: "string" } },
          required: ["url"],
        },
      },
      handler: async (input: Record<string, unknown>) =>
        fetchStructuredData(String(input.url ?? "")),
    },
  };
}

type SeoMode = "public_audit" | "source_code_fix";

function detectSeoMode(task: string): SeoMode {
  const text = task.toLowerCase();

  const sourceFixSignals = [
    "modify source",
    "source code",
    "edit file",
    "update file",
    "change file",
    "commit",
    "pull request",
    "github",
    "src/",
    "page.tsx",
    "layout.tsx",
    "route.ts",
    "fix in code",
    "apply patch",
  ];

  return sourceFixSignals.some((signal) => text.includes(signal))
    ? "source_code_fix"
    : "public_audit";
}

function getToolsForAgent(agent: AgentName, task: string) {
  const tools = baseTools();

  switch (agent) {
    case "content_agent":
      // Only GitHub file tools
      return [tools.github_read_file, tools.github_write_file, tools.github_list_files];
    case "seo_agent": {
      // Only website-inspection tools in public audit mode
      const seoMode = detectSeoMode(task);
      if (seoMode === "public_audit") {
        return [
          tools.fetch_page_metadata,
          tools.fetch_page_status,
          tools.fetch_page_links,
          tools.fetch_robots_txt,
          tools.fetch_sitemap_xml,
          tools.fetch_security_headers,
          tools.fetch_structured_data,
        ];
      }
      // In source_code_fix mode, allow GitHub file tools + website-inspection tools
      return [
        tools.github_read_file,
        tools.github_write_file,
        tools.github_list_files,
        tools.fetch_page_metadata,
        tools.fetch_page_status,
        tools.fetch_page_links,
        tools.fetch_robots_txt,
        tools.fetch_sitemap_xml,
        tools.fetch_security_headers,
        tools.fetch_structured_data,
      ];
    }
    case "dev_agent":
      // Only GitHub file tools, never Vercel tools
      return [
        tools.github_read_file,
        tools.github_write_file,
        tools.github_list_files,
      ];
    case "monitor_agent":
      // Only Vercel and status tools
      return [
        tools.vercel_get_runtime_logs,
        tools.vercel_get_deployments,
        tools.vercel_get_build_logs,
        tools.fetch_page_status,
      ];
    default:
      // No fallback: return empty array for unknown agent
      return [];
  }
}

function getPromptForAgent(agent: AgentName, task: string): string {
  switch (agent) {
    case "content_agent":
      return CONTENT_AGENT_PROMPT;
    case "seo_agent": {
      const seoMode = detectSeoMode(task);
      return seoMode === "public_audit" ? SEO_AGENT_PUBLIC_AUDIT_PROMPT : SEO_AGENT_SOURCE_FIX_PROMPT;
    }
    case "dev_agent":
      return DEV_AGENT_PROMPT;
    case "monitor_agent":
      return MONITOR_AGENT_PROMPT;
  }
}

export async function runAgentByName(
  agent: AgentName,
  input: AgentExecutionInput,
): Promise<AgentResult> {
  const startedAt = new Date().toISOString();
  const language = input.language ?? detectLanguage(input.task);
  const toolEntries = getToolsForAgent(agent, input.task);

  try {
    const { output, toolCalls } = await runAnthropicToolLoop({
      systemPrompt: getPromptForAgent(agent, input.task),
      task: input.task,
      context: input.context,
      language,
      tools: toolEntries.map((tool) => tool.definition),
      toolHandlers: Object.fromEntries(toolEntries.map((tool) => [tool.definition.name, tool.handler])),
    });

    const completedAt = new Date().toISOString();
    const result: AgentResult = {
      agent,
      ok: true,
      model: MODEL,
      task: input.task,
      context: input.context,
      output,
      toolCalls,
      startedAt,
      completedAt,
    };

    await appendAgentLog({
      agent,
      task: input.task,
      ok: true,
      summary: summarizeOutput(output),
      at: completedAt,
    });

    if (agent === "monitor_agent") {
      await updateSiteState({
        last_checked_at: completedAt,
        last_health_summary: summarizeOutput(output),
      });
    }

    return result;
  } catch (error) {
    const completedAt = new Date().toISOString();
    const message = error instanceof Error ? error.message : "Unknown agent error";

    await appendAgentLog({
      agent,
      task: input.task,
      ok: false,
      summary: summarizeOutput(message),
      at: completedAt,
    });

    return {
      agent,
      ok: false,
      model: MODEL,
      task: input.task,
      context: input.context,
      output: "",
      toolCalls: [],
      startedAt,
      completedAt,
      error: message,
    };
  }
}

export function getAgentStatuses(): AgentStatus[] {
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasGithub = Boolean(process.env.GITHUB_TOKEN);
  const hasVercel = Boolean(process.env.VERCEL_TOKEN);

  return [
    {
      name: "content_agent",
      healthy: hasAnthropic && hasGithub,
      availableTools: ["github_read_file", "github_write_file", "github_list_files"],
      issues: hasAnthropic && hasGithub ? [] : ["Missing ANTHROPIC_API_KEY or GITHUB_TOKEN"],
    },
    {
      name: "seo_agent",
      healthy: hasAnthropic,
      availableTools: [
        "fetch_page_metadata",
        "fetch_page_status",
        "fetch_page_links",
        "fetch_robots_txt",
        "fetch_sitemap_xml",
        "fetch_security_headers",
        "fetch_structured_data",
        // GitHub tools only in source_code_fix mode, not in public audit
      ],
      issues: hasAnthropic
        ? hasGithub
          ? []
          : ["GITHUB_TOKEN missing: source-code SEO fixes unavailable (public audits still work)"]
        : ["Missing ANTHROPIC_API_KEY"],
    },
    {
      name: "dev_agent",
      healthy: hasAnthropic && hasGithub,
      availableTools: [
        "github_read_file",
        "github_write_file",
        "github_list_files",
      ],
      issues:
        hasAnthropic && hasGithub
          ? []
          : ["Missing ANTHROPIC_API_KEY or GITHUB_TOKEN"],
    },
    {
      name: "monitor_agent",
      healthy: hasAnthropic && hasVercel,
      availableTools: [
        "vercel_get_runtime_logs",
        "vercel_get_deployments",
        "vercel_get_build_logs",
        "fetch_page_status",
      ],
      issues: hasAnthropic && hasVercel ? [] : ["Missing ANTHROPIC_API_KEY or VERCEL_TOKEN"],
    },
  ];
}