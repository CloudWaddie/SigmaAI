/**
 * Model manifest types
 * Defines TypeScript interfaces for AI model metadata and specifications
 */

export type Modality = 'voice' | 'text' | 'image';
export type VoiceTask = 'asr' | 'tts';
export type TextTask = 'generation';
export type ImageTask = 'classification' | 'understanding' | 'embeddings';
export type Task = VoiceTask | TextTask | ImageTask;

/**
 * Quantization levels supported
 */
export type Quantization = 'q4' | 'q8' | 'fp16' | 'fp32';

/**
 * Base model interface with common properties
 */
export interface Model {
  id: string;
  name: string;
  modality: Modality;
  task: Task;
  size_mb: number;
  min_ram_gb: number;
  min_vram_mb: number;
  quantization: Quantization;
  description: string;
  download_url: string;
  supports_webgpu: boolean;
}

/**
 * Computed field for sorting by resource requirements
 */
export interface ModelWithScore extends Model {
  total_requirements_score: number;
}

/**
 * Voice model interface
 */
export interface VoiceModel extends Model {
  modality: 'voice';
  task: VoiceTask;
}

/**
 * Text model interface
 */
export interface TextModel extends Model {
  modality: 'text';
  task: TextTask;
}

/**
 * Image model interface
 */
export interface ImageModel extends Model {
  modality: 'image';
  task: ImageTask;
}
