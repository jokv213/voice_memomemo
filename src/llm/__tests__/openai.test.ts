import {OpenAIService} from '../openai';

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock Constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      openaiApiKey: 'test-api-key',
    },
  },
}));

describe('OpenAIService', () => {
  let openaiService: OpenAIService;

  beforeEach(() => {
    jest.clearAllMocks();
    openaiService = new OpenAIService();
  });

  it('should throw error when API key is not configured', () => {
    jest.doMock('expo-constants', () => ({
      expoConfig: {
        extra: {
          openaiApiKey: undefined,
        },
      },
    }));

    expect(() => {
      // eslint-disable-next-line no-new
      new OpenAIService();
    }).toThrow('OpenAI API key not configured');
  });

  it('should stream chat completion successfully', async () => {
    const mockResponse = {
      ok: true,
      body: {
        getReader: () => ({
          read: jest
            .fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode(
                'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
              ),
            })
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode(
                'data: {"choices":[{"delta":{"content":" world"}}]}\n',
              ),
            })
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: [DONE]\n'),
            })
            .mockResolvedValueOnce({done: true}),
          releaseLock: jest.fn(),
        }),
      },
    };

    mockFetch.mockResolvedValue(mockResponse);

    const messages = [{role: 'user' as const, content: 'Test message'}];
    const result = await openaiService.streamChat(messages);

    expect(result).toBe('Hello world');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-2025-05-13',
          messages,
          stream: true,
          max_tokens: 1000,
          temperature: 0.1,
        }),
      }),
    );
  });

  it('should handle API errors', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    const messages = [{role: 'user' as const, content: 'Test message'}];

    await expect(openaiService.streamChat(messages)).rejects.toThrow(
      'OpenAI API error: 401 Unauthorized',
    );
  });

  it('should handle timeout', async () => {
    // Mock a delayed response
    mockFetch.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => resolve({ok: true, body: null}), 15000);
        }),
    );

    const messages = [{role: 'user' as const, content: 'Test message'}];

    await expect(openaiService.streamChat(messages, {timeout: 100})).rejects.toThrow(
      'OpenAI request timed out',
    );
  });

  it('should apply lag tolerance', async () => {
    const mockResponse = {
      ok: true,
      body: {
        getReader: () => ({
          read: jest
            .fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"1"}}]}\n'),
            })
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"2"}}]}\n'),
            })
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"3"}}]}\n'),
            })
            .mockResolvedValueOnce({done: true}),
          releaseLock: jest.fn(),
        }),
      },
    };

    mockFetch.mockResolvedValue(mockResponse);

    const messages = [{role: 'user' as const, content: 'Test message'}];
    const result = await openaiService.streamChat(messages, {lagTolerance: 2});

    expect(result).toBe('123');
  });
});
