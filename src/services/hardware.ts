/**
 * Hardware Detection Service
 * Detects WebGPU support, WebGL fallback, RAM availability, and CPU cores
 * Exports utilities for backend selection and model compatibility checking
 */

/**
 * Hardware profile containing detected capabilities and resources
 */
export interface HardwareProfile {
  webgpu: boolean;
  webgl: boolean;
  ram: number; // in GB
  cores: number;
  backend: 'webgpu' | 'wasm';
}

/**
 * Model compatibility check result
 */
export interface CompatibilityResult {
  compatible: boolean;
  reason: string;
}

/**
 * Detect WebGPU support via navigator.gpu and requestAdapter()
 * This is async because WebGPU adapter detection requires Promise-based API
 */
export async function detectWebGPU(): Promise<boolean> {
  if (!navigator.gpu) {
    return false;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    return adapter !== null;
  } catch (error) {
    console.warn('[Hardware] WebGPU detection error:', error);
    return false;
  }
}

/**
 * Detect WebGL support as fallback
 * WebGL 2.0 is widely supported and required for complex shaders
 */
export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return gl !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Detect available RAM in GB
 * Uses navigator.deviceMemory if available, defaults to 4GB
 */
export function detectRAM(): number {
  if (navigator.deviceMemory && navigator.deviceMemory > 0) {
    return navigator.deviceMemory;
  }
  // Fallback to 4GB estimate if API unavailable
  return 4;
}

/**
 * Detect CPU core count
 * Uses navigator.hardwareConcurrency if available
 */
export function detectCPUCores(): number {
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency > 0) {
    return navigator.hardwareConcurrency;
  }
  // Fallback: assume dual-core if API unavailable
  return 2;
}

/**
 * Get complete hardware profile
 * Performs async WebGPU detection and gathers all hardware info
 */
export async function getHardwareProfile(): Promise<HardwareProfile> {
  const webgpu = await detectWebGPU();
  const webgl = detectWebGL();
  const ram = detectRAM();
  const cores = detectCPUCores();

  return {
    webgpu,
    webgl,
    ram,
    cores,
    backend: webgpu ? 'webgpu' : 'wasm',
  };
}

/**
 * Get optimal backend for model execution
 * Returns 'webgpu' if available, otherwise 'wasm'
 * This is a synchronous helper that uses previously detected WebGPU support
 * For fresh detection, use getHardwareProfile() first
 */
export async function getOptimalBackend(): Promise<'webgpu' | 'wasm'> {
  const profile = await getHardwareProfile();
  return profile.backend;
}

/**
 * Model interface for compatibility checking
 * This is a minimal interface that doesn't require importing actual models
 */
export interface Model {
  name: string;
  min_ram_gb?: number;
  min_cores?: number;
  requires_webgpu?: boolean;
}

/**
 * Check if a model is compatible with current hardware
 * Filters by RAM requirements, CPU cores, and WebGPU availability
 */
export async function checkModelCompatibility(
  model: Model,
  profile?: HardwareProfile
): Promise<CompatibilityResult> {
  // Use provided profile or detect current hardware
  const hwProfile = profile || (await getHardwareProfile());

  // Check RAM requirements (default: no minimum)
  if (model.min_ram_gb && hwProfile.ram < model.min_ram_gb) {
    return {
      compatible: false,
      reason: `Model requires ${model.min_ram_gb}GB RAM, but only ${hwProfile.ram}GB available`,
    };
  }

  // Check CPU core requirements (default: no minimum)
  if (model.min_cores && hwProfile.cores < model.min_cores) {
    return {
      compatible: false,
      reason: `Model requires ${model.min_cores} CPU cores, but only ${hwProfile.cores} available`,
    };
  }

  // Check WebGPU requirement
  if (model.requires_webgpu && !hwProfile.webgpu && !hwProfile.webgl) {
    return {
      compatible: false,
      reason: 'Model requires GPU acceleration (WebGPU/WebGL), but none available',
    };
  }

  return {
    compatible: true,
    reason: 'Hardware meets model requirements',
  };
}

/**
 * Log hardware profile to console for debugging
 * Called during app initialization
 */
export async function logHardwareProfile(): Promise<void> {
  try {
    const profile = await getHardwareProfile();
    console.log(
      '[Hardware] Detected profile:',
      {
        webgpu: profile.webgpu ? '✓' : '✗',
        webgl: profile.webgl ? '✓' : '✗',
        ram: `${profile.ram}GB`,
        cores: profile.cores,
        backend: profile.backend.toUpperCase(),
      }
    );
  } catch (error) {
    console.error('[Hardware] Failed to detect profile:', error);
  }
}
