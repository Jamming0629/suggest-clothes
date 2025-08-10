import { SelectedClothing } from '@/hooks/useClothingSelection';

interface OutfitDisplayProps {
  selectedOutfit: SelectedClothing[];
  onRemoveClothing: (category: string) => void;
  onClearOutfit: () => void;
}

export default function OutfitDisplay({
  selectedOutfit,
  onRemoveClothing,
  onClearOutfit
}: OutfitDisplayProps) {
  if (selectedOutfit.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 text-center">
        <div className="text-gray-400 text-6xl mb-4">👕</div>
        <p className="text-gray-500 text-lg">
          服を選択してアウトフィットを作成してください
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          選択されたアウトフィット
        </h3>
        <button
          onClick={onClearOutfit}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          全てクリア
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedOutfit.map((item) => (
          <div
            key={item.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                {item.category}
              </span>
              <button
                onClick={() => onRemoveClothing(item.category)}
                className="text-gray-400 hover:text-red-500 text-sm"
              >
                ✕
              </button>
            </div>
            
            <h4 className="font-medium text-gray-800 mb-2 line-clamp-2">
              {item.name}
            </h4>
            
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{
                  backgroundColor: getColorValue(item.color)
                }}
              />
              <span className="text-sm text-black">
                {getColorName(item.color)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 色の値を取得
function getColorValue(color: string): string {
  const colorMap: { [key: string]: string } = {
    'black': '#1a1a1a',
    'white': '#ffffff',
    'blue': '#3b82f6',
    'red': '#ef4444',
    'green': '#10b981',
    'yellow': '#f59e0b',
    'pink': '#ec4899',
    'purple': '#8b5cf6',
    'orange': '#f97316',
    'neutral': '#6b7280',
    'gray': '#6b7280',
    'beige': '#d1d5db'
  };
  
  return colorMap[color] || '#6b7280';
}

// 色の日本語名を取得
function getColorName(color: string): string {
  const colorNameMap: { [key: string]: string } = {
    'black': 'ブラック',
    'white': 'ホワイト',
    'blue': 'ブルー',
    'red': 'レッド',
    'green': 'グリーン',
    'yellow': 'イエロー',
    'pink': 'ピンク',
    'purple': 'パープル',
    'orange': 'オレンジ',
    'neutral': 'ニュートラル',
    'gray': 'グレー',
    'beige': 'ベージュ'
  };
  
  return colorNameMap[color] || 'ニュートラル';
} 