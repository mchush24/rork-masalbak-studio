/**
 * Test: Prompt Builder V2 - Prompt Guru Edition
 *
 * Bu test yeni prompt mimarisini doğrular:
 * 1. İlk 20 token format declaration
 * 2. Negatif kelime yok
 * 3. Ağırlık sözdizimi
 * 4. Çelişki kontrolü
 */

import 'dotenv/config';
import * as fal from "@fal-ai/serverless-client";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import {
  buildPromptV2,
  buildFluxPromptV2,
  simplifySubject,
  validatePrompt,
  type PromptConfig
} from '../lib/coloring-prompt-builder-v2.js';

// Initialize FAL
fal.config({
  credentials: process.env.FAL_API_KEY,
});

// ============================================
// TEST CONFIGURATIONS
// ============================================

const testConfigs: { name: string; config: PromptConfig }[] = [
  {
    name: "v2_toddler_cat",
    config: {
      subject: "fluffy cute cat",  // "fluffy" should be removed
      ageGroup: "toddler",
      category: "animal"
    }
  },
  {
    name: "v2_preschool_unicorn",
    config: {
      subject: "magical unicorn with flowing mane",
      ageGroup: "preschool",
      category: "fantasy"
    }
  },
  {
    name: "v2_elementary_dragon",
    config: {
      subject: "friendly baby dragon",
      ageGroup: "early_elementary",
      category: "fantasy"
    }
  }
];

// ============================================
// PROMPT ANALYSIS
// ============================================

function analyzePrompt(prompt: string, name: string) {
  console.log(`\n${"─".repeat(50)}`);
  console.log(`📝 PROMPT ANALİZİ: ${name}`);
  console.log(`${"─".repeat(50)}`);

  const tokens = prompt.split(/\s+/);
  console.log(`\n📊 Token sayısı: ${tokens.length}`);

  // First 20 tokens
  const first20 = tokens.slice(0, 20).join(' ');
  console.log(`\n🎯 İlk 20 token (KRİTİK):`);
  console.log(`   "${first20}"`);

  // Check for negative words
  const negatives = ['no ', 'not ', 'without ', "don't "];
  const foundNegatives = negatives.filter(n => prompt.toLowerCase().includes(n));
  if (foundNegatives.length > 0) {
    console.log(`\n⚠️  Negatif kelimeler bulundu: ${foundNegatives.join(', ')}`);
  } else {
    console.log(`\n✅ Negatif kelime YOK (iyi!)`);
  }

  // Check for weight syntax
  const weightMatches = prompt.match(/\([^)]+:\d+\.\d+\)/g) || [];
  console.log(`\n⚖️  Ağırlık kullanımı: ${weightMatches.length} adet`);
  weightMatches.slice(0, 5).forEach(w => console.log(`   ${w}`));

  // Check format declaration position
  const hasFormatInFirst20 = first20.toLowerCase().includes('black') &&
                              first20.toLowerCase().includes('white') &&
                              first20.toLowerCase().includes('line');
  console.log(`\n📍 Format declaration ilk 20 token'da: ${hasFormatInFirst20 ? '✅ EVET' : '❌ HAYIR'}`);
}

// ============================================
// VALIDATION TEST
// ============================================

function runValidationTests() {
  console.log("\n" + "═".repeat(60));
  console.log("🔍 DOĞRULAMA TESTLERİ");
  console.log("═".repeat(60));

  testConfigs.forEach(test => {
    const prompt = buildFluxPromptV2(test.config);
    const validation = validatePrompt(prompt, test.config);

    console.log(`\n${test.name}:`);
    console.log(`  Skor: ${validation.score}/100 ${validation.isValid ? '✅' : '❌'}`);

    if (validation.issues.length > 0) {
      console.log(`  Sorunlar:`);
      validation.issues.forEach(i => console.log(`    - ${i}`));
    }

    if (validation.suggestions.length > 0) {
      console.log(`  Öneriler:`);
      validation.suggestions.forEach(s => console.log(`    - ${s}`));
    }
  });
}

// ============================================
// VISUAL TEST
// ============================================

async function generateImage(config: PromptConfig): Promise<Buffer> {
  const prompt = buildFluxPromptV2(config);

  console.log("\n📝 Flux'a gönderilen prompt:");
  console.log("─".repeat(40));
  console.log(prompt.substring(0, 300) + "...\n");

  const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
    input: {
      prompt: prompt,
      // NO negative_prompt - Flux doesn't support it well!
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

  const response = await fetch(imageUrl);
  return Buffer.from(await response.arrayBuffer());
}

async function cleanLineArt(input: Buffer): Promise<Buffer> {
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
  console.log("🚀 PROMPT BUILDER V2 TESTİ");
  console.log("   Prompt Guru Edition - Araştırma Tabanlı");
  console.log("═".repeat(60));

  // Check API key
  if (!process.env.FAL_API_KEY) {
    console.error("\n❌ FAL_API_KEY bulunamadı!");
    process.exit(1);
  }

  // 1. Validation tests
  runValidationTests();

  // 2. Prompt analysis
  console.log("\n" + "═".repeat(60));
  console.log("📊 PROMPT ANALİZİ");
  console.log("═".repeat(60));

  testConfigs.forEach(test => {
    const prompt = buildFluxPromptV2(test.config);
    analyzePrompt(prompt, test.name);
  });

  // 3. V1 vs V2 comparison
  console.log("\n" + "═".repeat(60));
  console.log("⚖️  V1 vs V2 KARŞILAŞTIRMA");
  console.log("═".repeat(60));

  const testConfig = testConfigs[0].config;
  const v2Prompt = buildFluxPromptV2(testConfig);

  console.log("\n📝 V2 Prompt (Yeni - Araştırma Tabanlı):");
  console.log("─".repeat(40));
  console.log(v2Prompt.substring(0, 500));

  console.log("\n🔑 V2'nin Avantajları:");
  console.log("  ✓ İlk 20 token'da format declaration");
  console.log("  ✓ Negatif kelime yok");
  console.log("  ✓ Ağırlık sözdizimi (keyword:1.3)");
  console.log("  ✓ Çelişki kontrolü");
  console.log("  ✓ Natural language (Flux için optimize)");

  // 4. Visual generation test
  console.log("\n" + "═".repeat(60));
  console.log("🎨 GÖRSEL ÜRETİM TESTİ");
  console.log("═".repeat(60));

  const outputDir = path.join(process.cwd(), "test-output-v2");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const test of testConfigs) {
    console.log(`\n${"─".repeat(50)}`);
    console.log(`🖼️  TEST: ${test.name}`);
    console.log(`${"─".repeat(50)}`);

    try {
      console.log("\n1️⃣  Flux 2.0 ile üretiliyor...");
      const rawImage = await generateImage(test.config);

      const rawPath = path.join(outputDir, `${test.name}_raw.png`);
      fs.writeFileSync(rawPath, rawImage);
      console.log(`   💾 Ham görsel: ${rawPath}`);

      console.log("\n2️⃣  Line art temizleniyor...");
      const cleanedImage = await cleanLineArt(rawImage);

      const cleanPath = path.join(outputDir, `${test.name}_clean.png`);
      fs.writeFileSync(cleanPath, cleanedImage);
      console.log(`   💾 Temiz görsel: ${cleanPath}`);

      console.log("\n   ✅ BAŞARILI!");

    } catch (error) {
      console.error(`\n   ❌ HATA: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log("✅ TÜM TESTLER TAMAMLANDI");
  console.log("═".repeat(60));
  console.log(`\n📂 V2 görselleri: ${outputDir}`);
}

main().catch(console.error);
