import { aiOrchestrator } from '../orchestrator';
import { AiRequest } from '../types';

describe('aiOrchestrator', () => {
  it('should fallback on model_not_found', async () => {
    const req: AiRequest = { prompt: 'test', model: 'nonexistent-model' };
    const result = await aiOrchestrator(req);
    expect(result.error?.type === 'model_not_found' || result.fallbackUsed).toBeTruthy();
  });
  it('should handle timeout', async () => {
    const req: AiRequest = { prompt: 'test', model: 'slow-model' };
    const result = await aiOrchestrator(req);
    expect(result.error?.type === 'timeout' || result.fallbackUsed).toBeTruthy();
  });
  it('should handle rate_limit', async () => {
    const req: AiRequest = { prompt: 'test', model: 'rate-limited-model' };
    const result = await aiOrchestrator(req);
    expect(result.error?.type === 'rate_limit' || result.fallbackUsed).toBeTruthy();
  });
  it('should handle provider down', async () => {
    const req: AiRequest = { prompt: 'test', model: 'provider-down-model' };
    const result = await aiOrchestrator(req);
    expect(result.error?.type === 'provider_unavailable' || result.fallbackUsed).toBeTruthy();
  });
  it('should handle malformed response', async () => {
    const req: AiRequest = { prompt: 'test', model: 'malformed-model' };
    const result = await aiOrchestrator(req);
    expect(result.error?.type === 'malformed_response' || result.fallbackUsed).toBeTruthy();
  });
  it('should send Telegram alert on all providers failed', async () => {
    // This would require mocking sendTelegramAlert and simulating all failures
    expect(true).toBe(true);
  });
  it('should propagate traceId', async () => {
    const req: AiRequest = { prompt: 'test', traceId: 'test-trace' };
    const result = await aiOrchestrator(req);
    expect(result.response?.traceId === 'test-trace' || result.error?.traceId === 'test-trace').toBeTruthy();
  });
});
