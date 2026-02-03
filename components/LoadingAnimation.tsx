import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Platform } from 'react-native';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { spacing, typography, colors } from '@/lib/design-tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

type AnimationType = 'drawing' | 'painting' | 'story' | 'analysis' | 'thinking' | 'uploading' | 'magic';

// Rotating tips for each animation type
const LOADING_TIPS: Record<AnimationType, string[]> = {
  drawing: [
    'Çocukların çizimleri duygusal bir harita gibidir.',
    'Renk seçimleri ruh halini yansıtabilir.',
    'Çizim büyüklükleri özgüven göstergesi olabilir.',
  ],
  painting: [
    'Boyama aktiviteleri stresi azaltmaya yardımcı olur.',
    'Yaratıcılık beyni aktif tutar.',
    'Renkleri birlikte keşfetmek bağ kurar.',
  ],
  story: [
    'Hikayeler empati geliştirmeye yardımcı olur.',
    'Seçimler düşünce kalıplarını gösterir.',
    'Birlikte okuma kaliteli vakit demek.',
  ],
  analysis: [
    'Her çizim bir hikaye anlatır.',
    'Duygusal temalar zaman içinde değişebilir.',
    'Düzenli takip gelişimi gösterir.',
  ],
  thinking: [
    'Biraz düşünmeme izin ver...',
    'En iyi sonucu hazırlıyorum.',
    'Detayları inceliyorum.',
  ],
  uploading: [
    'Dosya güvenle yükleniyor.',
    'Verileriniz şifreli olarak korunuyor.',
    'Neredeyse bitti!',
  ],
  magic: [
    'Sihirli dokunuşlar ekleniyor...',
    'Yaratıcılık devrede!',
    'Bir şeyler harika olacak...',
  ],
};

interface LoadingAnimationProps {
  type: AnimationType;
  message?: string;
  /** Show rotating tips */
  showTips?: boolean;
  /** Tip rotation interval in ms */
  tipInterval?: number;
  /** Progress percentage (0-100), if available */
  progress?: number;
}

export function LoadingAnimation({
  type,
  message,
  showTips = true,
  tipInterval = 3000,
  progress,
}: LoadingAnimationProps) {
  // Rotating tips state
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const tips = LOADING_TIPS[type] || LOADING_TIPS.thinking;
  const tipOpacity = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.3)).current;
  const opacity2 = useRef(new Animated.Value(0.6)).current;
  const opacity3 = useRef(new Animated.Value(1)).current;

  // Tip rotation effect
  useEffect(() => {
    if (!showTips || tips.length <= 1) return;

    const interval = setInterval(() => {
      // Fade out
      Animated.timing(tipOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start(() => {
        // Change tip
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
        // Fade in
        Animated.timing(tipOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: USE_NATIVE_DRIVER,
        }).start();
      });
    }, tipInterval);

    return () => clearInterval(interval);
  }, [showTips, tips.length, tipInterval, tipOpacity]);

  useEffect(() => {
    // Rotation animation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: USE_NATIVE_DRIVER,
      })
    ).start();

    // Scale pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    ).start();

    // Dots animation
    Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(opacity1, {
            toValue: 1,
            duration: 400,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(opacity1, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity2, {
            toValue: 1,
            duration: 400,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(opacity2, {
            toValue: 0.6,
            duration: 400,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity3, {
            toValue: 1,
            duration: 400,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(opacity3, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ])
    ).start();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getDefaultMessage = () => {
    switch (type) {
      case 'drawing':
        return 'Çizim analiz ediliyor';
      case 'painting':
        return 'Boyama sayfası hazırlanıyor';
      case 'story':
        return 'Hikaye yazılıyor';
      case 'analysis':
        return 'Duygusal analiz yapılıyor';
      case 'thinking':
        return 'Düşünüyorum';
      case 'uploading':
        return 'Yükleniyor';
      case 'magic':
        return 'Sihir yapılıyor';
      default:
        return 'Yükleniyor';
    }
  };

  const getGradientColors = () => {
    switch (type) {
      case 'drawing':
        return colors.gradients.creative; // Creative colors (pink-purple)
      case 'painting':
        return colors.gradients.scientific; // Blue-purple
      case 'story':
        return colors.gradients.accessible; // Purple-pink
      case 'analysis':
        return ['#667eea', '#764ba2', '#f093fb']; // Deep purple to pink gradient
      case 'thinking':
        return ['#E8D5FF', '#C7CEEA', '#B98EFF']; // Soft lavender
      case 'uploading':
        return ['#4ECDC4', '#44A08D', '#093637']; // Teal to dark
      case 'magic':
        return ['#FFD93D', '#FF6B9D', '#C7CEEA']; // Gold to pink to lavender
      default:
        return colors.gradients.professional;
    }
  };

  const getAnimationIcon = () => {
    const size = 120;
    const center = size / 2;

    switch (type) {
      case 'drawing':
        // Pencil drawing circles
        return (
          <Animated.View style={{ transform: [{ rotate }, { scale }] }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Rotating circles */}
              <Circle cx={center} cy={20} r={8} fill="#FF6B9D" opacity={0.8} />
              <Circle cx={center + 30} cy={30} r={6} fill="#4ECDC4" opacity={0.8} />
              <Circle cx={center + 40} cy={center} r={7} fill="#FFA07A" opacity={0.8} />
              <Circle cx={center + 30} cy={center + 30} r={5} fill="#FFE66D" opacity={0.8} />
              <Circle cx={center} cy={center + 40} r={8} fill="#A8E6CF" opacity={0.8} />
              <Circle cx={center - 30} cy={center + 30} r={6} fill="#C7CEEA" opacity={0.8} />
              <Circle cx={center - 40} cy={center} r={7} fill="#FFDAC1" opacity={0.8} />
              <Circle cx={center - 30} cy={30} r={5} fill="#B5EAD7" opacity={0.8} />

              {/* Center pencil */}
              <G transform={`translate(${center - 15}, ${center - 15})`}>
                <Path
                  d="M20 5L5 20L10 25L25 10L20 5Z"
                  fill="#FFD166"
                  stroke="#FF9F1C"
                  strokeWidth={2}
                />
                <Path d="M5 20L10 25L7.5 27.5L2.5 22.5L5 20Z" fill="#FF9F1C" />
              </G>
            </Svg>
          </Animated.View>
        );

      case 'painting':
        // Paint brush with drops
        return (
          <Animated.View style={{ transform: [{ scale }] }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Paint drops */}
              <AnimatedCircle cx={30} cy={30} r={6} fill="#FF6B9D" opacity={opacity1} />
              <AnimatedCircle cx={90} cy={40} r={8} fill="#4ECDC4" opacity={opacity2} />
              <AnimatedCircle cx={50} cy={90} r={7} fill="#FFE66D" opacity={opacity3} />
              <AnimatedCircle cx={80} cy={85} r={5} fill="#C7CEEA" opacity={opacity1} />

              {/* Paint brush */}
              <G transform={`translate(${center - 20}, ${center - 20}) rotate(-45 20 20)`}>
                <Path
                  d="M15 5L25 5L25 20L20 25L15 20L15 5Z"
                  fill="#8B4513"
                />
                <Path
                  d="M12 20L28 20L25 30Q20 35 15 30Z"
                  fill="#4A90A4"
                  opacity={0.9}
                />
              </G>
            </Svg>
          </Animated.View>
        );

      case 'story':
        // Book with sparkles
        return (
          <Animated.View style={{ transform: [{ rotate }, { scale }] }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Sparkles */}
              <AnimatedG opacity={opacity1}>
                <Path d="M30 20L32 25L35 23L33 28L38 30L33 32L35 37L32 35L30 40L28 35L25 37L27 32L22 30L27 28L25 23L28 25Z" fill="#FFD700" />
              </AnimatedG>
              <AnimatedG opacity={opacity2}>
                <Path d="M85 25L87 28L90 27L88 30L92 32L88 34L90 37L87 36L85 40L83 36L80 37L82 34L78 32L82 30L80 27L83 28Z" fill="#FFA07A" />
              </AnimatedG>
              <AnimatedG opacity={opacity3}>
                <Path d="M75 80L77 83L80 82L78 85L82 87L78 89L80 92L77 91L75 95L73 91L70 92L72 89L68 87L72 85L70 82L73 83Z" fill="#C7CEEA" />
              </AnimatedG>

              {/* Book */}
              <G transform={`translate(${center - 25}, ${center - 20})`}>
                <Path
                  d="M5 5L45 5L45 45L25 40L5 45Z"
                  fill="#9B59B6"
                  stroke="#8E44AD"
                  strokeWidth={2}
                />
                <Path d="M25 5L25 40" stroke="#8E44AD" strokeWidth={2} />
                <Path d="M10 15L20 15M10 20L20 20M10 25L20 25" stroke="white" strokeWidth={1.5} opacity={0.6} />
                <Path d="M30 15L40 15M30 20L40 20M30 25L40 25" stroke="white" strokeWidth={1.5} opacity={0.6} />
              </G>
            </Svg>
          </Animated.View>
        );

      case 'analysis':
        // Emotional Constellation + Kaleidoscope Scanner
        return (
          <View style={{ position: 'relative' }}>
            <Animated.View style={{ transform: [{ rotate }, { scale }] }}>
              <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Kaleidoscope Center - Rotating Mandala */}
                <G transform={`translate(${center}, ${center})`}>
                  {/* Inner circles forming mandala */}
                  <Circle r={25} fill="none" stroke="#667eea" strokeWidth={2} opacity={0.6} />
                  <Circle r={20} fill="none" stroke="#764ba2" strokeWidth={2} opacity={0.7} />
                  <Circle r={15} fill="none" stroke="#f093fb" strokeWidth={2} opacity={0.8} />

                  {/* Kaleidoscope petals */}
                  {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <G key={i} transform={`rotate(${angle})`}>
                      <Path
                        d="M0,-20 Q5,-15 0,-10 Q-5,-15 0,-20"
                        fill="#667eea"
                        opacity={0.5}
                      />
                      <Path
                        d="M0,-15 L3,-8 L-3,-8 Z"
                        fill="#f093fb"
                        opacity={0.6}
                      />
                    </G>
                  ))}
                </G>

                {/* Emotional Stars - Different colors for different emotions */}
                {/* Happiness - Gold */}
                <AnimatedG opacity={opacity1}>
                  <Circle cx={20} cy={25} r={4} fill="#FFD700" />
                  <Path d="M20,20 L21,23 L20,22 L19,23 Z" fill="#FFD700" />
                  <Path d="M16,25 L19,26 L18,25 L19,24 Z" fill="#FFD700" />
                  <Path d="M24,25 L21,24 L22,25 L21,26 Z" fill="#FFD700" />
                </AnimatedG>

                {/* Calmness - Cyan */}
                <AnimatedG opacity={opacity2}>
                  <Circle cx={100} cy={30} r={4} fill="#4ECDC4" />
                  <Path d="M100,25 L101,28 L100,27 L99,28 Z" fill="#4ECDC4" />
                  <Path d="M96,30 L99,31 L98,30 L99,29 Z" fill="#4ECDC4" />
                  <Path d="M104,30 L101,29 L102,30 L101,31 Z" fill="#4ECDC4" />
                </AnimatedG>

                {/* Love - Pink */}
                <AnimatedG opacity={opacity3}>
                  <Circle cx={105} cy={70} r={4} fill="#FF6B9D" />
                  <Path d="M105,65 L106,68 L105,67 L104,68 Z" fill="#FF6B9D" />
                  <Path d="M101,70 L104,71 L103,70 L104,69 Z" fill="#FF6B9D" />
                  <Path d="M109,70 L106,69 L107,70 L106,71 Z" fill="#FF6B9D" />
                </AnimatedG>

                {/* Growth - Mint */}
                <AnimatedG opacity={opacity1}>
                  <Circle cx={95} cy={105} r={4} fill="#A8E6CF" />
                  <Path d="M95,100 L96,103 L95,102 L94,103 Z" fill="#A8E6CF" />
                  <Path d="M91,105 L94,106 L93,105 L94,104 Z" fill="#A8E6CF" />
                  <Path d="M99,105 L96,104 L97,105 L96,106 Z" fill="#A8E6CF" />
                </AnimatedG>

                {/* Creativity - Lavender */}
                <AnimatedG opacity={opacity2}>
                  <Circle cx={25} cy={95} r={4} fill="#C7CEEA" />
                  <Path d="M25,90 L26,93 L25,92 L24,93 Z" fill="#C7CEEA" />
                  <Path d="M21,95 L24,96 L23,95 L24,94 Z" fill="#C7CEEA" />
                  <Path d="M29,95 L26,94 L27,95 L26,96 Z" fill="#C7CEEA" />
                </AnimatedG>

                {/* Joy - Yellow */}
                <AnimatedG opacity={opacity3}>
                  <Circle cx={15} cy={60} r={4} fill="#FFE66D" />
                  <Path d="M15,55 L16,58 L15,57 L14,58 Z" fill="#FFE66D" />
                  <Path d="M11,60 L14,61 L13,60 L14,59 Z" fill="#FFE66D" />
                  <Path d="M19,60 L16,59 L17,60 L16,61 Z" fill="#FFE66D" />
                </AnimatedG>

                {/* Constellation Lines - Connecting stars */}
                <Path
                  d={`M20,25 Q${center},${center} 100,30`}
                  fill="none"
                  stroke="white"
                  strokeWidth={1}
                  opacity={0.2}
                  strokeDasharray="2,2"
                />
                <Path
                  d={`M100,30 Q${center},${center} 105,70`}
                  fill="none"
                  stroke="white"
                  strokeWidth={1}
                  opacity={0.2}
                  strokeDasharray="2,2"
                />
                <Path
                  d={`M105,70 Q${center},${center} 95,105`}
                  fill="none"
                  stroke="white"
                  strokeWidth={1}
                  opacity={0.2}
                  strokeDasharray="2,2"
                />
                <Path
                  d={`M95,105 Q${center},${center} 25,95`}
                  fill="none"
                  stroke="white"
                  strokeWidth={1}
                  opacity={0.2}
                  strokeDasharray="2,2"
                />
                <Path
                  d={`M25,95 Q${center},${center} 15,60`}
                  fill="none"
                  stroke="white"
                  strokeWidth={1}
                  opacity={0.2}
                  strokeDasharray="2,2"
                />
                <Path
                  d={`M15,60 Q${center},${center} 20,25`}
                  fill="none"
                  stroke="white"
                  strokeWidth={1}
                  opacity={0.2}
                  strokeDasharray="2,2"
                />
              </Svg>
            </Animated.View>

            {/* Scanner Line Effect */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: '#fff',
                opacity: opacity1,
                transform: [{ translateY: rotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, size],
                }) }],
              }}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getGradientColors() as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Animation Icon */}
          <View style={styles.iconContainer}>{getAnimationIcon()}</View>

          {/* Message */}
          <Text style={styles.message}>{message || getDefaultMessage()}</Text>

          {/* Progress indicator */}
          {progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          )}

          {/* Animated Dots */}
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { opacity: opacity1 }]} />
            <Animated.View style={[styles.dot, { opacity: opacity2 }]} />
            <Animated.View style={[styles.dot, { opacity: opacity3 }]} />
          </View>

          {/* Rotating Tips */}
          {showTips && (
            <Animated.View style={[styles.tipContainer, { opacity: tipOpacity }]}>
              <Text style={styles.tipLabel}>💡 Biliyor muydun?</Text>
              <Text style={styles.tipText}>{tips[currentTipIndex]}</Text>
            </Animated.View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    fontSize: typography.fontSize.xl,
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  // Progress styles
  progressContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: 'white',
    fontWeight: '600',
  },
  // Tip styles
  tipContainer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    maxWidth: SCREEN_WIDTH * 0.85,
    alignItems: 'center',
  },
  tipLabel: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: typography.fontSize.base,
    color: 'white',
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.5,
  },
});
