import { useState } from "react";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

type ColoringStyle = "simple" | "detailed" | "educational";

// Comprehensive concern types based on ACEs (Adverse Childhood Experiences) and pediatric psychology
type ConcernType =
  // Original categories
  | 'war' | 'violence' | 'disaster' | 'loss' | 'loneliness' | 'fear' | 'abuse' | 'family_separation' | 'death'
  // ACEs Framework categories
  | 'neglect' | 'bullying' | 'domestic_violence_witness' | 'parental_addiction' | 'parental_mental_illness'
  // Pediatric psychology categories
  | 'medical_trauma' | 'anxiety' | 'depression' | 'low_self_esteem' | 'anger' | 'school_stress' | 'social_rejection'
  // Additional categories
  | 'displacement' | 'poverty' | 'cyberbullying'
  | 'other';

type ContentAnalysis = {
  hasConcerningContent: boolean;
  concernType: ConcernType | null;
  concernDescription?: string;
  therapeuticApproach?: string;
  therapeuticColoringTheme?: string;
};

type ColoringPageResult = {
  imageUrl: string;
  analysis: string;
  prompt: string;
  contentAnalysis?: ContentAnalysis | null;
};

export function useGenerateColoringPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coloringPage, setColoringPage] = useState<ColoringPageResult | null>(null);

  const generateMutation = trpc.studio.generateColoringFromDrawing.useMutation();

  const generate = async (
    imageBase64: string,
    options?: {
      style?: ColoringStyle;
      ageGroup?: number;
      description?: string;
    }
  ) => {
    try {
      setIsGenerating(true);
      setError(null);

      console.log("[useGenerateColoringPage] Starting generation...");

      const result = await generateMutation.mutateAsync({
        imageBase64: imageBase64,
        drawingDescription: options?.description,
        style: options?.style || "simple",
        ageGroup: options?.ageGroup || 5,
      });

      setColoringPage(result);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      console.log("[useGenerateColoringPage] Generation successful");
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Boyama sayfası oluşturulamadı";
      setError(message);
      console.error("[useGenerateColoringPage] Error:", err);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setColoringPage(null);
    setError(null);
  };

  return {
    generate,
    reset,
    isGenerating,
    error,
    coloringPage,
  };
}
