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
                text: `Analyze this child's drawing. What is the MAIN SUBJECT?

Describe the MAIN SUBJECT in ULTRA SIMPLIFIED form:
- If family/people: "simple family group" or "simple person"
- If house/building: "simple house"
- If animals: "simple [animal name]"
- If nature (flowers/trees): "simple [flower/tree]"
- If vehicle: "simple [car/boat/etc]"

IMPORTANT:
- Keep the main subject from the drawing
- Describe it in the SIMPLEST possible way
- Use words like "simple", "basic", "plain"
- Max 6 words total

Examples: "simple family group", "basic house", "simple flower", "plain cat"

Output: max 6 words.`,
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
        max_tokens: 25,  // Ultra short description (max 6 words)
      });

      const drawingAnalysis = analysisResponse.choices[0]?.message?.content || "";
      console.log("[Generate Coloring] ✅ Analysis:", drawingAnalysis);

      // Step 2: Generate colorful illustration with Flux 2.0
      console.log("[Generate Coloring] 🚀 Generating colorful image with Flux 2.0...");

      // Keep the subject but make it ULTRA SIMPLE
      const styleDescriptions = {
        simple: `Ultra simplified cartoon. Minimal shapes. Solid colors. Thick outlines. Ages 2-4.`,

        detailed: `Simple cartoon style. Basic shapes. Flat colors. Clear lines. Ages 5-7.`,

        educational: `Educational cartoon. Geometric shapes. Primary colors. Ages 4-6.`,
      };

      const flux2Prompt = `Subject: ${drawingAnalysis}

ULTRA SIMPLIFIED VERSION - Baby coloring book style:

CRITICAL RULES:
- Keep the main subject from description above
- Make it EXTREMELY simple (like Fisher-Price toy)
- SOLID FLAT COLORS only (like painted wooden blocks)
- VERY THICK black outlines (like thick marker pen)
- PLAIN WHITE background (no scenery, no details)
- Minimal geometric shapes (circles, rectangles, triangles)
- NO small details, NO decorations, NO patterns
- NO textures, NO shading, NO gradients
- Style: ${styleDescriptions[input.style]}
- Age: ${input.ageGroup} years old

If family: 3-4 very simple stick-figure-like people, no facial details
If house: basic rectangle + triangle roof, no windows/doors details
If flowers: 2-3 simple circles on stems, no petal details
If animal: basic oval body + circle head, minimal features

Think: Baby board book illustration, NOT realistic drawing`;

      console.log("[Generate Coloring] 📝 Flux 2.0 prompt:", flux2Prompt.substring(0, 100) + "...");

      // NEGATIVE PROMPT - Forbid details, not the main subject
      const negativePrompt = `detailed background, scenery, landscape, sky with clouds, grass, ground texture,
realistic style, photographic, detailed rendering, complex shading, gradients, shadows, lighting effects,
small details, decorations, ornaments, patterns, textures, intricate designs, fine lines,
windows with frames, door details, facial features, hair details, clothing patterns, buttons, jewelry,
flower petals details, leaf details, tree branches, busy composition, cluttered, many small objects,
realistic proportions, anatomically correct, professional illustration, adult coloring book style`;

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
