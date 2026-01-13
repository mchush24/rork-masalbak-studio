import { logger } from "../../../lib/utils.js";
import { protectedProcedure } from "../../create-context.js";
import { z } from "zod";
import { makeStorybook } from "../../../lib/story.js";
import { saveStorybookRecord } from "../../../lib/persist.js";
import { authenticatedAiRateLimit } from "../../middleware/rate-limit.js";

const pageSchema = z.object({
  text: z.string(),
  prompt: z.string().optional(),
});

const storybookInputSchema = z.object({
  title: z.string().default("Masal"),
  pages: z.array(pageSchema).min(3).max(10),
  lang: z.enum(["tr", "en"]).default("tr"),
  makePdf: z.boolean().default(true),
  makeTts: z.boolean().default(true),
});

export const createStorybookProcedure = protectedProcedure
  .use(authenticatedAiRateLimit)
  .input(storybookInputSchema)
  .mutation(async ({ ctx, input }: { ctx: any, input: z.infer<typeof storybookInputSchema> }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info("[Storybook] Creating storybook:", input.title, "for user:", userId);

    const out = await makeStorybook(input);
    const record = await saveStorybookRecord(
      userId,
      input.title,
      out.pages,
      out.pdf_url ?? null,
      out.voice_urls ?? null
    );

    return { ...out, record };
  });
