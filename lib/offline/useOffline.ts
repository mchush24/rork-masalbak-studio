/**
 * useOffline - Offline Durumu Hook'u
 *
 * Phase 3: Offline-First Architecture
 * - Ağ durumu izleme
 * - Senkronizasyon durumu
 * - Çevrimdışı veri erişimi
 */

import { useState, useEffect, useCallback } from 'react';
import { OfflineManager, OfflineStats, OfflineArtwork, OfflineColoring } from './OfflineManager';

// ============================================
// TYPES
// ============================================

interface UseOfflineReturn {
  // Network status
  isOnline: boolean;

  // Sync status
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: string | null;

  // Stats
  stats: OfflineStats | null;

  // Artworks
  localArtworks: OfflineArtwork[];
  saveArtwork: (
    artwork: Omit<OfflineArtwork, 'localId' | 'syncStatus' | 'version'>
  ) => Promise<OfflineArtwork>;
  deleteArtwork: (id: string) => Promise<boolean>;

  // Colorings
  localColorings: OfflineColoring[];
  saveColoring: (
    coloring: Omit<OfflineColoring, 'localId' | 'syncStatus' | 'version'>
  ) => Promise<OfflineColoring>;
  updateColoring: (
    id: string,
    updates: Partial<OfflineColoring>
  ) => Promise<OfflineColoring | null>;

  // Actions
  syncNow: () => Promise<{ success: number; failed: number }>;
  refreshStats: () => Promise<void>;
  clearLocalData: () => Promise<void>;
}

// ============================================
// HOOK
// ============================================

export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [stats, setStats] = useState<OfflineStats | null>(null);
  const [localArtworks, setLocalArtworks] = useState<OfflineArtwork[]>([]);
  const [localColorings, setLocalColorings] = useState<OfflineColoring[]>([]);

  // Initialize and subscribe to network changes
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      await OfflineManager.initialize();
      // Check if still mounted before setting state
      if (!isMounted) return;
      setIsOnline(OfflineManager.getOnlineStatus());

      // Inline the refresh to check mounted status
      try {
        const [artworks, colorings, queue, offlineStats] = await Promise.all([
          OfflineManager.getArtworks(),
          OfflineManager.getColorings(),
          OfflineManager.getSyncQueue(),
          OfflineManager.getStats(),
        ]);

        if (!isMounted) return;
        setLocalArtworks(artworks);
        setLocalColorings(colorings);
        setPendingCount(queue.length);
        setStats(offlineStats);
        setLastSyncTime(offlineStats.lastSyncTime || null);
      } catch (error) {
        console.warn('[useOffline] Initialization error:', error);
      }
    };

    const unsubscribe = OfflineManager.onNetworkChange(online => {
      if (isMounted) setIsOnline(online);
    });

    initialize();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    const [artworks, colorings, queue, offlineStats] = await Promise.all([
      OfflineManager.getArtworks(),
      OfflineManager.getColorings(),
      OfflineManager.getSyncQueue(),
      OfflineManager.getStats(),
    ]);

    setLocalArtworks(artworks);
    setLocalColorings(colorings);
    setPendingCount(queue.length);
    setStats(offlineStats);
    setLastSyncTime(offlineStats.lastSyncTime || null);
  }, []);

  // Refresh stats only
  const refreshStats = useCallback(async () => {
    const offlineStats = await OfflineManager.getStats();
    setStats(offlineStats);
    setPendingCount(offlineStats.pendingUploads);
    setLastSyncTime(offlineStats.lastSyncTime || null);
  }, []);

  // Save artwork
  const saveArtwork = useCallback(
    async (
      artwork: Omit<OfflineArtwork, 'localId' | 'syncStatus' | 'version'>
    ): Promise<OfflineArtwork> => {
      const saved = await OfflineManager.saveArtwork(artwork);
      await refreshData();
      return saved;
    },
    [refreshData]
  );

  // Delete artwork
  const deleteArtwork = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await OfflineManager.deleteArtwork(id);
      await refreshData();
      return result;
    },
    [refreshData]
  );

  // Save coloring
  const saveColoring = useCallback(
    async (
      coloring: Omit<OfflineColoring, 'localId' | 'syncStatus' | 'version'>
    ): Promise<OfflineColoring> => {
      const saved = await OfflineManager.saveColoring(coloring);
      await refreshData();
      return saved;
    },
    [refreshData]
  );

  // Update coloring
  const updateColoring = useCallback(
    async (id: string, updates: Partial<OfflineColoring>): Promise<OfflineColoring | null> => {
      const updated = await OfflineManager.updateColoring(id, updates);
      await refreshData();
      return updated;
    },
    [refreshData]
  );

  // Sync now
  const syncNow = useCallback(async (): Promise<{ success: number; failed: number }> => {
    if (!isOnline) {
      return { success: 0, failed: 0 };
    }

    setIsSyncing(true);
    try {
      const result = await OfflineManager.syncAll();
      await refreshData();
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, refreshData]);

  // Clear local data
  const clearLocalData = useCallback(async () => {
    await OfflineManager.clearAll();
    await refreshData();
  }, [refreshData]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTime,
    stats,
    localArtworks,
    saveArtwork,
    deleteArtwork,
    localColorings,
    saveColoring,
    updateColoring,
    syncNow,
    refreshStats,
    clearLocalData,
  };
}

export default useOffline;
