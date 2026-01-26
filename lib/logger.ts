/**
 * Frontend Logger Utility
 *
 * Production-safe logging for React Native
 * - Disabled in production builds by default
 * - Structured logging with tags
 * - Easy to enable for debugging
 */

const isDev = __DEV__;

// Can be enabled via AsyncStorage for production debugging
let forceEnabled = false;

export function enableLogging() {
  forceEnabled = true;
}

export function disableLogging() {
  forceEnabled = false;
}

function shouldLog(): boolean {
  return isDev || forceEnabled;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function formatMessage(level: LogLevel, tag: string, message: string): string {
  const timestamp = new Date().toISOString().slice(11, 23);
  return `[${timestamp}] [${level.toUpperCase()}] [${tag}] ${message}`;
}

/**
 * Create a logger for a specific component/module
 */
export function createLogger(tag: string) {
  return {
    debug(message: string, data?: unknown) {
      if (shouldLog()) {
        if (data !== undefined) {
          console.log(formatMessage('debug', tag, message), data);
        } else {
          console.log(formatMessage('debug', tag, message));
        }
      }
    },

    info(message: string, data?: unknown) {
      if (shouldLog()) {
        if (data !== undefined) {
          console.info(formatMessage('info', tag, message), data);
        } else {
          console.info(formatMessage('info', tag, message));
        }
      }
    },

    warn(message: string, data?: unknown) {
      if (shouldLog()) {
        if (data !== undefined) {
          console.warn(formatMessage('warn', tag, message), data);
        } else {
          console.warn(formatMessage('warn', tag, message));
        }
      }
    },

    error(message: string, error?: Error | unknown) {
      // Always log errors, even in production
      if (error instanceof Error) {
        console.error(formatMessage('error', tag, message), {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 5).join('\n'),
        });
      } else if (error !== undefined) {
        console.error(formatMessage('error', tag, message), error);
      } else {
        console.error(formatMessage('error', tag, message));
      }
    },
  };
}

/**
 * Default logger for quick usage
 */
export const logger = createLogger('App');

/**
 * Performance timing utility
 */
export function createTimer(tag: string) {
  const start = Date.now();
  const log = createLogger(tag);

  return {
    mark(label: string) {
      if (shouldLog()) {
        log.debug(`${label}: ${Date.now() - start}ms`);
      }
    },
    end(label: string = 'Complete') {
      if (shouldLog()) {
        log.info(`${label}: ${Date.now() - start}ms`);
      }
    },
  };
}
