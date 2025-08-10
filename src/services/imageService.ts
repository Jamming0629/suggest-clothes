export interface ImageFetchResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export class ImageService {
  private static instance: ImageService;
  private imageCache: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  /**
   * URLから画像を取得する
   * 楽天ファッションのURLの場合は商品画像を抽出
   */
  public async fetchImageFromUrl(url: string): Promise<ImageFetchResult> {
    try {
      // キャッシュをチェック
      if (this.imageCache.has(url)) {
        return {
          success: true,
          imageUrl: this.imageCache.get(url)
        };
      }

      // 楽天ファッションのURLの場合
      if (url.includes('rakuten.co.jp') || url.includes('fashion.rakuten.co.jp')) {
        const imageUrl = await this.extractRakutenImage(url);
        if (imageUrl) {
          this.imageCache.set(url, imageUrl);
          return {
            success: true,
            imageUrl
          };
        }
      }

      // その他のURLの場合、OGP画像を取得
      const ogpImage = await this.extractOGPImage(url);
      if (ogpImage) {
        this.imageCache.set(url, ogpImage);
        return {
          success: true,
          imageUrl: ogpImage
        };
      }

      return {
        success: false,
        error: '画像が見つかりませんでした'
      };

    } catch (error) {
      console.error('画像取得エラー:', error);
      return {
        success: false,
        error: '画像の取得に失敗しました'
      };
    }
  }

  /**
   * 楽天ファッションの商品画像を抽出
   */
  private async extractRakutenImage(url: string): Promise<string | null> {
    try {
      // 楽天ファッションの商品画像URLパターンを生成
      // 実際の楽天APIを使用する場合は、ここで楽天商品検索APIを呼び出す
      
      // 現在はプレースホルダー画像を返す（実際の実装では楽天APIを使用）
      const productId = this.extractProductIdFromUrl(url);
      if (productId) {
        // 楽天商品画像のURLパターン（実際のAPI仕様に合わせて調整）
        return `https://thumbnail.image.rakuten.co.jp/@0_mall/rakutenfashion/cabinet/items/${productId}.jpg`;
      }

      return null;
    } catch (error) {
      console.error('楽天画像抽出エラー:', error);
      return null;
    }
  }

  /**
   * URLから商品IDを抽出
   */
  private extractProductIdFromUrl(url: string): string | null {
    try {
      // 楽天ファッションのURLパターンに応じて商品IDを抽出
      const match = url.match(/\/items\/([^\/\?]+)/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * OGP画像を抽出
   */
  private async extractOGPImage(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // OGP画像タグを検索
      const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
      if (ogImageMatch) {
        return ogImageMatch[1];
      }

      // 通常の画像タグを検索
      const imgMatch = html.match(/<img[^>]+src="([^"]+)"[^>]*>/);
      if (imgMatch) {
        return imgMatch[1];
      }

      return null;
    } catch (error) {
      console.error('OGP画像抽出エラー:', error);
      return null;
    }
  }

  /**
   * 複数のURLから画像を一括取得
   */
  public async fetchImagesFromUrls(urls: string[]): Promise<Map<string, ImageFetchResult>> {
    const results = new Map<string, ImageFetchResult>();
    
    const promises = urls.map(async (url) => {
      const result = await this.fetchImageFromUrl(url);
      results.set(url, result);
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * キャッシュをクリア
   */
  public clearCache(): void {
    this.imageCache.clear();
  }

  /**
   * 特定のURLのキャッシュを削除
   */
  public removeFromCache(url: string): void {
    this.imageCache.delete(url);
  }
}

export default ImageService; 