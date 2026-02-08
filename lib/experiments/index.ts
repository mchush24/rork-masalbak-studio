/**
 * Experiments Module
 * Phase 20: A/B Test Infrastructure
 *
 * Feature flag and A/B testing system
 */

// Service
export {
  ExperimentService,
  type Experiment,
  type Variant as VariantType,
  type ExperimentType,
  type VariantId,
  type ExperimentAssignment,
  type ExperimentEvent,
} from './ExperimentService';

// Hooks
export {
  useExperiment,
  useExperiments,
  useFeatureFlag,
  useExperimentConfig,
  useExperimentDashboard,
} from './useExperiment';

// Components
export {
  ExperimentBoundary,
  Variant,
  VariantSwitch,
  FeatureFlag,
  ExperimentProvider,
  withExperiment,
  ExperimentDebugger,
} from './ExperimentBoundary';

// Dashboard
export { ExperimentDashboard } from './ExperimentDashboard';
