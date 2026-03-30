import { createSiteManagerCompletion, SiteManagerMessage } from "./openai-client";

export async function analyzeSite(prompt: string, context: string = ""): Promise<string> {
  const messages: SiteManagerMessage[] = [
    { role: "system", content: "أنت مدير موقع ذكي، تحلل حالة الموقع وتلخص الأخطاء وتقترح إصلاحات عملية بناءً على مدخلات المستخدم وسجلات الصحة." },
    { role: "user", content: `${prompt}\n\n${context}` }
  ];
  return createSiteManagerCompletion(messages, "gpt-4-1106-preview");
}
