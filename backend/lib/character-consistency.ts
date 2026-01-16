/**
 * Character Consistency System
 * V2 - Prompt Guru Edition
 *
 * Ensures all story pages have consistent character appearance
 * by defining character traits upfront and using them in all prompts.
 *
 * Prompt Guru Principles:
 * - First 20 tokens: Format declaration (CRITICAL for Flux)
 * - Positive language only (no negatives)
 * - Weight syntax for emphasis (keyword:1.3)
 * - Clean, contradiction-free prompts
 */

import {
  buildFluxStoryPromptV2,
  getStoryStyleForAge,
  type CharacterV2,
  type SceneV2,
  type StoryStyleV2
} from "./story-prompt-builder-v2.js";

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
 * V2 - Prompt Guru Edition
 *
 * Key Principles:
 * - First 20 tokens: Format declaration (CRITICAL)
 * - No negative language
 * - Weight syntax for emphasis
 * - Balance character consistency with scene uniqueness
 */
export function generateConsistentPrompt(
  character: CharacterDefinition,
  style: StoryStyle,
  pageText: string,
  sceneDescription: string,
  pageNumber: number,
  totalPages: number
): string {
  // Extract age as number
  const ageMatch = character.age.match(/\d+/);
  const ageNumber = ageMatch ? parseInt(ageMatch[0]) : 5;

  // Extract visual elements from scene description
  const visualElements = sceneDescription.split(/[,.-]/).map(s => s.trim()).filter(Boolean);
  const actionWords = extractActionFromText(pageText);
  if (actionWords && actionWords !== 'character in scene') {
    visualElements.push(actionWords);
  }

  // Detect emotion from action words and page position
  let emotion = 'happy';
  if (pageNumber === 1) emotion = 'curious';
  else if (pageNumber === totalPages) emotion = 'proud';
  else if (pageText.toLowerCase().includes('korku') || pageText.toLowerCase().includes('endişe')) emotion = 'worried';
  else if (pageText.toLowerCase().includes('heyecan')) emotion = 'excited';

  // Convert to V2 format
  const characterV2: CharacterV2 = {
    name: character.name,
    type: character.appearance.split(':')[0]?.trim() || 'animal',
    gender: 'female', // Default
    age: ageNumber,
    appearance: character.appearance,
    personality: character.style.split(',').map(s => s.trim()),
    speechStyle: 'friendly'
  };

  const sceneV2: SceneV2 = {
    pageNumber,
    totalPages,
    beat: sceneDescription,
    emotion,
    visualElements
  };

  // Use V2 Flux-optimized prompt builder
  const styleV2: StoryStyleV2 = {
    artStyle: style.artStyle,
    colorPalette: style.colorPalette.split(',').map(s => s.trim()),
    mood: style.mood
  };

  return buildFluxStoryPromptV2(characterV2, sceneV2, styleV2);
}

/**
 * Extract action verbs and key elements from text for scene uniqueness
 * Comprehensive Turkish verb mapping for accurate scene description
 */
function extractActionFromText(text: string): string {
  const lowerText = text.toLowerCase();
  const actions: string[] = [];

  // Comprehensive Turkish action verbs (past tense, present continuous, infinitive)
  const actionMap: Record<string, string> = {
    // Movement verbs
    'koştu': 'running', 'koşuyor': 'running', 'koşmak': 'running', 'koşarak': 'running',
    'zıpladı': 'jumping', 'zıplıyor': 'jumping', 'zıplamak': 'jumping', 'zıplayarak': 'jumping',
    'uçtu': 'flying', 'uçuyor': 'flying', 'uçmak': 'flying', 'uçarak': 'flying',
    'yürüdü': 'walking', 'yürüyor': 'walking', 'yürümek': 'walking', 'yürüyerek': 'walking',
    'tırmandı': 'climbing', 'tırmanıyor': 'climbing', 'tırmanmak': 'climbing',
    'yüzdü': 'swimming', 'yüzüyor': 'swimming', 'yüzmek': 'swimming',
    'kaydı': 'sliding', 'kayıyor': 'sliding', 'kaymak': 'sliding',
    'atladı': 'jumping over', 'atlıyor': 'jumping over', 'atlamak': 'jumping over',
    'düştü': 'falling', 'düşüyor': 'falling', 'düşmek': 'falling',
    'kalktı': 'standing up', 'kalkıyor': 'standing up', 'kalkmak': 'standing up',
    'döndü': 'turning', 'dönüyor': 'turning', 'dönmek': 'turning',

    // Posture verbs
    'oturdu': 'sitting', 'oturuyor': 'sitting', 'oturmak': 'sitting',
    'uyudu': 'sleeping', 'uyuyor': 'sleeping', 'uyumak': 'sleeping',
    'yattı': 'lying down', 'yatıyor': 'lying down', 'yatmak': 'lying down',
    'durdu': 'standing', 'duruyor': 'standing', 'durmak': 'standing',
    'eğildi': 'bending', 'eğiliyor': 'bending', 'eğilmek': 'bending',
    'uzandı': 'stretching', 'uzanıyor': 'stretching', 'uzanmak': 'stretching',

    // Emotional expressions
    'güldü': 'laughing', 'gülüyor': 'laughing', 'gülmek': 'laughing', 'gülerek': 'laughing',
    'ağladı': 'crying', 'ağlıyor': 'crying', 'ağlamak': 'crying',
    'şaşırdı': 'surprised', 'şaşırıyor': 'surprised', 'şaşırmak': 'surprised',
    'korktu': 'scared', 'korkuyor': 'scared', 'korkmak': 'scared',
    'sevindi': 'happy', 'seviniyor': 'happy', 'sevinmek': 'happy',
    'üzüldü': 'sad', 'üzülüyor': 'sad', 'üzülmek': 'sad',
    'kızdı': 'angry', 'kızıyor': 'angry', 'kızmak': 'angry',
    'meraklandı': 'curious', 'meraklanıyor': 'curious',
    'heyecanlandı': 'excited', 'heyecanlanıyor': 'excited',

    // Interaction verbs
    'baktı': 'looking', 'bakıyor': 'looking', 'bakmak': 'looking', 'bakarak': 'looking',
    'gördü': 'seeing', 'görüyor': 'seeing', 'görmek': 'seeing',
    'dinledi': 'listening', 'dinliyor': 'listening', 'dinlemek': 'listening',
    'duydu': 'hearing', 'duyuyor': 'hearing', 'duymak': 'hearing',
    'konuştu': 'talking', 'konuşuyor': 'talking', 'konuşmak': 'talking',
    'söyledi': 'saying', 'söylüyor': 'saying', 'söylemek': 'saying',
    'sordu': 'asking', 'soruyor': 'asking', 'sormak': 'asking',
    'cevapladı': 'answering', 'cevaplıyor': 'answering',

    // Physical interaction
    'sarıldı': 'hugging', 'sarılıyor': 'hugging', 'sarılmak': 'hugging',
    'öptü': 'kissing', 'öpüyor': 'kissing', 'öpmek': 'kissing',
    'tuttu': 'holding', 'tutuyor': 'holding', 'tutmak': 'holding',
    'bıraktı': 'releasing', 'bırakıyor': 'releasing', 'bırakmak': 'releasing',
    'itti': 'pushing', 'itiyor': 'pushing', 'itmek': 'pushing',
    'çekti': 'pulling', 'çekiyor': 'pulling', 'çekmek': 'pulling',
    'vurdu': 'hitting', 'vuruyor': 'hitting', 'vurmak': 'hitting',
    'dokundu': 'touching', 'dokunuyor': 'touching', 'dokunmak': 'touching',
    'okşadı': 'petting', 'okşuyor': 'petting', 'okşamak': 'petting',
    'el salladı': 'waving', 'el sallıyor': 'waving',

    // Object interaction
    'aldı': 'taking', 'alıyor': 'taking', 'almak': 'taking',
    'verdi': 'giving', 'veriyor': 'giving', 'vermek': 'giving',
    'buldu': 'finding', 'buluyor': 'finding', 'bulmak': 'finding',
    'kaybetti': 'losing', 'kaybediyor': 'losing', 'kaybetmek': 'losing',
    'açtı': 'opening', 'açıyor': 'opening', 'açmak': 'opening',
    'kapattı': 'closing', 'kapatıyor': 'closing', 'kapatmak': 'closing',
    'kırdı': 'breaking', 'kırıyor': 'breaking', 'kırmak': 'breaking',
    'yaptı': 'making', 'yapıyor': 'making', 'yapmak': 'making',
    'çizdi': 'drawing', 'çiziyor': 'drawing', 'çizmek': 'drawing',
    'boyadı': 'painting', 'boyuyor': 'painting', 'boyamak': 'painting',
    'yazdı': 'writing', 'yazıyor': 'writing', 'yazmak': 'writing',
    'okudu': 'reading', 'okuyor': 'reading', 'okumak': 'reading',

    // Activity verbs
    'oynadı': 'playing', 'oynuyor': 'playing', 'oynamak': 'playing',
    'yedi': 'eating', 'yiyor': 'eating', 'yemek': 'eating',
    'içti': 'drinking', 'içiyor': 'drinking', 'içmek': 'drinking',
    'dans etti': 'dancing', 'dans ediyor': 'dancing', 'dans etmek': 'dancing',
    'şarkı söyledi': 'singing', 'şarkı söylüyor': 'singing',
    'gizlendi': 'hiding', 'gizleniyor': 'hiding', 'gizlenmek': 'hiding',
    'aradı': 'searching', 'arıyor': 'searching', 'aramak': 'searching',
    'bekledi': 'waiting', 'bekliyor': 'waiting', 'beklemek': 'waiting',
    'yardım etti': 'helping', 'yardım ediyor': 'helping',
    'paylaştı': 'sharing', 'paylaşıyor': 'sharing', 'paylaşmak': 'sharing',

    // Nature/outdoor activities
    'topladı': 'collecting', 'topluyor': 'collecting', 'toplamak': 'collecting',
    'dikti': 'planting', 'dikiyor': 'planting', 'dikmek': 'planting',
    'suladı': 'watering', 'suluyor': 'watering', 'sulamak': 'watering',
    'kokladı': 'smelling', 'kokluyor': 'smelling', 'koklamak': 'smelling',
    'keşfetti': 'exploring', 'keşfediyor': 'exploring', 'keşfetmek': 'exploring',

    // Dream/imagination
    'hayal etti': 'imagining', 'hayal ediyor': 'imagining',
    'düşündü': 'thinking', 'düşünüyor': 'thinking', 'düşünmek': 'thinking',
    'rüya gördü': 'dreaming', 'rüya görüyor': 'dreaming',
  };

  for (const [turkish, english] of Object.entries(actionMap)) {
    if (lowerText.includes(turkish)) {
      actions.push(english);
    }
  }

  // Extract scene elements (locations/objects)
  const sceneElements: string[] = [];
  const sceneMap: Record<string, string> = {
    'orman': 'in forest', 'ormanda': 'in forest',
    'bahçe': 'in garden', 'bahçede': 'in garden',
    'ev': 'at home', 'evde': 'at home',
    'okul': 'at school', 'okulda': 'at school',
    'park': 'in park', 'parkta': 'in park',
    'deniz': 'by the sea', 'denizde': 'by the sea',
    'göl': 'by the lake', 'gölde': 'by the lake',
    'dağ': 'on mountain', 'dağda': 'on mountain',
    'gökyüzü': 'in sky', 'gökyüzünde': 'in sky',
    'kale': 'in castle', 'kalede': 'in castle',
    'mağara': 'in cave', 'mağarada': 'in cave',
    'köprü': 'on bridge', 'köprüde': 'on bridge',
    'nehir': 'by river', 'nehirde': 'by river',
    'çiçek': 'with flowers', 'çiçekler': 'with flowers',
    'ağaç': 'by tree', 'ağaçta': 'in tree',
    'bulut': 'in clouds', 'bulutlar': 'in clouds',
    'yıldız': 'under stars', 'yıldızlar': 'under stars',
    'ay': 'under moon', 'ayın': 'under moon',
    'güneş': 'in sunshine', 'güneşin': 'in sunshine',
  };

  for (const [turkish, english] of Object.entries(sceneMap)) {
    if (lowerText.includes(turkish)) {
      sceneElements.push(english);
    }
  }

  // Combine unique actions and scene elements
  const uniqueActions = [...new Set(actions)];
  const uniqueScenes = [...new Set(sceneElements)];

  const result: string[] = [];
  if (uniqueActions.length > 0) {
    result.push(uniqueActions.slice(0, 3).join(', '));
  }
  if (uniqueScenes.length > 0) {
    result.push(uniqueScenes.slice(0, 2).join(', '));
  }

  return result.length > 0 ? result.join(' - ') : 'character in scene';
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
