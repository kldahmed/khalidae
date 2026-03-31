import type { BrainMemory } from "./types";

// طبقة الذاكرة للذكاء الاصطناعي
export class MemoryLayer {
  private memory: BrainMemory = { recentCommands: [], lastResults: [] };

  getMemory(): BrainMemory {
    return this.memory;
  }

  addCommand(cmd: string) {
    this.memory.recentCommands.push(cmd);
  }

  addResult(result: string) {
    this.memory.lastResults.push(result);
  }

  clear() {
    this.memory = { recentCommands: [], lastResults: [] };
  }
}
