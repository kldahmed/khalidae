import { getToolsForAgent } from "./runtime";

function printTools(agent: string, task: string) {
  const tools = getToolsForAgent(agent as any, task);
  console.log(`${agent} (${task}):`);
  if (Array.isArray(tools)) {
    for (const t of tools) {
      console.log("-", t.definition?.name || t.name);
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
