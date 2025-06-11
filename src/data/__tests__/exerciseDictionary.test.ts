import {parseExerciseFromText, EXERCISE_KEYWORDS} from '../exerciseDictionary';

describe('exerciseDictionary', () => {
  describe('parseExerciseFromText', () => {
    describe('structured parsing', () => {
      it('should parse complete exercise data with weight, reps, and sets', () => {
        const result = parseExerciseFromText('ベンチプレス 100キロ 10回 3セット');

        expect(result).toEqual({
          exercise: 'ベンチプレス',
          weight: 100,
          reps: 10,
          sets: 3,
          isStructured: true,
          originalText: 'ベンチプレス 100キロ 10回 3セット',
        });
      });

      it('should parse exercise with kg notation', () => {
        const result = parseExerciseFromText('スクワット 80kg 8回 4セット');

        expect(result).toEqual({
          exercise: 'スクワット',
          weight: 80,
          reps: 8,
          sets: 4,
          isStructured: true,
          originalText: 'スクワット 80kg 8回 4セット',
        });
      });

      it('should parse exercise with alternative weight notation', () => {
        const result = parseExerciseFromText('デッドリフト 120キログラム 5回 5セット');

        expect(result).toEqual({
          exercise: 'デッドリフト',
          weight: 120,
          reps: 5,
          sets: 5,
          isStructured: true,
          originalText: 'デッドリフト 120キログラム 5回 5セット',
        });
      });

      it('should parse exercise with side specification', () => {
        const result = parseExerciseFromText('右 ダンベルカール 15キロ 12回 3セット');

        expect(result).toEqual({
          exercise: 'ダンベルカール',
          weight: 15,
          side: '右',
          reps: 12,
          sets: 3,
          isStructured: true,
          originalText: '右 ダンベルカール 15キロ 12回 3セット',
        });
      });

      it('should parse exercise with left side specification', () => {
        const result = parseExerciseFromText('左 レッグエクステンション 25キロ 15回 2セット');

        expect(result).toEqual({
          exercise: 'レッグエクステンション',
          weight: 25,
          side: '左',
          reps: 15,
          sets: 2,
          isStructured: true,
          originalText: '左 レッグエクステンション 25キロ 15回 2セット',
        });
      });

      it('should parse exercise without weight', () => {
        const result = parseExerciseFromText('腕立て伏せ 20回 3セット');

        expect(result).toEqual({
          exercise: '腕立て伏せ',
          reps: 20,
          sets: 3,
          isStructured: true,
          originalText: '腕立て伏せ 20回 3セット',
        });
      });

      it('should parse exercise with decimal weight', () => {
        const result = parseExerciseFromText('ダンベルフライ 12.5キロ 10回 3セット');

        expect(result).toEqual({
          exercise: 'ダンベルフライ',
          weight: 12.5,
          reps: 10,
          sets: 3,
          isStructured: true,
          originalText: 'ダンベルフライ 12.5キロ 10回 3セット',
        });
      });

      it('should parse exercise with different rep notation', () => {
        const result = parseExerciseFromText('懸垂 8レップ 4セット');

        expect(result).toEqual({
          exercise: '懸垂',
          reps: 8,
          sets: 4,
          isStructured: true,
          originalText: '懸垂 8レップ 4セット',
        });
      });
    });

    describe('partial parsing', () => {
      it('should parse exercise name only', () => {
        const result = parseExerciseFromText('ベンチプレス');

        expect(result).toEqual({
          exercise: 'ベンチプレス',
          isStructured: false,
          originalText: 'ベンチプレス',
        });
      });

      it('should parse exercise with weight only', () => {
        const result = parseExerciseFromText('スクワット 60キロ');

        expect(result).toEqual({
          exercise: 'スクワット',
          weight: 60,
          isStructured: false,
          originalText: 'スクワット 60キロ',
        });
      });

      it('should parse exercise with reps only', () => {
        const result = parseExerciseFromText('腕立て伏せ 15回');

        expect(result).toEqual({
          exercise: '腕立て伏せ',
          reps: 15,
          isStructured: false,
          originalText: '腕立て伏せ 15回',
        });
      });

      it('should handle unknown exercise names', () => {
        const result = parseExerciseFromText('未知の運動 50キロ 10回 3セット');

        expect(result).toEqual({
          exercise: '未知の運動',
          weight: 50,
          reps: 10,
          sets: 3,
          isStructured: true,
          originalText: '未知の運動 50キロ 10回 3セット',
        });
      });
    });

    describe('edge cases', () => {
      it('should handle empty string', () => {
        const result = parseExerciseFromText('');

        expect(result).toEqual({
          isStructured: false,
          originalText: '',
        });
      });

      it('should handle text with no exercise data', () => {
        const result = parseExerciseFromText('今日は良い天気ですね');

        expect(result).toEqual({
          isStructured: false,
          originalText: '今日は良い天気ですね',
        });
      });

      it('should handle numbers without units', () => {
        const result = parseExerciseFromText('ベンチプレス 100 10 3');

        expect(result).toEqual({
          exercise: 'ベンチプレス',
          isStructured: false,
          originalText: 'ベンチプレス 100 10 3',
        });
      });

      it('should handle malformed input', () => {
        const result = parseExerciseFromText('ベンチプレス キロ 回 セット');

        expect(result).toEqual({
          exercise: 'ベンチプレス',
          isStructured: false,
          originalText: 'ベンチプレス キロ 回 セット',
        });
      });

      it('should handle case-insensitive exercise names', () => {
        const result = parseExerciseFromText('べんちぷれす 80キロ 8回 3セット');

        expect(result).toEqual({
          exercise: 'べんちぷれす',
          weight: 80,
          reps: 8,
          sets: 3,
          isStructured: true,
          originalText: 'べんちぷれす 80キロ 8回 3セット',
        });
      });
    });

    describe('exercise keyword matching', () => {
      it('should recognize chest exercises', () => {
        const chestExercises = ['ベンチプレス', 'ダンベルフライ', 'プッシュアップ'];

        chestExercises.forEach(exercise => {
          const result = parseExerciseFromText(`${exercise} 50キロ 10回 3セット`);
          expect(result.exercise).toBe(exercise);
          expect(result.isStructured).toBe(true);
        });
      });

      it('should recognize leg exercises', () => {
        const legExercises = ['スクワット', 'デッドリフト', 'レッグプレス'];

        legExercises.forEach(exercise => {
          const result = parseExerciseFromText(`${exercise} 100キロ 8回 4セット`);
          expect(result.exercise).toBe(exercise);
          expect(result.isStructured).toBe(true);
        });
      });

      it('should recognize back exercises', () => {
        const backExercises = ['懸垂', 'ラットプルダウン', 'ベントオーバーロウ'];

        backExercises.forEach(exercise => {
          const result = parseExerciseFromText(`${exercise} 70キロ 12回 3セット`);
          expect(result.exercise).toBe(exercise);
          expect(result.isStructured).toBe(true);
        });
      });
    });

    describe('number extraction', () => {
      it('should extract integers', () => {
        const result = parseExerciseFromText('ベンチプレス 100キロ 10回 3セット');

        expect(result.weight).toBe(100);
        expect(result.reps).toBe(10);
        expect(result.sets).toBe(3);
      });

      it('should extract decimal numbers', () => {
        const result = parseExerciseFromText('ダンベルカール 22.5キロ 8回 3セット');

        expect(result.weight).toBe(22.5);
      });

      it('should handle large numbers', () => {
        const result = parseExerciseFromText('デッドリフト 200キロ 5回 5セット');

        expect(result.weight).toBe(200);
      });

      it('should ignore invalid numbers', () => {
        const result = parseExerciseFromText('ベンチプレス キロ 10回 3セット');

        expect(result.weight).toBeUndefined();
        expect(result.reps).toBe(10);
        expect(result.sets).toBe(3);
      });
    });

    describe('alternative notation handling', () => {
      it('should handle alternative set notation', () => {
        const result = parseExerciseFromText('ベンチプレス 80キロ 10回 3set');

        expect(result.sets).toBe(3);
      });

      it('should handle mixed notation', () => {
        const result = parseExerciseFromText('スクワット 90kg 12rep 4セット');

        expect(result.weight).toBe(90);
        expect(result.reps).toBe(12);
        expect(result.sets).toBe(4);
      });

      it('should handle spaces in different positions', () => {
        const result = parseExerciseFromText('ベンチプレス80キロ10回3セット');

        expect(result.exercise).toBe('ベンチプレス');
        expect(result.weight).toBe(80);
        expect(result.reps).toBe(10);
        expect(result.sets).toBe(3);
      });
    });
  });

  describe('EXERCISE_KEYWORDS', () => {
    it('should contain basic exercise categories', () => {
      expect(EXERCISE_KEYWORDS.chest).toContain('ベンチプレス');
      expect(EXERCISE_KEYWORDS.legs).toContain('スクワット');
      expect(EXERCISE_KEYWORDS.back).toContain('懸垂');
      expect(EXERCISE_KEYWORDS.shoulders).toContain('ショルダープレス');
      expect(EXERCISE_KEYWORDS.arms).toContain('ダンベルカール');
      expect(EXERCISE_KEYWORDS.core).toContain('プランク');
    });

    it('should have non-empty categories', () => {
      Object.values(EXERCISE_KEYWORDS).forEach(category => {
        expect(Array.isArray(category)).toBe(true);
        expect(category.length).toBeGreaterThan(0);
      });
    });

    it('should contain expected number of exercises', () => {
      const totalExercises = Object.values(EXERCISE_KEYWORDS).reduce(
        (sum, category) => sum + category.length,
        0,
      );

      expect(totalExercises).toBeGreaterThan(50); // Should have at least 50 exercises
    });
  });
});
