import type { CreateChatCompletionRequest, CreateChatCompletionResponse } from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment variables.");
}

const BASE_URL = "https://api.openai.com/v1";

export async function openaiChatCompletion(
  body: CreateChatCompletionRequest
): Promise<CreateChatCompletionResponse> {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  return (await response.json()) as CreateChatCompletionResponse;
}
