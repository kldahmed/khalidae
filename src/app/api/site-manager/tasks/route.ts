import { NextRequest, NextResponse } from "next/server";
import { executeSiteTask } from "@/lib/site-manager/tasks";

const SITE_MANAGER_SECRET = process.env.SITE_MANAGER_SECRET;

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-site-manager-secret") || request.nextUrl.searchParams.get("secret");
  if (!SITE_MANAGER_SECRET || secret !== SITE_MANAGER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { task, context } = await request.json();
  if (!task) return NextResponse.json({ error: "Missing task" }, { status: 400 });
  const result = await executeSiteTask(task, context);
  return NextResponse.json({ result });
}
