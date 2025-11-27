/**
 * Design tokens following 8pt grid system
 * Inspired by Apple HIG, Material Design, and modern app best practices
 */

import { Platform } from 'react-native';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 9999,
} as const;

export const animations = {
  // Duration in milliseconds
  fast: 200,
  normal: 300,
  slow: 400,
  slower: 600,

  // Easing curves
  easing: {
    standard: { tension: 40, friction: 7 },
    gentle: { tension: 30, friction: 8 },
    bouncy: { tension: 50, friction: 7 },
  },
} as const;

export const shadows = Platform.select({
  web: {
    sm: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    },
    md: {
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
    },
    lg: {
      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
    },
    xl: {
      boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.25)',
    },
  },
  default: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
  },
})!;

// Typography scale - fixed sizes work better across devices
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
    xxl: 30,
    xxxl: 36,
    hero: 48,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

export const layout = {
  // Minimum touch target (Apple HIG: 44pt minimum)
  minTouchTarget: 44,

  // Icon sizes (will be calculated in components)
  iconSize: {
    sm: 56,
    md: 96,
    lg: 132,
  },
} as const;

export const colors = {
  // MasalBak Brand Colors - "Gün Batımı Bahçesi" teması
  brand: {
    primary: '#FF9B7A',      // Yumuşak turuncu-pembe (ana aksiyon)
    secondary: '#78C8E8',    // Gökyüzü mavisi (güven, sakinlik)
    accent: '#FFD56B',       // Güneş sarısı (enerji, neşe)
    success: '#7ED99C',      // Çimen yeşili (büyüme, başarı)
    premium: '#A78BFA',      // Lavanta (yaratıcılık, premium)
  },

  // Gradient setleri - MasalBak temalı
  gradients: {
    // Ana tema - Yumuşak gün batımı (turuncu-pembe-krem)
    primary: ['#FF9B7A', '#FFB299', '#FFC4B0'],

    // Sıcak ve enerjik - Turuncu-sarı (kayıt ekranı için ideal)
    warm: ['#FF9B7A', '#FFB55F', '#FFD56B'],

    // Sakin ve güvenli - Mavi-yeşil (profil, ayarlar için)
    calm: ['#78C8E8', '#7ED99C', '#A8E8BA'],

    // Yaratıcı ve eğlenceli - Pembe-mor (hikaye, yaratıcılık için)
    creative: ['#FFB299', '#E9B8F7', '#C4B5FD'],

    // Gün batımı gökyüzü - Turuncu-pembe-mor (premium özellikler)
    sunset: ['#FF9B7A', '#FFB299', '#E9B8F7', '#C4B5FD'],

    // Bahçe - Yeşil-sarı (doğa, öğrenme için)
    garden: ['#7ED99C', '#A8E8BA', '#FFD56B'],

    // Okyanus - Mavi tonları (analiz, veri için)
    ocean: ['#4FB3D4', '#78C8E8', '#A3DBF0'],

    // Orman - Yeşil tonları (doğa, sakinlik için)
    forest: ['#7ED99C', '#6BC798', '#5AB594'],
  },

  // Opacity variants (beyaz overlay'ler için)
  opacity: {
    subtle: 0.1,
    light: 0.15,
    medium: 0.25,
    strong: 0.4,
  },
} as const;

export const haptics = {
  // Haptic feedback types for different interactions
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'notificationSuccess',
  warning: 'notificationWarning',
  error: 'notificationError',
  selection: 'selection',
  impactLight: 'impactLight',
  impactMedium: 'impactMedium',
  impactHeavy: 'impactHeavy',
} as const;
