import { NextRequest, NextResponse } from "next/server";
import { executeManagerInstruction } from "@/lib/agents/manager";

export const runtime = "nodejs";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function normalizePhone(v: string) {
  return v.replace(/\D/g, "");
}

async function sendWhatsAppMessage(to: string, text: string) {
  const token = requireEnv("WHATSAPP_TOKEN");
  const phoneId = requireEnv("WHATSAPP_PHONE_ID");

  await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
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
  });
}

async function processMessage(from: string, text: string) {
  const owner = normalizePhone(requireEnv("OWNER_PHONE"));

  if (from !== owner) {
    await sendWhatsAppMessage(from, "غير مصرح");
    return;
  }

  const result = await executeManagerInstruction(text);

  const reply =
    result?.output ||
    result?.error ||
    "تم التنفيذ.";

  await sendWhatsAppMessage(from, reply);
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new NextResponse(challenge || "");
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const message =
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const from = normalizePhone(message.from);
    const text = message.text?.body || "";

    await processMessage(from, text);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("whatsapp error", e);
    return NextResponse.json({ ok: true });
  }
}