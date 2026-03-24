"use client";

import { useState } from "react";
import { Input } from "@/components/ui/FormElements";
import { Button } from "@/components/ui/Button";

interface MetadataResult {
  url: string;
  title: string | null;
  description: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
  canonical: string | null;
}

export function MetadataViewerTool() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<MetadataResult | null>(null);
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

  async function handleFetch() {
    if (!isValidUrl(url)) {
      setError("Please enter a valid http:// or https:// URL.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        `/api/tools/metadata-viewer?url=${encodeURIComponent(url)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to fetch metadata.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="meta-url"
          className="block text-sm font-medium text-zinc-400 mb-2"
        >
          Page URL
        </label>
        <div className="flex gap-3">
          <Input
            id="meta-url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFetch()}
          />
          <Button
            onClick={handleFetch}
            disabled={loading || !url}
            className="shrink-0"
          >
            {loading ? "Fetching…" : "Extract"}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>

      {result && (
        <div className="border border-zinc-700/60 rounded-xl p-6 bg-zinc-900/60 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-300 tracking-wide uppercase">
            Metadata
          </h3>
          <div className="space-y-3">
            <MetaRow label="URL" value={result.url} mono />
            <MetaRow label="Title" value={result.title} />
            <MetaRow label="Description" value={result.description} />
            <MetaRow label="OG Title" value={result.ogTitle} />
            <MetaRow label="OG Desc" value={result.ogDescription} />
            <MetaRow label="OG Image" value={result.ogImage} mono />
            <MetaRow label="Twitter" value={result.twitterCard} />
            <MetaRow label="Canonical" value={result.canonical} mono />
          </div>
        </div>
      )}
    </div>
  );
}

function MetaRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="text-xs text-zinc-600 font-medium uppercase tracking-wider w-24 shrink-0 pt-0.5">
        {label}
      </span>
      <span
        className={`text-sm break-all ${
          value ? "text-zinc-300" : "text-zinc-700 italic"
        } ${mono ? "font-mono" : ""}`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}
