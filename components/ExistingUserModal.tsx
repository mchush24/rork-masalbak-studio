import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Modal, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserCheck, ArrowRight, X } from 'lucide-react-native';
import { spacing, borderRadius, shadows, typography } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ExistingUserModalProps {
  visible: boolean;
  email: string;
  onLogin: () => void;
  onDismiss: () => void;
}

export function ExistingUserModal({ visible, email, onLogin, onDismiss }: ExistingUserModalProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleLogin = () => {
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
      onLogin();
    });
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.lg,
          opacity: opacityAnim,
        }}
      >
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
          onPress={onDismiss}
        />

        <Animated.View
          style={{
            width: Math.min(SCREEN_WIDTH - spacing.lg * 2, 360),
            backgroundColor: 'white',
            borderRadius: borderRadius.xxl,
            overflow: 'hidden',
            transform: [{ scale: scaleAnim }],
            ...shadows.xl,
          }}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={[Colors.secondary.indigo, Colors.secondary.violet]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: spacing.xl,
              paddingHorizontal: spacing.lg,
              alignItems: 'center',
            }}
          >
            {/* Close button */}
            <Pressable
              onPress={onDismiss}
              style={{
                position: 'absolute',
                top: spacing.md,
                right: spacing.md,
                padding: spacing.xs,
              }}
            >
              <X size={20} color="rgba(255,255,255,0.7)" />
            </Pressable>

            {/* Icon */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: 'rgba(255,255,255,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing.md,
              }}
            >
              <UserCheck size={36} color="white" strokeWidth={1.5} />
            </View>

            <Text
              style={{
                fontSize: typography.size.xl,
                fontWeight: '700',
                color: 'white',
                textAlign: 'center',
              }}
            >
              Tekrar Hoş Geldiniz!
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
                marginBottom: spacing.sm,
              }}
            >
              Bu email adresi ile daha önce kayıt olmuşsunuz:
            </Text>

            <View
              style={{
                backgroundColor: Colors.neutral.gray100,
                borderRadius: borderRadius.lg,
                padding: spacing.md,
                marginBottom: spacing.lg,
              }}
            >
              <Text
                style={{
                  fontSize: typography.size.base,
                  fontWeight: '600',
                  color: '#1F2937',
                  textAlign: 'center',
                }}
              >
                {email}
              </Text>
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              style={({ pressed }) => ({
                backgroundColor: Colors.secondary.indigo,
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
                Giriş Yap
              </Text>
              <ArrowRight size={20} color="white" />
            </Pressable>

            {/* Secondary action */}
            <Pressable
              onPress={onDismiss}
              style={{
                marginTop: spacing.md,
                paddingVertical: spacing.sm,
              }}
            >
              <Text
                style={{
                  fontSize: typography.size.sm,
                  color: '#6B7280',
                  textAlign: 'center',
                }}
              >
                Farklı email kullan
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
