import { Buffer } from "node:buffer";
import {
  type GithubDirectoryEntry,
  type GithubFileResult,
  type GithubWriteResult,
  type PageMetadataResult,
  type PageStatusResult,
  type VercelDeploymentSummary,
  type VercelLogResult,
} from "@/lib/agents/types";

const GITHUB_OWNER = "kldahmed";
const GITHUB_REPO = "khalidae";
const GITHUB_BRANCH = "main";

const VERCEL_PROJECT_ID = "prj_zwkDjk1BgKiM2TbrZm8pZjPaO8yT";
const VERCEL_TEAM_ID = "team_hqItF7AR7CcHVniixex6thuI";

class ExternalApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ExternalApiError";
    this.status = status;
    this.details = details;
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ExternalApiError(`Missing required environment variable: ${name}`);
  }
  return value;
}

function encodeGithubPath(filePath: string): string {
  return filePath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ExternalApiError(`Unexpected API response: ${text}`, response.status);
  }
}

async function githubRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = requireEnv("GITHUB_TOKEN");
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new ExternalApiError(
      `GitHub API request failed: ${response.status}`,
      response.status,
      details,
    );
  }

  return parseApiResponse<T>(response);
}

type GithubContentsFileResponse = {
  type: "file";
  path: string;
  sha: string;
  content: string;
  encoding: "base64";
};

type GithubContentsDirectoryResponse = Array<{
  name: string;
  path: string;
  type: "file" | "dir";
  sha?: string;
}>;

type GithubWriteResponse = {
  content?: { path?: string; sha?: string };
  commit?: { sha?: string };
};

export async function githubReadFile(filePath: string): Promise<GithubFileResult> {
  const payload = await githubRequest<GithubContentsFileResponse>(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeGithubPath(filePath)}?ref=${GITHUB_BRANCH}`,
  );

  if (payload.type !== "file") {
    throw new ExternalApiError(`Path is not a file: ${filePath}`);
  }

  return {
    path: payload.path,
    sha: payload.sha,
    content: Buffer.from(payload.content, payload.encoding).toString("utf8"),
  };
}

export async function githubListFiles(directory: string): Promise<GithubDirectoryEntry[]> {
  const payload = await githubRequest<GithubContentsDirectoryResponse>(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeGithubPath(directory)}?ref=${GITHUB_BRANCH}`,
  );

  if (!Array.isArray(payload)) {
    throw new ExternalApiError(`Path is not a directory: ${directory}`);
  }

  return payload.map((entry) => ({
    name: entry.name,
    path: entry.path,
    type: entry.type,
    sha: entry.sha,
  }));
}

export async function githubWriteFile(
  filePath: string,
  content: string,
  commitMessage: string,
): Promise<GithubWriteResult> {
  let existingSha: string | undefined;

  try {
    const existing = await githubReadFile(filePath);
    existingSha = existing.sha;
  } catch (error) {
    if (!(error instanceof ExternalApiError) || error.status !== 404) {
      throw error;
    }
  }

  const payload = await githubRequest<GithubWriteResponse>(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeGithubPath(filePath)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        message: commitMessage,
        content: Buffer.from(content, "utf8").toString("base64"),
        sha: existingSha,
        branch: GITHUB_BRANCH,
      }),
    },
  );

  return {
    path: payload.content?.path ?? filePath,
    sha: payload.content?.sha ?? null,
    commitSha: payload.commit?.sha ?? null,
  };
}

async function vercelRequest<T>(path: string): Promise<T> {
  const token = requireEnv("VERCEL_TOKEN");
  const response = await fetch(`https://api.vercel.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new ExternalApiError(
      `Vercel API request failed: ${response.status}`,
      response.status,
      details,
    );
  }

  return parseApiResponse<T>(response);
}

export async function vercelGetDeployments(limit = 10): Promise<VercelDeploymentSummary[]> {
  const query = new URLSearchParams({
    projectId: VERCEL_PROJECT_ID,
    teamId: VERCEL_TEAM_ID,
    limit: String(limit),
  });

  const payload = await vercelRequest<{
    deployments?: Array<{
      uid: string;
      name?: string;
      url?: string;
      state?: string;
      createdAt?: number;
      target?: string;
    }>;
  }>(`/v6/deployments?${query.toString()}`);

  return (payload.deployments ?? []).map((deployment) => ({
    id: deployment.uid,
    name: deployment.name ?? "unknown",
    url: deployment.url ?? null,
    state: deployment.state ?? null,
    createdAt: deployment.createdAt ?? null,
    target: deployment.target ?? null,
  }));
}

export async function vercelGetBuildLogs(deploymentId: string): Promise<VercelLogResult> {
  const attempts = [
    `/v13/deployments/${encodeURIComponent(deploymentId)}/events?teamId=${VERCEL_TEAM_ID}`,
    `/v2/deployments/${encodeURIComponent(deploymentId)}/events?teamId=${VERCEL_TEAM_ID}`,
  ];

  let lastError: unknown;

  for (const path of attempts) {
    try {
      const payload = await vercelRequest<{ events?: unknown[] } | unknown[]>(path);
      return {
        source: path,
        entries: Array.isArray(payload) ? payload : (payload.events ?? []),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new ExternalApiError(`Unable to fetch build logs for deployment ${deploymentId}`);
}

export async function vercelGetRuntimeLogs(filter = ""): Promise<VercelLogResult> {
  const query = new URLSearchParams({
    projectId: VERCEL_PROJECT_ID,
    teamId: VERCEL_TEAM_ID,
    limit: "20",
  });

  if (filter) {
    query.set("query", filter);
  }

  const attempts = [
    `/v1/observability/logs?${query.toString()}`,
    `/v2/projects/${VERCEL_PROJECT_ID}/logs?${query.toString()}`,
  ];

  let lastError: unknown;

  for (const path of attempts) {
    try {
      const payload = await vercelRequest<{ logs?: unknown[] } | unknown[]>(path);
      return {
        source: path,
        entries: Array.isArray(payload) ? payload : (payload.logs ?? []),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new ExternalApiError("Unable to fetch runtime logs from Vercel.");
}

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function extractTag(html: string, tag: string): string | null {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i"));
  return match?.[1]?.trim() ?? null;
}

function extractCanonical(html: string): string | null {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return match?.[1]?.trim() ?? null;
}

export async function fetchPageStatus(url: string): Promise<PageStatusResult> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.status === 405) {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        cache: "no-store",
      });
    }

    return {
      url,
      finalUrl: response.url,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      timingMs: Date.now() - startedAt,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchPageMetadata(url: string): Promise<PageMetadataResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, {
      headers: { Accept: "text/html" },
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new ExternalApiError(`URL did not return HTML content: ${url}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new ExternalApiError(`No response body available for URL: ${url}`);
    }

    let html = "";
    let bytesRead = 0;
    const maxBytes = 50_000;
    const decoder = new TextDecoder();

    while (bytesRead < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      bytesRead += value.byteLength;
    }

    await reader.cancel();

    return {
      url: response.url,
      title: extractTag(html, "title"),
      description: extractMeta(html, "description"),
      ogTitle: extractMeta(html, "og:title"),
      ogDescription: extractMeta(html, "og:description"),
      ogImage: extractMeta(html, "og:image"),
      canonical: extractCanonical(html),
    };
  } finally {
    clearTimeout(timer);
  }
}

export { ExternalApiError };