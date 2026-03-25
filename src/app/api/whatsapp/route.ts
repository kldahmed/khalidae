import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { executeManagerInstruction } from "@/lib/agents/manager";
import { chatWithManager } from "@/lib/agents/chat";

export const runtime = "nodejs";
export const maxDuration = 120;

type WhatsAppTextMessage = {
  id?: string;
  from?: string;
  type?: string;
  text?: {
    body?: string;
  };
};

type WhatsAppWebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WhatsAppTextMessage[];
        statuses?: unknown[];
      };
    }>;
  }>;
};

type ExtractedIncomingMessage = {
  from: string;
  messageId: string | null;
  text: string | null;
  type: string;
};

type ManagerResult = {
  ok: boolean;
  output?: string | null;
  error?: string | null;
  language?: string | null;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function splitLongMessage(text: string, maxLength = 1500): string[] {
  const normalized = text.trim();

  if (!normalized) return [];
  if (normalized.length <= maxLength) return [normalized];

  const chunks: string[] = [];
  let remaining = normalized;

  while (remaining.length > maxLength) {
    const candidate = remaining.slice(0, maxLength);
    const splitIndex = Math.max(
      candidate.lastIndexOf("\n\n"),
      candidate.lastIndexOf("\n"),
      candidate.lastIndexOf(" "),
    );
    const safeIndex = splitIndex > maxLength * 0.5 ? splitIndex : maxLength;

    chunks.push(remaining.slice(0, safeIndex).trim());
    remaining = remaining.slice(safeIndex).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

function extractIncomingMessages(
  payload: WhatsAppWebhookPayload,
): ExtractedIncomingMessage[] {
  const messages: ExtractedIncomingMessage[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;

      if (!value || !Array.isArray(value.messages) || value.messages.length === 0) {
        continue;
      }

      for (const message of value.messages) {
        const from = message.from?.trim();
        if (!from) continue;

        messages.push({
          from: normalizePhone(from),
          messageId: message.id?.trim() || null,
          text: message.text?.body?.trim() ?? null,
          type: message.type?.trim() || "unknown",
        });
      }
    }
  }

  return messages;
}

function isManagerResult(value: unknown): value is ManagerResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    typeof (value as { ok: unknown }).ok === "boolean"
  );
}

async function sendWhatsAppRequest(body: Record<string, unknown>): Promise<void> {
  const token = requireEnv("WHATSAPP_TOKEN");
  const phoneId = requireEnv("WHATSAPP_PHONE_ID");

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  const raw = await response.text();

  console.log("[whatsapp] send status:", response.status);
  console.log("[whatsapp] send raw:", raw);

  if (!response.ok) {
    throw new Error(`WhatsApp send failed: ${response.status} ${raw}`);
  }
}

async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  await sendWhatsAppRequest({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  });
}

async function markMessageAsRead(messageId: string | null): Promise<void> {
  if (!messageId) return;

  await sendWhatsAppRequest({
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
  });
}

async function runManagerWithTimeout(instruction: string): Promise<ManagerResult> {
  const result = await Promise.race<unknown>([
    executeManagerInstruction(instruction),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Manager timeout after 90s")), 90_000);
    }),
  ]);

  if (!isManagerResult(result)) {
    throw new Error("Manager returned unexpected response.");
  }

  return result;
}

function buildReply(result: ManagerResult): string {
  const language = result.language === "ar" ? "ar" : "en";

  if (result.ok) {
    const output = typeof result.output === "string" ? result.output.trim() : "";
    return (
      output ||
      (language === "ar"
        ? "تمت المعالجة بدون رد نصي."
        : "Processed successfully with no text response.")
    );
  }

  const error = typeof result.error === "string" ? result.error.trim() : "";
  return (
    error ||
    (language === "ar"
      ? "حدث خطأ أثناء المعالجة."
      : "An error occurred while processing the request.")
  );
}

async function processIncomingWebhook(
  payload: WhatsAppWebhookPayload,
): Promise<void> {
  const ownerPhone = normalizePhone(requireEnv("OWNER_PHONE"));
  const messages = extractIncomingMessages(payload);

  console.log("[whatsapp] incoming messages count:", messages.length);
  console.log("[whatsapp] owner phone:", ownerPhone);

  for (const message of messages) {
    console.log("[whatsapp] incoming from:", message.from);
    console.log("[whatsapp] incoming type:", message.type);
    console.log("[whatsapp] incoming text:", message.text);

    if (message.from !== ownerPhone) {
      console.log("[whatsapp] unauthorized sender");
      await sendWhatsAppMessage(message.from, "غير مصرح");
      continue;
    }

    await markMessageAsRead(message.messageId);

    if (message.type !== "text" || !message.text) {
      console.log("[whatsapp] unsupported message type");
      await sendWhatsAppMessage(message.from, "Please send a text message only.");
      continue;
    }

    try {
      const text = message.text.trim();

      const isExecutionCommand =
        text.startsWith("نفذ:") ||
        text.startsWith("شغّل:") ||
        text.startsWith("اصلح:") ||
        text.startsWith("/run") ||
        text.startsWith("execute:") ||
        text.startsWith("run:");

      let reply: string;

      if (isExecutionCommand) {
        console.log("[whatsapp] mode: manager execution");
        console.log("[whatsapp] sending to manager:", text);

        const managerResult = await runManagerWithTimeout(text);
        console.log("[whatsapp] manager result raw:", JSON.stringify(managerResult));

        reply = buildReply(managerResult);
      } else {
        console.log("[whatsapp] mode: conversational chat");
        reply = await chatWithManager(text);
        console.log("[whatsapp] chat reply generated");
      }

      const chunks = splitLongMessage(reply, 1500);

      if (chunks.length === 0) {
        await sendWhatsAppMessage(message.from, "تم استلام الرسالة لكن لا يوجد رد نصي.");
        continue;
      }

      for (const chunk of chunks) {
        await sendWhatsAppMessage(message.from, chunk);
      }

      console.log("[whatsapp] reply sent successfully");
    } catch (error) {
      console.error("[whatsapp] processing failed:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown processing error";

      try {
        await sendWhatsAppMessage(message.from, `Error: ${errorMessage}`);
      } catch (sendError) {
        console.error("[whatsapp] fallback send failed:", sendError);
      }
    }
  }
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const verifyToken = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge") ?? "";
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!expectedToken || mode !== "subscribe" || verifyToken !== expectedToken) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  return new NextResponse(challenge, { status: 200 });
}

export async function POST(request: NextRequest) {
  let payload: WhatsAppWebhookPayload;

  try {
    payload = (await request.json()) as WhatsAppWebhookPayload;
    console.log("[whatsapp] raw body:", JSON.stringify(payload));
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  after(async () => {
    try {
      await processIncomingWebhook(payload);
    } catch (error) {
      console.error("[whatsapp] route error:", error);
    }
  });

  return NextResponse.json({ ok: true });
}