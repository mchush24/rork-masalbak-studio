/**
 * ChatBot Intent & Emotion Detection System
 *
 * Kullanıcı mesajlarından niyet ve duygu algılama
 */

// ============================================
// TYPES
// ============================================

export type IntentType =
  | 'parenting_concern'      // Ebeveyn endişesi/sorusu
  | 'child_development'      // Çocuk gelişimi sorusu
  | 'emotional_support'      // Duygusal destek ihtiyacı
  | 'technical_question'     // Teknik/uygulama sorusu
  | 'general_inquiry'        // Genel bilgi sorusu
  | 'greeting'               // Selamlama
  | 'feedback';              // Geri bildirim

export type EmotionType =
  | 'worried'       // Endişeli
  | 'frustrated'    // Sinirli/hayal kırıklığı
  | 'confused'      // Kafası karışık
  | 'curious'       // Meraklı
  | 'neutral'       // Nötr
  | 'positive';     // Pozitif

export type SeverityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface UserIntent {
  type: IntentType;
  emotion: EmotionType;
  severity: SeverityLevel;
  topic?: string;
  needsEmpathy: boolean;
  needsProfessionalReferral: boolean;
  confidence: number;
  matchedPatterns: string[];
}

// ============================================
// CONCERN PATTERNS (Endişe Kalıpları)
// ============================================

const CONCERN_PATTERNS = {
  // Davranış sorunları
  behavioral: [
    'istemiyor', 'yapmıyor', 'reddediyor', 'kabul etmiyor',
    'dinlemiyor', 'söz dinlemiyor', 'inatçı', 'huysuz',
    'kavga', 'vuruyor', 'ısırıyor', 'bağırıyor',
    'paylaşmıyor', 'kıskanıyor', 'yalan söylüyor'
  ],

  // Duygusal sorunlar
  emotional: [
    'korkuyor', 'korku', 'kabus', 'karanlık',
    'ağlıyor', 'mutsuz', 'üzgün', 'depresif',
    'kaygı', 'endişe', 'panik', 'stres',
    'öfke', 'sinir', 'kızgın', 'sinirli',
    'utangaç', 'çekingen', 'içine kapanık'
  ],

  // Gelişimsel endişeler
  developmental: [
    'geç kaldı', 'geride', 'yapamıyor', 'beceremiyor',
    'öğrenmiyor', 'konuşmuyor', 'yürümüyor',
    'normal mi', 'akranları', 'yaşıtları',
    'gelişim', 'milestone', 'aşama'
  ],

  // Sosyal sorunlar
  social: [
    'arkadaş', 'arkadaşı yok', 'yalnız', 'dışlanıyor',
    'oyun', 'oynamıyor', 'grup', 'sosyal',
    'okul', 'kreş', 'anaokulu', 'adaptasyon'
  ],

  // Fiziksel/sağlık
  physical: [
    'yemek', 'yemiyor', 'iştah', 'kilo',
    'uyku', 'uyumuyor', 'uyanıyor', 'gece',
    'tuvalet', 'altına kaçırıyor', 'bez'
  ],

  // Ebeveynlik soruları
  parenting: [
    'ne yapmalıyım', 'nasıl davranmalıyım', 'doğru mu',
    'yanlış mı', 'yapıyorum', 'nasıl', 'tavsiye',
    'öneri', 'yardım', 'destek', 'bilmiyorum'
  ]
};

// ============================================
// EMOTION INDICATORS (Duygu Göstergeleri)
// ============================================

const EMOTION_INDICATORS = {
  worried: [
    'endişe', 'merak ediyorum', 'kaygı', 'korku',
    'tedirgin', 'rahatsız', 'sorun', 'problem'
  ],
  frustrated: [
    'bıktım', 'yoruldum', 'çıldıracağım', 'sinir',
    'dayanamıyorum', 'sabır', 'tükendi', 'olmadı'
  ],
  confused: [
    'anlamıyorum', 'bilmiyorum', 'emin değilim',
    'kafam karışık', 'ne yapacağımı', 'şaşkın'
  ],
  curious: [
    'merak', 'öğrenmek', 'nasıl', 'neden', 'ne',
    'bilgi', 'sormak', 'acaba'
  ],
  positive: [
    'teşekkür', 'harika', 'güzel', 'sevindim',
    'mutlu', 'iyi', 'başardı', 'gelişti'
  ]
};

// ============================================
// SEVERITY INDICATORS (Ciddiyet Göstergeleri)
// ============================================

const SEVERITY_INDICATORS = {
  urgent: [
    'kendine zarar', 'intihar', 'ölmek', 'şiddet',
    'istismar', 'taciz', 'tehlike', 'acil'
  ],
  high: [
    'hiç', 'asla', 'tamamen', 'sürekli',
    'her zaman', 'yemek yemiyor', 'konuşmuyor',
    'ağır', 'ciddi', 'uzman', 'doktor'
  ],
  medium: [
    'çok', 'fazla', 'sık sık', 'genellikle',
    'endişeleniyorum', 'normal değil', 'problem'
  ],
  low: [
    'bazen', 'ara sıra', 'nadiren', 'biraz',
    'hafif', 'küçük', 'ufak'
  ]
};

// ============================================
// TECHNICAL KEYWORDS (Teknik Kelimeler)
// ============================================

const TECHNICAL_KEYWORDS = [
  // Uygulama özellikleri
  'pdf', 'indir', 'yükle', 'kaydet', 'paylaş',
  'hesap', 'şifre', 'giriş', 'çıkış', 'profil',
  'abonelik', 'ücret', 'fiyat', 'premium',

  // Özellikler
  'masal', 'hikaye', 'analiz', 'boyama', 'çizim',
  'interaktif', 'sesli', 'yazdır', 'rapor',

  // Teknik sorunlar
  'hata', 'çalışmıyor', 'açılmıyor', 'yavaş',
  'donuyor', 'kapanıyor', 'bug', 'sorun'
];

// ============================================
// GREETING PATTERNS
// ============================================

const GREETING_PATTERNS = [
  'merhaba', 'selam', 'günaydın', 'iyi günler',
  'iyi akşamlar', 'hey', 'hi', 'hello'
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ğ]/g, 'g')
    .replace(/[ü]/g, 'u')
    .replace(/[ş]/g, 's')
    .replace(/[ı]/g, 'i')
    .replace(/[ö]/g, 'o')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsAny(text: string, patterns: string[]): boolean {
  const normalized = normalizeText(text);
  return patterns.some(pattern => normalized.includes(normalizeText(pattern)));
}

function countMatches(text: string, patterns: string[]): number {
  const normalized = normalizeText(text);
  return patterns.filter(pattern => normalized.includes(normalizeText(pattern))).length;
}

function getMatchedPatterns(text: string, patterns: string[]): string[] {
  const normalized = normalizeText(text);
  return patterns.filter(pattern => normalized.includes(normalizeText(pattern)));
}

// ============================================
// MAIN DETECTION FUNCTIONS
// ============================================

/**
 * Detect user emotion from message
 */
export function detectEmotion(message: string): EmotionType {
  const text = normalizeText(message);

  // Check each emotion type
  const scores: Record<EmotionType, number> = {
    worried: countMatches(text, EMOTION_INDICATORS.worried),
    frustrated: countMatches(text, EMOTION_INDICATORS.frustrated),
    confused: countMatches(text, EMOTION_INDICATORS.confused),
    curious: countMatches(text, EMOTION_INDICATORS.curious),
    positive: countMatches(text, EMOTION_INDICATORS.positive),
    neutral: 0
  };

  // Find highest scoring emotion
  let maxScore = 0;
  let detectedEmotion: EmotionType = 'neutral';

  for (const [emotion, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion as EmotionType;
    }
  }

  return detectedEmotion;
}

/**
 * Detect severity level of concern
 */
export function detectSeverity(message: string): SeverityLevel {
  if (containsAny(message, SEVERITY_INDICATORS.urgent)) {
    return 'urgent';
  }
  if (containsAny(message, SEVERITY_INDICATORS.high)) {
    return 'high';
  }
  if (containsAny(message, SEVERITY_INDICATORS.medium)) {
    return 'medium';
  }
  return 'low';
}

/**
 * Detect concern topic
 */
export function detectConcernTopic(message: string): string | undefined {
  const text = normalizeText(message);

  const topicScores: Record<string, number> = {
    behavioral: countMatches(text, CONCERN_PATTERNS.behavioral),
    emotional: countMatches(text, CONCERN_PATTERNS.emotional),
    developmental: countMatches(text, CONCERN_PATTERNS.developmental),
    social: countMatches(text, CONCERN_PATTERNS.social),
    physical: countMatches(text, CONCERN_PATTERNS.physical),
    parenting: countMatches(text, CONCERN_PATTERNS.parenting)
  };

  let maxScore = 0;
  let topic: string | undefined;

  for (const [t, score] of Object.entries(topicScores)) {
    if (score > maxScore) {
      maxScore = score;
      topic = t;
    }
  }

  return maxScore > 0 ? topic : undefined;
}

/**
 * Check if message is a parenting concern
 */
export function isParentingConcern(message: string): boolean {
  const allConcernPatterns = [
    ...CONCERN_PATTERNS.behavioral,
    ...CONCERN_PATTERNS.emotional,
    ...CONCERN_PATTERNS.developmental,
    ...CONCERN_PATTERNS.social,
    ...CONCERN_PATTERNS.physical,
    ...CONCERN_PATTERNS.parenting
  ];

  // Must have at least 2 concern pattern matches
  const matchCount = countMatches(message, allConcernPatterns);

  // Or specific phrases
  const specificPhrases = [
    'çocuğum', 'oğlum', 'kızım', 'bebeğim',
    'ne yapmalıyım', 'nasıl davranmalıyım', 'tavsiye'
  ];

  const hasChildReference = containsAny(message, ['çocuğum', 'oğlum', 'kızım', 'bebeğim', 'yavrumuzun']);
  const hasParentingQuestion = containsAny(message, CONCERN_PATTERNS.parenting);

  return (matchCount >= 2) || (hasChildReference && hasParentingQuestion);
}

/**
 * Check if message is a technical question
 */
export function isTechnicalQuestion(message: string): boolean {
  return countMatches(message, TECHNICAL_KEYWORDS) >= 2;
}

/**
 * Check if message is a greeting
 */
export function isGreeting(message: string): boolean {
  const normalized = normalizeText(message);
  const words = normalized.split(' ');

  // Short message that's just a greeting
  return words.length <= 3 && containsAny(message, GREETING_PATTERNS);
}

/**
 * Main intent detection function
 */
export function detectUserIntent(message: string): UserIntent {
  const emotion = detectEmotion(message);
  const severity = detectSeverity(message);
  const topic = detectConcernTopic(message);

  // Collect all matched patterns for debugging
  const allConcernPatterns = [
    ...CONCERN_PATTERNS.behavioral,
    ...CONCERN_PATTERNS.emotional,
    ...CONCERN_PATTERNS.developmental,
    ...CONCERN_PATTERNS.social,
    ...CONCERN_PATTERNS.physical,
    ...CONCERN_PATTERNS.parenting
  ];
  const matchedPatterns = getMatchedPatterns(message, allConcernPatterns);

  // Determine intent type (priority order)
  let intentType: IntentType = 'general_inquiry';
  let needsEmpathy = false;
  let needsProfessionalReferral = false;
  let confidence = 0.5;

  // Priority 1: Check for urgent situations
  if (severity === 'urgent') {
    intentType = 'emotional_support';
    needsEmpathy = true;
    needsProfessionalReferral = true;
    confidence = 0.95;
  }
  // Priority 2: Check for parenting concern
  else if (isParentingConcern(message)) {
    intentType = 'parenting_concern';
    needsEmpathy = true;
    needsProfessionalReferral = severity === 'high';
    confidence = 0.85;

    // Refine to child development if appropriate
    if (topic === 'developmental') {
      intentType = 'child_development';
    } else if (topic === 'emotional' || emotion === 'worried') {
      intentType = 'emotional_support';
    }
  }
  // Priority 3: Check for technical question
  else if (isTechnicalQuestion(message)) {
    intentType = 'technical_question';
    needsEmpathy = false;
    confidence = 0.8;
  }
  // Priority 4: Check for greeting
  else if (isGreeting(message)) {
    intentType = 'greeting';
    needsEmpathy = false;
    confidence = 0.9;
  }

  return {
    type: intentType,
    emotion,
    severity,
    topic,
    needsEmpathy,
    needsProfessionalReferral,
    confidence,
    matchedPatterns
  };
}

/**
 * Get emotion-appropriate response prefix
 */
export function getEmotionPrefix(emotion: EmotionType): string {
  const prefixes: Record<EmotionType, string[]> = {
    worried: [
      'Endişenizi anlıyorum. 💙',
      'Bu konuda kaygı duymanız çok normal.',
      'Merak etmeniz doğal, birlikte bakalım.'
    ],
    frustrated: [
      'Bu durumun zor olduğunu biliyorum. 🤗',
      'Yorucu bir süreç, anlıyorum.',
      'Sabırlı olmanız takdire değer.'
    ],
    confused: [
      'Kafanızı karıştıran bir durum, anlıyorum.',
      'Bu konuda belirsizlik yaşamanız normal.',
      'Birlikte netleştirelim.'
    ],
    curious: [
      'Güzel bir soru! 🌟',
      'Merak etmeniz harika.',
      'Öğrenme isteğiniz çok güzel.'
    ],
    positive: [
      'Ne güzel! 🎉',
      'Bu harika bir gelişme!',
      'Sevindim bunu duyduğuma.'
    ],
    neutral: [
      'Merhaba! 👋',
      'Size yardımcı olmak isterim.',
      ''
    ]
  };

  const options = prefixes[emotion];
  return options[Math.floor(Math.random() * options.length)];
}
