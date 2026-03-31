import { AiRequest, AiProviderResult } from '../types';
import { makeAiError } from '../errors';

export async function callAnthropic(req: AiRequest, signal?: AbortSignal): Promise<AiProviderResult> {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { error: makeAiError('access_denied', 'Missing Anthropic API key', { provider: 'anthropic' }) };
    // استخدم فقط النموذج المدعوم فعليًا
    const model = 'claude-3-sonnet-20240229';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: req.maxTokens || 1024,
        temperature: req.temperature || 0.7,
        messages: [{ role: 'user', content: req.prompt }],
      }),
      signal,
    });
    if (!res.ok) {
      if (res.status === 404) {
        // لا تعيد المحاولة، اعتبره fatal config error
        return { error: makeAiError('model_not_found', 'Model not found', { provider: 'anthropic', model, fatal: true, retryable: false }) };
      }
      if (res.status === 401) return { error: makeAiError('access_denied', 'Access denied', { provider: 'anthropic', model }) };
      if (res.status === 429) return { error: makeAiError('rate_limit', 'Rate limit', { provider: 'anthropic', model }) };
      if (res.status >= 500) return { error: makeAiError('provider_unavailable', 'Anthropic server error', { provider: 'anthropic', model }) };
      return { error: makeAiError('unknown', `Anthropic error: ${res.statusText}`, { provider: 'anthropic', model }) };
    }
    const data = await res.json();
    const text = data?.content?.[0]?.text || data?.content || data?.completion;
    if (!text) return { error: makeAiError('malformed_response', 'No text in Anthropic response', { provider: 'anthropic', model }) };
    return {
      response: {
        text,
        model,
        provider: 'anthropic',
        latencyMs: 0,
        traceId: req.traceId || '',
        retryCount: 0,
      },
    };
  } catch (e: any) {
    if (e.name === 'AbortError') return { error: makeAiError('timeout', 'Anthropic request timeout', { provider: 'anthropic' }) };
    return { error: makeAiError('network_failure', e.message || 'Network error', { provider: 'anthropic' }) };
  }
}
