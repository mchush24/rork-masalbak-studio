import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock environment variable
process.env.OPENAI_API_KEY = 'test-api-key';

// Mock superjson to avoid ESM issues
jest.mock('superjson', () => ({
  default: {
    stringify: jest.fn((v) => JSON.stringify(v)),
    parse: jest.fn((v) => JSON.parse(v)),
  },
}));

// Mock OpenAI before importing
const mockCreate = jest.fn();

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

describe('analyzeDrawing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should analyze a drawing with image and return structured response', async () => {
    // Arrange
    const mockResponse = {
      title: 'Happy Family Drawing',
      insights: 'The child shows strong emotional bonds with family members through the use of warm colors and close proximity of figures.',
      emotions: ['happy', 'secure', 'loved'],
      themes: ['family', 'connection', 'warmth'],
    };

    mockCreate.mockResolvedValue({
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
    const result = await analyzeDrawing({
      taskType: 'Draw your family',
      childAge: 7,
      imageBase64: 'fake-base64-string',
      language: 'en',
    });

    // Assert
    expect(result).toEqual(mockResponse);
    expect(mockCreate).toHaveBeenCalledTimes(1);

    const callArgs: any = mockCreate.mock.calls[0][0];
    expect(callArgs).toMatchObject({
      model: 'gpt-4o-mini',
      max_tokens: 2000,
    });

    // Verify the message structure
    expect(callArgs.messages[0].role).toBe('user');
    expect(callArgs.messages[0].content).toHaveLength(2);
    expect(callArgs.messages[0].content[0].type).toBe('text');
    expect(callArgs.messages[0].content[1].type).toBe('image_url');
  });

  it('should handle analysis without image', async () => {
    // Arrange
    const mockResponse = {
      title: 'Drawing Analysis',
      insights: 'Analysis based on task description only.',
      emotions: ['curious', 'thoughtful'],
      themes: ['imagination', 'creativity'],
    };

    mockCreate.mockResolvedValue({
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
    const result = await analyzeDrawing({
      taskType: 'Draw a tree',
      childAge: 5,
    });

    // Assert
    expect(result).toEqual(mockResponse);

    // Ensure image was NOT included
    const callArgs: any = mockCreate.mock.calls[0][0];
    const messageContent = callArgs.messages[0].content;
    expect(messageContent).toHaveLength(1);
    expect(messageContent[0].type).toBe('text');
  });

  it('should handle JSON parsing when response includes markdown code blocks', async () => {
    // Arrange
    const mockResponse = {
      title: 'Creative Expression',
      insights: 'The child demonstrates creative thinking.',
      emotions: ['excited', 'playful'],
      themes: ['creativity', 'fun'],
    };

    mockCreate.mockResolvedValue({
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
    const result = await analyzeDrawing({
      taskType: 'Free drawing',
      childAge: 6,
    });

    // Assert
    expect(result).toEqual(mockResponse);
  });

  it('should return fallback response on JSON parse error', async () => {
    // Arrange
    mockCreate.mockResolvedValue({
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
    const result = await analyzeDrawing({
      taskType: 'Draw something',
      childAge: 8,
    });

    // Assert
    expect(result).toEqual({
      title: 'Çizim Analizi',
      insights: 'This is not valid JSON at all!',
      emotions: ['meraklı', 'yaratıcı', 'enerjik'],
      themes: ['hayal gücü', 'özgür ifade', 'kendini keşfetme'],
    });
  });

  it('should throw error when OpenAI API fails', async () => {
    // Arrange
    mockCreate.mockRejectedValue(new Error('API rate limit exceeded'));

    const { analyzeDrawing } = await import('../analyze-drawing');

    // Act & Assert
    await expect(
      analyzeDrawing({
        taskType: 'Draw your feelings',
        childAge: 9,
      })
    ).rejects.toThrow('Analysis failed: API rate limit exceeded');
  });

  it('should include child age in the prompt when provided', async () => {
    // Arrange
    const mockResponse = {
      title: 'Test',
      insights: 'Test insights',
      emotions: ['happy'],
      themes: ['test'],
    };

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockResponse) } }],
    });

    const { analyzeDrawing } = await import('../analyze-drawing');

    // Act
    await analyzeDrawing({
      taskType: 'Draw a house',
      childAge: 10,
      language: 'en',
    });

    // Assert
    const callArgs: any = mockCreate.mock.calls[0][0];
    const promptText = callArgs.messages[0].content[0].text;
    expect(promptText).toContain('Age: 10');
    expect(promptText).toContain('Task: Draw a house');
  });

  it('should handle missing child age gracefully', async () => {
    // Arrange
    const mockResponse = {
      title: 'Test',
      insights: 'Test insights',
      emotions: ['curious'],
      themes: ['exploration'],
    };

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockResponse) } }],
    });

    const { analyzeDrawing } = await import('../analyze-drawing');

    // Act
    await analyzeDrawing({
      taskType: 'Free draw',
    });

    // Assert
    const callArgs: any = mockCreate.mock.calls[0][0];
    const promptText = callArgs.messages[0].content[0].text;
    expect(promptText).toContain('Yaş: bilinmiyor'); // Default is Turkish
  });

  it('should use Turkish prompt when language is "tr"', async () => {
    // Arrange
    const mockResponse = {
      title: 'Aile Çizimi',
      insights: 'Çocuk, ailesine karşı güçlü duygusal bağlar gösteriyor.',
      emotions: ['mutlu', 'güvenli', 'sevilen'],
      themes: ['aile', 'bağlılık', 'sıcaklık'],
    };

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockResponse) } }],
    });

    const { analyzeDrawing } = await import('../analyze-drawing');

    // Act
    await analyzeDrawing({
      taskType: 'Ailenizi çizin',
      childAge: 7,
      language: 'tr',
    });

    // Assert
    const callArgs: any = mockCreate.mock.calls[0][0];
    const promptText = callArgs.messages[0].content[0].text;
    expect(promptText).toContain('Sen uzman bir çocuk psikoloğusun');
    expect(promptText).toContain('Görev: Ailenizi çizin');
    expect(promptText).toContain('Yaş: 7');
    expect(promptText).toContain('TÜRKÇE');
  });
});
