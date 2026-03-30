import { NextRequest, NextResponse } from "next/server";
import { analyzeSite } from "@/lib/site-manager/analyze";

const SITE_MANAGER_SECRET = process.env.SITE_MANAGER_SECRET;

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-site-manager-secret") || request.nextUrl.searchParams.get("secret");
  if (!SITE_MANAGER_SECRET || secret !== SITE_MANAGER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { prompt, context } = await request.json();
  if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  const result = await analyzeSite(prompt, context);
  return NextResponse.json({ result });
}
