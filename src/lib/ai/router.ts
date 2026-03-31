
// Multi-LLM Router: OpenAI, Gemini, Anthropic
import { logAiEvent } from "@/lib/ai/logger";

type Provider = "openai" | "gemini" | "anthropic";

type RunAIResult = {
  provider: Provider;
  model: string;
  text: string;
};

const FALLBACK_MODELS: { provider: Provider; model: string }[] = [
  { provider: "openai", model: "gpt-4o-mini" },
  { provider: "openai", model: "gpt-3.5-turbo" },
  { provider: "gemini", model: "gemini-1.5-flash" },
  { provider: "anthropic", model: "claude-3-5-sonnet-20241022" },
];

// --- Provider Callers ---
async function callOpenAI(model: string, prompt: string): Promise<string> {
  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });
  return res.choices[0]?.message?.content ?? "";
}

async function callGemini(model: string, prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("No Gemini API key");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callAnthropic(model: string, prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("No Anthropic API key");
  const url = "https://api.anthropic.com/v1/messages";
  const body = {
    model,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// --- Main Router ---
export async function runAI(prompt: string): Promise<RunAIResult> {
  let lastError: unknown = undefined;
  for (const { provider, model } of FALLBACK_MODELS) {
    logAiEvent("ai_attempt_started", { provider, model });
    try {
      let text = "";
      if (provider === "openai") text = await callOpenAI(model, prompt);
      else if (provider === "gemini") text = await callGemini(model, prompt);
      else if (provider === "anthropic") text = await callAnthropic(model, prompt);
      logAiEvent("ai_provider_selected", { provider, model });
      return { provider, model, text };
    } catch (err) {
      logAiEvent("ai_error", { provider, model, error: err instanceof Error ? err.message : String(err) });
      lastError = err;
      // Fallback logic: skip to next model
      continue;
    }
  }
  logAiEvent("ai_fallback_failed", { error: lastError instanceof Error ? lastError.message : String(lastError) });
  throw new Error("All AI providers failed: " + (lastError instanceof Error ? lastError.message : "unknown error"));
}