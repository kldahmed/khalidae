import { NextRequest, NextResponse } from "next/server";
import { analyzeInput } from "@/lib/tools/command-center/analyzeInput";

export async function POST(req: NextRequest) {
  const trace = ["request_received"];
  try {
    const { input } = await req.json();
    trace.push("input_parsed");
    const report = await analyzeInput(input, trace);
    trace.push("report_generated");
    return NextResponse.json({ ...report, trace: [...trace, "response_sent"] });
  } catch (e: any) {
    trace.push("error", "response_sent");
    return NextResponse.json({ error: e.message || "Unexpected error", trace }, { status: 500 });
  }
}
