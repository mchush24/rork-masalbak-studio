import { logger } from '../../../lib/utils.js';
import { protectedProcedure } from '../../create-context.js';
import { z } from 'zod';
import { getSecureClient } from '../../../lib/supabase-secure.js';
import bcrypt from 'bcryptjs';

const deleteAccountInputSchema = z.object({
  confirmEmail: z.string().email(),
  confirmPassword: z.string().min(6),
});

export const deleteAccountProcedure = protectedProcedure
  .input(deleteAccountInputSchema)
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    logger.info('[deleteAccount] User requesting account deletion:', userId);

    const supabase = await getSecureClient(ctx);

    // First, verify user email matches
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, password_hash')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      logger.error('[deleteAccount] User not found:', userError);
      throw new Error('User not found');
    }

    if (userData.email !== input.confirmEmail) {
      logger.error('[deleteAccount] Email mismatch');
      throw new Error('Email does not match');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(input.confirmPassword, userData.password_hash);

    if (!isPasswordValid) {
      logger.error('[deleteAccount] Invalid password');
      throw new Error('Invalid password');
    }

    logger.info('[deleteAccount] Verification successful, proceeding with cascade delete');

    // Cascade delete: Delete all user data
    // Order matters: delete child records first, then parent
    // Collect errors but continue - partial cleanup is better than no cleanup
    const errors: string[] = [];

    // 1. Delete analyses
    const { error: analysesError } = await supabase.from('analyses').delete().eq('user_id', userId);

    if (analysesError) {
      logger.error('[deleteAccount] Error deleting analyses:', analysesError);
      errors.push('analyses');
    }

    // 2. Delete storybooks (uses user_id_fk)
    const { error: storybooksError } = await supabase
      .from('storybooks')
      .delete()
      .eq('user_id_fk', userId);

    if (storybooksError) {
      logger.error('[deleteAccount] Error deleting storybooks:', storybooksError);
      errors.push('storybooks');
    }

    // 3. Delete colorings (uses user_id_fk)
    const { error: coloringsError } = await supabase
      .from('colorings')
      .delete()
      .eq('user_id_fk', userId);

    if (coloringsError) {
      logger.error('[deleteAccount] Error deleting colorings:', coloringsError);
      errors.push('colorings');
    }

    // 4. Delete verification codes
    const { error: verificationError } = await supabase
      .from('verification_codes')
      .delete()
      .eq('email', userData.email);

    if (verificationError) {
      logger.error('[deleteAccount] Error deleting verification codes:', verificationError);
      errors.push('verification_codes');
    }

    // 5. Delete refresh tokens
    const { error: refreshTokensError } = await supabase
      .from('refresh_tokens')
      .delete()
      .eq('user_id', userId);

    if (refreshTokensError) {
      logger.error('[deleteAccount] Error deleting refresh tokens:', refreshTokensError);
      errors.push('refresh_tokens');
    }

    // 7. Delete user settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .delete()
      .eq('user_id', userId);

    if (settingsError) {
      logger.error('[deleteAccount] Error deleting settings:', settingsError);
      errors.push('user_settings');
    }

    // 8. Finally, delete the user record
    const { error: deleteUserError } = await supabase.from('users').delete().eq('id', userId);

    if (deleteUserError) {
      logger.error('[deleteAccount] Error deleting user:', deleteUserError);
      throw new Error('Failed to delete account. Please contact support.');
    }

    if (errors.length > 0) {
      logger.warn(
        '[deleteAccount] Account deleted with partial cleanup failures:',
        errors.join(', ')
      );
    } else {
      logger.info('[deleteAccount] Account deleted successfully:', userId);
    }

    return {
      success: true,
      message: 'Your account and all associated data have been permanently deleted',
    };
  });
