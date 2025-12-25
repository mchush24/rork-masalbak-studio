import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // Higher = more secure but slower
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;

export interface PasswordStrength {
  score: number; // 0-4 (0=very weak, 4=very strong)
  feedback: string[];
  isValid: boolean;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır`);
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new Error(`Şifre en fazla ${MAX_PASSWORD_LENGTH} karakter olabilir`);
  }

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('[Password] Verification error:', error);
    return false;
  }
}

/**
 * Validate password strength
 * Returns detailed feedback for UI
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < MIN_PASSWORD_LENGTH) {
    feedback.push(`En az ${MIN_PASSWORD_LENGTH} karakter olmalıdır`);
    return { score: 0, feedback, isValid: false };
  }

  if (password.length >= 6) score++;
  if (password.length >= 10) score++;

  // Character variety
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (hasNumber) {
    score++;
  }

  if (hasLowercase && hasUppercase) score++;
  if (hasSpecial) score++;

  // Common password check (basic)
  const commonPasswords = ['123456', '12345678', 'password', 'qwerty123', '123456789', 'şifre123'];
  if (commonPasswords.includes(password.toLowerCase())) {
    feedback.push('Çok yaygın bir şifre kullanıyorsunuz');
    score = Math.max(0, score - 2);
  }

  // Feedback messages based on score
  if (score === 0) feedback.push('Çok zayıf şifre');
  else if (score === 1) feedback.push('Zayıf şifre');
  else if (score === 2) feedback.push('Orta güçlükte şifre');
  else if (score === 3) feedback.push('Güçlü şifre');
  else if (score >= 4) feedback.push('Çok güçlü şifre');

  return {
    score: Math.min(4, score),
    feedback,
    isValid: password.length >= MIN_PASSWORD_LENGTH,
  };
}

/**
 * Generate secure random password for temporary use
 */
export function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const numbers = '0123456789';
  const special = '!@#$%&*';

  let password = '';

  // Ensure at least one of each type
  password += chars[Math.floor(Math.random() * chars.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest
  const allChars = chars + numbers + special;
  for (let i = 0; i < 9; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
