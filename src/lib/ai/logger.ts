import { AiProviderId, AiError, AiResponse } from './types';

export function logAiEvent(event: string, data: Record<string, any>) {
   
  console.log(JSON.stringify({
    event,
    ...data,
    timestamp: new Date().toISOString(),
  }));
}

export function logProviderSkipped(provider: string, reason: string, traceId?: string) {
  logAiEvent('ai_provider_skipped', { provider, reason, traceId });
}

export function logAttemptStarted(provider: string, model: string, attempt: number, traceId?: string) {
  logAiEvent('ai_attempt_started', { provider, model, attempt, traceId });
}

export function logProviderSelected(provider: string, traceId?: string) {
  logAiEvent('ai_provider_selected', { provider, traceId });
}

export function logAiError(error: AiError, context: Record<string, any> = {}) {
  logAiEvent('ai_error', { ...context, ...error });
}

export function logAiResponse(response: AiResponse, context: Record<string, any> = {}) {
  logAiEvent('ai_response', { ...context, ...response });
}
