import { AssessmentInput, AssessmentOutput } from "@/types/AssessmentSchema";

export async function analyzeDrawingMock(input: AssessmentInput): Promise<AssessmentOutput> {
  const isKaktus = input.task_type === "Kaktus";
  const base: AssessmentOutput = {
    task_type: input.task_type,
    reflective_hypotheses: [
      {
        theme: isKaktus ? "savunma" : "yakınlık_ozlemi",
        confidence: 0.62,
        evidence: isKaktus ? ["diken yoğun", "tek nesne baskın"] : ["figür küçük", "sayfa kenarı"],
      },
      {
        theme: isKaktus ? "agresyon" : "kaygi",
        confidence: 0.48,
        evidence: ["baskı yüksek", "silgi izleri"],
      },
    ],
    conversation_prompts: [
      "Resimdeki kişiler/nesneler neler yapıyor olabilir?",
      "Bu çizimde en çok neyi seviyorsun?",
      "Buradaki güneş/bitki olduğunda nasıl hissediyorsun?",
    ],
    activity_ideas: [
      "Aynı sahneyi daha büyük kâğıda tekrar çizmeyi deneyelim.",
      "İki nesne/kişi arasına bir yol/köprü ekle.",
      "Renk paletine bir yeni renk ekleyerek yeniden çiz.",
    ],
    safety_flags: { self_harm: false, abuse_concern: false },
    disclaimers: [
      "Bu içerik eğitsel amaçlıdır; klinik teşhis yerine geçmez.",
      "Güvenlik şüphesi varsa okul psikolojik danışmanı/uzmana başvurun.",
    ],
    feature_preview: input.vision_features,
  };

  return new Promise((resolve) => setTimeout(() => resolve(base), 800));
}
