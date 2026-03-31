import { getEnabledProviders, setProviderHealth } from './registry';
import { AiHealthStatus } from './types';

export async function checkProviderHealth(id: string, model: string): Promise<AiHealthStatus> {
  // Dummy health check: in real impl, call provider API
  const healthy = true;
  const status: AiHealthStatus = {
    provider: id as any,
    model,
    healthy,
    degraded: false,
    lastChecked: Date.now(),
    circuitBreakerOpen: false,
  };
  setProviderHealth(id, status);
  return status;
}

export async function checkAllProvidersHealth() {
  const providers = getEnabledProviders();
  for (const p of providers) {
    await checkProviderHealth(p.id, p.defaultModel);
  }
}
