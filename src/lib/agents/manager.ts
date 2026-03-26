import { appendAgentLog, appendLastTask } from "@/lib/agents/memory";
import { detectLanguage, getAgentStatuses, runAgentByName } from "@/lib/agents/runtime";
import type { AgentName, AgentResult, ManagerEvent, ManagerResult, OwnerLanguage } from "@/lib/agents/types";
import { routeTaskToAgent } from "@/lib/agents/managerRouter";

const MANAGER_SECRET = process.env.MANAGER_SECRET;
const ALLOWED_AGENTS: AgentName[] = [
  "monitor_agent",
  "dev_agent",
  "seo_agent",
  "content_agent",
];
const MAX_AGENT_CALLS_PER_INSTRUCTION = 3;

type ExecuteOptions = {
  onEvent?: (event: ManagerEvent) => void;
};

type AgentCallMap = Partial<Record<AgentName, boolean>>;

function emit(onEvent: ExecuteOptions["onEvent"], type: ManagerEvent["type"], message: string, payload?: unknown) {
  onEvent?.({
    type,
    message,
    payload,
    timestamp: new Date().toISOString(),
  });
}

function uniqueAgentsFromInstruction(instruction: string): AgentName[] {
  const text = instruction.toLowerCase();
  const selected: AgentName[] = [];

  const rules: Array<{ agent: AgentName; triggers: string[] }> = [
    {
      agent: "monitor_agent",
      triggers: ["monitor", "status", "runtime", "deploy", "deployment", "logs", "health", "راقب", "حالة", "نشر", "اخطاء", "أخطاء"],
    },
    {
      agent: "dev_agent",
      triggers: ["dev", "code", "bug", "fix", "implement", "feature", "debug", "طور", "برمجة", "إصلاح", "ميزة"],
    },
    {
      agent: "seo_agent",
      triggers: ["seo", "metadata", "meta", "title", "description", "canonical", "og", "سيو", "وصف", "عنوان"],
    },
    {
      agent: "content_agent",
      triggers: ["content", "copy", "text", "article", "write", "update page", "محتوى", "نص", "مقال", "اكتب"],
    },
  ];

  for (const rule of rules) {
    if (rule.triggers.some((trigger) => text.includes(trigger))) {
      selected.push(rule.agent);
    }
  }

  if (selected.length === 0) {
    selected.push("monitor_agent");
  }

  return selected;
}

function buildFinalOutput(language: OwnerLanguage, instruction: string, delegatedResults: AgentResult[]): string {
  const okResults = delegatedResults.filter((result) => result.ok);
  const failedResults = delegatedResults.filter((result) => !result.ok);

  if (language === "ar") {
    const lines: string[] = [
      `تم تنفيذ التعليمات: ${instruction}`,
      "",
      `عدد الوكلاء المنفذين: ${delegatedResults.length}`,
      `نجاح: ${okResults.length} | فشل: ${failedResults.length}`,
      "",
      "النتائج:",
    ];

    for (const result of delegatedResults) {
      const title = `- ${result.agent}: ${result.ok ? "نجاح" : "فشل"}`;
      const summary = result.ok
        ? result.output.trim().slice(0, 400) || "لا يوجد مخرجات نصية."
        : result.error || "خطأ غير معروف";
      lines.push(title);
      lines.push(`  ${summary}`);
    }

    return lines.join("\n").trim();
  }

  const lines: string[] = [
    `Instruction executed: ${instruction}`,
    "",
    `Agents run: ${delegatedResults.length}`,
    `Success: ${okResults.length} | Failed: ${failedResults.length}`,
    "",
    "Results:",
  ];

  for (const result of delegatedResults) {
    const title = `- ${result.agent}: ${result.ok ? "ok" : "failed"}`;
    const summary = result.ok
      ? result.output.trim().slice(0, 400) || "No text output returned."
      : result.error || "Unknown error";
    lines.push(title);
    lines.push(`  ${summary}`);
  }

  return lines.join("\n").trim();
}

export function validateManagerSecret(secret?: string): boolean {
  if (!MANAGER_SECRET) {
    return false;
  }

  if (!secret) {
    return false;
  }

  return secret === MANAGER_SECRET;
}

export async function executeManagerInstruction(
  instruction: string,
  options: ExecuteOptions = {},
): Promise<ManagerResult> {
  const startedAt = new Date().toISOString();
  const language = detectLanguage(instruction);
  const delegatedResults: AgentResult[] = [];
  const agentCalls: AgentCallMap = {};

  emit(options.onEvent, "manager_start", "Manager execution started", {
    instruction,
    language,
  });

  await appendLastTask({
    instruction,
    language,
    at: startedAt,
  });

  emit(options.onEvent, "memory_write", "Stored last task in memory");

  try {
    const selectedAgents = uniqueAgentsFromInstruction(instruction)
      .filter((agent) => ALLOWED_AGENTS.includes(agent))
      .slice(0, MAX_AGENT_CALLS_PER_INSTRUCTION);

    for (const agent of selectedAgents) {
      if (agentCalls[agent]) {
        emit(options.onEvent, "agent_result", `Skipped duplicate agent call: ${agent}`);
        continue;
      }

      agentCalls[agent] = true;

      emit(options.onEvent, "agent_start", `Running ${agent}`, { agent });

      const result = await runAgentByName(agent, {
        task: instruction,
        language,
      });

      delegatedResults.push(result);

      emit(options.onEvent, "agent_result", `${agent} ${result.ok ? "completed" : "failed"}`, {
        agent,
        ok: result.ok,
        error: result.error,
      });
    }

    const output = buildFinalOutput(language, instruction, delegatedResults);
    const completedAt = new Date().toISOString();

    await appendAgentLog({
      agent: "monitor_agent",
      task: instruction,
      ok: true,
      summary: output.slice(0, 240),
      at: completedAt,
    });

    const result: ManagerResult = {
      ok: delegatedResults.every((item) => item.ok),
      language,
      output,
      startedAt,
      completedAt,
      delegatedResults,
      statusSnapshot: getAgentStatuses(),
    };

    emit(options.onEvent, "manager_complete", "Manager execution completed", {
      ok: result.ok,
      delegatedAgents: delegatedResults.length,
    });

    return result;
  } catch (error) {
    const completedAt = new Date().toISOString();
    const message = error instanceof Error ? error.message : "Unknown manager error";

    emit(options.onEvent, "error", message);

    return {
      ok: false,
      language,
      output: language === "ar" ? "فشل تنفيذ المدير." : "Manager execution failed.",
      startedAt,
      completedAt,
      delegatedResults,
      statusSnapshot: getAgentStatuses(),
      error: message,
    };
  }
}
