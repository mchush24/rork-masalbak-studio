import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { makeStorybook } from "../../../lib/story.js";
import { saveStorybookRecord } from "../../../lib/persist.js";

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
  user_id: z.string().nullable().optional(),
});

export const createStorybookProcedure = publicProcedure
  .input(storybookInputSchema)
  .mutation(async ({ input }: { input: z.infer<typeof storybookInputSchema> }) => {
    console.log("[Storybook] Creating storybook:", input.title);

    const out = await makeStorybook(input);
    const record = await saveStorybookRecord(
      input.user_id ?? null,
      input.title,
      out.pages,
      out.pdf_url ?? null,
      out.voice_urls ?? null
    );

    return { ...out, record };
  });
