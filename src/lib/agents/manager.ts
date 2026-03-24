import { appendLastTask, readMemory, writeMemory } from "@/lib/agents/memory";
import { ExternalApiError } from "@/lib/agents/tools";
import { detectLanguage, getAgentStatuses, runAgentByName } from "@/lib/agents/runtime";
import {
  type AgentName,
  type AgentResult,
  type ManagerEvent,
  type ManagerResult,
  type OwnerLanguage,
} from "@/lib/agents/types";

const CHAT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const MANAGER_SYSTEM_PROMPT =
  "You are the executive site manager for khalidae.com. You receive instructions from the site owner in Arabic or English. Your job is to analyze the instruction, break it into tasks, delegate each task to the right specialized agent, verify the results, retry failed tasks when appropriate, and produce a clear final report in the same language as the owner. Available agents: content_agent, seo_agent, dev_agent, monitor_agent. You are allowed to orchestrate aggressively, recover from failures, and delegate follow-up repair tasks. Never claim work was done if it was not. Always report what happened, what failed, and what should happen next.";

type ManagerToolDefinition = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};

type ManagerToolHandler = (input: Record<string, unknown>) => Promise<unknown>;

type AnthropicToolUseBlock = {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
};

type AnthropicTextBlock = {
  type: "text";
  text: string;
};

type AnthropicToolResultBlock = {
  type: "tool_result";
  tool_use_id: string;
  content: string;
};

type AnthropicUserMessageParam = {
  role: "user";
  content: Array<AnthropicTextBlock | AnthropicToolResultBlock>;
};

type AnthropicAssistantMessageParam = {
  role: "assistant";
  content: AnthropicTextBlock[];
};

type AnthropicMessageParam = AnthropicUserMessageParam | AnthropicAssistantMessageParam;

type AnthropicResponse = {
  content: Array<AnthropicToolUseBlock | AnthropicTextBlock>;
};

type ManagerExecutionOptions = {
  onEvent?: (event: ManagerEvent) => void;
};

function emit(
  onEvent: ManagerExecutionOptions["onEvent"],
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

function requireAnthropicKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new ExternalApiError("Missing required environment variable: ANTHROPIC_API_KEY");
  }
  return key;
}

async function anthropicRequest(body: Record<string, unknown>): Promise<AnthropicResponse> {
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

  const raw = await response.text();

  if (!response.ok) {
    throw new ExternalApiError(
      `Anthropic request failed: ${response.status}`,
      response.status,
      raw,
    );
  }

  return JSON.parse(raw) as AnthropicResponse;
}

async function safeAppendLastTask(task: {
  instruction: string;
  language: OwnerLanguage;
  at: string;
}): Promise<void> {
  try {
    await Promise.resolve(appendLastTask(task));
  } catch (error) {
    console.error("[manager] appendLastTask failed:", error);
  }
}

async function safeReadMemory(key: string): Promise<unknown> {
  try {
    return await Promise.resolve(readMemory(key));
  } catch (error) {
    console.error("[manager] readMemory failed:", error);
    return null;
  }
}

async function safeWriteMemory(key: string, value: string): Promise<{ ok: boolean; key: string }> {
  try {
    await Promise.resolve(writeMemory(key, value));
    return { ok: true, key };
  } catch (error) {
    console.error("[manager] writeMemory failed:", error);
    return { ok: false, key };
  }
}

async function callAgentWithTracking(
  agentName: AgentName,
  task: string,
  language: OwnerLanguage,
  delegatedResults: AgentResult[],
  options: ManagerExecutionOptions,
  context?: string,
): Promise<AgentResult> {
  emit(options.onEvent, "agent_start", `Delegating to ${agentName}.`, {
    agent: agentName,
    task,
    context,
  });

  const result = await runAgentByName(agentName, {
    task,
    context,
    language,
  });

  delegatedResults.push(result);
  emit(options.onEvent, "agent_result", `${agentName} completed.`, result);

  return result;
}

async function runFallbackManager(
  instruction: string,
  language: OwnerLanguage,
  delegatedResults: AgentResult[],
  options: ManagerExecutionOptions,
  startedAt: string,
): Promise<ManagerResult> {
  const normalized = instruction.trim().toLowerCase();
  const completedAt = new Date().toISOString();
  const ar = language === "ar";

  if (
    normalized === "status" ||
    normalized === "system status" ||
    normalized === "show system status" ||
    normalized === "agents" ||
    normalized === "list agents"
  ) {
    const statusSnapshot = await getAgentStatuses();

    return {
      ok: true,
      language,
      output: ar
        ? `حالة النظام الحالية:\n${JSON.stringify(statusSnapshot, null, 2)}`
        : `Current system status:\n${JSON.stringify(statusSnapshot, null, 2)}`,
      startedAt,
      completedAt,
      delegatedResults,
      statusSnapshot,
    };
  }

  if (
    normalized.includes("fix") ||
    normalized.includes("heal") ||
    normalized.includes("repair") ||
    normalized.includes("اصلح") ||
    normalized.includes("عالج") ||
    normalized.includes("حل")
  ) {
    const monitor = await callAgentWithTracking(
      "monitor_agent",
      ar
        ? `افحص النظام وحدد الخطأ الحالي بدقة ثم قدّم خطة إصلاح موجزة. الطلب الأصلي: ${instruction}`
        : `Inspect the system, identify the current failure precisely, and provide a concise repair plan. Original request: ${instruction}`,
      language,
      delegatedResults,
      options,
    );

    const dev = await callAgentWithTracking(
      "dev_agent",
      ar
        ? `نفّذ إصلاحًا موجّهًا بناءً على نتيجة monitor_agent. الطلب الأصلي: ${instruction}`
        : `Apply a targeted fix based on the monitor_agent result. Original request: ${instruction}`,
      language,
      delegatedResults,
      options,
      JSON.stringify(monitor),
    );

    const statusSnapshot = await getAgentStatuses();

    return {
      ok: true,
      language,
      output: ar
        ? `تم تشغيل مسار الإصلاح الذاتي.\n\nنتيجة المراقبة:\n${monitor.output || "لا يوجد"}\n\nنتيجة التطوير:\n${dev.output || "لا يوجد"}`
        : `Self-healing path executed.\n\nMonitor result:\n${monitor.output || "N/A"}\n\nDev result:\n${dev.output || "N/A"}`,
      startedAt,
      completedAt,
      delegatedResults,
      statusSnapshot,
    };
  }

  if (
    normalized.includes("content") ||
    normalized.includes("seo") ||
    normalized.includes("page") ||
    normalized.includes("محتوى") ||
    normalized.includes("سيو") ||
    normalized.includes("صفحة")
  ) {
    const targetAgent: AgentName =
      normalized.includes("seo") || normalized.includes("سيو")
        ? "seo_agent"
        : "content_agent";

    const result = await callAgentWithTracking(
      targetAgent,
      instruction,
      language,
      delegatedResults,
      options,
    );

    const statusSnapshot = await getAgentStatuses();

    return {
      ok: true,
      language,
      output: result.output || (ar ? "تم التنفيذ." : "Completed."),
      startedAt,
      completedAt,
      delegatedResults,
      statusSnapshot,
    };
  }

  const dev = await callAgentWithTracking(
    "dev_agent",
    instruction,
    language,
    delegatedResults,
    options,
  );

  const statusSnapshot = await getAgentStatuses();

  return {
    ok: true,
    language,
    output: dev.output || (ar ? "تم التفويض إلى dev_agent." : "Delegated to dev_agent."),
    startedAt,
    completedAt,
    delegatedResults,
    statusSnapshot,
  };
}

export function validateManagerSecret(secret: string | null | undefined): boolean {
  const expected = process.env.MANAGER_SECRET;
  return Boolean(expected && secret && secret === expected);
}

export async function getAgentsStatus() {
  return getAgentStatuses();
}

export async function executeManagerInstruction(
  instruction: string,
  options: ManagerExecutionOptions = {},
): Promise<ManagerResult> {
  const startedAt = new Date().toISOString();
  const language: OwnerLanguage = detectLanguage(instruction);
  const delegatedResults: AgentResult[] = [];

  emit(options.onEvent, "manager_start", "Manager instruction received.", {
    instruction,
    language,
  });

  await safeAppendLastTask({
    instruction,
    language,
    at: startedAt,
  });

  const toolDefinitions: ManagerToolDefinition[] = [
    {
      name: "call_agent",
      description: "Delegate a task to one specialized agent.",
      input_schema: {
        type: "object",
        properties: {
          agent_name: {
            type: "string",
            enum: ["content_agent", "seo_agent", "dev_agent", "monitor_agent"],
          },
          task_description: { type: "string" },
          context: { type: "string" },
        },
        required: ["agent_name", "task_description"],
      },
    },
    {
      name: "get_agents_status",
      description: "Get the current status of all specialized agents.",
      input_schema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "read_memory",
      description: "Read manager memory by key.",
      input_schema: {
        type: "object",
        properties: { key: { type: "string" } },
        required: ["key"],
      },
    },
    {
      name: "write_memory",
      description: "Write a string value to memory by key.",
      input_schema: {
        type: "object",
        properties: {
          key: { type: "string" },
          value: { type: "string" },
        },
        required: ["key", "value"],
      },
    },
  ];

  const toolHandlers: Record<string, ManagerToolHandler> = {
    call_agent: async (input) => {
      const agentName = String(input.agent_name ?? "") as AgentName;
      const taskDescription = String(input.task_description ?? "");
      const context = input.context ? String(input.context) : undefined;

      return callAgentWithTracking(
        agentName,
        taskDescription,
        language,
        delegatedResults,
        options,
        context,
      );
    },

    get_agents_status: async () => {
      const status = await getAgentsStatus();
      emit(options.onEvent, "tool_result", "Collected agent status snapshot.", status);
      return status;
    },

    read_memory: async (input) => {
      const key = String(input.key ?? "");
      const result = await safeReadMemory(key);
      emit(options.onEvent, "tool_result", `Read memory for key ${key}.`, { key });
      return result;
    },

    write_memory: async (input) => {
      const key = String(input.key ?? "");
      const value = String(input.value ?? "");
      const written = await safeWriteMemory(key, value);

      emit(options.onEvent, "memory_write", `Memory write processed for key ${key}.`, {
        key,
        ok: written.ok,
      });

      return written;
    },
  };

  try {
    const messages: AnthropicMessageParam[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              language === "ar"
                ? `تعليمات المالك: ${instruction}\n\nحلّل الطلب، فوّض المهام للوكلاء المناسبين، أصلح الإخفاقات إن ظهرت، ثم قدّم تقريراً نهائياً بالعربية.`
                : `Owner instruction: ${instruction}\n\nAnalyze the request, delegate work to the right agents, repair failures if they appear, then return a final report in English.`,
          },
        ],
      },
    ];

    const assistantTexts: string[] = [];

    for (let iteration = 0; iteration < 8; iteration += 1) {
      const response = await anthropicRequest({
        model: DEFAULT_MODEL,
        max_tokens: 1800,
        system: MANAGER_SYSTEM_PROMPT,
        messages,
        tools: toolDefinitions,
      });

      const textBlocks = response.content.filter(
        (block): block is AnthropicTextBlock => block.type === "text",
      );

      const toolUseBlocks = response.content.filter(
        (block): block is AnthropicToolUseBlock => block.type === "tool_use",
      );

      const text = textBlocks
        .map((block) => block.text.trim())
        .filter(Boolean)
        .join("\n\n");

      if (text) {
        assistantTexts.push(text);
      }

      if (toolUseBlocks.length === 0) {
        const completedAt = new Date().toISOString();
        const statusSnapshot = await getAgentStatuses();

        const result: ManagerResult = {
          ok: true,
          language,
          output: assistantTexts.join("\n\n").trim(),
          startedAt,
          completedAt,
          delegatedResults,
          statusSnapshot,
        };

        emit(options.onEvent, "manager_complete", "Manager completed delegation.", result);
        return result;
      }

      const assistantText = textBlocks.map((block) => block.text).join("\n");

      messages.push({
        role: "assistant",
        content: assistantText ? [{ type: "text", text: assistantText }] : [],
      });

      const toolResults: AnthropicToolResultBlock[] = await Promise.all(
        toolUseBlocks.map(async (toolUse) => {
          emit(options.onEvent, "tool_call", `Manager called ${toolUse.name}.`, {
            tool: toolUse.name,
            input: toolUse.input,
          });

          const handler = toolHandlers[toolUse.name];
          if (!handler) {
            throw new ExternalApiError(`No manager tool handler found for ${toolUse.name}`);
          }

          const result = await handler(toolUse.input);

          return {
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: JSON.stringify(result),
          };
        }),
      );

      messages.push({
        role: "user",
        content: toolResults,
      });
    }

    throw new ExternalApiError("Manager exceeded maximum delegation iterations.");
  } catch (error) {
    console.error("[manager] anthropic path failed, switching to fallback:", error);

    try {
      const fallback = await runFallbackManager(
        instruction,
        language,
        delegatedResults,
        options,
        startedAt,
      );

      emit(options.onEvent, "manager_complete", "Manager completed via fallback.", fallback);
      return fallback;
    } catch (fallbackError) {
      const completedAt = new Date().toISOString();
      const message =
        fallbackError instanceof Error ? fallbackError.message : "Unknown manager error";

      emit(options.onEvent, "error", message);
      console.error("[manager] fallback failed:", fallbackError);

      return {
        ok: false,
        language,
        output: "",
        startedAt,
        completedAt,
        delegatedResults,
        statusSnapshot: await getAgentStatuses(),
        error: message,
      };
    }
  }
}