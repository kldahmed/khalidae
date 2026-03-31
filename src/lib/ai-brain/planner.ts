import type { BrainContext, BrainPlan } from "./types";

// طبقة التخطيط للذكاء الاصطناعي
export class PlannerLayer {
  analyzeIntent(ctx: BrainContext, prompt: string): BrainPlan {
    // تحليل مبسط للنية
    let intent = "general";
    let tool: string | undefined;
    let agent: string | undefined;
    if (/إكسل|excel|جدول/i.test(prompt)) {
      intent = "excel";
      tool = "excel-programmer";
    } else if (/مدير|إدارة|manager/i.test(prompt)) {
      intent = "manager";
      agent = "site-manager";
    }
    return {
      intent,
      tool,
      agent,
      steps: ["تحليل الطلب", "اختيار الأداة/الوكيل", "تنفيذ المهمة"],
      info: `Intent: ${intent}`
    };
  }
}
