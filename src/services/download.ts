import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

export interface DownloadProgress {
  modelId: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  progress: number;
  loaded: number;
  total: number;
  speed: number;
  eta: number;
  error?: string;
}

type ProgressCallback = (progress: DownloadProgress) => void;

class DownloadManager {
  private activeDownloads: Map<string, DownloadProgress> = new Map();
  private callbacks: Map<string, ProgressCallback[]> = new Map();

  async downloadModel(
    modelId: string,
    task: string,
    onProgress?: ProgressCallback
  ): Promise<any> {
    if (this.activeDownloads.has(modelId)) {
      const existing = this.activeDownloads.get(modelId);
      if (existing?.status === 'downloading') {
        if (onProgress) {
          this.addProgressCallback(modelId, onProgress);
        }
        return this.waitForDownload(modelId);
      }
    }

    const progressData: DownloadProgress = {
      modelId,
      status: 'downloading',
      progress: 0,
      loaded: 0,
      total: 0,
      speed: 0,
      eta: 0,
    };

    this.activeDownloads.set(modelId, progressData);

    if (onProgress) {
      this.addProgressCallback(modelId, onProgress);
    }

    try {
      let lastLoaded = 0;
      let lastTime = Date.now();

      const progressTracker = (progress: any) => {
        if (progress.status === 'progress' && progress.file) {
          const now = Date.now();
          const timeDelta = (now - lastTime) / 1000;
          const loadedDelta = progress.loaded - lastLoaded;
          const speed = timeDelta > 0 ? loadedDelta / timeDelta : 0;
          const remaining = progress.total - progress.loaded;
          const eta = speed > 0 ? remaining / speed : 0;

          progressData.progress = (progress.loaded / progress.total) * 100;
          progressData.loaded = progress.loaded;
          progressData.total = progress.total;
          progressData.speed = speed;
          progressData.eta = eta;

          lastLoaded = progress.loaded;
          lastTime = now;

          this.notifyProgress(modelId, progressData);
        }
      };

      const model = await pipeline(task, modelId, {
        progress_callback: progressTracker,
      });

      progressData.status = 'completed';
      progressData.progress = 100;
      this.notifyProgress(modelId, progressData);

      return model;
    } catch (error) {
      progressData.status = 'error';
      progressData.error = error instanceof Error ? error.message : 'Unknown error';
      this.notifyProgress(modelId, progressData);
      throw error;
    } finally {
      setTimeout(() => {
        this.activeDownloads.delete(modelId);
        this.callbacks.delete(modelId);
      }, 5000);
    }
  }

  private addProgressCallback(modelId: string, callback: ProgressCallback) {
    const existing = this.callbacks.get(modelId) || [];
    existing.push(callback);
    this.callbacks.set(modelId, existing);
  }

  private notifyProgress(modelId: string, progress: DownloadProgress) {
    const callbacks = this.callbacks.get(modelId) || [];
    callbacks.forEach((cb) => cb(progress));
  }

  private async waitForDownload(modelId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkStatus = () => {
        const progress = this.activeDownloads.get(modelId);
        if (!progress) {
          reject(new Error('Download cancelled'));
          return;
        }

        if (progress.status === 'completed') {
          resolve(null);
        } else if (progress.status === 'error') {
          reject(new Error(progress.error || 'Download failed'));
        } else {
          setTimeout(checkStatus, 100);
        }
      };

      checkStatus();
    });
  }

  getProgress(modelId: string): DownloadProgress | undefined {
    return this.activeDownloads.get(modelId);
  }

  isDownloading(modelId: string): boolean {
    const progress = this.activeDownloads.get(modelId);
    return progress?.status === 'downloading';
  }
}

export const downloadManager = new DownloadManager();
