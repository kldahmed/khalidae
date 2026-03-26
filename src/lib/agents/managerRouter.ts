export type AgentName = "dev_agent" | "seo_agent" | "monitor_agent" | "content_agent";

type RouteResult = {
  agent: AgentName;
  reason: string;
};

const RE = {
  forbidMonitor: /\b(do\s*not|don't|never)\s+call\s+monitor_agent\b/i,
  githubOnly: /\buse\s+github\s+only\b/i,

  // Negative constraints
  forbidDev: /\b(do\s*not\s*use\s*github(\s+tools)?|without\s+github|github\s+not\s+allowed)\b/i,
  forbidMonitorAgent: /\b(do\s*not\s*use\s*vercel|without\s+vercel|vercel\s+not\s+allowed)\b/i,

  dev: /\b(github|read(?:ing)?\s+files?|source\s+files?|src\/|code|typescript|javascript|tsx?|fix|refactor|bug|test)\b/i,
  seo: /\b(seo|meta\s+tags?|sitemap|robots\.txt|search\s+console|serp|keyword|schema\.org|open\s+graph|website analysis|public website|security\s+headers)\b/i,
  monitor: /\b(vercel|deployment|deploy|build\s+logs?|runtime\s+logs?|observability|uptime|incident|error\s+rate)\b/i,
  content: /\b(write|rewrite|edit|copy|landing\s+page|blog\s+post|headline|cta|site\s+content)\b/i,
};

function getConstraints(task: string) {
  const blocked = new Set<AgentName>();
  const text = task.toLowerCase();

  // Block monitor_agent if forbidden or github only
  if (RE.forbidMonitor.test(text) || RE.githubOnly.test(text) || RE.forbidMonitorAgent.test(text)) {
    blocked.add("monitor_agent");
  }
  // Block dev_agent if forbidden
  if (RE.forbidDev.test(text)) {
    blocked.add("dev_agent");
  }

  return { blocked };
}

export function routeTaskToAgent(task: string): RouteResult {
  const text = task.trim();
  const { blocked } = getConstraints(text);

  // 1. If dev_agent is not blocked and dev keywords match, select dev_agent
  if (!blocked.has("dev_agent") && RE.dev.test(text)) {
    return { agent: "dev_agent", reason: "Matched dev keywords (GitHub/files/code/source) and dev_agent not blocked." };
  }

  // 2. If monitor_agent is not blocked and monitor keywords match, select monitor_agent
  if (!blocked.has("monitor_agent") && RE.monitor.test(text)) {
    return { agent: "monitor_agent", reason: "Matched deployment/build/runtime monitoring keywords and monitor_agent not blocked." };
  }

  // 3. If seo keywords match, and both dev_agent and monitor_agent are blocked, select seo_agent
  if (RE.seo.test(text) && blocked.has("dev_agent") && blocked.has("monitor_agent")) {
    return { agent: "seo_agent", reason: "Matched SEO/public website keywords and both dev_agent and monitor_agent are blocked." };
  }

  // 4. If seo keywords match, and seo_agent is not blocked, select seo_agent
  if (!blocked.has("seo_agent") && RE.seo.test(text)) {
    return { agent: "seo_agent", reason: "Matched SEO/website analysis keywords and seo_agent not blocked." };
  }

  // 5. If content keywords match, select content_agent
  if (RE.content.test(text)) {
    return { agent: "content_agent", reason: "Matched writing/editing content keywords." };
  }

  // 6. Fallback: if dev_agent is not blocked, use dev_agent
  if (!blocked.has("dev_agent")) {
    return { agent: "dev_agent", reason: "No strong match; safe default is dev_agent (not blocked)." };
  }

  // 7. Fallback: if seo_agent is not blocked, use seo_agent
  if (!blocked.has("seo_agent")) {
    return { agent: "seo_agent", reason: "No strong match; dev_agent blocked; fallback to seo_agent." };
  }

  // 8. Fallback: if monitor_agent is not blocked, use monitor_agent
  if (!blocked.has("monitor_agent")) {
    return { agent: "monitor_agent", reason: "No strong match; dev_agent and seo_agent blocked; fallback to monitor_agent." };
  }

  // 9. Fallback: content_agent
  return { agent: "content_agent", reason: "All others blocked; fallback to content_agent." };
}
