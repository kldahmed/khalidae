import { type ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "muted" | "accent";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-zinc-800 text-zinc-300 border border-zinc-700/60",
    muted: "bg-zinc-900 text-zinc-500 border border-zinc-800",
    accent: "bg-zinc-50/10 text-zinc-200 border border-zinc-50/20",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium tracking-wide rounded-md ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
