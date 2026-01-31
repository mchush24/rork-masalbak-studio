import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { trpc, queryClient, trpcClient } from '@/lib/trpc';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect } from 'react';
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LanguageProvider } from '@/lib/contexts/LanguageContext';
import { ChildProvider } from '@/lib/contexts/ChildContext';
import { ChatBot } from '@/components/ChatBot';
import { AppErrorBoundary, ComponentErrorBoundary } from '@/components/ErrorBoundary';
import { DelightWrapper } from '@/lib/delight';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';
import { Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import * as SplashScreen from 'expo-splash-screen';

// Web responsive container
const WebContainer = ({ children }: { children: React.ReactNode }) => {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={webStyles.container}>
      <View style={webStyles.phoneFrame}>
        {children}
      </View>
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
    backgroundColor: '#FFFFFF',
    borderRadius: Platform.OS === 'web' ? 40 : 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    // @ts-ignore - web only
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
});

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, hasCompletedOnboarding, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const currentSegment = segments[0] as string | undefined;
    const inOnboarding = currentSegment === '(onboarding)';
    const inTabs = currentSegment === '(tabs)';
    const isAtRoot = !currentSegment || currentSegment === 'index';

    if (!isAuthenticated) {
      // Allow root index (RENKİOO home) or onboarding screens
      if (!inOnboarding && !isAtRoot) {
        router.replace('/(onboarding)/welcome');
      }
    } else if (isAuthenticated && hasCompletedOnboarding) {
      if (!inTabs) {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, hasCompletedOnboarding, isLoading]);

  // ChatBot: show when authenticated and in tabs (onboarding check removed for now)
  const showChatBot = isAuthenticated && segments[0] === '(tabs)';

  console.log('[_layout] ChatBot visibility:', { showChatBot, isAuthenticated, segment: segments[0] });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#7C3AED' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="storybook" />
      </Stack>

      {showChatBot && (
        <ComponentErrorBoundary fallback={null}>
          <ChatBot />
        </ComponentErrorBoundary>
      )}
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
          <LanguageProvider>
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
              <QueryClientProvider client={queryClient}>
                <ChildProvider>
                  <DelightWrapper>
                    <RootLayoutNav />
                  </DelightWrapper>
                </ChildProvider>
              </QueryClientProvider>
            </trpc.Provider>
          </LanguageProvider>
        </WebContainer>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
}
