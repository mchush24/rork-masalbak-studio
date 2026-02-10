/**
 * ExperimentComponents - A/B Testing UI components
 * Phase 20: A/B Testing
 *
 * Provides experiment components:
 * - ExperimentSwitch
 * - VariantRenderer
 * - FeatureGate
 * - ExperimentDebugPanel
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { X, FlaskConical, Check, RefreshCw, Bug } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useHaptics } from '@/lib/haptics';
import { shadows, zIndex } from '@/constants/design-system';
import {
  useABTesting,
  useExperiment,
  useFeatureFlag,
} from './ABTestingProvider';

interface ExperimentSwitchProps {
  experimentId: string;
  control: React.ReactNode;
  variants: Record<string, React.ReactNode>;
}

/**
 * Renders different content based on experiment variant
 */
export function ExperimentSwitch({
  experimentId,
  control,
  variants,
}: ExperimentSwitchProps) {
  const { variantId, isControl } = useExperiment(experimentId);

  if (isControl || !variants[variantId]) {
    return <>{control}</>;
  }

  return <>{variants[variantId]}</>;
}

interface VariantRendererProps {
  experimentId: string;
  children: (result: {
    variantId: string;
    isControl: boolean;
    config: Record<string, any>;
  }) => React.ReactNode;
}

/**
 * Render prop component for experiment variants
 */
export function VariantRenderer({
  experimentId,
  children,
}: VariantRendererProps) {
  const result = useExperiment(experimentId);
  return <>{children(result)}</>;
}

interface FeatureGateProps {
  featureId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Feature gate - shows content only if feature is enabled
 */
export function FeatureGate({
  featureId,
  children,
  fallback = null,
}: FeatureGateProps) {
  const isEnabled = useFeatureFlag(featureId);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface ExperimentDebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Debug panel for viewing and manipulating experiments
 */
export function ExperimentDebugPanel({
  visible,
  onClose,
}: ExperimentDebugPanelProps) {
  const {
    experiments,
    getAllAssignments,
    forceVariant,
    resetVariant,
    resetAllVariants,
    getConversions,
    isDebugMode,
    setDebugMode,
  } = useABTesting();
  const { tapLight, tapMedium, tapHeavy, success, warning, error: hapticError } = useHaptics();

  const assignments = getAllAssignments();
  const conversions = getConversions();

  const handleForceVariant = (experimentId: string, variantId: string) => {
    tapMedium();
    forceVariant(experimentId, variantId);
  };

  const handleResetVariant = (experimentId: string) => {
    tapLight();
    resetVariant(experimentId);
  };

  const handleResetAll = () => {
    warning();
    resetAllVariants();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.debugContainer}>
        <View style={styles.debugHeader}>
          <View style={styles.debugHeaderTitle}>
            <FlaskConical size={24} color={Colors.secondary.lavender} />
            <Text style={styles.debugTitle}>A/B Testing Debug</Text>
          </View>
          <Pressable onPress={onClose} style={styles.debugCloseButton}>
            <X size={24} color={Colors.neutral.dark} />
          </Pressable>
        </View>

        <ScrollView style={styles.debugContent}>
          {/* Debug Mode Toggle */}
          <View style={styles.debugSection}>
            <Text style={styles.debugSectionTitle}>Ayarlar</Text>
            <Pressable
              style={styles.debugToggleRow}
              onPress={() => setDebugMode(!isDebugMode)}
            >
              <Text style={styles.debugToggleLabel}>Debug Modu</Text>
              <View
                style={[
                  styles.debugToggle,
                  isDebugMode && styles.debugToggleActive,
                ]}
              >
                {isDebugMode && <Check size={14} color={Colors.neutral.white} />}
              </View>
            </Pressable>
          </View>

          {/* Experiments */}
          <View style={styles.debugSection}>
            <View style={styles.debugSectionHeader}>
              <Text style={styles.debugSectionTitle}>
                Deneyler ({experiments.length})
              </Text>
              <Pressable onPress={handleResetAll} style={styles.resetAllButton}>
                <RefreshCw size={16} color={Colors.emotion.fear} />
                <Text style={styles.resetAllText}>Tümünü Sıfırla</Text>
              </Pressable>
            </View>

            {experiments.map((experiment) => {
              const assignment = assignments.find(
                (a) => a.experimentId === experiment.id
              );

              return (
                <View key={experiment.id} style={styles.experimentCard}>
                  <View style={styles.experimentHeader}>
                    <Text style={styles.experimentName}>{experiment.name}</Text>
                    <View
                      style={[
                        styles.experimentStatus,
                        experiment.enabled
                          ? styles.experimentEnabled
                          : styles.experimentDisabled,
                      ]}
                    >
                      <Text style={styles.experimentStatusText}>
                        {experiment.enabled ? 'Aktif' : 'Pasif'}
                      </Text>
                    </View>
                  </View>

                  {experiment.description && (
                    <Text style={styles.experimentDescription}>
                      {experiment.description}
                    </Text>
                  )}

                  <Text style={styles.variantsLabel}>Varyantlar:</Text>
                  <View style={styles.variantsContainer}>
                    {experiment.variants.map((variant) => {
                      const isSelected = assignment?.variantId === variant.id;

                      return (
                        <Pressable
                          key={variant.id}
                          style={[
                            styles.variantChip,
                            isSelected && styles.variantChipSelected,
                          ]}
                          onPress={() =>
                            handleForceVariant(experiment.id, variant.id)
                          }
                        >
                          <Text
                            style={[
                              styles.variantChipText,
                              isSelected && styles.variantChipTextSelected,
                            ]}
                          >
                            {variant.name} ({variant.weight}%)
                          </Text>
                          {isSelected && (
                            <Check size={14} color={Colors.neutral.white} />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>

                  {assignment && (
                    <Pressable
                      style={styles.resetButton}
                      onPress={() => handleResetVariant(experiment.id)}
                    >
                      <RefreshCw size={14} color={Colors.neutral.medium} />
                      <Text style={styles.resetButtonText}>Sıfırla</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}

            {experiments.length === 0 && (
              <Text style={styles.emptyText}>Henüz deney yok</Text>
            )}
          </View>

          {/* Conversions */}
          <View style={styles.debugSection}>
            <Text style={styles.debugSectionTitle}>
              Dönüşümler ({conversions.length})
            </Text>

            {conversions.slice(-10).reverse().map((conversion, index) => (
              <View key={index} style={styles.conversionItem}>
                <Text style={styles.conversionEvent}>{conversion.eventName}</Text>
                <Text style={styles.conversionDetails}>
                  {conversion.experimentId} / {conversion.variantId}
                </Text>
                {conversion.value !== undefined && (
                  <Text style={styles.conversionValue}>
                    Değer: {conversion.value}
                  </Text>
                )}
              </View>
            ))}

            {conversions.length === 0 && (
              <Text style={styles.emptyText}>Henüz dönüşüm yok</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

interface DebugFABProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * Floating action button to open debug panel
 */
export function ExperimentDebugFAB({ style }: DebugFABProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { isDebugMode } = useABTesting();
  const { tapLight, tapMedium, tapHeavy, success, warning, error: hapticError } = useHaptics();
  const scale = useSharedValue(1);

  const handlePress = () => {
    tapMedium();
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });
    setIsVisible(true);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!isDebugMode && !__DEV__) {
    return null;
  }

  return (
    <>
      <Animated.View style={[styles.fab, animatedStyle, style]}>
        <Pressable onPress={handlePress} style={styles.fabButton}>
          <Bug size={24} color={Colors.neutral.white} />
        </Pressable>
      </Animated.View>

      <ExperimentDebugPanel
        visible={isVisible}
        onClose={() => setIsVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // Debug Panel
  debugContainer: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  debugHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  debugHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  debugTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral.dark,
  },
  debugCloseButton: {
    padding: 8,
  },
  debugContent: {
    flex: 1,
    padding: 16,
  },
  debugSection: {
    marginBottom: 24,
  },
  debugSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  debugSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral.dark,
    marginBottom: 12,
  },
  debugToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: Colors.neutral.lighter,
    borderRadius: 12,
  },
  debugToggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.neutral.dark,
  },
  debugToggle: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: Colors.neutral.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugToggleActive: {
    backgroundColor: Colors.secondary.lavender,
  },

  // Reset All
  resetAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  resetAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.emotion.fear,
  },

  // Experiment Card
  experimentCard: {
    backgroundColor: Colors.neutral.lighter,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  experimentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  experimentName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral.dark,
  },
  experimentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  experimentEnabled: {
    backgroundColor: Colors.emotion.trust + '20',
  },
  experimentDisabled: {
    backgroundColor: Colors.neutral.light,
  },
  experimentStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neutral.dark,
  },
  experimentDescription: {
    fontSize: 13,
    color: Colors.neutral.medium,
    marginBottom: 12,
  },
  variantsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral.medium,
    marginBottom: 8,
  },
  variantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral.light,
  },
  variantChipSelected: {
    backgroundColor: Colors.secondary.lavender,
    borderColor: Colors.secondary.lavender,
  },
  variantChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.neutral.dark,
  },
  variantChipTextSelected: {
    color: Colors.neutral.white,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  resetButtonText: {
    fontSize: 13,
    color: Colors.neutral.medium,
  },

  // Conversion
  conversionItem: {
    padding: 12,
    backgroundColor: Colors.neutral.lighter,
    borderRadius: 8,
    marginBottom: 8,
  },
  conversionEvent: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.dark,
  },
  conversionDetails: {
    fontSize: 12,
    color: Colors.neutral.medium,
    marginTop: 4,
  },
  conversionValue: {
    fontSize: 12,
    color: Colors.secondary.lavender,
    marginTop: 4,
  },

  // Empty State
  emptyText: {
    fontSize: 14,
    color: Colors.neutral.medium,
    textAlign: 'center',
    padding: 20,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: zIndex.floating,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondary.lavender,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
});

export default {
  ExperimentSwitch,
  VariantRenderer,
  FeatureGate,
  ExperimentDebugPanel,
  ExperimentDebugFAB,
};
