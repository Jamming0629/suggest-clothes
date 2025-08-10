'use client';

import { useState, useEffect } from 'react';
import AIPromptConfigManager from '@/config/aiPromptConfig';
import type { AIPromptSettings } from '@/config/aiPromptConfig';

interface AIPromptSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIPromptSettings({ isOpen, onClose }: AIPromptSettingsProps) {
  const [settings, setSettings] = useState<AIPromptSettings>({
    personality: { tone: 'friendly', language: 'polite', detailLevel: 'detailed' },
    fashionAdvice: { focus: 'balanced', includeAccessories: true, includeStylingTips: true, includePriceRange: false, includeBrandSuggestions: false },
    outputFormat: { maxItems: 5, includeImages: false, includeDescriptions: true, includeColorPalettes: true, includeSeasonalAdvice: true },
    customInstructions: ''
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const configManager = AIPromptConfigManager.getInstance();
      const currentSettings = configManager.getSettings();
      setSettings(currentSettings);
      setHasChanges(false);
    }
  }, [isOpen]);

  const handleSettingChange = (section: keyof AIPromptSettings, field: string, value: any) => {
    setSettings(prev => {
      const sectionData = prev[section] as Record<string, any>;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: value
        }
      };
    });
    setHasChanges(true);
  };

  const handlePersonalityChange = (field: string, value: any) => {
    handleSettingChange('personality', field, value);
  };

  const handleFashionAdviceChange = (field: string, value: any) => {
    handleSettingChange('fashionAdvice', field, value);
  };

  const handleOutputFormatChange = (field: string, value: any) => {
    handleSettingChange('outputFormat', field, value);
  };

  const handleCustomInstructionsChange = (value: string) => {
    setSettings(prev => ({ ...prev, customInstructions: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    const configManager = AIPromptConfigManager.getInstance();
    configManager.updateSettings(settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    const configManager = AIPromptConfigManager.getInstance();
    configManager.resetToDefault();
    const defaultSettings = configManager.getSettings();
    setSettings(defaultSettings);
    setHasChanges(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">AI設定</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* 性格・トーン設定 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">AIの性格・トーン設定</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">トーン</label>
                <select
                  value={settings.personality.tone}
                  onChange={(e) => handlePersonalityChange('tone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="friendly">親しみやすい</option>
                  <option value="professional">専門的</option>
                  <option value="casual">カジュアル</option>
                  <option value="elegant">上品</option>
                  <option value="enthusiastic">情熱的</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">言語</label>
                <select
                  value={settings.personality.language}
                  onChange={(e) => handlePersonalityChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="polite">丁寧語</option>
                  <option value="casual">カジュアル</option>
                  <option value="formal">フォーマル</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">詳細レベル</label>
                <select
                  value={settings.personality.detailLevel}
                  onChange={(e) => handlePersonalityChange('detailLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="brief">簡潔</option>
                  <option value="detailed">詳細</option>
                  <option value="very-detailed">非常に詳細</option>
                </select>
              </div>
            </div>
          </div>

          {/* ファッションアドバイスの方向性 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ファッションアドバイスの方向性</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">焦点</label>
                <select
                  value={settings.fashionAdvice.focus}
                  onChange={(e) => handleFashionAdviceChange('focus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="trendy">トレンド重視</option>
                  <option value="classic">クラシック重視</option>
                  <option value="practical">実用性重視</option>
                  <option value="creative">創造性重視</option>
                  <option value="balanced">バランス重視</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">含める要素</label>
                <div className="space-y-2">
                  {[
                    { key: 'includeAccessories', label: 'アクセサリー' },
                    { key: 'includeStylingTips', label: 'スタイリングのヒント' },
                    { key: 'includePriceRange', label: '価格帯' },
                    { key: 'includeBrandSuggestions', label: 'ブランド提案' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.fashionAdvice[key as keyof typeof settings.fashionAdvice] as boolean}
                        onChange={(e) => handleFashionAdviceChange(key, e.target.checked)}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 出力形式の設定 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">出力形式の設定</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大アイテム数: {settings.outputFormat.maxItems}個
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.outputFormat.maxItems}
                  onChange={(e) => handleOutputFormatChange('maxItems', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">出力内容</label>
                <div className="space-y-2">
                  {[
                    { key: 'includeDescriptions', label: '説明' },
                    { key: 'includeColorPalettes', label: 'カラーパレット' },
                    { key: 'includeSeasonalAdvice', label: '季節のアドバイス' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.outputFormat[key as keyof typeof settings.outputFormat] as boolean}
                        onChange={(e) => handleOutputFormatChange(key, e.target.checked)}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* カスタム指示 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">カスタム指示</h3>
            <textarea
              value={settings.customInstructions}
              onChange={(e) => handleCustomInstructionsChange(e.target.value)}
              placeholder="AIに特別な指示がある場合はここに入力してください（例：「20代女性向けのアドバイスを心がけて」「コストパフォーマンスを重視して」など）"
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              デフォルトに戻す
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 