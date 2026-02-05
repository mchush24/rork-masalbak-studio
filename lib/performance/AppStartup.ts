/**
 * App Startup Optimization
 *
 * Comprehensive startup optimization with phased initialization
 * and performance tracking
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { InteractionManager, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// ============================================
// Types
// ============================================

export interface StartupTask {
  id: string;
  name: string;
  phase: 'critical' | 'essential' | 'deferred';
  task: () => Promise<void>;
  timeout?: number;
  retries?: number;
}

export interface StartupMetrics {
  totalDuration: number;
  phases: {
    critical: number;
    essential: number;
    deferred: number;
  };
  tasks: Array<{
    id: string;
    name: string;
    duration: number;
    success: boolean;
  }>;
  errors: string[];
}

export type StartupPhase = 'initializing' | 'critical' | 'essential' | 'deferred' | 'complete';

// ============================================
// Startup Manager
// ============================================

class StartupManager {
  private tasks: Map<string, StartupTask> = new Map();
  private completedTasks: Set<string> = new Set();
  private metrics: StartupMetrics = {
    totalDuration: 0,
    phases: { critical: 0, essential: 0, deferred: 0 },
    tasks: [],
    errors: [],
  };
  private startTime: number = 0;
  private currentPhase: StartupPhase = 'initializing';
  private onPhaseChange?: (phase: StartupPhase) => void;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Register a startup task
   */
  register(task: StartupTask): void {
    this.tasks.set(task.id, task);
  }

  /**
   * Register multiple tasks
   */
  registerAll(tasks: StartupTask[]): void {
    tasks.forEach((task) => this.register(task));
  }

  /**
   * Set phase change callback
   */
  setPhaseCallback(callback: (phase: StartupPhase) => void): void {
    this.onPhaseChange = callback;
  }

  /**
   * Run all startup tasks in phases
   */
  async run(): Promise<StartupMetrics> {
    // Phase 1: Critical tasks (required for initial render)
    await this.runPhase('critical');

    // Phase 2: Essential tasks (after first render)
    await new Promise<void>((resolve) => {
      InteractionManager.runAfterInteractions(() => resolve());
    });
    await this.runPhase('essential');

    // Phase 3: Deferred tasks (low priority)
    setTimeout(async () => {
      await this.runPhase('deferred');
      this.setPhase('complete');
    }, 1000);

    this.metrics.totalDuration = Date.now() - this.startTime;
    return this.metrics;
  }

  private setPhase(phase: StartupPhase): void {
    this.currentPhase = phase;
    this.onPhaseChange?.(phase);
  }

  private async runPhase(phase: 'critical' | 'essential' | 'deferred'): Promise<void> {
    this.setPhase(phase);
    const phaseStart = Date.now();

    const phaseTasks = Array.from(this.tasks.values()).filter((t) => t.phase === phase);

    for (const task of phaseTasks) {
      if (this.completedTasks.has(task.id)) continue;

      const taskStart = Date.now();
      let success = false;

      try {
        await this.runTaskWithRetry(task);
        success = true;
      } catch (error) {
        const message = `Task ${task.id} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        this.metrics.errors.push(message);
        if (__DEV__) console.error(`[Startup] ${message}`);
      }

      this.completedTasks.add(task.id);
      this.metrics.tasks.push({
        id: task.id,
        name: task.name,
        duration: Date.now() - taskStart,
        success,
      });
    }

    this.metrics.phases[phase] = Date.now() - phaseStart;
  }

  private async runTaskWithRetry(task: StartupTask): Promise<void> {
    const maxRetries = task.retries ?? 0;
    const timeout = task.timeout ?? 10000;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await Promise.race([
          task.task(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Task timeout')), timeout)
          ),
        ]);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }

  /**
   * Get current phase
   */
  getPhase(): StartupPhase {
    return this.currentPhase;
  }

  /**
   * Get metrics
   */
  getMetrics(): StartupMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if a task is completed
   */
  isTaskComplete(taskId: string): boolean {
    return this.completedTasks.has(taskId);
  }

  /**
   * Reset for testing
   */
  reset(): void {
    this.tasks.clear();
    this.completedTasks.clear();
    this.metrics = {
      totalDuration: 0,
      phases: { critical: 0, essential: 0, deferred: 0 },
      tasks: [],
      errors: [],
    };
    this.startTime = Date.now();
    this.currentPhase = 'initializing';
  }
}

// Singleton instance
export const startupManager = new StartupManager();

// ============================================
// React Hook
// ============================================

interface UseAppStartupOptions {
  tasks: StartupTask[];
  onComplete?: (metrics: StartupMetrics) => void;
  onError?: (errors: string[]) => void;
  hideSplashOnComplete?: boolean;
}

interface UseAppStartupResult {
  phase: StartupPhase;
  isComplete: boolean;
  metrics: StartupMetrics | null;
  error: string | null;
}

/**
 * Hook for managing app startup
 *
 * @example
 * const { phase, isComplete, metrics } = useAppStartup({
 *   tasks: [
 *     { id: 'auth', name: 'Check Auth', phase: 'critical', task: checkAuth },
 *     { id: 'fonts', name: 'Load Fonts', phase: 'critical', task: loadFonts },
 *     { id: 'cache', name: 'Warm Cache', phase: 'essential', task: warmCache },
 *     { id: 'analytics', name: 'Init Analytics', phase: 'deferred', task: initAnalytics },
 *   ],
 *   hideSplashOnComplete: true,
 * });
 *
 * if (!isComplete) {
 *   return <LoadingScreen phase={phase} />;
 * }
 */
export function useAppStartup(options: UseAppStartupOptions): UseAppStartupResult {
  const { tasks, onComplete, onError, hideSplashOnComplete = true } = options;

  const [phase, setPhase] = useState<StartupPhase>('initializing');
  const [metrics, setMetrics] = useState<StartupMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const runStartup = async () => {
      try {
        // Keep splash screen visible
        await SplashScreen.preventAutoHideAsync().catch(() => {});

        // Register tasks
        startupManager.reset();
        startupManager.registerAll(tasks);
        startupManager.setPhaseCallback(setPhase);

        // Run startup
        const result = await startupManager.run();
        setMetrics(result);

        // Handle errors
        if (result.errors.length > 0) {
          onError?.(result.errors);
        }

        // Success callback
        onComplete?.(result);

        // Hide splash screen
        if (hideSplashOnComplete) {
          await SplashScreen.hideAsync().catch(() => {});
        }

        if (__DEV__) {
          console.log('[Startup] Complete:', {
            total: `${result.totalDuration}ms`,
            critical: `${result.phases.critical}ms`,
            essential: `${result.phases.essential}ms`,
            errors: result.errors.length,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Startup failed';
        setError(message);
        onError?.([message]);

        // Still hide splash screen to show error state
        await SplashScreen.hideAsync().catch(() => {});
      }
    };

    runStartup();
  }, [tasks, onComplete, onError, hideSplashOnComplete]);

  return {
    phase,
    isComplete: phase === 'complete',
    metrics,
    error,
  };
}

// ============================================
// Common Startup Tasks
// ============================================

/**
 * Create a startup task for font loading
 */
export function createFontLoadTask(
  fonts: Record<string, number>,
  loadFont: (fonts: Record<string, number>) => Promise<void>
): StartupTask {
  return {
    id: 'fonts',
    name: 'Load Fonts',
    phase: 'critical',
    task: () => loadFont(fonts),
    timeout: 5000,
  };
}

/**
 * Create a startup task for auth state check
 */
export function createAuthCheckTask(checkAuth: () => Promise<void>): StartupTask {
  return {
    id: 'auth',
    name: 'Check Auth State',
    phase: 'critical',
    task: checkAuth,
    timeout: 3000,
    retries: 1,
  };
}

/**
 * Create a startup task for cache warming
 */
export function createCacheWarmTask(warmCache: () => Promise<void>): StartupTask {
  return {
    id: 'cache',
    name: 'Warm Cache',
    phase: 'essential',
    task: warmCache,
    timeout: 5000,
  };
}

/**
 * Create a startup task for analytics initialization
 */
export function createAnalyticsTask(initAnalytics: () => Promise<void>): StartupTask {
  return {
    id: 'analytics',
    name: 'Init Analytics',
    phase: 'deferred',
    task: initAnalytics,
    timeout: 3000,
  };
}
