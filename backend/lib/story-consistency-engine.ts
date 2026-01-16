/**
 * Story Consistency Engine
 *
 * Hikaye boyunca görsel ve metin tutarlılığını sağlayan merkezi sistem.
 *
 * WORKFLOW:
 * 1. Character Profile Creation - Karakter profili oluştur
 * 2. Visual DNA Generation - Görsel DNA üret
 * 3. Text Style Definition - Metin stili tanımla
 * 4. Story Generation - Tutarlı hikaye üret
 * 5. Image Generation - Tutarlı görseller üret
 * 6. Consistency Validation - Tutarlılık kontrolü
 *
 * TUTARLILIK KATMANLARI:
 * - Visual Consistency: Aynı karakter görünümü her sayfada
 * - Text Consistency: Aynı konuşma tarzı, kelime seçimi
 * - Emotional Consistency: Duygu geçişleri mantıklı
 * - Narrative Consistency: Hikaye akışı tutarlı
 */

import { logger } from "./utils.js";
import {
  generateCharacterDNA,
  getPageSeed,
  type CharacterV2,
  type CharacterDNA,
  type StoryStyleV2,
  getStoryStyleForAge
} from "./story-prompt-builder-v2.js";

// ============================================
// TYPES
// ============================================

/**
 * Complete Character Profile - Hem görsel hem metin için
 */
export interface CharacterProfile {
  // Identity
  name: string;
  type: string;
  gender: 'male' | 'female';
  age: number;

  // Visual Identity (Görsel Tutarlılık)
  visualDNA: CharacterDNA;
  physicalDescription: string;
  colorPalette: string[];
  distinctiveFeatures: string[];
  clothingStyle: string;

  // Text Identity (Metin Tutarlılık)
  personality: string[];
  speechStyle: TextStyle;
  emotionalRange: EmotionalProfile;
  vocabularyLevel: VocabularyLevel;

  // Behavioral Patterns
  typicalReactions: Record<string, string>;
  catchPhrases: string[];
}

/**
 * Text Style - Karakterin konuşma ve anlatım tarzı
 */
export interface TextStyle {
  tone: 'formal' | 'casual' | 'playful' | 'gentle' | 'energetic';
  sentenceLength: 'very_short' | 'short' | 'medium' | 'long';
  favoriteWords: string[];
  avoidWords: string[];
  punctuationStyle: 'minimal' | 'normal' | 'expressive'; // "!" kullanımı vs
  speakingPattern: string; // Örn: "Yumuşak sesle, düşünerek konuşur"
}

/**
 * Emotional Profile - Duygu geçişleri için
 */
export interface EmotionalProfile {
  baseEmotion: string; // Varsayılan duygu durumu
  emotionTransitions: EmotionTransition[];
  expressionIntensity: 'subtle' | 'moderate' | 'expressive';
}

export interface EmotionTransition {
  from: string;
  to: string;
  trigger: string;
  duration: 'instant' | 'gradual';
}

/**
 * Vocabulary Level - Yaşa göre kelime seçimi
 */
export interface VocabularyLevel {
  ageGroup: number;
  maxWordLength: number;
  complexityLevel: 'very_simple' | 'simple' | 'moderate' | 'rich';
  allowedConcepts: string[];
  forbiddenConcepts: string[];
}

/**
 * Story Consistency State - Hikaye boyunca takip
 */
export interface StoryConsistencyState {
  characterProfile: CharacterProfile;
  storyStyle: StoryStyleV2;
  currentEmotion: string;
  emotionHistory: { page: number; emotion: string }[];
  usedPhrases: string[];
  narrativeElements: {
    introducedCharacters: string[];
    visitedLocations: string[];
    mentionedObjects: string[];
  };
  seeds: {
    base: number;
    perPage: number[];
  };
}

/**
 * Consistency Check Result
 */
export interface ConsistencyCheckResult {
  isConsistent: boolean;
  score: number; // 0-100
  visualConsistency: number;
  textConsistency: number;
  emotionalConsistency: number;
  issues: ConsistencyIssue[];
  suggestions: string[];
}

export interface ConsistencyIssue {
  type: 'visual' | 'text' | 'emotional' | 'narrative';
  severity: 'low' | 'medium' | 'high';
  description: string;
  page?: number;
  fix?: string;
}

// ============================================
// CONSISTENCY ENGINE CLASS
// ============================================

export class StoryConsistencyEngine {
  private state: StoryConsistencyState | null = null;

  /**
   * Initialize the consistency engine with a character
   */
  async initialize(
    character: CharacterV2,
    childAge: number,
    language: 'tr' | 'en' = 'tr'
  ): Promise<CharacterProfile> {
    logger.info('[ConsistencyEngine] Initializing with character:', character.name);

    // Generate Visual DNA
    const visualDNA = generateCharacterDNA(character);

    // Extract color palette from appearance
    const colorPalette = this.extractColors(character.appearance);

    // Define text style based on character
    const speechStyle = this.defineTextStyle(character, childAge, language);

    // Define emotional profile
    const emotionalRange = this.defineEmotionalProfile(character);

    // Define vocabulary level
    const vocabularyLevel = this.defineVocabularyLevel(childAge, language);

    // Build complete profile
    const profile: CharacterProfile = {
      name: character.name,
      type: character.type,
      gender: character.gender,
      age: character.age,

      // Visual
      visualDNA,
      physicalDescription: character.appearance,
      colorPalette,
      distinctiveFeatures: visualDNA.uniqueFeatures,
      clothingStyle: this.extractClothing(character.appearance),

      // Text
      personality: character.personality,
      speechStyle,
      emotionalRange,
      vocabularyLevel,

      // Behavioral
      typicalReactions: this.generateTypicalReactions(character, language),
      catchPhrases: this.generateCatchPhrases(character, language)
    };

    // Initialize state
    this.state = {
      characterProfile: profile,
      storyStyle: getStoryStyleForAge(childAge),
      currentEmotion: emotionalRange.baseEmotion,
      emotionHistory: [],
      usedPhrases: [],
      narrativeElements: {
        introducedCharacters: [character.name],
        visitedLocations: [],
        mentionedObjects: []
      },
      seeds: {
        base: visualDNA.consistencySeed,
        perPage: []
      }
    };

    logger.info('[ConsistencyEngine] Profile created:', {
      name: profile.name,
      visualDNA: profile.visualDNA.hash.substring(0, 8),
      speechTone: profile.speechStyle.tone,
      baseEmotion: profile.emotionalRange.baseEmotion
    });

    return profile;
  }

  /**
   * Get consistent visual prompt for a page
   */
  getVisualPrompt(
    pageNumber: number,
    totalPages: number,
    sceneElements: string[],
    emotion: string
  ): { prompt: string; seed: number } {
    if (!this.state) {
      throw new Error('ConsistencyEngine not initialized');
    }

    const { characterProfile, storyStyle } = this.state;

    // Update emotion history
    this.state.emotionHistory.push({ page: pageNumber, emotion });
    this.state.currentEmotion = emotion;

    // Calculate page seed
    const pageSeed = getPageSeed(characterProfile.visualDNA, pageNumber);
    this.state.seeds.perPage[pageNumber - 1] = pageSeed;

    // Build prompt with CHARACTER FIRST (highest attention)
    const prompt = this.buildConsistentVisualPrompt(
      characterProfile,
      storyStyle,
      pageNumber,
      totalPages,
      sceneElements,
      emotion
    );

    return { prompt, seed: pageSeed };
  }

  /**
   * Get consistent text style guidelines for a page
   */
  getTextGuidelines(
    pageNumber: number,
    emotion: string,
    sceneContext: string
  ): TextGenerationGuidelines {
    if (!this.state) {
      throw new Error('ConsistencyEngine not initialized');
    }

    const { characterProfile } = this.state;
    const { speechStyle, vocabularyLevel, catchPhrases, typicalReactions } = characterProfile;

    // Check if emotion transition is valid
    const prevEmotion = this.state.currentEmotion;
    const isValidTransition = this.validateEmotionTransition(prevEmotion, emotion);

    // Select appropriate catch phrase if available
    const suggestedPhrase = this.selectCatchPhrase(emotion, sceneContext);

    // Get reaction pattern for this emotion
    const reactionPattern = typicalReactions[emotion] || typicalReactions['default'];

    return {
      speechStyle,
      vocabularyLevel,
      currentEmotion: emotion,
      previousEmotion: prevEmotion,
      isValidTransition,
      suggestedPhrase,
      reactionPattern,
      avoidRepetition: this.state.usedPhrases,
      narrativeContext: this.state.narrativeElements
    };
  }

  /**
   * Record used phrase to avoid repetition
   */
  recordUsedPhrase(phrase: string): void {
    if (this.state && !this.state.usedPhrases.includes(phrase)) {
      this.state.usedPhrases.push(phrase);
    }
  }

  /**
   * Record narrative element
   */
  recordNarrativeElement(
    type: 'character' | 'location' | 'object',
    element: string
  ): void {
    if (!this.state) return;

    switch (type) {
      case 'character':
        if (!this.state.narrativeElements.introducedCharacters.includes(element)) {
          this.state.narrativeElements.introducedCharacters.push(element);
        }
        break;
      case 'location':
        if (!this.state.narrativeElements.visitedLocations.includes(element)) {
          this.state.narrativeElements.visitedLocations.push(element);
        }
        break;
      case 'object':
        if (!this.state.narrativeElements.mentionedObjects.includes(element)) {
          this.state.narrativeElements.mentionedObjects.push(element);
        }
        break;
    }
  }

  /**
   * Validate consistency across all pages
   */
  validateConsistency(
    pages: { text: string; visualPrompt: string; emotion: string }[]
  ): ConsistencyCheckResult {
    if (!this.state) {
      throw new Error('ConsistencyEngine not initialized');
    }

    const issues: ConsistencyIssue[] = [];
    let visualScore = 100;
    let textScore = 100;
    let emotionalScore = 100;

    const { characterProfile } = this.state;

    pages.forEach((page, index) => {
      const pageNum = index + 1;

      // Visual consistency check
      if (!page.visualPrompt.includes(characterProfile.visualDNA.anchorTags.substring(0, 30))) {
        issues.push({
          type: 'visual',
          severity: 'high',
          description: `Sayfa ${pageNum}: Karakter anchor tags eksik`,
          page: pageNum,
          fix: 'Prompt başına karakter DNA ekle'
        });
        visualScore -= 20;
      }

      // Text consistency check - character name usage
      if (!page.text.includes(characterProfile.name)) {
        issues.push({
          type: 'text',
          severity: 'medium',
          description: `Sayfa ${pageNum}: Karakter ismi geçmiyor`,
          page: pageNum
        });
        textScore -= 10;
      }

      // Emotional consistency check
      if (index > 0) {
        const prevEmotion = pages[index - 1].emotion;
        const currentEmotion = page.emotion;

        if (!this.validateEmotionTransition(prevEmotion, currentEmotion)) {
          issues.push({
            type: 'emotional',
            severity: 'low',
            description: `Sayfa ${pageNum}: Ani duygu geçişi (${prevEmotion} → ${currentEmotion})`,
            page: pageNum
          });
          emotionalScore -= 5;
        }
      }

      // Check for forbidden words
      const forbiddenFound = characterProfile.vocabularyLevel.forbiddenConcepts
        .filter(word => page.text.toLowerCase().includes(word.toLowerCase()));

      if (forbiddenFound.length > 0) {
        issues.push({
          type: 'text',
          severity: 'medium',
          description: `Sayfa ${pageNum}: Yaşa uygun olmayan kelimeler: ${forbiddenFound.join(', ')}`,
          page: pageNum
        });
        textScore -= 15;
      }
    });

    const overallScore = Math.round((visualScore + textScore + emotionalScore) / 3);

    return {
      isConsistent: overallScore >= 70,
      score: overallScore,
      visualConsistency: visualScore,
      textConsistency: textScore,
      emotionalConsistency: emotionalScore,
      issues,
      suggestions: this.generateSuggestions(issues)
    };
  }

  /**
   * Get current state (for debugging/logging)
   */
  getState(): StoryConsistencyState | null {
    return this.state;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private extractColors(appearance: string): string[] {
    const colorMap: Record<string, string> = {
      'beyaz': 'white', 'siyah': 'black', 'kahve': 'brown',
      'turuncu': 'orange', 'sarı': 'yellow', 'mavi': 'blue',
      'yeşil': 'green', 'kırmızı': 'red', 'pembe': 'pink',
      'mor': 'purple', 'gri': 'gray', 'altın': 'golden',
      'white': 'white', 'black': 'black', 'brown': 'brown',
      'orange': 'orange', 'yellow': 'yellow', 'blue': 'blue',
      'green': 'green', 'red': 'red', 'pink': 'pink',
      'purple': 'purple', 'gray': 'gray', 'golden': 'golden'
    };

    const colors: string[] = [];
    const lower = appearance.toLowerCase();

    for (const [key, value] of Object.entries(colorMap)) {
      if (lower.includes(key) && !colors.includes(value)) {
        colors.push(value);
      }
    }

    return colors.slice(0, 4);
  }

  private extractClothing(appearance: string): string {
    const clothingPatterns = [
      { pattern: /elbise|dress/i, item: 'dress' },
      { pattern: /tulum|overalls/i, item: 'overalls' },
      { pattern: /yelek|vest/i, item: 'vest' },
      { pattern: /ceket|jacket/i, item: 'jacket' },
      { pattern: /pantolon|pants/i, item: 'pants' },
      { pattern: /şapka|hat/i, item: 'hat' },
      { pattern: /eşarp|scarf/i, item: 'scarf' },
    ];

    const items: string[] = [];
    for (const { pattern, item } of clothingPatterns) {
      if (pattern.test(appearance)) {
        items.push(item);
      }
    }

    return items.join(', ') || 'simple clothing';
  }

  private defineTextStyle(
    character: CharacterV2,
    age: number,
    language: 'tr' | 'en'
  ): TextStyle {
    // Determine tone from personality
    let tone: TextStyle['tone'] = 'gentle';
    if (character.personality.some(p => /cesur|brave|strong/i.test(p))) {
      tone = 'energetic';
    } else if (character.personality.some(p => /sakin|calm|quiet/i.test(p))) {
      tone = 'gentle';
    } else if (character.personality.some(p => /neşeli|happy|playful/i.test(p))) {
      tone = 'playful';
    }

    // Sentence length by age
    let sentenceLength: TextStyle['sentenceLength'] = 'medium';
    if (age <= 3) sentenceLength = 'very_short';
    else if (age <= 5) sentenceLength = 'short';
    else if (age <= 8) sentenceLength = 'medium';
    else sentenceLength = 'long';

    // Favorite words based on personality
    const favoriteWords = language === 'tr'
      ? ['belki', 'sanırım', 'acaba', 'vay', 'harika']
      : ['maybe', 'I think', 'wow', 'amazing', 'look'];

    // Words to avoid (age-inappropriate)
    const avoidWords = language === 'tr'
      ? ['ölüm', 'korkunç', 'berbat', 'aptal', 'salak']
      : ['death', 'horrible', 'stupid', 'hate', 'kill'];

    return {
      tone,
      sentenceLength,
      favoriteWords,
      avoidWords,
      punctuationStyle: age <= 5 ? 'minimal' : 'normal',
      speakingPattern: character.speechStyle || 'speaks gently and thoughtfully'
    };
  }

  private defineEmotionalProfile(character: CharacterV2): EmotionalProfile {
    // Base emotion from personality
    let baseEmotion = 'happy';
    if (character.personality.some(p => /meraklı|curious/i.test(p))) {
      baseEmotion = 'curious';
    } else if (character.personality.some(p => /utangaç|shy/i.test(p))) {
      baseEmotion = 'shy';
    }

    // Valid emotion transitions
    const emotionTransitions: EmotionTransition[] = [
      { from: 'happy', to: 'excited', trigger: 'discovery', duration: 'instant' },
      { from: 'happy', to: 'curious', trigger: 'question', duration: 'instant' },
      { from: 'curious', to: 'excited', trigger: 'answer', duration: 'instant' },
      { from: 'worried', to: 'relieved', trigger: 'help', duration: 'gradual' },
      { from: 'sad', to: 'hopeful', trigger: 'friend', duration: 'gradual' },
      { from: 'scared', to: 'brave', trigger: 'courage', duration: 'gradual' },
      { from: 'excited', to: 'proud', trigger: 'achievement', duration: 'instant' },
    ];

    return {
      baseEmotion,
      emotionTransitions,
      expressionIntensity: 'moderate'
    };
  }

  private defineVocabularyLevel(age: number, language: 'tr' | 'en'): VocabularyLevel {
    const levels: Record<number, Partial<VocabularyLevel>> = {
      3: {
        maxWordLength: 6,
        complexityLevel: 'very_simple',
        allowedConcepts: ['family', 'animals', 'colors', 'food', 'play'],
        forbiddenConcepts: language === 'tr'
          ? ['ölüm', 'korku', 'şiddet', 'hastalık']
          : ['death', 'fear', 'violence', 'disease']
      },
      5: {
        maxWordLength: 8,
        complexityLevel: 'simple',
        allowedConcepts: ['friendship', 'sharing', 'nature', 'adventure'],
        forbiddenConcepts: language === 'tr'
          ? ['ölüm', 'şiddet', 'savaş']
          : ['death', 'violence', 'war']
      },
      8: {
        maxWordLength: 12,
        complexityLevel: 'moderate',
        allowedConcepts: ['problem-solving', 'emotions', 'responsibility'],
        forbiddenConcepts: language === 'tr'
          ? ['şiddet', 'savaş']
          : ['violence', 'war']
      },
      12: {
        maxWordLength: 15,
        complexityLevel: 'rich',
        allowedConcepts: ['complex emotions', 'social issues', 'growth'],
        forbiddenConcepts: []
      }
    };

    // Find closest age level
    const ageKey = Object.keys(levels)
      .map(Number)
      .filter(k => k <= age)
      .pop() || 3;

    return {
      ageGroup: age,
      ...levels[ageKey]
    } as VocabularyLevel;
  }

  private generateTypicalReactions(
    character: CharacterV2,
    language: 'tr' | 'en'
  ): Record<string, string> {
    if (language === 'tr') {
      return {
        happy: `${character.name} mutlulukla gülümsedi`,
        excited: `${character.name}'ın gözleri parladı`,
        worried: `${character.name} kaşlarını çattı`,
        scared: `${character.name} titredi ama cesur olmaya çalıştı`,
        curious: `${character.name} merakla eğildi`,
        proud: `${character.name} gururla göğsünü kabarttı`,
        sad: `${character.name}'ın gözleri doldu`,
        default: `${character.name} düşünceli görünüyordu`
      };
    }

    return {
      happy: `${character.name} smiled with joy`,
      excited: `${character.name}'s eyes sparkled`,
      worried: `${character.name} frowned with concern`,
      scared: `${character.name} trembled but tried to be brave`,
      curious: `${character.name} leaned in curiously`,
      proud: `${character.name} puffed up with pride`,
      sad: `${character.name}'s eyes welled up`,
      default: `${character.name} looked thoughtful`
    };
  }

  private generateCatchPhrases(
    character: CharacterV2,
    language: 'tr' | 'en'
  ): string[] {
    if (language === 'tr') {
      return [
        `"Vay canına!" dedi ${character.name}`,
        `"Harika!" diye bağırdı ${character.name}`,
        `"Belki..." diye düşündü ${character.name}`,
        `"Hadi bakalım!" dedi ${character.name} cesaretle`,
        `"Teşekkür ederim!" dedi ${character.name} mutlulukla`
      ];
    }

    return [
      `"Wow!" said ${character.name}`,
      `"Amazing!" exclaimed ${character.name}`,
      `"Maybe..." thought ${character.name}`,
      `"Let's go!" said ${character.name} bravely`,
      `"Thank you!" said ${character.name} happily`
    ];
  }

  private validateEmotionTransition(from: string, to: string): boolean {
    if (from === to) return true;

    // Define valid transitions
    const validTransitions: Record<string, string[]> = {
      happy: ['excited', 'curious', 'proud', 'worried'],
      excited: ['happy', 'proud', 'curious'],
      curious: ['excited', 'happy', 'worried', 'surprised'],
      worried: ['relieved', 'scared', 'hopeful', 'happy'],
      scared: ['brave', 'relieved', 'worried'],
      sad: ['hopeful', 'happy', 'comforted'],
      proud: ['happy', 'excited'],
      surprised: ['excited', 'happy', 'curious', 'worried']
    };

    return validTransitions[from]?.includes(to) || false;
  }

  private selectCatchPhrase(emotion: string, context: string): string | null {
    if (!this.state) return null;

    const { catchPhrases } = this.state.characterProfile;
    const unused = catchPhrases.filter(p => !this.state!.usedPhrases.includes(p));

    if (unused.length === 0) return null;

    // Select based on emotion
    const emotionKeywords: Record<string, string[]> = {
      excited: ['Vay', 'Wow', 'Harika', 'Amazing'],
      happy: ['Teşekkür', 'Thank'],
      curious: ['Belki', 'Maybe'],
      brave: ['Hadi', 'Let\'s']
    };

    const keywords = emotionKeywords[emotion] || [];
    const matching = unused.find(p => keywords.some(k => p.includes(k)));

    return matching || unused[0];
  }

  private buildConsistentVisualPrompt(
    profile: CharacterProfile,
    style: StoryStyleV2,
    pageNumber: number,
    totalPages: number,
    sceneElements: string[],
    emotion: string
  ): string {
    // CHARACTER FIRST - Highest attention area
    const characterBlock = profile.visualDNA.anchorTags;

    // Format declaration
    const formatBlock = `(children's storybook watercolor illustration:1.4), soft pastel colors`;

    // Scene elements
    const sceneBlock = sceneElements.slice(0, 3).join(', ');

    // Emotion
    const emotionBlock = this.getEmotionVisualStyle(emotion);

    // Composition based on page position
    let compositionBlock = 'story scene';
    if (pageNumber === 1) {
      compositionBlock = '(character introduction:1.3), centered composition';
    } else if (pageNumber === totalPages) {
      compositionBlock = 'happy ending, (satisfied expression:1.3)';
    }

    // Style
    const styleBlock = `${style.colorPalette.slice(0, 3).join(', ')}, ${style.mood}`;

    // Quality
    const qualityBlock = '(plain background:1.3), professional children\'s book art';

    return [
      characterBlock,
      formatBlock,
      sceneBlock,
      emotionBlock,
      compositionBlock,
      styleBlock,
      qualityBlock
    ].join(', ');
  }

  private getEmotionVisualStyle(emotion: string): string {
    const styles: Record<string, string> = {
      happy: '(warm smile:1.3), bright eyes, joyful pose',
      excited: '(sparkling eyes:1.2), energetic pose, dynamic',
      curious: 'wide eyes, tilted head, attentive',
      worried: 'concerned expression, gentle posture',
      scared: 'wide eyes, cautious pose, seeking comfort',
      proud: 'confident stance, satisfied smile',
      sad: 'gentle expression, soft eyes'
    };

    return styles[emotion] || 'friendly expression';
  }

  private generateSuggestions(issues: ConsistencyIssue[]): string[] {
    const suggestions: string[] = [];

    const visualIssues = issues.filter(i => i.type === 'visual');
    const textIssues = issues.filter(i => i.type === 'text');
    const emotionalIssues = issues.filter(i => i.type === 'emotional');

    if (visualIssues.length > 0) {
      suggestions.push('Her prompt\'un başına karakter DNA anchor tags ekleyin');
      suggestions.push('Aynı seed base kullanarak tutarlılığı artırın');
    }

    if (textIssues.length > 0) {
      suggestions.push('Her sayfada karakter ismini en az bir kez kullanın');
      suggestions.push('Yaşa uygun kelime seçimine dikkat edin');
    }

    if (emotionalIssues.length > 0) {
      suggestions.push('Duygu geçişlerini daha yumuşak yapın');
      suggestions.push('Ani duygu değişimlerinden kaçının');
    }

    return suggestions;
  }
}

// ============================================
// TEXT GENERATION GUIDELINES TYPE
// ============================================

export interface TextGenerationGuidelines {
  speechStyle: TextStyle;
  vocabularyLevel: VocabularyLevel;
  currentEmotion: string;
  previousEmotion: string;
  isValidTransition: boolean;
  suggestedPhrase: string | null;
  reactionPattern: string;
  avoidRepetition: string[];
  narrativeContext: {
    introducedCharacters: string[];
    visitedLocations: string[];
    mentionedObjects: string[];
  };
}

// ============================================
// SINGLETON INSTANCE & EXPORTS
// ============================================

// Create singleton instance for use across story generation
let engineInstance: StoryConsistencyEngine | null = null;

export function getConsistencyEngine(): StoryConsistencyEngine {
  if (!engineInstance) {
    engineInstance = new StoryConsistencyEngine();
  }
  return engineInstance;
}

export function resetConsistencyEngine(): void {
  engineInstance = null;
}

export default StoryConsistencyEngine;
