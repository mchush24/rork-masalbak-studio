/**
 * AccessibilityComponents - Accessible UI components
 * Phase 17: Accessibility 2.0
 *
 * Provides accessible components:
 * - AccessibleButton
 * - AccessibleText
 * - AccessibleImage
 * - SkipLink
 * - LiveRegion
 * - FocusGroup
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle,
  StyleProp,
  ImageSourcePropType,
  AccessibilityRole,
  AccessibilityState,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import {
  useAccessibility,
  useAccessibleFontSize,
  useMinimumTouchTarget,
  useColorBlindSafeColors,
  ColorBlindMode,
} from './AccessibilityProvider';
import { Colors } from '@/constants/colors';
import { shadows, zIndex } from '@/constants/design-system';

interface AccessibleButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  style?: StyleProp<ViewStyle>;
}

/**
 * Button with enhanced accessibility
 */
export function AccessibleButton({
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  disabled = false,
  variant = 'primary',
  size = 'medium',
}: AccessibleButtonProps) {
  const minTouchSize = useMinimumTouchTarget();
  const { shouldReduceMotion, announceForAccessibility } = useAccessibility();
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (!disabled) {
      if (!shouldReduceMotion) {
        scale.value = withSpring(0.95, { damping: 15 });
        setTimeout(() => {
          scale.value = withSpring(1);
        }, 100);
      }
      onPress();
      // Announce action for screen readers
      if (accessibilityHint) {
        announceForAccessibility(accessibilityHint);
      }
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeStyles = {
    small: { minHeight: Math.max(36, minTouchSize), paddingHorizontal: 12 },
    medium: { minHeight: Math.max(44, minTouchSize), paddingHorizontal: 16 },
    large: { minHeight: Math.max(52, minTouchSize), paddingHorizontal: 24 },
  };

  const variantStyles = {
    primary: {
      backgroundColor: Colors.secondary.lavender,
      borderColor: Colors.secondary.lavender,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: Colors.secondary.lavender,
      borderWidth: 2,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled, ...accessibilityState }}
      style={({ pressed }) => [
        styles.button,
        sizeStyles[size],
        variantStyles[variant],
        disabled && styles.buttonDisabled,
        pressed && !shouldReduceMotion && styles.buttonPressed,
      ]}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
}

interface AccessibleTextProps {
  children: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  variant?: 'body' | 'heading' | 'caption' | 'label';
  style?: StyleProp<TextStyle>;
}

/**
 * Text with scaled font size and accessibility props
 */
export function AccessibleText({
  children,
  accessibilityLabel,
  accessibilityRole,
  variant = 'body',
  style,
}: AccessibleTextProps) {
  const { preferences } = useAccessibility();

  const baseSizes = {
    body: 16,
    heading: 24,
    caption: 12,
    label: 14,
  };

  const fontSize = useAccessibleFontSize(baseSizes[variant]);
  const fontWeight = preferences.boldText ? '600' : variant === 'heading' ? '700' : '400';

  const _headingLevel = variant === 'heading' ? 1 : undefined;

  return (
    <Text
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole || (variant === 'heading' ? 'header' : 'text')}
      style={[styles.text, { fontSize, fontWeight: fontWeight as TextStyle['fontWeight'] }, style]}
    >
      {children}
    </Text>
  );
}

interface AccessibleImageProps {
  source: ImageSourcePropType;
  accessibilityLabel: string;
  accessibilityRole?: AccessibilityRole;
  decorative?: boolean;
  style?: StyleProp<ImageStyle>;
}

/**
 * Image with proper accessibility labeling
 */
export function AccessibleImage({
  source,
  accessibilityLabel,
  accessibilityRole = 'image',
  decorative = false,
  style,
}: AccessibleImageProps) {
  return (
    <Image
      source={source}
      accessibilityLabel={decorative ? undefined : accessibilityLabel}
      accessibilityRole={decorative ? 'none' : accessibilityRole}
      accessible={!decorative}
      accessibilityIgnoresInvertColors={false}
      style={style}
    />
  );
}

interface SkipLinkProps {
  targetRef: React.RefObject<View>;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Skip link for keyboard navigation
 */
export function SkipLink({ targetRef, label = 'Ana içeriğe geç', style }: SkipLinkProps) {
  const { isScreenReaderEnabled, setAccessibilityFocus } = useAccessibility();
  const [isFocused, setIsFocused] = useState(false);

  const handlePress = () => {
    setAccessibilityFocus(targetRef);
  };

  // Only show for screen reader users
  if (!isScreenReaderEnabled && !isFocused) {
    return null;
  }

  return (
    <Pressable
      onPress={handlePress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      accessibilityLabel={label}
      accessibilityRole="link"
      style={[styles.skipLink, style]}
    >
      <Text style={styles.skipLinkText}>{label}</Text>
    </Pressable>
  );
}

interface LiveRegionProps {
  children: React.ReactNode;
  polite?: 'polite' | 'assertive' | 'none';
  atomic?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Live region for dynamic content announcements
 */
export function LiveRegion({
  children,
  polite = 'polite',
  _atomic = true,
  style,
}: LiveRegionProps) {
  return (
    <View accessibilityLiveRegion={polite} accessibilityElementsHidden={false} style={style}>
      {children}
    </View>
  );
}

interface FocusGroupProps {
  children: React.ReactNode;
  label: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Group related elements for better navigation
 */
export function FocusGroup({ children, label, style }: FocusGroupProps) {
  return (
    <View accessible={true} accessibilityLabel={label} accessibilityRole="none" style={style}>
      {children}
    </View>
  );
}

interface AccessibilitySettingsItemProps {
  label: string;
  description?: string;
  value: boolean | string;
  onValueChange?: (value: boolean | string) => void;
  type?: 'toggle' | 'select';
  options?: { label: string; value: string }[];
  style?: StyleProp<ViewStyle>;
}

/**
 * Settings item for accessibility preferences
 */
export function AccessibilitySettingsItem({
  label,
  description,
  value,
  onValueChange,
  type = 'toggle',

  style,
}: AccessibilitySettingsItemProps) {
  const fontSize = useAccessibleFontSize(16);
  const descFontSize = useAccessibleFontSize(14);
  const minTouchSize = useMinimumTouchTarget();

  const handlePress = () => {
    if (type === 'toggle' && onValueChange) {
      onValueChange(!value);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityLabel={`${label}${description ? `, ${description}` : ''}`}
      accessibilityRole={type === 'toggle' ? 'switch' : 'button'}
      accessibilityState={type === 'toggle' ? { checked: value as boolean } : undefined}
      style={[styles.settingsItem, { minHeight: minTouchSize + 16 }, style]}
    >
      <View style={styles.settingsItemContent}>
        <Text style={[styles.settingsItemLabel, { fontSize }]}>{label}</Text>
        {description && (
          <Text style={[styles.settingsItemDescription, { fontSize: descFontSize }]}>
            {description}
          </Text>
        )}
      </View>
      {type === 'toggle' && (
        <View
          style={[
            styles.toggle,
            { backgroundColor: value ? Colors.secondary.lavender : Colors.neutral.light },
          ]}
        >
          <Animated.View
            style={[styles.toggleThumb, { transform: [{ translateX: value ? 20 : 0 }] }]}
          />
        </View>
      )}
      {type === 'select' && <Text style={styles.selectValue}>{value as string}</Text>}
    </Pressable>
  );
}

interface HighContrastWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Wrapper that applies high contrast styles when enabled
 */
export function HighContrastWrapper({ children, style }: HighContrastWrapperProps) {
  const { shouldUseHighContrast } = useAccessibility();

  return (
    <View style={[style, shouldUseHighContrast && styles.highContrastWrapper]}>{children}</View>
  );
}

interface ReducedMotionWrapperProps {
  children: React.ReactNode;
  animatedStyle?: ViewStyle;
  staticStyle?: ViewStyle;
}

/**
 * Wrapper that disables animations when reduce motion is enabled
 */
export function ReducedMotionWrapper({
  children,
  animatedStyle,
  staticStyle,
}: ReducedMotionWrapperProps) {
  const { shouldReduceMotion } = useAccessibility();

  return (
    <Animated.View style={shouldReduceMotion ? staticStyle : animatedStyle}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Button
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
  },

  // Text
  text: {
    color: Colors.neutral.dark,
  },

  // Skip Link
  skipLink: {
    position: 'absolute',
    top: -100,
    left: 0,
    backgroundColor: Colors.secondary.lavender,
    padding: 12,
    borderRadius: 8,
    zIndex: zIndex.floating,
  },
  skipLinkText: {
    color: Colors.neutral.white,
    fontWeight: '600',
  },

  // Settings Item
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemLabel: {
    fontWeight: '600',
    color: Colors.neutral.dark,
  },
  settingsItemDescription: {
    color: Colors.neutral.medium,
    marginTop: 4,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.neutral.white,
    ...shadows.sm,
  },
  selectValue: {
    fontSize: 14,
    color: Colors.neutral.medium,
  },

  // High Contrast
  highContrastWrapper: {
    borderWidth: 2,
    borderColor: Colors.neutral.dark,
  },

  // Color Blind Mode Selector
  colorBlindSelector: {
    gap: 12,
  },
  colorBlindOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  colorBlindOptionSelected: {
    borderColor: Colors.secondary.lavender,
    backgroundColor: `${Colors.secondary.lavender}10`,
  },
  colorBlindOptionUnselected: {
    borderColor: Colors.neutral.lighter,
    backgroundColor: Colors.neutral.white,
  },
  colorBlindOptionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  colorBlindOptionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.secondary.lavender,
  },
  colorBlindOptionContent: {
    flex: 1,
  },
  colorBlindOptionLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.neutral.dark,
  },
  colorBlindOptionDescription: {
    fontSize: 13,
    color: Colors.neutral.medium,
    marginTop: 2,
  },
  colorBlindPreview: {
    flexDirection: 'row' as const,
    gap: 4,
    marginTop: 8,
  },
  colorBlindPreviewDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});

interface ColorBlindModeSelectorProps {
  value: ColorBlindMode;
  onValueChange: (mode: ColorBlindMode) => void;
  style?: StyleProp<ViewStyle>;
}

const COLOR_BLIND_OPTIONS: { value: ColorBlindMode; label: string; description: string }[] = [
  {
    value: 'none',
    label: 'Normal',
    description: 'Standart renk görünümü',
  },
  {
    value: 'deuteranopia',
    label: 'Deuteranopi',
    description: 'Kırmızı-yeşil renk körlüğü (en yaygın)',
  },
  {
    value: 'protanopia',
    label: 'Protanopi',
    description: 'Kırmızı renk körlüğü',
  },
  {
    value: 'tritanopia',
    label: 'Tritanopi',
    description: 'Mavi-sarı renk körlüğü',
  },
];

/**
 * Color blind mode selector component
 */
export function ColorBlindModeSelector({
  value,
  onValueChange,
  style,
}: ColorBlindModeSelectorProps) {
  const { colors: safeColors } = useColorBlindSafeColors();
  const minTouchSize = useMinimumTouchTarget();

  return (
    <View style={[styles.colorBlindSelector, style]}>
      {COLOR_BLIND_OPTIONS.map(option => {
        const isSelected = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onValueChange(option.value)}
            accessibilityLabel={`${option.label}, ${option.description}`}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.colorBlindOption,
              { minHeight: minTouchSize + 20 },
              isSelected ? styles.colorBlindOptionSelected : styles.colorBlindOptionUnselected,
            ]}
          >
            <View
              style={[
                styles.colorBlindOptionRadio,
                { borderColor: isSelected ? Colors.secondary.lavender : Colors.neutral.light },
              ]}
            >
              {isSelected && <View style={styles.colorBlindOptionRadioInner} />}
            </View>
            <View style={styles.colorBlindOptionContent}>
              <Text style={styles.colorBlindOptionLabel}>{option.label}</Text>
              <Text style={styles.colorBlindOptionDescription}>{option.description}</Text>
              {option.value !== 'none' && (
                <View style={styles.colorBlindPreview}>
                  <View
                    style={[styles.colorBlindPreviewDot, { backgroundColor: safeColors.success }]}
                  />
                  <View
                    style={[styles.colorBlindPreviewDot, { backgroundColor: safeColors.error }]}
                  />
                  <View
                    style={[styles.colorBlindPreviewDot, { backgroundColor: safeColors.warning }]}
                  />
                  <View
                    style={[styles.colorBlindPreviewDot, { backgroundColor: safeColors.info }]}
                  />
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

interface CognitiveAccessibilityToggleProps {
  simplifiedLanguage: boolean;
  reducedInformation: boolean;
  onSimplifiedLanguageChange: (value: boolean) => void;
  onReducedInformationChange: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Cognitive accessibility settings component
 */
export function CognitiveAccessibilitySettings({
  simplifiedLanguage,
  reducedInformation,
  onSimplifiedLanguageChange,
  onReducedInformationChange,
  style,
}: CognitiveAccessibilityToggleProps) {
  return (
    <View style={style}>
      <AccessibilitySettingsItem
        label="Basitleştirilmiş Dil"
        description="Daha kısa ve anlaşılır metinler kullan"
        value={simplifiedLanguage}
        onValueChange={onSimplifiedLanguageChange}
        type="toggle"
      />
      <AccessibilitySettingsItem
        label="Azaltılmış Bilgi"
        description="Daha az detay göster, temel bilgilere odaklan"
        value={reducedInformation}
        onValueChange={onReducedInformationChange}
        type="toggle"
      />
    </View>
  );
}

export default {
  AccessibleButton,
  AccessibleText,
  AccessibleImage,
  SkipLink,
  LiveRegion,
  FocusGroup,
  AccessibilitySettingsItem,
  HighContrastWrapper,
  ReducedMotionWrapper,
  ColorBlindModeSelector,
  CognitiveAccessibilitySettings,
};
