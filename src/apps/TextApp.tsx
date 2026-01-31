import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Download as DownloadIcon, Trash2 } from 'lucide-react';
import { models } from '../models/manifest';
import { downloadManager, DownloadProgress } from '../services/download';
import DownloadProgressCard from '../components/DownloadProgressCard';
import AnimatedPage from '../components/AnimatedPage';
import '../styles/text-app.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const TextApp = () => {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [pipeline, setPipeline] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const textModels = models.filter((m) => m.modality === 'text');

  useEffect(() => {
    if (textModels.length > 0 && !selectedModel) {
      setSelectedModel(textModels[0].id);
    }
  }, [textModels, selectedModel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDownloadModel = async () => {
    if (!selectedModel) return;

    const model = models.find((m) => m.id === selectedModel);
    if (!model) return;

    try {
      const loadedPipeline = await downloadManager.downloadModel(
        model.id,
        'text-generation',
        (progress) => setDownloadProgress(progress)
      );
      setPipeline(loadedPipeline);
      setTimeout(() => setDownloadProgress(null), 3000);
    } catch (error) {
      console.error('Failed to download model:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!pipeline) {
      alert('Please download a model first');
      return;
    }

    if (!inputText.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsGenerating(true);

    try {
      const prompt = messages
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n') + `\nUser: ${userMessage.content}\nAssistant:`;

      const result = await pipeline(prompt, {
        max_new_tokens: 150,
        temperature: 0.7,
        do_sample: true,
      });

      const assistantContent = result[0]?.generated_text?.split('Assistant:').pop()?.trim() || 
                               'Sorry, I could not generate a response.';

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, an error occurred while generating the response.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (messages.length > 0 && confirm('Clear all messages?')) {
      setMessages([]);
    }
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <AnimatedPage>
      <div className="text-app">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Home
        </button>

        <div className="text-app-header">
          <div>
            <h1 className="text-app-title">Text App</h1>
          <p className="text-app-subtitle">Chat with language models running locally</p>
        </div>
        {messages.length > 0 && (
          <button className="clear-chat-button" onClick={handleClearChat}>
            <Trash2 size={18} />
            Clear Chat
          </button>
        )}
      </div>

      {downloadProgress && <DownloadProgressCard progress={downloadProgress} />}

      <div className="text-content">
        <div className="model-section">
          <h2 className="section-title">Model Selection</h2>

          <div className="model-selector">
            <label htmlFor="text-model-select">Language Model:</label>
            <select
              id="text-model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-select"
            >
              {textModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.size_mb}MB)
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

        <div className="chat-container">
          <div className="messages-area">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <p>Start a conversation with the AI model</p>
                <p className="empty-chat-hint">Type a message below to begin</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
                >
                  <div className="message-header">
                    <span className="message-role">
                      {message.role === 'user' ? 'You' : 'AI'}
                    </span>
                    <span className="message-time">{formatTime(message.timestamp)}</span>
                  </div>
                  <div className="message-content">{message.content}</div>
                </div>
              ))
            )}
            {isGenerating && (
              <div className="message assistant-message generating">
                <div className="message-header">
                  <span className="message-role">AI</span>
                </div>
                <div className="message-content">
                  <span className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <textarea
              className="message-input"
              placeholder="Type your message... (Shift+Enter for new line)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!pipeline || isGenerating}
              rows={3}
            />
            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={!pipeline || !inputText.trim() || isGenerating}
            >
              <Send size={20} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
    </AnimatedPage>
  );
};

export default TextApp;
