import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { shadows } from '@/constants/design-system';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Circle, Ellipse, Path } from 'react-native-svg';
import { IooMood, IooSize, getPixelSize } from '@/constants/ioo-config';
import { Colors } from '@/constants/colors';

// =============================================================================
// IOO FINAL - Minimal, Temiz, Profesyonel
// =============================================================================
// Prensip: Az çoktur. Temiz çizgiler, doğru oranlar, sıcak renkler.
// İlham: Molang, Pusheen, Studio Ghibli dust sprites
// =============================================================================

// Re-export types for backwards compatibility
export type { IooMood, IooSize } from '@/constants/ioo-config';

interface Props {
  size?: IooSize | number;
  mood?: IooMood;
  animated?: boolean;
  onPress?: () => void;
  showGlow?: boolean;
  showSparkles?: boolean;
}

// Sıcak, temiz renk paleti
const COLORS = {
  // Beden - sıcak krem
  bodyLight: '#FFF9F0',
  bodyMain: '#FFF0E0',
  bodyDark: '#FFE4CC',
  bodyShadow: '#F5D4B8',

  // Gözler
  eyeWhite: Colors.neutral.white,
  eyeIris: '#2D1F15',
  eyeHighlight: Colors.neutral.white,

  // Yanaklar
  cheek: '#FFCACA',

  // Ağız
  mouth: '#D4A08A',

  // Glow
  glow: 'rgba(255, 240, 224, 0.5)',
};

export function IooMascotFinal({
  size: sizeProp = 'medium',
  mood = 'happy',
  animated = true,
  onPress,
  showGlow = true,
  showSparkles = false, // not used but for API compatibility
}: Props) {

  // Size hesaplama
  const size = getPixelSize(sizeProp);

  // === Animasyon değerleri ===
  const floatY = useSharedValue(0);
  const breathScale = useSharedValue(1);
  const eyeScaleY = useSharedValue(1);
  const leftPupilX = useSharedValue(0);
  const rightPupilX = useSharedValue(0);
  const pupilY = useSharedValue(0);
  const bounceY = useSharedValue(0);
  const wiggleRotate = useSharedValue(0);

  useEffect(() => {
    if (!animated) return;

    // Yumuşak yüzme
    floatY.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(4, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Nefes alma
    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.98, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Göz kırpma
    const blink = () => {
      eyeScaleY.value = withSequence(
        withTiming(0.1, { duration: 80 }),
        withTiming(1, { duration: 100 })
      );
    };
    const blinkInterval = setInterval(blink, 3000 + Math.random() * 2000);

    // Bakış
    const look = () => {
      const x = (Math.random() - 0.5) * 3;
      const y = (Math.random() - 0.5) * 2;
      leftPupilX.value = withSpring(x, { damping: 15 });
      rightPupilX.value = withSpring(x, { damping: 15 });
      pupilY.value = withSpring(y, { damping: 15 });

      setTimeout(() => {
        leftPupilX.value = withSpring(0, { damping: 15 });
        rightPupilX.value = withSpring(0, { damping: 15 });
        pupilY.value = withSpring(0, { damping: 15 });
      }, 1200);
    };
    const lookInterval = setInterval(look, 4000);

    // Mood animasyonları
    if (mood === 'excited') {
      bounceY.value = withRepeat(
        withSequence(
          withSpring(-8, { damping: 5, stiffness: 300 }),
          withSpring(0, { damping: 5, stiffness: 300 })
        ),
        -1
      );
    }

    return () => {
      clearInterval(blinkInterval);
      clearInterval(lookInterval);
    };
  }, [animated, mood]);

  // Dokunma
  const handlePress = () => {
    wiggleRotate.value = withSequence(
      withTiming(-5, { duration: 50 }),
      withTiming(5, { duration: 50 }),
      withTiming(-3, { duration: 50 }),
      withTiming(3, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    bounceY.value = withSequence(
      withSpring(-10, { damping: 4, stiffness: 400 }),
      withSpring(0, { damping: 6, stiffness: 200 })
    );
    onPress?.();
  };

  // === Animated Styles ===
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value + bounceY.value },
      { scale: breathScale.value },
      { rotate: `${wiggleRotate.value}deg` },
    ],
  }));

  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: eyeScaleY.value }],
  }));

  const leftPupilStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: leftPupilX.value },
      { translateY: pupilY.value },
    ],
  }));

  const rightPupilStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: rightPupilX.value },
      { translateY: pupilY.value },
    ],
  }));

  // === Oranlar (Golden Ratio yaklaşımı) ===
  const bodySize = size;
  const eyeSize = size * 0.22;          // Göz boyutu
  const irisSize = eyeSize * 0.7;       // İris boyutu
  const highlightSize = irisSize * 0.35; // Highlight boyutu
  const eyeSpacing = size * 0.08;       // Gözler arası
  const eyeY = size * 0.38;             // Göz yüksekliği
  const cheekSize = size * 0.1;         // Yanak boyutu
  const cheekY = size * 0.52;           // Yanak yüksekliği

  // === Sleepy mood için göz ===
  const isSleepy = mood === 'sleepy';

  const content = (
    <View style={[styles.wrapper, { width: size * 1.3, height: size * 1.3 }]}>
      {/* Glow */}
      {showGlow && (
        <View style={[
          styles.glow,
          {
            width: size * 1.2,
            height: size * 1.2,
            borderRadius: size * 0.6,
            backgroundColor: COLORS.glow,
          }
        ]} />
      )}

      {/* Ana Maskot */}
      <Animated.View style={[styles.mascot, containerStyle]}>
        {/* SVG Beden */}
        <Svg width={bodySize} height={bodySize} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="bodyGrad" cx="35%" cy="30%" r="65%">
              <Stop offset="0%" stopColor={COLORS.bodyLight} />
              <Stop offset="50%" stopColor={COLORS.bodyMain} />
              <Stop offset="85%" stopColor={COLORS.bodyDark} />
              <Stop offset="100%" stopColor={COLORS.bodyShadow} />
            </RadialGradient>
          </Defs>

          {/* Ana daire - basit, temiz */}
          <Circle cx="50" cy="50" r="46" fill="url(#bodyGrad)" />

          {/* Üst highlight */}
          <Ellipse cx="38" cy="32" rx="18" ry="10" fill="rgba(255,255,255,0.6)" />
          <Ellipse cx="58" cy="26" rx="8" ry="5" fill="rgba(255,255,255,0.4)" />
        </Svg>

        {/* Gözler */}
        <View style={[styles.eyesRow, { top: eyeY }]}>
          {/* Sol Göz */}
          <Animated.View style={[styles.eyeContainer, eyeStyle, { marginRight: eyeSpacing }]}>
            <View style={[
              styles.eye,
              { width: eyeSize, height: eyeSize, borderRadius: eyeSize / 2 }
            ]}>
              {isSleepy ? (
                // Uyku modu - çizgi göz
                <View style={[styles.sleepyEye, { width: eyeSize * 0.6, height: 2 }]} />
              ) : (
                // Normal göz
                <Animated.View style={[
                  styles.iris,
                  leftPupilStyle,
                  {
                    width: irisSize,
                    height: irisSize,
                    borderRadius: irisSize / 2,
                    backgroundColor: COLORS.eyeIris,
                  }
                ]}>
                  {/* Highlight */}
                  <View style={[
                    styles.highlight,
                    {
                      width: highlightSize,
                      height: highlightSize,
                      borderRadius: highlightSize / 2,
                      top: irisSize * 0.15,
                      left: irisSize * 0.15,
                    }
                  ]} />
                  <View style={[
                    styles.highlightSmall,
                    {
                      width: highlightSize * 0.4,
                      height: highlightSize * 0.4,
                      borderRadius: highlightSize * 0.2,
                      bottom: irisSize * 0.2,
                      right: irisSize * 0.2,
                    }
                  ]} />
                </Animated.View>
              )}
            </View>
          </Animated.View>

          {/* Sağ Göz */}
          <Animated.View style={[styles.eyeContainer, eyeStyle, { marginLeft: eyeSpacing }]}>
            <View style={[
              styles.eye,
              { width: eyeSize, height: eyeSize, borderRadius: eyeSize / 2 }
            ]}>
              {isSleepy ? (
                <View style={[styles.sleepyEye, { width: eyeSize * 0.6, height: 2 }]} />
              ) : (
                <Animated.View style={[
                  styles.iris,
                  rightPupilStyle,
                  {
                    width: irisSize,
                    height: irisSize,
                    borderRadius: irisSize / 2,
                    backgroundColor: COLORS.eyeIris,
                  }
                ]}>
                  <View style={[
                    styles.highlight,
                    {
                      width: highlightSize,
                      height: highlightSize,
                      borderRadius: highlightSize / 2,
                      top: irisSize * 0.15,
                      left: irisSize * 0.15,
                    }
                  ]} />
                  <View style={[
                    styles.highlightSmall,
                    {
                      width: highlightSize * 0.4,
                      height: highlightSize * 0.4,
                      borderRadius: highlightSize * 0.2,
                      bottom: irisSize * 0.2,
                      right: irisSize * 0.2,
                    }
                  ]} />
                </Animated.View>
              )}
            </View>
          </Animated.View>
        </View>

        {/* Yanaklar */}
        <View style={[
          styles.cheek,
          {
            width: cheekSize,
            height: cheekSize * 0.5,
            borderRadius: cheekSize * 0.25,
            backgroundColor: COLORS.cheek,
            top: cheekY,
            left: size * 0.15,
          }
        ]} />
        <View style={[
          styles.cheek,
          {
            width: cheekSize,
            height: cheekSize * 0.5,
            borderRadius: cheekSize * 0.25,
            backgroundColor: COLORS.cheek,
            top: cheekY,
            right: size * 0.15,
          }
        ]} />

        {/* Ağız */}
        <View style={[styles.mouthContainer, { top: size * 0.58 }]}>
          <Svg width={size * 0.15} height={size * 0.08} viewBox="0 0 24 12">
            {mood === 'happy' || mood === 'excited' ? (
              // Mutlu gülümseme
              <Path
                d="M 4 4 Q 12 12 20 4"
                stroke={COLORS.mouth}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            ) : mood === 'love' ? (
              // Aşık - küçük kalp ağız
              <Path
                d="M 8 5 Q 12 10 16 5"
                stroke={COLORS.mouth}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            ) : (
              // Nötr/uyku - düz çizgi
              <Path
                d="M 6 6 L 18 6"
                stroke={COLORS.mouth}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            )}
          </Svg>
        </View>

        {/* Love mood - kalpler */}
        {mood === 'love' && (
          <>
            <View style={[styles.heart, { top: size * 0.1, right: size * 0.1 }]}>
              <Svg width={16} height={16} viewBox="0 0 24 24">
                <Path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="#FF8A9B"
                />
              </Svg>
            </View>
            <View style={[styles.heart, { top: size * 0.05, left: size * 0.15 }]}>
              <Svg width={12} height={12} viewBox="0 0 24 24">
                <Path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="#FFB5C0"
                />
              </Svg>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={handlePress}>{content}</Pressable>;
  }

  return content;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  mascot: {
    alignItems: 'center',
    justifyContent: 'center',
    // Soft shadow
    ...shadows.colored('#E8D0B8'),
  },
  eyesRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    backgroundColor: Colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  sleepyEye: {
    backgroundColor: '#2D1F15',
    borderRadius: 1,
  },
  iris: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlight: {
    position: 'absolute',
    backgroundColor: Colors.neutral.white,
  },
  highlightSmall: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  cheek: {
    position: 'absolute',
    opacity: 0.6,
  },
  mouthContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  heart: {
    position: 'absolute',
  },
});

export default IooMascotFinal;
