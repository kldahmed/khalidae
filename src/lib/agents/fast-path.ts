// src/lib/agents/fast-path.ts
// Fast Path Engine — تنفيذ مباشر للمهام البسيطة: read → patch → write

import { ClassifiedTask, FastPathTask } from "./task-classifier";

export interface FastPathStep {
  step: "read" | "patch" | "write";
  status: "pending" | "running" | "done" | "failed";
  detail: string;
  timestamp: number;
}

export interface FastPathResult {
  ok: boolean;
  task: FastPathTask;
  agent: string;
  steps: FastPathStep[];
  output: string;
  error?: string;
  durationMs: number;
  startedAt: number;
  completedAt: number;
}

export interface FastPathEvent {
  type:
    | "fast_path_start"
    | "fast_path_step"
    | "fast_path_complete"
    | "fast_path_error";
  task?: FastPathTask;
  step?: FastPathStep;
  result?: FastPathResult;
  message?: string;
  timestamp: number;
}

// الـ system prompt لكل مهمة fast path
function buildFastPathPrompt(classified: ClassifiedTask): string {
  const base = `أنت وكيل متخصص. نفّذ المهمة التالية مباشرةً بدون أسئلة.
تعليمة المالك: "${classified.originalInstruction}"

القواعد:
- اقرأ الملف المطلوب أولاً (read)
- طبّق التعديل المطلوب (patch)  
- اكتب الملف المعدَّل (write)
- أرسل تقريراً موجزاً بما تم فقط
- لا تسأل، نفّذ مباشرة`;

  const taskGuides: Record<FastPathTask, string> = {
    robots_txt: `
الملف المستهدف: public/robots.txt
القراءة: github_read_file على public/robots.txt
التعديل: أضف أو عدّل السطور المطلوبة
الكتابة: github_write_file على public/robots.txt`,

    canonical: `
الهدف: إضافة/تعديل canonical tag في layout.tsx أو في الصفحة المحددة
القراءة: اقرأ src/app/layout.tsx
التعديل: أضف <link rel="canonical" href="..."> في metadata أو Head
الكتابة: اكتب الملف المعدَّل`,

    og_tags: `
الهدف: إضافة/تعديل og:title, og:description, og:image
القراءة: اقرأ src/app/layout.tsx
التعديل: عدّل كائن metadata ليشمل openGraph كاملاً
الكتابة: اكتب الملف المعدَّل`,

    invalid_date: `
الهدف: إصلاح "Invalid Date" في الكود
القراءة: اقرأ الملفات التي تحتوي على date formatting (projects-data.ts, page.tsx)
التعديل: أصلح دالة التاريخ باستخدام:
  const safeDate = (d: string) => { try { const dt = new Date(d); return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("ar-SA"); } catch { return "—"; } }
الكتابة: اكتب الملف المعدَّل`,

    meta_description: `
الهدف: تعديل meta description
القراءة: اقرأ src/app/layout.tsx
التعديل: عدّل description في كائن metadata
الكتابة: اكتب الملف المعدَّل`,

    favicon: `
الهدف: تعديل/إضافة favicon
القراءة: اقرأ src/app/layout.tsx
التعديل: أضف icons في كائن metadata
الكتابة: اكتب الملف المعدَّل`,
  };

  return base + (taskGuides[classified.fastPathTask!] ?? "");
}

// بناء نتيجة FastPath من نتيجة الوكيل
export function buildFastPathResult(
  classified: ClassifiedTask,
  agentOutput: string,
  ok: boolean,
  startedAt: number,
  error?: string
): FastPathResult {
  const completedAt = Date.now();
  const steps: FastPathStep[] = [
    {
      step: "read",
      status: ok ? "done" : "failed",
      detail: `قراءة الملف المستهدف`,
      timestamp: startedAt,
    },
    {
      step: "patch",
      status: ok ? "done" : "failed",
      detail: `تطبيق التعديل على ${classified.fastPathTask}`,
      timestamp: startedAt + 100,
    },
    {
      step: "write",
      status: ok ? "done" : "failed",
      detail: `كتابة الملف المعدَّل`,
      timestamp: completedAt,
    },
  ];

  return {
    ok,
    task: classified.fastPathTask!,
    agent: classified.assignedAgent!,
    steps,
    output: agentOutput,
    error,
    durationMs: completedAt - startedAt,
    startedAt,
    completedAt,
  };
}

export { buildFastPathPrompt };
