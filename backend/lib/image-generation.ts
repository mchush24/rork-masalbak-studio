/**
 * Image Generation Module
 *
 * Supports multiple AI image generation providers:
 * - DALL-E 3 (OpenAI) - High quality but expensive, inconsistent characters
 * - Flux.1 (FAL.ai) - Faster, cheaper, better consistency with seed parameter
 */

import OpenAI from "openai";
import * as fal from "@fal-ai/serverless-client";

const oai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize FAL client
fal.config({
  credentials: process.env.FAL_API_KEY,
});

export type ImageProvider = 'dalle3' | 'flux1';

export interface ImageGenerationOptions {
  prompt: string;
  provider?: ImageProvider;
  seed?: number; // For consistency across pages
  pageNumber?: number;
  totalPages?: number;
}

/**
 * Generate image using DALL-E 3
 */
async function generateWithDallE3(prompt: string): Promise<Buffer> {
  console.log("[ImageGen] Using DALL-E 3");
  console.log("[ImageGen] Prompt:", prompt.substring(0, 150) + "...");

  const img = await oai.images.generate({
    model: "dall-e-3",
    prompt: prompt,
    size: "1024x1024",
    quality: "standard",
    response_format: "b64_json"
  });

  if (!img.data || !img.data[0]) {
    throw new Error("No image data returned from DALL-E 3");
  }

  const b64 = img.data[0].b64_json;
  if (!b64) {
    console.error("[ImageGen] No b64_json, trying URL fallback");
    const url = img.data[0].url;
    if (url) {
      const res = await fetch(url);
      return Buffer.from(await res.arrayBuffer());
    }
    throw new Error("No image data from DALL-E 3");
  }

  return Buffer.from(b64, "base64");
}

/**
 * Generate image using Flux.1 via FAL.ai
 *
 * Advantages:
 * - 13x cheaper ($0.003 vs $0.040)
 * - 3x faster (3-5 sec vs 15 sec)
 * - Better consistency with seed parameter
 * - Same character across all pages
 */
async function generateWithFlux1(
  prompt: string,
  seed: number = 42
): Promise<Buffer> {
  console.log("[ImageGen] Using Flux.1 via FAL.ai");
  console.log("[ImageGen] Seed:", seed, "(using same seed for consistency)");
  console.log("[ImageGen] Prompt:", prompt.substring(0, 150) + "...");

  try {
    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: prompt,
        seed: seed,
        num_images: 1,
        image_size: "square_hd", // 1024x1024
        enable_safety_checker: true,
        safety_tolerance: "2", // Moderate tolerance for children's content
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("[ImageGen] Flux.1 progress:", update.logs?.map(log => log.message).join(" "));
        }
      },
    }) as any;

    if (!result.images || result.images.length === 0) {
      throw new Error("No image returned from Flux.1");
    }

    const imageUrl = result.images[0].url;
    console.log("[ImageGen] Flux.1 image URL:", imageUrl);

    // Fetch the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch Flux.1 image: ${response.statusText}`);
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error("[ImageGen] Flux.1 error:", error);
    throw new Error(`Flux.1 generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main image generation function
 *
 * @param options - Image generation options
 * @returns Buffer containing the image data
 */
export async function generateImage(options: ImageGenerationOptions): Promise<Buffer> {
  const provider = options.provider || 'flux1'; // Default to Flux.1 for better consistency
  const seed = options.seed || 42; // Default seed for consistency

  console.log(`[ImageGen] Generating image ${options.pageNumber || '?'}/${options.totalPages || '?'}`);
  console.log(`[ImageGen] Provider: ${provider.toUpperCase()}`);

  const startTime = Date.now();

  let buffer: Buffer;
  if (provider === 'dalle3') {
    buffer = await generateWithDallE3(options.prompt);
  } else {
    buffer = await generateWithFlux1(options.prompt, seed);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[ImageGen] ✅ Image generated in ${duration}s`);

  return buffer;
}

/**
 * Get cost estimate for generating images
 */
export function estimateCost(pageCount: number, provider: ImageProvider): number {
  const costs = {
    dalle3: 0.040,
    flux1: 0.003,
  };

  return pageCount * costs[provider];
}

/**
 * Get recommended provider based on use case
 */
export function getRecommendedProvider(useCase: 'consistency' | 'quality' | 'speed' | 'cost'): ImageProvider {
  switch (useCase) {
    case 'consistency':
      return 'flux1'; // Better character consistency with seed
    case 'quality':
      return 'dalle3'; // Highest quality (but inconsistent)
    case 'speed':
      return 'flux1'; // 3-5 sec vs 15 sec
    case 'cost':
      return 'flux1'; // 13x cheaper
    default:
      return 'flux1';
  }
}

/**
 * Generate a consistent seed for a storybook
 * Same seed = same character style across all pages
 */
export function generateStorybookSeed(userId: string, timestamp: number): number {
  // Create a consistent seed based on user ID and timestamp
  const hash = userId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  return (hash + timestamp) % 999999;
}
