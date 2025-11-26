import { publicProcedure } from "../../create-context";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateColoringInputSchema = z.object({
  imageBase64: z.string(),
  drawingDescription: z.string().optional(),
  style: z.enum(["simple", "detailed", "educational"]).default("simple"),
  ageGroup: z.number().min(2).max(12).default(5),
});

export const generateColoringFromDrawingProcedure = publicProcedure
  .input(generateColoringInputSchema)
  .mutation(async ({ input }: { input: z.infer<typeof generateColoringInputSchema> }) => {
    console.log("[Generate Coloring] Creating coloring page from child's drawing");

    try {
      // Önce çizimi analiz et
      const analysisResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Bu çocuk çizimini analiz et ve içindeki ana öğeleri, karakterleri ve temaları belirle.
                Çizimden esinlenilerek ${input.ageGroup} yaş grubuna uygun bir boyama sayfası için kısa bir tanım yaz.
                Tanım İngilizce olmalı ve boyama sayfası prompt'u için optimize edilmeli.
                Sadece tanımı yaz, başka bir şey ekleme.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${input.imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      });

      const drawingAnalysis = analysisResponse.choices[0]?.message?.content || "";
      console.log("[Generate Coloring] Drawing analysis:", drawingAnalysis);

      // Stil tanımları
      const stylePrompts = {
        simple: "simple black and white line art, thick outlines, minimal details, easy for young children to color",
        detailed: "detailed black and white line art, intricate patterns, suitable for older children",
        educational: "educational black and white line art with clear shapes, perfect for learning and coloring",
      };

      // DALL-E ile boyama sayfası oluştur
      const prompt = `Create a coloring page inspired by this description: ${drawingAnalysis}.
      Style: ${stylePrompts[input.style]}.
      The image should be a black and white line drawing, clean outlines, no shading, no text,
      perfect for children aged ${input.ageGroup} to color. White background, black lines only.`;

      console.log("[Generate Coloring] DALL-E prompt:", prompt);

      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "url",
      });

      const imageUrl = imageResponse.data[0]?.url;

      if (!imageUrl) {
        throw new Error("Failed to generate coloring page image");
      }

      console.log("[Generate Coloring] Successfully generated coloring page");

      return {
        imageUrl,
        analysis: drawingAnalysis,
        prompt: prompt,
      };
    } catch (error) {
      console.error("[Generate Coloring] Error:", error);
      throw error;
    }
  });
