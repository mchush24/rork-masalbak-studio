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
  // For now, create age-appropriate default character

  const age = ageGroup || 5;

  if (age <= 3) {
    return {
      name: "Minik Kahraman",
      age: "2-3 yaş",
      appearance: "küçük, sevimli, yuvarlak yüzlü, büyük gözlü",
      style: "basit çizgi, minimal detay, çok renkli",
      clothing: "renkli tulum, yumuşak kumaş",
    };
  } else if (age <= 6) {
    return {
      name: "Küçük Kahraman",
      age: "4-6 yaş",
      appearance: "neşeli, meraklı, orta boy, şirin yüz",
      style: "dostça, yumuşak hatlar, canlı renkler",
      clothing: "rahat kıyafet, canlı renkler",
    };
  } else {
    return {
      name: "Genç Kahraman",
      age: "7-10 yaş",
      appearance: "enerjik, cesur, atletik yapı",
      style: "detaylı, dinamik pozlar, parlak renkler",
      clothing: "macera kıyafeti, renkli aksesuarlar",
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
 * Generate consistent prompt for each page
 */
export function generateConsistentPrompt(
  character: CharacterDefinition,
  style: StoryStyle,
  pageText: string,
  sceneDescription: string,
  pageNumber: number,
  totalPages: number
): string {
  // Base character description (same for all pages)
  const characterDesc = `Main character: ${character.name}, ${character.age}, ${character.appearance}, ${character.clothing}.`;

  // Art style (same for all pages)
  const artStyleDesc = `Style: ${style.artStyle}, ${style.colorPalette}, ${style.mood}.`;

  // Scene-specific description (different for each page)
  const sceneDesc = `Scene ${pageNumber}/${totalPages}: ${sceneDescription}.`;

  // Critical: NO TEXT in image
  const noTextRule = `IMPORTANT: NO TEXT, NO LETTERS, NO WORDS in the image. Pure illustration only.`;

  // Consistency emphasis
  const consistencyRule = `Keep character appearance EXACTLY the same as previous pages. Same face, same clothing, same style.`;

  return `${characterDesc} ${artStyleDesc} ${sceneDesc} ${noTextRule} ${consistencyRule}`;
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
