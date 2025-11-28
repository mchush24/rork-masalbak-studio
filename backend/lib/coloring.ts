// TEMPORARILY DISABLED: sharp causing Railway deployment issues
// Will be re-enabled with proper platform-specific binaries
// import sharp from "sharp";
import puppeteer from "puppeteer";
import { uploadBuffer } from "./supabase.js";

const BUCKET = process.env.SUPABASE_BUCKET || "masalbak";

async function toLineArt(input: string|Buffer) {
  // TEMPORARILY: Return the original image buffer without processing
  // Sharp library is disabled for Railway deployment
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

  // Return original buffer until sharp is re-enabled
  console.warn("[Coloring] Sharp library disabled - returning original image without line art conversion");
  return buf;

  /* Original sharp implementation (will be re-enabled):
  const out = await sharp(buf)
    .grayscale()
    .median(3)
    .linear(1.3, -15)
    .threshold(210)
    .toFormat("png")
    .toBuffer();
  return out;
  */
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
