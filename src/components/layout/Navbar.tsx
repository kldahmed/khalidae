"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";

export function Navbar() {
  const pathname = usePathname();

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

        <nav className="hidden md:flex items-center gap-1">
          {siteConfig.nav.map((item) => {
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
                {item.label}
              </Link>
            );
          })}
        </nav>

        <MobileMenu pathname={pathname} />
      </div>
    </header>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  return (
    <nav className="flex md:hidden items-center gap-1">
      {siteConfig.nav.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-2 py-1.5 text-xs rounded transition-colors duration-200 ${
              isActive
                ? "text-zinc-100 bg-zinc-800/60"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
