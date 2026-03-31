import React from "react";

export default function ExcelSuccessPanel({ downloadUrl, locale }: { downloadUrl: string; locale: "ar" | "en" }) {
  return (
    <div className="excel-success-panel">
      <div className="excel-success-title">{locale === "ar" ? "تم بنجاح" : "Success"}</div>
      <a className="excel-success-download" href={downloadUrl} download>
        {locale === "ar" ? "تحميل الملف" : "Download File"}
      </a>
    </div>
  );
}
