/**
 * Chatbot Test Script v3.0
 *
 * Tests:
 * 1. FAQ matching with synonyms
 * 2. FAQ statistics
 * 3. AI fallback
 * 4. Conversation context
 * 5. Parenting concern detection (NEW)
 * 6. Intent & emotion detection (NEW)
 * 7. Empathetic response building (NEW)
 *
 * Run with: npx tsx backend/tests/test-chatbot.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { processChat, getAllFAQQuestions, getFAQCount, searchFAQ } from '../lib/chatbot.js';

// New imports for parenting tests
import {
  detectUserIntent,
  isParentingConcern,
  detectEmotion,
  detectSeverity,
  detectConcernTopic
} from '../lib/chatbot-intent.js';

import {
  findParentingFAQ,
  getParentingFollowUps,
  PARENTING_FAQ_DATABASE
} from '../lib/chatbot-parenting.js';

import {
  buildEmpatheticResponse,
  getEmpathyAcknowledgment,
  getParentingQuickReplies
} from '../lib/chatbot-empathy.js';

// Test tracking
let passedTests = 0;
let failedTests = 0;

function logTest(name: string, passed: boolean) {
  if (passed) {
    console.log(`  ✅ ${name}`);
    passedTests++;
  } else {
    console.log(`  ❌ ${name}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('🤖 Renkioo Chatbot Test v3.0\n');
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

  // ============================================
  // NEW: PARENTING TESTS
  // ============================================

  console.log('\n' + '='.repeat(60));
  console.log('\n👨‍👩‍👧 PARENTING TESTS (NEW)\n');
  console.log('='.repeat(60));

  // Test 7: Intent Detection
  console.log('\n📋 TEST 7: Intent & Emotion Detection\n');

  const intentTests = [
    { msg: 'çocuğum resim yapmak istemiyor ne yapmalıyım', expectedType: 'parenting_concern' },
    { msg: 'oğlum sürekli ağlıyor endişeleniyorum ne yapmalıyım', expectedType: 'parenting_concern' },
    { msg: 'kızım arkadaş edinemiyor yalnız endişeliyim', expectedType: 'parenting_concern' },
    { msg: 'merhaba', expectedType: 'greeting' },
  ];

  // Note: parenting_concern, emotional_support, and child_development are all valid parenting intents
  const parentingIntentTypes = ['parenting_concern', 'emotional_support', 'child_development'];

  for (const test of intentTests) {
    const intent = detectUserIntent(test.msg);
    const passed = test.expectedType === 'greeting'
      ? intent.type === 'greeting'
      : parentingIntentTypes.includes(intent.type);
    logTest(`"${test.msg.substring(0, 30)}..." → ${intent.type}`, passed);
  }

  // Emotion tests
  console.log('\n  Emotion Detection:');
  logTest('Worried emotion detected', detectEmotion('çok endişeleniyorum') === 'worried');
  logTest('Frustrated emotion detected', detectEmotion('artık dayanamıyorum') === 'frustrated');
  logTest('Curious emotion detected', detectEmotion('merak ediyorum nasıl') === 'curious');
  logTest('Positive emotion detected', detectEmotion('teşekkür ederim harika') === 'positive');

  // Severity tests
  console.log('\n  Severity Detection:');
  logTest('Urgent severity detected', detectSeverity('kendine zarar veriyor') === 'urgent');
  logTest('High severity detected', detectSeverity('hiç konuşmuyor') === 'high');
  logTest('Medium severity detected', detectSeverity('çok sık ağlıyor') === 'medium');
  logTest('Low severity detected', detectSeverity('bazen huysuzlanıyor') === 'low');

  // Test 8: Parenting FAQ Matching
  console.log('\n📚 TEST 8: Parenting FAQ Matching\n');

  const parentingFAQTests = [
    { query: 'çocuğum resim yapmak istemiyor', expectedId: 'parenting_001' },
    { query: 'öfke nöbeti geçiriyor bağırıyor', expectedId: 'parenting_004' },
    { query: 'kardeşler kavga ediyor kıskanıyor', expectedId: 'parenting_016' },
    { query: 'karanlıktan korkuyor gece', expectedId: 'parenting_005' },
    { query: 'uyumak istemiyor gece', expectedId: 'parenting_011' },
    { query: 'yemek yemiyor seçici', expectedId: 'parenting_012' },
    { query: 'ayrılık kaygısı', expectedId: 'parenting_007' },
    { query: 'arkadaş edinemiyor yalnız', expectedId: 'parenting_014' },
  ];

  for (const test of parentingFAQTests) {
    const faq = findParentingFAQ(test.query);
    const passed = faq !== null && faq.id === test.expectedId;
    logTest(`"${test.query}" → ${faq?.id || 'NOT FOUND'}`, passed);
  }

  // Test 9: Empathetic Response Building
  console.log('\n💝 TEST 9: Empathetic Response Building\n');

  const faqForTest = findParentingFAQ('çocuğum resim yapmak istemiyor');
  if (faqForTest) {
    const response = buildEmpatheticResponse({
      emotion: 'worried',
      severity: 'low',
      topic: 'behavioral',
      faq: faqForTest,
      includeValidation: true,
      includeReassurance: true
    });

    logTest('Response has empathy', response.empathy.length > 0);
    logTest('Response has content', response.content.length > 0);
    logTest('Response has full response', response.fullResponse.length > 100);
    logTest('Response includes reassurance', response.reassurance !== undefined);
  }

  // Test empathy for different emotions
  logTest('Empathy for worried', getEmpathyAcknowledgment('worried').length > 0);
  logTest('Empathy for frustrated', getEmpathyAcknowledgment('frustrated').length > 0);
  logTest('Quick replies returned', getParentingQuickReplies('behavioral').length >= 3);

  // Test 10: Full Integration - Parenting Query
  console.log('\n🔄 TEST 10: Full Integration - Parenting Queries\n');

  const parentingIntegrationTests = [
    'çocuğum resim yapmak istemiyor ne yapmalıyım',
    'çocuğum öfke nöbeti geçiriyor bağırıyor ne yapmalıyım',
    'kızım arkadaş edinemiyor yalnız endişeleniyorum ne yapmalıyım',
  ];

  for (const query of parentingIntegrationTests) {
    console.log(`  ❓ "${query}"`);
    const response = await processChat(query, []);

    const isParentingResponse = response.matchedFAQ?.startsWith('parenting_') ?? false;
    const hasHighConfidence = (response.confidence ?? 0) >= 80;

    console.log(`     Source: ${response.source}, FAQ: ${response.matchedFAQ || 'N/A'}, Confidence: ${response.confidence?.toFixed(0)}%`);
    logTest(`Returns parenting FAQ with high confidence`, isParentingResponse && hasHighConfidence);
    console.log(`     Preview: ${response.message.substring(0, 80)}...`);
    console.log('');
  }

  // Test 11: Edge Cases
  console.log('\n🔍 TEST 11: Edge Cases\n');

  // Turkish character handling
  const turkishTest = findParentingFAQ('cocugum resim yapmak istemiyor');
  logTest('Turkish chars normalized (ç→c, ğ→g)', turkishTest !== null);

  // Case insensitivity (note: Turkish İ is handled)
  const upperTest = findParentingFAQ('COCUGUM RESIM YAPMAK ISTEMIYOR');
  logTest('Case insensitive matching', upperTest !== null);

  // Partial match
  const partialTest = findParentingFAQ('resim istemiyor çocuk');
  logTest('Partial phrase matching', partialTest !== null);

  // Follow-ups
  const followUps = getParentingFollowUps('behavioral');
  logTest('Follow-up questions returned', followUps.length >= 3);

  // Test 12: Coverage
  console.log('\n📊 TEST 12: Parenting FAQ Coverage\n');

  const categories = new Set<string>();
  PARENTING_FAQ_DATABASE.forEach(faq => categories.add(faq.category));

  logTest('Has behavioral FAQs', categories.has('behavioral'));
  logTest('Has emotional FAQs', categories.has('emotional'));
  logTest('Has developmental FAQs', categories.has('developmental'));
  logTest('Has social FAQs', categories.has('social'));
  logTest('Has physical FAQs', categories.has('physical'));
  logTest('Has 20+ parenting FAQs', PARENTING_FAQ_DATABASE.length >= 20);

  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ Test tamamlandi!');
  console.log(`\n📈 Ozet:`);
  console.log(`   - Toplam FAQ: ${stats.total}`);
  console.log(`   - Parenting FAQ: ${PARENTING_FAQ_DATABASE.length}`);
  console.log(`   - Kategoriler: ${Object.keys(stats.byCategory).length}`);
  console.log(`   - Synonym destegi: Aktif`);
  console.log(`   - AI Fallback: Aktif`);
  console.log(`   - Parenting Support: Aktif`);
  console.log(`\n📊 Test Results: ${passedTests} passed, ${failedTests} failed`);

  if (failedTests > 0) {
    console.log('\n⚠️  Some tests failed. Please review.\n');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!\n');
  }
}

runTests().catch(console.error);
