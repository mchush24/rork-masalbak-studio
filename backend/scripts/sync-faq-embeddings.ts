/**
 * FAQ Embeddings Sync Script
 *
 * Mevcut FAQ'lari Supabase'e embedding'lerle birlikte yukler
 *
 * Kullanim:
 *   npx tsx backend/scripts/sync-faq-embeddings.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { upsertFAQEmbeddings, getFAQEmbeddingCount, type FAQEmbedding } from '../lib/chatbot-embeddings.js';

// FAQ_DATABASE'i chatbot.ts'den import et
// Not: chatbot.ts'deki FAQ_DATABASE'i export etmemiz gerekiyor
import { getFAQDatabase } from '../lib/chatbot.js';

async function syncFAQEmbeddings() {
  console.log('🔄 FAQ Embeddings Sync Script\n');
  console.log('='.repeat(50));

  try {
    // 1. Mevcut veritabani durumunu kontrol et
    const currentCount = await getFAQEmbeddingCount();
    console.log(`\n📊 Mevcut embedding sayisi: ${currentCount}`);

    // 2. FAQ'lari al
    const faqs = getFAQDatabase();
    console.log(`📚 Yuklenecek FAQ sayisi: ${faqs.length}`);

    if (faqs.length === 0) {
      console.log('❌ Yuklenecek FAQ bulunamadi!');
      return;
    }

    // 3. FAQ'lari FAQEmbedding formatina donustur
    const faqEmbeddings: FAQEmbedding[] = faqs.map(faq => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      keywords: faq.keywords,
      priority: faq.priority || 5,
    }));

    // 4. Embedding'leri olustur ve yukle
    console.log('\n⏳ Embedding\'ler olusturuluyor ve yukleniyor...');
    console.log('   (Bu islem birkaç dakika surebilir)\n');

    const startTime = Date.now();
    await upsertFAQEmbeddings(faqEmbeddings);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    // 5. Sonucu kontrol et
    const newCount = await getFAQEmbeddingCount();

    console.log('\n' + '='.repeat(50));
    console.log('✅ Sync tamamlandi!');
    console.log(`\n📈 Sonuc:`);
    console.log(`   - Yuklenen FAQ: ${faqs.length}`);
    console.log(`   - Toplam embedding: ${newCount}`);
    console.log(`   - Sure: ${duration}s`);
    console.log(`   - Ortalama: ${(parseFloat(duration) / faqs.length * 1000).toFixed(0)}ms/FAQ`);

  } catch (error) {
    console.error('\n❌ Hata:', error);
    process.exit(1);
  }
}

// Script'i calistir
syncFAQEmbeddings().catch(console.error);
