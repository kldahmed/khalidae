import { type NextRequest, NextResponse } from "next/server";
import { executeManagerInstruction } from "@/lib/agents/manager";

export const runtime = "nodejs";

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
  if (!normalized) {
    return [];
  }

  if (normalized.length <= maxLength) {
    return [normalized];
  }

  const chunks: string[] = [];
  let remaining = normalized;

  while (remaining.length > maxLength) {
    const candidate = remaining.slice(0, maxLength);
    const splitIndex = Math.max(candidate.lastIndexOf("\n\n"), candidate.lastIndexOf("\n"), candidate.lastIndexOf(" "));
    const safeIndex = splitIndex > maxLength * 0.5 ? splitIndex : maxLength;
    chunks.push(remaining.slice(0, safeIndex).trim());
    remaining = remaining.slice(safeIndex).trim();
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks;
}

function extractIncomingMessages(payload: WhatsAppWebhookPayload): ExtractedIncomingMessage[] {
  const messages: ExtractedIncomingMessage[] = [];

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value || !Array.isArray(value.messages) || value.messages.length === 0) {
        continue;
      }

      for (const message of value.messages) {
        const from = message.from?.trim();
        const text = message.text?.body?.trim() ?? null;

        if (!from) {
          continue;
        }

        messages.push({
          from: normalizePhone(from),
          messageId: message.id?.trim() || null,
          text,
          type: message.type?.trim() || "unknown",
        });
      }
    }
  }

  return messages;
}

async function sendWhatsAppRequest(body: Record<string, unknown>): Promise<void> {
  const token = requireEnv("WHATSAPP_TOKEN");
  const phoneId = requireEnv("WHATSAPP_PHONE_ID");

  const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`WhatsApp API request failed: ${response.status} ${details}`);
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

async function sendTypingIndicator(to: string, messageId: string | null): Promise<void> {
  if (!messageId) {
    return;
  }

  await sendWhatsAppRequest({
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
    to,
    typing_indicator: {
      type: "text",
    },
  });
}

async function processIncomingWebhook(payload: WhatsAppWebhookPayload): Promise<void> {
  const ownerPhone = normalizePhone(requireEnv("OWNER_PHONE"));
  const messages = extractIncomingMessages(payload);

  for (const message of messages) {
    if (message.from !== ownerPhone) {
      await sendWhatsAppMessage(message.from, "غير مصرح");
      continue;
    }

    await sendTypingIndicator(message.from, message.messageId);

    if (message.type !== "text" || !message.text) {
      await sendWhatsAppMessage(message.from, "Please send a text message only.");
      continue;
    }

    const managerResult = await executeManagerInstruction(message.text);
    const reply = managerResult.ok
      ? managerResult.output || (managerResult.language === "ar" ? "تمت المعالجة بدون رد نصي." : "Processed successfully with no text response.")
      : managerResult.error || (managerResult.language === "ar" ? "حدث خطأ أثناء المعالجة." : "An error occurred while processing the request.");

    const chunks = splitLongMessage(reply, 1500);
    for (const chunk of chunks) {
      await sendWhatsAppMessage(message.from, chunk);
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
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  queueMicrotask(() => {
    void processIncomingWebhook(payload).catch((error: unknown) => {
      console.error("WhatsApp webhook processing failed:", error);
    });
  });

  return NextResponse.json({ ok: true });
}