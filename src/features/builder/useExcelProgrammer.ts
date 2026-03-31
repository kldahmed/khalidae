"use client";

import { useState } from "react";

export type Step =
  | "idle"
  | "loading"
  | "success"
  | "recoverable_error";

export type ErrorState = {
  type: "network" | "server";
  message: string;
};

export function useExcelProgrammer(locale: "ar" | "en" = "ar") {
  const [step, setStep] = useState<Step>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<ErrorState | null>(null);

  async function run(prompt: string) {
    setStep("loading");
    setProgress(5);
    setError(null);

    const controller = new AbortController();

    try {
      setProgress(20);

      const res = await fetch("/api/tools/excel-programmer", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      setProgress(50);

      if (!res.ok) {
        throw new Error("Server error");
      }

      const blob = await res.blob();

      setProgress(75);

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
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setError({
        type: "network",
        message:
          locale === "ar"
            ? "انقطع الاتصال بالشبكة"
            : "Network connection lost"
      });

      setStep("recoverable_error");
    }
  }

  return {
    run,
    step,
    progress,
    error
  };
}