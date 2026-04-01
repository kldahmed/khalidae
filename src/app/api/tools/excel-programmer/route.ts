import { NextRequest, NextResponse } from "next/server";
import { runExcelProgrammer } from "@/lib/tools/excel-programmer/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const traceId = crypto.randomUUID();

  const log = (event: string, extra: Record<string, unknown> = {}) => {
    console.log(
      JSON.stringify({
        traceId,
        event,
        ...extra,
      })
    );
  };

  log("request_received");

  try {
    let prompt = "";
    let locale = "ar";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      prompt = typeof form.get("prompt") === "string" ? String(form.get("prompt")) : "";
      locale = typeof form.get("locale") === "string" ? String(form.get("locale")) : "ar";

      log("formdata_parsed", {
        promptLength: prompt.length,
        locale,
      });
    } else {
      const body = await req.json();
      prompt = typeof body?.prompt === "string" ? body.prompt : "";
      locale = typeof body?.locale === "string" ? body.locale : "ar";

      log("json_parsed", {
        promptLength: prompt.length,
        locale,
      });
    }

    if (!prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required", traceId },
        { status: 400 }
      );
    }

    log("generating_excel");

    const buffer = await runExcelProgrammer(prompt, locale, traceId);

    const data =
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

    log("excel_generated", {
      size: data.length,
    });

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="excel.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    log("excel_generation_error", {
      message: error instanceof Error ? error.message : "unknown_error",
    });

    return NextResponse.json(
      { error: "Internal Server Error", traceId },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { handleExcelAI } from "@/lib/excel/service";
import { log } from "@/lib/analytics/logger";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const traceId = randomUUID();
  try {
    let prompt = "";
    let locale = "ar";
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      prompt = (form.get("prompt") as string) || "";
      locale = (form.get("locale") as string) || "ar";
      log("formdata_parsed", { traceId, promptLength: prompt.length, locale });
    } else {
      const body = await req.json();
      prompt = typeof body?.prompt === "string" ? body.prompt : "";
      locale = typeof body?.locale === "string" ? body.locale : "ar";
      log("json_parsed", { traceId, promptLength: prompt.length, locale });
    }
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required", traceId }, { status: 400 });
    }
    log("generating_excel", { traceId });
    // دعم أنواع متعددة لاحقاً
    const stream = await handleExcelAI({ type: "table", payload: { prompt, locale }, traceId });
    log("excel_generated", { traceId });
    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="excel.xlsx"',
        "X-Trace-Id": traceId,
      },
    });
  } catch (error: any) {
    log("excel_generation_error", { traceId, error: error?.message || error });
    return NextResponse.json({ error: "Internal Server Error", traceId }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { handleExcelAI } from "@/lib/excel/service";
import { log } from "@/lib/analytics/logger";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const traceId = randomUUID();
  try {
    let prompt = "";
    let locale = "ar";
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      prompt = (form.get("prompt") as string) || "";
      locale = (form.get("locale") as string) || "ar";
      log("formdata_parsed", { traceId, promptLength: prompt.length, locale });
    } else {
      const body = await req.json();
      prompt = typeof body?.prompt === "string" ? body.prompt : "";
      locale = typeof body?.locale === "string" ? body.locale : "ar";
      log("json_parsed", { traceId, promptLength: prompt.length, locale });
    }
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required", traceId }, { status: 400 });
    }
    log("generating_excel", { traceId });
    // دعم أنواع متعددة لاحقاً
    const stream = await handleExcelAI({ type: "table", payload: { prompt, locale }, traceId });
    log("excel_generated", { traceId });
    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="excel.xlsx"',
        "X-Trace-Id": traceId,
      },
    });
  } catch (error: any) {
    log("excel_generation_error", { traceId, error: error?.message || error });
    return NextResponse.json({ error: "Internal Server Error", traceId }, { status: 500 });
  }
}npm install
npm run build