import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, Animated, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Eye, EyeOff } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBiometric } from '@/lib/hooks/useBiometric';
import { BiometricEnrollmentModal } from '@/components/BiometricEnrollmentModal';
import { spacing, borderRadius, shadows, typography, colors, textShadows } from '@/lib/design-tokens';
import { Mail, Zap } from 'lucide-react-native';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email || '');
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
      if (Platform.OS === 'web') {
        alert('Lütfen email ve şifrenizi girin');
      } else {
        Alert.alert('Hata', 'Lütfen email ve şifrenizi girin');
      }
      return;
    }

    setIsLoading(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      console.log('[Login] 🔐 Attempting login for:', email);
      const result = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });

      console.log('[Login] ✅ Login result:', result);

      if (result.requiresPasswordSetup) {
        // Redirect to password setup for migrated users
        router.push({
          pathname: '/(onboarding)/set-password',
          params: { userId: result.userId, email: email.trim() },
        });
        return;
      }

      if (result.success && result.userId) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Set session with tokens
        console.log('[Login] 💾 Setting user session...');
        await setUserSession(result.userId, result.email!, result.name, result.accessToken, result.refreshToken);
        await completeOnboarding();

        console.log('[Login] 🚀 Navigating to tabs...');

        // Check if should show biometric enrollment
        if (capability.isAvailable && Platform.OS !== 'web') {
          setShowBiometricModal(true);
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      console.error('[Login] ❌ Error:', error);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      if (Platform.OS === 'web') {
        alert(error.message || 'Email veya şifre hatalı');
      } else {
        Alert.alert('Giriş Başarısız', error.message || 'Email veya şifre hatalı');
      }
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
      colors={colors.gradients.vibrant}
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
            <Text style={{ fontSize: typography.fontSize.xxl, fontWeight: '800', color: 'white', marginBottom: spacing.xs, textAlign: 'center', ...textShadows.hero }}>
              Tekrar Hoş Geldiniz!
            </Text>
            <Text style={{ fontSize: typography.fontSize.base, color: 'rgba(255,255,255,0.95)', marginBottom: spacing.xl, textAlign: 'center', fontWeight: '500', lineHeight: 22 }}>
              Hesabınıza giriş yapın
            </Text>

            {/* Email Input with icon */}
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: borderRadius.xxl,
                padding: spacing.xs,
                marginBottom: spacing.md,
                ...shadows.lg,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#F3F4F6',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: spacing.sm,
                  }}
                >
                  <Mail size={20} color="#6366F1" strokeWidth={2} />
                </View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email adresiniz"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={{ flex: 1, fontSize: typography.fontSize.md, color: '#1F2937', paddingVertical: spacing.md, fontWeight: '500' }}
                />
              </View>
            </View>

            {/* Password Input */}
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: borderRadius.xxl,
                padding: spacing.xs,
                marginBottom: spacing.sm,
                ...shadows.lg,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#F3F4F6',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: spacing.sm,
                  }}
                >
                  <Eye size={20} color="#6366F1" strokeWidth={2} />
                </View>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Şifreniz"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  style={{ flex: 1, fontSize: typography.fontSize.md, color: '#1F2937', paddingVertical: spacing.md, fontWeight: '500' }}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: spacing.sm }}>
                  {showPassword ? (
                    <EyeOff size={22} color="#6366F1" />
                  ) : (
                    <Eye size={22} color="#6366F1" />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Forgot Password Link */}
            <Pressable
              onPress={() => router.push({
                pathname: '/(onboarding)/forgot-password',
                params: email ? { email: email.trim() } : undefined,
              })}
              style={{ alignSelf: 'center', marginBottom: spacing.xl, paddingVertical: spacing.sm }}
            >
              <Text style={{ fontSize: typography.fontSize.sm, color: 'white', textDecorationLine: 'underline', fontWeight: '600' }}>
                Şifremi Unuttum
              </Text>
            </Pressable>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={!email || !password || isLoading}
              style={({ pressed }) => [
                {
                  backgroundColor: email && password && !isLoading ? 'white' : 'rgba(255,255,255,0.25)',
                  paddingVertical: spacing.md + spacing.xs,
                  borderRadius: borderRadius.xxxl,
                  ...shadows.lg,
                  marginBottom: spacing.lg,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: spacing.sm,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#6366F1" />
              ) : (
                <>
                  <Text style={{ fontSize: typography.fontSize.md, fontWeight: '700', color: email && password ? '#6366F1' : 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                    Giriş Yap
                  </Text>
                  {email && password && <Zap size={18} color="#6366F1" strokeWidth={2.5} />}
                </>
              )}
            </Pressable>

            {/* Register Link */}
            <Pressable onPress={() => router.push('/(onboarding)/register')} style={{ paddingVertical: spacing.sm }}>
              <Text style={{ fontSize: typography.fontSize.sm, color: 'white', textAlign: 'center', fontWeight: '600' }}>
                Hesabınız yok mu? <Text style={{ textDecorationLine: 'underline' }}>Kayıt olun</Text>
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
