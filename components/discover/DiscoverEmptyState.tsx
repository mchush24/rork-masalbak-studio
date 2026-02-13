/**
 * DiscoverEmptyState - Compact empty state for discover sections
 *
 * Thin wrapper around IooEmptyState in compact mode.
 * Memoized for use inside scrollable feeds.
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';

import { spacing } from '@/constants/design-system';
import { IooEmptyState } from '@/components/IooEmptyState';

interface DiscoverEmptyStateProps {
  title: string;
  message: string;
}

export const DiscoverEmptyState = memo(function DiscoverEmptyState({
  title,
  message,
}: DiscoverEmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <IooEmptyState title={title} message={message} compact />
    </View>
  );
});

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    gap: spacing.sm,
  },
});

export default DiscoverEmptyState;
