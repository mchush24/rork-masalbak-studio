/**
 * Validation Schemas
 *
 * Zod schemas for form validation across the app
 * Used with React Hook Form via @hookform/resolvers
 */

import { z } from 'zod';

// ============================================
// Common Validation Rules
// ============================================

const emailSchema = z
  .string()
  .min(1, 'E-posta adresi gereklidir')
  .email('Geçerli bir e-posta adresi girin');

const passwordSchema = z
  .string()
  .min(6, 'Şifre en az 6 karakter olmalıdır')
  .max(100, 'Şifre çok uzun');

const nameSchema = z
  .string()
  .min(2, 'İsim en az 2 karakter olmalıdır')
  .max(50, 'İsim çok uzun');

// ============================================
// Authentication Schemas
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Şifre tekrarı gereklidir'),
    name: nameSchema,
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'Kullanım koşullarını kabul etmelisiniz',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Şifre tekrarı gereklidir'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================
// Profile Schemas
// ============================================

export const userProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional(),
  language: z.enum(['tr', 'en']).default('tr'),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

export const childProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Çocuğun adı gereklidir')
    .max(30, 'İsim çok uzun'),
  age: z
    .number()
    .min(3, 'Yaş en az 3 olmalıdır')
    .max(12, 'Yaş en fazla 12 olabilir'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  birthDate: z.string().optional(),
  avatarId: z.string().optional(),
});

export type ChildProfileFormData = z.infer<typeof childProfileSchema>;

// ============================================
// Content Schemas
// ============================================

export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500, 'Yorum çok uzun').optional(),
});

export type FeedbackFormData = z.infer<typeof feedbackSchema>;

export const reportSchema = z.object({
  reason: z.enum(['inappropriate', 'spam', 'harassment', 'other']),
  description: z.string().max(1000, 'Açıklama çok uzun').optional(),
});

export type ReportFormData = z.infer<typeof reportSchema>;

// ============================================
// Settings Schemas
// ============================================

export const notificationSettingsSchema = z.object({
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  analysisReminders: z.boolean(),
  weeklyReport: z.boolean(),
});

export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;

export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'private']),
  shareAnalytics: z.boolean(),
  shareArtwork: z.boolean(),
});

export type PrivacySettingsFormData = z.infer<typeof privacySettingsSchema>;

// ============================================
// Validation Helpers
// ============================================

/**
 * Get error message from Zod validation error
 */
export function getFirstError(error: z.ZodError): string {
  return error.errors[0]?.message || 'Doğrulama hatası';
}

/**
 * Safe parse with formatted error
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: getFirstError(result.error) };
}
