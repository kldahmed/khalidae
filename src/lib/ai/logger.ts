import { AiProviderId, AiError, AiResponse } from './types';

export function logAiEvent(event: string, data: Record<string, any>) {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({
    event,
    ...data,
    timestamp: new Date().toISOString(),
  }));
}

export function logAiError(error: AiError, context: Record<string, any> = {}) {
  logAiEvent('ai_error', { ...context, ...error });
}

export function logAiResponse(response: AiResponse, context: Record<string, any> = {}) {
  logAiEvent('ai_response', { ...context, ...response });
}
