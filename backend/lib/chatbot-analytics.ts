/**
 * Chatbot Analytics Module
 *
 * Faz 6: Cevaplanamayan sorulari kaydet ve analiz et
 * Bu modul chatbot'un cevaplayamadigi veya dusuk guvenle cevapladigi
 * sorulari Supabase'e kaydeder. Bu veriler FAQ gelistirmek ve
 * chatbot'u iyilestirmek icin kullanilir.
 */

import { supa as supabase } from './supabase';

// ============================================
// TYPES
// ============================================

export type UnansweredReason =
  | 'no_faq_match' // Hic FAQ eslesmesi yok
  | 'low_confidence' // FAQ eslesmesi var ama dusuk guven
  | 'ai_fallback' // AI'ya dusuldu
  | 'error'; // Hata olustu

export interface UnansweredQueryData {
  userId?: string;
  sessionId?: string;
  query: string;
  normalizedQuery: string;
  detectedIntent?: string;
  detectedEmotion?: string;
  reason: UnansweredReason;
  confidence?: number;
  attemptedFaqId?: string;
  currentScreen?: string;
  childAge?: number;
  conversationLength?: number;
  aiResponse?: string;
}

export interface UnansweredStats {
  totalUnanswered: number;
  byReason: Record<string, number>;
  byIntent: Record<string, number>;
  byScreen: Record<string, number>;
  avgConfidence: number;
}

export interface CommonUnansweredQuery {
  normalizedQuery: string;
  detectedIntent: string | null;
  occurrenceCount: number;
  lastSeen: string;
  reasons: string[];
}

// ============================================
// LOGGING FUNCTIONS
// ============================================

/**
 * Cevaplanamayan bir soruyu kaydet
 * Bu fonksiyon async olarak calisir ve hatalari sessizce yakalar
 */
export async function logUnansweredQuery(data: UnansweredQueryData): Promise<void> {
  try {
    const { error } = await supabase
      .from('chatbot_unanswered_queries')
      .insert({
        user_id: data.userId,
        session_id: data.sessionId,
        query: data.query,
        normalized_query: data.normalizedQuery,
        detected_intent: data.detectedIntent,
        detected_emotion: data.detectedEmotion,
        reason: data.reason,
        confidence: data.confidence,
        attempted_faq_id: data.attemptedFaqId,
        current_screen: data.currentScreen,
        child_age: data.childAge,
        conversation_length: data.conversationLength,
        ai_response: data.aiResponse?.substring(0, 500), // Truncate for storage
      });

    if (error) {
      console.warn('[ChatbotAnalytics] Failed to log unanswered query:', error.message);
    } else {
      console.log('[ChatbotAnalytics] Logged unanswered query:', {
        reason: data.reason,
        intent: data.detectedIntent,
        confidence: data.confidence?.toFixed(2),
      });
    }
  } catch (err) {
    // Silently fail - analytics shouldn't break the chatbot
    console.warn('[ChatbotAnalytics] Error logging unanswered query:', err);
  }
}

/**
 * Birden fazla cevaplanamayan soruyu toplu kaydet
 */
export async function logUnansweredQueriesBatch(queries: UnansweredQueryData[]): Promise<void> {
  if (queries.length === 0) return;

  try {
    const { error } = await supabase
      .from('chatbot_unanswered_queries')
      .insert(
        queries.map(data => ({
          user_id: data.userId,
          session_id: data.sessionId,
          query: data.query,
          normalized_query: data.normalizedQuery,
          detected_intent: data.detectedIntent,
          detected_emotion: data.detectedEmotion,
          reason: data.reason,
          confidence: data.confidence,
          attempted_faq_id: data.attemptedFaqId,
          current_screen: data.currentScreen,
          child_age: data.childAge,
          conversation_length: data.conversationLength,
          ai_response: data.aiResponse?.substring(0, 500),
        }))
      );

    if (error) {
      console.warn('[ChatbotAnalytics] Failed to batch log queries:', error.message);
    }
  } catch (err) {
    console.warn('[ChatbotAnalytics] Error batch logging queries:', err);
  }
}

// ============================================
// ANALYTICS FUNCTIONS
// ============================================

/**
 * En sik cevaplanamayan sorulari getir
 */
export async function getTopUnansweredQueries(
  daysBack: number = 30,
  limit: number = 20
): Promise<CommonUnansweredQuery[]> {
  try {
    const { data, error } = await supabase.rpc('get_top_unanswered_queries', {
      days_back: daysBack,
      limit_count: limit,
    });

    if (error) {
      console.error('[ChatbotAnalytics] Failed to get top unanswered:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      normalizedQuery: row.normalized_query,
      detectedIntent: row.detected_intent,
      occurrenceCount: row.occurrence_count,
      lastSeen: row.last_seen,
      reasons: row.reasons,
    }));
  } catch (err) {
    console.error('[ChatbotAnalytics] Error getting top unanswered:', err);
    return [];
  }
}

/**
 * Cevaplanamayan sorular istatistiklerini getir
 */
export async function getUnansweredStats(daysBack: number = 30): Promise<UnansweredStats | null> {
  try {
    const { data, error } = await supabase.rpc('get_unanswered_stats', {
      days_back: daysBack,
    });

    if (error) {
      console.error('[ChatbotAnalytics] Failed to get stats:', error);
      return null;
    }

    const row = data?.[0];
    if (!row) return null;

    return {
      totalUnanswered: row.total_unanswered || 0,
      byReason: row.by_reason || {},
      byIntent: row.by_intent || {},
      byScreen: row.by_screen || {},
      avgConfidence: row.avg_confidence || 0,
    };
  } catch (err) {
    console.error('[ChatbotAnalytics] Error getting stats:', err);
    return null;
  }
}

/**
 * Son N cevaplanamayan soruyu getir
 */
export async function getRecentUnansweredQueries(
  limit: number = 50,
  offset: number = 0
): Promise<UnansweredQueryData[]> {
  try {
    const { data, error } = await supabase
      .from('chatbot_unanswered_queries')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[ChatbotAnalytics] Failed to get recent queries:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      userId: row.user_id,
      sessionId: row.session_id,
      query: row.query,
      normalizedQuery: row.normalized_query,
      detectedIntent: row.detected_intent,
      detectedEmotion: row.detected_emotion,
      reason: row.reason,
      confidence: row.confidence,
      attemptedFaqId: row.attempted_faq_id,
      currentScreen: row.current_screen,
      childAge: row.child_age,
      conversationLength: row.conversation_length,
      aiResponse: row.ai_response,
    }));
  } catch (err) {
    console.error('[ChatbotAnalytics] Error getting recent queries:', err);
    return [];
  }
}

/**
 * Belirli bir intent icin cevaplanamayan sorulari getir
 */
export async function getUnansweredByIntent(
  intent: string,
  limit: number = 20
): Promise<UnansweredQueryData[]> {
  try {
    const { data, error } = await supabase
      .from('chatbot_unanswered_queries')
      .select('*')
      .eq('detected_intent', intent)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[ChatbotAnalytics] Failed to get by intent:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      userId: row.user_id,
      sessionId: row.session_id,
      query: row.query,
      normalizedQuery: row.normalized_query,
      detectedIntent: row.detected_intent,
      detectedEmotion: row.detected_emotion,
      reason: row.reason,
      confidence: row.confidence,
      attemptedFaqId: row.attempted_faq_id,
      currentScreen: row.current_screen,
      childAge: row.child_age,
      conversationLength: row.conversation_length,
      aiResponse: row.ai_response,
    }));
  } catch (err) {
    console.error('[ChatbotAnalytics] Error getting by intent:', err);
    return [];
  }
}

/**
 * Kullanici geri bildirimini guncelle
 */
export async function updateQueryFeedback(
  queryId: string,
  helpful: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('chatbot_unanswered_queries')
      .update({ ai_response_helpful: helpful })
      .eq('id', queryId);

    if (error) {
      console.error('[ChatbotAnalytics] Failed to update feedback:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[ChatbotAnalytics] Error updating feedback:', err);
    return false;
  }
}

// ============================================
// HELPER: Text normalization (same as chatbot.ts)
// ============================================

export function normalizeTextForAnalytics(text: string): string {
  return text
    .toLowerCase()
    .replace(/[?!.,;:'"()[\]{}]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/\s+/g, ' ')
    .trim();
}
