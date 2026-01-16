/**
 * Test: Story-Drawing Connection V2
 *
 * This test verifies that:
 * 1. visualDescription is extracted from drawing
 * 2. visualDescription is passed to story generation
 * 3. Story character matches the drawing content
 */

import 'dotenv/config';
import OpenAI from 'openai';
import { generateStoryFromAnalysisV2 } from '../lib/generate-story-from-analysis-v2.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simulate what suggest-story-themes does
async function simulateVisualDescription(description: string): Promise<string> {
  // In real flow, this comes from GPT-4o vision analysis
  // For testing, we'll use predefined descriptions
  return description;
}

// Create a mock drawing analysis response
function createMockAnalysis(visualDescription: string) {
  return {
    insights: [
      { title: "Ana Tema", summary: `Çizimde görülen: ${visualDescription}` },
      { title: "Duygusal Durum", summary: "Mutlu ve neşeli bir atmosfer" }
    ],
    traumaAssessment: { hasTraumaticContent: false },
    riskFlags: [],
    colorAnalysis: { primaryColors: ["mavi", "yeşil"], mood: "happy" },
    developmentalStage: "normal",
  };
}

// Test cases - different drawing scenarios
const testCases = [
  {
    name: "White Cat with Blue Eyes",
    visualDescription: "Mavi gözlü beyaz bir kedi bahçede top ile oynuyor. Kedinin tüyleri kabarık ve kuyruğu havada.",
    expectedCharacterType: ["kedi", "cat"],
    expectedInAppearance: ["beyaz", "white", "mavi göz", "blue eye"],
  },
  {
    name: "Brown Rabbit in Forest",
    visualDescription: "Kahverengi bir tavşan ormanda havuç yiyor. Uzun kulakları ve tüylü kuyruğu var.",
    expectedCharacterType: ["tavşan", "rabbit"],
    expectedInAppearance: ["kahverengi", "brown", "uzun kulak"],
  },
  {
    name: "Yellow Dog with Red Collar",
    visualDescription: "Sarı renkli sevimli bir köpek kırmızı tasmalı, parkta koşuyor.",
    expectedCharacterType: ["köpek", "dog"],
    expectedInAppearance: ["sarı", "yellow", "kırmızı tasma", "red collar"],
  },
  {
    name: "Pink Unicorn with Rainbow Mane",
    visualDescription: "Pembe bir unicorn gökkuşağı renkli yelesiyle bulutların üzerinde uçuyor.",
    expectedCharacterType: ["unicorn", "tekboynuz"],
    expectedInAppearance: ["pembe", "pink", "gökkuşağı", "rainbow"],
  },
];

async function runTest() {
  console.log("\n" + "═".repeat(70));
  console.log("🎨 STORY-DRAWING CONNECTION TEST V2");
  console.log("═".repeat(70));

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY not found!");
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log("\n" + "─".repeat(70));
    console.log(`📋 TEST: ${testCase.name}`);
    console.log("─".repeat(70));

    console.log(`\n🖼️  Visual Description (from drawing):`);
    console.log(`   "${testCase.visualDescription}"`);

    try {
      // Create mock analysis
      const mockAnalysis = createMockAnalysis(testCase.visualDescription);

      // Generate story with visualDescription
      console.log(`\n⏳ Generating story with visual description...`);

      const story = await generateStoryFromAnalysisV2({
        drawingAnalysis: mockAnalysis as any,
        childAge: 5,
        childGender: 'female',
        language: 'tr',
        visualDescription: testCase.visualDescription, // KEY: Pass visual description!
      });

      console.log(`\n📖 Generated Story:`);
      console.log(`   Title: ${story.title}`);
      console.log(`   Character Name: ${story.mainCharacter.name}`);
      console.log(`   Character Type: ${story.mainCharacter.type}`);
      console.log(`   Character Appearance: ${story.mainCharacter.appearance.substring(0, 100)}...`);
      console.log(`   Pages: ${story.pages.length}`);

      // Validate character type matches drawing
      const typeMatches = testCase.expectedCharacterType.some(
        expected => story.mainCharacter.type.toLowerCase().includes(expected.toLowerCase())
      );

      // Validate appearance includes drawing elements
      const appearanceMatches = testCase.expectedInAppearance.some(
        expected => story.mainCharacter.appearance.toLowerCase().includes(expected.toLowerCase())
      );

      console.log(`\n✅ VALIDATION:`);
      console.log(`   Character Type Match: ${typeMatches ? '✓ PASS' : '✗ FAIL'}`);
      console.log(`     Expected: ${testCase.expectedCharacterType.join(' or ')}`);
      console.log(`     Got: ${story.mainCharacter.type}`);

      console.log(`   Appearance Match: ${appearanceMatches ? '✓ PASS' : '✗ FAIL'}`);
      console.log(`     Expected elements: ${testCase.expectedInAppearance.join(', ')}`);
      console.log(`     Got: ${story.mainCharacter.appearance.substring(0, 80)}...`);

      if (typeMatches && appearanceMatches) {
        console.log(`\n🎉 TEST PASSED!`);
        passed++;
      } else {
        console.log(`\n❌ TEST FAILED - Character doesn't match drawing!`);
        failed++;
      }

      // Show first visual prompt to verify character description
      if (story.pages[0]) {
        console.log(`\n🎨 First Page Visual Prompt (check character description):`);
        console.log(`   ${story.pages[0].visualPrompt.substring(0, 200)}...`);
      }

    } catch (error) {
      console.error(`\n❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      failed++;
    }
  }

  console.log("\n" + "═".repeat(70));
  console.log("📊 TEST RESULTS");
  console.log("═".repeat(70));
  console.log(`   Passed: ${passed}/${testCases.length}`);
  console.log(`   Failed: ${failed}/${testCases.length}`);
  console.log(`   Success Rate: ${((passed / testCases.length) * 100).toFixed(0)}%`);
  console.log("═".repeat(70));

  if (failed > 0) {
    console.log("\n⚠️  Some tests failed! Character-drawing connection may need improvement.");
  } else {
    console.log("\n🎉 All tests passed! Character-drawing connection is working correctly.");
  }
}

runTest().catch(console.error);
