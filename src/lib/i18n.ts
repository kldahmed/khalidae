export type Locale = "en" | "ar";

export const defaultLocale: Locale = "en";

export const translations = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      tools: "Tools",
      projects: "Projects",
      contact: "Contact",
    },
    home: {
      tagline: "Personal Digital Platform",
      description: "A personal digital platform built for deep work, sharp tools, and long-term technical ownership.",
      cta: "Start a Conversation",
      explore: "Explore Tools",
      viewProjects: "View Projects",
      openTo: "Open to serious collaborations, platform partnerships, and interesting technical work.",
    },
    about: {
      label: "Identity",
      title: "About Khalidae",
      p1: "Khalidae is a personal digital platform — a private digital property built from the ground up with intention, precision, and a long time horizon.",
      p2: "This is not a portfolio. It does not exist to impress hiring managers or collect social proof. It exists as a base of operations: a place to build, ship, and own things that matter.",
      p3: "The platform is part utility lab, part technical journal, part identity anchor. Every tool, page, and piece of infrastructure here is built to serve a real purpose — and designed to last.",
      missionLabel: "Mission",
      missionTitle: "What This Is Building",
      missionSub: "Khalidae is building a personal technology platform with a clear long-term mandate: own the infrastructure, own the tools, own the identity.",
      m1: "The platform starts with practical tools — utilities for link analysis, metadata inspection, text processing, and profile generation. These are real-use tools built to a high standard, not demos.",
      m2: "Over time, the platform will expand into more sophisticated services: productivity systems, data pipelines, content utilities, and eventually monetizable micro-products. Everything is designed with modularity so expansion happens cleanly.",
      m3: "The underlying architecture is built to scale — both technically and as a brand. Khalidae is a name with a long future.",
      pillarsLabel: "Principles",
      pillarsTitle: "Operating Pillars",
      pillars: [
        { label: "Deep Work Infrastructure", description: "Tools and systems built to reduce friction for focused, high-leverage work. No noise. No clutter." },
        { label: "Personal Digital Ownership", description: "Operating from owned infrastructure — not rented land. This domain and platform are long-term property." },
        { label: "Technical Utility", description: "Building real tools that solve real problems. Each utility starts from a genuine personal need." },
        { label: "Long-Horizon Thinking", description: "Architecture decisions, brand identity, and product direction are all built for a multi-year trajectory." },
      ],
      visionLabel: "Vision",
      visionTitle: "The Long Game",
      v1: "The goal is not to build the largest platform, but to build the most deliberate one. Every decision — technical, visual, and strategic — is made with a five-year minimum perspective.",
      v2: "Digital real estate compounds. A strong domain, a consistent brand, and a catalog of genuinely useful tools creates something difficult to replicate. That is what Khalidae is building toward.",
      v3: "This platform will remain deeply personal — not a faceless SaaS, not a generic blog. It will carry the fingerprint of the person who built it, and grow accordingly.",
    },
    tools: {
      label: "Utilities",
      title: "Tools",
      description: "A growing catalog of precision-built web tools. Each utility is built to a production standard with a clear, single-purpose design.",
      open: "Open tool",
    },
    projects: {
      label: "Work",
      title: "Projects",
      description: "Technical experiments, platform initiatives, and infrastructure built under the Khalidae banner. Built to last.",
      direction: "Direction",
      directionDescription: "Every project here is a module in a larger system. The platform, the tools, the design system - they compound. New experiments get added as they reach a state worth sharing.",
      status: {
        active: "Active",
        experimental: "Experimental",
        live: "Live",
        inProgress: "In Progress",
        archived: "Archived",
      },
    },
    contact: {
      label: "Contact",
      title: "Start a Conversation",
      description: "Open to serious collaborations, platform partnerships, and interesting technical work.",
      namePlaceholder: "Your name",
      emailPlaceholder: "your@email.com",
      messagePlaceholder: "What would you like to discuss?",
      send: "Send Message",
      sending: "Sending...",
      successTitle: "Message sent.",
      successDesc: "I'll get back to you within a few days.",
    },
    footer: {
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      rights: "All rights reserved.",
    },
  },
  ar: {
    nav: {
      home: "الرئيسية",
      about: "من أنا",
      tools: "الأدوات",
      projects: "المشاريع",
      contact: "تواصل",
    },
    home: {
      tagline: "منصة رقمية شخصية",
      description: "منصة رقمية شخصية مبنية للعمل العميق، والأدوات الحادة، والملكية التقنية طويلة الأمد.",
      cta: "ابدأ محادثة",
      explore: "استكشف الأدوات",
      viewProjects: "استعرض المشاريع",
      openTo: "منفتح على التعاونات الجادة، وشراكات المنصات، والعمل التقني المثير للاهتمام.",
    },
    about: {
      label: "الهوية",
      title: "عن خالداي",
      p1: "خالداي منصة رقمية شخصية — ملكية رقمية خاصة مبنية من الصفر بنية وتركيز وأفق زمني بعيد.",
      p2: "هذه ليست محفظة أعمال. لا توجد لإبهار مديري التوظيف أو جمع الإثباتات الاجتماعية. توجد كقاعدة عمليات: مكان للبناء والإطلاق وامتلاك الأشياء المهمة.",
      p3: "المنصة جزء مختبر أدوات، وجزء مجلة تقنية، وجزء مرساة هوية. كل أداة وصفحة وبنية تحتية هنا مبنية لتخدم غرضاً حقيقياً — ومصممة للبقاء.",
      missionLabel: "المهمة",
      missionTitle: "ما الذي نبنيه",
      missionSub: "يبني خالداي منصة تقنية شخصية بتوجيه واضح طويل الأمد: امتلك البنية التحتية، امتلك الأدوات، امتلك الهوية.",
      m1: "تبدأ المنصة بأدوات عملية — أدوات لتحليل الروابط وفحص البيانات الوصفية ومعالجة النصوص. هذه أدوات استخدام حقيقية مبنية بمعايير عالية، وليست عروضاً توضيحية.",
      m2: "بمرور الوقت، ستتوسع المنصة إلى خدمات أكثر تطوراً: أنظمة إنتاجية، وخطوط بيانات، وأدوات محتوى، وفي نهاية المطاف منتجات صغيرة قابلة للتحقيق. كل شيء مصمم بمرونة.",
      m3: "البنية التحتية الأساسية مبنية للتوسع — تقنياً وكعلامة تجارية. خالداي اسم له مستقبل طويل.",
      pillarsLabel: "المبادئ",
      pillarsTitle: "ركائز العمل",
      pillars: [
        { label: "بنية العمل العميق", description: "أدوات وأنظمة مبنية لتقليل الاحتكاك للعمل المركّز عالي التأثير. لا ضوضاء. لا فوضى." },
        { label: "الملكية الرقمية الشخصية", description: "العمل من بنية تحتية مملوكة — لا أرض مستأجرة. هذا النطاق والمنصة ملكية طويلة الأمد." },
        { label: "الأداة التقنية", description: "بناء أدوات حقيقية تحل مشاكل حقيقية. كل أداة تبدأ من حاجة شخصية حقيقية." },
        { label: "التفكير بعيد الأفق", description: "قرارات الهندسة المعمارية وهوية العلامة التجارية وتوجيه المنتج كلها مبنية لمسار متعدد السنوات." },
      ],
      visionLabel: "الرؤية",
      visionTitle: "اللعبة الطويلة",
      v1: "الهدف ليس بناء أكبر منصة، بل بناء أكثرها تعمداً. كل قرار — تقني وبصري واستراتيجي — يُتخذ بمنظور خمس سنوات كحد أدنى.",
      v2: "العقارات الرقمية تتراكم. نطاق قوي وعلامة تجارية متسقة وكتالوج من الأدوات المفيدة حقاً يخلق شيئاً يصعب تكراره. هذا ما يبنيه خالداي.",
      v3: "ستظل هذه المنصة شخصية للغاية — ليست SaaS بلا وجه، وليست مدونة عامة. ستحمل بصمة من بناها، وتنمو وفقاً لذلك.",
    },
    tools: {
      label: "الأدوات",
      title: "الأدوات",
      description: "كتالوج متنامٍ من أدوات الويب المبنية بدقة. كل أداة مبنية بمعايير إنتاجية بتصميم واضح وأحادي الغرض.",
      open: "فتح الأداة",
    },
    projects: {
      label: "عمل",
      title: "المشاريع",
      description: "تجارب تقنية ومبادرات منصة وبنية تحتية تحت راية خالداي. مبنية لتدوم.",
      direction: "الاتجاه",
      directionDescription: "كل مشروع هنا هو وحدة في نظام أكبر. المنصة والأدوات ونظام التصميم - تتراكم. تُضاف تجارب جديدة حين تصل لمستوى يستحق المشاركة.",
      status: {
        active: "نشط",
        experimental: "تجريبي",
        live: "مباشر",
        inProgress: "قيد التطوير",
        archived: "مؤرشف",
      },
    },
    contact: {
      label: "تواصل",
      title: "ابدأ محادثة",
      description: "منفتح على التعاونات الجادة وشراكات المنصات والعمل التقني المثير للاهتمام.",
      namePlaceholder: "اسمك",
      emailPlaceholder: "بريدك@الإلكتروني.com",
      messagePlaceholder: "ما الذي تريد مناقشته؟",
      send: "إرسال الرسالة",
      sending: "جارٍ الإرسال...",
      successTitle: "تم إرسال الرسالة.",
      successDesc: "سأرد عليك خلال بضعة أيام.",
    },
    footer: {
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
      rights: "جميع الحقوق محفوظة.",
    },
  },
};

export function t(locale: Locale, key: string): string {
  const keys = key.split(".");
  let value: unknown = translations[locale];
  for (const k of keys) {
    if (typeof value === "object" && value !== null) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  return typeof value === "string" ? value : key;
}
