import { AiProviderConfig } from './types';

export const AI_PROVIDERS: AiProviderConfig[] = [
  {
    id: 'openai',
    enabled: !!process.env.OPENAI_API_KEY,
    supportedModels: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: process.env.AI_OPENAI_DEFAULT_MODEL || 'gpt-4o',
    priority: 1,
    timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 25000,
    retry: Number(process.env.AI_MAX_RETRIES) || 2,
    fallbackTo: 'anthropic',
  },
  {
    id: 'anthropic',
    enabled: !!process.env.ANTHROPIC_API_KEY,
    supportedModels: ['claude-3-sonnet-20240229'],
    defaultModel: process.env.AI_ANTHROPIC_DEFAULT_MODEL || 'claude-3-sonnet-20240229',
    priority: 2,
    timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 25000,
    retry: Number(process.env.AI_MAX_RETRIES) || 2,
    fallbackTo: 'gemini',
  },
  {
    id: 'gemini',
    enabled: !!process.env.GEMINI_API_KEY,
    supportedModels: ['gemini-pro'],
    defaultModel: process.env.AI_GEMINI_DEFAULT_MODEL || 'gemini-pro',
    priority: 3,
    timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 25000,
    retry: Number(process.env.AI_MAX_RETRIES) || 2,
  },
];

export const AI_DEFAULT_PROVIDER = process.env.AI_DEFAULT_PROVIDER as string || 'openai';
export const AI_DEFAULT_MODEL = process.env.AI_DEFAULT_MODEL as string || '';
export const AI_FALLBACK_PROVIDER = process.env.AI_FALLBACK_PROVIDER as string || 'anthropic';
export const AI_FALLBACK_MODEL = process.env.AI_FALLBACK_MODEL as string || '';
export const AI_ALERTS_ENABLED = process.env.AI_ALERTS_ENABLED === 'true';
export const AI_TELEGRAM_BOT_TOKEN = process.env.AI_TELEGRAM_BOT_TOKEN || '';
export const AI_TELEGRAM_CHAT_ID = process.env.AI_TELEGRAM_CHAT_ID || '';
