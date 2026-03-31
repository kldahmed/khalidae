import React from "react";
import { t } from "./i18n";

const TEMPLATES = [
  { key: "budget", ar: "ميزانية شهرية", en: "Monthly Budget", prompt: { ar: "أنشئ ميزانية شهرية مع أعمدة الدخل والمصروف والرصيد.", en: "Create a monthly budget with income, expense, and balance columns." } },
  { key: "payroll", ar: "رواتب موظفين", en: "Payroll", prompt: { ar: "أنشئ جدول رواتب موظفين مع البدلات والخصومات والصافي.", en: "Create a payroll table with allowances, deductions, and net salary." } },
  { key: "sales", ar: "تقرير مبيعات", en: "Sales Report", prompt: { ar: "أنشئ تقرير مبيعات يومي مع اسم المنتج والكمية والسعر والإجمالي.", en: "Create a daily sales report with product name, quantity, price, and total." } },
  { key: "inventory", ar: "لوحة مخزون", en: "Inventory Dashboard", prompt: { ar: "أنشئ لوحة مخزون مع اسم الصنف والكمية وسعر الوحدة والقيمة الإجمالية.", en: "Create an inventory dashboard with item name, quantity, unit price, and total value." } },
  { key: "formulas", ar: "جدول معادلات متقدمة", en: "Advanced Formulas", prompt: { ar: "أنشئ جدول معادلات Excel متقدمة مع أمثلة على SUM و IF و VLOOKUP.", en: "Create an advanced Excel formulas table with examples for SUM, IF, and VLOOKUP." } },
];

export default function ExcelTemplatePicker({ setPrompt, locale }: { setPrompt: (v: string) => void; locale: "ar" | "en" }) {
  return (
    <div className="excel-template-picker">
      <div className="excel-template-title">{t(locale, "templateTitle")}</div>
      <div className="excel-template-list">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.key}
            className="excel-template-card"
            type="button"
            onClick={() => setPrompt(tpl.prompt[locale])}
          >
            <span className="excel-template-label">{tpl[locale]}</span>
            <span className="excel-template-desc">{tpl.prompt[locale]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
