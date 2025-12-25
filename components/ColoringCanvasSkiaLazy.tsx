/**
 * Lazy-loaded Skia Canvas
 * Sadece kullanıcı boyama ekranına girdiğinde yüklenir
 */
import { lazy, Suspense } from 'react';
import { View, ActivityIndicator } from 'react-native';

// Lazy load - Skia sadece gerektiğinde yüklenir
const ColoringCanvasSkia = lazy(() =>
  import('./ColoringCanvasSkia').then(module => ({
    default: module.ColoringCanvasSkia
  }))
);

export function ColoringCanvasSkiaLazy(props: any) {
  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      }
    >
      <ColoringCanvasSkia {...props} />
    </Suspense>
  );
}
