import type { Metadata } from "next";
import Link from "next/link";
import { Section, Container } from "@/components/ui/Layout";

export const metadata: Metadata = {
  title: "Not Found",
};

export default function NotFoundPage() {
  return (
    <main className="flex-1 flex items-center">
      <Section>
        <Container size="narrow">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-6">
            404
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight mb-6">
            Page not found.
          </h1>
          <p className="text-zinc-500 text-lg leading-relaxed mb-10">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 px-6 py-3 rounded-xl text-sm font-medium transition-colors duration-200"
          >
            ← Back to home
          </Link>
        </Container>
      </Section>
    </main>
  );
}
