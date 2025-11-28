import { useRef, useState } from 'react';
import SwipeDeck, { SwipeDeckRef } from './components/SwipeDeck';
import { X, Heart, RotateCcw, Users } from 'lucide-react';
import { clearSwipes } from './utils/storage';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<'userA' | 'userB'>('userA');
  const [deckKey, setDeckKey] = useState(0); // SwipeDeckをリセットするためのキー
  const swipeDeckRef = useRef<SwipeDeckRef>(null);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (swipeDeckRef.current) {
      await swipeDeckRef.current.swipe(direction);
    }
  };

  const handleClearHistory = () => {
    if (confirm('スワイプ履歴をリセットしますか？')) {
      clearSwipes();
      window.location.reload();
    }
  };

  const handleUserToggle = () => {
    const newUser = currentUser === 'userA' ? 'userB' : 'userA';
    setCurrentUser(newUser);
    // SwipeDeckをリセット（キーを変更することで再マウント）
    setDeckKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      {/* ヘッダー */}
      <header className="w-full py-6 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Futarigohan
        </h1>
        <p className="text-gray-600 text-sm mb-4">
          フタリゴハン - 献立決めアプリ
        </p>
        
        {/* ユーザー切り替えトグル */}
        <div className="flex items-center justify-center gap-3">
          <Users size={18} className="text-gray-600" />
          <button
            onClick={handleUserToggle}
            className="px-4 py-2 bg-white border-2 border-orange-300 rounded-lg text-gray-700 font-semibold hover:bg-orange-50 transition-colors duration-200 shadow-sm"
          >
            現在: {currentUser === 'userA' ? 'User A' : 'User B'}
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 pb-24">
        <SwipeDeck key={deckKey} ref={swipeDeckRef} currentUser={currentUser} />
      </main>

      {/* アクションボタン */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-8">
        <button
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          aria-label="Nope"
        >
          <X size={32} />
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          aria-label="Like"
        >
          <Heart size={32} />
        </button>
      </div>

      {/* デバッグ用: 履歴リセットボタン */}
      <div className="fixed top-4 right-4">
        <button
          onClick={handleClearHistory}
          className="px-3 py-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg shadow-sm flex items-center gap-2 transition-colors duration-200"
          title="スワイプ履歴をリセット"
        >
          <RotateCcw size={14} />
          <span>履歴リセット</span>
        </button>
      </div>
    </div>
  );
}

export default App;
