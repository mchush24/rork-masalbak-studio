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

// HEIC magic bytes patterns (ftyp followed by heic, heif, mif1, msf1)
const HEIC_MAGIC_PATTERNS = ['ftyp', 'heic', 'heif', 'mif1', 'msf1'];

/**
 * Check if a URI points to a HEIC/HEIF image
 */
function isHeicImage(uri: string): boolean {
  // Check file extension
  const hasHeicExtension = HEIC_EXTENSIONS.some(ext => uri.toLowerCase().endsWith(ext.toLowerCase()));

  // On iOS, images from photo library often have PHAsset URLs without clear extensions
  // They may still be HEIC format internally
  const isIosPhotoLibrary = Platform.OS === 'ios' && (
    uri.includes('ph://') ||
    uri.includes('assets-library://') ||
    uri.includes('/var/mobile/')
  );

  return hasHeicExtension || isIosPhotoLibrary;
}

/**
 * Convert image blob to JPEG using Canvas API (web only)
 */
async function convertBlobToJpegWeb(blobUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image onto canvas (this converts any format to bitmap)
        ctx.drawImage(img, 0, 0);

        // Export as JPEG data URL
        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        console.log('[Preprocess] Web conversion complete');
        resolve(jpegDataUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for conversion'));
    };

    img.src = blobUrl;
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

  // Handle web platform
  if (Platform.OS === 'web') {
    console.log('[Preprocess] Web platform - checking if conversion needed');

    try {
      // For blob URLs or data URLs, check if the content is HEIC
      if (uri.startsWith('blob:') || uri.startsWith('data:')) {
        // Fetch the blob to check its contents
        const response = await fetch(uri);
        const blob = await response.blob();

        // Check MIME type first
        const mimeType = blob.type.toLowerCase();
        const isHeicMime = mimeType.includes('heic') || mimeType.includes('heif');

        // If MIME type indicates HEIC, or if it's empty/unknown, check the bytes
        let needsConversion = isHeicMime;

        if (!needsConversion && (!mimeType || mimeType === 'application/octet-stream' || mimeType === '')) {
          // Read first bytes to detect HEIC format
          const arrayBuffer = await blob.slice(0, 32).arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          const header = String.fromCharCode(...bytes);
          needsConversion = HEIC_MAGIC_PATTERNS.some(pattern => header.includes(pattern));
        }

        if (needsConversion) {
          console.log('[Preprocess] HEIC detected on web - converting via Canvas');
          // The browser's Image element can often decode HEIC if the OS supports it
          // (macOS Safari, iOS Safari). Convert via Canvas to ensure JPEG output.
          const jpegDataUrl = await convertBlobToJpegWeb(uri);
          return jpegDataUrl;
        }
      }

      // If not HEIC or already a supported format, return as-is
      console.log('[Preprocess] Web - format OK, no conversion needed');
      return uri;
    } catch (error) {
      console.warn('[Preprocess] Web conversion check failed:', error);
      // Fall through to return original URI
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
