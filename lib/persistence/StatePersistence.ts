/**
 * App State Persistence
 * Phase 5: Error Handling Enhancement
 *
 * Provides:
 * - Crash recovery state saving
 * - Session restoration
 * - Draft saving (analysis, forms)
 * - Navigation state persistence
 * - Automatic backup
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { analytics } from '@/lib/analytics';

// Storage keys
const STORAGE_KEYS = {
  SESSION_STATE: '@persistence_session_state',
  NAVIGATION_STATE: '@persistence_navigation_state',
  DRAFT_PREFIX: '@persistence_draft_',
  CRASH_STATE: '@persistence_crash_state',
  LAST_ACTIVE: '@persistence_last_active',
};

// Session state interface
export interface SessionState {
  userId?: string;
  lastScreen?: string;
  lastAction?: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

// Draft interface
export interface Draft<T = unknown> {
  id: string;
  type: string;
  data: T;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
}

// Crash recovery state
export interface CrashRecoveryState {
  hadCrash: boolean;
  lastSession?: SessionState;
  pendingDrafts: string[];
  errorId?: string;
}

// Auto-save interval (30 seconds)
const AUTO_SAVE_INTERVAL = 30 * 1000;

// Draft expiry (7 days)
const DRAFT_EXPIRY = 7 * 24 * 60 * 60 * 1000;

// State persistence manager
class StatePersistenceManager {
  private static instance: StatePersistenceManager;
  private currentSession: SessionState | null = null;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private crashRecoveryState: CrashRecoveryState | null = null;

  static getInstance(): StatePersistenceManager {
    if (!StatePersistenceManager.instance) {
      StatePersistenceManager.instance = new StatePersistenceManager();
    }
    return StatePersistenceManager.instance;
  }

  async initialize(): Promise<CrashRecoveryState | null> {
    if (this.isInitialized) return this.crashRecoveryState;

    try {
      // Check for crash state
      this.crashRecoveryState = await this.checkForCrash();

      // Start auto-save
      this.startAutoSave();

      // Listen to app state changes
      AppState.addEventListener('change', this.handleAppStateChange);

      this.isInitialized = true;

      return this.crashRecoveryState;
    } catch (error) {
      console.warn('[StatePersistence] Initialization failed:', error);
      return null;
    }
  }

  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // Save state when going to background
      await this.saveSessionState();
    } else if (nextAppState === 'active') {
      // Clear crash flag when app becomes active normally
      await AsyncStorage.removeItem(STORAGE_KEYS.CRASH_STATE);
    }
  };

  // Check for previous crash
  private async checkForCrash(): Promise<CrashRecoveryState> {
    try {
      const crashStateJson = await AsyncStorage.getItem(STORAGE_KEYS.CRASH_STATE);
      const lastSessionJson = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_STATE);
      const drafts = await this.getAllDraftIds();

      const lastSession = lastSessionJson ? JSON.parse(lastSessionJson) : undefined;

      // If crash state exists, we had a crash
      const hadCrash = crashStateJson !== null;

      if (hadCrash) {
        analytics.trackEvent('app_crash_recovered', 'error', {
          lastScreen: lastSession?.lastScreen,
          pendingDrafts: drafts.length,
        });
      }

      // Set crash flag for next launch
      await AsyncStorage.setItem(
        STORAGE_KEYS.CRASH_STATE,
        JSON.stringify({ timestamp: Date.now() })
      );

      return {
        hadCrash,
        lastSession,
        pendingDrafts: drafts,
      };
    } catch (error) {
      return {
        hadCrash: false,
        pendingDrafts: [],
      };
    }
  }

  // Start auto-save interval
  private startAutoSave(): void {
    this.autoSaveInterval = setInterval(() => {
      this.saveSessionState();
    }, AUTO_SAVE_INTERVAL);
  }

  // Save session state
  async saveSessionState(data?: Record<string, unknown>): Promise<void> {
    try {
      const state: SessionState = {
        ...this.currentSession,
        timestamp: Date.now(),
        data: data || this.currentSession?.data,
      };

      this.currentSession = state;
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION_STATE, JSON.stringify(state));
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, Date.now().toString());
    } catch (error) {
      console.warn('[StatePersistence] Save session failed:', error);
    }
  }

  // Update session info
  updateSession(updates: Partial<SessionState>): void {
    this.currentSession = {
      ...this.currentSession,
      ...updates,
      timestamp: Date.now(),
    };
  }

  // Get last session
  async getLastSession(): Promise<SessionState | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_STATE);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  }

  // Save draft
  async saveDraft<T>(type: string, id: string, data: T): Promise<void> {
    try {
      const draft: Draft<T> = {
        id,
        type,
        data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        expiresAt: Date.now() + DRAFT_EXPIRY,
      };

      const key = `${STORAGE_KEYS.DRAFT_PREFIX}${type}_${id}`;
      await AsyncStorage.setItem(key, JSON.stringify(draft));
    } catch (error) {
      console.warn('[StatePersistence] Save draft failed:', error);
    }
  }

  // Get draft
  async getDraft<T>(type: string, id: string): Promise<Draft<T> | null> {
    try {
      const key = `${STORAGE_KEYS.DRAFT_PREFIX}${type}_${id}`;
      const json = await AsyncStorage.getItem(key);

      if (!json) return null;

      const draft = JSON.parse(json) as Draft<T>;

      // Check expiry
      if (draft.expiresAt && draft.expiresAt < Date.now()) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return draft;
    } catch {
      return null;
    }
  }

  // Delete draft
  async deleteDraft(type: string, id: string): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.DRAFT_PREFIX}${type}_${id}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('[StatePersistence] Delete draft failed:', error);
    }
  }

  // Get all draft IDs
  async getAllDraftIds(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys
        .filter((key) => key.startsWith(STORAGE_KEYS.DRAFT_PREFIX))
        .map((key) => key.replace(STORAGE_KEYS.DRAFT_PREFIX, ''));
    } catch {
      return [];
    }
  }

  // Get all drafts of a type
  async getDraftsByType<T>(type: string): Promise<Draft<T>[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const draftKeys = keys.filter((key) =>
        key.startsWith(`${STORAGE_KEYS.DRAFT_PREFIX}${type}_`)
      );

      const drafts: Draft<T>[] = [];
      for (const key of draftKeys) {
        const json = await AsyncStorage.getItem(key);
        if (json) {
          const draft = JSON.parse(json) as Draft<T>;
          if (!draft.expiresAt || draft.expiresAt > Date.now()) {
            drafts.push(draft);
          }
        }
      }

      return drafts.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  }

  // Clean expired drafts
  async cleanExpiredDrafts(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const draftKeys = keys.filter((key) =>
        key.startsWith(STORAGE_KEYS.DRAFT_PREFIX)
      );

      let cleaned = 0;
      for (const key of draftKeys) {
        const json = await AsyncStorage.getItem(key);
        if (json) {
          const draft = JSON.parse(json) as Draft;
          if (draft.expiresAt && draft.expiresAt < Date.now()) {
            await AsyncStorage.removeItem(key);
            cleaned++;
          }
        }
      }

      return cleaned;
    } catch {
      return 0;
    }
  }

  // Save navigation state
  async saveNavigationState(state: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.NAVIGATION_STATE,
        JSON.stringify(state)
      );
    } catch (error) {
      console.warn('[StatePersistence] Save navigation failed:', error);
    }
  }

  // Get navigation state
  async getNavigationState(): Promise<unknown | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.NAVIGATION_STATE);
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  }

  // Clear navigation state
  async clearNavigationState(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.NAVIGATION_STATE);
    } catch (error) {
      console.warn('[StatePersistence] Clear navigation failed:', error);
    }
  }

  // Get crash recovery state
  getCrashRecoveryState(): CrashRecoveryState | null {
    return this.crashRecoveryState;
  }

  // Clear crash recovery
  async clearCrashRecovery(): Promise<void> {
    this.crashRecoveryState = null;
    await AsyncStorage.removeItem(STORAGE_KEYS.CRASH_STATE);
  }

  // Cleanup
  cleanup(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    this.isInitialized = false;
  }
}

export const statePersistence = StatePersistenceManager.getInstance();

// Hook for state persistence
export function useStatePersistence() {
  const [isReady, setIsReady] = useState(false);
  const [crashRecovery, setCrashRecovery] = useState<CrashRecoveryState | null>(null);

  useEffect(() => {
    async function init() {
      const recovery = await statePersistence.initialize();
      setCrashRecovery(recovery);
      setIsReady(true);
    }
    init();

    return () => statePersistence.cleanup();
  }, []);

  const updateSession = useCallback((updates: Partial<SessionState>) => {
    statePersistence.updateSession(updates);
  }, []);

  const saveSession = useCallback(async (data?: Record<string, unknown>) => {
    await statePersistence.saveSessionState(data);
  }, []);

  return {
    isReady,
    crashRecovery,
    updateSession,
    saveSession,
    clearCrashRecovery: statePersistence.clearCrashRecovery.bind(statePersistence),
  };
}

// Hook for draft management
export function useDraft<T>(type: string, id: string) {
  const [draft, setDraft] = useState<Draft<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const loaded = await statePersistence.getDraft<T>(type, id);
      setDraft(loaded);
      setIsLoading(false);
    }
    load();
  }, [type, id]);

  const save = useCallback(
    async (data: T) => {
      await statePersistence.saveDraft(type, id, data);
      setDraft((prev) =>
        prev
          ? { ...prev, data, updatedAt: Date.now() }
          : {
              id,
              type,
              data,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }
      );
    },
    [type, id]
  );

  // Debounced auto-save
  const autoSave = useCallback(
    (data: T, delayMs = 2000) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        save(data);
      }, delayMs);
    },
    [save]
  );

  const deleteDraft = useCallback(async () => {
    await statePersistence.deleteDraft(type, id);
    setDraft(null);
  }, [type, id]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    draft,
    isLoading,
    hasDraft: draft !== null,
    save,
    autoSave,
    deleteDraft,
  };
}

// Hook for crash recovery UI
export function useCrashRecovery(onRecover?: (state: SessionState) => void) {
  const { crashRecovery, clearCrashRecovery } = useStatePersistence();
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);

  useEffect(() => {
    if (crashRecovery?.hadCrash && crashRecovery.lastSession) {
      setShowRecoveryDialog(true);
    }
  }, [crashRecovery]);

  const recover = useCallback(() => {
    if (crashRecovery?.lastSession && onRecover) {
      onRecover(crashRecovery.lastSession);
    }
    setShowRecoveryDialog(false);
    clearCrashRecovery();
  }, [crashRecovery, onRecover, clearCrashRecovery]);

  const dismiss = useCallback(() => {
    setShowRecoveryDialog(false);
    clearCrashRecovery();
  }, [clearCrashRecovery]);

  return {
    showRecoveryDialog,
    crashRecovery,
    recover,
    dismiss,
  };
}

export default statePersistence;
