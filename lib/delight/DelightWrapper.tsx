/**
 * DelightWrapper - Combined provider for all delight features
 * Phase 21: Polish & Delight
 *
 * Wraps the app with:
 * - Easter egg detection
 * - Seasonal themes
 * - Milestone celebrations
 */

import React from 'react';
import { EasterEggProvider } from './EasterEggs';
import { SeasonalProvider } from './SeasonalThemes';
import { DelightProvider } from './DelightMoments';

interface DelightWrapperProps {
  children: React.ReactNode;
}

export function DelightWrapper({ children }: DelightWrapperProps) {
  return (
    <DelightProvider>
      <SeasonalProvider>
        <EasterEggProvider>
          {children}
        </EasterEggProvider>
      </SeasonalProvider>
    </DelightProvider>
  );
}

export default DelightWrapper;
