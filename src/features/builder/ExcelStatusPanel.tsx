import React from "react";
import { t } from "./i18n";

export default function ExcelStatusPanel({ status, locale }: { status: "idle" | "loading" | "success" | "error"; locale: "ar" | "en" }) {
  const statusKey =
    status === "idle"
      ? "emptyState"
      : status === "loading"
      ? "loading"
      : status === "success"
      ? "successDesc"
      : status === "error"
      ? "errorServer"
      : "emptyState";
  return (
    <div className={`excel-status-panel excel-status-${status}`}>
      <span>{t(locale, statusKey)}</span>
    </div>
  );
}
