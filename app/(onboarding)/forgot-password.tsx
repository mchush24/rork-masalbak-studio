import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Eye, EyeOff } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { spacing, borderRadius, shadows, typography, colors } from '@/lib/design-tokens';

const STEPS = {
  EMAIL: 0,
  CODE: 1,
  NEW_PASSWORD: 2,
};

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation();
  const resetPasswordMutation = trpc.auth.resetPassword.useMutation();

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [step]);

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert('Hata', 'Email adresinizi girin');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await requestResetMutation.mutateAsync({ email: email.trim() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep(STEPS.CODE);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', error.message || 'Kod gönderilemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      Alert.alert('Hata', 'Doğrulama kodu 6 haneli olmalıdır');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(STEPS.NEW_PASSWORD);
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await resetPasswordMutation.mutateAsync({
        email: email.trim(),
        code,
        newPassword,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Başarılı', 'Şifreniz değiştirildi', [
        {
          text: 'Giriş Yap',
          onPress: () => router.replace('/(onboarding)/login'),
        },
      ]);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', error.message || 'Şifre sıfırlama başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={colors.gradients.scientific}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, padding: spacing.lg, justifyContent: 'center' }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Step 1: Email Entry */}
          {step === STEPS.EMAIL && (
            <View>
              <Text style={{ fontSize: typography.fontSize.xxl, fontWeight: '700', color: 'white', marginBottom: spacing.sm, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }}>
                Şifrenizi mi Unuttunuz?
              </Text>
              <Text style={{ fontSize: typography.fontSize.base, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.xl, textAlign: 'center', fontWeight: '500' }}>
                Email adresinize doğrulama kodu göndereceğiz
              </Text>

              <View style={{ backgroundColor: 'white', borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.xl, ...shadows.lg }}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email adresiniz"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ fontSize: typography.fontSize.base, color: '#1F2937', padding: spacing.sm, fontWeight: '500' }}
                />
              </View>

              <Pressable
                onPress={handleRequestReset}
                disabled={!email || isLoading}
                style={({ pressed }) => [
                  {
                    backgroundColor: email && !isLoading ? 'white' : 'rgba(255,255,255,0.3)',
                    paddingVertical: spacing.lg,
                    borderRadius: borderRadius.xxxl,
                    ...shadows.lg,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.brand.primary} />
                ) : (
                  <Text style={{ fontSize: typography.fontSize.md, fontWeight: 'bold', color: email ? colors.brand.primary : 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                    Kod Gönder
                  </Text>
                )}
              </Pressable>
            </View>
          )}

          {/* Step 2: Code Verification */}
          {step === STEPS.CODE && (
            <View>
              <Text style={{ fontSize: typography.fontSize.xxl, fontWeight: '700', color: 'white', marginBottom: spacing.sm, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }}>
                Kodu Girin
              </Text>
              <Text style={{ fontSize: typography.fontSize.base, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.sm, textAlign: 'center', fontWeight: '500' }}>
                {email} adresine gönderilen kodu girin
              </Text>
              <Text style={{ fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.8)', marginBottom: spacing.xl, textAlign: 'center' }}>
                Kod 10 dakika geçerlidir
              </Text>

              <View style={{ backgroundColor: 'white', borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.xl, ...shadows.lg }}>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="000000"
                  placeholderTextColor="#E5E7EB"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  style={{ fontSize: typography.fontSize.xxxl, fontWeight: '600', color: '#1F2937', padding: spacing.sm, textAlign: 'center', letterSpacing: 12 }}
                />
              </View>

              <Pressable
                onPress={handleVerifyCode}
                disabled={code.length !== 6}
                style={({ pressed }) => [
                  {
                    backgroundColor: code.length === 6 ? 'white' : 'rgba(255,255,255,0.3)',
                    paddingVertical: spacing.lg,
                    borderRadius: borderRadius.xxxl,
                    ...shadows.lg,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Text style={{ fontSize: typography.fontSize.md, fontWeight: 'bold', color: code.length === 6 ? colors.brand.primary : 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                  Devam Et
                </Text>
              </Pressable>
            </View>
          )}

          {/* Step 3: New Password */}
          {step === STEPS.NEW_PASSWORD && (
            <View>
              <Text style={{ fontSize: typography.fontSize.xxl, fontWeight: '700', color: 'white', marginBottom: spacing.sm, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 }}>
                Yeni Şifre
              </Text>
              <Text style={{ fontSize: typography.fontSize.base, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.xl, textAlign: 'center', fontWeight: '500' }}>
                Yeni şifrenizi belirleyin
              </Text>

              {/* New Password */}
              <View style={{ backgroundColor: 'white', borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.lg, flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Yeni şifreniz"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  style={{ flex: 1, fontSize: typography.fontSize.base, color: '#1F2937', padding: spacing.sm, fontWeight: '500' }}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: spacing.sm }}>
                  {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                </Pressable>
              </View>

              {/* Confirm Password */}
              <View style={{ backgroundColor: 'white', borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.xl, ...shadows.lg, flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Şifrenizi tekrar girin"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  style={{ flex: 1, fontSize: typography.fontSize.base, color: '#1F2937', padding: spacing.sm, fontWeight: '500' }}
                />
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: spacing.sm }}>
                  {showConfirmPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                </Pressable>
              </View>

              <Pressable
                onPress={handleResetPassword}
                disabled={!newPassword || !confirmPassword || isLoading}
                style={({ pressed }) => [
                  {
                    backgroundColor: newPassword && confirmPassword && !isLoading ? 'white' : 'rgba(255,255,255,0.3)',
                    paddingVertical: spacing.lg,
                    borderRadius: borderRadius.xxxl,
                    ...shadows.lg,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.brand.primary} />
                ) : (
                  <Text style={{ fontSize: typography.fontSize.md, fontWeight: 'bold', color: newPassword && confirmPassword ? colors.brand.primary : 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                    Şifreyi Kaydet
                  </Text>
                )}
              </Pressable>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
