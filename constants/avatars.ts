import { Colors } from "./colors";

// Debug: Verify Colors are loaded
console.log('[avatars.ts] Colors loaded:', {
  hasSecondary: !!Colors.secondary,
  secondaryKeys: Colors.secondary ? Object.keys(Colors.secondary) : [],
});

export type AvatarCategory = "characters" | "animals" | "objects" | "emojis";

export interface Avatar {
  id: string;
  emoji: string;
  category: AvatarCategory;
  gradientColors: [string, string];
  name: string;
}

/**
 * Preset Avatar Collection
 * Emojilere dayalı, renkli gradient'lerle birlikte avatar seti
 */
export const AVATARS: Avatar[] = [
  // Characters - Karakterler
  {
    id: "char_boy_happy",
    emoji: "😊",
    category: "characters",
    gradientColors: [Colors.secondary.sky, Colors.secondary.skyLight],
    name: "Mutlu Çocuk",
  },
  {
    id: "char_girl_smile",
    emoji: "😄",
    category: "characters",
    gradientColors: [Colors.secondary.lavender, Colors.secondary.lavenderLight],
    name: "Gülen Çocuk",
  },
  {
    id: "char_cool",
    emoji: "😎",
    category: "characters",
    gradientColors: [Colors.secondary.grass, Colors.secondary.grassLight],
    name: "Havalı",
  },
  {
    id: "char_nerd",
    emoji: "🤓",
    category: "characters",
    gradientColors: [Colors.secondary.sunshine, Colors.secondary.sunshineLight],
    name: "Akıllı",
  },
  {
    id: "char_party",
    emoji: "🥳",
    category: "characters",
    gradientColors: [Colors.secondary.rose, Colors.secondary.roseLight],
    name: "Parti",
  },
  {
    id: "char_star",
    emoji: "🌟",
    category: "characters",
    gradientColors: [Colors.secondary.sunshine, Colors.secondary.sunshineLight],
    name: "Yıldız",
  },
  {
    id: "char_superhero",
    emoji: "🦸",
    category: "characters",
    gradientColors: [Colors.secondary.sky, Colors.secondary.skyLight],
    name: "Süper Kahraman",
  },
  {
    id: "char_astronaut",
    emoji: "🧑‍🚀",
    category: "characters",
    gradientColors: [Colors.secondary.lavender, Colors.secondary.lavenderLight],
    name: "Astronot",
  },
  {
    id: "char_artist",
    emoji: "🧑‍🎨",
    category: "characters",
    gradientColors: [Colors.secondary.rose, Colors.secondary.roseLight],
    name: "Sanatçı",
  },
  {
    id: "char_princess",
    emoji: "👸",
    category: "characters",
    gradientColors: [Colors.secondary.lavender, Colors.secondary.lavenderLight],
    name: "Prenses",
  },
  {
    id: "char_prince",
    emoji: "🤴",
    category: "characters",
    gradientColors: [Colors.secondary.sky, Colors.secondary.skyLight],
    name: "Prens",
  },
  {
    id: "char_wizard",
    emoji: "🧙",
    category: "characters",
    gradientColors: [Colors.secondary.grass, Colors.secondary.grassLight],
    name: "Büyücü",
  },

  // Animals - Hayvanlar
  {
    id: "animal_dog",
    emoji: "🐶",
    category: "animals",
    gradientColors: [Colors.secondary.sunshine, Colors.secondary.sunshineLight],
    name: "Köpek",
  },
  {
    id: "animal_cat",
    emoji: "🐱",
    category: "animals",
    gradientColors: [Colors.secondary.lavender, Colors.secondary.lavenderLight],
    name: "Kedi",
  },
  {
    id: "animal_rabbit",
    emoji: "🐰",
    category: "animals",
    gradientColors: [Colors.secondary.rose, Colors.secondary.roseLight],
    name: "Tavşan",
  },
  {
    id: "animal_panda",
    emoji: "🐼",
    category: "animals",
    gradientColors: [Colors.secondary.grass, Colors.secondary.grassLight],
    name: "Panda",
  },
  {
    id: "animal_lion",
    emoji: "🦁",
    category: "animals",
    gradientColors: [Colors.secondary.sunshine, Colors.secondary.sunshineLight],
    name: "Aslan",
  },
  {
    id: "animal_unicorn",
    emoji: "🦄",
    category: "animals",
    gradientColors: [Colors.secondary.rose, Colors.secondary.roseLight],
    name: "Unicorn",
  },
  {
    id: "animal_elephant",
    emoji: "🐘",
    category: "animals",
    gradientColors: [Colors.secondary.sky, Colors.secondary.skyLight],
    name: "Fil",
  },
  {
    id: "animal_monkey",
    emoji: "🐵",
    category: "animals",
    gradientColors: [Colors.secondary.sunshine, Colors.secondary.sunshineLight],
    name: "Maymun",
  },
  {
    id: "animal_bear",
    emoji: "🐻",
    category: "animals",
    gradientColors: [Colors.secondary.grass, Colors.secondary.grassLight],
    name: "Ayı",
  },
  {
    id: "animal_fox",
    emoji: "🦊",
    category: "animals",
    gradientColors: [Colors.secondary.sunshine, Colors.secondary.sunshineLight],
    name: "Tilki",
  },
  {
    id: "animal_owl",
    emoji: "🦉",
    category: "animals",
    gradientColors: [Colors.secondary.lavender, Colors.secondary.lavenderLight],
    name: "Baykuş",
  },
  {
    id: "animal_penguin",
    emoji: "🐧",
    category: "animals",
    gradientColors: [Colors.secondary.sky, Colors.secondary.skyLight],
    name: "Penguen",
  },

  // Objects - Nesneler
  {
    id: "obj_rocket",
    emoji: "🚀",
    category: "objects",
    gradientColors: [Colors.secondary.sky, Colors.secondary.skyLight],
    name: "Roket",
  },
  {
    id: "obj_rainbow",
    emoji: "🌈",
    category: "objects",
    gradientColors: [Colors.secondary.rose, Colors.secondary.roseLight],
    name: "Gökkuşağı",
  },
  {
    id: "obj_crown",
    emoji: "👑",
    category: "objects",
    gradientColors: [Colors.secondary.sunshine, Colors.secondary.sunshineLight],
    name: "Taç",
  },
  {
    id: "obj_heart",
    emoji: "❤️",
    category: "objects",
    gradientColors: [Colors.secondary.rose, Colors.secondary.roseLight],
    name: "Kalp",
  },
  {
    id: "obj_star",
    emoji: "⭐",
    category: "objects",
    gradientColors: [Colors.secondary.sunshine, Colors.secondary.sunshineLight],
    name: "Yıldız",
  },
  {
    id: "obj_balloon",
    emoji: "🎈",
    category: "objects",
    gradientColors: [Colors.secondary.rose, Colors.secondary.roseLight],
    name: "Balon",
  },
  {
    id: "obj_gift",
    emoji: "🎁",
    category: "objects",
    gradientColors: [Colors.secondary.lavender, Colors.secondary.lavenderLight],
    name: "Hediye",
  },
  {
    id: "obj_cake",
    emoji: "🎂",
    category: "objects",
    gradientColors: [Colors.secondary.rose, Colors.secondary.roseLight],
    name: "Pasta",
  },
  {
    id: "obj_book",
    emoji: "📚",
    category: "objects",
    gradientColors: [Colors.secondary.grass, Colors.secondary.grassLight],
    name: "Kitap",
  },
  {
    id: "obj_paint",
    emoji: "🎨",
    category: "objects",
    gradientColors: [Colors.secondary.rose, Colors.secondary.roseLight],
    name: "Boya",
  },
  {
    id: "obj_music",
    emoji: "🎵",
    category: "objects",
    gradientColors: [Colors.secondary.lavender, Colors.secondary.lavenderLight],
    name: "Müzik",
  },
  {
    id: "obj_sun",
    emoji: "☀️",
    category: "objects",
    gradientColors: [Colors.secondary.sunshine, Colors.secondary.sunshineLight],
    name: "Güneş",
  },

  // Emojis - Duygular
  {
    id: "emoji_love",
    emoji: "🥰",
    category: "emojis",
    gradientColors: [Colors.secondary.rose, Colors.secondary.roseLight],
    name: "Aşık",
  },
  {
    id: "emoji_laugh",
    emoji: "😂",
    category: "emojis",
    gradientColors: [Colors.secondary.sunshine, Colors.secondary.sunshineLight],
    name: "Kahkaha",
  },
  {
    id: "emoji_wink",
    emoji: "😉",
    category: "emojis",
    gradientColors: [Colors.secondary.lavender, Colors.secondary.lavenderLight],
    name: "Göz Kırpma",
  },
  {
    id: "emoji_thinking",
    emoji: "🤔",
    category: "emojis",
    gradientColors: [Colors.secondary.grass, Colors.secondary.grassLight],
    name: "Düşünen",
  },
  {
    id: "emoji_sparkle",
    emoji: "✨",
    category: "emojis",
    gradientColors: [Colors.secondary.sunshine, Colors.secondary.sunshineLight],
    name: "Işıltı",
  },
  {
    id: "emoji_fire",
    emoji: "🔥",
    category: "emojis",
    gradientColors: [Colors.secondary.sunshine, Colors.secondary.sunshineLight],
    name: "Ateş",
  },
];

/**
 * Avatar'ı ID'ye göre bul
 */
export const getAvatarById = (id: string): Avatar | undefined => {
  return AVATARS.find((avatar) => avatar.id === id);
};

/**
 * Avatar'ları kategoriye göre filtrele
 */
export const getAvatarsByCategory = (category: AvatarCategory): Avatar[] => {
  return AVATARS.filter((avatar) => avatar.category === category);
};

/**
 * Default avatar (kullanıcı seçim yapmadıysa)
 */
export const DEFAULT_AVATAR: Avatar = {
  id: "char_boy_happy",
  emoji: "😊",
  category: "characters",
  gradientColors: [Colors.secondary.grass, Colors.secondary.grassLight],
  name: "Varsayılan",
};

/**
 * Kategori isimleri
 */
export const CATEGORY_NAMES: Record<AvatarCategory, string> = {
  characters: "Karakterler",
  animals: "Hayvanlar",
  objects: "Nesneler",
  emojis: "Duygular",
};
