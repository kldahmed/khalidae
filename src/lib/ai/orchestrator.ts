import { AiRequest, AiProviderResult, AiResponse, AiError, AiProviderId } from './types';
import { getEnabledProviders, getProviderConfig, setProviderHealth, getProviderHealth } from './registry';
import { shouldFallback, makeFallbackDecision } from './fallback';
import { makeAiError } from './errors';
import { logAiEvent, logAiError, logAiResponse } from './logger';

import { callOpenAI } from './providers/openai';
import { callAnthropic } from './providers/anthropic';
import { callGemini } from './providers/gemini';

const PROVIDER_CALLS: Record<AiProviderId, (req: AiRequest, signal?: AbortSignal) => Promise<AiProviderResult>> = {
  openai: callOpenAI,
  anthropic: callAnthropic,
  gemini: callGemini,
};

function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }

export async function aiOrchestrator(request: AiRequest): Promise<AiProviderResult> {
  const providers = getEnabledProviders().sort((a, b) => a.priority - b.priority);
  let traceId = request.traceId || Math.random().toString(36).slice(2);
  let lastError: AiError | undefined;
  let fallbackUsed = false;
  let retryCount = 0;
  for (const provider of providers) {
    if (!PROVIDER_CALLS[provider.id]) continue;
    const health = getProviderHealth(provider.id);
    if (health?.circuitBreakerOpen && health.cooldownUntil && Date.now() < health.cooldownUntil) {
      logAiEvent('circuit_breaker_skip', { provider: provider.id, traceId });
      continue;
    }
    let model = request.model || provider.defaultModel;
    for (let attempt = 0; attempt < provider.retry; attempt++) {
      retryCount = attempt;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), provider.timeoutMs);
      const t0 = Date.now();
      let result: AiProviderResult;
      try {
        result = await PROVIDER_CALLS[provider.id](
          { ...request, model, provider: provider.id, traceId },
          controller.signal
        );
      } finally {
        clearTimeout(timeout);
      }
      const latency = Date.now() - t0;
      if (result.response) {
        logAiResponse({ ...result.response, latencyMs: latency, retryCount, traceId }, { provider: provider.id, model });
        setProviderHealth(provider.id, { healthy: true, degraded: false, lastChecked: Date.now(), circuitBreakerOpen: false });
        if (fallbackUsed) return { ...result, fallbackUsed: true, retryCount };
        return { ...result, retryCount };
      }
      if (result.error) {
        logAiError(result.error, { provider: provider.id, model, traceId, attempt });
        lastError = result.error;
        if (shouldFallback(result.error)) {
          await sleep(300 * (attempt + 1)); // exponential backoff
          continue;
        } else {
          break;
        }
      }
    }
    // Circuit breaker logic
    setProviderHealth(provider.id, { healthy: false, degraded: true, lastChecked: Date.now(), circuitBreakerOpen: true, cooldownUntil: Date.now() + 60000 });
    logAiEvent('circuit_breaker_open', { provider: provider.id, traceId });
    fallbackUsed = true;
  }
  // All providers failed
  logAiEvent('ai_fallback_failed', { traceId, lastError });
  return { error: lastError || makeAiError('unknown', 'All providers failed', { traceId }), fallbackUsed: true, retryCount };
}
