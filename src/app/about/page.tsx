import type { Metadata } from "next";
import { Section, Container, SectionHeader } from "@/components/ui/Layout";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who Khalidae is, what this platform is building, and the long-term vision behind it.",
};

const pillars = [
  {
    label: "Deep Work Infrastructure",
    description:
      "Tools and systems built to reduce friction for focused, high-leverage work. No noise. No clutter.",
  },
  {
    label: "Personal Digital Ownership",
    description:
      "Operating from owned infrastructure — not rented land. This domain and platform are long-term property.",
  },
  {
    label: "Technical Utility",
    description:
      "Building real tools that solve real problems. Each utility starts from a genuine personal need.",
  },
  {
    label: "Long-Horizon Thinking",
    description:
      "Architecture decisions, brand identity, and product direction are all built for a multi-year trajectory.",
  },
];

export default function AboutPage() {
  return (
    <main className="pt-24">
      {/* Header */}
      <Section>
        <Container size="narrow">
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-6">
            Identity
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-zinc-100 tracking-tight mb-8 leading-tight">
            About Khalidae
          </h1>
          <div className="space-y-6 text-zinc-400 text-lg leading-relaxed">
            <p>
              Khalidae is a personal digital platform — a private digital
              property built from the ground up with intention, precision, and a
              long time horizon.
            </p>
            <p>
              This is not a portfolio. It does not exist to impress hiring
              managers or collect social proof. It exists as a base of
              operations: a place to build, ship, and own things that matter.
            </p>
            <p>
              The platform is part utility lab, part technical journal, part
              identity anchor. Every tool, page, and piece of infrastructure
              here is built to serve a real purpose — and designed to last.
            </p>
          </div>
        </Container>
      </Section>

      {/* What is being built */}
      <Section className="border-t border-zinc-800/60">
        <Container size="narrow">
          <SectionHeader
            label="Mission"
            heading="What This Is Building"
            subheading="Khalidae is building a personal technology platform with a clear long-term mandate: own the infrastructure, own the tools, own the identity."
          />
          <div className="space-y-6 text-zinc-400 text-base leading-relaxed">
            <p>
              The platform starts with practical tools — utilities for link
              analysis, metadata inspection, text processing, and profile
              generation. These are real-use tools built to a high standard,
              not demos.
            </p>
            <p>
              Over time, the platform will expand into more sophisticated
              services: productivity systems, data pipelines, content utilities,
              and eventually monetizable micro-products. Everything is designed
              with modularity so expansion happens cleanly.
            </p>
            <p>
              The underlying architecture is built to scale — both technically
              and as a brand. Khalidae is a name with a long future.
            </p>
          </div>
        </Container>
      </Section>

      {/* Pillars */}
      <Section className="border-t border-zinc-800/60">
        <Container>
          <SectionHeader label="Principles" heading="Operating Pillars" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((pillar) => (
              <div
                key={pillar.label}
                className="border border-zinc-800/60 rounded-2xl p-6 bg-zinc-900/40"
              >
                <h3 className="text-zinc-100 font-semibold mb-3">
                  {pillar.label}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Vision */}
      <Section className="border-t border-zinc-800/60">
        <Container size="narrow">
          <SectionHeader label="Vision" heading="The Long Game" />
          <div className="space-y-6 text-zinc-400 text-base leading-relaxed">
            <p>
              The goal is not to build the largest platform, but to build the
              most deliberate one. Every decision — technical, visual, and
              strategic — is made with a five-year minimum perspective.
            </p>
            <p>
              Digital real estate compounds. A strong domain, a consistent
              brand, and a catalog of genuinely useful tools creates something
              difficult to replicate. That is what Khalidae is building toward.
            </p>
            <p>
              This platform will remain deeply personal — not a faceless SaaS,
              not a generic blog. It will carry the fingerprint of the person
              who built it, and grow accordingly.
            </p>
          </div>
        </Container>
      </Section>
    </main>
  );
}
