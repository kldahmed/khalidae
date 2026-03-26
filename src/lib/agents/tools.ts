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

// Remove hardcoded VERCEL_PROJECT_ID and VERCEL_TEAM_ID
// Always read from process.env at call time
function getVercelProjectId(): string {
  const value = process.env.VERCEL_PROJECT_ID;
  if (!value) throw new ExternalApiError("Missing required environment variable: VERCEL_PROJECT_ID");
  return value;
}
function getVercelTeamId(): string {
  const value = process.env.VERCEL_TEAM_ID;
  if (!value) throw new ExternalApiError("Missing required environment variable: VERCEL_TEAM_ID");
  return value;
}

const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID ?? "";
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID ?? "";

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

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new ExternalApiError("URL is required.");
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function getOrigin(url: string): string {
  return new URL(normalizeUrl(url)).origin;
}

function encodeGithubPath(filePath: string): string {
  return filePath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}
function requireVercelProjectId(): string {
  const value = process.env.VERCEL_PROJECT_ID;
  if (!value) {
    throw new ExternalApiError("Missing required environment variable: VERCEL_PROJECT_ID");
  }
  return value;
}

function requireVercelTeamId(): string {
  const value = process.env.VERCEL_TEAM_ID;
  if (!value) {
    throw new ExternalApiError("Missing required environment variable: VERCEL_TEAM_ID");
  }
  return value;
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
      `Vercel API request failed: ${response.status} for ${path}`,
      response.status,
      details,
    );
  }

  return parseApiResponse<T>(response);
}

export async function vercelGetDeployments(limit = 10): Promise<VercelDeploymentSummary[]> {
  const query = new URLSearchParams({
    projectId: getVercelProjectId(),
    teamId: getVercelTeamId(),
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
  const teamId = getVercelTeamId();
  const attempts = [
    `/v13/deployments/${encodeURIComponent(deploymentId)}/events?teamId=${teamId}`,
    `/v2/deployments/${encodeURIComponent(deploymentId)}/events?teamId=${teamId}`,
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
  const projectId = getVercelProjectId();
  const teamId = getVercelTeamId();
  const query = new URLSearchParams({
    projectId,
    teamId,
    limit: "20",
  });

  if (filter) {
    query.set("query", filter);
  }

  const attempts = [
    `/v1/observability/logs?${query.toString()}`,
    `/v2/projects/${projectId}/logs?${query.toString()}`,
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

// Diagnostic helper for Vercel integration
export async function vercelDiagnostics() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  let endpoint = null;
  let status = null;
  let error = null;
  try {
    if (!token) throw new Error("No VERCEL_TOKEN");
    if (!projectId) throw new Error("No VERCEL_PROJECT_ID");
    if (!teamId) throw new Error("No VERCEL_TEAM_ID");
    endpoint = `/v6/deployments?projectId=${projectId}&teamId=${teamId}&limit=1`;
    const res = await fetch(`https://api.vercel.com${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    status = res.status;
    if (!res.ok) {
      error = await res.text();
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  return {
    tokenExists: !!token,
    projectIdExists: !!projectId,
    teamIdExists: !!teamId,
    endpoint,
    status,
    error,
  };
}

export async function fetchPageStatus(url: string): Promise<PageStatusResult> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    let response = await fetch(normalizeUrl(url), {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.status === 405) {
      response = await fetch(normalizeUrl(url), {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        cache: "no-store",
      });
    }

    return {
      url: normalizeUrl(url),
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
  const result = await fetchText(url, "text/html");
  const contentType = result.headers.get("content-type") ?? "";

  if (!contentType.includes("text/html")) {
    throw new ExternalApiError(`URL did not return HTML content: ${url}`);
  }

  const html = result.body.slice(0, 100_000);

  return {
    url: result.url,
    title: extractTag(html, "title"),
    description: extractMeta(html, "description"),
    ogTitle: extractMeta(html, "og:title"),
    ogDescription: extractMeta(html, "og:description"),
    ogImage: extractMeta(html, "og:image"),
    canonical: extractCanonical(html),
  };
}

export async function fetchPageHtml(url: string): Promise<{
  url: string;
  html: string;
  contentType: string | null;
  contentLength: string | null;
}> {
  const result = await fetchText(url, "text/html");

  return {
    url: result.url,
    html: result.body,
    contentType: result.headers.get("content-type"),
    contentLength: result.headers.get("content-length"),
  };
}

export async function fetchPageText(url: string): Promise<{
  url: string;
  text: string;
  title: string | null;
}> {
  const { url: finalUrl, html } = await fetchPageHtml(url);

  return {
    url: finalUrl,
    text: stripHtml(html).slice(0, 12_000),
    title: extractTag(html, "title"),
  };
}

export async function fetchPageLinks(url: string): Promise<{
  url: string;
  links: Array<{ href: string; text: string }>;
  count: number;
}> {
  const { url: finalUrl, html } = await fetchPageHtml(url);

  const links: Array<{ href: string; text: string }> = [];
  const regex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1]?.trim();
    const text = stripHtml(match[2] ?? "").slice(0, 200);
    if (href) {
      links.push({ href, text });
    }
  }

  return {
    url: finalUrl,
    links: links.slice(0, 300),
    count: links.length,
  };
}

export async function fetchRobotsTxt(url: string): Promise<{
  url: string;
  exists: boolean;
  content: string | null;
}> {
  const robotsUrl = `${getOrigin(url)}/robots.txt`;

  try {
    const result = await fetchText(robotsUrl, "text/plain,text/*,*/*");
    return {
      url: robotsUrl,
      exists: result.status >= 200 && result.status < 300,
      content: result.status >= 200 && result.status < 300 ? result.body : null,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        url: robotsUrl,
        exists: false,
        content: null,
      };
    }
    throw error;
  }
}

export async function fetchSitemapXml(url: string): Promise<{
  url: string;
  exists: boolean;
  content: string | null;
}> {
  const sitemapUrl = `${getOrigin(url)}/sitemap.xml`;

  try {
    const result = await fetchText(sitemapUrl, "application/xml,text/xml,*/*");
    return {
      url: sitemapUrl,
      exists: result.status >= 200 && result.status < 300,
      content: result.status >= 200 && result.status < 300 ? result.body : null,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        url: sitemapUrl,
        exists: false,
        content: null,
      };
    }
    throw error;
  }
}

export async function fetchSecurityHeaders(url: string): Promise<{
  url: string;
  finalUrl: string;
  headers: Record<string, string | null>;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    let response = await fetch(normalizeUrl(url), {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.status === 405) {
      response = await fetch(normalizeUrl(url), {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        cache: "no-store",
      });
    }

    const pick = (name: string) => response.headers.get(name);

    return {
      url: normalizeUrl(url),
      finalUrl: response.url,
      headers: {
        "content-security-policy": pick("content-security-policy"),
        "strict-transport-security": pick("strict-transport-security"),
        "x-frame-options": pick("x-frame-options"),
        "x-content-type-options": pick("x-content-type-options"),
        "referrer-policy": pick("referrer-policy"),
        "permissions-policy": pick("permissions-policy"),
        "cross-origin-opener-policy": pick("cross-origin-opener-policy"),
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchStructuredData(url: string): Promise<{
  url: string;
  jsonLdBlocks: unknown[];
  hasJsonLd: boolean;
}> {
  const { url: finalUrl, html } = await fetchPageHtml(url);
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  const blocks: unknown[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const raw = match[1]?.trim();
    if (!raw) continue;

    try {
      blocks.push(JSON.parse(raw));
    } catch {
      blocks.push(raw);
    }
  }

  return {
    url: finalUrl,
    jsonLdBlocks: blocks,
    hasJsonLd: blocks.length > 0,
  };
}

export async function fetchPageOverview(url: string): Promise<{
  url: string;
  status: PageStatusResult;
  metadata: PageMetadataResult;
  securityHeaders: Record<string, string | null>;
  hasRobotsTxt: boolean;
  hasSitemapXml: boolean;
}> {
  const [status, metadata, security, robots, sitemap] = await Promise.all([
    fetchPageStatus(url),
    fetchPageMetadata(url),
    fetchSecurityHeaders(url),
    fetchRobotsTxt(url),
    fetchSitemapXml(url),
  ]);

  return {
    url: status.finalUrl ?? normalizeUrl(url),
    status,
    metadata,
    securityHeaders: security.headers,
    hasRobotsTxt: robots.exists,
    hasSitemapXml: sitemap.exists,
  };
}

export { ExternalApiError };