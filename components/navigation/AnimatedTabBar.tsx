/**
 * FloatingTabBar - Glassmorphism Floating Tab Bar
 *
 * Features:
 * - Floating pill shape with rounded corners
 * - BlurView glassmorphism (expo-blur)
 * - Animated indicator pill sliding between tabs
 * - Scale/opacity animations on tab buttons
 * - Hidden tabs filtered out
 * - Badge support
 * - Dark mode support
 * - Safe area aware
 */

import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/colors';
import { shadows } from '@/constants/design-system';
import { useFeedback } from '@/hooks/useFeedback';
import { useTheme } from '@/lib/theme/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HORIZONTAL_MARGIN = 16;
const TAB_BAR_HEIGHT = 64;
const TAB_BAR_RADIUS = 32;
const INDICATOR_PADDING = 6;
const BOTTOM_OFFSET = 12;

interface FloatingTabBarProps extends BottomTabBarProps {
  badges?: Record<string, number>;
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
  badges = {},
}: FloatingTabBarProps) {
  const { feedback } = useFeedback();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Filter out hidden tabs (href: null in expo-router)
  const visibleRoutes = useMemo(() => {
    return state.routes.filter(route => {
      const { options } = descriptors[route.key];
      // expo-router extends BottomTabNavigationOptions with `href`
      return (options as Record<string, unknown>).href !== null;
    });
  }, [state.routes, descriptors]);

  // Map visible index to actual state index
  const visibleActiveIndex = useMemo(() => {
    return visibleRoutes.findIndex(route => route.key === state.routes[state.index]?.key);
  }, [visibleRoutes, state.routes, state.index]);

  const tabCount = visibleRoutes.length;
  const barWidth = SCREEN_WIDTH - HORIZONTAL_MARGIN * 2;
  const tabWidth = barWidth / tabCount;
  const indicatorWidth = tabWidth - INDICATOR_PADDING * 2;

  // Animated indicator position
  const indicatorX = useSharedValue(
    INDICATOR_PADDING + (visibleActiveIndex >= 0 ? visibleActiveIndex : 0) * tabWidth
  );

  useEffect(() => {
    if (visibleActiveIndex >= 0) {
      indicatorX.value = withSpring(INDICATOR_PADDING + visibleActiveIndex * tabWidth, {
        damping: 20,
        stiffness: 300,
      });
    }
  }, [visibleActiveIndex, tabWidth, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth,
  }));

  const bottomPadding = Math.max(insets.bottom, BOTTOM_OFFSET);

  return (
    <View style={[styles.outerContainer, { bottom: bottomPadding }]}>
      <View style={[styles.barContainer, isDark ? styles.barDark : styles.barLight]}>
        {/* Blur layer */}
        <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={styles.blurLayer} />

        {/* Glass overlay */}
        <View
          style={[
            styles.glassOverlay,
            {
              backgroundColor: isDark ? 'rgba(30, 33, 48, 0.85)' : 'rgba(255, 255, 255, 0.78)',
            },
          ]}
        />

        {/* Glass border */}
        <View style={styles.glassBorder} />

        {/* Active indicator pill */}
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(167, 139, 250, 0.15)',
            },
            indicatorStyle,
          ]}
        />

        {/* Tab buttons */}
        <View style={styles.tabsRow}>
          {visibleRoutes.map(route => {
            const { options } = descriptors[route.key];
            const actualIndex = state.routes.findIndex(r => r.key === route.key);
            const isFocused = state.index === actualIndex;

            const icon = options.tabBarIcon;
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                  ? options.title
                  : route.name;

            const badge = badges[route.name];

            const handlePress = () => {
              feedback('tap');
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const handleLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <FloatingTabButton
                key={route.key}
                icon={icon}
                label={typeof label === 'string' ? label : route.name}
                isFocused={isFocused}
                badge={badge}
                isDark={isDark}
                onPress={handlePress}
                onLongPress={handleLongPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

interface FloatingTabButtonProps {
  icon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
  label: string;
  isFocused: boolean;
  badge?: number;
  isDark: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function FloatingTabButton({
  icon,
  label,
  isFocused,
  badge,
  isDark: _isDark,
  onPress,
  onLongPress,
}: FloatingTabButtonProps) {
  const scale = useSharedValue(isFocused ? 1 : 0.88);
  const opacity = useSharedValue(isFocused ? 1 : 0.5);
  const colorProgress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0.88, { damping: 15, stiffness: 200 });
    opacity.value = withSpring(isFocused ? 1 : 0.5, { damping: 15, stiffness: 200 });
    colorProgress.value = withSpring(isFocused ? 1 : 0, { damping: 15, stiffness: 200 });
  }, [isFocused, scale, opacity, colorProgress]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const labelAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    color: interpolateColor(
      colorProgress.value,
      [0, 1],
      [Colors.neutral.medium, Colors.primary.sunset]
    ),
  }));

  const color = isFocused ? Colors.primary.sunset : Colors.neutral.medium;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.iconContainer, iconAnimStyle]}>
        {icon && icon({ focused: isFocused, color, size: 22 })}
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Animated.Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Animated.Text>
          </View>
        )}
      </Animated.View>
      <Animated.Text style={[styles.label, labelAnimStyle]} numberOfLines={1}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: HORIZONTAL_MARGIN,
    right: HORIZONTAL_MARGIN,
    zIndex: 100,
  },
  barContainer: {
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_RADIUS,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.lg,
    shadowColor: Colors.secondary.lavender,
  },
  barLight: {
    // shadow is handled by shadows.lg + shadowColor override
  },
  barDark: {
    shadowColor: 'rgba(0, 0, 0, 0.4)',
  },
  blurLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: TAB_BAR_RADIUS,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  indicator: {
    position: 'absolute',
    top: INDICATOR_PADDING,
    height: TAB_BAR_HEIGHT - INDICATOR_PADDING * 2,
    borderRadius: TAB_BAR_RADIUS - INDICATOR_PADDING,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 2,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.semantic.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.neutral.white,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
});

// Named exports for both import styles
export { FloatingTabBar as AnimatedTabBar };
export default FloatingTabBar;
