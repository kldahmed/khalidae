import fs from "fs/promises";

const MEMORY_FILE = "/tmp/agent-memory.json";

type MemoryStore = Record<string, unknown>;

type LastTask = {
  instruction: string;
  language: string;
  at: string;
};

type AgentLogEntry = {
  agent?: string;
  message?: string;
  level?: string;
  at?: string;
  [key: string]: unknown;
};

async function ensureMemoryFile(): Promise<void> {
  try {
    await fs.access(MEMORY_FILE);
  } catch {
    await fs.writeFile(MEMORY_FILE, JSON.stringify({}, null, 2), "utf8");
  }
}

async function readStore(): Promise<MemoryStore> {
  await ensureMemoryFile();

  try {
    const raw = await fs.readFile(MEMORY_FILE, "utf8");
    const parsed = JSON.parse(raw) as MemoryStore;

    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}

async function writeStore(store: MemoryStore): Promise<void> {
  await ensureMemoryFile();
  await fs.writeFile(MEMORY_FILE, JSON.stringify(store, null, 2), "utf8");
}

export function isKvMemoryEnabled(): boolean {
  return false;
}

export async function readFullMemory(): Promise<MemoryStore> {
  return readStore();
}

export async function readMemory(key: string): Promise<string | null> {
  const store = await readStore();
  const value = store[key];

  if (typeof value === "string") {
    return value;
  }

  if (value == null) {
    return null;
  }

  return JSON.stringify(value);
}

export async function writeMemory(
  key: string,
  value: string,
): Promise<{ ok: true; key: string; value: string }> {
  const store = await readStore();
  store[key] = value;
  await writeStore(store);

  return {
    ok: true,
    key,
    value,
  };
}

export async function appendLastTask(task: LastTask): Promise<void> {
  const store = await readStore();
  store.last_task = task;
  await writeStore(store);
}

export async function readLastTask(): Promise<LastTask | null> {
  const store = await readStore();
  const value = store.last_task;

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const task = value as Partial<LastTask>;

  if (
    typeof task.instruction !== "string" ||
    typeof task.language !== "string" ||
    typeof task.at !== "string"
  ) {
    return null;
  }

  return {
    instruction: task.instruction,
    language: task.language,
    at: task.at,
  };
}

export async function readSiteState<T = Record<string, unknown>>(
  key = "site_state",
): Promise<T | null> {
  const store = await readStore();
  const value = store[key];

  if (value == null) {
    return null;
  }

  return value as T;
}

export async function updateSiteState(
  patch: Record<string, unknown>,
  key = "site_state",
): Promise<Record<string, unknown>> {
  const store = await readStore();

  const current =
    store[key] && typeof store[key] === "object" && !Array.isArray(store[key])
      ? (store[key] as Record<string, unknown>)
      : {};

  const next = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  store[key] = next;
  await writeStore(store);

  return next;
}

export async function appendAgentLog(
  entry: AgentLogEntry,
  key = "agent_logs",
): Promise<AgentLogEntry[]> {
  const store = await readStore();

  const current =
    Array.isArray(store[key]) ? (store[key] as AgentLogEntry[]) : [];

  const nextEntry: AgentLogEntry = {
    ...entry,
    at:
      typeof entry.at === "string" && entry.at.trim()
        ? entry.at
        : new Date().toISOString(),
  };

  const next = [...current, nextEntry].slice(-200);

  store[key] = next;
  await writeStore(store);

  return next;
}

export async function readAgentLogs(
  key = "agent_logs",
): Promise<AgentLogEntry[]> {
  const store = await readStore();
  const value = store[key];

  return Array.isArray(value) ? (value as AgentLogEntry[]) : [];
}