/**
 * CrashRecoveryDialog Component
 * Phase 6: Integration
 *
 * Shows a dialog after app crash to offer session recovery options
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { RotateCcw, Trash2, FileText, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { useCrashRecovery, SessionState } from '@/lib/persistence';
import { useHapticFeedback } from '@/lib/haptics';
import { Ioo } from '@/components/Ioo';

interface CrashRecoveryDialogProps {
  /** Callback when user chooses to recover */
  onRecover?: (session: SessionState) => void;
  /** Callback when user dismisses */
  onDismiss?: () => void;
  /** Show drafts count */
  showDrafts?: boolean;
}

export function CrashRecoveryDialog({
  onRecover,
  onDismiss,
  showDrafts = true,
}: CrashRecoveryDialogProps) {
  const { showRecoveryDialog, crashRecovery, recover, dismiss } = useCrashRecovery(onRecover);
  const { tapMedium, success, warning } = useHapticFeedback();

  // Animation
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (showRecoveryDialog) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
      warning(); // Alert user
    }
  }, [showRecoveryDialog, scale, opacity, warning]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleRecover = () => {
    tapMedium();
    success();
    recover();
  };

  const handleDismiss = () => {
    tapMedium();
    dismiss();
    onDismiss?.();
  };

  if (!showRecoveryDialog || !crashRecovery) {
    return null;
  }

  const lastSession = crashRecovery.lastSession;
  const pendingDraftsCount = crashRecovery.pendingDrafts.length;

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <Modal
      visible={showRecoveryDialog}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {Platform.OS !== 'web' && (
          <BlurView
            intensity={20}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        )}

        <Animated.View style={[styles.dialogContainer, containerStyle]}>
          <View style={styles.dialog}>
            {/* Ioo Mascot */}
            <View style={styles.mascotContainer}>
              <Ioo mood="concerned" size="md" animated />
            </View>

            {/* Title */}
            <Text style={styles.title}>Oturumunuz Kurtarılabilir</Text>

            {/* Description */}
            <Text style={styles.description}>
              Uygulama beklenmedik şekilde kapanmış. Son oturumunuza geri dönmek ister misiniz?
            </Text>

            {/* Session Info */}
            {lastSession && (
              <View style={styles.sessionInfo}>
                {lastSession.lastScreen && (
                  <View style={styles.infoRow}>
                    <FileText size={16} color={Colors.neutral.medium} />
                    <Text style={styles.infoText}>
                      Son sayfa: {lastSession.lastScreen}
                    </Text>
                  </View>
                )}
                {lastSession.timestamp && (
                  <View style={styles.infoRow}>
                    <Clock size={16} color={Colors.neutral.medium} />
                    <Text style={styles.infoText}>
                      {formatTime(lastSession.timestamp)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Pending Drafts */}
            {showDrafts && pendingDraftsCount > 0 && (
              <View style={styles.draftsInfo}>
                <Text style={styles.draftsText}>
                  {pendingDraftsCount} adet kaydedilmemiş taslak bulundu
                </Text>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttons}>
              <Pressable
                onPress={handleRecover}
                style={({ pressed }) => [
                  styles.recoverButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <RotateCcw size={20} color={Colors.neutral.white} />
                <Text style={styles.recoverButtonText}>Oturumu Kurtar</Text>
              </Pressable>

              <Pressable
                onPress={handleDismiss}
                style={({ pressed }) => [
                  styles.dismissButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Trash2 size={18} color={Colors.neutral.medium} />
                <Text style={styles.dismissButtonText}>Yeni Başla</Text>
              </Pressable>
            </View>

            {/* Note */}
            <Text style={styles.note}>
              "Yeni Başla" seçerseniz kaydedilmemiş veriler kaybolabilir.
            </Text>
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
    padding: spacing['6'],
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 360,
  },
  dialog: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius['2xl'],
    padding: spacing['6'],
    alignItems: 'center',
    ...shadows.xl,
  },

  // Mascot
  mascotContainer: {
    marginBottom: spacing['4'],
  },

  // Title
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['2'],
  },

  // Description
  description: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing['4'],
  },

  // Session info
  sessionInfo: {
    width: '100%',
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
    padding: spacing['3'],
    gap: spacing['2'],
    marginBottom: spacing['3'],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  infoText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
  },

  // Drafts info
  draftsInfo: {
    width: '100%',
    backgroundColor: Colors.semantic.warningLight,
    borderRadius: radius.lg,
    padding: spacing['3'],
    marginBottom: spacing['4'],
  },
  draftsText: {
    fontSize: typography.size.sm,
    color: Colors.semantic.warning,
    textAlign: 'center',
    fontWeight: typography.weight.medium,
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
  recoverButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
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
  dismissButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.medium,
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
  },
});

export default CrashRecoveryDialog;
