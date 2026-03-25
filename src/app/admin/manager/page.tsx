"use client";

import {
  useState,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { AuthGate } from "@/features/admin/AuthGate";
import { ManagerCommandBox } from "@/features/admin/ManagerCommandBox";
import { ExecutionLog } from "@/features/admin/ExecutionLog";
import { AgentStatusPanel } from "@/features/admin/AgentStatusPanel";
import { QuickActions } from "@/features/admin/QuickActions";
import type { ManagerEvent } from "@/lib/agents/types";

function ManagerDashboard() {
  const [events, setEvents] = useState<ManagerEvent[]>([]);
  const [executing, setExecuting] = useState(false);
  const commandRef = useRef<{ execute: (cmd: string) => void }>(null);

  const handleEvents = useCallback((newEvents: ManagerEvent[]) => {
    setEvents((prev) => [...prev, ...newEvents]);
  }, []);

  const handleComplete = useCallback(() => {
    setExecuting(false);
  }, []);

  const handleQuickAction = useCallback((instruction: string) => {
    // We set the command text via a different mechanism — post a custom event
    window.dispatchEvent(
      new CustomEvent("manager-quick-action", { detail: instruction }),
    );
  }, []);

  const clearLog = useCallback(() => {
    setEvents([]);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
              <span className="text-xs font-bold text-zinc-300">M</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-zinc-100 tracking-wide">
                Manager Control Panel
              </h1>
              <p className="text-[11px] text-zinc-600">khalidae.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearLog}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700"
            >
              Clear Log
            </button>
            <button
              onClick={async () => {
                await fetch("/api/admin/logout", { method: "POST" });
                window.location.href = "/admin/login";
              }}
              className="text-xs text-zinc-600 hover:text-red-400 transition-colors px-3 py-1.5 rounded-md border border-zinc-800 hover:border-red-800/50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Quick Actions */}
        <QuickActions onCommand={handleQuickAction} disabled={executing} />

        {/* Command + Log Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5">
            <ManagerCommandBoxWrapper
              ref={commandRef}
              onEvents={handleEvents}
              onComplete={handleComplete}
              onExecutingChange={setExecuting}
            />
          </div>
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5">
            <ExecutionLog events={events} />
          </div>
        </div>

        {/* Result Output */}
        <ResultPanel events={events} />

        {/* Agent Status */}
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5">
          <AgentStatusPanel />
        </div>
      </main>
    </div>
  );
}

/* Wrapper to bridge quick actions with the command box via custom events */

type WrapperProps = {
  onEvents: (events: ManagerEvent[]) => void;
  onComplete: () => void;
  onExecutingChange: (v: boolean) => void;
};

const ManagerCommandBoxWrapper = forwardRef<
  { execute: (cmd: string) => void },
  WrapperProps
>(function ManagerCommandBoxWrapper({ onEvents, onComplete, onExecutingChange }, ref) {
  const [command, setCommand] = useState("");

  useEffect(() => {
    function handler(e: Event) {
      const instruction = (e as CustomEvent).detail as string;
      setCommand(instruction);
    }
    window.addEventListener("manager-quick-action", handler);
    return () => window.removeEventListener("manager-quick-action", handler);
  }, []);

  useImperativeHandle(ref, () => ({
    execute: (cmd: string) => setCommand(cmd),
  }));

  return (
    <ManagerCommandBox
      onEvents={onEvents}
      onComplete={onComplete}
      initialCommand={command}
      onExecutingChange={onExecutingChange}
    />
  );
});

/* Panel to display the final result from the manager */
function ResultPanel({ events }: { events: ManagerEvent[] }) {
  // The API also emits a "result" type event not in the ManagerEvent union
  const resultEvent = [...events]
    .reverse()
    .find(
      (e) =>
        (e.type as string) === "result" || e.type === "manager_complete",
    );

  if (!resultEvent?.payload && !resultEvent?.message) return null;

  const payload = resultEvent.payload as { output?: string; ok?: boolean } | undefined;
  const output = payload?.output ?? resultEvent.message;

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 space-y-2">
      <label className="block text-xs font-semibold tracking-[0.15em] text-zinc-500 uppercase">
        Result
      </label>
      <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
        {output}
      </div>
    </div>
  );
}

export default function ManagerPage() {
  return (
    <AuthGate>
      <ManagerDashboard />
    </AuthGate>
  );
}
