import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE = 'test-service-role-key';

// Mock superjson to avoid ESM issues
jest.mock('superjson', () => ({
  default: {
    stringify: jest.fn((v: any) => JSON.stringify(v)),
    parse: jest.fn((v: string) => JSON.parse(v)),
    serialize: jest.fn((v: any) => ({ json: v, meta: undefined })),
    deserialize: jest.fn((v: any) => v.json),
  },
}));

// Mock Supabase
const mockSupabaseClient = {
  from: jest.fn() as any,
  auth: {
    signUp: jest.fn() as any,
    signInWithPassword: jest.fn() as any,
  },
};

jest.mock('../../../lib/supabase-secure', () => ({
  getSecureClient: jest.fn(() => mockSupabaseClient),
}));

jest.mock('../../../../lib/supabase', () => ({
  __esModule: true,
  supabase: mockSupabaseClient,
  default: mockSupabaseClient,
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password: string) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password: string, hash: string) => {
    return Promise.resolve(hash === `hashed_${password}`);
  }),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock_jwt_token'),
  verify: jest.fn(() => ({ userId: 'test-user-id', email: 'test@example.com' })),
}));

// Mock email service
jest.mock('../../../lib/email', () => ({
  sendVerificationCode: jest.fn(() => Promise.resolve()),
  sendVerificationEmail: jest.fn(() => Promise.resolve()),
  generateVerificationCode: jest.fn(() => '123456'),
}));

// Import after mocking
import { appRouter } from '../../app-router';

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create mock context with proper headers structure
  const createMockContext = (overrides = {}) => {
    const headersMap = new Map();
    headersMap.set('authorization', 'Bearer mock_token');
    headersMap.set('user-agent', 'test-agent');
    headersMap.set('x-forwarded-for', '127.0.0.1');

    return {
      req: {
        headers: {
          get: (key: string) => headersMap.get(key),
          ...Object.fromEntries(headersMap),
        },
      },
      userId: null,
      email: null,
      ...overrides,
    };
  };

  describe('auth.register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const mockUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        created_at: new Date().toISOString(),
      };

      const mockVerificationCode = {
        id: 'code-id',
        code: '123456',
        user_id: 'new-user-id',
      };

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'users') {
          return {
            insert: (jest.fn() as any).mockResolvedValue({ error: null } as any),
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockUser, error: null } as any),
          };
        }
        if (table === 'verification_codes') {
          return {
            insert: (jest.fn() as any).mockResolvedValue({ error: null } as any),
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockVerificationCode, error: null } as any),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(createMockContext() as any);

      const result = await caller.auth.register({
        email: 'newuser@example.com',
        name: 'New User',
      });

      // Assert
      expect(result).toHaveProperty('userId', 'new-user-id');
      expect(result).toHaveProperty('email', 'newuser@example.com');
      expect(result).toHaveProperty('isNewUser');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('verification_codes');
    });

    it('should reject registration with invalid email', async () => {
      // Act & Assert
      const caller = appRouter.createCaller(createMockContext() as any);

      await expect(
        caller.auth.register({
          email: 'invalid-email',
          name: 'Test User',
        })
      ).rejects.toThrow();
    });
  });

  describe('auth.verifyEmail', () => {
    it('should verify email with correct code', async () => {
      // Arrange
      const mockCode = {
        id: 'code-id',
        code: '123456',
        user_id: 'test-user-id',
        email: 'test@example.com',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      };

      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'verification_codes') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            order: (jest.fn() as any).mockReturnThis(),
            limit: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockCode, error: null } as any),
            delete: (jest.fn() as any).mockReturnThis(),
          };
        }
        if (table === 'users') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockUser, error: null } as any),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(createMockContext() as any);

      const result = await caller.auth.verifyEmail({
        email: 'test@example.com',
        code: '123456',
      });

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('userId', 'test-user-id');
    });

    it('should reject expired verification code', async () => {
      // Arrange
      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'verification_codes') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            order: (jest.fn() as any).mockReturnThis(),
            limit: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: null, error: { message: 'Not found' } } as any),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(createMockContext() as any);

      const result = await caller.auth.verifyEmail({
        email: 'test@example.com',
        code: '999999',
      });

      // Assert - Route returns error object instead of throwing
      expect(result.success).toBe(false);
      expect(result.message).toContain('Doğrulama kodu bulunamadı');
    });
  });

  describe('auth.loginWithPassword', () => {
    it('should login with valid credentials', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        password_hash: 'hashed_password123',
      };

      let callCount = 0;
      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'users') {
          callCount++;
          if (callCount === 1) {
            // First call: SELECT user
            return {
              select: (jest.fn() as any).mockReturnThis(),
              eq: (jest.fn() as any).mockReturnThis(),
              single: (jest.fn() as any).mockResolvedValue({ data: mockUser, error: null } as any),
            };
          } else {
            // Second call: UPDATE last_seen_at
            return {
              update: (jest.fn() as any).mockReturnThis(),
              eq: (jest.fn() as any).mockResolvedValue({ error: null } as any),
            };
          }
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(createMockContext() as any);

      const result = await caller.auth.loginWithPassword({
        email: 'user@example.com',
        password: 'password123',
      });

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('userId', 'user-id');
    });

    it('should reject invalid password', async () => {
      // Arrange
      const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        password_hash: 'hashed_different_password',
      };

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'users') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockUser, error: null } as any),
          };
        }
        return {};
      }) as any);

      // Mock bcrypt to return false for wrong password
      const bcrypt = require('bcryptjs');
      bcrypt.compare.mockResolvedValueOnce(false);

      // Act & Assert
      const caller = appRouter.createCaller(createMockContext() as any);

      await expect(
        caller.auth.loginWithPassword({
          email: 'user@example.com',
          password: 'wrong_password',
        })
      ).rejects.toThrow('Email veya şifre hatalı');
    });
  });

  describe('auth.completeOnboarding', () => {
    it('should mark onboarding as complete', async () => {
      // Arrange
      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'users') {
          return {
            update: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockResolvedValue({ error: null } as any),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(createMockContext({
        userId: 'test-user-id',
        email: 'test@example.com',
      }) as any);

      const result = await caller.auth.completeOnboarding();

      // Assert
      expect(result).toEqual({ success: true });
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    });
  });
});
