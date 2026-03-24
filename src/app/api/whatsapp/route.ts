import { NextRequest, NextResponse } from "next/server";
import { executeManagerInstruction } from "@/lib/agents/manager";

export const runtime = "nodejs";
export const maxDuration = 30;

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

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
  return value;
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function splitLongMessage(text: string, max = 1500) {
  if (text.length <= max) return [text];

  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > max) {
    parts.push(remaining.slice(0, max));
    remaining = remaining.slice(max);
  }

  if (remaining) parts.push(remaining);

  return parts;
}

async function sendWhatsAppMessage(to: string, text: string) {
  const token = requireEnv("WHATSAPP_TOKEN");
  const phoneId = requireEnv("WHATSAPP_PHONE_ID");

  const res = await fetch(
    `https://graph.facebook.com/v18.0/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    }
  );

  const raw = await res.text();

  console.log("[whatsapp] send status:", res.status);
  console.log("[whatsapp] send raw:", raw);

  if (!res.ok) {
    throw new Error(`WhatsApp send failed: ${res.status} ${raw}`);
  }
}

async function runManager(instruction: string) {
  const result = await Promise.race([
    executeManagerInstruction(instruction),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Manager timeout after 20s")), 20000)
    ),
  ]);

  return result as any;
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body: WhatsAppWebhookPayload = await req.json();

    console.log("[whatsapp] payload:", JSON.stringify(body));

    const message =
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      console.log("[whatsapp] no message block");
      return NextResponse.json({ ok: true });
    }

    const from = normalizePhone(message.from || "");
    const text = message?.text?.body || "";

    const owner = normalizePhone(requireEnv("OWNER_PHONE"));

    console.log("[whatsapp] owner:", owner);
    console.log("[whatsapp] from:", from);
    console.log("[whatsapp] text:", text);

    if (from !== owner) {
      await sendWhatsAppMessage(from, "غير مصرح");
      return NextResponse.json({ ok: true });
    }

    try {
      const managerResult = await runManager(text);

      console.log(
        "[whatsapp] manager result:",
        JSON.stringify(managerResult)
      );

      let reply = "";

      if (managerResult?.ok) {
        reply =
          managerResult.output ||
          "تمت المعالجة لكن لا يوجد رد نصي.";
      } else {
        reply =
          managerResult?.error ||
          "حدث خطأ أثناء تنفيذ الطلب.";
      }

      const chunks = splitLongMessage(reply);

      for (const chunk of chunks) {
        await sendWhatsAppMessage(from, chunk);
      }

      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("[whatsapp] manager failed:", error);

      const msg =
        error instanceof Error
          ? error.message
          : "Unknown manager error";

      await sendWhatsAppMessage(from, `Manager error: ${msg}`);

      return NextResponse.json({ ok: true });
    }
  } catch (err) {
    console.error("[whatsapp] route error:", err);
    return NextResponse.json({ ok: true });
  }
}