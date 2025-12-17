import { publicProcedure } from "../../create-context.js";
import { z } from "zod";
import { generateStoryFromAnalysis } from "../../../lib/generate-story-from-analysis.js";
import { generateStoryFromAnalysisV2 } from "../../../lib/generate-story-from-analysis-v2.js";
import { makeStorybook } from "../../../lib/story.js";
import { saveStorybookRecord } from "../../../lib/persist.js";
import type { AnalysisResponse } from "./analyze-drawing.js";

const generateStoryInputSchema = z.object({
  // Drawing analysis data
  drawingAnalysis: z.any(), // AnalysisResponse type

  // Child info
  childAge: z.number().min(2).max(12),
  childName: z.string().optional(), // NEW: Personalization

  // Story preferences
  language: z.enum(["tr", "en"]).default("tr"),
  useV2Generator: z.boolean().default(true), // NEW: Use multi-stage generator

  // Optional metadata
  drawingTitle: z.string().optional(),
  drawingDescription: z.string().optional(),
  themes: z.array(z.string()).optional(),

  // Generation options
  makePdf: z.boolean().default(true),
  makeTts: z.boolean().default(false),

  // User ID
  user_id: z.string().nullable().optional(),
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
export const generateStoryFromDrawingProcedure = publicProcedure
  .input(generateStoryInputSchema)
  .mutation(async ({ input }) => {
    console.log("[Generate Story] 🎨 Starting storybook generation from drawing");
    console.log("[Generate Story] 👶 Child age:", input.childAge);
    console.log("[Generate Story] 🌍 Language:", input.language);

    try {
      // Step 1: Generate story using AI (V1 or V2)
      console.log(`[Generate Story] 📝 Generating story with ${input.useV2Generator ? 'V2 (Multi-Stage)' : 'V1 (Legacy)'} generator...`);

      const generatedStory = input.useV2Generator
        ? await generateStoryFromAnalysisV2({
            drawingAnalysis: input.drawingAnalysis as AnalysisResponse,
            childAge: input.childAge,
            childName: input.childName,
            language: input.language,
            drawingTitle: input.drawingTitle,
            drawingDescription: input.drawingDescription,
            themes: input.themes,
          })
        : await generateStoryFromAnalysis({
            drawingAnalysis: input.drawingAnalysis as AnalysisResponse,
            childAge: input.childAge,
            language: input.language,
            drawingTitle: input.drawingTitle,
            drawingDescription: input.drawingDescription,
            themes: input.themes,
          });

      console.log("[Generate Story] ✅ Story generated!");
      console.log("[Generate Story] 📖 Title:", generatedStory.title);
      console.log("[Generate Story] 👤 Character:", generatedStory.mainCharacter.name, "-", generatedStory.mainCharacter.type);
      console.log("[Generate Story] 📄 Pages:", generatedStory.pages.length);

      // Step 2: Prepare pages for visual generation
      const pages = generatedStory.pages.map(page => ({
        text: page.text,
        prompt: page.sceneDescription, // We'll enhance this with character consistency
      }));

      // Step 3: Prepare character info for visual consistency
      const mainChar: any = generatedStory.mainCharacter;
      const characterInfo: any = {
        name: mainChar.name,
        type: mainChar.type,
        age: input.childAge,
        appearance: mainChar.appearance,
        personality: mainChar.personality,
        ...(mainChar.speechStyle && { speechStyle: mainChar.speechStyle }),
      };

      console.log("[Generate Story] 🎨 Character for visual consistency:");
      console.log(`  Name: ${characterInfo.name}`);
      console.log(`  Type: ${characterInfo.type}`);
      console.log(`  Appearance: ${characterInfo.appearance.substring(0, 80)}...`);

      // Step 4: Generate storybook with images
      console.log("[Generate Story] 🖼️  Generating images and storybook...");
      const storybook = await makeStorybook({
        title: generatedStory.title,
        pages: pages,
        lang: input.language,
        makePdf: input.makePdf,
        makeTts: input.makeTts,
        user_id: input.user_id || null,
        ageGroup: input.childAge,
        characterInfo: characterInfo, // ✅ PASS FULL CHARACTER OBJECT!
      });

      console.log("[Generate Story] ✅ Storybook created with images!");

      // Step 5: Save to database
      console.log("[Generate Story] 💾 Saving to database...");
      const savedRecord = await saveStorybookRecord(
        input.user_id || null,
        generatedStory.title,
        storybook.pages,
        storybook.pdf_url,
        storybook.voice_urls
      );
      console.log("[Generate Story] ✅ Saved to database with ID:", savedRecord.id);

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
      console.error("[Generate Story] ❌ Error:", error);
      throw new Error(
        `Story generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
