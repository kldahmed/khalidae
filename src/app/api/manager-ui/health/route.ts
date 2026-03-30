import { NextResponse } from "next/server";
import { getHealthReport } from "@/lib/site-manager/health";

export async function GET() {
  try {
    // استدعاء الدالة مباشرة بدون أي تحقق من secret
    const report = getHealthReport();
    return NextResponse.json(report);
  } catch (e) {
    return NextResponse.json({ ok: false, message: "تعذر جلب بيانات الصحة", error: e?.message || "خطأ غير متوقع" });
  }
}
