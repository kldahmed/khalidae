import { routeTaskToAgent } from "./managerRouter";

describe("routeTaskToAgent", () => {
  it("routes GitHub-only task to dev_agent", () => {
    const { agent } = routeTaskToAgent("Read src/app/page.tsx using GitHub only. Do not use monitor_agent. Do not use public website tools. Do not use Vercel.");
    expect(agent).toBe("dev_agent");
  });

  it("routes public website only + no GitHub + no Vercel to seo_agent", () => {
    const { agent } = routeTaskToAgent("Analyze khalidae.com as a public website only. Do not use GitHub tools. Do not use Vercel.");
    expect(agent).toBe("seo_agent");
  });

  it("routes Vercel build logs task to monitor_agent", () => {
    const { agent } = routeTaskToAgent("Show me the latest Vercel build logs.");
    expect(agent).toBe("monitor_agent");
  });

  it("routes content writing task to content_agent", () => {
    const { agent } = routeTaskToAgent("Write a new landing page for the site.");
    expect(agent).toBe("content_agent");
  });
});
