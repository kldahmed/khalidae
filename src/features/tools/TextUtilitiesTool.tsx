"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/FormElements";
import { Button } from "@/components/ui/Button";

type Operation =
  | "uppercase"
  | "lowercase"
  | "titlecase"
  | "trim"
  | "deduplicate"
  | "base64encode"
  | "base64decode"
  | "count";

const operations: { value: Operation; label: string }[] = [
  { value: "uppercase", label: "Uppercase" },
  { value: "lowercase", label: "Lowercase" },
  { value: "titlecase", label: "Title Case" },
  { value: "trim", label: "Trim Whitespace" },
  { value: "deduplicate", label: "Deduplicate Lines" },
  { value: "base64encode", label: "Base64 Encode" },
  { value: "base64decode", label: "Base64 Decode" },
  { value: "count", label: "Word & Char Count" },
];

function applyOperation(text: string, op: Operation): string {
  switch (op) {
    case "uppercase":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "titlecase":
      return text.replace(
        /\w\S*/g,
        (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      );
    case "trim":
      return text
        .split("\n")
        .map((l) => l.trim())
        .join("\n")
        .trim();
    case "deduplicate":
      return [...new Set(text.split("\n"))].join("\n");
    case "base64encode":
      try {
        return btoa(unescape(encodeURIComponent(text)));
      } catch {
        return "Encoding error.";
      }
    case "base64decode":
      try {
        return decodeURIComponent(escape(atob(text.trim())));
      } catch {
        return "Decoding error — input is not valid Base64.";
      }
    case "count": {
      const chars = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const lines = text.split("\n").length;
      return `Characters: ${chars}\nWords: ${words}\nLines: ${lines}`;
    }
    default:
      return text;
  }
}

export function TextUtilitiesTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeOp, setActiveOp] = useState<Operation>("uppercase");

  function handle() {
    setOutput(applyOperation(input, activeOp));
  }

  function handleCopy() {
    if (output) navigator.clipboard.writeText(output);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {operations.map((op) => (
          <button
            key={op.value}
            onClick={() => setActiveOp(op.value)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors duration-150 ${
              activeOp === op.value
                ? "bg-zinc-100 text-zinc-950 border-zinc-100"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">
          Input
        </label>
        <Textarea
          rows={7}
          placeholder="Paste your text here…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <Button onClick={handle} disabled={!input}>
        Apply: {operations.find((o) => o.value === activeOp)?.label}
      </Button>

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-zinc-400">Output</label>
            <button
              onClick={handleCopy}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Copy
            </button>
          </div>
          <pre className="w-full bg-zinc-900 border border-zinc-700/60 text-zinc-300 rounded-lg px-4 py-3 text-sm font-mono whitespace-pre-wrap break-all">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
