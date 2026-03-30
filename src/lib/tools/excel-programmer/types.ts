// أنواع البيانات لخطة Excel الذكية

export interface ExcelSheetPlan {
  name: string;
  columns: string[];
  rows: (string | number | null)[][];
  formulas?: Record<string, string>; // cellRef -> formula
  description?: string;
}

export interface ExcelWorkbookPlan {
  sheets: ExcelSheetPlan[];
  summary?: string;
  meta?: Record<string, any>;
}
