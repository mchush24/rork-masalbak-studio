import { AssessmentOutput, TaskType } from "@/types/AssessmentSchema";

export interface AnalysisError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Frontend component'ten kullanım:
 * 
 * import { useAnalyzeDrawing } from "@/lib/hooks/useAnalyzeDrawing";
 * 
 * export function AnalyzeScreen() {
 *   const { analysis, error, isLoading, analyze } = useAnalyzeDrawing();
 * 
 *   const handleAnalyze = () => {
 *     analyze({ taskType: "drawing", childAge: 6 });
 *   };
 * 
 *   return (
 *     <View>
 *       <Button 
 *         onPress={handleAnalyze} 
 *         disabled={isLoading}
 *         title={isLoading ? "Analiz ediliyor..." : "Analiz Et"}
 *       />
 *       {error && <Text>{error}</Text>}
 *       {analysis && <AnalysisResult data={analysis} />}
 *     </View>
 *   );
 * }
 */

export function buildAssessmentOutput(
  taskType: TaskType,
  result: any
): AssessmentOutput {
  return {
    task_type: taskType,
    reflective_hypotheses: [
      {
        theme: "benlik_gucu",
        confidence: 0.85,
        evidence: [result.insights],
      },
      {
        theme: "ic_dunya",
        confidence: 0.7,
        evidence: result.emotions || [],
      },
      {
        theme: "enerji",
        confidence: 0.75,
        evidence: result.themes || [],
      },
    ],
    conversation_prompts: [
      "Bu çizimi yaparken ne hissettdin?",
      "En sevdiğin kısım hangisi ve neden?",
      "Bu resmi bize anlatır mısın?",
      "Başka neler çizmek isterdin?",
      "Hangi renkler seçtin ve neden?",
    ],
    activity_ideas: [
      "Birlikte renkli bir resim çizin",
      "Çizdiği şeyi hikaye olarak yazın",
      "Çizimin hakkında konuşun ve dinleyin",
      "Çizimi farklı malzemeler (boya, pastel) ile tekrarla",
      "Çizimin devamını çizmeyi dene",
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
}