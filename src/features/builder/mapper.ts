// Utility functions for mapping API/backend responses to UI contracts
import type { ExcelProgrammerError } from "./types";

export function mapApiError(error: any, locale: "ar" | "en"): ExcelProgrammerError {
  if (!error) return { type: "server", message: locale === "ar" ? "فشل الاتصال بالخادم" : "Server connection failed" };
  if (typeof error === "string") return { type: "server", message: error };
  if (error.error && typeof error.error === "object") {
    return {
      type: "server",
      message: error.error[locale] || error.error.en || error.error.ar || "Server error",
      traceId: error.traceId,
    };
  }
  return { type: "server", message: error.message || "Unknown error" };
}
