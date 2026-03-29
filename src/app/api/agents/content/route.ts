import { NextResponse } from "next/server";
import { runAgentByName } from "@/lib/agents/runtime";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const task =
      typeof body?.task === "string" ? body.task.trim() : "";

    const context =
      typeof body?.context === "string" ? body.context.trim() : undefined;

    const language =
      body?.language === "ar" || body?.language === "en"
        ? body.language
        : undefined;

    if (!task) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing "task" in request body',
        },
        { status: 400 },
      );
    }

    const result = await runAgentByName("content_agent", {
      task,
      context,
      language,
    });

    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
