// تعريف gtag على window لتجنب خطأ TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
"use client";

import Link from "next/link";

type PlatformCardProps = {
  title: string;
  description: string;
  href: string;
  badge?: string;
};

export function PlatformCard({
  title,
  description,
  href,
  badge = "LIVE",
}: PlatformCardProps) {
  // تتبع الضغط داخليًا (gtag)
  const handleClick = () => {
    if (typeof window !== "undefined" && window?.gtag) {
      window.gtag("event", "platform_news_clicked");
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-2xl"
      onClick={handleClick}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-white md:text-2xl">
          {title}
        </h2>

        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300">
          {badge}
        </span>
      </div>

      <p className="mb-6 text-sm leading-7 text-white/70 md:text-base">
        {description}
      </p>

      <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition group-hover:translate-x-1">
        <span>الدخول إلى المنصة</span>
        <span aria-hidden="true">↗</span>
      </div>
    </a>
  );
}