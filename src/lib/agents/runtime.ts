import type { AgentResult, OwnerLanguage } from "@/lib/agents/types";

export type AgentName =
  | "dev_agent"
  | "seo_agent"
  | "monitor_agent"
  | "content_agent";

export type RunAgentInput = {
  task: string;
  language?: OwnerLanguage;
  context?: string;
};

const AGENTS: AgentName[] = [
  "dev_agent",
  "seo_agent",
  "monitor_agent",
  "content_agent",
];

export function detectLanguage(input: string): OwnerLanguage {
  const text = input.trim();

  if (!text) {
    return "en";
  }

  return /[\u0600-\u06FF]/.test(text) ? "ar" : "en";
}

export function getAgentStatuses(): Record<AgentName, "ready"> {
  return {
    dev_agent: "ready",
    seo_agent: "ready",
    monitor_agent: "ready",
    content_agent: "ready",
  };
}

export async function runAgentByName(
  agent: string,
  input: RunAgentInput,
): Promise<AgentResult> {
  const normalizedAgent = normalizeAgentName(agent);

  if (!normalizedAgent) {
    return {
      agent,
      ok: false,
      output: "",
      error: `Unknown agent: ${agent}`,
    };
  }

  const language = input.language ?? detectLanguage(input.task);
  const output = buildAgentOutput(normalizedAgent, input.task, language, input.context);

  return {
    agent: normalizedAgent,
    ok: true,
    output,
  };
}

function normalizeAgentName(agent: string): AgentName | null {
  return AGENTS.includes(agent as AgentName) ? (agent as AgentName) : null;
}

function buildAgentOutput(
  agent: AgentName,
  task: string,
  language: OwnerLanguage,
  context?: string,
): string {
  const safeContext = context?.trim();

  if (language === "ar") {
    switch (agent) {
      case "dev_agent":
        return [
          "تم توجيه المهمة إلى dev_agent.",
          `المهمة: ${task}`,
          safeContext ? `السياق: ${safeContext}` : null,
          "تم إنشاء استجابة تطوير أولية بنجاح.",
        ]
          .filter(Boolean)
          .join("\n");

      case "seo_agent":
        return [
          "تم توجيه المهمة إلى seo_agent.",
          `المهمة: ${task}`,
          safeContext ? `السياق: ${safeContext}` : null,
          "تم إنشاء استجابة SEO أولية بنجاح.",
        ]
          .filter(Boolean)
          .join("\n");

      case "monitor_agent":
        return [
          "تم توجيه المهمة إلى monitor_agent.",
          `المهمة: ${task}`,
          safeContext ? `السياق: ${safeContext}` : null,
          "تم إنشاء استجابة مراقبة أولية بنجاح.",
        ]
          .filter(Boolean)
          .join("\n");

      case "content_agent":
        return [
          "تم توجيه المهمة إلى content_agent.",
          `المهمة: ${task}`,
          safeContext ? `السياق: ${safeContext}` : null,
          "تم إنشاء استجابة محتوى أولية بنجاح.",
        ]
          .filter(Boolean)
          .join("\n");
    }
  }

  switch (agent) {
    case "dev_agent":
      return [
        "Task routed to dev_agent.",
        `Task: ${task}`,
        safeContext ? `Context: ${safeContext}` : null,
        "Initial development response generated successfully.",
      ]
        .filter(Boolean)
        .join("\n");

    case "seo_agent":
      return [
        "Task routed to seo_agent.",
        `Task: ${task}`,
        safeContext ? `Context: ${safeContext}` : null,
        "Initial SEO response generated successfully.",
      ]
        .filter(Boolean)
        .join("\n");

    case "monitor_agent":
      return [
        "Task routed to monitor_agent.",
        `Task: ${task}`,
        safeContext ? `Context: ${safeContext}` : null,
        "Initial monitoring response generated successfully.",
      ]
        .filter(Boolean)
        .join("\n");

    case "content_agent":
      return [
        "Task routed to content_agent.",
        `Task: ${task}`,
        safeContext ? `Context: ${safeContext}` : null,
        "Initial content response generated successfully.",
      ]
        .filter(Boolean)
        .join("\n");
  }
}
