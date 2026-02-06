/**
 * ErrorBoundary - Application Crash Protection
 * Part of #1: Hata Ekranı UI/UX Yeniden Tasarımı
 *
 * React Error Boundary - catches child component errors
 * Must be a class component (React requirement)
 *
 * Features:
 * - Error categorization and recovery suggestions
 * - Automatic retry mechanism with max attempts
 * - Error ID generation for support reference
 * - Sentry integration for production error reporting
 * - Analytics tracking
 * - Role-aware error display via ErrorState
 * - Copy/Share error report functionality
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Share,
} from 'react-native';
import { Clipboard } from 'react-native';
import { Copy, Share2, RefreshCw, Home, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { RenkooColors, Colors, ProfessionalColors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { ErrorState, ErrorType } from '@/components/ui/ErrorState';
import { analytics } from '@/lib/analytics';
import * as Sentry from '@sentry/react-native';

// =============================================================================
// Types
// =============================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Which section this boundary protects (for logging) */
  boundary?: string;
  /** Navigate home callback after error */
  onNavigateHome?: () => void;
  /** Enable automatic error reporting */
  enableReporting?: boolean;
  /** Recovery strategy */
  recoveryStrategy?: 'retry' | 'reload' | 'navigate';
  /** Show detailed error info (for professionals) */
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  errorId: string | null;
  showDebugDetails: boolean;
  copied: boolean;
}

// =============================================================================
// Error Categorization
// =============================================================================

function categorizeError(error: Error): ErrorType {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  if (message.includes('network') || message.includes('fetch') || message.includes('connection') || message.includes('offline')) {
    return 'network';
  }
  if (message.includes('timeout') || message.includes('timed out') || message.includes('aborted')) {
    return 'timeout';
  }
  if (message.includes('401') || message.includes('unauthorized') || message.includes('auth') || message.includes('token')) {
    return 'auth';
  }
  if (message.includes('404') || message.includes('not found') || message.includes('missing')) {
    return 'notfound';
  }
  if (message.includes('500') || message.includes('server') || message.includes('internal') || message.includes('502') || message.includes('503')) {
    return 'server';
  }
  if (message.includes('permission') || message.includes('denied') || message.includes('forbidden') || message.includes('403')) {
    return 'permission';
  }
  return 'generic';
}

// Generate unique error ID for support reference
function generateErrorId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ERR-${timestamp}-${random}`.toUpperCase();
}

// Get user-friendly error message based on category
function getErrorMessage(type: ErrorType): { title: string; description: string } {
  const messages: Record<ErrorType, { title: string; description: string }> = {
    network: {
      title: 'Bağlantı Sorunu',
      description: 'İnternet bağlantınızı kontrol edip tekrar deneyin.',
    },
    timeout: {
      title: 'İşlem Zaman Aşımı',
      description: 'İşlem beklenenden uzun sürdü. Lütfen tekrar deneyin.',
    },
    auth: {
      title: 'Oturum Hatası',
      description: 'Oturumunuz sona ermiş olabilir. Tekrar giriş yapın.',
    },
    notfound: {
      title: 'İçerik Bulunamadı',
      description: 'Aradığınız içerik mevcut değil veya taşınmış olabilir.',
    },
    server: {
      title: 'Sunucu Hatası',
      description: 'Sunucularımızda geçici bir sorun var. Biraz sonra tekrar deneyin.',
    },
    permission: {
      title: 'Erişim Hatası',
      description: 'Bu içeriğe erişim yetkiniz bulunmuyor.',
    },
    generic: {
      title: 'Beklenmeyen Hata',
      description: 'Bir sorun oluştu. Lütfen tekrar deneyin.',
    },
  };

  return messages[type];
}

// =============================================================================
// Error Boundary Component
// =============================================================================

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: null,
      showDebugDetails: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { boundary = 'unknown', onError, enableReporting = true } = this.props;
    const { errorId } = this.state;

    console.error(`[ErrorBoundary:${boundary}] Caught error:`, error);
    console.error(`[ErrorBoundary:${boundary}] Component stack:`, errorInfo.componentStack);

    this.setState({ errorInfo });

    // Analytics tracking
    if (enableReporting) {
      analytics.trackError(
        error.name,
        error.message,
        errorInfo.componentStack || undefined,
        boundary === 'app' // app level errors are fatal
      );
    }

    // Custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Report to Sentry (production only)
    if (!__DEV__) {
      Sentry.captureException(error, {
        tags: {
          boundary,
          errorType: categorizeError(error),
        },
        extra: {
          errorId,
          componentStack: errorInfo.componentStack,
          retryCount: this.state.retryCount,
        },
        level: boundary === 'app' ? 'fatal' : 'error',
      });
    }

    // Dev mode logging
    if (__DEV__) {
      console.group(`[ErrorBoundary:${boundary}] Error Details`);
      console.log('Error ID:', errorId);
      console.log('Error Type:', categorizeError(error));
      console.log('Boundary:', boundary);
      console.log('Retry Count:', this.state.retryCount);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    const maxRetries = 3;

    if (retryCount >= maxRetries) {
      console.warn('[ErrorBoundary] Max retries reached');
      return;
    }

    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prev.retryCount + 1,
      errorId: null,
      showDebugDetails: false,
      copied: false,
    }));
  };

  handleCopyError = async () => {
    const { error, errorInfo, errorId } = this.state;
    const { boundary = 'unknown' } = this.props;

    if (!error) return;

    const errorReport = `
Renkioo Hata Raporu
==================
ID: ${errorId}
Tarih: ${new Date().toISOString()}
Bölüm: ${boundary}
Platform: ${Platform.OS} ${Platform.Version}

Hata: ${error.name}
Mesaj: ${error.message}

Stack Trace:
${error.stack || 'N/A'}

Component Stack:
${errorInfo?.componentStack || 'N/A'}
`.trim();

    try {
      Clipboard.setString(errorReport);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (e) {
      console.warn('[ErrorBoundary] Failed to copy error:', e);
    }
  };

  handleShareError = async () => {
    const { error, errorInfo, errorId } = this.state;
    const { boundary = 'unknown' } = this.props;

    if (!error) return;

    const errorReport = `
Renkioo Hata Raporu

Hata ID: ${errorId}
Hata: ${error.name}: ${error.message}
Bölüm: ${boundary}
Tarih: ${new Date().toLocaleString('tr-TR')}
Platform: ${Platform.OS}
`.trim();

    try {
      await Share.share({
        message: errorReport,
        title: 'Renkioo Hata Raporu',
      });
    } catch (e) {
      console.warn('[ErrorBoundary] Failed to share error:', e);
    }
  };

  handleNavigateHome = () => {
    const { onNavigateHome } = this.props;

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: null,
      showDebugDetails: false,
      copied: false,
    });

    onNavigateHome?.();
  };

  toggleDebugDetails = () => {
    this.setState((prev) => ({ showDebugDetails: !prev.showDebugDetails }));
  };

  render() {
    const { hasError, error, errorInfo, retryCount, errorId, showDebugDetails, copied } = this.state;
    const { children, fallback, boundary, onNavigateHome, showDetails } = this.props;

    if (hasError) {
      // Custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }

      const errorType = error ? categorizeError(error) : 'generic';
      const canRetry = retryCount < 3;
      const errorMessage = getErrorMessage(errorType);

      return (
        <View style={styles.container}>
          {/* Main Error State Component */}
          <ErrorState
            type={errorType}
            title={errorMessage.title}
            description={errorMessage.description}
            onRetry={canRetry ? this.handleRetry : undefined}
            onGoBack={onNavigateHome ? this.handleNavigateHome : undefined}
            showSupport={!canRetry}
            errorCode={errorId || undefined}
          />

          {/* Retry Progress */}
          {retryCount > 0 && canRetry && (
            <View style={styles.retryProgressContainer}>
              <View style={styles.retryProgressBar}>
                {[1, 2, 3].map((i) => (
                  <View
                    key={i}
                    style={[
                      styles.retryDot,
                      i <= retryCount && styles.retryDotActive,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.retryInfo}>
                Deneme {retryCount}/3
              </Text>
            </View>
          )}

          {/* Max Retry Reached */}
          {!canRetry && (
            <View style={styles.maxRetryContainer}>
              <AlertTriangle size={20} color={Colors.semantic.error} />
              <Text style={styles.maxRetryText}>
                Birden fazla deneme başarısız oldu.
              </Text>
              {onNavigateHome && (
                <Pressable
                  onPress={this.handleNavigateHome}
                  style={styles.homeButton}
                >
                  <Home size={16} color={Colors.neutral.white} />
                  <Text style={styles.homeButtonText}>Ana Sayfaya Dön</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <Pressable
              onPress={this.handleCopyError}
              style={[styles.actionButton, copied && styles.actionButtonActive]}
            >
              <Copy size={14} color={copied ? Colors.semantic.success : Colors.neutral.medium} />
              <Text style={[styles.actionButtonText, copied && styles.actionButtonTextActive]}>
                {copied ? 'Kopyalandı!' : 'Kopyala'}
              </Text>
            </Pressable>
            <Pressable
              onPress={this.handleShareError}
              style={styles.actionButton}
            >
              <Share2 size={14} color={Colors.neutral.medium} />
              <Text style={styles.actionButtonText}>Paylaş</Text>
            </Pressable>
          </View>

          {/* Debug Details Toggle (Dev or showDetails) */}
          {(__DEV__ || showDetails) && error && (
            <View style={styles.debugSection}>
              <Pressable
                onPress={this.toggleDebugDetails}
                style={styles.debugToggle}
              >
                <Text style={styles.debugToggleText}>
                  Teknik Detaylar
                </Text>
                {showDebugDetails ? (
                  <ChevronUp size={16} color={Colors.neutral.medium} />
                ) : (
                  <ChevronDown size={16} color={Colors.neutral.medium} />
                )}
              </Pressable>

              {showDebugDetails && (
                <ScrollView style={styles.debugContainer}>
                  <Text style={styles.debugTitle}>
                    {boundary || 'root'} - {errorType}
                  </Text>
                  <Text style={styles.debugText}>
                    {error.name}: {error.message}
                  </Text>
                  {errorInfo?.componentStack && (
                    <Text style={styles.debugStack}>
                      {errorInfo.componentStack.slice(0, 500)}
                    </Text>
                  )}
                </ScrollView>
              )}
            </View>
          )}
        </View>
      );
    }

    return children;
  }
}

// =============================================================================
// Wrapper Components
// =============================================================================

interface WrapperProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/** App-level Error Boundary */
export function AppErrorBoundary({ children, onError }: WrapperProps) {
  return (
    <ErrorBoundary boundary="app" onError={onError} enableReporting>
      {children}
    </ErrorBoundary>
  );
}

/** Screen/Page-level Error Boundary */
export function ScreenErrorBoundary({ children, onError }: WrapperProps) {
  return (
    <ErrorBoundary boundary="screen" onError={onError} enableReporting>
      {children}
    </ErrorBoundary>
  );
}

/** Component-level Error Boundary (with minimal fallback) */
export function ComponentErrorBoundary({
  children,
  onError,
  fallback = <View style={styles.componentFallback} />,
}: WrapperProps & { fallback?: ReactNode }) {
  return (
    <ErrorBoundary boundary="component" onError={onError} fallback={fallback} enableReporting={false}>
      {children}
    </ErrorBoundary>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: RenkooColors.backgrounds.light,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['6'],
  },

  // Retry Progress
  retryProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginTop: spacing['4'],
  },
  retryProgressBar: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  retryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.lighter,
  },
  retryDotActive: {
    backgroundColor: Colors.semantic.warning,
  },
  retryInfo: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },

  // Max Retry
  maxRetryContainer: {
    alignItems: 'center',
    marginTop: spacing['4'],
    padding: spacing['4'],
    backgroundColor: Colors.semantic.errorLight,
    borderRadius: radius.lg,
    width: '100%',
    maxWidth: 300,
    gap: spacing['2'],
  },
  maxRetryText: {
    fontSize: typography.size.sm,
    color: Colors.semantic.error,
    textAlign: 'center',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    backgroundColor: Colors.primary.sunset,
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['5'],
    borderRadius: radius.full,
    marginTop: spacing['2'],
  },
  homeButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },

  // Action Buttons
  actionContainer: {
    flexDirection: 'row',
    gap: spacing['3'],
    marginTop: spacing['4'],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['4'],
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.white,
  },
  actionButtonActive: {
    borderColor: Colors.semantic.successLight,
    backgroundColor: Colors.semantic.successLight,
  },
  actionButtonText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },
  actionButtonTextActive: {
    color: Colors.semantic.success,
  },

  // Debug Section
  debugSection: {
    marginTop: spacing['4'],
    width: '100%',
    maxWidth: 320,
  },
  debugToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['2'],
  },
  debugToggleText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },
  debugContainer: {
    marginTop: spacing['2'],
    padding: spacing['4'],
    backgroundColor: '#1a1a2e',
    borderRadius: radius.lg,
    maxHeight: 180,
  },
  debugTitle: {
    color: '#ff6b6b',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: spacing['2'],
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  debugText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: spacing['2'],
  },
  debugStack: {
    color: '#666666',
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 14,
  },

  // Component Fallback
  componentFallback: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderStyle: 'dashed',
  },
});

export default ErrorBoundary;
