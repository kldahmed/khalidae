import { NextRequest, NextResponse } from "next/server";
import { executeSiteTask } from "@/lib/site-manager/tasks";

export async function POST(request: NextRequest) {
  try {
    const { task, context } = await request.json();
    if (!task) return NextResponse.json({ error: "يرجى إدخال أمر صحيح" }, { status: 400 });
    const result = await executeSiteTask(task, context);
    return NextResponse.json({ result });
  } catch (e) {
    return NextResponse.json({ error: "تعذر تنفيذ الأمر", details: e?.message || "خطأ غير متوقع" }, { status: 500 });
  }
}
