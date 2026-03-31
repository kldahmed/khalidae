import type { BrainKnowledge } from "./types";

// طبقة المعرفة للذكاء الاصطناعي
export class KnowledgeLayer {
  private knowledge: BrainKnowledge = { tools: [], agents: [] };

  setKnowledge(k: BrainKnowledge) {
    this.knowledge = k;
  }

  getKnowledge(): BrainKnowledge {
    return this.knowledge;
  }
}
