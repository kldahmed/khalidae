import type { BrainContext, BrainPlan } from "./types";
import { PlannerLayer } from "./planner";
import { RetrievalLayer } from "./retrieval";

// طبقة التنسيق للذكاء الاصطناعي
export class OrchestratorLayer {
  private planner = new PlannerLayer();
  private retriever = new RetrievalLayer();

  orchestrate(ctx: BrainContext, prompt: string): BrainPlan {
    // تحليل النية
    const plan = this.planner.analyzeIntent(ctx, prompt);
    // استرجاع المعرفة ذات الصلة
    const related = this.retriever.retrieveRelevantKnowledge(ctx, prompt);
    plan.info += `\nRelevant: ${related.join(", ")}`;
    return plan;
  }
}
