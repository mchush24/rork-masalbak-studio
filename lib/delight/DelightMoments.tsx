/**
 * Delight Moments - Special milestone celebrations
 * Phase 21: Polish & Delight
 *
 * Celebrates special user achievements:
 * - 100th analysis
 * - 1 year anniversary
 * - First analysis
 * - Perfect week (7 day streak)
 * - OG User badge
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  runOnJS,
  Easing,
  FadeIn,
  FadeOut,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { radius, spacing } from '@/constants/design-system';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MILESTONES_KEY = 'delight_milestones';
const SIGNUP_DATE_KEY = 'user_signup_date';

type MilestoneType =
  | 'first_analysis'
  | 'analysis_10'
  | 'analysis_50'
  | 'analysis_100'
  | 'streak_7'
  | 'streak_30'
  | 'anniversary_1'
  | 'og_user';

interface MilestoneConfig {
  id: MilestoneType;
  title: string;
  subtitle: string;
  emoji: string;
  badge?: string;
  confettiColors: string[];
}

const MILESTONE_CONFIGS: Record<MilestoneType, MilestoneConfig> = {
  first_analysis: {
    id: 'first_analysis',
    title: 'İlk Adım!',
    subtitle: 'İlk analizini tamamladın',
    emoji: '🎉',
    badge: 'Kaşif',
    confettiColors: ['#FFD700', '#FF6B9D', '#7C3AED'],
  },
  analysis_10: {
    id: 'analysis_10',
    title: '10 Analiz!',
    subtitle: 'Çocuğunun dünyasını keşfediyorsun',
    emoji: '🌟',
    badge: 'Meraklı',
    confettiColors: ['#FFD700', '#FFA500', '#FF6B9D'],
  },
  analysis_50: {
    id: 'analysis_50',
    title: '50 Analiz!',
    subtitle: 'Gerçek bir uzman oldun',
    emoji: '🏆',
    badge: 'Uzman',
    confettiColors: ['#FFD700', '#C0C0C0', '#CD7F32'],
  },
  analysis_100: {
    id: 'analysis_100',
    title: '100 Analiz!',
    subtitle: 'Muhteşem bir başarı!',
    emoji: '👑',
    badge: 'Efsane',
    confettiColors: ['#FFD700', '#7C3AED', '#FF6B9D', '#5EEAD4'],
  },
  streak_7: {
    id: 'streak_7',
    title: 'Mükemmel Hafta!',
    subtitle: '7 gün üst üste kullandın',
    emoji: '🔥',
    badge: 'Kararlı',
    confettiColors: ['#FF6B00', '#FF9500', '#FFD700'],
  },
  streak_30: {
    id: 'streak_30',
    title: 'Efsanevi Seri!',
    subtitle: '30 gün kesintisiz',
    emoji: '💎',
    badge: 'Efsane',
    confettiColors: ['#00D4FF', '#7C3AED', '#FF6B9D'],
  },
  anniversary_1: {
    id: 'anniversary_1',
    title: '1 Yıl Birlikte!',
    subtitle: 'Renkioo ailesinin bir parçasısın',
    emoji: '🎂',
    badge: 'Sadık',
    confettiColors: ['#FF6B9D', '#7C3AED', '#5EEAD4', '#FFD700'],
  },
  og_user: {
    id: 'og_user',
    title: 'OG Kullanıcı!',
    subtitle: 'En başından beri buradasın',
    emoji: '⭐',
    badge: 'OG',
    confettiColors: ['#FFD700', '#7C3AED', '#FF6B9D'],
  },
};

interface DelightContextType {
  celebrateMilestone: (type: MilestoneType) => void;
  checkAnalysisCount: (count: number) => void;
  checkStreak: (streak: number) => void;
  checkAnniversary: () => void;
  markAsOG: () => void;
  earnedMilestones: MilestoneType[];
  currentCelebration: MilestoneType | null;
  dismissCelebration: () => void;
}

const DelightContext = createContext<DelightContextType | undefined>(undefined);

interface DelightProviderProps {
  children: React.ReactNode;
}

export function DelightProvider({ children }: DelightProviderProps) {
  const [earnedMilestones, setEarnedMilestones] = useState<MilestoneType[]>([]);
  const [currentCelebration, setCurrentCelebration] = useState<MilestoneType | null>(null);
  const [signupDate, setSignupDate] = useState<Date | null>(null);

  // Load milestones on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedMilestones = await AsyncStorage.getItem(MILESTONES_KEY);
        if (savedMilestones) {
          setEarnedMilestones(JSON.parse(savedMilestones));
        }

        const savedSignupDate = await AsyncStorage.getItem(SIGNUP_DATE_KEY);
        if (savedSignupDate) {
          setSignupDate(new Date(savedSignupDate));
        } else {
          // Set signup date for new users
          const now = new Date();
          await AsyncStorage.setItem(SIGNUP_DATE_KEY, now.toISOString());
          setSignupDate(now);
        }
      } catch (error) {
        console.error('Failed to load delight data:', error);
      }
    };
    loadData();
  }, []);

  const saveMilestone = useCallback(async (type: MilestoneType) => {
    const newMilestones = [...earnedMilestones, type];
    setEarnedMilestones(newMilestones);
    try {
      await AsyncStorage.setItem(MILESTONES_KEY, JSON.stringify(newMilestones));
    } catch (error) {
      console.error('Failed to save milestone:', error);
    }
  }, [earnedMilestones]);

  const celebrateMilestone = useCallback((type: MilestoneType) => {
    if (earnedMilestones.includes(type)) return;

    setCurrentCelebration(type);
    saveMilestone(type);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [earnedMilestones, saveMilestone]);

  const checkAnalysisCount = useCallback((count: number) => {
    if (count === 1 && !earnedMilestones.includes('first_analysis')) {
      celebrateMilestone('first_analysis');
    } else if (count === 10 && !earnedMilestones.includes('analysis_10')) {
      celebrateMilestone('analysis_10');
    } else if (count === 50 && !earnedMilestones.includes('analysis_50')) {
      celebrateMilestone('analysis_50');
    } else if (count === 100 && !earnedMilestones.includes('analysis_100')) {
      celebrateMilestone('analysis_100');
    }
  }, [earnedMilestones, celebrateMilestone]);

  const checkStreak = useCallback((streak: number) => {
    if (streak === 7 && !earnedMilestones.includes('streak_7')) {
      celebrateMilestone('streak_7');
    } else if (streak === 30 && !earnedMilestones.includes('streak_30')) {
      celebrateMilestone('streak_30');
    }
  }, [earnedMilestones, celebrateMilestone]);

  const checkAnniversary = useCallback(() => {
    if (!signupDate || earnedMilestones.includes('anniversary_1')) return;

    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (signupDate <= oneYearAgo) {
      celebrateMilestone('anniversary_1');
    }
  }, [signupDate, earnedMilestones, celebrateMilestone]);

  const markAsOG = useCallback(() => {
    if (!earnedMilestones.includes('og_user')) {
      celebrateMilestone('og_user');
    }
  }, [earnedMilestones, celebrateMilestone]);

  const dismissCelebration = useCallback(() => {
    setCurrentCelebration(null);
  }, []);

  return (
    <DelightContext.Provider
      value={{
        celebrateMilestone,
        checkAnalysisCount,
        checkStreak,
        checkAnniversary,
        markAsOG,
        earnedMilestones,
        currentCelebration,
        dismissCelebration,
      }}
    >
      {children}
      {currentCelebration && (
        <MilestoneCelebration
          milestone={MILESTONE_CONFIGS[currentCelebration]}
          onDismiss={dismissCelebration}
        />
      )}
    </DelightContext.Provider>
  );
}

export function useDelight(): DelightContextType {
  const context = useContext(DelightContext);
  if (!context) {
    throw new Error('useDelight must be used within a DelightProvider');
  }
  return context;
}

// Milestone Celebration Component
interface MilestoneCelebrationProps {
  milestone: MilestoneConfig;
  onDismiss: () => void;
}

function MilestoneCelebration({ milestone, onDismiss }: MilestoneCelebrationProps) {
  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.5);
  const emojiScale = useSharedValue(0);
  const badgeOpacity = useSharedValue(0);

  useEffect(() => {
    overlayOpacity.value = withTiming(1, { duration: 300 });
    cardScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    emojiScale.value = withDelay(
      200,
      withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(1, { damping: 10 })
      )
    );
    badgeOpacity.value = withDelay(500, withTiming(1, { duration: 300 }));
  }, []);

  const handleDismiss = () => {
    overlayOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onDismiss)();
    });
    cardScale.value = withTiming(0.8, { duration: 200 });
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
  }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Confetti colors={milestone.confettiColors} />

      <Pressable style={styles.dismissArea} onPress={handleDismiss}>
        <Animated.View style={[styles.celebrationCard, cardStyle]}>
          <Animated.Text style={[styles.emoji, emojiStyle]}>
            {milestone.emoji}
          </Animated.Text>

          <Text style={styles.title}>{milestone.title}</Text>
          <Text style={styles.subtitle}>{milestone.subtitle}</Text>

          {milestone.badge && (
            <Animated.View style={[styles.badgeContainer, badgeStyle]}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🏅 {milestone.badge}</Text>
              </View>
            </Animated.View>
          )}

          <Pressable style={styles.continueButton} onPress={handleDismiss}>
            <Text style={styles.continueText}>Devam Et</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// Confetti animation
function Confetti({ colors }: { colors: string[] }) {
  const pieces = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    color: colors[i % colors.length],
    startX: Math.random() * SCREEN_WIDTH,
    delay: Math.random() * 500,
    size: 8 + Math.random() * 8,
    shape: (Math.random() > 0.5 ? 'circle' : 'square') as 'circle' | 'square',
  }));

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}
    </View>
  );
}

interface ConfettiPieceProps {
  color: string;
  startX: number;
  delay: number;
  size: number;
  shape: 'circle' | 'square';
}

function ConfettiPiece({ color, startX, delay, size, shape }: ConfettiPieceProps) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT + 50, {
        duration: 3000 + Math.random() * 2000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startX + 50, { duration: 500 }),
          withTiming(startX - 50, { duration: 500 })
        ),
        -1,
        true
      )
    );

    rotation.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      )
    );

    opacity.value = withDelay(
      delay + 2000,
      withTiming(0, { duration: 1000 })
    );
  }, [delay, startX]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: shape === 'circle' ? size / 2 : 2,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  dismissArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  celebrationCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius['2xl'],
    padding: spacing['8'],
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing['4'],
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['2'],
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral.dark,
    textAlign: 'center',
    marginBottom: spacing['6'],
  },
  badgeContainer: {
    marginBottom: spacing['6'],
  },
  badge: {
    backgroundColor: Colors.secondary.lavender,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
  },
  badgeText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: Colors.secondary.lavender,
    paddingHorizontal: spacing['8'],
    paddingVertical: spacing['4'],
    borderRadius: radius.full,
  },
  continueText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  confettiPiece: {
    position: 'absolute',
  },
});

export default DelightProvider;
