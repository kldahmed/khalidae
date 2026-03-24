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

  const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
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

  const raw = await res.text();
  console.log("[whatsapp] send status:", res.status);
  console.log("[whatsapp] send response:", raw);

  if (!res.ok) {
    throw new Error(`WhatsApp send failed: ${res.status} ${raw}`);
  }
}

async function processMessage(from: string, text: string) {
  const owner = normalizePhone(requireEnv("OWNER_PHONE"));

  console.log("[whatsapp] owner:", owner);
  console.log("[whatsapp] from:", from);
  console.log("[whatsapp] text:", text);

  if (from !== owner) {
    console.log("[whatsapp] unauthorized sender");
    await sendWhatsAppMessage(from, "غير مصرح");
    return;
  }

  // اختبار حاسم: رد مباشر بدون Manager
  await sendWhatsAppMessage(from, `تم الاستلام: ${text}`);

  // بعد نجاح الرد المباشر، فعّل هذا لاحقًا:
  // const result = await executeManagerInstruction(text);
  // console.log("[whatsapp] manager result:", JSON.stringify(result));
  //
  // const reply =
  //   result?.output ||
  //   result?.error ||
  //   "تم التنفيذ.";
  //
  // await sendWhatsAppMessage(from, reply);
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
  try {
    const body = await req.json();
    console.log("[whatsapp] raw body:", JSON.stringify(body));

    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      console.log("[whatsapp] no message in payload");
      return NextResponse.json({ ok: true });
    }

    const from = normalizePhone(message.from);
    const text = message.text?.body || "";

    await processMessage(from, text);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[whatsapp] route error:", e);
    return NextResponse.json({ ok: true });
  }
}