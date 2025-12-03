import OpenAI from "openai";
import puppeteer from "puppeteer";
import { uploadBuffer } from "./supabase.js";

const oai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const BUCKET = process.env.SUPABASE_BUCKET || "masalbak";

type PageSpec = { text: string; prompt?: string };
type MakeOptions = {
  pages: PageSpec[];
  lang?: "tr"|"en";
  makePdf?: boolean;
  makeTts?: boolean;
  title?: string;
  user_id?: string|null
};

/**
 * Generate image for a story page with consistent style
 *
 * @param text - The story text for this page
 * @param prompt - Optional custom prompt (should already include style consistency)
 * @param pageNumber - Current page number (1-indexed)
 * @param totalPages - Total number of pages in the story
 */
export async function generateImageForPage(
  text: string,
  prompt?: string,
  pageNumber?: number,
  totalPages?: number
) {
  // Use provided prompt or fallback to basic prompt
  // Frontend should provide consistent prompts, but have fallback just in case
  const finalPrompt = prompt || `Children's storybook illustration, soft pastel watercolor, simple rounded shapes, warm friendly atmosphere, plain background, NO TEXT NO LETTERS, scene: ${text}`;

  console.log(`[Story] Generating image ${pageNumber || '?'}/${totalPages || '?'}`);
  console.log("[Story] Full prompt:", finalPrompt);

  const img = await oai.images.generate({
    model: "dall-e-3",
    prompt: finalPrompt,
    size: "1024x1024",
    quality: "standard", // Use standard for consistency and speed
    response_format: "b64_json"
  });

  if (!img.data || !img.data[0]) {
    throw new Error("No image data returned from OpenAI");
  }

  const b64 = img.data[0].b64_json;
  if (!b64) {
    console.error("[Story] No b64_json in response, trying URL fallback");
    const url = img.data[0].url;
    if (url) {
      const res = await fetch(url);
      return Buffer.from(await res.arrayBuffer());
    }
    throw new Error("No image data returned from OpenAI");
  }

  return Buffer.from(b64, "base64");
}

export async function makeStorybook(opts: MakeOptions) {
  console.log("[Story] Starting storybook creation:", opts.title);
  console.log("[Story] Language:", opts.lang || 'tr');
  console.log("[Story] Number of pages:", opts.pages.length);

  const imgs: string[] = [];
  const totalPages = opts.pages.length;

  for (let i=0; i<totalPages; i++){
    try {
      console.log(`[Story] Generating image ${i+1}/${totalPages}`);
      console.log(`[Story] Page ${i+1} prompt:`, opts.pages[i].prompt?.substring(0, 100) + "...");

      const png = await generateImageForPage(
        opts.pages[i].text,
        opts.pages[i].prompt,
        i + 1, // page number (1-indexed)
        totalPages
      );
      const url = await uploadBuffer(BUCKET, `images/story_${Date.now()}_${i+1}.png`, png, "image/png");
      imgs.push(url);

      console.log(`[Story] ✅ Image ${i+1} generated successfully`);

      // Small delay to avoid rate limiting
      if (i < totalPages - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {
      console.error(`[Story] ❌ Image generation failed for page ${i+1}:`, err);
      imgs.push("about:blank");
    }
  }

  let pdf_url: string|undefined;
  if (opts.makePdf) {
    try {
      console.log("[Story] Generating PDF");
      const html = htmlDoc(opts.pages.map((p,i)=>({ text: p.text, img: imgs[i] })));
      const browser = await puppeteer.launch({ 
        headless: true, 
        args: ["--no-sandbox","--disable-setuid-sandbox"] 
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      const pdf = await page.pdf({ 
        format: "A4", 
        printBackground: true, 
        margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" } 
      });
      await browser.close();
      pdf_url = await uploadBuffer(BUCKET, `pdf/story_${Date.now()}.pdf`, Buffer.from(pdf), "application/pdf");
      console.log("[Story] PDF generated:", pdf_url);
    } catch (err) {
      console.error("[Story] PDF generation failed:", err);
    }
  }

  let voice_urls: string[]|undefined;
  if (opts.makeTts) {
    try {
      console.log("[Story] Generating TTS audio");
      voice_urls = [];
      for (let i=0; i<opts.pages.length; i++){
        const t = opts.pages[i].text;
        const speech = await oai.audio.speech.create({ 
          model: "tts-1", 
          voice: "alloy", 
          input: t 
        });
        const mp3 = Buffer.from(await speech.arrayBuffer());
        const vurl = await uploadBuffer(BUCKET, `audio/story_${Date.now()}_${i+1}.mp3`, mp3, "audio/mpeg");
        voice_urls.push(vurl);
      }
      console.log("[Story] TTS audio generated");
    } catch (err) {
      console.error("[Story] TTS generation failed:", err);
    }
  }

  return {
    pages: opts.pages.map((p,i)=>({ text: p.text, img_url: imgs[i] })),
    pdf_url, 
    voice_urls
  };
}

function htmlDoc(pages: { text: string; img: string }[]) {
  const items = pages.map(p => `
    <div class="page">
      <div class="img"><img src="${p.img}" /></div>
      <div class="text">${escapeHtml(p.text)}</div>
    </div>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#0f172a}
    .page{page-break-after:always;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;padding:16mm}
    .img img{max-width:100%;max-height:70vh;display:block;margin-bottom:12px}
    .text{font-size:16px;line-height:1.45;text-align:center}
  </style></head><body>${items}</body></html>`;
}

function escapeHtml(s: string){
  return s.replace(/[&<>"]/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c] as string));
}
