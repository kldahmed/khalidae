import { NextRequest, NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/integrations/telegram/telegram-api";
import type { TelegramUpdate } from "@/lib/integrations/telegram/types";
import { planExcelWorkbook } from "@/lib/tools/excel-programmer/planner";
import { generateExcel } from "@/lib/tools/excel-programmer/generator";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const update: TelegramUpdate = await req.json();
  const message = update.message;
  if (!message || !message.text) return NextResponse.json({ ok: true });

  // إذا كانت الرسالة تخص الإكسل
  if (/اكسل|excel|جدول|ميزانية|فاتورة|رواتب|مخزون|تقرير|dashboard|معادلة/i.test(message.text)) {
    // استخدم planner
    const plan = await planExcelWorkbook(message.text);
    // أنشئ ملف Excel
    const workbook = generateExcel(plan);
    const wbout = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
    // أرسل ملخص الخطة
    await sendTelegramMessage(message.chat.id, `تم إنشاء خطة Excel: ${plan.title || "تمت المعالجة."}`);
    // ملاحظة: إرسال الملف يتطلب استخدام sendDocument عبر Telegram API (يحتاج endpoint منفصل أو خدمة خارجية)
    // هنا نرسل فقط ملخص الخطة
    return NextResponse.json({ ok: true });
  }

  // إذا لم تكن تخص الإكسل
  await sendTelegramMessage(message.chat.id, "مرحبًا! أرسل وصفًا لملف إكسل تود إنشاءه أو تعديله.");
  return NextResponse.json({ ok: true });
}
