// Structured JSON logger with traceId
export function log(message: string, meta: Record<string, any> = {}) {
  const logObj = { timestamp: new Date().toISOString(), message, ...meta };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(logObj));
}
