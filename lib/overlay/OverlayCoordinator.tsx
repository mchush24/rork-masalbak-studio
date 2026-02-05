/**
 * OverlayCoordinator - Centralized overlay management
 *
 * Prevents multiple overlays (tooltips, popups, assistants) from
 * appearing simultaneously, which causes text overlap issues.
 *
 * Usage:
 * - Wrap app with OverlayProvider
 * - Use useOverlay hook to request/release overlay visibility
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Overlay types with priority (higher = more important)
export type OverlayType =
  | 'crash_recovery'    // Priority 100 - highest
  | 'error_boundary'    // Priority 90
  | 'modal'             // Priority 80
  | 'ioo_assistant'     // Priority 50
  | 'chatbot_suggestion'// Priority 40
  | 'tooltip'           // Priority 30
  | 'feature_discovery' // Priority 20
  | 'first_use_guide';  // Priority 10

const OVERLAY_PRIORITY: Record<OverlayType, number> = {
  crash_recovery: 100,
  error_boundary: 90,
  modal: 80,
  ioo_assistant: 50,
  chatbot_suggestion: 40,
  tooltip: 30,
  feature_discovery: 20,
  first_use_guide: 10,
};

interface OverlayState {
  type: OverlayType;
  id: string;
  priority: number;
}

interface OverlayContextType {
  /** Currently active overlay */
  activeOverlay: OverlayState | null;

  /** Request to show an overlay. Returns true if granted. */
  requestOverlay: (type: OverlayType, id: string) => boolean;

  /** Release an overlay when done */
  releaseOverlay: (type: OverlayType, id: string) => void;

  /** Check if a specific overlay is currently active */
  isOverlayActive: (type: OverlayType, id: string) => boolean;

  /** Check if any overlay is blocking */
  isBlocked: (type: OverlayType) => boolean;

  /** Force release all overlays (use sparingly) */
  releaseAll: () => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

interface OverlayProviderProps {
  children: ReactNode;
}

export function OverlayProvider({ children }: OverlayProviderProps) {
  const [activeOverlay, setActiveOverlay] = useState<OverlayState | null>(null);

  const requestOverlay = useCallback((type: OverlayType, id: string): boolean => {
    const priority = OVERLAY_PRIORITY[type];

    // If no active overlay, grant immediately
    if (!activeOverlay) {
      setActiveOverlay({ type, id, priority });
      if (__DEV__) {
        console.log(`[OverlayCoordinator] Granted: ${type} (${id})`);
      }
      return true;
    }

    // If same overlay is requesting again, allow it
    if (activeOverlay.type === type && activeOverlay.id === id) {
      return true;
    }

    // If higher priority, take over
    if (priority > activeOverlay.priority) {
      if (__DEV__) {
        console.log(`[OverlayCoordinator] Preempted ${activeOverlay.type} with ${type}`);
      }
      setActiveOverlay({ type, id, priority });
      return true;
    }

    // Lower or equal priority, deny
    if (__DEV__) {
      console.log(`[OverlayCoordinator] Denied: ${type} (blocked by ${activeOverlay.type})`);
    }
    return false;
  }, [activeOverlay]);

  const releaseOverlay = useCallback((type: OverlayType, id: string) => {
    setActiveOverlay(current => {
      if (current && current.type === type && current.id === id) {
        if (__DEV__) {
          console.log(`[OverlayCoordinator] Released: ${type} (${id})`);
        }
        return null;
      }
      return current;
    });
  }, []);

  const isOverlayActive = useCallback((type: OverlayType, id: string): boolean => {
    return activeOverlay?.type === type && activeOverlay?.id === id;
  }, [activeOverlay]);

  const isBlocked = useCallback((type: OverlayType): boolean => {
    if (!activeOverlay) return false;
    const priority = OVERLAY_PRIORITY[type];
    return priority <= activeOverlay.priority;
  }, [activeOverlay]);

  const releaseAll = useCallback(() => {
    if (__DEV__) {
      console.log('[OverlayCoordinator] Released all overlays');
    }
    setActiveOverlay(null);
  }, []);

  return (
    <OverlayContext.Provider
      value={{
        activeOverlay,
        requestOverlay,
        releaseOverlay,
        isOverlayActive,
        isBlocked,
        releaseAll,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
}

/**
 * Hook to manage overlay visibility
 */
export function useOverlay(type: OverlayType, id: string) {
  const context = useContext(OverlayContext);

  // Fallback for when not wrapped in provider (backwards compatibility)
  if (!context) {
    return {
      canShow: true,
      isActive: false,
      request: () => true,
      release: () => {},
    };
  }

  return {
    canShow: !context.isBlocked(type),
    isActive: context.isOverlayActive(type, id),
    request: () => context.requestOverlay(type, id),
    release: () => context.releaseOverlay(type, id),
  };
}

/**
 * Hook to check if any overlay is currently blocking
 */
export function useOverlayStatus() {
  const context = useContext(OverlayContext);

  if (!context) {
    return {
      hasActiveOverlay: false,
      activeType: null,
      releaseAll: () => {},
    };
  }

  return {
    hasActiveOverlay: !!context.activeOverlay,
    activeType: context.activeOverlay?.type || null,
    releaseAll: context.releaseAll,
  };
}

export default OverlayProvider;
