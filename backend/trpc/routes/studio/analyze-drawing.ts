import { publicProcedure } from "../../create-context";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analysisInputSchema = z.object({
  taskType: z.string(),
  childAge: z.number().optional(),
  imageBase64: z.string().optional(),
  language: z.enum(["tr", "en"]).optional().default("tr"),
});

const analysisResponseSchema = z.object({
  title: z.string(),
  summary: z.string(),
  developmental_stage: z.object({
    age_appropriateness: z.string(),
    motor_skills: z.string(),
    cognitive_development: z.string(),
  }),
  visual_elements: z.object({
    colors: z.string(),
    composition: z.string(),
    figures: z.string(),
    details: z.string(),
  }),
  emotional_indicators: z.object({
    primary_emotions: z.array(z.string()),
    emotional_tone: z.string(),
    self_expression: z.string(),
  }),
  psychological_themes: z.object({
    identified_themes: z.array(z.string()),
    family_dynamics: z.string().optional(),
    social_connections: z.string().optional(),
    inner_world: z.string(),
  }),
  strengths: z.array(z.string()),
  areas_for_support: z.array(z.string()),
  conversation_starters: z.array(z.string()),
  activity_suggestions: z.array(z.string()),
  interpretation_notes: z.string(),
});

export type AnalysisInput = z.infer<typeof analysisInputSchema>;
export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;

// Exported for testing
export async function analyzeDrawing(input: AnalysisInput, openaiClient = openai): Promise<AnalysisResponse> {
  console.log("[Drawing Analysis] 🎯 Starting analysis");
  console.log("[Drawing Analysis] 📝 Task type:", input.taskType);
  console.log("[Drawing Analysis] 👶 Child age:", input.childAge);
  console.log("[Drawing Analysis] 🖼️  Has image:", !!input.imageBase64);

  try {
    const language = input.language || "tr";

    const promptText = language === "tr"
      ? `Sen deneyimli bir çocuk gelişimi uzmanısın. Çocukların çizimlerini Piaget, Erikson ve Lowenfeld'in gelişim teorileri ışığında değerlendiriyorsun, ancak ailelerle konuşurken sıcak, samimi ve anlaşılır bir dil kullanıyorsun.

${input.childAge ? `Bu çizim ${input.childAge} yaşında bir çocuğa ait.` : 'Çocuğun yaşı belirtilmemiş.'}

ÖNEMLİ: Verilen görseli DİKKATLİCE incele. Resimde GERÇEKTEN ne olduğunu yaz - hayal etme veya varsayımda bulunma! Resimde gördüklerini SPESİFİK olarak belirt: hangi renkler VAR, hangi figürler ÇİZİLMİŞ, ne tür nesneler GÖRÜNÜYOR. Eğer askeri temalı, savaş, silah gibi unsurlar varsa bunları doğrudan belirt. Eğer hayvan, insan, bina varsa onları söyle. Gerçekte olmayan şeyler yazma!

YAKLAŞIMIN:
- Ebeveynlerle sanki yüz yüze sohbet ediyormuşsun gibi doğal, destekleyici bir üslup kullan
- Teknik terimleri sade Türkçe ile açıkla, jargondan kaçın
- Her zaman önce güçlü yönleri vurgula, sonra gelişim fırsatlarını nezaketle belirt
- Gözlemleri somut örneklerle destekle
- Önerileri dayatma gibi değil, seçenek olarak sun

ANALİZ KRİTERLERİN:

1. GELİŞİM DEĞERLENDİRMESİ:
   - Motor becerileri: Kalem tutuşu, çizgi kontrolü, detay yapabilme becerisi
   - Bilişsel gelişim: Sembolleri kullanma, hikaye kurma, perspektif anlayışı
   - Yaşa uygunluk: Bu yaş için beklenen özelliklerle kıyaslama

2. GÖRSEL ÖĞELER:
   - Renkler: Hangi renkleri seçmiş? Canlılık, çeşitlilik, duygusal anlamlar
   - Kompozisyon: Sayfayı nasıl kullanmış? Figürlerin yerleşimi, boşluk dengesi
   - Figürler: İnsan, hayvan, nesne çizimleri - detay düzeyi ve özellikler
   - Dikkat çeken detaylar: Tekrarlayan öğeler, özel semboller, ilginç unsurlar

3. DUYGUSAL İZLER:
   - Baskın duygular: Neşe, merak, heyecan, sakinlik gibi hissiyatlar
   - Genel hava: Çizimin enerjisi, açıklığı, sıcaklığı
   - İfade tarzı: Cesur mu, çekingen mi, özgün mü?

4. İÇ DÜNYA VE TEMALAR:
   - Ana konular: Aile, arkadaşlık, doğa, hayal gücü, macera
   - Aile dinamikleri: Varsa figür boyutları, yakınlıklar gibi ipuçları
   - Sosyal bağlantılar: Varsa arkadaşlık, okul gibi sosyal işaretler
   - Hayal dünyası: İlgi alanları, meraklar, hayaller

YANIT FORMATI (SADECE JSON):
{
  "title": "Kısa, pozitif, çarpıcı bir başlık (ör: 'Renklerin Dansı', 'Cesur Çizgiler', 'Masalsı Bir Dünya')",
  "summary": "Çizimin ilk izlenimini 2-3 cümlede özetle. Sanki ebeveynle sohbet ediyormuşsun gibi doğal, sıcak bir dil kullan. En dikkat çekici özelliği vurgula.",
  "developmental_stage": {
    "age_appropriateness": "Bu yaş için beklenen gelişim özellikleriyle karşılaştır. Samimi ve destekleyici bir dille, 3-4 cümle ile anlat. Ne güzel, ne de gelişmesi gerekiyor?",
    "motor_skills": "Kalem kontrolü, çizgilerdeki güven, detay yapabilme gibi motor becerileri gözlemle. Doğal bir dille, 2-3 cümle ile değerlendir.",
    "cognitive_development": "Hikaye kurma, sembol kullanma, perspektif anlayışı gibi bilişsel yetenekleri sade Türkçe ile açıkla. 2-3 cümle yeterli."
  },
  "visual_elements": {
    "colors": "Hangi renkleri kullanmış? Canlı mı, yumuşak mu? Bu renkler ne anlatıyor olabilir? Merakla ve ilgiyle 3-4 cümle ile yaz.",
    "composition": "Sayfayı nasıl kullanmış? Figürler nerede duruyor? Dengeli mi, dinamik mi? 2-3 cümle ile açıkla.",
    "figures": "Neler çizmiş? İnsanlar, hayvanlar, nesneler... Detay düzeyi nasıl? Bunları nasıl yorumluyorsun? 3-4 cümle yeterli.",
    "details": "Dikkatini çeken özel detaylar var mı? Tekrarlayan unsurlar, ilginç semboller, anlamlı öğeler? 2-3 cümle ile paylaş."
  },
  "emotional_indicators": {
    "primary_emotions": ["en fazla 3-4 duygu: neşe, merak, heyecan, sakinlik gibi"],
    "emotional_tone": "Çizimin genel havası, enerjisi nasıl? Neşeli mi, sakin mi, hareketli mi? 3-4 cümle ile hislerini aktar.",
    "self_expression": "Çocuk kendini rahatça ifade edebilmiş mi? Cesur mu, çekingen mi, özgün mü? 2-3 cümle yeterli."
  },
  "psychological_themes": {
    "identified_themes": ["en fazla 3-4 tema: aile, arkadaşlık, doğa, hayal gücü gibi"],
    "family_dynamics": "Ailesiyle ilgili ipuçları varsa samimiyetle paylaş (2-3 cümle), yoksa boş bırak",
    "social_connections": "Arkadaşlık, sosyal hayatla ilgili işaretler varsa belirt (2-3 cümle), yoksa boş bırak",
    "inner_world": "Çocuğun hayal dünyasından, meraklarından, ilgi alanlarından ne anlıyorsun? 3-4 cümle ile paylaş."
  },
  "strengths": [
    "Çocuğun bu çizimdeki 3-4 güçlü yönünü somut ve içten bir şekilde yaz",
    "Her madde kısa ama özgün olsun",
    "Gerçek gözlemlerden yola çık, övgü dolu ama samimi kal"
  ],
  "areas_for_support": [
    "Ebeveynlere 2-3 yumuşak, uygulanabilir öneri sun",
    "'Deneyebilirsiniz', 'faydalı olabilir' gibi esnek ifadeler kullan",
    "Yargılamadan, destekleyici bir dille yaz"
  ],
  "conversation_starters": [
    "Çocukla sohbet başlatmak için 3-4 açık uçlu soru öner",
    "Merak uyandıran, düşündüren sorular olsun",
    "Cevap vermeyi eğlenceli hale getirsin"
  ],
  "activity_suggestions": [
    "Yaşına uygun 3-4 pratik aktivite öner",
    "Eğlenceli, kolay uygulanabilir şeyler olsun",
    "Gelişimini desteklesin ama zorlayıcı olmasın"
  ],
  "interpretation_notes": "Son bir paragrafta (3-5 cümle) ebeveynlere şunu hatırlat: Her çocuk benzersiz, her çizim bir anlık fotoğraf. Uzun vadeli gözlem önemli. Endişeleri varsa profesyonel destek alabilirler, ama öncelikle çocuklarının bu güzel ifadesinin keyfini çıkarsınlar."
}

UNUTMA:
- TAMAMEN TÜRKÇE yaz, tek bir İngilizce kelime kullanma
- Doğal, akıcı, samimi bir dil kullan - sanki arkadaşına anlatıyormuşsun gibi
- Teknik terimlerden kaçın, sade anlat
- Pozitif ol ama gerçekçi ve dürüst kal
- Somut gözlemlerle destekle
- Sadece JSON formatında yanıt ver, başka hiçbir şey ekleme`
      : `You are an expert child psychologist. Analyze this child's drawing in detail.

IMPORTANT: Your entire response must be in English only. Do not use any Turkish words.

Task: ${input.taskType}
Age: ${input.childAge || "unknown"}

Analyze the drawing and provide your response ONLY in JSON format:
{
  "title": "Brief title (English)",
  "insights": "Detailed psychological insights and observations (English, minimum 3-5 sentences)",
  "emotions": ["emotion1", "emotion2", "emotion3"],
  "themes": ["theme1", "theme2", "theme3"]
}

REMINDER: All text in title, insights, emotions, and themes must be COMPLETELY in English.`;

    const messageContent: OpenAI.Chat.ChatCompletionContentPart[] = [
      { type: "text", text: promptText }
    ];

    // Add image if provided
    if (input.imageBase64) {
      console.log("[Drawing Analysis] 🖼️ Adding image to request...");
      messageContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${input.imageBase64}`,
        },
      });
    }

    console.log("[Drawing Analysis] 🤖 Calling OpenAI API...");

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are an experienced clinical child psychologist with 20 years of experience analyzing children's drawings and providing guidance to families. You provide detailed, empathetic, and actionable insights based on developmental psychology theories.",
        },
        {
          role: "user",
          content: messageContent,
        },
      ],
    });

    const responseText = completion.choices[0]?.message?.content || "";

    console.log("[Drawing Analysis] 📝 Response received, length:", responseText.length);

    let parsedResponse;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      parsedResponse = JSON.parse(jsonString);
      console.log("[Drawing Analysis] 🔍 Parsed response keys:", Object.keys(parsedResponse));
      console.log("[Drawing Analysis] 📦 Parsed response:", JSON.stringify(parsedResponse, null, 2));
    } catch (parseErr) {
      console.error("[Drawing Analysis] ⚠️ JSON parse error:", parseErr);
      console.error("[Drawing Analysis] 📄 Raw response:", responseText);
      parsedResponse = {
        title: "Çizim Analizi",
        summary: responseText || "Analiz tamamlandı. Yanıt beklenmeyen formatta geldi.",
        developmental_stage: {
          age_appropriateness: "Analiz tamamlanamadı - lütfen tekrar deneyin.",
          motor_skills: "Detay elde edilemedi.",
          cognitive_development: "Detay elde edilemedi.",
        },
        visual_elements: {
          colors: "Renk analizi yapılamadı.",
          composition: "Kompozisyon analizi yapılamadı.",
          figures: "Figür analizi yapılamadı.",
          details: "Detay analizi yapılamadı.",
        },
        emotional_indicators: {
          primary_emotions: ["meraklı", "yaratıcı", "enerjik"],
          emotional_tone: "Duygusal ton analizi yapılamadı.",
          self_expression: "İfade analizi yapılamadı.",
        },
        psychological_themes: {
          identified_themes: ["hayal gücü", "özgür ifade", "kendini keşfetme"],
          inner_world: "İç dünya analizi yapılamadı.",
        },
        strengths: ["Yaratıcılık", "Hayal gücü", "Özgün ifade"],
        areas_for_support: ["Lütfen analizi tekrar deneyin"],
        conversation_starters: ["Bu çizimde ne düşündün?", "Neler hissettin çizerken?"],
        activity_suggestions: ["Farklı malzemelerle çizim yapmayı deneyin"],
        interpretation_notes: "Analiz beklenmeyen bir formatta döndü. Lütfen tekrar deneyin veya destek ekibiyle iletişime geçin.",
      };
    }

    const result = analysisResponseSchema.parse(parsedResponse);

    console.log("[Drawing Analysis] ✅ Analysis complete!");
    return result;
  } catch (error) {
    console.error("[Drawing Analysis] ❌ Error:", error);
    throw new Error(
      `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export const analyzeDrawingProcedure = publicProcedure
  .input(analysisInputSchema)
  .output(analysisResponseSchema)
  .mutation(async ({ input }) => {
    return analyzeDrawing(input);
  });
