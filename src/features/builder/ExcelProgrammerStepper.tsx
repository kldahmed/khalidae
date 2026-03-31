import React from "react";
import type { ExcelProgrammerStep } from "./useExcelProgrammer";

const steps = [
  { key: "typing", label: { ar: "فهم الطلب", en: "Describe" } },
  { key: "validating", label: { ar: "التحقق", en: "Validate" } },
  { key: "processing", label: { ar: "بناء الملف", en: "Build" } },
  { key: "success", label: { ar: "جاهز للتحميل", en: "Download" } },
];

export default function ExcelProgrammerStepper({ step, progress }: { step: ExcelProgrammerStep; progress: number }) {
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
          <span className="excel-step-label">{s.label.ar}</span>
          {i < steps.length - 1 && <span className="excel-step-sep">›</span>}
        </div>
      ))}
      <div className="excel-stepper-progress" style={{ width: `${progress}%` }} />
    </div>
  );
}
