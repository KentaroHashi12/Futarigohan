プロダクト定義書: Futarigohan (フタリゴハン)

## 📍 現在のステータス

**Phase 2.3 (ルーム機能実装) 待ち**

- ✅ Phase 0: 環境構築・準備 - **完了**
- ✅ Phase 1: プロトタイプ開発 (1.1〜1.6) - **完了**
- ✅ Phase 2.1: Firebase無料枠のセットアップ - **完了**
- ✅ Phase 2.2: リアルタイム同期の実装 - **完了**
- ✅ Phase 4: 公開準備（前倒し） - **完了**
- ⏳ Phase 2.3: ユーザー管理機能 - **次のステップ**

---

1. プロダクト概要

**「Futarigohan」**は、同棲カップルや共働き夫婦が抱える「毎日の献立決めのストレス」と「パートナー間の意思決定の不和」を解消するための、合意形成特化型アプリケーションである。

1.1 ビジョン

「何食べたい？」「なんでもいい」という不毛な会話をなくし、ゲーム感覚で「今夜の正解」を導き出す。

1.2 ターゲットユーザー

同棲カップル、共働き夫婦、子育て世帯。

「献立を考えるのが面倒」だが「手抜きへの罪悪感」や「マンネリ化」に悩んでいる層。

2. 解決する課題と科学的根拠

2.1 課題 (Pain Points)

決断疲れ (Decision Fatigue): 夕方、仕事終わりの判断力が低下した状態で、無限のレシピから選択するのは苦痛である。

責任の押し付け合い: 「なんでもいい」と言いつつ、提案すると却下される理不尽さが喧嘩を生む。

選択のパラドックス: 選択肢が多すぎると、選んだ結果への満足度が下がる。

2.2 解決アプローチ (Solution)

Tinder形式 UI: 情報をチャンク化（小分け）し、直感的な「Yes/No」だけで判断させる。

マジカルナンバー7: 1回のセッションで提示するカードを7〜10枚に限定し、認知負荷を下げる。

Hangry対策: 空腹によるイライラ（Hangry）がピークに達する前に、最速で合意形成を行う。

3. MVP (Minimum Viable Product) 機能要件

初期リリース（Ver 1.0）において実装すべきコア機能。

3.1 ユーザー体験フロー

通知: 指定時刻（例: 17:00）にペアへ通知が届く。

配布: 本日の「手札（レシピカード）」が10枚配られる。

選択 (Swipe): 
- Right Swipe: 食べたい (Like)
- Left Swipe: 気分じゃない (Nope)
- ~~Up Swipe: 超食べたい (Super Like / 相手に通知)~~ ※廃止（UIシンプル化のため）

マッチング: 双方がRight/Upしたカードが「マッチ」として確定。

デッドロック回避: 10枚すべて不一致の場合、「ジョーカーカード（外食・中食・冷凍食品）」を提示。

3.2 扱うデータ (Data Strategy)

外部参照型: アプリ内に詳細なレシピ手順は持たない。

構造: 「料理名」「画像」「主要食材」「外部リンク（Google検索/動画URL）」のみを持つ。

データソース: 著作権リスクを回避するため、初期は権利フリー画像または購入画像を用いた独自DB（100〜200品）を手動構築する。

**現在の実装状況**
- 初期レシピデータ: 10品（通常）+ 3品（ジョーカー）
- データ形式: `src/data/recipes.json`
- 型定義: `src/types/Recipe.ts`

4. 技術スタック・データ構造案

個人開発における開発速度と、リアルタイム性を重視した構成。

4.1 決定済み技術スタック ✅

**Frontend**
- **フレームワーク**: Vite + React + TypeScript
- **スタイリング**: Tailwind CSS
- **UIライブラリ**: 
  - `react-tinder-card` (スワイプUI)
  - `lucide-react` (アイコン)
  - `react-confetti` (マッチング演出)

**Backend / DB**
- **Firebase** (Auth, Firestore, Hosting)
  - Firestore: リアルタイム同期（`onSnapshot`）
  - Firebase Hosting: SPA構成（`dist`ディレクトリ参照）
  - 環境変数: `import.meta.env.VITE_FIREBASE_*`

**インフラ**
- **Firebase Hosting**: SPA構成、`firebase.json`で設定
- **デプロイ手順**: `npm run build` → `firebase deploy --only hosting`

**データ管理**
- **サービス抽象化**: `IRecipeService`インターフェース
  - `LocalStorageService`: ローカルストレージ実装（フォールバック）
  - `FirestoreService`: Firestore実装（本番環境）
  - 環境変数に応じて自動切り替え

4.2 データモデル (JSON Schema Draft)

Recipe Card Document

{
  "id": "recipe_001",
  "title": "豚肉の生姜焼き",
  "imageUrl": "https://storage.../shogayaki.jpg",
  "category": "main",
  "tags": ["肉料理", "15分", "定番"],
  "externalLink": "[https://www.google.com/search?q=豚肉の生姜焼き+レシピ+人気](https://www.google.com/search?q=豚肉の生姜焼き+レシピ+人気)",
  "ingredients": ["豚肉", "玉ねぎ", "生姜"]
}


Session Document (1日ごとの合意形成ルーム)

{
  "sessionId": "room_userA_userB_20231027",
  "date": "2023-10-27",
  "participants": ["userA_id", "userB_id"],
  "cards": ["recipe_001", "recipe_045", "recipe_012"...], // 今日の10枚
  "swipes": {
    "userA_id": {"recipe_001": "like", "recipe_045": "nope"},
    "userB_id": {"recipe_001": "like", "recipe_045": "like"}
  },
  "matchResult": "recipe_001", // 合意形成されたID
  "status": "completed" // active, completed, deadlock
}


5. 開発ロードマップ

詳細は `development_roadmap.md` を参照してください。

**完了したフェーズ**
- ✅ Phase 0: 環境構築・準備
- ✅ Phase 1: プロトタイプ開発 (1.1〜1.6)
  - ✅ データセット作成（10品 + ジョーカー3品）
  - ✅ スワイプUIの実装
  - ✅ ローカルストレージ実装
  - ✅ セッション管理機能（単一デバイスでのユーザー切り替え）
  - ✅ デッドロック回避機能（ジョーカーカード + 待機画面）
  - ✅ 基本UI/UX実装（紙吹雪アニメーション、モバイル最適化）
- ✅ Phase 2.1: Firebase無料枠のセットアップ
- ✅ Phase 2.2: リアルタイム同期の実装（Firestore `onSnapshot`）
- ✅ Phase 4: 公開準備（Firebase Hosting設定）

**次のステップ**
- ⏳ Phase 2.3: ユーザー管理機能（ペアリング、セッション管理の改善）
- ⏳ Phase 3: ドッグフーディング & α版改善

6. マネタイズ・拡張戦略 (Future)

アフィリエイト: Deadlock時の「UberEats」「nosh」への誘導。

プレミアム機能: 「嫌いな食材除外」「過去の殿堂入りメニュー復活」。

広告: カードデッキへのネイティブ広告（新商品調味料を使ったレシピ等）の挿入。

---

## 7. 技術的な決定事項・仕様変更

### 7.1 主な仕様変更

- **Super Like機能の廃止**: UIシンプル化のため、上スワイプ（Super Like）機能を廃止。左右スワイプ（Like/Nope）のみ対応。
- **待機画面の実装**: 非同期プレイに対応するため、`WaitingState`コンポーネントを実装。片方のユーザーが先に完了した場合、パートナーの完了を待つ画面を表示。
- **Firestoreセキュリティルール**: 現在は一時的にテストモード（全許可）で運用中。詳細は「7.4 今後の課題」を参照。

### 7.2 アーキテクチャ

- **サービス抽象化**: `IRecipeService`インターフェースにより、ローカルストレージとFirestoreを透過的に切り替え可能。
- **リアルタイム同期**: Firestoreの`onSnapshot`を使用し、相手のスワイプ結果をリアルタイムで受信。待機画面から自動的に結果画面へ遷移。
- **エラーハンドリング**: Firebase初期化エラー（`CONFIGURATION_NOT_FOUND`等）を`try-catch`で捕捉し、ローカルストレージにフォールバック。

### 7.3 デプロイ

- **ビルド**: `npm run build`で`dist`フォルダに本番用ファイルを生成。
- **Firebase Hosting**: `firebase.json`でSPA構成を設定。すべてのアクセスを`index.html`にリライト。
- **環境変数**: 本番環境では、Firebase Hostingの環境変数設定機能を使用するか、ビルド時に環境変数を埋め込む必要がある。

### 7.4 今後の課題

#### ⚠️ Firestore Security Rules

現状は開発効率とプロトタイプ動作を優先し、セキュリティルールを `allow read, write: if true;` （全許可・テストモード）で運用しています。

将来的（Phase 3以降、または本格運用時）には、不正な書き込みやデータ流出を防ぐため、以下のような制限を加える必要があります：

- `request.auth != null` （認証済みユーザーのみ許可）
- セッション参加者のみがそのセッションを読み書きできるルールの適用

**実装タイミング**: Phase 2.3（ユーザー管理機能）でFirebase Authenticationを導入後、またはPhase 3（本格運用前）に必ず実装すること。