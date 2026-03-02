export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.info(`[INFO] ${new Date().toISOString()}: ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...args);
  },
  error: (message: string, error?: unknown, ...args: unknown[]) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error, ...args);
    // In production, integrate with Sentry, LogRocket, or Datadog here
  }
};
