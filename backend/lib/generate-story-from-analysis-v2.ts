import { logger } from "./utils.js";
/**
 * Multi-Stage AI Story Generation from Drawing Analysis
 * V2 - Prompt Guru Edition
 *
 * NEW APPROACH: Break story generation into 4 specialized stages for higher quality
 * 1. Story Outline (character, theme, beats)
 * 2. Scene Expansion (detailed scenes from beats)
 * 3. Dialogue Enhancement (natural conversations)
 * 4. Visual Prompt Generation (consistent, detailed prompts)
 *
 * Prompt Guru Principles Applied:
 * - Token prioritization (first 20 tokens critical)
 * - Positive language only (no negatives)
 * - Concrete examples over abstract instructions
 * - Weight syntax for emphasis (keyword:1.3)
 *
 * Based on research of best AI storybook generators:
 * - Childbook.ai, MyStoryBot, StoryBee, Bedtimestory.ai
 * - Prompt engineering best practices
 * - Multi-stage generation for quality control
 */

import OpenAI from "openai";
import type { AnalysisResponse } from "../trpc/routes/studio/analyze-drawing.js";
import {
  buildFluxStoryPromptV2,
  getStoryStyleForAge,
  generateCharacterDNA,
  getPageSeed,
  type CharacterV2,
  type SceneV2,
  type StoryStyleV2,
  type CharacterDNA
} from "./story-prompt-builder-v2.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Therapeutic context for trauma-informed storytelling
// Based on ACEs (Adverse Childhood Experiences) framework and pediatric psychology
export interface TherapeuticContext {
  concernType:
    // Original categories
    | 'war' | 'violence' | 'fear' | 'loss' | 'loneliness' | 'disaster' | 'abuse' | 'family_separation' | 'death'
    // ACEs Framework categories
    | 'neglect' | 'bullying' | 'domestic_violence_witness' | 'parental_addiction' | 'parental_mental_illness'
    // Pediatric psychology categories
    | 'medical_trauma' | 'anxiety' | 'depression' | 'low_self_esteem' | 'anger' | 'school_stress' | 'social_rejection'
    // Additional categories
    | 'displacement' | 'poverty' | 'cyberbullying'
    | 'other';
  therapeuticApproach: string;
}

export interface StoryGenerationInput {
  drawingAnalysis: AnalysisResponse;
  childAge: number;
  language: 'tr' | 'en';
  drawingTitle?: string;
  drawingDescription?: string;
  themes?: string[];
  childGender?: 'male' | 'female'; // For character gender matching
  therapeuticContext?: TherapeuticContext; // For trauma-informed storytelling
  // V2: Visual description from drawing analysis - CRITICAL for character/story connection
  visualDescription?: string; // What the AI actually sees in the drawing (e.g., "A white cat with blue eyes playing with a ball")
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
  // V2: Character DNA for consistent image generation
  characterDNA?: CharacterDNA;
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

// Therapeutic story guidance based on bibliotherapy research
const THERAPEUTIC_STORY_GUIDANCE: Record<string, { principles: string; arcGuidance: string; avoidance: string }> = {
  war: {
    principles: "Barış ve güvenlik temalı metaforlar kullan. Karakterler koruyucu güçler bulsun. Savaş sahnesi ASLA gösterme, bunun yerine barışa giden yolculuk anlat.",
    arcGuidance: "Karakter: korku/kaos → güvenli bir yer bulma → barışı getiren kahraman olma. Karakterin içsel gücü keşfetmesi önemli.",
    avoidance: "ASLA: Silah, şiddet, yaralanma, ölüm sahnesi. BUNUN YERİNE: Kalkan, koruyucu büyü, güvenli sığınak."
  },
  violence: {
    principles: "Güç ve kontrol dışsallaştır. Kötülük yenilebilir bir karakter olsun (örn: 'Korku Canavarı' küçülüp kaçar). Karakter güçlü ve korunaklı hissetsin.",
    arcGuidance: "Karakter: savunmasız → gücünü keşfetme → kendini ve sevdiklerini koruyabilme. İçsel güç ve cesaret vurgusu.",
    avoidance: "ASLA: Fiziksel şiddet, kavga, yaralanma. BUNUN YERİNE: Sihirli kalkan, ışık gücü, sevgi büyüsü."
  },
  disaster: {
    principles: "Yeniden inşa ve topluluk desteği vurgula. Doğa olayları geçici, birlik kalıcı. Yardım eden eller her zaman var.",
    arcGuidance: "Karakter: kayıp/yıkım → yardım bulma → birlikte yeniden kurma. Dayanıklılık ve umut teması.",
    avoidance: "ASLA: Yıkım detayları, ölüm, panik. BUNUN YERİNE: Yardım melekleri, yeniden yeşeren bahçe, birlikte inşa."
  },
  loss: {
    principles: "Anı ve bağlantı odaklı. Kaybedilen sevilen kalplerde yaşar. Üzüntü normal bir duygu, ama umut var.",
    arcGuidance: "Karakter: derin üzüntü → anıları keşfetme → sevginin devam ettiğini anlama. Bağlantı hiç kopmaz mesajı.",
    avoidance: "ASLA: Ölüm detayları, cenaze, karanlık temalar. BUNUN YERİNE: Yıldız olan sevgili, kelebek dönüşümü, anı bahçesi."
  },
  loneliness: {
    principles: "Bağlantı ve aidiyet duygusu. Beklenmedik yerlerden gelen dostluklar. Yalnızlık geçici, sevgi kalıcı.",
    arcGuidance: "Karakter: izole/yalnız → beklenmedik bir arkadaş → ait olduğunu hissetme. Herkes sevilmeyi hak eder mesajı.",
    avoidance: "ASLA: Reddedilme, dışlanma, kötü davranış. BUNUN YERİNE: Sürpriz arkadaşlık, sıcak kabul, aile genişlemesi."
  },
  fear: {
    principles: "Korkunun dışsallaştırılması. Korku küçük, yönetilebilir bir karakter olarak gösterilir. Cesaret içimizde var.",
    arcGuidance: "Karakter: korkuyla karşılaşma → korkunun küçüldüğünü görme → cesaretini bulma. Korku yenilebilir mesajı.",
    avoidance: "ASLA: Gerçek tehditler, canavarların kazanması. BUNUN YERİNE: Küçülen korku canavarı, ışıkla kaçan karanlık."
  },
  abuse: {
    principles: "Güvenlik, sesini duyurma, güç kazanma. Çocuk kahramandır. Yardım istemek güçtür. Güvenli yetişkinler var.",
    arcGuidance: "Karakter: sessiz/gizli → sesini bulma → güvenli insanlara ulaşma. Sen değerlisin ve korunmayı hak ediyorsun mesajı.",
    avoidance: "ASLA: İstismar detayları, suçlama, utanç. BUNUN YERİNE: Koruyucu melek, güvenli kale, sesini bulan kuş."
  },
  family_separation: {
    principles: "Sevgi mesafelere rağmen devam eder. Yeni düzenler oluşturulabilir. Her iki yuvada da seviliyorsun.",
    arcGuidance: "Karakter: kafa karışıklığı → sevginin değişmediğini anlama → yeni normal kabulü. Sevgi her yerde seninle mesajı.",
    avoidance: "ASLA: Ebeveyn çatışması, suçlama, tercih yapma. BUNUN YERİNE: İki yuvada bir kalp, sevgi köprüsü."
  },
  death: {
    principles: "Kaybı anlamlandırma ve yaşamı kutlama. Ölüm bir dönüşüm. Sevdiklerimiz anılarımızda ve kalbimizde yaşar.",
    arcGuidance: "Karakter: kayıp acısı → anıları keşfetme → sevginin sonsuza dek yaşadığını kabul. Dönüşüm ve süreklilik teması.",
    avoidance: "ASLA: Ölüm detayları, mezar, karanlık temalar. BUNUN YERİNE: Kelebek dönüşümü, yıldız olma, anı bahçesi."
  },

  // === ACEs FRAMEWORK CATEGORIES ===
  neglect: {
    principles: "İlgi ve bakım odaklı. Karakter sevilmeyi ve ilgiyi hak eder. Güvenli, sevgi dolu yetişkinler var. Temel ihtiyaçların karşılanması hak.",
    arcGuidance: "Karakter: yalnız ve bakımsız → sevgi dolu figür bulma → değerli olduğunu anlama. 'Sen önemlisin' mesajı.",
    avoidance: "ASLA: İhmal detayları, açlık, bakımsızlık. BUNUN YERİNE: Sıcak yuva, ilgi gören yıldız, değerli hazine."
  },
  bullying: {
    principles: "Güçlenme ve destek odaklı. Zorbalık yapanın sorunu kendinde. Karakter değerli ve sevilesi. Yardım istemek cesaret.",
    arcGuidance: "Karakter: dışlanmış/üzgün → iç gücünü keşfetme → gerçek dostlar bulma. 'Farklılıklar güzeldir' mesajı.",
    avoidance: "ASLA: Zorbalık sahneleri, alay, dışlama detayları. BUNUN YERİNE: Cesur kalp, gerçek dostlar, iç güzellik."
  },
  domestic_violence_witness: {
    principles: "Güvenlik ve koruma odaklı. Çocuğun suçu yok. Güvenli yerler ve insanlar var. Şiddet asla kabul edilemez.",
    arcGuidance: "Karakter: korkmuş/saklanmış → güvenli yer bulma → huzura kavuşma. Güvenlik her çocuğun hakkı mesajı.",
    avoidance: "ASLA: Şiddet sahneleri, kavga, bağırış. BUNUN YERİNE: Güvenli sığınak, huzur adası, koruyucu melek."
  },
  parental_addiction: {
    principles: "Çocuğun suçu olmadığı vurgulanır. Hastalık kavramı (kişi değil). Güvenli yetişkinler var. Umut ve iyileşme mümkün.",
    arcGuidance: "Karakter: endişeli/korkulu → yardımcı figürler bulma → umudu görme. 'Bu senin suçun değil' mesajı.",
    avoidance: "ASLA: Bağımlılık detayları, sarhoşluk, madde. BUNUN YERİNE: Işığı bulan aile, yardım melekleri, güneşli yarınlar."
  },
  parental_mental_illness: {
    principles: "Anne/babanın hastalığı çocuğun suçu değil. Hastalık geçici olabilir. Sevgi devam eder. Çocuk güçlü ve değerli.",
    arcGuidance: "Karakter: endişeli/yalnız → durumu anlama → güçlü kalma. 'Sevgi her zaman var' mesajı.",
    avoidance: "ASLA: Hastalık detayları, yatan ebeveyn. BUNUN YERİNE: Bulutların üstündeki güneş, güçlü minik kalp, sabırlı çiçek."
  },

  // === PEDIATRIC PSYCHOLOGY CATEGORIES ===
  medical_trauma: {
    principles: "Hastane/tedavi korkusunu normalleştir. Doktorlar yardımcıdır. Vücut iyileşir. Cesaret küçük adımlarla.",
    arcGuidance: "Karakter: korkmuş/endişeli → yardımcıları tanıma → cesaretini bulma. 'Doktorlar dostundur' mesajı.",
    avoidance: "ASLA: Acı veren işlemler, iğne detayları, hastalık. BUNUN YERİNE: Cesur küçük savaşçı, iyileşen kahraman, beyaz önlüklü dostlar."
  },
  anxiety: {
    principles: "Endişe dışsallaştırılır (Endişe Canavarı). Küçük adımlarla başa çıkma. Nefes ve sakinleşme. Kontrol edilebilir.",
    arcGuidance: "Karakter: endişeli/gergin → endişeyi tanıma → sakinleşmeyi öğrenme. 'Endişe küçültülebilir' mesajı.",
    avoidance: "ASLA: Panik, kontrolsüzlük, tehdit. BUNUN YERİNE: Küçülen endişe, sakin göl, cesaret adımları, huzur bahçesi."
  },
  depression: {
    principles: "Üzüntü geçerli bir duygu. Karanlık dönemler geçer. Küçük mutluluklar önemli. Yardım istemek güç. Umut hep var.",
    arcGuidance: "Karakter: üzgün/gri → küçük ışıklar bulma → renklerin dönmesi. 'Güneş yeniden doğar' mesajı.",
    avoidance: "ASLA: Umutsuzluk, sürekli karanlık. BUNUN YERİNE: Güneşi arayan çiçek, yavaş yavaş parlayan yıldız, umut tohumu."
  },
  low_self_esteem: {
    principles: "Her çocuk özel ve değerli. Farklılıklar güzeldir. İç güzellik dış güzellikten önemli. Kendini sevmek öğrenilebilir.",
    arcGuidance: "Karakter: kendini küçük görme → iç güzelliğini keşfetme → değerli olduğunu anlama. 'Sen eşsizsin' mesajı.",
    avoidance: "ASLA: Karşılaştırma, eksiklik vurgusu. BUNUN YERİNE: Eşsiz yıldız, iç hazine, özel sen."
  },
  anger: {
    principles: "Öfke normal bir duygu. Kontrollü ifade öğrenilebilir. Öfkenin altındaki duygular keşfedilir. Sakinleşme teknikleri.",
    arcGuidance: "Karakter: öfkeli/patlayan → öfkeyi anlama → kontrol kazanma. 'Duygular yönetilebilir' mesajı.",
    avoidance: "ASLA: Şiddet, yıkım, zarar verme. BUNUN YERİNE: Öfke canavarını evcilleştirmek, sakin süper kahraman, duygu ustası."
  },
  school_stress: {
    principles: "Başarı sadece notlarla ölçülmez. Herkesin öğrenme hızı farklı. Hatalar öğretir. Çaba önemli, mükemmellik değil.",
    arcGuidance: "Karakter: stresli/endişeli → öğrenmenin eğlenceli olduğunu keşfetme → rahatlamayı öğrenme. 'Kendi hızınla ilerlersen olur' mesajı.",
    avoidance: "ASLA: Başarısızlık, utanç, ceza. BUNUN YERİNE: Kendi hızında koşan tavşan, hata yapan bilge, öğrenme macerası."
  },
  social_rejection: {
    principles: "Herkes sevilmeyi hak eder. Doğru arkadaşlar bulunur. Kendin olmak önemli. Reddedilmek kişisel değil.",
    arcGuidance: "Karakter: dışlanmış/yalnız → özgüvenini bulma → gerçek arkadaşları çekme. 'Doğru insanlar seni bulur' mesajı.",
    avoidance: "ASLA: Reddedilme detayları, alay. BUNUN YERİNE: Farklı olan güzel, gerçek arkadaş, kendi ışığın, ait olduğun yer."
  },

  // === ADDITIONAL CATEGORIES ===
  displacement: {
    principles: "Yeni yer yeni fırsatlar. Anılar kalpte yaşar. Adaptasyon gücü. Kökenler önemli ama gelecek de.",
    arcGuidance: "Karakter: yerinden edilmiş/kaybolmuş → yeni ortama uyum → her iki yerde de ait olmak. 'Ev kalbimizdedir' mesajı.",
    avoidance: "ASLA: Travmatik göç detayları, tehlike. BUNUN YERİNE: Yeni yuva aynı kalp, kökleri taşıyan ağaç, cesur yolcu."
  },
  poverty: {
    principles: "Değer maddi şeylerle ölçülmez. Aile ve sevgi en büyük zenginlik. Zor zamanlar geçici. Dayanıklılık ve umut.",
    arcGuidance: "Karakter: maddi eksiklik → gerçek zenginliği keşfetme → mutluluğu bulma. 'Kalp zengini önemli' mesajı.",
    avoidance: "ASLA: Açlık, yoksunluk, utanç. BUNUN YERİNE: Gerçek hazine, kalp zengini, paylaşmanın mutluluğu, güçlü aile."
  },
  cyberbullying: {
    principles: "Online dünya gerçek dünya kadar önemli. Ekran arkasındaki sözler de acıtır. Yardım istemek önemli. Güvenli internet.",
    arcGuidance: "Karakter: online üzgün → yardım bulma → dijital güvenliği öğrenme. 'Ekran arkasında da güçlüsün' mesajı.",
    avoidance: "ASLA: Kötü mesajlar, hakaret detayları. BUNUN YERİNE: Dijital kahraman, güvenli ekran, gerçek arkadaşlık."
  },

  // === FALLBACK ===
  other: {
    principles: "Genel terapötik yaklaşım: Güvenlik, güç, umut ve bağlantı temalarını kullan. Karakter her zaman güçlenir.",
    arcGuidance: "Karakter: zorlukla karşılaşma → destek ve güç bulma → büyüme ve umut. Pozitif dönüşüm şart.",
    avoidance: "ASLA: Travmayı detaylı anlatma. BUNUN YERİNE: Metafor ve dolaylı anlatım kullan."
  }
};

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
  logger.info("[Stage 1] 🎯 Creating story outline...");

  // Get therapeutic guidance if context exists
  const therapeuticGuidance = input.therapeuticContext
    ? THERAPEUTIC_STORY_GUIDANCE[input.therapeuticContext.concernType] || THERAPEUTIC_STORY_GUIDANCE.other
    : null;

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
1. "${input.childAge} yaşındaki karakter bahçede kelebek kovalıyor, altın bir taş buluyor"
2. "Taş parlayınca, konuşan bir sincap beliyor ve yardım istiyor"
3. "Birlikte ormana gidiyorlar, kayıp sincap ailesini arıyorlar"
4. "Karanlık ağaçlar arasında korku duyuyorlar ama birbirlerine cesaret veriyorlar"
5. "Sincap ailesini buluyorlar, taş ödül olarak karaktere kalıyor"

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

  // Build therapeutic guidance section if applicable
  const therapeuticSection = therapeuticGuidance ? `
⚠️ TERAPÖTİK HİKAYE MODU - ÇOK ÖNEMLİ!

Bu çocuğun çiziminde duygusal içerik tespit edildi. Hikaye BIBLIOTHERAPY (kitap terapisi) prensiplerini uygulamalı.

📋 TERAPÖTİK PRENSİPLER:
${therapeuticGuidance.principles}

🎭 KARAKTER GELİŞİM ARKI:
${therapeuticGuidance.arcGuidance}

🚫 KAÇINILMASI GEREKENLER:
${therapeuticGuidance.avoidance}

💜 GENEL TERAPÖTİK İLKELER:
- PSİKOLOJİK MESAFE: Travmayı doğrudan değil, metafor ve sembollerle anlat
- DIŞSALLAŞTIRMA: Kötü/korkunç şeyi yenilebilir bir karakter yap
- GÜÇLENDİRME: Karakter güç kazansın, kontrol hissi versin
- GÜVENLİK: Güvenli ortamlar ve koruyucu figürler olsun
- UMUT: Hikaye MUTLAKA pozitif bir dönüşümle bitsin
` : '';

  // Determine gender text for prompt
  const genderText = input.childGender === 'male' ? 'Erkek' : input.childGender === 'female' ? 'Kız' : '';

  // V2: Build visual description section - THIS IS CRITICAL for character connection to drawing
  const visualDescriptionSection = input.visualDescription ? `
🎨 ÇOK ÖNEMLİ - ÇİZİMDEKİ GÖRSEL (ANA KARAKTER BURADAN TÜRETİLMELİ!):
"${input.visualDescription}"

ZORUNLU KURALLAR:
1. Ana karakter ÇİZİMDEKİ VARLIK olmalı! (kedi çizdiyse kedi, tavşan çizdiyse tavşan)
2. Çizimdeki RENKLER ve ÖZELLİKLER karaktere aktarılmalı
3. Çizimdeki OBJELER/MEKAN hikayede kullanılmalı
4. Çocuğun çizdiği şey hikayenin KAHRAMANI olmalı

Örnek: Çizimde "mavi gözlü beyaz kedi top oynuyor" varsa:
- Ana karakter: Beyaz kedi (mavi gözlü)
- Hikaye: Top ile ilgili bir macera
- YANLIŞ: Başka bir hayvan seçmek!
` : '';

  const userPrompt = `Çocuk Yaşı: ${input.childAge}
${genderText ? `Çocuğun Cinsiyeti: ${genderText} (ana karakter bu cinsiyete uygun olsun - erkekse erkek hayvan, kızsa kız hayvan)` : ''}
${visualDescriptionSection}
Çizim Analizi Bulguları:
${insightsSummary}

Tema Önerileri: ${input.themes?.join(', ') || ageParams.themes.join(', ')}
Hedef Sayfa: ${ageParams.pageCount}
Ruh Hali: ${mood}
${therapeuticSection}
GÖREV: ${ageParams.pageCount} sayfalık bir hikaye için karakter ve yapı oluştur.${input.visualDescription ? ' ÇİZİMDEKİ VARLIK ana karakter olmalı!' : ''}${therapeuticGuidance ? ' TERAPÖTİK prensiplere DİKKAT ET!' : ''}

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
    "Beat 1 (SOMUT): Karakter [nerede], [ne yapıyor], [ne buluyor/görüyor]",
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

  try {
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

    if (!jsonMatch) {
      logger.error("[Stage 1] ❌ No JSON found in response:", responseText.substring(0, 200));
      throw new Error("AI yanıtından hikaye taslağı oluşturulamadı");
    }

    const outline = JSON.parse(jsonMatch[0]) as StoryOutline;

    logger.info("[Stage 1] ✅ Outline created:", outline.mainCharacter.name, "-", outline.theme);
    return outline;
  } catch (error) {
    if (error instanceof SyntaxError) {
      logger.error("[Stage 1] ❌ JSON parse error:", error.message);
      throw new Error("Hikaye taslağı oluşturulurken format hatası oluştu");
    }
    logger.error("[Stage 1] ❌ OpenAI error:", error);
    throw error;
  }
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
  logger.info(`[Stage 2] 📝 Expanding scene ${pageNumber}...`);

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

  try {
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

    if (!jsonMatch) {
      logger.error(`[Stage 2] ❌ No JSON found in scene ${pageNumber}:`, responseText.substring(0, 200));
      // Return a fallback scene instead of failing completely
      return {
        pageNumber,
        text: beat, // Use the beat as fallback text
        emotion: "happy",
        visualElements: [],
      };
    }

    const scene = JSON.parse(jsonMatch[0]) as Omit<DetailedScene, 'pageNumber'>;

    logger.info(`[Stage 2] ✅ Scene ${pageNumber} expanded (${scene.text.split(' ').length} words)`);

    return {
      pageNumber,
      ...scene
    };
  } catch (error) {
    logger.error(`[Stage 2] ❌ Error expanding scene ${pageNumber}:`, error);
    // Return a fallback scene instead of failing completely
    return {
      pageNumber,
      text: beat,
      emotion: "happy",
      visualElements: [],
    };
  }
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

  logger.info(`[Stage 3] 💬 Enhancing scene ${scene.pageNumber} with dialogue...`);

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

    logger.info(`[Stage 3] ✅ Scene ${scene.pageNumber} enhanced with dialogue`);

    return {
      ...scene,
      text: enhanced.text,
      dialogue: enhanced.dialogue
    };
  } catch (error) {
    logger.info(`[Stage 3] ⚠️ Dialogue enhancement failed, keeping original`);
    return scene;
  }
}

/**
 * STAGE 4: Generate Visual Prompts
 * V2 - Prompt Guru Edition with Character DNA
 *
 * Create detailed, consistent Flux 2.0 prompts using V2 builder
 *
 * Principles Applied:
 * - CHARACTER FIRST: Anchor tags in highest priority position
 * - CHARACTER DNA: Same tags in EVERY page
 * - No negative prompts
 * - Weight syntax for emphasis
 * - Consistent seed strategy
 */
function generateVisualPrompt(
  scene: DetailedScene,
  character: Character,
  pageNumber: number,
  totalPages: number,
  characterDNA?: CharacterDNA
): string {
  // Convert to V2 format
  const characterV2: CharacterV2 = {
    name: character.name,
    type: character.type,
    gender: 'female', // Default, will be overridden if available
    age: character.age,
    appearance: character.appearance,
    personality: character.personality,
    speechStyle: character.speechStyle
  };

  const sceneV2: SceneV2 = {
    pageNumber,
    totalPages,
    beat: scene.visualElements.join(', '),
    emotion: scene.emotion,
    visualElements: scene.visualElements
  };

  const styleV2: StoryStyleV2 = getStoryStyleForAge(character.age);

  // Use V2 Flux-optimized prompt builder with Character DNA
  // DNA ensures EXACT same character description in every page
  return buildFluxStoryPromptV2(characterV2, sceneV2, styleV2, characterDNA);
}

/**
 * Convert Character to CharacterV2 format
 */
function characterToV2(character: Character, gender?: 'male' | 'female'): CharacterV2 {
  return {
    name: character.name,
    type: character.type,
    gender: gender || 'female',
    age: character.age,
    appearance: character.appearance,
    personality: character.personality,
    speechStyle: character.speechStyle
  };
}

/**
 * Main Multi-Stage Story Generation Function
 */
export async function generateStoryFromAnalysisV2(
  input: StoryGenerationInput
): Promise<GeneratedStory> {
  logger.info("=".repeat(60));
  logger.info("[Story Gen V2] 🚀 MULTI-STAGE GENERATION STARTING");
  logger.info("[Story Gen V2] 👶 Child age:", input.childAge);
  logger.info("[Story Gen V2] 🌍 Language:", input.language);
  logger.info("=".repeat(60));

  const ageParams = getAgeParameters(input.childAge);
  const mood = determineStoryMood(input.drawingAnalysis);

  // STAGE 1: Create Story Outline
  const outline = await createStoryOutline(input, ageParams, mood);
  logger.info("\n" + "=".repeat(60));

  // STAGE 2: Expand beats into detailed scenes (PARALLEL)
  logger.info(`[Stage 2] 📝 Expanding ${outline.storyBeats.length} scenes in parallel...`);
  const scenePromises = outline.storyBeats.map((beat, i) =>
    expandScene(
      beat,
      i + 1,
      outline.mainCharacter,
      ageParams,
      mood,
      input.language
    )
  );
  const scenes = await Promise.all(scenePromises);
  logger.info(`[Stage 2] ✅ All ${scenes.length} scenes expanded in parallel`);
  logger.info("\n" + "=".repeat(60));

  // STAGE 3: Enhance with dialogue (PARALLEL)
  logger.info(`[Stage 3] 💬 Enhancing ${scenes.length} scenes with dialogue in parallel...`);
  const enhancePromises = scenes.map(scene =>
    enhanceWithDialogue(scene, outline.mainCharacter, ageParams)
  );
  const enhancedScenes = await Promise.all(enhancePromises);
  logger.info(`[Stage 3] ✅ All ${enhancedScenes.length} scenes enhanced in parallel`);
  logger.info("\n" + "=".repeat(60));

  // STAGE 4: Generate visual prompts WITH CHARACTER DNA
  logger.info("[Stage 4] 🎨 Generating visual prompts with Character DNA...");

  // Generate Character DNA ONCE - this ensures EXACT same character in ALL pages
  const characterV2 = characterToV2(outline.mainCharacter, input.childGender);
  const characterDNA = generateCharacterDNA(characterV2);

  logger.info("[Stage 4] 🧬 Character DNA generated:", {
    hash: characterDNA.hash.substring(0, 8),
    seed: characterDNA.consistencySeed,
    anchorTags: characterDNA.anchorTags.substring(0, 60) + '...',
    colorSignature: characterDNA.colorSignature,
    uniqueFeatures: characterDNA.uniqueFeatures
  });

  const pages: StoryPage[] = enhancedScenes.map(scene => ({
    pageNumber: scene.pageNumber,
    text: scene.text,
    sceneDescription: `${outline.mainCharacter.name} - ${scene.visualElements.join(', ')} - ${scene.emotion}`,
    // Pass CHARACTER DNA to ensure consistency
    visualPrompt: generateVisualPrompt(scene, outline.mainCharacter, scene.pageNumber, scenes.length, characterDNA),
    emotion: scene.emotion,
  }));
  logger.info("[Stage 4] ✅ All visual prompts generated with same Character DNA");

  // Generate title
  const title = input.language === 'tr'
    ? `${outline.mainCharacter.name} ve ${outline.theme}`
    : `${outline.mainCharacter.name} and ${outline.theme}`;

  logger.info("\n" + "=".repeat(60));
  logger.info("[Story Gen V2] ✅ GENERATION COMPLETE!");
  logger.info("[Story Gen V2] 📖 Title:", title);
  logger.info("[Story Gen V2] 👤 Character:", outline.mainCharacter.name);
  logger.info("[Story Gen V2] 📄 Pages:", pages.length);
  logger.info("[Story Gen V2] 🎯 Theme:", outline.theme);
  logger.info("=".repeat(60));

  return {
    title,
    pages,
    mainCharacter: outline.mainCharacter,
    educationalTheme: outline.educationalValue,
    mood: outline.mood,
    // V2: Include Character DNA for consistent image generation
    characterDNA,
  };
}
