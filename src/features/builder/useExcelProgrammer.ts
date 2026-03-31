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
  const [step, setStep] = useState<Step>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<ErrorState | null>(null);

  async function submit(nextPrompt?: string): Promise<SubmitResult> {
    const finalPrompt = (nextPrompt ?? prompt).trim();

    if (!finalPrompt) {
      setError({
        type: "server",
        message:
          locale === "ar"
            ? "يرجى إدخال وصف الملف أولاً"
            : "Please enter a prompt first",
      });
      setStep("recoverable_error");
      return { ok: false };
    }

    setPrompt(finalPrompt);
    setError(null);
    setProgress(5);
    setStep("submitting");

    const controller = new AbortController();

    try {
      setProgress(20);

      const res = await fetch("/api/tools/excel-programmer", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      setStep("processing");
      setProgress(55);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Server error");
      }

      const blob = await res.blob();

      setProgress(80);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "excel.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setProgress(100);
      setStep("success");

      return { ok: true };
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return { ok: false };
      }

      setError({
        type: "network",
        message:
          locale === "ar"
            ? "انقطع الاتصال بالشبكة أو فشل إنشاء الملف"
            : "Network connection lost or file generation failed",
      });

      setStep("recoverable_error");
      return { ok: false };
    }
  }

  async function run(nextPrompt?: string): Promise<void> {
    await submit(nextPrompt);
  }

  function reset() {
    setStep("idle");
    setProgress(0);
    setError(null);
  }

  return {
    prompt,
    setPrompt,
    submit,
    run,
    reset,
    step,
    progress,
    error,
  };
}