/**
 * Test Script: Coloring Page Quality
 *
 * Bu script yeni prompt builder sistemini test eder.
 * Çalıştırma: npx tsx backend/tests/test-coloring-quality.ts
 */

import 'dotenv/config';
import {
  buildColoringPagePrompt,
  buildFluxColoringPrompt,
  buildNegativePrompt,
  detectAgeGroup,
  detectCategory,
  validatePromptConfig,
  type ColoringPromptConfig
} from '../lib/coloring-prompt-builder.js';

// ============================================
// TEST CASES
// ============================================

const testCases: { name: string; config: ColoringPromptConfig }[] = [
  // Yaş Grupları Testi
  {
    name: "Bebek (2 yaş) - Basit kedi",
    config: {
      subject: "cute cat",
      ageGroup: "toddler",
      category: "animal"
    }
  },
  {
    name: "Okul öncesi (4 yaş) - Unicorn",
    config: {
      subject: "magical unicorn",
      ageGroup: "preschool",
      category: "fantasy"
    }
  },
  {
    name: "İlkokul erken (6 yaş) - Aile",
    config: {
      subject: "happy family at park",
      ageGroup: "early_elementary",
      category: "family"
    }
  },
  {
    name: "İlkokul geç (10 yaş) - Ejderha",
    config: {
      subject: "friendly dragon",
      ageGroup: "late_elementary",
      category: "fantasy"
    }
  },
  // Kategori Testi
  {
    name: "Araç - Araba",
    config: {
      subject: "racing car",
      ageGroup: "preschool",
      category: "vehicle"
    }
  },
  {
    name: "Doğa - Çiçek bahçesi",
    config: {
      subject: "flower garden with butterflies",
      ageGroup: "early_elementary",
      category: "nature"
    }
  },
  // Terapötik Tema Testi
  {
    name: "Terapötik - Güvenli bahçe",
    config: {
      subject: "child feeling scared",
      ageGroup: "preschool",
      category: "nature",
      isTherapeutic: true,
      therapeuticTheme: "peaceful garden with protective walls, flowers, rainbow, protective trees"
    }
  }
];

// ============================================
// TEST FUNCTIONS
// ============================================

function testAgeGroupDetection() {
  console.log("\n" + "=".repeat(60));
  console.log("🎂 YAŞ GRUBU ALGILAMA TESTİ");
  console.log("=".repeat(60));

  const ages = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  ages.forEach(age => {
    const group = detectAgeGroup(age);
    console.log(`  Yaş ${age.toString().padStart(2)} → ${group}`);
  });
}

function testCategoryDetection() {
  console.log("\n" + "=".repeat(60));
  console.log("📁 KATEGORİ ALGILAMA TESTİ");
  console.log("=".repeat(60));

  const subjects = [
    "cute cat playing",
    "princess in castle",
    "beautiful flower",
    "red racing car",
    "magical unicorn flying",
    "happy family together",
    "numbers 1 2 3",
    "random object"
  ];

  subjects.forEach(subject => {
    const category = detectCategory(subject);
    console.log(`  "${subject}" → ${category}`);
  });
}

function testPromptBuilder() {
  console.log("\n" + "=".repeat(60));
  console.log("📝 PROMPT BUILDER TESTİ");
  console.log("=".repeat(60));

  testCases.forEach((testCase, index) => {
    console.log(`\n${"─".repeat(50)}`);
    console.log(`TEST ${index + 1}: ${testCase.name}`);
    console.log(`${"─".repeat(50)}`);

    // Validate config
    const validation = validatePromptConfig(testCase.config);
    console.log(`\n📊 Doğrulama: ${validation.isValid ? '✅ GEÇER' : '❌ BAŞARISIZ'} (Skor: ${validation.score}/100)`);
    if (validation.issues.length > 0) {
      console.log(`   Sorunlar: ${validation.issues.join(', ')}`);
    }

    // Build Flux prompt
    const { prompt, negativePrompt } = buildFluxColoringPrompt(testCase.config);

    console.log(`\n🎨 FLUX PROMPT (${prompt.length} karakter):`);
    console.log("─".repeat(40));
    console.log(prompt);

    console.log(`\n🚫 NEGATIVE PROMPT:`);
    console.log("─".repeat(40));
    console.log(negativePrompt.substring(0, 100) + "...");
  });
}

function testNegativePrompt() {
  console.log("\n" + "=".repeat(60));
  console.log("🚫 NEGATİF PROMPT TESTİ");
  console.log("=".repeat(60));

  const negPrompt = buildNegativePrompt();
  console.log(`\nToplam uzunluk: ${negPrompt.length} karakter`);
  console.log(`\nİçerik:\n${negPrompt}`);

  // Check for critical elements
  const criticalElements = ['shading', 'gradient', 'gray', 'realistic', 'open lines'];
  console.log("\n✅ Kritik elementler kontrolü:");
  criticalElements.forEach(el => {
    const included = negPrompt.toLowerCase().includes(el);
    console.log(`  ${included ? '✓' : '✗'} "${el}" ${included ? 'mevcut' : 'EKSİK!'}`);
  });
}

function compareOldVsNew() {
  console.log("\n" + "=".repeat(60));
  console.log("⚖️ ESKİ vs YENİ KARŞILAŞTIRMA");
  console.log("=".repeat(60));

  // Old prompt style (what was used before)
  const oldPrompt = `Subject: cute cat

ULTRA SIMPLIFIED VERSION - Baby coloring book style:

CRITICAL RULES:
- Make it EXTREMELY simple (like Fisher-Price toy)
- SOLID FLAT COLORS only (like painted wooden blocks)
- VERY THICK black outlines (like thick marker pen)
- PLAIN WHITE background (no scenery, no details)
- NO textures, NO shading, NO gradients

Think: Baby board book illustration, NOT realistic drawing`;

  // New prompt style
  const { prompt: newPrompt } = buildFluxColoringPrompt({
    subject: "cute cat",
    ageGroup: "toddler",
    category: "animal"
  });

  console.log("\n📜 ESKİ PROMPT (Amatör):");
  console.log("─".repeat(40));
  console.log(oldPrompt);

  console.log("\n📜 YENİ PROMPT (Profesyonel):");
  console.log("─".repeat(40));
  console.log(newPrompt);

  // Key differences
  console.log("\n🔍 TEMEL FARKLAR:");
  console.log("─".repeat(40));

  const improvements = [
    { old: "Renkli resim iste", new: "Doğrudan LINE ART iste" },
    { old: "Genel basitleştirme", new: "Yaşa özel karmaşıklık" },
    { old: "Manuel çizgi kalınlığı", new: "Otomatik kalınlık (yaşa göre)" },
    { old: "Kapalı çizgi yok", new: "'all outlines closed and connected'" },
    { old: "Fill uyumluluğu yok", new: "'every shape enclosed for fill tool'" },
    { old: "Kategori farkı yok", new: "Kategori-spesifik stil" }
  ];

  improvements.forEach(imp => {
    console.log(`  ❌ ${imp.old}`);
    console.log(`  ✅ ${imp.new}`);
    console.log();
  });
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log("\n" + "═".repeat(60));
  console.log("🎨 BOYAMA SAYFASI KALİTE TESTİ");
  console.log("═".repeat(60));
  console.log("Lake, Quiver, KidloLand standartlarında kalite kontrolü\n");

  // Run all tests
  testAgeGroupDetection();
  testCategoryDetection();
  testNegativePrompt();
  compareOldVsNew();
  testPromptBuilder();

  console.log("\n" + "═".repeat(60));
  console.log("✅ TÜM TESTLER TAMAMLANDI");
  console.log("═".repeat(60));

  console.log(`
📋 SONUÇ:
─────────
Yeni prompt sistemi aşağıdaki iyileştirmeleri sağlar:

1. 🎯 Doğrudan LINE ART üretimi (renkli çevirme yok)
2. 👶 Yaşa uygun karmaşıklık (bebek → ilkokul)
3. ✏️ Profesyonel çizgi kalınlıkları
4. 🔒 Kapalı/bağlantılı çizgiler (fill tool uyumlu)
5. 📁 Kategori-spesifik stiller
6. 💜 Terapötik tema desteği
7. ✅ Kalite doğrulama sistemi

🚀 Gerçek görsel testi için:
   - Uygulamayı çalıştırın
   - Bir çizim yapın
   - Boyama sayfası oluşturun
   - Kaliteyi karşılaştırın
`);
}

main().catch(console.error);
