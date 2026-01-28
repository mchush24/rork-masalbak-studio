/**
 * Symbiosis Theme - "Emotional Symbiosis" Design System
 *
 * UNIFIED COLOR SYSTEM FOR RENKIOO
 * Combines: Bioluminescent UI + Dream Palette + Emotional Zones
 *
 * Usage:
 * - Import SymbiosisTheme for all styling needs
 * - Use zones.{zoneName} for screen-specific colors
 * - Use glass.{type} for consistent glassmorphism
 */

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// BRAND COLORS (Core Identity)
// ============================================
export const BrandColors = {
  // Primary purple family
  purple: {
    primary: '#8B5CF6',      // Main brand purple
    light: '#A78BFA',        // Lighter variant
    dark: '#7C3AED',         // Darker variant
    muted: '#B98EFF',        // Soft/muted
  },

  // Secondary pink family
  pink: {
    primary: '#FF9EBF',
    light: '#FFB5D8',
    dark: '#EC4899',
    muted: '#FFD6E0',
  },

  // Accent colors
  cyan: '#00F5FF',
  mint: '#70FFD6',
  gold: '#FFD93D',
  peach: '#FFCBA4',
  coral: '#FF6B6B',

  // Neutrals
  white: '#FFFFFF',
  cream: '#FFF8F0',
  dark: '#1E2235',
  deepSpace: '#0A0E1A',
} as const;

// ============================================
// EMOTIONAL ZONES (Screen-specific theming)
// ============================================
export const EmotionalZones = {
  /**
   * HOME ZONE - Brand identity, warm welcome
   * Screens: Home, Landing
   */
  home: {
    gradient: ['#FFF8F0', '#F5E8FF', '#FFE8F5', '#E8FFF5'] as const,
    accent: '#B98EFF',
    accentLight: 'rgba(185, 142, 255, 0.15)',
    text: '#1E2235',
    textSecondary: '#5A5F7A',
    glow: 'rgba(185, 142, 255, 0.4)',
  },

  /**
   * CALM ZONE - Analysis, reflection, trust
   * Screens: Advanced Analysis, Results, History
   */
  calm: {
    gradient: ['#F0F4FF', '#E8EFFF', '#DFE8FF'] as const,
    accent: '#6366F1',
    accentLight: 'rgba(99, 102, 241, 0.15)',
    text: '#1E293B',
    textSecondary: '#64748B',
    glow: 'rgba(99, 102, 241, 0.4)',
  },

  /**
   * CREATIVE ZONE - Art, imagination, play
   * Screens: Studio, Coloring, Story Creation
   */
  creative: {
    gradient: ['#E8FFF5', '#E0FFFF', '#F0FFF4'] as const,
    accent: '#10B981',
    accentLight: 'rgba(16, 185, 129, 0.15)',
    text: '#1E293B',
    textSecondary: '#64748B',
    glow: 'rgba(16, 185, 129, 0.4)',
  },

  /**
   * JOY ZONE - Rewards, achievements, celebrations
   * Screens: Badges, Rewards, Success states
   */
  joy: {
    gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A'] as const,
    accent: '#F59E0B',
    accentLight: 'rgba(245, 158, 11, 0.15)',
    text: '#92400E',
    textSecondary: '#A16207',
    glow: 'rgba(245, 158, 11, 0.4)',
  },

  /**
   * WARMTH ZONE - Chat, support, connection
   * Screens: ChatBot, Support, Onboarding
   */
  warmth: {
    gradient: ['#FFF5F5', '#FFF1F2', '#FFE4E6'] as const,
    accent: '#F472B6',
    accentLight: 'rgba(244, 114, 182, 0.15)',
    text: '#1E293B',
    textSecondary: '#64748B',
    glow: 'rgba(244, 114, 182, 0.4)',
  },

  /**
   * DARK ZONE - Immersive, premium, advanced UI
   * Screens: Landing (pre-auth), Special features
   */
  dark: {
    gradient: ['#0A0E1A', '#1A1E2E', '#2A2E3E'] as const,
    accent: '#00F5FF',
    accentLight: 'rgba(0, 245, 255, 0.15)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    glow: 'rgba(0, 245, 255, 0.4)',
  },
} as const;

// ============================================
// GLASS SYSTEM (Unified glassmorphism)
// ============================================
export const GlassSystem = {
  // Surface backgrounds
  surface: {
    light: 'rgba(255, 255, 255, 0.85)',
    medium: 'rgba(255, 255, 255, 0.65)',
    dark: 'rgba(255, 255, 255, 0.45)',
    ultraLight: 'rgba(255, 255, 255, 0.95)',
  },

  // Borders
  border: {
    light: 'rgba(255, 255, 255, 0.4)',
    medium: 'rgba(255, 255, 255, 0.25)',
    strong: 'rgba(255, 255, 255, 0.6)',
    colored: (color: string, opacity = 0.3) => {
      // This is a helper pattern - actual usage should inline the value
      return `rgba(${color}, ${opacity})`;
    },
  },

  // Blur intensities (for BlurView)
  blur: {
    subtle: 10,
    light: 25,
    medium: 50,
    heavy: 80,
    extreme: 100,
  },

  // Shadows for glass cards
  shadow: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 8,
    },
    strong: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 28,
      elevation: 12,
    },
    glow: (color: string) => ({
      shadowColor: color,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 12,
    }),
  },
} as const;

// ============================================
// ENERGY GRADIENTS (For advanced Skia UI)
// ============================================
export const EnergyGradients = {
  // Primary swirling iridescent flow
  iridescentFlow: ['#00F5FF', '#B98EFF', '#FF9EBF', '#FFD700'] as const,

  // Holographic blue projection
  hologramBlue: ['rgba(0,245,255,0.6)', 'rgba(112,255,214,0.4)'] as const,

  // Warm heart center glow
  heartGlow: ['#FFE4B5', '#FFCBA4', '#FF9EBF'] as const,

  // Cosmic aurora
  cosmicAurora: ['#00F5FF', '#B98EFF', '#FF6B9D', '#FFD93D', '#70FFD6'] as const,

  // Nebula pink-purple
  nebulaPink: ['#FF9EBF', '#B98EFF', '#7B68EE'] as const,

  // Bio-luminescent cyan
  bioLuminescent: ['#00F5FF', '#00D4E8', '#00B4CC'] as const,

  // Pearl white shimmer
  pearlShimmer: ['#FFFFFF', '#FFF8F0', '#FFE8D6', '#FFFFFF'] as const,

  // Deep space background
  deepSpace: ['#0A0E1A', '#1A1E2E', '#2A2E3E'] as const,

  // Rainbow holographic
  rainbow: ['#FF6B6B', '#FFE66D', '#70FFD6', '#00F5FF', '#B98EFF', '#FF9EBF'] as const,
} as const;

// ============================================
// GLOWING ACCENTS (For neon effects)
// ============================================
export const GlowingAccents = {
  // Intense white plasma
  plasmaWhite: '#FFFFFF',
  plasmaWhiteGlow: 'rgba(255, 255, 255, 0.9)',

  // Heart center warmth
  heartGlow: '#FFE4B5',
  heartGlowIntense: '#FFD700',

  // Cyan energy
  cyanEnergy: '#00F5FF',
  cyanEnergyGlow: 'rgba(0, 245, 255, 0.8)',

  // Purple magic
  purpleMagic: '#B98EFF',
  purpleMagicGlow: 'rgba(185, 142, 255, 0.8)',

  // Pink love
  pinkLove: '#FF9EBF',
  pinkLoveGlow: 'rgba(255, 158, 191, 0.8)',

  // Gold star
  goldStar: '#FFD93D',
  goldStarGlow: 'rgba(255, 217, 61, 0.8)',

  // Mint fresh
  mintFresh: '#70FFD6',
  mintFreshGlow: 'rgba(112, 255, 214, 0.7)',
} as const;

// ============================================
// FEATURE CARDS (Consistent card theming)
// ============================================
export const FeatureCardThemes = {
  analysis: {
    gradient: ['#E8FFF5', '#E0FFFF'] as const,
    border: '#70FFD6',
    icon: '#4ECDC4',
    glow: 'rgba(78, 205, 196, 0.3)',
  },
  chat: {
    gradient: ['#F0F7FF', '#E8F4FF'] as const,
    border: '#45B7D1',
    icon: '#00C8E8',
    glow: 'rgba(69, 183, 209, 0.3)',
  },
  story: {
    gradient: ['#FFF5E6', '#FFFAF0'] as const,
    border: '#FFD93D',
    icon: '#FFB347',
    glow: 'rgba(255, 217, 61, 0.3)',
  },
  emotion: {
    gradient: ['#F5E8FF', '#FFE8F5'] as const,
    border: '#B98EFF',
    icon: '#9B6DFF',
    glow: 'rgba(185, 142, 255, 0.3)',
  },
  reward: {
    gradient: ['#FFF0F5', '#FFFACD'] as const,
    border: '#FFB6C1',
    icon: '#FF69B4',
    glow: 'rgba(255, 105, 180, 0.3)',
  },
  coloring: {
    gradient: ['#E8FFF5', '#F0FFFF'] as const,
    border: '#70FFD6',
    icon: '#00CED1',
    glow: 'rgba(0, 206, 209, 0.3)',
  },
} as const;

// ============================================
// DIMENSIONS & LAYOUT
// ============================================
export const SymbiosisDimensions = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  isSmallDevice: SCREEN_HEIGHT < 700,

  // Spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius scale
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 999,
  },

  // Edge-to-edge immersive
  edgePadding: 0,
  contentPadding: 24,
  screenPadding: 20,

  // Card dimensions
  cardBorderRadius: 24,
  cardBorderWidth: 1.5,

  // Button dimensions
  heartButtonSize: SCREEN_WIDTH * 0.5,
  primaryButtonHeight: 56,
  secondaryButtonHeight: 48,

  // Touch targets (accessibility)
  minTouchTarget: 44,
  childTouchTarget: 60, // Larger for children

  // Glow radii
  glowRadiusSmall: 20,
  glowRadiusMedium: 40,
  glowRadiusLarge: 80,
} as const;

// ============================================
// ANIMATION CONFIGS
// ============================================
export const SymbiosisAnimations = {
  // Breathing rhythm (in ms)
  breatheDuration: 3000,
  breatheScale: { min: 0.98, max: 1.02 },

  // Heartbeat rhythm
  heartbeatDuration: 800,
  heartbeatScale: { min: 1.0, max: 1.08 },
  heartbeatPause: 1200,

  // Glow pulse
  glowPulseDuration: 2000,
  glowPulseOpacity: { min: 0.6, max: 1.0 },

  // Fluid motion
  fluidSpeed: 0.0005,
  fluidComplexity: 3.0,

  // Shimmer
  shimmerDuration: 2500,
  shimmerAngle: 45,

  // Spring configs
  spring: {
    gentle: { damping: 15, stiffness: 100 },
    bouncy: { damping: 10, stiffness: 150 },
    snappy: { damping: 20, stiffness: 300 },
  },

  // Platform-aware native driver
  useNativeDriver: Platform.OS !== 'web',
} as const;

// ============================================
// TYPOGRAPHY (Consistent text styles)
// ============================================
export const Typography = {
  // Font families
  fontFamily: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semibold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
    extrabold: 'Poppins_800ExtraBold',
  },

  // Font sizes
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    hero: 40,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================
// SKIA SHADER COLORS (Float arrays for Skia)
// ============================================
export const SkiaColors = {
  iridescentFlow: [
    [0.0, 0.961, 1.0, 1.0],   // #00F5FF
    [0.725, 0.557, 1.0, 1.0], // #B98EFF
    [1.0, 0.62, 0.749, 1.0],  // #FF9EBF
    [1.0, 0.843, 0.0, 1.0],   // #FFD700
  ],
  cosmicPurple: [0.725, 0.557, 1.0, 0.8],
  cyanGlow: [0.0, 0.961, 1.0, 0.9],
  pinkBlush: [1.0, 0.62, 0.749, 0.7],
  warmGold: [1.0, 0.894, 0.71, 1.0],
} as const;

// ============================================
// COMBINED THEME EXPORT
// ============================================
export const SymbiosisTheme = {
  // Core
  brand: BrandColors,
  zones: EmotionalZones,
  glass: GlassSystem,

  // Visual effects
  gradients: EnergyGradients,
  accents: GlowingAccents,
  cards: FeatureCardThemes,

  // Layout & Animation
  dimensions: SymbiosisDimensions,
  animations: SymbiosisAnimations,
  typography: Typography,

  // Advanced (Skia)
  skia: SkiaColors,
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get zone-specific colors for a screen
 */
export function getZoneColors(zoneName: keyof typeof EmotionalZones) {
  return EmotionalZones[zoneName];
}

/**
 * Create rgba color with opacity
 */
export function withOpacity(hexColor: string, opacity: number): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get glass shadow style with custom glow color
 */
export function getGlowShadow(color: string) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  };
}

export default SymbiosisTheme;
