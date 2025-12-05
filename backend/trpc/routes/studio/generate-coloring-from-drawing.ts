import { publicProcedure } from "../../create-context";
import { z } from "zod";
import OpenAI from "openai";
import * as fal from "@fal-ai/serverless-client";

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

fal.config({
  credentials: process.env.FAL_API_KEY,
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
    console.log("[Generate Coloring] 🎨 Creating coloring page from child's drawing");
    console.log("[Generate Coloring] Age group:", input.ageGroup, "| Style:", input.style);

    try {
      // Step 1: Analyze the drawing with GPT-4 Vision
      console.log("[Generate Coloring] 📸 Analyzing drawing with GPT-4 Vision...");
      const analysisResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Look at this drawing. Identify the ONE biggest, simplest object only.

For a ${input.ageGroup}-year-old toddler, describe in 5-8 words:
- ONLY ONE big simple shape (like: "a big round sun", "one happy cat")
- ULTRA SIMPLE language
- ONE object only, nothing else

Output in English, max 8 words total.`,
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
        max_tokens: 30,  // Ultra short description (max 8 words)
      });

      const drawingAnalysis = analysisResponse.choices[0]?.message?.content || "";
      console.log("[Generate Coloring] ✅ Analysis:", drawingAnalysis);

      // Step 2: Generate colorful illustration with Flux 2.0
      console.log("[Generate Coloring] 🚀 Generating colorful image with Flux 2.0...");

      // EXTREME SIMPLICITY - Like a baby's first coloring book!
      const styleDescriptions = {
        simple: `Baby's first coloring book: ONE GIANT simple shape, HUGE thick outlines,
                 solid flat colors, NO details at all, ages 2-3`,

        detailed: `Toddler coloring book: 1-2 big simple shapes, thick outlines,
                   flat colors, minimal details, ages 3-5`,

        educational: `Preschool coloring: 2-3 basic geometric shapes, clear lines,
                      primary colors only, ages 4-5`,
      };

      const flux2Prompt = `${drawingAnalysis}

BABY COLORING BOOK STYLE:
- ${styleDescriptions[input.style]}
- Maximum 1-2 objects ONLY
- GIANT simple shapes (think: circle, square, triangle level)
- SOLID FLAT COLORS (like paint by number, NOT photographs)
- ULTRA THICK black outlines (like comic book ink)
- Plain white empty background
- ZERO textures, ZERO gradients, ZERO shading
- NO small details whatsoever
- Think: "baby board book illustration"
- For ${input.ageGroup} year old babies/toddlers
- Style: Fisher-Price plastic toy simplicity`;

      console.log("[Generate Coloring] 📝 Flux 2.0 prompt:", flux2Prompt.substring(0, 100) + "...");

      const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
        input: {
          prompt: flux2Prompt,
          num_images: 1,
          image_size: "square_hd", // 1024x1024
          enable_safety_checker: true,
          safety_tolerance: "2",
          num_inference_steps: 28,
        },
        logs: true,
      }) as any;

      if (!result.images || result.images.length === 0) {
        throw new Error("No image returned from Flux 2.0");
      }

      const colorfulImageUrl = result.images[0].url;
      console.log("[Generate Coloring] ✅ Flux 2.0 generated:", colorfulImageUrl);

      // Step 3: Fetch the image for Sharp processing
      console.log("[Generate Coloring] 📥 Fetching image for line art conversion...");
      const imageResponse = await fetch(colorfulImageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      }

      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      // Note: The line art conversion will happen in makeColoringPDF via Sharp
      // We return the colorful image URL here for preview,
      // and the buffer will be processed when creating the PDF

      console.log("[Generate Coloring] ✅ Coloring page ready!");

      return {
        imageUrl: colorfulImageUrl, // Colorful version for preview
        analysis: drawingAnalysis,
        prompt: flux2Prompt,
      };
    } catch (error) {
      console.error("[Generate Coloring] ❌ Error:", error);
      throw new Error(
        `Coloring page generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
