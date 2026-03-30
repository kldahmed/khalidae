import { openaiChatCompletion } from "./openai-client";

export async function analyzeSite(prompt: string, context: string = ""): Promise<string> {
  const completion = await openaiChatCompletion({
    model: "gpt-4-1106-preview",
    messages: [
      { role: "system", content: "أنت مدير موقع ذكي، تحلل حالة الموقع وتلخص الأخطاء وتقترح إصلاحات عملية بناءً على مدخلات المستخدم وسجلات الصحة." },
      { role: "user", content: `${prompt}\n\n${context}` }
    ],
    max_tokens: 700,
    temperature: 0.2
  });
  return completion.choices[0]?.message?.content || "No analysis returned.";
}
