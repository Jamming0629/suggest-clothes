import { useState } from 'react';
import { ClothingSuggestion } from '@/services/aiService';

export interface SelectedClothing {
  id: string;
  name: string;
  category: string;
  color: string;
  description: string;
}

export function useClothingSelection() {
  const [selectedClothing, setSelectedClothing] = useState<SelectedClothing | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<SelectedClothing[]>([]);

  const selectClothing = (clothing: ClothingSuggestion) => {
    const selectedItem: SelectedClothing = {
      id: clothing.id,
      name: clothing.name,
      category: clothing.category,
      color: clothing.color,
      description: clothing.description
    };

    setSelectedClothing(selectedItem);
    
    // アウトフィットに追加
    setSelectedOutfit(prev => {
      const existingIndex = prev.findIndex(item => item.category === clothing.category);
      if (existingIndex >= 0) {
        // 同じカテゴリの服がある場合は置き換え
        const newOutfit = [...prev];
        newOutfit[existingIndex] = selectedItem;
        return newOutfit;
      } else {
        // 新しいカテゴリの服を追加
        return [...prev, selectedItem];
      }
    });
  };

  const removeClothing = (category: string) => {
    setSelectedOutfit(prev => prev.filter(item => item.category !== category));
    
    // 現在選択中の服が削除された場合
    if (selectedClothing?.category === category) {
      setSelectedClothing(null);
    }
  };

  const clearSelection = () => {
    setSelectedClothing(null);
    setSelectedOutfit([]);
  };

  const getClothingByCategory = (category: string): SelectedClothing | null => {
    return selectedOutfit.find(item => item.category === category) || null;
  };

  return {
    selectedClothing,
    selectedOutfit,
    selectClothing,
    removeClothing,
    clearSelection,
    getClothingByCategory
  };
} 