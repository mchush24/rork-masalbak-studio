/**
 * IooEmptyState - Role-Aware Empty State Component
 *
 * Thin wrapper around EmptyState that provides preset configurations.
 * Use this for quick empty state implementations with predefined content.
 *
 * For custom empty states, use EmptyState directly from @/components/ui/EmptyState
 *
 * Part of #5: Empty State Tasarımları
 * Part of #21: Maskot Kullanımını Yetişkin Odaklı Yap
 */

import React from 'react';
import { ViewStyle } from 'react-native';
import {
  EmptyState,
  EmptyStateIllustration,
  IooMood,
  // Pre-configured exports
  NoAnalysisEmpty,
  NoStoriesEmpty,
  NoColoringEmpty,
  NoHistoryEmpty,
  NoChildrenEmpty,
  NoClientsEmpty,
  NoFavoritesEmpty,
  NoBadgesEmpty,
  SearchEmpty,
  ErrorEmpty,
  OfflineEmpty,
  ComingSoonEmpty,
  WelcomeEmpty,
} from '@/components/ui/EmptyState';

// Re-export types for backward compatibility
export type { IooMood, EmptyStateIllustration };

// Re-export pre-configured empty states
export {
  NoAnalysisEmpty,
  NoStoriesEmpty,
  NoColoringEmpty,
  NoHistoryEmpty,
  NoChildrenEmpty,
  NoClientsEmpty,
  NoFavoritesEmpty,
  NoBadgesEmpty,
  SearchEmpty,
  ErrorEmpty,
  OfflineEmpty,
  ComingSoonEmpty,
  WelcomeEmpty,
};

// =============================================================================
// Preset Configurations
// =============================================================================

export const EMPTY_STATE_PRESETS = {
  noResults: {
    illustration: 'search-empty' as EmptyStateIllustration,
    title: 'Sonuç bulunamadı',
    message: 'Farklı bir arama yapmayı deneyin.',
    mood: 'curious' as IooMood,
  },
  noData: {
    illustration: 'no-history' as EmptyStateIllustration,
    title: 'Başlamaya Hazır mısınız?',
    message: 'Keşfetmeye başlayın!',
    mood: 'excited' as IooMood,
  },
  noColorings: {
    illustration: 'no-coloring' as EmptyStateIllustration,
    title: 'Renkler Hazır!',
    message: 'Yaratıcı boyama sayfalarıyla renklerin dünyasına dalın.',
    mood: 'excited' as IooMood,
  },
  noStories: {
    illustration: 'no-stories' as EmptyStateIllustration,
    title: 'Masal Dünyası Sizi Bekliyor!',
    message: 'Çocuğunuzla birlikte büyülü bir masal oluşturun.',
    mood: 'excited' as IooMood,
  },
  noAnalysis: {
    illustration: 'no-analysis' as EmptyStateIllustration,
    title: 'İlk Adımı Atın!',
    message: 'Çocuğunuzun bir çizimini yükleyerek duygusal dünyasını keşfedin.',
    mood: 'excited' as IooMood,
  },
  noFavorites: {
    illustration: 'no-favorites' as EmptyStateIllustration,
    title: 'Favori yok',
    message: 'Beğendiğiniz öğeleri favorilere ekleyin.',
    mood: 'curious' as IooMood,
  },
  noChildren: {
    illustration: 'no-children' as EmptyStateIllustration,
    title: 'Çocuk profili yok',
    message: 'Profil ekleyerek başlayın.',
    mood: 'curious' as IooMood,
  },
  noClients: {
    illustration: 'no-clients' as EmptyStateIllustration,
    title: 'Danışan yok',
    message: 'Yeni danışan ekleyerek başlayın.',
    mood: 'curious' as IooMood,
  },
  error: {
    illustration: 'error' as EmptyStateIllustration,
    title: 'Bir şeyler ters gitti',
    message: 'Lütfen daha sonra tekrar deneyin.',
    mood: 'sad' as IooMood,
  },
  offline: {
    illustration: 'offline' as EmptyStateIllustration,
    title: 'İnternet bağlantısı yok',
    message: 'Bağlantınızı kontrol edip tekrar deneyin.',
    mood: 'sad' as IooMood,
  },
  comingSoon: {
    illustration: 'coming-soon' as EmptyStateIllustration,
    title: 'Çok yakında!',
    message: 'Bu özellik üzerinde çalışıyoruz.',
    mood: 'excited' as IooMood,
  },
} as const;

export type EmptyStatePreset = keyof typeof EMPTY_STATE_PRESETS;

// =============================================================================
// Main Component
// =============================================================================

interface IooEmptyStateProps {
  /** Use a preset configuration */
  preset?: EmptyStatePreset;
  /** Direct illustration type (from spread operator or custom) */
  illustration?: EmptyStateIllustration;
  /** Custom title (overrides preset) */
  title?: string;
  /** Custom message/description (overrides preset) */
  message?: string;
  /** Ioo mood for parent mode */
  mood?: IooMood;
  /** Action button configuration */
  action?: {
    label: string;
    onPress: () => void;
  };
  /** Secondary action */
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  /** Custom style */
  style?: ViewStyle;
  /** Compact mode for smaller spaces */
  compact?: boolean;
  /** Force professional styling */
  forceProStyle?: boolean;
}

export function IooEmptyState({
  preset,
  illustration,
  title,
  message,
  mood,
  action,
  secondaryAction,
  style,
  compact = false,
  forceProStyle = false,
}: IooEmptyStateProps) {
  // Get preset config if provided
  const presetConfig = preset ? EMPTY_STATE_PRESETS[preset] : null;

  // Determine final values (direct props > preset > defaults)
  const finalTitle = title || presetConfig?.title || 'Henüz veri yok';
  const finalDescription = message || presetConfig?.message || '';
  const finalMood = mood || presetConfig?.mood || 'curious';
  const finalIllustration = illustration || presetConfig?.illustration || 'no-history';

  return (
    <EmptyState
      illustration={finalIllustration}
      title={finalTitle}
      description={finalDescription}
      mascotMood={finalMood}
      actionLabel={action?.label}
      onAction={action?.onPress}
      secondaryLabel={secondaryAction?.label}
      onSecondaryAction={secondaryAction?.onPress}
      style={style}
      compact={compact}
      forceProStyle={forceProStyle}
    />
  );
}

export default IooEmptyState;
