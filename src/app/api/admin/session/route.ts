import { getSessionUser } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  return Response.json({ authenticated: true, user });
}
