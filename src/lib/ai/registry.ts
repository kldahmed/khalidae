import { AI_PROVIDERS } from './config';
import { AiProviderConfig, AiHealthStatus } from './types';

const health: Record<string, AiHealthStatus> = {};

export function getProviderConfig(id: string): AiProviderConfig | undefined {
  return AI_PROVIDERS.find(p => p.id === id);
}

export function getEnabledProviders(): AiProviderConfig[] {
  return AI_PROVIDERS.filter(p => p.enabled);
}

export function getProviderHealth(id: string): AiHealthStatus | undefined {
  return health[id];
}

export function setProviderHealth(id: string, status: Partial<AiHealthStatus>) {
  health[id] = { ...health[id], ...status };
}

export function getAllHealth(): Record<string, AiHealthStatus> {
  return health;
}
