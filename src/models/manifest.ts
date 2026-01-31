import { ModelWithScore, VoiceModel, TextModel, ImageModel } from './types';

/**
 * Helper function to calculate total requirements score for sorting
 * Score = min_ram_gb + (min_vram_mb / 2)
 */
function calculateRequirementsScore(min_ram_gb: number, min_vram_mb: number): number {
  return min_ram_gb + min_vram_mb / 2;
}

/**
 * Voice - ASR Models
 */
const voiceASRModels: VoiceModel[] = [
  {
    id: 'whisper-tiny',
    name: 'Whisper Tiny',
    modality: 'voice',
    task: 'asr',
    size_mb: 39,
    min_ram_gb: 2,
    min_vram_mb: 0,
    quantization: 'q8',
    description: 'Whisper model for automatic speech recognition (ASR). Lightest variant, suitable for resource-constrained environments.',
    download_url: 'https://huggingface.co/Xenova/whisper-tiny',
    supports_webgpu: true,
  },
  {
    id: 'whisper-small',
    name: 'Whisper Small',
    modality: 'voice',
    task: 'asr',
    size_mb: 244,
    min_ram_gb: 4,
    min_vram_mb: 0,
    quantization: 'q8',
    description: 'Whisper small variant for ASR with improved accuracy over tiny.',
    download_url: 'https://huggingface.co/Xenova/whisper-small',
    supports_webgpu: true,
  },
  {
    id: 'whisper-medium',
    name: 'Whisper Medium',
    modality: 'voice',
    task: 'asr',
    size_mb: 769,
    min_ram_gb: 8,
    min_vram_mb: 2048,
    quantization: 'q8',
    description: 'Whisper medium variant for ASR with higher accuracy and larger model size.',
    download_url: 'https://huggingface.co/Xenova/whisper-medium',
    supports_webgpu: true,
  },
];

/**
 * Voice - TTS Models
 */
const voiceTTSModels: VoiceModel[] = [
  {
    id: 'speecht5',
    name: 'SpeechT5',
    modality: 'voice',
    task: 'tts',
    size_mb: 100,
    min_ram_gb: 2,
    min_vram_mb: 0,
    quantization: 'q8',
    description: 'SpeechT5 model for text-to-speech synthesis. Supports multiple voices and languages.',
    download_url: 'https://huggingface.co/Xenova/speecht5_tts',
    supports_webgpu: true,
  },
  {
    id: 'kokoro-82m',
    name: 'Kokoro-82M',
    modality: 'voice',
    task: 'tts',
    size_mb: 50,
    min_ram_gb: 1,
    min_vram_mb: 0,
    quantization: 'q8',
    description: 'Kokoro lightweight TTS model optimized for edge deployment.',
    download_url: 'https://huggingface.co/hexgrad/Kokoro-82M',
    supports_webgpu: true,
  },
];

/**
 * Text Models (LLMs)
 */
const textModels: TextModel[] = [
  {
    id: 'smollm2-135m',
    name: 'SmolLM2-135M',
    modality: 'text',
    task: 'generation',
    size_mb: 100,
    min_ram_gb: 2,
    min_vram_mb: 0,
    quantization: 'q8',
    description: 'SmolLM2 135M parameter model for text generation. Lightweight and fast.',
    download_url: 'https://huggingface.co/Xenova/smollm2-135m',
    supports_webgpu: true,
  },
  {
    id: 'gpt-2',
    name: 'GPT-2',
    modality: 'text',
    task: 'generation',
    size_mb: 300,
    min_ram_gb: 4,
    min_vram_mb: 0,
    quantization: 'q8',
    description: 'GPT-2 model for text generation. Classic and widely used.',
    download_url: 'https://huggingface.co/Xenova/gpt2',
    supports_webgpu: true,
  },
  {
    id: 'llama-3.2-1b',
    name: 'Llama 3.2 1B',
    modality: 'text',
    task: 'generation',
    size_mb: 512,
    min_ram_gb: 4,
    min_vram_mb: 2048,
    quantization: 'q4',
    description: 'Llama 3.2 1B parameter model for text generation. Requires GPU acceleration.',
    download_url: 'https://huggingface.co/Xenova/Llama-3.2-1B',
    supports_webgpu: true,
  },
  {
    id: 'qwen3-0.6b',
    name: 'Qwen3 0.6B',
    modality: 'text',
    task: 'generation',
    size_mb: 600,
    min_ram_gb: 4,
    min_vram_mb: 2048,
    quantization: 'q4',
    description: 'Qwen3 0.6B parameter model for text generation with GPU support.',
    download_url: 'https://huggingface.co/Xenova/Qwen3-0.6B',
    supports_webgpu: true,
  },
  {
    id: 'tinyllama-1.1b',
    name: 'TinyLlama 1.1B',
    modality: 'text',
    task: 'generation',
    size_mb: 600,
    min_ram_gb: 4,
    min_vram_mb: 2048,
    quantization: 'q4',
    description: 'TinyLlama 1.1B parameter model optimized for efficiency and speed.',
    download_url: 'https://huggingface.co/Xenova/TinyLlama-1.1B',
    supports_webgpu: true,
  },
];

/**
 * Image Models
 */
const imageModels: ImageModel[] = [
  {
    id: 'mobilenetv4',
    name: 'MobileNetV4',
    modality: 'image',
    task: 'classification',
    size_mb: 50,
    min_ram_gb: 2,
    min_vram_mb: 0,
    quantization: 'q8',
    description: 'MobileNetV4 for efficient image classification. Lightweight and fast.',
    download_url: 'https://huggingface.co/Xenova/mobilenetv4',
    supports_webgpu: true,
  },
  {
    id: 'clip',
    name: 'CLIP',
    modality: 'image',
    task: 'understanding',
    size_mb: 200,
    min_ram_gb: 2,
    min_vram_mb: 0,
    quantization: 'q8',
    description: 'CLIP model for image-text understanding and similarity matching.',
    download_url: 'https://huggingface.co/Xenova/clip-vit-base-patch32',
    supports_webgpu: true,
  },
  {
    id: 'florence-2-base',
    name: 'Florence-2 Base',
    modality: 'image',
    task: 'understanding',
    size_mb: 300,
    min_ram_gb: 4,
    min_vram_mb: 2048,
    quantization: 'q8',
    description: 'Florence-2 base model for comprehensive image understanding. Requires GPU.',
    download_url: 'https://huggingface.co/Xenova/Florence-2-base',
    supports_webgpu: true,
  },
  {
    id: 'dinov2',
    name: 'DINOv2',
    modality: 'image',
    task: 'embeddings',
    size_mb: 400,
    min_ram_gb: 4,
    min_vram_mb: 2048,
    quantization: 'q8',
    description: 'DINOv2 model for generating high-quality image embeddings. Requires GPU.',
    download_url: 'https://huggingface.co/Xenova/dinov2-base',
    supports_webgpu: true,
  },
];

/**
 * Complete model manifest
 * Combines all models with computed requirements score
 */
const allModels = [
  ...voiceASRModels,
  ...voiceTTSModels,
  ...textModels,
  ...imageModels,
].map((model) => ({
  ...model,
  total_requirements_score: calculateRequirementsScore(model.min_ram_gb, model.min_vram_mb),
})) as ModelWithScore[];

export default allModels;

export {
  voiceASRModels,
  voiceTTSModels,
  textModels,
  imageModels,
  allModels,
};
