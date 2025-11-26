import { useState } from "react";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

type ColoringStyle = "simple" | "detailed" | "educational";

export function useGenerateColoringPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coloringPage, setColoringPage] = useState<{
    imageUrl: string;
    analysis: string;
    prompt: string;
  } | null>(null);

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
