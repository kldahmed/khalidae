import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export type SiteManagerMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function createSiteManagerCompletion(
  messages: SiteManagerMessage[],
  model = "gpt-4o-mini",
): Promise<string> {
  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.2,
  });

  return response.choices[0]?.message?.content ?? "";
}