"use client";

import { useState } from "react";

type Step =
  | "idle"
  | "loading"
  | "success"
  | "recoverable_error";

type ErrorState = {
  type: "network" | "server";
  message: string;
};

export function useExcelProgrammer(locale: "ar" | "en" = "ar") {
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<ErrorState | null>(null);

  async function run(prompt: string) {
    setStep("loading");
    setError(null);

    const controller = new AbortController();

    try {
      const res = await fetch("/api/tools/excel-programmer", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = "excel.xlsx";

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

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
    error
  };
}