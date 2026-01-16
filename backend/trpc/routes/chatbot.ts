/**
 * Chatbot tRPC Router v3.0 (Faz 3)
 *
 * Yardim asistani API endpoint'leri
 * - 60+ FAQ destegi
 * - Kategori bazli gruplama
 * - FAQ arama ve istatistikler
 * - Embedding istatistikleri
 * - Chatbot kullanim analitikleri
 * - Faz 3A: Konuşma bağlamı ve konu tespiti
 * - Faz 3B: Proaktif öneriler (ekran bazlı)
 * - Faz 3E: Akıllı yönlendirme (aksiyon butonları)
 */

import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context.js";
import {
  processChat,
  getAllFAQQuestions,
  getFAQById,
  getFAQCount,
  searchFAQ,
  getProactiveSuggestion,
  getAllProactiveSuggestions,
  getSuggestionsForScreen,
  type ChatAction,
  type ProactiveSuggestion,
} from "../../lib/chatbot.js";

// Lazy import for embeddings (optional feature)
async function getEmbeddingsModule() {
  if (process.env.ENABLE_CHATBOT_EMBEDDINGS === 'true') {
    try {
      return await import('../../lib/chatbot-embeddings.js');
    } catch {
      return null;
    }
  }
  return null;
}

// ============================================
// Schemas
// ============================================

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const sendMessageSchema = z.object({
  message: z.string().min(1).max(500),
  conversationHistory: z.array(chatMessageSchema).optional(),
  sessionId: z.string().optional(),
  // Faz 3B: Hangi ekrandan mesaj gönderildiği (proaktif öneriler için)
  currentScreen: z.string().optional(),
});

// Faz 3E: Aksiyon şeması
const chatActionSchema = z.object({
  type: z.enum(['navigate', 'create', 'open', 'link']),
  label: z.string(),
  target: z.string(),
  icon: z.string().optional(),
});

// ============================================
// Router
// ============================================

export const chatbotRouter = createTRPCRouter({
  /**
   * Mesaj gonder ve cevap al
   */
  sendMessage: publicProcedure
    .input(sendMessageSchema)
    .mutation(async ({ input, ctx }) => {
      console.log('[Chatbot API] Message received:', input.message.substring(0, 50));

      const response = await processChat(
        input.message,
        input.conversationHistory || [],
        {
          sessionId: input.sessionId,
          userId: (ctx as any)?.user?.id,
        }
      );

      console.log('[Chatbot API] Response source:', response.source, 'FAQ:', response.matchedFAQ || 'N/A', 'Topic:', response.detectedTopic || 'N/A');

      return {
        message: response.message,
        source: response.source,
        suggestedQuestions: response.suggestedQuestions,
        matchedFAQ: response.matchedFAQ,
        confidence: response.confidence,
        // Faz 3E: Aksiyon butonları
        actions: response.actions,
        // Faz 3A: Tespit edilen konu
        detectedTopic: response.detectedTopic,
      };
    }),

  /**
   * Sik sorulan sorulari getir (kategorilere gore gruplu)
   */
  getFAQs: publicProcedure.query(async () => {
    const faqs = getAllFAQQuestions();

    // Group by category
    const grouped = faqs.reduce((acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push({ id: faq.id, question: faq.question });
      return acc;
    }, {} as Record<string, { id: string; question: string }[]>);

    return {
      categories: [
        { id: 'story', name: 'Masal Olusturma', emoji: '📖', questions: grouped.story || [] },
        { id: 'analysis', name: 'Cizim Analizi', emoji: '🎨', questions: grouped.analysis || [] },
        { id: 'interactive', name: 'Interaktif Masal', emoji: '🎮', questions: grouped.interactive || [] },
        { id: 'coloring', name: 'Boyama', emoji: '🖍️', questions: grouped.coloring || [] },
        { id: 'account', name: 'Hesap & Ayarlar', emoji: '⚙️', questions: grouped.account || [] },
        { id: 'technical', name: 'Teknik Destek', emoji: '🔧', questions: grouped.technical || [] },
        { id: 'general', name: 'Genel', emoji: '💡', questions: grouped.general || [] },
      ],
      totalCount: faqs.length,
    };
  }),

  /**
   * Tek bir FAQ getir (ID ile)
   */
  getFAQById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const faq = getFAQById(input.id);

      if (!faq) {
        return { found: false, faq: null };
      }

      return {
        found: true,
        faq: {
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
        },
      };
    }),

  /**
   * FAQ istatistiklerini getir (temel)
   */
  getStats: publicProcedure.query(async () => {
    const stats = getFAQCount();

    return {
      totalFAQs: stats.total,
      byCategory: stats.byCategory,
      lastUpdated: new Date().toISOString(),
    };
  }),

  /**
   * FAQ'larda arama yap
   */
  search: publicProcedure
    .input(z.object({ query: z.string().min(2).max(100) }))
    .query(async ({ input }) => {
      const results = searchFAQ(input.query);

      return {
        query: input.query,
        count: results.length,
        results: results.map(faq => ({
          id: faq.id,
          question: faq.question,
          category: faq.category,
        })),
      };
    }),

  // ============================================
  // ANALYTICS & STATISTICS (Embeddings Required)
  // ============================================

  /**
   * Chatbot kullanim istatistikleri
   * Son X gundeki konusma analitikleri
   */
  getUsageStats: publicProcedure
    .input(z.object({
      days: z.number().min(1).max(90).default(30),
    }).optional())
    .query(async ({ input }) => {
      const days = input?.days || 30;
      const embeddings = await getEmbeddingsModule();

      if (!embeddings) {
        return {
          enabled: false,
          message: 'Chatbot analytics is not enabled. Set ENABLE_CHATBOT_EMBEDDINGS=true',
          stats: null,
        };
      }

      try {
        const stats = await embeddings.getChatbotStats(days);

        // Yuzdeleri hesapla
        const total = stats.totalInteractions || 1;
        const faqPercentage = (stats.faqHits / total) * 100;
        const embeddingPercentage = (stats.embeddingHits / total) * 100;
        const aiPercentage = (stats.aiHits / total) * 100;

        return {
          enabled: true,
          period: `${days} gun`,
          stats: {
            totalInteractions: stats.totalInteractions,
            breakdown: {
              faq: {
                count: stats.faqHits,
                percentage: Math.round(faqPercentage * 10) / 10,
              },
              embedding: {
                count: stats.embeddingHits,
                percentage: Math.round(embeddingPercentage * 10) / 10,
              },
              ai: {
                count: stats.aiHits,
                percentage: Math.round(aiPercentage * 10) / 10,
              },
            },
            performance: {
              avgConfidence: Math.round(stats.avgConfidence * 10) / 10,
              avgResponseTimeMs: Math.round(stats.avgResponseTime),
            },
            costSavings: {
              // Her AI cagrisinin ~$0.001 oldugunu varsayarsak
              estimatedSaved: stats.faqHits + stats.embeddingHits,
              estimatedCostSavedUSD: ((stats.faqHits + stats.embeddingHits) * 0.001).toFixed(3),
            },
          },
        };
      } catch (error) {
        console.error('[Chatbot API] Error getting usage stats:', error);
        return {
          enabled: true,
          error: 'Failed to fetch statistics',
          stats: null,
        };
      }
    }),

  /**
   * Embedding veritabani durumu
   */
  getEmbeddingStatus: publicProcedure.query(async () => {
    const embeddings = await getEmbeddingsModule();

    if (!embeddings) {
      return {
        enabled: false,
        message: 'Embeddings not enabled',
        embeddingCount: 0,
        faqCount: getFAQCount().total,
        synced: false,
      };
    }

    try {
      const embeddingCount = await embeddings.getFAQEmbeddingCount();
      const faqCount = getFAQCount().total;

      return {
        enabled: true,
        embeddingCount,
        faqCount,
        synced: embeddingCount === faqCount,
        syncStatus: embeddingCount === faqCount
          ? 'up-to-date'
          : embeddingCount < faqCount
            ? 'needs-sync'
            : 'has-extra',
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Chatbot API] Error checking embedding status:', error);
      return {
        enabled: true,
        error: 'Failed to check embedding status',
        embeddingCount: 0,
        faqCount: getFAQCount().total,
        synced: false,
      };
    }
  }),

  /**
   * En cok sorulan sorular (top FAQs)
   */
  getTopFAQs: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(10),
      days: z.number().min(1).max(90).default(30),
    }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit || 10;
      const days = input?.days || 30;
      const embeddings = await getEmbeddingsModule();

      if (!embeddings) {
        return {
          enabled: false,
          topFAQs: [],
        };
      }

      try {
        // Supabase'den en cok eslesen FAQ'lari getir
        const { supa } = await import('../../lib/supabase.js');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supa
          .from('chatbot_logs')
          .select('matched_faq_id')
          .not('matched_faq_id', 'is', null)
          .gte('created_at', startDate.toISOString());

        if (error) throw error;

        // FAQ'lari say
        const faqCounts: Record<string, number> = {};
        for (const row of data || []) {
          if (row.matched_faq_id) {
            faqCounts[row.matched_faq_id] = (faqCounts[row.matched_faq_id] || 0) + 1;
          }
        }

        // Sirala ve limit uygula
        const sortedFAQs = Object.entries(faqCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit);

        // FAQ detaylarini ekle
        const topFAQs = sortedFAQs.map(([id, count]) => {
          const faq = getFAQById(id);
          return {
            id,
            question: faq?.question || 'Unknown',
            category: faq?.category || 'unknown',
            hitCount: count,
          };
        });

        return {
          enabled: true,
          period: `${days} gun`,
          topFAQs,
        };
      } catch (error) {
        console.error('[Chatbot API] Error getting top FAQs:', error);
        return {
          enabled: true,
          error: 'Failed to fetch top FAQs',
          topFAQs: [],
        };
      }
    }),

  /**
   * Cevaplanamayan sorular (AI'a dusen)
   */
  getUnansweredQueries: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      days: z.number().min(1).max(30).default(7),
    }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit || 20;
      const days = input?.days || 7;
      const embeddings = await getEmbeddingsModule();

      if (!embeddings) {
        return {
          enabled: false,
          queries: [],
        };
      }

      try {
        const { supa } = await import('../../lib/supabase.js');

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supa
          .from('chatbot_logs')
          .select('message, created_at')
          .eq('source', 'ai')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        // Benzersiz sorgulari grupla
        const uniqueQueries: Record<string, { count: number; lastAsked: string }> = {};
        for (const row of data || []) {
          const normalized = row.message.toLowerCase().trim();
          if (!uniqueQueries[normalized]) {
            uniqueQueries[normalized] = { count: 0, lastAsked: row.created_at };
          }
          uniqueQueries[normalized].count++;
        }

        // Sirala
        const queries = Object.entries(uniqueQueries)
          .map(([query, info]) => ({
            query,
            count: info.count,
            lastAsked: info.lastAsked,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);

        return {
          enabled: true,
          period: `${days} gun`,
          totalUnanswered: data?.length || 0,
          queries,
          suggestion: queries.length > 5
            ? 'Bu sorgular icin yeni FAQ eklemek maliyeti dusurur'
            : null,
        };
      } catch (error) {
        console.error('[Chatbot API] Error getting unanswered queries:', error);
        return {
          enabled: true,
          error: 'Failed to fetch unanswered queries',
          queries: [],
        };
      }
    }),

  /**
   * Dashboard icin ozet istatistikler
   */
  getDashboardStats: publicProcedure.query(async () => {
    const faqStats = getFAQCount();
    const embeddings = await getEmbeddingsModule();

    // Temel istatistikler
    const baseStats = {
      faq: {
        total: faqStats.total,
        byCategory: faqStats.byCategory,
      },
      embeddings: {
        enabled: false,
        count: 0,
      },
      usage: null as any,
    };

    if (!embeddings) {
      return baseStats;
    }

    try {
      // Embedding sayisi
      const embeddingCount = await embeddings.getFAQEmbeddingCount();

      // Son 7 gunluk kullanim
      const usageStats = await embeddings.getChatbotStats(7);

      return {
        faq: {
          total: faqStats.total,
          byCategory: faqStats.byCategory,
        },
        embeddings: {
          enabled: true,
          count: embeddingCount,
          synced: embeddingCount === faqStats.total,
        },
        usage: {
          last7Days: {
            total: usageStats.totalInteractions,
            faqHits: usageStats.faqHits,
            embeddingHits: usageStats.embeddingHits,
            aiHits: usageStats.aiHits,
            hitRate: usageStats.totalInteractions > 0
              ? Math.round(((usageStats.faqHits + usageStats.embeddingHits) / usageStats.totalInteractions) * 100)
              : 0,
            avgResponseMs: Math.round(usageStats.avgResponseTime),
          },
        },
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Chatbot API] Error getting dashboard stats:', error);
      return {
        ...baseStats,
        error: 'Failed to fetch complete statistics',
      };
    }
  }),

  // ============================================
  // FAZ 3B: PROAKTİF ÖNERİLER
  // ============================================

  /**
   * Belirli bir ekran ve tetikleyici için proaktif öneri getir
   */
  getProactiveSuggestion: publicProcedure
    .input(z.object({
      screen: z.string(),
      trigger: z.enum(['enter', 'idle', 'error', 'first_visit']),
    }))
    .query(async ({ input }) => {
      const suggestion = getProactiveSuggestion(input.screen, input.trigger);

      if (!suggestion) {
        return {
          found: false,
          suggestion: null,
        };
      }

      return {
        found: true,
        suggestion: {
          id: suggestion.id,
          message: suggestion.message,
          questions: suggestion.questions,
          screen: suggestion.screen,
          trigger: suggestion.trigger,
        },
      };
    }),

  /**
   * Belirli bir ekran için tüm proaktif önerileri getir
   */
  getScreenSuggestions: publicProcedure
    .input(z.object({
      screen: z.string(),
    }))
    .query(async ({ input }) => {
      const suggestions = getSuggestionsForScreen(input.screen);

      return {
        screen: input.screen,
        suggestions: suggestions.map(s => ({
          id: s.id,
          trigger: s.trigger,
          message: s.message,
          questions: s.questions,
          priority: s.priority,
        })),
      };
    }),

  /**
   * Tüm proaktif önerileri getir (admin/debug için)
   */
  getAllProactiveSuggestions: publicProcedure.query(async () => {
    const suggestions = getAllProactiveSuggestions();

    // Ekrana göre grupla
    const byScreen: Record<string, Array<{
      id: string;
      trigger: string;
      message: string;
      questions: string[];
      priority: number;
    }>> = {};

    for (const s of suggestions) {
      if (!byScreen[s.screen]) {
        byScreen[s.screen] = [];
      }
      byScreen[s.screen].push({
        id: s.id,
        trigger: s.trigger,
        message: s.message,
        questions: s.questions,
        priority: s.priority,
      });
    }

    return {
      total: suggestions.length,
      screens: Object.keys(byScreen),
      byScreen,
    };
  }),
});
