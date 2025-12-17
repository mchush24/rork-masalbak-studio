/**
 * MasalBak Renk Paleti - "Renkli Bahçe" Skin
 *
 * Çocuk uygulaması için canlı, eğlenceli ve renkli tasarım
 * - Gradient arka planlar
 * - Renkli kartlar
 * - Glassmorphism efektleri
 * - Sulu boya geçişleri
 */

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

// Tema Konfigürasyonu
export default {
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
};

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
