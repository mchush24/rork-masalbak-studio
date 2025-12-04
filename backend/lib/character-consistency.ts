/**
 * Character Consistency System
 *
 * Ensures all story pages have consistent character appearance
 * by defining character traits upfront and using them in all prompts.
 */

export interface CharacterDefinition {
  name: string;
  age: string;
  appearance: string;
  style: string;
  clothing: string;
}

export interface StoryStyle {
  artStyle: string;
  colorPalette: string;
  mood: string;
  textStyle: string;
}

/**
 * Extract character information from user's drawing analysis or create default
 */
export function defineCharacterFromContext(
  drawingAnalysis?: string,
  ageGroup?: number
): CharacterDefinition {
  // TODO: Use AI to extract character from drawing analysis
  // For now, create ULTRA-SPECIFIC age-appropriate default character

  const age = ageGroup || 5;

  if (age <= 3) {
    return {
      name: "Minik Ayı",
      age: "2-3 yaş",
      appearance: "KÜÇÜK KAHVE RENGİ AYI YAVRUSU: yuvarlak kafa, iri siyah gözler, pembe burun, yumuşak kulaklar, tombul vücut, kısa bacaklar, PAT PAT bacaklar",
      style: "çok basit çizgi, 3 renkle sınırlı (kahverengi-pembe-beyaz), minimal detay",
      clothing: "MAVİ TULUM (askılı), hiç aksesuar yok, çıplak ayak",
    };
  } else if (age <= 6) {
    return {
      name: "Tavşan Lale",
      age: "4-6 yaş",
      appearance: "BEYAZ TAVŞAN KIZI: uzun kulaklar (pembe iç), büyük mavi gözler, pembe burun, sevimli diş, orta boy, yumuşak tüyler, her zaman gülümseyen",
      style: "yumuşak çizgi, pastel renkler (beyaz-pembe-mavi), dostça ifade",
      clothing: "PEMBE ELBİSE (noktalı), MAVI KURDELE (kulakta), BEYAZ AYAKKABI",
    };
  } else {
    return {
      name: "Tilki Can",
      age: "7-10 yaş",
      appearance: "TURUNCU TİLKİ: sivri kulaklar (siyah uçlu), yeşil gözler, beyaz göğüs, uzun kırmızı kuyruk (beyaz uçlu), zeki bakış, atletik yapı",
      style: "detaylı çizgi, canlı renkler (turuncu-beyaz-siyah), dinamik",
      clothing: "YEŞİL YELEJ (ceketli), KAHVERENGİ PANTOLON (cepli), KIRMIZI ATKI",
    };
  }
}

/**
 * Define story visual style
 */
export function defineStoryStyle(language: 'tr' | 'en' = 'tr'): StoryStyle {
  return {
    artStyle: language === 'tr'
      ? "Çocuk kitabı illüstrasyonu, yumuşak pastel suluboya, yuvarlak formlar"
      : "Children's storybook illustration, soft pastel watercolor, rounded shapes",
    colorPalette: language === 'tr'
      ? "sıcak tonlar, pembe, mavi, sarı, yeşil"
      : "warm tones, pink, blue, yellow, green",
    mood: language === 'tr'
      ? "dostça, güvenli, huzurlu atmosfer"
      : "friendly, safe, peaceful atmosphere",
    textStyle: language === 'tr'
      ? "okunaklı, büyük punto, çocuk dostu"
      : "readable, large font, child-friendly",
  };
}

/**
 * Generate ULTRA-SPECIFIC consistent prompt for each page
 * Key: Extreme detail on character to force consistency
 */
export function generateConsistentPrompt(
  character: CharacterDefinition,
  style: StoryStyle,
  pageText: string,
  sceneDescription: string,
  pageNumber: number,
  totalPages: number
): string {
  // ULTRA-DETAILED character (MUST be identical every time)
  const characterBlock = `
CHARACTER (EXACT SAME IN ALL IMAGES):
${character.appearance}
CLOTHING: ${character.clothing}
STYLE: ${style.artStyle}
COLORS: ${style.colorPalette}
MOOD: ${style.mood}
`.trim();

  // Scene description (this changes per page)
  const sceneBlock = `
SCENE ${pageNumber}/${totalPages}:
${sceneDescription}
Background: simple, minimal, child-friendly
`.trim();

  // CRITICAL RULES
  const rules = `
CRITICAL RULES:
- NO TEXT, NO LETTERS, NO WORDS anywhere in image
- Character MUST look IDENTICAL to description above
- Same colors, same face, same clothing EVERY TIME
- Simple background, focus on character
- Soft watercolor style, rounded shapes
`.trim();

  return `${characterBlock}\n\n${sceneBlock}\n\n${rules}`;
}

/**
 * Extract scene description from page text
 * Uses simple keyword extraction (can be enhanced with AI)
 */
export function extractSceneFromText(text: string, language: 'tr' | 'en' = 'tr'): string {
  // TODO: Use AI to extract scene description
  // For now, return cleaned text
  const cleaned = text.trim().slice(0, 100);
  return cleaned;
}
