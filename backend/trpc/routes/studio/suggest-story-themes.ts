import { logger } from "../../../lib/utils.js";
import { protectedProcedure } from "../../create-context.js";
import { z } from "zod";
import OpenAI from "openai";
import { authenticatedAiRateLimit } from "../../middleware/rate-limit.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const suggestStoryThemesInputSchema = z.object({
  imageBase64: z.string(),
  language: z.enum(["tr", "en"]).default("tr"),
});

type ThemeSuggestion = {
  title: string;
  theme: string;
  emoji: string;
};

// Comprehensive concern types based on ACEs (Adverse Childhood Experiences) and pediatric psychology
type ConcernType =
  // Original categories
  | 'war'                      // Savaş/çatışma
  | 'violence'                 // Şiddet
  | 'disaster'                 // Doğal afet
  | 'loss'                     // Kayıp
  | 'loneliness'               // Yalnızlık
  | 'fear'                     // Korku
  | 'abuse'                    // İstismar (genel)
  | 'family_separation'        // Aile ayrılığı/boşanma
  | 'death'                    // Ölüm/yas
  // NEW: ACEs Framework categories
  | 'neglect'                  // İhmal (fiziksel/duygusal)
  | 'bullying'                 // Akran zorbalığı
  | 'domestic_violence_witness' // Aile içi şiddete tanıklık
  | 'parental_addiction'       // Ebeveyn bağımlılığı
  | 'parental_mental_illness'  // Ebeveyn ruhsal hastalığı
  // NEW: Pediatric psychology categories
  | 'medical_trauma'           // Tıbbi travma (hastane, hastalık)
  | 'anxiety'                  // Kaygı bozukluğu
  | 'depression'               // Depresyon belirtileri
  | 'low_self_esteem'          // Düşük öz saygı
  | 'anger'                    // Öfke/saldırganlık
  | 'school_stress'            // Okul/akademik stres
  | 'social_rejection'         // Sosyal dışlanma
  // NEW: Additional important categories
  | 'displacement'             // Göç/yerinden edilme
  | 'poverty'                  // Ekonomik zorluk
  | 'cyberbullying'            // Siber zorbalık
  | 'other';

type ContentAnalysis = {
  hasConcerningContent: boolean;
  concernType?: ConcernType;
  concernDescription?: string;
  therapeuticApproach?: string;
};

// Comprehensive therapeutic frameworks based on ACEs research and bibliotherapy
const THERAPEUTIC_FRAMEWORKS: Record<string, { approach: string; themes: string[] }> = {
  // === ORIGINAL CATEGORIES ===
  war: {
    approach: "Barış ve güvenlik temalı metaforlar kullan. Savaşan karakterler yerine koruyucu kahramanlar, güvenli sığınaklar ve barışı getiren büyü/dostluk öğeleri ekle.",
    themes: ["Barışı bulan köy", "Koruyucu kalkan", "Güvenli liman", "Cesur kalp, nazik eller"]
  },
  violence: {
    approach: "Güç ve kontrol kazanma odaklı. Karakter güçlü ve korunaklı hisseder. Kötülük dışsal bir varlık olarak gösterilir ve yenilebilir.",
    themes: ["Korkuyu yenen kahraman", "Sihirli kalkan", "Cesaretin gücü", "Işık karanlığı yener"]
  },
  disaster: {
    approach: "Yeniden yapılanma ve topluluk desteği vurgula. Doğa olayları kontrol edilemez ama birlikte güçlüyüz mesajı.",
    themes: ["Yeniden kurulan yuva", "Birlikte güçlüyüz", "Fırtınadan sonra gökkuşağı", "Yardım eden eller"]
  },
  loss: {
    approach: "Anı ve bağlantı odaklı. Kaybedilen sevilen hâlâ kalplerimizde yaşar. Üzüntü normaldir ama umut var.",
    themes: ["Yıldız olan sevgi", "Kalpte yaşayan anılar", "Gökyüzündeki arkadaş", "Sevgi hiç bitmez"]
  },
  loneliness: {
    approach: "Bağlantı ve aidiyet duygusu. Beklenmedik yerlerden gelen dostluklar. Yalnızlık geçicidir.",
    themes: ["Beklenmeyen arkadaş", "Yalnız değilsin", "Dostluk köprüsü", "Kalbinin sesi"]
  },
  fear: {
    approach: "Korkunun dışsallaştırılması ve yenilmesi. Korku küçük ve yönetilebilir bir karakter olarak gösterilir.",
    themes: ["Küçülen korku canavarı", "Cesaret tohumu", "Karanlıktan korkmayan yıldız", "Güç içimizde"]
  },
  abuse: {
    approach: "Güvenlik, sesini duyurma ve güç kazanma. Çocuk kahramandır, yardım istemek güçtür. Güvenli yetişkinler var.",
    themes: ["Sesini bulan kuş", "Güvenli kale", "Koruyucu melek", "Güçlü ve değerli"]
  },
  family_separation: {
    approach: "Sevgi mesafelere rağmen devam eder. Yeni düzenler oluşturulabilir. Ait olma duygusu.",
    themes: ["İki yuvada bir kalp", "Sevgi köprüsü", "Mesafeleri aşan bağ", "Her yerde seviliyorsun"]
  },
  death: {
    approach: "Kaybı anlamlandırma ve yaşamı kutlama. Ölüm bir dönüşüm olarak anlatılır. Sevdiklerimiz anılarımızda yaşar.",
    themes: ["Yıldız olan büyükanne", "Kelebek oldu sevgim", "Anılar bahçesi", "Sonsuza dek kalbimde"]
  },

  // === NEW: ACEs FRAMEWORK CATEGORIES ===
  neglect: {
    approach: "İlgi ve bakım odaklı. Karakter sevilmeyi ve ilgiyi hak eder. Güvenli, sevgi dolu yetişkinler bulur. Temel ihtiyaçların karşılanması hakkı vurgulanır.",
    themes: ["Sıcak bir yuva", "Sevgi dolu eller", "İlgi gören yıldız", "Değerli hazine"]
  },
  bullying: {
    approach: "Güçlenme ve destek odaklı. Zorbalık yapanın sorunu kendinde. Karakter değerli ve sevilesi. Yardım istemek cesaret gerektirir. Arkadaşlık gücü.",
    themes: ["Cesur kalp", "Gerçek dostlar", "İç güzellik", "Birlikte güçlüyüz"]
  },
  domestic_violence_witness: {
    approach: "Güvenlik ve koruma odaklı. Çocuğun suçu yok. Güvenli yerler ve insanlar var. Duygular normaldir. Şiddet asla kabul edilemez.",
    themes: ["Güvenli sığınak", "Huzur adası", "Koruyucu melek", "Yeni başlangıç"]
  },
  parental_addiction: {
    approach: "Çocuğun suçu olmadığı vurgulanır. Hastalık kavramı (kişi değil). Güvenli yetişkinler var. Duygular geçerlidir. Umut ve iyileşme mümkün.",
    themes: ["Işığı bulan aile", "Yardım melekleri", "Güçlü fidanlar", "Güneşli yarınlar"]
  },
  parental_mental_illness: {
    approach: "Anne/babanın hastalığı çocuğun suçu değil. Hastalık geçici olabilir. Sevgi devam eder. Çocuk güçlü ve değerli. Yardım almak önemli.",
    themes: ["Sevgi her zaman", "Bulutların üstündeki güneş", "Güçlü minik kalp", "Sabırlı çiçek"]
  },

  // === NEW: PEDIATRIC PSYCHOLOGY CATEGORIES ===
  medical_trauma: {
    approach: "Hastane/tedavi korkusunu normalleştir. Doktorlar yardımcıdır. Vücut iyileşir. Cesaret küçük adımlarla. Kontrol hissi vur.",
    themes: ["Cesur küçük savaşçı", "İyileşen kahraman", "Beyaz önlüklü dostlar", "Güçlenen vücut"]
  },
  anxiety: {
    approach: "Endişe dışsallaştırılır (örn: 'Endişe Canavarı'). Küçük adımlarla başa çıkma. Nefes ve sakinleşme. Kontrol edilebilir.",
    themes: ["Küçülen endişe", "Sakin göl", "Cesaret adımları", "Huzur bahçesi"]
  },
  depression: {
    approach: "Üzüntü geçerli bir duygu. Karanlık dönemler geçer. Küçük mutluluklar önemli. Yardım istemek güç. Umut hep var.",
    themes: ["Güneşi arayan çiçek", "Yavaş yavaş parlayan yıldız", "Renklerin dönüşü", "Umut tohumu"]
  },
  low_self_esteem: {
    approach: "Her çocuk özel ve değerli. Farklılıklar güzeldir. İç güzellik dış güzellikten önemli. Kendini sevmek öğrenilebilir.",
    themes: ["Eşsiz yıldız", "İç hazine", "Özel sen", "Kendini seven prenses/prens"]
  },
  anger: {
    approach: "Öfke normal bir duygu. Kontrollü ifade öğrenilebilir. Öfkenin altındaki duygular keşfedilir. Sakinleşme teknikleri.",
    themes: ["Öfke canavarını evcilleştirmek", "Sakin süper kahraman", "Nefes almayı öğrenen ejderha", "Duygu ustası"]
  },
  school_stress: {
    approach: "Başarı sadece notlarla ölçülmez. Herkesin öğrenme hızı farklı. Hatalar öğretir. Çaba önemli, mükemmellik değil.",
    themes: ["Kendi hızında koşan tavşan", "Hata yapan bilge", "Öğrenme macerası", "Başarının gerçek anlamı"]
  },
  social_rejection: {
    approach: "Herkes sevilmeyi hak eder. Doğru arkadaşlar bulunur. Kendin olmak önemli. Reddedilmek kişisel değil.",
    themes: ["Farklı olan güzel", "Gerçek arkadaş", "Kendi ışığın", "Ait olduğun yer"]
  },

  // === NEW: ADDITIONAL CATEGORIES ===
  displacement: {
    approach: "Yeni yer yeni fırsatlar. Anılar kalpte yaşar. Adaptasyon gücü. Kökenler önemli ama gelecek de.",
    themes: ["Yeni yuva, aynı kalp", "Kökleri taşıyan ağaç", "Dünya vatandaşı", "Cesur yolcu"]
  },
  poverty: {
    approach: "Değer maddi şeylerle ölçülmez. Aile ve sevgi en büyük zenginlik. Zor zamanlar geçici. Dayanıklılık ve umut.",
    themes: ["Gerçek hazine", "Kalp zengini", "Paylaşmanın mutluluğu", "Güçlü aile"]
  },
  cyberbullying: {
    approach: "Online dünya gerçek dünya kadar önemli. Ekran arkasındaki sözler de acıtır. Yardım istemek önemli. Güvenli internet kullanımı.",
    themes: ["Dijital kahraman", "Güvenli ekran", "Gerçek arkadaşlık", "Akıllı gezgin"]
  },

  // === FALLBACK ===
  other: {
    approach: "Genel terapötik yaklaşım: Güvenlik, güç, umut ve bağlantı temalarını kullan. Çocuğun duygularını normalleştir.",
    themes: ["Cesur küçük kahraman", "İçindeki güç", "Umut ışığı", "Sen özelsin"]
  }
};

export const suggestStoryThemesProcedure = protectedProcedure
  .use(authenticatedAiRateLimit)
  .input(suggestStoryThemesInputSchema)
  .mutation(async ({ input }: { input: z.infer<typeof suggestStoryThemesInputSchema> }) => {
    logger.info("[Suggest Story Themes] 🎨 Analyzing drawing for theme suggestions");
    logger.info("[Suggest Story Themes] Language:", input.language);

    try {
      const isTurkish = input.language === "tr";

      const prompt = isTurkish
        ? `Sen bir pediatri uzmanı, çocuk psikoloğu ve bibliotherapy (kitap terapisi) uzmanısın. Bu çocuk çizimini ACEs (Adverse Childhood Experiences) çerçevesinde dikkatle analiz et.

## ÖNCELİKLİ ADIM: GÖRSEL ANALİZİ

ÖNCE görselde GERÇEKTEN ne gördüğünü detaylı tanımla:
1. Figürler: Kaç kişi var? Ne yapıyorlar? Yüz ifadeleri nasıl?
2. Objeler: Silah, ev, araç, doğa unsuru var mı?
3. Renkler: Hangi renkler baskın? Koyu/açık tonlar?
4. Sahne: Nerede geçiyor? (savaş alanı, ev, okul, dışarı?)
5. Atmosfer: Genel hava nasıl? (huzurlu, gergin, korkunç, neşeli?)

BU GÖRSELİ DİKKATLE İNCELE. Varsayım yapma. Görmediğin şeyi yazma.

## KAPSAMLI TRAVMA TESPİTİ VE SINIFLANDIRMA (ACEs + Pediatrik Psikoloji)

### TEMEL KATEGORİLER
1. **SAVAŞ (war)**: Silahlar, askerler, bombalar, yıkılmış binalar, savaş sahneleri
2. **ŞİDDET (violence)**: Dövüşen figürler, yaralı karakterler, kan, şiddet eylemleri
3. **DOĞAL AFET (disaster)**: Deprem yıkıntıları, sel suları, yangın, fırtına
4. **KAYIP (loss)**: Mezarlar, yokluk temaları, boş yerler, eksik aile üyeleri
5. **YALNIZLIK (loneliness)**: Tek başına figürler, izole karakterler
6. **KORKU (fear)**: Canavarlar, karanlık temalar, korkmuş ifadeler
7. **İSTİSMAR (abuse)**: Ağlayan çocuklar, korunmasız pozisyonlar
8. **AİLE AYRILIGI (family_separation)**: Bölünmüş aileler, ayrılmış figürler
9. **ÖLÜM (death)**: Melekler, bulutlardaki figürler, mezar sembolleri

### ACEs FRAMEWORK KATEGORİLERİ
10. **İHMAL (neglect)**: Bakımsız görünüm, boş/karanlık ev, yalnız bırakılmış çocuk, temel ihtiyaç eksikliği
11. **ZORBALIK (bullying)**: Bir grup tarafından çevrelenmiş tek çocuk, ağlayan yüz, itilen/dışlanan figür
12. **AİLE İÇİ ŞİDDETE TANIKLIK (domestic_violence_witness)**: Kavga eden ebeveynler, saklanan çocuk, korku ifadeli gözlemci
13. **EBEVEYN BAĞIMLILIĞI (parental_addiction)**: Şişeler, sigara, yatan/hareketsiz ebeveyn, endişeli çocuk
14. **EBEVEYN RUHSAL HASTALIĞI (parental_mental_illness)**: Üzgün/ağlayan ebeveyn, yatakta yatan anne/baba, karanlık oda

### PEDİATRİK PSİKOLOJİ KATEGORİLERİ
15. **TIBBİ TRAVMA (medical_trauma)**: Hastane, iğne, yatak, doktor, ameliyat, hastalık sembolleri
16. **KAYGI (anxiety)**: Titrek çizgiler, büyük gözler, küçük figür, tehdit sembolleri
17. **DEPRESYON (depression)**: Koyu renkler, ağlayan yüz, yalnız figür, güneşsiz/bulutlu gökyüzü
18. **DÜŞÜK ÖZ SAYGI (low_self_esteem)**: Çok küçük çizilmiş kendisi, köşede figür, silik çizgiler
19. **ÖFKE (anger)**: Kırmızı renkler, saldırgan figürler, patlamalar, kırık objeler
20. **OKUL STRESİ (school_stress)**: Okul binası, kitaplar, sınav, ağlayan öğrenci
21. **SOSYAL DIŞLANMA (social_rejection)**: Gruptan uzak tek figür, kapalı kapı, duvar

### EK KATEGORİLER
22. **GÖÇ/YERİNDEN EDİLME (displacement)**: Yolculuk, bavul, farklı evler, yabancı ortam
23. **EKONOMİK ZORLUK (poverty)**: Boş tabak, yırtık kıyafet, eksik eşyalar
24. **SİBER ZORBALIK (cyberbullying)**: Telefon/tablet, üzgün yüz, mesaj sembolleri

## TERAPÖTİK YAKLAŞIM (Bibliotherapy Prensipleri)

Travmatik içerik tespit edildiğinde:
- **PSİKOLOJİK MESAFE**: Metaforlar kullan
- **DIŞSALLAŞTIRMA**: Sorunu ayrı bir varlık olarak göster
- **GÜÇLENDİRME**: Karakter güç ve kontrol kazansın
- **GÜVENLİK**: Güvenli ortamlar ve koruyucu figürler
- **UMUT**: Pozitif dönüşüm ile bitir

## ÇIKTI FORMATI

{
  "visualDescription": "Görselde gördüklerinin detaylı açıklaması (2-3 cümle). Figürler, objeler, renkler, sahne, atmosfer.",
  "contentAnalysis": {
    "hasConcerningContent": boolean,
    "concernType": "war" | "violence" | "disaster" | "loss" | "loneliness" | "fear" | "abuse" | "family_separation" | "death" | "neglect" | "bullying" | "domestic_violence_witness" | "parental_addiction" | "parental_mental_illness" | "medical_trauma" | "anxiety" | "depression" | "low_self_esteem" | "anger" | "school_stress" | "social_rejection" | "displacement" | "poverty" | "cyberbullying" | "other" | null,
    "concernDescription": "Ebeveyne yönelik kısa, empatik açıklama (Türkçe)",
    "therapeuticApproach": "Uygulanan terapötik yaklaşımın kısa açıklaması"
  },
  "suggestions": [
    {
      "title": "Terapötik masal başlığı (3-5 kelime)",
      "theme": "Bu masalın çocuğa nasıl yardımcı olacağının açıklaması",
      "emoji": "uygun emoji"
    }
  ]
}

ÖNEMLİ: visualDescription alanı ZORUNLUDUR. Önce görseli tanımla, sonra kategorize et.

ÖNEMLİ:
- Eğer endişe verici içerik yoksa normal pozitif temalar öner
- Temalar her zaman çocuk dostu ve umut verici olmalı
- Asla travmayı doğrudan tekrar etme, dolaylı ve iyileştirici yaklaş
- 3 farklı tema öner

Sadece JSON yanıt ver.`
        : `You are a pediatric expert, child psychologist, and bibliotherapy specialist. Carefully analyze this child's drawing using the ACEs (Adverse Childhood Experiences) framework.

## PRIORITY STEP: VISUAL ANALYSIS

FIRST describe what you ACTUALLY see in the image in detail:
1. Figures: How many people? What are they doing? Facial expressions?
2. Objects: Weapons, houses, vehicles, nature elements?
3. Colors: Which colors are dominant? Dark/light tones?
4. Scene: Where is it taking place? (battlefield, home, school, outdoors?)
5. Atmosphere: What's the overall mood? (peaceful, tense, scary, cheerful?)

CAREFULLY EXAMINE THIS IMAGE. Don't assume. Don't write what you don't see.

## COMPREHENSIVE TRAUMA DETECTION AND CLASSIFICATION (ACEs + Pediatric Psychology)

### CORE CATEGORIES
1. **WAR (war)**: Weapons, soldiers, bombs, destroyed buildings, battle scenes
2. **VIOLENCE (violence)**: Fighting figures, injured characters, blood, violent acts
3. **NATURAL DISASTER (disaster)**: Earthquake ruins, flood waters, fire, storm, collapsed homes
4. **LOSS (loss)**: Graves, funeral scenes, absence themes, empty spaces, missing family members
5. **LONELINESS (loneliness)**: Isolated figures, separated characters, distant positioning
6. **FEAR (fear)**: Monsters, dark themes, scared expressions, threatening elements
7. **ABUSE (abuse)**: Crying children, vulnerable positions, large-small figure dynamics
8. **FAMILY SEPARATION (family_separation)**: Divided families, figures separated by lines, distant parents
9. **DEATH (death)**: Angels, figures in clouds, wings, grave symbols

### ACEs FRAMEWORK CATEGORIES
10. **NEGLECT (neglect)**: Unkempt appearance, empty/dark home, abandoned child, basic needs unmet
11. **BULLYING (bullying)**: Single child surrounded by group, crying face, pushed/excluded figure
12. **WITNESSING DOMESTIC VIOLENCE (domestic_violence_witness)**: Fighting parents, hiding child, scared observer
13. **PARENTAL ADDICTION (parental_addiction)**: Bottles, cigarettes, lying/motionless parent, worried child
14. **PARENTAL MENTAL ILLNESS (parental_mental_illness)**: Sad/crying parent, bedridden parent, dark room

### PEDIATRIC PSYCHOLOGY CATEGORIES
15. **MEDICAL TRAUMA (medical_trauma)**: Hospital, needles, beds, doctors, surgery, illness symbols
16. **ANXIETY (anxiety)**: Shaky lines, big eyes, small figure, threat symbols
17. **DEPRESSION (depression)**: Dark colors, crying face, lonely figure, sunless/cloudy sky
18. **LOW SELF-ESTEEM (low_self_esteem)**: Very small self-portrait, corner figure, faint lines
19. **ANGER (anger)**: Red colors, aggressive figures, explosions, broken objects
20. **SCHOOL STRESS (school_stress)**: School building, books, exams, crying student
21. **SOCIAL REJECTION (social_rejection)**: Single figure away from group, closed door, wall

### ADDITIONAL CATEGORIES
22. **DISPLACEMENT/MIGRATION (displacement)**: Journey, suitcase, different houses, foreign environment
23. **ECONOMIC HARDSHIP (poverty)**: Empty plate, torn clothes, missing items
24. **CYBERBULLYING (cyberbullying)**: Phone/tablet, sad face, message symbols

## THERAPEUTIC APPROACH (Bibliotherapy Principles)

When traumatic content is detected, apply these therapeutic principles:

**PSYCHOLOGICAL DISTANCE**: Story uses metaphors to help child process experience indirectly
**EXTERNALIZATION**: Trauma/fear shown as separate entity (defeatable monster, passing storm)
**EMPOWERMENT**: Character (thus child) gains strength and control
**SAFETY**: Story includes safe environments and protective figures
**HOPE**: Every story moves toward positive transformation

## OUTPUT FORMAT

{
  "visualDescription": "Detailed description of what you see in the image (2-3 sentences). Figures, objects, colors, scene, atmosphere.",
  "contentAnalysis": {
    "hasConcerningContent": boolean,
    "concernType": "war" | "violence" | "disaster" | "loss" | "loneliness" | "fear" | "abuse" | "family_separation" | "death" | "neglect" | "bullying" | "domestic_violence_witness" | "parental_addiction" | "parental_mental_illness" | "medical_trauma" | "anxiety" | "depression" | "low_self_esteem" | "anger" | "school_stress" | "social_rejection" | "displacement" | "poverty" | "cyberbullying" | "other" | null,
    "concernDescription": "Brief, empathetic description for parent",
    "therapeuticApproach": "Brief explanation of therapeutic approach applied"
  },
  "suggestions": [
    {
      "title": "Therapeutic story title (3-5 words)",
      "theme": "Explanation of how this story helps the child",
      "emoji": "appropriate emoji"
    }
  ]
}

IMPORTANT: The visualDescription field is REQUIRED. First describe the image, then categorize.

IMPORTANT:
- If no traumatic content, suggest normal positive themes
- Themes must always be child-friendly and hopeful
- Never directly repeat trauma, approach indirectly and healingly
- Suggest 3 different themes

Only respond with JSON.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${input.imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1200, // Increased for visual description + therapeutic analysis
        temperature: 0.5, // Lower temperature for more accurate image analysis
      });

      const content = response.choices[0]?.message?.content || "";
      logger.info("[Suggest Story Themes] ✅ Raw response:", content);

      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse JSON from response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Log visual description first - this helps debug image analysis issues
      if (parsed.visualDescription) {
        logger.info("[Suggest Story Themes] 👁️ Visual Description:", parsed.visualDescription);
      } else {
        logger.info("[Suggest Story Themes] ⚠️ No visual description provided by model");
      }

      const suggestions: ThemeSuggestion[] = parsed.suggestions || [];
      const contentAnalysis: ContentAnalysis = parsed.contentAnalysis || {
        hasConcerningContent: false,
        concernType: null,
        concernDescription: null,
        therapeuticApproach: null,
      };

      if (suggestions.length === 0) {
        throw new Error("No suggestions returned");
      }

      // Log warning if concerning content detected
      if (contentAnalysis.hasConcerningContent) {
        logger.info("[Suggest Story Themes] ⚠️ CONCERNING CONTENT DETECTED:", contentAnalysis.concernType);
        logger.info("[Suggest Story Themes] ⚠️ Description:", contentAnalysis.concernDescription);
        logger.info("[Suggest Story Themes] 💜 Therapeutic approach:", contentAnalysis.therapeuticApproach);
      }

      logger.info("[Suggest Story Themes] ✅ Generated", suggestions.length, "theme suggestions");
      logger.info("[Suggest Story Themes] Content analysis:", contentAnalysis);
      // V2: Return visual description for story-drawing connection
      return { suggestions, contentAnalysis, visualDescription: parsed.visualDescription || null };
    } catch (error) {
      logger.error("[Suggest Story Themes] ❌ Error:", error);
      throw new Error(
        `Story theme suggestion failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
