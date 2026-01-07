import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, Animated, ScrollView, Dimensions } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBiometric } from '@/lib/hooks/useBiometric';
import { BiometricEnrollmentModal } from '@/components/BiometricEnrollmentModal';
import { spacing, borderRadius, animations, shadows, typography, colors } from '@/lib/design-tokens';
import { Brain, Palette, BookOpen, Eye, EyeOff } from 'lucide-react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

// Registration steps with password
const STEPS = {
  EMAIL: 0,
  PASSWORD: 1,
  VERIFY_CODE: 2,
};

export default function RegisterScreen() {
  const params = useLocalSearchParams();
  const isLoginMode = params.mode === 'login';

  const [currentStep, setCurrentStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);

  const router = useRouter();
  const { completeOnboarding, setUserSession } = useAuth();
  const { capability, enrollBiometric } = useBiometric();

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bannerSlideAnim = useRef(new Animated.Value(-100)).current;

  const registerMutation = trpc.auth.register.useMutation();
  const verifyEmailMutation = trpc.auth.verifyEmail.useMutation();
  const completeOnboardingMutation = trpc.auth.completeOnboarding.useMutation();
  const updateBiometricMutation = trpc.auth.updateBiometric.useMutation();
  const loginMutation = trpc.auth.loginWithPassword.useMutation();

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
      toValue: currentStep / 3,
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

  // Password validation
  const validatePassword = (): boolean => {
    if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError('Şifreler eşleşmiyor');
      return false;
    }
    setPasswordError('');
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

  // Step navigation
  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentStep === STEPS.EMAIL) {
      if (validateEmail(email)) {
        setCurrentStep(STEPS.PASSWORD);
      } else {
        triggerShake();
      }
    } else if (currentStep === STEPS.PASSWORD) {
      if (validatePassword()) {
        if (isExistingUser) {
          // Existing user - login with password directly
          await handleLoginWithPassword();
        } else {
          // New user - send verification email
          await handleSendVerificationEmail();
        }
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

      // Send verification email with password
      const result = await registerMutation.mutateAsync({
        email: email.trim(),
        password: password,
      });

      // Check if user already exists
      if (!result.isNewUser) {
        console.log('[Register] ⚠️ User already exists - transforming to login mode');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        // Transform form to login mode with animation
        setIsExistingUser(true);

        // Slide in banner from top
        Animated.spring(bannerSlideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();

        return;
      }

      console.log('[Register] ✅ Verification email sent');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCurrentStep(STEPS.VERIFY_CODE);
    } catch (error) {
      console.error('[Register] ❌ Error sending verification email:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // ✅ FIX: Show specific error message from backend
      const errorMessage = error instanceof Error
        ? error.message
        : 'Email gönderilirken bir hata oluştu. Lütfen tekrar deneyin.';

      Alert.alert('Hata', errorMessage);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithPassword = async () => {
    setIsLoading(true);
    try {
      console.log('[Register/Login] 🔐 Logging in existing user:', email);

      const result = await loginMutation.mutateAsync({
        email: email.trim(),
        password: password,
      });

      if (result.success && result.userId) {
        console.log('[Register/Login] ✅ Login successful');
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
    } catch (error) {
      console.error('[Register/Login] ❌ Login error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage = error instanceof Error
        ? error.message
        : 'Giriş yapılırken bir hata oluştu.';

      Alert.alert('Giriş Başarısız', errorMessage);
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

        // Save JWT tokens and set user session
        if (result.userId && result.accessToken) {
          console.log('[Register] 🔑 Saving auth tokens for user:', result.userId);
          await setUserSession(result.userId, email, undefined, result.accessToken, result.refreshToken);

          // Now call protected endpoints (with Authorization header from tRPC client)
          console.log('[Register] 🎯 Marking onboarding complete');
          await completeOnboardingMutation.mutateAsync();
        }

        // Mark auth as complete locally
        await completeOnboarding();

        console.log('[Register] 🚀 Registration complete');

        // Small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 300));

        // Check if should show biometric enrollment
        if (capability.isAvailable) {
          setShowBiometricModal(true);
        } else {
          router.replace('/(tabs)');
        }
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
      colors={colors.gradients.accessible}
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
          <View style={{ paddingTop: Platform.OS === 'ios' ? (isSmallDevice ? 50 : 60) : 40, paddingHorizontal: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: isSmallDevice ? spacing.md : spacing.lg }}>
              {currentStep > STEPS.EMAIL && (
                <Pressable onPress={handleBack} style={{ marginRight: spacing.md }}>
                  <Text style={{ fontSize: isSmallDevice ? 20 : 24, color: 'white' }}>←</Text>
                </Pressable>
              )}
              <View style={{ flex: 1, height: isSmallDevice ? 4 : 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' }}>
                <Animated.View
                  style={{
                    height: '100%',
                    backgroundColor: 'white',
                    width: progressWidth,
                  }}
                />
              </View>
              <Text style={{ marginLeft: spacing.md, color: 'white', fontSize: typography.fontSize.sm, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                {currentStep + 1}/3
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
                isLoginMode={isLoginMode}
                onLoginPress={() => router.replace('/(onboarding)/login')}
                onRegisterPress={() => router.replace('/register')}
              />
            )}
            {currentStep === STEPS.PASSWORD && (
              <PasswordStepNew
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                passwordError={passwordError}
                setPasswordError={setPasswordError}
                onNext={handleNext}
                isLoading={isLoading}
                isExistingUser={isExistingUser}
                bannerSlideAnim={bannerSlideAnim}
                onForgotPassword={() => router.push('/(onboarding)/forgot-password')}
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
  isLoginMode,
  onLoginPress,
  onRegisterPress,
}: {
  email: string;
  setEmail: (email: string) => void;
  emailError: string;
  setEmailError: (error: string) => void;
  onNext: () => void;
  isLoading: boolean;
  isLoginMode: boolean;
  onLoginPress: () => void;
  onRegisterPress: () => void;
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
          fontSize: isSmallDevice ? typography.fontSize.xl : typography.fontSize.xxl,
          fontWeight: '700',
          color: 'white',
          marginBottom: spacing.sm,
          textAlign: 'center',
          textShadowColor: 'rgba(0,0,0,0.15)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 8,
        }}
      >
        {isLoginMode ? 'Giriş Yap' : 'Hesap Oluşturun'}
      </Text>
      <Text style={{ fontSize: isSmallDevice ? typography.fontSize.sm : typography.fontSize.base, color: 'rgba(255,255,255,0.9)', marginBottom: isSmallDevice ? spacing.lg : spacing.xl, textAlign: 'center', fontWeight: '500', textShadowColor: 'rgba(0,0,0,0.08)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
        {isLoginMode ? 'Email adresinizle devam edin' : 'Çocuğunuzun gelişimini profesyonel olarak takip edin'}
      </Text>

      {/* Value Props - Compact Cards (only show on register, not login) */}
      {!isLoginMode && (
        <View style={{ marginBottom: isSmallDevice ? spacing.md : spacing.xl, gap: isSmallDevice ? spacing.sm : spacing.md }}>
          <View style={{ flexDirection: 'row', gap: isSmallDevice ? spacing.sm : spacing.md }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: borderRadius.md, padding: isSmallDevice ? spacing.sm : spacing.md, ...shadows.md }}>
              <Brain size={isSmallDevice ? 20 : 24} color="white" strokeWidth={1.5} />
              <Text style={{ fontSize: typography.fontSize.sm, fontWeight: '600', color: 'white', marginTop: spacing.xs, textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                Bilimsel Analiz
              </Text>
              {!isSmallDevice && (
                <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs, fontWeight: '400' }}>
                  Uzman onaylı
                </Text>
              )}
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: borderRadius.md, padding: isSmallDevice ? spacing.sm : spacing.md, ...shadows.md }}>
              <Palette size={isSmallDevice ? 20 : 24} color="white" strokeWidth={1.5} />
              <Text style={{ fontSize: typography.fontSize.sm, fontWeight: '600', color: 'white', marginTop: spacing.xs, textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                Gelişim Takibi
              </Text>
              {!isSmallDevice && (
                <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs, fontWeight: '400' }}>
                  Detaylı raporlar
                </Text>
              )}
            </View>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: borderRadius.md, padding: isSmallDevice ? spacing.sm : spacing.md, ...shadows.md }}>
            <BookOpen size={isSmallDevice ? 20 : 24} color="white" strokeWidth={1.5} />
            <Text style={{ fontSize: typography.fontSize.sm, fontWeight: '600', color: 'white', marginTop: spacing.xs, textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
              Güvenli Veri Saklama
            </Text>
            {!isSmallDevice && (
              <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs, fontWeight: '400' }}>
                KVKK uyumlu sistem
              </Text>
            )}
          </View>
        </View>
      )}

      <View
        style={{
          backgroundColor: 'white',
          borderRadius: borderRadius.xl,
          padding: isSmallDevice ? spacing.sm : spacing.md,
          marginBottom: spacing.md,
          ...shadows.lg,
          borderWidth: emailError ? 3 : 2,
          borderColor: emailError ? '#EF4444' : 'rgba(255,255,255,0.6)',
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
            fontSize: isSmallDevice ? typography.fontSize.base : typography.fontSize.md,
            color: '#1F2937',
            padding: spacing.sm,
            fontWeight: '500',
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

      {!isLoginMode && (
        <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: spacing.lg }}>
          Kayıt olarak gizlilik politikasını kabul edersiniz
        </Text>
      )}

      <View style={{ marginBottom: isLoginMode ? spacing.lg : 0 }} />

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
          {isLoading
            ? 'Kod Gönderiliyor...'
            : isLoginMode
              ? 'Giriş Kodu Gönder →'
              : 'Devam Et →'
          }
        </Text>
      </Pressable>

      {/* Login/Register toggle link */}
      <Pressable
        onPress={isLoginMode ? onRegisterPress : onLoginPress}
        style={{ marginTop: spacing.lg }}
      >
        <Text
          style={{
            fontSize: typography.fontSize.sm,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            fontWeight: '500',
            textDecorationLine: 'underline',
          }}
        >
          {isLoginMode ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}
        </Text>
      </Pressable>
    </View>
  );
}

// Password Step with strength indicator
function PasswordStepNew({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordError,
  setPasswordError,
  onNext,
  isLoading,
  isExistingUser,
  bannerSlideAnim,
  onForgotPassword,
}: {
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  passwordError: string;
  setPasswordError: (error: string) => void;
  onNext: () => void;
  isLoading: boolean;
  isExistingUser: boolean;
  bannerSlideAnim: Animated.Value;
  onForgotPassword: () => void;
}) {
  const passwordInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => passwordInputRef.current?.focus(), 300);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      {/* Existing User Banner */}
      {isExistingUser && (
        <Animated.View
          style={{
            transform: [{ translateY: bannerSlideAnim }],
            marginBottom: spacing.lg,
            backgroundColor: '#FEF3C7',
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            borderWidth: 2,
            borderColor: '#F59E0B',
            ...shadows.md,
          }}
        >
          <Text style={{ fontSize: typography.fontSize.lg, fontWeight: '700', color: '#92400E', marginBottom: spacing.xs, textAlign: 'center' }}>
            ✨ Hoşgeldiniz tekrar!
          </Text>
          <Text style={{ fontSize: typography.fontSize.sm, color: '#78350F', textAlign: 'center', marginBottom: spacing.sm }}>
            Bu email adresi zaten kayıtlı. Şifrenizi girerek giriş yapabilirsiniz.
          </Text>
        </Animated.View>
      )}

      <Text
        style={{
          fontSize: isSmallDevice ? typography.fontSize.xl : typography.fontSize.xxl,
          fontWeight: '700',
          color: 'white',
          marginBottom: spacing.sm,
          textAlign: 'center',
          textShadowColor: 'rgba(0,0,0,0.15)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 8,
        }}
      >
        {isExistingUser ? 'Giriş Yapın' : 'Güvenli Şifre Oluşturun'}
      </Text>
      <Text style={{ fontSize: isSmallDevice ? typography.fontSize.sm : typography.fontSize.base, color: 'rgba(255,255,255,0.9)', marginBottom: isSmallDevice ? spacing.lg : spacing.xl, textAlign: 'center', fontWeight: '500', textShadowColor: 'rgba(0,0,0,0.08)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
        {isExistingUser ? 'Hesabınıza erişmek için şifrenizi girin' : 'Hesabınızı korumak için güçlü bir şifre belirleyin'}
      </Text>

      {/* Password Input */}
      <View style={{ backgroundColor: 'white', borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.lg, flexDirection: 'row', alignItems: 'center', borderWidth: passwordError ? 3 : 2, borderColor: passwordError ? '#EF4444' : 'rgba(255,255,255,0.6)' }}>
        <TextInput
          ref={passwordInputRef}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError('');
          }}
          placeholder="Şifreniz (min 6 karakter)"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showPassword}
          autoComplete="password-new"
          style={{ flex: 1, fontSize: isSmallDevice ? typography.fontSize.base : typography.fontSize.md, color: '#1F2937', padding: spacing.sm, fontWeight: '500' }}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: spacing.sm }}>
          {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
        </Pressable>
      </View>

      {/* Confirm Password Input - Hidden for existing users */}
      {!isExistingUser && (
        <View style={{ backgroundColor: 'white', borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.sm, ...shadows.lg, flexDirection: 'row', alignItems: 'center', borderWidth: passwordError ? 3 : 2, borderColor: passwordError ? '#EF4444' : 'rgba(255,255,255,0.6)' }}>
          <TextInput
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (passwordError) setPasswordError('');
            }}
            placeholder="Şifrenizi tekrar girin"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showConfirmPassword}
            autoComplete="password-new"
            style={{ flex: 1, fontSize: isSmallDevice ? typography.fontSize.base : typography.fontSize.md, color: '#1F2937', padding: spacing.sm, fontWeight: '500' }}
          />
          <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: spacing.sm }}>
            {showConfirmPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
          </Pressable>
        </View>
      )}

      {passwordError ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
          <Text style={{ fontSize: 18, marginRight: spacing.xs }}>⚠️</Text>
          <Text style={{ fontSize: typography.fontSize.sm, color: '#FEE2E2', fontWeight: '600' }}>
            {passwordError}
          </Text>
        </View>
      ) : null}

      {!isExistingUser && (
        <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginBottom: spacing.xl, marginTop: spacing.md }}>
          En az 6 karakter içermelidir
        </Text>
      )}

      {/* Forgot Password Link - Only for existing users */}
      {isExistingUser && (
        <Pressable onPress={onForgotPassword} style={{ alignSelf: 'flex-end', marginBottom: spacing.lg }}>
          <Text style={{ fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.9)', textDecorationLine: 'underline', fontWeight: '600' }}>
            Şifremi Unuttum
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={onNext}
        disabled={isExistingUser ? !password || isLoading : (!password || !confirmPassword || isLoading)}
        style={({ pressed }) => [
          {
            backgroundColor: (isExistingUser ? password : (password && confirmPassword)) && !isLoading ? 'white' : 'rgba(255,255,255,0.3)',
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
            color: (isExistingUser ? password : (password && confirmPassword)) && !isLoading ? colors.brand.primary : 'rgba(255,255,255,0.6)',
            textAlign: 'center',
          }}
        >
          {isLoading ? (isExistingUser ? 'Giriş Yapılıyor...' : 'Kaydediliyor...') : (isExistingUser ? 'Giriş Yap →' : 'Devam Et →')}
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
      const result = await registerMutation.mutateAsync({ email });

      // Note: isNewUser should always be false when resending
      // because we're already in the verification step
      console.log('[Register] 📧 Resend result - isNewUser:', result.isNewUser);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Başarılı', 'Yeni doğrulama kodu gönderildi!');
      setResendTimer(60); // 60 saniye beklet
    } catch (error) {
      console.error('[Register] ❌ Error resending code:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // ✅ FIX: Show specific error message from backend
      const errorMessage = error instanceof Error
        ? error.message
        : 'Kod gönderilemedi. Lütfen tekrar deneyin.';

      Alert.alert('Hata', errorMessage);
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
