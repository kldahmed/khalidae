import { type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

const inputBase =
  "w-full bg-zinc-900 border border-zinc-700/70 text-zinc-200 placeholder-zinc-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/50 focus:border-zinc-600 transition-colors duration-200";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputBase} ${className}`} {...props} />;
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${inputBase} resize-none ${className}`}
      {...props}
    />
  );
}

interface LabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export function Label({ htmlFor, children, className = "" }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-zinc-400 mb-2 ${className}`}
    >
      {children}
    </label>
  );
}
