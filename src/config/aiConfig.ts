export interface AIConfig {
  openaiApiKey: string;
  imageGenerationEnabled: boolean;
  model3DEnabled: boolean;
  maxImageSize: number;
  imageQuality: 'standard' | 'hd';
}

export const defaultAIConfig: AIConfig = {
  openaiApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  imageGenerationEnabled: true,
  model3DEnabled: true,
  maxImageSize: 1024,
  imageQuality: 'standard'
};

export class AIConfigManager {
  private static instance: AIConfigManager;
  private config: AIConfig;

  private constructor() {
    this.config = { ...defaultAIConfig };
    this.loadConfig();
  }

  public static getInstance(): AIConfigManager {
    if (!AIConfigManager.instance) {
      AIConfigManager.instance = new AIConfigManager();
    }
    return AIConfigManager.instance;
  }

  public getConfig(): AIConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<AIConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  public setOpenAIApiKey(apiKey: string): void {
    this.config.openaiApiKey = apiKey;
    this.saveConfig();
  }

  public isImageGenerationEnabled(): boolean {
    return this.config.imageGenerationEnabled && this.config.openaiApiKey.length > 0;
  }

  public isModel3DEnabled(): boolean {
    return this.config.model3DEnabled;
  }

  private loadConfig(): void {
    try {
      // 環境変数から設定を読み込み
      this.config.openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || this.config.openaiApiKey;
      
      if (typeof window !== 'undefined') {
        const savedConfig = localStorage.getItem('aiConfig');
        if (savedConfig) {
          const localConfig = JSON.parse(savedConfig);
          // 環境変数で設定されていない場合のみローカルストレージから読み込み
          if (!this.config.openaiApiKey && localConfig.openaiApiKey) {
            this.config.openaiApiKey = localConfig.openaiApiKey;
          }
        }
      }
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
    }
  }

  private saveConfig(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('aiConfig', JSON.stringify(this.config));
      }
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
    }
  }
}

export default AIConfigManager; 