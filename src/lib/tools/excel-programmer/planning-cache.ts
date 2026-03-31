// Simple in-memory cache for Excel planning (can be replaced with Redis, etc.)
import { ExcelWorkbookSpec } from './types';

const cache: Record<string, { spec: ExcelWorkbookSpec; expires: number }> = {};
const TTL_MS = 1000 * 60 * 10; // 10 minutes

function normalizePrompt(prompt: string): string {
  return prompt.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getPlanningCache(prompt: string): ExcelWorkbookSpec | null {
  const key = normalizePrompt(prompt);
  const entry = cache[key];
  if (entry && entry.expires > Date.now()) {
    return entry.spec;
  }
  return null;
}

export function setPlanningCache(prompt: string, spec: ExcelWorkbookSpec) {
  const key = normalizePrompt(prompt);
  cache[key] = { spec, expires: Date.now() + TTL_MS };
}
