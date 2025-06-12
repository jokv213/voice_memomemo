// Mock the OpenAI service
import {formatExercise, formatMemo} from '../index';
import {openaiService} from '../openai';

jest.mock('../openai', () => ({
  openaiService: {
    streamChat: jest.fn(),
  },
}));

const mockStreamChat = openaiService.streamChat as jest.MockedFunction<
  typeof openaiService.streamChat
>;

describe('LLM Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatExercise', () => {
    it('should format exercise data with OpenAI response', async () => {
      const mockResponse = `種目: ベンチプレス
重量: 100kg
回数: 10回
セット数: 3セット
部位: 両方`;

      mockStreamChat.mockResolvedValue(mockResponse);

      const result = await formatExercise('ベンチプレス100キロを10回3セット', {
        exercise: 'ベンチプレス',
        weight: 100,
        reps: 10,
        sets: 3,
      });

      expect(result).toEqual({
        exercise: 'ベンチプレス',
        weight: 100,
        reps: 10,
        sets: 3,
        side: '両方',
      });

      expect(mockStreamChat).toHaveBeenCalledWith([
        {
          role: 'user',
          content: expect.stringContaining('ベンチプレス100キロを10回3セット'),
        },
      ]);
    });

    it('should fallback to original data on OpenAI error', async () => {
      mockStreamChat.mockRejectedValue(new Error('OpenAI API error'));

      const originalData = {
        exercise: 'スクワット',
        weight: 80,
        reps: 15,
        sets: 2,
        side: '左',
      };

      const result = await formatExercise('スクワット', originalData);

      expect(result).toEqual({
        exercise: 'スクワット',
        weight: 80,
        reps: 15,
        sets: 2,
        side: '左',
      });
    });

    it('should handle partial parsing of OpenAI response', async () => {
      const mockResponse = `種目: デッドリフト
重量: 120kg
回数: 不明
セット数: 1セット`;

      mockStreamChat.mockResolvedValue(mockResponse);

      const result = await formatExercise('デッドリフト120キロ', {
        exercise: 'デッドリフト',
        weight: 120,
      });

      expect(result).toEqual({
        exercise: 'デッドリフト',
        weight: 120,
        sets: 1,
      });
    });

    it('should handle unknown exercise fallback', async () => {
      const mockResponse = 'Invalid response';

      mockStreamChat.mockResolvedValue(mockResponse);

      const result = await formatExercise('今日は調子が良い', {});

      expect(result).toEqual({
        exercise: '不明な種目',
      });
    });
  });

  describe('formatMemo', () => {
    it('should format memo with OpenAI response', async () => {
      const mockResponse = `体調・感覚: 調子が良い
フォーム: 正しいフォームを意識
改善点: 次回は重量アップを検討`;

      mockStreamChat.mockResolvedValue(mockResponse);

      const result = await formatMemo('今日は調子が良くて正しいフォームでできた', {
        content: '今日は調子が良くて正しいフォームでできた',
        exercise: 'ベンチプレス',
      });

      expect(result).toBe(mockResponse);
      expect(mockStreamChat).toHaveBeenCalledWith([
        {
          role: 'user',
          content: expect.stringContaining('今日は調子が良くて正しいフォームでできた'),
        },
      ]);
    });

    it('should fallback to original content on OpenAI error', async () => {
      mockStreamChat.mockRejectedValue(new Error('OpenAI API error'));

      const originalContent = '肩が痛い';
      const result = await formatMemo('肩が痛い', {
        content: originalContent,
      });

      expect(result).toBe(originalContent);
    });

    it('should handle empty response from OpenAI', async () => {
      mockStreamChat.mockResolvedValue('');

      const originalContent = 'メモ内容';
      const result = await formatMemo('メモ内容', {
        content: originalContent,
      });

      expect(result).toBe(originalContent);
    });
  });
});
