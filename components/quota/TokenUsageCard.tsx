import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Crown, ChevronRight, Zap } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { useQuota } from '@/hooks/useQuota';

const TIER_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  free: { label: 'Free', color: '#8B5A00', bgColor: Colors.secondary.sunshineLight },
  pro: { label: 'Pro', color: Colors.secondary.lavender, bgColor: 'rgba(167, 139, 250, 0.15)' },
  premium: { label: 'Premium', color: Colors.primary.sunset, bgColor: 'rgba(255, 155, 122, 0.15)' },
};

function getProgressColor(ratio: number): string {
  if (ratio < 0.6) return Colors.semantic.success;
  if (ratio < 0.8) return Colors.semantic.warning;
  return Colors.semantic.error;
}

export function TokenUsageCard() {
  const { tokensUsed, tokenLimit, tokensRemaining, tier, daysUntilReset, isLoaded, isLoading } =
    useQuota();

  if (isLoading || !isLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: 'rgba(167, 139, 250, 0.15)' }]}>
            <Crown size={18} color={Colors.secondary.lavender} />
          </View>
          <Text style={styles.label}>Abonelik</Text>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  const isUnlimited = tokenLimit == null;
  const usageRatio = isUnlimited ? 0 : tokensUsed / tokenLimit;
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.free;
  const progressColor = getProgressColor(usageRatio);

  return (
    <View style={styles.container}>
      {/* Top row: icon + label + tier badge */}
      <View style={styles.row}>
        <View style={[styles.iconBox, { backgroundColor: 'rgba(167, 139, 250, 0.15)' }]}>
          <Crown size={18} color={Colors.secondary.lavender} />
        </View>
        <Text style={styles.label}>Abonelik</Text>
        <View style={[styles.tierBadge, { backgroundColor: tierConfig.bgColor }]}>
          <Text style={[styles.tierText, { color: tierConfig.color }]}>{tierConfig.label}</Text>
        </View>
      </View>

      {/* Token usage section */}
      <View style={styles.usageSection}>
        {/* Progress bar */}
        {!isUnlimited && (
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(usageRatio * 100, 100)}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
        )}

        {/* Usage text */}
        <View style={styles.usageRow}>
          <View style={styles.usageLeft}>
            <Zap size={14} color={progressColor} />
            <Text style={styles.usageText}>
              {isUnlimited ? `${tokensUsed} jeton kullanıldı` : `${tokensUsed}/${tokenLimit} jeton`}
            </Text>
          </View>
          {daysUntilReset != null && (
            <Text style={styles.resetText}>{daysUntilReset} gün sonra yenilenir</Text>
          )}
        </View>

        {/* Low quota warning */}
        {!isUnlimited && tokensRemaining != null && tokensRemaining <= 0 && (
          <Text style={styles.exceededText}>Aylık kotanız doldu</Text>
        )}

        {/* Upgrade button for free tier */}
        {tier === 'free' && (
          <Pressable style={({ pressed }) => [styles.upgradeButton, pressed && { opacity: 0.8 }]}>
            <Text style={styles.upgradeText}>Pro&apos;ya Yükselt</Text>
            <ChevronRight size={14} color={Colors.secondary.lavender} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing['4'],
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing['3'],
  },
  label: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.darkest,
  },
  loadingText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },
  tierBadge: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: radius.lg,
  },
  tierText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: 0.5,
  },
  usageSection: {
    marginTop: spacing['3'],
    marginLeft: 34 + 12, // iconBox width + marginRight
    gap: spacing['2'],
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.neutral.lighter,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
  },
  usageText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.dark,
  },
  resetText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
  },
  exceededText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: Colors.semantic.error,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    gap: spacing['1'],
    marginTop: spacing['1'],
  },
  upgradeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.secondary.lavender,
  },
});
