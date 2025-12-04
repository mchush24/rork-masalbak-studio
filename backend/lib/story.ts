import OpenAI from "openai";
import puppeteer from "puppeteer";
import { uploadBuffer } from "./supabase.js";
import { generateImage, generateStorybookSeed, type ImageProvider } from "./image-generation.js";
import {
  defineCharacterFromContext,
  defineStoryStyle,
  generateConsistentPrompt,
  extractSceneFromText,
  type CharacterDefinition,
  type StoryStyle,
} from "./character-consistency.js";
import {
  generateTextOverlayHTML,
  generateFontImports,
  type TextOverlayOptions,
} from "./text-overlay.js";

const oai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const BUCKET = process.env.SUPABASE_BUCKET || "masalbak";

type PageSpec = { text: string; prompt?: string };
type MakeOptions = {
  pages: PageSpec[];
  lang?: "tr"|"en";
  makePdf?: boolean;
  makeTts?: boolean;
  title?: string;
  user_id?: string|null;
  ageGroup?: number;
  drawingAnalysis?: string;
};

/**
 * Generate image for a story page with consistent style
 *
 * @param text - The story text for this page
 * @param prompt - Optional custom prompt (should already include style consistency)
 * @param pageNumber - Current page number (1-indexed)
 * @param totalPages - Total number of pages in the story
 * @param provider - Image generation provider ('dalle3' or 'flux1')
 * @param seed - Seed for consistency (only used with Flux.1)
 */
export async function generateImageForPage(
  text: string,
  prompt?: string,
  pageNumber?: number,
  totalPages?: number,
  provider: ImageProvider = 'flux1',
  seed?: number
) {
  // Use provided prompt or fallback to basic prompt
  const finalPrompt = prompt || `Children's storybook illustration, soft pastel watercolor, simple rounded shapes, warm friendly atmosphere, plain background, NO TEXT NO LETTERS, scene: ${text}`;

  console.log(`[Story] Generating image ${pageNumber || '?'}/${totalPages || '?'}`);
  console.log(`[Story] Provider: ${provider.toUpperCase()}, Seed: ${seed || 'none'}`);
  console.log("[Story] Prompt:", finalPrompt.substring(0, 150) + "...");

  return await generateImage({
    prompt: finalPrompt,
    provider,
    seed,
    pageNumber,
    totalPages,
  });
}

export async function makeStorybook(opts: MakeOptions) {
  console.log("[Story] Starting storybook creation:", opts.title);
  console.log("[Story] Language:", opts.lang || 'tr');
  console.log("[Story] Number of pages:", opts.pages.length);
  console.log("[Story] Image provider: FLUX.1 (via FAL.ai)");

  // Define character for consistency across all pages
  const character = defineCharacterFromContext(opts.drawingAnalysis, opts.ageGroup);
  console.log("[Story] Character defined:", character.name, character.age);

  // Define story visual style
  const storyStyle = defineStoryStyle(opts.lang || 'tr');
  console.log("[Story] Style defined:", storyStyle.artStyle.substring(0, 50) + "...");

  // Generate consistent seed for this storybook (same character style across all pages)
  const seed = generateStorybookSeed(
    opts.user_id || 'anonymous',
    Date.now()
  );
  console.log("[Story] Using seed for consistency:", seed);

  const imgs: string[] = [];
  const totalPages = opts.pages.length;

  for (let i=0; i<totalPages; i++){
    try {
      console.log(`[Story] Generating image ${i+1}/${totalPages}`);

      // Extract scene description from text
      const sceneDesc = extractSceneFromText(opts.pages[i].text, opts.lang || 'tr');

      // Generate consistent prompt (same character, different scene)
      const consistentPrompt = generateConsistentPrompt(
        character,
        storyStyle,
        opts.pages[i].text,
        opts.pages[i].prompt || sceneDesc,
        i + 1,
        totalPages
      );

      console.log(`[Story] Page ${i+1} consistent prompt:`, consistentPrompt.substring(0, 150) + "...");

      const png = await generateImageForPage(
        opts.pages[i].text,
        consistentPrompt, // Use consistent prompt
        i + 1, // page number (1-indexed)
        totalPages,
        'flux1', // Always use Flux.1 for consistency
        seed // Same seed for all pages = consistent character
      );
      const url = await uploadBuffer(BUCKET, `images/story_${Date.now()}_${i+1}.png`, png, "image/png");
      imgs.push(url);

      console.log(`[Story] ✅ Image ${i+1} generated successfully`);

      // No delay needed - Flux.1 is fast!
    } catch (err) {
      console.error(`[Story] ❌ Image generation failed for page ${i+1}:`, err);
      imgs.push("about:blank");
    }
  }

  let pdf_url: string|undefined;
  if (opts.makePdf) {
    try {
      console.log("[Story] Generating PDF with text overlays");
      const html = htmlDoc(
        opts.pages.map((p,i)=>({ text: p.text, img: imgs[i] })),
        opts.lang || 'tr'
      );
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

function htmlDoc(pages: { text: string; img: string }[], language: 'tr' | 'en' = 'tr') {
  const fontImports = generateFontImports();

  const items = pages.map((p, index) => {
    // Generate text overlay HTML
    const textOverlay = generateTextOverlayHTML(p.text, {
      text: p.text,
      language,
      imageWidth: 1024,
      imageHeight: 1024,
      position: 'bottom',
      maxLines: 3,
    });

    return `
    <div class="page">
      <div class="image-container">
        <img src="${p.img}" alt="Page ${index + 1}" />
        ${textOverlay}
      </div>
    </div>`;
  }).join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${fontImports}

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Nunito', Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
    }

    .page {
      page-break-after: always;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20mm;
      position: relative;
    }

    .image-container {
      position: relative;
      width: 100%;
      max-width: 180mm;
      margin: 0 auto;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .image-container img {
      width: 100%;
      height: auto;
      display: block;
    }

    /* Print-specific styles */
    @media print {
      .page {
        padding: 0;
      }

      .image-container {
        box-shadow: none;
        border-radius: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>${items}</body>
</html>`;
}

function escapeHtml(s: string){
  return s.replace(/[&<>"]/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c] as string));
}
