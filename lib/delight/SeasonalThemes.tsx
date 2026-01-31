/**
 * Seasonal Themes - Holiday decorations
 * Phase 21: Polish & Delight
 *
 * Automatic seasonal decorations based on date:
 * - New Year (Dec 25 - Jan 5): Snow effect, Ioo with hat
 * - Valentine's (Feb 12 - Feb 16): Heart particles
 * - Summer (Jun 21 - Sep 22): Ioo with sunglasses
 * - Halloween (Oct 25 - Nov 2): Pumpkin Ioo
 * - Children's Day Turkey (Apr 23): Balloons
 */

import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
} from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SEASONAL_ENABLED_KEY = 'seasonal_themes_enabled';

type Season = 'newYear' | 'valentines' | 'summer' | 'halloween' | 'childrensDay' | null;

interface SeasonalConfig {
  id: Season;
  name: string;
  iooAccessory: string;
  particleEmojis: string[];
  accentColor: string;
}

const SEASONAL_CONFIGS: Record<NonNullable<Season>, SeasonalConfig> = {
  newYear: {
    id: 'newYear',
    name: 'Yeni Yıl',
    iooAccessory: '🎅',
    particleEmojis: ['❄️', '⭐', '✨', '🎄', '🎁'],
    accentColor: '#E74C3C',
  },
  valentines: {
    id: 'valentines',
    name: 'Sevgililer Günü',
    iooAccessory: '💕',
    particleEmojis: ['❤️', '💖', '💝', '💗', '💓'],
    accentColor: '#E91E63',
  },
  summer: {
    id: 'summer',
    name: 'Yaz',
    iooAccessory: '🕶️',
    particleEmojis: ['☀️', '🌴', '🍉', '🌊', '🐚'],
    accentColor: '#FF9800',
  },
  halloween: {
    id: 'halloween',
    name: 'Cadılar Bayramı',
    iooAccessory: '🎃',
    particleEmojis: ['🎃', '👻', '🦇', '🕷️', '🍬'],
    accentColor: '#FF5722',
  },
  childrensDay: {
    id: 'childrensDay',
    name: '23 Nisan',
    iooAccessory: '🎈',
    particleEmojis: ['🎈', '🎉', '🇹🇷', '🎊', '⭐'],
    accentColor: '#E53935',
  },
};

interface SeasonalContextType {
  currentSeason: Season;
  seasonConfig: SeasonalConfig | null;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  IooAccessory: React.FC<{ size?: number }>;
}

const SeasonalContext = createContext<SeasonalContextType | undefined>(undefined);

function detectSeason(): Season {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();

  // New Year: Dec 25 - Jan 5
  if ((month === 11 && day >= 25) || (month === 0 && day <= 5)) {
    return 'newYear';
  }

  // Valentine's: Feb 12 - Feb 16
  if (month === 1 && day >= 12 && day <= 16) {
    return 'valentines';
  }

  // Children's Day Turkey: Apr 23
  if (month === 3 && day === 23) {
    return 'childrensDay';
  }

  // Summer: Jun 21 - Sep 22
  if (
    (month === 5 && day >= 21) ||
    (month >= 6 && month <= 7) ||
    (month === 8 && day <= 22)
  ) {
    return 'summer';
  }

  // Halloween: Oct 25 - Nov 2
  if ((month === 9 && day >= 25) || (month === 10 && day <= 2)) {
    return 'halloween';
  }

  return null;
}

interface SeasonalProviderProps {
  children: React.ReactNode;
}

export function SeasonalProvider({ children }: SeasonalProviderProps) {
  const [isEnabled, setIsEnabledState] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentSeason = useMemo(() => detectSeason(), []);
  const seasonConfig = currentSeason ? SEASONAL_CONFIGS[currentSeason] : null;

  // Load preference
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(SEASONAL_ENABLED_KEY);
        if (saved !== null) {
          setIsEnabledState(saved === 'true');
        }
      } catch (error) {
        console.error('Failed to load seasonal preference:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadPreference();
  }, []);

  const setEnabled = async (enabled: boolean) => {
    setIsEnabledState(enabled);
    try {
      await AsyncStorage.setItem(SEASONAL_ENABLED_KEY, enabled.toString());
    } catch (error) {
      console.error('Failed to save seasonal preference:', error);
    }
  };

  const IooAccessory: React.FC<{ size?: number }> = ({ size = 24 }) => {
    if (!currentSeason || !isEnabled || !seasonConfig) {
      return null;
    }
    return (
      <View style={styles.accessoryContainer}>
        <Animated.Text style={{ fontSize: size }}>
          {seasonConfig.iooAccessory}
        </Animated.Text>
      </View>
    );
  };

  if (!isLoaded) {
    return <>{children}</>;
  }

  return (
    <SeasonalContext.Provider
      value={{
        currentSeason,
        seasonConfig,
        isEnabled,
        setEnabled,
        IooAccessory,
      }}
    >
      {children}
      {isEnabled && currentSeason && <SeasonalParticles />}
    </SeasonalContext.Provider>
  );
}

export function useSeasonal(): SeasonalContextType {
  const context = useContext(SeasonalContext);
  if (!context) {
    throw new Error('useSeasonal must be used within a SeasonalProvider');
  }
  return context;
}

// Seasonal Particles Effect
function SeasonalParticles() {
  const { seasonConfig } = useSeasonal();

  if (!seasonConfig) return null;

  // Only render a few particles to not be distracting
  const particleCount = 5;

  return (
    <View style={styles.particleOverlay} pointerEvents="none">
      {Array.from({ length: particleCount }).map((_, index) => (
        <SeasonalParticle
          key={index}
          emoji={seasonConfig.particleEmojis[index % seasonConfig.particleEmojis.length]}
          delay={index * 2000}
          startX={Math.random() * SCREEN_WIDTH}
        />
      ))}
    </View>
  );
}

interface SeasonalParticleProps {
  emoji: string;
  delay: number;
  startX: number;
}

function SeasonalParticle({ emoji, delay, startX }: SeasonalParticleProps) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const startAnimation = () => {
      translateY.value = -50;
      translateX.value = startX;
      opacity.value = 0;
      rotation.value = 0;

      opacity.value = withDelay(delay, withTiming(0.6, { duration: 500 }));

      translateY.value = withDelay(
        delay,
        withTiming(SCREEN_HEIGHT + 50, {
          duration: 8000 + Math.random() * 4000,
          easing: Easing.linear,
        })
      );

      translateX.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(startX + 30, { duration: 1500 }),
            withTiming(startX - 30, { duration: 1500 })
          ),
          -1,
          true
        )
      );

      rotation.value = withDelay(
        delay,
        withRepeat(
          withTiming(360, { duration: 4000, easing: Easing.linear }),
          -1,
          false
        )
      );
    };

    startAnimation();

    // Restart animation periodically
    const interval = setInterval(() => {
      startAnimation();
    }, 12000 + delay);

    return () => {
      clearInterval(interval);
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(rotation);
      cancelAnimation(opacity);
    };
  }, [delay, startX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.seasonalParticle, animatedStyle]}>
      {emoji}
    </Animated.Text>
  );
}

// Snow effect for winter
export function SnowEffect({ intensity = 20 }: { intensity?: number }) {
  return (
    <View style={styles.particleOverlay} pointerEvents="none">
      {Array.from({ length: intensity }).map((_, index) => (
        <Snowflake key={index} delay={index * 300} />
      ))}
    </View>
  );
}

function Snowflake({ delay }: { delay: number }) {
  const startX = Math.random() * SCREEN_WIDTH;
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(startX);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3 + Math.random() * 0.7);

  useEffect(() => {
    const animate = () => {
      translateY.value = -20;
      opacity.value = withDelay(delay, withTiming(0.8, { duration: 300 }));

      translateY.value = withDelay(
        delay,
        withTiming(SCREEN_HEIGHT + 20, {
          duration: 5000 + Math.random() * 5000,
          easing: Easing.linear,
        })
      );

      translateX.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(startX + 20, { duration: 1000 }),
            withTiming(startX - 20, { duration: 1000 })
          ),
          -1,
          true
        )
      );
    };

    animate();
    const interval = setInterval(animate, 10000 + delay);

    return () => {
      clearInterval(interval);
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(opacity);
    };
  }, [delay, startX]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return <Animated.Text style={[styles.snowflake, style]}>❄️</Animated.Text>;
}

// Heart rain for Valentine's
export function HeartRain({ intensity = 15 }: { intensity?: number }) {
  const hearts = ['❤️', '💖', '💕', '💗', '💓'];

  return (
    <View style={styles.particleOverlay} pointerEvents="none">
      {Array.from({ length: intensity }).map((_, index) => (
        <FallingHeart
          key={index}
          emoji={hearts[index % hearts.length]}
          delay={index * 400}
        />
      ))}
    </View>
  );
}

function FallingHeart({ emoji, delay }: { emoji: string; delay: number }) {
  const startX = Math.random() * SCREEN_WIDTH;
  const translateY = useSharedValue(-30);
  const translateX = useSharedValue(startX);
  const scale = useSharedValue(0.5 + Math.random() * 0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const animate = () => {
      translateY.value = -30;
      opacity.value = withDelay(delay, withTiming(0.7, { duration: 300 }));

      translateY.value = withDelay(
        delay,
        withTiming(SCREEN_HEIGHT + 30, {
          duration: 4000 + Math.random() * 3000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );

      translateX.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(startX + 15, { duration: 800 }),
            withTiming(startX - 15, { duration: 800 })
          ),
          -1,
          true
        )
      );
    };

    animate();
    const interval = setInterval(animate, 7000 + delay);

    return () => {
      clearInterval(interval);
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(opacity);
    };
  }, [delay, startX]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return <Animated.Text style={[styles.fallingHeart, style]}>{emoji}</Animated.Text>;
}

const styles = StyleSheet.create({
  accessoryContainer: {
    position: 'absolute',
    top: -10,
    right: -5,
  },
  particleOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  seasonalParticle: {
    position: 'absolute',
    fontSize: 20,
  },
  snowflake: {
    position: 'absolute',
    fontSize: 16,
  },
  fallingHeart: {
    position: 'absolute',
    fontSize: 18,
  },
});

export default SeasonalProvider;
