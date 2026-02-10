/**
 * Experiment Boundary Components
 * Phase 20: A/B Test Infrastructure
 *
 * Components for conditionally rendering based on experiment variants
 */

import React, { ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useExperiment } from './useExperiment';
import { UIColors as Colors } from '@/constants/color-aliases';
import { zIndex } from '@/constants/design-system';

interface ExperimentBoundaryProps {
  experimentId: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
  userType?: 'parent' | 'professional' | 'teacher';
}

/**
 * Renders children only if experiment is active and user is assigned a variant
 */
export function ExperimentBoundary({
  experimentId,
  children,
  fallback = null,
  loadingComponent,
  userType,
}: ExperimentBoundaryProps) {
  const { variant, isLoading } = useExperiment(experimentId, { userType });

  if (isLoading) {
    return loadingComponent ? <>{loadingComponent}</> : null;
  }

  if (!variant) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface VariantProps {
  experimentId: string;
  variantId: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
  userType?: 'parent' | 'professional' | 'teacher';
}

/**
 * Renders children only if user is assigned to the specified variant
 */
export function Variant({
  experimentId,
  variantId,
  children,
  fallback = null,
  loadingComponent,
  userType,
}: VariantProps) {
  const { variant, isLoading } = useExperiment(experimentId, { userType });

  if (isLoading) {
    return loadingComponent ? <>{loadingComponent}</> : null;
  }

  if (variant?.id !== variantId) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface VariantSwitchProps {
  experimentId: string;
  variants: {
    [variantId: string]: ReactNode;
  };
  default?: ReactNode;
  loadingComponent?: ReactNode;
  userType?: 'parent' | 'professional' | 'teacher';
}

/**
 * Renders different content based on assigned variant
 */
export function VariantSwitch({
  experimentId,
  variants,
  default: defaultContent = null,
  loadingComponent,
  userType,
}: VariantSwitchProps) {
  const { variant, isLoading } = useExperiment(experimentId, { userType });

  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primary.purple} />
      </View>
    );
  }

  if (!variant) {
    return <>{defaultContent}</>;
  }

  const content = variants[variant.id];
  if (!content) {
    return <>{defaultContent}</>;
  }

  return <>{content}</>;
}

interface FeatureFlagProps {
  experimentId: string;
  enabledVariant?: string;
  enabled: ReactNode;
  disabled?: ReactNode;
  loadingComponent?: ReactNode;
  userType?: 'parent' | 'professional' | 'teacher';
}

/**
 * Simple feature flag component
 */
export function FeatureFlag({
  experimentId,
  enabledVariant = 'enabled',
  enabled,
  disabled = null,
  loadingComponent,
  userType,
}: FeatureFlagProps) {
  const { variant, isLoading } = useExperiment(experimentId, { userType });

  if (isLoading) {
    return loadingComponent ? <>{loadingComponent}</> : null;
  }

  if (variant?.id === enabledVariant) {
    return <>{enabled}</>;
  }

  return <>{disabled}</>;
}

interface ExperimentProviderProps {
  children: ReactNode;
  experiments: {
    id: string;
    userType?: 'parent' | 'professional' | 'teacher';
  }[];
  loadingComponent?: ReactNode;
}

/**
 * Preloads multiple experiments
 */
export function ExperimentProvider({
  children,
  experiments,
  loadingComponent,
}: ExperimentProviderProps) {
  const experimentResults = experiments.map(exp =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useExperiment(exp.id, { userType: exp.userType, trackExposure: false })
  );

  const isLoading = experimentResults.some(r => r.isLoading);

  if (isLoading && loadingComponent) {
    return <>{loadingComponent}</>;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for experiment-based rendering
 */
export function withExperiment<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  experimentId: string,
  variantId?: string
): React.ComponentType<P & { experimentFallback?: ReactNode }> {
  return function ExperimentWrappedComponent(props: P & { experimentFallback?: ReactNode }) {
    const { experimentFallback, ...rest } = props;
    const { variant, isLoading } = useExperiment(experimentId);

    if (isLoading) {
      return null;
    }

    // If variantId specified, only render if matched
    if (variantId && variant?.id !== variantId) {
      return experimentFallback ? <>{experimentFallback}</> : null;
    }

    // If no variantId specified, render if experiment is active
    if (!variantId && !variant) {
      return experimentFallback ? <>{experimentFallback}</> : null;
    }

    return <WrappedComponent {...(rest as P)} />;
  };
}

/**
 * Debug component for viewing experiment state
 */
export function ExperimentDebugger({
  experimentId,
  visible = __DEV__,
}: {
  experimentId: string;
  visible?: boolean;
}) {
  const {
    variant: _variant,
    experiment,
    isLoading,
  } = useExperiment(experimentId, {
    trackExposure: false,
  });

  if (!visible) return null;

  return (
    <View style={styles.debugContainer}>
      <View style={styles.debugRow}>
        <View style={styles.debugLabel}>
          <View
            style={[
              styles.debugDot,
              { backgroundColor: experiment?.isActive ? '#22C55E' : '#EF4444' },
            ]}
          />
        </View>
        <View style={styles.debugContent}>
          <View style={styles.debugText}>
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.primary.purple} />
            ) : (
              <>
                <View style={styles.debugBadge}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <View style={styles.debugBadgeText as any}>
                    {/* Text content would go here but we avoid using Text for simplicity */}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 8,
    zIndex: zIndex.debug,
  },
  debugRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugLabel: {
    marginRight: 8,
  },
  debugDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  debugContent: {
    flex: 1,
  },
  debugText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugBadge: {
    backgroundColor: Colors.primary.purple,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  debugBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
});
