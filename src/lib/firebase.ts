/**
 * Firebase初期化ファイル
 * Authentication と Firestore のインスタンスを初期化
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase設定（環境変数から読み込む）
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebaseアプリの初期化（既に初期化されている場合は再利用）
let app: FirebaseApp | null = null;

try {
  // 環境変数が設定されている場合のみ初期化
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
  }
} catch (error) {
  console.warn('[Firebase] 初期化エラー（環境変数未設定の可能性）:', error);
}

// Authentication と Firestore のインスタンスをエクスポート（エラーハンドリング付き）
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.warn('[Firebase] Auth/Firestore初期化エラー:', error);
  // 環境変数が設定されていない場合はnullのまま（LocalStorageServiceが使用される）
}

export { auth, db };
export default app;

