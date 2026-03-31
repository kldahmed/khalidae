// Excel Intelligence Engine Types

export interface ExcelWorkbookSpec {
  title: string;
  locale: string;
  sheets: ExcelSheetSpec[];
}

export interface ExcelSheetSpec {
  name: string;
  columns: ExcelColumnSpec[];
  rows: (string | number | null)[][];
  formulas?: ExcelFormulaSpec[];
  styles?: ExcelSheetStyleSpec;
  widths?: number[];
  filters?: ExcelFilterSpec;
  charts?: ExcelChartSpec[];
  frozenRows?: number;
  summaryRows?: (string | number | null)[][];
}

export interface ExcelColumnSpec {
  header: string;
  key: string;
  type?: 'string' | 'number' | 'date' | 'currency' | 'boolean';
  style?: ExcelCellStyleSpec;
}

export interface ExcelFormulaSpec {
  cell: string;
  formula: string;
}

export interface ExcelSheetStyleSpec {
  headerStyle?: ExcelCellStyleSpec;
  cellStyle?: ExcelCellStyleSpec;
}

export interface ExcelCellStyleSpec {
  font?: object;
  alignment?: object;
  border?: object;
  fill?: object;
}

export interface ExcelFilterSpec {
  columns: string[];
}

export interface ExcelChartSpec {
  type: 'bar' | 'line' | 'pie' | 'area';
  dataRange: string;
  options?: object;
}
