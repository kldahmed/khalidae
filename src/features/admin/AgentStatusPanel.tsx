"use client";

import { useState, useEffect, useCallback } from "react";
import type { AgentStatus } from "@/lib/agents/types";

export function AgentStatusPanel() {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/agents/status");

      if (!res.ok) {
        setError("Failed to load status");
        return;
      }

      const data = await res.json();
      setAgents(data.agents ?? []);
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold tracking-[0.15em] text-zinc-500 uppercase">
          Agent Status
        </label>
        <button
          onClick={refresh}
          disabled={loading}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors disabled:opacity-40"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-200">
                {agent.name}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                  agent.healthy ? "text-emerald-400" : "text-red-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    agent.healthy ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />
                {agent.healthy ? "Healthy" : "Unhealthy"}
              </span>
            </div>

            {agent.availableTools.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {agent.availableTools.map((tool) => (
                  <span
                    key={tool}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-800"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            )}

            {agent.issues.length > 0 && (
              <div className="space-y-1">
                {agent.issues.map((issue, i) => (
                  <p key={i} className="text-[11px] text-red-400/80">
                    ⚠ {issue}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}

        {!loading && agents.length === 0 && !error && (
          <p className="text-xs text-zinc-600 col-span-full">No agents found.</p>
        )}
      </div>
    </div>
  );
}
