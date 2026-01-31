/**
 * Easter Eggs - Hidden delights
 * Phase 21: Polish & Delight
 *
 * Fun hidden features to surprise and delight users:
 * - Tap Ioo 10 times for special animation
 * - Konami code for secret
 * - Birthday surprise
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  withRepeat,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BIRTHDAY_KEY = 'user_birthday';
const EASTER_EGG_DISCOVERED = 'easter_eggs_discovered';

// Konami code: up, up, down, down, left, right, left, right, B, A
const KONAMI_CODE = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];

interface EasterEggContextType {
  triggerMascotSecret: () => void;
  registerKeyPress: (key: string) => void;
  checkBirthday: () => boolean;
  setBirthday: (date: Date) => Promise<void>;
  discoveredEggs: string[];
  markEggDiscovered: (eggId: string) => void;
  showSecretAnimation: boolean;
  secretAnimationType: 'mascot' | 'konami' | 'birthday' | null;
  dismissSecret: () => void;
}

const EasterEggContext = createContext<EasterEggContextType | undefined>(undefined);

interface EasterEggProviderProps {
  children: React.ReactNode;
}

export function EasterEggProvider({ children }: EasterEggProviderProps) {
  const [discoveredEggs, setDiscoveredEggs] = useState<string[]>([]);
  const [showSecretAnimation, setShowSecretAnimation] = useState(false);
  const [secretAnimationType, setSecretAnimationType] = useState<'mascot' | 'konami' | 'birthday' | null>(null);

  const mascotTapCount = useRef(0);
  const mascotTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const konamiProgress = useRef<string[]>([]);
  const birthdayRef = useRef<Date | null>(null);

  // Load discovered eggs on mount
  useEffect(() => {
    const loadDiscovered = async () => {
      try {
        const saved = await AsyncStorage.getItem(EASTER_EGG_DISCOVERED);
        if (saved) {
          setDiscoveredEggs(JSON.parse(saved));
        }
        const birthday = await AsyncStorage.getItem(BIRTHDAY_KEY);
        if (birthday) {
          birthdayRef.current = new Date(birthday);
        }
      } catch (error) {
        console.error('Failed to load easter egg data:', error);
      }
    };
    loadDiscovered();
  }, []);

  const markEggDiscovered = useCallback(async (eggId: string) => {
    if (!discoveredEggs.includes(eggId)) {
      const newEggs = [...discoveredEggs, eggId];
      setDiscoveredEggs(newEggs);
      try {
        await AsyncStorage.setItem(EASTER_EGG_DISCOVERED, JSON.stringify(newEggs));
      } catch (error) {
        console.error('Failed to save easter egg:', error);
      }
    }
  }, [discoveredEggs]);

  const triggerSecret = useCallback((type: 'mascot' | 'konami' | 'birthday') => {
    setSecretAnimationType(type);
    setShowSecretAnimation(true);
    markEggDiscovered(type);

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [markEggDiscovered]);

  const triggerMascotSecret = useCallback(() => {
    mascotTapCount.current += 1;

    // Clear existing timer
    if (mascotTapTimer.current) {
      clearTimeout(mascotTapTimer.current);
    }

    // Reset after 2 seconds of no taps
    mascotTapTimer.current = setTimeout(() => {
      mascotTapCount.current = 0;
    }, 2000);

    // Trigger secret after 10 taps
    if (mascotTapCount.current >= 10) {
      mascotTapCount.current = 0;
      triggerSecret('mascot');
    }
  }, [triggerSecret]);

  const registerKeyPress = useCallback((key: string) => {
    konamiProgress.current.push(key.toLowerCase());

    // Keep only last 10 keys
    if (konamiProgress.current.length > 10) {
      konamiProgress.current.shift();
    }

    // Check for Konami code
    if (konamiProgress.current.length === 10) {
      const matches = konamiProgress.current.every(
        (k, i) => k === KONAMI_CODE[i]
      );
      if (matches) {
        konamiProgress.current = [];
        triggerSecret('konami');
      }
    }
  }, [triggerSecret]);

  const checkBirthday = useCallback((): boolean => {
    if (!birthdayRef.current) return false;

    const today = new Date();
    const birthday = birthdayRef.current;

    return (
      today.getMonth() === birthday.getMonth() &&
      today.getDate() === birthday.getDate()
    );
  }, []);

  const setBirthday = useCallback(async (date: Date) => {
    birthdayRef.current = date;
    try {
      await AsyncStorage.setItem(BIRTHDAY_KEY, date.toISOString());
    } catch (error) {
      console.error('Failed to save birthday:', error);
    }
  }, []);

  const dismissSecret = useCallback(() => {
    setShowSecretAnimation(false);
    setSecretAnimationType(null);
  }, []);

  return (
    <EasterEggContext.Provider
      value={{
        triggerMascotSecret,
        registerKeyPress,
        checkBirthday,
        setBirthday,
        discoveredEggs,
        markEggDiscovered,
        showSecretAnimation,
        secretAnimationType,
        dismissSecret,
      }}
    >
      {children}
      {showSecretAnimation && (
        <SecretAnimationOverlay
          type={secretAnimationType}
          onDismiss={dismissSecret}
        />
      )}
    </EasterEggContext.Provider>
  );
}

export function useEasterEggs(): EasterEggContextType {
  const context = useContext(EasterEggContext);
  if (!context) {
    throw new Error('useEasterEggs must be used within an EasterEggProvider');
  }
  return context;
}

// Secret Animation Overlay
interface SecretAnimationOverlayProps {
  type: 'mascot' | 'konami' | 'birthday' | null;
  onDismiss: () => void;
}

function SecretAnimationOverlay({ type, onDismiss }: SecretAnimationOverlayProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const rotation = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });

    if (type === 'mascot') {
      // Spin animation for mascot secret
      rotation.value = withRepeat(
        withTiming(360, { duration: 500, easing: Easing.linear }),
        3,
        false
      );
    } else if (type === 'konami') {
      // Rainbow pulse for konami
      rotation.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }

    // Auto dismiss after 3 seconds
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(onDismiss)();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [type]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const getMessage = () => {
    switch (type) {
      case 'mascot':
        return '🎉 Ioo seni çok seviyor! 🎉';
      case 'konami':
        return '⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️🅱️🅰️\nGizli kodu buldun!';
      case 'birthday':
        return '🎂 Doğum Günün Kutlu Olsun! 🎂';
      default:
        return '';
    }
  };

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Animated.View style={[styles.secretContent, contentStyle]}>
        <Animated.Text style={styles.secretText}>{getMessage()}</Animated.Text>
        {type === 'mascot' && <MascotSecretAnimation />}
        {type === 'konami' && <RainbowParticles />}
        {type === 'birthday' && <BirthdayAnimation />}
      </Animated.View>
    </Animated.View>
  );
}

// Mascot Secret Animation - Ioo does a happy dance
function MascotSecretAnimation() {
  const bounce = useSharedValue(0);
  const wiggle = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 150 }),
        withSpring(0, { damping: 8 })
      ),
      5,
      false
    );
    wiggle.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 100 }),
        withTiming(15, { duration: 100 })
      ),
      10,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bounce.value },
      { rotate: `${wiggle.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.mascotContainer, animatedStyle]}>
      <Animated.Text style={styles.mascotEmoji}>🐣</Animated.Text>
    </Animated.View>
  );
}

// Rainbow particles for Konami code
function RainbowParticles() {
  const particles = ['🌈', '✨', '⭐', '💫', '🎮', '🕹️'];

  return (
    <View style={styles.particleContainer}>
      {particles.map((particle, index) => (
        <RainbowParticle key={index} emoji={particle} delay={index * 100} />
      ))}
    </View>
  );
}

function RainbowParticle({ emoji, delay }: { emoji: string; delay: number }) {
  const translateY = useSharedValue(100);
  const translateX = useSharedValue((Math.random() - 0.5) * SCREEN_WIDTH * 0.5);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 10 }));
    translateY.value = withDelay(
      delay,
      withTiming(-100, { duration: 1500, easing: Easing.out(Easing.quad) })
    );
  }, [delay]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.particle, style]}>{emoji}</Animated.Text>
  );
}

// Birthday animation
function BirthdayAnimation() {
  const candles = ['🕯️', '🎂', '🕯️'];

  return (
    <View style={styles.birthdayContainer}>
      {candles.map((candle, index) => (
        <BirthdayCandle key={index} emoji={candle} delay={index * 150} />
      ))}
      <View style={styles.confettiRow}>
        {['🎈', '🎁', '🎊', '🎉', '🎈'].map((emoji, index) => (
          <ConfettiPiece key={index} emoji={emoji} delay={index * 100} />
        ))}
      </View>
    </View>
  );
}

function BirthdayCandle({ emoji, delay }: { emoji: string; delay: number }) {
  const scale = useSharedValue(0);
  const glow = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 8 }));
    glow.value = withDelay(
      delay + 300,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.5, { duration: 500 })
        ),
        -1,
        true
      )
    );
  }, [delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.5 + glow.value * 0.5,
  }));

  return <Animated.Text style={[styles.candle, style]}>{emoji}</Animated.Text>;
}

function ConfettiPiece({ emoji, delay }: { emoji: string; delay: number }) {
  const translateY = useSharedValue(-50);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1));
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(10, { duration: 300 }),
          withTiming(-10, { duration: 300 })
        ),
        -1,
        true
      )
    );
    rotation.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, [delay]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return <Animated.Text style={[styles.confetti, style]}>{emoji}</Animated.Text>;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  secretContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  secretText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  mascotContainer: {
    marginTop: 20,
  },
  mascotEmoji: {
    fontSize: 80,
  },
  particleContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    fontSize: 40,
  },
  birthdayContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  candle: {
    fontSize: 60,
    marginHorizontal: 5,
  },
  confettiRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  confetti: {
    fontSize: 30,
  },
});

export default EasterEggProvider;
