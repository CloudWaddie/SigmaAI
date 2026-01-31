import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Square, Play, Download as DownloadIcon } from 'lucide-react';
import { models } from '../models/manifest';
import { downloadManager, DownloadProgress } from '../services/download';
import DownloadProgressCard from './DownloadProgressCard';
import '../styles/voice-app.css';

const VoiceApp = () => {
  const navigate = useNavigate();
  const [selectedAsrModel, setSelectedAsrModel] = useState('');
  const [selectedTtsModel, setSelectedTtsModel] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [ttsText, setTtsText] = useState('');
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [asrPipeline, setAsrPipeline] = useState<any>(null);
  const [ttsPipeline, setTtsPipeline] = useState<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const asrModels = models.filter((m) => m.modality === 'voice' && m.task.includes('ASR'));
  const ttsModels = models.filter((m) => m.modality === 'voice' && m.task.includes('TTS'));

  useEffect(() => {
    if (asrModels.length > 0 && !selectedAsrModel) {
      setSelectedAsrModel(asrModels[0].id);
    }
    if (ttsModels.length > 0 && !selectedTtsModel) {
      setSelectedTtsModel(ttsModels[0].id);
    }
  }, [asrModels, ttsModels, selectedAsrModel, selectedTtsModel]);

  const handleDownloadAsrModel = async () => {
    if (!selectedAsrModel) return;

    const model = models.find((m) => m.id === selectedAsrModel);
    if (!model) return;

    try {
      const pipeline = await downloadManager.downloadModel(
        model.id,
        'automatic-speech-recognition',
        (progress) => setDownloadProgress(progress)
      );
      setAsrPipeline(pipeline);
      setTimeout(() => setDownloadProgress(null), 3000);
    } catch (error) {
      console.error('Failed to download ASR model:', error);
    }
  };

  const handleDownloadTtsModel = async () => {
    if (!selectedTtsModel) return;

    const model = models.find((m) => m.id === selectedTtsModel);
    if (!model) return;

    try {
      const pipeline = await downloadManager.downloadModel(
        model.id,
        'text-to-speech',
        (progress) => setDownloadProgress(progress)
      );
      setTtsPipeline(pipeline);
      setTimeout(() => setDownloadProgress(null), 3000);
    } catch (error) {
      console.error('Failed to download TTS model:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Microphone access denied or unavailable');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    if (!asrPipeline) {
      alert('Please download an ASR model first');
      return;
    }

    try {
      setTranscription('Transcribing...');
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const result = await asrPipeline(audioBuffer);
      setTranscription(result.text || 'No transcription available');
    } catch (error) {
      console.error('Transcription failed:', error);
      setTranscription('Transcription failed. Please try again.');
    }
  };

  const handleGenerateSpeech = async () => {
    if (!ttsPipeline) {
      alert('Please download a TTS model first');
      return;
    }

    if (!ttsText.trim()) {
      alert('Please enter some text to convert to speech');
      return;
    }

    try {
      const result = await ttsPipeline(ttsText);
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(result.audio);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.error('TTS failed:', error);
      alert('Speech generation failed. Please try again.');
    }
  };

  return (
    <div className="voice-app">
      <button className="back-button" onClick={() => navigate('/')}>
        <ArrowLeft size={20} />
        Back to Home
      </button>

      <h1 className="voice-app-title">Voice App</h1>
      <p className="voice-app-subtitle">Speech-to-Text and Text-to-Speech with Transformers</p>

      {downloadProgress && <DownloadProgressCard progress={downloadProgress} />}

      <div className="voice-sections">
        <div className="voice-section">
          <h2 className="section-title">Speech-to-Text (ASR)</h2>

          <div className="model-selector">
            <label htmlFor="asr-model-select">ASR Model:</label>
            <select
              id="asr-model-select"
              value={selectedAsrModel}
              onChange={(e) => setSelectedAsrModel(e.target.value)}
              className="model-select"
            >
              {asrModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.size_mb}MB)
                </option>
              ))}
            </select>
            {!asrPipeline && (
              <button className="download-model-btn" onClick={handleDownloadAsrModel}>
                <DownloadIcon size={18} />
                Download Model
              </button>
            )}
          </div>

          <div className="recording-controls">
            {!isRecording ? (
              <button
                className="record-button"
                onClick={startRecording}
                disabled={!asrPipeline}
              >
                <Mic size={24} />
                Start Recording
              </button>
            ) : (
              <button className="stop-button" onClick={stopRecording}>
                <Square size={24} />
                Stop Recording
              </button>
            )}
          </div>

          {transcription && (
            <div className="transcription-output">
              <h3>Transcription:</h3>
              <p>{transcription}</p>
            </div>
          )}
        </div>

        <div className="voice-section">
          <h2 className="section-title">Text-to-Speech (TTS)</h2>

          <div className="model-selector">
            <label htmlFor="tts-model-select">TTS Model:</label>
            <select
              id="tts-model-select"
              value={selectedTtsModel}
              onChange={(e) => setSelectedTtsModel(e.target.value)}
              className="model-select"
            >
              {ttsModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.size_mb}MB)
                </option>
              ))}
            </select>
            {!ttsPipeline && (
              <button className="download-model-btn" onClick={handleDownloadTtsModel}>
                <DownloadIcon size={18} />
                Download Model
              </button>
            )}
          </div>

          <div className="tts-input-area">
            <textarea
              className="tts-textarea"
              placeholder="Enter text to convert to speech..."
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              rows={4}
            />
            <button
              className="generate-speech-button"
              onClick={handleGenerateSpeech}
              disabled={!ttsPipeline || !ttsText.trim()}
            >
              <Play size={20} />
              Generate Speech
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceApp;
