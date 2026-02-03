/**
 * DelightWrapper - Combined provider for all delight features
 * Phase 21: Polish & Delight
 *
 * Wraps the app with:
 * - Easter egg detection
 * - Seasonal themes
 * - Milestone celebrations
 *
 * Note: Delight features are implemented via hooks and components
 * (useMilestones, useSeasonalTheme, SeasonalEffects, etc.)
 * rather than context providers, so this wrapper is a simple pass-through.
 */

import React from 'react';
import { View } from 'react-native';

interface DelightWrapperProps {
  children: React.ReactNode;
}

export function DelightWrapper({ children }: DelightWrapperProps) {
  // Delight features (easter eggs, seasonal themes, milestones) are
  // implemented via hooks and components that can be used directly.
  // This wrapper provides a consistent API for future provider additions.
  return <>{children}</>;
}

export default DelightWrapper;
