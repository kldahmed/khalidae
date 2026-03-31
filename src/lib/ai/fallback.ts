import { AiProviderId, AiError, FallbackDecision } from './types';

export function shouldFallback(error: AiError): boolean {
  return [
    'model_not_found',
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
