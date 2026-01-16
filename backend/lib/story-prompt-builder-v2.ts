/**
 * Story Prompt Builder V2 - Prompt Guru Edition
 *
 * Araştırma bulgularına dayalı hikaye prompt mimarisi:
 *
 * TEXT GENERATİON (GPT-4o için):
 * 1. Öncelik sırası - En önemli talimatlar başta
 * 2. Pozitif dil - "YAPMA" yerine "YAP" kullan
 * 3. Somut örnekler - Abstract değil concrete
 * 4. Yapısal katmanlar - Layer based prompt design
 *
 * IMAGE GENERATİON (Flux için):
 * 1. İlk 20 token kritik - Format declaration
 * 2. Ağırlık sözdizimi - (keyword:1.3)
 * 3. Negatif prompt YOK - Pozitif alternatifler
 * 4. Çelişki kontrolü - Contradicting terms removed
 *
 * Kaynaklar:
 * - ArXiv: Token attention research
 * - OpenAI: Prompt engineering best practices
 * - Flux: Natural language preferences
 */

import { logger } from "./utils.js";

// ============================================
// TYPES
// ============================================

export interface CharacterV2 {
  name: string;
  type: string; // "tavşan", "ayı", etc.
  gender: 'male' | 'female';
  age: number;
  appearance: string;
  personality: string[];
  speechStyle: string;
  // V2 Character Consistency Fields
  anchorTags?: string; // Generated once, used in ALL pages
  colorSignature?: string; // Primary colors (e.g., "white fur, pink bow, blue eyes")
  uniqueFeatures?: string[]; // Distinguishing features that MUST appear
}

// Character DNA - Unique identifier for consistency
export interface CharacterDNA {
  hash: string; // Unique hash for seed generation
  anchorTags: string; // EXACT same string for ALL pages
  colorSignature: string; // Color-based identity
  uniqueFeatures: string[]; // Must-have visual elements
  consistencySeed: number; // Base seed for this character
}

export interface SceneV2 {
  pageNumber: number;
  totalPages: number;
  beat: string; // Story beat
  emotion: string;
  visualElements: string[];
  text?: string;
}

export interface StoryStyleV2 {
  artStyle: string;
  colorPalette: string[];
  mood: string;
}

// ============================================
// CHARACTER DNA SYSTEM - CONSISTENCY ENGINE
// ============================================

/**
 * Generate Character DNA - The core of consistency
 *
 * This creates a unique, reproducible character identity that:
 * 1. Generates EXACT same anchor tags for every page
 * 2. Creates a hash for consistent seed generation
 * 3. Extracts color signature for visual matching
 * 4. Identifies unique features that MUST appear
 */
export function generateCharacterDNA(character: CharacterV2): CharacterDNA {
  // Extract colors from appearance
  const colorWords = extractColors(character.appearance);
  const colorSignature = colorWords.length > 0
    ? colorWords.slice(0, 3).join(', ')
    : 'warm colors';

  // Extract unique visual features
  const uniqueFeatures = extractUniqueFeatures(character);

  // Generate anchor tags - EXACT SAME for every page
  // Format: [type][gender][colors][unique features]
  const anchorTags = buildAnchorTags(character, colorSignature, uniqueFeatures);

  // Generate hash for seed
  const hash = generateCharacterHash(character);
  const consistencySeed = hashToSeed(hash);

  const dna: CharacterDNA = {
    hash,
    anchorTags,
    colorSignature,
    uniqueFeatures,
    consistencySeed
  };

  logger.info('[CharacterDNA] Generated:', {
    name: character.name,
    hash: hash.substring(0, 8),
    seed: consistencySeed,
    anchorTags: anchorTags.substring(0, 80) + '...'
  });

  return dna;
}

/**
 * Extract color words from appearance text
 */
function extractColors(text: string): string[] {
  const colorMap: Record<string, string> = {
    // Turkish to English
    'beyaz': 'white', 'siyah': 'black', 'kahve': 'brown', 'kahverengi': 'brown',
    'turuncu': 'orange', 'sarı': 'yellow', 'mavi': 'blue', 'yeşil': 'green',
    'kırmızı': 'red', 'pembe': 'pink', 'mor': 'purple', 'gri': 'gray',
    'altın': 'golden', 'gümüş': 'silver', 'krem': 'cream',
    // English colors
    'white': 'white', 'black': 'black', 'brown': 'brown', 'orange': 'orange',
    'yellow': 'yellow', 'blue': 'blue', 'green': 'green', 'red': 'red',
    'pink': 'pink', 'purple': 'purple', 'gray': 'gray', 'grey': 'gray',
    'golden': 'golden', 'silver': 'silver', 'cream': 'cream'
  };

  const colors: string[] = [];
  const lowerText = text.toLowerCase();

  for (const [key, value] of Object.entries(colorMap)) {
    if (lowerText.includes(key) && !colors.includes(value)) {
      colors.push(value);
    }
  }

  return colors;
}

/**
 * Extract unique visual features from character
 */
function extractUniqueFeatures(character: CharacterV2): string[] {
  const features: string[] = [];
  const lowerAppearance = character.appearance.toLowerCase();

  // Accessories
  const accessoryPatterns = [
    { pattern: /kurdele|bow|ribbon/i, feature: 'ribbon bow' },
    { pattern: /şapka|hat|cap/i, feature: 'hat' },
    { pattern: /çanta|bag|backpack|sırt çantası/i, feature: 'small backpack' },
    { pattern: /eşarp|scarf/i, feature: 'scarf' },
    { pattern: /gözlük|glasses/i, feature: 'glasses' },
    { pattern: /kolye|necklace/i, feature: 'necklace' },
    { pattern: /yaka|collar/i, feature: 'collar' },
  ];

  // Body features
  const bodyPatterns = [
    { pattern: /uzun kulak|long ear/i, feature: 'long ears' },
    { pattern: /büyük göz|big eye|iri göz/i, feature: 'big round eyes' },
    { pattern: /kabarık kuyruk|fluffy tail/i, feature: 'fluffy tail' },
    { pattern: /küçük burun|small nose/i, feature: 'small cute nose' },
    { pattern: /yuvarlak|round/i, feature: 'round body shape' },
    { pattern: /tombul|chubby/i, feature: 'chubby cheeks' },
  ];

  // Clothing
  const clothingPatterns = [
    { pattern: /elbise|dress/i, feature: 'cute dress' },
    { pattern: /tulum|overalls/i, feature: 'overalls' },
    { pattern: /yelek|vest/i, feature: 'vest' },
    { pattern: /ceket|jacket/i, feature: 'jacket' },
    { pattern: /pantolon|pants/i, feature: 'pants' },
  ];

  [...accessoryPatterns, ...bodyPatterns, ...clothingPatterns].forEach(({ pattern, feature }) => {
    if (pattern.test(lowerAppearance)) {
      features.push(feature);
    }
  });

  // Always include character type
  features.unshift(`${character.type} character`);

  return features.slice(0, 5); // Max 5 features
}

/**
 * Build anchor tags - EXACT SAME STRING for every page
 *
 * This is the CORE of character consistency.
 * These tags appear in EVERY prompt in the EXACT same format.
 */
function buildAnchorTags(
  character: CharacterV2,
  colorSignature: string,
  uniqueFeatures: string[]
): string {
  const genderText = character.gender === 'male' ? 'male' : 'female';

  // Build structured anchor with weights for emphasis
  // Format ensures EXACT reproducibility
  const anchor = [
    `(${character.type}:1.5)`, // Type with high weight
    `(${genderText}:1.3)`, // Gender
    `(${colorSignature}:1.4)`, // Colors with weight
    ...uniqueFeatures.slice(0, 3).map(f => `(${f}:1.2)`), // Features with weight
    `${character.age} years old`, // Age
    'same character', // Consistency hint
    'consistent appearance' // Explicit consistency
  ].join(', ');

  return anchor;
}

/**
 * Generate hash from character properties
 */
function generateCharacterHash(character: CharacterV2): string {
  const str = `${character.name}-${character.type}-${character.gender}-${character.appearance}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Convert hash to seed number
 */
function hashToSeed(hash: string): number {
  let seed = 0;
  for (let i = 0; i < hash.length; i++) {
    seed += hash.charCodeAt(i);
  }
  return (seed * 1000) % 999999;
}

/**
 * Get page-specific seed while maintaining character consistency
 *
 * Strategy:
 * - Base seed from character DNA (same character = same base)
 * - Small offset per page (allows scene variation)
 * - Offset is small enough to maintain character features
 */
export function getPageSeed(characterDNA: CharacterDNA, pageNumber: number): number {
  // Small offset to allow variation while keeping character consistent
  // Using pageNumber * 100 instead of * 1000 for more consistency
  return characterDNA.consistencySeed + (pageNumber * 100);
}

// ============================================
// TEXT GENERATION PROMPTS (GPT-4o)
// ============================================

/**
 * Story Outline Prompt - V2
 *
 * Prompt Guru Principles Applied:
 * 1. ROLE FIRST - Who you are (most attention)
 * 2. POSITIVE EXAMPLES - What TO DO (not what to avoid)
 * 3. CONCRETE SPECIFICS - No abstract instructions
 * 4. STRUCTURED OUTPUT - Clear JSON format
 */
export function buildStoryOutlinePrompt(
  childAge: number,
  childGender: 'male' | 'female' | undefined,
  pageCount: number,
  themes: string[],
  analysisInsights: string,
  therapeuticGuidance?: { principles: string; arcGuidance: string; avoidance: string }
): { system: string; user: string } {
  // LAYER 1: Role Definition (Highest Priority)
  const roleBlock = `SEN: Türkiye'nin en başarılı çocuk kitabı yazarısın.
UZMANLIĞIN: ${childAge} yaş grubu için büyüleyici, eğitici hikayeler yaratmak.
BAŞARI KRİTERİN: Her hikaye çocuğu hem eğlendirir hem de değer öğretir.`;

  // LAYER 2: Positive Examples (What TO DO)
  const exampleBlock = `
MÜKEMMEL KARAKTER ÖRNEĞİ:
{
  "name": "Luna",
  "type": "beyaz tavşan",
  "gender": "${childGender || 'female'}",
  "age": ${childAge},
  "appearance": "Kar beyazı yumuşak tüyler, pembe kurdele kulakları arasında, mavi büyük gözler, kırmızı küçük sırt çantası",
  "personality": ["meraklı", "utangaç", "nazik", "yardımsever"],
  "speechStyle": "Yumuşak sesle konuşur, 'belki' ve 'sanırım' kelimelerini sık kullanır"
}

MÜKEMMEL BEAT ÖRNEKLERİ (SOMUT OLAYLAR):
1. "Luna bahçede kelebek kovalıyor, parlayan altın bir taş buluyor"
2. "Taş parlayınca, konuşan bir sincap beliriyor ve yardım istiyor"
3. "Birlikte ormana gidiyorlar, kayıp sincap ailesini arıyorlar"
4. "Karanlık ağaçlar arasında korku duyuyorlar ama birbirlerine cesaret veriyorlar"
5. "Sincap ailesini buluyorlar, taş ödül olarak Luna'ya kalıyor"`;

  // LAYER 3: Specific Requirements
  const requirementsBlock = `
ZORUNLU KURALLAR:
1. Ana karakter ${childAge} yaşında ${childGender === 'male' ? 'ERKEK' : childGender === 'female' ? 'KIZ' : ''} olmalı
2. Fiziksel görünüm DETAYLI (renk, aksesuar, kıyafet)
3. Kişilik çok boyutlu (minimum 4 özellik)
4. Her beat'te BİR SOMUT OLAY (kim, ne, nerede, nasıl BELLİ)
5. ${pageCount} sayfa = ${pageCount} beat`;

  // LAYER 4: Therapeutic guidance if applicable
  const therapeuticBlock = therapeuticGuidance ? `
TERAPÖTİK YAKLAŞIM (KRİTİK):
${therapeuticGuidance.principles}

KARAKTER GELİŞİM ARKI:
${therapeuticGuidance.arcGuidance}

POZİTİF DÖNÜŞTÜRME:
${therapeuticGuidance.avoidance}` : '';

  const systemPrompt = `${roleBlock}
${exampleBlock}
${requirementsBlock}
${therapeuticBlock}

Sadece JSON döndür. Açıklama yazma.`;

  const userPrompt = `ÇOCUK PROFİLİ:
- Yaş: ${childAge}
- Cinsiyet: ${childGender === 'male' ? 'Erkek' : childGender === 'female' ? 'Kız' : 'Belirtilmemiş'}
- Çizim Analizi: ${analysisInsights}
- Temalar: ${themes.join(', ')}
- Hedef Sayfa: ${pageCount}

GÖREV: ${pageCount} sayfalık hikaye için karakter ve beat'ler oluştur.

JSON FORMAT:
{
  "theme": "Ana tema",
  "educationalValue": "Öğretilecek değer",
  "mainCharacter": { ... karakter detayları ... },
  "storyBeats": [ "${pageCount} adet SOMUT OLAY" ]
}`;

  return { system: systemPrompt, user: userPrompt };
}

/**
 * Scene Expansion Prompt - V2
 *
 * Prompt Guru Principles:
 * 1. Show, don't tell - Concrete scene writing
 * 2. Positive examples dominate
 * 3. Word count is precise
 */
export function buildSceneExpansionPrompt(
  character: CharacterV2,
  beat: string,
  pageNumber: number,
  wordsPerPage: number,
  sentencesPerPage: number
): { system: string; user: string } {
  const systemPrompt = `SEN: Çocuk kitabı sahne yazarısın. Her cümle BİR RESİM gibi.

MÜKEMMEL SAHNE ÖRNEĞİ (${wordsPerPage} kelime):
"${character.name} büyük çınarın altında durdu. Gözleri parlayan bir şey gördü - kırmızı, parıl parıl bir araba!
'Vay canına!' diye bağırdı. Dizlerinin üstüne çöktü, arabayı dikkatle aldı eline.
Tekerlekleri çevirdi, 'Vııın vııın!' diye sesler çıkardı. Gözleri mutluluktan parıldadı.
Tam o sırada, arkasından bir ses duydu: 'Merhaba!' ${character.name} döndü ve küçük bir sincap gördü."

SAHNE UNSURLARI (HEPSİ OLMALI):
1. AÇILIŞ: Nerede, ne görüyor
2. EYLEM: Somut hareket (tuttu, baktı, koştu)
3. GÖRSEL: Renk, şekil, nesne
4. SES: Diyalog veya ses efekti
5. DUYGU: İçsel tepki
6. GEÇİŞ: Sonraki sahneye köprü

KARAKTER:
- İsim: ${character.name}
- Tür: ${character.type}
- Yaş: ${character.age}
- Görünüm: ${character.appearance}
- Konuşma: ${character.speechStyle}`;

  const userPrompt = `SAHNE BEAT: "${beat}"
SAYFA: ${pageNumber}
HEDEF: ${sentencesPerPage} cümle, ${wordsPerPage} kelime (±15 OK)

GÖREV: Beat'i CANLI SAHNEYE dönüştür.

JSON:
{
  "text": "Sahne metni",
  "emotion": "excited/worried/happy/curious/sad/proud",
  "visualElements": ["görsel eleman 1", "görsel eleman 2", ...]
}`;

  return { system: systemPrompt, user: userPrompt };
}

// ============================================
// IMAGE GENERATION PROMPTS (Flux)
// ============================================

/**
 * Story Visual Prompt V2 - Prompt Guru Edition
 * With Enhanced Character Consistency
 *
 * Key Principles for Flux:
 * 1. FIRST 15 TOKENS: CHARACTER ANCHOR (HIGHEST PRIORITY!)
 * 2. NEXT 10 TOKENS: Format declaration
 * 3. NO NEGATIVE PROMPTS: Use positive alternatives
 * 4. WEIGHT SYNTAX: (keyword:1.3) for emphasis
 * 5. CHARACTER DNA: Same anchor tags in EVERY page
 */
export function buildStoryImagePromptV2(
  character: CharacterV2,
  scene: SceneV2,
  style: StoryStyleV2,
  characterDNA?: CharacterDNA
): string {
  // Generate DNA if not provided
  const dna = characterDNA || generateCharacterDNA(character);

  // ==========================================
  // LAYER 1: CHARACTER ANCHOR (Token 1-15) - HIGHEST PRIORITY!
  // This MUST be EXACTLY the same in EVERY page
  // ==========================================
  const layer1 = dna.anchorTags;
  // ~15 tokens - CHARACTER FIRST for consistency!

  // ==========================================
  // LAYER 2: FORMAT DECLARATION (Token 16-25)
  // ==========================================
  const layer2 = `(children's storybook watercolor illustration:1.4), soft pastel colors`;
  // ~8 tokens

  // ==========================================
  // LAYER 3: SCENE ELEMENTS (Token 26-40)
  // ==========================================
  const visualElementsClean = scene.visualElements
    .map(el => el.replace(/detailed|complex|intricate/gi, 'simple'))
    .slice(0, 3) // Reduced to 3 for token budget
    .join(', ');

  const emotionStyle = getEmotionStyle(scene.emotion);

  const layer3 = `${visualElementsClean}, ${emotionStyle}`;
  // ~12 tokens

  // ==========================================
  // LAYER 4: COMPOSITION (Token 41-50)
  // ==========================================
  let composition = '';
  if (scene.pageNumber === 1) {
    composition = '(character introduction:1.3), centered composition';
  } else if (scene.pageNumber === scene.totalPages) {
    composition = 'happy ending, (satisfied smile:1.2)';
  } else {
    composition = 'story scene, character focus';
  }

  const layer4 = composition;
  // ~6 tokens

  // ==========================================
  // LAYER 5: STYLE (Token 51-60)
  // ==========================================
  const colorPaletteText = style.colorPalette.slice(0, 3).join(', ');
  const layer5 = `${colorPaletteText}, ${style.mood}`;
  // ~8 tokens

  // ==========================================
  // LAYER 6: QUALITY (Token 61-70)
  // ==========================================
  const layer6 = `(plain background:1.3), professional children's book art`;
  // ~6 tokens

  // Combine all layers
  const prompt = [layer1, layer2, layer3, layer4, layer5, layer6].join(', ');

  logger.info('[StoryPromptV2] Generated image prompt with DNA:', {
    character: character.name,
    pageNumber: scene.pageNumber,
    seed: dna.consistencySeed,
    tokenEstimate: prompt.split(/\s+/).length,
    anchorTags: dna.anchorTags.substring(0, 50) + '...'
  });

  return prompt;
}

/**
 * Build Flux-optimized natural language prompt for story images
 * With Enhanced Character Consistency
 *
 * Flux prefers explicit natural language instructions
 * CHARACTER DESCRIPTION FIRST for maximum attention
 */
export function buildFluxStoryPromptV2(
  character: CharacterV2,
  scene: SceneV2,
  style: StoryStyleV2,
  characterDNA?: CharacterDNA
): string {
  // Generate DNA if not provided
  const dna = characterDNA || generateCharacterDNA(character);

  const cleanedAppearance = cleanAppearanceForFlux(character.appearance);
  const emotionDesc = getEmotionDescription(scene.emotion);
  const visualElements = scene.visualElements.slice(0, 3).join(', ');

  // Page position description
  let pagePosition = 'middle of the story';
  if (scene.pageNumber === 1) {
    pagePosition = 'story opening - introduce the character clearly';
  } else if (scene.pageNumber === scene.totalPages) {
    pagePosition = 'happy ending - character looks satisfied and content';
  }

  // Flux-optimized natural language prompt
  // CHARACTER FIRST for consistency (highest attention area)
  const prompt = `MAIN CHARACTER (MUST BE CONSISTENT - this is page ${scene.pageNumber} of ${scene.totalPages}):
${dna.anchorTags}
Physical appearance: ${cleanedAppearance}
Expression: ${emotionDesc}

Create a professional children's storybook illustration featuring this EXACT character.

SCENE: ${visualElements}. This is ${pagePosition}.

ART STYLE: Soft pastel watercolor, gentle brush strokes, rounded shapes, warm and inviting.

COLORS: ${style.colorPalette.slice(0, 3).join(', ')}. Mood: ${style.mood}.

CRITICAL: Keep the character's appearance EXACTLY the same as described above. Same colors, same features, same style across all pages.`;

  return prompt;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Clean appearance text for Flux
 * Remove words that cause contradictions
 */
function cleanAppearanceForFlux(appearance: string): string {
  // Words that conflict with "simple, clean" illustration style
  const removeWords = [
    'detailed', 'intricate', 'complex', 'elaborate', 'realistic',
    'photorealistic', 'hyper-detailed', 'ornate', 'fancy'
  ];

  let cleaned = appearance;
  removeWords.forEach(word => {
    cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  });

  // Clean up multiple spaces
  cleaned = cleaned.replace(/\\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Convert emotion to visual style descriptor
 */
function getEmotionStyle(emotion: string): string {
  const emotionMap: Record<string, string> = {
    excited: '(bright energetic colors:1.2), dynamic pose, sparkling eyes',
    worried: 'soft muted tones, gentle expression, concerned posture',
    happy: '(warm cheerful colors:1.3), big smile, joyful pose',
    curious: 'attentive eyes, exploring posture, wonder-filled atmosphere',
    sad: 'gentle pastels, empathetic expression, comforting atmosphere',
    proud: 'confident posture, warm glowing light, accomplished expression'
  };

  return emotionMap[emotion] || 'friendly expression, warm atmosphere';
}

/**
 * Get natural language emotion description
 */
function getEmotionDescription(emotion: string): string {
  const emotionDescMap: Record<string, string> = {
    excited: 'eyes sparkling with excitement, energetic and lively',
    worried: 'slightly concerned, thoughtful expression',
    happy: 'big warm smile, radiating joy',
    curious: 'wide-eyed with wonder, attentive and engaged',
    sad: 'gentle, contemplative, seeking comfort',
    proud: 'confident, accomplished, standing tall'
  };

  return emotionDescMap[emotion] || 'friendly and approachable';
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export interface PromptValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
}

/**
 * Validate story image prompt for Flux optimization
 */
export function validateStoryPrompt(prompt: string): PromptValidationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Check 1: Token count (CLIP limit ~77)
  const tokenCount = prompt.split(/\\s+/).length;
  if (tokenCount > 150) {
    issues.push(`Prompt too long: ${tokenCount} words (Flux works best under 150)`);
    suggestions.push('Reduce redundant descriptions');
    score -= 15;
  }

  // Check 2: Format declaration in first 20 tokens
  const first20Tokens = prompt.split(/\\s+/).slice(0, 20).join(' ').toLowerCase();
  const hasFormatDeclaration =
    first20Tokens.includes('illustration') ||
    first20Tokens.includes('watercolor') ||
    first20Tokens.includes('storybook');

  if (!hasFormatDeclaration) {
    issues.push('Format declaration not in first 20 tokens');
    suggestions.push('Move "children\'s storybook illustration" to the beginning');
    score -= 20;
  }

  // Check 3: No negative words (Flux doesn't handle them well)
  const negativePatterns = ['no ', 'not ', 'without ', "don't ", 'never ', 'avoid '];
  negativePatterns.forEach(pattern => {
    if (prompt.toLowerCase().includes(pattern)) {
      issues.push(`Negative word found: "${pattern.trim()}"`);
      suggestions.push('Use positive alternatives instead');
      score -= 10;
    }
  });

  // Check 4: Contradictions
  const contradictions = [
    { word1: 'detailed', word2: 'simple' },
    { word1: 'realistic', word2: 'cartoon' },
    { word1: 'complex', word2: 'clean' },
    { word1: 'intricate', word2: 'minimal' }
  ];

  const lowerPrompt = prompt.toLowerCase();
  contradictions.forEach(({ word1, word2 }) => {
    if (lowerPrompt.includes(word1) && lowerPrompt.includes(word2)) {
      issues.push(`Contradiction: "${word1}" vs "${word2}"`);
      suggestions.push(`Remove "${word1}" - conflicts with "${word2}"`);
      score -= 15;
    }
  });

  // Check 5: Has weight syntax (good practice)
  if (!prompt.includes(':1.')) {
    suggestions.push('Consider using weight syntax (keyword:1.3) for important elements');
  }

  return {
    isValid: score >= 70,
    score,
    issues,
    suggestions
  };
}

// ============================================
// DEFAULT STYLES
// ============================================

export const DEFAULT_STORY_STYLE: StoryStyleV2 = {
  artStyle: 'soft watercolor, gentle brush strokes, rounded shapes',
  colorPalette: ['warm pastel pink', 'soft sky blue', 'gentle yellow', 'mint green'],
  mood: 'friendly, safe, warm atmosphere'
};

export function getStoryStyleForAge(age: number): StoryStyleV2 {
  if (age <= 3) {
    return {
      artStyle: 'very simple shapes, bold colors, minimal detail',
      colorPalette: ['bright red', 'sunny yellow', 'sky blue', 'grass green'],
      mood: 'cheerful, simple, comforting'
    };
  } else if (age <= 6) {
    return {
      artStyle: 'soft watercolor, rounded shapes, gentle lines',
      colorPalette: ['warm pink', 'soft blue', 'creamy yellow', 'mint green'],
      mood: 'warm, friendly, magical'
    };
  } else if (age <= 9) {
    return {
      artStyle: 'watercolor with details, expressive characters',
      colorPalette: ['rich teal', 'warm orange', 'deep purple', 'forest green'],
      mood: 'adventurous, engaging, dynamic'
    };
  } else {
    return {
      artStyle: 'detailed watercolor, sophisticated composition',
      colorPalette: ['burgundy', 'navy blue', 'gold', 'emerald'],
      mood: 'mature, thought-provoking, inspiring'
    };
  }
}

// ============================================
// EXPORTS
// ============================================

export default {
  // Character DNA System
  generateCharacterDNA,
  getPageSeed,
  // Prompt Builders
  buildStoryOutlinePrompt,
  buildSceneExpansionPrompt,
  buildStoryImagePromptV2,
  buildFluxStoryPromptV2,
  // Validation
  validateStoryPrompt,
  // Styles
  DEFAULT_STORY_STYLE,
  getStoryStyleForAge
};
