/**
 * Experiment Dashboard
 * Phase 20: A/B Test Infrastructure
 *
 * Dashboard component for viewing and managing experiments (dev only)
 */

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { useExperimentDashboard } from './useExperiment';
import { Experiment } from './ExperimentService';

import { typography } from '@/constants/design-system';
interface ExperimentDashboardProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Development dashboard for A/B experiments
 */
export const ExperimentDashboard = memo(function ExperimentDashboard({
  visible,
  onClose,
}: ExperimentDashboardProps) {
  const {
    experiments,
    activeExperiments,
    inactiveExperiments,
    isLoading,
    getMetrics,
    setOverride,
    clearOverride,
  } = useExperimentDashboard();

  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [activeOverrides, setActiveOverrides] = useState<Map<string, string>>(new Map());

  const handleVariantOverride = useCallback(
    (experimentId: string, variantId: string) => {
      setOverride(experimentId, variantId);
      setActiveOverrides(prev => new Map(prev).set(experimentId, variantId));
    },
    [setOverride]
  );

  const handleClearOverride = useCallback(
    (experimentId: string) => {
      clearOverride(experimentId);
      setActiveOverrides(prev => {
        const newMap = new Map(prev);
        newMap.delete(experimentId);
        return newMap;
      });
    },
    [clearOverride]
  );

  if (!__DEV__) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Experiments Dashboard</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading experiments...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Summary */}
            <View style={styles.summary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{experiments.length}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#22C55E' }]}>
                  {activeExperiments.length}
                </Text>
                <Text style={styles.summaryLabel}>Active</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#6B7280' }]}>
                  {inactiveExperiments.length}
                </Text>
                <Text style={styles.summaryLabel}>Inactive</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
                  {activeOverrides.size}
                </Text>
                <Text style={styles.summaryLabel}>Overrides</Text>
              </View>
            </View>

            {/* Active Experiments */}
            {activeExperiments.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Experiments</Text>
                {activeExperiments.map(exp => (
                  <ExperimentCard
                    key={exp.id}
                    experiment={exp}
                    metrics={getMetrics(exp.id)}
                    override={activeOverrides.get(exp.id)}
                    onVariantSelect={variantId => handleVariantOverride(exp.id, variantId)}
                    onClearOverride={() => handleClearOverride(exp.id)}
                    onPress={() => setSelectedExperiment(exp)}
                  />
                ))}
              </View>
            )}

            {/* Inactive Experiments */}
            {inactiveExperiments.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Inactive Experiments</Text>
                {inactiveExperiments.map(exp => (
                  <ExperimentCard
                    key={exp.id}
                    experiment={exp}
                    metrics={getMetrics(exp.id)}
                    override={activeOverrides.get(exp.id)}
                    onVariantSelect={variantId => handleVariantOverride(exp.id, variantId)}
                    onClearOverride={() => handleClearOverride(exp.id)}
                    onPress={() => setSelectedExperiment(exp)}
                    inactive
                  />
                ))}
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Overrides are for testing only and will persist until cleared.
              </Text>
            </View>
          </ScrollView>
        )}

        {/* Experiment Detail Modal */}
        {selectedExperiment && (
          <ExperimentDetail
            experiment={selectedExperiment}
            metrics={getMetrics(selectedExperiment.id)}
            onClose={() => setSelectedExperiment(null)}
          />
        )}
      </View>
    </Modal>
  );
});

interface ExperimentCardProps {
  experiment: Experiment;
  metrics: ReturnType<ReturnType<typeof useExperimentDashboard>['getMetrics']>;
  override?: string;
  onVariantSelect: (variantId: string) => void;
  onClearOverride: () => void;
  onPress: () => void;
  inactive?: boolean;
}

const ExperimentCard = memo(function ExperimentCard({
  experiment,
  metrics,
  override,
  onVariantSelect,
  onClearOverride,
  onPress,
  inactive,
}: ExperimentCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, inactive && styles.cardInactive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <View style={[styles.statusDot, { backgroundColor: inactive ? '#6B7280' : '#22C55E' }]} />
          <Text style={styles.cardTitle} numberOfLines={1}>
            {experiment.name}
          </Text>
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{experiment.type.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.cardDescription} numberOfLines={2}>
        {experiment.description}
      </Text>

      {/* Variants */}
      <View style={styles.variantsContainer}>
        {experiment.variants.map(variant => (
          <TouchableOpacity
            key={variant.id}
            style={[styles.variantPill, override === variant.id && styles.variantPillActive]}
            onPress={() => onVariantSelect(variant.id)}
          >
            <Text style={[styles.variantText, override === variant.id && styles.variantTextActive]}>
              {variant.name} ({variant.weight}%)
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Override indicator */}
      {override && (
        <TouchableOpacity style={styles.overrideIndicator} onPress={onClearOverride}>
          <Text style={styles.overrideText}>Override: {override} (tap to clear)</Text>
        </TouchableOpacity>
      )}

      {/* Metrics summary */}
      {metrics.totalEvents > 0 && (
        <View style={styles.metricsRow}>
          <Text style={styles.metricsText}>{metrics.totalEvents} events</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

interface ExperimentDetailProps {
  experiment: Experiment;
  metrics: ReturnType<ReturnType<typeof useExperimentDashboard>['getMetrics']>;
  onClose: () => void;
}

const ExperimentDetail = memo(function ExperimentDetail({
  experiment,
  metrics,
  onClose,
}: ExperimentDetailProps) {
  return (
    <Modal visible={true} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.detailOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.detailContainer}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>{experiment.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailContent}>
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>ID</Text>
              <Text style={styles.detailValue}>{experiment.id}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{experiment.description}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{experiment.type}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text
                style={[styles.detailValue, { color: experiment.isActive ? '#22C55E' : '#EF4444' }]}
              >
                {experiment.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>

            {experiment.metrics && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Tracked Metrics</Text>
                <Text style={styles.detailValue}>{experiment.metrics.join(', ')}</Text>
              </View>
            )}

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Variants</Text>
              {experiment.variants.map(variant => (
                <View key={variant.id} style={styles.variantDetail}>
                  <Text style={styles.variantDetailName}>{variant.name}</Text>
                  <Text style={styles.variantDetailWeight}>{variant.weight}%</Text>
                  {metrics.eventsByVariant[variant.id] !== undefined && (
                    <Text style={styles.variantDetailEvents}>
                      {metrics.eventsByVariant[variant.id]} events
                    </Text>
                  )}
                  {metrics.conversionRate[variant.id] !== undefined && (
                    <Text style={styles.variantDetailConversion}>
                      {metrics.conversionRate[variant.id].toFixed(1)}% conversion
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2235',
  },
  title: {
    fontSize: 20,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    color: Colors.secondary.lavender,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1E2235',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1E2235',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardInactive: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
    flex: 1,
  },
  typeBadge: {
    backgroundColor: Colors.secondary.lavender,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },
  cardDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  variantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantPill: {
    backgroundColor: '#252A3D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3B3F54',
  },
  variantPillActive: {
    backgroundColor: Colors.secondary.lavender,
    borderColor: Colors.secondary.lavender,
  },
  variantText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  variantTextActive: {
    color: Colors.neutral.white,
    fontFamily: typography.family.semibold,
  },
  overrideIndicator: {
    marginTop: 12,
    backgroundColor: '#F59E0B20',
    padding: 8,
    borderRadius: 8,
  },
  overrideText: {
    fontSize: 12,
    color: '#F59E0B',
    textAlign: 'center',
  },
  metricsRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3B3F54',
  },
  metricsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    padding: 16,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  detailContainer: {
    backgroundColor: '#1E2235',
    borderRadius: 16,
    maxHeight: '80%',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3B3F54',
  },
  detailTitle: {
    fontSize: 18,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },
  detailContent: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.neutral.white,
  },
  variantDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3B3F54',
  },
  variantDetailName: {
    flex: 1,
    fontSize: 14,
    color: Colors.neutral.white,
  },
  variantDetailWeight: {
    fontSize: 14,
    color: Colors.secondary.lavender,
    marginRight: 12,
  },
  variantDetailEvents: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  variantDetailConversion: {
    fontSize: 12,
    color: '#22C55E',
  },
});
