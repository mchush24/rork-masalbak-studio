import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';
import { trpc } from '@/lib/trpc';

// Configure notification handler for foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications() {
  const { user } = useAuth();
  const router = useRouter();
  const registerMutation = trpc.user.registerPushToken.useMutation();
  const registeredRef = useRef(false);

  // Register push token after auth
  useEffect(() => {
    if (!user?.userId || registeredRef.current) return;

    async function registerToken() {
      try {
        // Skip on web
        if (Platform.OS === 'web') {
          console.log('[Push] Skipping push token registration on web');
          return;
        }

        // Request permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('[Push] Permission not granted');
          return;
        }

        // Get Expo push token
        const tokenData = await Notifications.getExpoPushTokenAsync();
        const pushToken = tokenData.data;

        console.log('[Push] Token obtained:', pushToken.substring(0, 20) + '...');

        // Register with backend
        await registerMutation.mutateAsync({
          pushToken,
          platform: Platform.OS as 'ios' | 'android',
        });

        registeredRef.current = true;
        console.log('[Push] Token registered successfully');
      } catch (error) {
        console.warn('[Push] Registration failed:', error);
      }
    }

    registerToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  // Handle notification taps
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;

      if (data?.type === 'badge_earned') {
        router.push('/(tabs)/profile');
      }

      console.log('[Push] Notification tapped:', data);
    });

    return () => subscription.remove();
  }, [router]);

  // Handle foreground notifications
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Push] Foreground notification:', notification.request.content);
    });

    return () => subscription.remove();
  }, []);
}
