// Exercise dictionary for voice parsing
export const exerciseDictionary = [
  // Upper body
  'ベンチプレス',
  'インクラインベンチプレス',
  'デクラインベンチプレス',
  'ダンベルプレス',
  'ダンベルフライ',
  'プルアップ',
  'チンアップ',
  'ラットプルダウン',
  'ローイング',
  'デッドリフト',
  'ショルダープレス',
  'ラテラルレイズ',
  'リアデルト',
  'アームカール',
  'ハンマーカール',
  'トライセップス',
  'ディップス',

  // Lower body
  'スクワット',
  'レッグプレス',
  'レッグエクステンション',
  'レッグカール',
  'カーフレイズ',
  'ランジ',
  'ブルガリアンスクワット',
  'ヒップスラスト',

  // Core
  'プランク',
  'サイドプランク',
  'クランチ',
  'シットアップ',
  'レッグレイズ',
  'ロシアンツイスト',
  'マウンテンクライマー',

  // Cardio
  'ランニング',
  'ウォーキング',
  'サイクリング',
  'ローイングマシン',
  'エリプティカル',
];

export const trainingTerms = {
  weights: ['キロ', 'kg', 'ポンド', 'lb'],
  sides: ['右', '左', '両方'],
  reps: ['回', '回数', 'レップ', 'レップス'],
  sets: ['セット', 'セット数'],
  actions: ['やった', 'やりました', 'した', 'しました', '完了', '終了'],
};

// Parse voice input to extract exercise data
export function parseExerciseFromText(text: string): {
  exercise?: string;
  weight?: number;
  side?: string;
  reps?: number;
  sets?: number;
  isStructured: boolean;
  originalText: string;
} {
  const lowercaseText = text.toLowerCase();

  // Find exercise
  const exercise = exerciseDictionary.find(ex => lowercaseText.includes(ex.toLowerCase()));

  if (!exercise) {
    return {
      isStructured: false,
      originalText: text,
    };
  }

  // Extract weight
  const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:キロ|kg|ポンド|lb)/i);
  const weight = weightMatch ? parseFloat(weightMatch[1]) : undefined;

  // Extract side
  const side = trainingTerms.sides.find(s => text.includes(s));

  // Extract reps
  const repsMatch = text.match(/(\d+)\s*(?:回|回数|レップ|レップス)/i);
  const reps = repsMatch ? parseInt(repsMatch[1], 10) : undefined;

  // Extract sets
  const setsMatch = text.match(/(\d+)\s*(?:セット|セット数)/i);
  const sets = setsMatch ? parseInt(setsMatch[1], 10) : undefined;

  return {
    exercise,
    weight,
    side,
    reps,
    sets,
    isStructured: !!(exercise && (weight || reps || sets)),
    originalText: text,
  };
}
