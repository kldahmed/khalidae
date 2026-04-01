import ExcelJS from "exceljs";
import { ExcelWorkbookSpec } from "./types";

export async function generateExcel(plan: ExcelWorkbookSpec): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  for (const sheet of plan.sheets) {
    const ws = workbook.addWorksheet(sheet.name);

    if (sheet.columns?.length) {
      ws.columns = sheet.columns.map((column) => ({
        header: column,
        key: column,
        width: 20,
      }));
    }

    if (sheet.rows?.length) {
      for (const row of sheet.rows) {
        if (Array.isArray(row)) {
          ws.addRow(row);
        } else {
          ws.addRow(Object.values(row));
        }
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
// يحول خطة ExcelWorkbookSpec إلى ملف Excel (XLSX)
import ExcelJS from "exceljs";
import { ExcelWorkbookSpec } from "./types";

export async function generateExcel(plan: ExcelWorkbookSpec): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  for (const sheet of plan.sheets) {
    const ws = workbook.addWorksheet(sheet.name);

    if (sheet.columns) {
      ws.columns = sheet.columns.map(col => ({
        header: typeof col === 'string' ? col : col.header,
        key: typeof col === 'string' ? col : col.key || col.header
      }));
    }

    if (Array.isArray(sheet.rows)) {
      sheet.rows.forEach(row => ws.addRow(row));
    }

    // إضافة صيغ للخلايا إذا وجدت
    if (sheet.formulas) {
      for (const formula of sheet.formulas) {
        const cell = ws.getCell(formula.cell);
        cell.value = { formula: formula.formula };
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
