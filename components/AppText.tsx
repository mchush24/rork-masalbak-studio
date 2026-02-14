/**
 * AppText — Renkioo Typography Component
 *
 * Dünya standartlarında tipografi sistemi.
 * Apple HIG, Material Design 3 ve Airbnb Cereal'dan ilham alındı.
 *
 * KULLANIM:
 *   <AppText variant="headlineMedium">Bölüm Başlığı</AppText>
 *   <AppText variant="bodyMedium" color="secondary">Açıklama metni</AppText>
 *   <AppText variant="labelLarge" color="accent">BUTON</AppText>
 *   <AppText variant="displayLarge">Hoş Geldin</AppText>
 *
 * VARIANT HİYERARŞİSİ:
 *   display  → Fredoka (oyunsu, büyük başlıklar, splash, maskot)
 *   headline → Plus Jakarta Sans Bold (sayfa/bölüm başlıkları)
 *   title    → Plus Jakarta Sans Semibold (kart başlıkları, app bar)
 *   body     → Plus Jakarta Sans Regular (ana içerik)
 *   label    → Plus Jakarta Sans Medium/Semibold (butonlar, etiketler)
 *   caption  → Plus Jakarta Sans Regular (zaman damgaları, metadata)
 *   overline → Plus Jakarta Sans Semibold (bölüm etiketleri, BÜYÜK HARF)
 *
 * RENK SEÇENEKLERİ:
 *   primary   → Ana metin rengi (varsayılan)
 *   secondary → İkincil metin
 *   tertiary  → Soluk/ipucu metni
 *   inverse   → Koyu arka plan üzerinde beyaz metin
 *   accent    → Vurgu rengi (mor)
 *   error     → Hata mesajları
 *   success   → Başarı mesajları
 *   warning   → Uyarı mesajları
 *   muted     → Çok soluk metin
 *
 * ÖNEMLİ:
 *   - fontWeight KULLANMAYIN — fontFamily içinde weight zaten tanımlı
 *   - fontWeight + fontFamily birlikte kullanmak iOS'ta system font'a düşürür
 *   - Tüm weight'ler fontFamily üzerinden yönetilir
 */

import React, { useMemo } from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { typography } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Semantic typography variants
 *
 * 5 rol × 3 boyut + 2 özel = 17 variant
 * Her variant: fontFamily + fontSize + lineHeight + letterSpacing içerir
 */
export type TextVariant =
  // Display — Fredoka, hero/splash/mascot konuşmaları
  | 'displayLarge' // 48px — Splash ekranı, onboarding hero
  | 'displayMedium' // 40px — Feature highlight, büyük başlık
  | 'displaySmall' // 32px — Bölüm hero, maskot konuşması
  // Headline — Jakarta Bold, sayfa/bölüm başlıkları
  | 'headlineLarge' // 28px — Sayfa başlıkları
  | 'headlineMedium' // 24px — Bölüm başlıkları
  | 'headlineSmall' // 20px — Alt bölüm başlıkları
  // Title — Jakarta Semibold/Medium, kart/bileşen başlıkları
  | 'titleLarge' // 20px — Kart başlıkları, app bar
  | 'titleMedium' // 17px — Liste öğesi başlıkları
  | 'titleSmall' // 15px — Küçük başlıklar, tab etiketleri
  // Body — Jakarta Regular, ana içerik
  | 'bodyLarge' // 17px — Öne çıkan paragraflar
  | 'bodyMedium' // 15px — Varsayılan gövde metni
  | 'bodySmall' // 13px — İkincil içerik
  // Label — Jakarta Medium/Semibold, butonlar/etiketler
  | 'labelLarge' // 15px — Butonlar, CTA'lar
  | 'labelMedium' // 13px — Etiketler, rozetler
  | 'labelSmall' // 11px — Küçük rozetler, sayaçlar
  // Special
  | 'caption' // 12px — Zaman damgaları, metadata
  | 'overline'; // 11px — Bölüm etiketleri (genelde BÜYÜK HARF)

/**
 * Semantic text colors
 */
export type TextColor =
  | 'primary' // Ana metin — #2D3748
  | 'secondary' // İkincil metin — #4A5568
  | 'tertiary' // Soluk metin — #718096
  | 'inverse' // Beyaz (koyu arka plan üzerinde)
  | 'accent' // Vurgu moru — #A78BFA
  | 'error' // Hata kırmızısı
  | 'success' // Başarı yeşili
  | 'warning' // Uyarı turuncusu
  | 'muted'; // Çok soluk metin

// ============================================
// PROPS
// ============================================

export interface AppTextProps extends RNTextProps {
  /** Typography variant — determines font, size, line height, letter spacing */
  variant?: TextVariant;
  /** Semantic text color */
  color?: TextColor;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Bumps font weight one step up for emphasis */
  bold?: boolean;
  /** Transforms text to uppercase with wider letter spacing */
  uppercase?: boolean;
  children: React.ReactNode;
}

// ============================================
// VARIANT STYLES
// ============================================

/**
 * Pre-computed variant styles using StyleSheet.create
 *
 * Line height rationale (Apple HIG + MD3 best practices):
 *   Display (48-32px): 1.17-1.25× — büyük metin sıkı olmalı
 *   Headline (28-20px): 1.29-1.40× — başlıklar kompakt ama okunabilir
 *   Title (20-15px):    1.40-1.47× — geçiş bölgesi
 *   Body (17-13px):     1.53-1.60× — WCAG minimum 1.5× paragraf için
 *   Label (15-11px):    1.33-1.45× — UI elemanları kompakt
 *
 * Letter spacing rationale (MD3):
 *   Büyük metin: negatif (sıkıştır, görsel uyum)
 *   Küçük metin: pozitif (aç, okunabilirlik)
 */
const variantStyles = StyleSheet.create({
  // ── Display — Fredoka ──────────────────────────────────────
  displayLarge: {
    fontFamily: typography.family.displayBold,
    fontSize: 48,
    lineHeight: 56, // 1.17×
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontFamily: typography.family.displaySemibold,
    fontSize: 40,
    lineHeight: 48, // 1.20×
    letterSpacing: -0.5,
  },
  displaySmall: {
    fontFamily: typography.family.displayMedium,
    fontSize: 32,
    lineHeight: 40, // 1.25×
    letterSpacing: -0.25,
  },

  // ── Headline — Plus Jakarta Sans Bold ──────────────────────
  headlineLarge: {
    fontFamily: typography.family.bold,
    fontSize: 28,
    lineHeight: 36, // 1.29×
    letterSpacing: -0.25,
  },
  headlineMedium: {
    fontFamily: typography.family.bold,
    fontSize: 24,
    lineHeight: 32, // 1.33×
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: typography.family.semibold,
    fontSize: 20,
    lineHeight: 28, // 1.40×
    letterSpacing: 0,
  },

  // ── Title — Plus Jakarta Sans Semibold/Medium ──────────────
  titleLarge: {
    fontFamily: typography.family.semibold,
    fontSize: 20,
    lineHeight: 28, // 1.40×
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: typography.family.semibold,
    fontSize: 17,
    lineHeight: 24, // 1.41×
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: typography.family.medium,
    fontSize: 15,
    lineHeight: 22, // 1.47×
    letterSpacing: 0.1,
  },

  // ── Body — Plus Jakarta Sans Regular ───────────────────────
  bodyLarge: {
    fontFamily: typography.family.regular,
    fontSize: 17,
    lineHeight: 26, // 1.53×
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontFamily: typography.family.regular,
    fontSize: 15,
    lineHeight: 24, // 1.60×
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: typography.family.regular,
    fontSize: 13,
    lineHeight: 20, // 1.54×
    letterSpacing: 0.4,
  },

  // ── Label — Plus Jakarta Sans Medium/Semibold ──────────────
  labelLarge: {
    fontFamily: typography.family.semibold,
    fontSize: 15,
    lineHeight: 20, // 1.33×
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: typography.family.medium,
    fontSize: 13,
    lineHeight: 18, // 1.38×
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: typography.family.medium,
    fontSize: 11,
    lineHeight: 16, // 1.45×
    letterSpacing: 0.5,
  },

  // ── Special ────────────────────────────────────────────────
  caption: {
    fontFamily: typography.family.regular,
    fontSize: 12,
    lineHeight: 16, // 1.33×
    letterSpacing: 0.4,
  },
  overline: {
    fontFamily: typography.family.semibold,
    fontSize: 11,
    lineHeight: 16, // 1.45×
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});

// ============================================
// BOLD FAMILY MAP
// ============================================

/**
 * Bold prop her variant'ın fontFamily'sini bir adım yukarı taşır.
 * Örnek: bodyMedium (regular) → bold ile semibold olur.
 */
const boldFamilyMap: Record<TextVariant, string> = {
  // Display — Fredoka
  displayLarge: typography.family.displayBold, // zaten bold
  displayMedium: typography.family.displayBold, // semibold → bold
  displaySmall: typography.family.displaySemibold, // medium → semibold
  // Headline — Jakarta
  headlineLarge: typography.family.extrabold, // bold → extrabold
  headlineMedium: typography.family.extrabold, // bold → extrabold
  headlineSmall: typography.family.bold, // semibold → bold
  // Title — Jakarta
  titleLarge: typography.family.bold, // semibold → bold
  titleMedium: typography.family.bold, // semibold → bold
  titleSmall: typography.family.semibold, // medium → semibold
  // Body — Jakarta
  bodyLarge: typography.family.semibold, // regular → semibold
  bodyMedium: typography.family.semibold, // regular → semibold
  bodySmall: typography.family.semibold, // regular → semibold
  // Label — Jakarta
  labelLarge: typography.family.bold, // semibold → bold
  labelMedium: typography.family.semibold, // medium → semibold
  labelSmall: typography.family.semibold, // medium → semibold
  // Special
  caption: typography.family.medium, // regular → medium
  overline: typography.family.bold, // semibold → bold
};

// ============================================
// COLOR MAP
// ============================================

const textColorMap: Record<TextColor, string> = {
  primary: Colors.text.primary, // #2D3748
  secondary: Colors.text.secondary, // #4A5568
  tertiary: Colors.text.tertiary, // #718096
  inverse: Colors.text.inverse, // #FFFFFF
  accent: Colors.secondary.lavender, // #A78BFA
  error: Colors.semantic.error, // #FF8A80
  success: Colors.semantic.success, // #68D89B
  warning: Colors.semantic.warning, // #FFB55F
  muted: 'rgba(45, 55, 72, 0.6)', // primary @ 60% opacity
};

// ============================================
// HEADER VARIANTS (for accessibility)
// ============================================

const headerVariants = new Set<TextVariant>([
  'displayLarge',
  'displayMedium',
  'displaySmall',
  'headlineLarge',
  'headlineMedium',
  'headlineSmall',
]);

// ============================================
// COMPONENT
// ============================================

/**
 * AppText — Renkioo'nun birleşik tipografi bileşeni
 *
 * @example
 * // Temel kullanım
 * <AppText variant="headlineMedium">Çizim Analizi</AppText>
 *
 * // Renkli metin
 * <AppText variant="bodyMedium" color="secondary">
 *   Çocuğunuzun çizimi başarıyla analiz edildi.
 * </AppText>
 *
 * // Vurgulu metin
 * <AppText variant="bodyMedium" bold>Önemli bilgi</AppText>
 *
 * // Büyük harf etiket
 * <AppText variant="labelMedium" uppercase color="accent">YENİ</AppText>
 *
 * // Satır içi kalın metin
 * <AppText variant="bodyMedium">
 *   Normal metin <AppText variant="bodyMedium" bold>kalın metin</AppText> devam.
 * </AppText>
 */
export function AppText({
  variant = 'bodyMedium',
  color = 'primary',
  align,
  bold,
  uppercase,
  style,
  children,
  accessibilityRole,
  ...rest
}: AppTextProps) {
  // Compose the style array
  const composedStyle = useMemo<TextStyle[]>(() => {
    const styles: TextStyle[] = [variantStyles[variant]];

    // Color
    styles.push({ color: textColorMap[color] });

    // Bold override
    if (bold) {
      styles.push({ fontFamily: boldFamilyMap[variant] });
    }

    // Alignment
    if (align) {
      styles.push({ textAlign: align });
    }

    // Uppercase
    if (uppercase) {
      styles.push({
        textTransform: 'uppercase',
        letterSpacing: (variantStyles[variant] as TextStyle).letterSpacing! + 1,
      });
    }

    return styles;
  }, [variant, color, bold, align, uppercase]);

  // Auto accessibility role for heading variants
  const resolvedRole = accessibilityRole ?? (headerVariants.has(variant) ? 'header' : undefined);

  return (
    <RNText style={[composedStyle, style]} accessibilityRole={resolvedRole} {...rest}>
      {children}
    </RNText>
  );
}

// ============================================
// EXPORTS
// ============================================

/** Re-export variant styles for direct StyleSheet composition */
export { variantStyles as textVariants };

/** Re-export color map for custom usage */
export { textColorMap };

export default AppText;
