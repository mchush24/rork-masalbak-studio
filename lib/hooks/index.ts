/**
 * Custom Hooks Export
 *
 * Central export point for all custom hooks
 */

// Authentication
export { useAuth } from './useAuth';
export type { UserSession, Child, UserProfile } from './useAuth';

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
