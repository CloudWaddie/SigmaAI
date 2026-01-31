/**
 * Navigator type extensions for experimental browser APIs
 * These are not yet in TypeScript's standard lib definitions
 */

interface Navigator {
  /** WebGPU API for hardware-accelerated graphics and compute */
  gpu?: {
    requestAdapter(): Promise<GPUAdapter | null>;
  };
  
  /** Device Memory API - returns approximate RAM in GB */
  deviceMemory?: number;
}

/** Minimal GPUAdapter interface for WebGPU detection */
interface GPUAdapter {
  readonly features: any;
  readonly limits: any;
  readonly isFallbackAdapter: boolean;
}
