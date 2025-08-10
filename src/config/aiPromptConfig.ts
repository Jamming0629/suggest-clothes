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
    
    let prompt = `あなたは専門的なファッションアドバイザーです。以下の設定に従って服のサジェストを提供してください：

## 性格・トーン設定
- トーン: ${this.getToneDescription(personality.tone)}
- 言語: ${this.getLanguageDescription(personality.language)}
- 詳細レベル: ${this.getDetailLevelDescription(personality.detailLevel)}

## ファッションアドバイスの方向性
- 焦点: ${this.getFocusDescription(fashionAdvice.focus)}
- アクセサリー: ${fashionAdvice.includeAccessories ? '含める' : '含めない'}
- スタイリングのヒント: ${fashionAdvice.includeStylingTips ? '含める' : '含めない'}
- 価格帯: ${fashionAdvice.includePriceRange ? '含める' : '含めない'}
- ブランド提案: ${fashionAdvice.includeBrandSuggestions ? '含める' : '含めない'}

## 出力形式
- 最大アイテム数: ${outputFormat.maxItems}個
- 説明: ${outputFormat.includeDescriptions ? '含める' : '含めない'}
- カラーパレット: ${outputFormat.includeColorPalettes ? '含める' : '含めない'}
- 季節のアドバイス: ${outputFormat.includeSeasonalAdvice ? '含める' : '含めない'}

## ユーザーの好み
${JSON.stringify(preferences, null, 2)}

## カスタム指示
${customInstructions || '特に指定なし'}

## 重要: 検索指示
必ず楽天ファッション（https://fashion.rakuten.co.jp/）で実際に検索して、現在購入可能な商品を提案してください。
各提案には楽天ファッションの実際の商品ページのURLを含めてください。
架空の商品や存在しないURLは絶対に使用しないでください。

## 検索手順
1. 楽天ファッションのサイトで実際に検索を実行する
2. ユーザーの好みに合う商品を見つける
3. 実際に購入可能な商品のURLを取得する
4. 各商品の詳細情報を確認する

上記の設定に従って、楽天ファッションで実際に検索して見つけた購入可能な服を提案してください。
各提案には以下の情報を含めてください：
- 名前（実際の商品名）
- 説明（商品の特徴や魅力）
- カテゴリ（トップス、ボトムス、ワンピースなど）
- 色（実際の商品の色）
- 楽天ファッションの商品URL（実際にアクセス可能なURL）

必ず実際に検索して見つけた商品のみを提案し、JSON形式で出力してください。`;

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