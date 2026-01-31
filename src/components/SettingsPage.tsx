import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, HardDrive, Cpu, Zap, AlertCircle } from 'lucide-react';
import { cacheManager, CachedModel } from '../services/cache';
import { getHardwareProfile, getOptimalBackend } from '../services/hardware';
import '../styles/settings.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [cachedModels, setCachedModels] = useState<CachedModel[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageQuota, setStorageQuota] = useState(0);
  const [cacheSize, setCacheSize] = useState(0);
  const [hardwareProfile, setHardwareProfile] = useState<any>(null);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const models = await cacheManager.getCachedModels();
    setCachedModels(models);

    const { used, quota } = await cacheManager.getStorageQuota();
    setStorageUsed(used);
    setStorageQuota(quota);

    const size = await cacheManager.getTotalCacheSize();
    setCacheSize(size);

    const backend = await getOptimalBackend();
    const profile = await getHardwareProfile();
    setHardwareProfile({ ...profile, backend });
  };

  const handleDeleteModel = async (modelId: string) => {
    const success = await cacheManager.deleteModel(modelId);
    if (success) {
      await loadData();
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all cached models? This cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    const success = await cacheManager.clearAllCache();
    if (success) {
      await loadData();
    }
    setIsClearing(false);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const storagePercentage =
    storageQuota > 0 ? ((storageUsed / storageQuota) * 100).toFixed(1) : '0';

  return (
    <div className="settings-page">
      <button className="back-button" onClick={() => navigate('/')}>
        <ArrowLeft size={20} />
        Back to Home
      </button>

      <h1 className="settings-title">Settings</h1>

      <div className="settings-section">
        <h2 className="section-title">Hardware Information</h2>
        <div className="hardware-info-grid">
          <div className="hardware-info-card">
            <div className="hardware-info-icon">
              <Cpu size={24} />
            </div>
            <div className="hardware-info-content">
              <p className="hardware-info-label">RAM</p>
              <p className="hardware-info-value">
                {hardwareProfile?.ram_gb || 'Unknown'} GB
              </p>
            </div>
          </div>

          <div className="hardware-info-card">
            <div className="hardware-info-icon">
              <Cpu size={24} />
            </div>
            <div className="hardware-info-content">
              <p className="hardware-info-label">CPU Cores</p>
              <p className="hardware-info-value">
                {hardwareProfile?.cpu_cores || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="hardware-info-card">
            <div className="hardware-info-icon">
              <Zap size={24} />
            </div>
            <div className="hardware-info-content">
              <p className="hardware-info-label">Backend</p>
              <p className="hardware-info-value">
                {hardwareProfile?.backend?.toUpperCase() || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="hardware-info-card">
            <div className="hardware-info-icon">
              {hardwareProfile?.webgpu_supported ? <Zap size={24} /> : <AlertCircle size={24} />}
            </div>
            <div className="hardware-info-content">
              <p className="hardware-info-label">WebGPU</p>
              <p className="hardware-info-value">
                {hardwareProfile?.webgpu_supported ? 'Supported' : 'Not Supported'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">Storage</h2>
        <div className="storage-info">
          <div className="storage-stats">
            <div className="storage-stat">
              <span className="storage-stat-label">Used:</span>
              <span className="storage-stat-value">{formatBytes(storageUsed)}</span>
            </div>
            <div className="storage-stat">
              <span className="storage-stat-label">Quota:</span>
              <span className="storage-stat-value">{formatBytes(storageQuota)}</span>
            </div>
            <div className="storage-stat">
              <span className="storage-stat-label">Percentage:</span>
              <span className="storage-stat-value">{storagePercentage}%</span>
            </div>
          </div>
          <div className="storage-bar-container">
            <div
              className="storage-bar-fill"
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <h2 className="section-title">Cached Models</h2>
          <button
            className="clear-all-button"
            onClick={handleClearAll}
            disabled={isClearing || cachedModels.length === 0}
          >
            <Trash2 size={18} />
            Clear All
          </button>
        </div>

        {cachedModels.length === 0 ? (
          <div className="empty-cache-message">
            <HardDrive size={48} />
            <p>No models cached yet</p>
          </div>
        ) : (
          <div className="cached-models-list">
            {cachedModels.map((model, index) => (
              <div key={index} className="cached-model-item">
                <div className="cached-model-info">
                  <h3 className="cached-model-name">{model.modelId}</h3>
                  <div className="cached-model-meta">
                    <span className="cached-model-size">{formatBytes(model.size)}</span>
                    <span className="cached-model-date">
                      Cached: {formatDate(model.cachedAt)}
                    </span>
                  </div>
                </div>
                <button
                  className="delete-model-button"
                  onClick={() => handleDeleteModel(model.modelId)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {cachedModels.length > 0 && (
          <div className="cache-summary">
            <p className="cache-summary-text">
              Total: {cachedModels.length} model{cachedModels.length !== 1 ? 's' : ''} ({formatBytes(cacheSize)})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
