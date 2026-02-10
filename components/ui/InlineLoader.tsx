/**
 * InlineLoader Component
 *
 * Small, inline loading indicators for buttons, cards, and sections
 * Matches the app's organic, child-friendly design
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ioo, IooSize } from '@/components/Ioo';
import { Colors } from '@/constants/colors';

type LoaderSize = 'tiny' | 'small' | 'medium';
type LoaderVariant = 'dots' | 'pulse' | 'bounce' | 'ioo';

interface InlineLoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  color?: string;
  message?: string;
  showMessage?: boolean;
}

const SIZE_CONFIG: Record<LoaderSize, { dot: number; gap: number; ioo: IooSize }> = {
  tiny: { dot: 4, gap: 4, ioo: 'xs' },
  small: { dot: 6, gap: 6, ioo: 'xs' },
  medium: { dot: 8, gap: 8, ioo: 'sm' },
};

export function InlineLoader({
  size = 'small',
  variant = 'dots',
  color = Colors.secondary.lavender,
  message,
  showMessage = false,
}: InlineLoaderProps) {
  const config = SIZE_CONFIG[size];

  // Animation values
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (variant === 'dots' || variant === 'bounce') {
      // Staggered dot animation
      const createDotAnimation = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: variant === 'bounce' ? -6 : 1,
              duration: 300,
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ])
        );
      };

      const animations = [
        createDotAnimation(dot1Anim, 0),
        createDotAnimation(dot2Anim, 100),
        createDotAnimation(dot3Anim, 200),
      ];

      animations.forEach((anim) => anim.start());

      return () => {
        animations.forEach((anim) => anim.stop());
      };
    }

    if (variant === 'pulse') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      ).start();
    }
  }, [variant]);

  const renderDots = () => {
    const dotStyle = {
      width: config.dot,
      height: config.dot,
      borderRadius: config.dot / 2,
      backgroundColor: color,
    };

    if (variant === 'bounce') {
      return (
        <View style={[styles.dotsContainer, { gap: config.gap }]}>
          <Animated.View
            style={[dotStyle, { transform: [{ translateY: dot1Anim }] }]}
          />
          <Animated.View
            style={[dotStyle, { transform: [{ translateY: dot2Anim }] }]}
          />
          <Animated.View
            style={[dotStyle, { transform: [{ translateY: dot3Anim }] }]}
          />
        </View>
      );
    }

    return (
      <View style={[styles.dotsContainer, { gap: config.gap }]}>
        <Animated.View
          style={[
            dotStyle,
            {
              opacity: dot1Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            dotStyle,
            {
              opacity: dot2Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            dotStyle,
            {
              opacity: dot3Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
          ]}
        />
      </View>
    );
  };

  const renderPulse = () => {
    return (
      <Animated.View
        style={[
          styles.pulseCircle,
          {
            width: config.dot * 3,
            height: config.dot * 3,
            borderRadius: (config.dot * 3) / 2,
            backgroundColor: color,
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({
              inputRange: [1, 1.2],
              outputRange: [1, 0.6],
            }),
          },
        ]}
      />
    );
  };

  const renderIoo = () => {
    return (
      <View style={styles.iooContainer}>
        <Ioo size={config.ioo} mood="thinking" animated={true} />
      </View>
    );
  };

  const renderLoader = () => {
    switch (variant) {
      case 'pulse':
        return renderPulse();
      case 'ioo':
        return renderIoo();
      case 'dots':
      case 'bounce':
      default:
        return renderDots();
    }
  };

  return (
    <View style={styles.container}>
      {renderLoader()}
      {showMessage && message && (
        <Text style={[styles.message, { color }]}>{message}</Text>
      )}
    </View>
  );
}

// Pre-built loader configurations
export function ButtonLoader({ color = Colors.neutral.white }: { color?: string }) {
  return <InlineLoader size="tiny" variant="dots" color={color} />;
}

export function CardLoader() {
  return (
    <View style={styles.cardLoaderContainer}>
      <InlineLoader size="medium" variant="ioo" />
      <Text style={styles.cardLoaderText}>Yükleniyor...</Text>
    </View>
  );
}

export function SectionLoader({ message = 'Yükleniyor...' }: { message?: string }) {
  return (
    <View style={styles.sectionLoaderContainer}>
      <InlineLoader size="small" variant="bounce" />
      <Text style={styles.sectionLoaderText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseCircle: {
    // Styles applied dynamically
  },
  iooContainer: {
    transform: [{ scale: 0.8 }],
  },
  message: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Pre-built configurations
  cardLoaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  cardLoaderText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral.gray400,
  },
  sectionLoaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  sectionLoaderText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
});

export default InlineLoader;
