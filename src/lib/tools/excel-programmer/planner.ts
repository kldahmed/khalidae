// يحلل وصف المستخدم ويخرجه كخطة ExcelWorkbookPlan
import { ExcelWorkbookPlan } from "./types";
import { templates } from "./templates";

export function planExcelWorkbook(prompt: string): ExcelWorkbookPlan {
  // منطق ذكي مبسط: لاحقًا يمكن ربط OpenAI
  const p = prompt.toLowerCase();
  if (p.includes("ميزانية") || p.includes("budget")) {
    return templates["budget"];
  }
  if (p.includes("فاتورة") || p.includes("invoice")) {
    return templates["invoice"];
  }
   if (p.includes("رواتب") || p.includes("payroll") || p.includes("salary")) {
    return templates["payroll"];
  }
  if (p.includes("مخزون") || p.includes("inventory")) {
    return templates["inventory"];
  }
  if (p.includes("مبيعات") || p.includes("sales")) {
    return templates["sales-report"];
  }
  if (p.includes("تقرير") || p.includes("report")) {
    return templates["sales-report"];
  }
  if (p.includes("لوحة") || p.includes("dashboard")) {
    return templates["dashboard"];
  }
  if (p.includes("معادلة") || p.includes("formula") || p.includes("sum") || p.includes("if") || p.includes("vlookup") || p.includes("xlookup") || p.includes("index") || p.includes("match") || p.includes("countif") || p.includes("sumif")) {
    return templates["advanced-formulas"];
  }
  // خطة افتراضية
  return {
    sheets: [
      {
        name: "Sheet1",
        columns: ["بيانات"],
        rows: [[prompt]],
        description: "جدول بيانات بسيط بناءً على وصف المستخدم."
      }
    ],
    summary: "خطة افتراضية بناءً على وصف المستخدم."
  };
}
