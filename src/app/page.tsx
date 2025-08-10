'use client';

import { useState, useEffect } from 'react';
import AIService, { ClothingPreferences, ClothingSuggestion } from '@/services/aiService';
import AIConfigManager from '@/config/aiConfig';
import ClothingSuggestionCard from '@/components/ClothingSuggestionCard';
import AIPromptSettings from '@/components/AIPromptSettings';

export default function Home() {
  const [preferences, setPreferences] = useState<ClothingPreferences>({
    style: '',
    color: '',
    occasion: '',
    season: '',
    bodyType: 'average',
    height: 'medium'
  });
  const [suggestions, setSuggestions] = useState<ClothingSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [error, setError] = useState('');
  const [showAISettings, setShowAISettings] = useState(false);

  useEffect(() => {
    // AI設定を初期化
    const configManager = AIConfigManager.getInstance();
    const config = configManager.getConfig();
    
    if (config.openaiApiKey) {
      setApiKey(config.openaiApiKey);
      const aiService = AIService.getInstance();
      aiService.setApiKey(config.openaiApiKey);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  const handlePreferenceChange = (field: keyof ClothingPreferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      const configManager = AIConfigManager.getInstance();
      configManager.setOpenAIApiKey(apiKey.trim());
      
      const aiService = AIService.getInstance();
      aiService.setApiKey(apiKey.trim());
      
      setShowApiKeyInput(false);
      setError('');
    } else {
      setError('APIキーを入力してください');
    }
  };

  const generateSuggestions = async () => {
    if (!apiKey.trim()) {
      setError('OpenAI APIキーが設定されていません');
      setShowApiKeyInput(true);
      return;
    }

    setIsLoading(true);
    setImageLoading(true);
    setError('');
    
    try {
      const aiService = AIService.getInstance();
      const results = await aiService.generateClothingSuggestions(preferences);
      setSuggestions(results);
    } catch (error) {
      console.error('服のサジェスト生成中にエラーが発生しました:', error);
      setError('服のサジェスト生成中にエラーが発生しました。APIキーを確認してください。');
    } finally {
      setIsLoading(false);
      setImageLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-black">
              AI ファッションアドバイザー
            </h1>
            <button
              onClick={() => setShowAISettings(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
              title="AI設定"
            >
              ⚙️ AI設定
            </button>
          </div>
          <p className="text-lg text-black">
            あなたの好みに合わせた服をサジェストします
          </p>
        </header>

        {/* OpenAI APIキー設定 */}
        {showApiKeyInput && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              OpenAI APIキーの設定
            </h2>
            <p className="text-gray-600 mb-4">
              AIによる服のサジェスト機能を使用するには、OpenAI APIキーが必要です。
            </p>
            <div className="flex gap-4">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleApiKeySubmit}
                className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                設定
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              APIキーはローカルに保存され、外部には送信されません。
            </p>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && !showApiKeyInput && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setShowApiKeyInput(true)}
              className="text-red-600 underline text-sm mt-2 hover:text-red-800"
            >
              APIキーを再設定
            </button>
          </div>
        )}

        {/* 好み設定 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            好みを設定
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                スタイル
              </label>
              <select
                value={preferences.style}
                onChange={(e) => handlePreferenceChange('style', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                <option value="casual">カジュアル</option>
                <option value="business">ビジネス</option>
                <option value="elegant">エレガント</option>
                <option value="sporty">スポーティ</option>
                <option value="vintage">ヴィンテージ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                色
              </label>
              <select
                value={preferences.color}
                onChange={(e) => handlePreferenceChange('color', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                <option value="black">黒</option>
                <option value="white">白</option>
                <option value="blue">青</option>
                <option value="red">赤</option>
                <option value="green">緑</option>
                <option value="yellow">黄</option>
                <option value="pink">ピンク</option>
                <option value="purple">紫</option>
                <option value="brown">茶</option>
                <option value="gray">グレー</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                シーン
              </label>
              <select
                value={preferences.occasion}
                onChange={(e) => handlePreferenceChange('occasion', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                <option value="daily">日常</option>
                <option value="work">仕事</option>
                <option value="date">デート</option>
                <option value="party">パーティー</option>
                <option value="sports">スポーツ</option>
                <option value="formal">フォーマル</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                季節
              </label>
              <select
                value={preferences.season}
                onChange={(e) => handlePreferenceChange('season', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">選択してください</option>
                <option value="spring">春</option>
                <option value="summer">夏</option>
                <option value="autumn">秋</option>
                <option value="winter">冬</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                体型
              </label>
              <select
                value={preferences.bodyType}
                onChange={(e) => handlePreferenceChange('bodyType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="slim">スリム</option>
                <option value="average">普通</option>
                <option value="plus">ぽっちゃり</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                身長
              </label>
              <select
                value={preferences.height}
                onChange={(e) => handlePreferenceChange('height', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="short">小柄</option>
                <option value="medium">中背</option>
                <option value="tall">高身長</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateSuggestions}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                AIで分析中...
              </div>
            ) : (
              'AIで服をサジェストする'
            )}
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              おすすめの服
              {imageLoading && (
                <span className="ml-3 text-sm text-blue-600 font-normal">
                  📸 画像を読み込み中...
                </span>
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((suggestion) => (
                <ClothingSuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                />
              ))}
            </div>
          </div>
        )}

        {/* AI設定モーダル */}
        <AIPromptSettings
          isOpen={showAISettings}
          onClose={() => setShowAISettings(false)}
        />
      </div>
    </div>
  );
}
