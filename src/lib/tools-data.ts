import type { Tool } from "@/types";

export const tools: Tool[] = [
  {
    slug: "excel-programmer",
    name: "Excel Intelligence Engine",
    name_ar: "مُبرمج الإكسل الذكي",
    tagline: "AI-powered Excel file builder.",
    tagline_ar: "أنشئ ملفات Excel احترافية تلقائياً باستخدام الذكاء.",
    description: "Generate, validate, and download advanced Excel workbooks using AI. Supports formulas, multiple sheets, formatting, and more.",
    description_ar: "أنشئ، تحقق، وحمّل ملفات Excel متقدمة باستخدام الذكاء الاصطناعي. يدعم الصيغ، أوراق متعددة، تنسيقات، وأكثر.",
    category: "productivity",
    available: true,
    featured: true,
    icon: "🤖",
  },
  {
    slug: "page-auditor",
    name: "AI Page Auditor",
    name_ar: "المدقق الذكي للصفحات",
    tagline: "Audit any web page for SEO, social, and technical quality.",
    tagline_ar: "حلل أي صفحة ويب — SEO، سوشيال، تقني، محتوى، وتوصيات AI.",
    description: "Analyze any public web page for SEO, Open Graph, Twitter Card, HTTP status, content quality, and get AI-powered improvement recommendations. Includes scoring and detailed report.",
    description_ar: "حلل أي صفحة ويب عامة: SEO، Open Graph، Twitter Card، الحالة التقنية، جودة المحتوى، واحصل على توصيات ذكية بالذكاء الاصطناعي. يشمل نظام نقاط وتقرير مفصل.",
    category: "link",
    available: true,
    icon: "🧠",
    featured: true,
  },
  {
    slug: "link-analyzer",
    name: "Link Analyzer",
    name_ar: "محلل الروابط",
    tagline: "Inspect any URL — headers, redirects, status codes.",
    tagline_ar: "تحليل أي رابط — رؤوس HTTP، التحويلات، وأكواد الحالة.",
    description:
      "Analyze the technical properties of any public URL. View HTTP headers, redirect chains, response status codes, and basic performance indicators. Useful for debugging, SEO auditing, and link validation.",
    description_ar:
      "حلل الخصائص التقنية لأي رابط عام. اعرض رؤوس HTTP، سلاسل التحويلات، أكواد الاستجابة، ومؤشرات الأداء الأساسية. مفيد لتصحيح الأخطاء، تدقيق SEO، والتحقق من الروابط.",
    category: "link",
    available: true,
    icon: "🔗",
  },
  {
    slug: "metadata-viewer",
    name: "Metadata Viewer",
    name_ar: "عارض البيانات الوصفية",
    tagline: "Extract open graph, Twitter card, and page metadata.",
    tagline_ar: "استخرج بيانات Open Graph، Twitter Card، وبيانات الصفحة الوصفية.",
    description:
      "Paste any public URL to extract page metadata including Open Graph tags, Twitter Card data, canonical URLs, and structured title/description. Ideal for auditing how a page presents itself across platforms.",
    description_ar:
      "الصق أي رابط عام لاستخراج بيانات الصفحة الوصفية بما في ذلك وسوم Open Graph، بيانات Twitter Card، الروابط القانونية، والعنوان/الوصف المنظم. مثالي لتدقيق ظهور الصفحة عبر المنصات.",
    category: "link",
    available: true,
    icon: "🔍",
  },
  {
    slug: "text-utilities",
    name: "Text Utilities",
    name_ar: "أدوات النصوص",
    tagline: "Transform, clean, and analyze text in seconds.",
    tagline_ar: "حوّل، نظّف، وحلل النصوص في ثوانٍ.",
    description:
      "A suite of text processing utilities: word count, character count, case conversion, whitespace normalization, line deduplication, JSON formatting, and base64 encoding/decoding. No data leaves your browser.",
    description_ar:
      "مجموعة أدوات لمعالجة النصوص: عد الكلمات، عد الأحرف، تحويل الحروف، تنسيق المسافات، إزالة التكرار، تنسيق JSON، وترميز/فك Base64. لا يغادر أي نص متصفحك.",
    category: "text",
    available: true,
    icon: "✏️",
  },
  {
    slug: "card-generator",
    name: "Profile Card Generator",
    name_ar: "مولد بطاقة الهوية",
    tagline: "Generate shareable identity cards from your profile data.",
    tagline_ar: "أنشئ بطاقات هوية قابلة للمشاركة من بياناتك الشخصية.",
    description:
      "Create clean, visually polished profile cards from your data. Enter a name, bio, and links — get a styled card optimized for sharing. Exported as downloadable image or clipboard-ready HTML embed.",
    description_ar:
      "أنشئ بطاقات هوية أنيقة من بياناتك. أدخل الاسم، النبذة، والروابط — واحصل على بطاقة مصممة للمشاركة. يمكن تصديرها كصورة أو كود HTML للنسخ.",
    category: "profile",
    available: true,
    icon: "🪪",
  },
  {
    slug: "image-utilities",
    name: "Image Utilities",
    name_ar: "أدوات الصور",
    tagline: "Inspect image metadata, dimensions, and color data.",
    tagline_ar: "افحص بيانات الصورة، الأبعاد، والألوان.",
    description:
      "Upload or link to an image to inspect its dimensions, color palette, EXIF metadata (where available), and format properties. All processing happens client-side — no image data is stored or transmitted.",
    description_ar:
      "ارفع أو اربط صورة لفحص أبعادها، لوحة ألوانها، بيانات EXIF (إن وجدت)، وخصائص التنسيق. كل المعالجة تتم محليًا — لا يتم تخزين أو إرسال أي بيانات صورة.",
    category: "image",
    available: false,
    comingSoon: true,
    icon: "🖼️",
  },
  {
    slug: "media-utility-center",
    name: "Media Utility Center",
    name_ar: "مركز أدوات الوسائط",
    tagline: "Compliant media link inspection and embed preview.",
    tagline_ar: "فحص روابط الوسائط ومعاينة التضمين بشكل متوافق.",
    description:
      "A lawful media utility for inspecting publicly shared links, previewing embeds, extracting metadata where permitted, and managing your own authorized content workflows. This tool operates fully within platform terms and applicable law.",
    description_ar:
      "أداة وسائط قانونية لفحص الروابط العامة، معاينة التضمين، استخراج البيانات الوصفية حيثما يسمح، وإدارة تدفقات المحتوى المصرح بها. تعمل الأداة ضمن شروط المنصة والقانون.",
    category: "media",
    available: false,
    comingSoon: true,
    icon: "📡",
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: string): Tool[] {
  return tools.filter((t) => t.category === category);
}

export const toolCategories: { value: Tool["category"]; label: string }[] = [
  { value: "link", label: "Link & URL" },
  { value: "text", label: "Text" },
  { value: "image", label: "Image" },
  { value: "file", label: "File" },
  { value: "productivity", label: "Productivity" },
  { value: "media", label: "Media Utilities" },
  { value: "profile", label: "Profile & Identity" },
];
