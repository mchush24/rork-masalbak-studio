import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

/**
 * HEIC/HEIF formats are not supported by most AI APIs.
 * This function detects HEIC images and converts them to JPEG.
 *
 * Supported output formats: PNG, JPEG, GIF, WEBP
 */

// File extensions that need conversion
const HEIC_EXTENSIONS = ['.heic', '.heif', '.HEIC', '.HEIF'];

// Max dimension (longest side) for uploaded images
const MAX_DIMENSION = 1920;
// JPEG compression quality for uploads
const UPLOAD_JPEG_QUALITY = 0.8;

/**
 * Check if a URI points to a HEIC/HEIF image
 */
function isHeicImage(uri: string): boolean {
  // Check file extension
  const hasHeicExtension = HEIC_EXTENSIONS.some(ext =>
    uri.toLowerCase().endsWith(ext.toLowerCase())
  );

  // On iOS, images from photo library often have PHAsset URLs without clear extensions
  // They may still be HEIC format internally
  const isIosPhotoLibrary =
    Platform.OS === 'ios' &&
    (uri.includes('ph://') || uri.includes('assets-library://') || uri.includes('/var/mobile/'));

  return hasHeicExtension || isIosPhotoLibrary;
}

/**
 * Compress and resize image using Canvas API (web only).
 * Converts any browser-decodable format to JPEG, resizes to MAX_DIMENSION.
 */
async function compressImageWeb(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;

        // Resize if larger than MAX_DIMENSION on either side
        if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const jpegDataUrl = canvas.toDataURL('image/jpeg', UPLOAD_JPEG_QUALITY);
        console.log(
          `[Preprocess] Compressed: ${img.naturalWidth}x${img.naturalHeight} → ${w}x${h}`
        );
        resolve(jpegDataUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = uri;
  });
}

/**
 * Preprocess image for API compatibility
 * - Converts HEIC/HEIF to JPEG
 * - Ensures reasonable file size
 * - Returns a URI that can be safely converted to base64
 */
export async function preprocessImage(uri: string): Promise<string> {
  console.log('[Preprocess] Processing image:', uri);

  // Handle web platform — always compress/resize via Canvas.
  // This handles HEIC conversion (if browser can decode), resizes large images,
  // and converts everything to JPEG to keep payload small.
  if (Platform.OS === 'web') {
    console.log('[Preprocess] Web platform - compressing image');
    try {
      return await compressImageWeb(uri);
    } catch (error) {
      console.warn('[Preprocess] Web compression failed, using original:', error);
      return uri;
    }
  }

  try {
    // Check if conversion is needed
    const needsConversion = isHeicImage(uri);

    if (needsConversion) {
      console.log('[Preprocess] HEIC detected - converting to JPEG');
    }

    // Always process through ImageManipulator to ensure compatibility
    // This handles HEIC conversion and ensures consistent output format
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [], // No transformations needed, just format conversion
      {
        compress: 0.9, // High quality compression
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    console.log('[Preprocess] Conversion complete:', result.uri);
    return result.uri;
  } catch (error) {
    console.warn('[Preprocess] Conversion failed, using original:', error);
    // If conversion fails, return original URI and let the API handle it
    // This is a fallback - the API might still reject it
    return uri;
  }
}

/**
 * Validate that an image format is supported by the API
 */
export function isSupportedFormat(uri: string): boolean {
  const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const lowerUri = uri.toLowerCase();
  return supportedExtensions.some(ext => lowerUri.endsWith(ext));
}

/**
 * Get the MIME type for a supported image format
 */
export function getMimeType(uri: string): string {
  const lowerUri = uri.toLowerCase();

  if (lowerUri.endsWith('.png')) return 'image/png';
  if (lowerUri.endsWith('.gif')) return 'image/gif';
  if (lowerUri.endsWith('.webp')) return 'image/webp';

  // Default to JPEG for .jpg, .jpeg, and unknown formats
  return 'image/jpeg';
}
