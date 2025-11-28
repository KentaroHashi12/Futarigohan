/**
 * ローカルストレージ実装
 * IRecipeServiceインターフェースを実装
 */

import { IRecipeService, UserId, SwipeDirection, SwipeLog } from './RecipeService';

const STORAGE_KEY = 'futarigohan_swipes';

export class LocalStorageService implements IRecipeService {
  /**
   * ローカルストレージからスワイプログを取得
   */
  private getSwipeLogs(): SwipeLog[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored) as SwipeLog[];
    } catch (error) {
      console.error('スワイプ履歴の取得に失敗しました:', error);
      return [];
    }
  }

  /**
   * スワイプ結果をローカルストレージに保存
   */
  saveSwipe(userId: UserId, recipeId: string, direction: SwipeDirection): void {
    try {
      const existingLogs = this.getSwipeLogs();
      const newLog: SwipeLog = {
        recipeId,
        direction,
        timestamp: Date.now(),
        userId,
      };
      
      // 既存のログから同じrecipeIdとuserIdの組み合わせを除外
      const filteredLogs = existingLogs.filter(
        log => !(log.recipeId === recipeId && log.userId === userId)
      );
      const updatedLogs = [...filteredLogs, newLog];
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('スワイプ履歴の保存に失敗しました:', error);
    }
  }

  /**
   * 既にスワイプ済みのレシピIDリストを取得
   */
  getSwipedRecipeIds(userId: UserId): string[] {
    const logs = this.getSwipeLogs();
    return logs
      .filter(log => log.userId === userId)
      .map(log => log.recipeId);
  }

  /**
   * マッチング判定: userAとuserBの両方がLikeしたレシピを取得
   */
  checkMatch(): string[] {
    const logs = this.getSwipeLogs();
    
    // userAとuserBそれぞれのLikeしたレシピIDを取得
    const userALikes = logs
      .filter(log => log.userId === 'userA' && log.direction === 'right')
      .map(log => log.recipeId);
    
    const userBLikes = logs
      .filter(log => log.userId === 'userB' && log.direction === 'right')
      .map(log => log.recipeId);
    
    // 両方に含まれるレシピIDを返す（マッチング）
    return userALikes.filter(recipeId => userBLikes.includes(recipeId));
  }

  /**
   * ユーザーが通常レシピを全てスワイプしたかどうかを判定
   */
  hasUserFinishedRegularRecipes(userId: UserId, regularRecipeIds: string[]): boolean {
    const swipedIds = this.getSwipedRecipeIds(userId);
    
    // スワイプ数が10件以上の場合も完了とみなす
    if (swipedIds.length >= 10) {
      return true;
    }
    
    // 通常レシピIDすべてがスワイプ済みリストに含まれているかチェック
    const allRegularSwiped = regularRecipeIds.every(id => swipedIds.includes(id));
    
    return allRegularSwiped;
  }

  /**
   * スワイプ履歴を全削除（デバッグ用）
   */
  clearSwipes(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('スワイプ履歴を削除しました');
    } catch (error) {
      console.error('スワイプ履歴の削除に失敗しました:', error);
    }
  }

  /**
   * セッション内のスワイプデータをリアルタイム購読（ダミー実装）
   * ローカルストレージではリアルタイム更新はできないため、何もしない
   */
  subscribeToSession(callback: (data: { swipes: SwipeLog[] }) => void): () => void {
    // ローカルストレージではリアルタイム更新はできない
    // 初期データを一度だけコールバックで返す
    const logs = this.getSwipeLogs();
    callback({ swipes: logs });
    
    // 購読解除関数（何もしない）
    return () => {
      // ローカルストレージでは購読解除は不要
    };
  }
}

