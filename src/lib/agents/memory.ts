import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  type AgentLogEntry,
  type AgentMemoryStore,
  type LastTaskEntry,
  type SiteState,
} from "@/lib/agents/types";

const LOCAL_MEMORY_PATH = path.join(process.cwd(), "data", "agent-memory.json");

function createDefaultMemory(): AgentMemoryStore {
  return {
    last_tasks: [],
    agent_logs: [],
    site_state: {
      known_issues: [],
      last_deployment_id: null,
    },
  };
}

function getKvConfig() {
  const url = process.env.KV_REST_API_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.KV_REST_API_READ_ONLY_TOKEN;

  if (url && token) {
    return { url: url.replace(/\/$/, ""), token };
  }

  return null;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Unexpected JSON response: ${text}`);
  }
}

async function readLocalStore(): Promise<AgentMemoryStore> {
  try {
    const content = await readFile(LOCAL_MEMORY_PATH, "utf8");
    const parsed = JSON.parse(content) as Partial<AgentMemoryStore>;
    return {
      ...createDefaultMemory(),
      ...parsed,
      site_state: {
        ...createDefaultMemory().site_state,
        ...(parsed.site_state ?? {}),
      },
      last_tasks: parsed.last_tasks ?? [],
      agent_logs: parsed.agent_logs ?? [],
    };
  } catch {
    return createDefaultMemory();
  }
}

async function writeLocalStore(store: AgentMemoryStore): Promise<void> {
  await mkdir(path.dirname(LOCAL_MEMORY_PATH), { recursive: true });
  await writeFile(LOCAL_MEMORY_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function tryParseStoredValue<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
}

async function kvRead<T>(key: string): Promise<T | null> {
  const config = getKvConfig();
  if (!config) return null;

  const response = await fetch(`${config.url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${config.token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`KV read failed for key \"${key}\": ${response.status}`);
  }

  const data = await parseJsonResponse<{ result: string | null }>(response);
  return tryParseStoredValue<T>(data.result);
}

async function kvWrite<T>(key: string, value: T): Promise<void> {
  const config = getKvConfig();
  if (!config) return;

  const response = await fetch(`${config.url}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([JSON.stringify(value)]),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`KV write failed for key \"${key}\": ${response.status}`);
  }
}

export function isKvMemoryEnabled(): boolean {
  return Boolean(getKvConfig());
}

export async function readMemory<T = unknown>(key: string): Promise<T | null> {
  const config = getKvConfig();
  if (config) {
    return kvRead<T>(key);
  }

  const store = await readLocalStore();
  return (store[key] as T | undefined) ?? null;
}

export async function writeMemory<T>(key: string, value: T): Promise<T> {
  const config = getKvConfig();
  if (config) {
    await kvWrite(key, value);
    return value;
  }

  const store = await readLocalStore();
  store[key] = value;
  await writeLocalStore(store);
  return value;
}

export async function readFullMemory(): Promise<AgentMemoryStore> {
  const config = getKvConfig();
  if (config) {
    const [lastTasks, agentLogs, siteState] = await Promise.all([
      kvRead<LastTaskEntry[]>("last_tasks"),
      kvRead<AgentLogEntry[]>("agent_logs"),
      kvRead<SiteState>("site_state"),
    ]);

    return {
      ...createDefaultMemory(),
      last_tasks: lastTasks ?? [],
      agent_logs: agentLogs ?? [],
      site_state: { ...createDefaultMemory().site_state, ...(siteState ?? {}) },
    };
  }

  return readLocalStore();
}

export async function appendLastTask(entry: LastTaskEntry): Promise<LastTaskEntry[]> {
  const existing = (await readMemory<LastTaskEntry[]>("last_tasks")) ?? [];
  const next = [entry, ...existing].slice(0, 10);
  await writeMemory("last_tasks", next);
  return next;
}

export async function appendAgentLog(entry: AgentLogEntry): Promise<AgentLogEntry[]> {
  const existing = (await readMemory<AgentLogEntry[]>("agent_logs")) ?? [];
  const next = [entry, ...existing].slice(0, 50);
  await writeMemory("agent_logs", next);
  return next;
}

export async function updateSiteState(update: Partial<SiteState>): Promise<SiteState> {
  const existing = (await readMemory<SiteState>("site_state")) ?? createDefaultMemory().site_state;
  const next: SiteState = { ...existing, ...update };
  await writeMemory("site_state", next);
  return next;
}