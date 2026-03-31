import React from "react";
import { t } from "./i18n";

export default function ExcelErrorPanel({ error, traceId, locale }: { error: string; traceId?: string; locale: "ar" | "en" }) {
  if (!error) return null;
  return (
    <div className="excel-error-panel">
      <div className="excel-error-title">{t(locale, "errorTitle")}</div>
      <div className="excel-error-message">{error}</div>
      {traceId && (
        <div className="excel-error-trace">{t(locale, "traceId")}{traceId}</div>
      )}
    </div>
  );
}
