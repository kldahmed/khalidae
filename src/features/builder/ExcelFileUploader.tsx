import React, { useRef } from "react";

export default function ExcelFileUploader({ onFile, locale }: { onFile: (file: File) => void; locale: "ar" | "en" }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const label = locale === "ar" ? "رفع ملف Excel" : "Upload Excel File";
  const help = locale === "ar" ? "اختر ملف .xlsx أو .xls لمعاينته أو تعديله." : "Select a .xlsx or .xls file to preview or edit.";

  return (
    <div className="excel-file-uploader">
      <label className="excel-file-label" htmlFor="excel-upload-input">{label}</label>
      <input
        ref={inputRef}
        id="excel-upload-input"
        type="file"
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      <button
        type="button"
        className="excel-upload-btn"
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </button>
      <div className="excel-file-help">{help}</div>
    </div>
  );
}
