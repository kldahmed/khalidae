import { AiRequest, AiProviderResult } from '../types';
import { makeAiError } from '../errors';

export async function callOpenAI(req: AiRequest, signal?: AbortSignal): Promise<AiProviderResult> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return { error: makeAiError('access_denied', 'Missing OpenAI API key', { provider: 'openai' }) };
    let model = req.model || process.env.AI_OPENAI_DEFAULT_MODEL || 'gpt-4o';
    let triedBackup = false;
    let res, data, text;
    for (let attempt = 0; attempt < 2; attempt++) {
      res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: req.prompt }],
          max_tokens: req.maxTokens || 1024,
          temperature: req.temperature || 0.7,
        }),
        signal,
      });
      if (!res.ok) {
        if (res.status === 404) return { error: makeAiError('model_not_found', 'Model not found', { provider: 'openai', model }) };
        if (res.status === 401) return { error: makeAiError('access_denied', 'Access denied', { provider: 'openai', model }) };
        if (res.status === 429 && !triedBackup && model === 'gpt-4o') {
          // جرب نموذج أخف
          model = 'gpt-3.5-turbo';
          triedBackup = true;
          continue;
        }
        if (res.status === 429) return { error: makeAiError('rate_limit', 'Rate limit', { provider: 'openai', model }) };
        if (res.status >= 500) return { error: makeAiError('provider_unavailable', 'OpenAI server error', { provider: 'openai', model }) };
        return { error: makeAiError('unknown', `OpenAI error: ${res.statusText}`, { provider: 'openai', model }) };
      }
      data = await res.json();
      text = data?.choices?.[0]?.message?.content;
      if (!text) return { error: makeAiError('malformed_response', 'No text in OpenAI response', { provider: 'openai', model }) };
      return {
        response: {
          text,
          model,
          provider: 'openai',
          latencyMs: 0, // set by orchestrator
          traceId: req.traceId || '',
          retryCount: 0,
        },
      };
    }
    // إذا لم ينجح أي نموذج
    return { error: makeAiError('rate_limit', 'Rate limit', { provider: 'openai', model }) };
  } catch (e: any) {
    if (e.name === 'AbortError') return { error: makeAiError('timeout', 'OpenAI request timeout', { provider: 'openai' }) };
    return { error: makeAiError('network_failure', e.message || 'Network error', { provider: 'openai' }) };
  }
}
