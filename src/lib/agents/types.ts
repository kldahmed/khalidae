export type OwnerLanguage = "ar" | "en";

export type AgentName =
  | "content_agent"
  | "seo_agent"
  | "dev_agent"
  | "monitor_agent";

export interface AgentExecutionInput {
  task: string;
  context?: string;
  language?: OwnerLanguage;
}

export interface AgentToolCall {
  name: string;
  input: unknown;
  output: unknown;
  at: string;
}

export interface AgentResult {
  agent: AgentName;
  ok: boolean;
  model: string;
  task: string;
  context?: string;
  output: string;
  toolCalls: AgentToolCall[];
  startedAt: string;
  completedAt: string;
  error?: string;
}

export interface AgentStatus {
  name: AgentName;
  healthy: boolean;
  availableTools: string[];
  issues: string[];
}

export interface AgentLogEntry {
  agent: AgentName;
  task: string;
  ok: boolean;
  summary: string;
  at: string;
}

export interface LastTaskEntry {
  instruction: string;
  language: OwnerLanguage;
  at: string;
}

export interface SiteState {
  known_issues: string[];
  last_health_summary?: string;
  last_checked_at?: string;
  last_deployment_id?: string | null;
}

export interface AgentMemoryStore {
  last_tasks: LastTaskEntry[];
  agent_logs: AgentLogEntry[];
  site_state: SiteState;
  [key: string]: unknown;
}

export interface ManagerEvent {
  type:
    | "manager_start"
    | "manager_complete"
    | "tool_call"
    | "tool_result"
    | "agent_start"
    | "agent_result"
    | "memory_write"
    | "error";
  message: string;
  timestamp: string;
  payload?: unknown;
}

export interface ManagerResult {
  ok: boolean;
  language: OwnerLanguage;
  output: string;
  startedAt: string;
  completedAt: string;
  delegatedResults: AgentResult[];
  statusSnapshot: AgentStatus[];
  error?: string;
}

export interface GithubFileResult {
  path: string;
  sha: string;
  content: string;
}

export interface GithubDirectoryEntry {
  name: string;
  path: string;
  type: "file" | "dir";
  sha?: string;
}

export interface GithubWriteResult {
  path: string;
  sha: string | null;
  commitSha: string | null;
}

export interface PageStatusResult {
  url: string;
  finalUrl: string;
  ok: boolean;
  status: number;
  statusText: string;
  timingMs: number;
}

export interface PageMetadataResult {
  url: string;
  title: string | null;
  description: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonical: string | null;
}

export interface VercelDeploymentSummary {
  id: string;
  name: string;
  url: string | null;
  state: string | null;
  createdAt: number | null;
  target: string | null;
}

export interface VercelLogResult {
  source: string;
  entries: unknown[];
}