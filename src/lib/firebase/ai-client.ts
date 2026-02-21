/**
 * Firebase AI Logic - Client-side AI service
 * Uses firebase/ai SDK for direct client-side AI access
 */
import { getAI, getImagenModel, GoogleAIBackend } from 'firebase/ai';
import { getApp } from 'firebase/app';

let _aiBackend: ReturnType<typeof getAI> | null = null;

function getAIBackend() {
  if (!_aiBackend) {
    const app = getApp();
    _aiBackend = getAI(app, { backend: new GoogleAIBackend() });
  }
  return _aiBackend;
}

/**
 * Get Imagen model for client-side image generation
 */
export function getClientImagenModel() {
  const ai = getAIBackend();
  return getImagenModel(ai, { model: 'imagen-3.0-generate-002' });
}
