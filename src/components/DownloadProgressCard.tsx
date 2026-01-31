import { useEffect } from 'react';
import { Download, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { DownloadProgress } from '../services/download';
import '../styles/download-progress.css';

interface DownloadProgressProps {
  progress: DownloadProgress;
}

const DownloadProgressCard = ({ progress }: DownloadProgressProps) => {
  useEffect(() => {
    if (progress.status === 'downloading') {
      const interval = setInterval(() => {}, 1000);
      return () => clearInterval(interval);
    }
  }, [progress.status]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'downloading':
        return <Loader2 className="spin-animation" size={20} />;
      case 'completed':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      default:
        return <Download size={20} />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'downloading':
        return '#667eea';
      case 'completed':
        return '#22c55e';
      case 'error':
        return '#ef4444';
      default:
        return '#888';
    }
  };

  return (
    <div className="download-progress-card">
      <div className="progress-header">
        <div className="progress-icon" style={{ color: getStatusColor() }}>
          {getStatusIcon()}
        </div>
        <div className="progress-info">
          <h4 className="progress-model-name">{progress.modelId}</h4>
          <p className="progress-status-text">{progress.status}</p>
        </div>
      </div>

      {progress.status === 'downloading' && (
        <>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progress.progress}%`,
                background: `linear-gradient(90deg, ${getStatusColor()}, ${getStatusColor()}dd)`,
              }}
            />
          </div>

          <div className="progress-stats">
            <div className="progress-stat">
              <span className="stat-label">Progress:</span>
              <span className="stat-value">{progress.progress.toFixed(1)}%</span>
            </div>
            <div className="progress-stat">
              <span className="stat-label">Downloaded:</span>
              <span className="stat-value">
                {formatBytes(progress.loaded)} / {formatBytes(progress.total)}
              </span>
            </div>
            <div className="progress-stat">
              <span className="stat-label">Speed:</span>
              <span className="stat-value">{formatBytes(progress.speed)}/s</span>
            </div>
            <div className="progress-stat">
              <span className="stat-label">ETA:</span>
              <span className="stat-value">{formatTime(progress.eta)}</span>
            </div>
          </div>
        </>
      )}

      {progress.status === 'completed' && (
        <div className="progress-complete-message">
          Model downloaded successfully!
        </div>
      )}

      {progress.status === 'error' && (
        <div className="progress-error-message">
          Error: {progress.error || 'Download failed'}
        </div>
      )}
    </div>
  );
};

export default DownloadProgressCard;
