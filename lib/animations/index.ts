/**
 * Animation Utility Hooks
 *
 * Reusable animation hooks for consistent micro-interactions across the app.
 *
 * @example
 * ```tsx
 * import { useScaleAnimation, useShakeAnimation } from '@/lib/animations';
 *
 * function MyButton() {
 *   const { animatedStyle, onPressIn, onPressOut } = useScaleAnimation();
 *
 *   return (
 *     <Animated.View style={animatedStyle}>
 *       <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
 *         <Text>Press Me</Text>
 *       </Pressable>
 *     </Animated.View>
 *   );
 * }
 * ```
 */

// Scale Animation - Press feedback
export { useScaleAnimation, type ScaleAnimationConfig, type ScaleAnimationReturn } from './useScaleAnimation';

// Shake Animation - Error feedback
export { useShakeAnimation, type ShakeAnimationConfig, type ShakeAnimationReturn } from './useShakeAnimation';

// Fade Animation - Enter/exit transitions
export { useFadeAnimation, type FadeAnimationConfig, type FadeAnimationReturn } from './useFadeAnimation';
