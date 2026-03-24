import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/* ----------------------------- helpers ----------------------------- */

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing env: ${name}`);
  }
  return v;
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

/* ------------------------- send whatsapp --------------------------- */

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
  console.log("[whatsapp] send to:", to);
  console.log("[whatsapp] phone id:", phoneId);

  if (!res.ok) {
    throw new Error(`WhatsApp send failed: ${res.status} ${raw}`);
  }
}

/* --------------------------- webhook GET --------------------------- */

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[whatsapp] webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

/* --------------------------- webhook POST -------------------------- */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("[whatsapp] incoming payload:", JSON.stringify(body));

    const value = body?.entry?.[0]?.changes?.[0]?.value;

    const message = value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const from = normalizePhone(message.from);
    const text = message?.text?.body || "";

    console.log("[whatsapp] from:", from);
    console.log("[whatsapp] text:", text);

    const owner = normalizePhone(requireEnv("OWNER_PHONE"));

    /* ----------- reject unknown numbers ----------- */

    if (from !== owner) {
      await sendWhatsAppMessage(from, "غير مصرح");
      return NextResponse.json({ ok: true });
    }

    /* ----------- simple test response ----------- */

    await sendWhatsAppMessage(from, `Received: ${text}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[whatsapp] route error:", err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}