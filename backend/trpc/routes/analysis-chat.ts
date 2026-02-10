/**
 * Analysis Chat tRPC Router
 *
 * API endpoints for analysis-specific chat conversations with Ioo
 * - Start/continue conversations
 * - Context-aware AI responses based on analysis content
 * - Reflection prompts for parents
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createLogger } from '../../lib/logger.js';
import { createTRPCRouter, protectedProcedure } from '../create-context.js';
import { getSecureClient } from '../../lib/supabase-secure.js';
import {
  generateAnalysisChatResponse,
  REFLECTION_PROMPTS,
} from '../../lib/analysis-chat-context.js';

const log = createLogger('AnalysisChatAPI');

// ============================================
// Schemas
// ============================================

const _messageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string().max(5000),
  timestamp: z.string(),
  referencedInsightIndex: z.number().optional(),
});

const startConversationSchema = z.object({
  analysisId: z.string().uuid(),
});

const sendMessageSchema = z.object({
  analysisId: z.string().uuid(),
  message: z.string().min(1).max(1000),
  conversationId: z.string().uuid().optional(),
  referencedInsightIndex: z.number().optional(),
});

const getConversationSchema = z.object({
  analysisId: z.string().uuid(),
});

const completePromptSchema = z.object({
  conversationId: z.string().uuid(),
  promptId: z.string(),
});

// ============================================
// Router
// ============================================

export const analysisChatRouter = createTRPCRouter({
  /**
   * Start or get existing conversation for an analysis
   */
  startConversation: protectedProcedure
    .input(startConversationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      log.info('[startConversation] Starting for analysis', { analysisId: input.analysisId });

      const supabase = await getSecureClient(ctx);

      // Check if analysis exists and belongs to user
      const { data: analysis, error: analysisError } = await supabase
        .from('analyses')
        .select('id, child_age, child_name, language, analysis_result')
        .eq('id', input.analysisId)
        .eq('user_id', userId)
        .single();

      if (analysisError || !analysis) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Analiz bulunamadı',
        });
      }

      // Check for existing conversation
      const { data: existingConversation } = await supabase
        .from('analysis_conversations')
        .select('*')
        .eq('analysis_id', input.analysisId)
        .eq('user_id', userId)
        .single();

      if (existingConversation) {
        log.info('[startConversation] Found existing conversation', {
          conversationId: existingConversation.id,
        });
        return {
          conversation: existingConversation,
          isNew: false,
        };
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('analysis_conversations')
        .insert({
          analysis_id: input.analysisId,
          user_id: userId,
          child_age: analysis.child_age,
          child_name: analysis.child_name,
          language: analysis.language || 'tr',
          messages: [],
          prompts_completed: [],
          session_count: 1,
        })
        .select()
        .single();

      if (createError) {
        log.error('[startConversation] Error creating conversation', createError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Sohbet başlatılamadı',
        });
      }

      log.info('[startConversation] Created new conversation', {
        conversationId: newConversation.id,
      });
      return {
        conversation: newConversation,
        isNew: true,
      };
    }),

  /**
   * Send a message and get AI response
   */
  sendMessage: protectedProcedure.input(sendMessageSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    log.info('[sendMessage] Processing message for analysis', { analysisId: input.analysisId });

    const supabase = await getSecureClient(ctx);

    // Get analysis with its content
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('id, child_age, child_name, language, analysis_result, task_type')
      .eq('id', input.analysisId)
      .eq('user_id', userId)
      .single();

    if (analysisError || !analysis) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Analiz bulunamadı',
      });
    }

    // Get or create conversation
    let conversationId = input.conversationId;
    let messages: { role: 'user' | 'assistant'; content: string }[] = [];

    if (conversationId) {
      const { data: conversation, error: convError } = await supabase
        .from('analysis_conversations')
        .select('id, messages')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();

      if (convError || !conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sohbet bulunamadı',
        });
      }
      messages = conversation.messages || [];
    } else {
      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('analysis_conversations')
        .insert({
          analysis_id: input.analysisId,
          user_id: userId,
          child_age: analysis.child_age,
          child_name: analysis.child_name,
          language: analysis.language || 'tr',
          messages: [],
        })
        .select()
        .single();

      if (createError || !newConv) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Sohbet oluşturulamadı',
        });
      }
      conversationId = newConv.id;
    }

    // Create user message
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: input.message,
      timestamp: new Date().toISOString(),
      referencedInsightIndex: input.referencedInsightIndex,
    };

    // Generate AI response
    const aiResponse = await generateAnalysisChatResponse({
      message: input.message,
      analysisResult: analysis.analysis_result,
      taskType: analysis.task_type,
      childAge: analysis.child_age,
      childName: analysis.child_name,
      conversationHistory: messages,
      referencedInsightIndex: input.referencedInsightIndex,
    });

    // Create assistant message
    const assistantMessage = {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      content: aiResponse.message,
      timestamp: new Date().toISOString(),
      referencedInsightIndex: aiResponse.referencedInsightIndex,
      metadata: {
        suggestedQuestions: aiResponse.suggestedQuestions,
        source: aiResponse.source,
        confidence: aiResponse.confidence,
      },
    };

    // Update conversation with both messages
    const updatedMessages = [...messages, userMessage, assistantMessage];

    const { error: updateError } = await supabase
      .from('analysis_conversations')
      .update({
        messages: updatedMessages,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    if (updateError) {
      log.error('[sendMessage] Error updating conversation:', updateError);
    }

    log.info('[sendMessage] Response generated successfully');

    return {
      conversationId,
      userMessage,
      assistantMessage,
      suggestedQuestions: aiResponse.suggestedQuestions,
    };
  }),

  /**
   * Get conversation for an analysis
   */
  getConversation: protectedProcedure.input(getConversationSchema).query(async ({ ctx, input }) => {
    const userId = ctx.userId;

    const supabase = await getSecureClient(ctx);

    const { data: conversation, error } = await supabase
      .from('analysis_conversations')
      .select('*')
      .eq('analysis_id', input.analysisId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      log.error('[getConversation] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Sohbet yüklenemedi',
      });
    }

    return {
      conversation: conversation || null,
      exists: !!conversation,
    };
  }),

  /**
   * Get reflection prompts
   */
  getReflectionPrompts: protectedProcedure.query(async () => {
    return {
      prompts: REFLECTION_PROMPTS,
    };
  }),

  /**
   * Mark a reflection prompt as completed
   */
  completePrompt: protectedProcedure
    .input(completePromptSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const supabase = await getSecureClient(ctx);

      // Get current prompts_completed
      const { data: conversation, error: getError } = await supabase
        .from('analysis_conversations')
        .select('prompts_completed')
        .eq('id', input.conversationId)
        .eq('user_id', userId)
        .single();

      if (getError || !conversation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sohbet bulunamadı',
        });
      }

      const currentPrompts = conversation.prompts_completed || [];
      if (currentPrompts.includes(input.promptId)) {
        return { success: true, alreadyCompleted: true };
      }

      // Add prompt to completed list
      const { error: updateError } = await supabase
        .from('analysis_conversations')
        .update({
          prompts_completed: [...currentPrompts, input.promptId],
        })
        .eq('id', input.conversationId);

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Güncellenemedi',
        });
      }

      return { success: true, alreadyCompleted: false };
    }),

  /**
   * Get quick prompts based on analysis content
   */
  getQuickPrompts: protectedProcedure
    .input(z.object({ analysisId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const supabase = await getSecureClient(ctx);

      // Get analysis
      const { data: analysis, error } = await supabase
        .from('analyses')
        .select('analysis_result, task_type')
        .eq('id', input.analysisId)
        .eq('user_id', userId)
        .single();

      if (error || !analysis) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Analiz bulunamadı',
        });
      }

      // Generate context-aware quick prompts
      const analysisResult = analysis.analysis_result || {};
      const insights = analysisResult.insights || [];
      const riskFlags = analysisResult.riskFlags || [];

      const quickPrompts = [
        {
          id: 'general_meaning',
          label: 'Bu ne anlama geliyor?',
          emoji: '🤔',
          question: 'Bu analiz sonuçları ne anlama geliyor? Basitçe açıklar mısın?',
          category: 'general',
        },
        {
          id: 'home_activities',
          label: 'Evde ne yapabilirim?',
          emoji: '🏠',
          question: 'Bu analiz sonuçlarına göre evde çocuğumla neler yapabilirim?',
          category: 'action',
        },
        {
          id: 'concern_level',
          label: 'Endişelenmeli miyim?',
          emoji: '💭',
          question: 'Bu sonuçlar hakkında endişelenmeli miyim?',
          category: 'emotional',
        },
        {
          id: 'age_appropriate',
          label: 'Yaşına uygun mu?',
          emoji: '📊',
          question: 'Bu sonuçlar çocuğumun yaşı için normal mi?',
          category: 'developmental',
        },
      ];

      // Add insight-specific prompts
      if (insights.length > 0) {
        quickPrompts.push({
          id: 'first_insight',
          label: insights[0].title?.substring(0, 20) + '...',
          emoji: '💡',
          question: `"${insights[0].title}" hakkında daha fazla bilgi verir misin?`,
          category: 'insight',
        });
      }

      // Add risk-related prompt if there are risk flags
      if (riskFlags.length > 0) {
        quickPrompts.push({
          id: 'professional_help',
          label: 'Uzman desteği',
          emoji: '👨‍⚕️',
          question: 'Bir uzmana danışmam gerekir mi? Ne zaman profesyonel yardım almalıyım?',
          category: 'professional',
        });
      }

      return { quickPrompts };
    }),
});
