import { Stack, useRouter, useSegments, Href } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { trpc, queryClient, trpcClient } from '@/lib/trpc';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { useEffect, useCallback } from 'react';
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LanguageProvider } from '@/lib/contexts/LanguageContext';
import { ChildProvider } from '@/lib/contexts/ChildContext';
import { RoleProvider } from '@/lib/contexts/RoleContext';
import { ThemeProvider } from '@/lib/theme';
import { OverlayProvider } from '@/lib/overlay';
import { ChatBot } from '@/components/ChatBot';
import { AppErrorBoundary, ComponentErrorBoundary } from '@/components/ErrorBoundary';
import { DelightWrapper } from '@/lib/delight';
import { ToastProvider } from '@/components/ui/Toast';
import { OfflineIndicator, CrashRecoveryDialog } from '@/components/ui';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';

// Phase 5 & 6 modules
import { networkMonitor } from '@/lib/network';
import { statePersistence, SessionState } from '@/lib/persistence';
import { globalErrorHandler } from '@/lib/error';
import { analytics } from '@/lib/analytics';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Colors } from '@/constants/colors';

// Initialize Sentry for error tracking (before app renders)
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (SENTRY_DSN && !__DEV__) {
  Sentry.init({
    dsn: SENTRY_DSN,
    // Set environment based on build
    environment: __DEV__ ? 'development' : 'production',
    // Performance monitoring - sample 20% of transactions
    tracesSampleRate: 0.2,
    // Session replay - disabled by default for privacy
    // Enable only if needed and with user consent
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    // Attach user context when available
    attachStacktrace: true,
    // Debug mode in development only
    debug: __DEV__,
    // Ignore common non-critical errors
    ignoreErrors: ['Network request failed', 'Failed to fetch', 'AbortError'],
    // Before sending, sanitize sensitive data
    beforeSend(event) {
      // Remove sensitive user data if present
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });
}

// Web responsive container
const WebContainer = ({ children }: { children: React.ReactNode }) => {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={webStyles.container}>
      <View style={webStyles.phoneFrame}>{children}</View>
    </View>
  );
};

const webStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 430,
    height: '100%',
    maxHeight: 932,
    backgroundColor: Colors.neutral.white,
    borderRadius: Platform.OS === 'web' ? 40 : 0,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      default: {
        shadowColor: Colors.neutral.darkest,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
      },
    }),
  },
});

SplashScreen.preventAutoHideAsync();

// Valid routes for crash recovery (static, defined outside component)
const VALID_RECOVERY_ROUTES = [
  '/(tabs)',
  '/(tabs)/index',
  '/(tabs)/discover',
  '/(tabs)/hayal-atolyesi',
  '/(tabs)/history',
  '/(tabs)/profile',
  '/(tabs)/analysis',
  '/(tabs)/quick-analysis',
  '/(tabs)/advanced-analysis',
  '/(tabs)/stories',
  '/chatbot',
];

function RootLayoutNav() {
  const { isAuthenticated, hasCompletedOnboarding, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Register push notification token after auth
  usePushNotifications();

  // Initialize core services
  useEffect(() => {
    async function initializeServices() {
      try {
        // Initialize network monitor
        await networkMonitor.initialize();

        // Initialize state persistence
        await statePersistence.initialize();

        // Initialize global error handler
        globalErrorHandler.initialize();

        // Initialize analytics
        await analytics.initialize();

        if (__DEV__) {
          console.log('[_layout] All services initialized');
        }
      } catch (error) {
        console.warn('[_layout] Service initialization error:', error);
        // Report initialization errors to Sentry
        if (!__DEV__ && SENTRY_DSN) {
          Sentry.captureException(error, {
            tags: { location: 'service_initialization' },
          });
        }
      }
    }

    initializeServices();

    // Cleanup on unmount
    return () => {
      networkMonitor.cleanup();
      statePersistence.cleanup();
      analytics.flush();
    };
  }, []);

  // Track current screen for persistence
  useEffect(() => {
    const currentSegment = segments[0] as string | undefined;
    if (currentSegment) {
      statePersistence.updateSession({
        lastScreen: currentSegment,
        lastAction: 'navigation',
      });
    }
  }, [segments]);

  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0] as string | undefined;
    const inOnboarding = currentSegment === '(onboarding)';
    const inTabs = currentSegment === '(tabs)';
    const isAtRoot = !currentSegment || currentSegment === 'index';
    // Allow specific authenticated routes outside tabs
    const allowedAuthRoutes = ['chatbot', 'analysis', 'interactive-story'];
    const isAllowedAuthRoute = allowedAuthRoutes.some(route => currentSegment === route);

    if (!isAuthenticated) {
      // Allow root index (RENKİOO home) or onboarding screens
      if (!inOnboarding && !isAtRoot) {
        router.replace('/(onboarding)/welcome');
      }
    } else if (isAuthenticated) {
      if (!hasCompletedOnboarding) {
        // User is authenticated but hasn't completed onboarding
        if (!inOnboarding) {
          router.replace('/(onboarding)/tour');
        }
      } else {
        // User is authenticated and has completed onboarding
        // Allow tabs, chatbot, and dynamic routes (analysis, interactive-story)
        if (!inTabs && !isAllowedAuthRoute) {
          router.replace('/(tabs)');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, hasCompletedOnboarding, isLoading]);

  // Handle crash recovery with route validation
  const handleCrashRecover = useCallback(
    (session: SessionState) => {
      if (session.lastScreen) {
        // Validate route before navigating
        const isValidRoute = VALID_RECOVERY_ROUTES.some(
          route => session.lastScreen === route || session.lastScreen?.startsWith(route + '/')
        );

        if (isValidRoute) {
          try {
            router.push(session.lastScreen as Href);
            return;
          } catch (_e) {
            console.warn('[_layout] Invalid recovery route:', session.lastScreen);
          }
        }
        // Fallback to tabs for invalid or unknown routes
        router.replace('/(tabs)');
      }
    },
    [router]
  );

  // Ioo Assistant: show when authenticated and in tabs
  const showAssistant = isAuthenticated && segments[0] === '(tabs)';

  if (__DEV__) {
    console.log('[_layout] Ioo Assistant visibility:', {
      showAssistant,
      isAuthenticated,
      segment: segments[0],
    });
  }

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#7C3AED',
        }}
      >
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="(onboarding)" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="storybook" />
        <Stack.Screen name="analysis/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="interactive-story/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="chatbot" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="mascot-demo" options={{ animation: 'fade' }} />
      </Stack>

      {showAssistant && (
        <ComponentErrorBoundary fallback={null}>
          <ChatBot />
        </ComponentErrorBoundary>
      )}

      {/* Offline Indicator */}
      <OfflineIndicator position="top" />

      {/* Crash Recovery Dialog */}
      <CrashRecoveryDialog onRecover={handleCrashRecover} />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppErrorBoundary>
        <WebContainer>
          <ThemeProvider>
            <LanguageProvider>
              <RoleProvider>
                <trpc.Provider client={trpcClient} queryClient={queryClient}>
                  <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                      <ChildProvider>
                        <OverlayProvider>
                          <ToastProvider>
                            <DelightWrapper>
                              <RootLayoutNav />
                            </DelightWrapper>
                          </ToastProvider>
                        </OverlayProvider>
                      </ChildProvider>
                    </AuthProvider>
                  </QueryClientProvider>
                </trpc.Provider>
              </RoleProvider>
            </LanguageProvider>
          </ThemeProvider>
        </WebContainer>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
}
