"use client";
import { useState, useRef } from "react";

export type ExcelProgrammerStep =
  | "idle"
  | "typing"
  | "validating"
  | "ready"
  | "submitting"
  | "processing"
  | "success"
  | "recoverable_error"
  | "fatal_error";

export interface ExcelProgrammerError {
  type: "validation" | "network" | "server" | "timeout" | "malformed" | "unsupported_file";
  message: string;
  traceId?: string;
}

export function useExcelProgrammer(locale: "ar" | "en") {
  const [step, setStep] = useState<ExcelProgrammerStep>("idle");
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<ExcelProgrammerError | null>(null);
  const [plan, setPlan] = useState<unknown>(null);
  const [resultUrl, setResultUrl] = useState<string>("");
  const [explanation, setExplanation] = useState("");
  const [progress, setProgress] = useState(0);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number; accepted: boolean; reason?: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function validateInput() {
    if (!prompt.trim()) {
      setError({ type: "validation", message: locale === "ar" ? "الوصف مطلوب" : "Prompt is required" });
      return false;
    }
    if (prompt.length < 8) {
      setError({ type: "validation", message: locale === "ar" ? "الوصف قصير جداً" : "Prompt is too short" });
      return false;
    }
    if (file) {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        setError({ type: "unsupported_file", message: locale === "ar" ? "صيغة الملف غير مدعومة" : "Unsupported file type" });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError({ type: "unsupported_file", message: locale === "ar" ? "حجم الملف كبير جداً" : "File is too large" });
        return false;
      }
    }
    setError(null);
    return true;
  }

  async function submit() {
    if (!validateInput()) return;
    setStep("submitting");
    setError(null);
    setProgress(0);
    setResultUrl("");
    setExplanation("");
    setPlan(null);
    abortRef.current = new AbortController();
    try {
      setStep("processing");
      setProgress(20);
      const formData = new FormData();
      formData.append("prompt", prompt);
      if (file) formData.append("file", file);
      const res = await fetch("/api/tools/excel-programmer", {
        method: "POST",
        body: formData,
        signal: abortRef.current.signal,
      });
      setProgress(60);
      if (!res.ok) {
        let traceId = res.headers.get("x-trace-id") || undefined;
        let errMsg = locale === "ar" ? "فشل الاتصال بالخادم" : "Server connection failed";
        try {
          const data = await res.json();
          errMsg = data?.error?.[locale] || errMsg;
          traceId = data?.traceId || traceId;
        } catch {}
        setError({ type: "server", message: errMsg, traceId });
        setStep("recoverable_error");
        return;
      }
      setProgress(80);
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
      setProgress(100);
      setStep("success");
    } catch (err: unknown) {
      if (err.name === "AbortError") return;
      setError({ type: "network", message: locale === "ar" ? "انقطع الاتصال بالشبكة" : "Network error" });
      setStep("recoverable_error");
    }
  }

  function reset() {
    setStep("idle");
    setPrompt("");
    setFile(null);
    setError(null);
    setPlan(null);
    setResultUrl("");
    setExplanation("");
    setProgress(0);
    setFileMeta(null);
  }

  function setFileWithMeta(f: File | null) {
    if (!f) {
      setFile(null);
      setFileMeta(null);
      return;
    }
    let accepted = true;
    let reason = "";
    if (!f.name.match(/\.(xlsx|xls)$/i)) {
      accepted = false;
      reason = locale === "ar" ? "صيغة الملف غير مدعومة" : "Unsupported file type";
    } else if (f.size > 5 * 1024 * 1024) {
      accepted = false;
      reason = locale === "ar" ? "حجم الملف كبير جداً" : "File is too large";
    }
    setFile(f);
    setFileMeta({ name: f.name, size: f.size, accepted, reason });
  }

  function abort() {
    abortRef.current?.abort();
    setStep("idle");
  }

  return {
    step,
    prompt,
    setPrompt,
    file,
    setFile: setFileWithMeta,
    error,
    plan,
    resultUrl,
    explanation,
    progress,
    fileMeta,
    submit,
    reset,
    abort,
    setStep,
  };
}
