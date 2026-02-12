/**
 * SyncStatusIndicator - Senkronizasyon Durum Göstergesi
 *
 * Phase 3: Offline-First Architecture
 * - Çevrimiçi/çevrimdışı durumu
 * - Bekleyen senkronizasyonlar
 * - Son senkronizasyon zamanı
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { shadows, zIndex } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

// ============================================
// TYPES
// ============================================

interface SyncStatusIndicatorProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime?: string | null;
  onSyncPress?: () => void;
  compact?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function SyncStatusIndicator({
  isOnline,
  isSyncing,
  pendingCount,
  lastSyncTime,
  onSyncPress,
  compact = false,
}: SyncStatusIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Pulse animation when syncing or pending
    if (isSyncing || pendingCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSyncing, pendingCount, fadeAnim, pulseAnim]);

  const formatLastSync = (time: string | null | undefined): string => {
    if (!time) return 'Henüz senkronize edilmedi';

    const date = new Date(time);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} saat önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const getStatusColor = (): string => {
    if (!isOnline) return '#EF4444'; // Red - Offline
    if (isSyncing) return Colors.semantic.amber; // Yellow - Syncing
    if (pendingCount > 0) return '#3B82F6'; // Blue - Pending
    return '#22C55E'; // Green - Synced
  };

  const getStatusIcon = (): string => {
    if (!isOnline) return '📵';
    if (isSyncing) return '🔄';
    if (pendingCount > 0) return '☁️';
    return '✅';
  };

  const getStatusText = (): string => {
    if (!isOnline) return 'Çevrimdışı';
    if (isSyncing) return 'Senkronize ediliyor...';
    if (pendingCount > 0) return `${pendingCount} bekliyor`;
    return 'Senkronize';
  };

  if (compact) {
    return (
      <Animated.View style={[styles.compactContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[styles.compactButton, { backgroundColor: getStatusColor() + '20' }]}
          onPress={onSyncPress}
          disabled={!isOnline || isSyncing}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            {isSyncing ? (
              <ActivityIndicator size="small" color={getStatusColor()} />
            ) : (
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            )}
          </Animated.View>
          {pendingCount > 0 && !isSyncing && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity
        style={styles.mainButton}
        onPress={onSyncPress}
        disabled={!isOnline || isSyncing}
        activeOpacity={0.8}
      >
        {/* Status Icon */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          {isSyncing ? (
            <ActivityIndicator size="small" color={getStatusColor()} />
          ) : (
            <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          )}
        </Animated.View>

        {/* Status Info */}
        <View style={styles.statusInfo}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
          <Text style={styles.lastSyncText}>{formatLastSync(lastSyncTime)}</Text>
        </View>

        {/* Sync Button */}
        {isOnline && !isSyncing && pendingCount > 0 && (
          <View style={[styles.syncButton, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.syncButtonText}>Senkronize Et</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Offline Banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            📵 İnternet bağlantısı yok. Değişiklikler yerel olarak kaydedildi.
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

// ============================================
// OFFLINE BANNER (Standalone)
// ============================================

interface OfflineBannerProps {
  isOnline: boolean;
}

export function OfflineBanner({ isOnline }: OfflineBannerProps) {
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isOnline ? -50 : 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isOnline, translateY]);

  return (
    <Animated.View style={[styles.offlineBannerStandalone, { transform: [{ translateY }] }]}>
      <View style={styles.offlineBannerContent}>
        <Text style={styles.offlineBannerIcon}>📵</Text>
        <Text style={styles.offlineBannerStandaloneText}>
          Çevrimdışı mod - Değişiklikler kaydedildi
        </Text>
      </View>
    </Animated.View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Full Component
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    ...shadows.sm,
    overflow: 'hidden',
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  statusIcon: {
    fontSize: 24,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lastSyncText: {
    fontSize: 12,
    color: Colors.neutral.medium,
    marginTop: 2,
  },
  syncButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  syncButtonText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: '600',
  },
  offlineBanner: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  offlineBannerText: {
    color: '#DC2626',
    fontSize: 12,
    textAlign: 'center',
  },

  // Compact Component
  compactContainer: {},
  compactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pendingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral.white,
  },
  pendingBadgeText: {
    color: Colors.neutral.white,
    fontSize: 10,
    fontWeight: '700',
  },

  // Standalone Banner
  offlineBannerStandalone: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: zIndex.overlay,
  },
  offlineBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  offlineBannerIcon: {
    fontSize: 16,
  },
  offlineBannerStandaloneText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
  },
});
