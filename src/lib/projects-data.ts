import type { Project } from "@/types";

export const projects: Project[] = [
  {
    slug: "khalidae-platform",
    name: "Khalidae Platform",
    nameAr: "منصة خالداي",
    description:
      "The personal digital lab and tools platform you are currently on. Built from scratch with Next.js, Tailwind CSS, and a modular architecture designed for long-term extensibility.",
    descriptionAr:
      "المختبر الرقمي الشخصي ومنصة الأدوات التي تستخدمها الآن. بُنيت من الصفر باستخدام Next.js وTailwind CSS وبنية معيارية مصممة للتوسع طويل الأمد.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    year: "2026",
    status: "active",
    url: "https://khalidae.com",
  },
  {
    slug: "link-intelligence",
    name: "Link Intelligence Engine",
    nameAr: "محرك ذكاء الروابط",
    description:
      "A server-side URL analysis engine capable of following redirect chains, inspecting HTTP headers, and scoring link health. Powers the Link Analyzer tool.",
    descriptionAr:
      "محرك لتحليل الروابط على جهة الخادم قادر على تتبع سلاسل إعادة التوجيه، وفحص ترويسات HTTP، وتقييم صحة الروابط. يشغّل أداة تحليل الروابط.",
    tags: ["TypeScript", "Node.js", "HTTP Analysis"],
    year: "2026",
    status: "active",
  },
  {
    slug: "metadata-pipeline",
    name: "Metadata Pipeline",
    nameAr: "خط أنابيب البيانات الوصفية",
    description:
      "A structured metadata extraction system for public URLs. Parses Open Graph, JSON-LD, Twitter Cards, and raw meta tags into a normalized schema.",
    descriptionAr:
      "نظام منظم لاستخراج البيانات الوصفية من الروابط العامة. يحلل Open Graph وJSON-LD وTwitter Cards ووسوم meta الخام إلى مخطط موحد.",
    tags: ["TypeScript", "Web Scraping", "Structured Data"],
    year: "2026",
    status: "experimental",
  },
  {
    slug: "design-system",
    name: "Khalidae Design System",
    nameAr: "نظام تصميم خالداي",
    description:
      "The internal design system and component library behind this platform. Dark-first, premium tokens, and a strict visual language built for long-term consistency.",
    descriptionAr:
      "نظام التصميم الداخلي ومكتبة المكونات خلف هذه المنصة. توجه بصري داكن أولاً، ورموز تصميم عالية الجودة، ولغة بصرية صارمة مبنية على الاتساق طويل الأمد.",
    tags: ["Design System", "Tailwind", "Tokens"],
    year: "2026",
    status: "experimental",
  },
];
