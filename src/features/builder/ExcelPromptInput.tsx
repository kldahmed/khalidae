import React from "react";
import type { ExcelProgrammerStep, ExcelProgrammerError } from "./useExcelProgrammer";
import { t } from "./i18n";

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
  const isEmpty = !prompt.trim();
  const isInvalid = error?.type === "validation";
  return (
    <div className="excel-prompt-input">
      <label className="excel-label" htmlFor="excel-prompt">
        {t(locale, "promptLabel")}
      </label>
      {loading ? (
        <div className="excel-skeleton" style={{ height: 70, borderRadius: 10, background: "#e0f2fe", animation: "pulse 1.2s infinite alternate" }} />
      ) : (
        <textarea
          id="excel-prompt"
          className="excel-textarea"
          placeholder={t(locale, "promptPlaceholder")}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          minLength={minLen}
          disabled={loading || step === "processing"}
          dir={locale === "ar" ? "rtl" : "ltr"}
          aria-invalid={!!error}
          aria-describedby="excel-prompt-error"
          style={isInvalid ? { border: "1.5px solid #ef4444" } : {}}
        />
      )}
      <div className="excel-prompt-helper">
        {locale === "ar" ? `الحد الأدنى ${minLen} أحرف` : `Minimum ${minLen} characters`}
      </div>
      {isInvalid && (
        <div className="excel-error" id="excel-prompt-error">{error.message}</div>
      )}
      {isEmpty && !loading && (
        <div className="excel-empty-state">{t(locale, "emptyState")}</div>
      )}
      <button
        className="excel-submit-btn"
        type="button"
        onClick={onSubmit}
        disabled={loading || step === "processing" || isEmpty}
        tabIndex={0}
        aria-label={t(locale, "submit")}
      >
        {loading ? t(locale, "loading") : t(locale, "submit")}
      </button>
    </div>
  );
}
