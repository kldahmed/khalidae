import { NextRequest, NextResponse } from "next/server";


async function fetchWithRedirects(url: string, maxRedirects = 5) {
  let currentUrl = url;
  let chain = [];
  let statusCode = 0;
  for (let i = 0; i < maxRedirects; i++) {
    const res = await fetch(currentUrl, { redirect: "manual" });
    statusCode = res.status;
    chain.push(currentUrl);
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      currentUrl = new URL(res.headers.get("location")!, currentUrl).toString();
    } else {
      break;
    }
  }
  return { finalUrl: currentUrl, chain, statusCode };
}

function extractMetaFromHtml(html: string) {
  // Helper to extract content from <meta ...> or <link ...>
  const meta = (name: string, attr = 'name') => {
    const re = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i');
    const m = html.match(re);
    return m ? m[1] : null;
  };
  const metaProp = (prop: string) => meta(prop, 'property');
  const link = (rel: string) => {
    const re = new RegExp(`<link[^>]+rel=["']${rel}["'][^>]*href=["']([^"']+)["']`, 'i');
    const m = html.match(re);
    return m ? m[1] : null;
  };
  const tagText = (tag: string) => {
    const re = new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`, 'i');
    const m = html.match(re);
    return m ? m[1].trim() : null;
  };
  const firstTagText = (tag: string) => {
    const re = new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`, 'i');
    const m = html.match(re);
    return m ? m[1].trim() : null;
  };
  // Word count and body text
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyText = bodyMatch ? bodyMatch[1].replace(/<[^>]+>/g, ' ') : '';
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  // CTA detection
  const cta = /تواصل|اشترك|سجل|ابدأ|جرب|احصل|contact|subscribe|register|start|try|get/i.test(bodyText) ? "موجود" : null;
  // Readability
  const readability = getReadability(bodyText);
  return {
    title: tagText('title'),
    metaDescription: meta('description'),
    ogTitle: metaProp('og:title'),
    ogDescription: metaProp('og:description'),
    ogImage: metaProp('og:image'),
    twitterCard: meta('twitter:card'),
    canonical: link('canonical'),
    robots: meta('robots'),
    h1: firstTagText('h1'),
    h2: firstTagText('h2'),
    wordCount,
    cta,
    readability,
  };
}

function getReadability(text: string) {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?؟]/).length;
  const syllables = text.split(/[aeiouyأوي]/i).length;
  const flesch = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  if (flesch > 80) return "سهل جدًا";
  if (flesch > 60) return "سهل";
  if (flesch > 30) return "متوسط";
  return "صعب";
}

function score(meta: any) {
  let seo = 0, social = 0, technical = 0, content = 0;
  // SEO (30)
  if (meta.title) seo += 10;
  if (meta.metaDescription) seo += 8;
  if (meta.canonical) seo += 4;
  if (meta.robots) seo += 2;
  if (meta.h1s.length) seo += 4;
  if (meta.h2s.length) seo += 2;
  // Social (20)
  if (meta.ogTitle) social += 6;
  if (meta.ogDescription) social += 6;
  if (meta.ogImage) social += 6;
  if (meta.twitterCard) social += 2;
  // Technical (20)
  if (meta.statusCode === 200) technical += 10;
  if (meta.redirectChain.length === 1) technical += 6;
  if (meta.robots) technical += 2;
  if (meta.canonical) technical += 2;
  // Content (30)
  if (meta.wordCount > 300) content += 10;
  if (meta.readability === "سهل جدًا" || meta.readability === "سهل") content += 8;
  if (meta.cta) content += 6;
  if (meta.h1s.length && meta.h2s.length) content += 6;
  return { seo, social, technical, content };
}

async function aiRecommendations(meta: any) {
  // Placeholder: In production, call OpenAI or similar
  const recs = [];
  if (!meta.title) recs.push("أضف عنوانًا واضحًا للصفحة.");
  if (meta.title && meta.title.length < 30) recs.push("قم بتقوية عنوان الصفحة ليكون أكثر جاذبية.");
  if (!meta.metaDescription) recs.push("أضف وصفًا ميتا للصفحة.");
  if (meta.metaDescription && meta.metaDescription.length < 50) recs.push("اجعل وصف الصفحة أكثر تفصيلًا وجاذبية.");
  if (!meta.ogImage) recs.push("أضف صورة Open Graph لزيادة جاذبية المشاركة الاجتماعية.");
  if (!meta.cta) recs.push("أضف دعوة واضحة لاتخاذ إجراء (CTA) في الصفحة.");
  if (meta.readability === "صعب") recs.push("حسّن قابلية القراءة بتبسيط الجمل وتقسيم الفقرات.");
  if (!meta.twitterCard) recs.push("أضف وسم Twitter Card لدعم المشاركة على تويتر.");
  return recs.length ? recs : ["الصفحة ممتازة ولا تحتاج تحسينات كبيرة!"];
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || !/^https?:\/\//.test(url)) {
      return NextResponse.json({ error: "رابط غير صالح" }, { status: 400 });
    }
    const { finalUrl, chain, statusCode } = await fetchWithRedirects(url);
    const html = await fetch(finalUrl).then(r => r.text());
    const meta = extractMetaFromHtml(html);
    (meta as any).statusCode = statusCode;
    (meta as any).redirectChain = chain;
    const scores = score(meta);
    const overviewScore = scores.seo + scores.social + scores.technical + scores.content;
    const aiRecs = await aiRecommendations(meta);
    return NextResponse.json({
      overviewScore,
      scores,
      data: meta,
      aiRecommendations: aiRecs,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "خطأ غير متوقع" }, { status: 500 });
  }
}
