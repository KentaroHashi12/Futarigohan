import { Recipe } from '../types/Recipe';
import { Search } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const handleSearchClick = () => {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(recipe.search_query)}`;
    window.open(searchUrl, '_blank');
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* 画像 */}
      <div className="relative w-full aspect-[3/2] overflow-hidden">
        <img
          src={recipe.image_url}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        {/* グラデーションオーバーレイ（下から黒くなるシャドウ） */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* コンテンツ */}
      <div className="p-6">
        {/* タイトル */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {recipe.name}
        </h2>

        {/* 説明 */}
        <p className="text-gray-600 text-sm mb-4">
          {recipe.description}
        </p>

        {/* タグ */}
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 検索ボタン */}
        <button
          onClick={handleSearchClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          <Search size={20} />
          <span>レシピを検索 🔍</span>
        </button>
      </div>
    </div>
  );
}


