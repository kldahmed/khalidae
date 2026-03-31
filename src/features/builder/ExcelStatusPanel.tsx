import React from "react";

export default function ExcelStatusPanel({ status, locale }: { status: "idle" | "loading" | "success" | "error"; locale: "ar" | "en" }) {
  const messages = {
    idle: { ar: "جاهز للبدء.", en: "Ready to start." },
    loading: { ar: "جاري التنفيذ...", en: "Processing..." },
    success: { ar: "تم إنشاء الملف بنجاح!", en: "File generated successfully!" },
    error: { ar: "حدث خطأ أثناء التنفيذ.", en: "An error occurred during processing." },
  };
  return (
    <div className={`excel-status-panel excel-status-${status}`}>
      <span>{messages[status][locale]}</span>
    </div>
  );
}
