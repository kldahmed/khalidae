// Excel AI service: supports tables, formulas, dashboards, charts
import { Readable } from "stream";

export interface ExcelRequest {
  type: "table" | "formula" | "dashboard" | "chart";
  payload: any;
  traceId: string;
}

export async function handleExcelAI(req: ExcelRequest): Promise<Readable> {
  // TODO: implement logic for each type
  // Return a Readable stream of the generated Excel file
  throw new Error("Not implemented");
}
