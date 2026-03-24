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

const MODEL = "claude-sonnet-4-20250514";

const MANAGER_SYSTEM_PROMPT =
  "You are the intelligent site manager for khalidae.com. You receive instructions from the site owner in Arabic or English. Your job is to analyze the instruction, break it into tasks, and delegate each task to the right specialized agent. Available agents: content_agent: writes/updates site content, pages, and tool descriptions. seo_agent: improves metadata, titles, descriptions, and structured data. dev_agent: fixes bugs, updates components, commits code to GitHub. monitor_agent: checks Vercel logs, deployment status, and site health. Always respond in the same language the owner used. Always report back what each agent did and its result. Never take action yourself - always delegate.";

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

  if (!response.ok) {
    const details = await response.text();
    throw new ExternalApiError(`Anthropic request failed: ${response.status}`, response.status, details);
  }

  return (await response.json()) as AnthropicResponse;
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

  await appendLastTask({
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

      emit(options.onEvent, "agent_start", `Delegating to ${agentName}.`, {
        agent: agentName,
        task: taskDescription,
      });

      const result = await runAgentByName(agentName, {
        task: taskDescription,
        context,
        language,
      });
      delegatedResults.push(result);

      emit(options.onEvent, "agent_result", `${agentName} completed.`, result);
      return result;
    },
    get_agents_status: async () => {
      const status = await getAgentsStatus();
      emit(options.onEvent, "tool_result", "Collected agent status snapshot.", status);
      return status;
    },
    read_memory: async (input) => {
      const key = String(input.key ?? "");
      return readMemory(key);
    },
    write_memory: async (input) => {
      const key = String(input.key ?? "");
      const value = String(input.value ?? "");
      const written = await writeMemory(key, value);
      emit(options.onEvent, "memory_write", `Memory updated for key ${key}.`, { key });
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
                ? `تعليمات المالك: ${instruction}\n\nحلّل الطلب، فوّض المهام للوكلاء المناسبين، ثم قدّم تقريراً نهائياً بالعربية.`
                : `Owner instruction: ${instruction}\n\nAnalyze the request, delegate work to the right agents, then return a final report in English.`,
          },
        ],
      },
    ];

    const assistantTexts: string[] = [];

    for (let iteration = 0; iteration < 8; iteration += 1) {
      const response = await anthropicRequest({
        model: MODEL,
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

      const text = textBlocks.map((block) => block.text.trim()).filter(Boolean).join("\n\n");
      if (text) {
        assistantTexts.push(text);
      }

      if (toolUseBlocks.length === 0) {
        const completedAt = new Date().toISOString();
        const statusSnapshot = await getAgentsStatus();
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

      const assistantText =
        Array.isArray(response.content)
          ? response.content
              .filter(
                (
                  block,
                ): block is { type: "text"; text: string } =>
                  block.type === "text" && typeof block.text === "string",
              )
              .map((block) => block.text)
              .join("\n")
          : "";

      messages.push({
        role: "assistant",
        content: assistantText
          ? [{ type: "text", text: assistantText }]
          : [],
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

      messages.push({ role: "user", content: toolResults });
    }

    throw new ExternalApiError("Manager exceeded maximum delegation iterations.");
  } catch (error) {
    const completedAt = new Date().toISOString();
    const message = error instanceof Error ? error.message : "Unknown manager error";
    emit(options.onEvent, "error", message);

    return {
      ok: false,
      language,
      output: "",
      startedAt,
      completedAt,
      delegatedResults,
      statusSnapshot: await getAgentsStatus(),
      error: message,
    };
  }
}