import { detectLanguage } from "@/lib/agents/runtime";

const CHAT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
function requireAnthropicKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("Missing required environment variable: ANTHROPIC_API_KEY");
  }
  return key;
}

type AnthropicChatResponse = {
  content?: Array<{
    type: string;
    text?: string;
  }>;
};

export async function chatWithManager(message: string): Promise<string> {
  const apiKey = requireAnthropicKey();
  const language = detectLanguage(message);

  const system =
    language === "ar"
      ? `
أنت مساعد ذكي وودود لموقع khalidae.com.
تحدث مثل ChatGPT:
- طبيعي
- واضح
- ذكي
- مختصر عند الحاجة
- مفصل عند الحاجة
أجب بالعربية إذا كانت الرسالة بالعربية.
      `.trim()
      : `
You are an intelligent and friendly assistant for khalidae.com.
Speak like ChatGPT:
- natural
- clear
- smart
- concise when needed
- detailed when needed
Reply in the same language as the user.
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
              text: message,
            },
          ],
        },
      ],
    }),
    cache: "no-store",
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`Anthropic chat failed: ${response.status} ${raw}`);
  }

  const data = JSON.parse(raw) as AnthropicChatResponse;

  const text = (data.content ?? [])
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text as string)
    .join("\n")
    .trim();

  return text || "لم أتمكن من توليد رد.";
}