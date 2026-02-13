/**
 * CrashRecoveryDialog Component
 * Part of #3: Oturum Kurtarma Modal Düzeltmeleri
 *
 * Shows a dialog after app crash to offer session recovery options
 *
 * Features:
 * - Role-aware mascot display (Ioo for parents, icon for professionals)
 * - Role-specific messaging via copywriting service
 * - Professional mode styling
 * - Clear visual hierarchy
 * - Draft preview with type information
 * - Smooth animations and haptic feedback
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import {
  RotateCcw,
  Trash2,
  FileText,
  Clock,
  AlertCircle,
  History,
  File,
  Palette,
  BookOpen,
  ChevronRight,
  Shield,
} from 'lucide-react-native';
import { Colors, ProfessionalColors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { useCrashRecovery, SessionState } from '@/lib/persistence';
import { useHapticFeedback } from '@/lib/haptics';
import { IooRoleAware } from '@/components/Ioo';
import { useRole, useMascotSettings, useIsProfessional } from '@/lib/contexts/RoleContext';
import { useOverlay } from '@/lib/overlay';

interface CrashRecoveryDialogProps {
  /** Callback when user chooses to recover */
  onRecover?: (session: SessionState) => void;
  /** Callback when user dismisses */
  onDismiss?: () => void;
  /** Show drafts count */
  showDrafts?: boolean;
}

// Draft type icons mapping
const DRAFT_TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  analysis: FileText,
  coloring: Palette,
  story: BookOpen,
  default: File,
};

// Get icon for draft type
function getDraftIcon(draftId: string): React.ComponentType<{ size?: number; color?: string }> {
  const type = draftId.split('_')[0];
  return DRAFT_TYPE_ICONS[type] || DRAFT_TYPE_ICONS.default;
}

// Get human-readable draft type name
function getDraftTypeName(draftId: string): string {
  const type = draftId.split('_')[0];
  const names: Record<string, string> = {
    analysis: 'Analiz',
    coloring: 'Boyama',
    story: 'Hikaye',
  };
  return names[type] || 'Taslak';
}

// Role-specific content
function getRecoveryContent(role: 'parent' | 'teacher' | 'expert') {
  const content = {
    parent: {
      title: 'Kaldığınız Yerden Devam Edin',
      description: 'Uygulama beklenmedik şekilde kapanmış. Endişelenmeyin, verileriniz güvende!',
      recoverButton: 'Devam Et',
      dismissButton: 'Yeni Başla',
      note: '"Yeni Başla" seçerseniz kaydedilmemiş çalışmalar kaybolabilir.',
      recoveredMessage: 'Harika! Son oturumunuza geri dönüyorsunuz.',
    },
    teacher: {
      title: 'Oturum Kurtarma',
      description: 'Önceki oturumunuz kurtarılabilir. Devam etmek ister misiniz?',
      recoverButton: 'Oturumu Kurtar',
      dismissButton: 'Yeni Oturum',
      note: 'Kaydedilmemiş değişiklikler kaybolabilir.',
      recoveredMessage: 'Oturum başarıyla kurtarıldı.',
    },
    expert: {
      title: 'Oturum Kurtarma',
      description: 'Beklenmeyen kapanma tespit edildi. Önceki oturum verileri mevcut.',
      recoverButton: 'Kurtar',
      dismissButton: 'Yeni Başlat',
      note: 'Kaydedilmemiş veriler kaybolacaktır.',
      recoveredMessage: 'Oturum kurtarıldı.',
    },
  };
  return content[role];
}

export function CrashRecoveryDialog({
  onRecover,
  onDismiss,
  showDrafts = true,
}: CrashRecoveryDialogProps) {
  const { showRecoveryDialog, crashRecovery, recover, dismiss } = useCrashRecovery(onRecover);
  const { tapMedium, success, warning } = useHapticFeedback();
  const { role } = useRole();
  const mascotSettings = useMascotSettings();
  const isProfessional = useIsProfessional();

  // Get role-specific content
  const content = useMemo(() => getRecoveryContent(role), [role]);

  // Overlay coordination - crash recovery has highest priority
  const { request: requestOverlay, release: releaseOverlay } = useOverlay(
    'crash_recovery',
    'crash_recovery_dialog'
  );

  // Animations
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (showRecoveryDialog) {
      requestOverlay();
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });

      // Subtle attention shake
      shake.value = withDelay(
        300,
        withSequence(
          withTiming(3, { duration: 50 }),
          withTiming(-3, { duration: 50 }),
          withTiming(2, { duration: 50 }),
          withTiming(0, { duration: 50 })
        )
      );

      warning();
    }
  }, [showRecoveryDialog, scale, opacity, shake, warning, requestOverlay]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
    opacity: opacity.value,
  }));

  const handleRecover = () => {
    tapMedium();
    success();
    releaseOverlay();
    recover();
  };

  const handleDismiss = () => {
    tapMedium();
    releaseOverlay();
    dismiss();
    onDismiss?.();
  };

  if (!showRecoveryDialog || !crashRecovery) {
    return null;
  }

  const lastSession = crashRecovery.lastSession;
  const pendingDrafts = crashRecovery.pendingDrafts;
  const pendingDraftsCount = pendingDrafts.length;

  // Show mascot based on settings
  const showMascot =
    mascotSettings.showOnErrors && mascotSettings.prominence !== 'hidden' && !isProfessional;

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;

    return date.toLocaleString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    });
  };

  // Get screen display name
  const getScreenName = (screen?: string) => {
    if (!screen) return 'Bilinmeyen';
    const names: Record<string, string> = {
      '(tabs)': 'Ana Sayfa',
      analysis: 'Analiz',
      coloring: 'Boyama',
      stories: 'Hikayeler',
      profile: 'Profil',
      history: 'Geçmiş',
    };
    return names[screen] || screen;
  };

  return (
    <Modal visible={showRecoveryDialog} transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        {Platform.OS !== 'web' && (
          <BlurView
            intensity={isProfessional ? 10 : 20}
            tint={isProfessional ? 'light' : 'dark'}
            style={StyleSheet.absoluteFill}
          />
        )}

        <Animated.View style={[styles.dialogContainer, containerStyle]}>
          <View style={[styles.dialog, isProfessional && styles.dialogProfessional]}>
            {/* Visual Header */}
            <Animated.View
              entering={FadeIn.delay(100).duration(300)}
              style={[styles.headerSection, isProfessional && styles.headerSectionProfessional]}
            >
              {showMascot ? (
                <IooRoleAware mood="concerned" size="medium" context="error" animated />
              ) : (
                <View
                  style={[styles.iconContainer, isProfessional && styles.iconContainerProfessional]}
                >
                  <History
                    size={32}
                    color={
                      isProfessional ? ProfessionalColors.trust.primary : Colors.secondary.grass
                    }
                    strokeWidth={1.5}
                  />
                </View>
              )}
            </Animated.View>

            {/* Title & Description */}
            <Animated.View
              entering={FadeInDown.delay(150).duration(300)}
              style={styles.textSection}
            >
              <Text style={[styles.title, isProfessional && styles.titleProfessional]}>
                {content.title}
              </Text>
              <Text style={[styles.description, isProfessional && styles.descriptionProfessional]}>
                {content.description}
              </Text>
            </Animated.View>

            {/* Session Info Card */}
            {lastSession && (
              <Animated.View
                entering={FadeInDown.delay(200).duration(300)}
                style={[styles.sessionCard, isProfessional && styles.sessionCardProfessional]}
              >
                <View style={styles.sessionCardHeader}>
                  <Clock
                    size={14}
                    color={
                      isProfessional ? ProfessionalColors.text.secondary : Colors.neutral.medium
                    }
                  />
                  <Text
                    style={[
                      styles.sessionCardTitle,
                      isProfessional && styles.sessionCardTitleProfessional,
                    ]}
                  >
                    Son Oturum
                  </Text>
                </View>

                <View style={styles.sessionDetails}>
                  {lastSession.lastScreen && (
                    <View style={styles.sessionRow}>
                      <FileText
                        size={14}
                        color={
                          isProfessional ? ProfessionalColors.text.tertiary : Colors.neutral.light
                        }
                      />
                      <Text
                        style={[
                          styles.sessionLabel,
                          isProfessional && styles.sessionLabelProfessional,
                        ]}
                      >
                        Sayfa:
                      </Text>
                      <Text
                        style={[
                          styles.sessionValue,
                          isProfessional && styles.sessionValueProfessional,
                        ]}
                      >
                        {getScreenName(lastSession.lastScreen)}
                      </Text>
                    </View>
                  )}
                  {lastSession.timestamp && (
                    <View style={styles.sessionRow}>
                      <Clock
                        size={14}
                        color={
                          isProfessional ? ProfessionalColors.text.tertiary : Colors.neutral.light
                        }
                      />
                      <Text
                        style={[
                          styles.sessionLabel,
                          isProfessional && styles.sessionLabelProfessional,
                        ]}
                      >
                        Zaman:
                      </Text>
                      <Text
                        style={[
                          styles.sessionValue,
                          isProfessional && styles.sessionValueProfessional,
                        ]}
                      >
                        {formatTime(lastSession.timestamp)}
                      </Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            )}

            {/* Pending Drafts */}
            {showDrafts && pendingDraftsCount > 0 && (
              <Animated.View
                entering={FadeInDown.delay(250).duration(300)}
                style={[styles.draftsCard, isProfessional && styles.draftsCardProfessional]}
              >
                <View style={styles.draftsHeader}>
                  <AlertCircle
                    size={16}
                    color={isProfessional ? '#D97706' : Colors.semantic.warning}
                  />
                  <Text
                    style={[styles.draftsTitle, isProfessional && styles.draftsTitleProfessional]}
                  >
                    {pendingDraftsCount} Kaydedilmemiş Taslak
                  </Text>
                </View>

                {/* Draft List (show max 3) */}
                {pendingDrafts.slice(0, 3).map((draftId, _index) => {
                  const DraftIcon = getDraftIcon(draftId);
                  return (
                    <View key={draftId} style={styles.draftItem}>
                      <DraftIcon
                        size={14}
                        color={
                          isProfessional ? ProfessionalColors.text.tertiary : Colors.neutral.medium
                        }
                      />
                      <Text
                        style={[
                          styles.draftItemText,
                          isProfessional && styles.draftItemTextProfessional,
                        ]}
                      >
                        {getDraftTypeName(draftId)}
                      </Text>
                    </View>
                  );
                })}

                {pendingDraftsCount > 3 && (
                  <Text style={styles.moreDrafts}>+{pendingDraftsCount - 3} daha</Text>
                )}
              </Animated.View>
            )}

            {/* Action Buttons */}
            <Animated.View entering={FadeInUp.delay(300).duration(300)} style={styles.buttons}>
              <Pressable
                onPress={handleRecover}
                style={({ pressed }) => [
                  styles.recoverButton,
                  isProfessional && styles.recoverButtonProfessional,
                  pressed && styles.buttonPressed,
                ]}
              >
                <RotateCcw size={18} color={Colors.neutral.white} />
                <Text style={styles.recoverButtonText}>{content.recoverButton}</Text>
                <ChevronRight size={18} color={Colors.neutral.white} />
              </Pressable>

              <Pressable
                onPress={handleDismiss}
                style={({ pressed }) => [
                  styles.dismissButton,
                  isProfessional && styles.dismissButtonProfessional,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Trash2
                  size={16}
                  color={isProfessional ? ProfessionalColors.text.secondary : Colors.neutral.medium}
                />
                <Text
                  style={[
                    styles.dismissButtonText,
                    isProfessional && styles.dismissButtonTextProfessional,
                  ]}
                >
                  {content.dismissButton}
                </Text>
              </Pressable>
            </Animated.View>

            {/* Note */}
            <Animated.View entering={FadeIn.delay(350).duration(200)}>
              <Text style={[styles.note, isProfessional && styles.noteProfessional]}>
                {content.note}
              </Text>
            </Animated.View>

            {/* Data Safety Indicator (for parents) */}
            {!isProfessional && (
              <Animated.View entering={FadeIn.delay(400).duration(200)} style={styles.safetyBadge}>
                <Shield size={12} color={Colors.secondary.grass} />
                <Text style={styles.safetyText}>Verileriniz güvende</Text>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Simple hook-based recovery prompt
export function useRecoveryPrompt() {
  const { showRecoveryDialog, crashRecovery, recover, dismiss } = useCrashRecovery();

  return {
    hasRecovery: showRecoveryDialog,
    lastScreen: crashRecovery?.lastSession?.lastScreen,
    pendingDrafts: crashRecovery?.pendingDrafts.length || 0,
    recover,
    dismiss,
  };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4'],
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 380,
  },
  dialog: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius['2xl'],
    padding: spacing['6'],
    alignItems: 'center',
    ...shadows.xl,
  },
  dialogProfessional: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: ProfessionalColors.border.light,
  },

  // Header Section
  headerSection: {
    marginBottom: spacing['4'],
    alignItems: 'center',
  },
  headerSectionProfessional: {
    marginBottom: spacing['3'],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.secondary.grassLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerProfessional: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: ProfessionalColors.trust.background,
  },

  // Text Section
  textSection: {
    alignItems: 'center',
    marginBottom: spacing['4'],
  },
  title: {
    fontSize: typography.size.xl,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['2'],
    lineHeight: 28,
  },
  titleProfessional: {
    fontSize: typography.size.lg,
    color: ProfessionalColors.text.primary,
  },
  description: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: 22,
  },
  descriptionProfessional: {
    fontSize: typography.size.sm,
    color: ProfessionalColors.text.secondary,
  },

  // Session Card
  sessionCard: {
    width: '100%',
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
    padding: spacing['3'],
    marginBottom: spacing['3'],
  },
  sessionCardProfessional: {
    backgroundColor: Colors.neutral.gray50,
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['2'],
    paddingBottom: spacing['2'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  sessionCardTitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.dark,
  },
  sessionCardTitleProfessional: {
    color: ProfessionalColors.text.primary,
  },
  sessionDetails: {
    gap: spacing['2'],
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  sessionLabel: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    width: 50,
  },
  sessionLabelProfessional: {
    color: ProfessionalColors.text.tertiary,
  },
  sessionValue: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    fontFamily: typography.family.medium,
    flex: 1,
  },
  sessionValueProfessional: {
    color: ProfessionalColors.text.secondary,
  },

  // Drafts Card
  draftsCard: {
    width: '100%',
    backgroundColor: Colors.semantic.warningLight,
    borderRadius: radius.lg,
    padding: spacing['3'],
    marginBottom: spacing['4'],
  },
  draftsCardProfessional: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  draftsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['2'],
  },
  draftsTitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
    color: Colors.semantic.warning,
  },
  draftsTitleProfessional: {
    color: '#D97706',
  },
  draftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['1'],
  },
  draftItemText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
  },
  draftItemTextProfessional: {
    color: ProfessionalColors.text.secondary,
  },
  moreDrafts: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    fontStyle: 'italic',
    marginTop: spacing['1'],
  },

  // Buttons
  buttons: {
    width: '100%',
    gap: spacing['3'],
  },
  recoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    backgroundColor: Colors.secondary.grass,
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['6'],
    borderRadius: radius.full,
    ...shadows.md,
  },
  recoverButtonProfessional: {
    backgroundColor: ProfessionalColors.trust.primary,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  recoverButtonText: {
    fontSize: typography.size.base,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
    flex: 1,
    textAlign: 'center',
  },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  dismissButtonProfessional: {
    borderRadius: radius.md,
    borderColor: ProfessionalColors.border.light,
  },
  dismissButtonText: {
    fontSize: typography.size.base,
    fontFamily: typography.family.medium,
    color: Colors.neutral.medium,
  },
  dismissButtonTextProfessional: {
    color: ProfessionalColors.text.secondary,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // Note
  note: {
    fontSize: typography.size.xs,
    color: Colors.neutral.light,
    textAlign: 'center',
    marginTop: spacing['4'],
    fontStyle: 'italic',
    paddingHorizontal: spacing['4'],
  },
  noteProfessional: {
    color: ProfessionalColors.text.tertiary,
    fontStyle: 'normal',
  },

  // Safety Badge
  safetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    marginTop: spacing['3'],
    paddingVertical: spacing['1'],
    paddingHorizontal: spacing['3'],
    backgroundColor: Colors.secondary.grassLight,
    borderRadius: radius.full,
  },
  safetyText: {
    fontSize: typography.size.xs,
    color: Colors.secondary.grass,
    fontFamily: typography.family.medium,
  },
});

export default CrashRecoveryDialog;
