/**
 * Gamification Settings Component
 * Part of #22: Gamification'ı Opsiyonel/Subtle Yap
 *
 * Allows teachers to optionally enable/disable gamification features.
 * This component is intended for use in settings screens.
 *
 * Note: For parents, gamification is always enabled.
 * For experts, gamification is always disabled.
 * Only teachers have the option to toggle.
 */

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
} from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import {
  Star,
  Flame,
  Award,
  PartyPopper,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { useRole, useGamification } from '@/lib/contexts/RoleContext';
import { spacing, radius } from '@/constants/design-system';

interface GamificationSettingsProps {
  /** Called when any setting changes */
  onSettingsChange?: (settings: {
    enabled: boolean;
    showXP: boolean;
    showBadges: boolean;
    showStreak: boolean;
    showCelebrations: boolean;
  }) => void;
}

interface FeatureToggleProps {
  icon: React.ComponentType<any>;
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  color: string;
}

const FeatureToggle = memo(function FeatureToggle({
  icon: Icon,
  label,
  description,
  value,
  onChange,
  disabled = false,
  color,
}: FeatureToggleProps) {
  return (
    <View style={[styles.featureToggle, disabled && styles.featureToggleDisabled]}>
      <View style={[styles.featureIconContainer, { backgroundColor: `${color}15` }]}>
        <Icon size={20} color={disabled ? '#9CA3AF' : color} />
      </View>
      <View style={styles.featureInfo}>
        <Text style={[styles.featureLabel, disabled && styles.featureLabelDisabled]}>
          {label}
        </Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: '#E5E7EB', true: `${color}40` }}
        thumbColor={value && !disabled ? color : '#F3F4F6'}
      />
    </View>
  );
});

export const GamificationSettings = memo(function GamificationSettings({
  onSettingsChange,
}: GamificationSettingsProps) {
  const { role } = useRole();
  const gamification = useGamification();

  // Local state for settings (in a real app, this would be persisted)
  const [enabled, setEnabled] = useState(gamification.enabled);
  const [showXP, setShowXP] = useState(gamification.showXP);
  const [showBadges, setShowBadges] = useState(gamification.showBadges);
  const [showStreak, setShowStreak] = useState(gamification.showStreak);
  const [showCelebrations, setShowCelebrations] = useState(gamification.showCelebrations);
  const [expanded, setExpanded] = useState(false);

  // Only teachers can toggle gamification
  const canToggle = role === 'teacher';

  const handleEnabledChange = useCallback((value: boolean) => {
    setEnabled(value);
    if (!value) {
      // If disabling, turn off all features
      setShowXP(false);
      setShowBadges(false);
      setShowStreak(false);
      setShowCelebrations(false);
    }
    onSettingsChange?.({
      enabled: value,
      showXP: value ? showXP : false,
      showBadges: value ? showBadges : false,
      showStreak: value ? showStreak : false,
      showCelebrations: value ? showCelebrations : false,
    });
  }, [showXP, showBadges, showStreak, showCelebrations, onSettingsChange]);

  const handleFeatureChange = useCallback(
    (feature: 'showXP' | 'showBadges' | 'showStreak' | 'showCelebrations', value: boolean) => {
      const setters = {
        showXP: setShowXP,
        showBadges: setShowBadges,
        showStreak: setShowStreak,
        showCelebrations: setShowCelebrations,
      };
      setters[feature](value);
      onSettingsChange?.({
        enabled,
        showXP: feature === 'showXP' ? value : showXP,
        showBadges: feature === 'showBadges' ? value : showBadges,
        showStreak: feature === 'showStreak' ? value : showStreak,
        showCelebrations: feature === 'showCelebrations' ? value : showCelebrations,
      });
    },
    [enabled, showXP, showBadges, showStreak, showCelebrations, onSettingsChange]
  );

  // For parents: show info that gamification is enabled
  // For experts: show info that gamification is disabled
  if (role === 'parent') {
    return (
      <View style={styles.infoContainer}>
        <View style={styles.infoIconContainer}>
          <PartyPopper size={24} color="#7C3AED" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Oyunlaştırma Aktif</Text>
          <Text style={styles.infoDescription}>
            Çocuğunuzun motivasyonunu artırmak için XP, rozetler ve seriler etkin.
          </Text>
        </View>
      </View>
    );
  }

  if (role === 'expert') {
    return (
      <View style={styles.infoContainer}>
        <View style={[styles.infoIconContainer, { backgroundColor: '#F3F4F6' }]}>
          <Info size={24} color="#6B7280" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Profesyonel Mod</Text>
          <Text style={styles.infoDescription}>
            Klinik kullanım için oyunlaştırma özellikleri devre dışıdır.
          </Text>
        </View>
      </View>
    );
  }

  // Teacher view with toggle options
  return (
    <View style={styles.container}>
      {/* Main Toggle */}
      <Pressable
        style={styles.mainToggle}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.mainToggleLeft}>
          <View style={[styles.mainIconContainer, enabled && styles.mainIconContainerActive]}>
            <Star size={24} color={enabled ? '#F59E0B' : '#9CA3AF'} fill={enabled ? '#F59E0B' : 'transparent'} />
          </View>
          <View style={styles.mainToggleInfo}>
            <Text style={styles.mainToggleTitle}>Oyunlaştırma</Text>
            <Text style={styles.mainToggleDescription}>
              {enabled ? 'Aktif - Öğrenciler XP ve rozet kazanabilir' : 'Kapalı'}
            </Text>
          </View>
        </View>
        <View style={styles.mainToggleRight}>
          <Switch
            value={enabled}
            onValueChange={handleEnabledChange}
            trackColor={{ false: '#E5E7EB', true: '#FCD34D' }}
            thumbColor={enabled ? '#F59E0B' : '#F3F4F6'}
          />
          {enabled && (
            expanded ? (
              <ChevronUp size={20} color="#9CA3AF" style={styles.chevron} />
            ) : (
              <ChevronDown size={20} color="#9CA3AF" style={styles.chevron} />
            )
          )}
        </View>
      </Pressable>

      {/* Feature Toggles (only shown when enabled and expanded) */}
      {enabled && expanded && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          layout={Layout.springify()}
          style={styles.featuresContainer}
        >
          <FeatureToggle
            icon={Star}
            label="XP Sistemi"
            description="Öğrenciler tamamlanan görevlerden XP kazanır"
            value={showXP}
            onChange={(v) => handleFeatureChange('showXP', v)}
            disabled={!enabled}
            color="#F59E0B"
          />

          <FeatureToggle
            icon={Award}
            label="Rozetler"
            description="Başarılar için rozet koleksiyonu"
            value={showBadges}
            onChange={(v) => handleFeatureChange('showBadges', v)}
            disabled={!enabled}
            color="#8B5CF6"
          />

          <FeatureToggle
            icon={Flame}
            label="Gün Serisi"
            description="Ardışık gün takibi"
            value={showStreak}
            onChange={(v) => handleFeatureChange('showStreak', v)}
            disabled={!enabled}
            color="#EF4444"
          />

          <FeatureToggle
            icon={PartyPopper}
            label="Kutlamalar"
            description="Başarılarda animasyonlu kutlama"
            value={showCelebrations}
            onChange={(v) => handleFeatureChange('showCelebrations', v)}
            disabled={!enabled}
            color="#10B981"
          />
        </Animated.View>
      )}

      {/* Helper text */}
      <View style={styles.helperContainer}>
        <Info size={14} color="#9CA3AF" />
        <Text style={styles.helperText}>
          Oyunlaştırma, öğrencilerin motivasyonunu artırabilir. İhtiyacınıza göre özelleştirebilirsiniz.
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  mainToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing['4'],
  },
  mainToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    flex: 1,
  },
  mainIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainIconContainerActive: {
    backgroundColor: '#FEF3C7',
  },
  mainToggleInfo: {
    flex: 1,
  },
  mainToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  mainToggleDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  mainToggleRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: spacing['2'],
  },
  featuresContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingVertical: spacing['2'],
  },
  featureToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['3'],
    paddingHorizontal: spacing['4'],
    gap: spacing['3'],
  },
  featureToggleDisabled: {
    opacity: 0.5,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfo: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  featureLabelDisabled: {
    color: '#9CA3AF',
  },
  featureDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 1,
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['2'],
    padding: spacing['3'],
    paddingHorizontal: spacing['4'],
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  helperText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  // Info container styles (for parent/expert)
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['4'],
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: spacing['3'],
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default GamificationSettings;
