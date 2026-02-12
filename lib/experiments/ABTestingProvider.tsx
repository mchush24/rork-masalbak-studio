/**
 * ABTestingProvider - A/B Testing infrastructure
 * Phase 20: A/B Testing
 *
 * Provides A/B testing capabilities:
 * - Experiment configuration
 * - Variant assignment
 * - Conversion tracking
 * - Analytics integration
 * - Feature flags
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const _EXPERIMENTS_KEY = 'ab_experiments';
const USER_VARIANTS_KEY = 'ab_user_variants';
const CONVERSIONS_KEY = 'ab_conversions';

interface Variant {
  id: string;
  name: string;
  weight: number; // 0-100
  config?: Record<string, unknown>;
}

interface Experiment {
  id: string;
  name: string;
  description?: string;
  variants: Variant[];
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  targetAudience?: {
    minAppVersion?: string;
    platforms?: ('ios' | 'android' | 'web')[];
    userTags?: string[];
  };
}

interface UserVariantAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: number;
}

interface ConversionEvent {
  experimentId: string;
  variantId: string;
  eventName: string;
  value?: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

interface ExperimentResult {
  experimentId: string;
  variantId: string;
  variant: Variant | null;
  isControl: boolean;
  config: Record<string, unknown>;
}

interface ABTestingContextType {
  // Experiments
  experiments: Experiment[];
  loadExperiments: (experiments: Experiment[]) => void;
  getExperiment: (experimentId: string) => Experiment | undefined;

  // Variant assignment
  getVariant: (experimentId: string) => ExperimentResult;
  forceVariant: (experimentId: string, variantId: string) => void;
  resetVariant: (experimentId: string) => void;
  resetAllVariants: () => void;

  // Conversion tracking
  trackConversion: (
    experimentId: string,
    eventName: string,
    value?: number,
    metadata?: Record<string, unknown>
  ) => void;
  getConversions: (experimentId?: string) => ConversionEvent[];

  // Feature flags
  isFeatureEnabled: (featureId: string) => boolean;
  getFeatureConfig: <T>(featureId: string, defaultValue: T) => T;

  // Debug
  isDebugMode: boolean;
  setDebugMode: (enabled: boolean) => void;
  getAllAssignments: () => UserVariantAssignment[];
}

const ABTestingContext = createContext<ABTestingContextType | undefined>(undefined);

interface ABTestingProviderProps {
  children: React.ReactNode;
  initialExperiments?: Experiment[];
  userId?: string;
  debugMode?: boolean;
}

export function ABTestingProvider({
  children,
  initialExperiments = [],
  userId,
  debugMode = __DEV__,
}: ABTestingProviderProps) {
  const [experiments, setExperiments] = useState<Experiment[]>(initialExperiments);
  const [userVariants, setUserVariants] = useState<Map<string, UserVariantAssignment>>(new Map());
  const [conversions, setConversions] = useState<ConversionEvent[]>([]);
  const [isDebugMode, setDebugMode] = useState(debugMode);
  const [isLoaded, setIsLoaded] = useState(false);

  // Generate stable user ID for consistent variant assignment
  const stableUserId = useMemo(() => {
    if (userId) return userId;
    // Generate a random ID if none provided
    return `user_${Math.random().toString(36).substring(2, 15)}`;
  }, [userId]);

  // Load persisted data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedVariants, savedConversions] = await Promise.all([
          AsyncStorage.getItem(USER_VARIANTS_KEY),
          AsyncStorage.getItem(CONVERSIONS_KEY),
        ]);

        if (savedVariants) {
          const parsed = JSON.parse(savedVariants);
          setUserVariants(new Map(Object.entries(parsed)));
        }

        if (savedConversions) {
          setConversions(JSON.parse(savedConversions));
        }
      } catch (error) {
        console.error('Failed to load A/B testing data:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Persist user variants
  const persistVariants = useCallback(async (variants: Map<string, UserVariantAssignment>) => {
    try {
      const obj = Object.fromEntries(variants);
      await AsyncStorage.setItem(USER_VARIANTS_KEY, JSON.stringify(obj));
    } catch (error) {
      console.error('Failed to persist variants:', error);
    }
  }, []);

  // Persist conversions
  const persistConversions = useCallback(async (events: ConversionEvent[]) => {
    try {
      // Keep only last 1000 conversions
      const trimmed = events.slice(-1000);
      await AsyncStorage.setItem(CONVERSIONS_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to persist conversions:', error);
    }
  }, []);

  // Hash function for deterministic variant assignment
  const hashUserExperiment = useCallback(
    (experimentId: string): number => {
      const str = `${stableUserId}_${experimentId}`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash % 100);
    },
    [stableUserId]
  );

  // Assign variant based on weights
  const assignVariant = useCallback(
    (experiment: Experiment): Variant => {
      const hash = hashUserExperiment(experiment.id);
      let cumulativeWeight = 0;

      for (const variant of experiment.variants) {
        cumulativeWeight += variant.weight;
        if (hash < cumulativeWeight) {
          return variant;
        }
      }

      // Fallback to first variant (control)
      return experiment.variants[0];
    },
    [hashUserExperiment]
  );

  // Check if experiment is active
  const isExperimentActive = useCallback((experiment: Experiment): boolean => {
    if (!experiment.enabled) return false;

    const now = Date.now();

    if (experiment.startDate && new Date(experiment.startDate).getTime() > now) {
      return false;
    }

    if (experiment.endDate && new Date(experiment.endDate).getTime() < now) {
      return false;
    }

    return true;
  }, []);

  const loadExperiments = useCallback((newExperiments: Experiment[]) => {
    setExperiments(newExperiments);
  }, []);

  const getExperiment = useCallback(
    (experimentId: string): Experiment | undefined => {
      return experiments.find(e => e.id === experimentId);
    },
    [experiments]
  );

  const getVariant = useCallback(
    (experimentId: string): ExperimentResult => {
      const experiment = experiments.find(e => e.id === experimentId);

      // Default result for missing/inactive experiments
      const defaultResult: ExperimentResult = {
        experimentId,
        variantId: 'control',
        variant: null,
        isControl: true,
        config: {},
      };

      if (!experiment || !isExperimentActive(experiment)) {
        return defaultResult;
      }

      // Check if user already has an assignment
      let assignment = userVariants.get(experimentId);

      if (!assignment) {
        // Assign a variant
        const variant = assignVariant(experiment);
        assignment = {
          experimentId,
          variantId: variant.id,
          assignedAt: Date.now(),
        };

        // Persist assignment
        const newVariants = new Map(userVariants);
        newVariants.set(experimentId, assignment);
        setUserVariants(newVariants);
        persistVariants(newVariants);
      }

      const variant = experiment.variants.find(v => v.id === assignment!.variantId);

      return {
        experimentId,
        variantId: assignment.variantId,
        variant: variant || null,
        isControl: assignment.variantId === experiment.variants[0]?.id,
        config: variant?.config || {},
      };
    },
    [experiments, userVariants, isExperimentActive, assignVariant, persistVariants]
  );

  const forceVariant = useCallback(
    (experimentId: string, variantId: string) => {
      const assignment: UserVariantAssignment = {
        experimentId,
        variantId,
        assignedAt: Date.now(),
      };

      const newVariants = new Map(userVariants);
      newVariants.set(experimentId, assignment);
      setUserVariants(newVariants);
      persistVariants(newVariants);
    },
    [userVariants, persistVariants]
  );

  const resetVariant = useCallback(
    (experimentId: string) => {
      const newVariants = new Map(userVariants);
      newVariants.delete(experimentId);
      setUserVariants(newVariants);
      persistVariants(newVariants);
    },
    [userVariants, persistVariants]
  );

  const resetAllVariants = useCallback(async () => {
    setUserVariants(new Map());
    await AsyncStorage.removeItem(USER_VARIANTS_KEY);
  }, []);

  const trackConversion = useCallback(
    (
      experimentId: string,
      eventName: string,
      value?: number,
      metadata?: Record<string, unknown>
    ) => {
      const assignment = userVariants.get(experimentId);
      if (!assignment) return;

      const event: ConversionEvent = {
        experimentId,
        variantId: assignment.variantId,
        eventName,
        value,
        metadata,
        timestamp: Date.now(),
      };

      const newConversions = [...conversions, event];
      setConversions(newConversions);
      persistConversions(newConversions);

      if (isDebugMode) {
        console.log('[A/B Testing] Conversion:', event);
      }
    },
    [userVariants, conversions, persistConversions, isDebugMode]
  );

  const getConversions = useCallback(
    (experimentId?: string): ConversionEvent[] => {
      if (experimentId) {
        return conversions.filter(c => c.experimentId === experimentId);
      }
      return conversions;
    },
    [conversions]
  );

  // Feature flags (simplified as single-variant experiments)
  const isFeatureEnabled = useCallback(
    (featureId: string): boolean => {
      const result = getVariant(featureId);
      return !result.isControl;
    },
    [getVariant]
  );

  const getFeatureConfig = useCallback(
    <T,>(featureId: string, defaultValue: T): T => {
      const result = getVariant(featureId);
      return (result.config as T) || defaultValue;
    },
    [getVariant]
  );

  const getAllAssignments = useCallback((): UserVariantAssignment[] => {
    return Array.from(userVariants.values());
  }, [userVariants]);

  const value = useMemo(
    () => ({
      experiments,
      loadExperiments,
      getExperiment,
      getVariant,
      forceVariant,
      resetVariant,
      resetAllVariants,
      trackConversion,
      getConversions,
      isFeatureEnabled,
      getFeatureConfig,
      isDebugMode,
      setDebugMode,
      getAllAssignments,
    }),
    [
      experiments,
      loadExperiments,
      getExperiment,
      getVariant,
      forceVariant,
      resetVariant,
      resetAllVariants,
      trackConversion,
      getConversions,
      isFeatureEnabled,
      getFeatureConfig,
      isDebugMode,
      getAllAssignments,
    ]
  );

  if (!isLoaded) {
    return null;
  }

  return <ABTestingContext.Provider value={value}>{children}</ABTestingContext.Provider>;
}

/**
 * Hook to access A/B testing context
 */
export function useABTesting(): ABTestingContextType {
  const context = useContext(ABTestingContext);
  if (!context) {
    throw new Error('useABTesting must be used within an ABTestingProvider');
  }
  return context;
}

/**
 * Hook to get experiment variant
 */
export function useExperiment(experimentId: string): ExperimentResult {
  const { getVariant } = useABTesting();
  return useMemo(() => getVariant(experimentId), [getVariant, experimentId]);
}

/**
 * Hook to check feature flag
 */
export function useFeatureFlag(featureId: string): boolean {
  const { isFeatureEnabled } = useABTesting();
  return isFeatureEnabled(featureId);
}

/**
 * Hook to get feature config
 */
export function useFeatureConfig<T>(featureId: string, defaultValue: T): T {
  const { getFeatureConfig } = useABTesting();
  return getFeatureConfig(featureId, defaultValue);
}

/**
 * Hook for conversion tracking
 */
export function useConversionTracking(experimentId: string) {
  const { trackConversion } = useABTesting();

  return useCallback(
    (eventName: string, value?: number, metadata?: Record<string, unknown>) => {
      trackConversion(experimentId, eventName, value, metadata);
    },
    [trackConversion, experimentId]
  );
}
