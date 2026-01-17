/**
 * ChatBot Empathy Response System
 *
 * Empatik ve destekleyici yanıt oluşturma sistemi
 */

import { EmotionType, SeverityLevel } from './chatbot-intent';
import { ParentingFAQItem } from './chatbot-parenting';

// ============================================
// EMPATHY TEMPLATES
// ============================================

const EMPATHY_ACKNOWLEDGMENTS: Record<EmotionType, string[]> = {
  worried: [
    'Endişenizi anlıyorum. 💙',
    'Bu konuda kaygı duymanız çok doğal.',
    'Böyle hissetmeniz normal, birlikte bakalım.',
    'Merak etmenizi anlıyorum.',
    'Bu durumun sizi endişelendirdiğini görüyorum.'
  ],
  frustrated: [
    'Bu durumun zor olduğunu biliyorum. 🤗',
    'Yorucu bir süreç, sizi anlıyorum.',
    'Bazen gerçekten zorlayıcı olabiliyor.',
    'Sabırlı kalmaya çalışmanız takdire değer.',
    'Bu kadar uğraşmanız çok güzel.'
  ],
  confused: [
    'Kafanızı karıştıran bir durum, anlıyorum.',
    'Bu konuda belirsizlik yaşamanız normal.',
    'Birlikte netleştirelim.',
    'Emin olmamak çok doğal.',
    'Sormak en doğru adım.'
  ],
  curious: [
    'Güzel bir soru! 🌟',
    'Merak etmeniz harika.',
    'Öğrenme isteğiniz çok güzel.',
    'Bu konuyu araştırmanız çok iyi.',
    'Sormak en iyisi!'
  ],
  positive: [
    'Ne güzel! 🎉',
    'Bu harika bir gelişme!',
    'Sevindim bunu duyduğuma.',
    'Harika gidiyorsunuz!',
    'Çok güzel bir paylaşım!'
  ],
  neutral: [
    'Merhaba! 👋',
    'Size yardımcı olmak isterim.',
    '',
    'Tabii ki, bakayım.',
    'Elbette, yardımcı olabilirim.'
  ]
};

const VALIDATION_PHRASES: string[] = [
  'Bu konuda soru sormanız çok güzel.',
  'Çocuğunuz için düşünmeniz harika.',
  'Doğru adımı atmak istemeniz takdire değer.',
  'Araştırmanız çok önemli.',
  'Bu konuyla ilgilenmeniz çocuğunuz için değerli.'
];

const REASSURANCE_PHRASES: Record<string, string[]> = {
  behavioral: [
    'Birçok ebeveyn benzer durumlar yaşıyor.',
    'Bu dönemler genellikle geçicidir.',
    'Sabırlı yaklaşımınız fark yaratacak.',
    'Tutarlı davrandığınızda sonuç alacaksınız.'
  ],
  emotional: [
    'Duygusal gelişim zaman alır, sabredin.',
    'Yanında olmanız en önemli destek.',
    'Bu duyguları yaşaması normal.',
    'Zamanla bu beceriyi öğrenecek.'
  ],
  developmental: [
    'Her çocuk kendi hızında gelişir.',
    'Karşılaştırma yerine kendi ilerlemesine bakın.',
    'Küçük adımlar da önemli.',
    'Gelişim doğrusal değil, iniş çıkışlar normal.'
  ],
  social: [
    'Sosyal beceriler öğrenilen becerilerdir.',
    'Zaman ve pratikle gelişecek.',
    'Küçük adımlarla başlamak en iyisi.',
    'Her çocuğun sosyalleşme biçimi farklıdır.'
  ],
  physical: [
    'Rutinler zaman alır ama işe yarar.',
    'Tutarlılık anahtardır.',
    'Birkaç hafta içinde fark göreceksiniz.',
    'Küçük değişiklikler bile fark yaratır.'
  ],
  parenting_tips: [
    'Ebeveynlik öğrenme sürecidir.',
    'Mükemmel ebeveyn diye bir şey yok.',
    '"Yeterince iyi" ebeveyn olmak yeterli.',
    'Kendinize de şefkat gösterin.'
  ]
};

const PROFESSIONAL_REFERRAL_MESSAGES = {
  gentle: [
    '💡 Endişeleriniz devam ederse, bir çocuk psikoloğuna danışmak faydalı olabilir.',
    '👨‍⚕️ Çocuk doktorunuzla da bu konuyu paylaşabilirsiniz.',
    '📋 Profesyonel bir değerlendirme size daha net bilgi verebilir.'
  ],
  moderate: [
    '⚠️ Bu durumda profesyonel destek almanızı öneririm.',
    '👨‍⚕️ Bir çocuk psikoloğu veya psikiyatristi size yardımcı olabilir.',
    '🏥 En kısa sürede uzman görüşü almanız önemli.'
  ],
  urgent: [
    '🚨 Bu durum acil profesyonel müdahale gerektirir.',
    '📞 Lütfen hemen bir ruh sağlığı uzmanıyla iletişime geçin.',
    '🏥 Çocuk Acil veya 182 (ALO 182) hattını arayabilirsiniz.'
  ]
};

// ============================================
// EMPATHETIC RESPONSE BUILDER
// ============================================

export interface EmpatheticResponseOptions {
  emotion: EmotionType;
  severity: SeverityLevel;
  topic?: string;
  faq?: ParentingFAQItem;
  includeValidation?: boolean;
  includeReassurance?: boolean;
  includeProfessionalReferral?: boolean;
  // Faz 4: Yaşa göre özelleştirme
  childAge?: number;
  childName?: string;
}

export interface EmpatheticResponse {
  empathy: string;
  validation?: string;
  content: string;
  reassurance?: string;
  professionalReferral?: string;
  fullResponse: string;
}

/**
 * Get random item from array
 */
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Build empathetic acknowledgment based on emotion
 */
export function getEmpathyAcknowledgment(emotion: EmotionType): string {
  const options = EMPATHY_ACKNOWLEDGMENTS[emotion];
  return getRandomItem(options);
}

/**
 * Get validation phrase
 */
export function getValidation(): string {
  return getRandomItem(VALIDATION_PHRASES);
}

/**
 * Get reassurance based on topic
 */
export function getReassurance(topic?: string): string {
  const category = topic || 'parenting_tips';
  const options = REASSURANCE_PHRASES[category] || REASSURANCE_PHRASES.parenting_tips;
  return getRandomItem(options);
}

/**
 * Get professional referral message based on severity
 */
export function getProfessionalReferral(severity: SeverityLevel): string {
  if (severity === 'urgent') {
    return getRandomItem(PROFESSIONAL_REFERRAL_MESSAGES.urgent);
  }
  if (severity === 'high') {
    return getRandomItem(PROFESSIONAL_REFERRAL_MESSAGES.moderate);
  }
  return getRandomItem(PROFESSIONAL_REFERRAL_MESSAGES.gentle);
}

/**
 * Get age-specific tips based on child's age and topic
 */
function getAgeSpecificTips(childAge: number, topic?: string): string | undefined {
  // Define age groups
  const ageGroup = childAge <= 2 ? 'toddler' : childAge <= 5 ? 'preschool' : childAge <= 8 ? 'school' : 'preteen';

  const tips: Record<string, Record<string, string>> = {
    behavioral: {
      toddler: '👶 **0-2 yaş için:** Bu yaşta çocuklar henüz duygularını kontrol edemezler. Kısa ve basit yönlendirmeler yapın, sabırlı olun.',
      preschool: '🧒 **3-5 yaş için:** Bu dönemde çocuklar bağımsızlık kazanmaya çalışır. Seçenek sunarak kontrol hissi verin.',
      school: '📚 **6-8 yaş için:** Artık kuralları anlayabilirler. Beklentileri net açıklayın ve tutarlı olun.',
      preteen: '🎯 **9+ yaş için:** Çocuğunuzla birlikte kuralları belirleyin. Sorumluluklarını artırın.',
    },
    emotional: {
      toddler: '👶 **0-2 yaş için:** Duygularını isimlendirin ("Üzgün görünüyorsun"). Fiziksel rahatlık önemli.',
      preschool: '🧒 **3-5 yaş için:** Duyguları resimle veya oyunla ifade etmesine izin verin.',
      school: '📚 **6-8 yaş için:** Duygu günlüğü tutabilir. Konuşarak rahatlama pratiği yapın.',
      preteen: '🎯 **9+ yaş için:** Özel alanına saygı gösterin ama her zaman konuşmaya hazır olduğunuzu belirtin.',
    },
    developmental: {
      toddler: '👶 **0-2 yaş için:** Her çocuk farklı hızda gelişir. Kıyaslama yapmayın, sadece destekleyin.',
      preschool: '🧒 **3-5 yaş için:** Oyun üzerinden öğrenme bu yaşta en etkilidir.',
      school: '📚 **6-8 yaş için:** Akademik beklentiler artabilir ama her çocuğun güçlü yanları farklıdır.',
      preteen: '🎯 **9+ yaş için:** Ergenliğe hazırlık dönemi. Bedensel ve duygusal değişimlere hazır olun.',
    },
    social: {
      toddler: '👶 **0-2 yaş için:** Paralel oyun normaldir. Gerçek paylaşım 3 yaş civarı başlar.',
      preschool: '🧒 **3-5 yaş için:** Küçük gruplarla sosyalleşme fırsatları yaratın.',
      school: '📚 **6-8 yaş için:** Arkadaşlık becerileri öğretilebilir. Rol yapma oyunları yardımcı olabilir.',
      preteen: '🎯 **9+ yaş için:** Akran baskısı başlayabilir. Değerlerini pekiştirin ama bağımsızlığına saygı gösterin.',
    },
    physical: {
      toddler: '👶 **0-2 yaş için:** Düzenli rutin çok önemli. Uyku ve yemek saatleri tutarlı olmalı.',
      preschool: '🧒 **3-5 yaş için:** Hareket ihtiyacı yüksek. Günde en az 1 saat aktif oyun hedefleyin.',
      school: '📚 **6-8 yaş için:** Ekran süresi sınırları koyun. Spor veya fiziksel aktivite önemli.',
      preteen: '🎯 **9+ yaş için:** Vücut değişimleri başlıyor. Sağlıklı alışkanlıkları pekiştirin.',
    },
  };

  const categoryTips = tips[topic || 'behavioral'];
  if (categoryTips) {
    return categoryTips[ageGroup];
  }
  return undefined;
}

/**
 * Build complete empathetic response
 */
export function buildEmpatheticResponse(options: EmpatheticResponseOptions): EmpatheticResponse {
  const {
    emotion,
    severity,
    topic,
    faq,
    includeValidation = true,
    includeReassurance = true,
    includeProfessionalReferral = false,
    childAge,
    childName,
  } = options;

  // Get empathy acknowledgment
  const empathy = getEmpathyAcknowledgment(emotion);

  // Get validation (optional)
  const validation = includeValidation ? getValidation() : undefined;

  // Get main content from FAQ
  let content = faq?.answer || '';

  // Personalize with child name if provided
  if (childName && content) {
    content = content.replace(/çocuğunuz/gi, childName);
    content = content.replace(/çocuğunuzun/gi, `${childName}'in`);
  }

  // Get reassurance (optional)
  const reassurance = includeReassurance ? getReassurance(topic) : undefined;

  // Get age-specific tips (Faz 4)
  const ageSpecificTip = childAge !== undefined ? getAgeSpecificTips(childAge, topic) : undefined;

  // Get professional referral (if needed)
  const professionalReferral = includeProfessionalReferral || severity === 'high' || severity === 'urgent'
    ? getProfessionalReferral(severity)
    : undefined;

  // Build full response
  const parts: string[] = [];

  // Add empathy
  if (empathy) {
    parts.push(empathy);
  }

  // Add validation
  if (validation) {
    parts.push(validation);
  }

  // Add empty line before content
  if (parts.length > 0 && content) {
    parts.push('');
  }

  // Add main content
  if (content) {
    parts.push(content);
  }

  // Add age-specific tips (Faz 4)
  if (ageSpecificTip) {
    parts.push('');
    parts.push(ageSpecificTip);
  }

  // Add reassurance
  if (reassurance) {
    parts.push('');
    parts.push(`💡 ${reassurance}`);
  }

  // Add professional referral
  if (professionalReferral) {
    parts.push('');
    parts.push(professionalReferral);
  }

  return {
    empathy,
    validation,
    content,
    reassurance,
    professionalReferral,
    fullResponse: parts.join('\n')
  };
}

/**
 * Wrap existing answer with empathy
 */
export function wrapWithEmpathy(
  answer: string,
  emotion: EmotionType,
  severity: SeverityLevel,
  topic?: string
): string {
  const empathy = getEmpathyAcknowledgment(emotion);
  const reassurance = getReassurance(topic);

  const parts: string[] = [];

  // Add empathy only if emotion warrants it
  if (emotion !== 'neutral' && emotion !== 'curious') {
    parts.push(empathy);
    parts.push('');
  }

  // Add main content
  parts.push(answer);

  // Add reassurance for worried/frustrated emotions
  if (emotion === 'worried' || emotion === 'frustrated') {
    parts.push('');
    parts.push(`💡 ${reassurance}`);
  }

  // Add professional referral for high severity
  if (severity === 'high' || severity === 'urgent') {
    parts.push('');
    parts.push(getProfessionalReferral(severity));
  }

  return parts.join('\n');
}

// ============================================
// QUICK REPLY GENERATORS
// ============================================

export interface ParentingQuickReply {
  id: string;
  label: string;
  emoji: string;
  action: 'send' | 'navigate' | 'custom';
  target?: string;
}

/**
 * Get quick replies for parenting responses
 */
export function getParentingQuickReplies(category?: string): ParentingQuickReply[] {
  const baseReplies: ParentingQuickReply[] = [
    {
      id: 'more-tips',
      label: 'Daha fazla öneri',
      emoji: '💡',
      action: 'send'
    },
    {
      id: 'ask-followup',
      label: 'Başka sorum var',
      emoji: '❓',
      action: 'send'
    }
  ];

  // Add category-specific replies
  if (category === 'behavioral' || category === 'emotional') {
    baseReplies.push({
      id: 'age-specific',
      label: 'Yaşına göre bilgi',
      emoji: '📅',
      action: 'send'
    });
  }

  if (category === 'developmental') {
    baseReplies.push({
      id: 'professional',
      label: 'Uzman önerisi',
      emoji: '👨‍⚕️',
      action: 'send'
    });
  }

  // Always add "Helpful" option
  baseReplies.push({
    id: 'helpful',
    label: 'Yardımcı oldu',
    emoji: '✅',
    action: 'custom'
  });

  return baseReplies;
}

/**
 * Get suggested follow-up questions based on topic
 */
export function getSuggestedQuestions(topic?: string): string[] {
  const questions: Record<string, string[]> = {
    behavioral: [
      'Bu davranış ne kadar süredir var?',
      'Başka ne denememi önerirsiniz?',
      'Ne zaman endişelenmeliyim?'
    ],
    emotional: [
      'Çocuğumla bu konuyu nasıl konuşabilirim?',
      'Evde başka ne yapabilirim?',
      'Bu yaş için normal mi?'
    ],
    developmental: [
      'Yaşıtlarıyla karşılaştırınca nasıl?',
      'Nasıl destekleyebilirim?',
      'Uzman gerekli mi?'
    ],
    social: [
      'Arkadaşlık için ne yapabilirim?',
      'Sosyal becerilerini nasıl geliştirebilirim?',
      'Okul hakkında ne yapmalıyım?'
    ],
    physical: [
      'Rutinleri nasıl oluşturabilirim?',
      'Ne kadar süre beklemeliyim?',
      'Doktora gitmeliyim mi?'
    ],
    default: [
      'Bu konuda başka öneriniz var mı?',
      'Yaşına göre ne beklemeliyim?',
      'Kaynak önerir misiniz?'
    ]
  };

  return questions[topic || 'default'] || questions.default;
}
