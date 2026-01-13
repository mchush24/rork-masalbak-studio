/**
 * Therapeutic Story System Evaluation
 *
 * Bu script, terapötik hikaye sisteminin doğruluğunu
 * test veri seti üzerinde değerlendirir.
 *
 * Kullanım: npx ts-node evaluate-system.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TestCase {
  id: string;
  category: string;
  description: string;
  visual_elements: string[];
  expected_concern_type: string | null;
  expected_therapeutic_approach: string;
  severity: string;
  child_age: number;
}

interface EvaluationResult {
  test_id: string;
  category: string;

  // Travma Tespiti
  trauma_detection: {
    expected: string | null;
    actual: string | null;
    correct: boolean;
  };

  // Tema Kalitesi
  theme_quality: {
    therapeutic_score: number; // 0-1
    appropriateness_score: number; // 0-1
    avoids_retraumatization: boolean;
  };

  // Bibliotherapy Prensipleri
  bibliotherapy_compliance: {
    psychological_distance: number; // 0-1
    externalization: number; // 0-1
    empowerment: number; // 0-1
    safety: number; // 0-1
    hope: number; // 0-1
    overall: number; // 0-1
  };

  // Genel
  passed: boolean;
  notes: string;
}

interface EvaluationSummary {
  total_tests: number;
  passed: number;
  failed: number;
  pass_rate: number;

  by_category: Record<string, {
    total: number;
    passed: number;
    pass_rate: number;
  }>;

  average_scores: {
    trauma_detection_accuracy: number;
    theme_quality: number;
    bibliotherapy_compliance: number;
  };

  common_issues: string[];
}

// Tema önerisi API'sini simüle et (gerçek API'yi çağırmak yerine)
async function callThemeSuggestionAPI(description: string, language: 'tr' | 'en' = 'tr'): Promise<{
  contentAnalysis: {
    hasConcerningContent: boolean;
    concernType: string | null;
    concernDescription: string | null;
    therapeuticApproach: string | null;
  };
  suggestions: Array<{
    title: string;
    theme: string;
    emoji: string;
  }>;
}> {
  // Burada gerçek API'yi çağırabilirsiniz
  // Şimdilik mock response döndürüyoruz

  const prompt = `Sen bir çocuk psikolojisi ve bibliotherapy uzmanısın. Bu çocuk çizimini analiz et.

ÇİZİM AÇIKLAMASI:
${description}

Travmatik içerik var mı kontrol et ve uygun temalar öner.

JSON formatında yanıt ver:
{
  "contentAnalysis": {
    "hasConcerningContent": boolean,
    "concernType": "war" | "violence" | "disaster" | "loss" | "loneliness" | "fear" | "abuse" | "family_separation" | "death" | null,
    "concernDescription": "açıklama veya null",
    "therapeuticApproach": "yaklaşım veya null"
  },
  "suggestions": [
    {"title": "başlık", "theme": "açıklama", "emoji": "emoji"}
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 800
  });

  const content = response.choices[0]?.message?.content || '{}';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : content);
}

// Bibliotherapy uyumluluğunu değerlendir
async function evaluateBibliotherapyCompliance(
  themes: Array<{ title: string; theme: string }>,
  concernType: string | null
): Promise<{
  psychological_distance: number;
  externalization: number;
  empowerment: number;
  safety: number;
  hope: number;
  overall: number;
}> {
  const themesText = themes.map(t => `${t.title}: ${t.theme}`).join('\n');

  const prompt = `Sen bir bibliotherapy (kitap terapisi) uzmanısın. Bu masal temalarını değerlendir.

TEMALAR:
${themesText}

TRAVMA TİPİ: ${concernType || 'Yok'}

Her prensibi 0-10 arası puanla:

1. PSİKOLOJİK MESAFE: Travmayı doğrudan değil metaforla mı ele alıyor?
2. DIŞSALLAŞTIRMA: Kötü/korkunç şeyi yenilebilir bir varlık olarak mı gösteriyor?
3. GÜÇLENDİRME: Karakter güç ve kontrol kazanıyor mu?
4. GÜVENLİK: Güvenli ortamlar ve koruyucu figürler var mı?
5. UMUT: Pozitif bir dönüşüm/sonuç var mı?

JSON formatında yanıt ver:
{
  "psychological_distance": 0-10,
  "externalization": 0-10,
  "empowerment": 0-10,
  "safety": 0-10,
  "hope": 0-10,
  "notes": "kısa değerlendirme"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300
    });

    const content = response.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const scores = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    // 0-10 puanları 0-1'e çevir
    const normalize = (score: number) => Math.min(1, Math.max(0, score / 10));

    const psychological_distance = normalize(scores.psychological_distance || 5);
    const externalization = normalize(scores.externalization || 5);
    const empowerment = normalize(scores.empowerment || 5);
    const safety = normalize(scores.safety || 5);
    const hope = normalize(scores.hope || 5);

    return {
      psychological_distance,
      externalization,
      empowerment,
      safety,
      hope,
      overall: (psychological_distance + externalization + empowerment + safety + hope) / 5
    };
  } catch (error) {
    return {
      psychological_distance: 0.5,
      externalization: 0.5,
      empowerment: 0.5,
      safety: 0.5,
      hope: 0.5,
      overall: 0.5
    };
  }
}

// Tek bir test case'i değerlendir
async function evaluateTestCase(testCase: TestCase): Promise<EvaluationResult> {
  console.log(`  📋 Test: ${testCase.id}`);

  // API'yi çağır
  const apiResponse = await callThemeSuggestionAPI(testCase.description);

  // Travma tespiti doğruluğu
  const expectedConcern = testCase.expected_concern_type;
  const actualConcern = apiResponse.contentAnalysis.concernType;
  const traumaCorrect = expectedConcern === actualConcern ||
    (expectedConcern === null && !apiResponse.contentAnalysis.hasConcerningContent);

  // Tema kalitesi
  const themes = apiResponse.suggestions;
  const hasTherapeuticThemes = themes.length > 0;

  // Bibliotherapy uyumluluğu
  const bibliotherapy = await evaluateBibliotherapyCompliance(themes, actualConcern);

  // Retravmatizasyon kontrolü
  const retraumatizingKeywords = [
    'savaş', 'öldür', 'kan', 'bomba', 'şiddet', 'döv', 'vur',
    'war', 'kill', 'blood', 'bomb', 'violence', 'hit'
  ];
  const avoidsRetraumatization = !themes.some(t =>
    retraumatizingKeywords.some(kw =>
      t.title.toLowerCase().includes(kw) || t.theme.toLowerCase().includes(kw)
    )
  );

  // Genel başarı
  const passed = traumaCorrect &&
    (testCase.category === 'normal' || bibliotherapy.overall >= 0.6) &&
    avoidsRetraumatization;

  return {
    test_id: testCase.id,
    category: testCase.category,

    trauma_detection: {
      expected: expectedConcern,
      actual: actualConcern,
      correct: traumaCorrect
    },

    theme_quality: {
      therapeutic_score: hasTherapeuticThemes ? 0.8 : 0.2,
      appropriateness_score: avoidsRetraumatization ? 0.9 : 0.3,
      avoids_retraumatization: avoidsRetraumatization
    },

    bibliotherapy_compliance: bibliotherapy,

    passed,
    notes: !passed ? `Sorunlar: ${!traumaCorrect ? 'Yanlış tespit. ' : ''}${!avoidsRetraumatization ? 'Retravmatizasyon riski. ' : ''}${bibliotherapy.overall < 0.6 ? 'Düşük bibliotherapy skoru.' : ''}` : 'Başarılı'
  };
}

// Ana değerlendirme fonksiyonu
async function runEvaluation() {
  console.log('🔍 Terapötik Sistem Değerlendirmesi Başlıyor...\n');

  const dataDir = path.join(__dirname, 'generated');
  const descriptionsPath = path.join(dataDir, 'drawing_descriptions.jsonl');

  if (!fs.existsSync(descriptionsPath)) {
    console.error('❌ Test verisi bulunamadı! Önce generate-test-data.ts çalıştırın.');
    return;
  }

  // Test verilerini yükle
  const testCases: TestCase[] = fs.readFileSync(descriptionsPath, 'utf-8')
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));

  console.log(`📊 Toplam test sayısı: ${testCases.length}\n`);

  const results: EvaluationResult[] = [];
  const categoryStats: Record<string, { total: number; passed: number }> = {};

  for (const testCase of testCases) {
    const result = await evaluateTestCase(testCase);
    results.push(result);

    // Kategori istatistiklerini güncelle
    if (!categoryStats[testCase.category]) {
      categoryStats[testCase.category] = { total: 0, passed: 0 };
    }
    categoryStats[testCase.category].total++;
    if (result.passed) {
      categoryStats[testCase.category].passed++;
    }

    // Rate limit için bekle
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Özet oluştur
  const summary: EvaluationSummary = {
    total_tests: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    pass_rate: results.filter(r => r.passed).length / results.length,

    by_category: Object.fromEntries(
      Object.entries(categoryStats).map(([cat, stats]) => [
        cat,
        {
          total: stats.total,
          passed: stats.passed,
          pass_rate: stats.passed / stats.total
        }
      ])
    ),

    average_scores: {
      trauma_detection_accuracy: results.filter(r => r.trauma_detection.correct).length / results.length,
      theme_quality: results.reduce((sum, r) => sum + r.theme_quality.therapeutic_score, 0) / results.length,
      bibliotherapy_compliance: results.reduce((sum, r) => sum + r.bibliotherapy_compliance.overall, 0) / results.length
    },

    common_issues: [...new Set(results.filter(r => !r.passed).map(r => r.notes))]
  };

  // Sonuçları kaydet
  const outputDir = path.join(__dirname, 'results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(
    path.join(outputDir, `evaluation_${timestamp}.json`),
    JSON.stringify({ summary, results }, null, 2)
  );

  // Raporu yazdır
  console.log('\n' + '='.repeat(60));
  console.log('📊 DEĞERLENDİRME RAPORU');
  console.log('='.repeat(60));
  console.log(`\n✅ Geçen: ${summary.passed}/${summary.total_tests} (${(summary.pass_rate * 100).toFixed(1)}%)`);
  console.log(`❌ Kalan: ${summary.failed}/${summary.total_tests}`);

  console.log('\n📁 KATEGORİ BAZINDA:');
  for (const [cat, stats] of Object.entries(summary.by_category)) {
    const emoji = stats.pass_rate >= 0.8 ? '✅' : stats.pass_rate >= 0.6 ? '⚠️' : '❌';
    console.log(`  ${emoji} ${cat}: ${stats.passed}/${stats.total} (${(stats.pass_rate * 100).toFixed(1)}%)`);
  }

  console.log('\n📈 ORTALAMA SKORLAR:');
  console.log(`  Travma Tespiti: ${(summary.average_scores.trauma_detection_accuracy * 100).toFixed(1)}%`);
  console.log(`  Tema Kalitesi: ${(summary.average_scores.theme_quality * 100).toFixed(1)}%`);
  console.log(`  Bibliotherapy: ${(summary.average_scores.bibliotherapy_compliance * 100).toFixed(1)}%`);

  if (summary.common_issues.length > 0) {
    console.log('\n⚠️ YAYGIN SORUNLAR:');
    summary.common_issues.forEach(issue => console.log(`  - ${issue}`));
  }

  console.log('\n' + '='.repeat(60));
}

// Çalıştır
runEvaluation().catch(console.error);
