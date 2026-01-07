import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE = 'test-service-role-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.RESEND_API_KEY = 'test-resend-key';

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
};

jest.mock('../../../lib/supabase-secure', () => ({
  getSecureClient: jest.fn(() => mockSupabaseClient),
}));

jest.mock('../../../../lib/supabase', () => ({
  __esModule: true,
  supabase: mockSupabaseClient,
  default: mockSupabaseClient,
}));

// Mock bcrypt for deleteAccount tests
jest.mock('bcryptjs', () => ({
  compare: jest.fn((password: string, hash: string) => {
    return Promise.resolve(hash === `hashed_${password}`);
  }),
}));

// Import after mocking
import { appRouter } from '../../app-router';

describe('User Endpoint Integration Tests', () => {
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
      userId: 'test-user-id',
      email: 'test@example.com',
      ...overrides,
    };
  };

  const mockContext = createMockContext();

  describe('user.getProfile', () => {
    it('should return user profile', async () => {
      // Arrange
      const mockProfile = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        language: 'tr',
        children: [
          { name: 'Child 1', age: 7 },
        ],
      };

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'users') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockProfile, error: null } as any),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(mockContext as any);
      const result = await caller.user.getProfile();

      // Assert
      expect(result).toEqual(mockProfile);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
    });
  });

  describe('user.updateProfile', () => {
    it('should update user profile', async () => {
      // Arrange
      const mockUpdatedProfile = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Updated Name',
        avatar_url: 'https://example.com/new-avatar.jpg',
      };

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'users') {
          return {
            update: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            select: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockUpdatedProfile, error: null } as any),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(mockContext as any);
      const result = await caller.user.updateProfile({
        name: 'Updated Name',
        avatarUrl: 'https://example.com/new-avatar.jpg',
      });

      // Assert
      expect(result).toEqual(mockUpdatedProfile);
    });
  });

  describe('user.getChildren', () => {
    it('should return user children', async () => {
      // Arrange
      const mockChildren = [
        { name: 'Child 1', age: 7, gender: 'male' },
        { name: 'Child 2', age: 5, gender: 'female' },
      ];

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'users') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({
              data: { children: mockChildren },
              error: null,
            } as any),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(mockContext as any);
      const result = await caller.user.getChildren();

      // Assert
      expect(result).toEqual(mockChildren);
    });

    it('should return empty array when no children', async () => {
      // Arrange
      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'users') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({
              data: { children: null },
              error: null,
            } as any),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(mockContext as any);
      const result = await caller.user.getChildren();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('user.updateChildren', () => {
    it('should update children array', async () => {
      // Arrange
      const newChildren = [
        { name: 'Child 1', age: 8, gender: 'male' as const },
        { name: 'Child 3', age: 4, gender: 'female' as const },
      ];

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'users') {
          return {
            update: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            select: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({
              data: { children: newChildren },
              error: null,
            } as any),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(mockContext as any);
      const result = await caller.user.updateChildren({
        children: newChildren,
      });

      // Assert
      expect(result).toEqual(newChildren);
    });
  });

  describe('user.exportData', () => {
    it('should export all user data (GDPR compliance)', async () => {
      // Arrange
      const mockUserData = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        password_hash: 'should_be_removed',
      };

      const mockAnalyses = [
        { id: 'analysis-1', task_type: 'DAP', created_at: '2025-01-01' },
      ];

      const mockStorybooks = [
        { id: 'storybook-1', title: 'My Story', created_at: '2025-01-02' },
      ];

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'users') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockUserData, error: null } as any),
          };
        }
        if (table === 'analyses') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            order: (jest.fn() as any).mockResolvedValue({ data: mockAnalyses, error: null } as any),
          };
        }
        if (table === 'storybooks') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            order: (jest.fn() as any).mockResolvedValue({ data: mockStorybooks, error: null } as any),
          };
        }
        if (table === 'colorings') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            order: (jest.fn() as any).mockResolvedValue({ data: [], error: null } as any),
          };
        }
        if (table === 'user_settings') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: null, error: { code: 'PGRST116' } } as any),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(mockContext as any);
      const result = await caller.user.exportData();

      // Assert
      expect(result).toHaveProperty('exportedAt');
      expect(result).toHaveProperty('userId', 'test-user-id');
      expect(result.profile).not.toHaveProperty('password_hash'); // Security check
      expect(result.analyses.total).toBe(1);
      expect(result.storybooks.total).toBe(1);
      expect(result.metadata.exportVersion).toBe('1.0');
    });
  });

  describe('user.deleteAccount', () => {
    it('should delete account with valid credentials', async () => {
      // Arrange
      const mockUserData = {
        email: 'test@example.com',
        password_hash: 'hashed_password123',
      };

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'users') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockUserData, error: null } as any),
            delete: (jest.fn() as any).mockReturnThis(),
          };
        }
        // Mock cascade deletes
        return {
          delete: (jest.fn() as any).mockReturnThis(),
          eq: (jest.fn() as any).mockResolvedValue({ error: null } as any),
        };
      }) as any);

      // Act
      const caller = appRouter.createCaller(mockContext as any);
      const result = await caller.user.deleteAccount({
        confirmEmail: 'test@example.com',
        confirmPassword: 'password123',
      });

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Your account and all associated data have been permanently deleted',
      });
    });

    it('should reject with wrong email', async () => {
      // Arrange
      const mockUserData = {
        email: 'test@example.com',
        password_hash: 'hashed_password123',
      };

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'users') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockUserData, error: null } as any),
          };
        }
        return {};
      }) as any);

      // Act & Assert
      const caller = appRouter.createCaller(mockContext as any);
      await expect(
        caller.user.deleteAccount({
          confirmEmail: 'wrong@example.com',
          confirmPassword: 'password123',
        })
      ).rejects.toThrow('Email does not match');
    });
  });
});
