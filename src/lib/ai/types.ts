// Unified AI contracts
export type AiProviderId = 'openai' | 'anthropic' | 'gemini';

export interface AiRequest {
  prompt: string;
  model?: string;
  provider?: AiProviderId;
  maxTokens?: number;
  temperature?: number;
  traceId?: string;
  userAgent?: string;
  context?: Record<string, any>;
}

export interface AiResponse {
  text: string;
  model: string;
  provider: AiProviderId;
  latencyMs: number;
  traceId: string;
  fallbackUsed?: boolean;
  retryCount: number;
}

export interface AiProviderResult {
  response?: AiResponse;
  error?: AiError;
  fallbackUsed?: boolean;
  retryCount?: number;
}

export interface AiError {
  type: 'model_not_found' | 'access_denied' | 'rate_limit' | 'timeout' | 'provider_unavailable' | 'malformed_response' | 'network_failure' | 'unknown' | 'unhealthy';
  message: string;
  provider?: AiProviderId;
  model?: string;
  traceId?: string;
  statusCode?: number;
  retryable?: boolean;
  fatal?: boolean;
  details?: any;
}

export interface AiHealthStatus {
  provider: AiProviderId;
  model: string;
  healthy: boolean;
  degraded: boolean;
  lastChecked: number;
  lastError?: string;
  circuitBreakerOpen: boolean;
  cooldownUntil?: number;
}

export interface AiProviderConfig {
  id: AiProviderId;
  enabled: boolean;
  supportedModels: string[];
  defaultModel: string;
  priority: number;
  timeoutMs: number;
  retry: number;
  fallbackTo?: AiProviderId;
}

export interface FallbackDecision {
  used: boolean;
  from: AiProviderId;
  to: AiProviderId;
  reason: string;
  traceId: string;
}
