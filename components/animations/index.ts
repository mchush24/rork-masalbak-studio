/**
 * Animation Components Export
 */

export {
  SuccessAnimation,
  ErrorAnimation,
  PulseAnimation,
  ConfettiAnimation,
  SparkleAnimation,
  HeartBeatAnimation,
  useButtonAnimation,
} from './MicroInteractions';

export type { AnimationType } from './MicroInteractions';

export { CelebrationOverlay } from './CelebrationOverlay';
export type { CelebrationType } from './CelebrationOverlay';

// Phase 10: Feature Card Animations
export {
  StaggeredEntrance,
  IdleBreathing,
  AttentionPulse,
  NewBadge,
  PremiumIndicator,
  RippleEffect,
  SuccessFlash,
  IconMicroRotation,
} from './FeatureCardAnimations';

// Phase 11: Form Animations
export {
  AnimatedInput,
  PasswordStrengthBar,
  CharacterCounter,
  FormStepIndicator,
  SubmitButtonAnimated,
} from './FormAnimations';

// Phase 12: Navigation Animations
export {
  ScreenTransition,
  TabIconAnimated,
  TabBarAnimated,
  ModalTransition,
  SharedElement,
  PageIndicator,
  SwipeableScreen,
  HeaderAnimated,
  screenEntering,
  screenExiting,
} from './NavigationAnimations';

// Phase 15: Standardized Micro-interactions
export { AnimatedPressable } from './AnimatedPressable';
export { StaggeredList, StaggeredItem } from './StaggeredList';
export { SuccessAnimation as StateAnimation } from './SuccessAnimation';
export { Skeleton, SkeletonText, SkeletonCard, SkeletonList } from './Skeleton';
export { Confetti, Stars, Sparkle } from './Celebration';

// Animation constants re-export
export {
  duration,
  spring,
  easing,
  transforms,
  entrance,
  exit,
  stagger,
  haptics,
  skeleton,
  celebration,
  pullToRefresh,
} from '@/constants/animations';
