"use client";

import { useState } from "react";

export type Step =
  | "idle"
  | "submitting"
  | "processing"
  | "success"
  | "recoverable_error";

export type ErrorState = {
  type: "network" | "server";
  message: string;
};

type SubmitResult = {
  ok: boolean;
};

export function useExcelProgrammer(locale: "ar" | "en" = "ar") {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<ErrorState | null>(null);


  const [resultUrl, setResultUrl] = useState<string | null>(null);

  async function submit(nextPrompt?: string): Promise<SubmitResult> {
    const finalPrompt = (nextPrompt ?? prompt).trim();

    console.log("excel_submit_clicked", { prompt: finalPrompt });

    if (!finalPrompt && !file) {
      setError({
        type: "server",
        message:
          locale === "ar"
            ? "يرجى إدخال وصف أو رفع ملف"
            : "Please enter a prompt or upload a file"
      });
      setStep("recoverable_error");
      return { ok: false };
    }

    setError(null);
    setStep("submitting");
    setProgress(10);
    setResultUrl(null);

    try {
      const form = new FormData();
      if (finalPrompt) form.append("prompt", finalPrompt);
      if (file) form.append("file", file);
      form.append("locale", locale);

      console.log("excel_submit_started");
      const res = await fetch("/api/tools/excel-programmer", {
        method: "POST",
        body: form
      });

      setStep("processing");
      setProgress(50);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.log("excel_submit_error", text);
        throw new Error(text || "Server error");
      }

      const blob = await res.blob();
      setProgress(80);
      const url = URL.createObjectURL(blob);
      setResultUrl(url);

      // تنزيل تلقائي (اختياري)
      // const a = document.createElement("a");
      // a.href = url;
      // a.download = "excel.xlsx";
      // document.body.appendChild(a);
      // a.click();
      // a.remove();

      setProgress(100);
      setStep("success");
      console.log("excel_submit_success");
      return { ok: true };
    } catch (err) {
      setError({
        type: "network",
        message:
          locale === "ar"
            ? "فشل الاتصال أو إنشاء الملف"
            : "Network error or generation failed"
      });
      setStep("recoverable_error");
      console.log("excel_submit_error", err);
      return { ok: false };
    }
  }

  async function run(nextPrompt?: string) {
    await submit(nextPrompt);
  }

  function reset() {
    setStep("idle");
    setProgress(0);
    setError(null);
    setFile(null);
  }

  return {
    prompt,
    setPrompt,
    file,
    setFile,
    submit,
    run,
    reset,
    step,
    progress,
    error,
    resultUrl
  };
}