/**
 * 💡 Tooltip System
 *
 * Contextual tooltips for first-time users and feature discovery.
 *
 * Features:
 * - Automatic first-use detection
 * - Contextual positioning (top/bottom/left/right)
 * - Auto-dismiss after interaction
 * - AsyncStorage persistence
 * - Pointer arrow for clarity
 * - Child-friendly language
 * - Large touch targets
 *
 * Tooltip Types:
 * - Feature introduction (first use)
 * - Contextual hints (when relevant)
 * - Pro tips (after basic use)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import { shadows, zIndex } from '@/constants/design-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOverlay } from '@/lib/overlay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  id: string; // Unique ID for persistence
  title: string;
  message: string;
  position?: TooltipPosition;
  targetX?: number;
  targetY?: number;
  visible: boolean;
  onDismiss: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

/**
 * Contextual tooltip component
 */
export function Tooltip({
  id,
  title,
  message,
  position = 'bottom',
  targetX = SCREEN_WIDTH / 2,
  targetY = SCREEN_HEIGHT / 2,
  visible,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 5000,
}: TooltipProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Overlay coordination
  const overlayId = `tooltip_${id}`;
  const { canShow, request: requestOverlay, release: releaseOverlay } = useOverlay('tooltip', overlayId);

  useEffect(() => {
    if (visible && canShow) {
      // Request overlay permission
      if (!requestOverlay()) {
        return; // Another overlay is active
      }
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss if enabled
      if (autoDismiss) {
        const timeout = setTimeout(() => {
          handleDismiss();
        }, autoDismissDelay);

        return () => clearTimeout(timeout);
      }
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, canShow, requestOverlay]);

  const handleDismiss = async () => {
    // Mark as seen
    await markTooltipSeen(id);
    releaseOverlay(); // Release overlay before closing
    onDismiss();
  };

  // Don't render if not visible or can't show due to overlay conflict
  if (!visible || !canShow) return null;

  // Calculate tooltip position
  const tooltipStyle = getTooltipPosition(position, targetX, targetY);

  return (
    <>
      {/* Backdrop (semi-transparent) */}
      <Pressable
        style={styles.backdrop}
        onPress={handleDismiss}
        pointerEvents={visible ? 'auto' : 'none'}
      />

      {/* Tooltip */}
      <Animated.View
        style={[
          styles.tooltip,
          tooltipStyle,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Arrow pointer */}
        <View style={[styles.arrow, getArrowStyle(position)]} />

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Dismiss button */}
          <Pressable onPress={handleDismiss} style={styles.dismissButton}>
            <Text style={styles.dismissText}>Anladım! ✓</Text>
          </Pressable>
        </View>
      </Animated.View>
    </>
  );
}

// ============================================================================
// TOOLTIP MANAGER
// ============================================================================

/**
 * Hook to manage tooltip visibility
 */
export function useTooltip(tooltipId: string) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    checkTooltipStatus();
  }, []);

  const checkTooltipStatus = async () => {
    const seen = await hasSeenTooltip(tooltipId);
    if (!seen) {
      // Show tooltip after a short delay
      setTimeout(() => {
        setVisible(true);
      }, 500);
    }
  };

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return { visible, show, hide };
}

/**
 * Check if tooltip has been seen
 */
export async function hasSeenTooltip(tooltipId: string): Promise<boolean> {
  try {
    const seen = await AsyncStorage.getItem(`@tooltip_${tooltipId}`);
    return seen === 'true';
  } catch (error) {
    console.warn('[Tooltip] Failed to check status:', error);
    return false;
  }
}

/**
 * Mark tooltip as seen
 */
export async function markTooltipSeen(tooltipId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(`@tooltip_${tooltipId}`, 'true');
  } catch (error) {
    console.warn('[Tooltip] Failed to mark as seen:', error);
  }
}

/**
 * Reset all tooltips (for testing)
 */
export async function resetTooltips(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const tooltipKeys = keys.filter((key) => key.startsWith('@tooltip_'));
    await AsyncStorage.multiRemove(tooltipKeys);
  } catch (error) {
    console.warn('[Tooltip] Failed to reset tooltips:', error);
  }
}

// ============================================================================
// POSITIONING HELPERS
// ============================================================================

function getTooltipPosition(
  position: TooltipPosition,
  targetX: number,
  targetY: number
) {
  const OFFSET = 20; // Offset from target
  const TOOLTIP_WIDTH = 280;
  const TOOLTIP_HEIGHT = 150; // Approximate

  switch (position) {
    case 'top':
      return {
        left: Math.max(20, Math.min(SCREEN_WIDTH - TOOLTIP_WIDTH - 20, targetX - TOOLTIP_WIDTH / 2)),
        bottom: SCREEN_HEIGHT - targetY + OFFSET,
      };
    case 'bottom':
      return {
        left: Math.max(20, Math.min(SCREEN_WIDTH - TOOLTIP_WIDTH - 20, targetX - TOOLTIP_WIDTH / 2)),
        top: targetY + OFFSET,
      };
    case 'left':
      return {
        right: SCREEN_WIDTH - targetX + OFFSET,
        top: Math.max(20, Math.min(SCREEN_HEIGHT - TOOLTIP_HEIGHT - 20, targetY - TOOLTIP_HEIGHT / 2)),
      };
    case 'right':
      return {
        left: targetX + OFFSET,
        top: Math.max(20, Math.min(SCREEN_HEIGHT - TOOLTIP_HEIGHT - 20, targetY - TOOLTIP_HEIGHT / 2)),
      };
  }
}

function getArrowStyle(position: TooltipPosition) {
  switch (position) {
    case 'top':
      return styles.arrowBottom;
    case 'bottom':
      return styles.arrowTop;
    case 'left':
      return styles.arrowRight;
    case 'right':
      return styles.arrowLeft;
  }
}

// ============================================================================
// PRE-DEFINED TOOLTIPS
// ============================================================================

export const TOOLTIPS = {
  FIRST_BRUSH: {
    id: 'first_brush',
    title: 'Fırça Aracı 🖌️',
    message: 'Canvas üzerinde parmağını sürükleyerek çizim yapabilirsin!',
  },
  FIRST_FILL: {
    id: 'first_fill',
    title: 'Dolgu Aracı 💧',
    message: 'Bir alana dokun, hemen dolsun! Büyük alanları doldurmanın en kolay yolu.',
  },
  FIRST_COLOR_CHANGE: {
    id: 'first_color_change',
    title: 'Renk Değişikliği 🎨',
    message: 'Harika! Şimdi yeni renginle çizim yapabilirsin.',
  },
  BRUSH_SETTINGS: {
    id: 'brush_settings',
    title: 'Fırça Ayarları ⚙️',
    message: 'Fırça kalınlığı, şeffaflık ve yumuşaklığı ayarlayabilirsin!',
  },
  ADVANCED_COLOR_PICKER: {
    id: 'advanced_color_picker',
    title: 'Gelişmiş Renk Seçici 🌈',
    message: 'HSV renk tekerleği, şeffaflık ve favori renkler ile sınırsız renk seçenekleri!',
  },
  UNDO_REDO: {
    id: 'undo_redo',
    title: 'Geri Al & İleri Al ↩️',
    message: 'Hata mı yaptın? Endişelenme! Geri al butonu ile son işlemi geri alabilirsin.',
  },
  SAVE_BUTTON: {
    id: 'save_button',
    title: 'Kaydet & Paylaş 💾',
    message: 'Eserini kaydet ve ailenle paylaş! Harika bir kutlama seni bekliyor 🎉',
  },
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    // Backdrop sits just below tooltip - coordinated via OverlayCoordinator
    zIndex: zIndex.tooltip - 1,
  },
  tooltip: {
    position: 'absolute',
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    // Uses design system z-index for tooltips
    zIndex: zIndex.tooltip,
    ...shadows.lg,
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
  },
  arrowTop: {
    top: -10,
    left: '50%',
    marginLeft: -10,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  arrowBottom: {
    bottom: -10,
    left: '50%',
    marginLeft: -10,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },
  arrowLeft: {
    left: -10,
    top: '50%',
    marginTop: -10,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#FFFFFF',
  },
  arrowRight: {
    right: -10,
    top: '50%',
    marginTop: -10,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  dismissButton: {
    backgroundColor: '#FF9B7A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
