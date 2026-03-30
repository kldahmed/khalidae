

import { getToolsForAgent } from "./runtime";
import type { AgentName } from "./types";

type ToolLike = {
  definition?: {
    name?: string;
    description?: string;
  };
};

function getToolName(tool: unknown): string {
  if (!tool || typeof tool !== "object") {
    return "unknown";
  }

  const maybeTool = tool as ToolLike;

  if (maybeTool.definition?.name && typeof maybeTool.definition.name === "string") {
    return maybeTool.definition.name;
  }

  return "unknown";
}

export function printTools(agent: AgentName, task: string): void {
  const tools = getToolsForAgent(agent, task);

  console.log(`${agent} (${task}):`);

  if (!Array.isArray(tools) || tools.length === 0) {
    console.log("(none)");
    return;
  }

  for (const tool of tools) {
    console.log("-", getToolName(tool));
  }
}
