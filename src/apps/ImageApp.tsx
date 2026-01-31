import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Image as ImageIcon, Download as DownloadIcon, X } from 'lucide-react';
import { models } from '../models/manifest';
import { downloadManager, DownloadProgress } from '../services/download';
import DownloadProgressCard from '../components/DownloadProgressCard';
import '../styles/image-app.css';

const ImageApp = () => {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [pipeline, setPipeline] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageModels = models.filter((m) => m.modality === 'image');

  useState(() => {
    if (imageModels.length > 0 && !selectedModel) {
      setSelectedModel(imageModels[0].id);
    }
  });

  const handleDownloadModel = async () => {
    if (!selectedModel) return;

    const model = models.find((m) => m.id === selectedModel);
    if (!model) return;

    const taskMap: Record<string, string> = {
      'Image Classification': 'image-classification',
      'Zero-shot Classification': 'zero-shot-image-classification',
      'Image Captioning': 'image-to-text',
      'Object Detection': 'object-detection',
    };

    const task = taskMap[model.task] || 'image-classification';

    try {
      const loadedPipeline = await downloadManager.downloadModel(
        model.id,
        task,
        (progress) => setDownloadProgress(progress)
      );
      setPipeline(loadedPipeline);
      setTimeout(() => setDownloadProgress(null), 3000);
    } catch (error) {
      console.error('Failed to download model:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setAnalysisResult('');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!pipeline) {
      alert('Please download a model first');
      return;
    }

    if (!uploadedImage) {
      alert('Please upload an image first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult('Analyzing image...');

    try {
      const img = new Image();
      img.src = uploadedImage;
      await img.decode();

      const result = await pipeline(img);
      
      let formattedResult = '';
      if (Array.isArray(result)) {
        formattedResult = result
          .map((item, idx) => `${idx + 1}. ${item.label || item.class || 'Unknown'}: ${(item.score * 100).toFixed(2)}%`)
          .join('\n');
      } else if (typeof result === 'object' && result.generated_text) {
        formattedResult = result.generated_text;
      } else if (typeof result === 'string') {
        formattedResult = result;
      } else {
        formattedResult = JSON.stringify(result, null, 2);
      }

      setAnalysisResult(formattedResult || 'No results available');
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysisResult('Analysis failed. Please try again with a different image or model.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setAnalysisResult('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-app">
      <button className="back-button" onClick={() => navigate('/')}>
        <ArrowLeft size={20} />
        Back to Home
      </button>

      <h1 className="image-app-title">Image App</h1>
      <p className="image-app-subtitle">Analyze and understand images with vision models</p>

      {downloadProgress && <DownloadProgressCard progress={downloadProgress} />}

      <div className="image-content">
        <div className="image-section">
          <h2 className="section-title">Model Selection</h2>

          <div className="model-selector">
            <label htmlFor="image-model-select">Vision Model:</label>
            <select
              id="image-model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-select"
            >
              {imageModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.task} ({model.size_mb}MB)
                </option>
              ))}
            </select>
            {!pipeline && (
              <button className="download-model-btn" onClick={handleDownloadModel}>
                <DownloadIcon size={18} />
                Download Model
              </button>
            )}
          </div>
        </div>

        <div className="image-section">
          <h2 className="section-title">Upload Image</h2>

          <div className="upload-area">
            {!uploadedImage ? (
              <div
                className="upload-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon size={48} />
                <p className="upload-text">Click to upload an image</p>
                <p className="upload-hint">Supports JPG, PNG, WebP</p>
              </div>
            ) : (
              <div className="image-preview-container">
                <button className="clear-image-btn" onClick={handleClearImage}>
                  <X size={20} />
                </button>
                <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
            />
          </div>

          {uploadedImage && (
            <button
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={!pipeline || isAnalyzing}
            >
              <Upload size={20} />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
            </button>
          )}
        </div>

        {analysisResult && (
          <div className="image-section">
            <h2 className="section-title">Analysis Results</h2>
            <div className="analysis-output">
              <pre>{analysisResult}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageApp;
