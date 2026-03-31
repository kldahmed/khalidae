// قوالب خطط Excel شائعة
import { ExcelWorkbookSpec } from "./types";

export const templates: Record<string, ExcelWorkbookSpec> = {
  "budget": {
    title: "ميزانية شهرية",
    locale: "ar",
    sheets: [
      {
        name: "الميزانية الشهرية",
        columns: [
          { header: "البند", key: "item" },
          { header: "الدخل", key: "income", type: "number" },
          { header: "المصروف", key: "expense", type: "number" },
          { header: "الرصيد", key: "balance", type: "number" }
        ],
        rows: [
          ["راتب", 0, 0, 0],
          ["إجمالي", "=SUM(B2:B100)", "=SUM(C2:C100)", "=B101-C101"]
        ],
        formulas: [
          { cell: "D2", formula: "=B2-C2" }
        ],
        // description removed; not part of ExcelSheetSpec
      }
    ],
    // summaryRows removed; not part of ExcelWorkbookSpec
  },
  "invoice": {
    title: "فاتورة مبيعات",
    locale: "ar",
    sheets: [
      {
        name: "فاتورة",
        columns: [
          { header: "الصنف", key: "item" },
          { header: "الكمية", key: "qty", type: "number" },
          { header: "السعر", key: "price", type: "number" },
          { header: "الإجمالي", key: "total", type: "number" }
        ],
        rows: [
          ["", "", "", "=B2*C2"]
        ],
        // description removed; not part of ExcelSheetSpec
      }
    ],
    // summaryRows removed; not part of ExcelWorkbookSpec
  },
  "payroll": {
    title: "رواتب موظفين",
    locale: "ar",
    sheets: [
      {
        name: "رواتب الموظفين",
        columns: [
          { header: "الموظف", key: "employee" },
          { header: "الراتب الأساسي", key: "base", type: "number" },
          { header: "البدلات", key: "allowances", type: "number" },
          { header: "الخصومات", key: "deductions", type: "number" },
          { header: "الصافي", key: "net", type: "number" }
        ],
        rows: [
          ["", 0, 0, 0, "=B2+C2-D2"]
        ],
        // description removed; not part of ExcelSheetSpec
      }
    ],
    // summaryRows removed; not part of ExcelWorkbookSpec
  },
  "inventory": {
    title: "إدارة مخزون",
    locale: "ar",
    sheets: [
      {
        name: "المخزون",
        columns: [
          { header: "الصنف", key: "item" },
          { header: "الكمية المتوفرة", key: "qty", type: "number" },
          { header: "سعر الوحدة", key: "unitPrice", type: "number" },
          { header: "القيمة الإجمالية", key: "total", type: "number" }
        ],
        rows: [
          ["", 0, 0, "=B2*C2"]
        ],
        // description removed; not part of ExcelSheetSpec
      }
    ],
    // summaryRows removed; not part of ExcelWorkbookSpec
  },
  "sales-report": {
    title: "تقرير مبيعات",
    locale: "ar",
    sheets: [
      {
        name: "تقرير المبيعات",
        columns: [
          { header: "التاريخ", key: "date" },
          { header: "المنتج", key: "product" },
          { header: "الكمية", key: "qty", type: "number" },
          { header: "السعر", key: "price", type: "number" },
          { header: "الإجمالي", key: "total", type: "number" }
        ],
        rows: [
          ["", "", 0, 0, "=C2*D2"]
        ]
      }
    ]
  },
  "dashboard": {
    title: "لوحة تحكم أساسية",
    locale: "ar",
    sheets: [
      {
        name: "Dashboard",
        columns: [
          { header: "المؤشر", key: "metric" },
          { header: "القيمة", key: "value", type: "number" }
        ],
        rows: [
          ["إجمالي المبيعات", "=SUM('تقرير المبيعات'!E2:E100)"],
          ["عدد الموظفين", "=COUNTA('رواتب الموظفين'!A2:A100)"]
        ]
      }
    ],
    // summaryRows removed; not part of ExcelWorkbookSpec
  },
  "advanced-formulas": {
    title: "معادلات متقدمة",
    locale: "ar",
    sheets: [
      {
        name: "معادلات متقدمة",
        columns: [
          { header: "الوصف", key: "desc" },
          { header: "المعادلة", key: "formula" }
        ],
        rows: [
          ["SUM", "=SUM(A2:A10)"],
          ["IF", "=IF(B2>100,\"كبير\",\"صغير\")"],
          ["VLOOKUP", "=VLOOKUP(D2,جدول!A2:B100,2,FALSE)"],
          ["XLOOKUP", "=XLOOKUP(E2,جدول!A2:A100,جدول!B2:B100)"],
          ["INDEX/MATCH", "=INDEX(B2:B100,MATCH(F2,A2:A100,0))"],
          ["COUNTIF", "=COUNTIF(A2:A100,\">0\")"],
          ["SUMIF", "=SUMIF(B2:B100,\">100\",C2:C100)"],
        ]
      }
    ],
    // summaryRows removed; not part of ExcelWorkbookSpec
  }
};
