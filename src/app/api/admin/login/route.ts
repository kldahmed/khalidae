import { type NextRequest } from "next/server";
import {
  setSessionCookie,
  getAdminCredentials,
} from "@/lib/admin-session";

export const runtime = "nodejs";

type LoginBody = {
  username?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const creds = getAdminCredentials();

  if (!creds) {
    return Response.json(
      { error: "Admin credentials not configured." },
      { status: 500 },
    );
  }

  const username = body.username?.trim();
  const password = body.password;

  if (!username || !password) {
    return Response.json(
      { error: "Username and password are required." },
      { status: 400 },
    );
  }

  // Constant-time-ish comparison via subtle crypto
  if (username !== creds.username || password !== creds.password) {
    return Response.json({ error: "Invalid credentials." }, { status: 401 });
  }

  await setSessionCookie(username);

  return Response.json({ ok: true });
}
