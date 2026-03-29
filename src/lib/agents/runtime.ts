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

export function getAgentStatuses(): AgentStatus[] {
  return AGENTS.map((agent) => ({
    name: agent,
    healthy: true,
    availableTools: AGENT_TOOLS[agent],
    issues: [],
  }));
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
