import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Download, HardDrive, Cpu, Zap } from 'lucide-react';
import gsap from 'gsap';
import { allModels } from '../models/manifest';
import type { Model, Modality } from '../models/types';
import '../styles/model-browser.css';

type FilterTab = 'all' | Modality;
type SortOption = 'space' | 'requirements' | 'name';

interface ModelBrowserProps {
  filterByModality?: Modality;
  onModelSelect?: (model: Model) => void;
}

const ModelBrowser = ({ filterByModality, onModelSelect }: ModelBrowserProps) => {
  const [activeTab, setActiveTab] = useState<FilterTab>(filterByModality || 'all');
  const [sortBy, setSortBy] = useState<SortOption>('space');
  const [searchQuery, setSearchQuery] = useState('');
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const filteredAndSortedModels = useMemo(() => {
    let result = [...allModels];

    if (activeTab !== 'all') {
      result = result.filter((model) => model.modality === activeTab);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          model.description.toLowerCase().includes(query) ||
          model.task.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'space':
          return a.size_mb - b.size_mb;
        case 'requirements':
          return a.total_requirements_score - b.total_requirements_score;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [activeTab, sortBy, searchQuery]);

  useEffect(() => {
    if (cardsContainerRef.current) {
      const cards = cardsContainerRef.current.querySelectorAll('.model-card');
      gsap.from(cards, {
        opacity: 0,
        y: 30,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.out',
      });
    }
  }, [filteredAndSortedModels]);

  const tabs: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'voice', label: 'Voice' },
    { id: 'image', label: 'Image' },
    { id: 'text', label: 'Text' },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'space', label: 'Least Space' },
    { value: 'requirements', label: 'Least Requirements' },
    { value: 'name', label: 'Name A-Z' },
  ];

  const getModalityColor = (modality: Modality): string => {
    switch (modality) {
      case 'voice':
        return '#667eea';
      case 'image':
        return '#f5576c';
      case 'text':
        return '#00f2fe';
      default:
        return '#888';
    }
  };

  const formatSize = (mb: number): string => {
    if (mb < 1024) return `${mb}MB`;
    return `${(mb / 1024).toFixed(1)}GB`;
  };

  return (
    <div className="model-browser">
      <div className="browser-header">
        <h2 className="browser-title">Model Browser</h2>
        <p className="browser-subtitle">
          {filteredAndSortedModels.length} model{filteredAndSortedModels.length !== 1 ? 's' : ''}{' '}
          available
        </p>
      </div>

      <div className="browser-controls">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search models..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="sort-select-wrapper">
          <label htmlFor="sort-select" className="sort-label">
            Sort by:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="sort-select"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div ref={cardsContainerRef} className="models-grid">
        {filteredAndSortedModels.map((model) => {
          return (
            <div
              key={model.id}
              className="model-card"
              onClick={() => onModelSelect?.(model)}
              style={{
                borderTop: `3px solid ${getModalityColor(model.modality)}`,
              }}
            >
              <div className="model-card-header">
                <div className="model-name-row">
                  <h3 className="model-name">{model.name}</h3>
                </div>
                <span
                  className="model-modality-badge"
                  style={{ backgroundColor: getModalityColor(model.modality) }}
                >
                  {model.modality}
                </span>
              </div>

              <p className="model-description">{model.description}</p>

              <div className="model-task">
                <span className="model-task-label">Task:</span> {model.task}
              </div>

              <div className="model-requirements">
                <div className="requirement-item">
                  <HardDrive size={16} />
                  <span>{formatSize(model.size_mb)}</span>
                </div>
                <div className="requirement-item">
                  <Cpu size={16} />
                  <span>{model.min_ram_gb}GB RAM</span>
                </div>
                {model.supports_webgpu && (
                  <div className="requirement-item webgpu">
                    <Zap size={16} />
                    <span>WebGPU</span>
                  </div>
                )}
              </div>

              <div className="model-quantization">
                <span className="quantization-label">Quantization:</span>
                <span className="quantization-value">{model.quantization}</span>
              </div>

              <button className="model-download-btn" onClick={() => onModelSelect?.(model)}>
                <Download size={18} />
                Download Model
              </button>
            </div>
          );
        })}
      </div>

      {filteredAndSortedModels.length === 0 && (
        <div className="empty-state">
          <p>No models found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ModelBrowser;
