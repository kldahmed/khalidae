"use client";

import { useState } from "react";
import { Input } from "@/components/ui/FormElements";
import { Button } from "@/components/ui/Button";

interface AnalysisResult {
  url: string;
  status: string;
  message: string;
}

export function LinkAnalyzerTool() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function isValidUrl(input: string): boolean {
    try {
      const parsed = new URL(input);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function handleAnalyze() {
    if (!isValidUrl(url)) {
      setError("Please enter a valid http:// or https:// URL.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    // Client-side fetch to /api/tools/link-analyzer
    try {
      const res = await fetch(
        `/api/tools/link-analyzer?url=${encodeURIComponent(url)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to analyze URL.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Check the URL and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="link-url"
          className="block text-sm font-medium text-zinc-400 mb-2"
        >
          URL to analyze
        </label>
        <div className="flex gap-3">
          <Input
            id="link-url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          />
          <Button
            onClick={handleAnalyze}
            disabled={loading || !url}
            className="shrink-0"
          >
            {loading ? "Analyzing…" : "Analyze"}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      {result && (
        <div className="border border-zinc-700/60 rounded-xl p-6 bg-zinc-900/60 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-300 tracking-wide uppercase">
            Result
          </h3>
          <div className="space-y-3">
            <ResultRow label="URL" value={result.url} mono />
            <ResultRow label="Status" value={result.status} />
            <ResultRow label="Note" value={result.message} />
          </div>
        </div>
      )}
    </div>
  );
}

function ResultRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="text-xs text-zinc-600 font-medium uppercase tracking-wider w-20 shrink-0 pt-0.5">
        {label}
      </span>
      <span
        className={`text-sm text-zinc-300 break-all ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
