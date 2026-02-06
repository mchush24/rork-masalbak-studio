/**
 * RenkiOO Renk Paleti - "Renkli Bahçe" Skin
 *
 * Çocuk uygulaması için canlı, eğlenceli ve renkli tasarım
 * - Gradient arka planlar
 * - Renkli kartlar
 * - Glassmorphism efektleri
 * - Sulu boya geçişleri
 */

/**
 * RENKİOO Color System - "2035 Organic Biomimicry"
 * High-end Glassmorphism with Fluid Gradients
 * Dream Guardian Mascot: Ioo (I + oo = Star + Eyes)
 */
// Ethereal Color Palette - Dreamy, luminescent, otherworldly
export const EtherealColors = {
  // Core ethereal colors - soft, glowing pastels
  core: {
    moonlight: '#F0F4FF',      // Soft silvery blue
    stardust: '#E8E0F0',       // Pale lavender with shimmer
    aurora: '#E0F5F0',         // Mint with ethereal glow
    nebula: '#F5E0F0',         // Soft pink-purple
    celestial: '#E8F0FF',      // Light sky blue
    twilight: '#E0E8F5',       // Dusk blue-purple
  },

  // Luminescent accents - glowing highlights
  glow: {
    soft: 'rgba(255, 255, 255, 0.6)',
    medium: 'rgba(255, 255, 255, 0.8)',
    bright: 'rgba(255, 255, 255, 0.95)',
    moonbeam: 'rgba(240, 244, 255, 0.9)',
    starshine: 'rgba(255, 248, 240, 0.85)',
  },

  // Iridescent shimmer colors
  shimmer: {
    pearl: ['#FFFFFF', '#F0F4FF', '#FFE8F0', '#E8FFF0'] as const,
    opal: ['#E8F0FF', '#F0E8FF', '#FFE8F0', '#E8FFF5'] as const,
    crystal: ['#FFFFFF', '#F8F0FF', '#FFF0F8', '#F0FFF8'] as const,
  },

  // Ethereal gradients - dreamy transitions
  gradients: {
    moonrise: ['#F0F4FF', '#E8E0F0', '#F5E0F0'] as const,
    starfall: ['#E8F0FF', '#F0E8FF', '#FFE8F5'] as const,
    dreamscape: ['#F0F4FF', '#E0F5F0', '#F5E0F0', '#E8F0FF'] as const,
    aurora: ['#E0F5F0', '#E8E0F0', '#F0E8FF', '#E8F0FF'] as const,
    twilightSky: ['#E0E8F5', '#E8E0F0', '#F5E0F0'] as const,
    celestialDawn: ['#FFF8F0', '#F0F4FF', '#E8E0F0'] as const,
  },

  // Translucent overlays
  veil: {
    light: 'rgba(240, 244, 255, 0.4)',
    medium: 'rgba(232, 224, 240, 0.5)',
    deep: 'rgba(224, 232, 245, 0.6)',
  },

  // Ethereal shadows - soft and diffused
  shadows: {
    soft: 'rgba(200, 210, 230, 0.2)',
    medium: 'rgba(180, 190, 220, 0.3)',
    deep: 'rgba(160, 170, 200, 0.4)',
    glow: 'rgba(240, 244, 255, 0.5)',
  },
} as const;

export const RenkooColors = {
  // Brand Gradients - Dream Palette
  brand: {
    // Primary dream colors
    dreamLavender: '#E8D5FF',
    dreamPeach: '#FFCBA4',
    dreamRose: '#FFD6E0',
    dreamMint: '#B8F4E8',
    dreamCream: '#FFF8F0',
    // Accent colors
    jellyPurple: '#B98EFF',
    jellyPink: '#FF9EBF',
    starGold: '#FFD93D',
    // Legacy support
    jellyCyan: '#00F5FF',
    jellyMint: '#70FFD6',
    jellyPeach: '#FFCBA4',
    jellyLavender: '#E8D5FF',
  },

  // Rainbow Accents
  accents: {
    solarYellow: '#FFD93D',
    coral: '#FF6B6B',
    teal: '#4ECDC4',
    sky: '#45B7D1',
    sage: '#96CEB4',
  },

  // Holographic / Iridescent Colors
  holographic: {
    primary: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#B98EFF'] as const,
    secondary: ['#FFB6C1', '#FFDAB9', '#E0FFFF', '#DDA0DD', '#F0E68C'] as const,
    shimmer: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.4)'] as const,
    rainbow: ['#FF6B6B', '#FFE66D', '#70FFD6', '#00F5FF', '#B98EFF', '#FF9EBF'] as const,
  },

  // Backgrounds
  backgrounds: {
    light: '#F7F9FC',
    dark: '#1E2235',
    dreamy: '#F0F7FF',
    warmGlow: '#FFF8F0',
  },

  // Glass System (RGBA strings for CSS-like usage)
  glass: {
    surface: 'rgba(255, 255, 255, 0.65)',
    surfaceLight: 'rgba(255, 255, 255, 0.85)',
    surfaceDark: 'rgba(255, 255, 255, 0.45)',
    border: 'rgba(255, 255, 255, 0.40)',
    borderStrong: 'rgba(255, 255, 255, 0.60)',
    shadow: 'rgba(30, 34, 53, 0.15)',
    shadowSoft: 'rgba(30, 34, 53, 0.08)',
  },

  // Gradient Presets for LinearGradient
  gradients: {
    // Primary dream gradient (Lavender → Peach)
    jellyPrimary: ['#B98EFF', '#FFCBA4'] as const,
    // Secondary dream gradient (Rose → Mint)
    jellySecondary: ['#FFD6E0', '#B8F4E8'] as const,
    // Background gradient (Cream → Lavender → Rose)
    background: ['#FFF8F0', '#F5E8FF', '#FFE8F0'] as const,
    // Full aurora sunset
    sunset: ['#FFD93D', '#FFCBA4', '#FFD6E0', '#B98EFF'] as const,
    // Immersive home screen gradient - Dream sky
    homeScreen: ['#FFF8F0', '#F5E8FF', '#FFE8F5', '#E8FFF5'] as const,
    // Dreamy aurora pastel
    dreamy: ['#FFF8F0', '#E8D5FF', '#FFD6E0', '#B8F4E8'] as const,
    // Holographic card backgrounds
    holoCard: ['#FFFFFF', '#FFF8F5', '#F8F0FF', '#F5FFFA'] as const,
    // Emotion analysis gradient
    emotion: ['#B8F4E8', '#E8D5FF', '#FFD6E0', '#FFCBA4'] as const,
    // Chat/dialogue gradient - Ioo's conversation
    chat: ['#FFF8F0', '#F5E8FF', '#FFE8F5'] as const,
    // Reward/achievement gradient - Star celebration
    reward: ['#FFD93D', '#FFCBA4', '#FFD6E0', '#B98EFF'] as const,
    // Journey/progress gradient
    journey: ['#B8F4E8', '#E8D5FF', '#FFCBA4', '#FFD93D'] as const,
    // Ioo special gradients
    iooGlow: ['#E8D5FF', '#FFCBA4', '#FFD6E0'] as const,
    iooStar: ['#FFD93D', '#FFF5CC', '#FFEB99'] as const,
  },

  // Text Colors
  text: {
    primary: '#1E2235',
    secondary: '#5A5F7A',
    tertiary: '#8A8FA5',
    light: '#FFFFFF',
    muted: 'rgba(30, 34, 53, 0.6)',
    accent: '#B98EFF',
  },

  // Mascot Colors (Ioo - Dream Guardian)
  mascot: {
    // Body - Soft cream/marshmallow cloud
    body: ['#FFF8F0', '#FFE8D6', '#F5DFD0', '#E8CFC0'] as const,
    bodyGlow: '#FFCBA4',
    highlight: '#FFFFFF',
    shadow: 'rgba(232, 207, 192, 0.4)',
    shadowStrong: 'rgba(232, 207, 192, 0.6)',
    // Eye colors - dual tone (lavender + coral)
    eyeLeft: '#9B7FFF',
    eyeRight: '#FF9B8A',
    // Star crown
    star: '#FFD93D',
    starGlow: 'rgba(255, 217, 61, 0.5)',
    // Cheeks
    cheeks: '#FFB5C5',
    // Glow aura colors
    glow: ['#E8D5FF', '#FFCBA4', '#B8F4E8', '#FFD6E0'] as const,
  },

  // Feature Card Colors (new style)
  featureCards: {
    analysis: {
      gradient: ['#E8FFF5', '#E0FFFF'] as const,
      border: '#70FFD6',
      icon: '#4ECDC4',
    },
    chat: {
      gradient: ['#F0F7FF', '#E8F4FF'] as const,
      border: '#45B7D1',
      icon: '#00C8E8',
    },
    story: {
      gradient: ['#FFF5E6', '#FFFAF0'] as const,
      border: '#FFD93D',
      icon: '#FFB347',
    },
    emotion: {
      gradient: ['#F5E8FF', '#FFE8F5'] as const,
      border: '#B98EFF',
      icon: '#9B6DFF',
    },
    reward: {
      gradient: ['#FFF0F5', '#FFFACD'] as const,
      border: '#FFB6C1',
      icon: '#FF69B4',
    },
    coloring: {
      gradient: ['#E8FFF5', '#F0FFFF'] as const,
      border: '#70FFD6',
      icon: '#00CED1',
    },
  },
} as const;

// Type exports for RenkooColors
export type RenkooColorKeys = keyof typeof RenkooColors;
export type RenkooBrandColors = typeof RenkooColors.brand;
export type RenkooGlassColors = typeof RenkooColors.glass;
export type RenkooGradientPresets = typeof RenkooColors.gradients;

export const Colors = {
  // Ana Marka Renkleri - "Gün Batımı" teması
  primary: {
    // Yumuşak turuncu-pembe (ana aksiyon rengi)
    sunset: "#FF9B7A",       // Ana buton ve vurgular için
    peach: "#FFB299",        // Hover ve açık tonlar
    blush: "#FFC4B0",        // Çok açık ton, arka planlar için
    soft: "#FFF5F2",         // Çok yumuşak arka plan
  },

  // İkincil Renkler - "Bahçe" teması
  secondary: {
    // Gökyüzü mavisi (sakinlik, güven)
    sky: "#78C8E8",          // Bilgi ve nötr aksiyonlar
    skyLight: "#A3DBF0",     // Açık ton

    // Çimenlik yeşili (büyüme, öğrenme)
    grass: "#7ED99C",        // Başarı ve pozitif geri bildirim
    grassLight: "#A8E8BA",   // Açık ton

    // Lavanta (yaratıcılık, hayal gücü)
    lavender: "#A78BFA",     // Özel özellikler ve premium
    lavenderLight: "#C4B5FD", // Açık ton

    // Güneş sarısı (enerji, neşe)
    sunshine: "#FFD56B",     // Dikkat çekici ama yumuşak
    sunshineLight: "#FFE49B", // Açık ton

    // Pembe (sevgi, masal)
    rose: "#FFB5D8",         // Masal ve hikaye
    roseLight: "#FFD6ED",    // Açık ton

    // Turkuaz (yenilik, teknoloji)
    mint: "#6FEDD6",         // Boyama, yaratıcılık
    mintLight: "#A3F5E8",    // Açık ton
  },

  // Nötr Tonlar - WCAG AA uyumlu
  neutral: {
    darkest: "#2D3748",      // Ana metin (kontrast: 12.6:1)
    dark: "#4A5568",         // İkincil metin (kontrast: 8.3:1)
    medium: "#718096",       // Yardımcı metin (kontrast: 5.1:1)
    light: "#A0AEC0",        // Devre dışı metin
    lighter: "#E2E8F0",      // Kenarlıklar
    lightest: "#F7FAFC",     // Arka plan
    white: "#FFFFFF",        // Beyaz
  },

  // Arka Plan Renkleri - Gradient & Solid
  background: {
    // Ana arka planlar - GRADIENT
    primary: "#FFFBF8",      // Fallback solid renk

    // Ekran bazlı gradient'ler
    studio: ["#FFF5F2", "#FFE8F5", "#F5F3FF"] as const,      // Pembe-mor geçişi
    stories: ["#FFF9E6", "#FFE8CC", "#FFD6A3"] as const,     // Sarı-turuncu geçişi
    analysis: ["#E8F4FD", "#D6ECFF", "#C2E0FF"] as const,    // Mavi geçişi
    profile: ["#F0FDF4", "#DCFCE7", "#BBF7D0"] as const,     // Yeşil geçişi

    // Kart arka planları - Hafif renkli
    card: "#FFFFFF",         // Beyaz kart (varsayılan)
    cardTinted: "rgba(255, 255, 255, 0.7)", // Yarı saydam beyaz (glassmorphism)
  },

  // Semantik Renkler (Geri Bildirim)
  semantic: {
    // Başarı - Yumuşak yeşil
    success: "#68D89B",
    successLight: "#9EE7B7",
    successBg: "#F0FDF6",

    // Uyarı - Sıcak turuncu
    warning: "#FFB55F",
    warningLight: "#FFC98F",
    warningBg: "#FFF8EF",

    // Hata - Yumuşak kırmızı
    error: "#FF8A80",
    errorLight: "#FFB0A8",
    errorBg: "#FFF5F5",

    // Bilgi - Gökyüzü mavisi
    info: "#78C8E8",
    infoLight: "#A3DBF0",
    infoBg: "#F0F9FF",
  },

  // Özel Durumlar
  special: {
    // Travma/Risk seviyeleri
    risk: {
      low: "#DBEAFE",
      lowBorder: "#3B82F6",
      medium: "#FEF3C7",
      mediumBorder: "#F59E0B",
      high: "#FED7AA",
      highBorder: "#EA580C",
      urgent: "#FEE2E2",
      urgentBorder: "#DC2626",
    },

    // Premium özellikler
    premium: "#A78BFA",
    premiumGradient: ["#A78BFA", "#C4B5FD", "#E9D5FF"],
  },

  // Gradient Setleri - Ekstra Zengin
  gradients: {
    // Ana tema - Gün batımı
    primary: ["#FF9B7A", "#FFB299", "#FFC4B0"],

    // Sıcak ve enerjik - Turuncu-sarı
    warm: ["#FF9B7A", "#FFB55F", "#FFD56B"],

    // Sakin ve güvenli - Mavi-yeşil
    calm: ["#78C8E8", "#7ED99C", "#A8E8BA"],

    // Yaratıcı ve eğlenceli - Pembe-mor
    creative: ["#FFB299", "#FFB5D8", "#C4B5FD"],

    // Gün batımı gökyüzü - Turuncu-pembe-mor
    sunset: ["#FF9B7A", "#FFB5D8", "#C4B5FD"],

    // Bahçe - Yeşil-sarı
    garden: ["#7ED99C", "#A8E8BA", "#FFD56B"],

    // Okyanus - Mavi tonları
    ocean: ["#4FB3D4", "#78C8E8", "#A3DBF0"],

    // Gökkuşağı - Tam spektrum
    rainbow: ["#FF9B7A", "#FFD56B", "#7ED99C", "#78C8E8", "#A78BFA", "#FFB5D8"],

    // Lavanta alanı - Mor-pembe
    lavender: ["#C4B5FD", "#E9D5FF", "#FCE7F3"],

    // Şafak - Turuncu-pembe-sarı
    dawn: ["#FFA07A", "#FFB5D8", "#FFE49B"],

    // Orman - Yeşil tonları
    forest: ["#7ED99C", "#A8E8BA", "#BBF7D0"],

    // Deniz - Turkuaz-mavi
    sea: ["#6FEDD6", "#78C8E8", "#A3DBF0"],

    // PROFESSIONAL THEME - Yetişkinler için
    // Profesyonel mavi - Güven ve uzmanlık
    professional: ["#2E5266", "#4A7C9D", "#6EA8C6"],

    // Bilimsel yeşil - Analiz ve gelişim
    scientific: ["#5A7A6A", "#7D9C8E", "#A8C5B5"],

    // Premium mor - Kalite ve teknoloji
    expertise: ["#5D4E7C", "#7D6B9D", "#9E8FBF"],

    // Sıcak nötr - Erişilebilir ve profesyonel
    accessible: ["#7B6B5D", "#9D8B7D", "#BFAB9E"],

    // Canlı ve enerjik - Onboarding ekranları için
    vibrant: ["#6366F1", "#8B5CF6", "#A855F7"],
  },

  // Kart Renkleri - Özellik bazlı
  cards: {
    // Her özellik için özel renk kodlaması
    story: {
      bg: ["#FFF9E6", "#FFE8CC"] as const,           // Sarı gradient
      border: "#FFD56B",
      icon: "#FF9B7A",
    },
    analysis: {
      bg: ["#E8F4FD", "#D6ECFF"] as const,           // Mavi gradient
      border: "#78C8E8",
      icon: "#A78BFA",
    },
    coloring: {
      bg: ["#F0FDF4", "#DCFCE7"] as const,           // Yeşil gradient
      border: "#7ED99C",
      icon: "#6FEDD6",
    },
    premium: {
      bg: ["#F5F3FF", "#EDE9FE"] as const,           // Mor gradient
      border: "#A78BFA",
      icon: "#9333EA",
    },
  },
};

// ============================================================================
// DARK MODE COLOR SYSTEM
// Ethereal dark palette preserving the dreamy feel
// WCAG AA compliant contrast ratios
// ============================================================================

export const DarkColors = {
  // Ana Marka Renkleri - Dark mode "Gece Gökyüzü" teması
  primary: {
    sunset: "#FF9B7A",        // Retain brand color for consistency
    peach: "#FFAA8D",         // Slightly lighter for dark bg
    blush: "#FFB8A0",         // Warm glow
    soft: "#2A2235",          // Dark soft purple background
  },

  // İkincil Renkler - Dark mode için parlaklık artırıldı
  secondary: {
    sky: "#8AD4F0",           // Brighter blue for dark mode
    skyLight: "#B0E5FF",

    grass: "#8FE8AD",         // Brighter green
    grassLight: "#B5F0C8",

    lavender: "#B89EFF",      // Brighter lavender
    lavenderLight: "#D4C5FF",

    sunshine: "#FFE085",      // Brighter yellow
    sunshineLight: "#FFEBA8",

    rose: "#FFC5E8",          // Brighter pink
    roseLight: "#FFE0F5",

    mint: "#80F5E0",          // Brighter mint
    mintLight: "#B0FFF0",
  },

  // Nötr Tonlar - Dark mode (WCAG AA uyumlu)
  neutral: {
    darkest: "#F5F5F7",       // Ana metin (beyaza yakın)
    dark: "#E0E0E5",          // İkincil metin
    medium: "#A0A5B5",        // Yardımcı metin
    light: "#6B7085",         // Devre dışı metin
    lighter: "#3D4055",       // Kenarlıklar
    lightest: "#252835",      // Arka plan (kartlar)
    white: "#1A1D28",         // En koyu (ana arka plan)
  },

  // Arka Plan Renkleri - Dark Ethereal
  background: {
    primary: "#12141D",       // Ana arka plan - gece mavisi

    // Ekran bazlı gradient'ler - Dark mode
    studio: ["#1F1525", "#1A1228", "#151025"] as const,
    stories: ["#251A15", "#201510", "#1A1008"] as const,
    analysis: ["#151D25", "#101820", "#0A1318"] as const,
    profile: ["#152518", "#102015", "#081A0D"] as const,

    // Kart arka planları
    card: "#1E2130",
    cardTinted: "rgba(30, 33, 48, 0.85)",
  },

  // Semantik Renkler - Dark mode (parlaklık artırıldı)
  semantic: {
    success: "#7BE8AA",
    successLight: "#152A1D",
    successBg: "#0D1A12",

    warning: "#FFC070",
    warningLight: "#2A200D",
    warningBg: "#1A1508",

    error: "#FF9590",
    errorLight: "#2A1515",
    errorBg: "#1A0D0D",

    info: "#8AD4F0",
    infoLight: "#152535",
    infoBg: "#0D1A25",
  },

  // Özel Durumlar - Dark mode
  special: {
    risk: {
      low: "#1A2538",
      lowBorder: "#5A8AF0",
      medium: "#2A2515",
      mediumBorder: "#FFB040",
      high: "#2A1D12",
      highBorder: "#FF8A50",
      urgent: "#2A1515",
      urgentBorder: "#FF6565",
    },

    premium: "#B89EFF",
    premiumGradient: ["#B89EFF", "#D4C5FF", "#E9DDFF"],
  },

  // Gradient Setleri - Dark Ethereal
  gradients: {
    primary: ["#FF9B7A", "#FF8A65", "#FF7A50"],
    warm: ["#FF9B7A", "#FFC070", "#FFE085"],
    calm: ["#8AD4F0", "#8FE8AD", "#B5F0C8"],
    creative: ["#FFAA8D", "#FFC5E8", "#D4C5FF"],
    sunset: ["#FF9B7A", "#FFC5E8", "#D4C5FF"],
    garden: ["#8FE8AD", "#B5F0C8", "#FFE085"],
    ocean: ["#60C0E0", "#8AD4F0", "#B0E5FF"],
    rainbow: ["#FF9B7A", "#FFE085", "#8FE8AD", "#8AD4F0", "#B89EFF", "#FFC5E8"],
    lavender: ["#D4C5FF", "#E9DDFF", "#FFE0F5"],
    dawn: ["#FFAA8D", "#FFC5E8", "#FFEBA8"],
    forest: ["#8FE8AD", "#B5F0C8", "#C8FFD8"],
    sea: ["#80F5E0", "#8AD4F0", "#B0E5FF"],
    // Professional dark
    professional: ["#4A7590", "#5A90A8", "#70A8C0"],
    scientific: ["#708A78", "#8AAA98", "#A8C8B5"],
    expertise: ["#7A6A9A", "#9A88B8", "#B8A8D4"],
    accessible: ["#9A8A7A", "#B8A898", "#D4C4B4"],
    vibrant: ["#7880FF", "#9A8AFF", "#B8A0FF"],
  },

  // Kart Renkleri - Dark mode
  cards: {
    story: {
      bg: ["#251A15", "#201510"] as const,
      border: "#8A6A40",
      icon: "#FFAA8D",
    },
    analysis: {
      bg: ["#151D25", "#101820"] as const,
      border: "#5090A8",
      icon: "#B89EFF",
    },
    coloring: {
      bg: ["#152518", "#102015"] as const,
      border: "#509870",
      icon: "#80F5E0",
    },
    premium: {
      bg: ["#201828", "#181020"] as const,
      border: "#8A70B0",
      icon: "#D4C5FF",
    },
  },
};

// Ethereal Dark Colors - Dreamy night sky palette
export const EtherealDarkColors = {
  core: {
    moonlight: '#1A1D28',
    stardust: '#201825',
    aurora: '#152520',
    nebula: '#251520',
    celestial: '#151A25',
    twilight: '#181520',
  },

  glow: {
    soft: 'rgba(100, 120, 180, 0.15)',
    medium: 'rgba(120, 140, 200, 0.25)',
    bright: 'rgba(150, 170, 220, 0.35)',
    moonbeam: 'rgba(180, 200, 255, 0.2)',
    starshine: 'rgba(255, 220, 180, 0.2)',
  },

  shimmer: {
    pearl: ['#2A2D38', '#252030', '#302028', '#203028'] as const,
    opal: ['#202530', '#252030', '#302028', '#203530'] as const,
    crystal: ['#282830', '#282030', '#302830', '#283030'] as const,
  },

  gradients: {
    moonrise: ['#1A1D28', '#201825', '#251520'] as const,
    starfall: ['#151A25', '#201830', '#251825'] as const,
    dreamscape: ['#1A1D28', '#152520', '#251520', '#151A25'] as const,
    aurora: ['#152520', '#201825', '#201830', '#151A25'] as const,
    twilightSky: ['#181520', '#201825', '#251520'] as const,
    celestialDawn: ['#252020', '#1A1D28', '#201825'] as const,
  },

  veil: {
    light: 'rgba(30, 35, 50, 0.5)',
    medium: 'rgba(35, 30, 45, 0.6)',
    deep: 'rgba(25, 30, 45, 0.7)',
  },

  shadows: {
    soft: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    deep: 'rgba(0, 0, 0, 0.7)',
    glow: 'rgba(100, 120, 180, 0.2)',
  },
} as const;

// Tema Konfigürasyonu
export const ThemeConfig = {
  light: {
    text: Colors.neutral.darkest,
    background: Colors.background.primary,
    tint: Colors.primary.sunset,
    tabIconDefault: Colors.neutral.light,
    tabIconSelected: Colors.primary.sunset,
    card: Colors.background.card,
    border: Colors.neutral.lighter,
    notification: Colors.primary.sunset,
  },
  dark: {
    text: DarkColors.neutral.darkest,
    background: DarkColors.background.primary,
    tint: DarkColors.primary.sunset,
    tabIconDefault: DarkColors.neutral.light,
    tabIconSelected: DarkColors.primary.sunset,
    card: DarkColors.background.card,
    border: DarkColors.neutral.lighter,
    notification: DarkColors.primary.sunset,
  },
};

// Export default for backward compatibility
export default ThemeConfig;

// Yardımcı Fonksiyonlar
export const withOpacity = (color: string, opacity: number): string => {
  // Hex rengi RGBA'ya çevir
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Gradient string oluşturucu
export const createGradient = (colors: string[], angle: number = 135): string => {
  return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
};

// ============================================================================
// PROFESSIONAL COLOR SYSTEM
// Role-based color palette for adult users (Parents, Teachers, Experts)
// Part of #16: Professional/Adult-Focused UI Revision
// ============================================================================

export const ProfessionalColors = {
  // Trust-building colors - softer, more sophisticated
  trust: {
    primary: '#4A90A4',      // Trust Blue - main professional accent
    secondary: '#5BA3B8',    // Lighter trust blue
    background: '#EBF4F7',   // Very light blue bg
  },

  // Neutral palette - professional grays
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Text hierarchy - clear readability
  text: {
    primary: '#1A1A2E',      // Main text - high contrast
    secondary: '#4A4A5A',    // Secondary info
    tertiary: '#8A8A9A',     // Hints, placeholders
    disabled: '#C0C0C8',     // Disabled state
    inverse: '#FFFFFF',      // On dark backgrounds
  },

  // Semantic colors - professional variants
  semantic: {
    success: '#7CB893',      // Calm green
    successLight: '#E8F5EE',
    warning: '#E8945A',      // Warm orange
    warningLight: '#FEF3E8',
    error: '#E07070',        // Soft red
    errorLight: '#FDECEC',
    info: '#4A90A4',         // Trust blue
    infoLight: '#EBF4F7',
  },

  // Role-specific accent colors
  roles: {
    parent: {
      primary: '#E57355',    // Warm coral - approachable
      secondary: '#FF8A65',
      background: '#FFF5F2',
      gradient: ['#FF8A65', '#E57355'] as const,
    },
    teacher: {
      primary: '#4A90A4',    // Trust blue - professional
      secondary: '#5BA3B8',
      background: '#EBF4F7',
      gradient: ['#5BA3B8', '#4A90A4'] as const,
    },
    expert: {
      primary: '#5D4E7C',    // Deep purple - expertise
      secondary: '#7D6B9D',
      background: '#F3F0F7',
      gradient: ['#7D6B9D', '#5D4E7C'] as const,
    },
  },

  // Data visualization colors (for charts/graphs)
  data: {
    positive: '#7CB893',
    negative: '#E07070',
    neutral: '#A3A3A3',
    highlight: '#4A90A4',
    series: [
      '#4A90A4',  // Blue
      '#7CB893',  // Green
      '#E8945A',  // Orange
      '#9E8FBF',  // Purple
      '#E07070',  // Red
      '#5BA3B8',  // Light blue
    ] as const,
  },

  // Background layers - subtle hierarchy
  background: {
    base: '#FAFAFA',         // Main background
    surface: '#FFFFFF',      // Cards, elevated surfaces
    elevated: '#FFFFFF',     // Modals, dropdowns
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Border colors
  border: {
    light: '#E5E5E5',
    medium: '#D4D4D4',
    focus: '#4A90A4',
    error: '#E07070',
  },

  // Professional gradients
  gradients: {
    // Subtle gradients for backgrounds
    softBlue: ['#EBF4F7', '#FFFFFF'] as const,
    softGreen: ['#E8F5EE', '#FFFFFF'] as const,
    softPurple: ['#F3F0F7', '#FFFFFF'] as const,

    // CTA gradients
    primary: ['#FF8A65', '#E57355'] as const,
    professional: ['#5BA3B8', '#4A90A4'] as const,
    expert: ['#7D6B9D', '#5D4E7C'] as const,
  },

  // Glassmorphism for professional UI
  glass: {
    background: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.08)',
  },
} as const;

// Dark mode professional colors
export const ProfessionalDarkColors = {
  trust: {
    primary: '#5BA3B8',
    secondary: '#6BBDD2',
    background: '#1A2A30',
  },

  neutral: {
    50: '#171717',
    100: '#262626',
    200: '#404040',
    300: '#525252',
    400: '#737373',
    500: '#A3A3A3',
    600: '#D4D4D4',
    700: '#E5E5E5',
    800: '#F5F5F5',
    900: '#FAFAFA',
  },

  text: {
    primary: '#F4F4F5',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    disabled: '#52525B',
    inverse: '#1A1A2E',
  },

  semantic: {
    success: '#8FD4A8',
    successLight: '#1A2E22',
    warning: '#FFAA70',
    warningLight: '#2E2518',
    error: '#F28B8B',
    errorLight: '#2E1A1A',
    info: '#5BA3B8',
    infoLight: '#1A2A30',
  },

  roles: {
    parent: {
      primary: '#FF9B7A',
      secondary: '#FFAA8A',
      background: '#2E201C',
      gradient: ['#FFAA8A', '#FF9B7A'] as const,
    },
    teacher: {
      primary: '#5BA3B8',
      secondary: '#6BBDD2',
      background: '#1A2A30',
      gradient: ['#6BBDD2', '#5BA3B8'] as const,
    },
    expert: {
      primary: '#9E8FBF',
      secondary: '#B8A8D4',
      background: '#231E2E',
      gradient: ['#B8A8D4', '#9E8FBF'] as const,
    },
  },

  data: {
    positive: '#8FD4A8',
    negative: '#F28B8B',
    neutral: '#737373',
    highlight: '#5BA3B8',
    series: [
      '#5BA3B8',
      '#8FD4A8',
      '#FFAA70',
      '#B8A8D4',
      '#F28B8B',
      '#6BBDD2',
    ] as const,
  },

  background: {
    base: '#0F0F12',
    surface: '#1A1A1E',
    elevated: '#242428',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },

  border: {
    light: '#3F3F46',
    medium: '#52525B',
    focus: '#5BA3B8',
    error: '#F28B8B',
  },

  gradients: {
    softBlue: ['#1A2A30', '#1A1A1E'] as const,
    softGreen: ['#1A2E22', '#1A1A1E'] as const,
    softPurple: ['#231E2E', '#1A1A1E'] as const,

    primary: ['#FFAA8A', '#FF9B7A'] as const,
    professional: ['#6BBDD2', '#5BA3B8'] as const,
    expert: ['#B8A8D4', '#9E8FBF'] as const,
  },

  glass: {
    background: 'rgba(26, 26, 30, 0.85)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
} as const;
