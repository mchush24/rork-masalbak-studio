import sharp from 'sharp';
import { launch } from 'puppeteer';
import { uploadBuffer } from './supabase.js';
import { escapeHtml, logger } from './utils.js';

const BUCKET = process.env.SUPABASE_BUCKET || 'renkioo';

/**
 * Clean and enhance line art for coloring pages
 *
 * Professional coloring page standards (Lake, Quiver level):
 * - Pure black lines on white background
 * - No gray tones or shading
 * - Clean, connected outlines
 * - High resolution for print quality
 */
async function toLineArt(input: string | Buffer) {
  logger.info('[Coloring] 🎨 Processing image for coloring page...');

  let buf: Buffer;
  if (typeof input === 'string') {
    if (input.startsWith('data:image/')) {
      // data:image/png;base64,xxxxx format
      buf = Buffer.from(input.split(',').pop() || '', 'base64');
    } else {
      // Just base64 string (no data: prefix)
      buf = Buffer.from(input, 'base64');
    }
  } else {
    buf = input;
  }

  try {
    // Professional coloring page processing
    // Goal: Clean black lines on white background, suitable for children
    const out = await sharp(buf)
      // Step 1: High resolution for print quality (300dpi A4)
      .resize(2480, 2480, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255 },
      })
      // Step 2: Convert to grayscale
      .grayscale()
      // Step 3: Normalize contrast
      .normalize()
      // Step 4: Enhance contrast for clear lines
      .linear(2.0, -60)
      // Step 5: Light blur for smoother edges
      .blur(2)
      // Step 6: Light noise reduction
      .median(3)
      // Step 7: Threshold to pure black/white
      .threshold(160)
      // Step 8: Final cleanup
      .median(2)
      // Step 9: Output as high-quality PNG
      .toFormat('png', { quality: 100 })
      .toBuffer();

    logger.info('[Coloring] ✅ Professional line art ready: Clean black outlines');
    return out;
  } catch (error) {
    logger.error('[Coloring] ❌ Sharp conversion failed:', error);
    console.warn('[Coloring] Falling back to original image');
    return buf;
  }
}

export async function makeColoringPDF(pages: string[], title: string, size: 'A4' | 'A3') {
  logger.info('[Coloring] Starting PDF generation:', title);

  const lineUrls: string[] = [];
  for (const dataUri of pages) {
    try {
      logger.info('[Coloring] Converting image to line art');
      const line = await toLineArt(dataUri);
      const url = await uploadBuffer(
        BUCKET,
        `images/line_${Date.now()}_${Math.floor(Math.random() * 1e6)}.png`,
        line,
        'image/png'
      );
      lineUrls.push(url);
    } catch (err) {
      logger.error('[Coloring] Line art conversion failed:', err);
      throw err;
    }
  }

  logger.info('[Coloring] Generating PDF');
  const html = htmlDoc(title, lineUrls);
  let browser;
  let pdf: Uint8Array;
  try {
    browser = await launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    pdf = await page.pdf({
      format: size,
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
    });
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  const pdfUrl = await uploadBuffer(
    BUCKET,
    `pdf/coloring_${Date.now()}.pdf`,
    Buffer.from(pdf),
    'application/pdf'
  );

  logger.info('[Coloring] PDF generated:', pdfUrl);
  return { pdfUrl, pageCount: lineUrls.length };
}

function htmlDoc(title: string, imgs: string[]) {
  const items = imgs.map(u => `<div class="page"><img src="${u}" /></div>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page {
      margin: 10mm;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      background: white;
    }
    h1 {
      font-family: 'Comic Sans MS', 'Segoe UI', Arial, sans-serif;
      font-size: 18px;
      text-align: center;
      margin: 12px 0;
      color: #333;
    }
    .page {
      page-break-after: always;
      display: flex;
      align-items: center;
      justify-content: center;
      height: calc(100vh - 20mm);
      padding: 5mm;
      background: white;
    }
    .page:last-child {
      page-break-after: avoid;
    }
    img {
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
      image-rendering: crisp-edges;
      image-rendering: -webkit-optimize-contrast;
    }
  </style></head><body>
  <h1>${escapeHtml(title)}</h1>
  ${items}
  </body></html>`;
}
