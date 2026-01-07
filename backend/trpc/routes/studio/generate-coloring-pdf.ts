import { protectedProcedure } from "../../create-context";
import { z } from "zod";
import { makeColoringPDF } from "../../../lib/coloring.js";
import { saveColoringRecord } from "../../../lib/persist.js";
import { authenticatedAiRateLimit } from "../../middleware/rate-limit";

const coloringInputSchema = z.object({
  size: z.enum(["A4", "A3"]).default("A4"),
  title: z.string().default("Boyama Sayfası"),
  pages: z.array(z.string()).min(1),
});

export const generateColoringPDFProcedure = protectedProcedure
  .use(authenticatedAiRateLimit)
  .input(coloringInputSchema)
  .mutation(async ({ ctx, input }: { ctx: any, input: z.infer<typeof coloringInputSchema> }) => {
    const userId = ctx.userId; // Get from authenticated context
    console.log("[Coloring PDF] Generating PDF for:", input.title, "user:", userId);

    const { pdfUrl, pageCount } = await makeColoringPDF(input.pages, input.title, input.size);
    const record = await saveColoringRecord(
      userId,
      input.title,
      pdfUrl,
      pageCount
    );

    return { pdf_url: pdfUrl, record };
  });
