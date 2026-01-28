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
 * Preprocess image for API compatibility
 * - Converts HEIC/HEIF to JPEG
 * - Ensures reasonable file size
 * - Returns a URI that can be safely converted to base64
 */
export async function preprocessImage(uri: string): Promise<string> {
  console.log('[Preprocess] Processing image:', uri);

  // Skip processing on web - browser handles formats automatically
  if (Platform.OS === 'web') {
    console.log('[Preprocess] Web platform - skipping conversion');
    return uri;
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
