// أنواع الذكاء الاصطناعي الأساسية للـ AI Brain

export interface BrainContext {
  userId?: string;
  sessionId?: string;
  locale?: string;
  currentTask?: string;
  memory?: BrainMemory;
  knowledge?: BrainKnowledge;
}

export interface BrainMemory {
  recentCommands: string[];
  lastResults: string[];
  sessionContext?: Record<string, any>;
}

export interface BrainKnowledge {
  tools: Array<{ slug: string; name: string; description: string }>;
  agents: Array<{ name: string; description: string }>;
  docs?: string[];
  healthReports?: string[];
}

export interface BrainPlan {
  intent: string;
  tool?: string;
  agent?: string;
  steps: string[];
  info?: string;
}
