import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Camera, Palette, BookOpen, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import {
  layout,
  typography,
  spacing,
  radius,
  shadows,
} from '@/constants/design-system';

interface FirstTimeWelcomeModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function FirstTimeWelcomeModal({ visible, onDismiss }: FirstTimeWelcomeModalProps) {
  const router = useRouter();

  const handleAction = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDismiss();
    // Small delay for smooth transition
    setTimeout(() => {
      router.push(route as any);
    }, 200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Close button */}
            <Pressable
              onPress={onDismiss}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.6 },
              ]}
            >
              <X size={24} color={Colors.neutral.medium} />
            </Pressable>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.emoji}>👋</Text>
              <Text style={styles.title}>Hoş Geldin!</Text>
              <Text style={styles.subtitle}>
                Zuna ile çocuğunun hayal dünyasını keşfet
              </Text>
            </View>

            {/* Action Cards */}
            <View style={styles.actionsContainer}>
              {/* Drawing Analysis */}
              <Pressable
                onPress={() => handleAction('/(tabs)')}
                style={({ pressed }) => [
                  styles.actionCard,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
              >
                <LinearGradient
                  colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                  style={styles.actionCardGradient}
                >
                  <View style={styles.actionIconContainer}>
                    <Camera size={32} color={Colors.neutral.white} />
                  </View>
                  <Text style={styles.actionTitle}>Çizim Analizi</Text>
                  <Text style={styles.actionDescription}>
                    Çocuğunuzun çizimlerini AI ile analiz edin
                  </Text>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Hemen Dene →</Text>
                  </View>
                </LinearGradient>
              </Pressable>

              {/* Interactive Coloring */}
              <Pressable
                onPress={() => handleAction('/(tabs)/studio')}
                style={({ pressed }) => [
                  styles.actionCard,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
              >
                <LinearGradient
                  colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                  style={styles.actionCardGradient}
                >
                  <View style={styles.actionIconContainer}>
                    <Palette size={32} color={Colors.neutral.white} />
                  </View>
                  <Text style={styles.actionTitle}>Boyama Stüdyosu</Text>
                  <Text style={styles.actionDescription}>
                    Çizimleri boyama sayfasına dönüştürün
                  </Text>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Keşfet →</Text>
                  </View>
                </LinearGradient>
              </Pressable>

              {/* Stories */}
              <Pressable
                onPress={() => handleAction('/(tabs)/stories')}
                style={({ pressed }) => [
                  styles.actionCard,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
              >
                <LinearGradient
                  colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
                  style={styles.actionCardGradient}
                >
                  <View style={styles.actionIconContainer}>
                    <BookOpen size={32} color={Colors.neutral.white} />
                  </View>
                  <Text style={styles.actionTitle}>Kişisel Hikayeler</Text>
                  <Text style={styles.actionDescription}>
                    Çizimlerden masallar oluşturun
                  </Text>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Oluştur →</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Skip button */}
            <Pressable
              onPress={onDismiss}
              style={({ pressed }) => [
                styles.skipButton,
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.skipButtonText}>Keşfetmeye Başla</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? 'rgba(0,0,0,0.5)' : undefined,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius['3xl'],
    padding: spacing['6'],
    ...shadows.xl,
  },
  closeButton: {
    position: 'absolute',
    top: spacing['4'],
    right: spacing['4'],
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.lightest,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['2'],
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: typography.size.base * 1.5,
  },
  actionsContainer: {
    gap: spacing['3'],
    marginBottom: spacing['5'],
  },
  actionCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  actionCardGradient: {
    padding: spacing['5'],
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  actionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
    marginBottom: spacing['2'],
    letterSpacing: typography.letterSpacing.tight,
  },
  actionDescription: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing['4'],
    lineHeight: typography.size.sm * 1.5,
  },
  actionButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.lg,
  },
  actionButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.white,
  },
  skipButton: {
    paddingVertical: spacing['3'],
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.medium,
  },
});
