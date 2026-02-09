/**
 * Network Status Monitor
 * Phase 5: Error Handling Enhancement
 *
 * Provides:
 * - Real-time connectivity monitoring
 * - Offline mode detection
 * - Auto-retry on reconnection
 * - Network quality estimation
 * - Pending request queue
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import { analytics } from '@/lib/analytics';

// Network quality levels
export type NetworkQuality = 'offline' | 'poor' | 'moderate' | 'good' | 'excellent';

// Network status
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoStateType;
  quality: NetworkQuality;
  details: NetInfoState['details'];
}

// Pending request
interface PendingRequest {
  id: string;
  fn: () => Promise<void>;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
}

// Network quality thresholds (based on RTT)
const _QUALITY_THRESHOLDS = {
  excellent: 100, // < 100ms
  good: 300, // < 300ms
  moderate: 1000, // < 1000ms
  poor: Infinity, // >= 1000ms
};

// Estimate network quality
function estimateQuality(state: NetInfoState): NetworkQuality {
  // Note: isInternetReachable can be null (unknown) on web and during init.
  // Only treat as offline when explicitly false or not connected.
  if (!state.isConnected || state.isInternetReachable === false) {
    return 'offline';
  }

  // Check connection type
  switch (state.type) {
    case 'wifi':
      return 'excellent';
    case 'cellular':
      // Check cellular generation
      if (state.details && 'cellularGeneration' in state.details) {
        const gen = state.details.cellularGeneration;
        if (gen === '5g') return 'excellent';
        if (gen === '4g') return 'good';
        if (gen === '3g') return 'moderate';
        return 'poor';
      }
      return 'moderate';
    case 'ethernet':
      return 'excellent';
    case 'bluetooth':
      return 'poor';
    default:
      return 'moderate';
  }
}

// Network monitor class
class NetworkMonitorClass {
  private static instance: NetworkMonitorClass;
  private currentStatus: NetworkStatus | null = null;
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private unsubscribeNetInfo: (() => void) | null = null;
  private isInitialized = false;
  private lastOnlineTimestamp: number = Date.now();
  private wasOffline = false;

  static getInstance(): NetworkMonitorClass {
    if (!NetworkMonitorClass.instance) {
      NetworkMonitorClass.instance = new NetworkMonitorClass();
    }
    return NetworkMonitorClass.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Get initial state
    const initialState = await NetInfo.fetch();
    this.updateStatus(initialState);

    // Subscribe to changes
    this.unsubscribeNetInfo = NetInfo.addEventListener(state => {
      this.updateStatus(state);
    });

    // Listen to app state changes
    AppState.addEventListener('change', this.handleAppStateChange);

    this.isInitialized = true;
  }

  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // Refresh network status when app becomes active
      const state = await NetInfo.fetch();
      this.updateStatus(state);
    }
  };

  private updateStatus(state: NetInfoState): void {
    const previousStatus = this.currentStatus;
    const quality = estimateQuality(state);

    this.currentStatus = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      quality,
      details: state.details,
    };

    // Track offline/online transitions
    const isNowOnline =
      this.currentStatus.isConnected && this.currentStatus.isInternetReachable !== false;
    const wasOnline = previousStatus?.isConnected && previousStatus?.isInternetReachable !== false;

    if (!isNowOnline && wasOnline) {
      // Went offline
      this.wasOffline = true;
      analytics.trackEvent('network_offline', 'performance');
    } else if (isNowOnline && this.wasOffline) {
      // Came back online
      const offlineDuration = Date.now() - this.lastOnlineTimestamp;
      analytics.trackEvent('network_online', 'performance', {
        offlineDuration,
      });
      this.wasOffline = false;

      // Process pending requests
      this.processPendingRequests();
    }

    if (isNowOnline) {
      this.lastOnlineTimestamp = Date.now();
    }

    // Notify listeners
    this.notifyListeners();
  }

  private notifyListeners(): void {
    if (!this.currentStatus) return;
    this.listeners.forEach(listener => listener(this.currentStatus!));
  }

  // Subscribe to network changes
  subscribe(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);

    // Immediately call with current status
    if (this.currentStatus) {
      listener(this.currentStatus);
    }

    return () => this.listeners.delete(listener);
  }

  // Get current status
  getStatus(): NetworkStatus | null {
    return this.currentStatus;
  }

  // Check if online
  isOnline(): boolean {
    return (
      this.currentStatus?.isConnected === true && this.currentStatus?.isInternetReachable !== false
    );
  }

  // Check connectivity with timeout
  async checkConnectivity(timeoutMs = 5000): Promise<boolean> {
    try {
      const state = await Promise.race([
        NetInfo.fetch(),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs)),
      ]);

      if (state === null) return false;
      return state.isConnected === true && state.isInternetReachable !== false;
    } catch {
      return false;
    }
  }

  // Add pending request (for offline support)
  addPendingRequest(id: string, fn: () => Promise<void>, maxRetries = 3): void {
    this.pendingRequests.set(id, {
      id,
      fn,
      retryCount: 0,
      maxRetries,
      createdAt: Date.now(),
    });

    // If online, process immediately
    if (this.isOnline()) {
      this.processPendingRequest(id);
    }
  }

  // Process pending request
  private async processPendingRequest(id: string): Promise<void> {
    const request = this.pendingRequests.get(id);
    if (!request) return;

    try {
      await request.fn();
      this.pendingRequests.delete(id);
    } catch (_error) {
      request.retryCount++;
      if (request.retryCount >= request.maxRetries) {
        this.pendingRequests.delete(id);
        console.warn(`[NetworkMonitor] Request ${id} failed after ${request.maxRetries} retries`);
      }
    }
  }

  // Process all pending requests
  private async processPendingRequests(): Promise<void> {
    const requests = Array.from(this.pendingRequests.keys());
    for (const id of requests) {
      await this.processPendingRequest(id);
    }
  }

  // Get pending request count
  getPendingCount(): number {
    return this.pendingRequests.size;
  }

  // Clear pending requests
  clearPendingRequests(): void {
    this.pendingRequests.clear();
  }

  // Cleanup
  cleanup(): void {
    this.unsubscribeNetInfo?.();
    this.listeners.clear();
    this.pendingRequests.clear();
    this.isInitialized = false;
  }
}

export const networkMonitor = NetworkMonitorClass.getInstance();

// Hook for network status
export function useNetworkStatus(): NetworkStatus | null {
  const [status, setStatus] = useState<NetworkStatus | null>(networkMonitor.getStatus());

  useEffect(() => {
    networkMonitor.initialize();
    return networkMonitor.subscribe(setStatus);
  }, []);

  return status;
}

// Hook for online status (simple boolean)
export function useIsOnline(): boolean {
  const status = useNetworkStatus();
  return status?.isConnected === true && status?.isInternetReachable !== false;
}

// Hook for network-aware operations
export function useNetworkAwareOperation<T>(
  operation: () => Promise<T>,
  options: {
    retryOnReconnect?: boolean;
    offlineFallback?: T;
    timeout?: number;
  } = {}
) {
  const { retryOnReconnect = true, offlineFallback, timeout = 10000 } = options;
  const isOnline = useIsOnline();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | undefined>(undefined);
  const operationRef = useRef(operation);

  operationRef.current = operation;

  const execute = useCallback(async () => {
    if (!networkMonitor.isOnline()) {
      if (offlineFallback !== undefined) {
        setData(offlineFallback);
        return offlineFallback;
      }
      setError(new Error('Çevrimdışı. İnternet bağlantınızı kontrol edin.'));
      return undefined;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await Promise.race([
        operationRef.current(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Zaman aşımı')), timeout)
        ),
      ]);

      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Bilinmeyen hata');
      setError(error);

      if (retryOnReconnect) {
        const requestId = `auto_${Date.now()}`;
        networkMonitor.addPendingRequest(
          requestId,
          async () => {
            const result = await operationRef.current();
            setData(result);
            setError(null);
          },
          3
        );
      }

      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [offlineFallback, retryOnReconnect, timeout]);

  // Auto-execute on reconnect if there was an error
  useEffect(() => {
    if (isOnline && error && retryOnReconnect) {
      execute();
    }
  }, [isOnline, error, retryOnReconnect, execute]);

  return {
    execute,
    isLoading,
    error,
    data,
    isOnline,
    retry: execute,
  };
}

// Offline indicator component (hook)
export function useOfflineIndicator() {
  const isOnline = useIsOnline();
  const [showIndicator, setShowIndicator] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isOnline) {
      // Show indicator after a short delay (avoid flashing)
      timeoutRef.current = setTimeout(() => {
        setShowIndicator(true);
      }, 1000);
    } else {
      clearTimeout(timeoutRef.current);
      // Hide indicator after a delay when back online
      timeoutRef.current = setTimeout(() => {
        setShowIndicator(false);
      }, 2000);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [isOnline]);

  return {
    showIndicator,
    isOnline,
    message: isOnline ? 'Bağlantı sağlandı' : 'İnternet bağlantısı yok',
  };
}

export default networkMonitor;
