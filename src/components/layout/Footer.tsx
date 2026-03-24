"use client";

import Link from "next/link";
import { useLocale } from "@/components/providers/LocaleProvider";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLocale();
  const navItems = [
    { key: "home", href: "/" },
    { key: "about", href: "/about" },
    { key: "tools", href: "/tools" },
    { key: "projects", href: "/projects" },
    { key: "contact", href: "/contact" },
  ] as const;
  const legalItems = [
    { key: "privacy", href: "/privacy" },
    { key: "terms", href: "/terms" },
  ] as const;

  return (
    <footer className="border-t border-zinc-800/60 bg-zinc-950">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex flex-col leading-none mb-1">
              <span className="font-bold text-zinc-100 tracking-[0.15em] text-base">
                K<span className="text-zinc-500">.</span>A<span className="text-zinc-500">.</span>R
              </span>
              <span className="text-[10px] font-medium tracking-[0.3em] text-zinc-500 uppercase mt-0.5">
                Khalidae
              </span>
            </div>
            <p className="text-zinc-500 text-sm max-w-xs">
              {t("home.description")}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-6">
              {legalItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors duration-200"
                >
                  {t(`footer.${item.key}`)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-xs text-zinc-600">
            &copy; {year} {siteConfig.name}. {t("footer.rights")}
          </p>
          <p className="text-xs text-zinc-700">Built with precision.</p>
        </div>
      </div>
    </footer>
  );
}
