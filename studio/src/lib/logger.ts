import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  ...(isDev
    ? {
        transport: {
          target: 'pino/file',
          options: { destination: 1 },
        },
      }
    : {}),
  // Redact sensitive fields from logs
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token', 'idToken', 'apiKey'],
    censor: '[REDACTED]',
  },
  // Add context fields in production
  base: isDev ? undefined : { pid: process.pid, hostname: undefined },
});

/**
 * Create a child logger with a component name.
 * Usage: const log = createLogger('Dashboard');
 *        log.info({ userId }, 'Fetched insights');
 */
export function createLogger(component: string) {
  return logger.child({ component });
}

/**
 * Safely serialize an error for logging.
 */
export function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack, name: error.name };
  }
  return { message: String(error) };
}
