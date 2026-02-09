import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { z } from 'zod';
import { makeColoringPDF } from '../../../lib/coloring.js';
import { saveColoringRecord } from '../../../lib/persist.js';
import { authenticatedAiRateLimit } from '../../middleware/rate-limit.js';
import { coloringQuota } from '../../middleware/quota.js';

const coloringInputSchema = z.object({
  size: z.enum(['A4', 'A3']).default('A4'),
  title: z.string().default('Boyama Sayfası'),
  pages: z.array(z.string()).min(1),
});

export const generateColoringPDFProcedure = protectedProcedure
  .use(authenticatedAiRateLimit)
  .use(coloringQuota)
  .input(coloringInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info('[Coloring PDF] Generating PDF for:', input.title, 'user:', userId);

    const { pdfUrl, pageCount } = await makeColoringPDF(input.pages, input.title, input.size);
    const record = await saveColoringRecord(userId, input.title, pdfUrl, pageCount);

    return { pdf_url: pdfUrl, record };
  });
