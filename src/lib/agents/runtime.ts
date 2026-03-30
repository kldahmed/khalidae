import type {
  AgentExecutionInput,
  AgentName,
  AgentResult,
  AgentStatus,
  OwnerLanguage,
} from "@/lib/agents/types";

const AGENTS: AgentName[] = [
  "content_agent",
  "seo_agent",
  "dev_agent",
  "monitor_agent",
];

const AGENT_MODELS: Record<AgentName, string> = {
  content_agent: "internal-content-router",
  seo_agent: "internal-seo-router",
  dev_agent: "internal-dev-router",
  monitor_agent: "internal-monitor-router",
};

const AGENT_TOOLS: Record<AgentName, string[]> = {
  content_agent: [
    "github_read_file",
    "github_write_file",
    "github_list_files",
  ],
  dev_agent: [
    "github_read_file",
    "github_write_file",
    "github_list_files",
  ],
  seo_agent: [
    "fetch_page_status",
    "fetch_page_metadata",
    "fetch_page_links",
    "fetch_page_overview",
    "fetch_robots_txt",
    "fetch_sitemap_xml",
    "fetch_security_headers",
    "fetch_structured_data",
  ],
  monitor_agent: [
    "vercel_get_deployments",
    "vercel_get_build_logs",
    "vercel_get_runtime_logs",
    "fetch_page_status",
  ],
};

export function detectLanguage(input: string): OwnerLanguage {
  const text = input.trim();

  if (!text) {
    return "en";
  }

  return /[\u0600-\u06FF]/.test(text) ? "ar" : "en";
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

  if (!AGENTS.includes(agent)) {
    const completedAt = new Date().toISOString();

    return {
      agent: "dev_agent",
      ok: false,
      model: "internal-fallback-router",
      task: input.task,
      context: input.context,
      output:
        language === "ar"
          ? `الوكيل غير معروف: ${agent}`
          : `Unknown agent: ${agent}`,
      toolCalls: [],
      startedAt,
      completedAt,
      error:
        language === "ar"
          ? `الوكيل غير معروف: ${agent}`
          : `Unknown agent: ${agent}`,
    };
  }

  const output = buildAgentOutput(agent, input, language);
  const completedAt = new Date().toISOString();

  return {
    agent,
    ok: true,
    model: AGENT_MODELS[agent],
    task: input.task,
    context: input.context,
    output,
    toolCalls: [],
    startedAt,
    completedAt,
  };
}

function buildAgentOutput(
  agent: AgentName,
  input: AgentExecutionInput,
  language: OwnerLanguage,
): string {
  const contextLine = input.context?.trim()
    ? language === "ar"
      ? `السياق: ${input.context.trim()}`
      : `Context: ${input.context.trim()}`
    : null;

  if (language === "ar") {
    switch (agent) {
      case "content_agent":
        return [
          "تم توجيه المهمة إلى content_agent.",
          `المهمة: ${input.task}`,
          contextLine,
          "الأدوات المتاحة:",
          ...AGENT_TOOLS[agent].map((tool) => `- ${tool}`),
          "تم إنشاء استجابة محتوى أولية بنجاح.",
        ]
          .filter(Boolean)
          .join("\n");

      case "seo_agent":
        return [
          "تم توجيه المهمة إلى seo_agent.",
          `المهمة: ${input.task}`,
          contextLine,
          "الأدوات المتاحة:",
          ...AGENT_TOOLS[agent].map((tool) => `- ${tool}`),
          "تم إنشاء استجابة SEO أولية بنجاح.",
        ]
          .filter(Boolean)
          .join("\n");

      case "dev_agent":
        return [
          "تم توجيه المهمة إلى dev_agent.",
          `المهمة: ${input.task}`,
          contextLine,
          "الأدوات المتاحة:",
          ...AGENT_TOOLS[agent].map((tool) => `- ${tool}`),
          "تم إنشاء استجابة تطوير أولية بنجاح.",
        ]
          .filter(Boolean)
          .join("\n");

      case "monitor_agent":
        return [
          "تم توجيه المهمة إلى monitor_agent.",
          `المهمة: ${input.task}`,
          contextLine,
          "الأدوات المتاحة:",
          ...AGENT_TOOLS[agent].map((tool) => `- ${tool}`),
          "تم إنشاء استجابة مراقبة أولية بنجاح.",
        ]
          .filter(Boolean)
          .join("\n");
    }
  }

  switch (agent) {
    case "content_agent":
      return [
        "Task routed to content_agent.",
        `Task: ${input.task}`,
        contextLine,
        "Available tools:",
        ...AGENT_TOOLS[agent].map((tool) => `- ${tool}`),
        "Initial content response generated successfully.",
      ]
        .filter(Boolean)
        .join("\n");

    case "seo_agent":
      return [
        "Task routed to seo_agent.",
        `Task: ${input.task}`,
        contextLine,
        "Available tools:",
        ...AGENT_TOOLS[agent].map((tool) => `- ${tool}`),
        "Initial SEO response generated successfully.",
      ]
        .filter(Boolean)
        .join("\n");

    case "dev_agent":
      return [
        "Task routed to dev_agent.",
        `Task: ${input.task}`,
        contextLine,
        "Available tools:",
        ...AGENT_TOOLS[agent].map((tool) => `- ${tool}`),
        "Initial development response generated successfully.",
      ]
        .filter(Boolean)
        .join("\n");

    case "monitor_agent":
      return [
        "Task routed to monitor_agent.",
        `Task: ${input.task}`,
        contextLine,
        "Available tools:",
        ...AGENT_TOOLS[agent].map((tool) => `- ${tool}`),
        "Initial monitoring response generated successfully.",
      ]
        .filter(Boolean)
        .join("\n");
  }
}
