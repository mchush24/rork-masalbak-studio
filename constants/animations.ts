/**
 * Animation Constants - Standardized animation values
 *
 * All animations in the app should use these presets
 * for consistency and performance
 */

import { Easing } from 'react-native-reanimated';

// ============================================================================
// DURATION PRESETS
// ============================================================================

export const duration = {
  // Micro interactions (button press, icon change)
  instant: 100,
  fast: 150,
  normal: 250,
  slow: 400,

  // Page transitions
  pageEnter: 300,
  pageExit: 200,

  // Modal animations
  modalEnter: 350,
  modalExit: 250,

  // List animations
  listItemStagger: 50,  // Delay between items
  listItemEnter: 300,

  // Loading states
  skeleton: 1500,
  pulse: 1000,

  // Celebration
  confetti: 3000,
  stars: 2000,
} as const;

// ============================================================================
// SPRING CONFIGS
// ============================================================================

export const spring = {
  // Snappy - for buttons, toggles
  snappy: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },

  // Bouncy - for fun interactions
  bouncy: {
    damping: 10,
    stiffness: 100,
    mass: 1,
  },

  // Gentle - for page transitions
  gentle: {
    damping: 20,
    stiffness: 90,
    mass: 1,
  },

  // Stiff - for precise movements
  stiff: {
    damping: 20,
    stiffness: 200,
    mass: 1,
  },

  // Wobbly - for playful elements
  wobbly: {
    damping: 8,
    stiffness: 120,
    mass: 1,
  },
} as const;

// ============================================================================
// EASING PRESETS
// ============================================================================

export const easing = {
  // Standard easings
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),

  // Cubic easings
  cubicIn: Easing.in(Easing.cubic),
  cubicOut: Easing.out(Easing.cubic),
  cubicInOut: Easing.inOut(Easing.cubic),

  // Expo easings (dramatic)
  expoIn: Easing.in(Easing.exp),
  expoOut: Easing.out(Easing.exp),
  expoInOut: Easing.inOut(Easing.exp),

  // Back easings (overshoot)
  backIn: Easing.in(Easing.back(1.5)),
  backOut: Easing.out(Easing.back(1.5)),
  backInOut: Easing.inOut(Easing.back(1.5)),

  // Bounce
  bounce: Easing.bounce,

  // Elastic
  elastic: Easing.elastic(1),
} as const;

// ============================================================================
// TRANSFORM PRESETS
// ============================================================================

export const transforms = {
  // Button press
  buttonPress: {
    scale: 0.96,
  },

  // Card press
  cardPress: {
    scale: 0.98,
  },

  // Icon press
  iconPress: {
    scale: 0.9,
  },

  // Hover/Focus
  hover: {
    scale: 1.02,
  },

  // Active state
  active: {
    scale: 1.05,
  },

  // Shake (for errors)
  shake: {
    translateX: [-10, 10, -8, 8, -5, 5, 0],
  },
} as const;

// ============================================================================
// ENTRANCE ANIMATIONS
// ============================================================================

export const entrance = {
  // Fade in from bottom (default for cards)
  fadeInUp: {
    from: { opacity: 0, translateY: 20 },
    to: { opacity: 1, translateY: 0 },
  },

  // Fade in from top
  fadeInDown: {
    from: { opacity: 0, translateY: -20 },
    to: { opacity: 1, translateY: 0 },
  },

  // Fade in from left
  fadeInLeft: {
    from: { opacity: 0, translateX: -20 },
    to: { opacity: 1, translateX: 0 },
  },

  // Fade in from right
  fadeInRight: {
    from: { opacity: 0, translateX: 20 },
    to: { opacity: 1, translateX: 0 },
  },

  // Scale up
  scaleIn: {
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1 },
  },

  // Bounce in
  bounceIn: {
    from: { opacity: 0, scale: 0.3 },
    to: { opacity: 1, scale: 1 },
  },

  // Slide in from bottom (for modals)
  slideInBottom: {
    from: { translateY: 300 },
    to: { translateY: 0 },
  },
} as const;

// ============================================================================
// EXIT ANIMATIONS
// ============================================================================

export const exit = {
  fadeOutDown: {
    from: { opacity: 1, translateY: 0 },
    to: { opacity: 0, translateY: 20 },
  },

  fadeOutUp: {
    from: { opacity: 1, translateY: 0 },
    to: { opacity: 0, translateY: -20 },
  },

  scaleOut: {
    from: { opacity: 1, scale: 1 },
    to: { opacity: 0, scale: 0.9 },
  },

  slideOutBottom: {
    from: { translateY: 0 },
    to: { translateY: 300 },
  },
} as const;

// ============================================================================
// STAGGER PRESETS
// ============================================================================

export const stagger = {
  // Fast stagger for lists
  fast: {
    delayChildren: 0,
    staggerChildren: 30,
  },

  // Normal stagger
  normal: {
    delayChildren: 100,
    staggerChildren: 50,
  },

  // Slow stagger for hero elements
  slow: {
    delayChildren: 200,
    staggerChildren: 100,
  },
} as const;

// ============================================================================
// HAPTIC FEEDBACK RULES
// ============================================================================

export const haptics = {
  // Light impact - toggles, small buttons
  light: 'light' as const,

  // Medium impact - main buttons, card press
  medium: 'medium' as const,

  // Heavy impact - destructive actions, errors
  heavy: 'heavy' as const,

  // Success - completed actions
  success: 'success' as const,

  // Warning - important notices
  warning: 'warning' as const,

  // Error - failed actions
  error: 'error' as const,

  // Selection - picker changes
  selection: 'selection' as const,
} as const;

// ============================================================================
// SKELETON ANIMATION CONFIG
// ============================================================================

export const skeleton = {
  // Shimmer animation
  shimmer: {
    duration: 1500,
    colors: {
      light: ['#F0F0F0', '#E0E0E0', '#F0F0F0'],
      dark: ['#2A2A2A', '#3A3A3A', '#2A2A2A'],
    },
  },

  // Pulse animation
  pulse: {
    duration: 1000,
    minOpacity: 0.4,
    maxOpacity: 1,
  },
} as const;

// ============================================================================
// CELEBRATION CONFIGS
// ============================================================================

export const celebration = {
  confetti: {
    count: 50,
    duration: 3000,
    colors: ['#FF9B7A', '#FFD56B', '#7ED99C', '#78C8E8', '#A78BFA', '#FFB5D8'],
    spread: 360,
    gravity: 0.5,
  },

  stars: {
    count: 20,
    duration: 2000,
    colors: ['#FFD93D', '#FFF5CC', '#FFEB99'],
    scale: { min: 0.5, max: 1.5 },
  },

  sparkle: {
    count: 30,
    duration: 1500,
    color: '#FFD93D',
  },
} as const;

// ============================================================================
// PULL TO REFRESH CONFIG
// ============================================================================

export const pullToRefresh = {
  triggerHeight: 80,
  maxPullHeight: 120,
  spinDuration: 800,
  colors: {
    light: '#FF9B7A',
    dark: '#FF9B7A',
  },
} as const;

// Export all as default
export default {
  duration,
  spring,
  easing,
  transforms,
  entrance,
  exit,
  stagger,
  haptics,
  skeleton,
  celebration,
  pullToRefresh,
};
