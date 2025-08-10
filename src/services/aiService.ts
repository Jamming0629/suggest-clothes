import AIPromptConfigManager from '@/config/aiPromptConfig';
import ImageService from '@/services/imageService';

export interface ClothingPreferences {
  style: string;
  color: string;
  occasion: string;
  season: string;
  bodyType?: string;
  height?: string;
}

export interface ClothingSuggestion {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  imageUrl?: string;
  generatedImageUrl?: string;
  model3D?: string;
  webUrl?: string;
}

export interface OutfitCombination {
  id: string;
  name: string;
  description: string;
  items: ClothingSuggestion[];
  combinedImageUrl?: string;
  rating: number;
}

export interface GeneratedOutfitImage {
  id: string;
  imageUrl: string;
  prompt: string;
  metadata: {
    style: string;
    color: string;
    occasion: string;
    season: string;
    bodyType: string;
    height: string;
  };
}

export class AIService {
  private static instance: AIService;
  private apiKey: string | null = null;
  private imageGenerationApiUrl: string = 'https://api.openai.com/v1/images/generations';
  private chatApiUrl: string = 'https://api.openai.com/v1/chat/completions';

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  public setImageGenerationApiUrl(url: string): void {
    this.imageGenerationApiUrl = url;
  }

  public async generateClothingSuggestions(
    preferences: ClothingPreferences
  ): Promise<ClothingSuggestion[]> {
    try {
      if (!this.apiKey) {
        throw new Error('APIキーが設定されていません');
      }

      // AIプロンプト設定を使用してプロンプトを生成
      const promptConfigManager = AIPromptConfigManager.getInstance();
      const prompt = promptConfigManager.generatePrompt(preferences);
      
      const response = await fetch(this.chatApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `あなたは楽天ファッションの専門家です。以下の指示に従ってください：

1. 必ず楽天ファッション（https://brandavenue.rakuten.co.jp/all-sites/item/）で実際に検索して、現在購入可能な商品のみを提案してください。

2. 架空の商品や存在しないURLは絶対に使用しないでください。

3. 各商品について、以下の情報を含めてください：
   - 商品名（実際の楽天ファッションで販売されている商品）
   - 説明（商品の特徴やスタイリングポイント）
   - カテゴリ（トップス、ボトムス、アウター、ワンピース、シューズ、バッグなど）
   - 色
   - 楽天ファッションでの検索URL（実際に検索できるURL）

4. 検索URLは以下の形式で生成してください：
   https://brandavenue.rakuten.co.jp/all-sites/item/?searchWord={検索キーワード}&categoryId={カテゴリID}

5. ユーザーの好み（スタイル、色、シーン、季節、体型、身長）に最適な商品を5-6点提案してください。

6. 各提案は具体的で実用的なものにしてください。`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`服のサジェスト生成に失敗しました: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      // AIの応答をパースしてClothingSuggestionの配列に変換
      const suggestions = await this.parseAIResponse(aiResponse, preferences);
      
      return suggestions;
    } catch (error) {
      console.error('服のサジェスト生成エラー:', error);
      // エラーの場合はモックデータを返す
      return this.getMockSuggestions(preferences);
    }
  }

  public async generateOutfitCombination(
    preferences: ClothingPreferences
  ): Promise<OutfitCombination[]> {
    // コーディネート全体の提案を生成
    const suggestions = await this.generateClothingSuggestions(preferences);
    
    const outfitCombinations: OutfitCombination[] = [
      {
        id: 'outfit-1',
        name: 'カジュアルデイリー',
        description: '日常使いに最適なカジュアルなコーディネート',
        items: [suggestions[0], suggestions[4], suggestions[5]],
        rating: 4.5
      },
      {
        id: 'outfit-2',
        name: 'エレガントパーティー',
        description: 'パーティーやデートにぴったりのエレガントなスタイル',
        items: [suggestions[1], suggestions[5]],
        rating: 4.8
      },
      {
        id: 'outfit-3',
        name: 'ビジネスカジュアル',
        description: '仕事でも使える洗練されたスタイル',
        items: [suggestions[3], suggestions[4], suggestions[5]],
        rating: 4.3
      }
    ];

    return outfitCombinations;
  }



  public async generateOutfitImage(
    preferences: ClothingPreferences,
    outfit: OutfitCombination
  ): Promise<GeneratedOutfitImage> {
    try {
      if (!this.apiKey) {
        throw new Error('APIキーが設定されていません');
      }

      // アウトフィット全体のプロンプトを生成
      const prompt = this.generateOutfitPrompt(preferences, outfit);
      
      // OpenAI DALL-E APIを使用して画像生成
      const response = await fetch(this.imageGenerationApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          response_format: 'url'
        })
      });

      if (!response.ok) {
        throw new Error(`アウトフィット画像生成に失敗しました: ${response.statusText}`);
      }

      const data = await response.json();
      const imageUrl = data.data[0].url;

      return {
        id: `outfit-${Date.now()}`,
        imageUrl: `data:image/png;base64,${imageUrl}`,
        prompt: prompt,
        metadata: {
          style: preferences.style,
          color: preferences.color,
          occasion: preferences.occasion,
          season: preferences.season,
          bodyType: preferences.bodyType || 'average',
          height: preferences.height || 'medium'
        }
      };
    } catch (error) {
      console.error('アウトフィット画像生成エラー:', error);
      // エラーの場合はモック画像を返す
      return this.getMockOutfitImage(preferences, outfit);
    }
  }



  private generateOutfitPrompt(preferences: ClothingPreferences, outfit: OutfitCombination): string {
    const styleMap: { [key: string]: string } = {
      'casual': 'カジュアル',
      'elegant': 'エレガント',
      'sporty': 'スポーティ',
      'business': 'ビジネス',
      'vintage': 'ヴィンテージ'
    };

    const bodyTypeMap: { [key: string]: string } = {
      'slim': 'スリムな体型',
      'average': '標準的な体型',
      'plus': 'プラスサイズの体型'
    };

    const heightMap: { [key: string]: string } = {
      'short': '小柄',
      'medium': '中背',
      'tall': '高身長'
    };

    const style = styleMap[preferences.style] || '';
    const bodyType = bodyTypeMap[preferences.bodyType || 'average'] || '';
    const height = heightMap[preferences.height || 'medium'] || '';

    const clothingItems = outfit.items.map(item => item.name).join('、');

    return `${style}なスタイルの${bodyType}の${height}な人物が${clothingItems}を着ている様子、高品質、詳細、リアル、ファッション写真、自然な光、スタジオ撮影`;
  }



  private getMockOutfitImage(preferences: ClothingPreferences, outfit: OutfitCombination): GeneratedOutfitImage {
    return {
      id: `mock-outfit-${Date.now()}`,
      imageUrl: `https://via.placeholder.com/1024x1024/cccccc/666666?text=${encodeURIComponent(outfit.name)}`,
      prompt: 'モック画像',
      metadata: {
        style: preferences.style,
        color: preferences.color,
        occasion: preferences.occasion,
        season: preferences.season,
        bodyType: preferences.bodyType || 'average',
        height: preferences.height || 'medium'
      }
    };
  }



  private async parseAIResponse(aiResponse: string, preferences: ClothingPreferences): Promise<ClothingSuggestion[]> {
    try {
      // AIの応答からJSONを抽出（より柔軟なパターンマッチング）
      let jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      
      // JSONが見つからない場合は、AIの応答を解析して構造化データを作成
      if (!jsonMatch) {
        console.warn('JSONが見つからないため、AIの応答を解析して構造化データを作成します');
        return this.parseTextResponse(aiResponse, preferences);
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (jsonError) {
        console.warn('JSONパースに失敗しました。テキスト解析にフォールバックします:', jsonError);
        return this.parseTextResponse(aiResponse, preferences);
      }

      // 画像サービスを使用してURLから画像を取得
      const imageService = ImageService.getInstance();
      const suggestions: ClothingSuggestion[] = [];

      for (const item of parsed) {
        let imageUrl = this.generatePlaceholderImage(item.name, item.category);
        
        // webUrlがある場合は画像を取得
        if (item.webUrl && item.webUrl !== '#') {
          try {
            const imageResult = await imageService.fetchImageFromUrl(item.webUrl);
            if (imageResult.success && imageResult.imageUrl) {
              imageUrl = imageResult.imageUrl;
            }
          } catch (error) {
            console.error('画像取得エラー:', error);
            // エラーの場合はプレースホルダー画像を使用
          }
        }

        suggestions.push({
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: item.name || '服の名前',
          description: item.description || '説明',
          category: item.category || 'カテゴリ',
          color: item.color || '色',
          webUrl: item.webUrl || '#',
          imageUrl
        });
      }

      return suggestions;
    } catch (error) {
      console.error('AI応答のパースエラー:', error);
      return this.getMockSuggestions(preferences);
    }
  }

  /**
   * AIのテキスト応答を解析して構造化データを作成
   */
  private parseTextResponse(aiResponse: string, preferences: ClothingPreferences): ClothingSuggestion[] {
    try {
      const suggestions: ClothingSuggestion[] = [];
      
      // AIの応答から服の提案を抽出
      const lines = aiResponse.split('\n').filter(line => line.trim());
      
      let currentSuggestion: Partial<ClothingSuggestion> = {};
      let suggestionCount = 0;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // 新しい提案の開始を検出
        if (trimmedLine.match(/^\d+\./) || trimmedLine.includes('提案') || trimmedLine.includes('おすすめ')) {
          if (Object.keys(currentSuggestion).length > 0) {
            suggestions.push(this.createSuggestionFromText(currentSuggestion, suggestionCount, preferences));
            suggestionCount++;
            currentSuggestion = {};
          }
          continue;
        }
        
        // 服の名前を抽出
        if (trimmedLine.includes('名前') || trimmedLine.includes('商品名')) {
          const nameMatch = trimmedLine.match(/[:：]\s*(.+)/);
          if (nameMatch) {
            currentSuggestion.name = nameMatch[1].trim();
          }
        }
        
        // 説明を抽出
        if (trimmedLine.includes('説明') || trimmedLine.includes('特徴')) {
          const descMatch = trimmedLine.match(/[:：]\s*(.+)/);
          if (descMatch) {
            currentSuggestion.description = descMatch[1].trim();
          }
        }
        
        // カテゴリを抽出
        if (trimmedLine.includes('カテゴリ') || trimmedLine.includes('種類')) {
          const catMatch = trimmedLine.match(/[:：]\s*(.+)/);
          if (catMatch) {
            currentSuggestion.category = catMatch[1].trim();
          }
        }
        
        // 色を抽出
        if (trimmedLine.includes('色') || trimmedLine.includes('カラー')) {
          const colorMatch = trimmedLine.match(/[:：]\s*(.+)/);
          if (colorMatch) {
            currentSuggestion.color = colorMatch[1].trim();
          }
        }
        
        // URLを抽出
        if (trimmedLine.includes('http') || trimmedLine.includes('楽天')) {
          const urlMatch = trimmedLine.match(/(https?:\/\/[^\s]+)/);
          if (urlMatch) {
            currentSuggestion.webUrl = urlMatch[1];
          }
        }
      }
      
      // 最後の提案を追加
      if (Object.keys(currentSuggestion).length > 0) {
        suggestions.push(this.createSuggestionFromText(currentSuggestion, suggestionCount, preferences));
      }
      
      // 最低限の提案がない場合はモックデータを使用
      if (suggestions.length === 0) {
        return this.getMockSuggestions(preferences);
      }
      
      return suggestions;
    } catch (error) {
      console.error('テキスト解析エラー:', error);
      return this.getMockSuggestions(preferences);
    }
  }

  /**
   * テキストから抽出したデータからClothingSuggestionを作成
   */
  private createSuggestionFromText(
    data: Partial<ClothingSuggestion>, 
    index: number, 
    preferences: ClothingPreferences
  ): ClothingSuggestion {
    return {
      id: `ai-text-${Date.now()}-${index}`,
      name: data.name || `提案${index + 1}`,
      description: data.description || 'AIが提案する服',
      category: data.category || this.inferCategoryFromPreferences(preferences),
      color: data.color || preferences.color || 'お好みの色',
      webUrl: data.webUrl || '#',
      imageUrl: this.generatePlaceholderImage(data.name || `提案${index + 1}`, data.category || 'カテゴリ')
    };
  }

  /**
   * 好みからカテゴリを推測
   */
  private inferCategoryFromPreferences(preferences: ClothingPreferences): string {
    if (preferences.occasion === 'work') return 'ビジネス';
    if (preferences.occasion === 'sports') return 'スポーツ';
    if (preferences.occasion === 'party') return 'パーティー';
    if (preferences.occasion === 'date') return 'デート';
    return 'カジュアル';
  }

  private generatePlaceholderImage(name: string, category: string): string {
    // カテゴリに基づいてプレースホルダー画像を生成
    const categoryColors: { [key: string]: string } = {
      'トップス': 'ff6b6b',
      'ボトムス': '4ecdc4',
      'アウター': '45b7d1',
      'ワンピース': '96ceb4',
      'シューズ': 'feca57',
      'アクセサリー': 'ff9ff3'
    };
    
    const color = categoryColors[category] || 'cccccc';
    return `https://via.placeholder.com/300x300/${color}/ffffff?text=${encodeURIComponent(name)}`;
  }

  private getMockSuggestions(preferences: ClothingPreferences): ClothingSuggestion[] {
    // フォールバック用のモックデータ
    return [
      {
        id: '1',
        name: 'カジュアルなデニムジャケット',
        description: '日常使いに最適な軽やかなデニムジャケット',
        category: 'アウター',
        color: 'blue',
        imageUrl: 'https://via.placeholder.com/300x300/45b7d1/ffffff?text=デニムジャケット',
        webUrl: 'https://www.zara.com/jp/ja/denim-jacket-p00000000.html'
      },
      {
        id: '2',
        name: 'エレガントなワンピース',
        description: 'パーティーやデートにぴったりのエレガントなワンピース',
        category: 'ワンピース',
        color: 'black',
        imageUrl: 'https://via.placeholder.com/300x300/96ceb4/ffffff?text=ワンピース',
        webUrl: 'https://www.hm.com/jp/productpage.12345678.html'
      },
      {
        id: '3',
        name: 'スポーティなトレーナー',
        description: 'スポーツやカジュアルな場面で活躍するトレーナー',
        category: 'トップス',
        color: 'gray',
        imageUrl: 'https://via.placeholder.com/300x300/ff6b6b/ffffff?text=トレーナー',
        webUrl: 'https://www.uniqlo.com/jp/ja/products/E4567890123.html'
      },
      {
        id: '4',
        name: 'ビジネスカジュアルなシャツ',
        description: '仕事でもプライベートでも使える万能なシャツ',
        category: 'トップス',
        color: 'white',
        imageUrl: 'https://via.placeholder.com/300x300/ff6b6b/ffffff?text=シャツ',
        webUrl: 'https://www.muji.com/jp/ja/products/4550000000000.html'
      },
      {
        id: '5',
        name: 'クラシックなチノパンツ',
        description: 'カジュアルからビジネスまで幅広く使える万能パンツ',
        category: 'ボトムス',
        color: 'beige',
        imageUrl: 'https://via.placeholder.com/300x300/4ecdc4/ffffff?text=チノパンツ',
        webUrl: 'https://www.gap.co.jp/product/123456.html'
      },
      {
        id: '6',
        name: 'スタイリッシュなスニーカー',
        description: 'どんなコーディネートにも合わせやすい白いスニーカー',
        category: 'シューズ',
        color: 'white',
        imageUrl: 'https://via.placeholder.com/300x300/feca57/ffffff?text=スニーカー',
        webUrl: 'https://www.converse.com/jp/ja/products/123456C.html'
      }
    ];
  }

  private generateWebUrl(suggestion: ClothingSuggestion, preferences: ClothingPreferences): string {
    // 実際のAI APIが提供するWeb URLを生成するロジックをここに追加
    // 例: スタイル、カラー、シーズン、ボディタイプ、身長に基づいてURLを生成
    const style = suggestion.name.includes('カジュアル') ? 'casual' :
                   suggestion.name.includes('エレガント') ? 'elegant' :
                   suggestion.name.includes('スポーティ') ? 'sporty' :
                   suggestion.name.includes('ビジネス') ? 'business' :
                   'casual'; // デフォルト
    const color = suggestion.color;
    const season = suggestion.name.includes('春') ? 'spring' :
                    suggestion.name.includes('夏') ? 'summer' :
                    suggestion.name.includes('秋') ? 'autumn' :
                    'spring'; // デフォルト
    const bodyType = suggestion.name.includes('スリム') ? 'slim' :
                      suggestion.name.includes('プラス') ? 'plus' :
                      'average'; // デフォルト
    const height = suggestion.name.includes('小柄') ? 'short' :
                    suggestion.name.includes('中背') ? 'medium' :
                    'medium'; // デフォルト

    // ここで実際のAI APIのURL生成ロジックを呼び出す
    // 例: https://api.example.com/generate-web-url?style=${style}&color=${color}&season=${season}&bodyType=${bodyType}&height=${height}
    // このメソッドはAI APIと連携する際に実装する必要があります。
    // 現在はモックURLを返すか、実際のAPIを呼び出すロジックを追加します。

    // モックURLを返す（実際のAPIがない場合）
    return `https://www.example.com/products/${suggestion.id}`;
  }
}

export default AIService; 