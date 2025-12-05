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
                text: `Look at this drawing. Pick ONLY ONE object - the biggest, simplest one.

RULES:
- If you see people/family: pick ONLY ONE person (not a group)
- If you see a house: say "one simple house" (ignore windows/doors)
- If you see flowers: say "one big flower" (not multiple)
- Ignore ALL background, details, decorations

Describe in 3-5 words ONLY:
Examples: "one big sun", "one happy dog", "one simple house"

Output: max 5 words.`,
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
        max_tokens: 20,  // Ultra short description (max 5 words)
      });

      const drawingAnalysis = analysisResponse.choices[0]?.message?.content || "";
      console.log("[Generate Coloring] ✅ Analysis:", drawingAnalysis);

      // Step 2: Generate colorful illustration with Flux 2.0
      console.log("[Generate Coloring] 🚀 Generating colorful image with Flux 2.0...");

      // EXTREME SIMPLICITY - Like a baby's first coloring book!
      const styleDescriptions = {
        simple: `ONE SINGLE OBJECT ONLY. Giant simple shape. Solid color. Thick outline. White background. Nothing else.`,

        detailed: `ONE SINGLE OBJECT. Big simple shape. Flat color. Clear outline. White background. Ages 3-5.`,

        educational: `ONE OBJECT. Basic geometric shape. Primary color. Thick lines. White background. Ages 4-5.`,
      };

      const flux2Prompt = `${drawingAnalysis}

CRITICAL: ONLY ONE OBJECT. WHITE BACKGROUND. NOTHING ELSE.

STYLE:
- ${styleDescriptions[input.style]}
- ONE single object centered on page
- GIANT simple shape (like a cookie cutter: one circle, one square, one triangle)
- SOLID FLAT COLOR (like a painted wooden toy)
- VERY THICK black outline (like thick marker)
- COMPLETELY WHITE EMPTY BACKGROUND
- NO other objects, NO decorations, NO details, NO patterns
- NO background elements (no flowers, trees, houses, people)
- Like a baby's shape sorter toy: ONE simple shape only
- Age: ${input.ageGroup} years old

FORBIDDEN: multiple objects, groups, backgrounds, details, patterns, textures, shading`;

      console.log("[Generate Coloring] 📝 Flux 2.0 prompt:", flux2Prompt.substring(0, 100) + "...");

      // NEGATIVE PROMPT - Tell Flux what NOT to generate
      const negativePrompt = `multiple objects, many items, group of people, family, crowd,
detailed background, flowers, plants, trees, grass, sky, clouds, buildings, houses with windows,
patterns, textures, gradients, shading, shadows, realistic, photographic, complex details,
small objects, decorations, ornaments, multiple colors, busy composition, cluttered scene`;

      const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
        input: {
          prompt: flux2Prompt,
          negative_prompt: negativePrompt,
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
