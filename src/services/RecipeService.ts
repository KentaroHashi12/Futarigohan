/**
 * レシピスワイプデータ管理のインターフェース
 * ローカルストレージとFirestoreの両方に対応できるように抽象化
 */

export type UserId = 'userA' | 'userB';
export type SwipeDirection = 'left' | 'right';

/**
 * スワイプログの型定義
 */
export interface SwipeLog {
  recipeId: string;
  direction: SwipeDirection;
  timestamp: number;
  userId: UserId;
}

/**
 * レシピスワイプデータ管理サービスのインターフェース
 */
export interface IRecipeService {
  /**
   * スワイプ結果を保存
   * @param userId ユーザーID
   * @param recipeId レシピID
   * @param direction スワイプ方向
   */
  saveSwipe(userId: UserId, recipeId: string, direction: SwipeDirection): Promise<void> | void;

  /**
   * スワイプ済みのレシピIDリストを取得
   * @param userId ユーザーID
   * @returns スワイプ済みのレシピIDの配列
   */
  getSwipedRecipeIds(userId: UserId): Promise<string[]> | string[];

  /**
   * マッチング判定: userAとuserBの両方がLikeしたレシピを取得
   * @returns マッチングしたレシピIDの配列
   */
  checkMatch(): Promise<string[]> | string[];

  /**
   * ユーザーが通常レシピを全てスワイプしたかどうかを判定
   * @param userId ユーザーID
   * @param regularRecipeIds 通常レシピIDの配列
   * @returns 通常レシピを全てスワイプした場合、またはスワイプ数が10件以上の場合にtrue
   */
  hasUserFinishedRegularRecipes(userId: UserId, regularRecipeIds: string[]): Promise<boolean> | boolean;

  /**
   * スワイプ履歴を全削除（デバッグ用）
   */
  clearSwipes(): Promise<void> | void;

  /**
   * セッション内のスワイプデータをリアルタイム購読
   * @param callback データ変更時に呼ばれるコールバック関数
   * @returns 購読を解除する関数
   */
  subscribeToSession(callback: (data: { swipes: SwipeLog[] }) => void): () => void;
}

