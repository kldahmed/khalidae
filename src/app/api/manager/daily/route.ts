import { NextRequest, NextResponse } from "next/server";
import { executeManagerInstruction } from "@/lib/agents/manager";
import { type ManagerResult } from "@/lib/agents/types";

export const runtime = "nodejs";
export const maxDuration = 60;

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

async function sendWhatsAppRequest(body: Record<string, unknown>) {
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

  console.log("[daily-manager] whatsapp status:", response.status);
  console.log("[daily-manager] whatsapp raw:", raw);

  if (!response.ok) {
    throw new Error(`WhatsApp send failed: ${response.status} ${raw}`);
  }
}

async function sendWhatsAppText(to: string, text: string) {
  await sendWhatsAppRequest({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  });
}

async function sendWhatsAppTemplate(to: string, bodyText: string) {
  const templateName = process.env.DAILY_REPORT_TEMPLATE_NAME;
  const templateLang = process.env.DAILY_REPORT_TEMPLATE_LANG || "ar";

  if (!templateName) {
    await sendWhatsAppText(to, bodyText);
    return;
  }

  await sendWhatsAppRequest({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: templateLang,
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: bodyText.slice(0, 1024),
            },
          ],
        },
      ],
    },
  });
}

function buildDailyInstruction(): string {
  return [
    "تصرف كمدير تنفيذي يومي لموقع khalidae.com.",
    "افحص حالة النظام الحالية، وحالة النشر، وصحة الموقع، وأي مشاكل تشغيلية أو تقنية ظاهرة.",
    "إذا وجدت خللًا ففوّض monitor_agent ثم dev_agent أو الوكيل المناسب لإصلاحه.",
    "إذا لم يوجد خلل، فاختر تحسينًا واحدًا عالي الأثر اليوم ونفّذه عبر الوكيل المناسب.",
    "أرسل تقريرًا نهائيًا واضحًا جدًا بالعربية يشمل:",
    "1) ما الذي فحصته",
    "2) ما الذي وجدته",
    "3) ما الذي أصلحته أو حسّنته",
    "4) ما الذي بقي",
    "5) ما هي الخطوة التالية المقترحة",
  ].join("\n");
}

function buildFinalReport(result: ManagerResult) {
  if (result.ok) {
    return result.output?.trim() || "تم تنفيذ المراجعة اليومية، لكن لم يتم إرجاع تقرير نصي.";
  }

  return result.error?.trim() || "فشلت المهمة اليومية ولم يتم إرجاع سبب واضح.";
}

function isAuthorizedCron(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ownerPhone = normalizePhone(requireEnv("OWNER_PHONE"));
  const instruction = buildDailyInstruction();

  try {
    console.log("[daily-manager] starting daily run");

    const result = await executeManagerInstruction(instruction);
    const report = buildFinalReport(result);
    const chunks = splitLongMessage(report, 1500);

    if (chunks.length === 0) {
      await sendWhatsAppTemplate(ownerPhone, "تم تنفيذ الروتين اليومي بدون تقرير نصي.");
    } else {
      await sendWhatsAppTemplate(ownerPhone, chunks[0]);

      for (let index = 1; index < chunks.length; index += 1) {
        await sendWhatsAppText(ownerPhone, chunks[index]);
      }
    }

    return NextResponse.json({
      ok: true,
      sentChunks: chunks.length,
      summary: report.slice(0, 300),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown daily manager error";

    console.error("[daily-manager] failed:", error);

    try {
      await sendWhatsAppTemplate(
        ownerPhone,
        `فشل الروتين اليومي لمدير الموقع. السبب: ${message}`,
      );
    } catch (sendError) {
      console.error("[daily-manager] failed to send whatsapp error:", sendError);
    }

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}