import { NextRequest, NextResponse } from "next/server";
import { analyzeSite } from "@/lib/site-manager/analyze";

export async function POST(request: NextRequest) {
  try {
    const { prompt, context } = await request.json();
    if (!prompt) return NextResponse.json({ error: "يرجى إدخال طلب تحليل صحيح" }, { status: 400 });
    const result = await analyzeSite(prompt, context);
    return NextResponse.json({ result });
  } catch (e) {
    const details = e instanceof Error ? e.message : "خطأ غير متوقع";
    return NextResponse.json(
      { error: "تعذر تنفيذ التحليل", details },
      { status: 500 }
    );
  }
}
