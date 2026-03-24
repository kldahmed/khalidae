import fs from "fs/promises";
import path from "path";

const MEMORY_FILE = "/tmp/agent-memory.json";

async function ensureMemoryFile() {
  try {
    await fs.access(MEMORY_FILE);
  } catch {
    await fs.writeFile(MEMORY_FILE, JSON.stringify({}, null, 2));
  }
}

export async function readMemory(key: string): Promise<string | null> {
  try {
    await ensureMemoryFile();

    const raw = await fs.readFile(MEMORY_FILE, "utf8");
    const memory = JSON.parse(raw);

    return memory[key] ?? null;
  } catch (error) {
    console.error("readMemory failed:", error);
    return null;
  }
}

export async function writeMemory(key: string, value: string) {
  try {
    await ensureMemoryFile();

    const raw = await fs.readFile(MEMORY_FILE, "utf8");
    const memory = JSON.parse(raw);

    memory[key] = value;

    await fs.writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2));

    return { ok: true };
  } catch (error) {
    console.error("writeMemory failed:", error);
    return { ok: false };
  }
}

export async function appendLastTask(task: {
  instruction: string;
  language: string;
  at: string;
}) {
  try {
    await ensureMemoryFile();

    const raw = await fs.readFile(MEMORY_FILE, "utf8");
    const memory = JSON.parse(raw);

    memory.last_task = task;

    await fs.writeFile(MEMORY_FILE, JSON.stringify(memory, null, 2));
  } catch (error) {
    console.error("appendLastTask failed:", error);
  }
}