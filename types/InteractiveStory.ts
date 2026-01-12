// Interactive Story Types
// Bu dosya interaktif masal sisteminin tüm tip tanımlarını içerir

// ============================================
// Kişilik Özellikleri (Personality Traits)
// ============================================

export type PersonalityTrait =
  | 'empathy'        // Empati - Başkalarının duygularını anlama
  | 'courage'        // Cesaret - Zor durumlarda ileri adım atma
  | 'curiosity'      // Merak - Yeni şeyler öğrenme isteği
  | 'creativity'     // Yaratıcılık - Farklı çözümler düşünme
  | 'problem_solving'// Problem Çözme - Mantıklı düşünme
  | 'sharing'        // Paylaşım - Başkalarıyla bölüşme
  | 'patience'       // Sabır - Beklemeyi bilme
  | 'independence';  // Bağımsızlık - Kendi başına hareket etme

export const TRAIT_DEFINITIONS: Record<PersonalityTrait, {
  name_tr: string;
  name_en: string;
  emoji: string;
  color: string;
  positive_description_tr: string;
  positive_description_en: string;
  activity_suggestion_tr: string;
  activity_suggestion_en: string;
}> = {
  empathy: {
    name_tr: "Empati",
    name_en: "Empathy",
    emoji: "💜",
    color: "#9333EA",
    positive_description_tr: "Çocuğunuz başkalarının duygularını anlamakta çok başarılı. Bu değerli bir sosyal beceri!",
    positive_description_en: "Your child excels at understanding others' feelings. This is a valuable social skill!",
    activity_suggestion_tr: "Birlikte hayvan barınağı ziyaret edin veya yaşlılara kart yazın.",
    activity_suggestion_en: "Visit an animal shelter together or write cards for elderly neighbors."
  },
  courage: {
    name_tr: "Cesaret",
    name_en: "Courage",
    emoji: "🦁",
    color: "#EF4444",
    positive_description_tr: "Çocuğunuz zor durumlardan korkmadan ileri adım atabiliyor. Bu güçlü bir liderlik özelliği!",
    positive_description_en: "Your child steps forward bravely in difficult situations. This is a strong leadership quality!",
    activity_suggestion_tr: "Yeni bir spor veya aktivite deneyin, cesaretini destekleyin.",
    activity_suggestion_en: "Try a new sport or activity together, supporting their bravery."
  },
  curiosity: {
    name_tr: "Merak",
    name_en: "Curiosity",
    emoji: "🔍",
    color: "#3B82F6",
    positive_description_tr: "Çocuğunuz dünyayı keşfetmeye meraklı. Bu öğrenme aşkının temelidir!",
    positive_description_en: "Your child is curious about exploring the world. This is the foundation of a love for learning!",
    activity_suggestion_tr: "Birlikte doğa yürüyüşüne çıkın ve sorularını dinleyin.",
    activity_suggestion_en: "Go on nature walks together and listen to their questions."
  },
  creativity: {
    name_tr: "Yaratıcılık",
    name_en: "Creativity",
    emoji: "🎨",
    color: "#F59E0B",
    positive_description_tr: "Çocuğunuz yaratıcı düşünebiliyor ve farklı çözümler üretebiliyor!",
    positive_description_en: "Your child can think creatively and come up with different solutions!",
    activity_suggestion_tr: "Sanat malzemeleri sağlayın ve serbest çizim/oyun zamanı verin.",
    activity_suggestion_en: "Provide art supplies and give them free drawing/play time."
  },
  problem_solving: {
    name_tr: "Problem Çözme",
    name_en: "Problem Solving",
    emoji: "🧩",
    color: "#10B981",
    positive_description_tr: "Çocuğunuz mantıklı düşünüp çözüm bulabiliyor. Bu akademik başarıya katkı sağlar!",
    positive_description_en: "Your child can think logically and find solutions. This contributes to academic success!",
    activity_suggestion_tr: "Bulmaca, lego veya strateji oyunları oynayın.",
    activity_suggestion_en: "Play puzzles, lego, or strategy games together."
  },
  sharing: {
    name_tr: "Paylaşım",
    name_en: "Sharing",
    emoji: "🤝",
    color: "#EC4899",
    positive_description_tr: "Çocuğunuz paylaşmayı ve işbirliği yapmayı seviyor. Bu güçlü sosyal bağlar kurar!",
    positive_description_en: "Your child loves sharing and cooperating. This builds strong social bonds!",
    activity_suggestion_tr: "Birlikte yemek pişirin ve paylaşın, ya da oyuncak bağışı yapın.",
    activity_suggestion_en: "Cook and share food together, or donate toys to those in need."
  },
  patience: {
    name_tr: "Sabır",
    name_en: "Patience",
    emoji: "🌱",
    color: "#6366F1",
    positive_description_tr: "Çocuğunuz sabırlı bekleyebiliyor. Bu duygusal olgunluğun işareti!",
    positive_description_en: "Your child can wait patiently. This is a sign of emotional maturity!",
    activity_suggestion_tr: "Birlikte bitki yetiştirin veya uzun süreli bir proje başlatın.",
    activity_suggestion_en: "Grow plants together or start a long-term project."
  },
  independence: {
    name_tr: "Bağımsızlık",
    name_en: "Independence",
    emoji: "🚀",
    color: "#14B8A6",
    positive_description_tr: "Çocuğunuz kendi başına karar verebiliyor. Bu özgüven gelişiminin göstergesi!",
    positive_description_en: "Your child can make decisions independently. This shows confidence development!",
    activity_suggestion_tr: "Günlük küçük kararları kendisinin vermesine izin verin.",
    activity_suggestion_en: "Let them make small daily decisions on their own."
  }
};

// ============================================
// Terapötik Travma Türü → Özellik Eşlemesi
// ============================================

export type ConcernType =
  | 'war' | 'violence' | 'disaster' | 'loss' | 'loneliness' | 'fear'
  | 'abuse' | 'family_separation' | 'death' | 'neglect' | 'bullying'
  | 'domestic_violence_witness' | 'parental_addiction' | 'parental_mental_illness'
  | 'medical_trauma' | 'anxiety' | 'depression' | 'low_self_esteem'
  | 'anger' | 'school_stress' | 'social_rejection' | 'displacement'
  | 'poverty' | 'cyberbullying' | 'other' | 'none';

export interface TherapeuticTraitMapping {
  recommendedTraits: PersonalityTrait[];
  therapeuticValue_tr: string;
  therapeuticValue_en: string;
  copingMechanism_tr: string;
  copingMechanism_en: string;
  parentGuidance_tr: string[];
  parentGuidance_en: string[];
  avoidTopics_tr: string[];
  avoidTopics_en: string[];
}

export const THERAPEUTIC_TRAIT_MAPPING: Record<ConcernType, TherapeuticTraitMapping> = {
  war: {
    recommendedTraits: ['courage', 'empathy', 'patience'],
    therapeuticValue_tr: "Savaş/çatışma temalarıyla başa çıkmak için güvenlik ve barış hissi oluşturma",
    therapeuticValue_en: "Building sense of safety and peace to cope with war/conflict themes",
    copingMechanism_tr: "Çocuğunuz zor durumlarla başa çıkarken koruyucu ve barışçıl çözümler aramayı tercih ediyor",
    copingMechanism_en: "Your child prefers seeking protective and peaceful solutions when facing difficulties",
    parentGuidance_tr: [
      "Güvenli bir ortamda olduğunu hissettirin",
      "Haberlere maruziyeti sınırlayın",
      "Barış ve güvenlik temalı aktiviteler yapın",
      "Duygularını ifade etmesine izin verin"
    ],
    parentGuidance_en: [
      "Make them feel they are in a safe environment",
      "Limit exposure to news",
      "Do activities with peace and safety themes",
      "Allow them to express their feelings"
    ],
    avoidTopics_tr: ["Silah", "savaş detayları", "şiddet haberleri"],
    avoidTopics_en: ["Weapons", "war details", "violence news"]
  },
  violence: {
    recommendedTraits: ['courage', 'problem_solving', 'empathy'],
    therapeuticValue_tr: "Şiddet temalarını güç ve kontrol hissiyle dönüştürme",
    therapeuticValue_en: "Transforming violence themes with sense of power and control",
    copingMechanism_tr: "Çocuğunuz zorluklarla karşılaştığında güçlü durmayı ve çözüm bulmayı tercih ediyor",
    copingMechanism_en: "Your child prefers standing strong and finding solutions when facing challenges",
    parentGuidance_tr: [
      "Güvenli olduğunu vurgulayın",
      "Fiziksel aktivitelerle enerji atmasına yardımcı olun",
      "Koruyucu figürleri (polis, itfaiye) tanıtın",
      "Şiddetsiz problem çözme yollarını konuşun"
    ],
    parentGuidance_en: [
      "Emphasize that they are safe",
      "Help release energy through physical activities",
      "Introduce protective figures (police, firefighters)",
      "Discuss non-violent problem solving methods"
    ],
    avoidTopics_tr: ["Detaylı şiddet sahneleri", "korku verici hikayeler"],
    avoidTopics_en: ["Detailed violence scenes", "scary stories"]
  },
  fear: {
    recommendedTraits: ['courage', 'problem_solving', 'patience'],
    therapeuticValue_tr: "Korkuyu yönetilebilir ve yenilebilir bir şey olarak görme",
    therapeuticValue_en: "Seeing fear as something manageable and defeatable",
    copingMechanism_tr: "Çocuğunuz korkularıyla yüzleşirken cesaret ve mantık kullanmayı tercih ediyor",
    copingMechanism_en: "Your child prefers using courage and logic when facing fears",
    parentGuidance_tr: [
      "Korkularını küçümsemeyin, dinleyin",
      "Küçük adımlarla korkuyla yüzleşmeyi destekleyin",
      "Nefes egzersizleri öğretin",
      "Başarı hikayelerini paylaşın"
    ],
    parentGuidance_en: [
      "Don't belittle their fears, listen",
      "Support facing fears in small steps",
      "Teach breathing exercises",
      "Share success stories"
    ],
    avoidTopics_tr: ["Korkuyu büyütme", "cezalandırıcı dil"],
    avoidTopics_en: ["Amplifying fear", "punitive language"]
  },
  loneliness: {
    recommendedTraits: ['sharing', 'empathy', 'curiosity'],
    therapeuticValue_tr: "Bağlantı kurma ve aidiyet hissi oluşturma",
    therapeuticValue_en: "Building connection and sense of belonging",
    copingMechanism_tr: "Çocuğunuz yalnızlık hissettiğinde bağlantı kurmaya ve paylaşmaya yöneliyor",
    copingMechanism_en: "Your child tends to connect and share when feeling lonely",
    parentGuidance_tr: [
      "Kaliteli birlikte zaman geçirin",
      "Sosyal aktivitelere katılımı destekleyin",
      "Hayali arkadaşları normalleştirin",
      "Aile bağlarını güçlendirin"
    ],
    parentGuidance_en: [
      "Spend quality time together",
      "Support participation in social activities",
      "Normalize imaginary friends",
      "Strengthen family bonds"
    ],
    avoidTopics_tr: ["Yalnızlığı cezalandırma", "sosyal baskı"],
    avoidTopics_en: ["Punishing loneliness", "social pressure"]
  },
  loss: {
    recommendedTraits: ['empathy', 'patience', 'sharing'],
    therapeuticValue_tr: "Kaybı anlamlandırma ve anıları kutlama",
    therapeuticValue_en: "Making sense of loss and celebrating memories",
    copingMechanism_tr: "Çocuğunuz kayıpla başa çıkarken duygusal bağlantı ve sabır gösteriyor",
    copingMechanism_en: "Your child shows emotional connection and patience when coping with loss",
    parentGuidance_tr: [
      "Yas sürecine saygı gösterin",
      "Anıları paylaşın ve kutlayın",
      "Üzüntünün normal olduğunu söyleyin",
      "Fiziksel yakınlık sunun"
    ],
    parentGuidance_en: [
      "Respect the grieving process",
      "Share and celebrate memories",
      "Say that sadness is normal",
      "Offer physical closeness"
    ],
    avoidTopics_tr: ["Hızlı iyileşme beklentisi", "ölümü gizleme"],
    avoidTopics_en: ["Expecting quick recovery", "hiding death"]
  },
  death: {
    recommendedTraits: ['empathy', 'patience', 'creativity'],
    therapeuticValue_tr: "Ölümü dönüşüm olarak anlama ve sevginin devamını hissetme",
    therapeuticValue_en: "Understanding death as transformation and feeling love continues",
    copingMechanism_tr: "Çocuğunuz ölüm kavramıyla duygusal anlayış ve yaratıcı ifade ile başa çıkıyor",
    copingMechanism_en: "Your child copes with death concept through emotional understanding and creative expression",
    parentGuidance_tr: [
      "Yaşa uygun açıklamalar yapın",
      "Sorularını dürüstçe yanıtlayın",
      "Anma ritüelleri oluşturun",
      "Duygularını sanatla ifade etmesine izin verin"
    ],
    parentGuidance_en: [
      "Give age-appropriate explanations",
      "Answer questions honestly",
      "Create memorial rituals",
      "Allow expressing feelings through art"
    ],
    avoidTopics_tr: ["Ölümü uyku ile karıştırma", "detaylı fiziksel açıklamalar"],
    avoidTopics_en: ["Confusing death with sleep", "detailed physical explanations"]
  },
  bullying: {
    recommendedTraits: ['courage', 'independence', 'empathy'],
    therapeuticValue_tr: "Özgüven inşası ve sosyal güçlenme",
    therapeuticValue_en: "Building self-confidence and social empowerment",
    copingMechanism_tr: "Çocuğunuz zorbalıkla karşılaştığında cesurca durma ve kendi değerini bilme eğiliminde",
    copingMechanism_en: "Your child tends to stand bravely and know their worth when facing bullying",
    parentGuidance_tr: [
      "Asla suçlamayın, dinleyin",
      "Okul ile işbirliği yapın",
      "Sosyal beceriler geliştirin",
      "Güçlü yanlarını vurgulayın"
    ],
    parentGuidance_en: [
      "Never blame, listen",
      "Cooperate with school",
      "Develop social skills",
      "Emphasize their strengths"
    ],
    avoidTopics_tr: ["Karşılık vermeyi teşvik", "durumu küçümseme"],
    avoidTopics_en: ["Encouraging retaliation", "belittling the situation"]
  },
  family_separation: {
    recommendedTraits: ['patience', 'independence', 'sharing'],
    therapeuticValue_tr: "Sevginin mesafeye rağmen devam ettiğini hissetme",
    therapeuticValue_en: "Feeling that love continues despite distance",
    copingMechanism_tr: "Çocuğunuz aile değişikliklerine sabır ve bağımsızlıkla uyum sağlıyor",
    copingMechanism_en: "Your child adapts to family changes with patience and independence",
    parentGuidance_tr: [
      "Her iki ebeveynin sevgisini vurgulayın",
      "Rutinleri koruyun",
      "Çocuğu ortaya koymayın",
      "Duygularını ifade etmesine izin verin"
    ],
    parentGuidance_en: [
      "Emphasize both parents' love",
      "Maintain routines",
      "Don't put the child in the middle",
      "Allow expressing feelings"
    ],
    avoidTopics_tr: ["Diğer ebeveyni kötüleme", "çocuğu haberci yapma"],
    avoidTopics_en: ["Badmouthing other parent", "making child a messenger"]
  },
  anxiety: {
    recommendedTraits: ['patience', 'problem_solving', 'creativity'],
    therapeuticValue_tr: "Kaygıyı yönetilebilir ve kontrol edilebilir yapma",
    therapeuticValue_en: "Making anxiety manageable and controllable",
    copingMechanism_tr: "Çocuğunuz kaygıyla başa çıkarken sakinleşme ve çözüm odaklı düşünme eğiliminde",
    copingMechanism_en: "Your child tends to calm down and think solution-focused when coping with anxiety",
    parentGuidance_tr: [
      "Kaygıyı normalleştirin",
      "Nefes ve gevşeme teknikleri öğretin",
      "Endişeleri birlikte listeleyin",
      "Küçük başarıları kutlayın"
    ],
    parentGuidance_en: [
      "Normalize anxiety",
      "Teach breathing and relaxation techniques",
      "List worries together",
      "Celebrate small successes"
    ],
    avoidTopics_tr: ["Kaygıyı büyütme", "aşırı koruma"],
    avoidTopics_en: ["Amplifying anxiety", "overprotection"]
  },
  anger: {
    recommendedTraits: ['patience', 'empathy', 'creativity'],
    therapeuticValue_tr: "Öfkeyi sağlıklı yollarla ifade etmeyi öğrenme",
    therapeuticValue_en: "Learning to express anger in healthy ways",
    copingMechanism_tr: "Çocuğunuz öfkeyle başa çıkarken sakinleşme ve duygusal anlayış gösterme eğiliminde",
    copingMechanism_en: "Your child tends to calm down and show emotional understanding when coping with anger",
    parentGuidance_tr: [
      "Öfkenin normal bir duygu olduğunu söyleyin",
      "Fiziksel aktivite ile enerji atmasına yardımcı olun",
      "Sakinleşme köşesi oluşturun",
      "Model olun - kendi öfkenizi yönetin"
    ],
    parentGuidance_en: [
      "Say that anger is a normal emotion",
      "Help release energy through physical activity",
      "Create a calm-down corner",
      "Be a model - manage your own anger"
    ],
    avoidTopics_tr: ["Öfkeyi bastırma", "cezalandırıcı tepkiler"],
    avoidTopics_en: ["Suppressing anger", "punitive reactions"]
  },
  depression: {
    recommendedTraits: ['empathy', 'curiosity', 'sharing'],
    therapeuticValue_tr: "Umut ve bağlantı hissini yeniden inşa etme",
    therapeuticValue_en: "Rebuilding sense of hope and connection",
    copingMechanism_tr: "Çocuğunuz üzgün hissettiğinde bağlantı kurmaya ve keşfetmeye yöneliyor",
    copingMechanism_en: "Your child tends to connect and explore when feeling sad",
    parentGuidance_tr: [
      "Küçük mutlulukları fark ettirin",
      "Rutinleri koruyun",
      "Fiziksel aktiviteyi teşvik edin",
      "Profesyonel destek düşünün"
    ],
    parentGuidance_en: [
      "Point out small happinesses",
      "Maintain routines",
      "Encourage physical activity",
      "Consider professional support"
    ],
    avoidTopics_tr: ["Neşelenmeye zorlama", "durumu küçümseme"],
    avoidTopics_en: ["Forcing cheerfulness", "belittling the situation"]
  },
  low_self_esteem: {
    recommendedTraits: ['independence', 'creativity', 'courage'],
    therapeuticValue_tr: "Kendi değerini keşfetme ve özgüven inşası",
    therapeuticValue_en: "Discovering self-worth and building confidence",
    copingMechanism_tr: "Çocuğunuz kendine güvensiz hissettiğinde bağımsız başarılar ve yaratıcı ifade arıyor",
    copingMechanism_en: "Your child seeks independent achievements and creative expression when feeling insecure",
    parentGuidance_tr: [
      "Çabayı sonuç kadar övün",
      "Güçlü yanlarını vurgulayın",
      "Karşılaştırma yapmayın",
      "Sorumluluk vererek güçlendirin"
    ],
    parentGuidance_en: [
      "Praise effort as much as results",
      "Emphasize their strengths",
      "Don't make comparisons",
      "Empower by giving responsibility"
    ],
    avoidTopics_tr: ["Olumsuz etiketler", "diğer çocuklarla karşılaştırma"],
    avoidTopics_en: ["Negative labels", "comparing with other children"]
  },
  disaster: {
    recommendedTraits: ['courage', 'sharing', 'patience'],
    therapeuticValue_tr: "Topluluk gücü ve yeniden yapılanma umudu",
    therapeuticValue_en: "Community strength and hope for rebuilding",
    copingMechanism_tr: "Çocuğunuz felaket durumlarında birlikte hareket etme ve sabırlı olma eğiliminde",
    copingMechanism_en: "Your child tends to act together and be patient in disaster situations",
    parentGuidance_tr: [
      "Güvenlik planı yapın",
      "Haberlere maruziyeti sınırlayın",
      "Yardım etme fırsatları sunun",
      "Rutinleri yeniden kurun"
    ],
    parentGuidance_en: [
      "Make a safety plan",
      "Limit exposure to news",
      "Offer opportunities to help",
      "Re-establish routines"
    ],
    avoidTopics_tr: ["Felaket detayları", "gelecek felaket senaryoları"],
    avoidTopics_en: ["Disaster details", "future disaster scenarios"]
  },
  abuse: {
    recommendedTraits: ['courage', 'independence', 'empathy'],
    therapeuticValue_tr: "Güvenlik, ses bulma ve güç kazanma",
    therapeuticValue_en: "Safety, finding voice and gaining power",
    copingMechanism_tr: "Çocuğunuz zor durumlarla karşılaştığında yardım aramaya ve kendi gücünü bulmaya yöneliyor",
    copingMechanism_en: "Your child tends to seek help and find their own strength when facing difficult situations",
    parentGuidance_tr: [
      "Koşulsuz destek sağlayın",
      "Profesyonel yardım alın",
      "Sınırları öğretin",
      "Her zaman dinleyin, asla suçlamayın"
    ],
    parentGuidance_en: [
      "Provide unconditional support",
      "Get professional help",
      "Teach boundaries",
      "Always listen, never blame"
    ],
    avoidTopics_tr: ["Detaylı sorgulama", "suçlayıcı dil"],
    avoidTopics_en: ["Detailed questioning", "blaming language"]
  },
  neglect: {
    recommendedTraits: ['independence', 'curiosity', 'sharing'],
    therapeuticValue_tr: "Kendi değerini keşfetme ve güvenli bağlar kurma",
    therapeuticValue_en: "Discovering self-worth and building secure attachments",
    copingMechanism_tr: "Çocuğunuz ilgi eksikliği hissettiğinde kendi kaynaklarını bulmaya ve bağlantı kurmaya yöneliyor",
    copingMechanism_en: "Your child tends to find their own resources and connect when feeling neglected",
    parentGuidance_tr: [
      "Tutarlı ilgi ve bakım sağlayın",
      "Kaliteli birlikte zaman geçirin",
      "Temel ihtiyaçların karşılandığından emin olun",
      "Duygusal bağı güçlendirin"
    ],
    parentGuidance_en: [
      "Provide consistent attention and care",
      "Spend quality time together",
      "Ensure basic needs are met",
      "Strengthen emotional bond"
    ],
    avoidTopics_tr: ["İhmal eden yetişkini savunma"],
    avoidTopics_en: ["Defending neglecting adult"]
  },
  domestic_violence_witness: {
    recommendedTraits: ['courage', 'empathy', 'patience'],
    therapeuticValue_tr: "Güvenlik hissi oluşturma ve duygusal işleme",
    therapeuticValue_en: "Building sense of safety and emotional processing",
    copingMechanism_tr: "Çocuğunuz zor aile durumlarıyla karşılaştığında güvenlik aramaya ve sabır göstermeye yöneliyor",
    copingMechanism_en: "Your child tends to seek safety and show patience when facing difficult family situations",
    parentGuidance_tr: [
      "Profesyonel destek alın",
      "Güvenli ortam sağlayın",
      "Çocuğun suçu olmadığını vurgulayın",
      "Duygularını ifade etmesine izin verin"
    ],
    parentGuidance_en: [
      "Get professional support",
      "Provide safe environment",
      "Emphasize it's not child's fault",
      "Allow expressing feelings"
    ],
    avoidTopics_tr: ["Şiddet detayları", "taraf tutturma"],
    avoidTopics_en: ["Violence details", "taking sides"]
  },
  parental_addiction: {
    recommendedTraits: ['independence', 'patience', 'empathy'],
    therapeuticValue_tr: "Çocuğun suçu olmadığını anlama ve kendi gücünü bulma",
    therapeuticValue_en: "Understanding it's not child's fault and finding own strength",
    copingMechanism_tr: "Çocuğunuz aile zorluklarıyla karşılaştığında bağımsız olmaya ve sabır göstermeye yöneliyor",
    copingMechanism_en: "Your child tends to be independent and show patience when facing family challenges",
    parentGuidance_tr: [
      "Yaşa uygun açıklamalar yapın",
      "Çocuğun suçu olmadığını vurgulayın",
      "Destek gruplarından yararlanın",
      "Rutinleri koruyun"
    ],
    parentGuidance_en: [
      "Give age-appropriate explanations",
      "Emphasize it's not child's fault",
      "Use support groups",
      "Maintain routines"
    ],
    avoidTopics_tr: ["Bağımlı ebeveyni kötüleme", "çocuğa sorumluluk yükleme"],
    avoidTopics_en: ["Badmouthing addicted parent", "putting responsibility on child"]
  },
  parental_mental_illness: {
    recommendedTraits: ['empathy', 'patience', 'independence'],
    therapeuticValue_tr: "Hastalığı anlamlandırma ve sevginin devam ettiğini bilme",
    therapeuticValue_en: "Making sense of illness and knowing love continues",
    copingMechanism_tr: "Çocuğunuz ebeveyn zorluklarıyla karşılaştığında anlayış ve sabır gösteriyor",
    copingMechanism_en: "Your child shows understanding and patience when facing parental challenges",
    parentGuidance_tr: [
      "Yaşa uygun açıklamalar yapın",
      "Sevginin devam ettiğini vurgulayın",
      "Tutarlı rutinler sağlayın",
      "Destek sistemi oluşturun"
    ],
    parentGuidance_en: [
      "Give age-appropriate explanations",
      "Emphasize love continues",
      "Provide consistent routines",
      "Build support system"
    ],
    avoidTopics_tr: ["Hastalığı çocuğa yük olarak sunma"],
    avoidTopics_en: ["Presenting illness as child's burden"]
  },
  medical_trauma: {
    recommendedTraits: ['courage', 'patience', 'problem_solving'],
    therapeuticValue_tr: "Tıbbi korkuları yönetme ve kontrol hissi kazanma",
    therapeuticValue_en: "Managing medical fears and gaining sense of control",
    copingMechanism_tr: "Çocuğunuz tıbbi durumlarla başa çıkarken cesaret ve mantıklı düşünme kullanıyor",
    copingMechanism_en: "Your child uses courage and logical thinking when coping with medical situations",
    parentGuidance_tr: [
      "Prosedürleri önceden açıklayın",
      "Oyunla hazırlık yapın",
      "Kontrol hissi verin (seçenekler sunun)",
      "Başarıları kutlayın"
    ],
    parentGuidance_en: [
      "Explain procedures beforehand",
      "Prepare through play",
      "Give sense of control (offer choices)",
      "Celebrate successes"
    ],
    avoidTopics_tr: ["Korkutucu tıbbi detaylar", "ağrı tehditleri"],
    avoidTopics_en: ["Scary medical details", "pain threats"]
  },
  school_stress: {
    recommendedTraits: ['problem_solving', 'patience', 'creativity'],
    therapeuticValue_tr: "Akademik baskıyı yönetme ve başarıyı yeniden tanımlama",
    therapeuticValue_en: "Managing academic pressure and redefining success",
    copingMechanism_tr: "Çocuğunuz okul stresiyle başa çıkarken çözüm odaklı ve yaratıcı yaklaşıyor",
    copingMechanism_en: "Your child approaches school stress with solution-focused and creative approach",
    parentGuidance_tr: [
      "Çabayı sonuç kadar değerlendirin",
      "Dinlenme zamanı sağlayın",
      "Gerçekçi beklentiler koyun",
      "Okul dışı başarıları da kutlayın"
    ],
    parentGuidance_en: [
      "Value effort as much as results",
      "Provide rest time",
      "Set realistic expectations",
      "Celebrate non-academic successes too"
    ],
    avoidTopics_tr: ["Aşırı akademik baskı", "başka çocuklarla karşılaştırma"],
    avoidTopics_en: ["Excessive academic pressure", "comparing with other children"]
  },
  social_rejection: {
    recommendedTraits: ['independence', 'creativity', 'sharing'],
    therapeuticValue_tr: "Kendi değerini bilme ve doğru arkadaşları bulma",
    therapeuticValue_en: "Knowing self-worth and finding right friends",
    copingMechanism_tr: "Çocuğunuz sosyal reddedilmeyle karşılaştığında kendi değerini biliyor ve yeni bağlantılar arıyor",
    copingMechanism_en: "Your child knows their worth and seeks new connections when facing social rejection",
    parentGuidance_tr: [
      "Değerli olduğunu vurgulayın",
      "Farklı sosyal ortamlar sunun",
      "Sosyal becerileri pratik edin",
      "Kaliteli arkadaşlığı tartışın"
    ],
    parentGuidance_en: [
      "Emphasize they are valuable",
      "Offer different social environments",
      "Practice social skills",
      "Discuss quality friendship"
    ],
    avoidTopics_tr: ["Popülerlik baskısı", "reddeden çocukları kötüleme"],
    avoidTopics_en: ["Popularity pressure", "badmouthing rejecting children"]
  },
  displacement: {
    recommendedTraits: ['curiosity', 'patience', 'sharing'],
    therapeuticValue_tr: "Yeni ortama uyum ve kökleri koruma",
    therapeuticValue_en: "Adapting to new environment and preserving roots",
    copingMechanism_tr: "Çocuğunuz yer değişikliğiyle başa çıkarken keşfetmeye ve bağlantı kurmaya yöneliyor",
    copingMechanism_en: "Your child tends to explore and connect when coping with displacement",
    parentGuidance_tr: [
      "Kültürel bağları koruyun",
      "Yeni ortamı keşfetmeyi destekleyin",
      "Tutarlı rutinler sağlayın",
      "Duygularını ifade etmesine izin verin"
    ],
    parentGuidance_en: [
      "Preserve cultural ties",
      "Support exploring new environment",
      "Provide consistent routines",
      "Allow expressing feelings"
    ],
    avoidTopics_tr: ["Eski yeri idealize etme", "yeni yeri kötüleme"],
    avoidTopics_en: ["Idealizing old place", "badmouthing new place"]
  },
  poverty: {
    recommendedTraits: ['creativity', 'sharing', 'patience'],
    therapeuticValue_tr: "Değerin maddi şeylerle ölçülmediğini anlama",
    therapeuticValue_en: "Understanding value is not measured by material things",
    copingMechanism_tr: "Çocuğunuz ekonomik zorluklarla başa çıkarken yaratıcılık ve paylaşım gösteriyor",
    copingMechanism_en: "Your child shows creativity and sharing when coping with economic difficulties",
    parentGuidance_tr: [
      "Sevgi ve zamanı vurgulayın",
      "Yaratıcı aktiviteler yapın",
      "Paylaşmanın değerini öğretin",
      "Umut ve hedefler konuşun"
    ],
    parentGuidance_en: [
      "Emphasize love and time",
      "Do creative activities",
      "Teach value of sharing",
      "Discuss hope and goals"
    ],
    avoidTopics_tr: ["Maddi eksiklikleri vurgulama", "çocuğa ekonomik yük bindirme"],
    avoidTopics_en: ["Emphasizing material lacks", "putting economic burden on child"]
  },
  cyberbullying: {
    recommendedTraits: ['courage', 'independence', 'problem_solving'],
    therapeuticValue_tr: "Dijital güvenlik ve öz değer",
    therapeuticValue_en: "Digital safety and self-worth",
    copingMechanism_tr: "Çocuğunuz online zorbalıkla karşılaştığında cesurca yardım arıyor ve çözüm buluyor",
    copingMechanism_en: "Your child bravely seeks help and finds solutions when facing online bullying",
    parentGuidance_tr: [
      "Dijital okuryazarlık öğretin",
      "Açık iletişim kurun",
      "Kanıtları saklayın",
      "Gerekirse yetkililere bildirin"
    ],
    parentGuidance_en: [
      "Teach digital literacy",
      "Establish open communication",
      "Save evidence",
      "Report to authorities if needed"
    ],
    avoidTopics_tr: ["İnterneti tamamen yasaklama", "suçlayıcı dil"],
    avoidTopics_en: ["Completely banning internet", "blaming language"]
  },
  other: {
    recommendedTraits: ['empathy', 'courage', 'patience'],
    therapeuticValue_tr: "Genel duygusal güçlenme ve başa çıkma becerileri",
    therapeuticValue_en: "General emotional strengthening and coping skills",
    copingMechanism_tr: "Çocuğunuz zorluklarla karşılaştığında duygusal anlayış ve sabır gösteriyor",
    copingMechanism_en: "Your child shows emotional understanding and patience when facing challenges",
    parentGuidance_tr: [
      "Dinleyin ve destekleyin",
      "Duygularını ifade etmesine izin verin",
      "Birlikte çözüm arayın",
      "Profesyonel destek düşünün"
    ],
    parentGuidance_en: [
      "Listen and support",
      "Allow expressing feelings",
      "Seek solutions together",
      "Consider professional support"
    ],
    avoidTopics_tr: ["Durumu küçümseme"],
    avoidTopics_en: ["Belittling the situation"]
  },
  none: {
    recommendedTraits: ['curiosity', 'creativity', 'sharing'],
    therapeuticValue_tr: "Pozitif gelişim ve keşif",
    therapeuticValue_en: "Positive development and exploration",
    copingMechanism_tr: "Çocuğunuz doğal merakı ve yaratıcılığıyla dünyayı keşfediyor",
    copingMechanism_en: "Your child explores the world with natural curiosity and creativity",
    parentGuidance_tr: [
      "Keşfi destekleyin",
      "Yaratıcılığı teşvik edin",
      "Birlikte kaliteli zaman geçirin"
    ],
    parentGuidance_en: [
      "Support exploration",
      "Encourage creativity",
      "Spend quality time together"
    ],
    avoidTopics_tr: [],
    avoidTopics_en: []
  }
};

// ============================================
// Terapötik Bağlam Tipi (Genişletilmiş)
// ============================================

export interface EnhancedTherapeuticContext {
  concernType: ConcernType;
  therapeuticApproach: string;
  recommendedTraits: PersonalityTrait[];
  copingMechanism: string;
  parentGuidance: string[];
  avoidTopics: string[];
}

// ============================================
// Hikaye Sayfası ve Segment Yapısı
// ============================================

export interface StoryPage {
  pageNumber: number;
  text: string;
  sceneDescription: string;
  visualPrompt: string;
  emotion: string;
  img_url?: string;
}

export interface StorySegment {
  id: string;
  pages: StoryPage[];
  endsWithChoice: boolean;
  choicePointId?: string; // Eğer seçimle bitiyorsa
}

// ============================================
// Seçim Noktaları
// ============================================

export interface ChoiceOption {
  id: string;
  text: string;
  emoji: string;
  icon_url?: string;
  trait: PersonalityTrait;
  nextSegmentId: string;
  // AI üretimi için
  storyDirection?: string;
}

export interface ChoicePoint {
  id: string;
  question: string;
  characterPrompt?: string; // Karakter soruyu nasıl soruyor
  options: ChoiceOption[];
  position: number; // 1-5 arası
}

// ============================================
// Ana Karakter
// ============================================

export interface InteractiveCharacter {
  name: string;
  type: string; // "tilki", "tavşan", etc.
  age: number;
  appearance: string;
  personality: string[];
  speechStyle: string;
  arc: {
    start: string;
    middle: string;
    end: string;
  };
}

// ============================================
// Interaktif Hikaye Ana Yapısı
// ============================================

export interface InteractiveStory {
  id: string;
  title: string;
  isInteractive: true;
  mainCharacter: InteractiveCharacter;

  // Graf yapısı
  segments: Record<string, StorySegment>;
  choicePoints: Record<string, ChoicePoint>;

  // Navigasyon
  startSegmentId: string;
  endingSegmentIds: string[];

  // Meta
  totalChoicePoints: number;
  estimatedDuration: string;
  themes: string[];
  educationalValue: string;
  mood: 'happy' | 'adventure' | 'calm' | 'magical' | 'therapeutic';

  // Terapötik bağlam (opsiyonel)
  therapeuticContext?: {
    concernType: string;
    therapeuticApproach: string;
  };

  // Genişletilmiş terapötik bağlam (ebeveyn raporu için)
  enhancedTherapeuticContext?: EnhancedTherapeuticContext;
}

// ============================================
// Oturum Yönetimi
// ============================================

export interface ChoiceMade {
  choicePointId: string;
  optionId: string;
  trait: PersonalityTrait;
  timestamp: string;
}

export interface InteractiveStorySession {
  id: string;
  userId: string;
  storybookId: string;
  currentSegmentId: string;
  choicesMade: ChoiceMade[];
  pathTaken: string[]; // Segment ID'leri sırasıyla
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
}

// ============================================
// Ebeveyn Raporu
// ============================================

export interface TraitCount {
  trait: PersonalityTrait;
  count: number;
  percentage: number;
}

export interface ChoiceTimelineItem {
  choiceNumber: number;
  question: string;
  chosenOption: string;
  trait: PersonalityTrait;
  insight: string;
}

export interface ActivitySuggestion {
  title: string;
  description: string;
  forTrait: PersonalityTrait;
  emoji: string;
}

export interface TherapeuticReportSection {
  concernType: ConcernType;
  concernName_tr: string;
  concernName_en: string;
  therapeuticApproach: string;
  copingMechanism: string;
  recommendedTraits: PersonalityTrait[];
  parentGuidance: string[];
  avoidTopics: string[];
  childStrengths: string[]; // Çocuğun gösterdiği güçlü yanlar
  encouragingMessage: string;
}

export interface ParentReport {
  id: string;
  sessionId: string;
  childName?: string;
  storyTitle: string;

  // Analiz sonuçları
  dominantTraits: TraitCount[];
  traitInsights: Record<PersonalityTrait, string>;
  choiceTimeline: ChoiceTimelineItem[];

  // Öneriler
  activitySuggestions: ActivitySuggestion[];
  conversationStarters: string[];

  // Terapötik bağlam (opsiyonel - sadece terapötik hikayeler için)
  therapeuticSection?: TherapeuticReportSection;

  // Meta
  generatedAt: string;
  totalChoices: number;
}

// ============================================
// API Input/Output Tipleri
// ============================================

export interface GenerateInteractiveStoryInput {
  imageBase64: string;
  childAge: number;
  childName?: string;
  language: 'tr' | 'en';
  selectedTheme?: string;
  therapeuticContext?: {
    concernType: string;
    therapeuticApproach: string;
  };
}

export interface GenerateInteractiveStoryOutput {
  story: InteractiveStory;
  session: InteractiveStorySession;
  firstSegment: StorySegment;
  firstChoicePoint?: ChoicePoint;
}

export interface MakeChoiceInput {
  sessionId: string;
  choicePointId: string;
  optionId: string;
}

export interface MakeChoiceOutput {
  nextSegment: StorySegment;
  nextChoicePoint?: ChoicePoint;
  isEnding: boolean;
  session: InteractiveStorySession;
}

export interface GenerateParentReportInput {
  sessionId: string;
  childName?: string;
}

// ============================================
// Üretim Tipleri (Backend için)
// ============================================

export interface InteractiveOutline {
  title: string;
  mainCharacter: InteractiveCharacter;
  storyArc: string;
  choicePoints: PlannedChoicePoint[];
  convergencePoints: string[];
  endingTheme: string;
  mood: 'happy' | 'adventure' | 'calm' | 'magical' | 'therapeutic';
}

export interface PlannedChoicePoint {
  position: number;
  question: string;
  options: {
    text: string;
    emoji: string;
    trait: PersonalityTrait;
    storyDirection: string;
  }[];
}

// Graf yapısı için yardımcı tip
export interface StoryGraphNode {
  segmentId: string;
  choicePointId?: string;
  nextNodes: string[]; // Segment ID'leri
  isEnding: boolean;
}

export interface StoryGraph {
  nodes: Record<string, StoryGraphNode>;
  startNodeId: string;
  endingNodeIds: string[];
}
