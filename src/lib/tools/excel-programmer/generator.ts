// يحول خطة ExcelWorkbookSpec إلى ملف Excel (XLSX)
import * as XLSX from "xlsx";
import { ExcelWorkbookSpec } from "./types";

function buildWorkbook(plan: ExcelWorkbookSpec): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  for (const sheet of plan.sheets) {
    const aoa = [sheet.columns, ...sheet.rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    // إضافة صيغ للخلايا إذا وجدت
    if (sheet.formulas) {
      for (const cell in sheet.formulas) {
        ws[cell] = ws[cell] || {};
        ws[cell].f = sheet.formulas[cell];
      }
    }
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  }
  return wb;
}

export async function generateExcel(plan: ExcelWorkbookSpec): Promise<Buffer> {
  const wb = buildWorkbook(plan);
  // serialize to Uint8Array then Buffer
  const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return Buffer.from(wbout);
}
