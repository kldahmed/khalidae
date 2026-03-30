import { NextRequest, NextResponse } from "next/server";
import { getHealthReport } from "@/lib/site-manager/health";

const SITE_MANAGER_SECRET = process.env.SITE_MANAGER_SECRET;

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-site-manager-secret") || request.nextUrl.searchParams.get("secret");
  if (!SITE_MANAGER_SECRET || secret !== SITE_MANAGER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getHealthReport());
}
