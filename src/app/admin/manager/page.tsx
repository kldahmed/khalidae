"use client";

import { useMemo, useState } from "react";
import { AgentStatusPanel } from "@/features/admin/AgentStatusPanel";
import { AuthGate } from "@/features/admin/AuthGate";
import { ExecutionLog } from "@/features/admin/ExecutionLog";
import { ManagerCommandBox } from "@/features/admin/ManagerCommandBox";
import { QuickActions } from "@/features/admin/QuickActions";
import type { ManagerEvent, ManagerResult } from "@/lib/agents/types";

function safeDate(v?: string) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleTimeString();
}

export default function AdminManagerPage() {
  const [events, setEvents] = useState<ManagerEvent[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [quickCommand, setQuickCommand] = useState<string>("");
  const [finalResult, setFinalResult] = useState<ManagerResult | null>(null);

  const managerEvents = useMemo(() => {
    const validTypes = new Set([
      "manager_start",
      "manager_complete",
      "tool_call",
      "tool_result",
      "agent_start",
      "agent_result",
      "memory_write",
      "error",
    ]);

    return events.filter((event) => validTypes.has(event.type));
  }, [events]);

  function handleEvents(nextEvents: ManagerEvent[]) {
    setEvents((prev) => {
      const combined = [...prev, ...nextEvents];
      return combined.slice(-400);
    });

    for (const event of nextEvents) {
      const maybePayload = event.payload as { payload?: ManagerResult } | undefined;

      if (event.type === "error") {
        continue;
      }

      if (event.type === "manager_complete") {
        continue;
      }

      if (event.type === ("result" as ManagerEvent["type"]) && maybePayload?.payload) {
        setFinalResult(maybePayload.payload);
      }
    }

    for (const event of nextEvents) {
      const asResult = event as unknown as { type?: string; payload?: ManagerResult };
      if (asResult.type === "result" && asResult.payload) {
        setFinalResult(asResult.payload);
      }
    }
  }

  return (
    <AuthGate>
      <main className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
          <header className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Manager Control Panel</h1>
            <p className="text-sm text-zinc-400">Execute manager instructions and track agent execution in real time.</p>
          </header>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4">
            <QuickActions
              disabled={isExecuting}
              onCommand={(instruction) => {
                setQuickCommand(instruction);
              }}
            />
            <ManagerCommandBox
              initialCommand={quickCommand}
              onEvents={handleEvents}
              onComplete={() => {
                setQuickCommand("");
              }}
              onExecutingChange={setIsExecuting}
            />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <ExecutionLog events={managerEvents} />
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <AgentStatusPanel />
            </div>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-zinc-500">Final Result</h2>
              {finalResult && (
                <span className="text-xs text-zinc-500">Completed: {safeDate(finalResult.completedAt)}</span>
              )}
            </div>

            {!finalResult ? (
              <p className="text-sm text-zinc-600">No final result yet.</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="rounded border border-zinc-800 bg-zinc-950/60 px-3 py-2">
                    <div className="text-zinc-500">Status</div>
                    <div className={finalResult.ok ? "text-emerald-400" : "text-red-400"}>
                      {finalResult.ok ? "OK" : "Failed"}
                    </div>
                  </div>
                  <div className="rounded border border-zinc-800 bg-zinc-950/60 px-3 py-2">
                    <div className="text-zinc-500">Started</div>
                    <div className="text-zinc-200">{safeDate(finalResult.startedAt)}</div>
                  </div>
                  <div className="rounded border border-zinc-800 bg-zinc-950/60 px-3 py-2">
                    <div className="text-zinc-500">Completed</div>
                    <div className="text-zinc-200">{safeDate(finalResult.completedAt)}</div>
                  </div>
                  <div className="rounded border border-zinc-800 bg-zinc-950/60 px-3 py-2">
                    <div className="text-zinc-500">Agents</div>
                    <div className="text-zinc-200">{finalResult.delegatedResults.length}</div>
                  </div>
                </div>

                <pre className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 text-xs text-zinc-200 whitespace-pre-wrap break-words">
                  {finalResult.output}
                </pre>
              </div>
            )}
          </section>
        </div>
      </main>
    </AuthGate>
  );
}
