/**
 * Multi-Stage AI Story Generation from Drawing Analysis
 *
 * NEW APPROACH: Break story generation into 4 specialized stages for higher quality
 * 1. Story Outline (character, theme, beats)
 * 2. Scene Expansion (detailed scenes from beats)
 * 3. Dialogue Enhancement (natural conversations)
 * 4. Visual Prompt Generation (consistent, detailed prompts)
 *
 * Based on research of best AI storybook generators:
 * - Childbook.ai, MyStoryBot, StoryBee, Bedtimestory.ai
 * - Prompt engineering best practices
 * - Multi-stage generation for quality control
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
  childName?: string; // NEW: Personalization
}

export interface CharacterArc {
  start: string; // "doesn't know how to share"
  middle: string; // "learns from friends"
  end: string; // "becomes generous"
}

export interface Character {
  name: string;
  type: string; // "tavşan", "ayı", etc.
  age: number;
  appearance: string; // Detailed physical description
  personality: string[]; // ["curious", "shy", "kind"]
  speechStyle: string; // How they talk
  arc: CharacterArc; // Character growth
}

export interface StoryOutline {
  theme: string;
  educationalValue: string;
  mood: 'happy' | 'adventure' | 'calm' | 'magical' | 'therapeutic';
  mainCharacter: Character;
  storyBeats: string[]; // 5-7 key story moments
}

export interface DetailedScene {
  pageNumber: number;
  text: string; // Rich, vivid scene text
  emotion: string; // "excited", "worried", "happy"
  visualElements: string[]; // ["forest", "rabbit", "toy car"]
  dialogue?: string[]; // Character conversations
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  sceneDescription: string;
  visualPrompt: string; // Detailed Flux 2.0 prompt
  emotion: string;
}

export interface GeneratedStory {
  title: string;
  pages: StoryPage[];
  mainCharacter: Character;
  educationalTheme: string;
  mood: 'happy' | 'adventure' | 'calm' | 'magical' | 'therapeutic';
}

/**
 * Get age-appropriate story parameters
 */
function getAgeParameters(age: number) {
  if (age <= 3) {
    return {
      pageCount: 4,
      sentencesPerPage: 3,
      wordsPerPage: 40,
      complexity: "çok basit kelimeler, tekrarlı yapılar, ritim",
      vocabulary: "günlük nesneler, temel duygular (mutlu, üzgün)",
      themes: ["sevgi", "dostluk", "keşfetme"]
    };
  } else if (age <= 6) {
    return {
      pageCount: 5,
      sentencesPerPage: 4,
      wordsPerPage: 60,
      complexity: "basit kelimeler, kısa cümleler, bazı sıfatlar",
      vocabulary: "hayvanlar, doğa, arkadaşlık, temel duygular",
      themes: ["paylaşma", "yardımlaşma", "cesaret", "merak"]
    };
  } else if (age <= 9) {
    return {
      pageCount: 6,
      sentencesPerPage: 5,
      wordsPerPage: 90,
      complexity: "zengin kelimeler, diyaloglar, detaylı betimlemeler",
      vocabulary: "macera, duygu çeşitliliği, sosyal durumlar",
      themes: ["problem çözme", "empati", "sabır", "dayanıklılık"]
    };
  } else {
    return {
      pageCount: 7,
      sentencesPerPage: 6,
      wordsPerPage: 120,
      complexity: "karmaşık cümleler, zengin anlatım, metaforlar",
      vocabulary: "soyut kavramlar, ahlaki dersler, karakter gelişimi",
      themes: ["sorumlulık", "adalet", "kimlik", "büyüme"]
    };
  }
}

/**
 * Determine story mood based on analysis
 */
function determineStoryMood(analysis: AnalysisResponse): 'happy' | 'adventure' | 'calm' | 'magical' | 'therapeutic' {
  if (analysis.traumaAssessment?.hasTraumaticContent || analysis.riskFlags.length > 0) {
    return 'therapeutic';
  }

  const insightText = analysis.insights.map(i => i.summary).join(' ').toLowerCase();

  if (insightText.includes('neşe') || insightText.includes('mutlu')) return 'happy';
  if (insightText.includes('merak') || insightText.includes('macera')) return 'adventure';
  if (insightText.includes('huzur') || insightText.includes('sakin')) return 'calm';

  return 'magical';
}

/**
 * STAGE 1: Create Story Outline
 *
 * Specialized prompt for character and story structure creation
 */
async function createStoryOutline(
  input: StoryGenerationInput,
  ageParams: ReturnType<typeof getAgeParameters>,
  mood: string
): Promise<StoryOutline> {
  console.log("[Stage 1] 🎯 Creating story outline...");

  const systemPrompt = `Sen profesyonel çocuk kitabı karakteri tasarımcısısın.

UZMANLIĞIN: Unutulmaz, sevimli, yaşa uygun karakterler ve hikaye yapıları yaratmak.

İYİ KARAKTER ÖRNEĞİ:
{
  "name": "Luna",
  "type": "beyaz tavşan",
  "age": 4,
  "appearance": "Kar beyazı yumuşak tüyler, pembe kurdele kulakları arasında, mavi büyük gözler, kırmızı küçük sırt çantası",
  "personality": ["meraklı", "utangaç", "nazik", "yardımsever"],
  "speechStyle": "Yumuşak sesle konuşur, çok düşünür, 'belki' ve 'sanırım' kelimelerini sık kullanır",
  "arc": {
    "start": "Paylaşmayı bilmiyor, oyuncaklarını kendine sakl\u0131yor",
    "middle": "Arkadaşlarının üzgün olduğunu görüp empati yapıyor, bilge baykuştan ders öğreniyor",
    "end": "Paylaşmanın mutluluk getirdiğini öğreniyor, cömert oluyor"
  }
}

KÖTÜ ÖRNEK (YAPMA!):
{
  "name": "Tavşan",
  "type": "hayvan",
  "personality": ["iyi"],
  "arc": { "start": "kötü", "end": "iyi" }
}

HİKAYE BEAT'LERİ (${ageParams.pageCount} sayfa, ${ageParams.pageCount} SOMUT OLAY):

❌ KÖTÜ BEAT'LER (GENERİC - YAPMA!):
1. "Macera başladı"
2. "Arkadaş buldu"
3. "Keşfe çıktılar"
4. "Eğlendiler"
5. "Eve döndüler"

SORUN: Bunlar ÖZET! Ne olduğu belli değil!

✅ İYİ BEAT'LER (SOMUT OLAYLAR):
1. "${input.childAge} yaşındaki ${input.childName || 'karakter'} bahçede kelebek kovalıyor, altın bir taş buluyor"
2. "Taş parlayınca, konuşan bir sincap beliyor ve yardım istiyor"
3. "Birlikte ormana gidiyorlar, kayıp sincap ailesini arıyorlar"
4. "Karanlık ağaçlar arasında korku duyuyorlar ama birbirlerine cesaret veriyorlar"
5. "Sincap ailesini buluyorlar, taş ödül olarak ${input.childName || 'karaktere'} kalıyor"

FARK: Her beat'te BİR SOMUT OLAY var (taş bulma, sincap beliyor, ormana gidiş, korku anı, bulma)

BEAT KURALLARI:
- Her beat BİR SPESİFİK OLAY olmalı
- Kim, ne, nerede, ne oldu - hepsi BELLİ
- "Arkadaş buldu" ❌ → "Konuşan sincap beliyor" ✅
- "Eğlendiler" ❌ → "Ağaçtan ağaca zıplayarak oyun oynuyorlar" ✅

KURALLAR:
1. Karakter ${input.childAge} yaşında olmalı (çocuk kendini görsün)
2. Fiziksel görünümü DETAYLI betimle (renk, aksesuar, kıyafet)
3. Kişilik ÇOK BOYUTLU olmalı (sadece "iyi" değil!)
4. Konuşma tarzı benzersiz olmalı
5. Arc AÇIK ve GÖZLE GÖRÜLEBİLİR olmalı (başlangıç → değişim → sonuç)
6. Her beat bir SAHNE olmalı (spesifik, görselleştirilebilir)

Sadece JSON döndür.`;

  const insightsSummary = input.drawingAnalysis.insights.map(i => `${i.title}: ${i.summary}`).join('\n');

  const userPrompt = `Çocuk Yaşı: ${input.childAge}
${input.childName ? `Çocuğun Adı: ${input.childName}` : ''}
Çizim Analizi Bulguları:
${insightsSummary}

Tema Önerileri: ${input.themes?.join(', ') || ageParams.themes.join(', ')}
Hedef Sayfa: ${ageParams.pageCount}
Ruh Hali: ${mood}

GÖREV: ${ageParams.pageCount} sayfalık bir hikaye için karakter ve yapı oluştur.

JSON format:
{
  "theme": "Ana tema (örn: paylaşmak, cesaret, dostluk)",
  "educationalValue": "Çocuğun öğreneceği değer (1 cümle)",
  "mood": "${mood}",
  "mainCharacter": {
    "name": "Karakter ismi",
    "type": "Hayvan türü",
    "age": ${input.childAge},
    "appearance": "Detaylı fiziksel görünüm (renk, aksesuar, kıyafet)",
    "personality": ["özellik1", "özellik2", "özellik3"],
    "speechStyle": "Nasıl konuşur (ton, kelime seçimi)",
    "arc": {
      "start": "Başlangıçta nasıl (sorun/eksiklik)",
      "middle": "Nasıl değişmeye başlıyor",
      "end": "Son hali (büyüme/öğrenme)"
    }
  },
  "storyBeats": [
    "Beat 1 (SOMUT): ${input.childName || 'Karakter'} [nerede], [ne yapıyor], [ne buluyor/görüyor]",
    "Beat 2 (SOMUT): [Spesifik olay], [kim beliyor], [ne oluyor]",
    "Beat 3 (SOMUT): [Nereye gidiyorlar], [ne arıyorlar], [ne ile karşılaşıyorlar]",
    ...${ageParams.pageCount} beat - HER BİRİ BİR SOMUT OLAY!
  ]
}

❌ YAPMA BEAT ÖRNEKLERİ:
- "Macera başladı" (ne macerası?)
- "Arkadaş buldu" (kim, nasıl?)
- "Eğlendiler" (ne yaptılar?)

✅ SOMUT BEAT ÖRNEKLERİ:
- "Bahçede kelebek kovalıyor, parlayan altın taş buluyor"
- "Taş parladı, konuşan sincap çıktı, ailesini kaybettiğini söyledi"
- "Birlikte ormana koştular, dev meşe ağacını bulmaya çalıştılar"

💡 ÖRNEK: "Ninja Kunduz" hikayesi için İYİ BEAT'LER:
1. "Ninja Kunduz dojo'da antrenman yapıyor, gizemli bir harita buluyor"
2. "Haritada gizli hazine gösteriliyor, ama çok tehlikeli bir ormandan geçmek gerekiyor"
3. "Ormana girince koca bir ayıyla karşılaşıyor, ayı yolu kapatmış bekliyor"
4. "Ninja hareketleriyle ayıyı geçip, hazine sandığının yanına varıyor"
5. "Sandığı açınca içinde altın yok ama arkadaşlık madalyası var, bunu köye getiriyor"

HER BEAT'TE SPESİFİK BİR OLAY VAR! (antrenman+harita bulma, ormana giriş, ayıyla karşılaşma, ninja hareket+sandığa varma, madalya bulma+köye dönüş)`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.9, // Creative
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
  });

  const responseText = completion.choices[0]?.message?.content || "{}";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const outline = JSON.parse(jsonMatch ? jsonMatch[0] : responseText) as StoryOutline;

  console.log("[Stage 1] ✅ Outline created:", outline.mainCharacter.name, "-", outline.theme);
  return outline;
}

/**
 * STAGE 2: Expand Beats into Detailed Scenes
 *
 * Specialized prompt for vivid, emotional scene writing
 */
async function expandScene(
  beat: string,
  pageNumber: number,
  character: Character,
  ageParams: ReturnType<typeof getAgeParameters>,
  mood: string,
  language: 'tr' | 'en'
): Promise<DetailedScene> {
  console.log(`[Stage 2] 📝 Expanding scene ${pageNumber}...`);

  const systemPrompt = `Sen çocuk kitabı sahne yazarısın. ÖZET YAZMA, SAHNE ANLAT!

KRİTİK: Her sayfa bir GERÇEK SAHNE olmalı, özet/placeholder değil!

❌ KÖTÜ ÖRNEK (ÖZET - ASLA YAPMA!):
"Kahramanımız yeni arkadaşlar buldu."
"Birlikte eğlenceli bir keşfe çıktılar."
"Harika anılar biriktirdiler."

SORUN: Ne olduğu anlaşılmıyor! Kim, ne, nerede, nasıl yok!

✅ İYİ ÖRNEK (GERÇEK SAHNE - ${ageParams.wordsPerPage} kelime):
"${character.name} büyük çınarın altında durdu. Gözleri parlayan bir şey gördü - kırmızı, parıl parıl bir araba!
'Vay canına!' diye bağırdı. Dizlerinin üstüne çöktü, arabayı dikkatle aldı eline.
Tekerlekleri çevirdi, 'Vııın vııın!' diye sesler çıkardı. Gözleri mutluluktan parıldadı.
Tam o sırada, arkasından bir ses duydu: 'Merhaba!' ${character.name} döndü ve küçük bir sincap gördü."

FARK:
- ❌ "Arkadaş buldu" → ✅ "Arkasından ses duydu, döndü, sincap gördü"
- ❌ "Mutlu oldu" → ✅ "Gözleri mutluluktan parıldadı"
- ❌ "Oynadı" → ✅ "Tekerlekleri çevirdi, sesler çıkardı"

SAHNE UNSURLARI (HEPSİ OLMALI):

1. **AÇILIŞ** (nerede, ne görüyor):
   "Büyük çınarın altında durdu. Gözleri parlayan bir şey gördü..."

2. **EYLEM** (ne yapıyor):
   "Dizlerinin üstüne çöktü, arabayı aldı, tekerlekleri çevirdi..."

3. **DUYU DETAYLARI** (görsel, işitsel):
   "Kırmızı, parıl parıl" (görsel)
   "Vııın vııın!" (işitsel)

4. **DUYGU** (içsel tepki):
   "Gözleri mutluluktan parıldadı"

5. **DİYALOG/SES** (karakterler konuşsun):
   "'Vay canına!' diye bağırdı"
   "'Merhaba!' dedi sincap"

6. **BİR ŞEY OLUR** (statik değil, dinamik):
   "Tam o sırada, arkasından ses duydu..."

ZORUNLU KURALLAR:
- ${ageParams.sentencesPerPage} cümle
- ${ageParams.wordsPerPage} kelime (±15 kelime OK)
- ASLA özet/placeholder yazma ("arkadaş buldu", "eğlendiler", "döndüler")
- Her cümlede BİR ŞEY OLSUN (görsel, eylem, ses, duygu)
- Kim, ne, nerede, nasıl - hepsi BELLİ olmalı!

Karakter:
- ${character.name} (${character.type})
- Görünüm: ${character.appearance}
- Kişilik: ${character.personality.join(', ')}
- Konuşma: ${character.speechStyle}`;

  const userPrompt = `SAHNE: "${beat}"
Karakter: ${character.name} (${character.type}, ${character.age} yaş)
Sayfa: ${pageNumber}
Hedef: ${ageParams.sentencesPerPage} cümle, ${ageParams.wordsPerPage} kelime

GÖREV: Bu beat'i GERÇEK SAHNEYE dönüştür!

ZORUNLU UNSURLAR:
1. AÇILIŞ: ${character.name} nerede, ne görüyor/yapıyor?
2. EYLEM: Somut eylemler (tuttu, baktı, koştu, vs.)
3. GÖRSEL: Renkler, şekiller, nesneler
4. SES: Diyalog veya ses efekti ("Vııın!", "Merhaba!")
5. DUYGU: ${character.name}'ın hissi (içsel tepki)
6. SONUÇ: Sahnenin sonunda bir şey değişti/oldu

❌ YAPMA:
"${character.name} yeni arkadaşlar buldu."
"Birlikte eğlendiler."
"Harika zaman geçirdi."

✅ YAP:
"${character.name} büyük meşe ağacının altında durdu. Yukarı baktı - dal arasında minik bir kuş!
'Merhaba küçük arkadaşım!' dedi ${character.name} yumuşak bir sesle.
Kuş şakıdı, ${character.name} gülümsedi. İlk arkadaşını bulmuştu!"

💡 ÖRNEK: "Ninja Kunduz dojo'da antrenman yapıyor, gizemli bir harita buluyor" BEAT'İ → SAHNE:
"Ninja Kunduz bambular arasındaki dojoda tekmeler savuruyordu. Hop! Zıp! Çak!
'Bir gün en iyi ninja olacağım!' diye bağırdı sevinçle.
Tam o sırada, ayağı bir şeye takıldı. Eğilip baktı - eski, sararmış bir harita!
Haritayı açtı, gözleri ışıldadı. Üzerinde büyük bir X işareti vardı.
'Vay be, bir hazine haritası!' dedi heyecanla. Macera başlıyordu."

FARK: Özet değil, AN BE AN sahne! (nerede, ne yapıyor, nasıl, ne buluyor, ne hissediyor - HEPSİ VAR!)

JSON format:
{
  "text": "GERÇEK SAHNE metni (${ageParams.wordsPerPage} kelime, kim/ne/nerede/nasıl BELLİ)",
  "emotion": "excited / worried / happy / curious / sad / proud",
  "visualElements": ["meşe ağacı", "minik kuş", "dal", vb.]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.8,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
  });

  const responseText = completion.choices[0]?.message?.content || "{}";
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const scene = JSON.parse(jsonMatch ? jsonMatch[0] : responseText) as Omit<DetailedScene, 'pageNumber'>;

  console.log(`[Stage 2] ✅ Scene ${pageNumber} expanded (${scene.text.split(' ').length} words)`);

  return {
    pageNumber,
    ...scene
  };
}

/**
 * STAGE 3: Enhance with Natural Dialogue
 *
 * Add conversations if appropriate for the scene
 */
async function enhanceWithDialogue(
  scene: DetailedScene,
  character: Character,
  ageParams: ReturnType<typeof getAgeParameters>
): Promise<DetailedScene> {
  // Only add dialogue for age 4+
  if (character.age < 4) {
    return scene;
  }

  console.log(`[Stage 3] 💬 Enhancing scene ${scene.pageNumber} with dialogue...`);

  const systemPrompt = `Sen diyalog yazarısısın.

UZMANLIĞIN: Çocuk kitaplarında DOĞAL, KARAKTERİSTİK konuşmalar yazmak.

İYİ DİYALOG:
"${character.name}, oyuncak arabayı Ayı'ya uzattı.
'Belki... belki seninle paylaşabilirim?' dedi yumuşak bir sesle.
Ayı'nın gözleri sevinçle parladı. 'Gerçekten mi? Çok teşekkür ederim!' diye bağırdı.
${character.name} gülümsedi. 'Ama dikkatli ol, tamam mı?'"

KÖTÜ DİYALOG (YAPMA!):
"'Merhaba' dedi.
'Teşekkürler' dedi ayı.
'Tamam' dedi."

KURALLAR:
1. Kısa, basit cümleler (${character.age} yaşına uygun)
2. Her karakter farklı konuşsun
3. Duygular hissedilsin ("yumuşak bir sesle", "heyecanla")
4. Karakter özelliklerini yansıt
5. Max 3-4 diyalog satırı ekle (sahnenin %30'u)

Karakter konuşma tarzı: ${character.speechStyle}`;

  const userPrompt = `Sahne: ${scene.text}
Karakter: ${character.name}
Duygu: ${scene.emotion}

GÖREV: Eğer uygunsa sahneye DOĞAL diyalog ekle. Uygun değilse olduğu gibi bırak.

JSON format:
{
  "text": "Diyalog eklenmiş veya orijinal sahne metni",
  "dialogue": ["diyalog1", "diyalog2"] // veya boş array
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const enhanced = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

    console.log(`[Stage 3] ✅ Scene ${scene.pageNumber} enhanced with dialogue`);

    return {
      ...scene,
      text: enhanced.text,
      dialogue: enhanced.dialogue
    };
  } catch (error) {
    console.log(`[Stage 3] ⚠️ Dialogue enhancement failed, keeping original`);
    return scene;
  }
}

/**
 * STAGE 4: Generate Visual Prompts
 *
 * Create detailed, consistent Flux 2.0 prompts
 */
function generateVisualPrompt(
  scene: DetailedScene,
  character: Character,
  pageNumber: number,
  totalPages: number
): string {
  // Character consistency tags (same for all pages)
  const characterTags = `${character.type}, ${character.appearance}`;

  // Scene-specific elements
  const sceneElements = scene.visualElements.join(', ');

  // Emotion-based atmosphere
  const atmosphereMap: Record<string, string> = {
    excited: "energetic, bright colors, dynamic composition",
    worried: "soft muted tones, gentle shadows, concerned expression",
    happy: "warm bright colors, cheerful atmosphere, smiling",
    curious: "wonder-filled, exploring, attentive eyes",
    sad: "gentle pastels, comforting atmosphere, empathetic",
    proud: "confident posture, warm glowing light, accomplished"
  };
  const atmosphere = atmosphereMap[scene.emotion] || "warm, friendly atmosphere";

  // Page position (intro, middle, ending)
  let composition = "";
  if (pageNumber === 1) {
    composition = "character introduction, establishing shot";
  } else if (pageNumber === totalPages) {
    composition = "happy ending, satisfied resolution, hopeful";
  } else {
    composition = "story progression, narrative flow";
  }

  const visualPrompt = `Children's storybook watercolor illustration, soft pastel colors, gentle brush strokes.

CHARACTER (consistent across all pages): ${characterTags}

SCENE: ${sceneElements}, ${atmosphere}

COMPOSITION: ${composition}, simple rounded shapes, child-friendly art style

MOOD: ${scene.emotion}, warm and inviting, age-appropriate for ${character.age} year old

STYLE: Soft watercolor painting, storybook illustration, no text or letters, plain background, focus on character and main scene elements

Technical: Professional children's book illustration, trending on Behance, award-winning children's book art`;

  return visualPrompt;
}

/**
 * Main Multi-Stage Story Generation Function
 */
export async function generateStoryFromAnalysisV2(
  input: StoryGenerationInput
): Promise<GeneratedStory> {
  console.log("=".repeat(60));
  console.log("[Story Gen V2] 🚀 MULTI-STAGE GENERATION STARTING");
  console.log("[Story Gen V2] 👶 Child age:", input.childAge);
  console.log("[Story Gen V2] 🌍 Language:", input.language);
  console.log("=".repeat(60));

  const ageParams = getAgeParameters(input.childAge);
  const mood = determineStoryMood(input.drawingAnalysis);

  // STAGE 1: Create Story Outline
  const outline = await createStoryOutline(input, ageParams, mood);
  console.log("\n" + "=".repeat(60));

  // STAGE 2: Expand beats into detailed scenes
  const scenes: DetailedScene[] = [];
  for (let i = 0; i < outline.storyBeats.length; i++) {
    const scene = await expandScene(
      outline.storyBeats[i],
      i + 1,
      outline.mainCharacter,
      ageParams,
      mood,
      input.language
    );
    scenes.push(scene);
  }
  console.log("\n" + "=".repeat(60));

  // STAGE 3: Enhance with dialogue
  const enhancedScenes: DetailedScene[] = [];
  for (const scene of scenes) {
    const enhanced = await enhanceWithDialogue(scene, outline.mainCharacter, ageParams);
    enhancedScenes.push(enhanced);
  }
  console.log("\n" + "=".repeat(60));

  // STAGE 4: Generate visual prompts
  console.log("[Stage 4] 🎨 Generating visual prompts...");
  const pages: StoryPage[] = enhancedScenes.map(scene => ({
    pageNumber: scene.pageNumber,
    text: scene.text,
    sceneDescription: `${outline.mainCharacter.name} - ${scene.visualElements.join(', ')} - ${scene.emotion}`,
    visualPrompt: generateVisualPrompt(scene, outline.mainCharacter, scene.pageNumber, scenes.length),
    emotion: scene.emotion,
  }));
  console.log("[Stage 4] ✅ All visual prompts generated");

  // Generate title
  const title = input.language === 'tr'
    ? `${outline.mainCharacter.name} ve ${outline.theme}`
    : `${outline.mainCharacter.name} and ${outline.theme}`;

  console.log("\n" + "=".repeat(60));
  console.log("[Story Gen V2] ✅ GENERATION COMPLETE!");
  console.log("[Story Gen V2] 📖 Title:", title);
  console.log("[Story Gen V2] 👤 Character:", outline.mainCharacter.name);
  console.log("[Story Gen V2] 📄 Pages:", pages.length);
  console.log("[Story Gen V2] 🎯 Theme:", outline.theme);
  console.log("=".repeat(60));

  return {
    title,
    pages,
    mainCharacter: outline.mainCharacter,
    educationalTheme: outline.educationalValue,
    mood: outline.mood,
  };
}
