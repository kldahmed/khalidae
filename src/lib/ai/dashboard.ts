import { getEnabledProviders, getAllHealth } from './registry';

export function getAiDashboardData() {
  return {
    providers: getEnabledProviders().map(p => ({
      id: p.id,
      enabled: p.enabled,
      defaultModel: p.defaultModel,
      supportedModels: p.supportedModels,
      priority: p.priority,
      timeoutMs: p.timeoutMs,
      retry: p.retry,
      fallbackTo: p.fallbackTo,
    })),
    health: getAllHealth(),
    // TODO: add stats for fallback, timeout, model_not_found, etc.
  };
}
