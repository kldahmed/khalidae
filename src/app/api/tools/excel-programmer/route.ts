import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { planExcelWorkbook } from "@/lib/tools/excel-programmer/planner";
import { generateExcel } from "@/lib/tools/excel-programmer/generator";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const prompt = formData.get("prompt")?.toString() || "";
  const file = formData.get("file") as File | null;

  let workbook: XLSX.WorkBook;
  let explanation = "";
  let plan;

  if (file) {
    // تعديل ملف موجود: لاحقًا دعم التخطيط الذكي
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    workbook = XLSX.read(data, { type: "array" });
    // الآن: أضف ورقة جديدة بخطة ذكية بناءً على الوصف
    plan = await planExcelWorkbook(prompt);
    const ws = XLSX.utils.aoa_to_sheet([
      [plan.title || "تمت إضافة ورقة بناءً على وصفك:"],
      [prompt],
    ]);
    XLSX.utils.book_append_sheet(workbook, ws, plan.sheets[0]?.name || "Sheet جديد");
    explanation = `تم تعديل الملف وإضافة ورقة جديدة بناءً على خطة ذكية.`;
  } else {
    // إنشاء ملف جديد بخطة ذكية
    plan = await planExcelWorkbook(prompt);
    workbook = generateExcel(plan);
    explanation = plan.title || "تم إنشاء ملف إكسل جديد بناءً على وصفك.";
  }

  // تصدير الملف النهائي
  const wbout = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  const buffer = Buffer.from(wbout);
  const headers = new Headers();
  headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  headers.set("Content-Disposition", "attachment; filename=excel-result.xlsx");
  headers.set("x-excel-explanation", encodeURIComponent(explanation));
  headers.set("x-excel-plan", encodeURIComponent(JSON.stringify(plan)));
  return new NextResponse(buffer, { status: 200, headers });
}
