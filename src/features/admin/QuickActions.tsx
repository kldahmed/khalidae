"use client";

type Props = {
  onCommand: (instruction: string) => void;
  disabled?: boolean;
};

const ACTIONS = [
  {
    label: "Analyze Website",
    instruction: "افحص khalidae.com بالكامل وأعطني تقريراً.",
    color: "border-cyan-800/40 hover:border-cyan-700",
  },
  {
    label: "Check Vercel",
    instruction: "افحص deploy logs وأي أخطاء.",
    color: "border-yellow-800/40 hover:border-yellow-700",
  },
  {
    label: "SEO Audit",
    instruction: "حلل SEO للموقع.",
    color: "border-emerald-800/40 hover:border-emerald-700",
  },
  {
    label: "System Status",
    instruction: "اعطني حالة النظام.",
    color: "border-purple-800/40 hover:border-purple-700",
  },
] as const;

export function QuickActions({ onCommand, disabled }: Props) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold tracking-[0.15em] text-zinc-500 uppercase">
        Quick Actions
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => onCommand(action.instruction)}
            disabled={disabled}
            className={`rounded-lg border bg-zinc-900/60 px-3 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-900/80 hover:text-zinc-100 disabled:opacity-40 disabled:pointer-events-none ${action.color}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
