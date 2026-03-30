import type { Metadata } from "next";
import { Section, Container, SectionHeader } from "@/components/ui/Layout";
import { ToolCard } from "@/features/tools/ToolCard";
import { tools, toolCategories } from "@/lib/tools-data";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "A professional directory of precision-built web tools for technical users.",
};

export default function ToolsPage() {
  const categories = toolCategories.filter((cat) =>
    tools.some((t) => t.category === cat.value)
  );

  return (
    <main className="pt-24">
      <Section>
        <Container>
          <SectionHeader
            label="Utilities"
            heading="Tools"
            subheading="A growing catalog of precision-built web tools. Each utility is built to a production standard with a clear, single-purpose design."
          />

          <div className="space-y-16">
            {categories.map((cat) => {
              const categoryTools = tools.filter((t) => t.category === cat.value);
              return (
                <div key={cat.value}>
                  <h2 className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-6 border-b border-zinc-800/60 pb-4">
                    {cat.label}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryTools.map((tool) => (
                      <ToolCard key={tool.slug} tool={tool} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-20 border border-zinc-800/60 rounded-2xl p-8 bg-zinc-900/40">
            <p className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-3">
              Roadmap
            </p>
            <h3 className="text-zinc-100 font-semibold text-lg mb-3">
              More tools coming.
            </h3>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xl">
              This directory grows continuously. Tools are added when they meet
              the quality bar — not on a schedule. Check back for new additions.
            </p>
          </div>

          <div style={{ background: "#181f2a", color: "#7fd7ff", borderRadius: 12, padding: 18, margin: 8, fontWeight: 700, fontSize: 18, textAlign: "center", boxShadow: "0 2px 8px #0002", cursor: "pointer" }}>
            <Link href="/tools/excel-programmer">
              مُبرمج الإكسل الذكي
              <div style={{ fontSize: 14, color: "#b2c7e6", marginTop: 6 }}>
                إنشاء وتعديل ملفات Excel تلقائيًا
              </div>
            </Link>
          </div>
        </Container>
      </Section>
    </main>
  );
}
