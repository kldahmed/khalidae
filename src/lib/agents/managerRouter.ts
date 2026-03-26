export type AgentName = "dev_agent" | "seo_agent" | "monitor_agent" | "content_agent";

type RouteResult = {
  agent: AgentName;
  reason: string;
};

const RE = {
  forbidMonitor: /\b(do\s*not|don't|never)\s+call\s+monitor_agent\b/i,
  githubOnly: /\buse\s+github\s+only\b/i,

  dev: /\b(github|read(?:ing)?\s+files?|source\s+files?|src\/|code|typescript|javascript|tsx?|fix|refactor|bug|test)\b/i,
  seo: /\b(seo|meta\s+tags?|sitemap|robots\.txt|search\s+console|serp|keyword|schema\.org|open\s+graph|website analysis|public website)\b/i,
  monitor: /\b(vercel|deployment|deploy|build\s+logs?|runtime\s+logs?|observability|uptime|incident|error\s+rate)\b/i,
  content: /\b(write|rewrite|edit|copy|landing\s+page|blog\s+post|headline|cta|site\s+content)\b/i,
};

function getConstraints(task: string) {
  const blocked = new Set<AgentName>();

  if (RE.forbidMonitor.test(task) || RE.githubOnly.test(task)) {
    blocked.add("monitor_agent");
  }

  return { blocked };
}

export function routeTaskToAgent(task: string): RouteResult {
  const text = task.trim();
  const { blocked } = getConstraints(text);

  if (RE.dev.test(text)) {
    return { agent: "dev_agent", reason: "Matched dev keywords (GitHub/files/code/source)." };
  }

  if (RE.seo.test(text)) {
    return { agent: "seo_agent", reason: "Matched SEO/website analysis keywords." };
  }

  if (!blocked.has("monitor_agent") && RE.monitor.test(text)) {
    return { agent: "monitor_agent", reason: "Matched deployment/build/runtime monitoring keywords." };
  }

  if (RE.content.test(text)) {
    return { agent: "content_agent", reason: "Matched writing/editing content keywords." };
  }

  return { agent: "dev_agent", reason: "No strong match; safe default is dev_agent." };
}
