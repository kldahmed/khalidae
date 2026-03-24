import { type NextRequest, NextResponse } from "next/server";
import { readFullMemory, isKvMemoryEnabled } from "@/lib/agents/memory";
import { getAgentsStatus, validateManagerSecret } from "@/lib/agents/manager";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const secret =
    request.headers.get("x-manager-secret") ?? request.nextUrl.searchParams.get("secret");

  if (!validateManagerSecret(secret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const [agents, memory] = await Promise.all([getAgentsStatus(), readFullMemory()]);

  return NextResponse.json({
    ok: true,
    agents,
    memoryBackend: isKvMemoryEnabled() ? "vercel-kv" : "local-json",
    lastTasks: memory.last_tasks,
    siteState: memory.site_state,
  });
}