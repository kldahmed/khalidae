import { generateBrief } from "./generateBrief";
import { generateSeo } from "./generateSeo";
import { generateContentAngles } from "./generateContentAngles";
import { generateActionPlan } from "./generateActionPlan";
import { scoreReport } from "./scoreReport";

export async function analyzeInput(input: string, trace: string[]) {
  let mode: "url" | "text" = /^https?:\/\//.test(input) ? "url" : "text";
  let pageData: any = {};
  if (mode === "url") {
    trace.push("page_fetched");
    try {
      const res = await fetch(input);
      pageData.statusCode = res.status;
      pageData.finalUrl = res.url;
      pageData.html = await res.text();
      // Simple extraction (no jsdom)
      const extract = (re: RegExp) => {
        const m = pageData.html.match(re);
        return m ? m[1].trim() : null;
      };
      pageData.title = extract(/<title[^>]*>([^<]*)<\/title>/i);
      pageData.description = extract(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i);
      pageData.h1 = extract(/<h1[^>]*>([^<]*)<\/h1>/i);
      pageData.ogTitle = extract(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
      pageData.ogDescription = extract(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      pageData.ogImage = extract(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      pageData.canonical = extract(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
      pageData.bodyText = extract(/<body[^>]*>([\s\S]*?)<\/body>/i)?.replace(/<[^>]+>/g, " ") || "";
    } catch {
      pageData.error = "فشل جلب الصفحة";
    }
  }
  // For text, just pass input as bodyText
  if (mode === "text") {
    pageData.bodyText = input;
  }
  // Generate report sections
  const executiveBrief = await generateBrief(pageData);
  const strategicAnalysis = await generateBrief(pageData, true);
  const contentConversion = await generateContentAngles(pageData);
  const seo = await generateSeo(pageData);
  const actionPlan = await generateActionPlan(pageData);
  const scores = scoreReport(pageData, executiveBrief, strategicAnalysis, contentConversion, seo, actionPlan);
  return {
    executiveBrief,
    strategicAnalysis,
    contentConversion,
    seo,
    actionPlan,
    scores,
    mode,
    pageData,
  };
}
