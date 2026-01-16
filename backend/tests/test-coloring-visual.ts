/**
 * Visual Test: Coloring Page Generation
 *
 * Bu script gerçek bir boyama sayfası oluşturur ve kaliteyi test eder.
 * Çalıştırma: npx tsx backend/tests/test-coloring-visual.ts
 *
 * Gereksinimler:
 * - FAL_API_KEY (Flux 2.0 için)
 * - SUPABASE_URL, SUPABASE_KEY (upload için)
 */

import 'dotenv/config';
import * as fal from "@fal-ai/serverless-client";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import {
  buildFluxColoringPrompt,
  type ColoringPromptConfig
} from '../lib/coloring-prompt-builder.js';

// Initialize FAL
fal.config({
  credentials: process.env.FAL_API_KEY,
});

// ============================================
// TEST CONFIGURATIONS
// ============================================

const testConfigs: { name: string; config: ColoringPromptConfig }[] = [
  {
    name: "toddler_cat",
    config: {
      subject: "cute fluffy cat",
      ageGroup: "toddler",
      category: "animal"
    }
  },
  {
    name: "preschool_unicorn",
    config: {
      subject: "magical unicorn with rainbow mane",
      ageGroup: "preschool",
      category: "fantasy"
    }
  },
  {
    name: "elementary_dragon",
    config: {
      subject: "friendly baby dragon",
      ageGroup: "early_elementary",
      category: "fantasy"
    }
  }
];

// ============================================
// GENERATION FUNCTION
// ============================================

async function generateColoringPage(config: ColoringPromptConfig): Promise<Buffer> {
  const { prompt, negativePrompt } = buildFluxColoringPrompt(config);

  console.log("\n📝 Prompt gönderiliyor...");
  console.log("─".repeat(40));
  console.log(prompt.substring(0, 200) + "...\n");

  const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
    input: {
      prompt: prompt,
      negative_prompt: negativePrompt,
      num_images: 1,
      image_size: "square_hd",
      enable_safety_checker: true,
      safety_tolerance: "2",
      num_inference_steps: 28,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === "IN_PROGRESS") {
        console.log("  ⏳ İşleniyor...");
      }
    },
  }) as any;

  if (!result.images || result.images.length === 0) {
    throw new Error("Görsel üretilemedi");
  }

  const imageUrl = result.images[0].url;
  console.log("  ✅ Görsel URL:", imageUrl);

  // Fetch image
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Görsel indirilemedi: ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// ============================================
// POST-PROCESSING
// ============================================

async function cleanLineArt(input: Buffer): Promise<Buffer> {
  console.log("  🧹 Line art temizleniyor...");

  return await sharp(input)
    .resize(2048, 2048, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255 }
    })
    .grayscale()
    .normalize()
    .threshold(180)
    .median(2)
    .toFormat("png", { quality: 100 })
    .toBuffer();
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log("\n" + "═".repeat(60));
  console.log("🎨 GÖRSEL BOYAMA SAYFASI TESTİ");
  console.log("═".repeat(60));

  // Check API key
  if (!process.env.FAL_API_KEY) {
    console.error("\n❌ FAL_API_KEY bulunamadı!");
    console.log("   .env dosyasına FAL_API_KEY=... ekleyin");
    process.exit(1);
  }

  // Create output directory
  const outputDir = path.join(process.cwd(), "test-output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n📁 Çıktı klasörü: ${outputDir}`);

  // Generate test images
  for (const test of testConfigs) {
    console.log("\n" + "─".repeat(50));
    console.log(`🖼️  TEST: ${test.name}`);
    console.log(`   Yaş: ${test.config.ageGroup} | Kategori: ${test.config.category}`);
    console.log("─".repeat(50));

    try {
      // Generate
      console.log("\n1️⃣  Flux 2.0 ile üretiliyor...");
      const rawImage = await generateColoringPage(test.config);

      // Save raw
      const rawPath = path.join(outputDir, `${test.name}_raw.png`);
      fs.writeFileSync(rawPath, rawImage);
      console.log(`   💾 Ham görsel: ${rawPath}`);

      // Clean
      console.log("\n2️⃣  Line art temizleniyor...");
      const cleanedImage = await cleanLineArt(rawImage);

      // Save cleaned
      const cleanPath = path.join(outputDir, `${test.name}_clean.png`);
      fs.writeFileSync(cleanPath, cleanedImage);
      console.log(`   💾 Temiz görsel: ${cleanPath}`);

      console.log("\n   ✅ BAŞARILI!");

    } catch (error) {
      console.error(`\n   ❌ HATA: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log("✅ TEST TAMAMLANDI");
  console.log("═".repeat(60));
  console.log(`\n📂 Görselleri kontrol edin: ${outputDir}`);
  console.log(`
Karşılaştırma için:
- *_raw.png: AI'dan gelen ham çıktı
- *_clean.png: Temizlenmiş boyama sayfası

Beklenen kalite:
✓ Saf siyah çizgiler
✓ Beyaz arka plan
✓ Kapalı/bağlantılı çizgiler
✓ Gri ton yok
✓ Fill tool ile uyumlu
`);
}

main().catch(console.error);
