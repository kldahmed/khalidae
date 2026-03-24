import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-40 disabled:pointer-events-none";

  const variants: Record<string, string> = {
    primary:
      "bg-zinc-50 text-zinc-950 hover:bg-white border border-zinc-50/20",
    secondary:
      "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/50",
    ghost: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50",
    outline:
      "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100",
  };

  const sizes: Record<string, string> = {
    sm: "text-sm px-4 py-2 rounded-md gap-1.5",
    md: "text-sm px-6 py-3 rounded-lg gap-2",
    lg: "text-base px-8 py-4 rounded-xl gap-2.5",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
