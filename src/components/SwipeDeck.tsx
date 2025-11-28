import { useState, useRef, useImperativeHandle, forwardRef, useMemo, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import recipesData from '../data/recipes.json';
import { Recipe } from '../types/Recipe';
import RecipeCard from './RecipeCard';
import MatchResult from './MatchResult';
import EmptyState from './EmptyState';
import WaitingState from './WaitingState';
import { saveSwipe, getSwipedRecipeIds, checkMatch, hasUserFinishedRegularRecipes, subscribeToSession } from '../utils/storage';

export interface SwipeDeckRef {
  swipe: (dir: string) => Promise<void>;
}

interface SwipeDeckProps {
  currentUser: 'userA' | 'userB';
}

const SwipeDeck = forwardRef<SwipeDeckRef, SwipeDeckProps>(({ currentUser }, ref) => {
  // 全レシピデータ（通常レシピ + ジョーカー）
  const allRecipes = recipesData as Recipe[];
  const regularRecipes = allRecipes.filter(r => r.category !== 'joker');
  const jokerRecipes = allRecipes.filter(r => r.category === 'joker');

  // 今日の10枚を選出（ランダムに最大10件、通常レシピのみ）
  const selectedRecipes = useMemo(() => {
    const shuffle = <T,>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    const shuffled = shuffle(regularRecipes);
    return shuffled.slice(0, Math.min(10, shuffled.length));
  }, []);

  // 通常レシピIDのリスト（進捗判定用）
  const regularRecipeIds = useMemo(() => {
    return regularRecipes.map(r => r.id);
  }, []);

  // パートナーIDを取得
  const partnerId: 'userA' | 'userB' = currentUser === 'userA' ? 'userB' : 'userA';

  // Stateで管理するrecipes配列（カードが消えるたびに更新）
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showJokers, setShowJokers] = useState(false);
  const [isJokerLoaded, setIsJokerLoaded] = useState(false); // 無限ループ防止フラグ
  const currentIndexRef = useRef(currentIndex);
  const childRefs = useRef<Array<any>>([]);
  
  // 既にマッチング済みのレシピIDを保持（重複アラートを防ぐ）
  const [matchedRecipeIds, setMatchedRecipeIds] = useState<Set<string>>(new Set());
  
  // リアルタイムデータの状態管理（先に定義）
  const [realtimeSwipes, setRealtimeSwipes] = useState<any[]>([]);
  const [currentUserFinished, setCurrentUserFinished] = useState(false);
  const [partnerFinished, setPartnerFinished] = useState(false);
  
  // マッチング結果を常にチェック（最優先で表示するため）
  const [matches, setMatches] = useState<string[]>([]);
  const matchedRecipeObjects = allRecipes.filter(r => matches.includes(r.id));

  // マッチング結果をリアルタイムで更新
  useEffect(() => {
    const updateMatches = async () => {
      const matchResult = await checkMatch();
      setMatches(matchResult);
    };
    
    updateMatches();
    
    // リアルタイムデータが更新されたらマッチングも再チェック
    if (realtimeSwipes.length >= 0) {
      updateMatches();
    }
  }, [realtimeSwipes]);

  // 初期レシピの読み込み（非同期対応）
  useEffect(() => {
    const loadInitialRecipes = async () => {
      const swipedIds = await getSwipedRecipeIds(currentUser);
      const filtered = selectedRecipes.filter(recipe => !swipedIds.includes(recipe.id));
      if (filtered.length > 0 && recipes.length === 0) {
        setRecipes(filtered);
        setCurrentIndex(filtered.length - 1);
        currentIndexRef.current = filtered.length - 1;
      }
    };
    
    loadInitialRecipes();
  }, [currentUser, selectedRecipes]);

  // リアルタイム購読の設定
  useEffect(() => {
    console.log('[SwipeDeck] リアルタイム購読を開始');
    
    // 進捗状態を更新する関数
    const updateProgress = async () => {
      const currentFinished = await hasUserFinishedRegularRecipes(currentUser, regularRecipeIds);
      const partnerFinishedResult = await hasUserFinishedRegularRecipes(partnerId, regularRecipeIds);
      
      setCurrentUserFinished(currentFinished);
      setPartnerFinished(partnerFinishedResult);
    };

    const unsubscribe = subscribeToSession((data) => {
      console.log('[SwipeDeck] リアルタイム更新を受信:', data.swipes.length, '件');
      setRealtimeSwipes(data.swipes);
      
      // 進捗状態を更新
      updateProgress();
    });

    // 初期進捗状態の取得
    updateProgress();

    // クリーンアップ
    return () => {
      console.log('[SwipeDeck] リアルタイム購読を解除');
      unsubscribe();
    };
  }, [currentUser, partnerId, regularRecipeIds]);

  // パートナーが完了したらジョーカーをロード（useEffectで処理）
  useEffect(() => {
    // カードが空で、パートナーも完了していて、まだジョーカーをロードしていない場合
    if (recipes.length === 0 && currentUserFinished && partnerFinished && !isJokerLoaded) {
      setShowJokers(true);
      setIsJokerLoaded(true);
      
      const loadJokers = async () => {
        const swipedIds = await Promise.resolve(getSwipedRecipeIds(currentUser));
        const jokerSwipedIds = swipedIds.filter(id => 
          jokerRecipes.some(j => j.id === id)
        );
        const availableJokers = jokerRecipes.filter(j => !jokerSwipedIds.includes(j.id));
        
        if (availableJokers.length > 0) {
          setRecipes(availableJokers);
          setCurrentIndex(availableJokers.length - 1);
          currentIndexRef.current = availableJokers.length - 1;
        }
      };
      
      loadJokers();
    }
  }, [recipes.length, currentUserFinished, partnerFinished, isJokerLoaded, currentUser, jokerRecipes]);

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  // カードが画面外に出た時の処理（Stateから確実に削除）
  const outOfFrame = (recipeId: string) => {
    console.log(`カードが画面外に出ました: ${recipeId}`);
    
    const isJoker = jokerRecipes.some(j => j.id === recipeId);
    
    // Stateから該当カードを削除
    setRecipes(prevRecipes => {
      const newRecipes = prevRecipes.filter(r => r.id !== recipeId);
      const newIndex = newRecipes.length - 1;
      setCurrentIndex(newIndex);
      currentIndexRef.current = newIndex;
      
      // カードがなくなった時の処理
      if (newRecipes.length === 0) {
        if (isJoker) {
          // ジョーカーカードが全てスワイプされた場合：終了画面
          // 何もしない（EmptyStateが表示される）
        } else {
          // 通常カードが全てスワイプされた場合
          handleCardsExhausted();
        }
      }
      
      return newRecipes;
    });
  };

  // カード切れ時の処理（通常レシピが全てスワイプされた時）
  const handleCardsExhausted = async () => {
    // 既にジョーカーをロード済みの場合は何もしない（無限ループ防止）
    if (isJokerLoaded) {
      return;
    }

    // パートナーも完了している場合のみジョーカーをロード
    if (partnerFinished) {
      setShowJokers(true);
      setIsJokerLoaded(true);
      const swipedIds = await getSwipedRecipeIds(currentUser);
      const jokerSwipedIds = swipedIds.filter(id => 
        jokerRecipes.some(j => j.id === id)
      );
      const availableJokers = jokerRecipes.filter(j => !jokerSwipedIds.includes(j.id));
      
      if (availableJokers.length > 0) {
        setRecipes(availableJokers);
        setCurrentIndex(availableJokers.length - 1);
        currentIndexRef.current = availableJokers.length - 1;
      }
    }
    // パートナーがまだ完了していない場合は何もしない（WaitingStateが表示される）
  };

  const swiped = async (direction: string, recipeId: string, nameToDelete: string, index: number) => {
    // Super Like機能は無効化（left と right のみ）
    const directionMap: { [key: string]: string } = {
      left: 'left (Nope)',
      right: 'right (Like)',
    };
    console.log(`[${currentUser}] スワイプ: ${directionMap[direction] || direction} - ${nameToDelete} (index: ${index})`);
    
    // ストレージに保存（非同期対応）
    try {
      await Promise.resolve(saveSwipe(recipeId, direction, currentUser));
    } catch (error) {
      console.error('スワイプ保存エラー:', error);
    }
    
    // Likeの場合のみマッチング判定
    if (direction === 'right') {
      setTimeout(async () => {
        const matchResult = await Promise.resolve(checkMatch());
        const recipe = allRecipes.find(r => r.id === recipeId);
        
        const newMatches = matchResult.filter(id => !matchedRecipeIds.has(id));
        
        if (newMatches.includes(recipeId) && recipe) {
          setMatchedRecipeIds(prev => new Set([...prev, recipeId]));
          window.alert(`マッチング成立！🎉\n${recipe.name}`);
        }
      }, 100);
    }
    
    updateCurrentIndex(index - 1);
  };

  const swipe = async (dir: string) => {
    if (currentIndex >= 0 && currentIndex < recipes.length) {
      const card = childRefs.current[currentIndex];
      if (card && card.swipe) {
        await card.swipe(dir);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    swipe,
  }));

  // 描画条件の優先度（最優先から順に）
  // 1. 最優先: マッチング成立済みなら、カードの残り枚数に関わらず常にMatchResultを表示
  if (matchedRecipeObjects.length > 0) {
    return <MatchResult matchedRecipes={matchedRecipeObjects} />;
  }

  // 2. 次点: まだ表示すべきカード（通常 or ジョーカー）があるなら、SwipeDeckを表示
  if (recipes.length > 0) {
    // ジョーカー表示時のメッセージ
    const jokerMessage = showJokers ? (
      <div className="text-center mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
        <p className="text-lg font-semibold text-yellow-800">
          まだ決まりません...😓
        </p>
        <p className="text-sm text-yellow-700 mt-1">
          救済措置から選んでください
        </p>
      </div>
    ) : null;

    return (
      <div className="w-full">
        {jokerMessage}
        <div className="relative w-full max-w-sm mx-auto h-[600px]">
          {recipes.map((recipe, index) => (
            <TinderCard
              ref={(el: any) => {
                if (el) {
                  childRefs.current[index] = el;
                }
              }}
              key={recipe.id}
              onSwipe={(dir) => swiped(dir, recipe.id, recipe.name, index)}
              onCardLeftScreen={() => outOfFrame(recipe.id)}
              preventSwipe={['up', 'down']}
              className="absolute w-full"
            >
              <div
                style={{
                  zIndex: recipes.length - index,
                }}
              >
                <RecipeCard recipe={recipe} />
              </div>
            </TinderCard>
          ))}
        </div>
      </div>
    );
  }

  // 3. カード切れ（レギュラー終了）の場合
  if (recipes.length === 0 && currentUserFinished) {
    // パートナーがまだ完了していない場合：待機画面を表示
    if (!partnerFinished) {
      return <WaitingState />;
    }
    
    // パートナーも完了しているが、まだジョーカーをロードしていない場合
    // （useEffectでロード処理が実行されるまで待つ）
    if (partnerFinished && !isJokerLoaded) {
      return <div className="w-full" />; // ローディング中（次回レンダリングでジョーカーが表示される）
    }
    
    // ジョーカーも全てスワイプ済みの場合：EmptyState
    if (isJokerLoaded && recipes.length === 0) {
      return <EmptyState message="まだ決まりません...😓" />;
    }
  }

  // 4. 最後: カードもなくマッチもなければ、EmptyStateを表示
  return <EmptyState message="まだ決まりません...😓" />;

});

SwipeDeck.displayName = 'SwipeDeck';

export default SwipeDeck;


