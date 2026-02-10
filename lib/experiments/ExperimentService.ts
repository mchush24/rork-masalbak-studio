/**
 * Experiment Service
 * Phase 20: A/B Test Infrastructure
 *
 * Feature flag and experiment management system
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Colors } from '@/constants/colors';

// Types
export type ExperimentType = 'ui' | 'flow' | 'feature';
export type VariantId = string;

export interface Variant {
  id: VariantId;
  name: string;
  weight: number; // 0-100, percentage
  config?: Record<string, any>;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  type: ExperimentType;
  variants: Variant[];
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  targetAudience?: {
    userTypes?: ('parent' | 'professional' | 'teacher')[];
    platforms?: ('ios' | 'android' | 'web')[];
    minVersion?: string;
  };
  metrics?: string[];
}

export interface ExperimentAssignment {
  experimentId: string;
  variantId: VariantId;
  assignedAt: number;
}

export interface ExperimentEvent {
  experimentId: string;
  variantId: VariantId;
  eventName: string;
  eventData?: Record<string, any>;
  timestamp: number;
}

// Storage keys
const STORAGE_KEYS = {
  ASSIGNMENTS: 'renkioo_experiment_assignments',
  EVENTS: 'renkioo_experiment_events',
  USER_ID: 'renkioo_experiment_user_id',
};

// Default experiments
const DEFAULT_EXPERIMENTS: Experiment[] = [
  {
    id: 'onboarding_flow_v2',
    name: 'Onboarding Flow V2',
    description: 'Test new onboarding flow with value proposition emphasis',
    type: 'flow',
    variants: [
      { id: 'control', name: 'Original', weight: 50 },
      { id: 'variant_a', name: 'Value First', weight: 50 },
    ],
    isActive: true,
    metrics: ['onboarding_completion', 'time_to_first_analysis'],
  },
  {
    id: 'cta_button_color',
    name: 'CTA Button Color',
    description: 'Test primary button color variants',
    type: 'ui',
    variants: [
      { id: 'purple', name: 'Purple (Default)', weight: 50, config: { color: Colors.secondary.violet } },
      { id: 'gradient', name: 'Gradient', weight: 50, config: { gradient: true } },
    ],
    isActive: false,
    metrics: ['button_clicks', 'conversion_rate'],
  },
  {
    id: 'gamification_intensity',
    name: 'Gamification Intensity',
    description: 'Test different levels of gamification features',
    type: 'feature',
    variants: [
      { id: 'full', name: 'Full Gamification', weight: 33 },
      { id: 'minimal', name: 'Minimal', weight: 34 },
      { id: 'none', name: 'No Gamification', weight: 33 },
    ],
    isActive: false,
    targetAudience: {
      userTypes: ['parent'],
    },
    metrics: ['daily_active_users', 'retention_day_7'],
  },
];

class ExperimentServiceClass {
  private experiments: Map<string, Experiment> = new Map();
  private assignments: Map<string, ExperimentAssignment> = new Map();
  private events: ExperimentEvent[] = [];
  private userId: string = '';
  private isInitialized: boolean = false;
  private overrides: Map<string, VariantId> = new Map();

  /**
   * Initialize the experiment service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load or generate user ID
      const storedUserId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (storedUserId) {
        this.userId = storedUserId;
      } else {
        this.userId = this.generateUserId();
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, this.userId);
      }

      // Load experiments
      DEFAULT_EXPERIMENTS.forEach(exp => {
        this.experiments.set(exp.id, exp);
      });

      // Load previous assignments
      const storedAssignments = await AsyncStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      if (storedAssignments) {
        const assignments: ExperimentAssignment[] = JSON.parse(storedAssignments);
        assignments.forEach(a => {
          this.assignments.set(a.experimentId, a);
        });
      }

      // Load stored events
      const storedEvents = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
      if (storedEvents) {
        this.events = JSON.parse(storedEvents);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('[Experiments] Initialization failed:', error);
    }
  }

  /**
   * Generate a unique user ID for consistent assignment
   */
  private generateUserId(): string {
    return 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get all experiments
   */
  getExperiments(): Experiment[] {
    return Array.from(this.experiments.values());
  }

  /**
   * Get active experiments
   */
  getActiveExperiments(): Experiment[] {
    const now = Date.now();
    return this.getExperiments().filter(exp => {
      if (!exp.isActive) return false;
      if (exp.startDate && new Date(exp.startDate).getTime() > now) return false;
      if (exp.endDate && new Date(exp.endDate).getTime() < now) return false;
      return true;
    });
  }

  /**
   * Get experiment by ID
   */
  getExperiment(experimentId: string): Experiment | undefined {
    return this.experiments.get(experimentId);
  }

  /**
   * Check if user is in target audience for experiment
   */
  private isInTargetAudience(experiment: Experiment, userContext?: {
    userType?: 'parent' | 'professional' | 'teacher';
    appVersion?: string;
  }): boolean {
    const { targetAudience } = experiment;
    if (!targetAudience) return true;

    // Check platform
    if (targetAudience.platforms) {
      const currentPlatform = Platform.OS as 'ios' | 'android' | 'web';
      if (!targetAudience.platforms.includes(currentPlatform)) {
        return false;
      }
    }

    // Check user type
    if (targetAudience.userTypes && userContext?.userType) {
      if (!targetAudience.userTypes.includes(userContext.userType)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get variant for an experiment
   * Uses deterministic assignment based on user ID
   */
  getVariant(
    experimentId: string,
    userContext?: { userType?: 'parent' | 'professional' | 'teacher'; appVersion?: string }
  ): Variant | null {
    // Check for override first
    if (this.overrides.has(experimentId)) {
      const experiment = this.experiments.get(experimentId);
      const overrideVariantId = this.overrides.get(experimentId);
      return experiment?.variants.find(v => v.id === overrideVariantId) || null;
    }

    const experiment = this.experiments.get(experimentId);
    if (!experiment || !experiment.isActive) {
      return null;
    }

    // Check target audience
    if (!this.isInTargetAudience(experiment, userContext)) {
      return null;
    }

    // Check for existing assignment
    const existingAssignment = this.assignments.get(experimentId);
    if (existingAssignment) {
      const variant = experiment.variants.find(v => v.id === existingAssignment.variantId);
      if (variant) return variant;
    }

    // Assign new variant
    const variant = this.assignVariant(experiment);
    return variant;
  }

  /**
   * Assign a variant to the user using weighted random selection
   */
  private assignVariant(experiment: Experiment): Variant {
    // Use user ID + experiment ID for deterministic assignment
    const hash = this.hashString(this.userId + experiment.id);
    const normalizedHash = hash % 100;

    let cumulative = 0;
    let selectedVariant = experiment.variants[0];

    for (const variant of experiment.variants) {
      cumulative += variant.weight;
      if (normalizedHash < cumulative) {
        selectedVariant = variant;
        break;
      }
    }

    // Store assignment
    const assignment: ExperimentAssignment = {
      experimentId: experiment.id,
      variantId: selectedVariant.id,
      assignedAt: Date.now(),
    };
    this.assignments.set(experiment.id, assignment);
    this.persistAssignments();

    return selectedVariant;
  }

  /**
   * Simple hash function for deterministic assignment
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Persist assignments to storage
   */
  private async persistAssignments(): Promise<void> {
    try {
      const assignments = Array.from(this.assignments.values());
      await AsyncStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));
    } catch (error) {
      console.error('[Experiments] Failed to persist assignments:', error);
    }
  }

  /**
   * Track an experiment event
   */
  async trackEvent(
    experimentId: string,
    eventName: string,
    eventData?: Record<string, any>
  ): Promise<void> {
    const assignment = this.assignments.get(experimentId);
    if (!assignment) return;

    const event: ExperimentEvent = {
      experimentId,
      variantId: assignment.variantId,
      eventName,
      eventData,
      timestamp: Date.now(),
    };

    this.events.push(event);

    // Persist events (limit to last 1000)
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
    } catch (error) {
      console.error('[Experiments] Failed to persist events:', error);
    }

    // Could send to analytics service here
    if (__DEV__) {
      console.log('[Experiments] Event tracked:', eventName, experimentId, assignment.variantId);
    }
  }

  /**
   * Track conversion for an experiment
   */
  async trackConversion(experimentId: string, value?: number): Promise<void> {
    await this.trackEvent(experimentId, 'conversion', { value });
  }

  /**
   * Set variant override for testing
   */
  setOverride(experimentId: string, variantId: VariantId): void {
    this.overrides.set(experimentId, variantId);
  }

  /**
   * Clear variant override
   */
  clearOverride(experimentId: string): void {
    this.overrides.delete(experimentId);
  }

  /**
   * Clear all overrides
   */
  clearAllOverrides(): void {
    this.overrides.clear();
  }

  /**
   * Get experiment metrics
   */
  getMetrics(experimentId: string): {
    totalEvents: number;
    eventsByVariant: Record<VariantId, number>;
    conversions: Record<VariantId, number>;
    conversionRate: Record<VariantId, number>;
  } {
    const experimentEvents = this.events.filter(e => e.experimentId === experimentId);
    const experiment = this.experiments.get(experimentId);

    if (!experiment) {
      return {
        totalEvents: 0,
        eventsByVariant: {},
        conversions: {},
        conversionRate: {},
      };
    }

    const eventsByVariant: Record<VariantId, number> = {};
    const conversions: Record<VariantId, number> = {};

    experiment.variants.forEach(v => {
      eventsByVariant[v.id] = 0;
      conversions[v.id] = 0;
    });

    experimentEvents.forEach(event => {
      eventsByVariant[event.variantId] = (eventsByVariant[event.variantId] || 0) + 1;
      if (event.eventName === 'conversion') {
        conversions[event.variantId] = (conversions[event.variantId] || 0) + 1;
      }
    });

    const conversionRate: Record<VariantId, number> = {};
    Object.keys(eventsByVariant).forEach(variantId => {
      const events = eventsByVariant[variantId] || 0;
      const convs = conversions[variantId] || 0;
      conversionRate[variantId] = events > 0 ? (convs / events) * 100 : 0;
    });

    return {
      totalEvents: experimentEvents.length,
      eventsByVariant,
      conversions,
      conversionRate,
    };
  }

  /**
   * Reset all experiment data
   */
  async reset(): Promise<void> {
    this.assignments.clear();
    this.events = [];
    this.overrides.clear();

    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ASSIGNMENTS,
      STORAGE_KEYS.EVENTS,
    ]);
  }
}

// Export singleton instance
export const ExperimentService = new ExperimentServiceClass();
