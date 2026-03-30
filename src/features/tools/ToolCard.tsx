
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Tool } from "@/types";
import { useLocale } from "@/components/providers/LocaleProvider";
import { t } from "@/lib/i18n";

interface ToolCardProps {
  tool: Tool;
}

function ToolCard({ tool }: ToolCardProps) {
  const { locale } = useLocale?.() || { locale: "en" };
  const isArabic = locale === "ar";
  const cardContent = (
    <Card hover className="p-6 h-full flex flex-col gap-4">
      <div style={isArabic ? { direction: "rtl", fontFamily: 'Tajawal, Cairo, Arial, sans-serif', textAlign: 'right' } : {}}>
        <div className="flex items-start justify-between">
          <span className="text-2xl" role="img" aria-label={tool.name}>
            {tool.icon}
          </span>
          {tool.comingSoon && (
            <Badge variant="muted">{isArabic ? "قريبًا" : "Soon"}</Badge>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-zinc-100 font-semibold text-base mb-2">
            {isArabic && tool.name_ar ? tool.name_ar : tool.name}
          </h3>
          <p className="text-zinc-500 text-sm leading-relaxed">{isArabic && tool.tagline_ar ? tool.tagline_ar : tool.tagline}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
          <Badge variant="muted">{isArabic ? translateCategory(tool.category) : tool.category}</Badge>
          {tool.available ? (
            <span className="text-xs text-zinc-400 font-medium">{isArabic ? "افتح الأداة →" : "Open tool →"}</span>
          ) : (
            <span className="text-xs text-zinc-600">{isArabic ? "قريبًا" : "Coming soon"}</span>
          )}
        </div>
      </div>
    </Card>
  );

  if (!tool.available) {
    return <div className="opacity-60 cursor-not-allowed">{cardContent}</div>;
  }

  return (
    <Link href={`/tools/${tool.slug}`} className="block group">
      {cardContent}
    </Link>
  );
}

export default ToolCard;

// ترجمة تصنيفات الأدوات للعربية (نفس دالة الصفحة)
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
