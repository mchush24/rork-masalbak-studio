/**
 * Seasonal Themes
 * Phase 21: Polish & Delight
 *
 * Holiday and seasonal visual themes
 */

import React, { useState, useEffect, memo, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { zIndex } from '@/constants/design-system';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Season types
export type SeasonType =
  | 'none'
  | 'new_year'
  | 'valentines'
  | 'spring'
  | 'summer'
  | 'halloween'
  | 'winter';

/**
 * Get current season based on date
 */
export function getCurrentSeason(): SeasonType {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // New Year (Dec 25 - Jan 7)
  if ((month === 12 && day >= 25) || (month === 1 && day <= 7)) {
    return 'new_year';
  }

  // Valentine's (Feb 10-16)
  if (month === 2 && day >= 10 && day <= 16) {
    return 'valentines';
  }

  // Spring (Mar 20 - May 31)
  if ((month === 3 && day >= 20) || month === 4 || month === 5) {
    return 'spring';
  }

  // Summer (Jun 1 - Aug 31)
  if (month >= 6 && month <= 8) {
    return 'summer';
  }

  // Halloween (Oct 25 - Nov 1)
  if ((month === 10 && day >= 25) || (month === 11 && day === 1)) {
    return 'halloween';
  }

  // Winter (Nov 15 - Dec 24)
  if ((month === 11 && day >= 15) || (month === 12 && day < 25)) {
    return 'winter';
  }

  return 'none';
}

/**
 * Seasonal color palettes
 */
export const SEASONAL_COLORS: Record<
  SeasonType,
  { primary: string; secondary: string; accent: string; particles: string[] }
> = {
  none: {
    primary: Colors.secondary.lavender,
    secondary: Colors.secondary.rose,
    accent: Colors.secondary.mint,
    particles: [],
  },
  new_year: {
    primary: '#FFD700',
    secondary: '#FF6B6B',
    accent: '#4ECDC4',
    particles: ['#FFD700', '#FF6B6B', '#4ECDC4', Colors.neutral.white],
  },
  valentines: {
    primary: '#FF6B9D',
    secondary: '#C084FC',
    accent: '#FCA5A5',
    particles: ['#FF6B9D', '#FCA5A5', '#FECDD3', Colors.neutral.white],
  },
  spring: {
    primary: '#86EFAC',
    secondary: '#FDE68A',
    accent: '#A5B4FC',
    particles: ['#FBBF24', '#34D399', '#A78BFA', Colors.neutral.white],
  },
  summer: {
    primary: '#FCD34D',
    secondary: '#FB923C',
    accent: '#38BDF8',
    particles: ['#FCD34D', '#FB923C', '#38BDF8', Colors.neutral.white],
  },
  halloween: {
    primary: '#F97316',
    secondary: '#8B5CF6',
    accent: '#22C55E',
    particles: ['#F97316', '#8B5CF6', '#000000', Colors.neutral.white],
  },
  winter: {
    primary: '#60A5FA',
    secondary: '#A5B4FC',
    accent: '#F0F9FF',
    particles: [Colors.neutral.white, '#E0F2FE', '#BAE6FD', '#A5B4FC'],
  },
};

/**
 * Snowflake component for winter theme
 */
const Snowflake = memo(function Snowflake({
  delay,
  duration,
  startX,
  size,
}: {
  delay: number;
  duration: number;
  startX: number;
  size: number;
}) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.8, { duration: 500 }));

    translateY.value = withDelay(
      delay,
      withRepeat(withTiming(SCREEN_HEIGHT + 50, { duration, easing: Easing.linear }), -1, false)
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startX + 30, { duration: duration / 4 }),
          withTiming(startX - 30, { duration: duration / 4 }),
          withTiming(startX + 20, { duration: duration / 4 }),
          withTiming(startX, { duration: duration / 4 })
        ),
        -1,
        false
      )
    );

    rotation.value = withDelay(
      delay,
      withRepeat(withTiming(360, { duration: duration * 2, easing: Easing.linear }), -1, false)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: rotation.value + 'deg' },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.snowflake, { width: size, height: size }, animatedStyle]}>
      <View style={[styles.snowflakeInner, { backgroundColor: Colors.neutral.white }]} />
    </Animated.View>
  );
});

/**
 * Heart particle for Valentine's theme
 */
const HeartParticle = memo(function HeartParticle({
  delay,
  startX,
  size,
  color,
}: {
  delay: number;
  startX: number;
  size: number;
  color: string;
}) {
  const translateY = useSharedValue(SCREEN_HEIGHT + 50);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.7, { duration: 300 }));
    scale.value = withDelay(delay, withTiming(1, { duration: 500 }));

    translateY.value = withDelay(
      delay,
      withRepeat(withTiming(-100, { duration: 8000, easing: Easing.out(Easing.cubic) }), -1, false)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.heartContainer, { left: startX, width: size, height: size }, animatedStyle]}
    >
      <View style={[styles.heart, { backgroundColor: color }]} />
    </Animated.View>
  );
});

/**
 * Firework particle for New Year
 */
const Firework = memo(function Firework({ delay, x, y }: { delay: number; x: number; y: number }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const animate = () => {
      scale.value = 0;
      opacity.value = 0;

      scale.value = withDelay(
        delay,
        withSequence(
          withTiming(1.5, { duration: 300 }),
          withTiming(2, { duration: 500 }),
          withTiming(0, { duration: 300 })
        )
      );

      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0.8, { duration: 500 }),
          withTiming(0, { duration: 300 })
        )
      );
    };

    animate();
    const interval = setInterval(animate, 3000 + delay);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const colors = SEASONAL_COLORS.new_year.particles;

  return (
    <Animated.View style={[styles.firework, { left: x, top: y }, animatedStyle]}>
      {colors.map((color, i) => (
        <View
          key={i}
          style={[
            styles.fireworkParticle,
            {
              backgroundColor: color,
              transform: [{ rotate: i * 90 + 'deg' }, { translateY: -15 }],
            },
          ]}
        />
      ))}
    </Animated.View>
  );
});

/**
 * Seasonal Effects Overlay
 */
interface SeasonalEffectsProps {
  season?: SeasonType;
  intensity?: 'low' | 'medium' | 'high';
  enabled?: boolean;
}

export const SeasonalEffects = memo(function SeasonalEffects({
  season: forcedSeason,
  intensity = 'medium',
  enabled = true,
}: SeasonalEffectsProps) {
  const season = forcedSeason || getCurrentSeason();

  const particleCount = useMemo(() => {
    switch (intensity) {
      case 'low':
        return 10;
      case 'medium':
        return 20;
      case 'high':
        return 35;
      default:
        return 20;
    }
  }, [intensity]);

  if (!enabled || season === 'none') {
    return null;
  }

  return (
    <View style={styles.effectsContainer} pointerEvents="none">
      {/* Winter - Snowflakes */}
      {(season === 'winter' || season === 'new_year') &&
        Array.from({ length: particleCount }).map((_, i) => (
          <Snowflake
            key={'snow_' + i}
            delay={i * 200}
            duration={5000 + Math.random() * 3000}
            startX={Math.random() * SCREEN_WIDTH}
            size={4 + Math.random() * 8}
          />
        ))}

      {/* Valentine's - Hearts */}
      {season === 'valentines' &&
        Array.from({ length: Math.floor(particleCount / 2) }).map((_, i) => (
          <HeartParticle
            key={'heart_' + i}
            delay={i * 500}
            startX={Math.random() * SCREEN_WIDTH}
            size={12 + Math.random() * 12}
            color={SEASONAL_COLORS.valentines.particles[i % 4]}
          />
        ))}

      {/* New Year - Fireworks */}
      {season === 'new_year' &&
        Array.from({ length: 5 }).map((_, i) => (
          <Firework
            key={'firework_' + i}
            delay={i * 600}
            x={SCREEN_WIDTH * 0.2 + Math.random() * SCREEN_WIDTH * 0.6}
            y={SCREEN_HEIGHT * 0.1 + Math.random() * SCREEN_HEIGHT * 0.3}
          />
        ))}
    </View>
  );
});

/**
 * Hook for seasonal theme colors
 */
export function useSeasonalTheme(forcedSeason?: SeasonType) {
  const [season, setSeason] = useState<SeasonType>(forcedSeason || getCurrentSeason());

  useEffect(() => {
    if (!forcedSeason) {
      setSeason(getCurrentSeason());
    }
  }, [forcedSeason]);

  const colors = SEASONAL_COLORS[season];
  const isSeasonActive = season !== 'none';

  return {
    season,
    colors,
    isSeasonActive,
    primaryColor: colors.primary,
    secondaryColor: colors.secondary,
    accentColor: colors.accent,
  };
}

/**
 * Ioo seasonal accessories
 */
export type IooAccessory =
  | 'none'
  | 'santa_hat'
  | 'heart_glasses'
  | 'sunglasses'
  | 'witch_hat'
  | 'party_hat'
  | 'flower_crown';

export function getSeasonalIooAccessory(season: SeasonType): IooAccessory {
  switch (season) {
    case 'new_year':
      return 'party_hat';
    case 'winter':
      return 'santa_hat';
    case 'valentines':
      return 'heart_glasses';
    case 'summer':
      return 'sunglasses';
    case 'spring':
      return 'flower_crown';
    case 'halloween':
      return 'witch_hat';
    default:
      return 'none';
  }
}

const styles = StyleSheet.create({
  effectsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: zIndex.overlay,
  },
  snowflake: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snowflakeInner: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  heartContainer: {
    position: 'absolute',
    bottom: 0,
  },
  heart: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  firework: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireworkParticle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
