import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Colors } from '@/constants/colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/hooks/useAuth';
import { Ioo as IooMascot } from '@/components/Ioo';
import { getErrorMessage } from '@/lib/utils/error';
import { useBiometric } from '@/lib/hooks/useBiometric';
import { useRole } from '@/lib/contexts/RoleContext';
import { BiometricEnrollmentModal } from '@/components/BiometricEnrollmentModal';
import {
  spacing,
  radius,
  shadows,
  typography,
  iconSizes,
  iconStroke,
} from '@/constants/design-system';
import { useTheme } from '@/lib/theme/ThemeProvider';

export default function LoginScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  const router = useRouter();
  const { setUserSession, completeOnboarding } = useAuth();
  const { capability, isChecking, loginWithBiometric, enrollBiometric } = useBiometric();
  const { isOnboarded: roleOnboarded } = useRole();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (_error) {
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
        await setUserSession(
          result.userId,
          result.email!,
          result.name,
          result.accessToken,
          result.refreshToken
        );
        await completeOnboarding();

        console.log('[Login] 🚀 Navigating...');

        // Check if should show biometric enrollment or role selection
        if (capability.isAvailable && Platform.OS !== 'web') {
          setShowBiometricModal(true);
        } else if (!roleOnboarded) {
          // Role not selected - go to role selection
          router.replace('/(onboarding)/role-select');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      console.error('[Login] ❌ Error:', error);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      const errorMessage = getErrorMessage(error) || 'Email veya şifre hatalı';
      if (Platform.OS === 'web') {
        alert(errorMessage);
      } else {
        Alert.alert('Giriş Başarısız', errorMessage);
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
      // Navigate based on role onboarding status
      if (!roleOnboarded) {
        router.replace('/(onboarding)/role-select');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('[Login] Biometric enrollment error:', error);
      setShowBiometricModal(false);
      if (!roleOnboarded) {
        router.replace('/(onboarding)/role-select');
      } else {
        router.replace('/(tabs)');
      }
    }
  };

  const isEnabled = !!(email && password && !isLoading);

  return (
    <LinearGradient
      colors={[...colors.background.pageGradient] as [string, string, ...string[]]}
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
          <Animated.View
            style={{ flex: 1, opacity: fadeAnim, padding: spacing.lg, justifyContent: 'center' }}
          >
            {/* Mascot + Header */}
            <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
              <IooMascot size="xs" mood="happy" animated showGlow={false} />
            </View>
            <Text
              style={{
                fontSize: typography.size['2xl'],
                fontFamily: typography.family.extrabold,
                color: colors.text.primary,
                marginBottom: spacing.xs,
                textAlign: 'center',
              }}
            >
              Tekrar Hoş Geldiniz!
            </Text>
            <Text
              style={{
                fontSize: typography.size.base,
                color: colors.text.secondary,
                marginBottom: spacing.xl,
                textAlign: 'center',
                fontFamily: typography.family.medium,
                lineHeight: 22,
              }}
            >
              Hesabınıza giriş yapın
            </Text>

            {/* Email Input with icon */}
            <View
              style={{
                backgroundColor: colors.surface.card,
                borderRadius: radius.xl,
                padding: spacing.xs,
                marginBottom: spacing.md,
                borderWidth: 1,
                borderColor: colors.border.light,
                ...shadows.sm,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: colors.secondary.lavender + '1F',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: spacing.sm,
                  }}
                >
                  <Mail
                    size={iconSizes.action}
                    color={colors.secondary.lavender}
                    strokeWidth={iconStroke.standard}
                  />
                </View>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email adresiniz"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  maxLength={254}
                  style={{
                    flex: 1,
                    fontSize: typography.size.md,
                    color: colors.text.primary,
                    paddingVertical: spacing.md,
                    fontFamily: typography.family.medium,
                  }}
                />
              </View>
            </View>

            {/* Password Input */}
            <View
              style={{
                backgroundColor: colors.surface.card,
                borderRadius: radius.xl,
                padding: spacing.xs,
                marginBottom: spacing.sm,
                borderWidth: 1,
                borderColor: colors.border.light,
                ...shadows.sm,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    backgroundColor: colors.secondary.lavender + '1F',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: spacing.sm,
                  }}
                >
                  <Lock
                    size={iconSizes.action}
                    color={colors.secondary.lavender}
                    strokeWidth={iconStroke.standard}
                  />
                </View>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Şifreniz"
                  placeholderTextColor={colors.text.tertiary}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  maxLength={128}
                  style={{
                    flex: 1,
                    fontSize: typography.size.md,
                    color: colors.text.primary,
                    paddingVertical: spacing.md,
                    fontFamily: typography.family.medium,
                  }}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: spacing.sm }}
                >
                  {showPassword ? (
                    <EyeOff
                      size={iconSizes.input}
                      color={colors.secondary.lavender}
                      strokeWidth={iconStroke.standard}
                    />
                  ) : (
                    <Eye
                      size={iconSizes.input}
                      color={colors.secondary.lavender}
                      strokeWidth={iconStroke.standard}
                    />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Forgot Password Link */}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(onboarding)/forgot-password',
                  params: email ? { email: email.trim() } : undefined,
                })
              }
              style={{ alignSelf: 'center', marginBottom: spacing.xl, paddingVertical: spacing.sm }}
            >
              <Text
                style={{
                  fontSize: typography.size.sm,
                  color: colors.secondary.lavender,
                  fontFamily: typography.family.semibold,
                }}
              >
                Şifremi Unuttum
              </Text>
            </Pressable>

            {/* Login Button - Purple gradient */}
            <Pressable
              onPress={handleLogin}
              disabled={!isEnabled}
              style={({ pressed }) => [
                {
                  borderRadius: radius['2xl'],
                  overflow: 'hidden',
                  marginBottom: spacing.lg,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: isEnabled ? 1 : 0.6,
                },
              ]}
            >
              <LinearGradient
                colors={
                  isEnabled
                    ? ([colors.secondary.lavender, '#6D28D9'] as [string, string])
                    : ([colors.neutral.gray300, colors.neutral.gray300] as [string, string])
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: spacing.md + spacing.xs,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      fontSize: typography.size.md,
                      fontFamily: typography.family.bold,
                      color: Colors.neutral.white,
                      textAlign: 'center',
                    }}
                  >
                    Giriş Yap
                  </Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* Divider */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border.light }} />
              <Text
                style={{
                  paddingHorizontal: spacing.md,
                  fontSize: typography.size.xs,
                  color: colors.text.tertiary,
                  fontFamily: typography.family.medium,
                }}
              >
                veya
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.border.light }} />
            </View>

            {/* Register Button - Outlined */}
            <Pressable
              onPress={() => router.push('/(onboarding)/register')}
              style={({ pressed }) => ({
                borderRadius: radius['2xl'],
                borderWidth: 2,
                borderColor: colors.secondary.lavender,
                paddingVertical: spacing.md,
                alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text
                style={{
                  fontSize: typography.size.md,
                  fontFamily: typography.family.bold,
                  color: colors.secondary.lavender,
                  textAlign: 'center',
                }}
              >
                Yeni Hesap Oluştur
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
          if (!roleOnboarded) {
            router.replace('/(onboarding)/role-select');
          } else {
            router.replace('/(tabs)');
          }
        }}
      />
    </LinearGradient>
  );
}
