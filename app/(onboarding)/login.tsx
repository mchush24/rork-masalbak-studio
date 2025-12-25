import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, Animated, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Eye, EyeOff } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBiometric } from '@/lib/hooks/useBiometric';
import { BiometricEnrollmentModal } from '@/components/BiometricEnrollmentModal';
import { spacing, borderRadius, shadows, typography, colors } from '@/lib/design-tokens';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  const router = useRouter();
  const { setUserSession, completeOnboarding } = useAuth();
  const {
    capability,
    isChecking,
    loginWithBiometric,
    enrollBiometric,
  } = useBiometric();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const loginMutation = trpc.auth.loginWithPassword.useMutation();
  const updateBiometricMutation = trpc.auth.updateBiometric.useMutation();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    // Try biometric login on mount
    attemptBiometricLogin();
  }, []);

  const attemptBiometricLogin = async () => {
    if (!capability.isAvailable || isChecking) return;

    try {
      const credentials = await loginWithBiometric();
      if (credentials) {
        console.log('[Login] ✅ Biometric login successful');
        await setUserSession(credentials.userId, credentials.email);
        await completeOnboarding();
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('[Login] Biometric login not available or failed');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen email ve şifrenizi girin');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });

      if (result.requiresPasswordSetup) {
        // Redirect to password setup for migrated users
        router.push({
          pathname: '/(onboarding)/set-password',
          params: { userId: result.userId, email: email.trim() },
        });
        return;
      }

      if (result.success && result.userId) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Set session
        await setUserSession(result.userId, result.email!, result.name);
        await completeOnboarding();

        // Check if should show biometric enrollment
        if (capability.isAvailable) {
          setShowBiometricModal(true);
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      console.error('[Login] Error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Giriş Başarısız', error.message || 'Email veya şifre hatalı');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricEnroll = async () => {
    try {
      const result = loginMutation.data;
      if (!result?.userId || !result?.email) return;

      const enrolled = await enrollBiometric(result.email, result.userId);

      if (enrolled) {
        await updateBiometricMutation.mutateAsync({
          userId: result.userId,
          enabled: true,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setShowBiometricModal(false);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('[Login] Biometric enrollment error:', error);
      setShowBiometricModal(false);
      router.replace('/(tabs)');
    }
  };

  return (
    <LinearGradient
      colors={colors.gradients.professional}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ flex: 1, opacity: fadeAnim, padding: spacing.lg, justifyContent: 'center' }}>
            {/* Header */}
            <Text style={{ fontSize: typography.fontSize.xxl, fontWeight: '700', color: 'white', marginBottom: spacing.sm, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }}>
              Giriş Yap
            </Text>
            <Text style={{ fontSize: typography.fontSize.base, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.xl, textAlign: 'center', fontWeight: '500' }}>
              Hesabınıza giriş yapın
            </Text>

            {/* Email Input */}
            <View style={{ backgroundColor: 'white', borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.lg }}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email adresiniz"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={{ fontSize: typography.fontSize.base, color: '#1F2937', padding: spacing.sm, fontWeight: '500' }}
              />
            </View>

            {/* Password Input */}
            <View style={{ backgroundColor: 'white', borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.sm, ...shadows.lg, flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Şifreniz"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                autoComplete="password"
                style={{ flex: 1, fontSize: typography.fontSize.base, color: '#1F2937', padding: spacing.sm, fontWeight: '500' }}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: spacing.sm }}>
                {showPassword ? (
                  <EyeOff size={20} color="#9CA3AF" />
                ) : (
                  <Eye size={20} color="#9CA3AF" />
                )}
              </Pressable>
            </View>

            {/* Forgot Password Link */}
            <Pressable
              onPress={() => router.push('/(onboarding)/forgot-password')}
              style={{ alignSelf: 'flex-end', marginBottom: spacing.xl }}
            >
              <Text style={{ fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.9)', textDecorationLine: 'underline', fontWeight: '600' }}>
                Şifremi Unuttum
              </Text>
            </Pressable>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={!email || !password || isLoading}
              style={({ pressed }) => [
                {
                  backgroundColor: email && password && !isLoading ? 'white' : 'rgba(255,255,255,0.3)',
                  paddingVertical: spacing.lg,
                  borderRadius: borderRadius.xxxl,
                  ...shadows.lg,
                  marginBottom: spacing.lg,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.brand.primary} />
              ) : (
                <Text style={{ fontSize: typography.fontSize.md, fontWeight: 'bold', color: email && password ? colors.brand.primary : 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                  Giriş Yap
                </Text>
              )}
            </Pressable>

            {/* Register Link */}
            <Pressable onPress={() => router.push('/(onboarding)/register')}>
              <Text style={{ fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center', textDecorationLine: 'underline', fontWeight: '500' }}>
                Hesabınız yok mu? Kayıt olun
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Biometric Enrollment Modal */}
      <BiometricEnrollmentModal
        visible={showBiometricModal}
        biometricType={capability.biometricType}
        onEnroll={handleBiometricEnroll}
        onSkip={() => {
          setShowBiometricModal(false);
          router.replace('/(tabs)');
        }}
      />
    </LinearGradient>
  );
}
