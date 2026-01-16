/**
 * Chatbot Test Script v2.0
 *
 * Tests:
 * 1. FAQ matching with synonyms
 * 2. FAQ statistics
 * 3. AI fallback
 * 4. Conversation context
 */

import dotenv from 'dotenv';
dotenv.config();

import { processChat, getAllFAQQuestions, getFAQCount, searchFAQ } from '../lib/chatbot.js';

async function runTests() {
  console.log('🤖 Renkioo Chatbot Test v2.0\n');
  console.log('='.repeat(60));

  // Test 0: FAQ Statistics
  console.log('\n📊 TEST 0: FAQ Istatistikleri\n');
  const stats = getFAQCount();
  console.log(`Toplam FAQ sayisi: ${stats.total}`);
  console.log('Kategorilere gore:');
  for (const [category, count] of Object.entries(stats.byCategory)) {
    console.log(`  - ${category}: ${count}`);
  }
  console.log('-'.repeat(40));

  // Test 1: FAQ Matching (Keyword-based)
  console.log('\n📚 TEST 1: FAQ Eslestirme (Keyword)\n');

  const faqTests = [
    'Nasil hikaye olusturabilirim?',
    'Interaktif masal nedir?',
    'PDF nasil indirilir?',
    'Cizim analizi ne anlama geliyor?',
    'Uygulama ucretsiz mi?',
    'Boyama nasil yapilir?',
    'Bir sorun yasiyorum',
  ];

  for (const question of faqTests) {
    console.log(`❓ Soru: "${question}"`);
    const response = await processChat(question);
    console.log(`✅ Kaynak: ${response.source.toUpperCase()}`);
    if (response.matchedFAQ) {
      console.log(`📎 Eslesen FAQ: ${response.matchedFAQ}`);
      console.log(`📈 Guven: ${response.confidence?.toFixed(1)}%`);
    }
    console.log(`📝 Cevap: ${response.message.substring(0, 100)}...`);
    console.log('-'.repeat(40));
  }

  // Test 2: Synonym Matching
  console.log('\n🔄 TEST 2: Synonym Eslestirme\n');

  const synonymTests = [
    { query: 'Hikaye nasil yapilir?', expected: 'story_001' },  // hikaye = masal
    { query: 'Resim analizi nedir?', expected: 'analysis_001' }, // resim = cizim
    { query: 'Bedava mi?', expected: 'account_002' },           // bedava = ucretsiz
    { query: 'Problem yasiyorum', expected: 'technical_001' },  // problem = sorun
  ];

  for (const test of synonymTests) {
    console.log(`❓ Soru: "${test.query}"`);
    const response = await processChat(test.query);
    const matched = response.matchedFAQ === test.expected;
    console.log(`${matched ? '✅' : '❌'} Beklenen: ${test.expected}, Gelen: ${response.matchedFAQ || 'N/A'}`);
    console.log('-'.repeat(40));
  }

  // Test 3: Search Function
  console.log('\n🔍 TEST 3: FAQ Arama\n');

  const searchTests = ['masal', 'analiz', 'premium', 'guvenlik'];

  for (const query of searchTests) {
    const results = searchFAQ(query);
    console.log(`🔎 "${query}" icin ${results.length} sonuc bulundu`);
    results.slice(0, 3).forEach(faq => {
      console.log(`   - [${faq.category}] ${faq.question}`);
    });
    console.log('-'.repeat(40));
  }

  // Test 4: AI Fallback
  console.log('\n🧠 TEST 4: AI Fallback\n');

  const aiTests = [
    'Merhaba, bugun nasilsin?',
    'Cocugum 3 yasinda, ne onerirsin?',
    'Masal karakteri nasil degistirilir?',
  ];

  for (const question of aiTests) {
    console.log(`❓ Soru: "${question}"`);
    try {
      const response = await processChat(question);
      console.log(`✅ Kaynak: ${response.source.toUpperCase()}`);
      console.log(`📝 Cevap: ${response.message}`);
    } catch (error) {
      console.log(`❌ Hata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    console.log('-'.repeat(40));
  }

  // Test 5: Conversation Context
  console.log('\n💬 TEST 5: Konusma Baglami\n');

  const history = [
    { role: 'user' as const, content: 'Cocugum icin masal olusturmak istiyorum' },
    { role: 'assistant' as const, content: 'Harika! Masal olusturmak icin once bir cizim yuklemeniz gerekiyor.' },
  ];

  const followUp = 'Peki hangi yas icin uygun?';
  console.log(`❓ Takip sorusu: "${followUp}"`);
  console.log(`📜 Onceki mesaj sayisi: ${history.length}`);

  try {
    const response = await processChat(followUp, history);
    console.log(`✅ Kaynak: ${response.source.toUpperCase()}`);
    console.log(`📝 Cevap: ${response.message}`);
  } catch (error) {
    console.log(`❌ Hata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 6: Get all FAQs
  console.log('\n📋 TEST 6: Tum FAQ Sorulari\n');
  const faqs = getAllFAQQuestions();
  console.log(`Toplam FAQ sayisi: ${faqs.length}`);

  // Group and count
  const categoryCount: Record<string, number> = {};
  faqs.forEach(faq => {
    categoryCount[faq.category] = (categoryCount[faq.category] || 0) + 1;
  });

  console.log('\nKategorilere gore:');
  for (const [cat, count] of Object.entries(categoryCount)) {
    console.log(`  ${cat}: ${count} FAQ`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test tamamlandi!');
  console.log(`\n📈 Ozet:`);
  console.log(`   - Toplam FAQ: ${stats.total}`);
  console.log(`   - Kategoriler: ${Object.keys(stats.byCategory).length}`);
  console.log(`   - Synonym destegi: Aktif`);
  console.log(`   - AI Fallback: Aktif`);
}

runTests().catch(console.error);
