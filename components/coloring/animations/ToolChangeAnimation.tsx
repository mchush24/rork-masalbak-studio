/**
 * 🎯 Tool Change Animation
 *
 * Visual feedback when switching between coloring tools.
 *
 * Features:
 * - Bounce/scale animation on tool selection
 * - Fade transition between tools
 * - Tool icon pulse effect
 * - Color shift animation
 * - Child-friendly visual feedback
 *
 * Animation Types:
 * - Bounce: Spring-based bounce effect
 * - Scale: Smooth scale up/down
 * - Pulse: Rhythmic pulse for active tool
 * - Fade: Fade in/out for smooth transitions
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export type ToolAnimationType = 'bounce' | 'scale' | 'pulse' | 'fade';

export interface ToolChangeAnimationProps {
  isActive: boolean;
  animationType?: ToolAnimationType;
  children: React.ReactNode;
  duration?: number;
  onAnimationComplete?: () => void;
}

/**
 * Animated wrapper for tool buttons
 */
export function ToolChangeAnimation({
  isActive,
  animationType = 'bounce',
  children,
  duration = 300,
  onAnimationComplete,
}: ToolChangeAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      // Trigger animation when tool becomes active
      switch (animationType) {
        case 'bounce':
          bounceAnimation();
          break;
        case 'scale':
          scaleAnimation();
          break;
        case 'pulse':
          pulseAnimation();
          break;
        case 'fade':
          fadeAnimation();
          break;
      }
    } else {
      // Reset to normal state
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive, animationType]);

  const bounceAnimation = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationComplete?.();
    });

    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: duration / 2,
      useNativeDriver: true,
    }).start();
  };

  const scaleAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: duration / 2,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationComplete?.();
    });

    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: duration / 2,
      useNativeDriver: true,
    }).start();
  };

  const pulseAnimation = () => {
    // Continuous pulse for active tool
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: duration / 2,
      useNativeDriver: true,
    }).start(() => {
      onAnimationComplete?.();
    });

    // Stop pulse when not active
    return () => pulse.stop();
  };

  const fadeAnimation = () => {
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 0.5,
        duration: duration / 3,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: (duration * 2) / 3,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationComplete?.();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// ============================================================================
// ICON BOUNCE ANIMATION
// ============================================================================

/**
 * Simple bounce animation for tool icons
 */
export function ToolIconBounce({ children }: { children: React.ReactNode }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -5,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    bounce.start();

    return () => bounce.stop();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: bounceAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}

// ============================================================================
// TOOL SELECTOR ANIMATION
// ============================================================================

/**
 * Animated background glow for selected tool
 */
export function ToolGlowAnimation({ isActive }: { isActive: boolean }) {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Pulse glow when active
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive]);

  const opacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.glow,
        {
          opacity,
        },
      ]}
    />
  );
}

// ============================================================================
// TOOL TRANSITION ANIMATION
// ============================================================================

/**
 * Smooth transition when switching between tools
 */
export function ToolTransitionAnimation({
  trigger,
  children,
}: {
  trigger: any;
  children: React.ReactNode;
}) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate on trigger change
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [trigger]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
}

// ============================================================================
// BUTTON PRESS ANIMATION
// ============================================================================

/**
 * Reusable press animation for any pressable element
 */
export function usePressAnimation() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return {
    scaleAnim,
    onPressIn,
    onPressOut,
  };
}

// ============================================================================
// SHIMMER EFFECT
// ============================================================================

/**
 * Shimmer/shine effect for new tools or features
 */
export function ToolShimmerEffect() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <Animated.View
      style={[
        styles.shimmer,
        {
          transform: [{ translateX }],
        },
      ]}
    />
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFD700',
    borderRadius: 12,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 50,
  },
});
