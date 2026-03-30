"use client";
import React, { useState } from "react";

const EXAMPLES = [
  "أنشئ ميزانية شهرية",
  "أنشئ ملف رواتب موظفين",
  "أنشئ تقرير مبيعات يومي",
  "أنشئ لوحة مخزون",
  "جدول معادلات Excel متقدمة"
];

export default function ExcelProgrammerTool() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [explanation, setExplanation] = useState("");
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResultUrl("");
    setExplanation("");
    setPlan(null);
    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      if (file) formData.append("file", file);
      const res = await fetch("/api/tools/excel-programmer", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("فشل الاتصال بالخادم");
      const blob = await res.blob();
      const explanationHeader = res.headers.get("x-excel-explanation") || "";
      setExplanation(decodeURIComponent(explanationHeader));
      const planHeader = res.headers.get("x-excel-plan");
      if (planHeader) {
        try {
          setPlan(JSON.parse(decodeURIComponent(planHeader)));
        } catch {}
      }
      setResultUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    }
    setLoading(false);
  }

  return (
    <div style={{ direction: "rtl", maxWidth: 600, margin: "40px auto", background: "#181f2a", borderRadius: 18, boxShadow: "0 8px 32px #0003", padding: 32 }}>
      <h2 style={{ color: "#7fd7ff", fontWeight: 700, fontSize: 28, marginBottom: 12 }}>مُبرمج الإكسل الذكي</h2>
      <p style={{ color: "#b2c7e6", marginBottom: 18 }}>اكتب وصفك أو حمل ملف إكسل لتوليد أو تعديل جداول احترافية وصيغ ذكية تلقائيًا.</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            style={{ background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 15, cursor: "pointer" }}
            onClick={() => setPrompt(ex)}
          >
            {ex}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <textarea
          style={{ borderRadius: 10, border: "1.5px solid #2e3a4d", background: "#10131a", color: "#eaf6ff", fontSize: 17, padding: 14, minHeight: 80 }}
          placeholder="مثال: أنشئ لي جدول ميزانية شهرية مع أعمدة الدخل والمصروف والرصيد..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          required={!file}
          dir="rtl"
        />
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={e => setFile(e.target.files?.[0] || null)}
          style={{ background: "#10131a", color: "#eaf6ff", borderRadius: 10, padding: 8 }}
        />
        <button type="submit" disabled={loading || (!prompt && !file)} style={{ background: "#38bdf8", color: "#10131a", fontWeight: 700, border: "none", borderRadius: 10, padding: 14, fontSize: 18, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "جارٍ التنفيذ..." : "إنشاء / تعديل ملف إكسل"}
        </button>
      </form>
      {error && <div style={{ color: "#f87171", marginTop: 16 }}>{error}</div>}
      {explanation && <div style={{ color: "#aef7ff", marginTop: 18, background: "#10131a", borderRadius: 10, padding: 14, fontSize: 15 }}>{explanation}</div>}
      {plan && (
        <div style={{ marginTop: 18, background: "#0e172a", borderRadius: 10, padding: 14, fontSize: 14, color: "#b2c7e6", direction: "rtl" }}>
          <b>ملخص الخطة الذكية:</b>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#10131a", color: "#eaf6ff", borderRadius: 8, padding: 10, marginTop: 8, fontSize: 13, direction: "ltr", textAlign: "left" }}>{JSON.stringify(plan, null, 2)}</pre>
        </div>
      )}
      {resultUrl && (
        <a href={resultUrl} download="excel-result.xlsx" style={{ display: "block", marginTop: 22, background: "#22d3ee", color: "#10131a", fontWeight: 700, borderRadius: 10, padding: 14, textAlign: "center", textDecoration: "none" }}>
          تحميل ملف الإكسل النهائي
        </a>
      )}
    </div>
  );
}
