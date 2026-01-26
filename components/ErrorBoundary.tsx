import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { RenkooColors } from '@/constants/colors';

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
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Sonraki render'da fallback UI göster
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Hata logla
    const { boundary = 'unknown', onError } = this.props;

    console.error(`[ErrorBoundary:${boundary}] Caught error:`, error);
    console.error(`[ErrorBoundary:${boundary}] Component stack:`, errorInfo.componentStack);

    this.setState({ errorInfo });

    // Custom error handler (Sentry vb. için)
    if (onError) {
      onError(error, errorInfo);
    }

    // TODO: Sentry entegrasyonu için hazır
    // Sentry.captureException(error, {
    //   contexts: {
    //     react: { componentStack: errorInfo.componentStack },
    //     boundary: { name: boundary }
    //   }
    // });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, boundary } = this.props;

    if (hasError) {
      // Custom fallback varsa kullan
      if (fallback) {
        return <>{fallback}</>;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Üzgün yüz ikonu */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>😢</Text>
            </View>

            <Text style={styles.title}>Bir şeyler ters gitti</Text>
            <Text style={styles.subtitle}>
              Endişelenme, bu bizim hatamız. Tekrar denemeni öneriyoruz.
            </Text>

            {/* Tekrar Dene butonu */}
            <Pressable
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.retryButtonPressed,
              ]}
              onPress={this.handleRetry}
            >
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </Pressable>

            {/* Development modda hata detayları */}
            {__DEV__ && error && (
              <ScrollView style={styles.debugContainer}>
                <Text style={styles.debugTitle}>
                  Debug Info ({boundary || 'root'})
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
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: RenkooColors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: RenkooColors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: RenkooColors.brand.jellyPurple,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: RenkooColors.brand.jellyPurple,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  retryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  debugContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    maxHeight: 200,
    width: '100%',
  },
  debugTitle: {
    color: '#ff6b6b',
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
  },
  debugText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 8,
  },
  debugStack: {
    color: '#888888',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  componentFallback: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
});

export default ErrorBoundary;
