import { type NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const ALLOWED_PROTOCOLS = ["http:", "https:"];
const FETCH_TIMEOUT_MS = 10000;

function parseUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (!ALLOWED_PROTOCOLS.includes(u.protocol)) return null;
    return u;
  } catch {
    return null;
  }
}

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function extractTag(html: string, tag: string): string | null {
  const m = html.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i"));
  return m?.[1]?.trim() ?? null;
}

function extractCanonical(html: string): string | null {
  const m = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
  );
  return m?.[1]?.trim() ?? null;
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url") ?? "";
  const parsed = parseUrl(rawUrl);

  if (!parsed) {
    return NextResponse.json(
      { error: "Invalid or disallowed URL." },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(parsed.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "KhaldaeBot/1.0 (metadata-viewer)",
        Accept: "text/html",
      },
    });
    clearTimeout(timer);

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "URL does not return an HTML page." },
        { status: 422 }
      );
    }

    // Read only first 50KB to avoid huge payloads
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: "No response body." }, { status: 502 });
    }

    let html = "";
    let bytesRead = 0;
    const MAX_BYTES = 50_000;
    const decoder = new TextDecoder();

    while (bytesRead < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      bytesRead += value.byteLength;
    }
    reader.cancel();

    return NextResponse.json({
      url: response.url,
      title: extractTag(html, "title"),
      description: extractMeta(html, "description"),
      ogTitle: extractMeta(html, "og:title"),
      ogDescription: extractMeta(html, "og:description"),
      ogImage: extractMeta(html, "og:image"),
      twitterCard: extractMeta(html, "twitter:card"),
      canonical: extractCanonical(html),
    });
  } catch (err) {
    clearTimeout(timer);
    const message = err instanceof Error ? err.message : "";
    if (message.includes("abort")) {
      return NextResponse.json({ error: "Request timed out." }, { status: 504 });
    }
    return NextResponse.json(
      { error: "Could not fetch the page." },
      { status: 502 }
    );
  }
}
