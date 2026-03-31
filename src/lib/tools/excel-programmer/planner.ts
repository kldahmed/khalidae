import { ExcelWorkbookSpec } from "./types";
import { runAI } from "@/lib/ai/router";
import { templates } from "./templates";
import { classifyExcelRequest } from "./classifier";
import { tryRulesEngine } from "./rules-engine";
import { getPlanningCache, setPlanningCache } from "./planning-cache";
import { logAiEvent } from "@/lib/ai/logger";

// Unified Excel planning with cost-saving, templates, rules, cache, and fallback
export async function planExcelWorkbook(prompt: string, locale: string = "ar", traceId?: string): Promise<ExcelWorkbookSpec> {
  const costMode = process.env.AI_COST_MODE || 'free_first';
  const enableTemplates = process.env.AI_ENABLE_TEMPLATES !== 'false';
  const enableRules = process.env.AI_ENABLE_RULES_ENGINE !== 'false';
  const enableCache = process.env.AI_ENABLE_CACHE !== 'false';
  const primaryLowCost = process.env.AI_PRIMARY_LOW_COST_PROVIDER || 'gemini';
  const premiumProvider = process.env.AI_PREMIUM_PROVIDER || 'openai';

  // 1. Cache check
  if (enableCache) {
    const cached = getPlanningCache(prompt);
    if (cached) {
      logAiEvent('cache_hit', { prompt, traceId });
      logAiEvent('cost_mode', { mode: 'free', traceId });
      return cached;
    } else {
      logAiEvent('cache_miss', { prompt, traceId });
    }
  }

  // 2. Classify request
  const reqClass = classifyExcelRequest(prompt);
  logAiEvent('request_classified', { prompt, reqClass, traceId });

  // 3. Template registry
  if (enableTemplates && reqClass === 'template_supported') {
    for (const key in templates) {
      if (prompt.toLowerCase().includes(key) || prompt.includes(templates[key].title)) {
        logAiEvent('template_matched', { template: key, traceId });
        logAiEvent('ai_bypassed_for_cost', { reason: 'template', traceId });
        logAiEvent('cost_mode', { mode: 'free', traceId });
        if (enableCache) setPlanningCache(prompt, templates[key]);
        return templates[key];
      }
    }
  }

  // 4. Rules engine
  if (enableRules && reqClass === 'rule_based') {
    const ruleSpec = tryRulesEngine(prompt);
    if (ruleSpec) {
      logAiEvent('rules_engine_used', { rule: ruleSpec.title, traceId });
      logAiEvent('ai_bypassed_for_cost', { reason: 'rules_engine', traceId });
      logAiEvent('cost_mode', { mode: 'free', traceId });
      if (enableCache) setPlanningCache(prompt, ruleSpec);
      return ruleSpec;
    }
  }

  // 5. AI fallback chain (economical)
  let aiProvider = primaryLowCost;
  let aiMode: 'low_cost' | 'premium' = 'low_cost';
  if (reqClass === 'ai_complex') {
    aiProvider = premiumProvider;
    aiMode = 'premium';
  }
  logAiEvent('provider_selected', { provider: aiProvider, reqClass, traceId });
  logAiEvent('cost_mode', { mode: aiMode, traceId });

  // 6. AI router call
  const aiPrompt = `أنت مساعد خبير في بناء ملفات Excel احترافية. المطلوب منك فقط إنتاج JSON من نوع ExcelWorkbookSpec التالي:\n{ title: string, locale: string, sheets: [ { name: string, columns: [{ header: string, key: string, type?: string }], rows: Array<Array<string|number|null>>, formulas?: Array<{ cell: string, formula: string }>, styles?: object, widths?: number[], filters?: { columns: string[] }, charts?: Array<{ type: string, dataRange: string }>, frozenRows?: number, summaryRows?: Array<Array<string|number|null>> } ] }\nلا تشرح، فقط أرجع JSON صالح. يجب أن يكون locale = "ar".\n${prompt}`;
  const ai = await runAI(aiPrompt);
  try {
    const parsed = JSON.parse(ai.text);
    if (enableCache) setPlanningCache(prompt, parsed);
    return parsed;
  } catch (e) {
    throw new Error("Malformed AI response: " + (e instanceof Error ? e.message : String(e)));
  }
}
