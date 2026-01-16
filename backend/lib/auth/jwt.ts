import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = '7d'; // 7 days
const REFRESH_TOKEN_EXPIRES_IN = '30d'; // 30 days

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'renkioo-studio',
    audience: 'renkioo-app',
  });
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'renkioo-studio',
    audience: 'renkioo-app',
  });
}

/**
 * Verify and decode token
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: 'renkioo-studio',
      audience: 'renkioo-app',
    }) as TokenPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token süresi dolmuş. Lütfen tekrar giriş yapın.');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Geçersiz token. Lütfen tekrar giriş yapın.');
    } else {
      throw new Error('Token doğrulama hatası.');
    }
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}
