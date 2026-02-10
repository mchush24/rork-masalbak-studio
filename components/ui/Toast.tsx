/**
 * Toast/Snackbar System
 * Phase 2: UX Enhancement
 *
 * Provides toast notifications with:
 * - 4 types: success, error, warning, info
 * - Queue mechanism
 * - Action button support
 * - Auto-dismiss
 * - Swipe to dismiss
 * - Haptic feedback
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutUp,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows, zIndex } from '@/constants/design-system';
import { useHapticFeedback } from '@/lib/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOAST_WIDTH = SCREEN_WIDTH - spacing['8'];
const SWIPE_THRESHOLD = 100;

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastOptions {
  /** Unique identifier */
  id?: string;
  /** Toast message */
  message: string;
  /** Toast type */
  type?: ToastType;
  /** Auto-dismiss duration in ms (0 = persistent) */
  duration?: number;
  /** Optional action button */
  action?: ToastAction;
  /** Position on screen */
  position?: 'top' | 'bottom';
}

interface Toast extends Required<Omit<ToastOptions, 'action'>> {
  action?: ToastAction;
  createdAt: number;
}

interface ToastContextType {
  show: (options: ToastOptions) => string;
  hide: (id: string) => void;
  hideAll: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// Toast configuration per type
const TOAST_CONFIG: Record<
  ToastType,
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: React.ComponentType<any>;
    backgroundColor: string;
    borderColor: string;
    iconColor: string;
    textColor: string;
  }
> = {
  success: {
    icon: CheckCircle,
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
    iconColor: '#10B981',
    textColor: '#065F46',
  },
  error: {
    icon: AlertCircle,
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    iconColor: '#EF4444',
    textColor: '#991B1B',
  },
  warning: {
    icon: AlertTriangle,
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    iconColor: '#F59E0B',
    textColor: '#92400E',
  },
  info: {
    icon: Info,
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
    iconColor: '#3B82F6',
    textColor: '#1E40AF',
  },
};

// Individual Toast Component
interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { tapLight, success, error: errorHaptic, warning } = useHapticFeedback();
  const config = TOAST_CONFIG[toast.type];
  const IconComponent = config.icon;
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auto-dismiss timer
  useEffect(() => {
    if (toast.duration > 0) {
      timerRef.current = setTimeout(() => {
        onDismiss(toast.id);
      }, toast.duration);
    }

    // Haptic feedback on show
    switch (toast.type) {
      case 'success':
        success();
        break;
      case 'error':
        errorHaptic();
        break;
      case 'warning':
        warning();
        break;
      default:
        tapLight();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [toast.id, toast.duration, toast.type, onDismiss, success, errorHaptic, warning, tapLight]);

  const handleDismiss = useCallback(() => {
    onDismiss(toast.id);
  }, [toast.id, onDismiss]);

  // Swipe gesture
  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      translateX.value = event.translationX;
      opacity.value = 1 - Math.abs(event.translationX) / SWIPE_THRESHOLD;
    })
    .onEnd(event => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          event.translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH,
          { duration: 200 },
          () => runOnJS(handleDismiss)()
        );
      } else {
        translateX.value = withSpring(0);
        opacity.value = withTiming(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        entering={toast.position === 'top' ? SlideInUp.springify() : FadeIn}
        exiting={toast.position === 'top' ? SlideOutUp : FadeOut}
        style={[
          styles.toastContainer,
          {
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
          },
          animatedStyle,
        ]}
      >
        <View style={styles.toastContent}>
          <IconComponent size={22} color={config.iconColor} />
          <Text style={[styles.toastMessage, { color: config.textColor }]} numberOfLines={2}>
            {toast.message}
          </Text>
        </View>

        <View style={styles.toastActions}>
          {toast.action && (
            <Pressable
              onPress={() => {
                toast.action?.onPress();
                handleDismiss();
              }}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: config.iconColor },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.actionButtonText}>{toast.action.label}</Text>
            </Pressable>
          )}
          <Pressable
            onPress={handleDismiss}
            style={({ pressed }) => [styles.dismissButton, pressed && { opacity: 0.6 }]}
            hitSlop={8}
          >
            <X size={18} color={config.textColor} />
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

// Toast Provider
interface ToastProviderProps {
  children: React.ReactNode;
  /** Maximum toasts to show at once */
  maxToasts?: number;
  /** Default position */
  defaultPosition?: 'top' | 'bottom';
}

export function ToastProvider({
  children,
  maxToasts = 3,
  defaultPosition = 'top',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const insets = useSafeAreaInsets();
  const idCounter = useRef(0);

  const show = useCallback(
    (options: ToastOptions): string => {
      const id = options.id || `toast-${++idCounter.current}`;
      const newToast: Toast = {
        id,
        message: options.message,
        type: options.type || 'info',
        duration: options.duration ?? 4000,
        position: options.position || defaultPosition,
        action: options.action,
        createdAt: Date.now(),
      };

      setToasts(prev => {
        const filtered = prev.filter(t => t.id !== id);
        const updated = [newToast, ...filtered];
        return updated.slice(0, maxToasts);
      });

      return id;
    },
    [defaultPosition, maxToasts]
  );

  const hide = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const hideAll = useCallback(() => {
    setToasts([]);
  }, []);

  const topToasts = toasts.filter(t => t.position === 'top');
  const bottomToasts = toasts.filter(t => t.position === 'bottom');

  return (
    <ToastContext.Provider value={{ show, hide, hideAll }}>
      {children}

      {/* Top Toasts */}
      {topToasts.length > 0 && (
        <View
          style={[styles.toastWrapper, styles.topWrapper, { top: insets.top + spacing['2'] }]}
          pointerEvents="box-none"
        >
          {topToasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onDismiss={hide} />
          ))}
        </View>
      )}

      {/* Bottom Toasts */}
      {bottomToasts.length > 0 && (
        <View
          style={[
            styles.toastWrapper,
            styles.bottomWrapper,
            { bottom: insets.bottom + spacing['4'] },
          ]}
          pointerEvents="box-none"
        >
          {bottomToasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onDismiss={hide} />
          ))}
        </View>
      )}
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Convenience methods
export function useToastHelpers() {
  const { show } = useToast();

  return {
    success: (message: string, options?: Partial<ToastOptions>) =>
      show({ message, type: 'success', ...options }),
    error: (message: string, options?: Partial<ToastOptions>) =>
      show({ message, type: 'error', ...options }),
    warning: (message: string, options?: Partial<ToastOptions>) =>
      show({ message, type: 'warning', ...options }),
    info: (message: string, options?: Partial<ToastOptions>) =>
      show({ message, type: 'info', ...options }),
  };
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: zIndex.toast,
    gap: spacing['2'],
  },
  topWrapper: {
    // top is set dynamically
  },
  bottomWrapper: {
    // bottom is set dynamically
  },
  toastContainer: {
    width: TOAST_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.xl,
    borderWidth: 1.5,
    ...shadows.lg,
  },
  toastContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
  },
  toastMessage: {
    flex: 1,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    lineHeight: typography.size.sm * typography.lineHeight.snug,
  },
  toastActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginLeft: spacing['2'],
  },
  actionButton: {
    paddingVertical: spacing['1.5'],
    paddingHorizontal: spacing['3'],
    borderRadius: radius.md,
  },
  actionButtonText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  dismissButton: {
    padding: spacing['1'],
  },
});

export default ToastProvider;
