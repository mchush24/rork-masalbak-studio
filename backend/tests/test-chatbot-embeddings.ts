/**
 * Chatbot Embeddings Test Script
 *
 * Tests:
 * 1. Embedding olusturma
 * 2. Semantic search
 * 3. Hibrit search
 * 4. Performans karsilastirma
 *
 * Kullanim:
 *   ENABLE_CHATBOT_EMBEDDINGS=true npx tsx backend/tests/test-chatbot-embeddings.ts
 */

import dotenv from 'dotenv';
dotenv.config();

// Embeddings'i etkinlestir
process.env.ENABLE_CHATBOT_EMBEDDINGS = 'true';

import {
  createEmbedding,
  semanticSearch,
  hybridSearch,
  getFAQEmbeddingCount,
} from '../lib/chatbot-embeddings.js';
import { processChat } from '../lib/chatbot.js';

async function runTests() {
  console.log('🧪 Chatbot Embeddings Test\n');
  console.log('='.repeat(60));

  // Check if embeddings are available
  const count = await getFAQEmbeddingCount().catch(() => 0);

  if (count === 0) {
    console.log('\n⚠️  Embedding veritabani bos!');
    console.log('   Once sync scriptini calistirin:');
    console.log('   npx tsx backend/scripts/sync-faq-embeddings.ts\n');

    // Test sadece embedding olusturma
    console.log('📝 Test 1: Embedding Olusturma\n');

    try {
      const testText = 'Nasil masal olusturabilirim?';
      console.log(`   Metin: "${testText}"`);

      const startTime = Date.now();
      const embedding = await createEmbedding(testText);
      const duration = Date.now() - startTime;

      console.log(`   ✅ Embedding olusturuldu`);
      console.log(`   📏 Boyut: ${embedding.length}`);
      console.log(`   ⏱️  Sure: ${duration}ms`);
      console.log(`   🔢 Ilk 5 deger: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    } catch (error) {
      console.log(`   ❌ Hata: ${error instanceof Error ? error.message : error}`);
    }

    console.log('\n' + '='.repeat(60));
    return;
  }

  console.log(`\n📊 Veritabaninda ${count} FAQ embedding mevcut\n`);

  // Test 1: Semantic Search
  console.log('📝 Test 1: Semantic Search\n');

  const semanticTests = [
    'Cocugum icin hikaye nasil olusturabilirim?',
    'Cizim psikolojik olarak ne anlatiyor?',
    'Uygulama bedava mi?',
    'Teknik bir sorun yasiyorum',
  ];

  for (const query of semanticTests) {
    console.log(`❓ Sorgu: "${query}"`);
    try {
      const startTime = Date.now();
      const results = await semanticSearch(query, { matchCount: 3, matchThreshold: 0.3 });
      const duration = Date.now() - startTime;

      if (results.length > 0) {
        console.log(`✅ ${results.length} sonuc bulundu (${duration}ms)`);
        console.log(`   En iyi: "${results[0].question}" (similarity: ${results[0].similarity.toFixed(3)})`);
      } else {
        console.log(`⚠️  Sonuc bulunamadi (${duration}ms)`);
      }
    } catch (error) {
      console.log(`❌ Hata: ${error instanceof Error ? error.message : error}`);
    }
    console.log('-'.repeat(40));
  }

  // Test 2: Hibrit Search
  console.log('\n📝 Test 2: Hibrit Search\n');

  const hybridTests = [
    { query: 'masal nasil yapilir', keywords: ['masal', 'nasil', 'yapilir'] },
    { query: 'resim analizi', keywords: ['resim', 'analiz'] },
    { query: 'premium abonelik fiyat', keywords: ['premium', 'abonelik', 'fiyat'] },
  ];

  for (const test of hybridTests) {
    console.log(`❓ Sorgu: "${test.query}"`);
    console.log(`   Keywords: [${test.keywords.join(', ')}]`);
    try {
      const startTime = Date.now();
      const results = await hybridSearch(test.query, test.keywords, { matchCount: 3 });
      const duration = Date.now() - startTime;

      if (results.length > 0) {
        console.log(`✅ ${results.length} sonuc bulundu (${duration}ms)`);
        const best = results[0];
        console.log(`   En iyi: "${best.question}"`);
        console.log(`   Skorlar: embedding=${best.embeddingScore.toFixed(3)}, keyword=${best.keywordScore.toFixed(3)}, combined=${best.combinedScore.toFixed(3)}`);
      } else {
        console.log(`⚠️  Sonuc bulunamadi (${duration}ms)`);
      }
    } catch (error) {
      console.log(`❌ Hata: ${error instanceof Error ? error.message : error}`);
    }
    console.log('-'.repeat(40));
  }

  // Test 3: processChat with embeddings
  console.log('\n📝 Test 3: processChat (Embeddings ile)\n');

  const chatTests = [
    'Masallari sesli dinleyebilir miyim?',
    'Boyama sayfasini nasil yazdirabilirim?',
    'Cocugumun cizimleri yasina uygun mu?',
  ];

  for (const query of chatTests) {
    console.log(`❓ Sorgu: "${query}"`);
    try {
      const startTime = Date.now();
      const response = await processChat(query, [], { useEmbeddings: true });
      const duration = Date.now() - startTime;

      console.log(`✅ Kaynak: ${response.source.toUpperCase()}`);
      if (response.matchedFAQ) {
        console.log(`   FAQ: ${response.matchedFAQ}`);
        console.log(`   Guven: ${response.confidence?.toFixed(1)}%`);
      }
      console.log(`   Sure: ${duration}ms`);
      console.log(`   Cevap: ${response.message.substring(0, 80)}...`);
    } catch (error) {
      console.log(`❌ Hata: ${error instanceof Error ? error.message : error}`);
    }
    console.log('-'.repeat(40));
  }

  // Test 4: Performans Karsilastirma
  console.log('\n📝 Test 4: Performans Karsilastirma\n');

  const perfQuery = 'Interaktif masal nasil oynanir?';
  const iterations = 5;

  // Keyword-only
  let keywordTotal = 0;
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await processChat(perfQuery, [], { useEmbeddings: false });
    keywordTotal += Date.now() - start;
  }
  const keywordAvg = keywordTotal / iterations;

  // With embeddings
  let embeddingTotal = 0;
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await processChat(perfQuery, [], { useEmbeddings: true });
    embeddingTotal += Date.now() - start;
  }
  const embeddingAvg = embeddingTotal / iterations;

  console.log(`   Sorgu: "${perfQuery}"`);
  console.log(`   Iterasyon: ${iterations}`);
  console.log(`   Keyword-only ortalama: ${keywordAvg.toFixed(0)}ms`);
  console.log(`   Embedding ortalama: ${embeddingAvg.toFixed(0)}ms`);
  console.log(`   Fark: +${(embeddingAvg - keywordAvg).toFixed(0)}ms`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ Testler tamamlandi!');
}

runTests().catch(console.error);
