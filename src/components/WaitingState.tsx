import { RotateCcw } from 'lucide-react';

export default function WaitingState() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <div className="mb-8">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          パートナーの投票を待っています...
        </h2>
        <p className="text-gray-600 text-sm">
          相手が完了すると、結果または救済カードが表示されます
        </p>
      </div>

      {/* 再読み込みボタン */}
      <button
        onClick={handleReload}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
      >
        <RotateCcw size={20} />
        <span>再読み込み</span>
      </button>
    </div>
  );
}

