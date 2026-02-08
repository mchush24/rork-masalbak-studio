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
  Dimensions,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/hooks/useAuth';
import { useBiometric } from '@/lib/hooks/useBiometric';
import { useRole } from '@/lib/contexts/RoleContext';
import { ExistingUserModal } from '@/components/ExistingUserModal';
import {
  spacing,
  radius,
  shadows,
  typography,
  iconSizes,
  iconStroke,
  iconColors,
  textShadows,
  animation,
} from '@/constants/design-system';
import { Colors } from '@/constants/colors';
import {
  Brain,
  Eye,
  EyeOff,
  Mail,
  Sparkles,
  Shield,
  ChartLine,
  Star,
  Heart,
  Zap,
} from 'lucide-react-native';

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
  const [_showBiometricModal, setShowBiometricModal] = useState(false);
  const [showExistingUserModal, setShowExistingUserModal] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);

  const router = useRouter();
  const { completeOnboarding, setUserSession } = useAuth();
  const { capability, enrollBiometric: _enrollBiometric } = useBiometric();
  const { isOnboarded: roleOnboarded } = useRole();

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bannerSlideAnim = useRef(new Animated.Value(-100)).current;

  const registerMutation = trpc.auth.register.useMutation();
  const verifyEmailMutation = trpc.auth.verifyEmail.useMutation();
  const completeOnboardingMutation = trpc.auth.completeOnboarding.useMutation();
  const _updateBiometricMutation = trpc.auth.updateBiometric.useMutation();
  const loginMutation = trpc.auth.loginWithPassword.useMutation();
  const checkEmailMutation = trpc.auth.checkEmail.useMutation();

  // Animate step transitions
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: animation.duration.slow,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        ...animation.spring.gentle,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: currentStep / 3,
      duration: animation.duration.normal,
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Platform-safe alert (Alert.alert is not available on web)
  const safeAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Shake animation for errors
  const triggerShake = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  // Step navigation
  const handleNext = async () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentStep === STEPS.EMAIL) {
      if (validateEmail(email)) {
        // Check if email already exists
        setIsLoading(true);
        try {
          const result = await checkEmailMutation.mutateAsync({ email: email.trim() });

          if (result.exists && result.hasPassword) {
            // User already registered with password - show modal
            console.log('[Register] 📧 User already exists - showing modal');
            if (Platform.OS !== 'web')
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setShowExistingUserModal(true);
            return;
          }

          // New user or user without password - continue to password step
          setCurrentStep(STEPS.PASSWORD);
        } catch (error) {
          console.error('[Register] ❌ Error checking email:', error);
          // On error, continue to password step (will be caught later)
          setCurrentStep(STEPS.PASSWORD);
        } finally {
          setIsLoading(false);
        }
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
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        if (Platform.OS !== 'web')
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
      if (Platform.OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCurrentStep(STEPS.VERIFY_CODE);
    } catch (error) {
      console.error('[Register] ❌ Error sending verification email:', error);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Email gönderilirken bir hata oluştu. Lütfen tekrar deneyin.';

      safeAlert('Hata', errorMessage);
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
        if (Platform.OS !== 'web')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Set session with tokens
        await setUserSession(
          result.userId,
          result.email!,
          result.name,
          result.accessToken,
          result.refreshToken
        );
        await completeOnboarding();

        // Check if should show biometric enrollment or role selection
        if (capability.isAvailable) {
          setShowBiometricModal(true);
        } else if (!roleOnboarded) {
          // New user or role not selected - go to role selection
          router.replace('/(onboarding)/role-select');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      console.error('[Register/Login] ❌ Login error:', error);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage =
        error instanceof Error ? error.message : 'Giriş yapılırken bir hata oluştu.';

      safeAlert('Giriş Başarısız', errorMessage);
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
        if (Platform.OS !== 'web')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Save JWT tokens and set user session
        if (result.userId && result.accessToken) {
          console.log('[Register] 🔑 Saving auth tokens for user:', result.userId);
          await setUserSession(
            result.userId,
            email,
            undefined,
            result.accessToken,
            result.refreshToken
          );

          // Now call protected endpoints (with Authorization header from tRPC client)
          console.log('[Register] 🎯 Marking onboarding complete');
          await completeOnboardingMutation.mutateAsync();
        }

        // Mark auth as complete locally
        await completeOnboarding();

        console.log('[Register] 🚀 Registration complete');

        // Small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 300));

        // Check if should show biometric enrollment or role selection
        if (capability.isAvailable) {
          setShowBiometricModal(true);
        } else {
          // New user - go to role selection
          router.replace('/(onboarding)/role-select');
        }
      } else {
        setCodeError(result.message);
        triggerShake();
      }
    } catch (error) {
      console.error('[Register] ❌ Error verifying code:', error);
      setCodeError('Doğrulama kodu hatalı. Lütfen tekrar deneyin.');
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
      colors={[Colors.secondary.lavender, '#818CF8', Colors.secondary.sky]}
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
          <View
            style={{
              paddingTop: Platform.OS === 'ios' ? (isSmallDevice ? 50 : 60) : 40,
              paddingHorizontal: spacing.lg,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: isSmallDevice ? spacing.md : spacing.lg,
              }}
            >
              {currentStep > STEPS.EMAIL && (
                <Pressable onPress={handleBack} style={{ marginRight: spacing.md }}>
                  <Text style={{ fontSize: isSmallDevice ? 20 : 24, color: 'white' }}>←</Text>
                </Pressable>
              )}
              <View
                style={{
                  flex: 1,
                  height: isSmallDevice ? 4 : 6,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  borderRadius: 3,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.4)',
                }}
              >
                <Animated.View
                  style={{
                    height: '100%',
                    backgroundColor: 'white',
                    width: progressWidth,
                  }}
                />
              </View>
              <Text
                style={{
                  marginLeft: spacing.md,
                  color: 'white',
                  fontSize: typography.size.sm,
                  fontWeight: '600',
                  ...textShadows.sm,
                }}
              >
                {currentStep + 1}/3
              </Text>
            </View>
          </View>

          {/* Content - only EMAIL and VERIFY_CODE! */}
          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { translateX: shakeAnim }],
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
                onForgotPassword={() =>
                  router.push({
                    pathname: '/(onboarding)/forgot-password',
                    params: email ? { email: email.trim() } : undefined,
                  })
                }
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

      {/* Existing User Modal */}
      <ExistingUserModal
        visible={showExistingUserModal}
        email={email}
        onLogin={() => {
          setShowExistingUserModal(false);
          router.replace({
            pathname: '/(onboarding)/login',
            params: { email: email.trim() },
          });
        }}
        onDismiss={() => setShowExistingUserModal(false)}
      />
    </LinearGradient>
  );
}

// New Email Step with colorful value props
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
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto-focus on mount
    setTimeout(() => inputRef.current?.focus(), 300);

    // Subtle glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Feature cards with vibrant colors
  const features = [
    {
      icon: Brain,
      title: 'Bilimsel Analiz',
      subtitle: 'Uzman onaylı',
      bgColor: '#EC4899',
      iconBg: 'rgba(236, 72, 153, 0.2)',
    },
    {
      icon: ChartLine,
      title: 'Gelişim Takibi',
      subtitle: 'Detaylı raporlar',
      bgColor: '#10B981',
      iconBg: 'rgba(16, 185, 129, 0.2)',
    },
    {
      icon: Shield,
      title: 'Güvenli Veri',
      subtitle: 'KVKK uyumlu',
      bgColor: '#3B82F6',
      iconBg: 'rgba(59, 130, 246, 0.2)',
    },
  ];

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      {/* Sparkle icon */}
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
          <Sparkles size={isSmallDevice ? 28 : 36} color="white" strokeWidth={1.5} />
        </View>
      </View>

      <Text
        style={{
          fontSize: isSmallDevice ? typography.size.xl : typography.size['2xl'],
          fontWeight: '800',
          color: 'white',
          marginBottom: spacing.xs,
          textAlign: 'center',
          ...textShadows.hero,
        }}
      >
        {isLoginMode ? 'Tekrar Hoş Geldiniz!' : "Renkioo'ya Hoş Geldiniz!"}
      </Text>
      <Text
        style={{
          fontSize: isSmallDevice ? typography.size.sm : typography.size.base,
          color: 'rgba(255,255,255,0.95)',
          marginBottom: isSmallDevice ? spacing.lg : spacing.xl,
          textAlign: 'center',
          fontWeight: '500',
          lineHeight: 22,
        }}
      >
        {isLoginMode
          ? 'Email adresinizle devam edin'
          : 'Çocuğunuzun gelişimini profesyonel olarak takip edin'}
      </Text>

      {/* Colorful Feature Cards (only show on register, not login) */}
      {!isLoginMode && (
        <View style={{ marginBottom: isSmallDevice ? spacing.lg : spacing.xl }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: radius.lg,
                  padding: isSmallDevice ? spacing.sm : spacing.md,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.25)',
                  alignItems: 'center',
                }}
              >
                {/* Colorful icon circle */}
                <View
                  style={{
                    width: isSmallDevice ? 36 : 44,
                    height: isSmallDevice ? 36 : 44,
                    borderRadius: isSmallDevice ? 18 : 22,
                    backgroundColor: feature.bgColor,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: spacing.xs,
                    ...shadows.md,
                  }}
                >
                  <feature.icon size={isSmallDevice ? 18 : 22} color="white" strokeWidth={2} />
                </View>
                <Text
                  style={{
                    fontSize: isSmallDevice ? 11 : typography.size.xs,
                    fontWeight: '700',
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: 2,
                  }}
                >
                  {feature.title}
                </Text>
                {!isSmallDevice && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.8)',
                      textAlign: 'center',
                    }}
                  >
                    {feature.subtitle}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Email Input with icon */}
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: radius.xl,
          padding: spacing.xs,
          marginBottom: spacing.md,
          ...shadows.lg,
          borderWidth: emailError ? 3 : 0,
          borderColor: emailError ? '#EF4444' : 'transparent',
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
            <Mail
              size={iconSizes.action}
              color={Colors.secondary.lavender}
              strokeWidth={iconStroke.standard}
            />
          </View>
          <TextInput
            ref={inputRef}
            value={email}
            onChangeText={text => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            placeholder="Email adresiniz"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={{
              flex: 1,
              fontSize: isSmallDevice ? typography.size.base : typography.size.md,
              color: '#1F2937',
              paddingVertical: spacing.md,
              fontWeight: '500',
            }}
          />
        </View>
      </View>

      {emailError ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.md,
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            padding: spacing.sm,
            borderRadius: radius.md,
          }}
        >
          <Text style={{ fontSize: 16, marginRight: spacing.xs }}>⚠️</Text>
          <Text style={{ fontSize: typography.size.sm, color: 'white', fontWeight: '600' }}>
            {emailError}
          </Text>
        </View>
      ) : null}

      {!isLoginMode && (
        <Text
          style={{
            fontSize: typography.size.xs,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            marginBottom: spacing.md,
          }}
        >
          Kayıt olarak gizlilik politikasını kabul edersiniz
        </Text>
      )}

      {/* CTA Button with gradient effect */}
      <Pressable
        onPress={onNext}
        disabled={!email || isLoading}
        style={({ pressed }) => [
          {
            backgroundColor: email && !isLoading ? 'white' : 'rgba(255,255,255,0.25)',
            paddingVertical: spacing.md + spacing.xs,
            borderRadius: radius['2xl'],
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
          <Text
            style={{
              fontSize: typography.size.md,
              fontWeight: 'bold',
              color: '#6366F1',
              textAlign: 'center',
            }}
          >
            ...
          </Text>
        ) : (
          <>
            <Text
              style={{
                fontSize: typography.size.md,
                fontWeight: '700',
                color: email ? '#6366F1' : 'rgba(255,255,255,0.6)',
                textAlign: 'center',
              }}
            >
              {isLoginMode ? 'Giriş Yap' : 'Başlayalım'}
            </Text>
            {email && (
              <Zap
                size={iconSizes.small}
                color={Colors.secondary.lavender}
                strokeWidth={iconStroke.bold}
              />
            )}
          </>
        )}
      </Pressable>

      {/* Login/Register toggle link */}
      <Pressable
        onPress={isLoginMode ? onRegisterPress : onLoginPress}
        style={{ marginTop: spacing.lg, paddingVertical: spacing.sm }}
      >
        <Text
          style={{
            fontSize: typography.size.sm,
            color: 'white',
            textAlign: 'center',
            fontWeight: '600',
          }}
        >
          {isLoginMode ? 'Hesabınız yok mu? ' : 'Zaten hesabınız var mı? '}
          <Text style={{ textDecorationLine: 'underline' }}>
            {isLoginMode ? 'Kayıt olun' : 'Giriş yapın'}
          </Text>
        </Text>
      </Pressable>
    </View>
  );
}

// Password Step with modern design
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

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length === 0) return { level: 0, text: '', color: '#9CA3AF' };
    if (password.length < 6) return { level: 1, text: 'Zayıf', color: '#EF4444' };
    if (password.length < 8) return { level: 2, text: 'Orta', color: '#F59E0B' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 3, text: 'Güçlü', color: '#10B981' };
    }
    return { level: 2, text: 'İyi', color: '#F59E0B' };
  };

  const strength = getPasswordStrength();

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      {/* Existing User Banner */}
      {isExistingUser && (
        <Animated.View
          style={{
            transform: [{ translateY: bannerSlideAnim }],
            marginBottom: spacing.lg,
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: radius.xl,
            padding: spacing.lg,
            borderLeftWidth: 4,
            borderLeftColor: '#F59E0B',
            ...shadows.lg,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
            <Star
              size={iconSizes.action}
              color={Colors.secondary.sunshine}
              fill={Colors.secondary.sunshine}
              strokeWidth={iconStroke.standard}
            />
            <Text
              style={{
                fontSize: typography.size.md,
                fontWeight: '700',
                color: '#92400E',
                marginLeft: spacing.sm,
              }}
            >
              Hoşgeldiniz tekrar!
            </Text>
          </View>
          <Text style={{ fontSize: typography.size.sm, color: '#78350F' }}>
            Bu email adresi zaten kayıtlı. Şifrenizi girerek giriş yapabilirsiniz.
          </Text>
        </Animated.View>
      )}

      {/* Lock Icon */}
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
          fontSize: isSmallDevice ? typography.size.xl : typography.size['2xl'],
          fontWeight: '800',
          color: 'white',
          marginBottom: spacing.xs,
          textAlign: 'center',
          ...textShadows.hero,
        }}
      >
        {isExistingUser ? 'Şifrenizi Girin' : 'Güvenli Şifre Oluşturun'}
      </Text>
      <Text
        style={{
          fontSize: isSmallDevice ? typography.size.sm : typography.size.base,
          color: 'rgba(255,255,255,0.95)',
          marginBottom: isSmallDevice ? spacing.lg : spacing.xl,
          textAlign: 'center',
          fontWeight: '500',
          lineHeight: 22,
        }}
      >
        {isExistingUser
          ? 'Hesabınıza erişmek için şifrenizi girin'
          : 'Hesabınızı korumak için güçlü bir şifre belirleyin'}
      </Text>

      {/* Password Input */}
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: radius.xl,
          padding: spacing.xs,
          marginBottom: spacing.md,
          ...shadows.lg,
          borderWidth: passwordError ? 3 : 0,
          borderColor: passwordError ? '#EF4444' : 'transparent',
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
            <Shield
              size={iconSizes.action}
              color={Colors.secondary.lavender}
              strokeWidth={iconStroke.standard}
            />
          </View>
          <TextInput
            ref={passwordInputRef}
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (passwordError) setPasswordError('');
            }}
            placeholder="Şifreniz"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            autoComplete="password-new"
            style={{
              flex: 1,
              fontSize: isSmallDevice ? typography.size.base : typography.size.md,
              color: '#1F2937',
              paddingVertical: spacing.md,
              fontWeight: '500',
            }}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: spacing.sm }}>
            {showPassword ? (
              <EyeOff
                size={iconSizes.input}
                color={Colors.secondary.lavender}
                strokeWidth={iconStroke.standard}
              />
            ) : (
              <Eye
                size={iconSizes.input}
                color={Colors.secondary.lavender}
                strokeWidth={iconStroke.standard}
              />
            )}
          </Pressable>
        </View>
      </View>

      {/* Password Strength Indicator - only for new users */}
      {!isExistingUser && password.length > 0 && (
        <View style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs }}>
            {[1, 2, 3].map(level => (
              <View
                key={level}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor:
                    level <= strength.level ? strength.color : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </View>
          <Text
            style={{
              fontSize: typography.size.xs,
              color: strength.color,
              fontWeight: '600',
              textAlign: 'right',
            }}
          >
            {strength.text}
          </Text>
        </View>
      )}

      {/* Confirm Password Input - Hidden for existing users */}
      {!isExistingUser && (
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: radius.xl,
            padding: spacing.xs,
            marginBottom: spacing.sm,
            ...shadows.lg,
            borderWidth: passwordError && confirmPassword ? 3 : 0,
            borderColor: passwordError ? '#EF4444' : 'transparent',
          }}
        >
          <View
            style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor:
                  password === confirmPassword && confirmPassword.length > 0
                    ? '#D1FAE5'
                    : '#F3F4F6',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.sm,
              }}
            >
              {password === confirmPassword && confirmPassword.length > 0 ? (
                <Heart
                  size={iconSizes.action}
                  color={Colors.semantic.success}
                  fill={Colors.semantic.success}
                  strokeWidth={iconStroke.standard}
                />
              ) : (
                <Shield
                  size={iconSizes.action}
                  color={iconColors.medium}
                  strokeWidth={iconStroke.standard}
                />
              )}
            </View>
            <TextInput
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Şifrenizi tekrar girin"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showConfirmPassword}
              autoComplete="password-new"
              style={{
                flex: 1,
                fontSize: isSmallDevice ? typography.size.base : typography.size.md,
                color: '#1F2937',
                paddingVertical: spacing.md,
                fontWeight: '500',
              }}
            />
            <Pressable
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ padding: spacing.sm }}
            >
              {showConfirmPassword ? (
                <EyeOff
                  size={iconSizes.input}
                  color={Colors.secondary.lavender}
                  strokeWidth={iconStroke.standard}
                />
              ) : (
                <Eye
                  size={iconSizes.input}
                  color={Colors.secondary.lavender}
                  strokeWidth={iconStroke.standard}
                />
              )}
            </Pressable>
          </View>
        </View>
      )}

      {passwordError ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.md,
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            padding: spacing.sm,
            borderRadius: radius.md,
          }}
        >
          <Text style={{ fontSize: 16, marginRight: spacing.xs }}>⚠️</Text>
          <Text style={{ fontSize: typography.size.sm, color: 'white', fontWeight: '600' }}>
            {passwordError}
          </Text>
        </View>
      ) : null}

      {!isExistingUser && !passwordError && (
        <Text
          style={{
            fontSize: typography.size.xs,
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center',
            marginBottom: spacing.lg,
            marginTop: spacing.sm,
          }}
        >
          En az 6 karakter içermelidir
        </Text>
      )}

      {/* Forgot Password Link - Only for existing users */}
      {isExistingUser && (
        <Pressable
          onPress={onForgotPassword}
          style={{ alignSelf: 'center', marginBottom: spacing.lg }}
        >
          <Text
            style={{
              fontSize: typography.size.sm,
              color: 'white',
              textDecorationLine: 'underline',
              fontWeight: '600',
            }}
          >
            Şifremi Unuttum
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={onNext}
        disabled={
          isExistingUser ? !password || isLoading : !password || !confirmPassword || isLoading
        }
        style={({ pressed }) => [
          {
            backgroundColor:
              (isExistingUser ? password : password && confirmPassword) && !isLoading
                ? 'white'
                : 'rgba(255,255,255,0.25)',
            paddingVertical: spacing.md + spacing.xs,
            borderRadius: radius['2xl'],
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
          <Text
            style={{
              fontSize: typography.size.md,
              fontWeight: 'bold',
              color: '#6366F1',
              textAlign: 'center',
            }}
          >
            {isExistingUser ? 'Giriş Yapılıyor...' : 'Kaydediliyor...'}
          </Text>
        ) : (
          <>
            <Text
              style={{
                fontSize: typography.size.md,
                fontWeight: '700',
                color: (isExistingUser ? password : password && confirmPassword)
                  ? '#6366F1'
                  : 'rgba(255,255,255,0.6)',
                textAlign: 'center',
              }}
            >
              {isExistingUser ? 'Giriş Yap' : 'Devam Et'}
            </Text>
            {(isExistingUser ? password : password && confirmPassword) && (
              <Zap
                size={iconSizes.small}
                color={Colors.secondary.lavender}
                strokeWidth={iconStroke.bold}
              />
            )}
          </>
        )}
      </Pressable>
    </View>
  );
}

// Verify Code Step with modern design
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
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    inputRef.current?.focus();

    // Pulse animation for email icon
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      console.log('[Register] 📧 Resend result - isNewUser:', result.isNewUser);

      if (Platform.OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (Platform.OS === 'web') {
        window.alert('Başarılı\nYeni doğrulama kodu gönderildi!');
      } else {
        Alert.alert('Başarılı', 'Yeni doğrulama kodu gönderildi!');
      }
      setResendTimer(60);
    } catch (error) {
      console.error('[Register] ❌ Error resending code:', error);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage =
        error instanceof Error ? error.message : 'Kod gönderilemedi. Lütfen tekrar deneyin.';

      if (Platform.OS === 'web') {
        window.alert(`Hata\n${errorMessage}`);
      } else {
        Alert.alert('Hata', errorMessage);
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      {/* Mail Icon with pulse animation */}
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
          fontSize: isSmallDevice ? typography.size.xl : typography.size['2xl'],
          fontWeight: '800',
          color: 'white',
          marginBottom: spacing.xs,
          textAlign: 'center',
          ...textShadows.hero,
        }}
      >
        Email Doğrulama
      </Text>
      <Text
        style={{
          fontSize: isSmallDevice ? typography.size.sm : typography.size.base,
          color: 'rgba(255,255,255,0.95)',
          marginBottom: spacing.sm,
          textAlign: 'center',
          fontWeight: '500',
          lineHeight: 22,
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
          borderRadius: radius.full,
          alignSelf: 'center',
          marginBottom: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
        }}
      >
        <Mail
          size={iconSizes.badge}
          color={iconColors.inverted}
          strokeWidth={iconStroke.standard}
        />
        <Text style={{ fontSize: typography.size.sm, color: 'white', fontWeight: '600' }}>
          {email}
        </Text>
      </View>

      {/* Code Input with dots */}
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: radius.xl,
          padding: spacing.md,
          marginBottom: spacing.md,
          ...shadows.lg,
          borderWidth: codeError ? 3 : 0,
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
            fontSize: typography.size.hero,
            fontWeight: '700',
            color: '#6366F1',
            padding: spacing.sm,
            textAlign: 'center',
            letterSpacing: 16,
          }}
        />

        {/* Progress dots */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.sm,
            marginTop: spacing.sm,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map(index => (
            <View
              key={index}
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: index < verificationCode.length ? '#6366F1' : '#E5E7EB',
              }}
            />
          ))}
        </View>
      </View>

      {codeError ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.md,
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            padding: spacing.sm,
            borderRadius: radius.md,
          }}
        >
          <Text style={{ fontSize: 16, marginRight: spacing.xs }}>⚠️</Text>
          <Text style={{ fontSize: typography.size.sm, color: 'white', fontWeight: '600' }}>
            {codeError}
          </Text>
        </View>
      ) : null}

      {/* Timer badge */}
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          padding: spacing.md,
          borderRadius: radius.xl,
          marginBottom: spacing.md,
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
          <Sparkles
            size={iconSizes.small}
            color={iconColors.inverted}
            strokeWidth={iconStroke.standard}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: typography.size.sm, color: 'white', fontWeight: '600' }}>
            Kod 10 dakika geçerlidir
          </Text>
          <Text style={{ fontSize: typography.size.xs, color: 'rgba(255,255,255,0.7)' }}>
            Spam klasörünü de kontrol edin
          </Text>
        </View>
      </View>

      {/* Resend Code Button */}
      <Pressable
        onPress={handleResendCode}
        disabled={isResending || resendTimer > 0}
        style={{
          marginBottom: spacing.lg,
          alignItems: 'center',
          paddingVertical: spacing.sm,
        }}
      >
        <Text
          style={{
            fontSize: typography.size.sm,
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

      {/* Verify Button */}
      <Pressable
        onPress={onNext}
        disabled={verificationCode.length !== 6 || isLoading}
        style={({ pressed }) => [
          {
            backgroundColor:
              verificationCode.length === 6 && !isLoading ? 'white' : 'rgba(255,255,255,0.25)',
            paddingVertical: spacing.md + spacing.xs,
            borderRadius: radius['2xl'],
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
          <Text
            style={{
              fontSize: typography.size.md,
              fontWeight: 'bold',
              color: '#6366F1',
              textAlign: 'center',
            }}
          >
            Doğrulanıyor...
          </Text>
        ) : (
          <>
            <Text
              style={{
                fontSize: typography.size.md,
                fontWeight: '700',
                color: verificationCode.length === 6 ? '#6366F1' : 'rgba(255,255,255,0.6)',
                textAlign: 'center',
              }}
            >
              Doğrula
            </Text>
            {verificationCode.length === 6 && (
              <Zap
                size={iconSizes.small}
                color={Colors.secondary.lavender}
                strokeWidth={iconStroke.bold}
              />
            )}
          </>
        )}
      </Pressable>
    </View>
  );
}
