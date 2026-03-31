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

  return (
    <div className={`excel-shell excel-shell-${locale}`} dir={locale === "ar" ? "rtl" : "ltr"}>
      <ExcelProgrammerStepper step={excel.step} progress={excel.progress} />
      <div className="excel-builder-main">
        <div className="excel-builder-left">
          <ExcelTemplatePicker setPrompt={excel.setPrompt} locale={locale} />
        </div>
        <div className="excel-builder-center">
          <ExcelPromptInput
            prompt={excel.prompt}
            setPrompt={excel.setPrompt}
            error={excel.error}
            step={excel.step}
            locale={locale}
            onSubmit={excel.submit}
            loading={excel.step === "submitting" || excel.step === "processing"}
          />
          <ExcelFileUploader
            onFile={excel.setFile}
            locale={locale}
          />
        </div>
        <div className="excel-builder-right">
          <ExcelStatusPanel
            status={
              excel.step === "idle" || excel.step === "typing" || excel.step === "validating" || excel.step === "ready"
                ? "idle"
                : excel.step === "submitting" || excel.step === "processing"
                ? "loading"
                : excel.step === "success"
                ? "success"
                : excel.step === "recoverable_error" || excel.step === "fatal_error"
                ? "error"
                : "idle"
            }
            locale={locale}
          />
          {excel.step === "recoverable_error" && (
            <ExcelErrorPanel error={excel.error?.message || ""} traceId={excel.error?.traceId} locale={locale} />
          )}
          {excel.step === "success" && excel.resultUrl && (
            <ExcelSuccessPanel downloadUrl={excel.resultUrl} locale={locale} />
          )}
        </div>
      </div>
    </div>
  );
}
