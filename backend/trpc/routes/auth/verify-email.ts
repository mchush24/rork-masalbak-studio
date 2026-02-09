import { logger } from '../../../lib/utils.js';
import { publicProcedure } from '../../create-context.js';
import { z } from 'zod';
import { supabase } from '../../../lib/supabase.js';
import { generateAccessToken, generateRefreshToken } from '../../../lib/auth/jwt.js';
import { storeRefreshToken } from '../../../lib/auth/refresh-tokens.js';
import { authRateLimit } from '../../middleware/rate-limit.js';

// ============================================
// Brute-force protection for verification codes
// ============================================
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 3;
const LOCKOUT_MINUTES = [1, 5, 15]; // Escalating lockout: 1min, 5min, 15min

function checkBruteForce(email: string): { blocked: boolean; waitMinutes?: number } {
  const record = failedAttempts.get(email);
  if (!record) return { blocked: false };
  if (record.lockedUntil > Date.now()) {
    const waitMinutes = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    return { blocked: true, waitMinutes };
  }
  return { blocked: false };
}

function recordFailedAttempt(email: string): void {
  const record = failedAttempts.get(email) || { count: 0, lockedUntil: 0 };
  record.count++;
  if (record.count >= MAX_ATTEMPTS) {
    const tier = Math.min(Math.floor(record.count / MAX_ATTEMPTS) - 1, LOCKOUT_MINUTES.length - 1);
    record.lockedUntil = Date.now() + LOCKOUT_MINUTES[tier] * 60000;
    logger.warn(
      `[Auth] Brute-force lockout for ${email}: ${LOCKOUT_MINUTES[tier]}min (${record.count} attempts)`
    );
  }
  failedAttempts.set(email, record);
}

function clearFailedAttempts(email: string): void {
  failedAttempts.delete(email);
}

// Cleanup stale entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of failedAttempts) {
    if (record.lockedUntil < now && now - record.lockedUntil > 30 * 60000) {
      failedAttempts.delete(email);
    }
  }
}, 30 * 60000);

const verifyEmailInputSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const verifyEmailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

export const verifyEmailProcedure = publicProcedure
  .use(authRateLimit)
  .input(verifyEmailInputSchema)
  .output(verifyEmailResponseSchema)
  .mutation(async ({ input }) => {
    logger.info('[Auth] 🔐 Verifying email code:', input.email);

    // Check brute-force lockout
    const bruteCheck = checkBruteForce(input.email);
    if (bruteCheck.blocked) {
      logger.warn('[Auth] ⛔ Brute-force blocked:', input.email);
      return {
        success: false,
        message: `Çok fazla başarısız deneme. Lütfen ${bruteCheck.waitMinutes} dakika bekleyin.`,
      };
    }

    try {
      // Get the latest verification code for this email
      const { data: verificationRecord, error: fetchError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('email', input.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !verificationRecord) {
        logger.error('[Auth] ❌ No verification code found for:', input.email);
        return {
          success: false,
          message: 'Doğrulama kodu bulunamadı. Lütfen tekrar kayıt olun.',
        };
      }

      // Check if code has expired
      const expiresAt = new Date(verificationRecord.expires_at);
      const now = new Date();

      if (now > expiresAt) {
        logger.error('[Auth] ❌ Verification code expired for:', input.email);
        return {
          success: false,
          message: 'Doğrulama kodunun süresi dolmuş. Lütfen tekrar kayıt olun.',
        };
      }

      // Check if code matches (codes are masked in logs for security)
      logger.info('[Auth] 🔍 Comparing verification codes for:', input.email);

      if (verificationRecord.code.trim() !== input.code.trim()) {
        recordFailedAttempt(input.email);
        logger.error('[Auth] ❌ Invalid verification code for:', input.email);
        return {
          success: false,
          message: 'Doğrulama kodu hatalı. Lütfen tekrar deneyin.',
        };
      }

      // Get user BEFORE deleting the code (so code can be retried if user lookup fails)
      const { data: user } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', input.email)
        .single();

      if (!user) {
        logger.error('[Auth] User not found after code verification:', input.email);
        return {
          success: false,
          message: 'Kullanıcı bulunamadı. Lütfen tekrar kayıt olun.',
        };
      }

      // Clear brute-force counter on success
      clearFailedAttempts(input.email);
      logger.info('[Auth] Email verified successfully:', input.email);

      // Generate JWT tokens BEFORE deleting verification code
      // If token generation fails, the code remains intact for retry
      const tokenPayload = { userId: user.id, email: user.email };
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      logger.info('[Auth] 🔑 Generated JWT tokens for user:', user.id);

      // Store refresh token hash for revocation support
      storeRefreshToken(user.id, refreshToken).catch(() => {});

      // Delete used verification code only after tokens are generated successfully
      await supabase.from('verification_codes').delete().eq('email', input.email);

      return {
        success: true,
        message: 'Email adresiniz başarıyla doğrulandı!',
        userId: user.id,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('[Auth] ❌ Verification error:', error);
      return {
        success: false,
        message: 'Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.',
      };
    }
  });
