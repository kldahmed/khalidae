
import React from "react";
import type { ExcelProgrammerStep } from "./useExcelProgrammer";
import { t } from "./i18n";

const steps = [
  { key: "typing", labelKey: "stepTyping" },
  { key: "validating", labelKey: "stepValidating" },
  { key: "processing", labelKey: "stepProcessing" },
  { key: "success", labelKey: "stepSuccess" },
];

export default function ExcelProgrammerStepper({ step, progress, locale = "ar" }: { step: ExcelProgrammerStep; progress: number; locale?: "ar" | "en" }) {
  // Map step to index
  let activeIdx = 0;
  if (step === "typing" || step === "idle") activeIdx = 0;
  else if (step === "validating") activeIdx = 1;
  else if (step === "submitting" || step === "processing") activeIdx = 2;
  else if (step === "success") activeIdx = 3;

  return (
    <div className="excel-stepper">
      {steps.map((s, i) => (
        <div key={s.key} className={`excel-step ${i === activeIdx ? "active" : i < activeIdx ? "done" : ""}`}>
          <span className="excel-step-label">{t(locale, s.labelKey)}</span>
          {i < steps.length - 1 && <span className="excel-step-sep">›</span>}
        </div>
      ))}
      <div className="excel-stepper-progress" style={{ width: `${progress}%` }} />
    </div>
  );
}
