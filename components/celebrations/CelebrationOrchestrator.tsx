/**
 * CelebrationOrchestrator
 * Phase 8: Celebration System 2.0
 *
 * Central celebration management system:
 * - Queue mechanism (if overlapping, queue them)
 * - Priority system (level up > badge > xp)
 * - Sound integration
 * - Haptic patterns
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInUp, ZoomIn, BounceIn } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Trophy, Flame, Award, Zap, Shield, Sparkles } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import {
  typography,
  spacing,
  radius,
  shadows,
  textShadows,
  zIndex,
} from '@/constants/design-system';
import { hapticManager, type HapticType } from '@/lib/haptics';
import { soundManager, type SoundName } from '@/lib/audio';
import { ConfettiAnimation, SparkleAnimation } from '@/components/animations/MicroInteractions';

// Celebration types with priority (higher = more important)
export type CelebrationType =
  | 'XP_GAIN' // Priority 1 - Small
  | 'STREAK_FIRE' // Priority 2 - Medium
  | 'STREAK_MILESTONE' // Priority 3 - Medium
  | 'BADGE_UNLOCK' // Priority 4 - Large
  | 'LEVEL_UP' // Priority 5 - Very Large
  | 'FIRST_ANALYSIS' // Priority 4 - Special
  | 'STREAK_SAVE'; // Priority 2 - Security

interface CelebrationConfig {
  type: CelebrationType;
  priority: number;
  duration: number;
  showConfetti: boolean;
  fullScreen: boolean;
  sound: string;
  haptic: string;
}

const CELEBRATION_CONFIGS: Record<CelebrationType, CelebrationConfig> = {
  XP_GAIN: {
    type: 'XP_GAIN',
    priority: 1,
    duration: 1500,
    showConfetti: false,
    fullScreen: false,
    sound: 'xp_gain',
    haptic: 'xp_gain',
  },
  STREAK_FIRE: {
    type: 'STREAK_FIRE',
    priority: 2,
    duration: 2000,
    showConfetti: false,
    fullScreen: false,
    sound: 'streak_fire',
    haptic: 'tap',
  },
  STREAK_MILESTONE: {
    type: 'STREAK_MILESTONE',
    priority: 3,
    duration: 2500,
    showConfetti: true,
    fullScreen: false,
    sound: 'celebration',
    haptic: 'celebration',
  },
  BADGE_UNLOCK: {
    type: 'BADGE_UNLOCK',
    priority: 4,
    duration: 4000,
    showConfetti: true,
    fullScreen: true,
    sound: 'badge_unlock',
    haptic: 'badge_unlock',
  },
  LEVEL_UP: {
    type: 'LEVEL_UP',
    priority: 5,
    duration: 5000,
    showConfetti: true,
    fullScreen: true,
    sound: 'level_up',
    haptic: 'level_up',
  },
  FIRST_ANALYSIS: {
    type: 'FIRST_ANALYSIS',
    priority: 4,
    duration: 4000,
    showConfetti: true,
    fullScreen: true,
    sound: 'celebration',
    haptic: 'celebration',
  },
  STREAK_SAVE: {
    type: 'STREAK_SAVE',
    priority: 2,
    duration: 2000,
    showConfetti: false,
    fullScreen: false,
    sound: 'success',
    haptic: 'success',
  },
};

interface CelebrationData {
  id: string;
  type: CelebrationType;
  title: string;
  subtitle?: string;
  value?: number | string;
  icon?: string;
  onDismiss?: () => void;
}

interface CelebrationContextType {
  celebrate: (data: Omit<CelebrationData, 'id'>) => void;
  celebrateXP: (amount: number) => void;
  celebrateStreak: (days: number) => void;
  celebrateBadge: (badgeName: string, badgeIcon?: string) => void;
  celebrateLevelUp: (newLevel: number, newTitle?: string) => void;
  celebrateFirstAnalysis: () => void;
  celebrateStreakSave: () => void;
}

const CelebrationContext = createContext<CelebrationContextType | null>(null);

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebration must be used within CelebrationProvider');
  }
  return context;
}

interface CelebrationProviderProps {
  children: React.ReactNode;
}

export function CelebrationProvider({ children }: CelebrationProviderProps) {
  const [queue, setQueue] = useState<CelebrationData[]>([]);
  const [currentCelebration, setCurrentCelebration] = useState<CelebrationData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Add celebration to queue
  const addToQueue = useCallback((data: CelebrationData) => {
    setQueue(prev => {
      const newQueue = [...prev, data];
      // Sort by priority (highest first)
      return newQueue.sort((a, b) => {
        const priorityA = CELEBRATION_CONFIGS[a.type].priority;
        const priorityB = CELEBRATION_CONFIGS[b.type].priority;
        return priorityB - priorityA;
      });
    });
  }, []);

  // Process queue
  useEffect(() => {
    if (!currentCelebration && queue.length > 0 && !isAnimating) {
      const next = queue[0];
      setQueue(prev => prev.slice(1));
      setCurrentCelebration(next);
      setIsAnimating(true);

      // Play sound and haptic
      const config = CELEBRATION_CONFIGS[next.type];
      soundManager.play(config.sound as SoundName);
      hapticManager.play(config.haptic as HapticType);

      // Auto-dismiss after duration
      timeoutRef.current = setTimeout(() => {
        dismissCelebration();
      }, config.duration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, currentCelebration, isAnimating]);

  const dismissCelebration = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    currentCelebration?.onDismiss?.();
    setCurrentCelebration(null);
    setIsAnimating(false);
  }, [currentCelebration]);

  // Celebration triggers
  const celebrate = useCallback(
    (data: Omit<CelebrationData, 'id'>) => {
      const id = `${Date.now()}-${Math.random()}`;
      addToQueue({ ...data, id });
    },
    [addToQueue]
  );

  const celebrateXP = useCallback(
    (amount: number) => {
      celebrate({
        type: 'XP_GAIN',
        title: `+${amount} XP`,
        value: amount,
      });
    },
    [celebrate]
  );

  const celebrateStreak = useCallback(
    (days: number) => {
      const isMilestone = days % 7 === 0;
      celebrate({
        type: isMilestone ? 'STREAK_MILESTONE' : 'STREAK_FIRE',
        title: isMilestone ? `${days} Gün!` : `${days} Gün Serisi!`,
        subtitle: isMilestone ? 'Harika bir tutarlılık!' : 'Devam et!',
        value: days,
      });
    },
    [celebrate]
  );

  const celebrateBadge = useCallback(
    (badgeName: string, badgeIcon?: string) => {
      celebrate({
        type: 'BADGE_UNLOCK',
        title: badgeName,
        subtitle: 'Yeni rozet kazandın!',
        icon: badgeIcon,
      });
    },
    [celebrate]
  );

  const celebrateLevelUp = useCallback(
    (newLevel: number, newTitle?: string) => {
      celebrate({
        type: 'LEVEL_UP',
        title: `Seviye ${newLevel}!`,
        subtitle: newTitle || 'Yeni bir seviyeye ulaştın!',
        value: newLevel,
      });
    },
    [celebrate]
  );

  const celebrateFirstAnalysis = useCallback(() => {
    celebrate({
      type: 'FIRST_ANALYSIS',
      title: 'İlk Analizin Tamamlandı!',
      subtitle: 'Yolculuğa başladın!',
    });
  }, [celebrate]);

  const celebrateStreakSave = useCallback(() => {
    celebrate({
      type: 'STREAK_SAVE',
      title: "Streak'in Güvende!",
      subtitle: 'Serin korundu',
    });
  }, [celebrate]);

  const value = {
    celebrate,
    celebrateXP,
    celebrateStreak,
    celebrateBadge,
    celebrateLevelUp,
    celebrateFirstAnalysis,
    celebrateStreakSave,
  };

  return (
    <CelebrationContext.Provider value={value}>
      {children}
      {currentCelebration && (
        <CelebrationDisplay celebration={currentCelebration} onDismiss={dismissCelebration} />
      )}
    </CelebrationContext.Provider>
  );
}

// Celebration Display Components
interface CelebrationDisplayProps {
  celebration: CelebrationData;
  onDismiss: () => void;
}

function CelebrationDisplay({ celebration, onDismiss }: CelebrationDisplayProps) {
  const config = CELEBRATION_CONFIGS[celebration.type];

  if (config.fullScreen) {
    return (
      <FullScreenCelebration celebration={celebration} config={config} onDismiss={onDismiss} />
    );
  }

  return <ToastCelebration celebration={celebration} config={config} onDismiss={onDismiss} />;
}

// Toast-style celebration (XP gain, streak fire)
function ToastCelebration({
  celebration,
  config: _config,
  onDismiss,
}: {
  celebration: CelebrationData;
  config: CelebrationConfig;
  onDismiss: () => void;
}) {
  const getIcon = () => {
    switch (celebration.type) {
      case 'XP_GAIN':
        return <Zap size={24} color={Colors.secondary.sunshine} />;
      case 'STREAK_FIRE':
      case 'STREAK_MILESTONE':
        return <Flame size={24} color={Colors.secondary.coral} />;
      case 'STREAK_SAVE':
        return <Shield size={24} color={Colors.secondary.grass} />;
      default:
        return <Star size={24} color={Colors.secondary.sunshine} />;
    }
  };

  const getGradient = (): readonly [string, string, ...string[]] => {
    switch (celebration.type) {
      case 'XP_GAIN':
        return [Colors.secondary.sunshine, Colors.secondary.sunshineLight];
      case 'STREAK_FIRE':
        return ['#FF6B6B', '#FFB347'];
      case 'STREAK_MILESTONE':
        return ['#FF6B6B', '#FFD93D'];
      case 'STREAK_SAVE':
        return [Colors.secondary.grass, Colors.secondary.grassLight];
      default:
        return [Colors.secondary.lavender, Colors.secondary.lavenderLight];
    }
  };

  return (
    <View style={styles.toastContainer} pointerEvents="box-none">
      <Animated.View entering={SlideInUp.springify().damping(15)} exiting={FadeOut.duration(200)}>
        <Pressable onPress={onDismiss}>
          <LinearGradient
            colors={getGradient()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.toastCard}
          >
            <View style={styles.toastIcon}>{getIcon()}</View>
            <View style={styles.toastContent}>
              <Text style={styles.toastTitle}>{celebration.title}</Text>
              {celebration.subtitle && (
                <Text style={styles.toastSubtitle}>{celebration.subtitle}</Text>
              )}
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// Full-screen celebration (badge, level up)
function FullScreenCelebration({
  celebration,
  config,
  onDismiss,
}: {
  celebration: CelebrationData;
  config: CelebrationConfig;
  onDismiss: () => void;
}) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (config.showConfetti) {
      setTimeout(() => setShowConfetti(true), 500);
    }
  }, [config.showConfetti]);

  const getIcon = () => {
    switch (celebration.type) {
      case 'BADGE_UNLOCK':
        return <Trophy size={64} color={Colors.secondary.sunshine} />;
      case 'LEVEL_UP':
        return <Star size={64} color={Colors.secondary.sunshine} />;
      case 'FIRST_ANALYSIS':
        return <Award size={64} color={Colors.secondary.lavender} />;
      default:
        return <Sparkles size={64} color={Colors.secondary.sunshine} />;
    }
  };

  const getGradient = (): readonly [string, string, ...string[]] => {
    switch (celebration.type) {
      case 'BADGE_UNLOCK':
        return ['#FFD93D', '#FFCBA4', '#FFB347'];
      case 'LEVEL_UP':
        return ['#B98EFF', '#FFCBA4', '#FFD93D'];
      case 'FIRST_ANALYSIS':
        return ['#E8D5FF', '#FFD6E0', '#B8F4E8'];
      default:
        return [Colors.secondary.lavender, Colors.primary.sunset, Colors.secondary.sunshine];
    }
  };

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.fullScreenOverlay} onPress={onDismiss}>
        <BlurView
          intensity={Platform.OS === 'web' ? 0 : 50}
          tint="dark"
          style={styles.blurContainer}
        >
          {showConfetti && <ConfettiAnimation count={50} duration={3000} />}

          <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.fullScreenCard}>
            <LinearGradient
              colors={getGradient()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fullScreenGradient}
            >
              {/* Icon with sparkle */}
              <Animated.View entering={BounceIn.delay(200)} style={styles.iconContainer}>
                <SparkleAnimation size={140} color={Colors.secondary.sunshine} />
                <View style={styles.iconInner}>{getIcon()}</View>
              </Animated.View>

              {/* Level number for level up */}
              {celebration.type === 'LEVEL_UP' && celebration.value && (
                <Animated.View entering={BounceIn.delay(400)} style={styles.levelBadge}>
                  <Text style={styles.levelNumber}>{celebration.value}</Text>
                </Animated.View>
              )}

              {/* Text */}
              <Animated.Text entering={FadeIn.delay(400)} style={styles.fullScreenTitle}>
                {celebration.title}
              </Animated.Text>

              {celebration.subtitle && (
                <Animated.Text entering={FadeIn.delay(600)} style={styles.fullScreenSubtitle}>
                  {celebration.subtitle}
                </Animated.Text>
              )}

              {/* Continue button */}
              <Animated.View entering={FadeIn.delay(800)}>
                <Pressable
                  style={({ pressed }) => [styles.continueButton, pressed && { opacity: 0.8 }]}
                  onPress={onDismiss}
                >
                  <Text style={styles.continueButtonText}>Devam</Text>
                </Pressable>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Toast styles
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: zIndex.toast,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['5'],
    borderRadius: radius.full,
    ...shadows.lg,
  },
  toastIcon: {
    marginRight: spacing['3'],
  },
  toastContent: {
    alignItems: 'flex-start',
  },
  toastTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
    ...textShadows.sm,
  },
  toastSubtitle: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.9)',
  },

  // Full screen styles
  fullScreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['6'],
  },
  fullScreenCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    ...shadows.xl,
  },
  fullScreenGradient: {
    padding: spacing['8'],
    alignItems: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['4'],
  },
  iconInner: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 100,
    height: 100,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  levelBadge: {
    backgroundColor: Colors.neutral.white,
    width: 80,
    height: 80,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['4'],
    ...shadows.xl,
  },
  levelNumber: {
    fontSize: 48,
    fontWeight: typography.weight.extrabold,
    color: Colors.secondary.lavender,
  },
  fullScreenTitle: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['2'],
  },
  fullScreenSubtitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.dark,
    textAlign: 'center',
    marginBottom: spacing['6'],
  },
  continueButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['8'],
    borderRadius: radius.full,
    ...shadows.md,
  },
  continueButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
});

export default CelebrationProvider;
