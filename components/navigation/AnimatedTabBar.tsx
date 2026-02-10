/**
 * AnimatedTabBar - Custom Animated Tab Bar
 * Phase 12: Navigation Transitions
 *
 * Features:
 * - Icon scale animation on active
 * - Smooth indicator slide
 * - Haptic feedback on tab change
 * - Badge support
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/colors';
import { useFeedback } from '@/hooks/useFeedback';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AnimatedTabBarProps extends BottomTabBarProps {
  /** Active tab indicator color */
  indicatorColor?: string;
  /** Show floating indicator */
  showIndicator?: boolean;
  /** Badge counts for tabs (keyed by route name) */
  badges?: Record<string, number>;
}

export function AnimatedTabBar({
  state,
  descriptors,
  navigation,
  indicatorColor = Colors.secondary.lavender,
  showIndicator = true,
  badges = {},
}: AnimatedTabBarProps) {
  const { feedback } = useFeedback();

  // Animation values
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const tabCount = state.routes.length;
  const tabWidth = SCREEN_WIDTH / tabCount;

  // Update indicator position when active tab changes
  useEffect(() => {
    indicatorPosition.value = withSpring(state.index * tabWidth + tabWidth / 2 - 20, {
      damping: 20,
      stiffness: 300,
    });
  }, [state.index, tabWidth]);

  // Indicator animated style
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorPosition.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Floating Indicator */}
      {showIndicator && (
        <Animated.View style={[styles.indicator, { backgroundColor: indicatorColor }, indicatorStyle]} />
      )}

      {/* Tab Buttons */}
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Get the icon from options
          const icon = options.tabBarIcon;
          const label = options.tabBarLabel !== undefined
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
            <TabButton
              key={route.key}
              icon={icon}
              label={typeof label === 'string' ? label : route.name}
              isFocused={isFocused}
              badge={badge}
              onPress={handlePress}
              onLongPress={handleLongPress}
              activeColor={indicatorColor}
            />
          );
        })}
      </View>
    </View>
  );
}

interface TabButtonProps {
  icon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
  label: string;
  isFocused: boolean;
  badge?: number;
  onPress: () => void;
  onLongPress: () => void;
  activeColor: string;
}

function TabButton({
  icon,
  label,
  isFocused,
  badge,
  onPress,
  onLongPress,
  activeColor,
}: TabButtonProps) {
  // Animation values
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  // Update animations when focus changes
  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.15 : 1, { damping: 15, stiffness: 200 });
    translateY.value = withSpring(isFocused ? -4 : 0, { damping: 15, stiffness: 200 });
  }, [isFocused]);

  // Animated styles
  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scale.value, [1, 1.15], [0.6, 1]),
    transform: [{ translateY: translateY.value }],
  }));

  const color = isFocused ? activeColor : Colors.neutral.medium;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
    >
      {/* Icon Container */}
      <Animated.View style={[styles.iconContainer, iconStyle]}>
        {icon && icon({ focused: isFocused, color, size: 26 })}

        {/* Badge */}
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Animated.Text style={styles.badgeText}>
              {badge > 99 ? '99+' : badge}
            </Animated.Text>
          </View>
        )}
      </Animated.View>

      {/* Label */}
      <Animated.Text style={[styles.label, { color }, labelStyle]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: 3,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.status.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.neutral.white,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutral.white,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default AnimatedTabBar;
