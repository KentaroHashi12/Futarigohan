/**
 * Firestore実装
 * IRecipeServiceインターフェースを実装
 */

import {
  collection,
  doc,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  deleteDoc,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { IRecipeService, UserId, SwipeDirection, SwipeLog } from './RecipeService';

const SESSION_ID = 'demo-session-001';
const SESSIONS_COLLECTION = 'sessions';
const SWIPES_SUBCOLLECTION = 'swipes';

export class FirestoreService implements IRecipeService {
  /**
   * Firestoreが利用可能かチェック
   */
  private checkDb(): void {
    if (!db) {
      throw new Error('Firestore is not initialized. Please check your Firebase configuration.');
    }
  }

  /**
   * セッションの参照を取得
   */
  private getSessionRef() {
    this.checkDb();
    return doc(db!, SESSIONS_COLLECTION, SESSION_ID);
  }

  /**
   * スワイプサブコレクションの参照を取得
   */
  private getSwipesCollectionRef() {
    return collection(this.getSessionRef(), SWIPES_SUBCOLLECTION);
  }

  /**
   * FirestoreのドキュメントをSwipeLogに変換
   */
  private docToSwipeLog(docSnap: QueryDocumentSnapshot<DocumentData>): SwipeLog {
    const data = docSnap.data();
    return {
      recipeId: data.recipeId,
      direction: data.direction as SwipeDirection,
      timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : data.timestamp,
      userId: data.userId as UserId,
    };
  }

  /**
   * スワイプ結果をFirestoreに保存
   */
  async saveSwipe(userId: UserId, recipeId: string, direction: SwipeDirection): Promise<void> {
    try {
      // 既存の同じuserIdとrecipeIdの組み合わせを削除
      const existingQuery = query(
        this.getSwipesCollectionRef(),
        where('userId', '==', userId),
        where('recipeId', '==', recipeId)
      );
      const existingDocs = await getDocs(existingQuery);
      
      for (const docSnap of existingDocs.docs) {
        await deleteDoc(docSnap.ref);
      }

      // 新しいスワイプデータを追加
      await addDoc(this.getSwipesCollectionRef(), {
        userId,
        recipeId,
        direction,
        timestamp: Timestamp.now(),
      });

      console.log(`[Firestore] スワイプ保存: ${userId} - ${recipeId} - ${direction}`);
    } catch (error) {
      console.error('[Firestore] スワイプ履歴の保存に失敗しました:', error);
      throw error;
    }
  }

  /**
   * 既にスワイプ済みのレシピIDリストを取得
   */
  async getSwipedRecipeIds(userId: UserId): Promise<string[]> {
    try {
      const q = query(this.getSwipesCollectionRef(), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const swipedIds = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return data.recipeId as string;
      });

      console.log(`[Firestore] スワイプ済みID取得: ${userId} - ${swipedIds.length}件`);
      return swipedIds;
    } catch (error) {
      console.error('[Firestore] スワイプ履歴の取得に失敗しました:', error);
      return [];
    }
  }

  /**
   * マッチング判定: userAとuserBの両方がLikeしたレシピを取得
   */
  async checkMatch(): Promise<string[]> {
    try {
      const querySnapshot = await getDocs(this.getSwipesCollectionRef());
      const allLogs = querySnapshot.docs.map(docSnap => this.docToSwipeLog(docSnap));

      const userALikes = allLogs
        .filter(log => log.userId === 'userA' && log.direction === 'right')
        .map(log => log.recipeId);

      const userBLikes = allLogs
        .filter(log => log.userId === 'userB' && log.direction === 'right')
        .map(log => log.recipeId);

      const matches = userALikes.filter(recipeId => userBLikes.includes(recipeId));
      console.log(`[Firestore] マッチング判定: ${matches.length}件のマッチ`);
      return matches;
    } catch (error) {
      console.error('[Firestore] マッチング判定に失敗しました:', error);
      return [];
    }
  }

  /**
   * ユーザーが通常レシピを全てスワイプしたかどうかを判定
   */
  async hasUserFinishedRegularRecipes(userId: UserId, regularRecipeIds: string[]): Promise<boolean> {
    try {
      const swipedIds = await this.getSwipedRecipeIds(userId);

      // スワイプ数が10件以上の場合も完了とみなす
      if (swipedIds.length >= 10) {
        return true;
      }

      // 通常レシピIDすべてがスワイプ済みリストに含まれているかチェック
      const allRegularSwiped = regularRecipeIds.every(id => swipedIds.includes(id));
      return allRegularSwiped;
    } catch (error) {
      console.error('[Firestore] 進捗判定に失敗しました:', error);
      return false;
    }
  }

  /**
   * スワイプ履歴を全削除（デバッグ用）
   */
  async clearSwipes(): Promise<void> {
    try {
      const querySnapshot = await getDocs(this.getSwipesCollectionRef());
      
      for (const docSnap of querySnapshot.docs) {
        await deleteDoc(docSnap.ref);
      }

      console.log('[Firestore] スワイプ履歴を削除しました');
    } catch (error) {
      console.error('[Firestore] スワイプ履歴の削除に失敗しました:', error);
      throw error;
    }
  }

  /**
   * セッション内のスワイプデータをリアルタイム購読
   */
  subscribeToSession(callback: (data: { swipes: SwipeLog[] }) => void): () => void {
    console.log('[Firestore] リアルタイム購読を開始');
    
    const unsubscribe = onSnapshot(
      this.getSwipesCollectionRef(),
      (querySnapshot) => {
        const swipes = querySnapshot.docs.map(docSnap => this.docToSwipeLog(docSnap));
        console.log(`[Firestore] リアルタイム更新: ${swipes.length}件のスワイプ`);
        callback({ swipes });
      },
      (error) => {
        console.error('[Firestore] リアルタイム購読エラー:', error);
      }
    );

    return unsubscribe;
  }
}

