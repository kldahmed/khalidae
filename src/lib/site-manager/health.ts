import { NextApiRequest } from "next";

export function getHealthReport(): { ok: boolean; timestamp: string; message: string } {
  // يمكن توسيع هذا لاحقًا ليشمل فحوصات أعمق
  return {
    ok: true,
    timestamp: new Date().toISOString(),
    message: "Site is healthy (basic check)."
  };
}
