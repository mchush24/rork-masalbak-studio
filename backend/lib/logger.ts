/**
 * Standardized Logger for Backend
 *
 * Features:
 * - Log levels (debug, info, warn, error)
 * - Production-safe (debug logs disabled in production)
 * - Structured logging with context
 * - Timestamp support
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  module?: string;
  userId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Get minimum log level from environment
const getMinLogLevel = (): LogLevel => {
  const env = process.env.NODE_ENV;
  const configLevel = process.env.LOG_LEVEL as LogLevel | undefined;

  if (configLevel && LOG_LEVELS[configLevel] !== undefined) {
    return configLevel;
  }

  // Default: debug in development, info in production
  return env === 'production' ? 'info' : 'debug';
};

const MIN_LOG_LEVEL = getMinLogLevel();

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

function formatMessage(level: LogLevel, module: string, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}${contextStr}`;
}

/**
 * Create a logger instance for a specific module
 */
export function createLogger(module: string) {
  return {
    debug(message: string, context?: LogContext) {
      if (shouldLog('debug')) {
        console.log(formatMessage('debug', module, message, context));
      }
    },

    info(message: string, context?: LogContext) {
      if (shouldLog('info')) {
        console.log(formatMessage('info', module, message, context));
      }
    },

    warn(message: string, context?: LogContext) {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', module, message, context));
      }
    },

    error(message: string, error?: Error | unknown, context?: LogContext) {
      if (shouldLog('error')) {
        const errorContext = error instanceof Error
          ? { ...context, errorName: error.name, errorMessage: error.message, stack: error.stack?.split('\n').slice(0, 3).join('\n') }
          : { ...context, error: String(error) };
        console.error(formatMessage('error', module, message, errorContext));
      }
    },
  };
}

/**
 * Default logger for quick usage
 */
export const logger = createLogger('App');

/**
 * Log HTTP request (for middleware)
 */
export function logRequest(method: string, path: string, statusCode: number, durationMs: number, context?: LogContext) {
  const log = createLogger('HTTP');
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  log[level](`${method} ${path} ${statusCode} ${durationMs}ms`, context);
}

/**
 * Log database query (for debugging)
 */
export function logQuery(operation: string, table: string, durationMs: number, context?: LogContext) {
  const log = createLogger('DB');
  log.debug(`${operation} ${table} ${durationMs}ms`, context);
}

/**
 * Log external API call
 */
export function logExternalCall(service: string, operation: string, success: boolean, durationMs: number, context?: LogContext) {
  const log = createLogger('External');
  const level = success ? 'info' : 'warn';
  log[level](`${service}.${operation} ${success ? 'OK' : 'FAILED'} ${durationMs}ms`, context);
}

export default logger;
