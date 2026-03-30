

import { getToolsForAgent } from "./runtime";
import type { AgentName } from "./types";
type ToolDefinition = {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
};


function printTools(agent: AgentName, task: string) {
  const tools = getToolsForAgent(agent, task) as ToolDefinition[];
  console.log(`${agent} (${task}):`);
  if (Array.isArray(tools) && tools.length > 0) {
    for (const t of tools) {
      console.log("-", t.name);
    }
  } else {
    console.log("(none)");
  }
  console.log("");
}

printTools("content_agent", "");
printTools("seo_agent", "Audit homepage SEO");
printTools("seo_agent", "Fix meta in src/page.tsx");
printTools("dev_agent", "Fix bug in code");
printTools("monitor_agent", "Check deployments");
