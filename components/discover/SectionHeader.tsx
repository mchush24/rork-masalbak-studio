/**
 * SectionHeader - Reusable section heading for discover-style layouts
 *
 * Displays a titled section with an icon badge and optional "See All" link.
 * Memoized to prevent unnecessary re-renders in scrollable feeds.
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { spacing, typography } from '@/constants/design-system';

interface SectionHeaderProps {
  title: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  iconColor?: string;
  onSeeAll?: () => void;
}

export const SectionHeader = memo(function SectionHeader({
  title,
  icon: Icon,
  iconColor = Colors.secondary.violet,
  onSeeAll,
}: SectionHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={[styles.sectionIconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Icon size={16} color={iconColor} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{title}</Text>
      </View>
      {onSeeAll && (
        <Pressable
          onPress={onSeeAll}
          style={({ pressed }) => [styles.seeAllButton, pressed && { opacity: 0.7 }]}
        >
          <Text style={[styles.seeAllText, { color: colors.secondary.violet }]}>Tümü</Text>
          <ChevronRight size={14} color={colors.secondary.violet} />
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: typography.family.semibold,
    color: Colors.secondary.violet,
  },
});

export default SectionHeader;
