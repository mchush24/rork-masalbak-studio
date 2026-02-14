import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { getSecureClient } from '../../../lib/supabase-secure.js';
import { TRPCError } from '@trpc/server';

export const exportDataProcedure = protectedProcedure.mutation(async ({ ctx }) => {
  const userId = ctx.userId;
  logger.info('[exportData] User requesting data export:', userId);

  const supabase = await getSecureClient(ctx);

  // Fetch all user data from all tables
  // This is GDPR compliance - user has right to access their data

  // 1. User profile
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError) {
    logger.error('[exportData] Error fetching user:', userError);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Kullanıcı verileri alınırken bir hata oluştu',
    });
  }

  // Remove sensitive fields from export
  const { password_hash: _password_hash, ...userDataSafe } = userData || {};

  // 2. User settings
  const { data: settingsData, error: settingsError } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (settingsError && settingsError.code !== 'PGRST116') {
    // PGRST116 = not found, which is ok
    logger.error('[exportData] Error fetching settings:', settingsError);
  }

  // 3. Analyses
  const { data: analysesData, error: analysesError } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (analysesError) {
    logger.error('[exportData] Error fetching analyses:', analysesError);
  }

  // 4. Storybooks
  const { data: storybooksData, error: storybooksError } = await supabase
    .from('storybooks')
    .select('*')
    .eq('user_id_fk', userId)
    .order('created_at', { ascending: false });

  if (storybooksError) {
    logger.error('[exportData] Error fetching storybooks:', storybooksError);
  }

  // 5. Colorings
  const { data: coloringsData, error: coloringsError } = await supabase
    .from('colorings')
    .select('*')
    .eq('user_id_fk', userId)
    .order('created_at', { ascending: false });

  if (coloringsError) {
    logger.error('[exportData] Error fetching colorings:', coloringsError);
  }

  // Compile all data into a single export object
  const exportData = {
    exportedAt: new Date().toISOString(),
    userId: userId,
    profile: userDataSafe,
    settings: settingsData || null,
    analyses: {
      total: analysesData?.length || 0,
      data: analysesData || [],
    },
    storybooks: {
      total: storybooksData?.length || 0,
      data: storybooksData || [],
    },
    colorings: {
      total: coloringsData?.length || 0,
      data: coloringsData || [],
    },
    metadata: {
      exportVersion: '1.0',
      note: 'This is a complete export of your personal data as stored in Renkioo. This export was generated in compliance with GDPR Article 20 (Right to data portability).',
    },
  };

  logger.info('[exportData] ✅ Data export completed:', {
    userId,
    analysesCount: analysesData?.length || 0,
    storybooksCount: storybooksData?.length || 0,
    coloringsCount: coloringsData?.length || 0,
  });

  return exportData;
});
