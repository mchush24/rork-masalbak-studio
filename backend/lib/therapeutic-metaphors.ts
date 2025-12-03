/**
 * Therapeutic Metaphor System
 *
 * Transforms sensitive/traumatic keywords into healing metaphors
 * for story generation. This allows processing difficult topics
 * in a psychologically safe way for trauma-affected children.
 *
 * Based on narrative therapy and play therapy principles.
 */

export interface TherapeuticContext {
  hasSensitiveContent: boolean;
  keywords: string[];
  emotionalTone: 'trauma' | 'healing' | 'neutral';
  ageGroup?: number;
}

/**
 * Metaphor mapping: Transforms traumatic concepts into natural/healing imagery
 */
const THERAPEUTIC_METAPHORS: Record<string, string> = {
  // War & Conflict → Weather & Natural Forces
  "savaş": "büyük fırtına",
  "savaşan": "rüzgarlarla dans eden",
  "savaştaki": "fırtınadaki",
  "çatışma": "gök gürültüsü",
  "bomba": "şimşek",
  "patlama": "gök gürlemesi",
  "war": "great storm",
  "battle": "thunder",
  "conflict": "strong winds",

  // Violence → Physical Forces
  "şiddet": "çok güçlü rüzgar",
  "vurmak": "itmek",
  "dövmek": "sallamak",
  "kavga": "tartışma",
  "violence": "strong force",
  "hit": "push",
  "fight": "disagreement",

  // Death & Loss → Transition & Goodbye
  "ölüm": "vedalaşma",
  "öldü": "uzağa gitti",
  "öldürme": "uzaklaştırma",
  "kayıp": "ayrılık",
  "death": "farewell",
  "died": "went far away",
  "loss": "separation",

  // Injury → Healing
  "kan": "yara",
  "yaralı": "incinen",
  "acı": "zorluk",
  "blood": "wound",
  "injured": "hurt",
  "pain": "difficulty",

  // Weapons → Objects
  "silah": "keskin nesne",
  "bıçak": "alet",
  "ateş": "ısı",
  "weapon": "sharp object",
  "knife": "tool",
  "fire": "heat",
};

/**
 * Healing words to include in therapeutic stories
 */
const HEALING_VOCABULARY = [
  // Turkish
  "umut", "güvenli", "güven", "arkadaş", "yardım", "yardımlaşma",
  "iyileşme", "iyileşmek", "barış", "huzur", "sevgi", "koruma",
  "güçlü", "cesur", "dayanıklı", "birlikte", "aile", "yuva",
  "sıcak", "ışık", "güneş", "gökkuşağı", "yıldız", "ay",

  // English
  "hope", "safe", "safety", "friend", "help", "healing",
  "peace", "calm", "love", "protect", "strong", "brave",
  "resilient", "together", "family", "home", "warm", "light"
];

/**
 * Three-phase therapeutic story structure
 */
export const THERAPEUTIC_STORY_PHASES = {
  validation: {
    purpose: "Acknowledge and validate the difficult experience",
    tone: "empathetic, understanding, non-judgmental",
    keywords: ["zordu", "zor zamanlar", "was difficult", "dark times"]
  },
  processing: {
    purpose: "Transform trauma through metaphor and play",
    tone: "gentle, imaginative, symbolic",
    keywords: ["dönüşüm", "değişim", "transformation", "change"]
  },
  integration: {
    purpose: "Rebuild safety, hope, and resilience",
    tone: "hopeful, empowering, safe",
    keywords: HEALING_VOCABULARY
  }
};

/**
 * Detect if content has sensitive/traumatic themes
 */
export function detectTherapeuticContext(text: string): TherapeuticContext {
  const lowerText = text.toLowerCase();
  const detectedKeywords: string[] = [];

  // Check for sensitive keywords
  for (const [key, _] of Object.entries(THERAPEUTIC_METAPHORS)) {
    if (lowerText.includes(key.toLowerCase())) {
      detectedKeywords.push(key);
    }
  }

  const hasSensitiveContent = detectedKeywords.length > 0;

  // Determine emotional tone
  let emotionalTone: 'trauma' | 'healing' | 'neutral' = 'neutral';
  if (hasSensitiveContent) {
    // Check if healing words are also present
    const hasHealingWords = HEALING_VOCABULARY.some(word =>
      lowerText.includes(word.toLowerCase())
    );
    emotionalTone = hasHealingWords ? 'healing' : 'trauma';
  }

  return {
    hasSensitiveContent,
    keywords: detectedKeywords,
    emotionalTone
  };
}

/**
 * Transform text using therapeutic metaphors
 */
export function transformToTherapeuticLanguage(text: string): string {
  let transformed = text;

  // Replace each sensitive keyword with healing metaphor
  for (const [keyword, metaphor] of Object.entries(THERAPEUTIC_METAPHORS)) {
    const regex = new RegExp(keyword, 'gi');
    transformed = transformed.replace(regex, metaphor);
  }

  return transformed;
}

/**
 * Generate therapeutic story prompt for AI
 */
export function createTherapeuticPrompt(
  originalText: string,
  phase: 'validation' | 'processing' | 'integration',
  language: 'tr' | 'en' = 'tr'
): string {
  const context = detectTherapeuticContext(originalText);
  const transformedText = transformToTherapeuticLanguage(originalText);
  const phaseInfo = THERAPEUTIC_STORY_PHASES[phase];

  // Build therapeutic prompt
  const basePrompt = language === 'tr'
    ? `Çocuk kitabı illüstrasyonu, yumuşak pastel renkler, yuvarlak formlar, dostça atmosfer.`
    : `Children's book illustration, soft pastel colors, round shapes, friendly atmosphere.`;

  const therapeuticContext = language === 'tr'
    ? `Terapötik masal: ${phaseInfo.purpose}. Ton: ${phaseInfo.tone}.`
    : `Therapeutic story: ${phaseInfo.purpose}. Tone: ${phaseInfo.tone}.`;

  // Add healing elements based on phase
  let healingElements = '';
  if (phase === 'validation') {
    healingElements = language === 'tr'
      ? 'Güvenli bir yer, anlayışlı karakterler, kabul edici atmosfer.'
      : 'Safe space, understanding characters, accepting atmosphere.';
  } else if (phase === 'processing') {
    healingElements = language === 'tr'
      ? 'Doğa metaforları, dönüşüm, umut ışığı, destek.'
      : 'Nature metaphors, transformation, ray of hope, support.';
  } else {
    healingElements = language === 'tr'
      ? 'Güneşli gün, gökkuşağı, arkadaşlık, mutluluk, barış.'
      : 'Sunny day, rainbow, friendship, happiness, peace.';
  }

  return `${basePrompt} ${therapeuticContext} ${healingElements} Tema: ${transformedText}`;
}

/**
 * Generate 3-phase therapeutic story pages
 */
export function generateTherapeuticStory(
  title: string,
  childDrawingContext: string,
  language: 'tr' | 'en' = 'tr'
): Array<{ text: string; prompt: string }> {
  const context = detectTherapeuticContext(childDrawingContext);

  if (!context.hasSensitiveContent) {
    // No sensitive content, use normal story generation
    return [];
  }

  // Transform the sensitive content
  const transformedContext = transformToTherapeuticLanguage(childDrawingContext);

  // Generate 3-phase story
  const pages = [];

  // Phase 1: VALIDATION (2 pages)
  if (language === 'tr') {
    pages.push({
      text: `${title} başlıyor. Bazen hayat zor olabilir ve bu normal.`,
      prompt: createTherapeuticPrompt(transformedContext, 'validation', language)
    });
    pages.push({
      text: `Küçük kahramanımız zor günler geçirdi, ama yalnız değildi.`,
      prompt: createTherapeuticPrompt('güvenli yer, destek', 'validation', language)
    });
  } else {
    pages.push({
      text: `${title} begins. Sometimes life can be hard, and that's okay.`,
      prompt: createTherapeuticPrompt(transformedContext, 'validation', language)
    });
    pages.push({
      text: `Our little hero had difficult days, but was not alone.`,
      prompt: createTherapeuticPrompt('safe place, support', 'validation', language)
    });
  }

  // Phase 2: PROCESSING (3 pages)
  if (language === 'tr') {
    pages.push({
      text: `Büyük fırtına geldiğinde, güçlü olmayı öğrendi.`,
      prompt: createTherapeuticPrompt(transformedContext, 'processing', language)
    });
    pages.push({
      text: `Arkadaşları yardım etti ve birlikte daha güçlü oldular.`,
      prompt: createTherapeuticPrompt('arkadaşlık, birlikte', 'processing', language)
    });
    pages.push({
      text: `Zaman geçtikçe, fırtına sakinleşmeye başladı.`,
      prompt: createTherapeuticPrompt('huzur, dönüşüm', 'processing', language)
    });
  } else {
    pages.push({
      text: `When the great storm came, they learned to be strong.`,
      prompt: createTherapeuticPrompt(transformedContext, 'processing', language)
    });
    pages.push({
      text: `Friends helped, and together they became stronger.`,
      prompt: createTherapeuticPrompt('friendship, together', 'processing', language)
    });
    pages.push({
      text: `As time passed, the storm began to calm.`,
      prompt: createTherapeuticPrompt('peace, transformation', 'processing', language)
    });
  }

  // Phase 3: INTEGRATION (2 pages)
  if (language === 'tr') {
    pages.push({
      text: `Artık gökkuşağı gökyüzünde parlıyordu. Umut hep vardı.`,
      prompt: createTherapeuticPrompt('umut, gökkuşağı, güneş', 'integration', language)
    });
    pages.push({
      text: `Ve böylece, güçlü ve cesur bir kalple yeni günlere hazır oldular.`,
      prompt: createTherapeuticPrompt('mutluluk, güvenli gelecek', 'integration', language)
    });
  } else {
    pages.push({
      text: `Now the rainbow shone in the sky. Hope was always there.`,
      prompt: createTherapeuticPrompt('hope, rainbow, sun', 'integration', language)
    });
    pages.push({
      text: `And so, with a strong and brave heart, they were ready for new days.`,
      prompt: createTherapeuticPrompt('happiness, safe future', 'integration', language)
    });
  }

  return pages;
}

/**
 * Check if user input suggests therapeutic intent
 */
export function isTherapeuticIntent(text: string): boolean {
  const therapeuticIndicators = [
    // Turkish
    'etkilenmiş', 'gördü', 'yaşadı', 'travma', 'deprem', 'savaş',
    'korkuyor', 'üzgün', 'kabus', 'endişeli', 'korku',

    // English
    'affected', 'witnessed', 'experienced', 'trauma', 'earthquake', 'war',
    'afraid', 'sad', 'nightmare', 'anxious', 'fear'
  ];

  const lowerText = text.toLowerCase();
  return therapeuticIndicators.some(indicator => lowerText.includes(indicator));
}
