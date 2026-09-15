export const logger = {
  info: (msg: string, ctx?: Record<string, unknown>) =>
    console.log(JSON.stringify({ level: "info", msg, ...ctx, ts: new Date().toISOString() })),
  warn: (msg: string, ctx?: Record<string, unknown>) =>
    console.warn(JSON.stringify({ level: "warn", msg, ...ctx, ts: new Date().toISOString() })),
  error: (msg: string, ctx?: Record<string, unknown>) =>
    console.error(JSON.stringify({ level: "error", msg, ...ctx, ts: new Date().toISOString() })),
};
