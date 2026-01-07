import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE = 'test-service-role-key';

// Mock superjson to avoid ESM issues
jest.mock('superjson', () => ({
  default: {
    stringify: jest.fn((v: any) => JSON.stringify(v)),
    parse: jest.fn((v: string) => JSON.parse(v)),
  },
}));

// Mock OpenAI before importing
const mockCreate = jest.fn() as jest.MockedFunction<any>;

jest.mock('openai', () => ({
  __esModule: true,
  default: class MockOpenAI {
    chat = {
      completions: {
        create: mockCreate,
      },
    };
  },
}));

// Helper to create valid input
function createTestInput(overrides: Partial<any> = {}): any {
  return {
    taskType: 'DAP',
    language: 'en',
    userRole: 'parent',
    ...overrides,
  };
}

describe('analyzeDrawing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should analyze a drawing with image and return structured response', async () => {
    // Arrange
    const mockResponse = {
      meta: {
        testType: 'Family',
        age: 7,
        language: 'en',
        confidence: 0.8,
        uncertaintyLevel: 'low',
        dataQualityNotes: [],
      },
      insights: [
        {
          title: 'Strong family bonds',
          summary: 'The child shows strong emotional bonds with family members through the use of warm colors and close proximity of figures.',
          evidence: ['warm_colors', 'figure_proximity'],
          strength: 'strong',
        },
      ],
      homeTips: [
        {
          title: 'Encourage storytelling',
          steps: ['Ask about the drawing', 'Listen actively'],
          why: 'Helps emotional expression',
        },
      ],
      riskFlags: [],
      trendNote: '',
      disclaimer: 'This content is for informational purposes only and does not constitute a diagnosis.',
    };

    (mockCreate.mockResolvedValue as any)({
      choices: [
        {
          message: {
            content: JSON.stringify(mockResponse),
          },
        },
      ],
    });

    // Import after mocking
    const { analyzeDrawing } = await import('../analyze-drawing');

    // Act
    const result = await analyzeDrawing(createTestInput({
      taskType: 'Family',
      childAge: 7,
      imageBase64: 'fake-base64-string',
    }));

    // Assert
    expect(result).toEqual(mockResponse);
    expect(mockCreate).toHaveBeenCalledTimes(1);

    const callArgs: any = mockCreate.mock.calls[0][0];
    expect(callArgs).toMatchObject({
      model: 'gpt-4o-mini',
      max_tokens: 4000,
    });

    // Verify the message structure
    expect(callArgs.messages[0].role).toBe('system');
    expect(callArgs.messages[1].role).toBe('user');
    expect(callArgs.messages[1].content).toHaveLength(2);
    expect(callArgs.messages[1].content[0].type).toBe('text');
    expect(callArgs.messages[1].content[1].type).toBe('image_url');
  });

  it('should handle analysis without image', async () => {
    // Arrange
    const mockResponse = {
      meta: {
        testType: 'Tree',
        age: 5,
        language: 'en',
        confidence: 0.7,
        uncertaintyLevel: 'mid',
        dataQualityNotes: [],
      },
      insights: [
        {
          title: 'Creative expression',
          summary: 'Analysis based on task description only.',
          evidence: ['task_description'],
          strength: 'moderate',
        },
      ],
      homeTips: [
        {
          title: 'Encourage drawing',
          steps: ['Provide materials', 'Create time for art'],
          why: 'Supports imagination',
        },
      ],
      riskFlags: [],
      trendNote: '',
      disclaimer: 'This content is for informational purposes only and does not constitute a diagnosis.',
    };

    (mockCreate.mockResolvedValue as any)({
      choices: [
        {
          message: {
            content: JSON.stringify(mockResponse),
          },
        },
      ],
    });

    const { analyzeDrawing } = await import('../analyze-drawing');

    // Act
    const result = await analyzeDrawing(createTestInput({
      taskType: 'Tree',
      childAge: 5,
    }));

    // Assert
    expect(result).toEqual(mockResponse);

    // Ensure image was NOT included
    const callArgs: any = mockCreate.mock.calls[0][0];
    const messageContent = callArgs.messages[1].content;
    expect(messageContent).toHaveLength(1);
    expect(messageContent[0].type).toBe('text');
  });

  it('should handle JSON parsing when response includes markdown code blocks', async () => {
    // Arrange
    const mockResponse = {
      meta: {
        testType: 'DAP',
        age: 6,
        language: 'en',
        confidence: 0.75,
        uncertaintyLevel: 'low',
        dataQualityNotes: [],
      },
      insights: [
        {
          title: 'Creative Expression',
          summary: 'The child demonstrates creative thinking.',
          evidence: ['creativity_markers'],
          strength: 'strong',
        },
      ],
      homeTips: [
        {
          title: 'Foster creativity',
          steps: ['Provide open-ended activities'],
          why: 'Supports creative development',
        },
      ],
      riskFlags: [],
      trendNote: '',
      disclaimer: 'This content is for informational purposes only and does not constitute a diagnosis.',
    };

    (mockCreate.mockResolvedValue as any)({
      choices: [
        {
          message: {
            content: `Here is the analysis:\n\`\`\`json\n${JSON.stringify(mockResponse)}\n\`\`\``,
          },
        },
      ],
    });

    const { analyzeDrawing } = await import('../analyze-drawing');

    // Act
    const result = await analyzeDrawing(createTestInput({
      childAge: 6,
    }));

    // Assert
    expect(result).toEqual(mockResponse);
  });

  it('should return fallback response on JSON parse error', async () => {
    // Arrange
    (mockCreate.mockResolvedValue as any)({
      choices: [
        {
          message: {
            content: 'This is not valid JSON at all!',
          },
        },
      ],
    });

    const { analyzeDrawing } = await import('../analyze-drawing');

    // Act
    const result = await analyzeDrawing(createTestInput({
      childAge: 8,
      language: 'tr',
    }));

    // Assert - Expect fallback response with new schema
    expect(result.meta.uncertaintyLevel).toBe('high');
    expect(result.insights[0].title).toBe('Analiz tamamlanamadı');
    expect(result.riskFlags).toEqual([]);
    expect(result.disclaimer).toBeTruthy();
  });

  it('should throw error when OpenAI API fails', async () => {
    // Arrange
    (mockCreate.mockRejectedValue as any)(new Error('API rate limit exceeded'));

    const { analyzeDrawing } = await import('../analyze-drawing');

    // Act & Assert
    await expect(
      analyzeDrawing(createTestInput({
        childAge: 9,
      }))
    ).rejects.toThrow('Analysis failed: API rate limit exceeded');
  });

  it('should include child age in the prompt when provided', async () => {
    // Arrange
    const mockResponse = {
      meta: {
        testType: 'HTP',
        age: 10,
        language: 'en',
        confidence: 0.8,
        uncertaintyLevel: 'low',
        dataQualityNotes: [],
      },
      insights: [
        {
          title: 'Test',
          summary: 'Test insights',
          evidence: ['test'],
          strength: 'moderate',
        },
      ],
      homeTips: [
        {
          title: 'Test tip',
          steps: ['Step 1'],
          why: 'Test reason',
        },
      ],
      riskFlags: [],
      trendNote: '',
      disclaimer: 'This content is for informational purposes only and does not constitute a diagnosis.',
    };

    (mockCreate.mockResolvedValue as any)({
      choices: [{ message: { content: JSON.stringify(mockResponse) } }],
    });

    const { analyzeDrawing } = await import('../analyze-drawing');

    // Act
    await analyzeDrawing(createTestInput({
      taskType: 'HTP',
      childAge: 10,
    }));

    // Assert
    const callArgs: any = mockCreate.mock.calls[0][0];
    const promptText = callArgs.messages[1].content[0].text;
    expect(promptText).toContain('child_age: 10');
  });

  it('should handle missing child age gracefully', async () => {
    // Arrange
    const mockResponse = {
      meta: {
        testType: 'DAP',
        language: 'tr',
        confidence: 0.6,
        uncertaintyLevel: 'mid',
        dataQualityNotes: [],
      },
      insights: [
        {
          title: 'Test',
          summary: 'Test insights',
          evidence: ['exploration'],
          strength: 'weak',
        },
      ],
      homeTips: [
        {
          title: 'Test',
          steps: ['Step'],
          why: 'Reason',
        },
      ],
      riskFlags: [],
      trendNote: '',
      disclaimer: 'Bu içerik bilgi amaçlıdır, tanı koymaz. Endişeleriniz varsa uzmanla görüşebilirsiniz.',
    };

    (mockCreate.mockResolvedValue as any)({
      choices: [{ message: { content: JSON.stringify(mockResponse) } }],
    });

    const { analyzeDrawing } = await import('../analyze-drawing');

    // Act
    await analyzeDrawing(createTestInput({
      language: 'tr',
    }));

    // Assert
    const callArgs: any = mockCreate.mock.calls[0][0];
    const promptText = callArgs.messages[1].content[0].text;
    expect(promptText).toContain('child_age: bilinmiyor');
  });

  it('should use Turkish prompt when language is "tr"', async () => {
    // Arrange
    const mockResponse = {
      meta: {
        testType: 'Family',
        age: 7,
        language: 'tr',
        confidence: 0.85,
        uncertaintyLevel: 'low',
        dataQualityNotes: [],
      },
      insights: [
        {
          title: 'Aile Bağları',
          summary: 'Çocuk, ailesine karşı güçlü duygusal bağlar gösteriyor.',
          evidence: ['aile', 'bağlılık'],
          strength: 'strong',
        },
      ],
      homeTips: [
        {
          title: 'Aile zamanı',
          steps: ['Birlikte vakit geçirin'],
          why: 'Bağları güçlendirir',
        },
      ],
      riskFlags: [],
      trendNote: '',
      disclaimer: 'Bu içerik bilgi amaçlıdır, tanı koymaz. Endişeleriniz varsa uzmanla görüşebilirsiniz.',
    };

    (mockCreate.mockResolvedValue as any)({
      choices: [{ message: { content: JSON.stringify(mockResponse) } }],
    });

    const { analyzeDrawing } = await import('../analyze-drawing');

    // Act
    await analyzeDrawing(createTestInput({
      taskType: 'Family',
      childAge: 7,
      language: 'tr',
    }));

    // Assert
    const callArgs: any = mockCreate.mock.calls[0][0];
    const promptText = callArgs.messages[1].content[0].text;
    expect(promptText).toContain('language: tr');
    expect(promptText).toContain('child_age: 7');
    expect(promptText).toContain('test_type: Family');
  });
});
