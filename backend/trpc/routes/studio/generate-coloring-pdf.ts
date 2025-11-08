import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { makeColoringPDF } from "../../../lib/coloring.js";
import { saveColoringRecord } from "../../../lib/persist.js";

const coloringInputSchema = z.object({
  size: z.enum(["A4", "A3"]).default("A4"),
  title: z.string().default("Boyama Sayfası"),
  pages: z.array(z.string()).min(1),
  user_id: z.string().nullable().optional(),
});

export const generateColoringPDFProcedure = publicProcedure
  .input(coloringInputSchema)
  .mutation(async ({ input }: { input: z.infer<typeof coloringInputSchema> }) => {
    console.log("[Coloring PDF] Generating PDF for:", input.title);

    const { pdfUrl, pageCount } = await makeColoringPDF(input.pages, input.title, input.size);
    const record = await saveColoringRecord(
      input.user_id ?? null,
      input.title,
      pdfUrl,
      pageCount
    );

    return { pdf_url: pdfUrl, record };
  });
