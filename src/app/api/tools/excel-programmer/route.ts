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
    let prompt = "";
    let fileBuffer: Buffer | null = null;
    let locale = "ar";
    // دعم قراءة FormData
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await req.formData();
      prompt = (form.get("prompt") as string) || "";
      // دعم رفع ملف مستقبلاً
      // const file = form.get("file");
      // if (file && typeof file === "object" && "arrayBuffer" in file) {
      //   fileBuffer = Buffer.from(await file.arrayBuffer());
      // }
      locale = (form.get("locale") as string) || "ar";
      log("formdata_parsed", { prompt, locale });
    } else {
      const body = await req.json();
      prompt = typeof body?.prompt === "string" ? body.prompt : "";
      locale = typeof body?.locale === "string" ? body.locale : "ar";
      log("json_parsed", { prompt, locale });
    }

    if (!prompt) {
      return new Response(
        JSON.stringify({
          error: "Prompt is required"
        }),
        { status: 400 }
      );
    }

    log("generating_excel");

    const buffer = await runExcelProgrammer(
      prompt,
      locale,
      traceId
    );

    const data = new Uint8Array(buffer);

    log("excel_generated", {
      size: data.length
    });

    return new Response(data, {
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
      { status: 500 }
    );
  }
}