import { type NextRequest, NextResponse } from "next/server";
import { validateManagerSecret } from "@/lib/agents/manager";
import { runAgentByName } from "@/lib/agents/runtime";

export const runtime = "nodejs";

type AgentRequestBody = {
  task?: string;
  context?: string;
  secret?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as AgentRequestBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!validateManagerSecret(body.secret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!body.task?.trim()) {
    return NextResponse.json({ error: "Task is required." }, { status: 400 });
  }

  const result = await runAgentByName("dev_agent", {
    task: body.task,
    context: body.context,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}