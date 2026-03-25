"use client";

import { useRef, useEffect } from "react";
import type { ManagerEvent } from "@/lib/agents/types";

type Props = {
  events: ManagerEvent[];
};

const TYPE_COLORS: Record<string, string> = {
  manager_start: "text-blue-400",
  manager_complete: "text-green-400",
  tool_call: "text-yellow-400",
  tool_result: "text-yellow-300",
  agent_start: "text-cyan-400",
  agent_result: "text-cyan-300",
  memory_write: "text-purple-400",
  error: "text-red-400",
  result: "text-emerald-400",
};

const TYPE_ICONS: Record<string, string> = {
  manager_start: "▶",
  manager_complete: "✓",
  tool_call: "⚙",
  tool_result: "⚙",
  agent_start: "→",
  agent_result: "←",
  memory_write: "💾",
  error: "✗",
  result: "★",
};

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "--:--:--";
  }
}

export function ExecutionLog({ events }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold tracking-[0.15em] text-zinc-500 uppercase">
          Execution Log
        </label>
        {events.length > 0 && (
          <span className="text-xs text-zinc-600 tabular-nums">
            {events.length} event{events.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="h-80 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 font-mono text-xs space-y-1 scrollbar-thin"
      >
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-700">
            Waiting for execution...
          </div>
        ) : (
          events.map((event, i) => {
            const color = TYPE_COLORS[event.type] ?? "text-zinc-400";
            const icon = TYPE_ICONS[event.type] ?? "·";

            return (
              <div key={i} className="flex gap-2 leading-relaxed">
                <span className="text-zinc-700 shrink-0 tabular-nums">
                  {formatTime(event.timestamp)}
                </span>
                <span className={`shrink-0 w-4 text-center ${color}`}>
                  {icon}
                </span>
                <span className={`${color} font-semibold shrink-0 min-w-[120px]`}>
                  [{event.type}]
                </span>
                <span className="text-zinc-300 break-all">
                  {event.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
