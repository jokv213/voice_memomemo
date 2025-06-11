# トレーニング声メモくん (Training Voice Memo)

<div align="center">
  <img src="assets/icon.png" width="120" height="120" alt="Training Voice Memo App Icon">
  
  [![CI/CD Status](https://github.com/yourusername/voice_memomemo/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/voice_memomemo/actions)
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![React Native](https://img.shields.io/badge/React%20Native-0.79.3-61dafb.svg)](https://reactnative.dev/)
  [![Expo SDK](https://img.shields.io/badge/Expo%20SDK-53-000020.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6.svg)](https://www.typescriptlang.org/)
</div>

## 概要

トレーニング声メモくんは、トレーニングセッションを音声で記録・管理できるクロスプラットフォームモバイルアプリケーションです。音声認識を活用して、エクササイズ、重量、回数、セット数を自動的に解析し、効率的なトレーニング記録を実現します。

### 主な機能

- 🎙️ **音声入力**: 日本語音声認識でトレーニング内容を記録
- 📊 **データ可視化**: トレーニング進捗をグラフで確認
- ⏱️ **レストタイマー**: セット間の休憩時間を管理
- 👥 **トレーナー連携**: トレーナーとクライアントの関係管理
- 🔒 **セキュアな認証**: Supabaseによる安全な認証システム
- 🚨 **エラートラッキング**: Sentryによるリアルタイムエラー監視

## クイックスタート

```bash
git clone https://github.com/yourusername/voice_memomemo.git
cd voice_memomemo
npm install
npm start
```

## 技術スタック

### フロントエンド

- **React Native** 0.79.3 - クロスプラットフォームモバイル開発
- **Expo SDK** 53 - 開発環境とネイティブ機能
- **TypeScript** 5.8.3 - 型安全性
- **React Navigation** 7.x - ナビゲーション管理

### バックエンド

- **Supabase** - 認証、データベース、リアルタイム機能
- **PostgreSQL** - データストレージ
- **Row Level Security** - データアクセス制御

### 音声処理

- **expo-av** - 音声録音
- **@react-native-voice/voice** - 音声認識

### UI/UX

- **Victory Native** - データ可視化
- **expo-notifications** - プッシュ通知

### 開発ツール

- **ESLint** - コード品質管理（airbnb-typescript設定）
- **Prettier** - コードフォーマット
- **Jest** - ユニットテスト
- **Detox** - E2Eテスト
- **Husky** - Gitフック管理
- **GitHub Actions** - CI/CDパイプライン
- **Sentry** - エラートラッキング

## インストール

### 前提条件

- Node.js 18以上
- npm または yarn
- Expo CLI
- iOS Simulator（iOS開発の場合）
- Android Emulator（Android開発の場合）

### セットアップ手順

1. リポジトリをクローン

```bash
git clone https://github.com/yourusername/voice_memomemo.git
cd voice_memomemo
```

2. 依存関係をインストール

```bash
npm install
```

3. 環境変数を設定
   `.env`ファイルを作成し、以下の変数を設定：

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

4. Supabaseデータベースをセットアップ

```bash
# sql/schema.sqlのSQLを実行してテーブルを作成
```

## 開発

### 開発サーバーの起動

```bash
npm start
```

### プラットフォーム別の起動

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

### コード品質チェック

```bash
# ESLint
npm run lint
npm run lint:fix

# TypeScript型チェック
npm run typecheck

# フォーマット
npm run format
```

### テスト

```bash
# ユニットテスト
npm test
npm run test:watch
npm run test:coverage

# E2Eテスト（iOS）
npm run e2e:build:ios
npm run e2e:test:ios

# E2Eテスト（Android）
npm run e2e:build:android
npm run e2e:test:android
```

## プロジェクト構造

```
voice_memomemo/
├── src/
│   ├── components/        # 再利用可能なコンポーネント
│   ├── contexts/         # React Context（認証など）
│   ├── data/            # 静的データ（エクササイズ辞書）
│   ├── lib/             # 外部ライブラリ設定（Supabase）
│   ├── navigation/      # ナビゲーション設定
│   ├── screens/         # 画面コンポーネント
│   │   ├── auth/       # 認証画面
│   │   └── main/       # メイン画面
│   ├── services/        # ビジネスロジック
│   └── types/           # TypeScript型定義
├── assets/              # 画像・アイコン
├── e2e/                 # E2Eテスト
├── sql/                 # データベーススキーマ
└── .github/workflows/   # CI/CD設定
```

## 主要機能の実装詳細

### 音声入力処理

- 60以上の日本語エクササイズ名をサポート
- 音声からエクササイズ、重量、回数、セット数を自動解析
- リアルタイム音声認識と視覚的フィードバック

### データ可視化

- Victory Nativeを使用した3つのビュー：
  - セッション履歴
  - エクササイズ別統計
  - メモ一覧
- プルトゥリフレッシュ機能

### レストタイマー

- バックグラウンド通知対応
- プリセットタイマー（30秒、1分、90秒、2分、3分）
- 円形プログレスインジケーター

## デプロイ

### EAS Buildを使用したビルド

1. EAS CLIをインストール

```bash
npm install -g eas-cli
```

2. EASにログイン

```bash
eas login
```

3. ビルド設定を初期化

```bash
eas build:configure
```

4. ビルドを実行

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

### CI/CDパイプライン

GitHub Actionsが以下を自動実行：

- コード品質チェック（ESLint、TypeScript）
- ユニットテスト
- E2Eテスト（PRのみ）
- セキュリティスキャン
- EAS Update（mainブランチ）

## セキュリティ

- Supabase Row Level Securityによるデータアクセス制御
- Expo Secure Storeを使用した認証情報の安全な保存
- 環境変数による秘密情報の管理
- 定期的なセキュリティスキャン（npm audit、Snyk）

## データベーススキーマ

### テーブル構造

- **profiles** - ユーザープロフィール（role: individual/trainer）
- **trainer_clients** - トレーナーとクライアントの多対多関係
- **sessions** - トレーニングセッション
- **exercise_logs** - セッション内の個別エクササイズエントリー

### Row Level Security (RLS)

- プロフィールは所有者のみ更新可能
- トレーニングデータは関連ユーザーのみアクセス可能
- トレーナーは担当クライアントのデータにアクセス可能

## トラブルシューティング

### よくある問題

1. **音声認識が動作しない**

   - マイク権限を確認
   - デバイスの音声認識設定を確認

2. **ビルドエラー**

   - `npm ci`で依存関係を再インストール
   - キャッシュをクリア：`expo start -c`

3. **Supabase接続エラー**
   - 環境変数が正しく設定されているか確認
   - Supabaseプロジェクトのステータスを確認

## 貢献

プルリクエストを歓迎します！大きな変更の場合は、まずissueを作成して変更内容を議論してください。

1. フォーク
2. フィーチャーブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'feat: add amazing feature'`）
4. プッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを作成

### 開発ワークフロー

1. `npm run lint`と`npm run test`を実行
2. Conventional Commitsに従ったコミットメッセージ
3. TypeScriptコンパイルが通ることを確認
4. テストカバレッジ90%以上を維持

### コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/)に従ってください：

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント更新
- `style:` コードスタイル変更
- `refactor:` リファクタリング
- `test:` テスト追加・修正
- `chore:` ビルドプロセスやツールの変更

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## サポート

問題や質問がある場合は、[GitHub Issues](https://github.com/yourusername/voice_memomemo/issues)で報告してください。

---

<div align="center">
  Made with ❤️ using React Native and Expo
</div>
