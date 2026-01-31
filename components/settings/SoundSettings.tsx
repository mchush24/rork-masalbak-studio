/**
 * SoundSettings component
 * Phase 1: Sound Foundation
 *
 * Settings UI for sound control:
 * - Sound on/off toggle
 * - Volume slider
 * - Category toggles
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  Modal,
} from 'react-native';
import { X, Volume2, VolumeX, ChevronRight } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { useSound } from '@/lib/audio/useSound';
import { SOUND_CATEGORIES, SoundCategory } from '@/lib/audio/sounds';

interface SoundSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export function SoundSettings({ visible, onClose }: SoundSettingsProps) {
  const {
    isEnabled,
    setEnabled,
    volume,
    setVolume,
    isCategoryEnabled,
    setCategoryEnabled,
    playTap,
  } = useSound();

  const [localVolume, setLocalVolume] = useState(volume);
  const [categoryStates, setCategoryStates] = useState<Record<SoundCategory, boolean>>({
    ui: true,
    celebration: true,
    gamification: true,
    mascot: true,
    analysis: true,
  });

  // Sync local state with sound manager
  useEffect(() => {
    setLocalVolume(volume);
    setCategoryStates({
      ui: isCategoryEnabled('ui'),
      celebration: isCategoryEnabled('celebration'),
      gamification: isCategoryEnabled('gamification'),
      mascot: isCategoryEnabled('mascot'),
      analysis: isCategoryEnabled('analysis'),
    });
  }, [volume, isCategoryEnabled, visible]);

  const handleVolumeChange = (value: number) => {
    setLocalVolume(value);
  };

  const handleVolumeChangeComplete = async (value: number) => {
    await setVolume(value);
    // Play tap sound to demonstrate volume
    if (isEnabled) {
      await playTap();
    }
  };

  const handleCategoryToggle = async (category: SoundCategory, enabled: boolean) => {
    setCategoryStates(prev => ({ ...prev, [category]: enabled }));
    await setCategoryEnabled(category, enabled);
  };

  const handleMasterToggle = async (enabled: boolean) => {
    await setEnabled(enabled);
    if (enabled) {
      await playTap();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              {isEnabled ? (
                <Volume2 size={24} color={Colors.secondary.grass} />
              ) : (
                <VolumeX size={24} color={Colors.neutral.medium} />
              )}
              <Text style={styles.title}>Ses Ayarları</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.neutral.dark} />
            </Pressable>
          </View>

          {/* Master Toggle */}
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Sesler</Text>
                <Text style={styles.settingDescription}>
                  Uygulama seslerini aç/kapat
                </Text>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={handleMasterToggle}
                trackColor={{
                  false: Colors.neutral.light,
                  true: Colors.secondary.grass,
                }}
                thumbColor={Colors.neutral.white}
              />
            </View>
          </View>

          {/* Volume Slider */}
          {isEnabled && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ses Seviyesi</Text>
              <View style={styles.volumeContainer}>
                <VolumeX size={20} color={Colors.neutral.medium} />
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.1}
                  value={localVolume}
                  onValueChange={handleVolumeChange}
                  onSlidingComplete={handleVolumeChangeComplete}
                  minimumTrackTintColor={Colors.secondary.grass}
                  maximumTrackTintColor={Colors.neutral.lighter}
                  thumbTintColor={Colors.secondary.grass}
                />
                <Volume2 size={20} color={Colors.secondary.grass} />
              </View>
              <Text style={styles.volumeValue}>
                {Math.round(localVolume * 100)}%
              </Text>
            </View>
          )}

          {/* Category Settings */}
          {isEnabled && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ses Kategorileri</Text>
              <View style={styles.categoriesList}>
                {(Object.keys(SOUND_CATEGORIES) as SoundCategory[]).map((category) => {
                  const info = SOUND_CATEGORIES[category];
                  return (
                    <View key={category} style={styles.categoryRow}>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryLabel}>{info.label}</Text>
                        <Text style={styles.categoryDescription}>
                          {info.description}
                        </Text>
                      </View>
                      <Switch
                        value={categoryStates[category]}
                        onValueChange={(value) => handleCategoryToggle(category, value)}
                        trackColor={{
                          false: Colors.neutral.light,
                          true: Colors.secondary.sky,
                        }}
                        thumbColor={Colors.neutral.white}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Info Note */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              Not: Ses efektleri sadece mobil cihazlarda çalışır. Web versiyonunda sesler kapalıdır.
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4'],
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: radius.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...shadows.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing['5'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  closeButton: {
    padding: spacing['2'],
  },
  section: {
    padding: spacing['5'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.medium,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing['3'],
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['1'],
  },
  settingDescription: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  slider: {
    flex: 1,
    height: 40,
  },
  volumeValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.secondary.grass,
    textAlign: 'center',
    marginTop: spacing['2'],
  },
  categoriesList: {
    gap: spacing['3'],
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
    padding: spacing['4'],
  },
  categoryInfo: {
    flex: 1,
    marginRight: spacing['3'],
  },
  categoryLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
  },
  categoryDescription: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    marginTop: spacing['1'],
  },
  noteContainer: {
    padding: spacing['4'],
  },
  noteText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SoundSettings;
