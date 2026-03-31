import React from "react";
import { t } from "./i18n";

export default function ExcelSuccessPanel({ downloadUrl, locale, fileMeta, onRestart, onCreateAnother }: {
  downloadUrl: string;
  locale: "ar" | "en";
  fileMeta?: { name: string; size: number } | null;
  onRestart?: () => void;
  onCreateAnother?: () => void;
}) {
  return (
    <div className="excel-success-panel">
      <div className="excel-success-title">{t(locale, "successTitle")}</div>
      <div className="excel-success-summary">{t(locale, "successDesc")}</div>
      {fileMeta && (
        <div className="excel-success-fileinfo">
          <span>{fileMeta.name}</span>
          <span style={{ color: "#64748b", fontSize: 13, marginInlineStart: 8 }}>
            {Math.round(fileMeta.size / 1024)} KB
          </span>
        </div>
      )}
      <a className="excel-success-download" href={downloadUrl} download>
        {t(locale, "download")}
      </a>
      <div className="excel-success-ctas">
        {onRestart && (
          <button className="excel-success-restart" onClick={onRestart}>{t(locale, "restart")}</button>
        )}
        {onCreateAnother && (
          <button className="excel-success-another" onClick={onCreateAnother}>{t(locale, "createAnother")}</button>
        )}
      </div>
    </div>
  );
}
