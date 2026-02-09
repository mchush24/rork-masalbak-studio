import { createHash } from 'crypto';
import { supabase } from '../supabase.js';
import { logger } from '../utils.js';

/**
 * Hash a refresh token for storage (never store raw tokens)
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Store a newly issued refresh token
 */
export async function storeRefreshToken(
  userId: string,
  token: string,
  expiresInDays = 30
): Promise<void> {
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const { error } = await supabase.from('refresh_tokens').insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    logger.error('[Auth] Failed to store refresh token:', error);
    // Non-blocking: token still works, just can't be revoked
  }
}

/**
 * Check if a refresh token has been revoked
 * Returns true if the token is revoked or not found (not found = legacy token, allow it)
 */
export async function isTokenRevoked(token: string): Promise<boolean> {
  const tokenHash = hashToken(token);

  const { data, error } = await supabase
    .from('refresh_tokens')
    .select('revoked_at')
    .eq('token_hash', tokenHash)
    .single();

  if (error || !data) {
    // Token not found in DB = legacy token issued before revocation system
    // Allow it through for backward compatibility
    return false;
  }

  return data.revoked_at !== null;
}

/**
 * Revoke a single refresh token
 */
export async function revokeToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);

  const { error } = await supabase
    .from('refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('token_hash', tokenHash);

  if (error) {
    logger.error('[Auth] Failed to revoke token:', error);
  }
}

/**
 * Revoke all refresh tokens for a user (used on password change, account compromise)
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  const { error } = await supabase
    .from('refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('revoked_at', null);

  if (error) {
    logger.error('[Auth] Failed to revoke all user tokens:', error);
  } else {
    logger.info('[Auth] All refresh tokens revoked for user:', userId.substring(0, 8) + '...');
  }
}

/**
 * Cleanup expired tokens (run periodically)
 */
export async function cleanupExpiredTokens(): Promise<void> {
  const { error, count } = await supabase
    .from('refresh_tokens')
    .delete()
    .lt('expires_at', new Date().toISOString());

  if (error) {
    logger.error('[Auth] Failed to cleanup expired tokens:', error);
  } else if (count && count > 0) {
    logger.info(`[Auth] Cleaned up ${count} expired refresh tokens`);
  }
}

// Cleanup expired tokens every 24 hours
setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000);
