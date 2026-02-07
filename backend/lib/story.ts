import OpenAI from "openai";
import puppeteer from "puppeteer";
import { uploadBuffer } from "./supabase.js";
import { escapeHtml, logger } from "./utils.js";
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
// Note: compositeTextOnImage no longer used - text is shown in app UI instead

// Validate API key at startup
if (!process.env.OPENAI_API_KEY) {
  logger.warn('[Story] ⚠️ OPENAI_API_KEY not set - story generation will be disabled');
}

const oai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const BUCKET = process.env.SUPABASE_BUCKET || "renkioo";

type PageSpec = { text: string; prompt?: string };

// NEW: Character definition from story generation
type CharacterInfo = {
  name: string;
  type: string; // "tilki", "ayı", "kunduz", etc.
  age: number;
  appearance: string;
  personality: string[];
  speechStyle?: string;
};

type MakeOptions = {
  pages: PageSpec[];
  lang?: "tr"|"en";
  makePdf?: boolean;
  makeTts?: boolean;
  title?: string;
  user_id?: string|null;
  ageGroup?: number;
  drawingAnalysis?: string; // DEPRECATED: Use characterInfo instead
  characterInfo?: CharacterInfo; // NEW: Full character from story
};

/**
 * Generate image for a story page with consistent style
 *
 * @param text - The story text for this page
 * @param prompt - Optional custom prompt (should already include style consistency)
 * @param pageNumber - Current page number (1-indexed)
 * @param totalPages - Total number of pages in the story
 * @param provider - Image generation provider (always 'flux2')
 * @param seed - Seed for consistency
 */
export async function generateImageForPage(
  text: string,
  prompt?: string,
  pageNumber?: number,
  totalPages?: number,
  provider: ImageProvider = 'flux2',
  seed?: number
) {
  // Use provided prompt or fallback to basic prompt
  const finalPrompt = prompt || `Children's storybook illustration, soft pastel watercolor, simple rounded shapes, warm friendly atmosphere, plain background, NO TEXT NO LETTERS, scene: ${text}`;

  logger.info(`[Story] Generating image ${pageNumber || '?'}/${totalPages || '?'}`);
  logger.info(`[Story] Provider: ${provider.toUpperCase()}, Seed: ${seed || 'none'}`);
  logger.info("[Story] Prompt:", finalPrompt.substring(0, 150) + "...");

  return await generateImage({
    prompt: finalPrompt,
    provider,
    seed,
    pageNumber,
    totalPages,
  });
}

export async function makeStorybook(opts: MakeOptions) {
  logger.info("[Story] Starting storybook creation:", opts.title);
  logger.info("[Story] Language:", opts.lang || 'tr');
  logger.info("[Story] Number of pages:", opts.pages.length);
  logger.info("[Story] Image provider: FLUX 2.0 🚀 (via FAL.ai) - FASTEST & BEST!");

  // Define character for consistency across all pages
  let character: CharacterDefinition;

  if (opts.characterInfo) {
    // NEW: Use character from story generation (CORRECT!)
    logger.info("[Story] ✅ Using character from story:", opts.characterInfo.name);
    character = {
      name: opts.characterInfo.name,
      age: `${opts.characterInfo.age} yaş`,
      appearance: `${opts.characterInfo.type.toUpperCase()}: ${opts.characterInfo.appearance}`,
      style: opts.characterInfo.personality.join(', '),
      clothing: opts.characterInfo.speechStyle || "rahat kıyafetler",
    };
    logger.info("[Story] 🎯 Character appearance:", character.appearance.substring(0, 100) + "...");
  } else {
    // FALLBACK: Old method (for backward compatibility)
    logger.info("[Story] ⚠️  Using fallback character (no characterInfo provided)");
    character = defineCharacterFromContext(opts.drawingAnalysis, opts.ageGroup);
  }

  logger.info("[Story] Character defined:", character.name, character.age);

  // Define story visual style
  const storyStyle = defineStoryStyle(opts.lang || 'tr');
  logger.info("[Story] Style defined:", storyStyle.artStyle.substring(0, 50) + "...");

  // Generate consistent seed for this storybook (same character style across all pages)
  const seed = generateStorybookSeed(
    opts.user_id || 'anonymous',
    Date.now()
  );
  logger.info("[Story] Using seed for consistency:", seed);

  const totalPages = opts.pages.length;

  // Generate all images in parallel for faster storybook creation
  logger.info(`[Story] 🚀 Generating ${totalPages} images in PARALLEL...`);

  const imagePromises = opts.pages.map(async (page, i) => {
    try {
      // Extract scene description from text
      const sceneDesc = extractSceneFromText(page.text, opts.lang || 'tr');

      // Generate consistent prompt (same character, different scene)
      const consistentPrompt = generateConsistentPrompt(
        character,
        storyStyle,
        page.text,
        page.prompt || sceneDesc,
        i + 1,
        totalPages
      );

      // Use page-specific seed: base seed + page number offset
      // This ensures character similarity while allowing scene variation
      const pageSeed = seed + (i * 1000);

      logger.info(`[Story] 🎨 Page ${i+1}/${totalPages} Flux 2.0 Prompt:`);
      logger.info(`[Story]   Character: ${character.name}`);
      logger.info(`[Story]   Seed: ${pageSeed} (base: ${seed}, offset: ${i * 1000})`);
      logger.info(`[Story]   Scene: ${(page.prompt || sceneDesc).substring(0, 80)}...`);

      const png = await generateImageForPage(
        page.text,
        consistentPrompt,
        i + 1,
        totalPages,
        'flux2',
        pageSeed  // Use page-specific seed instead of same seed for all
      );

      // Upload image without text overlay (text will be shown in the app UI)
      const url = await uploadBuffer(BUCKET, `images/story_${Date.now()}_${i+1}.png`, png, "image/png");
      logger.info(`[Story] ✅ Image ${i+1}/${totalPages} generated and uploaded`);
      return url;
    } catch (err) {
      logger.error(`[Story] ❌ Image generation failed for page ${i+1}:`, err);
      return "about:blank";
    }
  });

  const imgs = await Promise.all(imagePromises);
  logger.info(`[Story] ✅ All ${totalPages} images generated in parallel!`);

  let pdf_url: string|undefined;
  if (opts.makePdf) {
    try {
      logger.info("[Story] Generating PDF with text overlays");
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
      logger.info("[Story] PDF generated:", pdf_url);
    } catch (err) {
      logger.error("[Story] PDF generation failed:", err);
    }
  }

  let voice_urls: string[]|undefined;
  if (opts.makeTts) {
    try {
      logger.info("[Story] Generating TTS audio");
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
      logger.info("[Story] TTS audio generated");
    } catch (err) {
      logger.error("[Story] TTS generation failed:", err);
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
