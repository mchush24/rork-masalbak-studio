/**
 * OfflineIndicator Component
 * Phase 6: Integration
 *
 * Shows a banner when user loses internet connection
 * with animated entrance/exit and reconnection feedback
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WifiOff, Wifi, RefreshCw, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows, zIndex } from '@/constants/design-system';
import { useOfflineIndicator, networkMonitor } from '@/lib/network';
import { useHapticFeedback } from '@/lib/haptics';

interface OfflineIndicatorProps {
  /** Position of the indicator */
  position?: 'top' | 'bottom';
  /** Allow user to dismiss */
  dismissible?: boolean;
  /** Show retry button */
  showRetry?: boolean;
  /** Custom message */
  message?: string;
  /** On retry callback */
  onRetry?: () => void;
}

export function OfflineIndicator({
  position = 'top',
  dismissible = false,
  showRetry = true,
  message,
  onRetry,
}: OfflineIndicatorProps) {
  const insets = useSafeAreaInsets();
  const { showIndicator, isOnline, message: defaultMessage } = useOfflineIndicator();
  const { tapLight, warning, success } = useHapticFeedback();

  // Track visibility with React state (not shared value) to avoid reading .value during render
  const [isVisible, setIsVisible] = useState(showIndicator);

  // Animation values
  const translateY = useSharedValue(position === 'top' ? -100 : 100);
  const opacity = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Track previous online state for haptic feedback
  const wasOnlineRef = useRef(isOnline);

  useEffect(() => {
    if (showIndicator) {
      // Make visible immediately when showing
      setIsVisible(true);

      // Show animation
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });

      // Start pulse animation when offline
      if (!isOnline) {
        pulseScale.value = withSequence(
          withTiming(1.05, { duration: 500 }),
          withTiming(1, { duration: 500 })
        );
      }

      // Haptic feedback
      if (!isOnline && wasOnlineRef.current) {
        warning();
      }
    } else {
      // Hide animation
      translateY.value = withSpring(position === 'top' ? -100 : 100, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(0, { duration: 200 }, () => {
        // Set invisible after animation completes using runOnJS
        runOnJS(setIsVisible)(false);
      });

      // Success haptic when coming back online
      if (isOnline && !wasOnlineRef.current) {
        success();
      }
    }

    wasOnlineRef.current = isOnline;
  }, [showIndicator, isOnline, position, translateY, opacity, pulseScale, warning, success]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: pulseScale.value }],
    opacity: opacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotation.value}deg` }],
  }));

  // Handle retry
  const handleRetry = async () => {
    tapLight();

    // Rotate icon
    iconRotation.value = withSequence(
      withTiming(360, { duration: 500 }),
      withTiming(0, { duration: 0 })
    );

    // Check connectivity
    const connected = await networkMonitor.checkConnectivity();

    if (connected) {
      success();
    } else {
      warning();
    }

    onRetry?.();
  };

  // Handle dismiss
  const handleDismiss = () => {
    tapLight();
    translateY.value = withSpring(position === 'top' ? -100 : 100);
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(setIsVisible)(false);
    });
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  const displayMessage = message || defaultMessage;
  const isReconnecting = isOnline && showIndicator;

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' && {
          top: 0,
          paddingTop: insets.top + spacing['2'],
        },
        position === 'bottom' && {
          bottom: 0,
          paddingBottom: insets.bottom + spacing['2'],
        },
        containerStyle,
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.banner, isReconnecting ? styles.bannerSuccess : styles.bannerOffline]}>
        {/* Icon */}
        <Animated.View style={iconStyle}>
          {isReconnecting ? (
            <Wifi size={20} color={Colors.neutral.white} />
          ) : (
            <WifiOff size={20} color={Colors.neutral.white} />
          )}
        </Animated.View>

        {/* Message */}
        <Text style={styles.message}>{displayMessage}</Text>

        {/* Actions */}
        <View style={styles.actions}>
          {showRetry && !isReconnecting && (
            <Pressable
              onPress={handleRetry}
              style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
              hitSlop={8}
            >
              <RefreshCw size={16} color={Colors.neutral.white} />
            </Pressable>
          )}

          {dismissible && (
            <Pressable
              onPress={handleDismiss}
              style={({ pressed }) => [styles.dismissButton, pressed && styles.buttonPressed]}
              hitSlop={8}
            >
              <X size={16} color={Colors.neutral.white} />
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// Compact variant for inline use
interface OfflineBadgeProps {
  showWhenOnline?: boolean;
}

export function OfflineBadge({ showWhenOnline = false }: OfflineBadgeProps) {
  const { isOnline } = useOfflineIndicator();

  if (isOnline && !showWhenOnline) {
    return null;
  }

  return (
    <View style={[styles.badge, isOnline ? styles.badgeOnline : styles.badgeOffline]}>
      {isOnline ? (
        <Wifi size={12} color={Colors.secondary.grass} />
      ) : (
        <WifiOff size={12} color={Colors.semantic.error} />
      )}
      <Text style={[styles.badgeText, isOnline ? styles.badgeTextOnline : styles.badgeTextOffline]}>
        {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
      </Text>
    </View>
  );
}

// Provider component that wraps the app
interface OfflineIndicatorProviderProps {
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export function OfflineIndicatorProvider({
  children,
  position = 'top',
}: OfflineIndicatorProviderProps) {
  return (
    <View style={styles.provider}>
      {children}
      <OfflineIndicator position={position} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    // Use design system z-index for overlay notifications
    zIndex: zIndex.overlay,
    paddingHorizontal: spacing['4'],
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.xl,
    gap: spacing['3'],
    ...shadows.md,
  },
  bannerOffline: {
    backgroundColor: Colors.semantic.error,
  },
  bannerSuccess: {
    backgroundColor: Colors.secondary.grass,
  },
  message: {
    flex: 1,
    fontSize: typography.size.sm,
    fontFamily: typography.family.medium,
    color: Colors.neutral.white,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  retryButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },

  // Badge styles
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    paddingVertical: spacing['1'],
    paddingHorizontal: spacing['2'],
    borderRadius: radius.full,
  },
  badgeOffline: {
    backgroundColor: Colors.semantic.errorLight,
  },
  badgeOnline: {
    backgroundColor: Colors.semantic.successLight,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.medium,
  },
  badgeTextOffline: {
    color: Colors.semantic.error,
  },
  badgeTextOnline: {
    color: Colors.secondary.grass,
  },

  // Provider
  provider: {
    flex: 1,
  },
});

export default OfflineIndicator;
