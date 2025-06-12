import {formatExercisePrompt} from '../formatExercisePrompt';

describe('formatExercisePrompt', () => {
  it('should generate prompt with complete exercise data', () => {
    const rawText = 'ベンチプレス100キロを10回3セット右側で実施';
    const parsedData = {
      exercise: 'ベンチプレス',
      weight: 100,
      reps: 10,
      sets: 3,
      side: '右',
    };

    const result = formatExercisePrompt(rawText, parsedData);

    expect(result).toMatchSnapshot();
    expect(result).toContain('ベンチプレス100キロを10回3セット右側で実施');
    expect(result).toContain('ベンチプレス');
    expect(result).toContain('100kg');
    expect(result).toContain('10回');
    expect(result).toContain('3セット');
    expect(result).toContain('右');
  });

  it('should generate prompt with partial exercise data', () => {
    const rawText = 'スクワットを何回かやった';
    const parsedData = {
      exercise: 'スクワット',
      weight: undefined,
      reps: undefined,
      sets: undefined,
      side: undefined,
    };

    const result = formatExercisePrompt(rawText, parsedData);

    expect(result).toMatchSnapshot();
    expect(result).toContain('スクワットを何回かやった');
    expect(result).toContain('スクワット');
    expect(result).toContain('不明');
  });

  it('should generate prompt with unknown exercise', () => {
    const rawText = '今日のトレーニングは良かった';
    const parsedData = {
      exercise: undefined,
      weight: undefined,
      reps: undefined,
      sets: undefined,
      side: undefined,
    };

    const result = formatExercisePrompt(rawText, parsedData);

    expect(result).toMatchSnapshot();
    expect(result).toContain('今日のトレーニングは良かった');
    expect(result).toContain('不明');
  });
});
