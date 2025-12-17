import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { trpc, queryClient, trpcClient } from '@/lib/trpc';
import { useAuth } from '@/lib/hooks/useAuth';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LanguageProvider } from '@/lib/contexts/LanguageContext';

function RootLayoutNav() {
  const { isAuthenticated, hasCompletedOnboarding, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    console.log('[_layout] 🔄 Navigation check:', {
      isLoading,
      isAuthenticated,
      hasCompletedOnboarding,
      currentSegment: segments[0],
    });

    if (isLoading) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const inTabs = segments[0] === '(tabs)';

    // Only redirect if user is definitely not authenticated
    if (!isAuthenticated) {
      console.log('[_layout] ❌ Not authenticated - redirecting to onboarding');
      // User not registered, show onboarding
      if (!inOnboarding) {
        console.log('[_layout] 🚀 Navigating to welcome screen');
        router.replace('/(onboarding)/welcome');
      }
    } else if (isAuthenticated && hasCompletedOnboarding) {
      console.log('[_layout] ✅ Authenticated and onboarded - redirecting to tabs');
      // User registered and completed onboarding, show main app
      if (!inTabs) {
        console.log('[_layout] 🚀 Navigating to tabs');
        router.replace('/(tabs)');
      }
    } else {
      console.log('[_layout] ⏸️ Authenticated but onboarding not complete');
    }
    // If isAuthenticated but !hasCompletedOnboarding, let the register flow handle navigation
  }, [isAuthenticated, hasCompletedOnboarding, isLoading]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-purple-600">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="storybook" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <RootLayoutNav />
          </QueryClientProvider>
        </trpc.Provider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
