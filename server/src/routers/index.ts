import { router, publicProcedure } from "../trpc";
import { z } from "zod";
import { analyzeDrawingWithOpenAI } from "../services/openaiClient";

export const appRouter = router({
  analyzeDrawing: publicProcedure
    .input(
      z.object({
        taskType: z.string(),
        childAge: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log("[Router] Received analysis request:", input);

        // 🎯 İYİLEŞTİRİLMİŞ PROMPT - Daha detaylı ve psikoloji odaklı
        const prompt = `
# Çocuk Çizimi Analizi - Profesyonel Değerlendirme

Sen deneyimli bir çocuk gelişim psikoloğu ve sanat terapistisin. Çocuğun çizimini bilimsel ve empatik bir şekilde analiz ediyorsun.

## Bağlam
- **Görev Türü:** ${input.taskType}
- **Çocuk Yaşı:** ${input.childAge || "bilinmiyor"}

## Analiz Kriterleri

Lütfen aşağıdaki alanlarda derinlemesine bir analiz yap:

### 1. 🎨 Görsel Öğeler ve Teknik
- Kullanılan renkler ve bunların psikolojik anlamları
- Çizim stilleri (serbest, kontrollü, kaotik, vs)
- Sayfa kullanımı ve alan dağılımı
- Basınç ve çizgi özellikleri

### 2. 💭 Duygusal ve Psikolojik İçgörüler
- Çizimde yansıtılan temel duygular
- Olası iç dünya ve kendini ifade etme biçimi
- Yaşadığı olası kaygılar veya stres göstergeleri
- Yaratıcılık ve problem çözme beceri göstergeleri

### 3. 💪 Güçlü Taraflar ve Olumlu Göstergeler
- Çocuğun güçlü yönleri ve yetenekleri
- Olumlu emosyonel durumlar
- Kendine güven göstergeleri

### 4. 👨‍👩‍👧 Ebeveynler İçin Pratik Öneriler
- Çocuğu desteklemek için yapılabilecekler
- Dikkat edilmesi gereken noktalar
- Gelişim için teşvik yöntemleri
- Ne zaman profesyonel yardım almak gerekebileceği

### 5. 💬 Çocukla Konuşma Başlangıçları
- Açık uçlu sorular (çocuğun kendini ifade etmesini teşvik eden)
- Farkındalığı artıran sorular
- Duygusal bağlantı kuran sorular

---

## Çıktı Formatı

**ÖNEMLİ:** Cevabını TAMAMEN bu JSON formatında ver. Başka metni ekleme:

\`\`\`json
{
  "title": "Çizim Başlığı (en önemli bulduğun tema)",
  "description": "Genel analiz özeti (2-3 cümle)",
  "emotions": ["duygu1", "duygu2", "duygu3"],
  "themes": ["tema1", "tema2", "tema3"],
  "insights": "Derinlemesine psikolojik içgörü (2-3 paragraf, çocuğun iç dünyası hakkında neler öğreniyoruz)",
  "encouragement": "Çocuk ve aile için pozitif, destekleyici ve yapıcı mesaj (2-3 cümle)"
}
\`\`\`

---

## Önemli Notlar
- Analiz yapıcı, supportif ve gelişim odaklı olmalı
- Çocuğu damgalamaktan kaçın, potansiyelini vurgula
- Bilimsel çerçevede kal ama anlaşılır olun
- Ebeveynlere endişe vermeyen, fakat dikkate değer bulguları paylaş
        `;

        // OpenAI'ye çağrı yap (API key backend'de güvenli)
        const analysis = await analyzeDrawingWithOpenAI(prompt, 2000);

        console.log("[Router] Raw OpenAI response:", analysis.slice(0, 100));

        // JSON parse et
        let parsed: any = {};
        try {
          const jsonMatch = analysis.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("JSON not found in response");
          }
        } catch (parseErr) {
          console.error("[Router] JSON parse error:", parseErr);
          // Fallback
          parsed = {
            title: "Çizim Analizi",
            description: analysis,
            emotions: ["yaratıcılık", "özgürlük", "kendini ifade etme"],
            themes: ["kendini ifade", "gelişim", "yaratıcılık"],
            insights: analysis,
            encouragement: "Çok güzel bir çizim yaptın! Duygularını bu şekilde paylaştığın için teşekkürler. Senin hayal gücün ve yaratıcılığın çok değerli.",
          };
        }

        console.log("[Router] Parsed analysis:", parsed);

        return {
          title: parsed.title || "Çizim Analizi",
          description: parsed.description || analysis,
          emotions: Array.isArray(parsed.emotions) ? parsed.emotions : [],
          themes: Array.isArray(parsed.themes) ? parsed.themes : [],
          insights: parsed.insights || analysis,
          encouragement: parsed.encouragement || "Harika bir çizim! Seni çok seviyor ve destekliyoruz.",
        };
      } catch (error) {
        console.error("[Router] Analysis error:", error);
        throw new Error(
          `Backend analiz hatası: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`
        );
      }
    }),
});

export type AppRouter = typeof appRouter;