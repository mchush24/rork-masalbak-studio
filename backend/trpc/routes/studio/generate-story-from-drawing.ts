import { logger } from "../../../lib/utils.js";
import { protectedProcedure } from "../../create-context.js";
import { z } from "zod";
import { generateStoryFromAnalysisV2, type Character } from "../../../lib/generate-story-from-analysis-v2.js";
import { makeStorybook } from "../../../lib/story.js";
import { saveStorybookRecord } from "../../../lib/persist.js";
import type { AnalysisResponse } from "./analyze-drawing.js";
import { authenticatedAiRateLimit } from "../../middleware/rate-limit.js";

// Therapeutic context schema for trauma-informed storytelling (ACEs Framework + Pediatric Psychology)
const therapeuticContextSchema = z.object({
  concernType: z.enum([
    // Original categories
    'war', 'violence', 'fear', 'loss', 'loneliness', 'disaster', 'abuse', 'family_separation', 'death',
    // ACEs Framework categories
    'neglect', 'bullying', 'domestic_violence_witness', 'parental_addiction', 'parental_mental_illness',
    // Pediatric psychology categories
    'medical_trauma', 'anxiety', 'depression', 'low_self_esteem', 'anger', 'school_stress', 'social_rejection',
    // Additional categories
    'displacement', 'poverty', 'cyberbullying',
    // Fallback
    'other'
  ]),
  therapeuticApproach: z.string(),
}).optional();

const generateStoryInputSchema = z.object({
  // Drawing analysis data
  drawingAnalysis: z.any(), // AnalysisResponse type

  // Child info
  childAge: z.number().min(2).max(12),
  childGender: z.enum(["male", "female"]).optional(), // For character gender matching

  // Story preferences
  language: z.enum(["tr", "en"]).default("tr"),

  // Optional metadata
  drawingTitle: z.string().optional(),
  drawingDescription: z.string().optional(),
  themes: z.array(z.string()).optional(),

  // Therapeutic context for trauma-informed storytelling
  therapeuticContext: therapeuticContextSchema,

  // Generation options
  makePdf: z.boolean().default(true),
  makeTts: z.boolean().default(false),
});

/**
 * Generate a complete storybook from drawing analysis
 *
 * Flow:
 * 1. Use GPT-4 to generate rich story text from drawing analysis
 * 2. Create consistent character definition
 * 3. Generate images for each page with Flux.1
 * 4. Add text overlays to images
 * 5. Optionally generate PDF and TTS audio
 * 6. Save to database
 */
export const generateStoryFromDrawingProcedure = protectedProcedure
  .use(authenticatedAiRateLimit)
  .input(generateStoryInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info("[Generate Story] 🎨 Starting storybook generation from drawing");
    logger.info("[Generate Story] 👶 Child age:", input.childAge);
    logger.info("[Generate Story] 🌍 Language:", input.language);

    // Log therapeutic context if present
    if (input.therapeuticContext) {
      logger.info("[Generate Story] 💜 THERAPEUTIC MODE ACTIVE");
      logger.info("[Generate Story] 💜 Concern type:", input.therapeuticContext.concernType);
      logger.info("[Generate Story] 💜 Approach:", input.therapeuticContext.therapeuticApproach);
    }

    try {
      // Step 1: Generate story using AI (Multi-Stage V2 Generator)
      logger.info("[Generate Story] 📝 Generating story with V2 (Multi-Stage) generator...");

      const generatedStory = await generateStoryFromAnalysisV2({
        drawingAnalysis: input.drawingAnalysis as AnalysisResponse,
        childAge: input.childAge,
        childGender: input.childGender,
        language: input.language,
        drawingTitle: input.drawingTitle,
        drawingDescription: input.drawingDescription,
        themes: input.themes,
        therapeuticContext: input.therapeuticContext,
      });

      logger.info("[Generate Story] ✅ Story generated!");
      logger.info("[Generate Story] 📖 Title:", generatedStory.title);
      logger.info("[Generate Story] 👤 Character:", generatedStory.mainCharacter.name, "-", generatedStory.mainCharacter.type);
      logger.info("[Generate Story] 📄 Pages:", generatedStory.pages.length);

      // Step 2: Prepare pages for visual generation
      const pages = generatedStory.pages.map(page => ({
        text: page.text,
        prompt: page.sceneDescription, // We'll enhance this with character consistency
      }));

      // Step 3: Prepare character info for visual consistency
      const mainChar: Character = generatedStory.mainCharacter;
      const characterInfo = {
        name: mainChar.name,
        type: mainChar.type,
        age: input.childAge,
        appearance: mainChar.appearance,
        personality: mainChar.personality,
        ...(mainChar.speechStyle && { speechStyle: mainChar.speechStyle }),
      };

      logger.info("[Generate Story] 🎨 Character for visual consistency:");
      logger.info(`  Name: ${characterInfo.name}`);
      logger.info(`  Type: ${characterInfo.type}`);
      logger.info(`  Appearance: ${characterInfo.appearance.substring(0, 80)}...`);

      // Step 4: Generate storybook with images
      logger.info("[Generate Story] 🖼️  Generating images and storybook...");
      const storybook = await makeStorybook({
        title: generatedStory.title,
        pages: pages,
        lang: input.language,
        makePdf: input.makePdf,
        makeTts: input.makeTts,
        user_id: userId,
        ageGroup: input.childAge,
        characterInfo: characterInfo, // ✅ PASS FULL CHARACTER OBJECT!
      });

      logger.info("[Generate Story] ✅ Storybook created with images!");

      // Step 5: Save to database
      logger.info("[Generate Story] 💾 Saving to database...");
      const savedRecord = await saveStorybookRecord(
        userId,
        generatedStory.title,
        storybook.pages,
        storybook.pdf_url,
        storybook.voice_urls
      );
      logger.info("[Generate Story] ✅ Saved to database with ID:", savedRecord.id);

      // Return complete storybook data
      return {
        id: savedRecord.id,
        story: generatedStory,
        storybook: storybook,
        metadata: {
          educationalTheme: generatedStory.educationalTheme,
          mood: generatedStory.mood,
          characterName: generatedStory.mainCharacter.name,
          characterType: generatedStory.mainCharacter.type,
        },
      };
    } catch (error) {
      logger.error("[Generate Story] ❌ Error:", error);
      throw new Error(
        `Story generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
