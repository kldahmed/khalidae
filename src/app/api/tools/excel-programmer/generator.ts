import ExcelJS from "exceljs";
import { ExcelWorkbookSpec } from "./types";

export async function generateExcel(
  plan: ExcelWorkbookSpec
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  for (const sheet of plan.sheets) {
    const worksheet = workbook.addWorksheet(sheet.name);

    if (sheet.columns?.length) {
      worksheet.columns = sheet.columns.map((column) => ({
        header: column,
        key: column,
        width: 20,
      }));
    }

    if (sheet.rows?.length) {
      for (const row of sheet.rows) {
        if (Array.isArray(row)) {
          worksheet.addRow(row);
        } else {
          worksheet.addRow(Object.values(row));
        }
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}