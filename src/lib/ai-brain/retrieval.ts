import type { BrainContext } from "./types";

// طبقة الاسترجاع للذكاء الاصطناعي
export class RetrievalLayer {
  retrieveRelevantKnowledge(ctx: BrainContext, query: string): string[] {
    // استرجاع الأدوات أو المعلومات ذات الصلة
    const results: string[] = [];
    if (ctx.knowledge?.tools) {
      results.push(...ctx.knowledge.tools.filter(t => t.name.includes(query) || t.description.includes(query)).map(t => t.name));
    }
    if (ctx.knowledge?.agents) {
      results.push(...ctx.knowledge.agents.filter(a => a.name.includes(query) || a.description.includes(query)).map(a => a.name));
    }
    return results;
  }
}
