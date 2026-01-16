-- Chatbot FAQ Embeddings with pgvector
-- Migration: 014_chatbot_embeddings.sql
-- Bu migration chatbot icin semantic search destegi ekler

-- 1. pgvector extension'i etkinlestir
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. FAQ embeddings tablosu
CREATE TABLE IF NOT EXISTS faq_embeddings (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  priority INTEGER DEFAULT 5,

  -- OpenAI text-embedding-3-small modeli 1536 boyutlu vektorler uretir
  embedding vector(1536),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- 3. Embedding icin index olustur (IVFFlat - hizli arama icin)
-- Not: En az 1000 kayit oldugunda IVFFlat daha verimli
-- Simdilik HNSW kullaniyoruz (daha az veri icin daha iyi)
CREATE INDEX IF NOT EXISTS faq_embeddings_embedding_idx
ON faq_embeddings
USING hnsw (embedding vector_cosine_ops);

-- 4. Kategori ve keyword aramalari icin indexler
CREATE INDEX IF NOT EXISTS faq_embeddings_category_idx ON faq_embeddings(category);
CREATE INDEX IF NOT EXISTS faq_embeddings_keywords_idx ON faq_embeddings USING GIN(keywords);

-- 5. updated_at trigger
CREATE TRIGGER update_faq_embeddings_updated_at
  BEFORE UPDATE ON faq_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Semantic search fonksiyonu
CREATE OR REPLACE FUNCTION search_faq_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id TEXT,
  question TEXT,
  answer TEXT,
  category TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fe.id,
    fe.question,
    fe.answer,
    fe.category,
    1 - (fe.embedding <=> query_embedding) AS similarity
  FROM faq_embeddings fe
  WHERE fe.embedding IS NOT NULL
    AND 1 - (fe.embedding <=> query_embedding) > match_threshold
  ORDER BY fe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 7. Hibrit search fonksiyonu (keyword + embedding)
CREATE OR REPLACE FUNCTION hybrid_search_faq(
  query_embedding vector(1536),
  search_keywords TEXT[],
  embedding_weight float DEFAULT 0.7,
  keyword_weight float DEFAULT 0.3,
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id TEXT,
  question TEXT,
  answer TEXT,
  category TEXT,
  embedding_score float,
  keyword_score float,
  combined_score float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fe.id,
    fe.question,
    fe.answer,
    fe.category,
    (1 - (fe.embedding <=> query_embedding))::float AS embedding_score,
    (
      SELECT COUNT(*)::float / GREATEST(array_length(search_keywords, 1), 1)
      FROM unnest(search_keywords) sk
      WHERE sk = ANY(fe.keywords) OR fe.question ILIKE '%' || sk || '%'
    ) AS keyword_score,
    (
      embedding_weight * (1 - (fe.embedding <=> query_embedding)) +
      keyword_weight * (
        SELECT COUNT(*)::float / GREATEST(array_length(search_keywords, 1), 1)
        FROM unnest(search_keywords) sk
        WHERE sk = ANY(fe.keywords) OR fe.question ILIKE '%' || sk || '%'
      )
    )::float AS combined_score
  FROM faq_embeddings fe
  WHERE fe.embedding IS NOT NULL
  ORDER BY (
    embedding_weight * (1 - (fe.embedding <=> query_embedding)) +
    keyword_weight * (
      SELECT COUNT(*)::float / GREATEST(array_length(search_keywords, 1), 1)
      FROM unnest(search_keywords) sk
      WHERE sk = ANY(fe.keywords) OR fe.question ILIKE '%' || sk || '%'
    )
  ) DESC
  LIMIT match_count;
END;
$$;

-- 8. RLS politikalari
ALTER TABLE faq_embeddings ENABLE ROW LEVEL SECURITY;

-- Service role icin tam erisim
CREATE POLICY "Service role has full access to faq_embeddings"
  ON faq_embeddings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Anon ve authenticated icin sadece okuma
CREATE POLICY "Public read access to faq_embeddings"
  ON faq_embeddings
  FOR SELECT
  USING (true);

-- 9. Izinler
GRANT ALL ON faq_embeddings TO service_role;
GRANT SELECT ON faq_embeddings TO anon;
GRANT SELECT ON faq_embeddings TO authenticated;

-- 10. Chatbot conversation logs tablosu (opsiyonel - analitik icin)
CREATE TABLE IF NOT EXISTS chatbot_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  source TEXT NOT NULL, -- 'faq', 'embedding', 'ai'
  matched_faq_id TEXT,
  confidence FLOAT,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chatbot_logs_user_idx ON chatbot_logs(user_id);
CREATE INDEX IF NOT EXISTS chatbot_logs_session_idx ON chatbot_logs(session_id);
CREATE INDEX IF NOT EXISTS chatbot_logs_source_idx ON chatbot_logs(source);
CREATE INDEX IF NOT EXISTS chatbot_logs_created_idx ON chatbot_logs(created_at DESC);

-- RLS for chatbot_logs
ALTER TABLE chatbot_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to chatbot_logs"
  ON chatbot_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read their own chatbot logs"
  ON chatbot_logs
  FOR SELECT
  USING (auth.uid() = user_id);

GRANT ALL ON chatbot_logs TO service_role;
GRANT SELECT, INSERT ON chatbot_logs TO authenticated;

COMMENT ON TABLE faq_embeddings IS 'FAQ veritabani - semantic search icin embedding vektorleri ile';
COMMENT ON TABLE chatbot_logs IS 'Chatbot konusma loglari - analitik ve iyilestirme icin';
