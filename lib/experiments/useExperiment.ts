/**
 * useExperiment Hook
 * Phase 20: A/B Test Infrastructure
 *
 * React hook for accessing experiment variants
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ExperimentService, Variant, Experiment } from './ExperimentService';

interface UseExperimentOptions {
  userType?: 'parent' | 'professional' | 'teacher';
  appVersion?: string;
  trackExposure?: boolean;
}

interface UseExperimentResult {
  variant: Variant | null;
  variantId: string | null;
  isLoading: boolean;
  experiment: Experiment | undefined;
  trackEvent: (eventName: string, eventData?: Record<string, any>) => void;
  trackConversion: (value?: number) => void;
  getConfig: <T = any>(key: string, defaultValue?: T) => T;
  isVariant: (variantId: string) => boolean;
}

/**
 * Hook for accessing experiment variant
 */
export function useExperiment(
  experimentId: string,
  options: UseExperimentOptions = {}
): UseExperimentResult {
  const { userType, appVersion, trackExposure = true } = options;
  const [variant, setVariant] = useState<Variant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [experiment, setExperiment] = useState<Experiment | undefined>();

  useEffect(() => {
    let mounted = true;

    const loadVariant = async () => {
      await ExperimentService.initialize();

      if (!mounted) return;

      const exp = ExperimentService.getExperiment(experimentId);
      setExperiment(exp);

      const assignedVariant = ExperimentService.getVariant(experimentId, {
        userType,
        appVersion,
      });

      if (mounted) {
        setVariant(assignedVariant);
        setIsLoading(false);

        // Track exposure event
        if (trackExposure && assignedVariant) {
          ExperimentService.trackEvent(experimentId, 'exposure');
        }
      }
    };

    loadVariant();

    return () => {
      mounted = false;
    };
  }, [experimentId, userType, appVersion, trackExposure]);

  const trackEvent = useCallback(
    (eventName: string, eventData?: Record<string, any>) => {
      ExperimentService.trackEvent(experimentId, eventName, eventData);
    },
    [experimentId]
  );

  const trackConversion = useCallback(
    (value?: number) => {
      ExperimentService.trackConversion(experimentId, value);
    },
    [experimentId]
  );

  const getConfig = useCallback(
    <T = any>(key: string, defaultValue?: T): T => {
      if (!variant?.config) return defaultValue as T;
      return (variant.config[key] ?? defaultValue) as T;
    },
    [variant]
  );

  const isVariant = useCallback(
    (variantId: string): boolean => {
      return variant?.id === variantId;
    },
    [variant]
  );

  return {
    variant,
    variantId: variant?.id || null,
    isLoading,
    experiment,
    trackEvent,
    trackConversion,
    getConfig,
    isVariant,
  };
}

/**
 * Hook for accessing multiple experiments
 */
export function useExperiments(
  experimentIds: string[],
  options: UseExperimentOptions = {}
): Record<string, UseExperimentResult> {
  const results: Record<string, UseExperimentResult> = {};

  experimentIds.forEach(id => {
    // Note: This technically breaks rules of hooks, but works for static arrays
    // For dynamic arrays, use individual useExperiment calls
    results[id] = useExperiment(id, options);
  });

  return results;
}

/**
 * Hook for experiment feature flags
 */
export function useFeatureFlag(
  experimentId: string,
  enabledVariant: string = 'enabled',
  options: UseExperimentOptions = {}
): { enabled: boolean; isLoading: boolean } {
  const { variant, isLoading } = useExperiment(experimentId, options);

  return {
    enabled: variant?.id === enabledVariant,
    isLoading,
  };
}

/**
 * Hook for getting experiment configuration
 */
export function useExperimentConfig<T extends Record<string, any>>(
  experimentId: string,
  defaultConfig: T,
  options: UseExperimentOptions = {}
): { config: T; isLoading: boolean; variantId: string | null } {
  const { variant, isLoading } = useExperiment(experimentId, options);

  const config = useMemo(() => {
    if (!variant?.config) return defaultConfig;
    return { ...defaultConfig, ...variant.config };
  }, [variant, defaultConfig]);

  return {
    config,
    isLoading,
    variantId: variant?.id || null,
  };
}

/**
 * Hook for experiment dashboard data
 */
export function useExperimentDashboard() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await ExperimentService.initialize();
      setExperiments(ExperimentService.getExperiments());
      setIsLoading(false);
    };
    load();
  }, []);

  const getMetrics = useCallback((experimentId: string) => {
    return ExperimentService.getMetrics(experimentId);
  }, []);

  const setOverride = useCallback((experimentId: string, variantId: string) => {
    ExperimentService.setOverride(experimentId, variantId);
  }, []);

  const clearOverride = useCallback((experimentId: string) => {
    ExperimentService.clearOverride(experimentId);
  }, []);

  const activeExperiments = useMemo(() => {
    return experiments.filter(e => e.isActive);
  }, [experiments]);

  const inactiveExperiments = useMemo(() => {
    return experiments.filter(e => !e.isActive);
  }, [experiments]);

  return {
    experiments,
    activeExperiments,
    inactiveExperiments,
    isLoading,
    getMetrics,
    setOverride,
    clearOverride,
  };
}
