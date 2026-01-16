/**
 * Chatbot Embeddings Service
 *
 * OpenAI text-embedding-3-small ile semantic search
 * Supabase pgvector entegrasyonu
 */

import OpenAI from 'openai';
import { supa } from './supabase.js';

// ============================================
// TYPES
// ============================================

export interface FAQEmbedding {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  priority: number;
  embedding?: number[];
}

export interface SemanticSearchResult {
  id: string;
  question: string;
  answer: string;
  category: string;
  similarity: number;
}

export interface HybridSearchResult extends SemanticSearchResult {
  embeddingScore: number;
  keywordScore: number;
  combinedScore: number;
}

// ============================================
// OPENAI CLIENT
// ============================================

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for embeddings');
  }
  return new OpenAI({ apiKey });
}

// ============================================
// EMBEDDING FUNCTIONS
// ============================================

/**
 * Tek bir metin icin embedding olustur
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();

  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 1536, // text-embedding-3-small varsayilan
  });

  return response.data[0].embedding;
}

/**
 * Birden fazla metin icin toplu embedding olustur
 */
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const client = getOpenAIClient();

  // OpenAI batch limit: 2048 texts per request
  const batchSize = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    const response = await client.embeddings.create({
      model: 'text-embedding-3-small',
      input: batch,
      dimensions: 1536,
    });

    const embeddings = response.data.map(d => d.embedding);
    allEmbeddings.push(...embeddings);

    // Rate limiting - kucuk bir bekleme
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return allEmbeddings;
}

// ============================================
// DATABASE OPERATIONS
// ============================================

/**
 * FAQ'lari Supabase'e kaydet (embedding ile birlikte)
 */
export async function upsertFAQEmbeddings(faqs: FAQEmbedding[]): Promise<void> {
  console.log(`[Embeddings] Upserting ${faqs.length} FAQs...`);

  // Embedding'leri olustur
  const texts = faqs.map(faq => `${faq.question}\n${faq.answer}`);
  const embeddings = await createEmbeddings(texts);

  console.log(`[Embeddings] Created ${embeddings.length} embeddings`);

  // Batch upsert
  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i];
    const embedding = embeddings[i];

    const { error } = await supa
      .from('faq_embeddings')
      .upsert({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        keywords: faq.keywords,
        priority: faq.priority,
        embedding: `[${embedding.join(',')}]`, // pgvector format
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (error) {
      console.error(`[Embeddings] Error upserting FAQ ${faq.id}:`, error);
      throw error;
    }
  }

  console.log(`[Embeddings] Successfully upserted ${faqs.length} FAQs`);
}

/**
 * Tek bir FAQ guncelle
 */
export async function updateFAQEmbedding(faq: FAQEmbedding): Promise<void> {
  const text = `${faq.question}\n${faq.answer}`;
  const embedding = await createEmbedding(text);

  const { error } = await supa
    .from('faq_embeddings')
    .upsert({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      keywords: faq.keywords,
      priority: faq.priority,
      embedding: `[${embedding.join(',')}]`,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    });

  if (error) {
    throw error;
  }
}

/**
 * FAQ sil
 */
export async function deleteFAQEmbedding(id: string): Promise<void> {
  const { error } = await supa
    .from('faq_embeddings')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

/**
 * Semantic search - sadece embedding ile
 */
export async function semanticSearch(
  query: string,
  options: {
    matchThreshold?: number;
    matchCount?: number;
    category?: string;
  } = {}
): Promise<SemanticSearchResult[]> {
  const {
    matchThreshold = 0.5,
    matchCount = 5,
    category,
  } = options;

  // Query icin embedding olustur
  const queryEmbedding = await createEmbedding(query);

  // Supabase RPC ile search
  const { data, error } = await supa.rpc('search_faq_embeddings', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    console.error('[Embeddings] Semantic search error:', error);
    throw error;
  }

  let results = data as SemanticSearchResult[];

  // Kategori filtresi
  if (category) {
    results = results.filter(r => r.category === category);
  }

  return results;
}

/**
 * Hibrit search - embedding + keyword
 */
export async function hybridSearch(
  query: string,
  keywords: string[],
  options: {
    embeddingWeight?: number;
    keywordWeight?: number;
    matchThreshold?: number;
    matchCount?: number;
  } = {}
): Promise<HybridSearchResult[]> {
  const {
    embeddingWeight = 0.7,
    keywordWeight = 0.3,
    matchThreshold = 0.3,
    matchCount = 5,
  } = options;

  // Query icin embedding olustur
  const queryEmbedding = await createEmbedding(query);

  // Supabase RPC ile hybrid search
  const { data, error } = await supa.rpc('hybrid_search_faq', {
    query_embedding: `[${queryEmbedding.join(',')}]`,
    search_keywords: keywords,
    embedding_weight: embeddingWeight,
    keyword_weight: keywordWeight,
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) {
    console.error('[Embeddings] Hybrid search error:', error);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    similarity: row.combined_score,
    embeddingScore: row.embedding_score,
    keywordScore: row.keyword_score,
    combinedScore: row.combined_score,
  }));
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Veritabanindaki FAQ sayisini getir
 */
export async function getFAQEmbeddingCount(): Promise<number> {
  const { count, error } = await supa
    .from('faq_embeddings')
    .select('*', { count: 'exact', head: true });

  if (error) {
    throw error;
  }

  return count || 0;
}

/**
 * Tum FAQ'lari getir (embedding olmadan)
 */
export async function getAllFAQEmbeddings(): Promise<Omit<FAQEmbedding, 'embedding'>[]> {
  const { data, error } = await supa
    .from('faq_embeddings')
    .select('id, question, answer, category, keywords, priority')
    .order('category')
    .order('priority', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Belirli bir kategori icin FAQ'lari getir
 */
export async function getFAQsByCategory(category: string): Promise<Omit<FAQEmbedding, 'embedding'>[]> {
  const { data, error } = await supa
    .from('faq_embeddings')
    .select('id, question, answer, category, keywords, priority')
    .eq('category', category)
    .order('priority', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

// ============================================
// CHATBOT LOG FUNCTIONS
// ============================================

export interface ChatbotLogEntry {
  userId?: string;
  sessionId?: string;
  message: string;
  response: string;
  source: 'faq' | 'embedding' | 'ai';
  matchedFaqId?: string;
  confidence?: number;
  responseTimeMs?: number;
}

/**
 * Chatbot konusmasini logla
 */
export async function logChatbotInteraction(entry: ChatbotLogEntry): Promise<void> {
  const { error } = await supa
    .from('chatbot_logs')
    .insert({
      user_id: entry.userId || null,
      session_id: entry.sessionId || null,
      message: entry.message,
      response: entry.response,
      source: entry.source,
      matched_faq_id: entry.matchedFaqId || null,
      confidence: entry.confidence || null,
      response_time_ms: entry.responseTimeMs || null,
    });

  if (error) {
    // Loglama hatasi kritik degil, sadece uyari ver
    console.warn('[Chatbot] Failed to log interaction:', error.message);
  }
}

/**
 * Chatbot istatistiklerini getir
 */
export async function getChatbotStats(days: number = 30): Promise<{
  totalInteractions: number;
  faqHits: number;
  embeddingHits: number;
  aiHits: number;
  avgConfidence: number;
  avgResponseTime: number;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supa
    .from('chatbot_logs')
    .select('source, confidence, response_time_ms')
    .gte('created_at', startDate.toISOString());

  if (error) {
    throw error;
  }

  const logs = data || [];
  const totalInteractions = logs.length;
  const faqHits = logs.filter(l => l.source === 'faq').length;
  const embeddingHits = logs.filter(l => l.source === 'embedding').length;
  const aiHits = logs.filter(l => l.source === 'ai').length;

  const confidences = logs.filter(l => l.confidence != null).map(l => l.confidence);
  const avgConfidence = confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0;

  const responseTimes = logs.filter(l => l.response_time_ms != null).map(l => l.response_time_ms);
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  return {
    totalInteractions,
    faqHits,
    embeddingHits,
    aiHits,
    avgConfidence,
    avgResponseTime,
  };
}
