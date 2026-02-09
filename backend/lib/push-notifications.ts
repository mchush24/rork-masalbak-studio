/**
 * Push Notification Service
 * Uses expo-server-sdk to send push notifications via Expo's push service
 *
 * Features:
 * - Multi-device support (user can have multiple tokens)
 * - Automatic deactivation of invalid tokens
 * - Respects user notification preferences (user_settings.push_notifications)
 * - Batch sending for multiple users
 */
import Expo, { type ExpoPushMessage, type ExpoPushTicket } from 'expo-server-sdk';
import { supa } from './supabase.js';
import { logger } from './utils.js';

const expo = new Expo();

interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Get active push tokens for a user, respecting notification preferences
 */
async function getUserPushTokens(userId: string): Promise<string[]> {
  // Check if user has push notifications enabled
  const { data: settings } = await supa
    .from('user_settings')
    .select('push_notifications')
    .eq('user_id', userId)
    .single();

  if (settings && settings.push_notifications === false) {
    logger.debug(`[Push] User ${userId} has push notifications disabled`);
    return [];
  }

  // Get active tokens
  const { data: tokens, error } = await supa
    .from('user_push_tokens')
    .select('push_token')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    logger.error('[Push] Error fetching push tokens:', error);
    return [];
  }

  return (tokens || []).map(t => t.push_token).filter(token => Expo.isExpoPushToken(token));
}

/**
 * Deactivate invalid push tokens
 */
async function deactivateTokens(tokens: string[]): Promise<void> {
  if (tokens.length === 0) return;

  const { error } = await supa
    .from('user_push_tokens')
    .update({ is_active: false })
    .in('push_token', tokens);

  if (error) {
    logger.error('[Push] Error deactivating tokens:', error);
  } else {
    logger.info(`[Push] Deactivated ${tokens.length} invalid tokens`);
  }
}

/**
 * Send push notification to a single user (all their devices)
 */
export async function sendPushNotification(
  userId: string,
  notification: PushNotificationPayload
): Promise<void> {
  const tokens = await getUserPushTokens(userId);
  if (tokens.length === 0) return;

  const messages: ExpoPushMessage[] = tokens.map(token => ({
    to: token,
    sound: 'default' as const,
    title: notification.title,
    body: notification.body,
    data: notification.data,
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const invalidTokens: string[] = [];

  for (const chunk of chunks) {
    try {
      const tickets: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);

      // Check for invalid tokens
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        if (ticket.status === 'error') {
          if (ticket.details?.error === 'DeviceNotRegistered') {
            invalidTokens.push((chunk[i] as ExpoPushMessage).to as string);
          }
          logger.warn('[Push] Ticket error:', ticket.message);
        }
      }
    } catch (err) {
      logger.error('[Push] Failed to send chunk:', err);
    }
  }

  // Deactivate invalid tokens in background
  if (invalidTokens.length > 0) {
    deactivateTokens(invalidTokens).catch(err =>
      logger.error('[Push] Failed to deactivate tokens:', err)
    );
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendBatchPushNotification(
  userIds: string[],
  notification: PushNotificationPayload
): Promise<void> {
  // Fetch all active tokens for all users at once
  const { data: allTokenRows, error } = await supa
    .from('user_push_tokens')
    .select('user_id, push_token')
    .in('user_id', userIds)
    .eq('is_active', true);

  if (error || !allTokenRows || allTokenRows.length === 0) {
    return;
  }

  // Check notification preferences for all users at once
  const { data: settingsRows } = await supa
    .from('user_settings')
    .select('user_id, push_notifications')
    .in('user_id', userIds);

  const disabledUsers = new Set(
    (settingsRows || []).filter(s => s.push_notifications === false).map(s => s.user_id)
  );

  const validTokens = allTokenRows
    .filter(row => !disabledUsers.has(row.user_id) && Expo.isExpoPushToken(row.push_token))
    .map(row => row.push_token);

  if (validTokens.length === 0) return;

  const messages: ExpoPushMessage[] = validTokens.map(token => ({
    to: token,
    sound: 'default' as const,
    title: notification.title,
    body: notification.body,
    data: notification.data,
  }));

  const chunks = expo.chunkPushNotifications(messages);
  const invalidTokens: string[] = [];

  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
          invalidTokens.push((chunk[i] as ExpoPushMessage).to as string);
        }
      }
    } catch (err) {
      logger.error('[Push] Batch send error:', err);
    }
  }

  if (invalidTokens.length > 0) {
    deactivateTokens(invalidTokens).catch(err =>
      logger.error('[Push] Failed to deactivate tokens:', err)
    );
  }
}
