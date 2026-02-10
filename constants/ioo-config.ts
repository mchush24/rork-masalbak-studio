/**
 * Ioo Mascot Configuration
 * Part of #2: Ioo Maskot Görsel Tutarlılığı
 *
 * Unified configuration for all Ioo mascot components to ensure
 * visual consistency across the application.
 *
 * This file defines:
 * - Standard mood types
 * - Standard size options
 * - Color palettes
 * - Animation configurations
 * - Component selection guide
 */

// ============================================================================
// MOOD TYPES
// ============================================================================

/**
 * Standard mood types for all Ioo mascot components.
 * All mascot implementations should support at least the core moods.
 */
export type IooMood =
  // Core moods (must be supported by all implementations)
  | 'happy' // Default, cheerful expression
  | 'excited' // Very happy, bouncy
  | 'curious' // Tilted head, interested look
  | 'sleepy' // Drowsy, half-closed eyes
  | 'love' // Heart eyes or loving expression

  // Extended moods (supported by full implementations)
  | 'neutral' // Calm, no particular emotion
  | 'calm' // Peaceful, relaxed
  | 'thinking' // Contemplative, looking up
  | 'concerned' // Worried, empathetic
  | 'sad' // Unhappy, supportive mood
  | 'loving' // Affectionate, warm expression
  | 'angry' // Frustrated, upset expression

  // Special moods (for specific use cases)
  | 'talking' // Animated mouth for speech
  | 'surprised' // Wide eyes, open mouth
  | 'wink'; // Playful wink

/**
 * Core moods that all implementations must support
 */
export const CORE_MOODS: IooMood[] = ['happy', 'excited', 'curious', 'sleepy', 'love'];

/**
 * Mood descriptions for documentation
 */
export const MOOD_DESCRIPTIONS: Record<IooMood, string> = {
  happy: 'Default cheerful expression with smile',
  excited: 'Very happy, bouncing animation',
  curious: 'Tilted head, interested look',
  sleepy: 'Drowsy, half-closed eyes',
  love: 'Loving expression, may show hearts',
  neutral: 'Calm, no particular emotion',
  calm: 'Peaceful, relaxed state',
  thinking: 'Contemplative, looking upward',
  concerned: 'Worried, empathetic expression',
  sad: 'Unhappy, supportive mood',
  loving: 'Affectionate, warm expression',
  angry: 'Frustrated, upset expression',
  talking: 'Animated mouth for speech animations',
  surprised: 'Wide eyes, startled look',
  wink: 'Playful winking expression',
};

/**
 * Map old/alternative mood names to standard moods
 */
export const MOOD_ALIASES: Record<string, IooMood> = {
  // Common aliases
  default: 'happy',
  normal: 'neutral',
  tired: 'sleepy',
  wonder: 'curious',
  loving: 'love',
  worried: 'concerned',
  unhappy: 'sad',
  amazed: 'surprised',
  playful: 'wink',
  speaking: 'talking',
};

// ============================================================================
// SIZE OPTIONS
// ============================================================================

/**
 * Standard size options for Ioo mascot
 */
export type IooSize =
  | 'xs' // 50px - Icon size
  | 'tiny' // 60-70px - Very small, badges
  | 'sm' // 70px - Small
  | 'small' // 100px - Standard small
  | 'md' // 100px - Medium alias
  | 'medium' // 140px - Standard medium (default)
  | 'lg' // 180px - Large
  | 'large' // 200px - Standard large
  | 'hero' // 280px - Hero sections
  | 'giant'; // 350-360px - Full screen

/**
 * Size to pixel mapping - unified across all components
 */
export const SIZE_MAP: Record<IooSize, number> = {
  xs: 50,
  tiny: 60,
  sm: 70,
  small: 100,
  md: 100,
  medium: 140,
  lg: 180,
  large: 200,
  hero: 280,
  giant: 350,
};

/**
 * Size categories for different use cases
 */
export const SIZE_CATEGORIES = {
  icon: ['xs', 'tiny'] as IooSize[],
  compact: ['sm', 'small', 'md'] as IooSize[],
  standard: ['medium', 'lg'] as IooSize[],
  display: ['large', 'hero', 'giant'] as IooSize[],
};

/**
 * Get pixel size from IooSize or number
 */
export function getPixelSize(size: IooSize | number): number {
  if (typeof size === 'number') return size;
  return SIZE_MAP[size] || SIZE_MAP.medium;
}

// ============================================================================
// COLOR PALETTE
// ============================================================================

/**
 * Standard Ioo color palette
 */
export const IOO_COLORS = {
  // Body colors - warm, soft tones
  body: {
    light: '#FFFDF8',
    main: '#FFF8EE',
    mid: '#FFE8D6',
    shadow: '#F5D5BC',
    deepShadow: '#E8C4A8',
    ambient: '#FFE0C4',
  },

  // Alternate body (for variations)
  bodyAlt: {
    light: '#FFF9F0',
    main: '#FFF0E0',
    dark: '#FFE4CC',
    shadow: '#F5D4B8',
  },

  // Eye colors
  eyes: {
    white: '#FFFFFF',
    iris: '#3D2314',
    irisLight: '#5C3D2E',
    irisDeep: '#1A0F0A',
    pupil: '#0A0505',
    highlight: '#FFFFFF',
  },

  // Cheek blush
  cheeks: {
    main: '#FFB5B5',
    glow: '#FFC4C4',
    soft: 'rgba(255,181,181,0.6)',
  },

  // Mouth
  mouth: {
    line: '#C4937A',
    altLine: '#D4A08A',
    tongue: '#FF9999',
    inside: '#D4847A',
  },

  // Glow effects
  glow: {
    warm: 'rgba(255,240,220,0.5)',
    soft: 'rgba(255,230,210,0.3)',
    ambient: 'rgba(255,220,200,0.2)',
    purple: 'rgba(139,92,246,0.3)',
  },

  // Fiber optic tips (for IooMascotNew)
  fiberTips: [
    '#FF69B4', // Pink
    '#FFB6C1', // Light pink
    '#87CEEB', // Sky blue
    '#98FB98', // Pale green
    '#DDA0DD', // Plum
    '#F0E68C', // Khaki yellow
    '#E6E6FA', // Lavender
    '#AFEEEE', // Pale turquoise
  ],

  // Rainbow glasses (for IooMascotNew)
  glasses: {
    frame: ['#FFD700', '#FFAA00', '#FF8C00', '#CC7000'],
    lensLeft: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#A78BFA'],
    lensRight: ['#FF9F43', '#26DE81', '#45AAF2', '#D980FA'],
  },

  // Grass/hair (for IooMascotNew)
  grass: {
    base: '#27AE60',
    mid: '#2ECC71',
    light: '#58D68D',
    tip: '#82E0AA',
  },
};

// ============================================================================
// ANIMATION CONFIGURATION
// ============================================================================

/**
 * Standard animation durations
 */
export const ANIMATION_DURATIONS = {
  breathe: 2000, // Breathing cycle
  float: 2000, // Floating up/down
  blink: 70, // Eye blink
  blinkInterval: [3000, 5500], // Min/max time between blinks
  wave: 200, // Hand wave movement
  glow: 1500, // Glow pulse
  bounce: 300, // Touch bounce
  wiggle: 50, // Wiggle per frame
};

/**
 * Animation scale values
 */
export const ANIMATION_SCALES = {
  breatheMin: 0.97,
  breatheMax: 1.03,
  floatDistance: 6, // pixels
  bounceDistance: 10, // pixels
};

/**
 * Animation configuration by role
 */
export const ROLE_ANIMATION_CONFIG = {
  parent: {
    animated: true,
    showGlow: true,
    breathe: true,
    float: true,
    blink: true,
    wave: true,
  },
  teacher: {
    animated: true,
    showGlow: false,
    breathe: true,
    float: false,
    blink: true,
    wave: false,
  },
  expert: {
    animated: false,
    showGlow: false,
    breathe: false,
    float: false,
    blink: false,
    wave: false,
  },
};

// ============================================================================
// COMPONENT SELECTION GUIDE
// ============================================================================

/**
 * Guide for choosing the right Ioo component
 *
 * Components available (in order of recommendation):
 *
 * 1. IooMascotImage (default export from Ioo.tsx)
 *    - Uses PNG image with 3D effects
 *    - Lightweight, fast rendering
 *    - Best for: Most use cases, especially on mobile
 *    - Features: Breathing, floating, tilt, glow animations
 *
 * 2. IooRoleAware
 *    - Automatically adapts to user role
 *    - Uses IooMascotImage internally
 *    - Best for: Role-dependent UIs
 *    - Features: Auto-hides/simplifies for professionals
 *
 * 3. IooMascotNew (IooSvg)
 *    - SVG-based with fiber optic hair and rainbow glasses
 *    - More detailed but heavier
 *    - Best for: Marketing, hero sections
 *    - Features: Animated grass hair, waving hand
 *
 * 4. IooMascotFinal
 *    - Clean, minimal SVG design
 *    - Molang/Pusheen inspired
 *    - Best for: Simple, cute contexts
 *    - Features: Eye blink, look around
 *
 * 5. IooMascotPro
 *    - Premium Pixar-quality SVG
 *    - Most detailed and heaviest
 *    - Best for: Special occasions, loading screens
 *    - Features: Full mood animations, touch response
 *
 * 6. IooMascot3D
 *    - Real 3D model with react-three-fiber
 *    - Very heavy (~13MB)
 *    - Best for: Special 3D experiences only
 *    - Features: True 3D rotation, lighting
 */
export const COMPONENT_RECOMMENDATIONS = {
  // General purpose
  default: 'IooMascotImage',

  // By context
  dashboard: 'IooRoleAware',
  emptyState: 'IooRoleAware',
  error: 'IooRoleAware',
  loading: 'IooMascotImage',
  chat: 'IooRoleAware',
  onboarding: 'IooMascotNew',
  marketing: 'IooMascotNew',
  hero: 'IooMascotPro',
  celebration: 'IooMascotPro',

  // By platform
  mobile: 'IooMascotImage',
  web: 'IooMascotNew',
  native3D: 'IooMascot3D',

  // By role
  parent: 'IooMascotImage',
  teacher: 'IooRoleAware',
  expert: 'IooRoleAware', // Will show minimal/hidden
};

// ============================================================================
// PROP DEFAULTS
// ============================================================================

/**
 * Default props for Ioo components
 */
export const IOO_DEFAULTS = {
  size: 'medium' as IooSize,
  mood: 'happy' as IooMood,
  animated: true,
  showGlow: true,
};

/**
 * Role-specific defaults
 */
export const ROLE_IOO_DEFAULTS = {
  parent: {
    ...IOO_DEFAULTS,
    animated: true,
    showGlow: true,
  },
  teacher: {
    ...IOO_DEFAULTS,
    animated: true,
    showGlow: false,
  },
  expert: {
    ...IOO_DEFAULTS,
    animated: false,
    showGlow: false,
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  moods: CORE_MOODS,
  sizes: SIZE_MAP,
  colors: IOO_COLORS,
  animations: ANIMATION_DURATIONS,
  defaults: IOO_DEFAULTS,
};
