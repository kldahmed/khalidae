import type { AgentResult, OwnerLanguage } from "@/lib/agents/types";

type AgentName =
  | "dev_agent"
  | "seo_agent"
  | "monitor_agent"
  | "content_agent";

type RunAgentInput = {
  task: string;
  language: OwnerLanguage;
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

  const hasArabic = /[\u0600-\u06FF]/.test(text);
  return hasArabic ? "ar" : "en";
}

export function getAgentStatuses(): Record<AgentName, "idle" | "ready"> {
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

  const output = buildAgentOutput(normalizedAgent, input.task, input.language);

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
): string {
  if (language === "ar") {
    switch (agent) {
      case "dev_agent":
        return `تم توجيه المهمة إلى dev_agent.\nالمهمة: ${task}\nتم إنشاء استجابة تشغيلية أولية بنجاح.`;
      case "seo_agent":
        return `تم توجيه المهمة إلى seo_agent.\nالمهمة: ${task}\nتم إنشاء تحليل SEO أولي بنجاح.`;
      case "monitor_agent":
        return `تم توجيه المهمة إلى monitor_agent.\nالمهمة: ${task}\nتم إنشاء تقرير مراقبة أولي بنجاح.`;
      case "content_agent":
        return `تم توجيه المهمة إلى content_agent.\nالمهمة: ${task}\nتم إنشاء استجابة محتوى أولية بنجاح.`;
    }
  }

  switch (agent) {
    case "dev_agent":
      return `Task routed to dev_agent.\nTask: ${task}\nInitial development response generated successfully.`;
    case "seo_agent":
      return `Task routed to seo_agent.\nTask: ${task}\nInitial SEO response generated successfully.`;
    case "monitor_agent":
      return `Task routed to monitor_agent.\nTask: ${task}\nInitial monitoring response generated successfully.`;
    case "content_agent":
      return `Task routed to content_agent.\nTask: ${task}\nInitial content response generated successfully.`;
  }
}
