export type Locale = "ar" | "en";

export interface ExcelProgrammerError {
  type: "validation" | "network" | "server" | "timeout" | "malformed" | "unsupported_file";
  message: string;
  traceId?: string;
}

export type ExcelProgrammerStep =
  | "idle"
  | "typing"
  | "validating"
  | "ready"
  | "submitting"
  | "processing"
  | "success"
  | "recoverable_error"
  | "fatal_error";
