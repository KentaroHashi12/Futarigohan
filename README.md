# Futarigohan (フタリゴハン)

同棲カップルや共働き夫婦のための献立決めアプリケーション

## 技術スタック

- **フレームワーク**: Vite + React + TypeScript
- **スタイリング**: Tailwind CSS
- **データ管理**: ローカルストレージ（Phase 1）、Firestore（Phase 2以降）
- **バックエンド**: Firebase（認証・データベース）

## セットアップ

### 必要な環境

- Node.js 18以上
- npm または yarn

### インストール

```bash
npm install
```

### 環境変数の設定（Firebase使用時）

Firebaseを使用する場合は、プロジェクトルートに `.env` ファイルを作成し、以下の環境変数を設定してください：

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

現在はローカルストレージモードで動作するため、Firebase設定は任意です。

### 開発サーバーの起動

```bash
npm run dev
```

### ビルド

```bash
npm run build
```

ビルド後、`dist`フォルダに本番用ファイルが生成されます。

## デプロイ

### Firebase Hosting へのデプロイ

1. Firebase CLI のインストール（未インストールの場合）:
   ```bash
   npm install -g firebase-tools
   ```

2. Firebase にログイン:
   ```bash
   firebase login
   ```

3. Firebase プロジェクトの初期化（初回のみ）:
   ```bash
   firebase init hosting
   ```
   - 既存のプロジェクトを選択、または新規作成
   - `firebase.json`は既に作成済みのため、設定を確認

4. デプロイ:
   ```bash
   firebase deploy --only hosting
   ```

デプロイ後、Firebase HostingのURL（例: `https://your-project-id.web.app`）でアプリにアクセスできます。

## プロジェクト構造

```
futarigohan/
├── src/
│   ├── components/           # Reactコンポーネント
│   ├── data/
│   │   └── recipes.json      # レシピデータ
│   ├── lib/
│   │   └── firebase.ts       # Firebase初期化
│   ├── services/             # データ管理サービス
│   │   ├── RecipeService.ts  # インターフェース定義
│   │   └── LocalStorageService.ts  # ローカルストレージ実装
│   ├── types/
│   │   └── Recipe.ts         # 型定義
│   ├── utils/
│   │   └── storage.ts        # ストレージユーティリティ（後方互換性）
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 開発ロードマップ

詳細は `development_roadmap.md` を参照してください。


