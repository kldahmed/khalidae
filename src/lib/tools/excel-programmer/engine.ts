// Excel Intelligence Engine: Orchestrator
import { ExcelWorkbookSpec } from './types';
import { planExcelWorkbook } from './planner';
import { validateWorkbookSpec } from './validator';

export async function runExcelProgrammer(prompt: string, locale: string, traceId?: string): Promise<Buffer> {
  const _traceId = traceId || Math.random().toString(36).slice(2);
  let spec: ExcelWorkbookSpec;
  try {
    spec = await planExcelWorkbook(prompt, locale, _traceId);
  } catch (err: any) {
    // UX: رسائل ذكية حسب الخطأ
    if (err?.message?.includes('rate_limit')) {
      throw new Error(locale === 'ar' ? 'الخدمة تحت ضغط مرتفع، جارٍ التحويل لمحرك بديل' : 'Service under high load, switching to backup engine');
    }
    throw new Error(locale === 'ar' ? 'تعذر إنشاء الملف حالياً، حاول وصفاً أبسط أو اختر نموذجاً سريعاً.' : 'Could not generate the file now, try a simpler description or pick a quick template.');
  }
  // 2. Validate spec
  const valid = validateWorkbookSpec(spec);
  if (!valid.ok) throw new Error(locale === 'ar' ? 'خطة الملف غير صالحة: ' + valid.error : 'Invalid Excel Workbook Spec: ' + valid.error);
  // 3. Generate Excel file (Buffer)
  return await generateExcel(spec);
}
