import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, Animated, ScrollView } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/hooks/useAuth';
import { spacing, borderRadius, animations, shadows, typography, colors } from '@/lib/design-tokens';
import { Brain, Palette, BookOpen } from 'lucide-react-native';

// Simplified registration - Minimum friction!
const STEPS = {
  EMAIL: 0,
  VERIFY_CODE: 1,
};

export default function RegisterScreen() {
  const [currentStep, setCurrentStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');

  const router = useRouter();
  const { completeOnboarding } = useAuth();

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const registerMutation = trpc.auth.register.useMutation();
  const verifyEmailMutation = trpc.auth.verifyEmail.useMutation();
  const completeOnboardingMutation = trpc.auth.completeOnboarding.useMutation();

  // Animate step transitions
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animations.slow,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        ...animations.easing.gentle,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: currentStep / 2,
      duration: animations.normal,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('E-posta adresi gereklidir');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Geçerli bir e-posta adresi girin');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Shake animation for errors
  const triggerShake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  };

  // Step navigation - simplified!
  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentStep === STEPS.EMAIL) {
      if (validateEmail(email)) {
        await handleSendVerificationEmail();
      } else {
        triggerShake();
      }
    } else if (currentStep === STEPS.VERIFY_CODE) {
      await handleVerifyCode();
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep > STEPS.EMAIL) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSendVerificationEmail = async () => {
    setIsLoading(true);
    try {
      console.log('[Register] 📧 Sending verification email to:', email);

      // Send verification email - no name/age needed yet!
      await registerMutation.mutateAsync({
        email: email.trim(),
      });

      console.log('[Register] ✅ Verification email sent');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCurrentStep(STEPS.VERIFY_CODE);
    } catch (error) {
      console.error('[Register] ❌ Error sending verification email:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Hata',
        'Email gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setCodeError('Doğrulama kodu 6 haneli olmalıdır');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setCodeError('');

    try {
      console.log('[Register] 🔐 Verifying code:', verificationCode);

      const result = await verifyEmailMutation.mutateAsync({
        email: email.trim(),
        code: verificationCode,
      });

      if (result.success) {
        console.log('[Register] ✅ Email verified - completing onboarding');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Mark onboarding complete with user ID from backend
        if (result.userId) {
          console.log('[Register] 🎯 Marking onboarding complete for user:', result.userId);
          await completeOnboardingMutation.mutateAsync({
            userId: result.userId,
          });
        }

        // Mark auth as complete
        await completeOnboarding();

        console.log('[Register] 🚀 Redirecting to app...');

        // Small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 300));

        // Go directly to app!
        router.replace('/(tabs)');
      } else {
        setCodeError(result.message);
        triggerShake();
      }
    } catch (error) {
      console.error('[Register] ❌ Error verifying code:', error);
      setCodeError('Doğrulama kodu hatalı. Lütfen tekrar deneyin.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={colors.gradients.warm}
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
          {/* Progress bar - simplified! */}
          <View style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
              {currentStep > STEPS.EMAIL && (
                <Pressable onPress={handleBack} style={{ marginRight: spacing.md }}>
                  <Text style={{ fontSize: 24, color: 'white' }}>←</Text>
                </Pressable>
              )}
              <View style={{ flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                <Animated.View
                  style={{
                    height: '100%',
                    backgroundColor: 'white',
                    width: progressWidth,
                  }}
                />
              </View>
              <Text style={{ marginLeft: spacing.md, color: 'white', fontSize: typography.fontSize.sm, fontWeight: '600' }}>
                {currentStep + 1}/2
              </Text>
            </View>
          </View>

          {/* Content - only EMAIL and VERIFY_CODE! */}
          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { translateX: shakeAnim },
              ],
              paddingHorizontal: spacing.lg,
            }}
          >
            {currentStep === STEPS.EMAIL && (
              <EmailStepNew
                email={email}
                setEmail={setEmail}
                emailError={emailError}
                setEmailError={setEmailError}
                onNext={handleNext}
                isLoading={isLoading}
              />
            )}
            {currentStep === STEPS.VERIFY_CODE && (
              <VerifyCodeStepNew
                verificationCode={verificationCode}
                setVerificationCode={setVerificationCode}
                codeError={codeError}
                onNext={handleNext}
                isLoading={isLoading}
                email={email}
              />
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// New Email Step with inline value props
function EmailStepNew({
  email,
  setEmail,
  emailError,
  setEmailError,
  onNext,
  isLoading,
}: {
  email: string;
  setEmail: (email: string) => void;
  emailError: string;
  setEmailError: (error: string) => void;
  onNext: () => void;
  isLoading: boolean;
}) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Auto-focus on mount
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Text
        style={{
          fontSize: typography.fontSize.xxxl,
          fontWeight: 'bold',
          color: 'white',
          marginBottom: spacing.sm,
          textAlign: 'center',
        }}
      >
        Maceraya Başla
      </Text>
      <Text style={{ fontSize: typography.fontSize.base, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.xxl, textAlign: 'center' }}>
        Çocuğunuzun hayal dünyasını keşfedin
      </Text>

      {/* Value Props - Compact Cards */}
      <View style={{ marginBottom: spacing.xl, gap: spacing.md }}>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: borderRadius.lg, padding: spacing.md, ...shadows.md }}>
            <Brain size={24} color="white" />
            <Text style={{ fontSize: typography.fontSize.sm, fontWeight: '600', color: 'white', marginTop: spacing.xs }}>
              Çizim Analizi
            </Text>
            <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs }}>
              AI destekli analiz
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: borderRadius.lg, padding: spacing.md, ...shadows.md }}>
            <Palette size={24} color="white" />
            <Text style={{ fontSize: typography.fontSize.sm, fontWeight: '600', color: 'white', marginTop: spacing.xs }}>
              Boyama Sayfaları
            </Text>
            <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs }}>
              PDF olarak indir
            </Text>
          </View>
        </View>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: borderRadius.lg, padding: spacing.md, ...shadows.md }}>
          <BookOpen size={24} color="white" />
          <Text style={{ fontSize: typography.fontSize.sm, fontWeight: '600', color: 'white', marginTop: spacing.xs }}>
            Kişisel Hikayeler
          </Text>
          <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: spacing.xs }}>
            Çizimlerden masallar oluşturun
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: 'white',
          borderRadius: borderRadius.xl,
          padding: spacing.md,
          marginBottom: spacing.md,
          ...shadows.lg,
          borderWidth: emailError ? 2 : 0,
          borderColor: emailError ? '#EF4444' : 'transparent',
        }}
      >
        <TextInput
          ref={inputRef}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError('');
          }}
          placeholder="Email adresiniz"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={{
            fontSize: typography.fontSize.md,
            color: '#1F2937',
            padding: spacing.sm,
          }}
        />
      </View>

      {emailError ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
          <Text style={{ fontSize: 18, marginRight: spacing.xs }}>⚠️</Text>
          <Text style={{ fontSize: typography.fontSize.sm, color: '#FEE2E2', fontWeight: '600' }}>
            {emailError}
          </Text>
        </View>
      ) : null}

      <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: spacing.lg }}>
        Kayıt olarak gizlilik politikasını kabul edersiniz
      </Text>

      <Pressable
        onPress={onNext}
        disabled={!email || isLoading}
        style={({ pressed }) => [
          {
            backgroundColor: email && !isLoading ? 'white' : 'rgba(255,255,255,0.3)',
            paddingVertical: spacing.md + spacing.xs,
            borderRadius: borderRadius.xxxl,
            ...shadows.lg,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <Text
          style={{
            fontSize: typography.fontSize.md,
            fontWeight: 'bold',
            color: email && !isLoading ? colors.brand.primary : 'rgba(255,255,255,0.6)',
            textAlign: 'center',
          }}
        >
          {isLoading ? 'Email Gönderiliyor...' : 'Devam Et →'}
        </Text>
      </Pressable>
    </View>
  );
}

// Verify Code Step with resend functionality
function VerifyCodeStepNew({
  verificationCode,
  setVerificationCode,
  codeError,
  onNext,
  isLoading,
  email,
}: {
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  codeError: string;
  onNext: () => void;
  isLoading: boolean;
  email: string;
}) {
  const inputRef = useRef<TextInput>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const registerMutation = trpc.auth.register.useMutation();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      console.log('[Register] 🔄 Resending verification code to:', email);
      await registerMutation.mutateAsync({ email });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Başarılı', 'Yeni doğrulama kodu gönderildi!');
      setResendTimer(60); // 60 saniye beklet
    } catch (error) {
      console.error('[Register] ❌ Error resending code:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', 'Kod gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Text
        style={{
          fontSize: typography.fontSize.xxl,
          fontWeight: 'bold',
          color: 'white',
          marginBottom: spacing.md,
        }}
      >
        Email Adresini Doğrula
      </Text>
      <Text style={{ fontSize: typography.fontSize.base, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.sm }}>
        {email} adresine gönderdiğimiz 6 haneli kodu gir
      </Text>
      <Text style={{ fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.8)', marginBottom: spacing.xxl }}>
        Kod 10 dakika geçerlidir
      </Text>

      <View
        style={{
          backgroundColor: 'white',
          borderRadius: borderRadius.xl,
          padding: spacing.md,
          marginBottom: spacing.md,
          ...shadows.lg,
          borderWidth: codeError ? 2 : 0,
          borderColor: codeError ? '#EF4444' : 'transparent',
        }}
      >
        <TextInput
          ref={inputRef}
          value={verificationCode}
          onChangeText={setVerificationCode}
          placeholder="000000"
          placeholderTextColor="#E5E7EB"
          keyboardType="number-pad"
          maxLength={6}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          style={{
            fontSize: typography.fontSize.xxxl,
            fontWeight: '600',
            color: '#1F2937',
            padding: spacing.sm,
            textAlign: 'center',
            letterSpacing: 12,
          }}
        />
      </View>

      {codeError ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
          <Text style={{ fontSize: 18, marginRight: spacing.xs }}>⚠️</Text>
          <Text style={{ fontSize: typography.fontSize.sm, color: '#FEE2E2', fontWeight: '600' }}>
            {codeError}
          </Text>
        </View>
      ) : null}

      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          padding: spacing.md,
          borderRadius: borderRadius.lg,
          marginBottom: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
          <Text style={{ fontSize: 20, marginRight: spacing.sm }}>📧</Text>
          <Text style={{ fontSize: typography.fontSize.sm, color: 'white', fontWeight: '600' }}>
            Emailini Kontrol Et
          </Text>
        </View>
        <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.8)' }}>
          Spam klasörüne de bakabilirsin
        </Text>
      </View>

      {/* Resend Code Button */}
      <Pressable
        onPress={handleResendCode}
        disabled={isResending || resendTimer > 0}
        style={{ marginBottom: spacing.xl, alignItems: 'center' }}
      >
        <Text
          style={{
            fontSize: typography.fontSize.sm,
            color: resendTimer > 0 ? 'rgba(255,255,255,0.5)' : 'white',
            textDecorationLine: resendTimer > 0 ? 'none' : 'underline',
            fontWeight: '600',
          }}
        >
          {isResending
            ? 'Gönderiliyor...'
            : resendTimer > 0
            ? `Yeni kod gönder (${resendTimer}s)`
            : 'Yeni kod gönder'}
        </Text>
      </Pressable>

      <Pressable
        onPress={onNext}
        disabled={verificationCode.length !== 6 || isLoading}
        style={({ pressed }) => [
          {
            backgroundColor: verificationCode.length === 6 && !isLoading ? 'white' : 'rgba(255,255,255,0.3)',
            paddingVertical: spacing.md + spacing.xs,
            borderRadius: borderRadius.xxxl,
            ...shadows.lg,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <Text
          style={{
            fontSize: typography.fontSize.md,
            fontWeight: 'bold',
            color: verificationCode.length === 6 && !isLoading ? colors.brand.primary : 'rgba(255,255,255,0.6)',
            textAlign: 'center',
          }}
        >
          {isLoading ? 'Doğrulanıyor...' : 'Doğrula →'}
        </Text>
      </Pressable>
    </View>
  );
}
