/**
 * Analytics Tracking System
 * Phase 4: Advanced Features
 *
 * Provides:
 * - Event tracking
 * - Screen view tracking
 * - User property tracking
 * - Session tracking
 * - Conversion tracking
 * - Error tracking
 */

import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Event types
export type EventCategory =
  | 'navigation'
  | 'engagement'
  | 'analysis'
  | 'coloring'
  | 'story'
  | 'subscription'
  | 'error'
  | 'performance';

export interface AnalyticsEvent {
  name: string;
  category: EventCategory;
  properties?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
}

export interface UserProperties {
  userId?: string;
  subscriptionTier?: 'free' | 'premium' | 'professional';
  childrenCount?: number;
  platform: 'ios' | 'android' | 'web';
  appVersion?: string;
  locale?: string;
}

export interface ScreenView {
  screenName: string;
  screenClass?: string;
  properties?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
  duration?: number;
}

// Analytics storage keys
const STORAGE_KEYS = {
  SESSION_ID: '@analytics_session_id',
  SESSION_START: '@analytics_session_start',
  USER_ID: '@analytics_user_id',
  EVENTS_QUEUE: '@analytics_events_queue',
  LAST_SCREEN: '@analytics_last_screen',
};

// Session timeout (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Max events to queue before force flush
const MAX_QUEUE_SIZE = 100;

// Analytics manager singleton
class AnalyticsManager {
  private static instance: AnalyticsManager;
  private sessionId: string = '';
  private sessionStartTime: number = 0;
  private userId: string | undefined;
  private userProperties: UserProperties = {
    platform: Platform.OS as 'ios' | 'android' | 'web',
  };
  private eventsQueue: AnalyticsEvent[] = [];
  private screenViewsQueue: ScreenView[] = [];
  private isInitialized = false;
  private lastScreenName: string | undefined;
  private lastScreenTimestamp: number = 0;

  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Restore or create session
      await this.restoreOrCreateSession();

      // Restore user ID
      const storedUserId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (storedUserId) {
        this.userId = storedUserId;
      }

      // Restore events queue
      const storedEvents = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS_QUEUE);
      if (storedEvents) {
        this.eventsQueue = JSON.parse(storedEvents);
      }

      this.isInitialized = true;

      // Track session start
      this.trackEvent('session_start', 'engagement', {
        isNewSession: true,
      });
    } catch (error) {
      console.warn('[Analytics] Initialization failed:', error);
    }
  }

  private async restoreOrCreateSession(): Promise<void> {
    try {
      const storedSessionId = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
      const storedSessionStart = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_START);

      if (storedSessionId && storedSessionStart) {
        const sessionStart = parseInt(storedSessionStart, 10);
        const now = Date.now();

        // Check if session is still valid
        if (now - sessionStart < SESSION_TIMEOUT) {
          this.sessionId = storedSessionId;
          this.sessionStartTime = sessionStart;
          return;
        }
      }

      // Create new session
      this.sessionId = this.generateSessionId();
      this.sessionStartTime = Date.now();

      await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, this.sessionId);
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION_START, this.sessionStartTime.toString());
    } catch (_error) {
      // Fallback to new session
      this.sessionId = this.generateSessionId();
      this.sessionStartTime = Date.now();
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Update session timestamp (keep session alive)
  async touchSession(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION_START, Date.now().toString());
    } catch (_error) {
      // Ignore
    }
  }

  // Set user ID
  async setUserId(userId: string): Promise<void> {
    this.userId = userId;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    } catch (error) {
      console.warn('[Analytics] Failed to save user ID:', error);
    }

    this.trackEvent('user_identified', 'engagement', { userId });
  }

  // Clear user ID (on logout)
  async clearUserId(): Promise<void> {
    this.userId = undefined;
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
    } catch (_error) {
      // Ignore
    }
  }

  // Set user properties
  setUserProperties(properties: Partial<UserProperties>): void {
    this.userProperties = {
      ...this.userProperties,
      ...properties,
    };

    this.trackEvent('user_properties_updated', 'engagement', properties);
  }

  // Track event
  trackEvent(name: string, category: EventCategory, properties?: Record<string, unknown>): void {
    const event: AnalyticsEvent = {
      name,
      category,
      properties: {
        ...properties,
        userId: this.userId,
        ...this.userProperties,
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.eventsQueue.push(event);

    // Log in dev
    if (__DEV__) {
      console.log('[Analytics] Event:', name, properties);
    }

    // Flush if queue is too large
    if (this.eventsQueue.length >= MAX_QUEUE_SIZE) {
      this.flush();
    }

    // Persist queue
    this.persistQueue();

    // Keep session alive
    this.touchSession();
  }

  // Track screen view
  trackScreenView(
    screenName: string,
    screenClass?: string,
    properties?: Record<string, unknown>
  ): void {
    // Calculate duration of previous screen
    if (this.lastScreenName && this.lastScreenTimestamp) {
      const duration = Date.now() - this.lastScreenTimestamp;
      this.trackEvent('screen_view_ended', 'navigation', {
        screenName: this.lastScreenName,
        duration,
      });
    }

    const screenView: ScreenView = {
      screenName,
      screenClass,
      properties: {
        ...properties,
        userId: this.userId,
        ...this.userProperties,
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.screenViewsQueue.push(screenView);

    // Update last screen
    this.lastScreenName = screenName;
    this.lastScreenTimestamp = Date.now();

    // Also track as event
    this.trackEvent('screen_view', 'navigation', {
      screenName,
      screenClass,
      ...properties,
    });
  }

  // Track error
  trackError(errorName: string, errorMessage: string, stack?: string, isFatal = false): void {
    this.trackEvent('error', 'error', {
      errorName,
      errorMessage,
      stack: stack?.slice(0, 500), // Limit stack trace size
      isFatal,
    });
  }

  // Track conversion (subscription, purchase, etc.)
  trackConversion(
    conversionType: string,
    value?: number,
    currency?: string,
    properties?: Record<string, unknown>
  ): void {
    this.trackEvent('conversion', 'subscription', {
      conversionType,
      value,
      currency,
      ...properties,
    });
  }

  // Analysis-specific tracking
  trackAnalysisStarted(analysisType: string, childAge?: number): void {
    this.trackEvent('analysis_started', 'analysis', {
      analysisType,
      childAge,
    });
  }

  trackAnalysisCompleted(analysisType: string, duration: number, success: boolean): void {
    this.trackEvent('analysis_completed', 'analysis', {
      analysisType,
      duration,
      success,
    });
  }

  // Coloring-specific tracking
  trackColoringStarted(coloringId: string): void {
    this.trackEvent('coloring_started', 'coloring', { coloringId });
  }

  trackColoringCompleted(coloringId: string, duration: number): void {
    this.trackEvent('coloring_completed', 'coloring', {
      coloringId,
      duration,
    });
  }

  // Story-specific tracking
  trackStoryGenerated(theme: string, childAge?: number): void {
    this.trackEvent('story_generated', 'story', {
      theme,
      childAge,
    });
  }

  trackStoryRead(storyId: string, duration: number): void {
    this.trackEvent('story_read', 'story', {
      storyId,
      duration,
    });
  }

  // Flush events to backend
  async flush(): Promise<void> {
    if (this.eventsQueue.length === 0 && this.screenViewsQueue.length === 0) {
      return;
    }

    const eventsToSend = [...this.eventsQueue];
    const screenViewsToSend = [...this.screenViewsQueue];

    // Clear queues
    this.eventsQueue = [];
    this.screenViewsQueue = [];

    try {
      // In a real app, send to analytics backend
      // await fetch('https://your-analytics-endpoint.com/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ events: eventsToSend, screenViews: screenViewsToSend }),
      // });

      if (__DEV__) {
        console.log('[Analytics] Flushed:', eventsToSend.length, 'events');
      }

      // Clear persisted queue
      await AsyncStorage.removeItem(STORAGE_KEYS.EVENTS_QUEUE);
    } catch (error) {
      // Restore events on failure
      this.eventsQueue = [...eventsToSend, ...this.eventsQueue];
      this.screenViewsQueue = [...screenViewsToSend, ...this.screenViewsQueue];
      console.warn('[Analytics] Flush failed:', error);
    }
  }

  // Persist queue to storage
  private async persistQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS_QUEUE, JSON.stringify(this.eventsQueue));
    } catch (_error) {
      // Ignore
    }
  }

  // Get session info
  getSessionInfo(): { sessionId: string; duration: number } {
    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.sessionStartTime,
    };
  }

  // Get events count
  getQueuedEventsCount(): number {
    return this.eventsQueue.length;
  }
}

export const analytics = AnalyticsManager.getInstance();

// Hook for analytics
export function useAnalytics() {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      analytics.initialize();
      isInitialized.current = true;
    }

    // Flush on unmount
    return () => {
      analytics.flush();
    };
  }, []);

  const trackEvent = useCallback(
    (name: string, category: EventCategory, properties?: Record<string, unknown>) => {
      analytics.trackEvent(name, category, properties);
    },
    []
  );

  const trackScreenView = useCallback(
    (screenName: string, screenClass?: string, properties?: Record<string, unknown>) => {
      analytics.trackScreenView(screenName, screenClass, properties);
    },
    []
  );

  const trackError = useCallback(
    (errorName: string, errorMessage: string, stack?: string, isFatal = false) => {
      analytics.trackError(errorName, errorMessage, stack, isFatal);
    },
    []
  );

  const setUserId = useCallback((userId: string) => {
    analytics.setUserId(userId);
  }, []);

  const setUserProperties = useCallback((properties: Partial<UserProperties>) => {
    analytics.setUserProperties(properties);
  }, []);

  const flush = useCallback(() => {
    analytics.flush();
  }, []);

  return {
    trackEvent,
    trackScreenView,
    trackError,
    setUserId,
    setUserProperties,
    flush,
    // Convenience methods
    trackAnalysisStarted: analytics.trackAnalysisStarted.bind(analytics),
    trackAnalysisCompleted: analytics.trackAnalysisCompleted.bind(analytics),
    trackColoringStarted: analytics.trackColoringStarted.bind(analytics),
    trackColoringCompleted: analytics.trackColoringCompleted.bind(analytics),
    trackStoryGenerated: analytics.trackStoryGenerated.bind(analytics),
    trackStoryRead: analytics.trackStoryRead.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
  };
}

// Hook for screen tracking
export function useScreenTracking(screenName: string, screenClass?: string) {
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    analytics.trackScreenView(screenName, screenClass);

    const mountTime = mountTimeRef.current;
    return () => {
      const duration = Date.now() - mountTime;
      analytics.trackEvent('screen_exit', 'navigation', {
        screenName,
        duration,
      });
    };
  }, [screenName, screenClass]);
}

// Hook for timed events
export function useTimedEvent(eventName: string, category: EventCategory) {
  const startTimeRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
  }, []);

  const endTimer = useCallback(
    (properties?: Record<string, unknown>) => {
      if (startTimeRef.current) {
        const duration = Date.now() - startTimeRef.current;
        analytics.trackEvent(eventName, category, {
          ...properties,
          duration,
        });
        startTimeRef.current = null;
        return duration;
      }
      return 0;
    },
    [eventName, category]
  );

  const cancelTimer = useCallback(() => {
    startTimeRef.current = null;
  }, []);

  return { startTimer, endTimer, cancelTimer };
}

export default analytics;
