import { appendAgentLog, appendLastTask } from "@/lib/agents/memory";
import { detectLanguage, getAgentStatuses, runAgentByName } from "@/lib/agents/runtime";
import { routeTaskToAgent } from "@/lib/agents/managerRouter";
import type {
  AgentResult,
  ManagerEvent,
  ManagerResult,
  OwnerLanguage,
} from "@/lib/agents/types";

const MANAGER_SECRET = process.env.MANAGER_SECRET;

type ExecuteOptions = {
  onEvent?: (event: ManagerEvent) => void;
};

function emit(
  onEvent: ExecuteOptions["onEvent"],
  type: ManagerEvent["type"],
  message: string,
  payload?: unknown,
) {
  onEvent?.({
    type,
    message,
    payload,
    timestamp: new Date().toISOString(),
  });
}

function buildFinalOutput(
  language: OwnerLanguage,
  instruction: string,
  delegatedResults: AgentResult[],
): string {
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
    const { agent: selectedAgent, reason: routingReason } = routeTaskToAgent(instruction);

    emit(
      options.onEvent,
      "routing_decision",
      `Selected agent: ${selectedAgent} | Reason: ${routingReason}`,
      {
        selectedAgent,
        routingReason,
      },
    );

    const forbidMonitor =
      /\b(do\s*not|don't|never)\s+call\s+monitor_agent\b/i.test(instruction) ||
      /\buse\s+github\s+only\b/i.test(instruction) ||
      /\bdo\s*not\s*use\s*vercel\b/i.test(instruction);

    if (selectedAgent === "monitor_agent" && forbidMonitor) {
      emit(
        options.onEvent,
        "routing_blocked",
        "monitor_agent was blocked by instruction constraints",
        {
          selectedAgent,
          routingReason,
        },
      );

      throw new Error("monitor_agent is forbidden by instruction constraints");
    }

    emit(options.onEvent, "agent_start", `Running ${selectedAgent}`, {
      agent: selectedAgent,
    });

    const result = await runAgentByName(selectedAgent, {
      task: instruction,
      language,
    });

    delegatedResults.push(result);

    emit(
      options.onEvent,
      "agent_result",
      `${selectedAgent} ${result.ok ? "completed" : "failed"}`,
      {
        agent: selectedAgent,
        ok: result.ok,
        error: result.error,
      },
    );

    const output = buildFinalOutput(language, instruction, delegatedResults);
    const completedAt = new Date().toISOString();

    await appendAgentLog({
      agent: selectedAgent,
      task: instruction,
      ok: result.ok,
      summary: output.slice(0, 240),
      at: completedAt,
    });

    const managerResult: ManagerResult = {
      ok: delegatedResults.every((item) => item.ok),
      language,
      output,
      startedAt,
      completedAt,
      delegatedResults,
      statusSnapshot: getAgentStatuses(),
    };

    emit(options.onEvent, "manager_complete", "Manager execution completed", {
      ok: managerResult.ok,
      delegatedAgents: delegatedResults.length,
    });

    return managerResult;
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