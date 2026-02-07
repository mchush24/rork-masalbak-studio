/**
 * Frontend Logger Utility
 *
 * Provides structured logging with environment-aware behavior:
 * - Development: All logs visible
 * - Production: Only warnings and errors
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  prefix?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isDev = __DEV__ || process.env.NODE_ENV === 'development';

const defaultConfig: LoggerConfig = {
  enabled: true,
  minLevel: isDev ? 'debug' : 'warn',
};

class Logger {
  private config: LoggerConfig;
  private prefix: string;

  constructor(prefix?: string, config: Partial<LoggerConfig> = {}) {
    this.prefix = prefix || '';
    this.config = { ...defaultConfig, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private formatMessage(message: string): string {
    return this.prefix ? `[${this.prefix}] ${message}` : message;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage(message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage(message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage(message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage(message), ...args);
    }
  }

  /**
   * Create a child logger with a specific prefix
   */
  child(prefix: string): Logger {
    const childPrefix = this.prefix ? `${this.prefix}:${prefix}` : prefix;
    return new Logger(childPrefix, this.config);
  }
}

// Default logger instance
export const logger = new Logger();

// Factory function to create namespaced loggers
export function createLogger(prefix: string): Logger {
  return new Logger(prefix);
}

// Pre-configured loggers for common areas
export const authLogger = createLogger('Auth');
export const apiLogger = createLogger('API');
export const navigationLogger = createLogger('Navigation');
export const storageLogger = createLogger('Storage');
