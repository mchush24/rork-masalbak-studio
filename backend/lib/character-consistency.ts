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
 * Extract character features from drawing analysis text
 */
function extractCharacterFromAnalysis(analysisText: string): Partial<CharacterDefinition> | null {
  if (!analysisText) return null;

  const lowerText = analysisText.toLowerCase();
  const extracted: Partial<CharacterDefinition> = {};

  // Extract colors
  const colors: string[] = [];
  if (lowerText.includes('sarı') || lowerText.includes('yellow')) colors.push('sarı');
  if (lowerText.includes('mavi') || lowerText.includes('blue')) colors.push('mavi');
  if (lowerText.includes('kırmızı') || lowerText.includes('red')) colors.push('kırmızı');
  if (lowerText.includes('yeşil') || lowerText.includes('green')) colors.push('yeşil');
  if (lowerText.includes('pembe') || lowerText.includes('pink')) colors.push('pembe');
  if (lowerText.includes('turuncu') || lowerText.includes('orange')) colors.push('turuncu');
  if (lowerText.includes('mor') || lowerText.includes('purple')) colors.push('mor');

  // Extract clothing/accessories
  const clothing: string[] = [];
  if (lowerText.includes('elbise') || lowerText.includes('dress')) clothing.push('elbise');
  if (lowerText.includes('pantolon') || lowerText.includes('pants')) clothing.push('pantolon');
  if (lowerText.includes('şapka') || lowerText.includes('hat')) clothing.push('şapka');
  if (lowerText.includes('eşarp') || lowerText.includes('scarf')) clothing.push('eşarp');
  if (lowerText.includes('ayakkabı') || lowerText.includes('shoes')) clothing.push('ayakkabı');

  // Extract mood/personality hints
  let personalityHints = '';
  if (lowerText.includes('mutlu') || lowerText.includes('happy') || lowerText.includes('gülümse')) {
    personalityHints = 'neşeli, mutlu';
  } else if (lowerText.includes('sakin') || lowerText.includes('calm') || lowerText.includes('huzur')) {
    personalityHints = 'sakin, huzurlu';
  } else if (lowerText.includes('merak') || lowerText.includes('curious')) {
    personalityHints = 'meraklı, keşfetmeyi seven';
  } else if (lowerText.includes('cesur') || lowerText.includes('brave')) {
    personalityHints = 'cesur, güçlü';
  }

  // Build appearance string if we found features
  if (colors.length > 0 || clothing.length > 0) {
    let appearance = '';
    if (colors.length > 0) {
      appearance += colors.join(' ve ') + ' renkler';
    }
    if (clothing.length > 0) {
      appearance += (appearance ? ', ' : '') + clothing.join(', ');
    }
    extracted.appearance = appearance;
  }

  if (personalityHints) {
    extracted.style = personalityHints;
  }

  return Object.keys(extracted).length > 0 ? extracted : null;
}

/**
 * Extract character information from user's drawing analysis or create default
 */
export function defineCharacterFromContext(
  drawingAnalysis?: string,
  ageGroup?: number
): CharacterDefinition {
  const age = ageGroup || 5;

  // Try to extract character features from analysis
  const extractedFeatures = drawingAnalysis ? extractCharacterFromAnalysis(drawingAnalysis) : null;

  // Define base character by age
  let baseCharacter: CharacterDefinition;

  if (age <= 3) {
    baseCharacter = {
      name: "Minik Ayı",
      age: "2-3 yaş",
      appearance: "KÜÇÜK KAHVE RENGİ AYI YAVRUSU: yuvarlak kafa, iri siyah gözler, pembe burun, yumuşak kulaklar, tombul vücut, kısa bacaklar, PAT PAT bacaklar",
      style: "çok basit çizgi, 3 renkle sınırlı (kahverengi-pembe-beyaz), minimal detay",
      clothing: "MAVİ TULUM (askılı), hiç aksesuar yok, çıplak ayak",
    };
  } else if (age <= 6) {
    baseCharacter = {
      name: "Tavşan Lale",
      age: "4-6 yaş",
      appearance: "BEYAZ TAVŞAN KIZI: uzun kulaklar (pembe iç), büyük mavi gözler, pembe burun, sevimli diş, orta boy, yumuşak tüyler, her zaman gülümseyen",
      style: "yumuşak çizgi, pastel renkler (beyaz-pembe-mavi), dostça ifade",
      clothing: "PEMBE ELBİSE (noktalı), MAVI KURDELE (kulakta), BEYAZ AYAKKABI",
    };
  } else {
    baseCharacter = {
      name: "Tilki Can",
      age: "7-10 yaş",
      appearance: "TURUNCU TİLKİ: sivri kulaklar (siyah uçlu), yeşil gözler, beyaz göğüs, uzun kırmızı kuyruk (beyaz uçlu), zeki bakış, atletik yapı",
      style: "detaylı çizgi, canlı renkler (turuncu-beyaz-siyah), dinamik",
      clothing: "YEŞİL YELEJ (ceketli), KAHVERENGİ PANTOLON (cepli), KIRMIZI ATKI",
    };
  }

  // Merge extracted features from drawing analysis
  if (extractedFeatures) {
    if (extractedFeatures.appearance) {
      // Add extracted appearance details to base character
      baseCharacter.appearance += `. Çizimden: ${extractedFeatures.appearance}`;
    }
    if (extractedFeatures.style) {
      // Enhance style with extracted personality
      baseCharacter.style += `, ${extractedFeatures.style}`;
    }
    if (extractedFeatures.clothing) {
      // Override or enhance clothing
      baseCharacter.clothing = extractedFeatures.clothing;
    }
  }

  return baseCharacter;
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
 * Key: Balance character consistency with scene uniqueness
 */
export function generateConsistentPrompt(
  character: CharacterDefinition,
  style: StoryStyle,
  pageText: string,
  sceneDescription: string,
  pageNumber: number,
  totalPages: number
): string {
  // CRITICAL: Character definition (same for all pages)
  const characterBlock = `
MAIN CHARACTER (CONSISTENT ACROSS STORY):
${character.appearance}
Age: ${character.age}
Clothing: ${character.clothing}
`.trim();

  // UNIQUE SCENE ELEMENTS (THIS MUST BE DIFFERENT FOR EACH PAGE!)
  // Extract unique action words from page text for variety
  const actionWords = extractActionFromText(pageText);

  const sceneBlock = `
PAGE ${pageNumber} OF ${totalPages} - UNIQUE SCENE:
${sceneDescription}

ACTION IN THIS SCENE: ${actionWords}
PAGE POSITION: ${pageNumber === 1 ? 'STORY OPENING - introduce character' : pageNumber === totalPages ? 'STORY ENDING - happy resolution' : 'STORY MIDDLE - adventure continues'}
`.trim();

  // Art style
  const styleBlock = `
ART STYLE: ${style.artStyle}, ${style.colorPalette}
MOOD: ${style.mood}
`.trim();

  // Rules
  const rules = `
RULES:
- NO TEXT/LETTERS in image
- Character is main focus
- Simple background
- Professional children's book illustration
`.trim();

  return `${characterBlock}\n\n${sceneBlock}\n\n${styleBlock}\n\n${rules}`;
}

/**
 * Extract action verbs and key elements from text for scene uniqueness
 */
function extractActionFromText(text: string): string {
  const lowerText = text.toLowerCase();
  const actions: string[] = [];

  // Turkish action verbs
  const actionMap: Record<string, string> = {
    'koştu': 'running',
    'koşuyor': 'running',
    'zıpladı': 'jumping',
    'zıplıyor': 'jumping',
    'uçtu': 'flying',
    'uçuyor': 'flying',
    'yürüdü': 'walking',
    'yürüyor': 'walking',
    'oturdu': 'sitting',
    'oturuyor': 'sitting',
    'uyudu': 'sleeping',
    'uyuyor': 'sleeping',
    'güldü': 'laughing',
    'gülüyor': 'laughing',
    'ağladı': 'crying',
    'ağlıyor': 'crying',
    'baktı': 'looking',
    'bakıyor': 'looking',
    'buldu': 'finding something',
    'buluyor': 'finding something',
    'aldı': 'taking/holding',
    'alıyor': 'taking/holding',
    'verdi': 'giving',
    'veriyor': 'giving',
    'oynadı': 'playing',
    'oynuyor': 'playing',
    'yedi': 'eating',
    'yiyor': 'eating',
    'içti': 'drinking',
    'içiyor': 'drinking',
    'sarıldı': 'hugging',
    'sarılıyor': 'hugging',
    'el salladı': 'waving',
    'gizlendi': 'hiding',
    'gizleniyor': 'hiding',
    'tırmandı': 'climbing',
    'tırmanıyor': 'climbing',
    'yüzdü': 'swimming',
    'yüzüyor': 'swimming',
    'dans etti': 'dancing',
    'dans ediyor': 'dancing',
    'şarkı söyledi': 'singing',
    'şarkı söylüyor': 'singing',
  };

  for (const [turkish, english] of Object.entries(actionMap)) {
    if (lowerText.includes(turkish)) {
      actions.push(english);
    }
  }

  // Return unique actions or default
  const uniqueActions = [...new Set(actions)];
  return uniqueActions.length > 0
    ? uniqueActions.slice(0, 3).join(', ')
    : 'character in scene';
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
