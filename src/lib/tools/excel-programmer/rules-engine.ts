// Rules engine for Excel workbook spec (cost-saving mode)
import { ExcelWorkbookSpec } from './types';

const rules: Array<{ pattern: RegExp; build: (prompt: string) => ExcelWorkbookSpec }> = [
  {
    pattern: /جدول موظف|جدول موظفين|employee table|staff table/i,
    build: (prompt) => ({
      title: 'جدول موظفين',
      locale: 'ar',
      sheets: [
        {
          name: 'الموظفون',
          columns: [
            { header: 'الاسم', key: 'name' },
            { header: 'الوظيفة', key: 'role' },
            { header: 'الراتب', key: 'salary', type: 'number' }
          ],
          rows: [['', '', 0]]
        }
      ]
    })
  },
  {
    pattern: /ميزانية|budget/i,
    build: (prompt) => ({
      title: 'ميزانية',
      locale: 'ar',
      sheets: [
        {
          name: 'الميزانية',
          columns: [
            { header: 'البند', key: 'item' },
            { header: 'القيمة', key: 'value', type: 'number' }
          ],
          rows: [['', 0]]
        }
      ]
    })
  },
  {
    pattern: /مبيعات يومية|daily sales/i,
    build: (prompt) => ({
      title: 'مبيعات يومية',
      locale: 'ar',
      sheets: [
        {
          name: 'المبيعات',
          columns: [
            { header: 'التاريخ', key: 'date' },
            { header: 'الصنف', key: 'item' },
            { header: 'الكمية', key: 'qty', type: 'number' },
            { header: 'السعر', key: 'price', type: 'number' }
          ],
          rows: [['', '', 0, 0]]
        }
      ]
    })
  },
  {
    pattern: /مخزون|inventory/i,
    build: (prompt) => ({
      title: 'مخزون',
      locale: 'ar',
      sheets: [
        {
          name: 'المخزون',
          columns: [
            { header: 'الصنف', key: 'item' },
            { header: 'الكمية', key: 'qty', type: 'number' }
          ],
          rows: [['', 0]]
        }
      ]
    })
  },
  {
    pattern: /إجازات|leaves|إجازة/i,
    build: (prompt) => ({
      title: 'إجازات موظفين',
      locale: 'ar',
      sheets: [
        {
          name: 'الإجازات',
          columns: [
            { header: 'الموظف', key: 'employee' },
            { header: 'تاريخ الإجازة', key: 'date' },
            { header: 'المدة', key: 'duration', type: 'number' }
          ],
          rows: [['', '', 0]]
        }
      ]
    })
  }
];

export function tryRulesEngine(prompt: string): ExcelWorkbookSpec | null {
  for (const rule of rules) {
    if (rule.pattern.test(prompt)) return rule.build(prompt);
  }
  return null;
}
