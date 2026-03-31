/**
 * الواجهة الرسمية الموحدة لتخطيط ملفات Excel
 */
export async function planExcelWorkbook(prompt: string, locale: string = "ar"): Promise<ExcelWorkbookSpec> {
  return await parseIntent(prompt, locale);
}
import { ExcelWorkbookSpec } from "./types";
let OpenAI: any;
try {
  OpenAI = require("openai").OpenAI;
} catch {
  // مكتبة openai غير مثبتة
}

/**
 * يحلل الطلب النصي وينتج ExcelWorkbookSpec باستخدام OpenAI
 */
export async function parseIntent(prompt: string, locale: string = "ar"): Promise<ExcelWorkbookSpec> {
  if (!OpenAI) throw new Error("مكتبة openai غير مثبتة. يرجى تثبيتها: npm install openai");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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

  const completion = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
    response_format: { type: "json_object" }
  });
  const json = completion.choices[0]?.message?.content;
  if (!json) throw new Error("فشل تحليل الطلب بواسطة الذكاء الاصطناعي");
  return JSON.parse(json);
}
