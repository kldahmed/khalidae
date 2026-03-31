"use client";
import React from "react";
import { useExcelProgrammer } from "./useExcelProgrammer";
import ExcelProgrammerStepper from "./ExcelProgrammerStepper";
import ExcelPromptInput from "./ExcelPromptInput";
import ExcelTemplatePicker from "./ExcelTemplatePicker";
import ExcelFileUploader from "./ExcelFileUploader";
import ExcelStatusPanel from "./ExcelStatusPanel";
import ExcelErrorPanel from "./ExcelErrorPanel";
// @ts-ignore
import ExcelSuccessPanel from "./ExcelSuccessPanel";

// TODO: Replace with actual i18n context
const locale = typeof window !== "undefined" && document?.dir === "rtl" ? "ar" : "en";

export default function ExcelProgrammerShell() {
  const excel = useExcelProgrammer(locale === "ar" ? "ar" : "en");

  // Responsive/RTL/LTR layout classes
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div className={`excel-shell excel-shell-${locale}`} dir={dir}>
      {/* Hero Header */}
      <header className="excel-hero-header">
        <div className="excel-hero-title">
          <span className="excel-hero-icon" role="img" aria-label="Excel AI">🧠📊</span>
          <span>{/* i18n */}Excel AI Programmer</span>
        </div>
        <div className="excel-hero-desc">
          {/* i18n */}Create professional Excel files automatically using AI. Enter your description or pick a template.
        </div>
      </header>

      {/* Stepper */}
      <ExcelProgrammerStepper step={excel.step} progress={excel.progress} locale={locale} />

      {/* Main Workflow Cards */}
      <main className="excel-builder-main">
        {/* Templates Card */}
        <section className="excel-builder-card excel-builder-templates">
          <ExcelTemplatePicker setPrompt={excel.setPrompt} locale={locale} />
        </section>

        {/* Prompt/Input Card */}
        <section className="excel-builder-card excel-builder-input">
          <ExcelPromptInput
            prompt={excel.prompt}
            setPrompt={excel.setPrompt}
            error={excel.error}
            step={excel.step}
            locale={locale}
            onSubmit={() => excel.submit(excel.prompt)}
            loading={excel.step === "submitting" || excel.step === "processing"}
          />
        </section>

        {/* File Upload Card (Dropzone) */}
        <section className="excel-builder-card excel-builder-upload">
          <ExcelFileUploader
            onFile={excel.setFile}
            locale={locale}
          />
        </section>

        {/* Status/Result Card */}
        <section className="excel-builder-card excel-builder-status">
          <ExcelStatusPanel
            status={
              excel.step === "idle"
                ? "idle"
                : excel.step === "submitting" || excel.step === "processing"
                ? "loading"
                : excel.step === "success"
                ? "success"
                : excel.step === "recoverable_error"
                ? "error"
                : "idle"
            }
            locale={locale}
          />
          {excel.step === "recoverable_error" && (
            <>
              <ExcelErrorPanel error={excel.error?.message || ""} locale={locale} />
              <button className="excel-submit-btn" onClick={() => excel.submit(excel.prompt)} style={{ marginTop: 10 }}>{locale === "ar" ? "إعادة المحاولة" : "Retry"}</button>
            </>
          )}
          {excel.step === "success" && excel.resultUrl && (
            <ExcelSuccessPanel
              downloadUrl={excel.resultUrl}
              locale={locale}
              onRestart={excel.reset}
              onCreateAnother={excel.reset}
            />
          )}
        </section>
      </main>
    </div>
  );
}
