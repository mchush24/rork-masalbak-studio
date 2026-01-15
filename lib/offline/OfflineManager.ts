/**
 * OfflineManager - Çevrimdışı Veri Yönetimi
 *
 * Phase 3: Offline-First Architecture
 * - Yerel depolama yönetimi
 * - Senkronizasyon kuyruğu
 * - Çakışma çözümü
 * - Ağ durumu izleme
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

// Stub NetInfo types until @react-native-community/netinfo is installed
interface NetInfoState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}

// Simple network status check using fetch (fallback when netinfo not available)
const checkNetworkStatus = async (): Promise<NetInfoState> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return { isConnected: true, isInternetReachable: true };
  } catch {
    return { isConnected: false, isInternetReachable: false };
  }
};

// ============================================
// TYPES
// ============================================

export interface OfflineArtwork {
  id: string;
  localId: string;
  serverId?: string;
  imageUri: string;
  thumbnailUri?: string;
  title: string;
  childId: string;
  childName: string;
  createdAt: string;
  updatedAt: string;
  colorsUsed: string[];
  timeSpent: number;
  syncStatus: SyncStatus;
  syncError?: string;
  version: number;
}

export interface OfflineColoring {
  id: string;
  localId: string;
  serverId?: string;
  templateId: string;
  imageUri: string;
  progress: number; // 0-100
  lastModified: string;
  syncStatus: SyncStatus;
  strokes: StrokeData[];
  version: number;
}

export interface StrokeData {
  id: string;
  color: string;
  brushType: string;
  points: { x: number; y: number }[];
  timestamp: number;
}

export type SyncStatus =
  | 'pending'      // Henüz senkronize edilmedi
  | 'syncing'      // Senkronizasyon devam ediyor
  | 'synced'       // Başarıyla senkronize edildi
  | 'error'        // Senkronizasyon hatası
  | 'conflict';    // Çakışma var

export interface SyncQueueItem {
  id: string;
  type: 'artwork' | 'coloring' | 'stats' | 'badge';
  action: 'create' | 'update' | 'delete';
  data: unknown;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

export interface OfflineStats {
  pendingUploads: number;
  totalLocalArtworks: number;
  totalLocalColorings: number;
  lastSyncTime?: string;
  storageUsed: number; // bytes
}

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  ARTWORKS: '@offline_artworks',
  COLORINGS: '@offline_colorings',
  SYNC_QUEUE: '@sync_queue',
  LAST_SYNC: '@last_sync_time',
  USER_STATS: '@offline_user_stats',
  SETTINGS: '@offline_settings',
};

// Get document directory - handle both old and new expo-file-system API
const getDocumentDirectory = (): string => {
  // @ts-expect-error - expo-file-system API varies by version
  const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || '';
  return docDir;
};

const ARTWORK_DIR = `${getDocumentDirectory()}artworks/`;
const COLORING_DIR = `${getDocumentDirectory()}colorings/`;

// ============================================
// OFFLINE MANAGER
// ============================================

class OfflineManagerClass {
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  /**
   * Initialize the offline manager
   */
  async initialize(): Promise<void> {
    // Ensure directories exist
    await this.ensureDirectories();

    // Start polling for network status (since NetInfo not available)
    this.startNetworkPolling();

    // Get initial network state
    const state = await checkNetworkStatus();
    this.isOnline = state.isConnected ?? false;

    console.log('[OfflineManager] Initialized, online:', this.isOnline);
  }

  /**
   * Poll for network status changes
   */
  private networkPollInterval: ReturnType<typeof setInterval> | null = null;

  private startNetworkPolling(): void {
    // Poll every 30 seconds
    this.networkPollInterval = setInterval(async () => {
      const state = await checkNetworkStatus();
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (wasOnline !== this.isOnline) {
        this.handleNetworkChange(state);
      }
    }, 30000);
  }

  /**
   * Stop network polling
   */
  stopNetworkPolling(): void {
    if (this.networkPollInterval) {
      clearInterval(this.networkPollInterval);
      this.networkPollInterval = null;
    }
  }

  /**
   * Ensure storage directories exist
   */
  private async ensureDirectories(): Promise<void> {
    const dirs = [ARTWORK_DIR, COLORING_DIR];

    for (const dir of dirs) {
      const info = await FileSystem.getInfoAsync(dir);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
    }
  }

  /**
   * Handle network state changes
   */
  private handleNetworkChange = (state: NetInfoState) => {
    const wasOnline = this.isOnline;
    this.isOnline = state.isConnected ?? false;

    // Notify listeners
    this.listeners.forEach(listener => listener(this.isOnline));

    // If we just came online, trigger sync
    if (!wasOnline && this.isOnline) {
      console.log('[OfflineManager] Back online, triggering sync...');
      this.syncAll();
    }
  };

  /**
   * Subscribe to online/offline status changes
   */
  onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Get current online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // ==========================================
  // ARTWORK MANAGEMENT
  // ==========================================

  /**
   * Save artwork locally
   */
  async saveArtwork(artwork: Omit<OfflineArtwork, 'localId' | 'syncStatus' | 'version'>): Promise<OfflineArtwork> {
    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Copy image to local storage
    const localImageUri = `${ARTWORK_DIR}${localId}.png`;
    await FileSystem.copyAsync({
      from: artwork.imageUri,
      to: localImageUri,
    });

    // Create local artwork record
    const offlineArtwork: OfflineArtwork = {
      ...artwork,
      id: artwork.id || localId,
      localId,
      imageUri: localImageUri,
      syncStatus: 'pending',
      version: 1,
    };

    // Save to storage
    const artworks = await this.getArtworks();
    artworks.push(offlineArtwork);
    await AsyncStorage.setItem(STORAGE_KEYS.ARTWORKS, JSON.stringify(artworks));

    // Add to sync queue
    await this.addToSyncQueue({
      id: localId,
      type: 'artwork',
      action: 'create',
      data: offlineArtwork,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });

    // Trigger sync if online
    if (this.isOnline) {
      this.syncAll();
    }

    return offlineArtwork;
  }

  /**
   * Get all local artworks
   */
  async getArtworks(): Promise<OfflineArtwork[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ARTWORKS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[OfflineManager] Error getting artworks:', error);
      return [];
    }
  }

  /**
   * Get artwork by ID
   */
  async getArtwork(id: string): Promise<OfflineArtwork | null> {
    const artworks = await this.getArtworks();
    return artworks.find(a => a.id === id || a.localId === id) || null;
  }

  /**
   * Update artwork
   */
  async updateArtwork(id: string, updates: Partial<OfflineArtwork>): Promise<OfflineArtwork | null> {
    const artworks = await this.getArtworks();
    const index = artworks.findIndex(a => a.id === id || a.localId === id);

    if (index === -1) return null;

    const updated: OfflineArtwork = {
      ...artworks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      version: artworks[index].version + 1,
      syncStatus: 'pending',
    };

    artworks[index] = updated;
    await AsyncStorage.setItem(STORAGE_KEYS.ARTWORKS, JSON.stringify(artworks));

    // Add to sync queue
    await this.addToSyncQueue({
      id: updated.localId,
      type: 'artwork',
      action: 'update',
      data: updated,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });

    return updated;
  }

  /**
   * Delete artwork
   */
  async deleteArtwork(id: string): Promise<boolean> {
    const artworks = await this.getArtworks();
    const artwork = artworks.find(a => a.id === id || a.localId === id);

    if (!artwork) return false;

    // Delete local file
    try {
      await FileSystem.deleteAsync(artwork.imageUri, { idempotent: true });
      if (artwork.thumbnailUri) {
        await FileSystem.deleteAsync(artwork.thumbnailUri, { idempotent: true });
      }
    } catch (error) {
      console.error('[OfflineManager] Error deleting artwork files:', error);
    }

    // Remove from storage
    const filtered = artworks.filter(a => a.id !== id && a.localId !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.ARTWORKS, JSON.stringify(filtered));

    // Add to sync queue if it was synced
    if (artwork.serverId) {
      await this.addToSyncQueue({
        id: artwork.localId,
        type: 'artwork',
        action: 'delete',
        data: { serverId: artwork.serverId },
        createdAt: new Date().toISOString(),
        retryCount: 0,
      });
    }

    return true;
  }

  // ==========================================
  // COLORING MANAGEMENT
  // ==========================================

  /**
   * Save coloring progress locally
   */
  async saveColoring(coloring: Omit<OfflineColoring, 'localId' | 'syncStatus' | 'version'>): Promise<OfflineColoring> {
    const localId = `coloring_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Copy image to local storage
    const localImageUri = `${COLORING_DIR}${localId}.png`;
    await FileSystem.copyAsync({
      from: coloring.imageUri,
      to: localImageUri,
    });

    const offlineColoring: OfflineColoring = {
      ...coloring,
      id: coloring.id || localId,
      localId,
      imageUri: localImageUri,
      syncStatus: 'pending',
      version: 1,
    };

    const colorings = await this.getColorings();
    colorings.push(offlineColoring);
    await AsyncStorage.setItem(STORAGE_KEYS.COLORINGS, JSON.stringify(colorings));

    return offlineColoring;
  }

  /**
   * Get all local colorings
   */
  async getColorings(): Promise<OfflineColoring[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COLORINGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[OfflineManager] Error getting colorings:', error);
      return [];
    }
  }

  /**
   * Update coloring progress
   */
  async updateColoring(id: string, updates: Partial<OfflineColoring>): Promise<OfflineColoring | null> {
    const colorings = await this.getColorings();
    const index = colorings.findIndex(c => c.id === id || c.localId === id);

    if (index === -1) return null;

    const updated: OfflineColoring = {
      ...colorings[index],
      ...updates,
      lastModified: new Date().toISOString(),
      version: colorings[index].version + 1,
      syncStatus: 'pending',
    };

    colorings[index] = updated;
    await AsyncStorage.setItem(STORAGE_KEYS.COLORINGS, JSON.stringify(colorings));

    return updated;
  }

  // ==========================================
  // SYNC QUEUE MANAGEMENT
  // ==========================================

  /**
   * Add item to sync queue
   */
  private async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    const queue = await this.getSyncQueue();

    // Remove existing item with same ID and type (replace)
    const filtered = queue.filter(
      q => !(q.id === item.id && q.type === item.type && q.action === item.action)
    );

    filtered.push(item);
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(filtered));
  }

  /**
   * Get sync queue
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[OfflineManager] Error getting sync queue:', error);
      return [];
    }
  }

  /**
   * Remove item from sync queue
   */
  private async removeFromSyncQueue(id: string, type: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const filtered = queue.filter(q => !(q.id === id && q.type === type));
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(filtered));
  }

  // ==========================================
  // SYNC OPERATIONS
  // ==========================================

  /**
   * Sync all pending items
   */
  async syncAll(): Promise<{ success: number; failed: number }> {
    if (this.syncInProgress || !this.isOnline) {
      return { success: 0, failed: 0 };
    }

    this.syncInProgress = true;
    let success = 0;
    let failed = 0;

    try {
      const queue = await this.getSyncQueue();

      for (const item of queue) {
        try {
          await this.syncItem(item);
          await this.removeFromSyncQueue(item.id, item.type);
          success++;
        } catch (error) {
          console.error('[OfflineManager] Sync error for item:', item.id, error);

          // Update retry count
          item.retryCount++;
          item.lastError = error instanceof Error ? error.message : 'Unknown error';

          if (item.retryCount >= 3) {
            // Mark as error after 3 retries
            await this.updateItemSyncStatus(item.id, item.type, 'error', item.lastError);
          }

          failed++;
        }
      }

      // Update last sync time
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } finally {
      this.syncInProgress = false;
    }

    console.log(`[OfflineManager] Sync complete: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Sync a single item
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    // This would call the actual API endpoints
    // For now, we'll simulate the sync
    console.log(`[OfflineManager] Syncing ${item.type} ${item.action}:`, item.id);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update sync status
    await this.updateItemSyncStatus(item.id, item.type, 'synced');
  }

  /**
   * Update item sync status
   */
  private async updateItemSyncStatus(
    id: string,
    type: string,
    status: SyncStatus,
    error?: string
  ): Promise<void> {
    if (type === 'artwork') {
      await this.updateArtwork(id, { syncStatus: status, syncError: error });
    } else if (type === 'coloring') {
      await this.updateColoring(id, { syncStatus: status });
    }
  }

  // ==========================================
  // STATISTICS
  // ==========================================

  /**
   * Get offline statistics
   */
  async getStats(): Promise<OfflineStats> {
    const artworks = await this.getArtworks();
    const colorings = await this.getColorings();
    const queue = await this.getSyncQueue();
    const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);

    // Calculate storage used
    let storageUsed = 0;
    for (const artwork of artworks) {
      try {
        const info = await FileSystem.getInfoAsync(artwork.imageUri);
        if (info.exists && 'size' in info) {
          storageUsed += info.size || 0;
        }
      } catch {}
    }

    return {
      pendingUploads: queue.length,
      totalLocalArtworks: artworks.length,
      totalLocalColorings: colorings.length,
      lastSyncTime: lastSync || undefined,
      storageUsed,
    };
  }

  /**
   * Clear all local data
   */
  async clearAll(): Promise<void> {
    // Clear AsyncStorage
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ARTWORKS,
      STORAGE_KEYS.COLORINGS,
      STORAGE_KEYS.SYNC_QUEUE,
      STORAGE_KEYS.LAST_SYNC,
    ]);

    // Clear file directories
    await FileSystem.deleteAsync(ARTWORK_DIR, { idempotent: true });
    await FileSystem.deleteAsync(COLORING_DIR, { idempotent: true });

    // Recreate directories
    await this.ensureDirectories();

    console.log('[OfflineManager] All local data cleared');
  }
}

// Export singleton instance
export const OfflineManager = new OfflineManagerClass();
export default OfflineManager;
