import { type ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className = "", id }: SectionProps) {
  return (
    <section id={id} className={`py-20 px-6 ${className}`}>
      {children}
    </section>
  );
}

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}

export function Container({
  children,
  className = "",
  size = "default",
}: ContainerProps) {
  const sizes: Record<string, string> = {
    default: "max-w-5xl",
    narrow: "max-w-3xl",
    wide: "max-w-7xl",
  };

  return (
    <div className={`mx-auto w-full ${sizes[size]} ${className}`}>
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  label?: string;
  heading: string;
  subheading?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  label,
  heading,
  subheading,
  align = "left",
}: SectionHeaderProps) {
  const alignment = align === "center" ? "text-center" : "text-left";
  return (
    <div className={`mb-14 ${alignment}`}>
      {label && (
        <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase mb-4">
          {label}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 tracking-tight mb-4">
        {heading}
      </h2>
      {subheading && (
        <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
          {subheading}
        </p>
      )}
    </div>
  );
}
