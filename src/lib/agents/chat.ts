import { detectLanguage } from "@/lib/agents/runtime";

const CHAT_MODEL = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

function requireAnthropicKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("Missing required environment variable: ANTHROPIC_API_KEY");
  }
  return key;
}

export async function chatWithManager(message: string): Promise<string> {
  const apiKey = requireAnthropicKey();
  const language = detectLanguage(message);

  const system =
    language === "ar"
      ? `
أنت مساعد ذكي متقدم لموقع khalidae.com.
تحدث مع المستخدم مثل ChatGPT:
- طبيعي
- ذكي
- واضح
- مختصر عند الحاجة
- مفصل عند الحاجة
- لا تتكلم كنظام إدارة
- تعامل مع الرسائل كمحادثة طبيعية
- تكلم بالعربية إذا كانت الرسالة بالعربية
      `.trim()
      : `
You are an intelligent conversational assistant for khalidae.com.
Speak like ChatGPT:
- natural
- smart
- clear
- concise when needed
- detailed when needed
- respond conversationally
- answer in the same language as the user
      `.trim();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      max_tokens: 1200,
      system,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: message
            }
          ]
        }
      ]
    }),
    cache: "no-store"
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error("Anthropic chat failed: " + response.status + " " + raw);
  }

  const data = JSON.parse(raw) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const text = (data.content ?? [])
    .filter(b => b.type === "text" && typeof b.text === "string")
    .map(b => b.text as string)
    .join("\n")
    .trim();

  return text || "لم أتمكن من توليد رد.";
}