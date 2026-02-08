/**
 * Analysis Notes tRPC Router
 *
 * API endpoints for parent notes on analyses
 * - Add, update, delete notes
 * - Search and filter notes
 * - Professional sharing
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createLogger } from '../../lib/logger.js';
import { createTRPCRouter, protectedProcedure } from '../create-context.js';
import { getSecureClient } from '../../lib/supabase-secure.js';

const log = createLogger('AnalysisNotesAPI');

// ============================================
// Schemas
// ============================================

const noteTypeSchema = z.enum(['general', 'observation', 'question', 'follow_up', 'milestone']);

const addNoteSchema = z.object({
  analysisId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  noteType: noteTypeSchema.optional().default('general'),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  referencedInsightIndex: z.number().optional(),
  isPinned: z.boolean().optional().default(false),
});

const updateNoteSchema = z.object({
  noteId: z.string().uuid(),
  content: z.string().min(1).max(5000).optional(),
  noteType: noteTypeSchema.optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  isPinned: z.boolean().optional(),
});

const deleteNoteSchema = z.object({
  noteId: z.string().uuid(),
});

const listNotesSchema = z.object({
  analysisId: z.string().uuid(),
  noteType: noteTypeSchema.optional(),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
});

const searchNotesSchema = z.object({
  query: z.string().min(2).max(100),
  analysisId: z.string().uuid().optional(),
  limit: z.number().min(1).max(50).optional().default(20),
});

const shareWithProfessionalSchema = z.object({
  noteId: z.string().uuid(),
  share: z.boolean(),
});

// ============================================
// Router
// ============================================

export const analysisNotesRouter = createTRPCRouter({
  /**
   * Add a new note to an analysis
   */
  addNote: protectedProcedure.input(addNoteSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    log.info('[addNote] Adding note to analysis', { analysisId: input.analysisId });

    const supabase = await getSecureClient(ctx);

    // Verify analysis belongs to user
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('id')
      .eq('id', input.analysisId)
      .eq('user_id', userId)
      .single();

    if (analysisError || !analysis) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Analiz bulunamadı',
      });
    }

    // Create note
    const { data: note, error: createError } = await supabase
      .from('analysis_notes')
      .insert({
        analysis_id: input.analysisId,
        user_id: userId,
        content: input.content,
        note_type: input.noteType,
        tags: input.tags,
        referenced_insight_index: input.referencedInsightIndex,
        is_pinned: input.isPinned,
      })
      .select()
      .single();

    if (createError) {
      log.error('[addNote] Error creating note', createError);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Not eklenemedi',
      });
    }

    log.info('[addNote] Note created', { noteId: note.id });
    return { note };
  }),

  /**
   * Update an existing note
   */
  updateNote: protectedProcedure.input(updateNoteSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    log.info('[updateNote] Updating note', { noteId: input.noteId });

    const supabase = await getSecureClient(ctx);

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (input.content !== undefined) updateData.content = input.content;
    if (input.noteType !== undefined) updateData.note_type = input.noteType;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.isPinned !== undefined) updateData.is_pinned = input.isPinned;

    if (Object.keys(updateData).length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Güncellenecek alan belirtilmedi',
      });
    }

    const { data: note, error } = await supabase
      .from('analysis_notes')
      .update(updateData)
      .eq('id', input.noteId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Not bulunamadı',
        });
      }
      log.error('[updateNote] Error', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Not güncellenemedi',
      });
    }

    log.info('[updateNote] Note updated', { noteId: note.id });
    return { note };
  }),

  /**
   * Delete a note
   */
  deleteNote: protectedProcedure.input(deleteNoteSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    log.info('[deleteNote] Deleting note', { noteId: input.noteId });

    const supabase = await getSecureClient(ctx);

    const { error } = await supabase
      .from('analysis_notes')
      .delete()
      .eq('id', input.noteId)
      .eq('user_id', userId);

    if (error) {
      log.error('[deleteNote] Error', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Not silinemedi',
      });
    }

    log.info('[deleteNote] Note deleted', { noteId: input.noteId });
    return { success: true };
  }),

  /**
   * List notes for an analysis
   */
  listNotes: protectedProcedure.input(listNotesSchema).query(async ({ ctx, input }) => {
    const userId = ctx.userId;

    const supabase = await getSecureClient(ctx);

    let query = supabase
      .from('analysis_notes')
      .select('*', { count: 'exact' })
      .eq('analysis_id', input.analysisId)
      .eq('user_id', userId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    if (input.noteType) {
      query = query.eq('note_type', input.noteType);
    }

    const { data: notes, error, count } = await query;

    if (error) {
      log.error('[listNotes] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Notlar yüklenemedi',
      });
    }

    return {
      notes: notes || [],
      total: count || 0,
      hasMore: (count || 0) > input.offset + input.limit,
      offset: input.offset,
      limit: input.limit,
    };
  }),

  /**
   * Get a single note by ID
   */
  getNote: protectedProcedure
    .input(z.object({ noteId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const supabase = await getSecureClient(ctx);

      const { data: note, error } = await supabase
        .from('analysis_notes')
        .select('*')
        .eq('id', input.noteId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Not bulunamadı',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Not yüklenemedi',
        });
      }

      return { note };
    }),

  /**
   * Search notes by content
   */
  searchNotes: protectedProcedure.input(searchNotesSchema).query(async ({ ctx, input }) => {
    const userId = ctx.userId;

    const supabase = await getSecureClient(ctx);

    let query = supabase
      .from('analysis_notes')
      .select('*, analyses!inner(task_type, child_name)')
      .eq('user_id', userId)
      .ilike('content', `%${input.query}%`)
      .order('created_at', { ascending: false })
      .limit(input.limit);

    if (input.analysisId) {
      query = query.eq('analysis_id', input.analysisId);
    }

    const { data: notes, error } = await query;

    if (error) {
      log.error('[searchNotes] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Arama yapılamadı',
      });
    }

    return {
      query: input.query,
      results: notes || [],
      count: notes?.length || 0,
    };
  }),

  /**
   * Share/unshare note with professional
   */
  shareWithProfessional: protectedProcedure
    .input(shareWithProfessionalSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      log.info('[shareWithProfessional] Setting share status', { share: input.share });

      const supabase = await getSecureClient(ctx);

      const updateData: Record<string, unknown> = {
        is_shared_with_professional: input.share,
      };

      if (input.share) {
        updateData.shared_at = new Date().toISOString();
      }

      const { data: note, error } = await supabase
        .from('analysis_notes')
        .update(updateData)
        .eq('id', input.noteId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Not bulunamadı',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Paylaşım durumu güncellenemedi',
        });
      }

      return { note };
    }),

  /**
   * Get notes shared with professional across all analyses
   */
  getSharedNotes: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional().default(50) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const supabase = await getSecureClient(ctx);

      const { data: notes, error } = await supabase
        .from('analysis_notes')
        .select('*, analyses!inner(task_type, child_name, child_age, created_at)')
        .eq('user_id', userId)
        .eq('is_shared_with_professional', true)
        .order('shared_at', { ascending: false })
        .limit(input.limit);

      if (error) {
        log.error('[getSharedNotes] Error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Paylaşılan notlar yüklenemedi',
        });
      }

      return {
        notes: notes || [],
        count: notes?.length || 0,
      };
    }),

  /**
   * Get note statistics for an analysis
   */
  getStats: protectedProcedure
    .input(z.object({ analysisId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;

      const supabase = await getSecureClient(ctx);

      // Get count by type
      const { data: notes, error } = await supabase
        .from('analysis_notes')
        .select('note_type, is_pinned, is_shared_with_professional')
        .eq('analysis_id', input.analysisId)
        .eq('user_id', userId);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'İstatistikler yüklenemedi',
        });
      }

      const stats = {
        total: notes?.length || 0,
        byType: {} as Record<string, number>,
        pinned: 0,
        shared: 0,
      };

      for (const note of notes || []) {
        stats.byType[note.note_type] = (stats.byType[note.note_type] || 0) + 1;
        if (note.is_pinned) stats.pinned++;
        if (note.is_shared_with_professional) stats.shared++;
      }

      return { stats };
    }),
});
