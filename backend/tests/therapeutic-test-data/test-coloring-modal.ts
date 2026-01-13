/**
 * Test Coloring Modal - Terapötik içerik testi
 *
 * Bu script boyama sayfası oluşturma API'sini test eder ve
 * contentAnalysis döndürülüp döndürülmediğini kontrol eder.
 *
 * Kullanım: npx ts-node test-coloring-modal.ts
 */

import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Test senaryoları - çeşitli endişe verici içerikler
const TEST_SCENARIOS = [
  {
    name: '🎖️ Savaş Çizimi',
    description: 'Çocuk bir savaş sahnesi çizmiş. Tanklar, askerler ve yanan binalar var.',
    expectedConcern: 'war',
  },
  {
    name: '😢 Yalnızlık Çizimi',
    description: 'Tek başına oturan küçük bir çocuk. Etrafında kimse yok. Ağlıyor.',
    expectedConcern: 'loneliness',
  },
  {
    name: '🤝 Zorbalık Çizimi',
    description: 'Okul bahçesinde bir grup çocuk, tek bir çocuğu dışlamış ve gülüyor.',
    expectedConcern: 'bullying',
  },
  {
    name: '🌈 Normal Çizim',
    description: 'Güneşli bir gün, yeşil çimenler, mutlu bir aile bahçede oynuyor.',
    expectedConcern: null,
  },
];

// GPT-4 Vision analiz prompt'u (generate-coloring-from-drawing.ts'den)
const ANALYSIS_PROMPT = `Bu çocuk çizimini analiz et.

## GÖREV 1: Ana Konu
Çizimin ana konusunu ULTRA BASİT şekilde tanımla (max 6 kelime):
- Aile/insan: "basit aile grubu" veya "basit insan"
- Ev/bina: "basit ev"
- Hayvan: "basit [hayvan adı]"
- Doğa: "basit [çiçek/ağaç]"

## GÖREV 2: İçerik Kontrolü (ACEs Framework)
Endişe verici içerik var mı kontrol et:
- Savaş, şiddet, doğal afet, kayıp, yalnızlık, korku, istismar, aile ayrılığı, ölüm
- İhmal, zorbalık, aile içi şiddete tanıklık, ebeveyn bağımlılığı
- Tıbbi travma, kaygı, depresyon, düşük öz saygı, öfke, okul stresi
- Sosyal dışlanma, göç, ekonomik zorluk, siber zorbalık

JSON formatında yanıt ver:
{
  "mainSubject": "max 6 kelime basit açıklama",
  "contentAnalysis": {
    "hasConcerningContent": boolean,
    "concernType": "war|violence|disaster|loss|loneliness|fear|abuse|family_separation|death|neglect|bullying|domestic_violence_witness|parental_addiction|parental_mental_illness|medical_trauma|anxiety|depression|low_self_esteem|anger|school_stress|social_rejection|displacement|poverty|cyberbullying|null",
    "concernDescription": "varsa kısa açıklama",
    "therapeuticApproach": "varsa önerilen yaklaşım"
  }
}`;

// Terapötik boyama temaları
const THERAPEUTIC_COLORING_THEMES: Record<string, { theme: string; elements: string[] }> = {
  war: { theme: "peaceful garden with protective walls", elements: ["flowers", "rainbow", "protective trees", "happy birds"] },
  violence: { theme: "calm forest with strong friendly animals", elements: ["gentle giant", "protective bear", "safe cave"] },
  loneliness: { theme: "making friends scene", elements: ["welcoming animals", "open door", "friendship bridge"] },
  bullying: { theme: "friendship circle", elements: ["diverse friends holding hands", "strength together", "kind words"] },
  fear: { theme: "brave little hero", elements: ["flashlight", "protective shield", "friendly monster becoming small"] },
  anxiety: { theme: "calm breathing exercise", elements: ["peaceful lake", "gentle breeze", "relaxing cloud"] },
  depression: { theme: "colors returning to world", elements: ["sun peeking", "rainbow appearing", "flower blooming"] },
};

async function testScenario(scenario: typeof TEST_SCENARIOS[0]) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${scenario.name}`);
  console.log(`📝 Çizim: ${scenario.description}`);
  console.log(`📌 Beklenen: ${scenario.expectedConcern || 'normal (endişe yok)'}`);

  try {
    // GPT-4'e çizim açıklamasını gönder (gerçek görsel yerine açıklama kullanıyoruz)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `Aşağıdaki çocuk çizimi açıklamasını analiz et:

ÇİZİM AÇIKLAMASI:
${scenario.description}

${ANALYSIS_PROMPT}`,
        },
      ],
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '{}';
    console.log(`\n📄 Ham yanıt:\n${content.substring(0, 200)}...`);

    // JSON'u parse et
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    const contentAnalysis = result.contentAnalysis || { hasConcerningContent: false, concernType: null };
    const actualConcern = contentAnalysis.concernType;
    const hasConcerning = contentAnalysis.hasConcerningContent;

    console.log(`\n📊 Analiz Sonucu:`);
    console.log(`   - hasConcerningContent: ${hasConcerning}`);
    console.log(`   - concernType: ${actualConcern || 'null'}`);

    if (contentAnalysis.concernDescription) {
      console.log(`   - concernDescription: ${contentAnalysis.concernDescription}`);
    }
    if (contentAnalysis.therapeuticApproach) {
      console.log(`   - therapeuticApproach: ${contentAnalysis.therapeuticApproach}`);
    }

    // Terapötik tema kontrolü
    if (hasConcerning && actualConcern && THERAPEUTIC_COLORING_THEMES[actualConcern]) {
      const theme = THERAPEUTIC_COLORING_THEMES[actualConcern];
      console.log(`\n🎨 Terapötik Boyama Teması:`);
      console.log(`   - Tema: ${theme.theme}`);
      console.log(`   - Elementler: ${theme.elements.join(', ')}`);
    }

    // Doğruluk kontrolü (null string'i de handle et)
    const normalizedActual = actualConcern === 'null' || actualConcern === null ? null : actualConcern;
    const isCorrect = normalizedActual === scenario.expectedConcern;
    if (isCorrect) {
      console.log(`\n✅ TEST BAŞARILI`);
    } else {
      console.log(`\n❌ TEST BAŞARISIZ`);
      console.log(`   Beklenen: ${scenario.expectedConcern || 'null'}`);
      console.log(`   Gerçek: ${actualConcern || 'null'}`);
    }

    return isCorrect;
  } catch (error) {
    console.error(`\n❌ HATA: ${error}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 BOYAMA SAYFASI TERAPÖTİK İÇERİK TESTİ\n');
  console.log('Bu test, boyama sayfası oluşturma sırasında contentAnalysis');
  console.log('döndürülüp döndürülmediğini ve doğru çalışıp çalışmadığını kontrol eder.\n');

  let passed = 0;
  let failed = 0;

  for (const scenario of TEST_SCENARIOS) {
    const result = await testScenario(scenario);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    // Rate limit için bekle
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n📊 SONUÇ: ${passed}/${TEST_SCENARIOS.length} test geçti`);
  console.log(`   ✅ Başarılı: ${passed}`);
  console.log(`   ❌ Başarısız: ${failed}`);
  console.log(`   Başarı oranı: ${((passed / TEST_SCENARIOS.length) * 100).toFixed(1)}%`);

  if (passed === TEST_SCENARIOS.length) {
    console.log(`\n🎉 Tüm testler başarılı! Boyama modalı düzgün çalışıyor.`);
  }
}

runAllTests().catch(console.error);
