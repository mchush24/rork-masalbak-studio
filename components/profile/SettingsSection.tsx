/**
 * SettingsSection - Categorized settings section
 *
 * Thin wrapper around CollapsibleSection that preserves the original
 * SettingsSection API (icon required, defaultExpanded=true) while
 * gaining smooth animated height transitions.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { shadows } from '@/constants/design-system';

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  badge?: string;
}

export function SettingsSection({
  title,
  icon,
  children,
  defaultExpanded = true,
  badge,
}: SettingsSectionProps) {
  return (
    <CollapsibleSection
      title={title}
      icon={icon}
      defaultExpanded={defaultExpanded}
      badge={badge}
      containerStyle={styles.container}
    >
      {children}
    </CollapsibleSection>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...shadows.md,
  },
});

export default SettingsSection;
