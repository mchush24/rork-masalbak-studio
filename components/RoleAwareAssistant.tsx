/**
 * RoleAwareAssistant - Unified Assistant Component
 * Part of #21: Maskot Kullanımını Yetişkin Odaklı Yap
 *
 * Automatically selects the appropriate assistant style based on user role:
 * - Parent: Playful IooAssistant with mascot
 * - Teacher/Expert: Professional minimalist assistant
 */

import React, { memo } from 'react';
import { useRole, useIsProfessional, useMascotSettings } from '@/lib/contexts/RoleContext';
import { IooAssistant } from './coaching/IooAssistant';
import { ProfessionalAssistant } from './professional/ProfessionalAssistant';

type ScreenContext =
  | 'home'
  | 'analysis'
  | 'quick_analysis'
  | 'advanced_analysis'
  | 'analysis_result'
  | 'story'
  | 'story_reading'
  | 'coloring'
  | 'studio'
  | 'hayal_atolyesi'
  | 'profile'
  | 'history'
  | 'settings'
  | 'dashboard'
  | 'clients'
  | 'students'
  | 'reports';

interface RoleAwareAssistantProps {
  /** Current screen context */
  screen: ScreenContext | string;
  /** Position of the assistant */
  position?: 'bottom-right' | 'bottom-left' | 'top-right';
  /** Whether to show the assistant */
  visible?: boolean;
  /** Compact mode (smaller) */
  compact?: boolean;
}

/**
 * RoleAwareAssistant
 *
 * Renders the appropriate assistant based on user role:
 * - Parents get the playful Ioo mascot assistant
 * - Teachers and experts get the professional minimalist assistant
 */
export const RoleAwareAssistant = memo(function RoleAwareAssistant({
  screen,
  position = 'bottom-right',
  visible = true,
  compact = false,
}: RoleAwareAssistantProps) {
  const { role } = useRole();
  const isProfessional = useIsProfessional();
  const mascotSettings = useMascotSettings();

  // Don't show if not visible or mascot chat is disabled
  if (!visible || !mascotSettings.showAsChat) {
    return null;
  }

  // Professional users get the minimalist assistant
  if (isProfessional) {
    return (
      <ProfessionalAssistant
        screen={screen}
        position={position}
        visible={visible}
      />
    );
  }

  // Parents get the playful Ioo assistant
  return (
    <IooAssistant
      screen={screen as any}
      position={position}
      visible={visible}
      compact={compact}
    />
  );
});

export default RoleAwareAssistant;
