/**
 * AI Story Generation from Drawing Analysis
 *
 * Generates rich, educational, age-appropriate stories from child drawing analysis.
 * Uses GPT-4 to create engaging narratives with characters, dialogue, emotions, and lessons.
 */

import OpenAI from "openai";
import type { AnalysisResponse } from "../trpc/routes/studio/analyze-drawing.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface StoryGenerationInput {
  drawingAnalysis: AnalysisResponse;
  childAge: number;
  language: 'tr' | 'en';
  drawingTitle?: string;
  drawingDescription?: string;
  themes?: string[];
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  sceneDescription: string;
  visualPrompt?: string;
}

export interface GeneratedStory {
  title: string;
  pages: StoryPage[];
  mainCharacter: {
    name: string;
    type: string; // "tavşan", "ayı", "tilki", etc.
    appearance: string;
    personality: string;
  };
  educationalTheme: string;
  mood: 'happy' | 'adventure' | 'calm' | 'magical' | 'therapeutic';
}

/**
 * Get age-appropriate story parameters
 */
function getAgeParameters(age: number) {
  if (age <= 3) {
    return {
      pageCount: 3,
      sentencesPerPage: "2-3",
      wordsPerPage: "30-50",
      complexity: "çok basit kelimeler, tekrarlı yapılar",
      vocabulary: "günlük nesneler, temel duygular, basit eylemler",
      themes: "sevgi, dostluk, keşfetme, tanıma"
    };
  } else if (age <= 6) {
    return {
      pageCount: 5,
      sentencesPerPage: "3-4",
      wordsPerPage: "50-80",
      complexity: "basit kelimeler, açık cümleler, bazı sıfatlar",
      vocabulary: "hayvanlar, doğa, arkadaşlık, duygular",
      themes: "paylaşma, yardımlaşma, cesaret, merak"
    };
  } else if (age <= 9) {
    return {
      pageCount: 6,
      sentencesPerPage: "4-5",
      wordsPerPage: "80-120",
      complexity: "zengin kelimeler, diyaloglar, detaylı betimlemeler",
      vocabulary: "macera, duygu çeşitliliği, sosyal durumlar",
      themes: "problem çözme, empati, sabır, dayanıklılık"
    };
  } else {
    return {
      pageCount: 7,
      sentencesPerPage: "5-6",
      wordsPerPage: "120-150",
      complexity: "karmaşık cümleler, zengin anlatım, metaforlar",
      vocabulary: "soyut kavramlar, ahlaki dersler, karakter gelişimi",
      themes: "sorumluluk, adalet, kimlik, büyüme"
    };
  }
}

/**
 * Extract key insights from analysis for story generation
 */
function extractStoryInsights(analysis: AnalysisResponse) {
  const insights = analysis.insights.map(i => i.title + ": " + i.summary).join("\n");
  const risks = analysis.riskFlags.map(r => r.type + ": " + r.summary).join("\n");
  const trauma = analysis.traumaAssessment
    ? `Travma İçeriği: ${analysis.traumaAssessment.hasTraumaticContent ? 'Evet' : 'Hayır'}, Duygusal Yoğunluk: ${analysis.traumaAssessment.emotionalIntensity}`
    : "Travma İçeriği: Yok";

  return {
    insights,
    risks,
    trauma,
    hasTrauma: analysis.traumaAssessment?.hasTraumaticContent || false,
    hasSensitiveContent: analysis.riskFlags.length > 0,
  };
}

/**
 * Determine story mood based on analysis
 */
function determineStoryMood(analysis: AnalysisResponse): 'happy' | 'adventure' | 'calm' | 'magical' | 'therapeutic' {
  const storyInsights = extractStoryInsights(analysis);

  if (storyInsights.hasTrauma || storyInsights.hasSensitiveContent) {
    return 'therapeutic';
  }

  // Check insights for mood indicators
  const insightText = storyInsights.insights.toLowerCase();

  if (insightText.includes('neşe') || insightText.includes('mutlu') || insightText.includes('eğlence')) {
    return 'happy';
  }
  if (insightText.includes('merak') || insightText.includes('keşif') || insightText.includes('macera')) {
    return 'adventure';
  }
  if (insightText.includes('huzur') || insightText.includes('sakin') || insightText.includes('dingin')) {
    return 'calm';
  }

  return 'magical'; // Default
}

/**
 * Generate story using GPT-4
 */
export async function generateStoryFromAnalysis(
  input: StoryGenerationInput
): Promise<GeneratedStory> {
  console.log("[Story Generation] 🎯 Starting story generation");
  console.log("[Story Generation] 👶 Child age:", input.childAge);
  console.log("[Story Generation] 🌍 Language:", input.language);

  const ageParams = getAgeParameters(input.childAge);
  const storyInsights = extractStoryInsights(input.drawingAnalysis);
  const mood = determineStoryMood(input.drawingAnalysis);

  console.log("[Story Generation] 📊 Story mood:", mood);
  console.log("[Story Generation] 📄 Page count:", ageParams.pageCount);

  // Build system prompt
  const systemPrompt = input.language === 'tr'
    ? `Sen çocuk kitabı yazarı ve pedagog bir yapay zeka asistanısın. Görevin: Çocuk çizim analizinden ilham alarak yaşa uygun, eğitici, ve duygusal açıdan zengin masallar yazmak.

İLKELER:
- Çocuğun yaşına göre uygun kelime ve cümle yapısı kullan
- Her sayfada DETAYLI ve CANLI sahneler yaz (sadece "macera başladı" değil!)
- Karakterlere İSİM ver ve KİŞİLİK kat
- DİYALOGLAR ekle (karakterler konuşsun!)
- DUYGULARI betimle (mutlu, heyecanlı, meraklı, vs.)
- Çocuğun çizim analizindeki bulgularla BAĞLANTI kur
- EĞİTİCİ mesaj ver ama doğal şekilde (didaktik olma)
- Her sayfa BİR SAHNE olsun (başlangıç-orta-son yapısı)

HİKAYE YAPISI:
- Sayfa 1-2: GİRİŞ (karakter tanıtımı, ortam, günlük yaşam)
- Sayfa 3-${ageParams.pageCount - 2}: GELİŞME (problem/macera, arkadaşlıklar, keşifler)
- Sayfa ${ageParams.pageCount - 1}-${ageParams.pageCount}: SONUÇ (çözüm, mutlu son, öğrenilen ders)

KARAKTER TASARIMI:
- Hayvan karakterler kullan (çocuklar için ilgi çekici)
- Ana karaktere çocuğun yaşına yakın bir yaş ver
- Fiziksel özellikleri DETAYLI betimle (renk, giysi, aksesuar)
- Kişilik özellikleri ekle (meraklı, cesur, nazik, vs.)

METİN KALİTESİ:
- Her sayfa ${ageParams.sentencesPerPage} cümle olmalı
- Toplam ${ageParams.wordsPerPage} kelime/sayfa
- ${ageParams.complexity}
- Kelime dağarcığı: ${ageParams.vocabulary}

DUYGUSAL ZEKA:
- Karakterlerin duygularını göster
- Empati, paylaşma, yardımlaşma gibi değerleri vurgula
- Çatışmaları yapıcı şekilde çöz

${mood === 'therapeutic' ? `
TERAPÖTIK YAKLAŞIM:
Bu hikaye terapötik amaçlı olmalı. Çocuğun çiziminde zorlayıcı içerik tespit edildi.
- Hikayede metaforlar kullan (savaş→fırtına, vs.)
- Zorluklarla başa çıkmayı göster
- Umut, güven, güvenlik mesajları ver
- Olumsuz duyguları kabul et ama sonunda iyileşme göster
` : ''}

ÖNEMLİ: JSON formatında cevap ver, başka açıklama ekleme.`
    : `You are a children's book writer and pedagogue AI. Your task: Write age-appropriate, educational, and emotionally rich stories inspired by child drawing analysis.

PRINCIPLES:
- Use age-appropriate vocabulary and sentence structure
- Write DETAILED and VIVID scenes on each page (not just "adventure began"!)
- Give characters NAMES and PERSONALITY
- Add DIALOGUE (characters should talk!)
- Describe EMOTIONS (happy, excited, curious, etc.)
- Connect with findings from the drawing analysis
- Include EDUCATIONAL messages naturally (don't be didactic)
- Each page should be ONE SCENE (beginning-middle-end structure)

STORY STRUCTURE:
- Page 1-2: INTRODUCTION (character intro, setting, daily life)
- Page 3-${ageParams.pageCount - 2}: DEVELOPMENT (problem/adventure, friendships, discoveries)
- Page ${ageParams.pageCount - 1}-${ageParams.pageCount}: CONCLUSION (resolution, happy ending, lesson learned)

CHARACTER DESIGN:
- Use animal characters (engaging for children)
- Give main character an age close to the child's age
- Describe physical features in DETAIL (color, clothing, accessories)
- Add personality traits (curious, brave, kind, etc.)

TEXT QUALITY:
- Each page should have ${ageParams.sentencesPerPage} sentences
- Total ${ageParams.wordsPerPage} words/page
- ${ageParams.complexity}
- Vocabulary: ${ageParams.vocabulary}

EMOTIONAL INTELLIGENCE:
- Show characters' emotions
- Emphasize values like empathy, sharing, helping
- Resolve conflicts constructively

${mood === 'therapeutic' ? `
THERAPEUTIC APPROACH:
This story should be therapeutic. Challenging content was detected in the child's drawing.
- Use metaphors in the story (war→storm, etc.)
- Show coping with difficulties
- Give messages of hope, trust, safety
- Acknowledge negative emotions but show healing in the end
` : ''}

IMPORTANT: Respond in JSON format only, no other explanation.`;

  // Build user prompt
  const userPrompt = input.language === 'tr'
    ? `Çocuk Yaşı: ${input.childAge}
Çizim Başlığı: ${input.drawingTitle || 'Çocuğun Çizimi'}
Çizim Açıklaması: ${input.drawingDescription || 'Bir çocuk çizimi'}
Temalar: ${input.themes?.join(', ') || 'genel'}

ÇİZİM ANALİZİ BULGULARI:
${storyInsights.insights}

${storyInsights.risks ? `RİSK TESTİTLERİ:\n${storyInsights.risks}` : ''}

${storyInsights.trauma}

GÖREV:
Bu çizim analizine dayanarak ${ageParams.pageCount} sayfalık bir masal oluştur.

Hikaye şu JSON formatında olmalı:
{
  "title": "Masalın çekici başlığı (3-5 kelime)",
  "mainCharacter": {
    "name": "Karakterin ismi",
    "type": "hayvan türü (tavşan, ayı, tilki, vs.)",
    "appearance": "Detaylı fiziksel görünüm (renk, kıyafet, özellikler)",
    "personality": "Kişilik özellikleri (meraklı, cesur, nazik, vs.)"
  },
  "educationalTheme": "Hikayeden öğrenilen ana ders",
  "mood": "${mood}",
  "pages": [
    {
      "pageNumber": 1,
      "text": "Sayfa 1'in DETAYLI metni - ${ageParams.sentencesPerPage} cümle, karakteri tanıt, ortamı betimle, günlük yaşamdan bir sahne",
      "sceneDescription": "Bu sayfadaki sahnenin kısa özeti (görsel için kullanılacak)"
    },
    {
      "pageNumber": 2,
      "text": "Sayfa 2'nin metni - problem/macera başlasın, diyalog ekle",
      "sceneDescription": "Sahne özeti"
    },
    ...${ageParams.pageCount} sayfaya kadar
  ]
}

ÖNEMLİ KURALLAR:
1. Her sayfa METNİ ${ageParams.wordsPerPage} kelime olmalı
2. Karakterler KONUŞMALI (diyalog ekle)
3. DUYGU betimle ("mutluydu", "heyecanlandı", "merak etti")
4. DETAY ver (renkler, sesler, kokular, hisler)
5. Çizim bulgularını hikayeye YANSİT
6. Ana karakterin İSMİNİ hikaye boyunca KULLAN
7. Eğitici mesajı DOĞAL ver (vaaz verme!)
8. Her sayfa bir SAHNE olmalı, sonraki sayfaya akış olsun

Sadece JSON döndür, başka açıklama ekleme.`
    : `Child Age: ${input.childAge}
Drawing Title: ${input.drawingTitle || 'Child Drawing'}
Drawing Description: ${input.drawingDescription || 'A child drawing'}
Themes: ${input.themes?.join(', ') || 'general'}

DRAWING ANALYSIS FINDINGS:
${storyInsights.insights}

${storyInsights.risks ? `RISK FLAGS:\n${storyInsights.risks}` : ''}

${storyInsights.trauma}

TASK:
Based on this drawing analysis, create a ${ageParams.pageCount}-page story.

The story should be in this JSON format:
{
  "title": "Engaging story title (3-5 words)",
  "mainCharacter": {
    "name": "Character's name",
    "type": "animal type (rabbit, bear, fox, etc.)",
    "appearance": "Detailed physical appearance (color, clothing, features)",
    "personality": "Personality traits (curious, brave, kind, etc.)"
  },
  "educationalTheme": "Main lesson learned from the story",
  "mood": "${mood}",
  "pages": [
    {
      "pageNumber": 1,
      "text": "DETAILED text for page 1 - ${ageParams.sentencesPerPage} sentences, introduce character, describe setting, daily life scene",
      "sceneDescription": "Brief summary of the scene on this page (for visuals)"
    },
    {
      "pageNumber": 2,
      "text": "Text for page 2 - problem/adventure begins, add dialogue",
      "sceneDescription": "Scene summary"
    },
    ...up to ${ageParams.pageCount} pages
  ]
}

IMPORTANT RULES:
1. Each page TEXT should be ${ageParams.wordsPerPage} words
2. Characters should TALK (add dialogue)
3. Describe EMOTIONS ("was happy", "got excited", "wondered")
4. Give DETAILS (colors, sounds, smells, feelings)
5. REFLECT drawing findings in the story
6. USE the main character's NAME throughout
7. Give educational message NATURALLY (don't preach!)
8. Each page should be a SCENE, flow to next page

Return only JSON, no other explanation.`;

  console.log("[Story Generation] 🤖 Calling GPT-4...");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.8, // More creative
      max_tokens: 4000,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const responseText = completion.choices[0]?.message?.content || "";
    console.log("[Story Generation] 📝 Response received, length:", responseText.length);

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText;
    const story = JSON.parse(jsonString) as GeneratedStory;

    console.log("[Story Generation] ✅ Story generated successfully!");
    console.log("[Story Generation] 📖 Title:", story.title);
    console.log("[Story Generation] 👤 Main character:", story.mainCharacter.name);
    console.log("[Story Generation] 📄 Pages:", story.pages.length);

    return story;
  } catch (error) {
    console.error("[Story Generation] ❌ Error:", error);
    throw new Error(
      `Story generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
