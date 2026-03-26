import { type NextRequest, NextResponse } from "next/server";
import { validateManagerSecret } from "@/lib/agents/manager";

export const runtime = "nodejs";

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

function normalizeComparablePhone(value: string): string {
  const digits = normalizePhone(value);

  if (digits.startsWith("00")) {
    return digits.slice(2);
  }

  return digits.replace(/^0+/, "");
}

async function sendWhatsAppText(to: string, text: string) {
  const token = requireEnv("WHATSAPP_TOKEN");
  const phoneId = requireEnv("WHATSAPP_PHONE_ID");

  const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
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
  });

  const raw = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    raw,
  };
}

function getSecret(request: NextRequest): string | null {
  return (
    request.headers.get("x-manager-secret") ?? request.nextUrl.searchParams.get("secret")
  );
}

export async function GET(request: NextRequest) {
  if (!validateManagerSecret(getSecret(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const ownerPhone = process.env.OWNER_PHONE ?? "";
  const phoneId = process.env.WHATSAPP_PHONE_ID ?? "";
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN ?? "";
  const token = process.env.WHATSAPP_TOKEN ?? "";
  const anthropic = process.env.ANTHROPIC_API_KEY ?? "";

  return NextResponse.json({
    ok: true,
    env: {
      OWNER_PHONE: Boolean(ownerPhone),
      WHATSAPP_PHONE_ID: Boolean(phoneId),
      WHATSAPP_VERIFY_TOKEN: Boolean(verifyToken),
      WHATSAPP_TOKEN: Boolean(token),
      ANTHROPIC_API_KEY: Boolean(anthropic),
    },
    normalized: {
      ownerPhone: normalizeComparablePhone(ownerPhone),
    },
  });
}

const secret = getSecret(request) ?? undefined;

if (!validateManagerSecret(secret)) {
  return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
}  }

  const body = (await request.json().catch(() => null)) as
    | { to?: string; text?: string }
    | null;

  const target = normalizeComparablePhone(body?.to || requireEnv("OWNER_PHONE"));
  const text = body?.text?.trim() || "اختبار واتساب ناجح من khalidae.";

  const result = await sendWhatsAppText(target, text);

  return NextResponse.json({
    ok: result.ok,
    target,
    status: result.status,
    response: result.raw,
  }, { status: result.ok ? 200 : 500 });
}