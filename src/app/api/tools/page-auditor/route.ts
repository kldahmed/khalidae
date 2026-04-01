import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";

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

function extractMeta(dom: JSDOM) {
  const doc = dom.window.document;
  const get = (selector: string) => doc.querySelector(selector)?.getAttribute("content") || null;
  return {
    title: doc.querySelector("title")?.textContent || null,
    metaDescription: get('meta[name="description"]'),
    ogTitle: get('meta[property="og:title"]'),
    ogDescription: get('meta[property="og:description"]'),
    ogImage: get('meta[property="og:image"]'),
    twitterCard: get('meta[name="twitter:card"]'),
    canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute("href") || null,
    robots: get('meta[name="robots"]'),
    h1s: Array.from(doc.querySelectorAll("h1")).map(h => h.textContent?.trim() || ""),
    h2s: Array.from(doc.querySelectorAll("h2")).map(h => h.textContent?.trim() || ""),
    wordCount: doc.body.textContent?.split(/\s+/).length || 0,
    cta: /تواصل|اشترك|سجل|ابدأ|جرب|احصل|contact|subscribe|register|start|try|get/i.test(doc.body.textContent || "") ? "موجود" : null,
    readability: getReadability(doc.body.textContent || ""),
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
    const dom = new JSDOM(html);
    const meta = extractMeta(dom);
    meta.statusCode = statusCode;
    meta.redirectChain = chain;
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
