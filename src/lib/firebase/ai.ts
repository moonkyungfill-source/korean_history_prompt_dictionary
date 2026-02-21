/**
 * Firebase AI Logic - Server-side AI service
 * Uses @google/genai SDK with Application Default Credentials
 * for Imagen image generation
 */
import { GoogleGenAI, Modality } from '@google/genai';

let _genai: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!_genai) {
    // Use Firebase API key (same key Firebase AI Logic uses on client)
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY is not set');
    }
    _genai = new GoogleGenAI({ apiKey });
  }
  return _genai;
}

export interface ImageGenerationResult {
  imageData: Buffer;
  mimeType: string;
}

/**
 * Generate an image using Imagen model via Firebase AI Logic
 */
export async function generateImageWithImagen(
  prompt: string
): Promise<ImageGenerationResult> {
  const ai = getGenAI();

  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt,
    config: {
      numberOfImages: 1,
    },
  });

  const image = response.generatedImages?.[0];
  if (!image?.image?.imageBytes) {
    throw new Error('No image generated');
  }

  return {
    imageData: Buffer.from(image.image.imageBytes, 'base64'),
    mimeType: 'image/png',
  };
}

/**
 * Generate an image using Gemini model (supports text+image output)
 */
export async function generateImageWithGemini(
  prompt: string
): Promise<ImageGenerationResult> {
  const ai = getGenAI();

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt,
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) {
    throw new Error('No response from Gemini');
  }

  for (const part of parts) {
    if (part.inlineData?.data) {
      return {
        imageData: Buffer.from(part.inlineData.data, 'base64'),
        mimeType: part.inlineData.mimeType || 'image/png',
      };
    }
  }

  throw new Error('No image in Gemini response');
}
