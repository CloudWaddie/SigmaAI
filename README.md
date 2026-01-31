# Sigma AI - Multi-Modal Browser AI App

A stunning browser-based AI application featuring Voice, Image, and Text AI models running entirely in your browser using Transformers.js.

## Features

- **Voice App**: Speech-to-text (Whisper) and text-to-speech (SpeechT5)
- **Image App**: Image analysis with CLIP, Florence-2, and other vision models
- **Text App**: Chat interface with language models (SmolLM2, GPT-2, Llama, etc.)
- **Model Browser**: Browse, filter, and sort 13+ AI models
- **On-Demand Downloads**: Download models only when needed
- **Progress Tracking**: Real-time download progress with speed and ETA
- **Cache Management**: View and manage cached models
- **Hardware Detection**: Automatic WebGPU/WASM backend selection
- **Offline-First**: Full functionality after initial model download
- **Beautiful UI**: GSAP animations throughout

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
sigma-ai/
├── src/
│   ├── apps/           # Modality apps (Voice, Image, Text)
│   ├── components/     # Reusable components
│   ├── services/       # Core services (download, cache, hardware)
│   ├── models/         # Model manifest and types
│   └── styles/         # Component styles
```

## Available Models

### Voice Models (5)
- Whisper Tiny (39MB) - ASR
- Whisper Small (244MB) - ASR
- Whisper Medium (769MB) - ASR
- SpeechT5 (100MB) - TTS
- Kokoro-82M (50MB) - TTS

### Image Models (4)
- MobileNetV4 (50MB) - Classification
- CLIP (200MB) - Zero-shot classification
- Florence-2-base (300MB) - Captioning & detection
- DINOv2 (400MB) - Feature extraction

### Text Models (5)
- SmolLM2-135M (100MB) - Chat
- GPT-2 (300MB) - Text generation
- Llama-3.2-1B (512MB) - Chat
- Qwen3-0.6B (600MB) - Chat
- TinyLlama-1.1B (600MB) - Chat

## Browser Compatibility

- ✅ Chrome/Edge 113+ (WebGPU supported)
- ✅ Safari (WASM fallback)
- ⚠️ Firefox (WASM fallback, WebGPU experimental)

## Hardware Requirements

- **Minimum**: 4GB RAM, dual-core CPU (2015+)
- **Recommended**: 8GB RAM + WebGPU-capable GPU

## Tech Stack

- React 18 + TypeScript
- Vite
- Transformers.js (@huggingface/transformers)
- GSAP (animations)
- React Router
- Lucide React (icons)

## License

MIT

## Credits

Built with [Transformers.js](https://huggingface.co/docs/transformers.js) from Hugging Face.
