import { logger } from "../../../lib/utils.js";
import { protectedProcedure } from "../../create-context.js";
import { z } from "zod";
import OpenAI from "openai";
import { authenticatedAiRateLimit } from "../../middleware/rate-limit.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analysisInputSchema = z.object({
  taskType: z.enum(["DAP", "HTP", "Family", "Cactus", "Tree", "Garden", "BenderGestalt2", "ReyOsterrieth", "Aile", "Kaktus", "Agac", "Bahce", "Bender", "Rey", "Luscher"]),
  childAge: z.number().optional(),
  imageBase64: z.string().optional(),
  language: z.enum(["tr", "en", "ru", "tk", "uz"]).optional().default("tr"),
  userRole: z.enum(["parent", "teacher"]).optional().default("parent"),
  culturalContext: z.string().optional(),
  featuresJson: z.record(z.string(), z.any()).optional(),
});

const analysisResponseSchema = z.object({
  meta: z.object({
    testType: z.enum(["DAP", "HTP", "Family", "Cactus", "Tree", "Garden", "BenderGestalt2", "ReyOsterrieth", "Aile", "Kaktus", "Agac", "Bahce", "Bender", "Rey", "Luscher"]),
    age: z.number().optional(),
    language: z.enum(["tr", "en", "ru", "tk", "uz"]),
    confidence: z.number().min(0).max(1),
    uncertaintyLevel: z.enum(["low", "mid", "high"]),
    dataQualityNotes: z.array(z.string()),
  }),
  insights: z.array(
    z.object({
      title: z.string(),
      summary: z.string(),
      evidence: z.array(z.string()),
      strength: z.enum(["weak", "moderate", "strong"]),
    })
  ),
  homeTips: z.array(
    z.object({
      title: z.string(),
      steps: z.array(z.string()),
      why: z.string(),
    })
  ),
  riskFlags: z.array(
    z.object({
      type: z.enum([
        "self_harm",
        "harm_others",
        "sexual_inappropriate",
        "violence",
        "severe_distress",
        "trend_regression",
      ]),
      summary: z.string(),
      action: z.literal("consider_consulting_a_specialist"),
    })
  ),
  // Trauma/concerning content assessment based on ACEs (Adverse Childhood Experiences) framework
  traumaAssessment: z.nullable(z.object({
    hasTraumaticContent: z.boolean(),
    // Expanded to 24 categories based on ACEs + pediatric psychology
    contentTypes: z.array(z.enum([
      // Original categories
      "war", "violence", "disaster", "loss", "loneliness", "fear", "abuse", "family_separation", "death",
      // ACEs Framework categories
      "neglect", "bullying", "domestic_violence_witness", "parental_addiction", "parental_mental_illness",
      // Pediatric psychology categories
      "medical_trauma", "anxiety", "depression", "low_self_esteem", "anger", "school_stress", "social_rejection",
      // Additional categories
      "displacement", "poverty", "cyberbullying",
      // Legacy/compatibility
      "weapons", "injury", "natural_disaster", "conflict",
      // No concerning content
      "none"
    ])),
    primaryConcern: z.enum([
      "war", "violence", "disaster", "loss", "loneliness", "fear", "abuse", "family_separation", "death",
      "neglect", "bullying", "domestic_violence_witness", "parental_addiction", "parental_mental_illness",
      "medical_trauma", "anxiety", "depression", "low_self_esteem", "anger", "school_stress", "social_rejection",
      "displacement", "poverty", "cyberbullying", "other", "none"
    ]).optional(),
    therapeuticApproach: z.string().optional(), // Recommended bibliotherapy approach
    ageAppropriateness: z.enum(["age_appropriate", "borderline", "concerning"]),
    detailLevel: z.enum(["minimal", "moderate", "excessive"]),
    emotionalIntensity: z.enum(["low", "moderate", "high"]),
    urgencyLevel: z.enum(["monitor", "discuss_with_child", "consider_professional", "seek_help_urgently"]),
  })).optional(),
  // NEW: Parent conversation guide
  conversationGuide: z.nullable(z.object({
    openingQuestions: z.array(z.string()),
    followUpQuestions: z.array(z.string()),
    whatToAvoid: z.array(z.string()),
    therapeuticResponses: z.array(z.string()),
  })).optional(),
  // NEW: Professional help resources
  professionalGuidance: z.nullable(z.object({
    whenToSeekHelp: z.array(z.string()),
    whoToContact: z.array(z.string()),
    preparationTips: z.array(z.string()),
  })).optional(),
  trendNote: z.string(),
  disclaimer: z.string(),
});

export type AnalysisInput = z.infer<typeof analysisInputSchema>;
export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;

// Helper function to generate disclaimer based on language
function getDisclaimer(language: string): string {
  const disclaimers: Record<string, string> = {
    tr: "Bu içerik bilgi amaçlıdır, tanı koymaz. Endişeleriniz varsa uzmanla görüşebilirsiniz.",
    en: "This content is for informational purposes only and does not constitute a diagnosis. If you have concerns, please consult a specialist.",
    ru: "Этот контент предназначен только для информационных целей и не является диагнозом. Если у вас есть опасения, проконсультируйтесь со специалистом.",
    tk: "Bu mazmun diňe maglumat maksady bilen berilýär we anyklaýyş däl. Aladalaryňyz bar bolsa, hünärmen bilen maslahatlaşyň.",
    uz: "Ushbu kontent faqat ma'lumot maqsadida va tashxis emas. Agar tashvishlaringiz bo'lsa, mutaxassis bilan maslahatlashing.",
  };
  return disclaimers[language] || disclaimers.tr;
}

// Exported for testing
export async function analyzeDrawing(input: AnalysisInput, openaiClient = openai): Promise<AnalysisResponse> {
  logger.info("[Drawing Analysis] 🎯 Starting analysis");
  logger.info("[Drawing Analysis] 📝 Task type:", input.taskType);
  logger.info("[Drawing Analysis] 👶 Child age:", input.childAge);
  logger.info("[Drawing Analysis] 🖼️  Has image:", !!input.imageBase64);

  try {
    const language = input.language || "tr";
    const userRole = input.userRole || "parent";
    const culturalContext = input.culturalContext || "";

    // SYSTEM prompt - role definition
    const systemPrompt = `Rolün: Çocuk çizimleri için projektif tarama asistanısın. Klinik tanı koymazsın.
Görevin: Verilen test türüne (DAP, HTP, Family/KFD, Cactus, Tree, Garden, BenderGestalt2, ReyOsterrieth), yaşa ve özellik vektörüne (features_json) dayanarak ebeveyn/öğretmen için anlaşılır, kısa ve olasılık diliyle yazılmış içgörü ve evde mikro-öneriler üretmek; belirsizliği açıkça ifade etmek; riskli içerikleri saptayıp nazik bir dille "uzman görüşü öner" bayrağı vermek.

ÖNEMLİ - Görsel Analiz:
- Görseli DİKKATLE incele. Gerçekte ne görüyorsan onu yaz.
- Renklere dikkat et: Koyu/açık tonlar, sıcak/soğuk renkler, renk çeşitliliği
- Figürlere dikkat et: Yüz ifadeleri (gülümseme/kaşları çatık/nötr), beden dili, duruş
- Çizgi kalitesine dikkat et: Yumuşak/sert çizgiler, titrek/güçlü çizgiler, baskı gücü
- Kompozisyona dikkat et: Figürlerin konumu, boşluk kullanımı, sayfanın hangi kısmı dolu
- Sembollere dikkat et: Güneş/bulut/yağmur, kalpler, yıldırımlar, vs.
- Resmin genel havasını değerlendir: Neşeli/hüzünlü/endişeli/sakin/hareketli
- VARSAYIMDA BULUNMA: Görmediğin bir şeyi yazma, görsel kanıtlarla destekle

İlke ve kısıtlar:
- Klinik iddia, teşhis, tedavi ismi, patoloji etiketi YOK. "tanı koymaz", "ipucu olabilir", "gözleniyor olabilir", "karışık" gibi olasılık dili kullan.
- Kültürel/ailesel bağlamı saygılı ve yargısız yorumla. Ahlaki yargı yok.
- Çocuk yararı ve gizlilik: isim, yüz, kişisel veri üretme; özel bilgi uydurma.
- Belirsizlik yönetimi: Veri kısıtlıysa "emin değilim" düzeyi yükselt; içgörüleri daralt; somut, düşük riskli ev içi öneriler ver.
- Görsel-motor (Bender–Gestalt II, Rey–Osterrieth kopya/bellek) çıktılarında "organizasyon", "planlama", "dikkat" gibi **beceri** terimleri kullan; "bozukluk" iması yapma.
- Lüscher tarzı renk oyunu kullanılsa bile bunu "mini tercih/oyun" olarak an, bilimsel iddia abartma.
- Açıkça zararlı/uygunsuz işaretler (kendine/başkasına zarar, yoğun cinsel içerik, şiddet, aşırı karanlık ifadeler, tehdit vb.) → risk flag ve nazik yönlendirme.
- Zincirleme akıl yürütmeni GÖSTERME. Sadece sonuç cümleleri + kısa kanıt referansı alanlarında özet gerekçe sun.

Test odaklı ipucu taksonomisi (örnek yönlendirmeler, kural değil):
- **DAP (Bir İnsan Çiz – Koppitz, 4–12):** baş/beden oranı, boyun/eller/parmaklar, yüz ayrıntıları, baskı, sayfa konumu, kıyafet/aksesuar, çizgi sürekliliği.
- **HTP (Ev-Ağaç-İnsan, 5+):**
  - Ev→ aile aidiyeti/mahremiyet ipuçları (kapı/pencere oranları, baca, çit).
  - Ağaç→ benlik gücü/enerji (gövde kalınlığı, kökler, taç doluluğu).
  - İnsan→ sosyal kendilik (ölçek, duruş, eller).
- **Family/Kinetic Family (5–12):** figürler arası mesafe, temas, bakış, rol simgeleri, hareket; çocuğun konumu/ölçeği.
- **Cactus (4–12):** diken yoğunluğu, boyut, saksı/çiçek varlığı → savunma/direnç/duygu regülasyonu ipuçları.
- **Tree (Koch):** gövde-kök-taç dengesi, dal yönleri, taç doluluğu → enerji/köklenme ipuçları.
- **Garden:** bitki çeşitliliği, renk canlılığı, kompozisyon → çevre uyumu/yaşam enerjisi ipuçları.
- **Bender–Gestalt II (4+):** görsel-motor organizasyon, yönelim, orantı, tekrar/atlama; sadece tarama niteliğinde.
- **Rey–Osterrieth (6+):** kopya stratejisi (bütün→parça ya da parça→bütün), gecikmeli hatırlama; planlama/organizasyon.

Risk bayrakları (örn.):
- Kendine/başkasına zarar ima eden yazı/simge.
- Aşırı şiddet/cinsel içerik, yoğun karanlık tema (yaşa uygun değilse).
- Yoğun kaygı/sıkıntı belirteci olabilecek tekrar eden koyu baskı ve tehditkar mesaj kombinasyonu.
- Uzun süreli belirgin gerileme trendi (zaman serisinden).
Bayrak varsa: "uzmanla görüş" öner; panik yaratma.

**ÖZEL ÖNCELİK: ACEs (Adverse Childhood Experiences) Çerçevesinde Travmatik İçerik Tespiti**

Çizimde aşağıdaki 24 kategoriden herhangi birini tespit et:

**TEMEL KATEGORİLER:**
1. SAVAŞ (war): Silahlar, askerler, bombalar, yıkılmış binalar
2. ŞİDDET (violence): Dövüşen figürler, yaralı karakterler, kan
3. DOĞAL AFET (disaster): Deprem yıkıntıları, sel, yangın
4. KAYIP (loss): Mezarlar, boş yerler, eksik aile üyeleri
5. YALNIZLIK (loneliness): Tek başına figürler, izole karakterler
6. KORKU (fear): Canavarlar, karanlık temalar, korkmuş ifadeler
7. İSTİSMAR (abuse): Ağlayan çocuklar, korunmasız pozisyonlar
8. AİLE AYRILIGI (family_separation): Bölünmüş aileler, ayrılmış figürler
9. ÖLÜM (death): Melekler, bulutlardaki figürler

**ACEs FRAMEWORK KATEGORİLERİ:**
10. İHMAL (neglect): Bakımsız görünüm, boş/karanlık ev, yalnız bırakılmış çocuk
11. ZORBALIK (bullying): Grup tarafından çevrelenmiş tek çocuk, ağlayan yüz, itilen figür
12. AİLE İÇİ ŞİDDETE TANIKLIK (domestic_violence_witness): Kavga eden ebeveynler, saklanan çocuk
13. EBEVEYN BAĞIMLILIĞI (parental_addiction): Şişeler, sigara, yatan/hareketsiz ebeveyn
14. EBEVEYN RUHSAL HASTALIĞI (parental_mental_illness): Üzgün/ağlayan ebeveyn, yatakta yatan anne/baba

**PEDİATRİK PSİKOLOJİ KATEGORİLERİ:**
15. TIBBİ TRAVMA (medical_trauma): Hastane, iğne, yatak, doktor
16. KAYGI (anxiety): Titrek çizgiler, büyük gözler, küçük figür, tehdit sembolleri
17. DEPRESYON (depression): Koyu renkler, ağlayan yüz, yalnız figür, güneşsiz gökyüzü
18. DÜŞÜK ÖZ SAYGI (low_self_esteem): Çok küçük çizilmiş kendisi, köşede figür, silik çizgiler
19. ÖFKE (anger): Kırmızı renkler, saldırgan figürler, patlamalar, kırık objeler
20. OKUL STRESİ (school_stress): Okul binası, kitaplar, sınav, ağlayan öğrenci
21. SOSYAL DIŞLANMA (social_rejection): Gruptan uzak tek figür, kapalı kapı, duvar

**EK KATEGORİLER:**
22. GÖÇ/YERİNDEN EDİLME (displacement): Yolculuk, bavul, farklı evler, yabancı ortam
23. EKONOMİK ZORLUK (poverty): Boş tabak, yırtık kıyafet, eksik eşyalar
24. SİBER ZORBALIK (cyberbullying): Telefon/tablet, üzgün yüz, mesaj sembolleri

**DEĞERLENDİRME ADIMLARI:**

1. **Yaş Uygunluğu Değerlendir:**
   - 4-6 yaş: Minimal endişe verici içerik bile dikkat gerektirir
   - 7-9 yaş: "İyi vs kötü" temaları normal, ama detaylı olumsuz içerik endişe verici
   - 10-12 yaş: Kahramanlık/macera normal, ama gerçekçi travma endişe verici
   - Her yaşta: Aşırı detay, yoğun olumsuz duygular → profesyonel değerlendirme

2. **Detay Seviyesini Değerlendir:**
   - Minimal: Sembolik ifadeler → İzle
   - Moderate: Net olumsuz tema → Çocukla konuş
   - Excessive: Detaylı, yoğun olumsuz içerik → Uzman değerlendirmesi

3. **Duygusal Yoğunluğu Değerlendir:**
   - Çizgi kalitesi: Koyu baskı, sert çizgiler, titreme
   - Renk seçimi: Çok koyu tonlar, kırmızı/siyah dominansı
   - Yüz ifadeleri: Korku, acı, öfke, üzüntü
   - Genel atmosfer: Tehdit hissi, karanlık tema, umutsuzluk

4. **Aciliyet Seviyesi Belirle:**
   - monitor: Tek seferlik, minimal detay, yaşa uygun
   - discuss_with_child: Orta detay veya tekrarlayan tema
   - consider_professional: Yüksek detay, yaşa uygun değil, duygusal yoğunluk
   - seek_help_urgently: Kendine/başkasına zarar teması, aşırı travmatik içerik

5. **Terapötik Yaklaşım Öner (therapeuticApproach alanı için):**
   - Her kategori için bibliotherapy prensipleri:
     * Psikolojik mesafe: Metafor kullan
     * Dışsallaştırma: Sorunu ayrı bir varlık olarak göster
     * Güçlendirme: Çocuğa güç ver
     * Güvenlik: Güvenli ortamlar vurgula
     * Umut: Pozitif dönüşüm sun

6. **Ebeveyn İçin Konuşma Rehberi Oluştur:**
   - Açık uçlu, yargısız sorularla başla: "Bana çizdiğin resmi anlatır mısın?"
   - Çocuğun duygularını kabul et: "Bu duyguları hissetmen çok doğal"
   - ASLA yapmaması gerekenler: "Bu çok korkunç!", "Neden böyle şeyler çiziyorsun?"
   - Terapötik yanıtlar: "Hislerini çizmek çok cesurca", "Bu konuda konuşmak istersen buradayım"

7. **Profesyonel Kaynak Öner:**
   - Ne zaman uzman yardımı alınmalı: Somut durumlar listele
   - Kime başvurulmalı: Çocuk psikologu, okul psikolojik danışmanı, Çocuk Koruma Hattı (183)
   - Nasıl hazırlanmalı: Çizimi sakla, not tut, çocuğu korkutmadan bilgilendir

8. **traumaAssessment, conversationGuide ve professionalGuidance alanlarını MUTLAKA doldur.**
   - primaryConcern: En baskın kategoriyi belirle
   - therapeuticApproach: Bibliotherapy yaklaşımını açıkla

Yerelleştirme:
- Kullanıcı dili ${language}'dir. Çıktıları bu dilde üret.
- Hedef okuyucu: ${userRole === "parent" ? "ebeveyn" : "öğretmen"}. Jargon minimum.
- Cümleler net ve anlaşılır olsun ama yeterince detaylı bilgi ver.

Çıktı formatı: **yalnızca** geçerli JSON döndür. Ek cümle yok.
Şema zorunludur; fazladan alan ekleme.`;

    // USER prompt - input data
    const userPrompt = `language: ${language}
child_age: ${input.childAge || "bilinmiyor"}
test_type: ${input.taskType}
context: {
  "role": "${userRole}",
  "cultural_context": "${culturalContext}"
}

${input.imageBase64 ? `
GÖRSEL ANALİZ TALİMATLARI:
Aşağıdaki görseli analiz ederken:
1. İlk olarak görselde GERÇEKTEN ne gördüğünü tanımla
2. Renkleri değerlendir: Hangi renkler dominant? Koyu mu açık mı? Sıcak mı soğuk mu?
3. Figürleri incele: Yüz ifadeleri var mı? (gülümseme, kaşları çatık, nötr, üzgün)
4. Beden dilini oku: Duruş, kolların pozisyonu, genel hareket
5. Çizgi kalitesi: Yumuşak/sert, titrek/kararlı, hafif/koyu baskı
6. Kompozisyon: Hangi alanlar dolu/boş? Figürler merkezi mi kenarda mı?
7. Semboller: Güneş, bulut, yağmur, kalp, yıldız, vb. var mı?
8. Genel duygu: Resmin atmosferi neşeli/hüzünlü/endişeli/sakin/hareketli?

BU GÖRSELDEKİ SPESIFIK DETAYLARI kullanarak içgörü üret.
` : ''}

features_json:
${JSON.stringify(input.featuresJson || {}, null, 2)}

Kurallar:
- Yalnızca JSON şeması ile cevap ver.
- İçgörüler **en fazla 4 madde**, evde ipuçları **3 madde** olsun.
- Her içgörü için:
  * title: Kısa başlık (3-5 kelime)
  * summary: Detaylı açıklama (3-5 cümle, 100-200 kelime arası).
    - İLK cümlede görselde GERÇEKTEN ne gördüğünü yaz (örn: "Resimde figürlerin yüzlerinde belirgin gülümsemeler var")
    - Sonra bu gözlemi yorumla
    - Somut görsel kanıtlarla destekle (renkler, çizgiler, ifadeler, semboller)
  * evidence: İlgili özellik isimleri (örn: "facial_expressions", "color_warmth", "line_quality")
  * strength: Bulgunun gücü
- Her ev ipucu için:
  * title: Net eylem başlığı
  * steps: 2-4 somut adım (her adım 1-2 cümle)
  * why: Gerekçe (2-3 cümle)
- Cümleler anlaşılır, yargısız ve destekleyici olsun.
- İçgörülerin her birine **en az bir** evidence anahtarı ekle.
- Veri zayıfsa \`uncertaintyLevel:"high"\` yap ve içgörüleri kısalt.
- Risk tespiti yoksa "riskFlags": [] döndür.
- \`disclaimer\` alanını diline göre üret.

JSON Şeması:
{
  "meta": {
    "testType": "${input.taskType}",
    "age": ${input.childAge || "null"},
    "language": "${language}",
    "confidence": number, // 0..1
    "uncertaintyLevel": "low|mid|high",
    "dataQualityNotes": [string]
  },
  "insights": [
    {
      "title": string,
      "summary": string,
      "evidence": [string],
      "strength": "weak|moderate|strong"
    }
  ],
  "homeTips": [
    {
      "title": string,
      "steps": [string],
      "why": string
    }
  ],
  "riskFlags": [
    {
      "type": "self_harm|harm_others|sexual_inappropriate|violence|severe_distress|trend_regression",
      "summary": string,
      "action": "consider_consulting_a_specialist"
    }
  ],
  "traumaAssessment": { // MUTLAKA ekle eğer çizimde endişe verici içerik varsa, yoksa null
    "hasTraumaticContent": boolean,
    "contentTypes": [
      // Temel: "war"|"violence"|"disaster"|"loss"|"loneliness"|"fear"|"abuse"|"family_separation"|"death"
      // ACEs: "neglect"|"bullying"|"domestic_violence_witness"|"parental_addiction"|"parental_mental_illness"
      // Pediatrik: "medical_trauma"|"anxiety"|"depression"|"low_self_esteem"|"anger"|"school_stress"|"social_rejection"
      // Ek: "displacement"|"poverty"|"cyberbullying"
      // Yok: "none"
    ],
    "primaryConcern": "en baskın kategori (yukarıdakilerden biri veya 'none')",
    "therapeuticApproach": "Bibliotherapy yaklaşımı açıklaması (2-3 cümle)",
    "ageAppropriateness": "age_appropriate|borderline|concerning",
    "detailLevel": "minimal|moderate|excessive",
    "emotionalIntensity": "low|moderate|high",
    "urgencyLevel": "monitor|discuss_with_child|consider_professional|seek_help_urgently"
  },
  "conversationGuide": { // MUTLAKA ekle eğer traumaAssessment varsa, yoksa null
    "openingQuestions": [string], // 2-3 açık uçlu soru
    "followUpQuestions": [string], // 2-3 takip sorusu
    "whatToAvoid": [string], // 3-4 yapılmaması gereken
    "therapeuticResponses": [string] // 2-3 destekleyici yanıt örneği
  },
  "professionalGuidance": { // MUTLAKA ekle eğer urgencyLevel "consider_professional" veya "seek_help_urgently" ise, yoksa null
    "whenToSeekHelp": [string], // 3-5 somut durum
    "whoToContact": [string], // 2-3 kaynak
    "preparationTips": [string] // 2-3 hazırlık önerisi
  },
  "trendNote": string,
  "disclaimer": string
}`;

    const messageContent: OpenAI.Chat.ChatCompletionContentPart[] = [
      { type: "text", text: userPrompt }
    ];

    // Add image if provided
    if (input.imageBase64) {
      logger.info("[Drawing Analysis] 🖼️ Adding image to request...");
      messageContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${input.imageBase64}`,
        },
      });
    }

    logger.info("[Drawing Analysis] 🤖 Calling OpenAI API...");

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: messageContent,
        },
      ],
    });

    const responseText = completion.choices[0]?.message?.content || "";

    logger.info("[Drawing Analysis] 📝 Response received, length:", responseText.length);

    let parsedResponse;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      parsedResponse = JSON.parse(jsonString);
      logger.info("[Drawing Analysis] 🔍 Parsed response keys:", Object.keys(parsedResponse));
      logger.info("[Drawing Analysis] 📦 Parsed response:", JSON.stringify(parsedResponse, null, 2));
    } catch (parseErr) {
      logger.error("[Drawing Analysis] ⚠️ JSON parse error:", parseErr);
      logger.error("[Drawing Analysis] 📄 Raw response:", responseText);

      // Fallback response matching new schema
      parsedResponse = {
        meta: {
          testType: input.taskType,
          age: input.childAge,
          language: language,
          confidence: 0.3,
          uncertaintyLevel: "high",
          dataQualityNotes: ["Yanıt beklenmeyen formatta geldi"],
        },
        insights: [
          {
            title: "Analiz tamamlanamadı",
            summary: responseText || "Yanıt işlenemedi. Lütfen tekrar deneyin.",
            evidence: ["parse_error"],
            strength: "weak",
          },
        ],
        homeTips: [
          {
            title: "Tekrar deneyin",
            steps: ["Analizi tekrar çalıştırın", "Sorun devam ederse destek ekibiyle iletişime geçin"],
            why: "Yanıt beklenmeyen bir formatta geldi",
          },
        ],
        riskFlags: [],
        trendNote: "",
        disclaimer: getDisclaimer(language),
      };
    }

    const result = analysisResponseSchema.parse(parsedResponse);

    logger.info("[Drawing Analysis] ✅ Analysis complete!");
    return result;
  } catch (error) {
    logger.error("[Drawing Analysis] ❌ Error:", error);
    throw new Error(
      `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export const analyzeDrawingProcedure = protectedProcedure
  .use(authenticatedAiRateLimit)
  .input(analysisInputSchema)
  .output(analysisResponseSchema)
  .mutation(async ({ input }) => {
    return analyzeDrawing(input);
  });
