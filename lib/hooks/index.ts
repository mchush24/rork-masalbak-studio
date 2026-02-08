/**
 * Custom Hooks Export
 *
 * Central export point for all custom hooks
 */

// Authentication
export { useAuth } from './useAuth';
export type { UserSession, Child } from './useAuth';

// Drawing Analysis
export { useAnalyzeDrawing } from './useAnalyzeDrawing';

// Biometric Authentication
export { useBiometric } from './useBiometric';

// Emotion Tracking
export { useEmotionTracker } from './useEmotionTracker';

// Age Collection
export { useAgeCollection } from './useAgeCollection';

// First Time User
export { useFirstTimeUser } from './useFirstTimeUser';

// Coloring Page Generation
export { useGenerateColoringPage } from './useGenerateColoringPage';

// Responsive Design
export { useResponsive } from './useResponsive';

// Copywriting (Part of #23: Profesyonel Copywriting Revizyonu)
export {
  useCopywriting,
  useCopywritingCategory,
  useAnalysisCopy,
  useResultsCopy,
  useActionsCopy,
  useErrorsCopy,
  useSuccessCopy,
  useStatusCopy,
  useEmptyStateCopy,
  useSubjectsCopy,
  useProfessionalCopy,
  useFormattedText,
  useButtonText,
  usePlaceholderText,
} from './useCopywriting';

// Greeting (Part of #23: Profesyonel Copywriting Revizyonu)
export { useGreeting, useGreetingTitle, useGreetingSubtitle, useTimeOfDay } from './useGreeting';
