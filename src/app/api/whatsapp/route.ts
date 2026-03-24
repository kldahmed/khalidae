import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

async function sendWhatsAppMessage(to: string, text: string) {
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
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
      cache: "no-store",
    }
  );

  const raw = await response.text();

  console.log("[whatsapp] send status:", response.status);
  console.log("[whatsapp] send raw:", raw);
  console.log("[whatsapp] send to:", to);
  console.log("[whatsapp] phone id:", phoneId);

  if (!response.ok) {
    throw new Error(`WhatsApp send failed: ${response.status} ${raw}`);
  }
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
    const body = await req.json();
    console.log("[whatsapp] incoming payload:", JSON.stringify(body));

    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      console.log("[whatsapp] no incoming message block");
      return NextResponse.json({ ok: true });
    }

    const from = normalizePhone(message.from ?? "");
    const text = message?.text?.body ?? "";
    const owner = normalizePhone(requireEnv("OWNER_PHONE"));

    console.log("[whatsapp] owner:", owner);
    console.log("[whatsapp] from:", from);
    console.log("[whatsapp] text:", text);

    if (!from) {
      console.log("[whatsapp] empty sender");
      return NextResponse.json({ ok: true });
    }

    if (from !== owner) {
      console.log("[whatsapp] unauthorized sender");
      await sendWhatsAppMessage(from, "غير مصرح");
      return NextResponse.json({ ok: true });
    }

    await sendWhatsAppMessage(from, `Received: ${text || "empty"}`);
    console.log("[whatsapp] reply sent successfully");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[whatsapp] route error:", error);
    return NextResponse.json({ ok: true });
  }
}