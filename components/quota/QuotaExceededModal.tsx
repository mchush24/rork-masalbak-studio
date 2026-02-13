import React from 'react';
import { StyleSheet, Text, View, Pressable, Modal } from 'react-native';
import { AlertTriangle, Crown, ChevronRight, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows, layout } from '@/constants/design-system';
import { useQuota } from '@/hooks/useQuota';

interface QuotaExceededModalProps {
  visible: boolean;
  onClose: () => void;
}

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  premium: 'Premium',
};

export function QuotaExceededModal({ visible, onClose }: QuotaExceededModalProps) {
  const { tokensUsed, tokenLimit, tier, daysUntilReset } = useQuota();

  const tierLabel = TIER_LABELS[tier] || 'Free';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={e => e.stopPropagation()}>
          {/* Close button */}
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.neutral.dark} />
          </Pressable>

          {/* Icon */}
          <View style={styles.iconCircle}>
            <AlertTriangle size={32} color={Colors.semantic.error} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Aylık jeton kotanız doldu</Text>

          {/* Info */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Plan</Text>
              <Text style={styles.infoValue}>{tierLabel}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kullanım</Text>
              <Text style={styles.infoValue}>
                {tokensUsed}/{tokenLimit ?? '∞'} jeton
              </Text>
            </View>
            {daysUntilReset != null && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Yenilenme</Text>
                  <Text style={styles.infoValue}>{daysUntilReset} gün sonra</Text>
                </View>
              </>
            )}
          </View>

          {/* Upgrade CTA */}
          {tier === 'free' && (
            <Pressable style={({ pressed }) => [styles.upgradeButton, pressed && { opacity: 0.8 }]}>
              <Crown size={18} color={Colors.neutral.white} />
              <Text style={styles.upgradeText}>Pro&apos;ya Yükselt</Text>
              <ChevronRight size={16} color={Colors.neutral.white} />
            </Pressable>
          )}

          {/* Close CTA */}
          <Pressable
            style={({ pressed }) => [styles.closeAction, pressed && { opacity: 0.7 }]}
            onPress={onClose}
          >
            <Text style={styles.closeActionText}>Tamam</Text>
          </Pressable>
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
    padding: layout.screenPadding,
  },
  content: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    width: '100%',
    maxWidth: 380,
    padding: spacing['6'],
    alignItems: 'center',
    ...shadows.xl,
  },
  closeButton: {
    position: 'absolute',
    top: spacing['3'],
    right: spacing['3'],
    padding: spacing['2'],
    zIndex: 1,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 138, 128, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['4'],
  },
  title: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['4'],
  },
  infoBox: {
    width: '100%',
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['5'],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing['1'],
  },
  infoLabel: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontFamily: typography.family.medium,
  },
  infoValue: {
    fontSize: typography.size.sm,
    color: Colors.neutral.darkest,
    fontFamily: typography.family.semibold,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.neutral.lighter,
    marginVertical: spacing['2'],
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary.lavender,
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['6'],
    borderRadius: radius.lg,
    gap: spacing['2'],
    width: '100%',
    marginBottom: spacing['3'],
    ...shadows.md,
  },
  upgradeText: {
    fontSize: typography.size.base,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  closeAction: {
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['4'],
  },
  closeActionText: {
    fontSize: typography.size.base,
    fontFamily: typography.family.medium,
    color: Colors.neutral.medium,
  },
});
