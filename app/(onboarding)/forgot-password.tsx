import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, Animated, ScrollView, Dimensions } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Eye, EyeOff, Mail, KeyRound, Shield, Zap, ArrowLeft, Sparkles, Heart } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { spacing, borderRadius, shadows, typography, colors } from '@/lib/design-tokens';
import { SuccessModal } from '@/components/SuccessModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

const STEPS = {
  EMAIL: 0,
  CODE: 1,
  NEW_PASSWORD: 2,
};

export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState(params.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const requestResetMutation = trpc.auth.requestPasswordReset.useMutation();
  const resetPasswordMutation = trpc.auth.resetPassword.useMutation();

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 30,
        friction: 8,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // Pulse animation for icons
    if (step === STEPS.CODE) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      ).start();
    }
  }, [step]);

  // Password strength indicator
  const getPasswordStrength = () => {
    if (newPassword.length === 0) return { level: 0, text: '', color: '#9CA3AF' };
    if (newPassword.length < 6) return { level: 1, text: 'Zayıf', color: '#EF4444' };
    if (newPassword.length < 8) return { level: 2, text: 'Orta', color: '#F59E0B' };
    if (newPassword.length >= 8 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)) {
      return { level: 3, text: 'Güçlü', color: '#10B981' };
    }
    return { level: 2, text: 'İyi', color: '#F59E0B' };
  };

  const strength = getPasswordStrength();

  const handleRequestReset = async () => {
    if (!email) {
      if (Platform.OS === 'web') {
        alert('Email adresinizi girin');
      } else {
        Alert.alert('Hata', 'Email adresinizi girin');
      }
      return;
    }

    setIsLoading(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await requestResetMutation.mutateAsync({ email: email.trim() });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setStep(STEPS.CODE);
    } catch (error: any) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      if (Platform.OS === 'web') {
        alert(error.message || 'Kod gönderilemedi');
      } else {
        Alert.alert('Hata', error.message || 'Kod gönderilemedi');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      if (Platform.OS === 'web') {
        alert('Doğrulama kodu 6 haneli olmalıdır');
      } else {
        Alert.alert('Hata', 'Doğrulama kodu 6 haneli olmalıdır');
      }
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setStep(STEPS.NEW_PASSWORD);
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      if (Platform.OS === 'web') {
        alert('Şifre en az 6 karakter olmalıdır');
      } else {
        Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      }
      return;
    }

    if (newPassword !== confirmPassword) {
      if (Platform.OS === 'web') {
        alert('Şifreler eşleşmiyor');
      } else {
        Alert.alert('Hata', 'Şifreler eşleşmiyor');
      }
      return;
    }

    setIsLoading(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      const result = await resetPasswordMutation.mutateAsync({
        email: email.trim(),
        code,
        newPassword,
      });

      console.log('[ForgotPassword] ✅ Reset successful:', result);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setIsLoading(false);
      setShowSuccessModal(true);
      return;
    } catch (error: any) {
      console.error('[ForgotPassword] ❌ Reset error:', error);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      if (Platform.OS === 'web') {
        alert(error.message || 'Şifre sıfırlama başarısız');
      } else {
        Alert.alert('Hata', error.message || 'Şifre sıfırlama başarısız');
      }
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step > STEPS.EMAIL) {
      setStep(step - 1);
    } else {
      router.back();
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
          {/* Header with back button */}
          <View style={{ paddingTop: Platform.OS === 'ios' ? (isSmallDevice ? 50 : 60) : 40, paddingHorizontal: spacing.lg }}>
            <Pressable
              onPress={handleBack}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                paddingVertical: spacing.sm,
              }}
            >
              <ArrowLeft size={20} color="white" />
              <Text style={{ color: 'white', fontSize: typography.fontSize.sm, fontWeight: '600' }}>
                Geri
              </Text>
            </Pressable>
          </View>

          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              padding: spacing.lg,
              justifyContent: 'center',
            }}
          >
            {/* Step 1: Email Entry */}
            {step === STEPS.EMAIL && (
              <View>
                {/* Icon */}
                <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
                  <View
                    style={{
                      width: isSmallDevice ? 56 : 72,
                      height: isSmallDevice ? 56 : 72,
                      borderRadius: isSmallDevice ? 28 : 36,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <KeyRound size={isSmallDevice ? 28 : 36} color="white" strokeWidth={1.5} />
                  </View>
                </View>

                <Text
                  style={{
                    fontSize: isSmallDevice ? typography.fontSize.xl : typography.fontSize.xxl,
                    fontWeight: '800',
                    color: 'white',
                    marginBottom: spacing.xs,
                    textAlign: 'center',
                    textShadowColor: 'rgba(0,0,0,0.2)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 10,
                  }}
                >
                  Şifrenizi mi Unuttunuz?
                </Text>
                <Text
                  style={{
                    fontSize: isSmallDevice ? typography.fontSize.sm : typography.fontSize.base,
                    color: 'rgba(255,255,255,0.95)',
                    marginBottom: spacing.xl,
                    textAlign: 'center',
                    fontWeight: '500',
                    lineHeight: 22,
                  }}
                >
                  Email adresinize doğrulama kodu göndereceğiz
                </Text>

                {/* Email Input */}
                <View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: borderRadius.xxl,
                    padding: spacing.xs,
                    marginBottom: spacing.xl,
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
                      autoFocus
                      style={{
                        flex: 1,
                        fontSize: typography.fontSize.md,
                        color: '#1F2937',
                        paddingVertical: spacing.md,
                        fontWeight: '500',
                      }}
                    />
                  </View>
                </View>

                <Pressable
                  onPress={handleRequestReset}
                  disabled={!email || isLoading}
                  style={({ pressed }) => [
                    {
                      backgroundColor: email && !isLoading ? 'white' : 'rgba(255,255,255,0.25)',
                      paddingVertical: spacing.md + spacing.xs,
                      borderRadius: borderRadius.xxxl,
                      ...shadows.lg,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing.sm,
                    },
                  ]}
                >
                  {isLoading ? (
                    <Text style={{ fontSize: typography.fontSize.md, fontWeight: 'bold', color: '#6366F1' }}>...</Text>
                  ) : (
                    <>
                      <Text
                        style={{
                          fontSize: typography.fontSize.md,
                          fontWeight: '700',
                          color: email ? '#6366F1' : 'rgba(255,255,255,0.6)',
                        }}
                      >
                        Kod Gönder
                      </Text>
                      {email && <Zap size={18} color="#6366F1" strokeWidth={2.5} />}
                    </>
                  )}
                </Pressable>
              </View>
            )}

            {/* Step 2: Code Verification */}
            {step === STEPS.CODE && (
              <View>
                {/* Animated Icon */}
                <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
                  <Animated.View
                    style={{
                      width: isSmallDevice ? 56 : 72,
                      height: isSmallDevice ? 56 : 72,
                      borderRadius: isSmallDevice ? 28 : 36,
                      backgroundColor: '#10B981',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transform: [{ scale: pulseAnim }],
                      ...shadows.lg,
                    }}
                  >
                    <Mail size={isSmallDevice ? 28 : 36} color="white" strokeWidth={1.5} />
                  </Animated.View>
                </View>

                <Text
                  style={{
                    fontSize: isSmallDevice ? typography.fontSize.xl : typography.fontSize.xxl,
                    fontWeight: '800',
                    color: 'white',
                    marginBottom: spacing.xs,
                    textAlign: 'center',
                    textShadowColor: 'rgba(0,0,0,0.2)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 10,
                  }}
                >
                  Kodu Girin
                </Text>
                <Text
                  style={{
                    fontSize: isSmallDevice ? typography.fontSize.sm : typography.fontSize.base,
                    color: 'rgba(255,255,255,0.95)',
                    marginBottom: spacing.sm,
                    textAlign: 'center',
                    fontWeight: '500',
                  }}
                >
                  6 haneli kodu girin
                </Text>

                {/* Email badge */}
                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.full,
                    alignSelf: 'center',
                    marginBottom: spacing.lg,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.xs,
                  }}
                >
                  <Mail size={14} color="white" />
                  <Text style={{ fontSize: typography.fontSize.sm, color: 'white', fontWeight: '600' }}>
                    {email}
                  </Text>
                </View>

                {/* Code Input */}
                <View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: borderRadius.xxl,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                    ...shadows.lg,
                  }}
                >
                  <TextInput
                    value={code}
                    onChangeText={setCode}
                    placeholder="000000"
                    placeholderTextColor="#E5E7EB"
                    keyboardType="number-pad"
                    maxLength={6}
                    autoComplete="one-time-code"
                    textContentType="oneTimeCode"
                    autoFocus
                    style={{
                      fontSize: typography.fontSize.hero,
                      fontWeight: '700',
                      color: '#6366F1',
                      padding: spacing.sm,
                      textAlign: 'center',
                      letterSpacing: 16,
                    }}
                  />

                  {/* Progress dots */}
                  <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <View
                        key={index}
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: index < code.length ? '#6366F1' : '#E5E7EB',
                        }}
                      />
                    ))}
                  </View>
                </View>

                {/* Timer badge */}
                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    padding: spacing.md,
                    borderRadius: borderRadius.xl,
                    marginBottom: spacing.xl,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.sm,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: '#F59E0B',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Sparkles size={18} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: typography.fontSize.sm, color: 'white', fontWeight: '600' }}>
                      Kod 10 dakika geçerlidir
                    </Text>
                    <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.7)' }}>
                      Spam klasörünü de kontrol edin
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={handleVerifyCode}
                  disabled={code.length !== 6}
                  style={({ pressed }) => [
                    {
                      backgroundColor: code.length === 6 ? 'white' : 'rgba(255,255,255,0.25)',
                      paddingVertical: spacing.md + spacing.xs,
                      borderRadius: borderRadius.xxxl,
                      ...shadows.lg,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing.sm,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: typography.fontSize.md,
                      fontWeight: '700',
                      color: code.length === 6 ? '#6366F1' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    Devam Et
                  </Text>
                  {code.length === 6 && <Zap size={18} color="#6366F1" strokeWidth={2.5} />}
                </Pressable>
              </View>
            )}

            {/* Step 3: New Password */}
            {step === STEPS.NEW_PASSWORD && (
              <View>
                {/* Icon */}
                <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
                  <View
                    style={{
                      width: isSmallDevice ? 56 : 72,
                      height: isSmallDevice ? 56 : 72,
                      borderRadius: isSmallDevice ? 28 : 36,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <Shield size={isSmallDevice ? 28 : 36} color="white" strokeWidth={1.5} />
                  </View>
                </View>

                <Text
                  style={{
                    fontSize: isSmallDevice ? typography.fontSize.xl : typography.fontSize.xxl,
                    fontWeight: '800',
                    color: 'white',
                    marginBottom: spacing.xs,
                    textAlign: 'center',
                    textShadowColor: 'rgba(0,0,0,0.2)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 10,
                  }}
                >
                  Yeni Şifre Oluşturun
                </Text>
                <Text
                  style={{
                    fontSize: isSmallDevice ? typography.fontSize.sm : typography.fontSize.base,
                    color: 'rgba(255,255,255,0.95)',
                    marginBottom: spacing.xl,
                    textAlign: 'center',
                    fontWeight: '500',
                    lineHeight: 22,
                  }}
                >
                  Güçlü bir şifre belirleyin
                </Text>

                {/* New Password */}
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
                      <Shield size={20} color="#6366F1" strokeWidth={2} />
                    </View>
                    <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Yeni şifreniz"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      autoFocus
                      style={{
                        flex: 1,
                        fontSize: typography.fontSize.md,
                        color: '#1F2937',
                        paddingVertical: spacing.md,
                        fontWeight: '500',
                      }}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: spacing.sm }}>
                      {showPassword ? <EyeOff size={22} color="#6366F1" /> : <Eye size={22} color="#6366F1" />}
                    </Pressable>
                  </View>
                </View>

                {/* Password Strength Indicator */}
                {newPassword.length > 0 && (
                  <View style={{ marginBottom: spacing.md }}>
                    <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs }}>
                      {[1, 2, 3].map((level) => (
                        <View
                          key={level}
                          style={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: level <= strength.level ? strength.color : 'rgba(255,255,255,0.3)',
                          }}
                        />
                      ))}
                    </View>
                    <Text style={{ fontSize: typography.fontSize.xs, color: strength.color, fontWeight: '600', textAlign: 'right' }}>
                      {strength.text}
                    </Text>
                  </View>
                )}

                {/* Confirm Password */}
                <View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: borderRadius.xxl,
                    padding: spacing.xs,
                    marginBottom: spacing.xl,
                    ...shadows.lg,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: newPassword === confirmPassword && confirmPassword.length > 0 ? '#D1FAE5' : '#F3F4F6',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: spacing.sm,
                      }}
                    >
                      {newPassword === confirmPassword && confirmPassword.length > 0 ? (
                        <Heart size={20} color="#10B981" fill="#10B981" strokeWidth={2} />
                      ) : (
                        <Shield size={20} color="#9CA3AF" strokeWidth={2} />
                      )}
                    </View>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Şifrenizi tekrar girin"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showConfirmPassword}
                      style={{
                        flex: 1,
                        fontSize: typography.fontSize.md,
                        color: '#1F2937',
                        paddingVertical: spacing.md,
                        fontWeight: '500',
                      }}
                    />
                    <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: spacing.sm }}>
                      {showConfirmPassword ? <EyeOff size={22} color="#6366F1" /> : <Eye size={22} color="#6366F1" />}
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  onPress={handleResetPassword}
                  disabled={!newPassword || !confirmPassword || isLoading}
                  style={({ pressed }) => [
                    {
                      backgroundColor: newPassword && confirmPassword && !isLoading ? 'white' : 'rgba(255,255,255,0.25)',
                      paddingVertical: spacing.md + spacing.xs,
                      borderRadius: borderRadius.xxxl,
                      ...shadows.lg,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: spacing.sm,
                    },
                  ]}
                >
                  {isLoading ? (
                    <Text style={{ fontSize: typography.fontSize.md, fontWeight: 'bold', color: '#6366F1' }}>...</Text>
                  ) : (
                    <>
                      <Text
                        style={{
                          fontSize: typography.fontSize.md,
                          fontWeight: '700',
                          color: newPassword && confirmPassword ? '#6366F1' : 'rgba(255,255,255,0.6)',
                        }}
                      >
                        Şifreyi Kaydet
                      </Text>
                      {newPassword && confirmPassword && <Zap size={18} color="#6366F1" strokeWidth={2.5} />}
                    </>
                  )}
                </Pressable>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Başarılı!"
        message="Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz."
        buttonText="Giriş Yap"
        onPress={() => {
          setShowSuccessModal(false);
          router.replace('/(onboarding)/login');
        }}
      />
    </LinearGradient>
  );
}
