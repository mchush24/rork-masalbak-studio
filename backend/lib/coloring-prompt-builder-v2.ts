/**
 * ColoringPromptBuilder V2 - Prompt Guru Edition
 *
 * Araştırma bulgularına dayalı tamamen yeni mimari:
 *
 * 1. İlk 20 token kritik - format declaration burada
 * 2. Negatif prompt YOK - sadece pozitif/antonym kullan
 * 3. Ağırlık sözdizimi desteği: (keyword:1.3)
 * 4. Çelişki kontrolü
 * 5. 3-5 kritik kısıtlama (20 değil!)
 *
 * Kaynaklar:
 * - ArXiv: Negative prompt delay research
 * - getimg.ai: Flux prompt guide
 * - CLIP: First 20 tokens effective length
 */

import { logger } from "./utils.js";

// ============================================
// TYPES
// ============================================

export type AgeGroup = 'toddler' | 'preschool' | 'early_elementary' | 'late_elementary';
export type Category = 'animal' | 'character' | 'nature' | 'vehicle' | 'fantasy' | 'family' | 'object';

export interface PromptConfig {
  subject: string;
  ageGroup: AgeGroup;
  category?: Category;
  therapeutic?: {
    enabled: boolean;
    theme?: string;
  };
}

// ============================================
// ANTONYM DICTIONARY
// ============================================

/**
 * Negatif ifadeleri pozitif karşılıklarına çevirir
 * "NO X" demek yerine "Y" de - AI daha iyi anlar
 */
const ANTONYM_MAP: Record<string, string> = {
  // Texture → Smooth
  'fur': 'smooth surface',
  'texture': 'flat clean surface',
  'hair strands': 'simple curved lines',
  'scales': 'smooth skin',
  'feathers': 'smooth wings',

  // Fills → White interior
  'black fill': 'white interior',
  'solid fill': 'empty inside',
  'shading': 'flat style',
  'gradient': 'solid lines',
  'gray': 'pure black and white',

  // Complexity → Simple
  'detailed': 'simple',
  'intricate': 'basic shapes',
  'complex': 'minimal',
  'realistic': 'cartoon style',

  // Background → Plain
  'scenery': 'plain white background',
  'grass': 'clean white space',
  'background elements': 'floating on white',
};

// ============================================
// AGE-SPECIFIC CONFIGURATIONS
// ============================================

interface AgeConfig {
  lineWeight: string;
  sectionCount: string;
  complexity: string;
  shapes: string;
  subjectTransform: (subject: string) => string;
}

const AGE_CONFIGS: Record<AgeGroup, AgeConfig> = {
  toddler: {
    lineWeight: '(thick bold 5pt strokes:1.4)',
    sectionCount: '3-5 large sections',
    complexity: '(extremely simple:1.5)',
    shapes: '(basic round shapes only:1.3)',
    subjectTransform: (s) => {
      // Remove all complex words, add "simple round"
      return `simple round ${s.replace(/fluffy|furry|detailed|realistic|complex/gi, '').trim()}`;
    }
  },
  preschool: {
    lineWeight: '(thick 4pt strokes:1.3)',
    sectionCount: '5-8 sections',
    complexity: '(simple clean:1.3)',
    shapes: '(smooth rounded shapes:1.2)',
    subjectTransform: (s) => {
      return `cute simple ${s.replace(/fluffy|furry|detailed|realistic/gi, '').trim()}`;
    }
  },
  early_elementary: {
    lineWeight: '(medium 3pt strokes:1.2)',
    sectionCount: '10-15 sections',
    complexity: 'moderately detailed',
    shapes: 'clear defined shapes',
    subjectTransform: (s) => s
  },
  late_elementary: {
    lineWeight: '(medium 2pt strokes:1.1)',
    sectionCount: '15-25 sections',
    complexity: 'detailed engaging',
    shapes: 'varied interesting shapes',
    subjectTransform: (s) => s
  }
};

// ============================================
// CATEGORY STYLES (Positive only!)
// ============================================

const CATEGORY_STYLES: Record<Category, string> = {
  animal: '(smooth cartoon animal:1.3), rounded body, simple dot eyes, cute friendly',
  character: 'cartoon character, simple clothing shapes, friendly expression',
  nature: 'stylized flowers plants, (smooth petal outlines:1.2), separated elements',
  vehicle: 'toy-like vehicle, (simple geometric body:1.3), circular wheels',
  fantasy: '(cute magical creature:1.3), smooth simple outline, friendly appearance',
  family: 'simple cartoon people, basic body shapes, (minimal face features:1.2)',
  object: 'clean simple outline, recognizable shape, (smooth edges:1.2)'
};

// ============================================
// CORE PROMPT BUILDER
// ============================================

/**
 * V2 Prompt Builder - Araştırma Tabanlı Yeni Mimari
 *
 * Mantık Zinciri:
 * 1. LAYER 1 (Token 1-7): Format declaration - EN KRİTİK
 * 2. LAYER 2 (Token 8-15): Output style - Pozitif tanımlar
 * 3. LAYER 3 (Token 16-30): Subject - Yaşa göre basitleştirilmiş
 * 4. LAYER 4 (Token 31-50): Quality constraints - Ağırlıklı
 * 5. NO NEGATIVE PROMPT - Flux desteklemiyor!
 */
export function buildPromptV2(config: PromptConfig): string {
  const ageConfig = AGE_CONFIGS[config.ageGroup];
  const categoryStyle = config.category ? CATEGORY_STYLES[config.category] : '';

  // Transform subject based on age
  let subject = ageConfig.subjectTransform(config.subject);

  // Apply therapeutic theme if enabled
  if (config.therapeutic?.enabled && config.therapeutic.theme) {
    subject = config.therapeutic.theme;
  }

  // ==========================================
  // LAYER 1: FORMAT DECLARATION (İlk 7 token - EN KRİTİK!)
  // ==========================================
  const layer1 = `(black white line art coloring page:1.5)`;
  // Token count: ~7

  // ==========================================
  // LAYER 2: OUTPUT STYLE (Token 8-15)
  // Pozitif tanımlar - "NO X" yerine "Y" kullan
  // ==========================================
  const layer2 = `(clean outlines only:1.4), (white interior all shapes:1.4), flat style`;
  // Token count: ~8

  // ==========================================
  // LAYER 3: SUBJECT (Token 16-30)
  // Yaşa göre basitleştirilmiş
  // ==========================================
  const layer3 = `${subject}, ${categoryStyle}`;
  // Token count: ~15

  // ==========================================
  // LAYER 4: AGE-APPROPRIATE SPECS (Token 31-50)
  // ==========================================
  const layer4 = `${ageConfig.lineWeight}, ${ageConfig.sectionCount}, ${ageConfig.complexity}, ${ageConfig.shapes}`;
  // Token count: ~15

  // ==========================================
  // LAYER 5: QUALITY CONSTRAINTS (Token 51-70)
  // Sadece 3-5 kritik kısıtlama!
  // ==========================================
  const layer5 = `(closed connected lines:1.3), (ready for bucket fill:1.2), professional coloring book`;
  // Token count: ~10

  // ==========================================
  // LAYER 6: BACKGROUND (Token 71-77)
  // Pozitif tanım!
  // ==========================================
  const layer6 = `(plain pure white background:1.4), floating centered`;
  // Token count: ~7

  // Combine all layers
  const prompt = [layer1, layer2, layer3, layer4, layer5, layer6].join(', ');

  logger.info('[PromptBuilderV2] Generated prompt:', {
    ageGroup: config.ageGroup,
    category: config.category,
    tokenEstimate: prompt.split(/\s+/).length,
    firstTokens: prompt.substring(0, 100)
  });

  return prompt;
}

// ============================================
// FLUX-SPECIFIC BUILDER
// ============================================

/**
 * Flux için özel builder
 * - Negatif prompt YOK (Flux desteklemiyor!)
 * - Natural language style
 * - Explicit instructions
 */
export function buildFluxPromptV2(config: PromptConfig): string {
  const ageConfig = AGE_CONFIGS[config.ageGroup];
  const categoryStyle = config.category ? CATEGORY_STYLES[config.category] : '';

  let subject = ageConfig.subjectTransform(config.subject);
  if (config.therapeutic?.enabled && config.therapeutic.theme) {
    subject = config.therapeutic.theme;
  }

  // Flux prefers natural language over keyword lists
  const prompt = `Create a professional children's coloring book page.

OUTPUT FORMAT: Black and white line art only. Every area inside the outlines must be pure white (empty for coloring). Use ${ageConfig.lineWeight.replace(/[()]/g, '')} for all lines.

SUBJECT: ${subject}. Style: ${categoryStyle.replace(/[():\d.]/g, '')}.

REQUIREMENTS:
1. All outlines must be closed and connected (for bucket fill tool)
2. ${ageConfig.complexity} design with ${ageConfig.sectionCount}
3. ${ageConfig.shapes}
4. Plain pure white background only - subject floating centered

STYLE: Smooth clean outlines, cartoon illustration, professional coloring book quality. No texture lines, no shading, no gray tones. All shapes have white interior with black outline border.`;

  return prompt;
}

// ============================================
// SUBJECT SIMPLIFIER (Enhanced)
// ============================================

/**
 * Gelişmiş konu basitleştirici
 * Çelişki yaratan kelimeleri kaldırır
 */
export function simplifySubject(subject: string, ageGroup: AgeGroup): string {
  // Words that create contradictions with "simple/clean" requirements
  const contradictoryWords = [
    'fluffy', 'furry', 'hairy', 'fuzzy', 'shaggy',  // Texture words
    'detailed', 'intricate', 'complex', 'elaborate', // Complexity words
    'realistic', 'photorealistic', 'lifelike',      // Realism words
    'ornate', 'decorated', 'patterned',              // Pattern words
  ];

  let simplified = subject.toLowerCase();

  // Remove contradictory words
  contradictoryWords.forEach(word => {
    simplified = simplified.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
  });

  // Clean up
  simplified = simplified.replace(/\s+/g, ' ').trim();

  // Add age-appropriate prefix
  if (ageGroup === 'toddler') {
    simplified = `simple round ${simplified}`;
  } else if (ageGroup === 'preschool') {
    simplified = `cute simple ${simplified}`;
  }

  return simplified;
}

// ============================================
// PROMPT VALIDATOR
// ============================================

interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
}

/**
 * Prompt kalite doğrulayıcı
 * Çelişkileri ve sorunları tespit eder
 */
export function validatePrompt(prompt: string, config: PromptConfig): ValidationResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Check 1: First 20 tokens should contain format declaration
  const first20Tokens = prompt.split(/\s+/).slice(0, 20).join(' ').toLowerCase();
  if (!first20Tokens.includes('black') || !first20Tokens.includes('white') || !first20Tokens.includes('line')) {
    issues.push('Format declaration not in first 20 tokens');
    suggestions.push('Move "black white line art" to the beginning');
    score -= 25;
  }

  // Check 2: No contradictions
  const contradictions = [
    { word1: 'fluffy', word2: 'smooth' },
    { word1: 'detailed', word2: 'simple' },
    { word1: 'realistic', word2: 'cartoon' },
    { word1: 'textured', word2: 'flat' },
  ];

  const lowerPrompt = prompt.toLowerCase();
  contradictions.forEach(({ word1, word2 }) => {
    if (lowerPrompt.includes(word1) && lowerPrompt.includes(word2)) {
      issues.push(`Contradiction detected: "${word1}" vs "${word2}"`);
      suggestions.push(`Remove "${word1}" - it conflicts with "${word2}"`);
      score -= 15;
    }
  });

  // Check 3: No negative words (Flux doesn't support them well)
  const negativePatterns = ['no ', 'not ', 'without ', "don't ", 'never '];
  negativePatterns.forEach(pattern => {
    if (lowerPrompt.includes(pattern)) {
      issues.push(`Negative word detected: "${pattern.trim()}"`);
      suggestions.push('Use positive alternatives (antonyms) instead');
      score -= 10;
    }
  });

  // Check 4: Prompt length
  const tokenCount = prompt.split(/\s+/).length;
  if (tokenCount > 77) {
    issues.push(`Prompt too long: ${tokenCount} tokens (CLIP limit: 77)`);
    suggestions.push('Reduce to under 77 tokens');
    score -= 20;
  }

  // Check 5: Weight syntax usage
  if (!prompt.includes(':1.')) {
    suggestions.push('Consider using weight syntax (keyword:1.3) for emphasis');
  }

  return {
    isValid: score >= 70,
    score,
    issues,
    suggestions
  };
}

// ============================================
// EXPORTS
// ============================================

export default {
  buildPromptV2,
  buildFluxPromptV2,
  simplifySubject,
  validatePrompt,
  AGE_CONFIGS,
  CATEGORY_STYLES,
  ANTONYM_MAP
};
