/**
 * CollapsibleSection - Reusable animated accordion component
 *
 * Production-quality collapsible section with:
 * - Smooth Reanimated 3 height + opacity + rotation animations
 * - Dynamic content height measurement via onLayout
 * - Optional AsyncStorage state persistence
 * - Lazy child rendering (mount only on first expand)
 * - Dark mode support via useTheme()
 * - Full accessibility annotations
 *
 * Usage:
 * ```tsx
 * <CollapsibleSection title="Account" icon={<User size={18} />}>
 *   <SettingsRow label="Email" />
 * </CollapsibleSection>
 * ```
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import { ChevronDown } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '@/lib/theme/ThemeProvider';
import {
  typography,
  spacing,
  radius,
  shadows,
  iconSizes,
  iconStroke,
} from '@/constants/design-system';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CollapsibleSectionProps {
  /** Unique key for AsyncStorage persistence. Required when persistState is true. */
  id?: string;
  /** Section header title */
  title: string;
  /** Optional icon rendered left of the title */
  icon?: React.ReactNode;
  /** Collapsible body content */
  children: React.ReactNode;
  /** Whether the section starts expanded. Default: false */
  defaultExpanded?: boolean;
  /** Animation duration in ms. Default: 280 */
  duration?: number;
  /** Persist expanded/collapsed state to AsyncStorage. Requires `id`. Default: false */
  persistState?: boolean;
  /** Optional badge text rendered next to the title */
  badge?: string;
  /** Callback fired after toggle completes */
  onToggle?: (expanded: boolean) => void;
  /** Custom styles for the header row */
  headerStyle?: ViewStyle;
  /** Custom styles for the outer container */
  containerStyle?: ViewStyle;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_PREFIX = 'collapsible_state_';
const DEFAULT_DURATION = 280;
const EASING = Easing.bezier(0.25, 0.1, 0.25, 1);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CollapsibleSection({
  id,
  title,
  icon,
  children,
  defaultExpanded = false,
  duration = DEFAULT_DURATION,
  persistState = false,
  badge,
  onToggle,
  headerStyle,
  containerStyle,
}: CollapsibleSectionProps) {
  const { colors, isDark } = useTheme();

  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [hasBeenVisible, setHasBeenVisible] = useState(defaultExpanded);
  const [storageLoaded, setStorageLoaded] = useState(!persistState);

  // Content height measured via onLayout
  const contentHeight = useRef(0);

  // Single shared value driving all animations (0 = collapsed, 1 = expanded)
  const progress = useSharedValue(defaultExpanded ? 1 : 0);

  // -----------------------------------------------------------------------
  // AsyncStorage persistence
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!persistState || !id) {
      setStorageLoaded(true);
      return;
    }

    const key = `${STORAGE_PREFIX}${id}`;
    let cancelled = false;

    AsyncStorage.getItem(key)
      .then(stored => {
        if (cancelled) return;
        if (stored !== null) {
          const restored = stored === '1';
          setIsExpanded(restored);
          if (restored) setHasBeenVisible(true);
          // Jump to restored state without animation
          progress.value = restored ? 1 : 0;
        }
      })
      .catch(() => {
        // Silently ignore storage read failures
      })
      .finally(() => {
        if (!cancelled) setStorageLoaded(true);
      });

    return () => {
      cancelled = true;
    };
    // Only run on mount — id and persistState should not change at runtime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistToStorage = useCallback(
    (expanded: boolean) => {
      if (!persistState || !id) return;
      const key = `${STORAGE_PREFIX}${id}`;
      AsyncStorage.setItem(key, expanded ? '1' : '0').catch(() => {
        // Silently ignore storage write failures
      });
    },
    [persistState, id]
  );

  // -----------------------------------------------------------------------
  // Toggle handler
  // -----------------------------------------------------------------------

  const handleToggle = useCallback(() => {
    const next = !isExpanded;

    // Ensure children are mounted before expanding
    if (next && !hasBeenVisible) {
      setHasBeenVisible(true);
    }

    setIsExpanded(next);

    progress.value = withTiming(next ? 1 : 0, {
      duration,
      easing: EASING,
    });

    persistToStorage(next);
    onToggle?.(next);
  }, [isExpanded, hasBeenVisible, progress, duration, persistToStorage, onToggle]);

  // -----------------------------------------------------------------------
  // Layout measurement
  // -----------------------------------------------------------------------

  const handleContentLayout = useCallback(
    (event: { nativeEvent: { layout: { height: number } } }) => {
      const measured = event.nativeEvent.layout.height;
      if (measured > 0) {
        contentHeight.current = measured;
      }
    },
    []
  );

  // -----------------------------------------------------------------------
  // Animated styles
  // -----------------------------------------------------------------------

  // Outer wrapper — clips at animated height
  const animatedContainerStyle = useAnimatedStyle(() => {
    const height = interpolate(progress.value, [0, 1], [0, contentHeight.current]);
    return {
      height,
      overflow: 'hidden' as const,
    };
  });

  // Content opacity — fades in during the first 30% of the animation
  const animatedContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.3], [0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  // Chevron rotation
  const animatedChevronStyle = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  // -----------------------------------------------------------------------
  // Derived values
  // -----------------------------------------------------------------------

  const shouldRenderContent = hasBeenVisible || isExpanded;

  // Theme-aware colors
  const containerBg = isDark ? (colors.neutral.gray100 ?? '#2A2D3A') : colors.neutral.white;
  const headerBg = isDark ? (colors.neutral.gray200 ?? '#33364A') : colors.neutral.lightest;
  const titleColor = colors.neutral.darkest;
  const chevronColor = colors.neutral.medium;
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)';
  const badgeBg = colors.secondary?.sunshineLight ?? '#FFE49B';
  const badgeTextColor = colors.secondary?.sunshine ?? '#FFD56B';
  const iconContainerBg = isDark ? (colors.neutral.gray100 ?? '#2A2D3A') : colors.neutral.white;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  // Don't render until persisted state is loaded (prevents flash of wrong state)
  if (!storageLoaded) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: containerBg,
          borderColor,
        },
        containerStyle,
      ]}
    >
      {/* Header */}
      <Pressable
        style={({ pressed }) => [
          styles.header,
          { backgroundColor: headerBg },
          pressed && styles.headerPressed,
          headerStyle,
        ]}
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={`${title}, ${isExpanded ? 'açık' : 'kapalı'}`}
        accessibilityHint="Bölümü açmak veya kapatmak için iki kez dokunun"
      >
        <View style={styles.headerLeft}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: iconContainerBg }]}>{icon}</View>
          )}
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          {badge != null && badge !== '' && (
            <View style={[styles.badge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.badgeText, { color: badgeTextColor }]}>{badge}</Text>
            </View>
          )}
        </View>
        <Animated.View style={animatedChevronStyle}>
          <ChevronDown
            size={iconSizes.small}
            color={chevronColor}
            strokeWidth={iconStroke.standard}
          />
        </Animated.View>
      </Pressable>

      {/* Collapsible content */}
      <Animated.View style={animatedContainerStyle}>
        {shouldRenderContent && (
          <Animated.View style={animatedContentStyle}>
            <View style={styles.innerContent} onLayout={handleContentLayout}>
              <View style={styles.contentPadding}>{children}</View>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  headerPressed: {
    opacity: 0.7,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xs,
  },
  title: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.bold,
  },
  innerContent: {
    // Position absolute so the view can report its full natural height
    // even while the outer Animated.View clips to a smaller height.
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  contentPadding: {
    padding: spacing.md,
    paddingTop: 0,
  },
});

export default CollapsibleSection;
