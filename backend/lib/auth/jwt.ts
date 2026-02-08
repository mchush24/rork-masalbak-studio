import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = '7d'; // 7 days
const REFRESH_TOKEN_EXPIRES_IN = '30d'; // 30 days

// =============================================================================
// Custom Error Classes for Better Error Handling
// =============================================================================

export class TokenExpiredError extends Error {
  constructor(message: string = 'Token süresi dolmuş') {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

export class InvalidTokenError extends Error {
  constructor(message: string = 'Geçersiz token') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

// =============================================================================

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
  type?: 'access' | 'refresh'; // Token type distinction
}

/**
 * Generate access token (short-lived, 7 days)
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(
    { userId: payload.userId, email: payload.email, type: 'access' },
    getJwtSecret(),
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'renkioo-studio',
      audience: 'renkioo-app',
    }
  );
}

/**
 * Generate refresh token (long-lived, 30 days)
 */
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(
    { userId: payload.userId, email: payload.email, type: 'refresh' },
    getJwtSecret(),
    {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'renkioo-studio',
      audience: 'renkioo-app',
    }
  );
}

/**
 * Verify and decode an access token.
 * Rejects refresh tokens used as access tokens.
 * @throws TokenExpiredError if token has expired
 * @throws InvalidTokenError if token is malformed, invalid, or a refresh token
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: 'renkioo-studio',
      audience: 'renkioo-app',
    }) as TokenPayload;

    // Reject refresh tokens used as access tokens
    if (decoded.type === 'refresh') {
      throw new InvalidTokenError('Refresh token cannot be used for API access.');
    }

    return decoded;
  } catch (error) {
    if (error instanceof TokenExpiredError || error instanceof InvalidTokenError) {
      throw error;
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError('Token süresi dolmuş. Lütfen tekrar giriş yapın.');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenError('Geçersiz token. Lütfen tekrar giriş yapın.');
    } else {
      throw new InvalidTokenError('Token doğrulama hatası.');
    }
  }
}

/**
 * Verify a refresh token specifically.
 * Only accepts tokens with type='refresh'.
 * @throws TokenExpiredError if refresh token has expired
 * @throws InvalidTokenError if token is not a valid refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: 'renkioo-studio',
      audience: 'renkioo-app',
    }) as TokenPayload;

    // Only accept refresh tokens (also accept legacy tokens without type for backward compat)
    if (decoded.type === 'access') {
      throw new InvalidTokenError('Access token cannot be used as refresh token.');
    }

    return decoded;
  } catch (error) {
    if (error instanceof TokenExpiredError || error instanceof InvalidTokenError) {
      throw error;
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError('Refresh token süresi dolmuş. Lütfen tekrar giriş yapın.');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new InvalidTokenError('Geçersiz refresh token.');
    } else {
      throw new InvalidTokenError('Refresh token doğrulama hatası.');
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
