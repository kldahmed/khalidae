// src/lib/agents/task-classifier.ts
// Task Classifier — يصنّف كل مهمة إلى FAST_PATH أو ORCHESTRATED

export type TaskType = "FAST_PATH" | "ORCHESTRATED";

export type FastPathTask =
  | "robots_txt"
  | "canonical"
  | "og_tags"
  | "invalid_date"
  | "meta_description"
  | "favicon";

export interface ClassifiedTask {
  type: TaskType;
  fastPathTask?: FastPathTask;
  assignedAgent?: "dev_agent" | "seo_agent";
  reason: string;
  originalInstruction: string;
}

const FAST_PATH_PATTERNS: Array<{
  pattern: RegExp;
  task: FastPathTask;
  agent: "dev_agent" | "seo_agent";
  reason: string;
}> = [
  {
    pattern: /robots\.txt/i,
    task: "robots_txt",
    agent: "dev_agent",
    reason: "تعديل مباشر على ملف robots.txt",
  },
  {
    pattern: /canonical/i,
    task: "canonical",
    agent: "seo_agent",
    reason: "إضافة أو تعديل canonical tag",
  },
  {
    pattern: /og[\s_-]?tags?|open[\s_-]?graph|og:title|og:desc|og:image/i,
    task: "og_tags",
    agent: "seo_agent",
    reason: "إضافة أو تعديل OG tags",
  },
  {
    pattern: /invalid[\s_-]?date|تاريخ[\s_-]?خاطئ|تاريخ[\s_-]?غير[\s_-]?صالح/i,
    task: "invalid_date",
    agent: "dev_agent",
    reason: "إصلاح مشكلة Invalid Date في الكود",
  },
  {
    pattern: /meta[\s_-]?desc/i,
    task: "meta_description",
    agent: "seo_agent",
    reason: "تعديل meta description",
  },
  {
    pattern: /favicon/i,
    task: "favicon",
    agent: "dev_agent",
    reason: "تعديل favicon",
  },
];

export function classifyTask(instruction: string): ClassifiedTask {
  const normalized = instruction.trim();

  for (const { pattern, task, agent, reason } of FAST_PATH_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        type: "FAST_PATH",
        fastPathTask: task,
        assignedAgent: agent,
        reason,
        originalInstruction: normalized,
      };
    }
  }

  return {
    type: "ORCHESTRATED",
    reason: "مهمة معقدة تحتاج orchestration كامل",
    originalInstruction: normalized,
  };
}

export function getFastPathLabel(task: FastPathTask): string {
  const labels: Record<FastPathTask, string> = {
    robots_txt: "robots.txt",
    canonical: "Canonical Tag",
    og_tags: "OG Tags",
    invalid_date: "Invalid Date Fix",
    meta_description: "Meta Description",
    favicon: "Favicon",
  };
  return labels[task];
}
