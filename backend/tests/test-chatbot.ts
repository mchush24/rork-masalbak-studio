/**
 * Chatbot Test Script
 *
 * Tests:
 * 1. FAQ matching (free)
 * 2. AI fallback (Claude Haiku or GPT-4o-mini)
 */

import dotenv from 'dotenv';
dotenv.config();

import { processChat, getAllFAQQuestions } from '../lib/chatbot.js';

async function runTests() {
  console.log('🤖 Renkioo Chatbot Test\n');
  console.log('='.repeat(50));

  // Test 1: FAQ Matching
  console.log('\n📚 TEST 1: FAQ Eşleştirme (Ücretsiz)\n');

  const faqTests = [
    'Nasıl hikaye oluşturabilirim?',
    'İnteraktif masal nedir?',
    'PDF nasıl indirilir?',
    'Çizim analizi ne anlama geliyor?',
    'Uygulama ücretsiz mi?',
  ];

  for (const question of faqTests) {
    console.log(`❓ Soru: "${question}"`);
    const response = await processChat(question);
    console.log(`✅ Kaynak: ${response.source.toUpperCase()}`);
    console.log(`📝 Cevap (ilk 100 karakter): ${response.message.substring(0, 100)}...`);
    console.log('-'.repeat(40));
  }

  // Test 2: AI Fallback
  console.log('\n🧠 TEST 2: AI Fallback (Claude Haiku)\n');

  const aiTests = [
    'Merhaba, bugün nasılsın?',
    'Çocuğum 3 yaşında, ne önerirsin?',
    'Masal karakteri nasıl değiştirilir?',
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

  // Test 3: Conversation Context
  console.log('\n💬 TEST 3: Konuşma Bağlamı\n');

  const history = [
    { role: 'user' as const, content: 'Çocuğum için masal oluşturmak istiyorum' },
    { role: 'assistant' as const, content: 'Harika! Masal oluşturmak için önce bir çizim yüklemeniz gerekiyor.' },
  ];

  const followUp = 'Peki hangi yaş için uygun?';
  console.log(`❓ Takip sorusu: "${followUp}"`);
  console.log(`📜 Önceki mesaj sayısı: ${history.length}`);

  try {
    const response = await processChat(followUp, history);
    console.log(`✅ Kaynak: ${response.source.toUpperCase()}`);
    console.log(`📝 Cevap: ${response.message}`);
  } catch (error) {
    console.log(`❌ Hata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test 4: Get all FAQs
  console.log('\n📋 TEST 4: Tüm FAQ Soruları\n');
  const faqs = getAllFAQQuestions();
  console.log(`Toplam FAQ sayısı: ${faqs.length}`);
  faqs.forEach(faq => {
    console.log(`  [${faq.category}] ${faq.question}`);
  });

  console.log('\n' + '='.repeat(50));
  console.log('✅ Test tamamlandı!');
}

runTests().catch(console.error);
