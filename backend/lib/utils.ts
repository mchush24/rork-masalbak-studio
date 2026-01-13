/**
 * Shared utility functions for backend operations
 */

// ============================================
// Logger Utility
// ============================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Set via LOG_LEVEL env var (default: 'info' in production, 'debug' in development)
const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function formatTimestamp(): string {
  return new Date().toISOString();
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

/**
 * Structured logger for backend operations
 *
 * Usage:
 *   logger.info('[Module] Message', { data });
 *   logger.error('[Module] Error:', error);
 *
 * Configure via LOG_LEVEL env var: 'debug' | 'info' | 'warn' | 'error'
 */
export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.log(`[${formatTimestamp()}] [DEBUG]`, ...args);
    }
  },

  info: (...args: unknown[]) => {
    if (shouldLog('info')) {
      console.log(`[${formatTimestamp()}] [INFO]`, ...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn(`[${formatTimestamp()}] [WARN]`, ...args);
    }
  },

  error: (...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error(`[${formatTimestamp()}] [ERROR]`, ...args);
    }
  },
};

// ============================================
// HTML Utilities
// ============================================

/**
 * Escape HTML special characters to prevent XSS
 * @param s - String to escape
 * @returns Escaped string safe for HTML insertion
 */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}
