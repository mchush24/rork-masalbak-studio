/**
 * HapticSettings component
 * Phase 2: Haptic System Enhancement
 *
 * Settings UI for haptic feedback control
 */

import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable, Modal } from 'react-native';
import { X, Vibrate } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { useHaptics } from '@/lib/haptics';

interface HapticSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export function HapticSettings({ visible, onClose }: HapticSettingsProps) {
  const { isEnabled, setEnabled, isSupported, tapMedium } = useHaptics();

  const handleToggle = async (value: boolean) => {
    await setEnabled(value);
    if (value) {
      // Demo the haptic when enabling
      await tapMedium();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Vibrate
                size={24}
                color={isEnabled ? Colors.secondary.lavender : Colors.neutral.medium}
              />
              <Text style={styles.title}>Titreşim Ayarları</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.neutral.dark} />
            </Pressable>
          </View>

          {/* Main Toggle */}
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Titreşim Geri Bildirimi</Text>
                <Text style={styles.settingDescription}>Dokunuşlarda titreşim hisset</Text>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={handleToggle}
                trackColor={{
                  false: Colors.neutral.light,
                  true: Colors.secondary.lavender,
                }}
                thumbColor={Colors.neutral.white}
                disabled={!isSupported}
              />
            </View>
          </View>

          {/* Info Section */}
          {isEnabled && isSupported && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Titreşim Kullanım Alanları</Text>
              <View style={styles.infoList}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>👆</Text>
                  <Text style={styles.infoText}>Buton tıklamaları</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>✅</Text>
                  <Text style={styles.infoText}>Başarılı işlemler</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>⚠️</Text>
                  <Text style={styles.infoText}>Uyarılar ve hatalar</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoIcon}>🎉</Text>
                  <Text style={styles.infoText}>Kutlamalar ve rozetler</Text>
                </View>
              </View>
            </View>
          )}

          {/* Not Supported Message */}
          {!isSupported && (
            <View style={styles.notSupportedContainer}>
              <Text style={styles.notSupportedText}>
                Titreşim geri bildirimi bu cihazda desteklenmiyor.
              </Text>
            </View>
          )}

          {/* Note */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              Titreşim geri bildirimi, uygulama deneyimini daha dokunsal hale getirir. İstediğiniz
              zaman kapatabilirsiniz.
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
    fontFamily: typography.family.bold,
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
    fontFamily: typography.family.bold,
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
    fontFamily: typography.family.semibold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['1'],
  },
  settingDescription: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },
  infoList: {
    gap: spacing['3'],
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
    padding: spacing['3'],
  },
  infoIcon: {
    fontSize: typography.size.lg,
  },
  infoText: {
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
  },
  notSupportedContainer: {
    padding: spacing['5'],
    backgroundColor: Colors.semantic.warningLight,
    margin: spacing['4'],
    borderRadius: radius.lg,
  },
  notSupportedText: {
    fontSize: typography.size.sm,
    color: Colors.semantic.warning,
    textAlign: 'center',
  },
  noteContainer: {
    padding: spacing['4'],
  },
  noteText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default HapticSettings;
