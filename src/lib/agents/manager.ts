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

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

const MANAGER_SYSTEM_PROMPT = `
You are the executive AI manager for khalidae.com.

Your responsibilities:
- Understand the owner's instruction
- Break the request into sub-tasks
- ALWAYS use the delegate_to_agent tool to execute each sub-task — never fabricate results
- Monitor execution and retry failed tasks when needed
- Produce a final clear report summarizing what was done

Available agents (use via delegate_to_agent tool):
- content_agent: writing and updating site content
- seo_agent: metadata, titles, descriptions, og tags
- dev_agent: bug fixes, features, code changes
- monitor_agent: site health, deployments, logs

Rules:
- ALWAYS call delegate_to_agent tool for every task — never guess or invent results
- If a task requires multiple agents, call the tool multiple times
- Always report failures honestly
- Use the same language as the owner
`;

type ManagerExecutionOptions = {
  onEvent?: (event: ManagerEvent) => void;
};

type AnthropicResponse = {
  content: Array<
    | {
        type: "text";
        text: string;
      }
    | {
        type: "tool_use";
        id: string;
        name: string;
        input: Record<string, unknown>;
      }
  >;
  stop_reason: string | null;
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
    throw new ExternalApiError("Missing ANTHROPIC_API_KEY");
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
    throw new ExternalApiError(`Anthropic request failed: ${response.status}`, response.status, raw);
  }

  return JSON.parse(raw);
}

async function callAgent(
  agentName: AgentName,
  task: string,
  language: OwnerLanguage,
  delegatedResults: AgentResult[],
  options: ManagerExecutionOptions,
  context?: string,
): Promise<AgentResult> {
  emit(options.onEvent, "agent_start", `Delegating to ${agentName}`, {
    agent: agentName,
    task,
  });

  const result = await runAgentByName(agentName, {
    task,
    context,
    language,
  });

  delegatedResults.push(result);

  emit(options.onEvent, "agent_result", `${agentName} finished`, result);

  return result;
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

  emit(options.onEvent, "manager_start", "Instruction received", {
    instruction,
  });

  try {
    await appendLastTask({
      instruction,
      language,
      at: startedAt,
    });
  } catch (error) {
    console.error("Memory append failed", error);
  }

  try {
    const delegateToolDef = {
      name: "delegate_to_agent",
      description:
        "Delegate a task to a specialized agent. Call this for each sub-task that needs execution.",
      input_schema: {
        type: "object",
        properties: {
          agent: {
            type: "string",
            enum: ["content_agent", "seo_agent", "dev_agent", "monitor_agent"],
            description: "The agent to delegate the task to.",
          },
          task: {
            type: "string",
            description: "Clear description of the task for the agent.",
          },
          context: {
            type: "string",
            description: "Optional additional context the agent should know.",
          },
        },
        required: ["agent", "task"],
      },
    };

    const messages: Array<{ role: "user" | "assistant"; content: unknown }> = [
      {
        role: "user",
        content: [{ type: "text", text: instruction }],
      },
    ];

    // Agentic loop: keep calling until stop_end or no more tool calls
    while (true) {
      const response = await anthropicRequest({
        model: DEFAULT_MODEL,
        max_tokens: 1800,
        system: MANAGER_SYSTEM_PROMPT,
        tools: [delegateToolDef],
        messages,
      });

      // Append assistant turn
      messages.push({ role: "assistant", content: response.content });

      if (response.stop_reason !== "tool_use") {
        // Extract final text
        const textBlocks = response.content.filter(
          (b): b is { type: "text"; text: string } => b.type === "text",
        );
        const output = textBlocks.map((b) => b.text).join("\n");
        const completedAt = new Date().toISOString();
        const statusSnapshot = await getAgentStatuses();
        const result: ManagerResult = {
          ok: true,
          language,
          output,
          startedAt,
          completedAt,
          delegatedResults,
          statusSnapshot,
        };
        emit(options.onEvent, "manager_complete", "Manager completed", result);
        return result;
      }

      // Handle tool calls
      const toolUseBlocks = response.content.filter(
        (b): b is { type: "tool_use"; id: string; name: string; input: Record<string, unknown> } =>
          b.type === "tool_use",
      );

      const toolResults: Array<{ type: "tool_result"; tool_use_id: string; content: string }> = [];

      for (const toolUse of toolUseBlocks) {
        if (toolUse.name === "delegate_to_agent") {
          const agentName = toolUse.input.agent as AgentName;
          const task = toolUse.input.task as string;
          const context = toolUse.input.context as string | undefined;

          let resultContent: string;
          try {
            const agentResult = await callAgent(
              agentName,
              task,
              language,
              delegatedResults,
              options,
              context,
            );
            resultContent = agentResult.ok
              ? agentResult.output
              : `Agent failed: ${agentResult.error ?? "unknown error"}`;
          } catch (agentError) {
            resultContent = `Agent error: ${agentError instanceof Error ? agentError.message : "unknown"}`;
          }

          toolResults.push({
            type: "tool_result",
            tool_use_id: toolUse.id,
            content: resultContent,
          });
        }
      }

      messages.push({ role: "user", content: toolResults });
    }
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
      statusSnapshot: await getAgentStatuses(),
      error: message,
    };
  }
}