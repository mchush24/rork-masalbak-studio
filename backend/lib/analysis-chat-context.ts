/**
 * Analysis Chat Context Engine
 *
 * Generates context-aware AI responses based on analysis content
 * - Uses analysis insights for relevant answers
 * - Age-appropriate language
 * - Parenting-focused guidance
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createLogger } from "./logger.js";

const log = createLogger("AnalysisChatContext");

// ============================================
// TYPES
// ============================================

export interface AnalysisChatInput {
  message: string;
  analysisResult: any;
  taskType: string;
  childAge?: number;
  childName?: string;
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  referencedInsightIndex?: number;
}

export interface AnalysisChatOutput {
  message: string;
  suggestedQuestions: string[];
  referencedInsightIndex?: number;
  source: "faq" | "ai" | "context";
  confidence?: number;
}

// ============================================
// REFLECTION PROMPTS
// ============================================

export const REFLECTION_PROMPTS = [
  {
    id: "observation",
    question: "Bu çizimde en çok dikkatinizi çeken detay ne oldu?",
    emoji: "🔍",
    category: "observation" as const,
  },
  {
    id: "feeling",
    question: "Çocuğunuz bu çizimi yaparken nasıl hissediyordu?",
    emoji: "💭",
    category: "emotional" as const,
  },
  {
    id: "recent",
    question: "Son günlerde çocuğunuzda fark ettiğiniz bir değişiklik var mı?",
    emoji: "📅",
    category: "developmental" as const,
  },
  {
    id: "action",
    question: "Bu analizden sonra denemek istediğiniz bir şey var mı?",
    emoji: "✨",
    category: "action" as const,
  },
  {
    id: "strength",
    question: "Çocuğunuzun en güçlü yönü sizce nedir?",
    emoji: "💪",
    category: "observation" as const,
  },
  {
    id: "communication",
    question: "Çocuğunuzla bu çizim hakkında konuştunuz mu?",
    emoji: "💬",
    category: "action" as const,
  },
];

// ============================================
// CONTEXT-AWARE FAQ MATCHING
// ============================================

interface ContextFAQ {
  keywords: string[];
  matchInsight?: boolean;
  response: string;
  followUps: string[];
}

const CONTEXT_FAQS: ContextFAQ[] = [
  {
    keywords: ["anlam", "ne demek", "anlamı", "açıkla"],
    response: `Bu analiz, çocuğunuzun çizimindeki unsurları psikolojik açıdan değerlendiriyor. {INSIGHT_SUMMARY}

Önemli: Bu bir ön değerlendirmedir ve kesin tanı yerine geçmez. Çocuğunuzun duygusal dünyasını anlamaya yardımcı bir araç olarak düşünün.`,
    followUps: [
      "Evde nasıl destekleyebilirim?",
      "Bu yaş için normal mi?",
      "Başka ne yapabilirim?",
    ],
  },
  {
    keywords: ["evde", "yapabilirim", "etkinlik", "aktivite", "destek"],
    response: `{HOME_TIPS}

Bu öneriler çocuğunuzun gelişimini desteklemek için tasarlandı. Her çocuk farklıdır, kendi tempolarına saygı gösterin.`,
    followUps: [
      "Ne kadar süre yapmalıyım?",
      "Hangi materyaller lazım?",
      "Her gün mü yapmalıyız?",
    ],
  },
  {
    keywords: ["endişe", "kork", "normal", "sorun", "problem"],
    response: `{RISK_ASSESSMENT}

Çocuk gelişiminde birçok değişiklik normaldir. Ancak sürekli endişe hissediyorsanız, bir çocuk psikoloğuyla görüşmek faydalı olabilir.`,
    followUps: [
      "Uzman desteği almalı mıyım?",
      "Beklersem geçer mi?",
      "Okulla konuşmalı mıyım?",
    ],
  },
  {
    keywords: ["yaş", "normal", "gelişim", "akran", "arkadaş"],
    response: `{childAge} yaş için değerlendirme: {AGE_ASSESSMENT}

Her çocuğun gelişim hızı farklıdır. Yaşıtlarıyla karşılaştırmak yerine kendi ilerlemesine odaklanın.`,
    followUps: [
      "Gelişimsel kilometre taşları neler?",
      "Akranlarından geri mi?",
      "Ne zaman endişelenmeliyim?",
    ],
  },
  {
    keywords: ["uzman", "doktor", "psikolog", "profesyonel", "danış"],
    response: `{PROFESSIONAL_GUIDANCE}

Profesyonel destek almak güçlülük işaretidir. Çocuğunuzun iyiliği için en doğru kararı veriyorsunuz.`,
    followUps: [
      "Hangi uzmanı seçmeliyim?",
      "İlk seansta ne olur?",
      "Ne kadar sürer?",
    ],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function hasAnthropicKey(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

function hasOpenAIKey(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

function matchContextFAQ(message: string): ContextFAQ | null {
  const normalizedMessage = message.toLowerCase().replace(/[?!.,]/g, "");

  for (const faq of CONTEXT_FAQS) {
    const matchCount = faq.keywords.filter((kw) =>
      normalizedMessage.includes(kw.toLowerCase())
    ).length;

    if (matchCount >= 1) {
      return faq;
    }
  }

  return null;
}

function buildContextResponse(
  faq: ContextFAQ,
  analysisResult: any,
  childAge?: number
): string {
  let response = faq.response;

  // Replace placeholders with actual analysis content
  const insights = analysisResult.insights || [];
  const homeTips = analysisResult.homeTips || [];
  const riskFlags = analysisResult.riskFlags || [];
  const meta = analysisResult.meta || {};

  // {INSIGHT_SUMMARY}
  if (response.includes("{INSIGHT_SUMMARY}")) {
    const insightSummary = insights
      .slice(0, 3)
      .map((i: any) => `• ${i.title}: ${i.summary}`)
      .join("\n");
    response = response.replace(
      "{INSIGHT_SUMMARY}",
      insightSummary || "Analiz detayları mevcut değil."
    );
  }

  // {HOME_TIPS}
  if (response.includes("{HOME_TIPS}")) {
    const tipsText = homeTips
      .slice(0, 3)
      .map((tip: any) => {
        const steps = tip.steps?.slice(0, 2).join(", ") || "";
        return `**${tip.title}**\n${steps}`;
      })
      .join("\n\n");
    response = response.replace(
      "{HOME_TIPS}",
      tipsText || "Şu an için özel bir öneri bulunmuyor."
    );
  }

  // {RISK_ASSESSMENT}
  if (response.includes("{RISK_ASSESSMENT}")) {
    if (riskFlags.length > 0) {
      const riskText = riskFlags
        .map((r: any) => `⚠️ ${r.summary}`)
        .join("\n");
      response = response.replace("{RISK_ASSESSMENT}", riskText);
    } else {
      response = response.replace(
        "{RISK_ASSESSMENT}",
        "Bu analizde özel bir endişe tespit edilmedi. Genel gözlemler normal sınırlar içinde görünüyor."
      );
    }
  }

  // {AGE_ASSESSMENT}
  if (response.includes("{AGE_ASSESSMENT}")) {
    const confidence = meta.confidence || 0.7;
    const uncertaintyLevel = meta.uncertaintyLevel || "mid";

    let ageText = "";
    if (uncertaintyLevel === "low") {
      ageText =
        "Çizim özellikleri yaşa uygun gelişim göstergeleri içeriyor.";
    } else if (uncertaintyLevel === "mid") {
      ageText =
        "Bazı özellikler yaşa uygun, bazıları daha fazla gözlem gerektirebilir.";
    } else {
      ageText =
        "Kesin değerlendirme için daha fazla bilgi gerekli. Bir uzmanla görüşmeniz önerilir.";
    }
    response = response.replace("{AGE_ASSESSMENT}", ageText);
  }

  // {PROFESSIONAL_GUIDANCE}
  if (response.includes("{PROFESSIONAL_GUIDANCE}")) {
    const guidance = analysisResult.professionalGuidance;
    if (guidance && guidance.whenToSeek?.length > 0) {
      const guidanceText = guidance.whenToSeek
        .slice(0, 2)
        .map((w: string) => `• ${w}`)
        .join("\n");
      response = response.replace(
        "{PROFESSIONAL_GUIDANCE}",
        `Şu durumlarda profesyonel destek önerilir:\n${guidanceText}`
      );
    } else {
      response = response.replace(
        "{PROFESSIONAL_GUIDANCE}",
        "Sürekli endişe hissediyorsanız veya çocuğunuzun davranışlarında belirgin değişiklikler gözlemliyorsanız, bir çocuk psikoloğuna danışmanız faydalı olabilir."
      );
    }
  }

  // {childAge}
  response = response.replace("{childAge}", String(childAge || "Bilinmiyor"));

  return response;
}

// ============================================
// AI RESPONSE GENERATION
// ============================================

async function generateAIResponse(
  input: AnalysisChatInput
): Promise<{ message: string; suggestedQuestions: string[] }> {
  const systemPrompt = buildSystemPrompt(input);
  const conversationMessages = input.conversationHistory.slice(-10).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Try Anthropic first, then OpenAI
  if (hasAnthropicKey()) {
    try {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 800,
        system: systemPrompt,
        messages: [
          ...conversationMessages,
          { role: "user", content: input.message },
        ],
      });

      const textContent = response.content[0];
      if (textContent.type === "text") {
        return parseAIResponse(textContent.text);
      }
    } catch (error) {
      log.error("[generateAIResponse] Anthropic error:", error);
    }
  }

  if (hasOpenAIKey()) {
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 800,
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationMessages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user", content: input.message },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        return parseAIResponse(content);
      }
    } catch (error) {
      log.error("[generateAIResponse] OpenAI error:", error);
    }
  }

  // Fallback response
  return {
    message:
      "Şu an yanıt oluşturamıyorum. Lütfen daha sonra tekrar deneyin veya başka bir soru sorun.",
    suggestedQuestions: [
      "Bu analiz ne anlama geliyor?",
      "Evde ne yapabilirim?",
    ],
  };
}

function buildSystemPrompt(input: AnalysisChatInput): string {
  const { analysisResult, taskType, childAge, childName } = input;
  const insights = analysisResult.insights || [];
  const homeTips = analysisResult.homeTips || [];
  const riskFlags = analysisResult.riskFlags || [];

  const insightsSummary = insights
    .map((i: any, idx: number) => `${idx + 1}. ${i.title}: ${i.summary}`)
    .join("\n");

  const tipsSummary = homeTips
    .map((t: any) => `- ${t.title}`)
    .join("\n");

  const riskSummary = riskFlags.length > 0
    ? riskFlags.map((r: any) => `- ${r.type}: ${r.summary}`).join("\n")
    : "Risk bayrakları tespit edilmedi.";

  return `Sen RenkiOO uygulamasının yardımcı asistanı Ioo'sun. Bir ebeveynle çocuğunun çizim analizi hakkında sohbet ediyorsun.

## ANALİZ BİLGİLERİ
Test Türü: ${taskType}
Çocuk Yaşı: ${childAge || "Belirtilmemiş"}
Çocuk Adı: ${childName || "Belirtilmemiş"}

### GÖZLEMLER (Insights)
${insightsSummary || "Gözlem yok"}

### ÖNERİLER (Home Tips)
${tipsSummary || "Öneri yok"}

### RİSK DEĞERLENDİRMESİ
${riskSummary}

## TALİMATLAR
1. Her zaman Türkçe yanıt ver
2. Sıcak, anlayışlı ve destekleyici ol
3. Analiz içeriğine dayalı yanıtlar ver
4. Kesin tanı koyma, bunun bir ön değerlendirme olduğunu hatırlat
5. Endişe verici durumlar için profesyonel destek öner
6. ${childAge ? `${childAge} yaş` : "Çocuk"} için uygun dil kullan
7. Her yanıtın sonuna 2-3 takip sorusu öner (JSON formatında değil, düz metin olarak)
8. Aşırı teknik terimlerden kaçın
9. Ebeveynin duygularını anlayışla karşıla

## YANIT FORMATI
Önce soruya cevap ver, sonra şu formatla öneriler ekle:
---
Önerilen Sorular:
• [Soru 1]
• [Soru 2]
• [Soru 3]`;
}

function parseAIResponse(text: string): {
  message: string;
  suggestedQuestions: string[];
} {
  const parts = text.split("---");
  const mainMessage = parts[0].trim();

  const suggestedQuestions: string[] = [];

  if (parts.length > 1) {
    const suggestionsText = parts[1];
    const lines = suggestionsText.split("\n");
    for (const line of lines) {
      const cleaned = line.replace(/^[•\-\*]\s*/, "").trim();
      if (
        cleaned.length > 5 &&
        cleaned.includes("?") &&
        !cleaned.toLowerCase().includes("önerilen")
      ) {
        suggestedQuestions.push(cleaned);
      }
    }
  }

  // Default suggestions if none parsed
  if (suggestedQuestions.length === 0) {
    suggestedQuestions.push(
      "Başka bir konuda yardımcı olabilir miyim?",
      "Evde uygulanabilecek aktiviteler neler?"
    );
  }

  return {
    message: mainMessage,
    suggestedQuestions: suggestedQuestions.slice(0, 3),
  };
}

// ============================================
// MAIN EXPORT
// ============================================

export async function generateAnalysisChatResponse(
  input: AnalysisChatInput
): Promise<AnalysisChatOutput> {
  log.info("[generateAnalysisChatResponse] Processing message");

  // Try context FAQ matching first
  const contextFAQ = matchContextFAQ(input.message);

  if (contextFAQ) {
    log.info("[generateAnalysisChatResponse] Matched context FAQ");

    const response = buildContextResponse(
      contextFAQ,
      input.analysisResult,
      input.childAge
    );

    return {
      message: response,
      suggestedQuestions: contextFAQ.followUps,
      source: "context",
      confidence: 0.85,
    };
  }

  // Fall back to AI generation
  log.info("[generateAnalysisChatResponse] Using AI generation");

  const aiResponse = await generateAIResponse(input);

  return {
    message: aiResponse.message,
    suggestedQuestions: aiResponse.suggestedQuestions,
    source: "ai",
    confidence: 0.7,
    referencedInsightIndex: input.referencedInsightIndex,
  };
}
