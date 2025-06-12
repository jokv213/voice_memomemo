interface ExerciseData {
  exercise?: string;
  weight?: number;
  reps?: number;
  sets?: number;
  side?: string;
}

export function formatExercisePrompt(rawText: string, parsedData: ExerciseData): string {
  return `あなたは筋力トレーニングの専門家です。音声入力から得られたトレーニング記録を、正確で一貫性のある形式に整理してください。

音声入力: "${rawText}"

現在の解析結果:
- 種目: ${parsedData.exercise || '不明'}
- 重量: ${parsedData.weight ? `${parsedData.weight}kg` : '不明'}
- 回数: ${parsedData.reps ? `${parsedData.reps}回` : '不明'}
- セット数: ${parsedData.sets ? `${parsedData.sets}セット` : '不明'}
- 部位: ${parsedData.side || '不明'}

以下の形式で整理された記録を返してください:

種目: [正式な種目名]
重量: [数値]kg
回数: [数値]回
セット数: [数値]セット
部位: [左/右/両方/不明]

注意事項:
- 種目名は一般的な筋トレ用語を使用
- 数値は明確でない場合は「不明」
- 部位は「左」「右」「両方」「不明」のいずれか
- 一貫性を保ち、簡潔に記述`;
}
