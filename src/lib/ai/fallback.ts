import { AiProviderId, AiError, FallbackDecision } from './types';

export function shouldFallback(error: AiError): boolean {
  // model_not_found ليس retryable
  if (error.type === 'model_not_found') return false;
  return [
    'access_denied',
    'rate_limit',
    'timeout',
    'provider_unavailable',
    'malformed_response',
    'network_failure',
    'unhealthy',
  ].includes(error.type);
}

export function makeFallbackDecision(from: AiProviderId, to: AiProviderId, reason: string, traceId: string): FallbackDecision {
  return {
    used: true,
    from,
    to,
    reason,
    traceId,
  };
}
