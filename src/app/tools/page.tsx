import type { Metadata } from "next";
import { Section, Container, SectionHeader } from "@/components/ui/Layout";
import ToolCard from "@/features/tools/ToolCard";
import { tools, toolCategories } from "@/lib/tools-data";
import Link from "next/link";


import dynamic from "next/dynamic";

const ToolsPageClient = dynamic(() => import("@/features/tools/ToolsPageClient"), { ssr: false });

export const metadata: Metadata = {
  title: "الأدوات",
  description: "دليل احترافي لأدوات ويب دقيقة للمستخدمين التقنيين.",
};

export default function ToolsPage() {
  return <ToolsPageClient tools={tools} toolCategories={toolCategories} />;
}

// ترجمة تصنيفات الأدوات للعربية
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
