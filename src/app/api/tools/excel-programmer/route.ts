import { NextRequest } from "next/server";
import { runExcelProgrammer } from "@/lib/tools/excel-programmer/engine";

export async function POST(req: NextRequest) {
  const traceId = crypto.randomUUID();

  const log = (
    event: string,
    extra: Record<string, unknown> = {}
  ) => {
    console.log(
      JSON.stringify({
        traceId,
        event,
        ...extra
      })
    );
  };

  log("request_received");

  try {
    const body = await req.json();

    const prompt =
      typeof body?.prompt === "string"
        ? body.prompt
        : "";

    if (!prompt) {
      log("missing_prompt");
      return new Response(
        JSON.stringify({
          error: "Prompt is required"
        }),
        {
          status: 400
        }
      );
    }

    log("generating_excel");

    const buffer = await runExcelProgrammer(
      prompt,
      "ar",
      traceId
    );

    log("excel_generated", {
      size: buffer.length
    });

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="excel.xlsx"'
      }
    });
  } catch (error) {
    log("error", {
      message:
        error instanceof Error
          ? error.message
          : "unknown"
    });

    return new Response(
      JSON.stringify({
        error: "Internal Server Error"
      }),
      {
        status: 500
      }
    );
  }
}