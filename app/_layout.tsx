import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { trpc, queryClient, trpcClient } from '@/lib/trpc';
import { useAuth } from '@/lib/hooks/useAuth';
import { useChild } from '@/lib/contexts/ChildContext';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LanguageProvider } from '@/lib/contexts/LanguageContext';
import { ChildProvider } from '@/lib/contexts/ChildContext';
import { FloatingChildSelector } from '@/components/FloatingChildSelector';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';
import { Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, hasCompletedOnboarding, isLoading } = useAuth();
  const { selectedChild, setSelectedChild, children: userChildren } = useChild();
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

  // Show floating child selector only when authenticated and in tabs
  const showFloatingSelector = isAuthenticated && hasCompletedOnboarding && segments[0] === '(tabs)';

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-purple-600">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="storybook" options={{ headerShown: false }} />
      </Stack>

      {/* Floating Child Selector - visible on all tab screens */}
      <FloatingChildSelector
        selectedChild={selectedChild}
        children={userChildren}
        onSelectChild={setSelectedChild}
        visible={showFloatingSelector}
      />
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
      <LanguageProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <ChildProvider>
              <RootLayoutNav />
            </ChildProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
