import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

/**
 * Create a signed session token using HMAC-SHA256.
 * Token format: base64(payload).base64(signature)
 */
async function sign(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${btoa(payload)}.${sigB64}`;
}

async function verify(token: string, secret: string): Promise<string | null> {
  try {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return null;

    const payload = atob(payloadB64);
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const sig = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sig, enc.encode(payload));

    if (!valid) return null;

    const data = JSON.parse(payload) as { user: string; exp: number };
    if (Date.now() > data.exp) return null;

    return data.user;
  } catch {
    return null;
  }
}

function getSessionSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.MANAGER_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET or MANAGER_SECRET must be set");
  return s;
}

export async function createSession(username: string): Promise<string> {
  const payload = JSON.stringify({
    user: username,
    exp: Date.now() + MAX_AGE * 1000,
  });
  return sign(payload, getSessionSecret());
}

export async function setSessionCookie(username: string): Promise<void> {
  const token = await createSession(username);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSessionUser(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verify(token, getSessionSecret());
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export function getAdminCredentials(): { username: string; password: string } | null {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return null;
  return { username, password };
}
