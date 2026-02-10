/**
 * Image Optimizer
 * Phase 19: Performance Optimization
 *
 * Optimized image loading with:
 * - Lazy loading
 * - Progressive loading
 * - Caching
 * - Placeholder support
 */

import React, { useState, useCallback, useEffect, memo, useRef } from 'react';
import {
  Image,
  ImageProps,
  ImageSourcePropType,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: ImageSourcePropType;
  placeholder?: ImageSourcePropType;
  fallback?: ImageSourcePropType;
  priority?: 'low' | 'normal' | 'high';
  fadeIn?: boolean;
  fadeDuration?: number;
  showLoader?: boolean;
  loaderColor?: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
}

// Image cache for in-memory caching
const imageCache = new Map<string, boolean>();

/**
 * Optimized Image component with lazy loading and caching
 */
export const OptimizedImage = memo(function OptimizedImage({
  source,
  placeholder,
  fallback,
  priority = 'normal',
  fadeIn = true,
  fadeDuration = 300,
  showLoader = true,
  loaderColor = Colors.secondary.lavender,
  onLoadStart,
  onLoadEnd,
  onError,
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(priority === 'high');
  const opacity = useSharedValue(fadeIn ? 0 : 1);
  const mountedRef = useRef(true);

  // Get cache key from source
  const getCacheKey = useCallback(() => {
    if (typeof source === 'number') return `local_${source}`;
    if (typeof source === 'object' && 'uri' in source) return source.uri || '';
    return '';
  }, [source]);

  // Check if image is cached
  const isCached = imageCache.has(getCacheKey());

  useEffect(() => {
    mountedRef.current = true;
    
    // Lazy load based on priority
    if (priority !== 'high' && !isCached) {
      const delay = priority === 'low' ? 500 : 100;
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          setIsVisible(true);
        }
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [priority, isCached]);

  const handleLoadStart = useCallback(() => {
    if (mountedRef.current) {
      setIsLoading(true);
      onLoadStart?.();
    }
  }, [onLoadStart]);

  const handleLoadEnd = useCallback(() => {
    if (mountedRef.current) {
      setIsLoading(false);
      const cacheKey = getCacheKey();
      if (cacheKey) {
        imageCache.set(cacheKey, true);
      }
      if (fadeIn) {
        opacity.value = withTiming(1, { duration: fadeDuration });
      }
      onLoadEnd?.();
    }
  }, [fadeIn, fadeDuration, onLoadEnd, getCacheKey]);

  const handleError = useCallback(() => {
    if (mountedRef.current) {
      setIsLoading(false);
      setHasError(true);
      onError?.();
    }
  }, [onError]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Determine which source to use
  const imageSource = hasError && fallback ? fallback : source;
  const showPlaceholder = isLoading && placeholder && !isCached;

  if (!isVisible) {
    return (
      <View style={[styles.container, style]}>
        {showLoader && (
          <ActivityIndicator size="small" color={loaderColor} />
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Placeholder */}
      {showPlaceholder && (
        <Image
          source={placeholder}
          style={[StyleSheet.absoluteFill, styles.placeholder]}
          blurRadius={Platform.OS === 'ios' ? 10 : 5}
        />
      )}

      {/* Loading indicator */}
      {isLoading && showLoader && !showPlaceholder && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={loaderColor} />
        </View>
      )}

      {/* Main image */}
      <Animated.Image
        {...props}
        source={imageSource}
        style={[StyleSheet.absoluteFill, fadeIn && animatedStyle]}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
    </View>
  );
});

/**
 * Hook for preloading images
 */
export function useImagePreloader() {
  const preloadImage = useCallback(async (uri: string): Promise<boolean> => {
    if (imageCache.has(uri)) {
      return true;
    }

    return new Promise((resolve) => {
      Image.prefetch(uri)
        .then(() => {
          imageCache.set(uri, true);
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }, []);

  const preloadImages = useCallback(async (uris: string[]): Promise<boolean[]> => {
    return Promise.all(uris.map(preloadImage));
  }, [preloadImage]);

  const isImageCached = useCallback((uri: string): boolean => {
    return imageCache.has(uri);
  }, []);

  const clearCache = useCallback(() => {
    imageCache.clear();
  }, []);

  const getCacheSize = useCallback((): number => {
    return imageCache.size;
  }, []);

  return {
    preloadImage,
    preloadImages,
    isImageCached,
    clearCache,
    getCacheSize,
  };
}

/**
 * Preload critical images on app start
 */
export async function preloadCriticalImages(uris: string[]): Promise<void> {
  await Promise.all(
    uris.map((uri) =>
      Image.prefetch(uri).catch(() => {
        console.warn(`Failed to preload image: ${uri}`);
      })
    )
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Colors.neutral.lighter,
  },
  placeholder: {
    resizeMode: 'cover',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
