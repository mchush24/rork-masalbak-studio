/**
 * IooAssistant Component
 * Phase 9: Ioo Assistant System
 *
 * Corner assistant that provides contextual tips:
 * - Mini Ioo in corner (subtle, professional)
 * - Tappable for help panel
 * - Context-aware tips and info
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated as RNAnimated,
  Dimensions,
  Linking,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ExternalLink, Info, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { useHapticFeedback } from '@/lib/haptics';
import {
  assistantEngine,
  ScreenContext,
  AssistantTip,
} from '@/lib/coaching/AssistantEngine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface IooAssistantProps {
  /** Current screen context */
  screen: ScreenContext;
  /** Position of the assistant */
  position?: 'bottom-right' | 'bottom-left' | 'top-right';
  /** Whether to show the assistant */
  visible?: boolean;
  /** Compact mode (smaller) */
  compact?: boolean;
}

// Ioo face expressions
const IOO_MOODS = {
  happy: { eyes: '◡ ◡', mouth: '◡', color: Colors.secondary.grass },
  curious: { eyes: '◉ ◉', mouth: '○', color: Colors.secondary.sky },
  thinking: { eyes: '◑ ◑', mouth: '~', color: Colors.secondary.lavender },
  excited: { eyes: '★ ★', mouth: 'D', color: Colors.secondary.sunshine },
  supportive: { eyes: '◠ ◠', mouth: '‿', color: Colors.primary.sunset },
};

export function IooAssistant({
  screen,
  position = 'bottom-right',
  visible = true,
  compact = false,
}: IooAssistantProps) {
  const { tapMedium, selection } = useHapticFeedback();
  const [currentTip, setCurrentTip] = useState<AssistantTip | null>(null);
  const [showTipPanel, setShowTipPanel] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);

  // Animations
  const pulseScale = useSharedValue(1);
  const bounceY = useSharedValue(0);

  useEffect(() => {
    // Subtle pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );

    // Gentle bounce
    bounceY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, [pulseScale, bounceY]);

  // Load tip for current screen
  useEffect(() => {
    const loadTip = async () => {
      const tip = await assistantEngine.getTipForScreen(screen);
      setCurrentTip(tip);

      // Auto-show tip panel if there's a first-time tip
      if (tip?.firstTimeOnly && tip.priority >= 8) {
        setTimeout(() => setShowTipPanel(true), 1000);
      }
    };

    loadTip();
  }, [screen]);

  const handlePress = () => {
    tapMedium();
    if (currentTip) {
      setShowTipPanel(true);
    } else {
      setShowFullModal(true);
    }
  };

  const handleDismissTip = async (neverShowAgain: boolean = false) => {
    selection();
    if (currentTip) {
      await assistantEngine.dismissTip(currentTip.id, neverShowAgain);
    }
    setShowTipPanel(false);
    setCurrentTip(null);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value },
      { translateY: bounceY.value },
    ],
  }));

  const positionStyle = {
    'bottom-right': { bottom: 100, right: 16 },
    'bottom-left': { bottom: 100, left: 16 },
    'top-right': { top: 100, right: 16 },
  }[position];

  if (!visible) return null;

  const mood = currentTip?.mood || 'happy';
  const moodConfig = IOO_MOODS[mood];

  return (
    <>
      {/* Mini Ioo Button */}
      <Animated.View
        style={[
          styles.container,
          positionStyle,
          compact && styles.containerCompact,
          animatedStyle,
        ]}
      >
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.iooButton,
            compact && styles.iooButtonCompact,
            pressed && styles.iooButtonPressed,
          ]}
        >
          <LinearGradient
            colors={['#FFF8F0', '#FFE8D6']}
            style={[styles.iooBody, compact && styles.iooBodyCompact]}
          >
            <Text style={[styles.iooEyes, compact && styles.iooEyesCompact]}>
              {moodConfig.eyes}
            </Text>
            <Text style={[styles.iooMouth, compact && styles.iooMouthCompact]}>
              {moodConfig.mouth}
            </Text>
          </LinearGradient>

          {/* Notification dot if there's a tip */}
          {currentTip && (
            <View style={[styles.notificationDot, { backgroundColor: moodConfig.color }]} />
          )}
        </Pressable>
      </Animated.View>

      {/* Tip Panel (floating) */}
      {showTipPanel && currentTip && (
        <Animated.View
          entering={SlideInRight.springify().damping(15)}
          style={[styles.tipPanel, positionStyle, { bottom: (positionStyle.bottom || 0) + 70 }]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.98)', 'rgba(255,248,240,0.98)']}
            style={styles.tipPanelGradient}
          >
            {/* Header */}
            <View style={styles.tipHeader}>
              <View style={styles.tipTitleRow}>
                <View style={[styles.tipMoodIndicator, { backgroundColor: moodConfig.color }]} />
                <Text style={styles.tipTitle}>{currentTip.title}</Text>
              </View>
              <Pressable onPress={() => handleDismissTip(false)} style={styles.tipCloseButton}>
                <X size={18} color={Colors.neutral.medium} />
              </Pressable>
            </View>

            {/* Message */}
            <Text style={styles.tipMessage}>{currentTip.message}</Text>

            {/* Actions */}
            <View style={styles.tipActions}>
              {currentTip.learnMoreUrl && (
                <Pressable
                  onPress={() => Linking.openURL(currentTip.learnMoreUrl!)}
                  style={styles.learnMoreButton}
                >
                  <ExternalLink size={14} color={Colors.secondary.sky} />
                  <Text style={styles.learnMoreText}>Daha Fazla</Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => handleDismissTip(true)}
                style={styles.dontShowButton}
              >
                <Text style={styles.dontShowText}>Bir daha gösterme</Text>
              </Pressable>
            </View>
          </LinearGradient>

          {/* Arrow pointing to Ioo */}
          <View style={styles.tipArrow} />
        </Animated.View>
      )}

      {/* Full Help Modal */}
      <Modal
        visible={showFullModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFullModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFullModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIoo}>
                <LinearGradient
                  colors={['#FFF8F0', '#FFE8D6']}
                  style={styles.modalIooBody}
                >
                  <Text style={styles.modalIooEyes}>◡ ◡</Text>
                  <Text style={styles.modalIooMouth}>◡</Text>
                </LinearGradient>
              </View>
              <Text style={styles.modalTitle}>Merhaba!</Text>
              <Text style={styles.modalSubtitle}>
                Ben Ioo, yolculuğunuzda size yardımcı olmak için buradayım.
              </Text>
              <Pressable
                onPress={() => setShowFullModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={Colors.neutral.dark} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSectionTitle}>Bu Ekranda</Text>
              <View style={styles.helpItem}>
                <Info size={20} color={Colors.secondary.sky} />
                <Text style={styles.helpText}>
                  {getScreenHelpText(screen)}
                </Text>
              </View>

              <Text style={styles.modalSectionTitle}>Hızlı Yardım</Text>
              <Pressable style={styles.helpLink}>
                <Text style={styles.helpLinkText}>Sık Sorulan Sorular</Text>
                <ChevronRight size={18} color={Colors.neutral.medium} />
              </Pressable>
              <Pressable style={styles.helpLink}>
                <Text style={styles.helpLinkText}>Destek Al</Text>
                <ChevronRight size={18} color={Colors.neutral.medium} />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// Helper function for screen-specific help text
function getScreenHelpText(screen: ScreenContext): string {
  const texts: Record<ScreenContext, string> = {
    home: 'Ana sayfadan tüm özelliklere erişebilirsiniz. Kartlara dokunarak başlayın.',
    analysis: 'Çocuğunuzun çizimini yükleyerek AI destekli analiz yapabilirsiniz.',
    analysis_result: 'Analiz sonuçlarını inceleyebilir, kaydedebilir veya paylaşabilirsiniz.',
    story: 'İnteraktif hikayeler seçerek çocuğunuzla okuma zamanı geçirebilirsiniz.',
    story_reading: 'Hikayedeki seçimleri çocuğunuzla birlikte yapın.',
    coloring: 'Boyama araçlarını kullanarak yaratıcılığınızı ortaya koyun.',
    profile: 'Profil ayarlarınızı ve çocuk profillerini buradan yönetebilirsiniz.',
    history: 'Geçmiş aktivitelerinizi ve analizlerinizi görüntüleyebilirsiniz.',
  };
  return texts[screen] || 'Size nasıl yardımcı olabilirim?';
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  containerCompact: {
    // Smaller positioning adjustments if needed
  },

  // Ioo Button
  iooButton: {
    ...shadows.lg,
  },
  iooButtonCompact: {
    transform: [{ scale: 0.8 }],
  },
  iooButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  iooBody: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  iooBodyCompact: {
    width: 44,
    height: 44,
  },
  iooEyes: {
    fontSize: 14,
    letterSpacing: 4,
    color: Colors.neutral.darkest,
    marginBottom: -2,
  },
  iooEyesCompact: {
    fontSize: 12,
    letterSpacing: 3,
  },
  iooMouth: {
    fontSize: 12,
    color: Colors.neutral.darkest,
  },
  iooMouthCompact: {
    fontSize: 10,
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.neutral.white,
  },

  // Tip Panel
  tipPanel: {
    position: 'absolute',
    right: 16,
    width: SCREEN_WIDTH - 32,
    maxWidth: 320,
    zIndex: 1001,
  },
  tipPanelGradient: {
    borderRadius: radius.xl,
    padding: spacing['4'],
    ...shadows.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing['3'],
  },
  tipTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    flex: 1,
  },
  tipMoodIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tipTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    flex: 1,
  },
  tipCloseButton: {
    padding: spacing['1'],
  },
  tipMessage: {
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing['4'],
  },
  tipActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
  },
  learnMoreText: {
    fontSize: typography.size.sm,
    color: Colors.secondary.sky,
    fontWeight: typography.weight.medium,
  },
  dontShowButton: {
    paddingVertical: spacing['1'],
  },
  dontShowText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
  },
  tipArrow: {
    position: 'absolute',
    bottom: -8,
    right: 30,
    width: 16,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.98)',
    transform: [{ rotate: '45deg' }],
    borderBottomRightRadius: 4,
  },

  // Full Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4'],
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    ...shadows.xl,
  },
  modalHeader: {
    alignItems: 'center',
    padding: spacing['6'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  modalIoo: {
    marginBottom: spacing['4'],
  },
  modalIooBody: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
    ...shadows.md,
  },
  modalIooEyes: {
    fontSize: 20,
    letterSpacing: 6,
    color: Colors.neutral.darkest,
    marginBottom: -4,
  },
  modalIooMouth: {
    fontSize: 16,
    color: Colors.neutral.darkest,
  },
  modalTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['2'],
  },
  modalSubtitle: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: spacing['4'],
    right: spacing['4'],
    padding: spacing['2'],
  },
  modalBody: {
    padding: spacing['5'],
  },
  modalSectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.medium,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing['3'],
    marginTop: spacing['2'],
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['3'],
    backgroundColor: Colors.neutral.lightest,
    padding: spacing['4'],
    borderRadius: radius.lg,
    marginBottom: spacing['4'],
  },
  helpText: {
    flex: 1,
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
    lineHeight: typography.lineHeight.relaxed,
  },
  helpLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  helpLinkText: {
    fontSize: typography.size.base,
    color: Colors.neutral.darkest,
    fontWeight: typography.weight.medium,
  },
});

export default IooAssistant;
