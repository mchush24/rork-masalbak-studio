/**
 * Chatbot tRPC Router
 *
 * Yardım asistanı API endpoint'leri
 */

import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../create-context.js";
import { processChat, getAllFAQQuestions } from "../../lib/chatbot.js";

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
});

// ============================================
// Router
// ============================================

export const chatbotRouter = createTRPCRouter({
  /**
   * Mesaj gönder ve cevap al
   */
  sendMessage: publicProcedure
    .input(sendMessageSchema)
    .mutation(async ({ input }) => {
      console.log('[Chatbot API] Message received:', input.message.substring(0, 50));

      const response = await processChat(
        input.message,
        input.conversationHistory || []
      );

      console.log('[Chatbot API] Response source:', response.source);

      return {
        message: response.message,
        source: response.source,
        suggestedQuestions: response.suggestedQuestions,
      };
    }),

  /**
   * Sık sorulan soruları getir
   */
  getFAQs: publicProcedure.query(async () => {
    const faqs = getAllFAQQuestions();

    // Group by category
    const grouped = faqs.reduce((acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push(faq.question);
      return acc;
    }, {} as Record<string, string[]>);

    return {
      categories: [
        { id: 'story', name: 'Hikaye Oluşturma', emoji: '📖', questions: grouped.story || [] },
        { id: 'interactive', name: 'İnteraktif Masal', emoji: '🎮', questions: grouped.interactive || [] },
        { id: 'analysis', name: 'Çizim Analizi', emoji: '🎨', questions: grouped.analysis || [] },
        { id: 'account', name: 'Hesap & Ayarlar', emoji: '⚙️', questions: grouped.account || [] },
        { id: 'general', name: 'Genel', emoji: '💡', questions: grouped.general || [] },
      ],
    };
  }),
});
