import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`bg-zinc-900/60 border border-zinc-800/80 rounded-2xl ${
        hover
          ? "transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/80"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
