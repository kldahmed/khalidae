// قوالب خطط Excel شائعة
import { ExcelWorkbookPlan } from "./types";

export const templates: Record<string, ExcelWorkbookPlan> = {
  "budget": {
    sheets: [
      {
        name: "الميزانية الشهرية",
        columns: ["البند", "الدخل", "المصروف", "الرصيد"],
        rows: [
          ["راتب", 0, 0, 0],
          ["إجمالي", "=SUM(B2:B100)", "=SUM(C2:C100)", "=B101-C101"]
        ],
        formulas: {
          "D2": "=B2-C2"
        },
        description: "جدول ميزانية شهرية مع صيغ تلقائية."
      }
    ],
    summary: "خطة ميزانية شهرية."
  },
  "invoice": {
    sheets: [
      {
        name: "فاتورة",
        columns: ["الصنف", "الكمية", "السعر", "الإجمالي"],
        rows: [
          ["", "", "", "=B2*C2"]
        ],
        description: "نموذج فاتورة مع حساب تلقائي للإجمالي."
      }
    ],
    summary: "خطة فاتورة مبيعات."
  },
  "payroll": {
    sheets: [
      {
        name: "رواتب الموظفين",
        columns: ["الموظف", "الراتب الأساسي", "البدلات", "الخصومات", "الصافي"],
        rows: [
          ["", 0, 0, 0, "=B2+C2-D2"]
        ],
        description: "جدول رواتب مع حساب تلقائي للصافي."
      }
    ],
    summary: "خطة رواتب موظفين."
  },
  "inventory": {
    sheets: [
      {
        name: "المخزون",
        columns: ["الصنف", "الكمية المتوفرة", "سعر الوحدة", "القيمة الإجمالية"],
        rows: [
          ["", 0, 0, "=B2*C2"]
        ],
        description: "جدول مخزون مع حساب تلقائي للقيمة."
      }
    ],
    summary: "خطة إدارة مخزون."
  },
  "sales-report": {
    sheets: [
      {
        name: "تقرير المبيعات",
        columns: ["التاريخ", "المنتج", "الكمية", "السعر", "الإجمالي"],
        rows: [
          ["", "", 0, 0, "=C2*D2"]
        ],
        description: "تقرير مبيعات يومي مع حساب الإجمالي."
      }
    ],
    summary: "خطة تقرير مبيعات."
  },
  "dashboard": {
    sheets: [
      {
        name: "Dashboard",
        columns: ["المؤشر", "القيمة"],
        rows: [
          ["إجمالي المبيعات", "=SUM('تقرير المبيعات'!E2:E100)"],
          ["عدد الموظفين", "=COUNTA('رواتب الموظفين'!A2:A100)"]
        ],
        description: "لوحة مؤشرات أساسية."
      }
    ],
    summary: "خطة لوحة تحكم أساسية."
  },
  "advanced-formulas": {
    sheets: [
      {
        name: "معادلات متقدمة",
        columns: ["الوصف", "المعادلة"],
        rows: [
          ["SUM", "=SUM(A2:A10)"],
          ["IF", "=IF(B2>100,\"كبير\",\"صغير\")"],
          ["VLOOKUP", "=VLOOKUP(D2,جدول!A2:B100,2,FALSE)"],
          ["XLOOKUP", "=XLOOKUP(E2,جدول!A2:A100,جدول!B2:B100)"],
          ["INDEX/MATCH", "=INDEX(B2:B100,MATCH(F2,A2:A100,0))"],
          ["COUNTIF", "=COUNTIF(A2:A100,\">0\")"],
          ["SUMIF", "=SUMIF(B2:B100,\">100\",C2:C100)"]
        ],
        description: "أمثلة معادلات Excel متقدمة."
      }
    ],
    summary: "خطة معادلات متقدمة."
  }
};
