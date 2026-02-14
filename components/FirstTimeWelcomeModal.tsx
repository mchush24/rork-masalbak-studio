import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Camera, Palette, BookOpen, X } from 'lucide-react-native';
import { useRouter, Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows, textShadows } from '@/constants/design-system';
import { hapticImpact } from '@/lib/platform';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

interface FirstTimeWelcomeModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function FirstTimeWelcomeModal({ visible, onDismiss }: FirstTimeWelcomeModalProps) {
  const router = useRouter();

  const handleAction = (route: string) => {
    hapticImpact(Haptics.ImpactFeedbackStyle.Medium);
    onDismiss();
    // Small delay for smooth transition
    setTimeout(() => {
      router.push(route as Href);
    }, 200);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <BlurView intensity={80} style={styles.blurContainer}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Close button */}
            <Pressable
              onPress={onDismiss}
              style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.6 }]}
            >
              <X size={24} color={Colors.neutral.medium} />
            </Pressable>

            {/* Header */}
            <View style={styles.header}>
              {!isSmallDevice && <Text style={styles.emoji}>👋</Text>}
              <Text style={styles.title}>{isSmallDevice && '👋 '}Hoş Geldin!</Text>
              <Text style={styles.subtitle}>
                Renkioo ile çocuğunun renkli hayal dünyasını keşfet
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
                    <Camera size={isSmallDevice ? 28 : 32} color={Colors.neutral.white} />
                  </View>
                  <Text style={styles.actionTitle}>Çizim Analizi</Text>
                  {!isSmallDevice && (
                    <Text style={styles.actionDescription}>
                      Çocuğunuzun çizimlerini AI ile analiz edin
                    </Text>
                  )}
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
                    <Palette size={isSmallDevice ? 28 : 32} color={Colors.neutral.white} />
                  </View>
                  <Text style={styles.actionTitle}>Boyama Stüdyosu</Text>
                  {!isSmallDevice && (
                    <Text style={styles.actionDescription}>
                      Çizimleri boyama sayfasına dönüştürün
                    </Text>
                  )}
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
                    <BookOpen size={isSmallDevice ? 28 : 32} color={Colors.neutral.white} />
                  </View>
                  <Text style={styles.actionTitle}>Kişisel Hikayeler</Text>
                  {!isSmallDevice && (
                    <Text style={styles.actionDescription}>Çizimlerden masallar oluşturun</Text>
                  )}
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Oluştur →</Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Skip button */}
            <Pressable
              onPress={onDismiss}
              style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.6 }]}
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
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: radius['3xl'],
    padding: isSmallDevice ? spacing['4'] : spacing['6'],
    ...shadows.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
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
    marginBottom: isSmallDevice ? spacing['4'] : spacing['6'],
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing['3'],
  },
  title: {
    fontSize: isSmallDevice ? typography.size['2xl'] : typography.size['3xl'],
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['2'],
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: isSmallDevice ? typography.size.sm : typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: isSmallDevice ? typography.size.sm * 1.5 : typography.size.base * 1.5,
    paddingHorizontal: isSmallDevice ? 0 : spacing['2'],
  },
  actionsContainer: {
    gap: isSmallDevice ? spacing['2'] : spacing['3'],
    marginBottom: isSmallDevice ? spacing['4'] : spacing['5'],
  },
  actionCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  actionCardGradient: {
    padding: isSmallDevice ? spacing['4'] : spacing['5'],
  },
  actionIconContainer: {
    width: isSmallDevice ? 48 : 56,
    height: isSmallDevice ? 48 : 56,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallDevice ? spacing['2'] : spacing['3'],
  },
  actionTitle: {
    fontSize: isSmallDevice ? typography.size.base : typography.size.lg,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
    marginBottom: isSmallDevice ? spacing['1'] : spacing['2'],
    letterSpacing: typography.letterSpacing.tight,
    ...textShadows.md,
  },
  actionDescription: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: spacing['4'],
    lineHeight: typography.size.sm * 1.5,
    ...textShadows.sm,
  },
  actionButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.lg,
  },
  actionButtonText: {
    fontSize: isSmallDevice ? typography.size.xs : typography.size.sm,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
    ...textShadows.sm,
  },
  skipButton: {
    paddingVertical: isSmallDevice ? spacing['2'] : spacing['3'],
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: isSmallDevice ? typography.size.sm : typography.size.base,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.medium,
  },
});
