import { type NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const ALLOWED_PROTOCOLS = ["http:", "https:"];
const FETCH_TIMEOUT_MS = 8000;

function parseUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (!ALLOWED_PROTOCOLS.includes(u.protocol)) return null;
    return u;
  } catch {
    return null;
  }
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
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "KhaldaeBot/1.0 (link-analyzer)" },
    });
    clearTimeout(timer);

    return NextResponse.json({
      url: response.url,
      status: `${response.status} ${response.statusText}`,
      message:
        response.ok
          ? "URL is reachable and returned a successful response."
          : "URL returned a non-success status code.",
    });
  } catch (err) {
    clearTimeout(timer);
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("abort")) {
      return NextResponse.json(
        { error: "Request timed out." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: "Could not reach the URL." },
      { status: 502 }
    );
  }
}
