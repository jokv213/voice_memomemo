interface MemoData {
  content: string;
  exercise?: string;
}

export function formatMemoPrompt(rawText: string, memoData: MemoData): string {
  return `あなたはフィットネスコーチのアシスタントです。音声から得られたトレーニングメモを読みやすく整理してください。

音声入力: "${rawText}"

関連種目: ${memoData.exercise || '不明'}
メモ内容: "${memoData.content}"

以下の観点で整理された文章を返してください:

1. 体調・感覚の記録
2. フォームや技術的な気づき
3. 今後の改善点や目標
4. その他の重要な観察

要求:
- 簡潔で読みやすい日本語
- 箇条書きまたは短い段落形式
- トレーニング日誌として有用な情報を強調
- 200文字以内で要約
- 不要な情報は省略`;
}
