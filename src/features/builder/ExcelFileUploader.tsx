import React, { useRef, useState } from "react";
import { t } from "./i18n";
import { isDuplicateFile } from "./utils";

export default function ExcelFileUploader({ onFile, locale }: { onFile: (file: File) => void; locale: "ar" | "en" }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const label = t(locale, "uploadLabel");
  const help = t(locale, "uploadHelp");

  function handleFile(file: File) {
    if (isDuplicateFile(file, lastFile)) {
      setError(t(locale, "uploadDuplicate"));
      return;
    }
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError(t(locale, "uploadInvalidType"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t(locale, "uploadTooLarge"));
      return;
    }
    setError("");
    setLastFile(file);
    onFile(file);
  }

  return (
    <div
      className={`excel-file-uploader${dragActive ? " excel-dropzone-active" : ""}`}
      onDragOver={e => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
      onDrop={e => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      style={{ border: dragActive ? "2px dashed #0ea5e9" : undefined, background: dragActive ? "#e0f2fe" : undefined, transition: "background 0.15s, border 0.15s" }}
    >
      <label className="excel-file-label" htmlFor="excel-upload-input">{label}</label>
      <input
        ref={inputRef}
        id="excel-upload-input"
        type="file"
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        className="excel-upload-btn"
        onClick={() => inputRef.current?.click()}
        tabIndex={0}
        aria-label={label}
      >
        {dragActive ? t(locale, "uploadDrop") : label}
      </button>
      <div className="excel-file-help">{help}</div>
      {error && <div className="excel-error">{error}</div>}
    </div>
  );
}
