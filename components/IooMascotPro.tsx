import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import { shadows, createShadow } from '@/constants/design-system';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  interpolate,
  useAnimatedProps,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  Circle,
  Ellipse,
  Path,
  G,
  Filter,
  FeGaussianBlur,
  FeOffset,
  FeMerge,
  FeMergeNode,
} from 'react-native-svg';
import { IooMood, IooSize, getPixelSize, IOO_COLORS } from '@/constants/ioo-config';

// =============================================================================
// IOO PRO - Premium Maskot Tasarımı
// =============================================================================
// Pixar/Disney kalitesinde, soft 3D görünümlü, premium maskot
// Derinlik, karakter, profesyonel render hissi
// =============================================================================

// Re-export types for backwards compatibility
export type { IooMood, IooSize } from '@/constants/ioo-config';

interface IooMascotProProps {
  size?: IooSize | number;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
  mood?: IooMood;
  onPress?: () => void;
}

// Use unified color palette from config
const Colors = IOO_COLORS;

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export const IooMascotPro: React.FC<IooMascotProProps> = ({
  size = 'medium',
  style,
  animated = true,
  mood = 'happy',
  onPress,
}) => {
  const bodySize = getPixelSize(size);

  // Animation values
  const breathScale = useSharedValue(1);
  const breathY = useSharedValue(0);
  const floatY = useSharedValue(0);
  const squashX = useSharedValue(1);
  const squashY = useSharedValue(1);
  const tiltZ = useSharedValue(0);

  // Eye animations
  const blinkProgress = useSharedValue(1);
  const leftPupilX = useSharedValue(0);
  const leftPupilY = useSharedValue(0);
  const rightPupilX = useSharedValue(0);
  const rightPupilY = useSharedValue(0);
  const eyeWiden = useSharedValue(1);
  const eyeSparkle = useSharedValue(1);

  // Face animations
  const cheekGlow = useSharedValue(0.6);
  const mouthScale = useSharedValue(1);
  const mouthOpen = useSharedValue(0);

  // Touch response
  const touchScale = useSharedValue(1);
  const touchRotate = useSharedValue(0);
  const bounceY = useSharedValue(0);

  // Mood specific
  const excitedJump = useSharedValue(0);
  const sleepyDroop = useSharedValue(0);
  const curiousTilt = useSharedValue(0);
  const loveFloat = useSharedValue(0);
  const thinkingTilt = useSharedValue(0);

  // Glow
  const glowIntensity = useSharedValue(0.4);

  // ==========================================================================
  // Core Animations
  // ==========================================================================

  useEffect(() => {
    if (!animated) return;

    // Organik nefes alma - squash & stretch
    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.025, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.98, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Squash & Stretch - x ekseni
    squashX.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.98, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Squash & Stretch - y ekseni (ters fazda)
    squashY.value = withRepeat(
      withSequence(
        withTiming(0.98, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Yumuşak floating
    floatY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
        withTiming(6, { duration: 2500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Hafif tilt (canlılık için)
    tiltZ.value = withRepeat(
      withSequence(
        withTiming(1.5, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-1.5, { duration: 3000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Göz kırpma - doğal, çift blink
    const blink = () => {
      blinkProgress.value = withSequence(
        withTiming(0.05, { duration: 70, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 90, easing: Easing.out(Easing.quad) }),
        withDelay(120,
          withSequence(
            withTiming(0.05, { duration: 70, easing: Easing.out(Easing.quad) }),
            withTiming(1, { duration: 90, easing: Easing.out(Easing.quad) })
          )
        )
      );
    };
    const blinkInterval = setInterval(blink, 3000 + Math.random() * 2000);

    // Göz hareketi - meraklı bakış
    const lookAround = () => {
      const randomX = (Math.random() - 0.5) * 5;
      const randomY = (Math.random() - 0.5) * 3;

      leftPupilX.value = withSpring(randomX, { damping: 12, stiffness: 80 });
      leftPupilY.value = withSpring(randomY, { damping: 12, stiffness: 80 });
      rightPupilX.value = withSpring(randomX, { damping: 12, stiffness: 80 });
      rightPupilY.value = withSpring(randomY, { damping: 12, stiffness: 80 });

      setTimeout(() => {
        leftPupilX.value = withSpring(0, { damping: 12, stiffness: 80 });
        leftPupilY.value = withSpring(0, { damping: 12, stiffness: 80 });
        rightPupilX.value = withSpring(0, { damping: 12, stiffness: 80 });
        rightPupilY.value = withSpring(0, { damping: 12, stiffness: 80 });
      }, 1500);
    };
    const lookInterval = setInterval(lookAround, 4500);

    // Göz parlaklığı
    eyeSparkle.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.9, { duration: 1200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Yanak parlaması
    cheekGlow.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.5, { duration: 1500 })
      ),
      -1,
      true
    );

    // Glow pulse
    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 2000 }),
        withTiming(0.35, { duration: 2000 })
      ),
      -1,
      true
    );

    return () => {
      clearInterval(blinkInterval);
      clearInterval(lookInterval);
    };
  }, [animated]);

  // ==========================================================================
  // Mood-specific Animations
  // ==========================================================================

  useEffect(() => {
    if (!animated) return;

    // Reset mood-specific values
    excitedJump.value = 0;
    sleepyDroop.value = 0;
    curiousTilt.value = 0;
    loveFloat.value = 0;
    thinkingTilt.value = 0;
    eyeWiden.value = 1;
    mouthScale.value = 1;
    mouthOpen.value = 0;

    switch (mood) {
      case 'excited':
        excitedJump.value = withRepeat(
          withSequence(
            withSpring(-18, { damping: 5, stiffness: 250 }),
            withSpring(0, { damping: 6, stiffness: 200 })
          ),
          -1,
          false
        );
        eyeWiden.value = withSpring(1.15, { damping: 10 });
        mouthScale.value = withSpring(1.2, { damping: 10 });
        break;

      case 'sleepy':
        sleepyDroop.value = withTiming(1, { duration: 800 });
        blinkProgress.value = withTiming(0.35, { duration: 800 });
        break;

      case 'curious':
        curiousTilt.value = withSpring(10, { damping: 8 });
        eyeWiden.value = withSpring(1.1, { damping: 10 });
        leftPupilX.value = withSpring(2, { damping: 10 });
        rightPupilX.value = withSpring(2, { damping: 10 });
        break;

      case 'talking':
        mouthOpen.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 120 }),
            withTiming(0.4, { duration: 80 }),
            withTiming(0.9, { duration: 100 }),
            withTiming(0.2, { duration: 100 }),
            withTiming(0.7, { duration: 90 }),
            withTiming(0, { duration: 110 })
          ),
          -1,
          false
        );
        break;

      case 'surprised':
        eyeWiden.value = withSequence(
          withSpring(1.35, { damping: 4, stiffness: 300 }),
          withSpring(1.2, { damping: 8, stiffness: 150 })
        );
        touchScale.value = withSequence(
          withSpring(1.1, { damping: 4, stiffness: 300 }),
          withSpring(1, { damping: 8, stiffness: 150 })
        );
        break;

      case 'love':
        loveFloat.value = withRepeat(
          withSequence(
            withTiming(-4, { duration: 800, easing: Easing.inOut(Easing.sin) }),
            withTiming(4, { duration: 800, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        );
        cheekGlow.value = withTiming(1, { duration: 500 });
        break;

      case 'thinking':
        thinkingTilt.value = withSpring(-8, { damping: 10 });
        leftPupilX.value = withSpring(-2, { damping: 10 });
        leftPupilY.value = withSpring(-2, { damping: 10 });
        rightPupilX.value = withSpring(-2, { damping: 10 });
        rightPupilY.value = withSpring(-2, { damping: 10 });
        break;

      default: // happy
        blinkProgress.value = withSpring(1, { damping: 10 });
        eyeWiden.value = withSpring(1, { damping: 10 });
        break;
    }
  }, [mood, animated]);

  // ==========================================================================
  // Touch Handler
  // ==========================================================================

  const handlePress = () => {
    // Jöle bounce efekti
    touchScale.value = withSequence(
      withSpring(0.92, { damping: 3, stiffness: 400 }),
      withSpring(1.08, { damping: 3, stiffness: 400 }),
      withSpring(0.97, { damping: 5, stiffness: 300 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );

    // Wiggle
    touchRotate.value = withSequence(
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(4, { duration: 50 }),
      withTiming(-2, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );

    // Bounce
    bounceY.value = withSequence(
      withSpring(-15, { damping: 4, stiffness: 350 }),
      withSpring(0, { damping: 6, stiffness: 200 })
    );

    // Göz spark
    eyeSparkle.value = withSequence(
      withTiming(1.4, { duration: 100 }),
      withTiming(1, { duration: 300 })
    );

    onPress?.();
  };

  // ==========================================================================
  // Animated Styles
  // ==========================================================================

  const bodyContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value + excitedJump.value + loveFloat.value + bounceY.value },
      { scaleX: squashX.value * touchScale.value },
      { scaleY: squashY.value * touchScale.value },
      { scale: breathScale.value },
      { rotate: `${tiltZ.value + curiousTilt.value + thinkingTilt.value + touchRotate.value}deg` },
    ],
  }));

  const eyeContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: blinkProgress.value },
      { scaleX: interpolate(blinkProgress.value, [0, 0.3, 1], [1.15, 1.1, 1]) },
      { scale: eyeWiden.value },
    ],
  }));

  const leftPupilStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: leftPupilX.value },
      { translateY: leftPupilY.value },
    ],
  }));

  const rightPupilStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: rightPupilX.value },
      { translateY: rightPupilY.value },
    ],
  }));

  const cheekStyle = useAnimatedStyle(() => ({
    opacity: cheekGlow.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value,
    transform: [{ scale: interpolate(glowIntensity.value, [0.35, 0.55], [1, 1.08]) }],
  }));

  // ==========================================================================
  // Size Calculations
  // ==========================================================================

  const viewBoxSize = 200;
  const containerSize = bodySize * 1.4; // Glow için ekstra alan
  const eyeSize = bodySize * 0.18;
  const pupilSize = eyeSize * 0.65;
  const highlightSize = pupilSize * 0.38;
  const cheekWidth = bodySize * 0.13;
  const cheekHeight = bodySize * 0.065;

  // ==========================================================================
  // Render
  // ==========================================================================

  const MascotContent = (
    <View style={[styles.wrapper, { width: containerSize, height: containerSize }, style]}>
      {/* Ambient Glow */}
      <AnimatedView style={[
        styles.glowOuter,
        glowStyle,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          backgroundColor: Colors.glow.ambient,
        }
      ]} />
      <AnimatedView style={[
        styles.glowInner,
        glowStyle,
        {
          width: containerSize * 0.85,
          height: containerSize * 0.85,
          borderRadius: containerSize * 0.425,
          backgroundColor: Colors.glow.soft,
        }
      ]} />

      {/* Main Body */}
      <AnimatedView style={[styles.bodyContainer, bodyContainerStyle]}>
        <Svg
          width={bodySize}
          height={bodySize}
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        >
          <Defs>
            {/* Ana beden gradient - sıcak, derinlikli */}
            <RadialGradient id="bodyGradient" cx="40%" cy="30%" r="70%" fx="35%" fy="25%">
              <Stop offset="0%" stopColor={Colors.body.light} />
              <Stop offset="25%" stopColor={Colors.body.main} />
              <Stop offset="55%" stopColor={Colors.body.mid} />
              <Stop offset="80%" stopColor={Colors.body.shadow} />
              <Stop offset="100%" stopColor={Colors.body.deepShadow} />
            </RadialGradient>

            {/* Üst highlight - parlak */}
            <RadialGradient id="topHighlight" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <Stop offset="40%" stopColor="rgba(255,255,255,0.5)" />
              <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </RadialGradient>

            {/* Kenar ışığı */}
            <LinearGradient id="rimLight" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
              <Stop offset="50%" stopColor="rgba(255,255,255,0)" />
              <Stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
            </LinearGradient>

            {/* Alt ambient occlusion */}
            <RadialGradient id="bottomAO" cx="50%" cy="100%" r="60%">
              <Stop offset="0%" stopColor="rgba(200,160,140,0.4)" />
              <Stop offset="60%" stopColor="rgba(200,160,140,0.1)" />
              <Stop offset="100%" stopColor="rgba(200,160,140,0)" />
            </RadialGradient>

            {/* Soft iç gölge */}
            <RadialGradient id="innerShadow" cx="50%" cy="70%" r="50%">
              <Stop offset="0%" stopColor="rgba(180,140,120,0)" />
              <Stop offset="70%" stopColor="rgba(180,140,120,0.1)" />
              <Stop offset="100%" stopColor="rgba(180,140,120,0.25)" />
            </RadialGradient>
          </Defs>

          {/* Drop shadow (fake) */}
          <Ellipse
            cx="100"
            cy="185"
            rx="55"
            ry="12"
            fill="rgba(180,150,130,0.2)"
          />

          {/* Ana beden - organik blob şekli */}
          <Path
            d="M100 18
               C135 18 165 35 178 60
               C192 88 190 120 182 148
               C174 176 150 192 100 192
               C50 192 26 176 18 148
               C10 120 8 88 22 60
               C35 35 65 18 100 18Z"
            fill="url(#bodyGradient)"
          />

          {/* İç gölge overlay */}
          <Path
            d="M100 18
               C135 18 165 35 178 60
               C192 88 190 120 182 148
               C174 176 150 192 100 192
               C50 192 26 176 18 148
               C10 120 8 88 22 60
               C35 35 65 18 100 18Z"
            fill="url(#innerShadow)"
          />

          {/* Alt ambient occlusion */}
          <Ellipse
            cx="100"
            cy="170"
            rx="65"
            ry="30"
            fill="url(#bottomAO)"
          />

          {/* Ana üst highlight */}
          <Ellipse
            cx="70"
            cy="55"
            rx="38"
            ry="25"
            fill="url(#topHighlight)"
          />

          {/* Sekonder highlight */}
          <Ellipse
            cx="130"
            cy="42"
            rx="18"
            ry="12"
            fill="rgba(255,255,255,0.65)"
          />

          {/* Mini highlight */}
          <Circle
            cx="148"
            cy="65"
            r="8"
            fill="rgba(255,255,255,0.5)"
          />

          {/* Rim light sol */}
          <Path
            d="M30 100 Q20 60 50 35"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        </Svg>

        {/* Gözler */}
        <AnimatedView style={[
          styles.eyesContainer,
          eyeContainerStyle,
          { top: bodySize * 0.32 }
        ]}>
          {/* Sol Göz */}
          <View style={[styles.eyeWrapper, { marginRight: bodySize * 0.06 }]}>
            <View style={[
              styles.eyeOuter,
              {
                width: eyeSize,
                height: eyeSize,
                borderRadius: eyeSize / 2,
              }
            ]}>
              {/* Göz beyazı gradient */}
              <View style={[
                styles.eyeWhite,
                {
                  width: eyeSize * 0.92,
                  height: eyeSize * 0.92,
                  borderRadius: eyeSize * 0.46,
                }
              ]}>
                {/* İris */}
                <AnimatedView style={[styles.irisContainer, leftPupilStyle]}>
                  <View style={[
                    styles.iris,
                    {
                      width: pupilSize,
                      height: pupilSize,
                      borderRadius: pupilSize / 2,
                    }
                  ]}>
                    {/* Pupil */}
                    <View style={[
                      styles.pupil,
                      {
                        width: pupilSize * 0.55,
                        height: pupilSize * 0.55,
                        borderRadius: pupilSize * 0.275,
                      }
                    ]} />

                    {/* Ana highlight - büyük */}
                    <View style={[
                      styles.highlight1,
                      {
                        width: highlightSize,
                        height: highlightSize,
                        borderRadius: highlightSize / 2,
                        top: pupilSize * 0.12,
                        left: pupilSize * 0.12,
                      }
                    ]} />

                    {/* Sekonder highlight - küçük */}
                    <View style={[
                      styles.highlight2,
                      {
                        width: highlightSize * 0.45,
                        height: highlightSize * 0.45,
                        borderRadius: highlightSize * 0.225,
                        bottom: pupilSize * 0.18,
                        right: pupilSize * 0.15,
                      }
                    ]} />

                    {/* Alt reflection */}
                    <View style={[
                      styles.reflection,
                      {
                        width: pupilSize * 0.5,
                        height: pupilSize * 0.15,
                        borderRadius: pupilSize * 0.075,
                        bottom: pupilSize * 0.08,
                      }
                    ]} />
                  </View>
                </AnimatedView>
              </View>
            </View>
          </View>

          {/* Sağ Göz */}
          <View style={[styles.eyeWrapper, { marginLeft: bodySize * 0.06 }]}>
            <View style={[
              styles.eyeOuter,
              {
                width: eyeSize,
                height: eyeSize,
                borderRadius: eyeSize / 2,
              }
            ]}>
              <View style={[
                styles.eyeWhite,
                {
                  width: eyeSize * 0.92,
                  height: eyeSize * 0.92,
                  borderRadius: eyeSize * 0.46,
                }
              ]}>
                <AnimatedView style={[styles.irisContainer, rightPupilStyle]}>
                  <View style={[
                    styles.iris,
                    {
                      width: pupilSize,
                      height: pupilSize,
                      borderRadius: pupilSize / 2,
                    }
                  ]}>
                    <View style={[
                      styles.pupil,
                      {
                        width: pupilSize * 0.55,
                        height: pupilSize * 0.55,
                        borderRadius: pupilSize * 0.275,
                      }
                    ]} />
                    <View style={[
                      styles.highlight1,
                      {
                        width: highlightSize,
                        height: highlightSize,
                        borderRadius: highlightSize / 2,
                        top: pupilSize * 0.12,
                        left: pupilSize * 0.12,
                      }
                    ]} />
                    <View style={[
                      styles.highlight2,
                      {
                        width: highlightSize * 0.45,
                        height: highlightSize * 0.45,
                        borderRadius: highlightSize * 0.225,
                        bottom: pupilSize * 0.18,
                        right: pupilSize * 0.15,
                      }
                    ]} />
                    <View style={[
                      styles.reflection,
                      {
                        width: pupilSize * 0.5,
                        height: pupilSize * 0.15,
                        borderRadius: pupilSize * 0.075,
                        bottom: pupilSize * 0.08,
                      }
                    ]} />
                  </View>
                </AnimatedView>
              </View>
            </View>
          </View>
        </AnimatedView>

        {/* Yanaklar */}
        <AnimatedView style={[
          styles.cheek,
          cheekStyle,
          {
            width: cheekWidth,
            height: cheekHeight,
            borderRadius: cheekHeight / 2,
            backgroundColor: Colors.cheeks.main,
            bottom: bodySize * 0.35,
            left: bodySize * 0.14,
          }
        ]}>
          <View style={[
            styles.cheekGlow,
            {
              width: cheekWidth * 0.6,
              height: cheekHeight * 0.5,
              borderRadius: cheekHeight * 0.25,
              backgroundColor: Colors.cheeks.glow,
            }
          ]} />
        </AnimatedView>

        <AnimatedView style={[
          styles.cheek,
          cheekStyle,
          {
            width: cheekWidth,
            height: cheekHeight,
            borderRadius: cheekHeight / 2,
            backgroundColor: Colors.cheeks.main,
            bottom: bodySize * 0.35,
            right: bodySize * 0.14,
          }
        ]}>
          <View style={[
            styles.cheekGlow,
            {
              width: cheekWidth * 0.6,
              height: cheekHeight * 0.5,
              borderRadius: cheekHeight * 0.25,
              backgroundColor: Colors.cheeks.glow,
            }
          ]} />
        </AnimatedView>

        {/* Ağız */}
        <View style={[styles.mouthContainer, { bottom: bodySize * 0.26 }]}>
          <Svg width={bodySize * 0.18} height={bodySize * 0.1} viewBox="0 0 36 20">
            {/* Sevimli gülümseme */}
            <Path
              d="M 6 7 Q 18 18 30 7"
              stroke={Colors.mouth.line}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
        </View>
      </AnimatedView>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={handlePress} style={styles.pressable}>
        {MascotContent}
      </Pressable>
    );
  }

  return MascotContent;
};

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
  },
  glowInner: {
    position: 'absolute',
  },
  bodyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // Premium shadow
    ...shadows.colored('#D4A574'),
  },
  eyesContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeOuter: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    // Soft shadow for depth
    ...shadows.xs,
  },
  eyeWhite: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    // Inner gradient effect via border
    borderWidth: 1,
    borderColor: 'rgba(220,200,180,0.3)',
  },
  irisContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iris: {
    backgroundColor: '#3D2314',
    alignItems: 'center',
    justifyContent: 'center',
    // Gradient effect - darker at edges
    borderWidth: 2,
    borderColor: '#2A1810',
  },
  pupil: {
    backgroundColor: '#0A0505',
    position: 'absolute',
  },
  highlight1: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    // Soft edge
    ...createShadow(0, 2, 0.5, 2, '#FFFFFF'),
  },
  highlight2: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  reflection: {
    position: 'absolute',
    backgroundColor: 'rgba(255,220,200,0.25)',
    alignSelf: 'center',
  },
  cheek: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cheekGlow: {
    position: 'absolute',
    top: 1,
    left: 2,
  },
  mouthContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
});

export default IooMascotPro;
