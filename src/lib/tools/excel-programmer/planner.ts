/**
 * الواجهة الرسمية الموحدة لتخطيط ملفات Excel
 */
export async function planExcelWorkbook(prompt: string, locale: string = "ar"): Promise<ExcelWorkbookSpec> {
  return await parseIntent(prompt, locale);
}
import { ExcelWorkbookSpec } from "./types";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { AiRequest } from "@/lib/ai/types";

/**
 * Unified Excel planning using AI orchestrator (no direct provider/model)
 */
export async function parseIntent(prompt: string, locale: string = "ar", traceId?: string): Promise<ExcelWorkbookSpec> {
  const system = `
أنت مساعد خبير في بناء ملفات Excel احترافية. المطلوب منك فقط إنتاج JSON من نوع ExcelWorkbookSpec التالي:
{
  title: string,
  locale: string,
  sheets: [
    {
      name: string,
      columns: [{ header: string, key: string, type?: string }],
      rows: Array<Array<string|number|null>>,
      formulas?: Array<{ cell: string, formula: string }>,
      styles?: object,
      widths?: number[],
      filters?: { columns: string[] },
      charts?: Array<{ type: string, dataRange: string }>,
      frozenRows?: number,
      summaryRows?: Array<Array<string|number|null>>
    }
  ]
}
لا تشرح، فقط أرجع JSON صالح. يجب أن يكون locale = "ar".`;

  const aiReq: AiRequest = {
    prompt: `${system}\n${prompt}`,
    traceId,
  };
  const result = await aiOrchestrator(aiReq);
  if (result.response?.text) {
    try {
      return JSON.parse(result.response.text);
    } catch (e) {
      throw new Error("Malformed AI response: " + (e as any).message);
    }
  }
  throw new Error(result.error?.message || "AI planning failed");
}
