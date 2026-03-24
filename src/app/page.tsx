"use client";

import Link from "next/link";
import { Section, Container } from "@/components/ui/Layout";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function HomePage() {
  const { t } = useLocale();

  return (
    <main className="pt-24">
      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(244,244,245,0.07),transparent_38%),linear-gradient(180deg,rgba(39,39,42,0.55),transparent_45%)]" />
        <Container className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.24em] text-zinc-500 uppercase mb-6">
              {t("home.tagline")}
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[0.08em] text-zinc-100 leading-none">
              K<span className="text-zinc-500">.</span>A<span className="text-zinc-500">.</span>R
            </h1>
            <p className="mt-8 max-w-2xl text-xl sm:text-2xl text-zinc-300 leading-relaxed">
              {t("home.description")}
            </p>
            <p className="mt-6 max-w-2xl text-base text-zinc-500 leading-relaxed">
              {t("home.openTo")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/tools"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-50/20 bg-zinc-50 px-8 py-4 text-base font-medium tracking-wide text-zinc-950 transition-all duration-200 hover:bg-white"
              >
                {t("home.explore")}
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-8 py-4 text-base font-medium tracking-wide text-zinc-300 transition-all duration-200 hover:border-zinc-500 hover:text-zinc-100"
              >
                {t("home.viewProjects")}
              </Link>
            </div>
          </div>

          <div className="border border-zinc-800/60 rounded-3xl bg-zinc-900/40 p-8 sm:p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
            <p className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-4">
              Platform Intro
            </p>
            <div className="space-y-5 text-sm sm:text-base text-zinc-400 leading-relaxed">
              <p>
                Khalidae is a long-horizon digital platform built as owned infrastructure: tools, systems, and public surface area designed to compound over time.
              </p>
              <p>
                It combines practical utilities, product experiments, and technical identity into one focused base of operations built for durable work.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
