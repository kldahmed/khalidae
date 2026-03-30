"use client";
import { Section, Container, SectionHeader } from "@/components/ui/Layout";
import ToolCard from "@/features/tools/ToolCard";
import Link from "next/link";
import { useLocale } from "@/components/providers/LocaleProvider";
import { t } from "@/lib/i18n";

function translateCategory(cat: string) {
  switch (cat) {
    case "link":
      return "روابط";
    case "text":
      return "نصوص";
    case "image":
      return "صور";
    case "file":
      return "ملفات";
    case "productivity":
      return "إنتاجية";
    case "media":
      return "وسائط";
    case "profile":
      return "هوية";
    default:
      return cat;
  }
}

export default function ToolsPageClient({ tools, toolCategories }: { tools: any[]; toolCategories: any[] }) {
  const { locale } = useLocale();
  const isArabic = locale === "ar";
  const categories = toolCategories.filter((cat) =>
    tools.some((t) => t.category === cat.value)
  );

  return (
    <main
      className="pt-24"
      dir={isArabic ? "rtl" : "ltr"}
      style={isArabic ? { fontFamily: 'Tajawal, Cairo, Arial, sans-serif', textAlign: 'right', background: '#0f172a' } : {}}
    >
      <Section>
        <Container>
          <SectionHeader
            label={t(locale, "tools.label")}
            heading={t(locale, "tools.title")}
            subheading={t(locale, "tools.description")}
          />

          <div className="space-y-16">
            {categories.map((cat) => {
              const categoryTools = tools.filter((t) => t.category === cat.value);
              return (
                <div key={cat.value}>
                  <h2 className="text-xs font-semibold tracking-[0.2em] text-zinc-600 uppercase mb-6 border-b border-zinc-800/60 pb-4">
                    {isArabic ? translateCategory(cat.value) : cat.label}
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
              {isArabic ? "خارطة الطريق" : "Roadmap"}
            </p>
            <h3 className="text-zinc-100 font-semibold text-lg mb-3">
              {isArabic ? "المزيد من الأدوات قريبًا" : "More tools coming."}
            </h3>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xl">
              {isArabic
                ? "هذا الدليل ينمو باستمرار. تُضاف الأدوات الجديدة عند وصولها لمستوى الجودة المطلوب — لا يوجد جدول زمني ثابت. عد لزيارتنا باستمرار."
                : "This directory grows continuously. Tools are added when they meet the quality bar — not on a schedule. Check back for new additions."}
            </p>
          </div>

          <div style={{ background: "#181f2a", color: "#7fd7ff", borderRadius: 12, padding: 18, margin: 8, fontWeight: 700, fontSize: 18, textAlign: "center", boxShadow: "0 2px 8px #0002", cursor: "pointer" }}>
            <Link href="/tools/excel-programmer">
              {isArabic ? "مُبرمج الإكسل الذكي" : "Excel Programmer"}
              <div style={{ fontSize: 14, color: "#b2c7e6", marginTop: 6 }}>
                {isArabic ? "إنشاء وتعديل ملفات Excel تلقائيًا" : "Create and edit Excel files automatically"}
              </div>
            </Link>
          </div>
        </Container>
      </Section>
    </main>
  );
}