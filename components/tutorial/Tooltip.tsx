/**
 * Tooltip - Contextual help tooltips
 * Phase 14: Tutorial System
 *
 * Provides contextual tooltips:
 * - Positioned tooltips
 * - Arrow indicators
 * - Auto-dismiss
 * - Touch-through support
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  ViewStyle,
  StyleProp,
  LayoutRectangle,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { X, Info, Lightbulb, HelpCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useFeedback } from '@/hooks/useFeedback';
import { Ioo } from '@/components/Ioo';
import { shadows, typography } from '@/constants/design-system';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';
type TooltipType = 'info' | 'tip' | 'help';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  title?: string;
  type?: TooltipType;
  position?: TooltipPosition;
  visible?: boolean;
  onClose?: () => void;
  showCloseButton?: boolean;
  autoDismiss?: number; // ms
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
  /** Show Ioo mascot as guide */
  showIoo?: boolean;
}

/**
 * Contextual tooltip that wraps a target element
 */
export function Tooltip({
  children,
  content,
  title,
  type = 'info',
  position = 'auto',
  visible: controlledVisible,
  onClose,
  showCloseButton = false,
  autoDismiss,
  maxWidth = 280,
  style,
  showIoo = false,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [targetLayout, setTargetLayout] = useState<LayoutRectangle | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>('bottom');
  const targetRef = useRef<View>(null);
  const { feedback } = useFeedback();

  const isControlled = controlledVisible !== undefined;
  const isVisible = isControlled ? controlledVisible : visible;

  useEffect(() => {
    if (isVisible && autoDismiss) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoDismiss);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, autoDismiss]);

  const handlePress = () => {
    if (!isControlled) {
      feedback('tap');
      measureTarget();
      setVisible(true);
    }
  };

  const handleClose = () => {
    if (!isControlled) {
      setVisible(false);
    }
    onClose?.();
  };

  const measureTarget = () => {
    targetRef.current?.measureInWindow((x, y, width, height) => {
      const layout = { x, y, width, height };
      setTargetLayout(layout);

      // Auto-calculate best position
      if (position === 'auto') {
        const spaceTop = y;
        const spaceBottom = SCREEN_HEIGHT - (y + height);
        const _spaceLeft = x;
        const spaceRight = SCREEN_WIDTH - (x + width);

        if (spaceBottom >= 150) {
          setTooltipPosition('bottom');
        } else if (spaceTop >= 150) {
          setTooltipPosition('top');
        } else if (spaceRight >= 200) {
          setTooltipPosition('right');
        } else {
          setTooltipPosition('left');
        }
      } else {
        setTooltipPosition(position);
      }
    });
  };

  useEffect(() => {
    if (isControlled && controlledVisible) {
      measureTarget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledVisible]);

  const getIcon = () => {
    switch (type) {
      case 'tip':
        return <Lightbulb size={16} color={Colors.emotion.joy} />;
      case 'help':
        return <HelpCircle size={16} color={Colors.secondary.mint} />;
      default:
        return <Info size={16} color={Colors.secondary.lavender} />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'tip':
        return Colors.emotion.joy;
      case 'help':
        return Colors.secondary.mint;
      default:
        return Colors.secondary.lavender;
    }
  };

  return (
    <>
      <Pressable ref={targetRef} onPress={handlePress} style={style}>
        {children}
      </Pressable>

      {isVisible && targetLayout && (
        <TooltipOverlay
          targetLayout={targetLayout}
          position={tooltipPosition}
          title={title}
          content={content}
          icon={getIcon()}
          typeColor={getTypeColor()}
          maxWidth={maxWidth}
          showCloseButton={showCloseButton}
          onClose={handleClose}
          showIoo={showIoo}
        />
      )}
    </>
  );
}

interface TooltipOverlayProps {
  targetLayout: LayoutRectangle;
  position: TooltipPosition;
  title?: string;
  content: string;
  icon: React.ReactNode;
  typeColor: string;
  maxWidth: number;
  showCloseButton: boolean;
  onClose: () => void;
  showIoo?: boolean;
}

function TooltipOverlay({
  targetLayout,
  position,
  title,
  content,
  icon,
  typeColor,
  maxWidth,
  showCloseButton,
  onClose,
  showIoo = false,
}: TooltipOverlayProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const iooScale = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 200 });

    if (showIoo) {
      iooScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 150 }));
    }
  }, [showIoo, scale, opacity, iooScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const iooAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iooScale.value }],
  }));

  const getTooltipStyle = (): ViewStyle => {
    const _ARROW_SIZE = 10;
    const MARGIN = 12;

    switch (position) {
      case 'top':
        return {
          position: 'absolute',
          bottom: SCREEN_HEIGHT - targetLayout.y + MARGIN,
          left: Math.max(
            16,
            Math.min(
              targetLayout.x + targetLayout.width / 2 - maxWidth / 2,
              SCREEN_WIDTH - maxWidth - 16
            )
          ),
        };
      case 'bottom':
        return {
          position: 'absolute',
          top: targetLayout.y + targetLayout.height + MARGIN,
          left: Math.max(
            16,
            Math.min(
              targetLayout.x + targetLayout.width / 2 - maxWidth / 2,
              SCREEN_WIDTH - maxWidth - 16
            )
          ),
        };
      case 'left':
        return {
          position: 'absolute',
          top: targetLayout.y + targetLayout.height / 2 - 50,
          right: SCREEN_WIDTH - targetLayout.x + MARGIN,
        };
      case 'right':
        return {
          position: 'absolute',
          top: targetLayout.y + targetLayout.height / 2 - 50,
          left: targetLayout.x + targetLayout.width + MARGIN,
        };
      default:
        return {};
    }
  };

  const getArrowStyle = (): ViewStyle => {
    const centerX = targetLayout.x + targetLayout.width / 2;

    switch (position) {
      case 'top':
        return {
          position: 'absolute',
          bottom: -8,
          left:
            centerX -
            Math.max(
              16,
              Math.min(
                targetLayout.x + targetLayout.width / 2 - maxWidth / 2,
                SCREEN_WIDTH - maxWidth - 16
              )
            ) -
            5,
          borderTopColor: Colors.neutral.dark,
        };
      case 'bottom':
        return {
          position: 'absolute',
          top: -8,
          left:
            centerX -
            Math.max(
              16,
              Math.min(
                targetLayout.x + targetLayout.width / 2 - maxWidth / 2,
                SCREEN_WIDTH - maxWidth - 16
              )
            ) -
            5,
          borderBottomColor: Colors.neutral.dark,
        };
      case 'left':
        return {
          position: 'absolute',
          right: -8,
          top: 40,
          borderLeftColor: Colors.neutral.dark,
        };
      case 'right':
        return {
          position: 'absolute',
          left: -8,
          top: 40,
          borderRightColor: Colors.neutral.dark,
        };
      default:
        return {};
    }
  };

  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[styles.tooltipContainer, { maxWidth }, getTooltipStyle(), animatedStyle]}
        >
          <View style={[styles.arrow, getArrowStyle()]} />

          <View style={styles.tooltipContent}>
            {/* Ioo Guide (optional) */}
            {showIoo && (
              <Animated.View style={[styles.tooltipIooContainer, iooAnimatedStyle]}>
                <Ioo mood="happy" size="xs" animated={true} />
              </Animated.View>
            )}

            {(title || showCloseButton) && (
              <View style={styles.tooltipHeader}>
                {!showIoo && icon}
                {title && (
                  <Animated.Text style={[styles.tooltipTitle, { color: typeColor }]}>
                    {title}
                  </Animated.Text>
                )}
                {showCloseButton && (
                  <Pressable style={styles.closeButton} onPress={onClose}>
                    <X size={16} color={Colors.neutral.medium} />
                  </Pressable>
                )}
              </View>
            )}
            <Animated.Text style={styles.tooltipText}>{content}</Animated.Text>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

interface TooltipProviderProps {
  children: React.ReactNode;
}

// Context for managing tooltips globally
interface TooltipConfigData {
  title?: string;
  message?: string;
  position?: string;
  targetX?: number;
  targetY?: number;
}

export const TooltipContext = React.createContext<{
  showTooltip: (id: string, config: TooltipConfigData) => void;
  hideTooltip: (id: string) => void;
}>({
  showTooltip: () => {},
  hideTooltip: () => {},
});

export function TooltipProvider({ children }: TooltipProviderProps) {
  const [_tooltips, setTooltips] = useState<Map<string, TooltipConfigData>>(new Map());

  const showTooltip = (id: string, config: TooltipConfigData) => {
    setTooltips(prev => new Map(prev).set(id, config));
  };

  const hideTooltip = (id: string) => {
    setTooltips(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
    </TooltipContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tooltipContainer: {
    backgroundColor: Colors.neutral.dark,
    borderRadius: 12,
    ...shadows.md,
  },
  arrow: {
    width: 0,
    height: 0,
    borderWidth: 8,
    borderColor: 'transparent',
  },
  tooltipContent: {
    padding: 12,
  },
  tooltipIooContainer: {
    alignItems: 'center',
    marginBottom: 8,
    marginTop: -4,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tooltipTitle: {
    fontSize: 14,
    fontFamily: typography.family.bold,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  tooltipText: {
    fontSize: 13,
    color: Colors.neutral.lighter,
    lineHeight: 18,
  },
});

export default Tooltip;
