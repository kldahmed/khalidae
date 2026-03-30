import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const prompt = formData.get("prompt")?.toString() || "";
  const file = formData.get("file") as File | null;

  let workbook: XLSX.WorkBook;
  let explanation = "";

  if (file) {
    // تعديل ملف موجود
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    workbook = XLSX.read(data, { type: "array" });
    // مثال: إضافة ورقة جديدة بناءً على الوصف
    const sheetName = "Sheet جديد";
    const sheetData = [["تمت إضافة ورقة بناءً على وصفك:", prompt]];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheetData), sheetName);
    explanation = `تم تعديل الملف وإضافة ورقة جديدة بناءً على وصفك.`;
  } else {
    // إنشاء ملف جديد
    const sheetName = "Sheet1";
    let sheetData: any[][] = [];
    // مثال ذكي مبسط: تحليل الوصف
    if (/ميزانية|budget/i.test(prompt)) {
      sheetData = [["البند", "الدخل", "المصروف", "الرصيد"], ["راتب", 0, 0, 0]];
      explanation = "تم إنشاء نموذج ميزانية شهرية مع أعمدة الدخل والمصروف والرصيد.";
    } else if (/فاتورة|invoice/i.test(prompt)) {
      sheetData = [["الصنف", "الكمية", "السعر", "الإجمالي"], ["", "", "", "=B2*C2"]];
      explanation = "تم إنشاء نموذج فاتورة مع صيغ تلقائية لحساب الإجمالي.";
    } else {
      sheetData = [["بيانات"], [prompt]];
      explanation = "تم إنشاء ملف إكسل جديد بناءً على وصفك.";
    }
    workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheetData), sheetName);
  }

  // تصدير الملف النهائي
  const wbout = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  const buffer = Buffer.from(wbout);
  const headers = new Headers();
  headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  headers.set("Content-Disposition", "attachment; filename=excel-result.xlsx");
  headers.set("x-excel-explanation", encodeURIComponent(explanation));
  return new NextResponse(buffer, { status: 200, headers });
}
