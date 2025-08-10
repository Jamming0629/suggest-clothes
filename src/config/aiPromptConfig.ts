export interface AIPromptSettings {
  // AIの性格・トーン設定
  personality: {
    tone: 'friendly' | 'professional' | 'casual' | 'elegant' | 'enthusiastic';
    language: 'polite' | 'casual' | 'formal';
    detailLevel: 'brief' | 'detailed' | 'very-detailed';
  };
  
  // ファッションアドバイスの方向性
  fashionAdvice: {
    focus: 'trendy' | 'classic' | 'practical' | 'creative' | 'balanced';
    includeAccessories: boolean;
    includeStylingTips: boolean;
    includePriceRange: boolean;
    includeBrandSuggestions: boolean;
  };
  
  // 出力形式の設定
  outputFormat: {
    maxItems: number;
    includeImages: boolean;
    includeDescriptions: boolean;
    includeColorPalettes: boolean;
    includeSeasonalAdvice: boolean;
  };
  
  // カスタム指示
  customInstructions: string;
}

export const defaultPromptSettings: AIPromptSettings = {
  personality: {
    tone: 'friendly',
    language: 'polite',
    detailLevel: 'detailed'
  },
  fashionAdvice: {
    focus: 'balanced',
    includeAccessories: true,
    includeStylingTips: true,
    includePriceRange: false,
    includeBrandSuggestions: false
  },
  outputFormat: {
    maxItems: 5,
    includeImages: false,
    includeDescriptions: true,
    includeColorPalettes: true,
    includeSeasonalAdvice: true
  },
  customInstructions: ''
};

export class AIPromptConfigManager {
  private static instance: AIPromptConfigManager;
  private settings: AIPromptSettings;
  private readonly STORAGE_KEY = 'ai_prompt_settings';

  private constructor() {
    this.settings = this.loadSettings();
  }

  public static getInstance(): AIPromptConfigManager {
    if (!AIPromptConfigManager.instance) {
      AIPromptConfigManager.instance = new AIPromptConfigManager();
    }
    return AIPromptConfigManager.instance;
  }

  public getSettings(): AIPromptSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AIPromptSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  public resetToDefault(): void {
    this.settings = { ...defaultPromptSettings };
    this.saveSettings();
  }

  public generatePrompt(preferences: any): string {
    const { personality, fashionAdvice, outputFormat, customInstructions } = this.settings;
    
    let prompt = `あなたは専門的なファッションアドバイザーです。以下の厳格なルールに従って服のサジェストを提供してください。

## 重要: ハルシネーション禁止
- 架空の商品、存在しない商品、想像で作った商品は絶対に提案しないでください
- 推測や想像で商品を作り出さないでください
- 必ず実際に検索して確認した商品のみを提案してください
- 商品が見つからない場合は、空の配列[]を返してください

## 重要: 出力形式（必須）
必ず以下のJSON形式で出力してください。他の説明やテキストは一切含めないでください：

[
  {
    "name": "商品名（実際の商品名）",
    "description": "商品の特徴や魅力の詳細説明",
    "category": "カテゴリ（トップス、ボトムス、ワンピース、アウター、シューズ、アクセサリーなど）",
    "color": "実際の商品の色",
    "webUrl": "楽天ブランドアベニューで実際に検索して見つけた商品のURL（そのまま出力）"
  }
]

## 検索手順（必須）
1. 楽天ブランドアベニュー（https://brandavenue.rakuten.co.jp/）で実際に検索を実行する
2. 検索結果から実際に購入可能な商品を見つける
3. 各商品の詳細ページにアクセスして情報を確認する
4. 実際に購入可能な商品のURLを取得する
5. 商品が見つからない場合は空の配列[]を返す

## ユーザーの好み
${JSON.stringify(preferences, null, 2)}

## 設定
- トーン: ${this.getToneDescription(personality.tone)}
- 言語: ${this.getLanguageDescription(personality.language)}
- 詳細レベル: ${this.getDetailLevelDescription(personality.detailLevel)}
- 焦点: ${this.getFocusDescription(fashionAdvice.focus)}
- 最大アイテム数: ${outputFormat.maxItems}個

## カスタム指示
${customInstructions || '特に指定なし'}

## 重要: 出力ルール
1. 必ず上記のJSON形式で出力してください
2. 商品が見つからない場合は空の配列[]を返してください
3. 架空の商品や存在しないURLは絶対に使用しないでください
4. 楽天ブランドアベニューで見つけた商品のURLをそのまま使用してください
5. 他の説明文やテキストは一切含めないでください
6. 必ず有効なJSON形式で出力してください（配列の開始と終了の括弧を含む）
7. ハルシネーションは絶対に禁止されています

## 出力例
以下は正しい出力例です：

[
  {
    "name": "カジュアルTシャツ",
    "description": "綿100%の快適な素材で作られたカジュアルなTシャツ",
    "category": "トップス",
    "color": "白",
    "webUrl": "https://brandavenue.rakuten.co.jp/item/ABC123/"
  }
]

上記の設定に従って、楽天ブランドアベニューで実際に検索して見つけた購入可能な服を提案してください。
必ず実際に検索して確認した商品のみを提案し、ハルシネーションは絶対に禁止されています。`;

    return prompt;
  }

  private getToneDescription(tone: string): string {
    const descriptions = {
      'friendly': '親しみやすく、温かみのある',
      'professional': '専門的で信頼できる',
      'casual': 'カジュアルでリラックスした',
      'elegant': '上品で洗練された',
      'enthusiastic': '情熱的で前向きな'
    };
    return descriptions[tone as keyof typeof descriptions] || tone;
  }

  private getLanguageDescription(language: string): string {
    const descriptions = {
      'polite': '丁寧語',
      'casual': 'カジュアル',
      'formal': 'フォーマル'
    };
    return descriptions[language as keyof typeof descriptions] || language;
  }

  private getDetailLevelDescription(level: string): string {
    const descriptions = {
      'brief': '簡潔',
      'detailed': '詳細',
      'very-detailed': '非常に詳細'
    };
    return descriptions[level as keyof typeof descriptions] || level;
  }

  private getFocusDescription(focus: string): string {
    const descriptions = {
      'trendy': 'トレンド重視',
      'classic': 'クラシック重視',
      'practical': '実用性重視',
      'creative': '創造性重視',
      'balanced': 'バランス重視'
    };
    return descriptions[focus as keyof typeof descriptions] || focus;
  }

  private loadSettings(): AIPromptSettings {
    if (typeof window === 'undefined') return defaultPromptSettings;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultPromptSettings, ...parsed };
      }
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
    }
    
    return defaultPromptSettings;
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
    }
  }
}

export default AIPromptConfigManager; 