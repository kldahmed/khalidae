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

  async function submit(nextPrompt?: string): Promise<SubmitResult> {
    const finalPrompt = (nextPrompt ?? prompt).trim();

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

    try {
      const form = new FormData();

      if (finalPrompt) form.append("prompt", finalPrompt);
      if (file) form.append("file", file);

      const res = await fetch("/api/tools/excel-programmer", {
        method: "POST",
        body: form
      });

      setStep("processing");
      setProgress(50);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Server error");
      }

      const blob = await res.blob();

      setProgress(80);

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "excel.xlsx";

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);

      setProgress(100);
      setStep("success");

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
    error
  };
}