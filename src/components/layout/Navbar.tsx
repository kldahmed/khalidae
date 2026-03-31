"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/providers/LocaleProvider";

const navItems = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "tools", href: "/tools" },
  { key: "projects", href: "/projects" },
  { key: "platforms", href: "/platforms" },
  { key: "contact", href: "/contact" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { locale, toggleLocale, t } = useLocale();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex flex-col leading-none hover:opacity-80 transition-opacity duration-200"
        >
          <span className="font-bold text-zinc-100 tracking-[0.15em] text-base">
            K<span className="text-zinc-500">.</span>A<span className="text-zinc-500">.</span>R
          </span>
          <span className="text-[10px] font-medium tracking-[0.3em] text-zinc-500 uppercase mt-0.5">
            Khalidae
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-3">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "text-zinc-100 bg-zinc-800/60"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
                  }`}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={toggleLocale}
            className="px-3 py-1.5 text-xs rounded-md border border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 transition-colors duration-200"
            aria-label={locale === "en" ? "Switch to Arabic" : "Switch to English"}
          >
            {locale === "en" ? "AR" : "EN"}
          </button>
        </div>

        <MobileMenu pathname={pathname} />
      </div>
    </header>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  const { locale, toggleLocale, t } = useLocale();

  return (
    <div className="flex md:hidden items-center gap-2">
      <button
        type="button"
        onClick={toggleLocale}
        className="px-2 py-1.5 text-[11px] rounded border border-zinc-700 text-zinc-300"
        aria-label={locale === "en" ? "Switch to Arabic" : "Switch to English"}
      >
        {locale === "en" ? "AR" : "EN"}
      </button>
      <nav className="flex items-center gap-1 overflow-x-auto">
        {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "text-zinc-100 bg-zinc-800/60"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
                }`}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
      </nav>
    </div>
  );
}
