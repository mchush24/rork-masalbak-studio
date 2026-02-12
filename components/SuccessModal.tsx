import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Modal, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react-native';
import { spacing, borderRadius, shadows, typography } from '@/constants/design-system';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText: string;
  onPress: () => void;
}

export function SuccessModal({ visible, title, message, buttonText, onPress }: SuccessModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkScaleAnim = useRef(new Animated.Value(0)).current;
  const sparkle1Anim = useRef(new Animated.Value(0)).current;
  const sparkle2Anim = useRef(new Animated.Value(0)).current;
  const sparkle3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      checkScaleAnim.setValue(0);
      sparkle1Anim.setValue(0);
      sparkle2Anim.setValue(0);
      sparkle3Anim.setValue(0);

      // Modal appear animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Checkmark bounce animation (delayed)
      setTimeout(() => {
        Animated.spring(checkScaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 5,
          useNativeDriver: true,
        }).start();
      }, 200);

      // Sparkle animations (staggered)
      setTimeout(() => {
        Animated.parallel([
          Animated.sequence([
            Animated.timing(sparkle1Anim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle1Anim, {
              toValue: 0.6,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(100),
            Animated.timing(sparkle2Anim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle2Anim, {
              toValue: 0.6,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(200),
            Animated.timing(sparkle3Anim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle3Anim, {
              toValue: 0.6,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handlePress = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onPress();
    });
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.lg,
          opacity: opacityAnim,
        }}
      >
        <Animated.View
          style={{
            width: Math.min(SCREEN_WIDTH - spacing.lg * 2, 340),
            backgroundColor: 'white',
            borderRadius: borderRadius.xxl,
            overflow: 'hidden',
            transform: [{ scale: scaleAnim }],
            ...shadows.xl,
          }}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: spacing.xl + spacing.md,
              paddingHorizontal: spacing.lg,
              alignItems: 'center',
              position: 'relative',
            }}
          >
            {/* Sparkles */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 20,
                left: 30,
                opacity: sparkle1Anim,
                transform: [{ scale: sparkle1Anim }],
              }}
            >
              <Sparkles size={20} color="rgba(255,255,255,0.8)" />
            </Animated.View>
            <Animated.View
              style={{
                position: 'absolute',
                top: 35,
                right: 40,
                opacity: sparkle2Anim,
                transform: [{ scale: sparkle2Anim }],
              }}
            >
              <Sparkles size={16} color="rgba(255,255,255,0.7)" />
            </Animated.View>
            <Animated.View
              style={{
                position: 'absolute',
                bottom: 30,
                left: 50,
                opacity: sparkle3Anim,
                transform: [{ scale: sparkle3Anim }],
              }}
            >
              <Sparkles size={14} color="rgba(255,255,255,0.6)" />
            </Animated.View>

            {/* Checkmark Icon */}
            <Animated.View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(255,255,255,0.25)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing.md,
                transform: [{ scale: checkScaleAnim }],
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: 'white',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <CheckCircle size={40} color="#10B981" strokeWidth={2} />
              </View>
            </Animated.View>

            <Text
              style={{
                fontSize: typography.size.xl,
                fontWeight: '700',
                color: 'white',
                textAlign: 'center',
              }}
            >
              {title}
            </Text>
          </LinearGradient>

          {/* Content */}
          <View style={{ padding: spacing.lg }}>
            <Text
              style={{
                fontSize: typography.size.base,
                color: '#4B5563',
                textAlign: 'center',
                lineHeight: 24,
                marginBottom: spacing.lg,
              }}
            >
              {message}
            </Text>

            {/* Action Button */}
            <Pressable
              onPress={handlePress}
              style={({ pressed }) => ({
                backgroundColor: '#10B981',
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                borderRadius: borderRadius.xl,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                ...shadows.md,
              })}
            >
              <Text
                style={{
                  fontSize: typography.size.md,
                  fontWeight: '600',
                  color: 'white',
                }}
              >
                {buttonText}
              </Text>
              <ArrowRight size={20} color="white" />
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
