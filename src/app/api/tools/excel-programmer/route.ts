
import { NextRequest, NextResponse } from "next/server";
import { planExcelWorkbook } from "@/lib/tools/excel-programmer/planner";
import { sendTelegramAlert } from "@/lib/alerts/telegram";
import { generateExcel } from "@/lib/tools/excel-programmer/generator";
import { validateWorkbookSpec } from "@/lib/tools/excel-programmer/validator";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const traceId = crypto.randomUUID();
  const log = (event: string, extra: any = {}) => {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify({ traceId, event, ...extra }));
  };
  log("request_received");
  try {
    const formData = await req.formData();
    const prompt = formData.get("prompt")?.toString() || "";
    const file = formData.get("file") as File | null;
    let explanation = "";
    let plan;
    // Validate prompt
    if (!prompt.trim()) {
      log("validation_failed", { reason: "empty_prompt" });
      return NextResponse.json({
        error: {
          en: "Prompt is required.",
          ar: "الوصف مطلوب."
        }, traceId
      }, { status: 400 });
    }
    log("validation_passed");
    if (file) {
      // إذا كان هناك ملف مرفق، يمكن إضافة منطق خاص لاحقًا، لكن المسار النهائي يجب أن يكون Buffer فقط
      // حالياً: نخطط ونولد ملف جديد بناءً على الوصف فقط
      try {
        plan = await planExcelWorkbook(prompt, "ar", traceId);
      } catch (err: any) {
        await sendTelegramAlert({
          message: `❌ [${process.env.NODE_ENV}] Excel AI plan failed\nroute: excel-programmer\nprovider: orchestrator\nreason: ${err?.message}\ntraceId: ${traceId}\ntimestamp: ${new Date().toISOString()}`
        });
        log("plan_failed", { error: err?.message });
        return NextResponse.json({
          error: {
            en: err?.message || "Could not generate Excel plan using available AI engines. Please try again later.",
            ar: err?.message || "تعذر تنفيذ الطلب حالياً عبر جميع محركات الذكاء الاصطناعي المتاحة. يرجى إعادة المحاولة بعد قليل."
          }, traceId
        }, { status: 500 });
      }
      log("plan_generated", { plan });
      const validation = validateWorkbookSpec(plan);
      if (!validation.ok) {
        log("validation_failed", { reason: validation.error });
        return NextResponse.json({
          error: {
            en: validation.error || "Invalid workbook plan.",
            ar: validation.error === 'Missing title or sheets' ? 'العنوان أو الأوراق مفقودة.' : validation.error === 'Sheet missing name أو الأعمدة مفقودة.' : validation.error === 'Sheet rows must be array' ? 'صفوف الورقة يجب أن تكون مصفوفة.' : 'خطة الملف غير صالحة.'
          }, traceId
        }, { status: 400 });
      }
      log("validation_passed");
      explanation = `تم إنشاء ملف جديد بناءً على خطة ذكية.`;
    } else {
      try {
        plan = await planExcelWorkbook(prompt, "ar", traceId); // locale نصي فقط
      } catch (err: any) {
        await sendTelegramAlert({
          message: `❌ [${process.env.NODE_ENV}] Excel AI plan failed\nroute: excel-programmer\nprovider: orchestrator\nreason: ${err?.message}\ntraceId: ${traceId}\ntimestamp: ${new Date().toISOString()}`
        });
        log("plan_failed", { error: err?.message });
        return NextResponse.json({
          error: {
            en: err?.message || "Could not generate Excel plan using available AI engines. Please try again later.",
            ar: err?.message || "تعذر تنفيذ الطلب حالياً عبر جميع محركات الذكاء الاصطناعي المتاحة. يرجى إعادة المحاولة بعد قليل."
          }, traceId
        }, { status: 500 });
      }
      log("plan_generated", { plan });
      const validation = validateWorkbookSpec(plan);
      if (!validation.ok) {
        log("validation_failed", { reason: validation.error });
        return NextResponse.json({
          error: {
            en: validation.error || "Invalid workbook plan.",
            ar: validation.error === 'Missing title or sheets' ? 'العنوان أو الأوراق مفقودة.' : validation.error === 'Sheet missing name or columns' ? 'اسم الورقة أو الأعمدة مفقودة.' : validation.error === 'Sheet rows must be array' ? 'صفوف الورقة يجب أن تكون مصفوفة.' : 'خطة الملف غير صالحة.'
          }, traceId
        }, { status: 400 });
      }
      log("validation_passed");
      const fileBuffer = await generateExcel(plan);
      log("file_built");
      explanation = plan.title || "تم إنشاء ملف إكسل جديد بناءً على وصفك.";
    }
    // المسار النهائي: Buffer فقط
    const fileBuffer = await generateExcel(plan);
    log("file_built");
    const headers = new Headers();
    headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    headers.set("Content-Disposition", "attachment; filename=excel-result.xlsx");
    headers.set("x-excel-explanation", encodeURIComponent(explanation));
    headers.set("x-excel-plan", encodeURIComponent(JSON.stringify(plan)));
    headers.set("x-trace-id", traceId);
    log("response_sent");
    return new NextResponse(fileBuffer, { status: 200, headers });
  } catch (err: any) {
    log("response_failed", { error: err?.message || err });
    return NextResponse.json({
      error: {
        en: err?.message || "Server error.",
        ar: err?.message || "خطأ في الخادم."
      }, traceId
    }, { status: 500 });
  }
}
