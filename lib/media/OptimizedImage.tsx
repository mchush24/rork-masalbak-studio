/**
 * OptimizedImage Component & Utilities
 * Phase 4: Performance Enhancement
 *
 * Image optimization with:
 * - Progressive loading with blur placeholder
 * - Automatic caching
 * - Lazy loading
 * - Error fallback
 * - Resize/quality optimization
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  ImageProps,
  ImageSourcePropType,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  Platform,
  PixelRatio,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as FileSystem from 'expo-file-system';
import { Colors } from '@/constants/colors';
import { radius } from '@/constants/design-system';

// Cache directory
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IMAGE_CACHE_DIR = `${(FileSystem as any).cacheDirectory}images/`;

// Ensure cache directory exists
async function ensureCacheDir() {
  const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGE_CACHE_DIR, { intermediates: true });
  }
}

// Generate cache key from URL
function getCacheKey(uri: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < uri.length; i++) {
    const char = uri.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `img_${Math.abs(hash)}`;
}

// Get cached image path
function getCachePath(uri: string): string {
  const key = getCacheKey(uri);
  const extension = uri.split('.').pop()?.split('?')[0] || 'jpg';
  return `${IMAGE_CACHE_DIR}${key}.${extension}`;
}

// Image cache manager
class ImageCacheManager {
  private static instance: ImageCacheManager;
  private cache: Map<string, string> = new Map();
  private pendingDownloads: Map<string, Promise<string>> = new Map();

  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  async getCachedUri(uri: string): Promise<string> {
    // Return from memory cache if available
    if (this.cache.has(uri)) {
      return this.cache.get(uri)!;
    }

    // Check if download is in progress
    if (this.pendingDownloads.has(uri)) {
      return this.pendingDownloads.get(uri)!;
    }

    const cachePath = getCachePath(uri);

    // Check if file exists in disk cache
    const fileInfo = await FileSystem.getInfoAsync(cachePath);
    if (fileInfo.exists) {
      this.cache.set(uri, cachePath);
      return cachePath;
    }

    // Download and cache
    const downloadPromise = this.downloadAndCache(uri, cachePath);
    this.pendingDownloads.set(uri, downloadPromise);

    try {
      const result = await downloadPromise;
      this.pendingDownloads.delete(uri);
      return result;
    } catch (error) {
      this.pendingDownloads.delete(uri);
      throw error;
    }
  }

  private async downloadAndCache(uri: string, cachePath: string): Promise<string> {
    await ensureCacheDir();

    try {
      const downloadResult = await FileSystem.downloadAsync(uri, cachePath);
      if (downloadResult.status === 200) {
        this.cache.set(uri, cachePath);
        return cachePath;
      }
      throw new Error(`Download failed with status ${downloadResult.status}`);
    } catch (error) {
      // Return original URI on failure
      console.warn('[ImageCache] Download failed:', error);
      return uri;
    }
  }

  async clearCache(): Promise<void> {
    this.cache.clear();
    try {
      await FileSystem.deleteAsync(IMAGE_CACHE_DIR, { idempotent: true });
      await ensureCacheDir();
    } catch (error) {
      console.warn('[ImageCache] Clear failed:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
      if (dirInfo.exists && 'size' in dirInfo) {
        return dirInfo.size || 0;
      }
    } catch (error) {
      console.warn('[ImageCache] Size check failed:', error);
    }
    return 0;
  }
}

export const imageCache = ImageCacheManager.getInstance();

// Hook for cached images
export function useCachedImage(uri: string | undefined) {
  const [cachedUri, setCachedUri] = useState<string | undefined>(uri);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uri) {
      setIsLoading(false);
      return;
    }

    // Skip caching for local files and data URIs
    if (uri.startsWith('file://') || uri.startsWith('data:')) {
      setCachedUri(uri);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function loadCached() {
      try {
        const cached = await imageCache.getCachedUri(uri!);
        if (mounted) {
          setCachedUri(cached);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Cache failed'));
          setCachedUri(uri); // Fallback to original
          setIsLoading(false);
        }
      }
    }

    loadCached();

    return () => {
      mounted = false;
    };
  }, [uri]);

  return { cachedUri, isLoading, error };
}

// Optimized Image Component
interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  /** Image source (URI or require) */
  source: ImageSourcePropType | { uri: string };
  /** Placeholder color */
  placeholderColor?: string;
  /** Show blur placeholder during load */
  showPlaceholder?: boolean;
  /** Blur intensity for placeholder */
  blurIntensity?: number;
  /** Enable caching */
  enableCache?: boolean;
  /** Fallback component on error */
  fallback?: React.ReactNode;
  /** Container style */
  containerStyle?: ViewStyle;
  /** Fade in duration (ms) */
  fadeDuration?: number;
  /** Priority loading */
  priority?: 'low' | 'normal' | 'high';
}

export function OptimizedImage({
  source,
  placeholderColor = Colors.neutral.lighter,
  showPlaceholder = true,
  blurIntensity = 50,
  enableCache = true,
  fallback,
  containerStyle,
  fadeDuration = 300,
  priority: _priority = 'normal',
  style,
  onLoad,
  onError,
  ...imageProps
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const opacity = useSharedValue(0);

  // Get URI from source
  const uri = useMemo(() => {
    if (typeof source === 'object' && 'uri' in source) {
      return source.uri;
    }
    return undefined;
  }, [source]);

  // Use cached URI
  const { cachedUri, isLoading: _isCaching } = useCachedImage(enableCache && uri ? uri : undefined);

  // Final source
  const finalSource = useMemo(() => {
    if (uri && enableCache && cachedUri) {
      return { uri: cachedUri };
    }
    return source;
  }, [source, uri, enableCache, cachedUri]);

  // Handle load complete
  const handleLoad = useCallback(
    (event: unknown) => {
      setIsLoaded(true);
      opacity.value = withTiming(1, {
        duration: fadeDuration,
        easing: Easing.out(Easing.ease),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onLoad?.(event as any);
    },
    [fadeDuration, opacity, onLoad]
  );

  // Handle error
  const handleError = useCallback(
    (event: unknown) => {
      setHasError(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError?.(event as any);
    },
    [onError]
  );

  // Animated style for fade in
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Error fallback
  if (hasError && fallback) {
    return <View style={[styles.container, containerStyle]}>{fallback}</View>;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Placeholder */}
      {showPlaceholder && !isLoaded && (
        <View style={[styles.placeholder, { backgroundColor: placeholderColor }]}>
          {Platform.OS !== 'web' && (
            <BlurView intensity={blurIntensity} tint="light" style={StyleSheet.absoluteFill} />
          )}
        </View>
      )}

      {/* Image */}
      <Animated.Image
        source={finalSource}
        style={[styles.image, style as ImageStyle, animatedStyle]}
        onLoad={handleLoad}
        onError={handleError}
        {...imageProps}
      />
    </View>
  );
}

// Avatar Image with fallback
interface AvatarImageProps {
  source?: { uri: string } | null;
  size?: number;
  fallbackText?: string;
  style?: ViewStyle;
}

export function AvatarImage({ source, size = 48, fallbackText, style }: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);

  const initials = useMemo(() => {
    if (!fallbackText) return '?';
    return fallbackText
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [fallbackText]);

  if (!source?.uri || hasError) {
    return (
      <View
        style={[
          styles.avatarFallback,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style,
        ]}
      >
        <Animated.Text style={[styles.avatarFallbackText, { fontSize: size * 0.4 }]}>
          {initials}
        </Animated.Text>
      </View>
    );
  }

  return (
    <OptimizedImage
      source={source}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style as ImageStyle,
      ]}
      containerStyle={{ width: size, height: size, borderRadius: size / 2 }}
      onError={() => setHasError(true)}
      showPlaceholder
    />
  );
}

// Thumbnail with aspect ratio
interface ThumbnailProps {
  source: { uri: string };
  aspectRatio?: number;
  width?: number | '100%';
  borderRadius?: number;
  style?: ViewStyle;
}

export function Thumbnail({
  source,
  aspectRatio = 1,
  width = '100%',
  borderRadius = radius.lg,
  style,
}: ThumbnailProps) {
  return (
    <View
      style={[
        styles.thumbnailContainer,
        {
          width,
          aspectRatio,
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <OptimizedImage source={source} style={styles.thumbnailImage} resizeMode="cover" />
    </View>
  );
}

// Utility: Get optimized image dimensions
export function getOptimizedDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight?: number
): { width: number; height: number } {
  const pixelRatio = PixelRatio.get();
  const targetWidth = maxWidth * pixelRatio;
  const targetHeight = maxHeight ? maxHeight * pixelRatio : Infinity;

  const widthRatio = targetWidth / originalWidth;
  const heightRatio = targetHeight / originalHeight;
  const ratio = Math.min(widthRatio, heightRatio, 1);

  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
}

// Utility: Build optimized image URL (for services that support it)
export function buildOptimizedUrl(baseUrl: string, width: number, quality: number = 80): string {
  // This is a placeholder - implement based on your image service
  // Examples: Cloudinary, Imgix, Supabase Storage transforms

  // Supabase Storage transform example:
  if (baseUrl.includes('supabase')) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}width=${width}&quality=${quality}`;
  }

  return baseUrl;
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    backgroundColor: Colors.secondary.lavenderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: Colors.secondary.lavender,
    fontWeight: '700',
  },
  thumbnailContainer: {
    backgroundColor: Colors.neutral.lighter,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});

export default OptimizedImage;
