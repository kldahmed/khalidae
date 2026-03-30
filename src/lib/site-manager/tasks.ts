import { openaiChatCompletion } from "./openai-client";

export async function executeSiteTask(task: string, context: string = ""): Promise<string> {
  const completion = await openaiChatCompletion({
    model: "gpt-4-1106-preview",
    messages: [
      { role: "system", content: "أنت مدير موقع ذكي، تنفذ مهام صيانة آمنة فقط عند الطلب الصريح، وتشرح كل خطوة باختصار." },
      { role: "user", content: `${task}\n\n${context}` }
    ],
    max_tokens: 700,
    temperature: 0.2
  });
  return completion.choices[0]?.message?.content || "No task result returned.";
}
