import React from "react";
import type { ExcelProgrammerStep, ExcelProgrammerError } from "./useExcelProgrammer";

export default function ExcelPromptInput({
  prompt,
  setPrompt,
  error,
  step,
  locale,
  onSubmit,
  loading,
}: {
  prompt: string;
  setPrompt: (v: string) => void;
  error: ExcelProgrammerError | null;
  step: ExcelProgrammerStep;
  locale: "ar" | "en";
  onSubmit: () => void;
  loading: boolean;
}) {
  const minLen = 8;
  const isAr = locale === "ar";
  return (
    <div className="excel-prompt-input">
      <label className="excel-label" htmlFor="excel-prompt">
        {isAr ? "وصف الملف المطلوب" : "Describe your spreadsheet"}
      </label>
      <textarea
        id="excel-prompt"
        className="excel-textarea"
        placeholder={isAr ? "مثال: أنشئ لي جدول ميزانية شهرية مع أعمدة الدخل والمصروف والرصيد..." : "e.g. Create a monthly budget table with income, expense, and balance columns..."}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        minLength={minLen}
        disabled={loading || step === "processing"}
        dir={isAr ? "rtl" : "ltr"}
        aria-invalid={!!error}
        aria-describedby="excel-prompt-error"
      />
      <div className="excel-prompt-helper">
        {isAr ? `الحد الأدنى ${minLen} أحرف` : `Minimum ${minLen} characters`}
      </div>
      {error?.type === "validation" && (
        <div className="excel-error" id="excel-prompt-error">{error.message}</div>
      )}
      <button
        className="excel-submit-btn"
        type="button"
        onClick={onSubmit}
        disabled={loading || step === "processing"}
      >
        {loading ? (isAr ? "جارٍ التنفيذ..." : "Processing...") : isAr ? "إنشاء الملف" : "Generate File"}
      </button>
    </div>
  );
}
