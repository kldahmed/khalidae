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
  const traceId = request.traceId || Math.random().toString(36).slice(2);
  let lastError: AiError | undefined;
  let fallbackUsed = false;
  let retryCount = 0;
  let providerSelected = false;
  let geminiAttempted = false;
  for (const provider of providers) {
    if (!PROVIDER_CALLS[provider.id]) continue;
    const health = getProviderHealth(provider.id);
    let skipReason = '';
    if (!provider.enabled) skipReason = 'disabled';
    else if (!process.env[`${provider.id.toUpperCase()}_API_KEY`]) skipReason = 'no_api_key';
    else if (health?.circuitBreakerOpen && health.cooldownUntil && Date.now() < health.cooldownUntil) skipReason = 'unhealthy';
    if (skipReason) {
      logAiEvent('ai_provider_skipped', { provider: provider.id, reason: skipReason, traceId });
      continue;
    }
    if (!providerSelected) {
      logAiEvent('ai_provider_selected', { provider: provider.id, traceId });
      providerSelected = true;
    }
    let model = request.model || provider.defaultModel;
    for (let attempt = 0; attempt < provider.retry; attempt++) {
      retryCount = attempt;
      logAiEvent('ai_attempt_started', { provider: provider.id, model, attempt, traceId });
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
        // Anthropic: إذا كان model_not_found لا تعيد المحاولة
        if (provider.id === 'anthropic' && result.error.type === 'model_not_found') break;
        // OpenAI: إذا كان rate_limit، خفف الاعتماد على gpt-4o وجرب نموذج أخف
        if (provider.id === 'openai' && result.error.type === 'rate_limit' && model === 'gpt-4o') {
          model = 'gpt-3.5-turbo';
          continue;
        }
        // إذا كان rate_limit من أي مزود، افحص الكوتا والفوترة (ملاحظة: هنا فقط logging)
        if (result.error.type === 'rate_limit') {
          logAiEvent('ai_provider_skipped', { provider: provider.id, reason: 'rate_limit_possible_billing_or_quota', traceId });
        }
        // لا تفتح circuit breaker بعد محاولتين فقط إذا كان هناك مزود ثالث جاهز
        if (shouldFallback(result.error)) {
          if (providers.length > 2 && attempt < provider.retry - 1 && provider.id !== 'gemini') {
            await sleep(300 * (attempt + 1));
            continue;
          }
        } else {
          break;
        }
      }
    }
    // Circuit breaker logic
    setProviderHealth(provider.id, { healthy: false, degraded: true, lastChecked: Date.now(), circuitBreakerOpen: true, cooldownUntil: Date.now() + 60000 });
    logAiEvent('circuit_breaker_open', { provider: provider.id, traceId });
    fallbackUsed = true;
    if (provider.id === 'gemini') geminiAttempted = true;
  }
  // All providers failed
  logAiEvent('ai_fallback_failed', { traceId, lastError });
  // UX: لا تعرض للمستخدم أن جميع المحركات فشلت إلا بعد التأكد أن Gemini دخل فعلاً في المحاولة
  let userMessage = '';
  if (lastError?.type === 'rate_limit') {
    userMessage = 'الخدمة تحت ضغط مرتفع، جارٍ التحويل لمحرك بديل';
  } else if (geminiAttempted) {
    userMessage = 'الخدمة غير متاحة مؤقتًا';
  } else {
    userMessage = 'جاري التحويل لمحرك بديل';
  }
  return { error: lastError || makeAiError('unknown', userMessage, { traceId }), fallbackUsed: true, retryCount, response: undefined };
}
