import { AssessmentInput, AssessmentOutput } from "@/types/AssessmentSchema";
import { trpc } from "@/lib/trpc";

export async function analyzeDrawingRemote(payload: AssessmentInput): Promise<AssessmentOutput> {
  try {
    console.log("[AIClient] Sending to backend for analysis...");

    // Backend tRPC endpoint'ine çağrı yap
    const result = await trpc.analyzeDrawing.mutate({
      taskType: payload.task_type,
      childAge: payload.child.age,
    });

    console.log("[AIClient] Backend response:", result);

    // Backend'den gelen sonucu AssessmentOutput formatına dönüştür
    const assessmentOutput: AssessmentOutput = {
      task_type: payload.task_type,
      reflective_hypotheses: [
        {
          theme: "kendini_ifade",
          confidence: 0.85,
          evidence: [result.insights],
        },
        {
          theme: "ic_dunya",
          confidence: 0.7,
          evidence: result.emotions,
        },
      ],
      conversation_prompts: [
        "Bu çizimi yaparken ne hissettdin?",
        "En sevdiğin kısım hangisi ve neden?",
        "Bu resmi bize anlatır mısın?",
        "Başka neler çizmek isterdin?",
      ],
      activity_ideas: [
        "Birlikte renkli bir resim çizin",
        "Çizdiği şeyi hikaye olarak yazın",
        "Çizimin hakkında konuşun ve dinleyin",
      ],
      safety_flags: {
        self_harm: false,
        abuse_concern: false,
      },
      disclaimers: [
        "Bu analiz yapay zeka tarafından oluşturulmuştur.",
        "Profesyonel psikolojik değerlendirme yerine geçmez.",
        "Endişeniz varsa lütfen bir profesyonal terapiste danışınız.",
      ],
    };

    console.log("[AIClient] Analysis complete");
    return assessmentOutput;
  } catch (error) {
    console.error("[AIClient] Analysis failed:", error);
    throw new Error(
      `Çizim analiz edilirken hata oluştu: ${
        error instanceof Error ? error.message : "Bilinmeyen hata"
      }`
    );
  }
}