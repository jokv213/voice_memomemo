import {formatMemoPrompt} from '../formatMemoPrompt';

describe('formatMemoPrompt', () => {
  it('should generate prompt with exercise memo', () => {
    const rawText = 'ベンチプレスのフォームが良くなった気がする。次回はもう少し重量を上げてみよう';
    const memoData = {
      content: 'ベンチプレスのフォームが良くなった気がする。次回はもう少し重量を上げてみよう',
      exercise: 'ベンチプレス',
    };

    const result = formatMemoPrompt(rawText, memoData);

    expect(result).toMatchSnapshot();
    expect(result).toContain('ベンチプレスのフォームが良くなった気がする');
    expect(result).toContain('ベンチプレス');
    expect(result).toContain('体調・感覚');
    expect(result).toContain('フォームや技術');
    expect(result).toContain('改善点や目標');
  });

  it('should generate prompt with general training memo', () => {
    const rawText = '今日は調子が悪かった。肩が痛い';
    const memoData = {
      content: '今日は調子が悪かった。肩が痛い',
      exercise: undefined,
    };

    const result = formatMemoPrompt(rawText, memoData);

    expect(result).toMatchSnapshot();
    expect(result).toContain('今日は調子が悪かった。肩が痛い');
    expect(result).toContain('不明');
    expect(result).toContain('200文字以内');
  });

  it('should generate prompt with long memo content', () => {
    const rawText =
      'デッドリフトの練習をした。腰の位置に注意してフォームを確認。重量は前回より5kg増量できた。次回はさらに技術を磨いていきたい';
    const memoData = {
      content:
        'デッドリフトの練習をした。腰の位置に注意してフォームを確認。重量は前回より5kg増量できた。次回はさらに技術を磨いていきたい',
      exercise: 'デッドリフト',
    };

    const result = formatMemoPrompt(rawText, memoData);

    expect(result).toMatchSnapshot();
    expect(result).toContain('デッドリフト');
    expect(result).toContain('腰の位置');
    expect(result).toContain('簡潔で読みやすい');
  });
});
