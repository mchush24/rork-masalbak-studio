import { publicProcedure } from "../../create-context";
import { z } from "zod";

const pageSchema = z.object({
  text: z.string(),
  prompt: z.string().optional(),
});

const storybookInputSchema = z.object({
  title: z.string(),
  pages: z.array(pageSchema).min(1).max(10),
  makePdf: z.boolean().optional(),
  makeTts: z.boolean().optional(),
});

export const createStorybookProcedure = publicProcedure
  .input(storybookInputSchema)
  .mutation(async ({ input }: { input: z.infer<typeof storybookInputSchema> }) => {
    console.log("[Storybook] Creating storybook:", input.title);

    const generatedPages = [];

    for (let i = 0; i < input.pages.length; i++) {
      const page = input.pages[i];
      
      const imageUrl = `https://placehold.co/600x400/FFE5E5/333333?text=Scene+${i + 1}`;

      generatedPages.push({
        text: page.text,
        img_url: imageUrl,
      });

      console.log(`[Storybook] Page ${i + 1} generated`);
    }

    let pdfUrl: string | undefined;
    let voiceUrls: string[] | undefined;

    if (input.makePdf) {
      pdfUrl = `https://example.com/storybook_${Date.now()}.pdf`;
      console.log("[Storybook] PDF would be generated:", pdfUrl);
    }

    if (input.makeTts) {
      voiceUrls = input.pages.map(
        (_page: z.infer<typeof pageSchema>, i: number) => `https://example.com/storybook_${Date.now()}_${i + 1}.mp3`
      );
      console.log("[Storybook] TTS would be generated:", voiceUrls);
    }

    return {
      title: input.title,
      pages: generatedPages,
      pdf_url: pdfUrl,
      voice_urls: voiceUrls,
    };
  });
