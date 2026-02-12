/**
 * Renkioo Design System 2.0
 *
 * Ebeveynler için profesyonel tasarım sistemi
 * İlham: Apple HIG, Headspace, Calm, Duolingo
 */

import { Dimensions, Platform } from 'react-native';
import { Colors } from './colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// LAYOUT SYSTEM
// ============================================
export const layout = {
  // Screen padding
  screenPadding: 20,
  screenPaddingSmall: 16,

  // Grid system (2 column)
  gridGap: 16,
  columnWidth: (SCREEN_WIDTH - 20 * 2 - 16) / 2, // (screen - padding - gap) / 2

  // Card sizes
  card: {
    hero: {
      width: SCREEN_WIDTH - 40,
      minHeight: 240,
    },
    feature: {
      width: (SCREEN_WIDTH - 40 - 16) / 2,
      minHeight: 180,
    },
    small: {
      width: (SCREEN_WIDTH - 40 - 16) / 2,
      minHeight: 120,
    },
  },

  // Icon sizes (base scale)
  icon: {
    tiny: 16,
    small: 24,
    medium: 32,
    large: 48,
    huge: 80,
    mega: 120,
  },

  // Avatar sizes
  avatar: {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  },
};

// ============================================
// TYPOGRAPHY SYSTEM (Enhanced)
// ============================================
/**
 * Typography System
 *
 * USAGE GUIDE:
 * - ALWAYS use typography.size instead of hardcoded fontSize values
 * - ALWAYS use typography.weight instead of hardcoded fontWeight strings
 * - Use typography.lineHeight multipliers or typography.lineHeightPx for line heights
 *
 * SIZE MAPPING (from hardcoded to tokens):
 * 10-11px → typography.size.xs (11)
 * 12-13px → typography.size.sm (13)
 * 14-15px → typography.size.base (15)
 * 16-17px → typography.size.md (17)
 * 18-20px → typography.size.lg (20)
 * 22-24px → typography.size.xl (24)
 * 26-28px → typography.size["2xl"] (28)
 * 30-32px → typography.size["3xl"] (32)
 * 36-40px → typography.size["4xl"] (40)
 * 44-48px → typography.size["5xl"] (48)
 * 52-56px → typography.size.hero (56)
 *
 * WEIGHT MAPPING:
 * '400' / 'normal' → typography.weight.regular
 * '500' → typography.weight.medium
 * '600' → typography.weight.semibold
 * '700' / 'bold' → typography.weight.bold
 * '800' → typography.weight.extrabold
 * '900' → typography.weight.black
 */
export const typography = {
  // Font families
  family: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    extrabold: 'System',
  },

  /**
   * Size Scale (in pixels)
   *
   * Semantic naming for consistent usage:
   * - xs: Captions, timestamps, badges
   * - sm: Secondary text, labels, helper text
   * - base: Body text, default size
   * - md: Emphasized body, lead text
   * - lg: Subheadings, card titles
   * - xl: Section headers
   * - 2xl: Page subtitles
   * - 3xl: Page titles
   * - 4xl: Hero sections
   * - 5xl: Feature highlights
   * - hero: Main hero text
   */
  size: {
    /** 11px - Captions, timestamps, fine print */
    xs: 11,
    /** 13px - Labels, secondary text, helper text */
    sm: 13,
    /** 15px - Body text, default readable size */
    base: 15,
    /** 17px - Emphasized body, lead paragraphs */
    md: 17,
    /** 20px - Subheadings, card titles */
    lg: 20,
    /** 24px - Section headers, modal titles */
    xl: 24,
    /** 28px - Page subtitles */
    '2xl': 28,
    /** 32px - Page titles */
    '3xl': 32,
    /** 40px - Hero sections, feature highlights */
    '4xl': 40,
    /** 48px - Large feature text */
    '5xl': 48,
    /** 56px - Main hero headlines */
    hero: 56,
  },

  /**
   * Weight Scale
   *
   * Use semantic names instead of numeric strings!
   * Bad:  fontWeight: '600'
   * Good: fontWeight: typography.weight.semibold
   */
  weight: {
    /** 400 - Regular body text */
    regular: '400' as const,
    /** 500 - Slightly emphasized text */
    medium: '500' as const,
    /** 600 - Labels, subtitles, emphasized */
    semibold: '600' as const,
    /** 700 - Headlines, buttons, important */
    bold: '700' as const,
    /** 800 - Extra emphasis, hero text */
    extrabold: '800' as const,
    /** 900 - Maximum emphasis */
    black: '900' as const,
  },

  /**
   * Line Height Multipliers
   *
   * Usage: lineHeight: fontSize * typography.lineHeight.normal
   */
  lineHeight: {
    /** 1.2 - Headlines, single line text */
    tight: 1.2,
    /** 1.375 - Subheadings, short paragraphs */
    snug: 1.375,
    /** 1.5 - Body text (default) */
    normal: 1.5,
    /** 1.625 - Relaxed body text */
    relaxed: 1.625,
    /** 2.0 - Extra spacious text */
    loose: 2,
  },

  /**
   * Pre-calculated Line Heights (in pixels)
   *
   * Direct pixel values for common size/lineHeight combos.
   * These match size tokens with normal (1.5) line height.
   */
  lineHeightPx: {
    /** 16px - for xs (11px) text */
    xs: 16,
    /** 20px - for sm (13px) text */
    sm: 20,
    /** 24px - for base (15px) text */
    base: 24,
    /** 26px - for md (17px) text */
    md: 26,
    /** 30px - for lg (20px) text */
    lg: 30,
    /** 36px - for xl (24px) text */
    xl: 36,
    /** 42px - for 2xl (28px) text */
    '2xl': 42,
    /** 48px - for 3xl (32px) text */
    '3xl': 48,
    /** 56px - for 4xl (40px) text - tight line height for headlines */
    '4xl': 56,
    /** 64px - for 5xl (48px) text */
    '5xl': 64,
    /** 72px - for hero (56px) text */
    hero: 72,
  },

  /**
   * Letter Spacing
   *
   * Use sparingly - mainly for headlines and special cases.
   */
  letterSpacing: {
    /** -1px - Very tight, large headlines only */
    tighter: -1,
    /** -0.5px - Slightly tight headlines */
    tight: -0.5,
    /** 0 - Normal spacing (default) */
    normal: 0,
    /** 0.5px - Slightly wide */
    wide: 0.5,
    /** 1px - Wide spacing for emphasis */
    wider: 1,
    /** 2px - Very wide, labels/badges */
    widest: 2,
  },
} as const;

// ============================================
// SPACING SYSTEM (8pt grid)
// ============================================
export const spacing = {
  '0': 0,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80,
  '24': 96,
  // Named aliases for convenience
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// ============================================
// BORDER RADIUS
// ============================================
export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  xxl: 24,
  '3xl': 32,
  xxxl: 32,
  full: 9999,
} as const;

/** @deprecated Use `radius` instead */
export const borderRadius = radius;

// ============================================
// SHADOWS & ELEVATION
// React Native Web uses boxShadow, native uses shadow* props
// ============================================
export const createShadow = (
  offsetY: number,
  blur: number,
  opacity: number,
  elevation: number,
  color: string = '#000'
) => {
  const nativeShadow = {
    shadowColor: color,
    shadowOffset: { width: 0, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur,
    elevation,
  };

  // On web, use boxShadow instead of deprecated shadow* props
  if (Platform.OS === 'web') {
    const alpha = Math.round(opacity * 255)
      .toString(16)
      .padStart(2, '0');
    return {
      boxShadow: `0px ${offsetY}px ${blur}px ${color}${alpha}`,
      elevation,
    };
  }

  return nativeShadow;
};

export const shadows = {
  none:
    Platform.OS === 'web'
      ? { boxShadow: 'none', elevation: 0 }
      : {
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
          elevation: 0,
        },
  xs: createShadow(1, 2, 0.05, 1),
  sm: createShadow(2, 4, 0.08, 2),
  md: createShadow(4, 8, 0.12, 4),
  lg: createShadow(8, 16, 0.15, 8),
  xl: createShadow(12, 24, 0.2, 12),
  colored: (color: string) => {
    if (Platform.OS === 'web') {
      return {
        boxShadow: `0px 4px 12px ${color}4D`, // 0.3 opacity = 4D in hex
        elevation: 6,
      };
    }
    return {
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    };
  },
};

// ============================================
// TEXT SHADOWS
// React Native Web uses textShadow CSS property
// ============================================
export const createTextShadow = (offsetX: number, offsetY: number, blur: number, color: string) => {
  if (Platform.OS === 'web') {
    return {
      textShadow: `${offsetX}px ${offsetY}px ${blur}px ${color}`,
    };
  }
  return {
    textShadowColor: color,
    textShadowOffset: { width: offsetX, height: offsetY },
    textShadowRadius: blur,
  };
};

export const textShadows = {
  none:
    Platform.OS === 'web'
      ? { textShadow: 'none' }
      : {
          textShadowColor: 'transparent',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 0,
        },
  sm: createTextShadow(0, 1, 2, 'rgba(0,0,0,0.1)'),
  md: createTextShadow(0, 2, 4, 'rgba(0,0,0,0.15)'),
  lg: createTextShadow(0, 2, 8, 'rgba(0,0,0,0.2)'),
  hero: createTextShadow(0, 2, 10, 'rgba(0,0,0,0.2)'),
};

// ============================================
// ANIMATION TIMINGS
// ============================================
export const animation = {
  // Duration (ms)
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 400,
    slower: 600,
    slowest: 800,
  },

  // Easing curves
  easing: {
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    spring: { tension: 300, friction: 20 },
    bounce: { tension: 180, friction: 12 },
  },

  // Spring configs
  spring: {
    gentle: { tension: 120, friction: 14 },
    bouncy: { tension: 180, friction: 12 },
    snappy: { tension: 300, friction: 20 },
  },
} as const;

// ============================================
// GLASSMORPHISM STYLES
// ============================================
export const glassmorphism = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...shadows.md,
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...shadows.lg,
  },
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...shadows.md,
  },
} as const;

// ============================================
// NEUMORPHISM STYLES
// ============================================
export const neumorphism = {
  raised:
    Platform.OS === 'web'
      ? {
          backgroundColor: Colors.background.primary,
          boxShadow: '4px 4px 8px #0000001A', // 0.1 opacity
          elevation: 4,
        }
      : {
          backgroundColor: Colors.background.primary,
          shadowColor: '#000',
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        },
  pressed:
    Platform.OS === 'web'
      ? {
          backgroundColor: Colors.background.primary,
          boxShadow: '-2px -2px 4px #0000000D', // 0.05 opacity
          elevation: 1,
        }
      : {
          backgroundColor: Colors.background.primary,
          shadowColor: '#000',
          shadowOffset: { width: -2, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
        },
};

// ============================================
// CLAYMORPHISM STYLES
// Soft, pillowy 3D effect - clay-like surfaces
// Uses large radius + double shadow (outer + highlight) for depth
// ============================================
export const claymorphism = {
  /** Soft clay card - subtle 3D lift */
  card:
    Platform.OS === 'web'
      ? {
          backgroundColor: '#F4F0F8',
          borderRadius: 24,
          boxShadow:
            '8px 8px 16px rgba(163, 145, 180, 0.25), -4px -4px 12px rgba(255, 255, 255, 0.8)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.6)',
        }
      : {
          backgroundColor: '#F4F0F8',
          borderRadius: 24,
          shadowColor: '#A391B4',
          shadowOffset: { width: 6, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 8,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.6)',
        },

  /** Pressed/sunk clay state */
  cardPressed:
    Platform.OS === 'web'
      ? {
          backgroundColor: '#EDE8F2',
          borderRadius: 24,
          boxShadow: '4px 4px 8px rgba(163, 145, 180, 0.2), -2px -2px 6px rgba(255, 255, 255, 0.6)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.4)',
        }
      : {
          backgroundColor: '#EDE8F2',
          borderRadius: 24,
          shadowColor: '#A391B4',
          shadowOffset: { width: 3, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.4)',
        },

  /** Warm clay (peach/sunset tone) */
  warm:
    Platform.OS === 'web'
      ? {
          backgroundColor: '#FFF5F0',
          borderRadius: 24,
          boxShadow:
            '8px 8px 16px rgba(255, 155, 122, 0.2), -4px -4px 12px rgba(255, 255, 255, 0.8)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.6)',
        }
      : {
          backgroundColor: '#FFF5F0',
          borderRadius: 24,
          shadowColor: '#FF9B7A',
          shadowOffset: { width: 6, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 8,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.6)',
        },

  /** Cool clay (blue/mint tone) */
  cool:
    Platform.OS === 'web'
      ? {
          backgroundColor: '#F0F7FF',
          borderRadius: 24,
          boxShadow:
            '8px 8px 16px rgba(120, 200, 232, 0.2), -4px -4px 12px rgba(255, 255, 255, 0.8)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.6)',
        }
      : {
          backgroundColor: '#F0F7FF',
          borderRadius: 24,
          shadowColor: '#78C8E8',
          shadowOffset: { width: 6, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 8,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.6)',
        },

  /** Button-style clay (smaller, more tactile) */
  button:
    Platform.OS === 'web'
      ? {
          backgroundColor: '#F4F0F8',
          borderRadius: 16,
          boxShadow:
            '4px 4px 10px rgba(163, 145, 180, 0.3), -2px -2px 8px rgba(255, 255, 255, 0.7)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.5)',
        }
      : {
          backgroundColor: '#F4F0F8',
          borderRadius: 16,
          shadowColor: '#A391B4',
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 6,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.5)',
        },
} as const;

// ============================================
// Z-INDEX LAYERS
// ============================================
/**
 * Z-Index Layering System
 *
 * Consistent z-index values to prevent overlap issues.
 * ALWAYS use these tokens instead of hardcoded values!
 *
 * Layer order (bottom to top):
 * ┌─────────────────────────────────────────────────────┐
 * │  debug (9999)     - Dev tools, debug panels         │
 * │  max (999)        - Reserved for system modals      │
 * │  floating (100)   - FAB, floating selectors         │
 * │  tooltip (80)     - Tooltips, hints                 │
 * │  toast (70)       - Toast notifications, snackbars  │
 * │  popover (60)     - Popovers, assistant panels      │
 * │  modal (50)       - Modals, dialogs, overlays       │
 * │  overlay (40)     - Dim overlays, cursors           │
 * │  sticky (30)      - Sticky headers, banners         │
 * │  dropdown (20)    - Dropdowns, menus                │
 * │  raised (10)      - Cards with shadow, elevated     │
 * │  base (0)         - Default layer                   │
 * └─────────────────────────────────────────────────────┘
 *
 * Usage Examples:
 * - IooAssistant container: zIndex.popover
 * - IooAssistant tip panel: zIndex.toast
 * - Modal overlays: zIndex.modal
 * - Floating buttons (FAB, chat): zIndex.floating
 * - Tooltips: zIndex.tooltip
 * - Offline banners: zIndex.overlay
 * - Dropdown menus: zIndex.dropdown
 * - Debug panels (DEV only): zIndex.debug
 */
export const zIndex = {
  /** Default layer for normal elements */
  base: 0,
  /** Raised cards and elevated surfaces */
  raised: 10,
  /** Dropdown menus, selects */
  dropdown: 20,
  /** Sticky headers, navigation bars */
  sticky: 30,
  /** Dim overlays, backdrop, cursors */
  overlay: 40,
  /** Modal dialogs, bottom sheets */
  modal: 50,
  /** Popovers, assistant panels */
  popover: 60,
  /** Toast notifications, snackbars */
  toast: 70,
  /** Tooltips, info hints */
  tooltip: 80,
  /** Floating action buttons (FAB), floating child selector */
  floating: 100,
  /** Maximum safe z-index - use sparingly! */
  max: 999,
  /** Debug panels (only for development) */
  debug: 9999,
} as const;

// ============================================
// INTERACTION STATES
// ============================================
export const interaction = {
  press: {
    scale: 0.96,
    opacity: 0.8,
  },
  hover: {
    scale: 1.02,
    elevation: shadows.lg,
  },
  disabled: {
    opacity: 0.4,
  },
  loading: {
    opacity: 0.6,
  },
} as const;

// ============================================
// CARD VARIANTS
// ============================================
export const cardVariants = {
  hero: {
    padding: spacing['8'],
    borderRadius: radius['2xl'],
    minHeight: layout.card.hero.minHeight,
    ...shadows.xl,
  },
  feature: {
    padding: spacing['6'],
    borderRadius: radius.xl,
    minHeight: layout.card.feature.minHeight,
    ...shadows.lg,
  },
  small: {
    padding: spacing['4'],
    borderRadius: radius.lg,
    minHeight: layout.card.small.minHeight,
    ...shadows.md,
  },
  flat: {
    padding: spacing['4'],
    borderRadius: radius.md,
    ...shadows.none,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
} as const;

// ============================================
// BADGE STYLES
// ============================================
export const badgeStyles = {
  default: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.lighter,
  },
  primary: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: radius.full,
    backgroundColor: Colors.primary.sunset,
  },
  success: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: radius.full,
    backgroundColor: Colors.semantic.success,
  },
  gradient: (_colors: string[]) => ({
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: radius.full,
  }),
} as const;

// ============================================
// CHIP STYLES (Quick Actions)
// ============================================
export const chipStyles = {
  default: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
    ...shadows.sm,
  },
  selected: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    backgroundColor: Colors.primary.sunset,
    ...shadows.md,
  },
} as const;

// ============================================
// EMPTY STATE STYLES
// ============================================
export const emptyState = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['8'],
  },
  iconSize: layout.icon.mega,
  iconColor: Colors.neutral.light,
  titleSize: typography.size['2xl'],
  descriptionSize: typography.size.base,
} as const;

// ============================================
// ICON SYSTEM
// ============================================
/**
 * Icon System
 *
 * Standardized icon configuration for consistent icon usage across the app.
 * All icons should use these tokens instead of hardcoded values.
 *
 * USAGE:
 * import { iconSizes, iconStroke, iconColors } from '@/constants/design-system';
 *
 * <Heart size={iconSizes.action} strokeWidth={iconStroke.standard} color={iconColors.primary} />
 */

/**
 * Icon Sizes - Semantic sizing for different contexts
 *
 * MAPPING GUIDE:
 * - size={12-14} → iconSizes.badge (14px)
 * - size={16} → iconSizes.inline (16px)
 * - size={18} → iconSizes.small (18px)
 * - size={20} → iconSizes.action (20px)
 * - size={24} → iconSizes.navigation (24px)
 * - size={26-28} → iconSizes.header (28px)
 * - size={32} → iconSizes.feature (32px)
 * - size={48} → iconSizes.large (48px)
 * - size={64-80} → iconSizes.empty (64px)
 */
export const iconSizes = {
  /** 14px - Badge icons, small labels, inline annotations */
  badge: 14,
  /** 16px - Inline text icons, chip icons */
  inline: 16,
  /** 18px - Small action icons, button icons */
  small: 18,
  /** 20px - Standard action icons (edit, delete, share) */
  action: 20,
  /** 24px - Navigation icons, close buttons, menu items */
  navigation: 24,
  /** 28px - Header icons, modal titles, prominent actions */
  header: 28,
  /** 32px - Feature card icons, section headers */
  feature: 32,
  /** 48px - Large feature icons, illustrations */
  large: 48,
  /** 64px - Empty state icons, onboarding */
  empty: 64,
  /** 80px - Hero illustrations, splash screens */
  hero: 80,

  // Context-specific sizes
  /** Tab bar icon size (24px - Apple HIG recommendation) */
  tabBar: 24,
  /** Floating action button icon (24px) */
  fab: 24,
  /** Toast notification icon (20px) */
  toast: 20,
  /** Dialog/modal action icon (24px) */
  dialog: 24,
  /** List item icon (20px) */
  listItem: 20,
  /** Card action icon (18px) */
  cardAction: 18,
  /** Input field icon (20px) */
  input: 20,
} as const;

/**
 * Icon Stroke Widths - Consistent stroke weights
 *
 * USAGE BY ROLE:
 * - Parent mode: standard (2) - Friendly, approachable
 * - Professional mode: thin (1.5) - Minimal, professional
 * - Emphasis: bold (2.5) - Important actions
 */
export const iconStroke = {
  /** 1px - Ultra thin, decorative */
  hairline: 1,
  /** 1.5px - Professional/minimal style */
  thin: 1.5,
  /** 2px - Standard weight (default) */
  standard: 2,
  /** 2.5px - Bold, emphasized */
  bold: 2.5,
  /** 3px - Extra bold, attention-grabbing */
  heavy: 3,
} as const;

/**
 * Icon Colors - Semantic color mapping
 *
 * Use these instead of hardcoded color values for icons.
 */
export const iconColors = {
  // Primary colors
  primary: Colors.primary.sunset,
  secondary: Colors.secondary.sky,
  accent: Colors.secondary.lavender,

  // Neutral colors
  dark: Colors.neutral.darkest,
  medium: Colors.neutral.medium,
  light: Colors.neutral.light,
  muted: Colors.neutral.lighter,
  inverted: Colors.neutral.white,

  // Semantic colors
  success: Colors.semantic.success,
  error: Colors.semantic.error,
  warning: Colors.semantic.warning,
  info: Colors.semantic.info,

  // Feature-specific colors
  stories: Colors.secondary.lavender,
  coloring: Colors.secondary.peach,
  analysis: Colors.secondary.sky,
  profile: Colors.secondary.grass,

  // Emotion colors (for mood/emotion icons)
  happy: Colors.secondary.sunshine,
  sad: Colors.secondary.sky,
  angry: Colors.secondary.coral,
  calm: Colors.secondary.grass,
  loved: Colors.secondary.peach,
} as const;

/**
 * Get role-aware stroke width
 * @param isProfessional - Whether user is in professional mode
 */
export const getRoleStrokeWidth = (isProfessional: boolean): number => {
  return isProfessional ? iconStroke.thin : iconStroke.standard;
};

/**
 * Get role-aware icon size (slightly smaller for professional)
 * @param baseSize - Base icon size
 * @param isProfessional - Whether user is in professional mode
 */
export const getRoleIconSize = (baseSize: number, isProfessional: boolean): number => {
  return isProfessional ? Math.round(baseSize * 0.9) : baseSize;
};

// ============================================
// BUTTON SYSTEM (migrated from tokens.ts)
// ============================================
/**
 * Button Variants - Color configurations for different button types
 *
 * USAGE:
 * - primary: Main CTA buttons (Kaydet, Devam Et, Başla)
 * - secondary: Secondary actions (İptal, Geri)
 * - outline: Tertiary actions with border
 * - ghost: Text-only buttons, minimal emphasis
 * - danger: Destructive actions (Sil, Kaldır)
 * - success: Positive confirmations (Onayla, Tamam)
 * - muted: Disabled-looking or low-priority actions
 */
export const buttonVariants = {
  primary: {
    backgroundColor: Colors.primary.sunset,
    color: Colors.neutral.white,
  },
  secondary: {
    backgroundColor: Colors.secondary.sky,
    color: Colors.neutral.white,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: Colors.neutral.medium,
    borderWidth: 1.5,
    color: Colors.neutral.darkest,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: Colors.primary.sunset,
  },
  danger: {
    backgroundColor: Colors.semantic.error,
    color: Colors.neutral.white,
  },
  success: {
    backgroundColor: Colors.secondary.grass,
    color: Colors.neutral.white,
  },
  muted: {
    backgroundColor: Colors.neutral.lighter,
    color: Colors.neutral.dark,
  },
} as const;

/**
 * Button Sizes - Consistent sizing across all button types
 *
 * USAGE GUIDE:
 * - xs: Icon-only buttons, inline actions (28px height)
 * - sm: Secondary actions, compact UI (36px height)
 * - md: Default size, most buttons (44px height - Apple HIG touch target)
 * - lg: Primary CTAs, prominent actions (52px height)
 * - xl: Hero CTAs, onboarding buttons (60px height)
 */
export const buttonSizes = {
  xs: {
    height: 28,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    iconSize: 14,
    borderRadius: radius.sm,
  },
  sm: {
    height: 36,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing.sm,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    iconSize: 16,
    borderRadius: radius.md,
  },
  md: {
    height: 44,
    paddingHorizontal: spacing['5'],
    paddingVertical: spacing['3'],
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    iconSize: 18,
    borderRadius: radius.md,
  },
  lg: {
    height: 52,
    paddingHorizontal: spacing['6'],
    paddingVertical: spacing['4'],
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    iconSize: 20,
    borderRadius: radius.lg,
  },
  xl: {
    height: 60,
    paddingHorizontal: spacing['8'],
    paddingVertical: spacing['5'],
    fontSize: typography.size.lg,
    fontWeight: typography.weight.extrabold,
    iconSize: 24,
    borderRadius: radius.xl,
  },
} as const;

/**
 * Button Styles - Pre-composed style objects for quick application
 */
export const buttonStyles = {
  /** Standard button base styles */
  base: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
  },

  /** Shadow for elevated buttons */
  elevated: shadows.sm,

  /** Shadow for primary/prominent CTAs */
  prominent: shadows.md,

  /** Pressed state opacity */
  pressedOpacity: 0.85,

  /** Disabled state opacity */
  disabledOpacity: 0.5,

  /** Icon button (square) configurations */
  iconButton: {
    xs: { width: 28, height: 28, borderRadius: radius.sm },
    sm: { width: 36, height: 36, borderRadius: radius.md },
    md: { width: 44, height: 44, borderRadius: radius.md },
    lg: { width: 52, height: 52, borderRadius: radius.lg },
  },

  /** Circular button configurations */
  circularButton: {
    xs: { width: 28, height: 28, borderRadius: radius.full },
    sm: { width: 36, height: 36, borderRadius: radius.full },
    md: { width: 44, height: 44, borderRadius: radius.full },
    lg: { width: 52, height: 52, borderRadius: radius.full },
  },

  /** Chip/Tag button styles */
  chip: {
    height: 32,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing.xs,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    borderRadius: radius.full,
  },
} as const;

// ============================================
// SEMANTIC COLORS (For Specific Use Cases)
// ============================================
export const semantic = {
  success: Colors.semantic.success,
  successLight: Colors.semantic.successLight,
  warning: Colors.semantic.warning,
  warningLight: Colors.semantic.warningLight,
  error: Colors.semantic.error,
  errorLight: Colors.semantic.errorLight,
  info: Colors.semantic.info,
  infoLight: Colors.semantic.infoLight,
  risk: Colors.special.risk,
} as const;

// ============================================
// TYPE HELPERS
// ============================================
export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

export default {
  layout,
  typography,
  spacing,
  radius,
  borderRadius,
  shadows,
  createShadow,
  textShadows,
  createTextShadow,
  animation,
  glassmorphism,
  claymorphism,
  neumorphism,
  zIndex,
  interaction,
  cardVariants,
  badgeStyles,
  chipStyles,
  emptyState,
  iconSizes,
  iconStroke,
  iconColors,
  getRoleStrokeWidth,
  getRoleIconSize,
  buttonVariants,
  buttonSizes,
  buttonStyles,
  semantic,
};
