/**
 * FeatureDiscovery - Feature highlight and discovery
 * Phase 14: Tutorial System
 *
 * Provides feature discovery UI:
 * - Spotlight highlights
 * - Coach marks
 * - Feature tours
 * - Pulsing indicators
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
  withRepeat,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, ChevronLeft, X } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useFeedback } from '@/hooks/useFeedback';
import { Ioo } from '@/components/Ioo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shadows, typography } from '@/constants/design-system';
import { useOverlay } from '@/lib/overlay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DISCOVERY_PREFIX = 'feature_discovered_';

export interface FeatureStep {
  id: string;
  title: string;
  description: string;
  targetRef: React.RefObject<View | null>;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface SpotlightProps {
  children: React.ReactNode;
  id: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom';
  showOnce?: boolean;
  delay?: number;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Spotlight highlight for a single feature
 */
export function Spotlight({
  children,
  id,
  title,
  description,
  position = 'bottom',
  showOnce = true,
  delay = 0,
  onDismiss,
  style,
}: SpotlightProps) {
  const [visible, setVisible] = useState(false);
  const [targetLayout, setTargetLayout] = useState<LayoutRectangle | null>(null);
  const targetRef = useRef<View>(null);
  const { feedback } = useFeedback();

  // Overlay coordination
  const overlayId = `feature_discovery_${id}`;
  const {
    canShow,
    request: requestOverlay,
    release: releaseOverlay,
  } = useOverlay('feature_discovery', overlayId);

  useEffect(() => {
    const checkAndShow = async () => {
      if (showOnce) {
        const discovered = await AsyncStorage.getItem(`${DISCOVERY_PREFIX}${id}`);
        if (discovered) return;
      }

      // Check if we can show (no other overlay is active)
      if (!canShow) return;

      const timeout = setTimeout(() => {
        // Request overlay permission before showing
        if (requestOverlay()) {
          measureTarget();
          setVisible(true);
        }
      }, delay);

      return () => clearTimeout(timeout);
    };

    checkAndShow();
  }, [id, showOnce, delay, canShow, requestOverlay]);

  const measureTarget = () => {
    targetRef.current?.measureInWindow((x, y, width, height) => {
      setTargetLayout({ x, y, width, height });
    });
  };

  const handleDismiss = async () => {
    feedback('success');
    if (showOnce) {
      await AsyncStorage.setItem(`${DISCOVERY_PREFIX}${id}`, 'true');
    }
    setVisible(false);
    releaseOverlay(); // Release overlay before closing
    onDismiss?.();
  };

  return (
    <>
      <View ref={targetRef} style={style}>
        {children}
      </View>

      {visible && targetLayout && (
        <SpotlightOverlay
          targetLayout={targetLayout}
          title={title}
          description={description}
          position={position}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}

interface SpotlightOverlayProps {
  targetLayout: LayoutRectangle;
  title: string;
  description: string;
  position: 'top' | 'bottom';
  onDismiss: () => void;
}

function SpotlightOverlay({
  targetLayout,
  title,
  description,
  position,
  onDismiss,
}: SpotlightOverlayProps) {
  const pulseScale = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const iooScale = useSharedValue(0.5);
  const iooBounce = useSharedValue(0);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    contentOpacity.value = withTiming(1, { duration: 300 });

    // Ioo entrance animation
    iooScale.value = withSpring(1, { damping: 12, stiffness: 150 });

    // Ioo subtle bounce
    iooBounce.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [pulseScale, contentOpacity, iooScale, iooBounce]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const iooAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iooScale.value }, { translateY: iooBounce.value }],
  }));

  const PADDING = 16;
  const spotlightRect = {
    x: targetLayout.x - PADDING,
    y: targetLayout.y - PADDING,
    width: targetLayout.width + PADDING * 2,
    height: targetLayout.height + PADDING * 2,
  };

  const contentTop =
    position === 'bottom' ? spotlightRect.y + spotlightRect.height + 20 : undefined;
  const contentBottom = position === 'top' ? SCREEN_HEIGHT - spotlightRect.y + 20 : undefined;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.spotlightOverlay}>
        {/* Dark overlay with cutout */}
        <View style={styles.spotlightMask}>
          {/* Top */}
          <View style={[styles.maskSection, { height: spotlightRect.y, width: SCREEN_WIDTH }]} />
          {/* Middle row */}
          <View style={{ flexDirection: 'row', height: spotlightRect.height }}>
            {/* Left */}
            <View style={[styles.maskSection, { width: spotlightRect.x }]} />
            {/* Spotlight hole */}
            <Animated.View
              style={[
                styles.spotlightHole,
                {
                  width: spotlightRect.width,
                  height: spotlightRect.height,
                },
                pulseStyle,
              ]}
            />
            {/* Right */}
            <View
              style={[
                styles.maskSection,
                { width: SCREEN_WIDTH - spotlightRect.x - spotlightRect.width },
              ]}
            />
          </View>
          {/* Bottom */}
          <View
            style={[
              styles.maskSection,
              {
                height: SCREEN_HEIGHT - spotlightRect.y - spotlightRect.height,
                width: SCREEN_WIDTH,
              },
            ]}
          />
        </View>

        {/* Content */}
        <Animated.View
          style={[
            styles.spotlightContent,
            { top: contentTop, bottom: contentBottom },
            contentStyle,
          ]}
        >
          <View style={styles.spotlightContentInner}>
            {/* Ioo Guide Mascot */}
            <Animated.View style={[styles.spotlightIooContainer, iooAnimatedStyle]}>
              <Ioo mood="excited" size="sm" animated={true} />
            </Animated.View>

            <Animated.Text style={styles.spotlightTitle}>{title}</Animated.Text>
            <Animated.Text style={styles.spotlightDescription}>{description}</Animated.Text>
            <Pressable style={styles.spotlightButton} onPress={onDismiss}>
              <Animated.Text style={styles.spotlightButtonText}>Anladım</Animated.Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

interface FeatureTourProps {
  steps: FeatureStep[];
  visible: boolean;
  onComplete: () => void;
  onSkip?: () => void;
  tourId: string;
}

/**
 * Multi-step feature tour
 */
export function FeatureTour({ steps, visible, onComplete, onSkip, tourId }: FeatureTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [layouts, setLayouts] = useState<Map<number, LayoutRectangle>>(new Map());
  const { feedback } = useFeedback();

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      measureAllTargets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const measureAllTargets = () => {
    steps.forEach((step, index) => {
      step.targetRef.current?.measureInWindow((x, y, width, height) => {
        setLayouts(prev => new Map(prev).set(index, { x, y, width, height }));
      });
    });
  };

  const handleNext = () => {
    feedback('tap');
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    feedback('tap');
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    feedback('success');
    await AsyncStorage.setItem(`${DISCOVERY_PREFIX}tour_${tourId}`, 'true');
    onComplete();
  };

  const handleSkip = async () => {
    feedback('tap');
    await AsyncStorage.setItem(`${DISCOVERY_PREFIX}tour_${tourId}`, 'true');
    onSkip?.();
  };

  if (!visible || layouts.size === 0) return null;

  const currentLayout = layouts.get(currentStep);
  const step = steps[currentStep];

  if (!currentLayout) return null;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={handleSkip}>
      <View style={styles.tourOverlay}>
        {/* Highlight current target */}
        <View style={styles.tourMask}>
          {/* Create spotlight effect */}
          <View
            style={[
              styles.tourHighlight,
              {
                top: currentLayout.y - 10,
                left: currentLayout.x - 10,
                width: currentLayout.width + 20,
                height: currentLayout.height + 20,
              },
            ]}
          />
        </View>

        {/* Tour card */}
        <TourCard
          step={step}
          currentStep={currentStep}
          totalSteps={steps.length}
          targetLayout={currentLayout}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkip={handleSkip}
          isLast={currentStep === steps.length - 1}
        />
      </View>
    </Modal>
  );
}

interface TourCardProps {
  step: FeatureStep;
  currentStep: number;
  totalSteps: number;
  targetLayout: LayoutRectangle;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isLast: boolean;
}

function TourCard({
  step,
  currentStep,
  totalSteps,
  targetLayout,
  onNext,
  onPrev,
  onSkip,
  isLast,
}: TourCardProps) {
  const scale = useSharedValue(0.9);
  const iooRotate = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 15 });

    // Ioo wave animation when step changes
    iooRotate.value = withSequence(
      withTiming(-10, { duration: 150 }),
      withTiming(10, { duration: 150 }),
      withTiming(-5, { duration: 100 }),
      withTiming(5, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
  }, [currentStep, scale, iooRotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iooAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iooRotate.value}deg` }],
  }));

  const position = step.position || (targetLayout.y > SCREEN_HEIGHT / 2 ? 'top' : 'bottom');

  const cardStyle: ViewStyle =
    position === 'top'
      ? { bottom: SCREEN_HEIGHT - targetLayout.y + 30 }
      : { top: targetLayout.y + targetLayout.height + 30 };

  return (
    <Animated.View style={[styles.tourCard, cardStyle, animatedStyle]}>
      {/* Skip button */}
      <Pressable style={styles.tourSkipButton} onPress={onSkip}>
        <X size={18} color={Colors.neutral.medium} />
      </Pressable>

      {/* Ioo Guide Mascot */}
      <Animated.View style={[styles.tourIooContainer, iooAnimatedStyle]}>
        <Ioo mood={isLast ? 'excited' : 'happy'} size="xs" animated={true} />
      </Animated.View>

      {/* Progress dots */}
      <View style={styles.tourProgress}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.tourDot,
              index === currentStep && styles.tourDotActive,
              index < currentStep && styles.tourDotCompleted,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <Animated.Text style={styles.tourTitle}>{step.title}</Animated.Text>
      <Animated.Text style={styles.tourDescription}>{step.description}</Animated.Text>

      {/* Navigation */}
      <View style={styles.tourNavigation}>
        {currentStep > 0 ? (
          <Pressable style={styles.tourPrevButton} onPress={onPrev}>
            <ChevronLeft size={20} color={Colors.secondary.lavender} />
            <Animated.Text style={styles.tourPrevButtonText}>Geri</Animated.Text>
          </Pressable>
        ) : (
          <View />
        )}

        <Pressable style={styles.tourNextButton} onPress={onNext}>
          <LinearGradient
            colors={[Colors.secondary.lavender, Colors.secondary.rose]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.tourNextButtonGradient}
          >
            <Animated.Text style={styles.tourNextButtonText}>
              {isLast ? 'Tamamla' : 'İleri'}
            </Animated.Text>
            <ChevronRight size={20} color={Colors.neutral.white} />
          </LinearGradient>
        </Pressable>
      </View>
    </Animated.View>
  );
}

interface PulsingIndicatorProps {
  size?: number;
  color?: string;
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pulsing "new" indicator
 */
export function PulsingIndicator({
  size = 12,
  color = Colors.emotion.fear,
  visible = true,
  style,
}: PulsingIndicatorProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 800, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 800, easing: Easing.in(Easing.cubic) })
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(withTiming(0.3, { duration: 800 }), withTiming(1, { duration: 800 })),
        -1,
        false
      );
    }
  }, [visible, scale, opacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <View style={[styles.pulsingContainer, { width: size * 2, height: size * 2 }, style]}>
      <Animated.View
        style={[
          styles.pulsingOuter,
          { backgroundColor: color, width: size * 2, height: size * 2, borderRadius: size },
          pulseStyle,
        ]}
      />
      <View
        style={[
          styles.pulsingInner,
          { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
        ]}
      />
    </View>
  );
}

interface CoachMarkProps {
  children: React.ReactNode;
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  visible?: boolean;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Simple coach mark bubble
 */
export function CoachMark({
  children,
  message,
  position = 'bottom',
  visible = true,
  onDismiss,
  style,
}: CoachMarkProps) {
  const opacity = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: interpolate(opacity.value, [0, 1], [0.95, 1]) }],
  }));

  const getBubblePosition = (): ViewStyle => {
    switch (position) {
      case 'top':
        return { bottom: '100%', marginBottom: 8 };
      case 'bottom':
        return { top: '100%', marginTop: 8 };
      case 'left':
        return { right: '100%', marginRight: 8 };
      case 'right':
        return { left: '100%', marginLeft: 8 };
      default:
        return {};
    }
  };

  return (
    <View style={[styles.coachMarkContainer, style]}>
      {children}
      {visible && (
        <Animated.View style={[styles.coachMarkBubble, getBubblePosition(), animatedStyle]}>
          <Pressable onPress={onDismiss}>
            <Animated.Text style={styles.coachMarkText}>{message}</Animated.Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

/**
 * Check if a feature has been discovered
 */
export async function isFeatureDiscovered(id: string): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(`${DISCOVERY_PREFIX}${id}`);
    return value === 'true';
  } catch {
    return false;
  }
}

/**
 * Reset all feature discovery states
 */
export async function resetAllDiscovery(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const discoveryKeys = keys.filter(key => key.startsWith(DISCOVERY_PREFIX));
    await AsyncStorage.multiRemove(discoveryKeys);
  } catch (error) {
    console.error('Failed to reset discovery:', error);
  }
}

const styles = StyleSheet.create({
  // Spotlight
  spotlightOverlay: {
    flex: 1,
  },
  spotlightMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  maskSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  spotlightHole: {
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.secondary.lavender,
    backgroundColor: 'transparent',
  },
  spotlightContent: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  spotlightContentInner: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...shadows.lg,
    maxWidth: 320,
  },
  spotlightIooContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightTitle: {
    fontSize: 20,
    fontFamily: typography.family.bold,
    color: Colors.neutral.dark,
    textAlign: 'center',
    marginBottom: 8,
  },
  spotlightDescription: {
    fontSize: 14,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  spotlightButton: {
    backgroundColor: Colors.secondary.lavender,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  spotlightButtonText: {
    fontSize: 16,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },

  // Tour
  tourOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  tourMask: {
    ...StyleSheet.absoluteFillObject,
  },
  tourHighlight: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Colors.secondary.lavender,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tourCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: Colors.neutral.white,
    borderRadius: 20,
    padding: 20,
    ...shadows.lg,
  },
  tourSkipButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    zIndex: 10,
  },
  tourIooContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  tourProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  tourDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral.lighter,
  },
  tourDotActive: {
    backgroundColor: Colors.secondary.lavender,
    width: 20,
  },
  tourDotCompleted: {
    backgroundColor: Colors.emotion.trust,
  },
  tourTitle: {
    fontSize: 18,
    fontFamily: typography.family.bold,
    color: Colors.neutral.dark,
    textAlign: 'center',
    marginBottom: 8,
  },
  tourDescription: {
    fontSize: 14,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  tourNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tourPrevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  tourPrevButtonText: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: Colors.secondary.lavender,
  },
  tourNextButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  tourNextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 4,
  },
  tourNextButtonText: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },

  // Pulsing Indicator
  pulsingContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsingOuter: {
    position: 'absolute',
  },
  pulsingInner: {
    position: 'absolute',
  },

  // Coach Mark
  coachMarkContainer: {
    position: 'relative',
  },
  coachMarkBubble: {
    position: 'absolute',
    backgroundColor: Colors.neutral.dark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: 200,
  },
  coachMarkText: {
    fontSize: 12,
    color: Colors.neutral.white,
    lineHeight: 16,
  },
});

export default {
  Spotlight,
  FeatureTour,
  PulsingIndicator,
  CoachMark,
  isFeatureDiscovered,
  resetAllDiscovery,
};
