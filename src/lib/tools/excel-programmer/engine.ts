// Excel Intelligence Engine: Orchestrator
import { ExcelWorkbookSpec } from './types';
import { planExcelWorkbook } from './planner';
import { validateWorkbookSpec } from './validator';
import { generateExcel } from './generator';

export async function excelIntelligenceEngine(prompt: string, locale: string = 'ar') {
  // 1. Parse user intent to spec
  const spec: ExcelWorkbookSpec = await planExcelWorkbook(prompt, locale);
  // 2. Validate spec
  const valid = validateWorkbookSpec(spec);
  if (!valid.ok) throw new Error('Invalid Excel Workbook Spec: ' + valid.error);
  // 3. Generate Excel file (Buffer)
  return await generateExcel(spec);
}
