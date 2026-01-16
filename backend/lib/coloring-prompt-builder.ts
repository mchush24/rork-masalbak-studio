/**
 * ColoringPromptBuilder - Profesyonel Boyama Sayfası Prompt Oluşturucu
 *
 * Lake (Apple Design Award), Quiver ve KidloLand standartlarında
 * mükemmel boyama sayfaları için optimize edilmiş prompt sistemi.
 *
 * Temel Prensipler:
 * 1. Doğrudan LINE ART iste (renkli resmi çevirme!)
 * 2. Kapalı/bağlantılı çizgiler (fill için kritik)
 * 3. Yaşa uygun karmaşıklık
 * 4. Profesyonel kalınlık standartları
 */

import { logger } from "./utils.js";

// ============================================
// TYPES
// ============================================

export type AgeGroup = 'toddler' | 'preschool' | 'early_elementary' | 'late_elementary';
export type ColoringCategory = 'animal' | 'character' | 'nature' | 'vehicle' | 'fantasy' | 'family' | 'object' | 'educational';
export type ColoringStyle = 'simple' | 'detailed' | 'educational';

export interface ColoringPromptConfig {
  subject: string;
  ageGroup: AgeGroup;
  category?: ColoringCategory;
  style?: ColoringStyle;
  isTherapeutic?: boolean;
  therapeuticTheme?: string;
}

export interface AgeParameters {
  lineThickness: string;
  sections: string;
  detailLevel: string;
  shapes: string;
  complexity: string;
}

// ============================================
// AGE-BASED PARAMETERS
// ============================================

const AGE_PARAMETERS: Record<AgeGroup, AgeParameters> = {
  toddler: {
    lineThickness: '5-6pt extremely thick bold',
    sections: '3-5 very large',
    detailLevel: 'ZERO details - completely smooth outlines only',
    shapes: 'only basic geometric shapes: circles, ovals, simple curves - NO texture, NO fur, NO hair strands',
    complexity: 'EXTREMELY SIMPLE like Fisher-Price toy - just basic outline shape'
  },
  preschool: {
    lineThickness: '4-5pt thick bold',
    sections: '5-8 large',
    detailLevel: 'minimal inner details - only essential features like eyes and mouth',
    shapes: 'simple smooth rounded shapes - no texture lines',
    complexity: 'simple and clear - easy for small hands to color'
  },
  early_elementary: {
    lineThickness: '3-4pt medium-thick',
    sections: '8-15 medium',
    detailLevel: 'some details but still clean - simple patterns allowed',
    shapes: 'varied but clear shapes with smooth edges',
    complexity: 'moderately detailed but not overwhelming'
  },
  late_elementary: {
    lineThickness: '2-3pt medium',
    sections: '15-25 varied',
    detailLevel: 'more details with simple patterns',
    shapes: 'more complex shapes with clear boundaries',
    complexity: 'detailed and engaging for older kids'
  }
};

// ============================================
// MANDATORY PROMPT ELEMENTS
// ============================================

const MANDATORY_ELEMENTS = [
  'pure black and white only',
  'professional coloring book style',
  'clean line art OUTLINES ONLY',
  'no shading whatsoever',
  'no gradients',
  'no gray tones',
  'pure white background',
  'all outlines completely closed and connected',
  'every shape enclosed for fill tool',
  'smooth continuous lines',
  'no broken or open lines',
  'crisp clean edges',
  'NO solid black filled areas - only thin outlines',
  'NO black fills inside shapes',
  'all areas must be white inside with black outline border only'
];

const NEGATIVE_ELEMENTS = [
  // Color related
  'color', 'colored', 'colorful', 'rgb', 'cmyk',
  // Shading related
  'shading', 'shadow', 'shadows', 'dark areas', 'light areas',
  // Gradient related
  'gradient', 'gradients', 'fade', 'transition',
  // Gray related
  'gray', 'grey', 'grayscale', 'halftone',
  // Style related
  'realistic', 'photorealistic', '3D', 'render', 'photograph',
  // Texture related
  'texture', 'textured', 'fur texture', 'hair texture', 'skin texture',
  // Paint related
  'watercolor', 'painted', 'paint', 'brush strokes',
  // CRITICAL: Filled areas - especially hair/mane
  'filled areas', 'solid fill', 'solid black', 'black fill', 'filled shapes',
  'dark fill', 'filled in', 'colored in', 'painted in',
  'filled hair', 'black hair', 'dark hair', 'filled mane', 'striped mane',
  'black mane', 'dark mane sections', 'alternating black white hair',
  // Line issues
  'open lines', 'broken lines', 'gaps in lines', 'incomplete lines',
  // Quality issues
  'blurry', 'soft edges', 'fuzzy', 'unclear',
  // Background issues - CRITICAL
  'background scenery', 'detailed background', 'complex background',
  'grass', 'plants', 'flowers', 'trees', 'ground', 'sky', 'clouds',
  'nature background', 'outdoor scene', 'indoor scene',
  // Complexity issues
  'intricate details', 'fine details', 'tiny details', 'complex patterns'
];

// ============================================
// CATEGORY-SPECIFIC PROMPTS
// ============================================

const CATEGORY_ENHANCEMENTS: Record<ColoringCategory, string> = {
  animal: 'cute cartoon animal with SMOOTH OUTLINE ONLY - no fur texture, no hair strands, just clean curved lines. Simple rounded body, dot eyes, small nose. ALL WHITE INSIDE with black outline only',
  character: 'simple cartoon character with clean outline. Basic clothing as simple shapes. Face: dot eyes, curved smile. NO detailed hair - just simple shape. ALL WHITE INSIDE',
  nature: 'simplified flowers and plants with smooth petal outlines. Each element clearly separated. NO detailed texture on leaves. ALL WHITE INSIDE shapes',
  vehicle: 'toy-like vehicle from side view. Simple geometric shapes for body, circular wheels. NO interior details. ALL WHITE INSIDE with black outline',
  fantasy: 'magical creature with SMOOTH simple outline. NO scales texture, NO detailed wings. Friendly cute style. ALL WHITE INSIDE',
  family: 'simple stick-figure style people with basic shapes. Circle heads, oval bodies. NO facial details except dots for eyes and curved smile. ALL WHITE INSIDE',
  object: 'recognizable simple outline of object. NO surface texture or patterns. Clean smooth edges. ALL WHITE INSIDE',
  educational: 'clear simple shapes for learning. Bold clean outlines. NO complex details. ALL WHITE INSIDE'
};

// ============================================
// MAIN PROMPT BUILDER
// ============================================

export function buildColoringPagePrompt(config: ColoringPromptConfig): string {
  const {
    subject,
    ageGroup,
    category = 'object',
    style = 'simple',
    isTherapeutic = false,
    therapeuticTheme
  } = config;

  const ageParams = AGE_PARAMETERS[ageGroup];
  const categoryEnhancement = CATEGORY_ENHANCEMENTS[category];

  // Build the prompt sections
  const sections: string[] = [];

  // 1. Subject definition
  if (isTherapeutic && therapeuticTheme) {
    sections.push(`Subject: ${therapeuticTheme} (therapeutic healing theme)`);
  } else {
    sections.push(`Subject: ${subject}`);
  }

  // 2. Output format requirement (CRITICAL)
  sections.push(`
OUTPUT FORMAT: Professional coloring book page
- ${MANDATORY_ELEMENTS.join('\n- ')}`);

  // 3. Age-appropriate specifications
  sections.push(`
AGE GROUP SPECIFICATIONS (${ageGroup.replace('_', ' ')}):
- Line thickness: ${ageParams.lineThickness}
- Colorable sections: ${ageParams.sections}
- Detail level: ${ageParams.detailLevel}
- Shapes: ${ageParams.shapes}
- Overall complexity: ${ageParams.complexity}`);

  // 4. Category-specific style
  sections.push(`
STYLE REQUIREMENTS:
- ${categoryEnhancement}
- Child-friendly and appealing design
- Balanced composition with clear focal point`);

  // 5. Technical requirements
  sections.push(`
TECHNICAL REQUIREMENTS:
- High resolution vector-quality lines
- Consistent line weight throughout
- Anti-aliased smooth edges
- Perfect for digital coloring (bucket fill compatible)
- All enclosed areas ready for coloring`);

  // 6. Critical reminders
  sections.push(`
CRITICAL - MUST FOLLOW:
1. Generate ONLY black lines on white background
2. EVERY line must connect - NO gaps or breaks
3. NO filled/solid black areas except outlines
4. NO gray tones or shading of any kind
5. Simple enough for a child to color with crayons
6. Test: every area should be fillable with bucket tool`);

  const prompt = sections.join('\n\n');

  logger.info('[PromptBuilder] Generated coloring page prompt for:', {
    subject,
    ageGroup,
    category,
    style,
    promptLength: prompt.length
  });

  return prompt;
}

// ============================================
// NEGATIVE PROMPT BUILDER
// ============================================

export function buildNegativePrompt(): string {
  return NEGATIVE_ELEMENTS.join(', ');
}

// ============================================
// AGE GROUP DETECTOR
// ============================================

export function detectAgeGroup(age: number): AgeGroup {
  if (age <= 3) return 'toddler';
  if (age <= 5) return 'preschool';
  if (age <= 7) return 'early_elementary';
  return 'late_elementary';
}

// ============================================
// SUBJECT SIMPLIFIER FOR TODDLERS
// ============================================

/**
 * Simplifies complex subjects for toddler age group
 * "fluffy cat" → "simple round cat shape"
 * "magical unicorn with rainbow mane" → "simple unicorn shape"
 */
export function simplifySubjectForToddler(subject: string): string {
  // Remove complex adjectives
  const complexAdjectives = [
    'fluffy', 'furry', 'hairy', 'detailed', 'intricate', 'complex',
    'realistic', 'beautiful', 'gorgeous', 'magnificent', 'majestic',
    'elaborate', 'fancy', 'ornate', 'decorated', 'patterned',
    'textured', 'shaggy', 'fuzzy', 'feathery', 'scaly'
  ];

  let simplified = subject.toLowerCase();

  // Remove complex adjectives
  complexAdjectives.forEach(adj => {
    simplified = simplified.replace(new RegExp(`\\b${adj}\\b`, 'gi'), '');
  });

  // Remove extra descriptions (after "with")
  simplified = simplified.replace(/\s+with\s+.*/i, '');

  // Clean up
  simplified = simplified.replace(/\s+/g, ' ').trim();

  // Add "simple" prefix and "shape" suffix
  return `simple round ${simplified} - basic shape only`;
}

/**
 * Auto-simplifies subject based on age group
 */
export function prepareSubjectForAge(subject: string, ageGroup: AgeGroup): string {
  if (ageGroup === 'toddler') {
    return simplifySubjectForToddler(subject);
  }
  if (ageGroup === 'preschool') {
    // Light simplification for preschool
    return subject.replace(/\s+with\s+.*detailed.*/i, '');
  }
  return subject;
}

// ============================================
// CATEGORY DETECTOR
// ============================================

export function detectCategory(subject: string): ColoringCategory {
  const lowerSubject = subject.toLowerCase();

  const categoryKeywords: Record<ColoringCategory, string[]> = {
    animal: ['cat', 'dog', 'bird', 'fish', 'lion', 'elephant', 'bunny', 'rabbit', 'bear', 'horse', 'kedi', 'kopek', 'kus', 'balik', 'hayvan'],
    character: ['princess', 'prince', 'superhero', 'pirate', 'knight', 'prenses', 'kahraman', 'korsan'],
    nature: ['flower', 'tree', 'sun', 'rainbow', 'cloud', 'garden', 'cicek', 'agac', 'gunes', 'gokkusagi'],
    vehicle: ['car', 'truck', 'train', 'airplane', 'boat', 'bus', 'araba', 'tren', 'ucak', 'gemi'],
    fantasy: ['unicorn', 'dragon', 'fairy', 'mermaid', 'wizard', 'magic', 'unicorn', 'ejderha', 'peri'],
    family: ['family', 'mom', 'dad', 'baby', 'people', 'person', 'aile', 'anne', 'baba', 'bebek', 'insan'],
    educational: ['number', 'letter', 'shape', 'alphabet', 'counting', 'sayi', 'harf', 'alfabe'],
    object: [] // default
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerSubject.includes(keyword))) {
      return category as ColoringCategory;
    }
  }

  return 'object';
}

// ============================================
// SIMPLIFIED PROMPT FOR FLUX
// ============================================

/**
 * Builds a simplified, highly effective prompt for Flux 2.0
 * Optimized for direct line art generation
 *
 * KEY INSIGHT: AI needs VERY explicit instructions to avoid:
 * 1. Filled black areas (especially in hair/mane)
 * 2. Texture details (fur, scales, etc.)
 * 3. Complex backgrounds
 */
export function buildFluxColoringPrompt(config: ColoringPromptConfig): {
  prompt: string;
  negativePrompt: string;
} {
  const { subject, ageGroup, category, isTherapeutic, therapeuticTheme } = config;
  const ageParams = AGE_PARAMETERS[ageGroup];
  const categoryStyle = category ? CATEGORY_ENHANCEMENTS[category] : '';

  // Prepare subject - simplify for younger age groups
  const baseSubject = isTherapeutic && therapeuticTheme ? therapeuticTheme : subject;
  const actualSubject = prepareSubjectForAge(baseSubject, ageGroup);

  // Age-specific extra instructions
  const ageSpecificInstructions = ageGroup === 'toddler'
    ? `
TODDLER SPECIFIC (CRITICAL):
- Like a Fisher-Price toy or board book
- ONLY 3-5 big shapes maximum
- NO texture lines at all
- NO fur, NO hair strands, NO patterns
- Just smooth curved outlines
- Think: rubber stamp simplicity`
    : ageGroup === 'preschool'
    ? `
PRESCHOOL SPECIFIC:
- Very simple shapes
- Minimal facial features (dots for eyes, curved line for smile)
- No complex patterns or textures
- Easy for small hands to color`
    : '';

  // Flux responds better to explicit, forceful prompts
  const prompt = `COLORING BOOK PAGE - BLACK OUTLINE ON WHITE ONLY

Subject: ${actualSubject}

=== ABSOLUTE REQUIREMENTS ===
1. ONLY black outline strokes on pure white background
2. ALL areas inside outlines must be WHITE (empty for coloring)
3. NO solid black filled areas anywhere
4. NO shading, NO gradients, NO gray tones
5. Every shape must be CLOSED (for bucket fill tool)

=== STYLE ===
${categoryStyle}

=== AGE-APPROPRIATE (${ageGroup.replace('_', ' ')}) ===
- Line thickness: ${ageParams.lineThickness}
- Sections to color: ${ageParams.sections}
- Detail level: ${ageParams.detailLevel}
- Shapes: ${ageParams.shapes}
- Complexity: ${ageParams.complexity}
${ageSpecificInstructions}

=== FORBIDDEN (CRITICAL) ===
- NO solid black fills anywhere - especially in hair, mane, tail
- NO striped/filled hair or mane sections
- NO texture lines (fur, scales, grass strands)
- NO detailed backgrounds - plain white only
- NO grass, no plants, no scenery behind subject
- NO gray areas or shading
- NO open/broken lines
- Hair and mane must be OUTLINE ONLY with white inside

=== BACKGROUND ===
PLAIN WHITE ONLY - no ground, no grass, no sky, no decorations.
Subject should float on pure white background.

Output: Clean vector-quality line art, professional coloring book standard.`;

  const negativePrompt = buildNegativePrompt();

  return { prompt, negativePrompt };
}

// ============================================
// QUALITY VALIDATION
// ============================================

export interface QualityCheckResult {
  isValid: boolean;
  score: number;
  issues: string[];
}

/**
 * Validates prompt configuration for quality assurance
 */
export function validatePromptConfig(config: ColoringPromptConfig): QualityCheckResult {
  const issues: string[] = [];
  let score = 100;

  // Check subject
  if (!config.subject || config.subject.trim().length < 2) {
    issues.push('Subject is missing or too short');
    score -= 30;
  }

  // Check age group validity
  if (!AGE_PARAMETERS[config.ageGroup]) {
    issues.push('Invalid age group');
    score -= 20;
  }

  // Check for problematic keywords in subject
  const problematicWords = ['realistic', 'detailed', 'complex', '3D', 'photorealistic'];
  const hasProblematic = problematicWords.some(word =>
    config.subject.toLowerCase().includes(word)
  );
  if (hasProblematic) {
    issues.push('Subject contains words that may produce non-coloring-book results');
    score -= 15;
  }

  return {
    isValid: score >= 70,
    score,
    issues
  };
}

export default {
  buildColoringPagePrompt,
  buildNegativePrompt,
  buildFluxColoringPrompt,
  detectAgeGroup,
  detectCategory,
  validatePromptConfig
};
