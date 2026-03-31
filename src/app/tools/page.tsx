import type { Metadata } from "next";
import { Section, Container, SectionHeader } from "@/components/ui/Layout";
import ToolCard from "@/features/tools/ToolCard";
import { tools, toolCategories } from "@/lib/tools-data";
import Link from "next/link";


import ToolsPageClient from "@/features/tools/ToolsPageClient";

export const metadata: Metadata = {
  title: "الأدوات",
  description: "دليل احترافي لأدوات ويب دقيقة للمستخدمين التقنيين.",
};

export default function ToolsPage() {
  // ترتيب الأدوات: featured أولاً
  // اجعل مُبرمج الإكسل الذكي هو الأداة الأولى يدويًا
  const excelTool = tools.find(t => t.slug === "excel-programmer");
  const rest = tools.filter(t => t.slug !== "excel-programmer");
  return (
    <div dir="rtl" style={{ background: '#10131a', minHeight: '100vh', padding: '0 0 60px 0' }}>
      <Section>
        <SectionHeader heading="الأدوات الذكية" subheading="مجموعة أدوات احترافية مدعومة بالذكاء الاصطناعي" align="center" />
        {excelTool && (
          <div style={{ marginBottom: 32 }}>
            <ToolCard tool={excelTool} />
          </div>
        )}
        <ToolsPageClient tools={rest} toolCategories={toolCategories} />
      </Section>
    </div>
  );
}

