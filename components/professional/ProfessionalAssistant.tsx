/**
 * Professional Assistant Component
 * A subtle, professional AI assistant for experts and teachers
 * Part of #21: Maskot Kullanımını Yetişkin Odaklı Yap
 *
 * Replaces the playful Ioo mascot with a clean, professional interface
 * while maintaining the same helpful functionality.
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import {
  X,
  HelpCircle,
  ChevronRight,
  MessageCircle,
  Sparkles,
  Bot,
  Lightbulb,
  BookOpen,
  Info,
  ExternalLink,
} from 'lucide-react-native';
import { spacing, radius, shadows, zIndex } from '@/constants/design-system';
import { ProfessionalColors } from '@/constants/colors';
import { useRole, useIsProfessional } from '@/lib/contexts/RoleContext';
import { useHapticFeedback } from '@/lib/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Tip {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'tip' | 'warning' | 'success';
  learnMoreUrl?: string;
}

interface ProfessionalAssistantProps {
  /** Current screen/context */
  screen: string;
  /** Position of the assistant button */
  position?: 'bottom-right' | 'bottom-left' | 'top-right';
  /** Whether to show the assistant */
  visible?: boolean;
  /** Current tip to display */
  tip?: Tip | null;
  /** Called when tip is dismissed */
  onDismissTip?: (tipId: string, neverShowAgain?: boolean) => void;
}

const TYPE_CONFIG = {
  info: {
    icon: Info,
    color: ProfessionalColors.trust.primary,
    bgColor: ProfessionalColors.trust.background,
  },
  tip: {
    icon: Lightbulb,
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
  warning: {
    icon: Info,
    color: '#EF4444',
    bgColor: '#FEF2F2',
  },
  success: {
    icon: Sparkles,
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
};

// Screen-specific help content
const SCREEN_HELP: Record<string, { title: string; description: string; tips: string[] }> = {
  dashboard: {
    title: 'Dashboard',
    description: 'Genel değerlendirme özeti ve hızlı erişim araçları.',
    tips: [
      'Bekleyen değerlendirmelerinizi buradan takip edebilirsiniz',
      'Özet kartları son 30 günlük verileri gösterir',
      'Hızlı işlemler menüsünden sık kullanılan araçlara erişin',
    ],
  },
  analysis: {
    title: 'Değerlendirme',
    description: 'Klinik değerlendirme ve analiz araçları.',
    tips: [
      'Test seçimi yaş grubuna göre otomatik filtrelenir',
      'Norm verileri Türkiye standardizasyonuna dayanır',
      'Detaylı puanlama için araç menüsünü kullanın',
    ],
  },
  clients: {
    title: 'Danışan Yönetimi',
    description: 'Danışan profilleri ve vaka dosyaları.',
    tips: [
      'Arama özelliği isim, yaş ve notları tarar',
      'Arşivlenmiş vakalar ayrı sekmede görüntülenir',
      'Toplu işlemler için çoklu seçim yapabilirsiniz',
    ],
  },
  students: {
    title: 'Öğrenci Yönetimi',
    description: 'Sınıf ve öğrenci takibi.',
    tips: [
      'Toplu değerlendirme için öğrencileri seçin',
      'Sınıf raporu tüm öğrencilerin özetini sunar',
      'Dikkat gereken öğrenciler sarı ile işaretlenir',
    ],
  },
  reports: {
    title: 'Raporlar',
    description: 'PDF rapor oluşturma ve dışa aktarma.',
    tips: [
      'Klinik rapor şablonu KVKK uyumludur',
      'Toplu rapor oluşturma özelliği mevcuttur',
      'Raporlar otomatik olarak kaydedilir',
    ],
  },
  default: {
    title: 'Yardım',
    description: 'Size nasıl yardımcı olabilirim?',
    tips: [
      'Herhangi bir sorunuz varsa destek ekibimize ulaşabilirsiniz',
      'Detaylı dokümantasyon için yardım merkezini ziyaret edin',
    ],
  },
};

export const ProfessionalAssistant = memo(function ProfessionalAssistant({
  screen,
  position = 'bottom-right',
  visible = true,
  tip,
  onDismissTip,
}: ProfessionalAssistantProps) {
  const { role } = useRole();
  const isProfessional = useIsProfessional();
  const { tapMedium, selection } = useHapticFeedback();
  const [showTipPanel, setShowTipPanel] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Subtle pulse animation
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (tip) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        3, // Only pulse 3 times to not be distracting
        true
      );
    }
  }, [tip]);

  const handlePress = useCallback(() => {
    tapMedium();
    if (tip) {
      setShowTipPanel(true);
    } else {
      setShowHelpModal(true);
    }
  }, [tip, tapMedium]);

  const handleDismissTip = useCallback((neverShowAgain: boolean = false) => {
    selection();
    if (tip) {
      onDismissTip?.(tip.id, neverShowAgain);
    }
    setShowTipPanel(false);
  }, [tip, onDismissTip, selection]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const positionStyle = {
    'bottom-right': { bottom: 100, right: 16 },
    'bottom-left': { bottom: 100, left: 16 },
    'top-right': { top: 100, right: 16 },
  }[position];

  const screenHelp = SCREEN_HELP[screen] || SCREEN_HELP.default;
  const typeConfig = tip ? TYPE_CONFIG[tip.type] : TYPE_CONFIG.info;
  const TypeIcon = typeConfig.icon;

  if (!visible || !isProfessional) return null;

  return (
    <>
      {/* Assistant Button */}
      <Animated.View
        style={[styles.container, positionStyle, animatedStyle]}
      >
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Bot size={22} color={ProfessionalColors.trust.primary} strokeWidth={1.5} />

          {/* Notification indicator */}
          {tip && (
            <View style={[styles.indicator, { backgroundColor: typeConfig.color }]} />
          )}
        </Pressable>
      </Animated.View>

      {/* Tip Panel */}
      {showTipPanel && tip && (
        <Animated.View
          entering={SlideInRight.springify().damping(15)}
          style={[styles.tipPanel, positionStyle, { bottom: (positionStyle.bottom || 0) + 60 }]}
        >
          <View style={styles.tipContent}>
            {/* Header */}
            <View style={styles.tipHeader}>
              <View style={[styles.tipIconContainer, { backgroundColor: typeConfig.bgColor }]}>
                <TypeIcon size={16} color={typeConfig.color} />
              </View>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Pressable onPress={() => handleDismissTip(false)} style={styles.closeButton}>
                <X size={18} color={ProfessionalColors.text.tertiary} />
              </Pressable>
            </View>

            {/* Message */}
            <Text style={styles.tipMessage}>{tip.message}</Text>

            {/* Actions */}
            <View style={styles.tipActions}>
              {tip.learnMoreUrl && (
                <Pressable style={styles.learnMoreButton}>
                  <ExternalLink size={14} color={ProfessionalColors.trust.primary} />
                  <Text style={styles.learnMoreText}>Daha Fazla</Text>
                </Pressable>
              )}
              <Pressable onPress={() => handleDismissTip(true)}>
                <Text style={styles.dontShowText}>Bir daha gösterme</Text>
              </Pressable>
            </View>
          </View>

          {/* Arrow */}
          <View style={styles.tipArrow} />
        </Animated.View>
      )}

      {/* Help Modal */}
      <Modal
        visible={showHelpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHelpModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowHelpModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <HelpCircle size={28} color={ProfessionalColors.trust.primary} />
              </View>
              <Text style={styles.modalTitle}>{screenHelp.title}</Text>
              <Text style={styles.modalSubtitle}>{screenHelp.description}</Text>
              <Pressable
                onPress={() => setShowHelpModal(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={ProfessionalColors.text.secondary} />
              </Pressable>
            </View>

            {/* Body */}
            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>İpuçları</Text>
              {screenHelp.tips.map((tip, index) => (
                <View key={index} style={styles.helpItem}>
                  <Lightbulb size={16} color={ProfessionalColors.trust.primary} />
                  <Text style={styles.helpText}>{tip}</Text>
                </View>
              ))}

              <Text style={[styles.sectionTitle, { marginTop: spacing['4'] }]}>Hızlı Erişim</Text>
              <Pressable style={styles.helpLink}>
                <BookOpen size={18} color={ProfessionalColors.text.secondary} />
                <Text style={styles.helpLinkText}>Dokümantasyon</Text>
                <ChevronRight size={18} color={ProfessionalColors.text.tertiary} />
              </Pressable>
              <Pressable style={styles.helpLink}>
                <MessageCircle size={18} color={ProfessionalColors.text.secondary} />
                <Text style={styles.helpLinkText}>Destek</Text>
                <ChevronRight size={18} color={ProfessionalColors.text.tertiary} />
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: zIndex.popover,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...shadows.md,
  },
  buttonPressed: {
    backgroundColor: '#FAFAFA',
    transform: [{ scale: 0.96 }],
  },
  indicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // Tip Panel
  tipPanel: {
    position: 'absolute',
    right: 16,
    width: SCREEN_WIDTH - 32,
    maxWidth: 340,
    zIndex: zIndex.toast,
  },
  tipContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing['4'],
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...shadows.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginBottom: spacing['3'],
  },
  tipIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: ProfessionalColors.text.primary,
  },
  closeButton: {
    padding: spacing['1'],
  },
  tipMessage: {
    fontSize: 14,
    color: ProfessionalColors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing['3'],
  },
  tipActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  learnMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: ProfessionalColors.trust.primary,
  },
  dontShowText: {
    fontSize: 12,
    color: ProfessionalColors.text.tertiary,
  },
  tipArrow: {
    position: 'absolute',
    bottom: -8,
    right: 24,
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4'],
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...shadows.xl,
  },
  modalHeader: {
    alignItems: 'center',
    padding: spacing['6'],
    paddingBottom: spacing['4'],
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: ProfessionalColors.trust.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3'],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ProfessionalColors.text.primary,
    marginBottom: spacing['1'],
  },
  modalSubtitle: {
    fontSize: 14,
    color: ProfessionalColors.text.secondary,
    textAlign: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: spacing['4'],
    right: spacing['4'],
    padding: spacing['1'],
  },
  modalBody: {
    padding: spacing['4'],
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: ProfessionalColors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing['3'],
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['3'],
    backgroundColor: '#FAFAFA',
    padding: spacing['3'],
    borderRadius: radius.lg,
    marginBottom: spacing['2'],
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: ProfessionalColors.text.primary,
    lineHeight: 20,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  helpLinkText: {
    flex: 1,
    fontSize: 15,
    color: ProfessionalColors.text.primary,
    fontWeight: '500',
  },
});

export default ProfessionalAssistant;
