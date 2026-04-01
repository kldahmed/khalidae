import { NextRequest, NextResponse } from "next/server";
import { handleExcelAI } from "@/lib/excel/service";
import { log } from "@/lib/analytics/logger";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const traceId = randomUUID();
  try {
    const body = await req.json();
    log("Excel AI request received", { traceId, body });
    const stream = await handleExcelAI({ ...body, traceId });
    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=excel.xlsx",
        "X-Trace-Id": traceId,
      },
    });
  } catch (error: any) {
    log("Excel AI error", { traceId, error: error?.message || error });
    return NextResponse.json({ error: "Internal Server Error", traceId }, { status: 500 });
  }
}
