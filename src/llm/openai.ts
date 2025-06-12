import Constants from 'expo-constants';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    delta?: {
      content?: string;
    };
    message?: {
      content: string;
    };
  }>;
}

interface StreamOptions {
  timeout?: number;
  lagTolerance?: number;
}

class OpenAIService {
  private apiKey: string;

  private baseURL = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = Constants.expoConfig?.extra?.openaiApiKey as string;
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }
  }

  async streamChat(messages: OpenAIMessage[], options: StreamOptions = {}): Promise<string> {
    const {timeout = 10000, lagTolerance = 8} = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini-2025-05-13',
          messages,
          stream: true,
          max_tokens: 1000,
          temperature: 0.1,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body from OpenAI');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      let tokenCount = 0;

      const processChunk = (lines: string[]) => {
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data !== '[DONE]') {
              try {
                const parsed: OpenAIResponse = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                if (content) {
                  result += content;
                  tokenCount += 1;
                }
              } catch (parseError) {
                // Skip invalid JSON lines
              }
            }
          }
        }
      };

      try {
        while (true) {
          const {done, value} = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, {stream: true});
          const lines = chunk.split('\n');

          processChunk(lines);

          // Apply lag tolerance
          if (tokenCount >= lagTolerance) {
            await new Promise<void>(resolve => {
              setTimeout(() => resolve(), 0);
            });
            tokenCount = 0;
          }
        }
      } finally {
        reader.releaseLock();
      }

      return result.trim();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('OpenAI request timed out');
      }
      throw error;
    }
  }
}

export const openaiService = new OpenAIService();
export {OpenAIService};
