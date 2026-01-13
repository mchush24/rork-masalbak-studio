import { logger } from "./utils.js";
/**
 * Interaktif Hikaye Üretim Motoru
 *
 * Bu modül dallanmalı, çocuğun seçimleriyle yönlendirilen
 * interaktif masallar üretir.
 *
 * Üretim 3 aşamada gerçekleşir:
 * 1. Interaktif Taslak Planla (tüm seçim noktaları)
 * 2. Segment Üret (tembel - çocuk seçtikçe)
 * 3. Seçim Görselleri Üret
 */

import OpenAI from "openai";
import {
  InteractiveStory,
  InteractiveOutline,
  PlannedChoicePoint,
  StorySegment,
  StoryPage,
  ChoicePoint,
  ChoiceOption,
  InteractiveCharacter,
  PersonalityTrait,
  TRAIT_DEFINITIONS,
  THERAPEUTIC_TRAIT_MAPPING,
  ConcernType,
  TherapeuticTraitMapping,
  EnhancedTherapeuticContext,
  GenerateInteractiveStoryInput,
} from "../types/InteractiveStory.js";
import { AnalysisResponse } from "../trpc/routes/studio/analyze-drawing.js";

// ============================================
// Terapötik Bağlam Yardımcı Fonksiyonları
// ============================================

export function getTherapeuticMapping(concernType: string): TherapeuticTraitMapping | null {
  const validConcern = concernType as ConcernType;
  if (validConcern in THERAPEUTIC_TRAIT_MAPPING) {
    return THERAPEUTIC_TRAIT_MAPPING[validConcern];
  }
  return THERAPEUTIC_TRAIT_MAPPING['other'];
}

export function buildEnhancedTherapeuticContext(
  concernType: string,
  language: 'tr' | 'en'
): EnhancedTherapeuticContext | null {
  const mapping = getTherapeuticMapping(concernType);
  if (!mapping) return null;

  return {
    concernType: concernType as ConcernType,
    therapeuticApproach: language === 'tr'
      ? mapping.therapeuticValue_tr
      : mapping.therapeuticValue_en,
    recommendedTraits: mapping.recommendedTraits,
    copingMechanism: language === 'tr'
      ? mapping.copingMechanism_tr
      : mapping.copingMechanism_en,
    parentGuidance: language === 'tr'
      ? mapping.parentGuidance_tr
      : mapping.parentGuidance_en,
    avoidTopics: language === 'tr'
      ? mapping.avoidTopics_tr
      : mapping.avoidTopics_en
  };
}

function formatRecommendedTraitsPrompt(
  recommendedTraits: PersonalityTrait[],
  language: 'tr' | 'en'
): string {
  const traitDetails = recommendedTraits.map(trait => {
    const def = TRAIT_DEFINITIONS[trait];
    return language === 'tr'
      ? `- ${def.name_tr} (${trait}): ${def.positive_description_tr}`
      : `- ${def.name_en} (${trait}): ${def.positive_description_en}`;
  }).join('\n');

  return language === 'tr'
    ? `ÖNERİLEN TERAPÖTİK ÖZELLİKLER (seçimlerde öncelik ver):\n${traitDetails}`
    : `RECOMMENDED THERAPEUTIC TRAITS (prioritize in choices):\n${traitDetails}`;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================
// Yaş Grubuna Göre Parametreler
// ============================================

interface AgeParams {
  pagesPerSegment: number;
  sentencesPerPage: number;
  wordsPerPage: number;
  vocabulary: string;
  themes: string[];
  choiceComplexity: string;
}

function getAgeParams(age: number): AgeParams {
  if (age <= 3) {
    return {
      pagesPerSegment: 1,
      sentencesPerPage: 2,
      wordsPerPage: 30,
      vocabulary: "Günlük objeler, temel duygular (mutlu, üzgün), basit eylemler",
      themes: ["Sevgi", "Arkadaşlık", "Keşif", "Aile"],
      choiceComplexity: "Çok basit, görsel ağırlıklı seçimler (2 seçenek)"
    };
  } else if (age <= 6) {
    return {
      pagesPerSegment: 2,
      sentencesPerPage: 3,
      wordsPerPage: 50,
      vocabulary: "Hayvanlar, doğa, arkadaşlık, basit duygusal kavramlar",
      themes: ["Paylaşım", "Cesaret", "Merak", "Yardımlaşma"],
      choiceComplexity: "Basit seçimler, net sonuçlar (2-3 seçenek)"
    };
  } else if (age <= 9) {
    return {
      pagesPerSegment: 2,
      sentencesPerPage: 4,
      wordsPerPage: 70,
      vocabulary: "Macera, duygusal çeşitlilik, problem çözme kavramları",
      themes: ["Problem çözme", "Empati", "Dayanıklılık", "Arkadaşlık"],
      choiceComplexity: "Orta karmaşıklıkta seçimler, sonuçları düşündüren (2-3 seçenek)"
    };
  } else {
    return {
      pagesPerSegment: 3,
      sentencesPerPage: 5,
      wordsPerPage: 100,
      vocabulary: "Soyut kavramlar, ahlaki temalar, karakter gelişimi",
      themes: ["Sorumluluk", "Adalet", "Kimlik", "Büyüme"],
      choiceComplexity: "Karmaşık seçimler, ahlaki ikilemler içerebilir (3 seçenek)"
    };
  }
}

// ============================================
// Aşama 1: Interaktif Taslak Planla
// ============================================

export async function planInteractiveOutline(
  input: GenerateInteractiveStoryInput,
  drawingAnalysis?: AnalysisResponse
): Promise<InteractiveOutline> {
  logger.info("[Interactive Story] 📋 Planning interactive outline...");

  const ageParams = getAgeParams(input.childAge);
  const isTurkish = input.language === "tr";

  // Terapötik bağlam oluştur
  const enhancedTherapeutic = input.therapeuticContext
    ? buildEnhancedTherapeuticContext(input.therapeuticContext.concernType, input.language)
    : null;

  const therapeuticContext = enhancedTherapeutic
    ? isTurkish
      ? `
TERAPÖTİK BAĞLAM:
Çizimde "${enhancedTherapeutic.concernType}" içeriği tespit edildi.
Terapötik yaklaşım: ${enhancedTherapeutic.therapeuticApproach}

${formatRecommendedTraitsPrompt(enhancedTherapeutic.recommendedTraits, 'tr')}

KAÇINILMASI GEREKEN KONULAR:
${enhancedTherapeutic.avoidTopics.map(t => `- ${t}`).join('\n')}

ÖNEMLİ KURALLAR:
- Hikaye bu konuyu DOĞRUDAN ele almaz, METAFORLAR kullanır
- Karakter benzer zorlukları sembolik olarak yaşar ve aşar
- Her seçimde yukarıdaki ÖNERİLEN ÖZELLİKLERDEN en az biri olmalı
- Her yol UMUT ve GÜVENLİK ile biter
- Başa çıkma mekanizması: ${enhancedTherapeutic.copingMechanism}
`
      : `
THERAPEUTIC CONTEXT:
Drawing contains "${enhancedTherapeutic.concernType}" content.
Therapeutic approach: ${enhancedTherapeutic.therapeuticApproach}

${formatRecommendedTraitsPrompt(enhancedTherapeutic.recommendedTraits, 'en')}

TOPICS TO AVOID:
${enhancedTherapeutic.avoidTopics.map(t => `- ${t}`).join('\n')}

IMPORTANT RULES:
- Story does NOT address this topic DIRECTLY, uses METAPHORS
- Character experiences and overcomes similar challenges symbolically
- Each choice must include at least one of the RECOMMENDED TRAITS above
- All paths end with HOPE and SAFETY
- Coping mechanism: ${enhancedTherapeutic.copingMechanism}
`
    : "";

  const systemPrompt = isTurkish
    ? `Sen interaktif çocuk masalı tasarımcısısın. Dallanmalı hikaye yapısı oluşturuyorsun.

GÖREV: 4-5 seçim noktası içeren interaktif hikaye taslağı oluştur.

KURALLAR:
1. Her seçim noktasında 2-3 SEÇİM olacak
2. Seçimler ASLA "yanlış" olmayacak - hepsi pozitif sonuçlara götürür
3. Her seçim bir KİŞİLİK ÖZELLİĞİ ortaya çıkarır
4. Yollar YAKINSAYACAK - paralel yollar bir noktada birleşir
5. TÜM yollar aynı pozitif mesajla biter

KİŞİLİK ÖZELLİKLERİ (her seçim birine bağlı olmalı):
- empathy: Başkalarının duygularını anlama
- courage: Zor durumlarda ileri adım atma
- curiosity: Yeni şeyler öğrenme isteği
- creativity: Farklı çözümler düşünme
- problem_solving: Mantıklı düşünme
- sharing: Başkalarıyla bölüşme
- patience: Beklemeyi bilme
- independence: Kendi başına hareket etme

YAKINSAMALI YAPI ÖRNEĞİ:
Başlangıç → Segment1 → Seçim1 (2 seçenek)
  → Seg2A veya Seg2B → Seçim2
    → Segment3 (YAKINSAMA) → Seçim3
      → Seg4A/4B/4C → Seçim4
        → Bitiş (YAKINSAMA - aynı pozitif son)

Bu yapı ~12 segment üretir, 100+ değil.

${therapeuticContext}

ÇIKTI: Sadece JSON formatında yanıt ver.`
    : `You are an interactive children's story designer creating branching narratives.

TASK: Create an interactive story outline with 4-5 decision points.

RULES:
1. Each decision point has 2-3 CHOICES
2. Choices are NEVER "wrong" - all lead to positive outcomes
3. Each choice reveals a PERSONALITY TRAIT
4. Paths CONVERGE - parallel paths merge at certain points
5. ALL paths end with the same positive message

PERSONALITY TRAITS (each choice must map to one):
- empathy: Understanding others' feelings
- courage: Stepping forward in difficult situations
- curiosity: Desire to learn new things
- creativity: Thinking of different solutions
- problem_solving: Logical thinking
- sharing: Sharing with others
- patience: Knowing how to wait
- independence: Acting on one's own

${therapeuticContext}

OUTPUT: Respond only in JSON format.`;

  const userPrompt = isTurkish
    ? `Çocuk yaşı: ${input.childAge}
Çocuk adı: ${input.childName || "Kahraman"}
Seçilen tema: ${input.selectedTheme || "Macera"}
Kelime hazinesi: ${ageParams.vocabulary}
Temalar: ${ageParams.themes.join(", ")}
Seçim karmaşıklığı: ${ageParams.choiceComplexity}

${drawingAnalysis ? `Çizim analizi: ${drawingAnalysis.insights.map(i => i.summary).join(". ")}` : ""}

JSON ŞEMASI:
{
  "title": "Hikaye başlığı (3-5 kelime)",
  "mainCharacter": {
    "name": "Karakter adı",
    "type": "Hayvan türü (tilki, tavşan, ayı, vb.)",
    "age": "Çocuğun yaşına yakın",
    "appearance": "Detaylı fiziksel görünüm (renkler, özellikler)",
    "personality": ["özellik1", "özellik2", "özellik3"],
    "speechStyle": "Nasıl konuşuyor",
    "arc": {
      "start": "Başlangıçtaki durumu",
      "middle": "Yaşadığı değişim",
      "end": "Ulaştığı nokta"
    }
  },
  "storyArc": "Genel hikaye özeti (2-3 cümle)",
  "choicePoints": [
    {
      "position": 1,
      "question": "Karakter ne yapmalı? (çocuğa soru)",
      "options": [
        {
          "text": "Seçenek metni (kısa, 5-10 kelime)",
          "emoji": "🎯",
          "trait": "empathy|courage|curiosity|creativity|problem_solving|sharing|patience|independence",
          "storyDirection": "Bu seçim hikayeyi nereye götürür (1 cümle)"
        }
      ]
    }
  ],
  "convergencePoints": ["Yakınsama noktalarının açıklaması"],
  "endingTheme": "Pozitif bitiş mesajı",
  "mood": "happy|adventure|calm|magical|therapeutic"
}`
    : `Child age: ${input.childAge}
Child name: ${input.childName || "Hero"}
Selected theme: ${input.selectedTheme || "Adventure"}
Vocabulary: ${ageParams.vocabulary}
Themes: ${ageParams.themes.join(", ")}
Choice complexity: ${ageParams.choiceComplexity}

${drawingAnalysis ? `Drawing analysis: ${drawingAnalysis.insights.map(i => i.summary).join(". ")}` : ""}

JSON SCHEMA:
{
  "title": "Story title (3-5 words)",
  "mainCharacter": {
    "name": "Character name",
    "type": "Animal type (fox, rabbit, bear, etc.)",
    "age": "Close to child's age",
    "appearance": "Detailed physical appearance",
    "personality": ["trait1", "trait2", "trait3"],
    "speechStyle": "How they speak",
    "arc": {
      "start": "Starting state",
      "middle": "Change experienced",
      "end": "Final state"
    }
  },
  "storyArc": "Overall story summary (2-3 sentences)",
  "choicePoints": [
    {
      "position": 1,
      "question": "What should character do? (question for child)",
      "options": [
        {
          "text": "Option text (short, 5-10 words)",
          "emoji": "🎯",
          "trait": "empathy|courage|curiosity|creativity|problem_solving|sharing|patience|independence",
          "storyDirection": "Where this choice leads (1 sentence)"
        }
      ]
    }
  ],
  "convergencePoints": ["Description of convergence points"],
  "endingTheme": "Positive ending message",
  "mood": "happy|adventure|calm|magical|therapeutic"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || "";
    logger.info("[Interactive Story] 📝 Outline response received");

    // Parse JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse outline JSON");
    }

    const outline: InteractiveOutline = JSON.parse(jsonMatch[0]);

    // Validate
    if (!outline.choicePoints || outline.choicePoints.length < 4) {
      console.warn("[Interactive Story] ⚠️ Less than 4 choice points, adding more...");
      // Could add retry logic here
    }

    logger.info("[Interactive Story] ✅ Outline planned with", outline.choicePoints.length, "choice points");
    return outline;

  } catch (error) {
    logger.error("[Interactive Story] ❌ Outline generation failed:", error);
    throw error;
  }
}

// ============================================
// Aşama 2: Segment Üret (Tembel Üretim)
// ============================================

export async function generateSegment(
  outline: InteractiveOutline,
  segmentId: string,
  previousChoices: { question: string; chosen: string; trait: PersonalityTrait }[],
  segmentDescription: string,
  isEnding: boolean,
  language: 'tr' | 'en',
  childAge: number
): Promise<StorySegment> {
  logger.info("[Interactive Story] 📖 Generating segment:", segmentId);

  const ageParams = getAgeParams(childAge);
  const isTurkish = language === "tr";
  const character = outline.mainCharacter;

  // Önceki seçimlerin bağlamı
  const choiceContext = previousChoices.length > 0
    ? previousChoices.map((c, i) =>
        `${i + 1}. "${c.question}" → "${c.chosen}" (${c.trait})`
      ).join("\n")
    : "Henüz seçim yapılmadı";

  const systemPrompt = isTurkish
    ? `Sen çocuk masalı yazarısın. SOMUT sahneler yazarsın, özet değil.

KARAKTER:
İsim: ${character.name}
Tür: ${character.type}
Görünüm: ${character.appearance}
Kişilik: ${character.personality.join(", ")}
Konuşma tarzı: ${character.speechStyle}

KURALLAR:
1. Her sayfada ${ageParams.sentencesPerPage} cümle, ~${ageParams.wordsPerPage} kelime
2. GÖSTER, özetleme: "Eğlendiler" DEĞİL, "Luna kırmızı topu havaya attı ve güldü"
3. Duyusal detaylar ekle: renkler, sesler, hisler
4. Karakter tutarlılığını koru
5. ${isEnding ? "Bu bir BİTİŞ sahnesi - pozitif, umut dolu bitir" : "Sahne bir seçim noktasına hazırlık olsun"}

ÖNCEKİ SEÇİMLER:
${choiceContext}

ÇIKTI: Sadece JSON formatında yanıt ver.`
    : `You are a children's story writer. Write CONCRETE scenes, not summaries.

CHARACTER:
Name: ${character.name}
Type: ${character.type}
Appearance: ${character.appearance}
Personality: ${character.personality.join(", ")}
Speech style: ${character.speechStyle}

RULES:
1. Each page: ${ageParams.sentencesPerPage} sentences, ~${ageParams.wordsPerPage} words
2. SHOW, don't summarize: NOT "They had fun" but "Luna threw the red ball in the air and laughed"
3. Add sensory details: colors, sounds, feelings
4. Maintain character consistency
5. ${isEnding ? "This is an ENDING scene - end positively and hopefully" : "Scene should prepare for a choice point"}

PREVIOUS CHOICES:
${choiceContext}

OUTPUT: Respond only in JSON format.`;

  const userPrompt = isTurkish
    ? `Bu segment için sahne yaz:
Segment ID: ${segmentId}
Segment açıklaması: ${segmentDescription}
Sayfa sayısı: ${ageParams.pagesPerSegment}
${isEnding ? "BİTİŞ SAHNESİ: " + outline.endingTheme : ""}

JSON ŞEMASI:
{
  "pages": [
    {
      "pageNumber": 1,
      "text": "Sahne metni (${ageParams.wordsPerPage} kelime)",
      "sceneDescription": "Görsel için sahne açıklaması",
      "visualPrompt": "Flux 2.0 için detaylı görsel prompt (İngilizce)",
      "emotion": "Sayfanın duygusu"
    }
  ]
}`
    : `Write scene for this segment:
Segment ID: ${segmentId}
Segment description: ${segmentDescription}
Page count: ${ageParams.pagesPerSegment}
${isEnding ? "ENDING SCENE: " + outline.endingTheme : ""}

JSON SCHEMA:
{
  "pages": [
    {
      "pageNumber": 1,
      "text": "Scene text (~${ageParams.wordsPerPage} words)",
      "sceneDescription": "Scene description for visual",
      "visualPrompt": "Detailed visual prompt for Flux 2.0",
      "emotion": "Page emotion"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse segment JSON");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const segment: StorySegment = {
      id: segmentId,
      pages: parsed.pages,
      endsWithChoice: !isEnding,
    };

    logger.info("[Interactive Story] ✅ Segment generated with", segment.pages.length, "pages");
    return segment;

  } catch (error) {
    logger.error("[Interactive Story] ❌ Segment generation failed:", error);
    throw error;
  }
}

// ============================================
// Hikaye Grafı Oluştur
// ============================================

export function buildStoryGraph(outline: InteractiveOutline): {
  segments: Record<string, { description: string; isEnding: boolean; choicePointIndex?: number }>;
  choicePoints: Record<string, ChoicePoint>;
  startSegmentId: string;
  endingSegmentIds: string[];
} {
  const segments: Record<string, { description: string; isEnding: boolean; choicePointIndex?: number }> = {};
  const choicePoints: Record<string, ChoicePoint> = {};

  // Başlangıç segmenti
  const startId = "seg_start";
  segments[startId] = {
    description: `${outline.mainCharacter.name} hikayeye başlıyor: ${outline.storyArc}`,
    isEnding: false,
    choicePointIndex: 0
  };

  // Her seçim noktası için segment ve seçenekler oluştur
  outline.choicePoints.forEach((cp, index) => {
    const choiceId = `choice_${index + 1}`;

    // Seçim noktası
    const choicePoint: ChoicePoint = {
      id: choiceId,
      question: cp.question,
      position: cp.position,
      options: cp.options.map((opt, optIndex) => {
        const nextSegId = index < outline.choicePoints.length - 1
          ? `seg_${index + 1}_${optIndex}`
          : `seg_ending_${optIndex}`;

        return {
          id: `opt_${index + 1}_${optIndex}`,
          text: opt.text,
          emoji: opt.emoji,
          trait: opt.trait as PersonalityTrait,
          nextSegmentId: nextSegId,
          storyDirection: opt.storyDirection
        };
      })
    };

    choicePoints[choiceId] = choicePoint;

    // Her seçenek için sonraki segment
    cp.options.forEach((opt, optIndex) => {
      const segId = index < outline.choicePoints.length - 1
        ? `seg_${index + 1}_${optIndex}`
        : `seg_ending_${optIndex}`;

      segments[segId] = {
        description: opt.storyDirection,
        isEnding: index === outline.choicePoints.length - 1,
        choicePointIndex: index < outline.choicePoints.length - 1 ? index + 1 : undefined
      };
    });
  });

  // Bitiş segmentlerini belirle
  const endingSegmentIds = Object.keys(segments).filter(id => segments[id].isEnding);

  return {
    segments,
    choicePoints,
    startSegmentId: startId,
    endingSegmentIds
  };
}

// ============================================
// Ana Üretim Fonksiyonu
// ============================================

export async function generateInteractiveStory(
  input: GenerateInteractiveStoryInput,
  drawingAnalysis?: AnalysisResponse
): Promise<{
  story: InteractiveStory;
  firstSegment: StorySegment;
  firstChoicePoint: ChoicePoint;
}> {
  logger.info("[Interactive Story] 🚀 Starting interactive story generation");
  logger.info("[Interactive Story] Child age:", input.childAge);
  logger.info("[Interactive Story] Language:", input.language);

  // Aşama 1: Taslak planla
  const outline = await planInteractiveOutline(input, drawingAnalysis);

  // Graf yapısını oluştur
  const graph = buildStoryGraph(outline);

  // İlk segmenti üret
  const firstSegment = await generateSegment(
    outline,
    graph.startSegmentId,
    [],
    graph.segments[graph.startSegmentId].description,
    false,
    input.language,
    input.childAge
  );

  // İlk seçim noktası
  const firstChoicePoint = graph.choicePoints["choice_1"];

  // Enhanced therapeutic context for parent report
  const enhancedTherapeutic = input.therapeuticContext
    ? buildEnhancedTherapeuticContext(input.therapeuticContext.concernType, input.language)
    : null;

  // Interaktif hikaye nesnesini oluştur
  const story: InteractiveStory = {
    id: `interactive_${Date.now()}`,
    title: outline.title,
    isInteractive: true,
    mainCharacter: outline.mainCharacter,
    segments: {
      [graph.startSegmentId]: firstSegment
    },
    choicePoints: graph.choicePoints,
    startSegmentId: graph.startSegmentId,
    endingSegmentIds: graph.endingSegmentIds,
    totalChoicePoints: outline.choicePoints.length,
    estimatedDuration: `${outline.choicePoints.length * 3}-${outline.choicePoints.length * 5} dakika`,
    themes: outline.choicePoints.map(cp => cp.options.map(o => o.trait)).flat(),
    educationalValue: outline.storyArc,
    mood: outline.mood,
    therapeuticContext: input.therapeuticContext,
    // Store enhanced therapeutic info for parent report
    enhancedTherapeuticContext: enhancedTherapeutic || undefined
  };

  logger.info("[Interactive Story] ✅ Interactive story created");
  logger.info("[Interactive Story] Total choice points:", story.totalChoicePoints);
  logger.info("[Interactive Story] First segment pages:", firstSegment.pages.length);

  return {
    story,
    firstSegment,
    firstChoicePoint
  };
}

// ============================================
// Sonraki Segment Üret (Seçim yapıldığında)
// ============================================

export async function generateNextSegment(
  story: InteractiveStory,
  choicePointId: string,
  optionId: string,
  previousChoices: { question: string; chosen: string; trait: PersonalityTrait }[],
  language: 'tr' | 'en',
  childAge: number
): Promise<{
  segment: StorySegment;
  nextChoicePoint?: ChoicePoint;
  isEnding: boolean;
}> {
  logger.info("[Interactive Story] 🔄 Generating next segment after choice");

  const choicePoint = story.choicePoints[choicePointId];
  if (!choicePoint) {
    throw new Error(`Choice point not found: ${choicePointId}`);
  }

  const selectedOption = choicePoint.options.find(o => o.id === optionId);
  if (!selectedOption) {
    throw new Error(`Option not found: ${optionId}`);
  }

  const nextSegmentId = selectedOption.nextSegmentId;
  const isEnding = story.endingSegmentIds.includes(nextSegmentId);

  // Outline'ı yeniden oluştur (story'den)
  const outline: InteractiveOutline = {
    title: story.title,
    mainCharacter: story.mainCharacter,
    storyArc: story.educationalValue,
    choicePoints: [], // Sadece karakter bilgisi için kullanılacak
    convergencePoints: [],
    endingTheme: "Pozitif ve umut dolu bir son",
    mood: story.mood
  };

  // Segment'i üret
  const segment = await generateSegment(
    outline,
    nextSegmentId,
    previousChoices,
    selectedOption.storyDirection || "Hikaye devam ediyor",
    isEnding,
    language,
    childAge
  );

  // Sonraki seçim noktasını bul
  const currentChoiceIndex = parseInt(choicePointId.split("_")[1]);
  const nextChoiceId = `choice_${currentChoiceIndex + 1}`;
  const nextChoicePoint = !isEnding ? story.choicePoints[nextChoiceId] : undefined;

  return {
    segment,
    nextChoicePoint,
    isEnding
  };
}

// ============================================
// Yardımcı Fonksiyonlar
// ============================================

export function getTraitInfo(trait: PersonalityTrait, language: 'tr' | 'en') {
  const def = TRAIT_DEFINITIONS[trait];
  return {
    name: language === 'tr' ? def.name_tr : def.name_en,
    emoji: def.emoji,
    color: def.color,
    description: language === 'tr' ? def.positive_description_tr : def.positive_description_en,
    activitySuggestion: language === 'tr' ? def.activity_suggestion_tr : def.activity_suggestion_en
  };
}
