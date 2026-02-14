import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { hapticImpact } from '@/lib/platform';

interface AgePickerModalProps {
  visible: boolean;
  onSelectAge: (age: number) => void;
  onSkip: () => void;
}

const AGE_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function AgePickerModal({ visible, onSelectAge, onSkip }: AgePickerModalProps) {
  const [selectedAge, setSelectedAge] = useState<number | null>(null);

  const handleSelectAge = (age: number) => {
    hapticImpact(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAge(age);
    // Small delay for visual feedback
    setTimeout(() => {
      onSelectAge(age);
    }, 150);
  };

  const handleSkip = () => {
    hapticImpact(Haptics.ImpactFeedbackStyle.Light);
    onSkip();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onSkip}>
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.emoji}>🎯</Text>
              <Text style={styles.title}>Daha İyi Analiz İçin</Text>
              <Text style={styles.subtitle}>Çocuğunuzun yaşı nedir? (Opsiyonel)</Text>
              <Text style={styles.description}>
                Yaş bilgisi, analiz sonuçlarını yaşa uygun hale getirir
              </Text>
            </View>

            {/* Age Grid */}
            <View style={styles.ageGrid}>
              {AGE_OPTIONS.map(age => (
                <Pressable
                  key={age}
                  onPress={() => handleSelectAge(age)}
                  style={({ pressed }) => [
                    styles.ageButton,
                    selectedAge === age && styles.ageButtonSelected,
                    pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <LinearGradient
                    colors={
                      selectedAge === age
                        ? [Colors.secondary.grass, Colors.secondary.grassLight]
                        : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                    }
                    style={styles.ageButtonGradient}
                  >
                    <Text
                      style={[
                        styles.ageButtonText,
                        selectedAge === age && styles.ageButtonTextSelected,
                      ]}
                    >
                      {age}
                    </Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>

            {/* Skip button */}
            <Pressable
              onPress={handleSkip}
              style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.skipButtonText}>Şimdilik Atla</Text>
            </Pressable>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Platform.OS === 'web' ? 'rgba(0,0,0,0.5)' : undefined,
  },
  modalContainer: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    padding: spacing['6'],
    paddingBottom: spacing['8'],
    ...shadows.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['6'],
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing['3'],
  },
  title: {
    fontSize: typography.size['2xl'],
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['2'],
    letterSpacing: typography.letterSpacing.tight,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
    marginBottom: spacing['1'],
  },
  description: {
    fontSize: typography.size.sm,
    color: Colors.neutral.light,
    textAlign: 'center',
    lineHeight: typography.size.sm * 1.5,
  },
  ageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
    marginBottom: spacing['5'],
    justifyContent: 'center',
  },
  ageButton: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  ageButtonSelected: {
    ...shadows.md,
  },
  ageButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: radius.lg,
  },
  ageButtonText: {
    fontSize: typography.size.xl,
    fontFamily: typography.family.bold,
    color: Colors.neutral.dark,
  },
  ageButtonTextSelected: {
    color: Colors.neutral.white,
  },
  skipButton: {
    paddingVertical: spacing['4'],
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: typography.size.base,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.medium,
  },
});
