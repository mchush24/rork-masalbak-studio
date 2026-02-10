/**
 * ThemeComponents - Themed UI components
 * Phase 16: Dark Mode
 *
 * Provides pre-built themed components:
 * - ThemeToggle switch
 * - ThemedView
 * - ThemedText
 * - ThemedCard
 * - ThemedIcon
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, ThemeColors } from './ThemeProvider';
import { useFeedback } from '@/hooks/useFeedback';
import { shadows } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

interface ThemeToggleProps {
  showLabels?: boolean;
  variant?: 'switch' | 'segmented' | 'icon';
  style?: StyleProp<ViewStyle>;
}

/**
 * Theme toggle switch
 */
export function ThemeToggle({
  showLabels = false,
  variant = 'switch',
  style,
}: ThemeToggleProps) {
  const { mode, isDark, setTheme, toggleTheme } = useTheme();
  const { feedback } = useFeedback();

  if (variant === 'segmented') {
    return (
      <SegmentedThemeToggle
        mode={mode}
        setTheme={setTheme}
        showLabels={showLabels}
        style={style}
      />
    );
  }

  if (variant === 'icon') {
    return (
      <IconThemeToggle
        isDark={isDark}
        onToggle={() => {
          feedback('tap');
          toggleTheme();
        }}
        style={style}
      />
    );
  }

  return (
    <SwitchThemeToggle
      isDark={isDark}
      onToggle={() => {
        feedback('tap');
        toggleTheme();
      }}
      showLabels={showLabels}
      style={style}
    />
  );
}

interface SwitchThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  showLabels: boolean;
  style?: StyleProp<ViewStyle>;
}

function SwitchThemeToggle({
  isDark,
  onToggle,
  showLabels,
  style,
}: SwitchThemeToggleProps) {
  const { colors } = useTheme();
  const translateX = useSharedValue(isDark ? 24 : 0);
  const rotation = useSharedValue(isDark ? 180 : 0);

  useEffect(() => {
    translateX.value = withSpring(isDark ? 24 : 0, { damping: 15 });
    rotation.value = withSpring(isDark ? 180 : 0, { damping: 12 });
  }, [isDark]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <View style={[styles.switchContainer, style]}>
      {showLabels && (
        <Text style={[styles.switchLabel, { color: colors.text.secondary }]}>
          {isDark ? 'Koyu' : 'Açık'}
        </Text>
      )}
      <Pressable
        style={[
          styles.switchTrack,
          { backgroundColor: isDark ? colors.primary.purple : colors.neutral.light },
        ]}
        onPress={onToggle}
      >
        <Animated.View
          style={[
            styles.switchThumb,
            { backgroundColor: colors.surface.card },
            thumbStyle,
          ]}
        >
          {isDark ? (
            <Moon size={14} color={colors.primary.purple} />
          ) : (
            <Sun size={14} color={colors.emotion.joy} />
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
}

interface SegmentedThemeToggleProps {
  mode: 'light' | 'dark' | 'system';
  setTheme: (mode: 'light' | 'dark' | 'system') => void;
  showLabels: boolean;
  style?: StyleProp<ViewStyle>;
}

function SegmentedThemeToggle({
  mode,
  setTheme,
  showLabels,
  style,
}: SegmentedThemeToggleProps) {
  const { colors, isDark } = useTheme();
  const { feedback } = useFeedback();

  const options: { value: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Açık' },
    { value: 'system', icon: Monitor, label: 'Sistem' },
    { value: 'dark', icon: Moon, label: 'Koyu' },
  ];

  const activeIndex = options.findIndex((o) => o.value === mode);
  const indicatorX = useSharedValue(activeIndex * 60);

  useEffect(() => {
    indicatorX.value = withSpring(activeIndex * 60, { damping: 15 });
  }, [activeIndex]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View
      style={[
        styles.segmentedContainer,
        { backgroundColor: colors.surface.elevated },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.segmentedIndicator,
          { backgroundColor: colors.primary.purple },
          indicatorStyle,
        ]}
      />
      {options.map((option) => (
        <Pressable
          key={option.value}
          style={styles.segmentedOption}
          onPress={() => {
            feedback('tap');
            setTheme(option.value);
          }}
        >
          <option.icon
            size={18}
            color={
              mode === option.value
                ? colors.text.inverse
                : colors.text.secondary
            }
          />
          {showLabels && (
            <Text
              style={[
                styles.segmentedLabel,
                {
                  color:
                    mode === option.value
                      ? colors.text.inverse
                      : colors.text.secondary,
                },
              ]}
            >
              {option.label}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

interface IconThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  style?: StyleProp<ViewStyle>;
}

function IconThemeToggle({
  isDark,
  onToggle,
  style,
}: IconThemeToggleProps) {
  const { colors } = useTheme();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const handlePress = () => {
    rotation.value = withSpring(rotation.value + 180);
    scale.value = withSpring(0.8, {}, () => {
      scale.value = withSpring(1);
    });
    onToggle();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Pressable
      style={[
        styles.iconToggle,
        { backgroundColor: colors.surface.elevated },
        style,
      ]}
      onPress={handlePress}
    >
      <Animated.View style={animatedStyle}>
        {isDark ? (
          <Moon size={22} color={colors.primary.purple} />
        ) : (
          <Sun size={22} color={colors.emotion.joy} />
        )}
      </Animated.View>
    </Pressable>
  );
}

interface ThemedViewProps {
  children: React.ReactNode;
  variant?: 'background' | 'card' | 'elevated';
  style?: StyleProp<ViewStyle>;
}

/**
 * View with automatic theme-aware background
 */
export function ThemedView({
  children,
  variant = 'background',
  style,
}: ThemedViewProps) {
  const { colors } = useTheme();

  const backgroundColor = {
    background: colors.background.primary,
    card: colors.surface.card,
    elevated: colors.surface.elevated,
  }[variant];

  return (
    <View style={[{ backgroundColor }, style]}>
      {children}
    </View>
  );
}

interface ThemedTextProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  style?: StyleProp<TextStyle>;
}

/**
 * Text with automatic theme-aware color
 */
export function ThemedText({
  children,
  variant = 'primary',
  weight = 'normal',
  size = 'md',
  style,
}: ThemedTextProps) {
  const { colors } = useTheme();

  const color = {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    tertiary: colors.text.tertiary,
  }[variant];

  const fontWeight = {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }[weight] as TextStyle['fontWeight'];

  const fontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
  }[size];

  return (
    <Text style={[{ color, fontWeight, fontSize }, style]}>
      {children}
    </Text>
  );
}

interface ThemedCardProps {
  children: React.ReactNode;
  elevated?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Card with automatic theme-aware styling
 */
export function ThemedCard({
  children,
  elevated = false,
  onPress,
  style,
}: ThemedCardProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardStyle: ViewStyle = {
    backgroundColor: elevated ? colors.surface.elevated : colors.surface.card,
    borderColor: colors.border.light,
    shadowColor: isDark ? Colors.neutral.darkest : Colors.neutral.darkest,
    shadowOpacity: isDark ? 0.3 : 0.08,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.card, cardStyle, animatedStyle, style]}>
          {children}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, cardStyle, style]}>
      {children}
    </View>
  );
}

interface ThemedIconProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  size?: number;
  variant?: 'primary' | 'secondary' | 'accent';
  style?: StyleProp<ViewStyle>;
}

/**
 * Icon with automatic theme-aware color
 */
export function ThemedIcon({
  icon: Icon,
  size = 24,
  variant = 'primary',
  style,
}: ThemedIconProps) {
  const { colors } = useTheme();

  const color = {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    accent: colors.primary.purple,
  }[variant];

  return (
    <View style={style}>
      <Icon size={size} color={color} />
    </View>
  );
}

interface ThemedDividerProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Divider with automatic theme-aware color
 */
export function ThemedDivider({ style }: ThemedDividerProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: colors.border.light },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  // Switch
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  switchTrack: {
    width: 56,
    height: 32,
    borderRadius: 16,
    padding: 4,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },

  // Segmented
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
  },
  segmentedIndicator: {
    position: 'absolute',
    width: 56,
    height: 36,
    borderRadius: 8,
    top: 4,
    left: 4,
  },
  segmentedOption: {
    width: 60,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  segmentedLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  // Icon Toggle
  iconToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Card
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    ...shadows.md,
  },

  // Divider
  divider: {
    height: 1,
    width: '100%',
  },
});

export default {
  ThemeToggle,
  ThemedView,
  ThemedText,
  ThemedCard,
  ThemedIcon,
  ThemedDivider,
};
