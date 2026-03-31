import { AiRequest, AiProviderResult } from '../types';
import { makeAiError } from '../errors';

export async function callGemini(req: AiRequest, signal?: AbortSignal): Promise<AiProviderResult> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Logging skip reason
      console.log(JSON.stringify({ event: 'ai_provider_skipped', provider: 'gemini', reason: 'no_api_key', traceId: req.traceId }));
      return { error: makeAiError('access_denied', 'Missing Gemini API key', { provider: 'gemini' }) };
    }
    const model = req.model || process.env.AI_GEMINI_DEFAULT_MODEL || 'gemini-pro';
    // Logging: Gemini موجود في fallback chain
    console.log(JSON.stringify({ event: 'ai_provider_selected', provider: 'gemini', traceId: req.traceId }));
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: req.prompt }] }],
        generationConfig: {
          maxOutputTokens: req.maxTokens || 1024,
          temperature: req.temperature || 0.7,
        },
      }),
      signal,
    });
    if (!res.ok) {
      if (res.status === 404) return { error: makeAiError('model_not_found', 'Model not found', { provider: 'gemini', model }) };
      if (res.status === 401) return { error: makeAiError('access_denied', 'Access denied', { provider: 'gemini', model }) };
      if (res.status === 429) return { error: makeAiError('rate_limit', 'Rate limit', { provider: 'gemini', model }) };
      if (res.status >= 500) return { error: makeAiError('provider_unavailable', 'Gemini server error', { provider: 'gemini', model }) };
      return { error: makeAiError('unknown', `Gemini error: ${res.statusText}`, { provider: 'gemini', model }) };
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { error: makeAiError('malformed_response', 'No text in Gemini response', { provider: 'gemini', model }) };
    return {
      response: {
        text,
        model,
        provider: 'gemini',
        latencyMs: 0,
        traceId: req.traceId || '',
        retryCount: 0,
      },
    };
  } catch (e: unknown) {
    if (e.name === 'AbortError') return { error: makeAiError('timeout', 'Gemini request timeout', { provider: 'gemini' }) };
    return { error: makeAiError('network_failure', e.message || 'Network error', { provider: 'gemini' }) };
  }
}
