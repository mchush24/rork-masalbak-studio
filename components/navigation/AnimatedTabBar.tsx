/**
 * FloatingTabBar - Glassmorphism Floating Tab Bar
 *
 * Features:
 * - Floating pill shape with rounded corners
 * - BlurView glassmorphism (expo-blur)
 * - Animated indicator pill sliding between tabs
 * - Scale/opacity animations on tab buttons
 * - Elevated center button for "Analiz" tab
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
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/colors';
import { shadows, typography } from '@/constants/design-system';
import { useFeedback } from '@/hooks/useFeedback';
import { useTheme } from '@/lib/theme/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HORIZONTAL_MARGIN = 16;
const TAB_BAR_HEIGHT = 64;
const TAB_BAR_RADIUS = 32;
const INDICATOR_PADDING = 6;
const BOTTOM_OFFSET = 12;
const CENTER_TAB_INDEX = 2;
const CENTER_BUTTON_SIZE = 48;

export const FLOATING_TAB_BAR_TOTAL_HEIGHT = TAB_BAR_HEIGHT + BOTTOM_OFFSET + 20;

const VISIBLE_TAB_NAMES = new Set(['index', 'hayal-atolyesi', 'analysis', 'history', 'profile']);

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

  // Filter out hidden tabs
  const visibleRoutes = useMemo(() => {
    return state.routes.filter(route => {
      const { options } = descriptors[route.key];
      if ((options as Record<string, unknown>).href === null) return false;
      return VISIBLE_TAB_NAMES.has(route.name);
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
        <View
          style={[
            styles.glassBorder,
            {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 200, 180, 0.4)',
            },
          ]}
        />

        {/* Active indicator pill — skip for center tab */}
        {visibleActiveIndex !== CENTER_TAB_INDEX && (
          <Animated.View
            style={[
              styles.indicator,
              {
                backgroundColor: isDark ? 'rgba(255, 155, 122, 0.15)' : 'rgba(255, 155, 122, 0.12)',
              },
              indicatorStyle,
            ]}
          />
        )}

        {/* Tab buttons */}
        <View style={styles.tabsRow}>
          {visibleRoutes.map((route, visibleIdx) => {
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

            // Center tab: render inline elevated gradient button
            if (visibleIdx === CENTER_TAB_INDEX) {
              return (
                <CenterTabButton
                  key={route.key}
                  icon={icon}
                  label={typeof label === 'string' ? label : route.name}
                  isFocused={isFocused}
                  onPress={handlePress}
                  onLongPress={handleLongPress}
                />
              );
            }

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

// --- Standard Tab Button ---

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
  const focusedSV = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0.88, { damping: 15, stiffness: 200 });
    opacity.value = withSpring(isFocused ? 1 : 0.5, { damping: 15, stiffness: 200 });
    colorProgress.value = withSpring(isFocused ? 1 : 0, { damping: 15, stiffness: 200 });
    focusedSV.value = withSpring(isFocused ? 1 : 0, { damping: 15, stiffness: 200 });
  }, [isFocused, scale, opacity, colorProgress, focusedSV]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: withSpring(focusedSV.value * -1, { damping: 15, stiffness: 200 }) },
    ],
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

// --- Elevated Center Tab Button ---

interface CenterTabButtonProps {
  icon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

function CenterTabButton({ icon, label, isFocused, onPress, onLongPress }: CenterTabButtonProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 250 });
  };

  return (
    <View style={styles.centerSlot}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={label}
        style={styles.centerPressable}
      >
        <Animated.View style={animStyle}>
          <LinearGradient
            colors={
              isFocused ? (['#FF8A65', '#FF9B7A'] as const) : (['#FF9B7A', '#FFB299'] as const)
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.centerGradient}
          >
            {icon && icon({ focused: true, color: '#FFFFFF', size: 24 })}
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
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
  barLight: {},
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
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  label: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.semibold,
  },
  // --- Center button styles ---
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  centerPressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerGradient: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF9B7A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});

// Named exports for both import styles
export { FloatingTabBar as AnimatedTabBar };
export default FloatingTabBar;
