import { AiError } from './types';

export function makeAiError(type: AiError['type'], message: string, opts: Partial<AiError> = {}): AiError {
  return {
    type,
    message,
    ...opts,
    retryable: [
      'model_not_found',
      'access_denied',
      'rate_limit',
      'timeout',
      'provider_unavailable',
      'malformed_response',
      'network_failure',
      'unhealthy',
    ].includes(type),
    fatal: [
      'unknown',
      'unhealthy',
    ].includes(type),
  };
}
