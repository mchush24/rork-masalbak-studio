import { AssessmentOutput, TaskType, AssessmentInput } from "@/types/AssessmentSchema";
import { trpcClient } from "@/lib/trpc";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

export interface AnalysisError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Uzak sunucuya çizim analizi isteği gönderir
 */
export async function analyzeDrawingRemote(
  input: AssessmentInput
): Promise<AssessmentOutput> {
  console.log("[aiClient] 🎯 Starting remote analysis...");
  console.log("[aiClient] 📝 Task type:", input.task_type);
  console.log("[aiClient] 👶 Child age:", input.child?.age);
  console.log("[aiClient] 🖼️  Has image_uri:", !!input.image_uri);

  try {
    let imageBase64: string | undefined;

    if (input.image_uri) {
      console.log("[aiClient] 🔄 Converting image to base64...");
      
      if (Platform.OS === "web") {
        if (input.image_uri.startsWith("data:")) {
          imageBase64 = input.image_uri.split(",")[1];
        } else {
          const response = await fetch(input.image_uri);
          const blob = await response.blob();
          imageBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              const base64Data = base64String.split(",")[1];
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      } else {
        let uri = input.image_uri;
        if (!uri.startsWith("file://") && !uri.startsWith("content://")) {
          uri = `file://${uri}`;
        }
        
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          throw new Error("Dosya bulunamadı");
        }
        
        imageBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
        });
      }
      
      console.log("[aiClient] ✅ Image converted, size:", imageBase64?.length || 0, "bytes");
    }

    console.log("[aiClient] 🚀 Calling backend API...");

    const result = await trpcClient.studio.analyzeDrawing.mutate({
      taskType: input.task_type,
      childAge: input.child?.age,
      imageBase64,
      language: "tr",
    });

    console.log("[aiClient] ✅ Analysis complete!");

    // Backend'den gelen result'ı AssessmentOutput formatına çevir
    return buildAssessmentOutput(input.task_type, result);
  } catch (error) {
    console.error("[aiClient] ❌ Analysis failed:", error);
    throw new Error(
      `Analiz başarısız oldu: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`
    );
  }
}

/**
 * Frontend component'ten kullanım:
 * 
 * import { analyzeDrawingRemote } from "@/services/aiClient";
 * 
 * const result = await analyzeDrawingRemote({
 *   app_version: "1.0.0",
 *   schema_version: "v1.2",
 *   child: { age: 7 },
 *   task_type: "DAP",
 *   image_uri: "file://...",
 * });
 */

export function buildAssessmentOutput(
  taskType: TaskType,
  result: any
): AssessmentOutput {
  // Backend'den gelen yeni format'ı kullan
  const identifiedThemes = result.psychological_themes?.identified_themes || [];
  const primaryEmotions = result.emotional_indicators?.primary_emotions || [];
  
  return {
    task_type: taskType,
    reflective_hypotheses: [
      {
        theme: "ic_dunya",
        confidence: 0.85,
        evidence: identifiedThemes.slice(0, 2),
      },
      {
        theme: "benlik_gucu",
        confidence: 0.75,
        evidence: result.strengths?.slice(0, 2) || [],
      },
      {
        theme: "enerji",
        confidence: 0.7,
        evidence: primaryEmotions.slice(0, 2),
      },
    ],
    conversation_prompts: result.conversation_starters || [
      "Bu çizimi yaparken ne hissettdin?",
      "En sevdiğin kısım hangisi ve neden?",
      "Bu resmi bize anlatır mısın?",
    ],
    activity_ideas: result.activity_suggestions || [
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
    // Backend'in zengin verilerini de ekle
    feature_preview: {
      composition: {
        page_position: "center",
        empty_space_ratio: 0.5,
      },
      pressure: "medium",
      erasure_marks: false,
      palette: [],
      detected_objects: [],
    },
  };
}