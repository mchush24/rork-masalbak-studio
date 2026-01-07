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

// Import after mocking
import { appRouter } from '../../app-router';

describe('Analysis Endpoint Integration Tests', () => {
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

  describe('analysis.save', () => {
    it('should save a new analysis', async () => {
      // Arrange
      const mockAnalysis = {
        id: 'new-analysis-id',
        user_id: 'test-user-id',
        task_type: 'DAP',
        child_age: 7,
        child_name: 'Test Child',
        original_image_url: 'https://example.com/drawing.jpg',
        analysis_result: {
          insights: [
            { title: 'Test Insight', summary: 'Test summary', evidence: ['test'], strength: 'strong' },
          ],
        },
        created_at: new Date().toISOString(),
      };

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'analyses') {
          return {
            insert: (jest.fn() as any as any).mockReturnThis(),
            select: (jest.fn() as any as any).mockReturnThis(),
            single: (jest.fn() as any as any).mockResolvedValue({ data: mockAnalysis, error: null }),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(mockContext as any);
      const result = await caller.analysis.save({
        taskType: 'DAP',
        childAge: 7,
        childName: 'Test Child',
        originalImageUrl: 'https://example.com/drawing.jpg',
        analysisResult: {
          insights: [
            { title: 'Test Insight', summary: 'Test summary', evidence: ['test'], strength: 'strong' as const },
          ],
          homeTips: [],
          riskFlags: [],
          meta: {
            testType: 'DAP',
            language: 'tr',
            confidence: 0.8,
            uncertaintyLevel: 'low' as const,
            dataQualityNotes: [],
          },
          disclaimer: 'Test disclaimer',
        },
      });

      // Assert
      expect(result).toEqual(mockAnalysis);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('analyses');
    });
  });

  describe('analysis.list', () => {
    it('should list user analyses with pagination', async () => {
      // Arrange
      const mockAnalyses = [
        {
          id: '11111111-1111-4111-8111-111111111111',
          task_type: 'DAP',
          child_age: 7,
          created_at: '2025-01-06T10:00:00Z',
          favorited: false,
        },
        {
          id: '22222222-2222-4222-8222-222222222222',
          task_type: 'Family',
          child_age: 5,
          created_at: '2025-01-05T10:00:00Z',
          favorited: true,
        },
      ];

      const mockCount = { count: 2 };

      let selectChain = {
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockReturnThis(),
        range: (jest.fn() as any).mockReturnThis(),
        then: jest.fn((resolve: any) => resolve({ data: mockAnalyses, error: null, count: 2 })),
      };

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'analyses') {
          return {
            select: jest.fn(() => selectChain),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(mockContext as any);
      const result = await caller.analysis.list({
        limit: 10,
        offset: 0,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      // Assert
      expect(result.analyses).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.analyses[0].id).toBe('11111111-1111-4111-8111-111111111111');
    });

    it('should filter favorited analyses only', async () => {
      // Arrange
      const mockFavorites = [
        {
          id: '22222222-2222-4222-8222-222222222222',
          task_type: 'Family',
          favorited: true,
        },
      ];

      let selectChain = {
        eq: (jest.fn() as any).mockReturnThis(),
        order: (jest.fn() as any).mockReturnThis(),
        range: (jest.fn() as any).mockReturnThis(),
        then: jest.fn((resolve: any) => resolve({ data: mockFavorites, error: null, count: 1 })),
      };

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'analyses') {
          return {
            select: jest.fn(() => selectChain),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(mockContext as any);
      const result = await caller.analysis.list({
        limit: 10,
        offset: 0,
        favoritedOnly: true,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      // Assert
      expect(result.analyses).toHaveLength(1);
      expect(result.analyses[0].favorited).toBe(true);
    });
  });

  describe('analysis.get', () => {
    it('should get a specific analysis by ID', async () => {
      // Arrange
      const mockAnalysis = {
        id: '33333333-3333-4333-8333-333333333333',
        user_id: 'test-user-id',
        task_type: 'HTP',
        child_age: 8,
        analysis_result: {
          insights: [
            { title: 'Creative thinking', summary: 'Shows creativity', evidence: ['colors'], strength: 'moderate' },
          ],
        },
      };

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'analyses') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockAnalysis, error: null } as any),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(mockContext as any);
      const result = await caller.analysis.get({
        analysisId: '33333333-3333-4333-8333-333333333333',
      });

      // Assert
      expect(result).toEqual(mockAnalysis);
    });

    it('should throw error when analysis not found', async () => {
      // Arrange
      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'analyses') {
          return {
            select: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: null, error: { message: 'Not found' } } as any),
          };
        }
        return {};
      }) as any);

      // Act & Assert
      const caller = appRouter.createCaller(mockContext as any);
      await expect(
        caller.analysis.get({
          analysisId: 'non-existent-id',
        })
      ).rejects.toThrow();
    });
  });

  describe('analysis.update', () => {
    it('should update analysis favorited status', async () => {
      // Arrange
      const mockUpdated = {
        id: '44444444-4444-4444-8444-444444444444',
        favorited: true,
      };

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'analyses') {
          return {
            update: (jest.fn() as any).mockReturnThis(),
            eq: (jest.fn() as any).mockReturnThis(),
            select: (jest.fn() as any).mockReturnThis(),
            single: (jest.fn() as any).mockResolvedValue({ data: mockUpdated, error: null } as any),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(mockContext as any);
      const result = await caller.analysis.update({
        analysisId: '44444444-4444-4444-8444-444444444444',
        favorited: true,
      });

      // Assert
      expect(result.favorited).toBe(true);
    });
  });

  describe('analysis.delete', () => {
    it('should delete an analysis', async () => {
      // Arrange
      let deleteChain = {
        eq: (jest.fn() as any).mockReturnThis(),
      };

      // The last eq in the chain resolves with the result
      deleteChain.eq = jest.fn(function(this: any) {
        // First eq returns this, second eq resolves
        const isFirstCall = !this._eqCalled;
        this._eqCalled = true;
        return isFirstCall ? this : Promise.resolve({ error: null });
      });

      mockSupabaseClient.from.mockImplementation(((table: string) => {
        if (table === 'analyses') {
          return {
            delete: jest.fn(() => {
              // Reset the flag for each delete call
              (deleteChain as any)._eqCalled = false;
              return deleteChain;
            }),
          };
        }
        return {};
      }) as any);

      // Act
      const caller = appRouter.createCaller(mockContext as any);
      const result = await caller.analysis.delete({
        analysisId: '55555555-5555-4555-8555-555555555555',
      });

      // Assert
      expect(result).toEqual({ success: true });
    });
  });
});
