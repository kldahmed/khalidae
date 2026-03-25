import { type NextRequest } from "next/server";
import {
  executeManagerInstruction,
  validateManagerSecret,
} from "@/lib/agents/manager";
import { getSessionUser } from "@/lib/admin-session";

export const runtime = "nodejs";

type ManagerRequestBody = {
  instruction?: string;
  secret?: string;
};

export async function POST(request: NextRequest) {
  let body: ManagerRequestBody;

  try {
    body = (await request.json()) as ManagerRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Accept either session cookie or secret in body
  const sessionUser = await getSessionUser();
  if (!sessionUser && !validateManagerSecret(body.secret)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const instruction = body.instruction?.trim();
  if (!instruction) {
    return Response.json({ error: "Instruction is required." }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      void executeManagerInstruction(instruction, {
        onEvent(event) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        },
      })
        .then((result) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "result", payload: result })}\n\n`),
          );
          controller.close();
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : "Unknown manager error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message, timestamp: new Date().toISOString() })}\n\n`,
            ),
          );
          controller.close();
        });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}