/**
 * Global Error Handler
 * Phase 5: Error Handling Enhancement
 *
 * Provides:
 * - Centralized error handling
 * - Error categorization
 * - User-friendly messages
 * - Error logging
 * - Recovery suggestions
 */

import { Platform } from 'react-native';
import { analytics } from '@/lib/analytics';

// Hook for using error handler
import { useCallback, useEffect, useState } from 'react';

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Error categories
export type ErrorCategory =
  | 'network'
  | 'auth'
  | 'validation'
  | 'server'
  | 'client'
  | 'permission'
  | 'storage'
  | 'unknown';

// Processed error structure
export interface ProcessedError {
  id: string;
  originalError: Error;
  category: ErrorCategory;
  severity: ErrorSeverity;
  userMessage: string;
  technicalMessage: string;
  recoveryOptions: RecoveryOption[];
  timestamp: number;
  context?: Record<string, unknown>;
}

// Recovery option
export interface RecoveryOption {
  id: string;
  label: string;
  action: () => void | Promise<void>;
  isPrimary?: boolean;
}

// Error patterns for categorization
const ERROR_PATTERNS: {
  pattern: RegExp;
  category: ErrorCategory;
  severity: ErrorSeverity;
  userMessage: string;
}[] = [
  // Network errors
  {
    pattern: /network|fetch|connection|offline|internet/i,
    category: 'network',
    severity: 'medium',
    userMessage: 'İnternet bağlantınızı kontrol edin.',
  },
  {
    pattern: /timeout|timed out|ETIMEDOUT/i,
    category: 'network',
    severity: 'medium',
    userMessage: 'Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.',
  },

  // Auth errors
  {
    pattern: /401|unauthorized|unauthenticated/i,
    category: 'auth',
    severity: 'high',
    userMessage: 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.',
  },
  {
    pattern: /403|forbidden|not allowed/i,
    category: 'permission',
    severity: 'high',
    userMessage: 'Bu işlem için yetkiniz bulunmuyor.',
  },
  {
    pattern: /invalid.*(token|credential|password)/i,
    category: 'auth',
    severity: 'medium',
    userMessage: 'Giriş bilgilerinizi kontrol edin.',
  },

  // Validation errors
  {
    pattern: /validation|invalid|required|missing/i,
    category: 'validation',
    severity: 'low',
    userMessage: 'Girdiğiniz bilgileri kontrol edin.',
  },

  // Server errors
  {
    pattern: /500|internal server|server error/i,
    category: 'server',
    severity: 'high',
    userMessage: 'Sunucuda bir sorun oluştu. Biraz sonra tekrar deneyin.',
  },
  {
    pattern: /502|503|504|bad gateway|service unavailable/i,
    category: 'server',
    severity: 'critical',
    userMessage: 'Sunucularımız şu anda bakımda. Lütfen daha sonra tekrar deneyin.',
  },
  {
    pattern: /404|not found/i,
    category: 'client',
    severity: 'low',
    userMessage: 'Aradığınız içerik bulunamadı.',
  },

  // Storage errors
  {
    pattern: /storage|quota|disk|space/i,
    category: 'storage',
    severity: 'medium',
    userMessage: 'Depolama alanı dolu. Lütfen yer açın.',
  },
];

// Generate unique error ID
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// Categorize error based on patterns
function categorizeError(error: Error): {
  category: ErrorCategory;
  severity: ErrorSeverity;
  userMessage: string;
} {
  const errorString = `${error.name} ${error.message}`;

  for (const pattern of ERROR_PATTERNS) {
    if (pattern.pattern.test(errorString)) {
      return {
        category: pattern.category,
        severity: pattern.severity,
        userMessage: pattern.userMessage,
      };
    }
  }

  // Default
  return {
    category: 'unknown',
    severity: 'medium',
    userMessage: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
  };
}

// Global error handler class
class GlobalErrorHandlerClass {
  private static instance: GlobalErrorHandlerClass;
  private errorHistory: ProcessedError[] = [];
  private maxHistorySize = 50;
  private listeners: Set<(error: ProcessedError) => void> = new Set();
  private isInitialized = false;

  static getInstance(): GlobalErrorHandlerClass {
    if (!GlobalErrorHandlerClass.instance) {
      GlobalErrorHandlerClass.instance = new GlobalErrorHandlerClass();
    }
    return GlobalErrorHandlerClass.instance;
  }

  initialize(): void {
    if (this.isInitialized) return;

    // Set up global error handlers
    this.setupGlobalHandlers();
    this.isInitialized = true;
  }

  private setupGlobalHandlers(): void {
    // Handle unhandled promise rejections
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalHandler = (global as any).ErrorUtils?.getGlobalHandler?.();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).ErrorUtils?.setGlobalHandler?.((error: Error, isFatal?: boolean) => {
      this.handleError(error, { isFatal, source: 'global' });
      originalHandler?.(error, isFatal);
    });

    // Handle unhandled promise rejections in React Native
    if (typeof global !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const rejectionTracking = require('promise/setimmediate/rejection-tracking');
      rejectionTracking.enable({
        allRejections: true,
        onUnhandled: (id: number, error: Error) => {
          this.handleError(error, { source: 'unhandledRejection', promiseId: id });
        },
        onHandled: () => {},
      });
    }
  }

  // Main error handling method
  handleError(error: Error | unknown, context?: Record<string, unknown>): ProcessedError {
    // Normalize error
    const normalizedError = this.normalizeError(error);

    // Categorize
    const { category, severity, userMessage } = categorizeError(normalizedError);

    // Create processed error
    const processedError: ProcessedError = {
      id: generateErrorId(),
      originalError: normalizedError,
      category,
      severity,
      userMessage,
      technicalMessage: normalizedError.message,
      recoveryOptions: this.getRecoveryOptions(category),
      timestamp: Date.now(),
      context: {
        ...context,
        platform: Platform.OS,
        version: Platform.Version,
      },
    };

    // Store in history
    this.addToHistory(processedError);

    // Log to analytics
    this.logToAnalytics(processedError);

    // Notify listeners
    this.notifyListeners(processedError);

    // Console log in dev
    if (__DEV__) {
      console.group(`[GlobalErrorHandler] ${category.toUpperCase()} Error`);
      console.log('ID:', processedError.id);
      console.log('Severity:', severity);
      console.log('Message:', normalizedError.message);
      console.log('User Message:', userMessage);
      console.log('Context:', context);
      console.groupEnd();
    }

    return processedError;
  }

  // Normalize unknown errors to Error objects
  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'string') {
      return new Error(error);
    }

    if (typeof error === 'object' && error !== null) {
      const obj = error as Record<string, unknown>;
      return new Error((obj.message as string) || (obj.error as string) || JSON.stringify(error));
    }

    return new Error('Unknown error occurred');
  }

  // Get recovery options based on error category
  private getRecoveryOptions(category: ErrorCategory): RecoveryOption[] {
    const options: RecoveryOption[] = [];

    switch (category) {
      case 'network':
        options.push({
          id: 'retry',
          label: 'Tekrar Dene',
          action: () => {},
          isPrimary: true,
        });
        options.push({
          id: 'checkConnection',
          label: 'Bağlantıyı Kontrol Et',
          action: () => {},
        });
        break;

      case 'auth':
        options.push({
          id: 'login',
          label: 'Tekrar Giriş Yap',
          action: () => {},
          isPrimary: true,
        });
        break;

      case 'validation':
        options.push({
          id: 'fix',
          label: 'Düzelt',
          action: () => {},
          isPrimary: true,
        });
        break;

      case 'server':
        options.push({
          id: 'retry',
          label: 'Tekrar Dene',
          action: () => {},
          isPrimary: true,
        });
        options.push({
          id: 'support',
          label: 'Destek Al',
          action: () => {},
        });
        break;

      default:
        options.push({
          id: 'retry',
          label: 'Tekrar Dene',
          action: () => {},
          isPrimary: true,
        });
        options.push({
          id: 'home',
          label: 'Ana Sayfaya Dön',
          action: () => {},
        });
    }

    return options;
  }

  // Add to error history
  private addToHistory(error: ProcessedError): void {
    this.errorHistory.unshift(error);

    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  // Log to analytics
  private logToAnalytics(error: ProcessedError): void {
    analytics.trackError(
      error.originalError.name,
      error.originalError.message,
      error.originalError.stack,
      error.severity === 'critical'
    );
  }

  // Notify listeners
  private notifyListeners(error: ProcessedError): void {
    this.listeners.forEach(listener => {
      try {
        listener(error);
      } catch (e) {
        console.warn('[GlobalErrorHandler] Listener error:', e);
      }
    });
  }

  // Subscribe to errors
  subscribe(listener: (error: ProcessedError) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get error history
  getHistory(): ProcessedError[] {
    return [...this.errorHistory];
  }

  // Get recent errors by category
  getErrorsByCategory(category: ErrorCategory): ProcessedError[] {
    return this.errorHistory.filter(e => e.category === category);
  }

  // Get error by ID
  getErrorById(id: string): ProcessedError | undefined {
    return this.errorHistory.find(e => e.id === id);
  }

  // Clear history
  clearHistory(): void {
    this.errorHistory = [];
  }

  // Check if similar error occurred recently
  hasSimilarRecentError(error: Error, withinMs = 5000): boolean {
    const now = Date.now();
    return this.errorHistory.some(
      e => e.originalError.message === error.message && now - e.timestamp < withinMs
    );
  }
}

export const globalErrorHandler = GlobalErrorHandlerClass.getInstance();

export function useGlobalErrorHandler() {
  const [lastError, setLastError] = useState<ProcessedError | null>(null);

  useEffect(() => {
    globalErrorHandler.initialize();
    const unsubscribe = globalErrorHandler.subscribe(setLastError);
    return unsubscribe;
  }, []);

  const handleError = useCallback((error: Error | unknown, context?: Record<string, unknown>) => {
    return globalErrorHandler.handleError(error, context);
  }, []);

  const clearLastError = useCallback(() => {
    setLastError(null);
  }, []);

  return {
    lastError,
    handleError,
    clearLastError,
    getHistory: globalErrorHandler.getHistory.bind(globalErrorHandler),
    clearHistory: globalErrorHandler.clearHistory.bind(globalErrorHandler),
  };
}

// Utility: Wrap async function with error handling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Record<string, unknown>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      globalErrorHandler.handleError(error, {
        ...context,
        functionName: fn.name,
        args: args.map(arg => (typeof arg === 'object' ? '[object]' : String(arg))),
      });
      throw error;
    }
  }) as T;
}

// Utility: Create typed error
export function createError(
  message: string,
  category: ErrorCategory,
  details?: Record<string, unknown>
): Error {
  const error = new Error(message);
  error.name = `${category.charAt(0).toUpperCase() + category.slice(1)}Error`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error as any).category = category;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (error as any).details = details;
  return error;
}

export default globalErrorHandler;
