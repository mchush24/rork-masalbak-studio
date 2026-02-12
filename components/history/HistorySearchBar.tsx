/**
 * HistorySearchBar - Search input for history screen
 *
 * Features:
 * - Search by title/test type
 * - Clear button
 * - Animated focus state
 */

import React, { useState } from 'react';
import { TextInput, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Search, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import {
  typography,
  spacing,
  radius,
  shadows,
  iconSizes,
  iconStroke,
} from '@/constants/design-system';

interface HistorySearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function HistorySearchBar({
  value,
  onChangeText,
  placeholder = 'Analiz ara...',
}: HistorySearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const scale = useSharedValue(1);
  const borderWidth = useSharedValue(1);

  const handleFocus = () => {
    setIsFocused(true);
    scale.value = withSpring(1.02, { damping: 15 });
    borderWidth.value = withSpring(2, { damping: 15 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    scale.value = withSpring(1, { damping: 15 });
    borderWidth.value = withSpring(1, { damping: 15 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderWidth: borderWidth.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: isFocused ? Colors.secondary.lavender : Colors.neutral.lighter,
        },
        animatedStyle,
      ]}
    >
      <Search
        size={iconSizes.small}
        color={isFocused ? Colors.secondary.lavender : Colors.neutral.medium}
        strokeWidth={iconStroke.standard}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.neutral.light}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          style={({ pressed }) => [styles.clearButton, pressed && styles.clearButtonPressed]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={iconSizes.inline} color={Colors.neutral.medium} strokeWidth={iconStroke.bold} />
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.size.base,
    color: Colors.neutral.darkest,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    padding: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.lightest,
  },
  clearButtonPressed: {
    opacity: 0.7,
  },
});

export default HistorySearchBar;
