// Request classifier for Excel AI cost-saving mode
import { ExcelWorkbookSpec } from './types';

export type ExcelRequestClass =
  | 'template_supported'
  | 'rule_based'
  | 'ai_light'
  | 'ai_complex';

const templateKeywords = [
  { key: 'budget', ar: 'ميزانية' },
  { key: 'payroll', ar: 'رواتب' },
  { key: 'invoice', ar: 'فواتير' },
  { key: 'sales', ar: 'مبيعات' },
  { key: 'inventory', ar: 'مخزون' },
  { key: 'leave', ar: 'إجازات' },
  { key: 'expenses', ar: 'مصروفات' },
];

export function classifyExcelRequest(prompt: string): ExcelRequestClass {
  const p = prompt.toLowerCase();
  // Template match
  for (const t of templateKeywords) {
    if (p.includes(t.key) || p.includes(t.ar)) return 'template_supported';
  }
  // Rule-based: columns, known file, standard formula
  if (/جدول|table|sheet|columns|أعمدة|ملف|file|csv|xlsx/.test(p)) return 'rule_based';
  // AI light: short, simple, 1 sheet, no formulas
  if (p.length < 80 && !/معقد|complex|متعدد|advanced|تحليل/.test(p)) return 'ai_light';
  // Otherwise
  return 'ai_complex';
}
