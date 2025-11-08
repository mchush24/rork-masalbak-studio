import { publicProcedure } from "../../create-context";
import { z } from "zod";

const coloringInputSchema = z.object({
  imageUri: z.string(),
  title: z.string(),
  size: z.enum(["A4", "A3"]).optional().default("A4"),
});

export const generateColoringPDFProcedure = publicProcedure
  .input(coloringInputSchema)
  .mutation(async ({ input }: { input: z.infer<typeof coloringInputSchema> }) => {
    console.log("[Coloring PDF] Generating PDF for:", input.title);

    const pdfUrl = `https://example.com/coloring_${Date.now()}.pdf`;
    console.log("[Coloring PDF] PDF would be generated:", pdfUrl);

    return {
      pdf_url: pdfUrl,
      title: input.title,
      size: input.size,
    };
  });
