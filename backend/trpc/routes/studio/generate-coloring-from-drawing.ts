import { protectedProcedure } from "../../create-context";
import { z } from "zod";
import OpenAI from "openai";
import * as fal from "@fal-ai/serverless-client";
import sharp from "sharp";
import { uploadBuffer } from "../../../lib/supabase.js";
import { authenticatedAiRateLimit } from "../../middleware/rate-limit";

const BUCKET = process.env.SUPABASE_BUCKET || "renkioo";

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
  language: z.enum(["tr", "en"]).default("tr"),
});

// Comprehensive concern types based on ACEs (Adverse Childhood Experiences) framework
type ConcernType =
  | 'war' | 'violence' | 'disaster' | 'loss' | 'loneliness' | 'fear' | 'abuse' | 'family_separation' | 'death'
  | 'neglect' | 'bullying' | 'domestic_violence_witness' | 'parental_addiction' | 'parental_mental_illness'
  | 'medical_trauma' | 'anxiety' | 'depression' | 'low_self_esteem' | 'anger' | 'school_stress' | 'social_rejection'
  | 'displacement' | 'poverty' | 'cyberbullying'
  | 'other' | null;

type ContentAnalysis = {
  hasConcerningContent: boolean;
  concernType: ConcernType;
  concernDescription?: string;
  therapeuticApproach?: string;
  therapeuticColoringTheme?: string; // Special coloring theme for therapeutic purposes
};

// Therapeutic coloring themes for each concern type
const THERAPEUTIC_COLORING_THEMES: Record<string, { theme: string; elements: string[] }> = {
  war: { theme: "peaceful garden with protective walls", elements: ["flowers", "rainbow", "protective trees", "happy birds"] },
  violence: { theme: "calm forest with strong friendly animals", elements: ["gentle giant", "protective bear", "safe cave"] },
  disaster: { theme: "rebuilding together scene", elements: ["helping hands", "new house", "rainbow after rain", "community"] },
  loss: { theme: "memory garden with stars", elements: ["heart-shaped cloud", "eternal flower", "guiding star"] },
  loneliness: { theme: "making friends scene", elements: ["welcoming animals", "open door", "friendship bridge"] },
  fear: { theme: "brave little hero", elements: ["flashlight", "protective shield", "friendly monster becoming small"] },
  abuse: { theme: "safe castle with protectors", elements: ["guardian angel", "strong walls", "loving family"] },
  family_separation: { theme: "two homes connected by love", elements: ["heart bridge", "two houses", "connected by rainbow"] },
  death: { theme: "butterfly transformation", elements: ["caterpillar to butterfly", "stars", "memory tree"] },
  neglect: { theme: "warm caring home", elements: ["cozy bed", "full table", "loving hands"] },
  bullying: { theme: "friendship circle", elements: ["diverse friends holding hands", "strength together", "kind words"] },
  domestic_violence_witness: { theme: "peaceful safe haven", elements: ["quiet garden", "protective bubble", "harmony"] },
  parental_addiction: { theme: "sunshine breaking through clouds", elements: ["hope flower", "helping hands", "bright future"] },
  parental_mental_illness: { theme: "love always present", elements: ["heart sun", "patient flower", "strong little one"] },
  medical_trauma: { theme: "brave superhero healing", elements: ["healing powers", "friendly doctor", "strength cape"] },
  anxiety: { theme: "calm breathing exercise", elements: ["peaceful lake", "gentle breeze", "relaxing cloud"] },
  depression: { theme: "colors returning to world", elements: ["sun peeking", "rainbow appearing", "flower blooming"] },
  low_self_esteem: { theme: "unique special star", elements: ["crown", "mirror of beauty", "shining from inside"] },
  anger: { theme: "taming the anger dragon", elements: ["calm dragon", "breathing exercise", "emotion master"] },
  school_stress: { theme: "learning adventure", elements: ["happy school", "fun books", "celebrating mistakes"] },
  social_rejection: { theme: "finding true friends", elements: ["unique character celebrated", "inclusive circle", "belonging"] },
  displacement: { theme: "home in the heart", elements: ["portable home", "family together", "new adventures"] },
  poverty: { theme: "richness of love", elements: ["heart treasures", "sharing joy", "family bond"] },
  cyberbullying: { theme: "digital safety hero", elements: ["shield from screen", "real friends", "safe online"] },
};

/**
 * Convert colorful image to clean line art for coloring
 * Optimized for children's coloring pages with thick, clear outlines
 */
async function toLineArt(input: Buffer): Promise<Buffer> {
  console.log("[Coloring] Converting to line art with Sharp");

  try {
    // Balanced line art conversion - preserves shapes while creating clean outlines
    // Goal: Clear coloring book outlines that preserve the original drawing structure
    const out = await sharp(input)
      .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
      .grayscale()                    // Convert to grayscale first
      .normalize()                    // Maximize contrast
      .linear(2.5, -80)               // Moderate contrast boost (2.5x amplification)
      .blur(3)                        // Light blur to smooth edges
      .median(5)                      // Light noise reduction
      .threshold(120)                 // Balanced threshold - keeps most details
      .blur(2)                        // Very light blur for smoother lines
      .threshold(128)                 // Final threshold to ensure clean black & white
      .toFormat("png")
      .toBuffer();

    console.log("[Coloring] ✅ LINE ART: Clean black outlines on white background");
    return out;
  } catch (error) {
    console.error("[Coloring] ❌ Sharp conversion failed:", error);
    console.warn("[Coloring] Falling back to original image");
    return input;
  }
}

export const generateColoringFromDrawingProcedure = protectedProcedure
  .use(authenticatedAiRateLimit)
  .input(generateColoringInputSchema)
  .mutation(async ({ input }: { input: z.infer<typeof generateColoringInputSchema> }) => {
    console.log("[Generate Coloring] 🎨 Creating coloring page from child's drawing");
    console.log("[Generate Coloring] Age group:", input.ageGroup, "| Style:", input.style);

    const isTurkish = input.language === "tr";

    try {
      // Step 1: Analyze the drawing with GPT-4 Vision (including therapeutic content check)
      console.log("[Generate Coloring] 📸 Analyzing drawing with GPT-4 Vision (ACEs framework)...");

      const analysisPrompt = isTurkish
        ? `Bu çocuk çizimini analiz et.

## GÖREV 1: Ana Konu
Çizimin ana konusunu ULTRA BASİT şekilde tanımla (max 6 kelime):
- Aile/insan: "basit aile grubu" veya "basit insan"
- Ev/bina: "basit ev"
- Hayvan: "basit [hayvan adı]"
- Doğa: "basit [çiçek/ağaç]"

## GÖREV 2: İçerik Kontrolü (ACEs Framework)
Endişe verici içerik var mı kontrol et:
- Savaş, şiddet, doğal afet, kayıp, yalnızlık, korku, istismar, aile ayrılığı, ölüm
- İhmal, zorbalık, aile içi şiddete tanıklık, ebeveyn bağımlılığı
- Tıbbi travma, kaygı, depresyon, düşük öz saygı, öfke, okul stresi
- Sosyal dışlanma, göç, ekonomik zorluk, siber zorbalık

JSON formatında yanıt ver:
{
  "mainSubject": "max 6 kelime basit açıklama",
  "contentAnalysis": {
    "hasConcerningContent": boolean,
    "concernType": "war|violence|disaster|loss|loneliness|fear|abuse|family_separation|death|neglect|bullying|domestic_violence_witness|parental_addiction|parental_mental_illness|medical_trauma|anxiety|depression|low_self_esteem|anger|school_stress|social_rejection|displacement|poverty|cyberbullying|null",
    "concernDescription": "varsa kısa açıklama",
    "therapeuticApproach": "varsa önerilen yaklaşım"
  }
}`
        : `Analyze this child's drawing.

## TASK 1: Main Subject
Describe the MAIN SUBJECT in ULTRA SIMPLIFIED form (max 6 words):
- Family/people: "simple family group" or "simple person"
- House/building: "simple house"
- Animals: "simple [animal name]"
- Nature: "simple [flower/tree]"

## TASK 2: Content Check (ACEs Framework)
Check for concerning content:
- War, violence, disaster, loss, loneliness, fear, abuse, family separation, death
- Neglect, bullying, domestic violence witness, parental addiction
- Medical trauma, anxiety, depression, low self-esteem, anger, school stress
- Social rejection, displacement, poverty, cyberbullying

Respond in JSON format:
{
  "mainSubject": "max 6 words simple description",
  "contentAnalysis": {
    "hasConcerningContent": boolean,
    "concernType": "war|violence|disaster|loss|loneliness|fear|abuse|family_separation|death|neglect|bullying|domestic_violence_witness|parental_addiction|parental_mental_illness|medical_trauma|anxiety|depression|low_self_esteem|anger|school_stress|social_rejection|displacement|poverty|cyberbullying|null",
    "concernDescription": "brief description if any",
    "therapeuticApproach": "suggested approach if any"
  }
}`;

      const analysisResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: analysisPrompt,
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

      const responseContent = analysisResponse.choices[0]?.message?.content || "{}";
      console.log("[Generate Coloring] 📝 Raw analysis:", responseContent);

      // Parse the JSON response
      let parsedAnalysis: { mainSubject: string; contentAnalysis: ContentAnalysis };
      try {
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        parsedAnalysis = JSON.parse(jsonMatch ? jsonMatch[0] : responseContent);
      } catch (e) {
        // Fallback: use the response as main subject, no concerning content
        parsedAnalysis = {
          mainSubject: responseContent.trim().substring(0, 50),
          contentAnalysis: { hasConcerningContent: false, concernType: null }
        };
      }

      const drawingAnalysis = parsedAnalysis.mainSubject || "simple drawing";
      const contentAnalysis = parsedAnalysis.contentAnalysis || { hasConcerningContent: false, concernType: null };

      console.log("[Generate Coloring] ✅ Analysis:", drawingAnalysis);

      // Log therapeutic content if detected
      if (contentAnalysis.hasConcerningContent) {
        console.log("[Generate Coloring] ⚠️ CONCERNING CONTENT DETECTED:", contentAnalysis.concernType);
        console.log("[Generate Coloring] 💜 Applying therapeutic coloring approach...");
      }

      // Step 2: Generate colorful illustration with Flux 2.0
      console.log("[Generate Coloring] 🚀 Generating colorful image with Flux 2.0...");

      // Keep the subject but make it ULTRA SIMPLE
      const styleDescriptions = {
        simple: `Ultra simplified cartoon. Minimal shapes. Solid colors. Thick outlines. Ages 2-4.`,

        detailed: `Simple cartoon style. Basic shapes. Flat colors. Clear lines. Ages 5-7.`,

        educational: `Educational cartoon. Geometric shapes. Primary colors. Ages 4-6.`,
      };

      // Use therapeutic theme if concerning content detected
      let therapeuticColoringTheme: string | undefined;
      let subjectForColoring = drawingAnalysis;

      if (contentAnalysis.hasConcerningContent && contentAnalysis.concernType) {
        const therapeuticTheme = THERAPEUTIC_COLORING_THEMES[contentAnalysis.concernType];
        if (therapeuticTheme) {
          therapeuticColoringTheme = therapeuticTheme.theme;
          // Transform the subject into a therapeutic version
          subjectForColoring = `${therapeuticTheme.theme} with ${therapeuticTheme.elements.slice(0, 2).join(' and ')}`;
          console.log("[Generate Coloring] 💜 Therapeutic coloring theme:", therapeuticColoringTheme);
          console.log("[Generate Coloring] 💜 Modified subject:", subjectForColoring);
        }
      }

      const flux2Prompt = `Subject: ${subjectForColoring}

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

      // Step 4: Convert to black & white line art
      console.log("[Generate Coloring] 🎨 Converting to black & white line art...");
      const lineArtBuffer = await toLineArt(imageBuffer);

      // Step 5: Upload line art to Supabase
      console.log("[Generate Coloring] ☁️ Uploading line art to Supabase...");
      const lineArtUrl = await uploadBuffer(
        BUCKET,
        `images/line_art_${Date.now()}_${Math.floor(Math.random() * 1e6)}.png`,
        lineArtBuffer,
        "image/png"
      );

      console.log("[Generate Coloring] ✅ Line art coloring page ready!");
      console.log("[Generate Coloring] 📍 Line art URL:", lineArtUrl);

      return {
        imageUrl: lineArtUrl, // Black & white line art for coloring
        analysis: drawingAnalysis,
        prompt: flux2Prompt,
        // NEW: Therapeutic content analysis
        contentAnalysis: contentAnalysis.hasConcerningContent ? {
          hasConcerningContent: true,
          concernType: contentAnalysis.concernType,
          concernDescription: contentAnalysis.concernDescription,
          therapeuticApproach: contentAnalysis.therapeuticApproach,
          therapeuticColoringTheme: therapeuticColoringTheme,
        } : null,
      };
    } catch (error) {
      console.error("[Generate Coloring] ❌ Error:", error);
      throw new Error(
        `Coloring page generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
