export interface CachedModel {
  modelId: string;
  size: number;
  cachedAt: number;
}

class CacheManager {
  async getCachedModels(): Promise<CachedModel[]> {
    try {
      const caches = await window.caches.keys();
      const transformerCaches = caches.filter((name) => name.includes('transformers'));

      const cachedModels: CachedModel[] = [];

      for (const cacheName of transformerCaches) {
        const cache = await window.caches.open(cacheName);
        const requests = await cache.keys();

        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            const url = new URL(request.url);
            const pathParts = url.pathname.split('/');
            const modelId = pathParts.slice(-2).join('/');

            cachedModels.push({
              modelId,
              size: blob.size,
              cachedAt: Date.now(),
            });
          }
        }
      }

      return cachedModels;
    } catch (error) {
      console.error('Failed to get cached models:', error);
      return [];
    }
  }

  async deleteModel(modelId: string): Promise<boolean> {
    try {
      const caches = await window.caches.keys();
      const transformerCaches = caches.filter((name) => name.includes('transformers'));

      let deleted = false;

      for (const cacheName of transformerCaches) {
        const cache = await window.caches.open(cacheName);
        const requests = await cache.keys();

        for (const request of requests) {
          if (request.url.includes(modelId)) {
            await cache.delete(request);
            deleted = true;
          }
        }
      }

      return deleted;
    } catch (error) {
      console.error('Failed to delete model:', error);
      return false;
    }
  }

  async clearAllCache(): Promise<boolean> {
    try {
      const caches = await window.caches.keys();
      const transformerCaches = caches.filter((name) => name.includes('transformers'));

      for (const cacheName of transformerCaches) {
        await window.caches.delete(cacheName);
      }

      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  async getStorageQuota(): Promise<{ used: number; quota: number }> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
        };
      }
      return { used: 0, quota: 0 };
    } catch (error) {
      console.error('Failed to get storage quota:', error);
      return { used: 0, quota: 0 };
    }
  }

  async getTotalCacheSize(): Promise<number> {
    const models = await this.getCachedModels();
    return models.reduce((total, model) => total + model.size, 0);
  }
}

export const cacheManager = new CacheManager();
