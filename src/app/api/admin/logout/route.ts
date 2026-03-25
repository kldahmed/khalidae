import { getSessionUser, clearSession } from "@/lib/admin-session";

export const runtime = "nodejs";

export async function POST() {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }

  await clearSession();

  return Response.json({ ok: true });
}
