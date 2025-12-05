import sharp from "sharp";
import puppeteer from "puppeteer";
import { uploadBuffer } from "./supabase.js";

const BUCKET = process.env.SUPABASE_BUCKET || "masalbak";

/**
 * Convert colorful image to clean line art for coloring
 * Optimized for children's coloring pages with thick, clear outlines
 */
async function toLineArt(input: string|Buffer) {
  console.log("[Coloring] Converting to line art with Sharp");

  let buf: Buffer;
  if (typeof input === "string") {
    if (input.startsWith("data:image/")) {
      // data:image/png;base64,xxxxx formatı
      buf = Buffer.from(input.split(",").pop()||"", "base64");
    } else {
      // Sadece base64 string (data: prefix olmadan)
      buf = Buffer.from(input, "base64");
    }
  } else {
    buf = input;
  }

  try {
    // MAXIMUM AGGRESSIVE - Eliminate ALL details, keep only 1-2 major shapes
    // Goal: Like a baby's first coloring book - just BIG SIMPLE outlines
    const out = await sharp(buf)
      .resize(1024, 1024, { fit: 'contain', background: { r: 255, g: 255, b: 255 } })
      .grayscale()                    // Convert to grayscale
      .blur(15)                       // MAXIMUM blur - destroy ALL small details
      .normalize()                    // Maximize contrast
      .linear(3.5, -100)              // MAXIMUM contrast boost
      .median(20)                     // MAXIMUM noise reduction - merge everything
      .threshold(140)                 // VERY low threshold = EXTREMELY THICK LINES
      .negate()                       // Invert
      .blur(8)                        // Heavy blur to merge all nearby lines
      .median(15)                     // More aggressive smoothing
      .threshold(130)                 // Even lower threshold = only major shapes survive
      .negate()                       // Invert back (white bg, black lines)
      .blur(3)                        // Final softening
      .median(5)                      // Final cleanup
      .toFormat("png")
      .toBuffer();

    console.log("[Coloring] ✅ MAXIMUM SIMPLICITY: Only major shapes remain");
    return out;
  } catch (error) {
    console.error("[Coloring] ❌ Sharp conversion failed:", error);
    console.warn("[Coloring] Falling back to original image");
    return buf;
  }
}

export async function makeColoringPDF(pages: string[], title: string, size: "A4"|"A3") {
  console.log("[Coloring] Starting PDF generation:", title);
  
  const lineUrls: string[] = [];
  for (const dataUri of pages) {
    try {
      console.log("[Coloring] Converting image to line art");
      const line = await toLineArt(dataUri);
      const url = await uploadBuffer(
        BUCKET, 
        `images/line_${Date.now()}_${Math.floor(Math.random()*1e6)}.png`, 
        line, 
        "image/png"
      );
      lineUrls.push(url);
    } catch (err) {
      console.error("[Coloring] Line art conversion failed:", err);
      throw err;
    }
  }
  
  console.log("[Coloring] Generating PDF");
  const html = htmlDoc(title, lineUrls);
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ["--no-sandbox","--disable-setuid-sandbox"] 
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({ 
    format: size, 
    printBackground: true, 
    margin: { top: "15mm", bottom: "15mm", left: "15mm", right: "15mm" } 
  });
  await browser.close();
  
  const pdfUrl = await uploadBuffer(
    BUCKET, 
    `pdf/coloring_${Date.now()}.pdf`, 
    Buffer.from(pdf), 
    "application/pdf"
  );
  
  console.log("[Coloring] PDF generated:", pdfUrl);
  return { pdfUrl, pageCount: lineUrls.length };
}

function htmlDoc(title: string, imgs: string[]) {
  const items = imgs.map(u => `<div class="page"><img src="${u}" /></div>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;padding:0}
    h1{font-family: Arial, Helvetica, sans-serif; font-size: 16px; text-align:center; margin: 8px 0;}
    .page{page-break-after: always; display:flex; align-items:center; justify-content:center; height: 100vh; padding: 10mm}
    img{max-width:100%; max-height: 95vh;}
  </style></head><body>
  <h1>${escapeHtml(title)}</h1>
  ${items}
  </body></html>`;
}

function escapeHtml(s: string){
  return s.replace(/[&<>"]/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] as string));
}
