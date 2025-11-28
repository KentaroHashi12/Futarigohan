/**
 * ストレージ管理ユーティリティ（後方互換性のためのラッパー）
 * FirestoreServiceを使用（環境変数が設定されている場合）
 * 環境変数が設定されていない場合はLocalStorageServiceにフォールバック
 */

import { LocalStorageService } from '../services/LocalStorageService';
import { FirestoreService } from '../services/FirestoreService';
import type { UserId, SwipeDirection } from '../services/RecipeService';

// 環境変数が設定されているかチェック
const useFirestore = !!(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

// サービスインスタンス（Firestoreが利用可能な場合はFirestoreService、そうでなければLocalStorageService）
let recipeService: LocalStorageService | FirestoreService;
try {
  recipeService = useFirestore ? new FirestoreService() : new LocalStorageService();
  console.log(`[Storage] ${useFirestore ? 'Firestore' : 'LocalStorage'} モードで動作中`);
} catch (error) {
  console.warn('[Storage] FirestoreServiceの初期化に失敗しました。LocalStorageServiceにフォールバックします:', error);
  recipeService = new LocalStorageService();
  console.log('[Storage] LocalStorage モードで動作中（フォールバック）');
}

// 後方互換性のための型定義
export interface SwipeLog {
  recipeId: string;
  direction: string;
  timestamp: number;
  userId: 'userA' | 'userB';
}

/**
 * スワイプ結果を保存（非同期対応）
 */
export async function saveSwipe(recipeId: string, direction: string, userId: UserId): Promise<void> {
  await Promise.resolve(recipeService.saveSwipe(userId, recipeId, direction as SwipeDirection));
}

/**
 * 既にスワイプ済みのレシピIDリストを取得（非同期対応）
 */
export async function getSwipedRecipeIds(userId: UserId): Promise<string[]> {
  return await Promise.resolve(recipeService.getSwipedRecipeIds(userId));
}

/**
 * マッチング判定: userAとuserBの両方がLikeしたレシピを取得（非同期対応）
 */
export async function checkMatch(): Promise<string[]> {
  return await Promise.resolve(recipeService.checkMatch());
}

/**
 * ユーザーが通常レシピを全てスワイプしたかどうかを判定（非同期対応）
 */
export async function hasUserFinishedRegularRecipes(
  userId: UserId,
  regularRecipeIds: string[]
): Promise<boolean> {
  return await Promise.resolve(recipeService.hasUserFinishedRegularRecipes(userId, regularRecipeIds));
}

/**
 * スワイプ履歴を全削除（デバッグ用）
 */
export function clearSwipes(): void {
  recipeService.clearSwipes();
}

/**
 * セッション内のスワイプデータをリアルタイム購読
 */
export function subscribeToSession(callback: (data: { swipes: any[] }) => void): () => void {
  return recipeService.subscribeToSession(callback);
}
