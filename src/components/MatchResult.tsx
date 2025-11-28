import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { Recipe } from '../types/Recipe';
import { Search } from 'lucide-react';

interface MatchResultProps {
  matchedRecipes: Recipe[];
}

export default function MatchResult({ matchedRecipes }: MatchResultProps) {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // 5秒後に紙吹雪を停止
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const handleSearchClick = (searchQuery: string) => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(searchUrl, '_blank');
  };

  // 最初のマッチした料理を大きく表示
  const primaryRecipe = matchedRecipes[0];
  const otherRecipes = matchedRecipes.slice(1);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 relative">
      {/* 紙吹雪エフェクト */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      {/* 祝賀テキスト */}
      <div className="text-center mb-8">
        <h2 className="text-5xl font-bold text-gray-800 mb-2">
          It's a Match! 🎯
        </h2>
        <p className="text-2xl font-semibold text-orange-600 mb-2">
          今夜はこれに決定！🎉
        </p>
        <p className="text-gray-600">
          両方とも「Like」した料理はこちらです
        </p>
      </div>

      {/* メイン料理（大きく表示） */}
      {primaryRecipe && (
        <div className="mb-8 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="relative w-full aspect-[3/2] overflow-hidden">
            <img
              src={primaryRecipe.image_url}
              alt={primaryRecipe.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {primaryRecipe.name}
              </h3>
              <p className="text-white/90 text-sm mb-4 drop-shadow-md">
                {primaryRecipe.description}
              </p>
              <button
                onClick={() => handleSearchClick(primaryRecipe.search_query)}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold rounded-lg transition-colors duration-200 shadow-lg"
              >
                <Search size={24} />
                <span>レシピを検索する</span>
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {primaryRecipe.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* その他のマッチした料理 */}
      {otherRecipes.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            他にもマッチした料理
          </h3>
          {otherRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex items-center gap-4 p-4"
            >
              <img
                src={recipe.image_url}
                alt={recipe.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-800 mb-1">
                  {recipe.name}
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  {recipe.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {recipe.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleSearchClick(recipe.search_query)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                >
                  <Search size={16} />
                  <span>レシピを検索</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

