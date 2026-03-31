import React from "react";

export default function ExcelErrorPanel({ error, traceId, locale }: { error: string; traceId?: string; locale: "ar" | "en" }) {
  if (!error) return null;
  return (
    <div className="excel-error-panel">
      <div className="excel-error-title">{locale === "ar" ? "خطأ" : "Error"}</div>
      <div className="excel-error-message">{error}</div>
      {traceId && (
        <div className="excel-error-trace">{locale === "ar" ? `معرّف التتبع: ${traceId}` : `Trace ID: ${traceId}`}</div>
      )}
    </div>
  );
}
