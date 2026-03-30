import { NextResponse } from "next/server";
import { getHealthReport } from "@/lib/site-manager/health";

export async function GET() {
  try {
    // استدعاء الدالة مباشرة بدون أي تحقق من secret
    const report = getHealthReport();
    return NextResponse.json(report);
  } catch (e) {
    const details = e instanceof Error ? e.message : "خطأ غير متوقع";
    return NextResponse.json({ ok: false, message: "تعذر جلب بيانات الصحة", details });
  }
}
