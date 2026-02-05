import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Share,
  Clipboard,
} from 'react-native';
import { Copy, Share2, RefreshCw, Home } from 'lucide-react-native';
import { RenkooColors, Colors } from '@/constants/colors';
import { typography, spacing, radius } from '@/constants/design-system';
import { ErrorState, ErrorType } from '@/components/ui/ErrorState';
import { analytics } from '@/lib/analytics';
import * as Sentry from '@sentry/react-native';

// =============================================================================
// Error Boundary - Uygulama Crash Koruması
// =============================================================================
// React Error Boundary - child component hatalarını yakalar
// Class component olmalı (React gerekliliği)
// =============================================================================

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Hangi bölümü koruduğunu belirtir (loglama için) */
  boundary?: string;
  /** Hata sonrası ana sayfaya yönlendirme callback'i */
  onNavigateHome?: () => void;
  /** Otomatik hata raporlama */
  enableReporting?: boolean;
  /** Recovery stratejisi */
  recoveryStrategy?: 'retry' | 'reload' | 'navigate';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  errorId: string | null;
}

// Hata kategorilendirme
function categorizeError(error: Error): ErrorType {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'network';
  }
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'timeout';
  }
  if (message.includes('401') || message.includes('unauthorized') || message.includes('auth')) {
    return 'auth';
  }
  if (message.includes('404') || message.includes('not found')) {
    return 'notfound';
  }
  if (message.includes('500') || message.includes('server') || message.includes('internal')) {
    return 'server';
  }
  if (message.includes('permission') || message.includes('denied')) {
    return 'permission';
  }
  return 'generic';
}

// Benzersiz hata ID'si oluştur
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Sonraki render'da fallback UI göster
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Hata logla
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
        boundary === 'app' // app seviyesi hatalar fatal sayılır
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

    // Log error details for debugging
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
      // Çok fazla retry, farklı strateji öner
      console.warn('[ErrorBoundary] Max retries reached');
      return;
    }

    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prev.retryCount + 1,
      errorId: null,
    }));
  };

  handleCopyError = async () => {
    const { error, errorInfo, errorId } = this.state;
    const { boundary = 'unknown' } = this.props;

    if (!error) return;

    const errorReport = `
Hata Raporu
===========
ID: ${errorId}
Tarih: ${new Date().toISOString()}
Boundary: ${boundary}
Platform: ${Platform.OS}

Hata: ${error.name}
Mesaj: ${error.message}

Stack Trace:
${error.stack || 'N/A'}

Component Stack:
${errorInfo?.componentStack || 'N/A'}
`.trim();

    try {
      Clipboard.setString(errorReport);
      // TODO: Toast göster
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
    });

    onNavigateHome?.();
  };

  render() {
    const { hasError, error, errorInfo, retryCount, errorId } = this.state;
    const { children, fallback, boundary, onNavigateHome, recoveryStrategy = 'retry' } = this.props;

    if (hasError) {
      // Custom fallback varsa kullan
      if (fallback) {
        return <>{fallback}</>;
      }

      const errorType = error ? categorizeError(error) : 'generic';
      const canRetry = retryCount < 3;

      // Default error UI with ErrorState component
      return (
        <View style={styles.container}>
          <ErrorState
            type={errorType}
            title="Bir şeyler ters gitti"
            description="Endişelenme, bu bizim hatamız. Tekrar denemeni öneriyoruz."
            onRetry={canRetry ? this.handleRetry : undefined}
            onGoBack={onNavigateHome ? this.handleNavigateHome : undefined}
            showSupport
          />

          {/* Retry count indicator */}
          {retryCount > 0 && canRetry && (
            <Text style={styles.retryInfo}>
              Deneme: {retryCount}/3
            </Text>
          )}

          {/* Max retry reached message */}
          {!canRetry && (
            <View style={styles.maxRetryContainer}>
              <Text style={styles.maxRetryText}>
                Birden fazla deneme başarısız oldu.
              </Text>
              {onNavigateHome && (
                <Pressable
                  onPress={this.handleNavigateHome}
                  style={styles.homeButton}
                >
                  <Home size={18} color={Colors.neutral.white} />
                  <Text style={styles.homeButtonText}>Ana Sayfaya Dön</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Action buttons for error sharing */}
          <View style={styles.actionContainer}>
            <Pressable
              onPress={this.handleCopyError}
              style={styles.actionButton}
            >
              <Copy size={16} color={Colors.neutral.medium} />
              <Text style={styles.actionButtonText}>Kopyala</Text>
            </Pressable>
            <Pressable
              onPress={this.handleShareError}
              style={styles.actionButton}
            >
              <Share2 size={16} color={Colors.neutral.medium} />
              <Text style={styles.actionButtonText}>Paylaş</Text>
            </Pressable>
          </View>

          {/* Error ID for support reference */}
          {errorId && (
            <Text style={styles.errorId}>
              Hata Kodu: {errorId}
            </Text>
          )}

          {/* Development modda hata detayları */}
          {__DEV__ && error && (
            <ScrollView style={styles.debugContainer}>
              <Text style={styles.debugTitle}>
                Debug Info ({boundary || 'root'})
              </Text>
              <Text style={styles.debugText}>
                {error.name}: {error.message}
              </Text>
              <Text style={styles.debugType}>
                Type: {errorType}
              </Text>
              {errorInfo?.componentStack && (
                <Text style={styles.debugStack}>
                  {errorInfo.componentStack.slice(0, 500)}
                </Text>
              )}
            </ScrollView>
          )}
        </View>
      );
    }

    return children;
  }
}

// =============================================================================
// Wrapper Components - Kolay kullanım için
// =============================================================================

interface WrapperProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/** Ana uygulama için Error Boundary */
export function AppErrorBoundary({ children, onError }: WrapperProps) {
  return (
    <ErrorBoundary boundary="app" onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

/** Ekran/sayfa seviyesinde Error Boundary */
export function ScreenErrorBoundary({ children, onError }: WrapperProps) {
  return (
    <ErrorBoundary boundary="screen" onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

/** Component seviyesinde Error Boundary (fallback: boş view) */
export function ComponentErrorBoundary({
  children,
  onError,
  fallback = <View style={styles.componentFallback} />
}: WrapperProps & { fallback?: ReactNode }) {
  return (
    <ErrorBoundary boundary="component" onError={onError} fallback={fallback}>
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

  // Retry info
  retryInfo: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    marginTop: spacing['2'],
  },

  // Max retry container
  maxRetryContainer: {
    alignItems: 'center',
    marginTop: spacing['4'],
    padding: spacing['4'],
    backgroundColor: Colors.semantic.errorLight,
    borderRadius: radius.lg,
    width: '100%',
    maxWidth: 300,
  },
  maxRetryText: {
    fontSize: typography.size.sm,
    color: Colors.semantic.error,
    textAlign: 'center',
    marginBottom: spacing['3'],
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
  },
  homeButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },

  // Action buttons
  actionContainer: {
    flexDirection: 'row',
    gap: spacing['4'],
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
  },
  actionButtonText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },

  // Error ID
  errorId: {
    fontSize: typography.size.xs,
    color: Colors.neutral.light,
    marginTop: spacing['4'],
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Debug container
  debugContainer: {
    marginTop: spacing['4'],
    padding: spacing['4'],
    backgroundColor: '#1a1a2e',
    borderRadius: radius.lg,
    maxHeight: 200,
    width: '100%',
    maxWidth: 320,
  },
  debugTitle: {
    color: '#ff6b6b',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: spacing['2'],
  },
  debugText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: spacing['2'],
  },
  debugType: {
    color: '#ffd93d',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: spacing['2'],
  },
  debugStack: {
    color: '#888888',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  componentFallback: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: radius.lg,
  },
});

export default ErrorBoundary;
