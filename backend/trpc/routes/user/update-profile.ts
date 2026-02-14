import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { z } from 'zod';
import { getSecureClient } from '../../../lib/supabase-secure.js';
import { TRPCError } from '@trpc/server';

const childSchema = z.object({
  name: z.string().min(1).max(50),
  age: z.number().min(0).max(18),
  birthDate: z.string().max(20).optional(), // ISO date format
  gender: z.enum(['male', 'female', 'other']).optional(),
  avatarId: z.string().max(50).optional(),
});

const updateProfileInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().max(500).optional(), // Can be avatar ID or URL
  language: z.enum(['tr', 'en', 'de', 'ru']).optional(),
  children: z.array(childSchema).max(10).optional(), // Max 10 children
  preferences: z.record(z.string().max(50), z.unknown()).optional(),
});

export const updateProfileProcedure = protectedProcedure
  .input(updateProfileInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId; // Get from authenticated context
    logger.info('[updateProfile] Updating profile:', userId);

    const supabase = await getSecureClient(ctx);

    const updates = input;

    // Prepare update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
    if (updates.language !== undefined) updateData.language = updates.language;
    if (updates.children !== undefined) updateData.children = updates.children;
    if (updates.preferences !== undefined) updateData.preferences = updates.preferences;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('[updateProfile] Error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Profil güncellenirken bir hata oluştu',
      });
    }

    logger.info('[updateProfile] Profile updated successfully');
    return data;
  });
