"use client";

import { useState, useRef, useEffect } from "react";
import type { ManagerEvent } from "@/lib/agents/types";

type Props = {
  onEvents: (events: ManagerEvent[]) => void;
  onComplete: () => void;
  initialCommand?: string;
  onExecutingChange?: (v: boolean) => void;
};

export function ManagerCommandBox({
  onEvents,
  onComplete,
  initialCommand,
  onExecutingChange,
}: Props) {
  const [command, setCommand] = useState("");
  const [executing, setExecuting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (initialCommand) setCommand(initialCommand);
  }, [initialCommand]);

  async function execute() {
    const instruction = command.trim();
    if (!instruction || executing) return;

    setExecuting(true);
    onExecutingChange?.(true);

    try {
      abortRef.current = new AbortController();

      const res = await fetch("/api/manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        onEvents([
          {
            type: "error",
            message: err.error || `HTTP ${res.status}`,
            timestamp: new Date().toISOString(),
          },
        ]);
        setExecuting(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        const events: ManagerEvent[] = [];
        for (const line of lines) {
          const cleaned = line.replace(/^data: /, "");
          if (!cleaned) continue;
          try {
            events.push(JSON.parse(cleaned));
          } catch {
            // skip malformed
          }
        }

        if (events.length) onEvents(events);
      }

      // flush remaining
      if (buffer.trim()) {
        const cleaned = buffer.replace(/^data: /, "");
        try {
          onEvents([JSON.parse(cleaned)]);
        } catch {
          // skip
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        onEvents([
          {
            type: "error",
            message: (err as Error).message,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setExecuting(false);
      onExecutingChange?.(false);
      abortRef.current = null;
      onComplete();
    }
  }

  function cancel() {
    abortRef.current?.abort();
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold tracking-[0.15em] text-zinc-500 uppercase">
        Command
      </label>
      <textarea
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) execute();
        }}
        placeholder="Enter instruction for the manager agent..."
        rows={3}
        disabled={executing}
        className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-colors font-mono disabled:opacity-60"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={execute}
          disabled={executing || !command.trim()}
          className="rounded-lg bg-zinc-100 px-6 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-white disabled:opacity-40 disabled:pointer-events-none"
        >
          {executing ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-3.5 h-3.5 border-2 border-zinc-600 border-t-zinc-950 rounded-full animate-spin" />
              Executing...
            </span>
          ) : (
            "Execute"
          )}
        </button>
        {executing && (
          <button
            onClick={cancel}
            className="rounded-lg border border-red-800/50 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:border-red-700 hover:text-red-300"
          >
            Cancel
          </button>
        )}
        <span className="text-xs text-zinc-600 ml-auto">
          Ctrl+Enter to execute
        </span>
      </div>
    </div>
  );
}
