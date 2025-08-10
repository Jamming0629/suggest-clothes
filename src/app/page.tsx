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
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [error, setError] = useState('');
  const [showAISettings, setShowAISettings] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // AI設定を初期化
    const configManager = AIConfigManager.getInstance();
    const config = configManager.getConfig();
    
    // 環境変数からAPIキーを確認
    const envApiKey = process.env.OPENAI_API_KEY || 
                     process.env.NEXT_PUBLIC_OPENAI_API_KEY || 
                     (window as any).__NEXT_DATA__?.props?.env?.OPENAI_API_KEY;
    
    console.log('APIキー確認:', {
      configApiKey: !!config.openaiApiKey,
      envApiKey: !!envApiKey,
      configLength: config.openaiApiKey.length,
      envLength: envApiKey?.length || 0
    });
    
    if (config.openaiApiKey || envApiKey) {
      const finalApiKey = config.openaiApiKey || envApiKey;
      setHasApiKey(true);
      setShowApiKeyInput(false);
      
      // AIサービスにAPIキーを設定
      const aiService = AIService.getInstance();
      aiService.setApiKey(finalApiKey);
    } else {
      setHasApiKey(false);
      setShowApiKeyInput(true);
    }
  }, []);

  const handlePreferenceChange = (field: keyof ClothingPreferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateSuggestions = async () => {
    if (!hasApiKey) {
      setError('OpenAI APIキーが設定されていません。.env.localファイルにOPENAI_API_KEYを設定してください。');
      setShowApiKeyInput(true);
      return;
    }

    setIsLoading(true);
    setImageLoading(true);
    setError('');
    setSuggestions([]);
    
    try {
      const aiService = AIService.getInstance();
      const results = await aiService.generateClothingSuggestions(preferences);
      
      if (results && results.length > 0) {
        setSuggestions(results);
        console.log('AIからの服の提案:', results);
      } else {
        setError('AIからの応答が空でした。設定を調整して再試行してください。');
      }
    } catch (error) {
      console.error('服のサジェスト生成中にエラーが発生しました:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      setError(`服のサジェスト生成に失敗しました: ${errorMessage}`);
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
        {showApiKeyInput && !hasApiKey && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              OpenAI APIキーの設定
            </h2>
            <p className="text-gray-600 mb-4">
              AIによる服のサジェスト機能を使用するには、OpenAI APIキーが必要です。
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">環境変数の設定方法</h3>
              <p className="text-blue-700 text-sm mb-2">
                プロジェクトのルートディレクトリに<code className="bg-blue-100 px-2 py-1 rounded">.env.local</code>ファイルを作成し、以下の内容を追加してください：
              </p>
              <pre className="bg-blue-100 p-3 rounded text-sm font-mono text-blue-800">
OPENAI_API_KEY=sk-your-api-key-here
              </pre>
              <p className="text-blue-700 text-sm mt-2">
                設定後、アプリケーションを再起動してください。
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                再読み込み
              </button>
              <button
                onClick={() => setShowApiKeyInput(false)}
                className="bg-gray-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                閉じる
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              APIキーは.env.localファイルに保存され、外部には送信されません。
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
              APIキー設定方法を確認
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
            disabled={isLoading || !hasApiKey}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                AIで分析中...
              </div>
            ) : !hasApiKey ? (
              'APIキーを設定してください'
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
