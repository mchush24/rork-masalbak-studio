import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, Animated, Image, ScrollView, Linking } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/hooks/useAuth';
import { spacing, borderRadius, animations, shadows, typography, colors } from '@/lib/design-tokens';
import { supabase } from '@/lib/supabase';

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
      toValue: currentStep / Object.keys(STEPS).length,
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

        // Get user from database
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.trim())
          .single();

        if (user) {
          // Mark onboarding complete
          await completeOnboardingMutation.mutateAsync({
            userId: user.id,
          });

          await completeOnboarding();

          console.log('[Register] 🚀 Redirecting to app...');

          // Small delay for smooth transition
          await new Promise(resolve => setTimeout(resolve, 300));

          // Go directly to app!
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

  const handleRegister = async () => {
    if (!agreedToTerms) {
      triggerShake();
      Alert.alert('Uyarı', 'Lütfen Gizlilik Politikası ve Kullanım Şartları\'nı kabul edin');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);

    try {
      console.log('[Register] 📝 Completing registration...', { email, name, childAge });

      // User already created during email verification step
      // Get user info from register mutation result
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.trim())
        .single();

      if (!existingUser) {
        throw new Error('Kullanıcı bulunamadı. Lütfen tekrar kayıt olun.');
      }

      console.log('[Register] ✅ User found:', existingUser.id);

      // Mark onboarding as complete in backend
      await completeOnboardingMutation.mutateAsync({
        userId: existingUser.id,
      });

      console.log('[Register] ✅ Onboarding marked complete in backend');

      // Mark onboarding as complete in local storage
      await completeOnboarding();

      console.log('[Register] ✅ Onboarding marked complete locally');

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Small delay to ensure auth state is fully propagated
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('[Register] 🚀 Navigating to main app...');

      router.replace('/(tabs)');
    } catch (error) {
      console.error('[Register] ❌ Registration error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Kayıt Hatası',
        error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen tekrar deneyin.'
      );
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
          {/* Progress Bar */}
          <View style={{ paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
              {currentStep > STEPS.WELCOME && (
                <Pressable onPress={handleBack} style={{ marginRight: spacing.md }}>
                  <Text style={{ fontSize: 24, color: 'white' }}>←</Text>
                </Pressable>
              )}
              <View style={{ flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' }}>
                <Animated.View
                  style={{
                    height: '100%',
                    width: progressWidth,
                    backgroundColor: 'white',
                    borderRadius: 2,
                  }}
                />
              </View>
              <Text style={{ marginLeft: spacing.md, color: 'white', fontSize: typography.fontSize.sm, fontWeight: '600' }}>
                {currentStep + 1}/5
              </Text>
            </View>
          </View>

          {/* Content */}
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
            {currentStep === STEPS.WELCOME && <WelcomeStep onNext={handleNext} />}
            {currentStep === STEPS.EMAIL && (
              <EmailStep
                email={email}
                setEmail={setEmail}
                emailError={emailError}
                setEmailError={setEmailError}
                onNext={handleNext}
                isLoading={isLoading}
              />
            )}
            {currentStep === STEPS.VERIFY_CODE && (
              <VerifyCodeStep
                verificationCode={verificationCode}
                setVerificationCode={setVerificationCode}
                codeError={codeError}
                onNext={handleNext}
                isLoading={isLoading}
                email={email}
              />
            )}
            {currentStep === STEPS.CHILD_AGE && (
              <ChildAgeStep
                childAge={childAge}
                setChildAge={setChildAge}
                onNext={handleNext}
              />
            )}
            {currentStep === STEPS.NAME && (
              <NameStep
                name={name}
                setName={setName}
                onNext={handleNext}
              />
            )}
            {currentStep === STEPS.CONFIRM && (
              <ConfirmStep
                email={email}
                name={name}
                childAge={childAge}
                agreedToTerms={agreedToTerms}
                setAgreedToTerms={setAgreedToTerms}
                onRegister={handleNext}
                isLoading={isLoading}
              />
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// Step 1: Welcome with value propositions
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingBottom: spacing.xl }}>
      {/* Logo */}
      <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'white',
            ...shadows.xl,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            source={require('@/assets/images/app-logo.png')}
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Title */}
      <Text
        style={{
          fontSize: typography.fontSize.xxxl + 4,
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          marginBottom: spacing.md,
        }}
      >
        Zuna'ya Hoş Geldin! 🎉
      </Text>

      <Text
        style={{
          fontSize: typography.fontSize.md,
          color: 'rgba(255,255,255,0.95)',
          textAlign: 'center',
          marginBottom: spacing.xxl,
          lineHeight: typography.fontSize.md * 1.5,
        }}
      >
        Her çizim bir hikaye, her hikaye bir macera!
      </Text>

      {/* Value Props */}
      <View style={{ marginBottom: spacing.xl }}>
        {(() => {
          const valueProps = [
            { icon: '🎨', title: 'Çizim Analizi', desc: 'AI destekli duygusal gelişim takibi' },
            { icon: '📚', title: 'Kişisel Hikayeler', desc: 'Çocuğunuza özel masal oluşturma' },
            { icon: '🌟', title: 'Gelişim Takibi', desc: 'Detaylı raporlar ve öneriler' },
          ];
          return valueProps.map((item, idx) => (
          <View
            key={idx}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.15)',
              padding: spacing.md,
              borderRadius: borderRadius.lg,
              marginBottom: spacing.sm,
              ...shadows.md,
            }}
          >
            <Text style={{ fontSize: 32, marginRight: spacing.md }}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: typography.fontSize.base, fontWeight: 'bold', color: 'white' }}>
                {item.title}
              </Text>
              <Text style={{ fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.8)' }}>
                {item.desc}
              </Text>
            </View>
          </View>
        ));
        })()}
      </View>

      {/* Social Proof */}
      <View style={{ marginBottom: spacing.xl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.sm }}>
          <Text style={{ fontSize: typography.fontSize.xl, color: 'white' }}>⭐⭐⭐⭐⭐</Text>
        </View>
        <Text style={{ fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
          1000+ mutlu aile tarafından güveniliyor
        </Text>
      </View>

      {/* CTA */}
      <Pressable
        onPress={onNext}
        style={({ pressed }) => [
          {
            backgroundColor: 'white',
            paddingVertical: spacing.md + spacing.xs,
            borderRadius: borderRadius.xxxl,
            ...shadows.xl,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}
      >
        <Text
          style={{
            fontSize: typography.fontSize.md,
            fontWeight: 'bold',
            color: colors.brand.primary,
            textAlign: 'center',
          }}
        >
          Hadi Başlayalım! 🚀
        </Text>
      </Pressable>

      <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: spacing.md }}>
        Ücretsiz deneme • Kredi kartı gerekmez
      </Text>
    </View>
  );
}

// Step 2: Email
function EmailStep({
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
    <View style={{ flex: 1, justifyContent: 'center', paddingBottom: spacing.xl }}>
      <Text style={{ fontSize: typography.fontSize.xxxl, fontWeight: 'bold', color: 'white', marginBottom: spacing.md }}>
        E-posta Adresiniz
      </Text>
      <Text style={{ fontSize: typography.fontSize.base, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.xxl }}>
        Hikayelerinizi ve ilerlemenizi kaydetmek için e-posta adresinize ihtiyacımız var
      </Text>

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
          placeholder="ornek@email.com"
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

      {/* Trust indicators */}
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          padding: spacing.md,
          borderRadius: borderRadius.lg,
          marginBottom: spacing.xl,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
          <Text style={{ fontSize: 20, marginRight: spacing.sm }}>🔒</Text>
          <Text style={{ fontSize: typography.fontSize.sm, color: 'white', fontWeight: '600' }}>
            Bilgileriniz Güvende
          </Text>
        </View>
        <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.8)' }}>
          E-posta adresiniz şifrelenir ve asla üçüncü şahıslarla paylaşılmaz
        </Text>
      </View>

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

// Step 2.5: Verification Code
function VerifyCodeStep({
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

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
        Doğrulama Kodu
      </Text>
      <Text style={{ fontSize: typography.fontSize.base, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.sm }}>
        {email} adresine gönderilen 6 haneli kodu girin
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
          placeholder="123456"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          maxLength={6}
          autoComplete="one-time-code"
          style={{
            fontSize: typography.fontSize.xxxl,
            fontWeight: 'bold',
            color: '#1F2937',
            padding: spacing.sm,
            textAlign: 'center',
            letterSpacing: 8,
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
          marginBottom: spacing.xl,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
          <Text style={{ fontSize: 20, marginRight: spacing.sm }}>📧</Text>
          <Text style={{ fontSize: typography.fontSize.sm, color: 'white', fontWeight: '600' }}>
            Emailinizi Kontrol Edin
          </Text>
        </View>
        <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.8)' }}>
          Spam klasörünüze de bakabilirsiniz
        </Text>
      </View>

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

// Step 3: Child Age
function ChildAgeStep({
  childAge,
  setChildAge,
  onNext,
}: {
  childAge: number | undefined;
  setChildAge: (age: number | undefined) => void;
  onNext: () => void;
}) {
  const [ageText, setAgeText] = useState<string>(childAge?.toString() || '');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleAgeChange = (text: string) => {
    // Sadece rakam girişine izin ver
    const numericText = text.replace(/[^0-9]/g, '');
    setAgeText(numericText);

    const age = parseInt(numericText);
    if (!isNaN(age) && age >= 1 && age <= 18) {
      setChildAge(age);
    } else if (numericText === '') {
      setChildAge(undefined);
    }
  };

  const isValidAge = childAge && childAge >= 1 && childAge <= 18;

  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingBottom: spacing.xl }}>
      <Text style={{ fontSize: typography.fontSize.xxxl, fontWeight: 'bold', color: 'white', marginBottom: spacing.md }}>
        Çocuğunuzun Yaşı
      </Text>
      <Text style={{ fontSize: typography.fontSize.base, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.xxl }}>
        Analiz sonuçlarını yaşa göre kişiselleştireceğiz 🎯
      </Text>

      {/* Age Input */}
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: borderRadius.xl,
          padding: spacing.md,
          marginBottom: spacing.md,
          ...shadows.lg,
          borderWidth: isValidAge ? 2 : 0,
          borderColor: isValidAge ? colors.brand.primary : 'transparent',
        }}
      >
        <TextInput
          ref={inputRef}
          value={ageText}
          onChangeText={handleAgeChange}
          placeholder="Örn: 5"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          maxLength={2}
          style={{
            fontSize: typography.fontSize.xxxl,
            fontWeight: 'bold',
            color: colors.brand.primary,
            padding: spacing.sm,
            textAlign: 'center',
          }}
        />
      </View>

      {ageText && (!isValidAge || childAge! < 1 || childAge! > 18) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, justifyContent: 'center' }}>
          <Text style={{ fontSize: 18, marginRight: spacing.xs }}>⚠️</Text>
          <Text style={{ fontSize: typography.fontSize.sm, color: '#FEE2E2', fontWeight: '600' }}>
            Lütfen 1-18 arası bir yaş girin
          </Text>
        </View>
      )}

      {/* Info */}
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          padding: spacing.md,
          borderRadius: borderRadius.lg,
          marginBottom: spacing.xl,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
          <Text style={{ fontSize: 20, marginRight: spacing.sm }}>💡</Text>
          <Text style={{ fontSize: typography.fontSize.sm, color: 'white', fontWeight: '600' }}>
            Neden önemli?
          </Text>
        </View>
        <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.8)' }}>
          Çocuğunuzun yaşına özel gelişimsel özellikler ve psikolojik ihtiyaçlar doğrultusunda daha doğru analiz sonuçları alırsınız
        </Text>
      </View>

      <Pressable
        onPress={onNext}
        disabled={!isValidAge}
        style={({ pressed }) => [
          {
            backgroundColor: isValidAge ? 'white' : 'rgba(255,255,255,0.3)',
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
            color: isValidAge ? colors.brand.primary : 'rgba(255,255,255,0.6)',
            textAlign: 'center',
          }}
        >
          Devam Et →
        </Text>
      </Pressable>

      {!isValidAge && (
        <Pressable onPress={onNext} style={{ paddingVertical: spacing.md }}>
          <Text style={{ fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', textDecorationLine: 'underline' }}>
            Bu adımı atla
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// Step 4: Name
function NameStep({
  name,
  setName,
  onNext,
}: {
  name: string;
  setName: (name: string) => void;
  onNext: () => void;
}) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingBottom: spacing.xl }}>
      <Text style={{ fontSize: typography.fontSize.xxxl, fontWeight: 'bold', color: 'white', marginBottom: spacing.md }}>
        Sizi Nasıl Çağıralım?
      </Text>
      <Text style={{ fontSize: typography.fontSize.base, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.xxl }}>
        İsminiz sayesinde deneyiminizi kişiselleştirebiliriz 🌟
      </Text>

      <View
        style={{
          backgroundColor: 'white',
          borderRadius: borderRadius.xl,
          padding: spacing.md,
          marginBottom: spacing.md,
          ...shadows.lg,
        }}
      >
        <TextInput
          ref={inputRef}
          value={name}
          onChangeText={setName}
          placeholder="Adınız veya Takma Adınız"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
          autoComplete="name"
          style={{
            fontSize: typography.fontSize.md,
            color: '#1F2937',
            padding: spacing.sm,
          }}
        />
      </View>

      <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.7)', marginBottom: spacing.xl, fontStyle: 'italic' }}>
        İsterseniz bu adımı atlayabilirsiniz
      </Text>

      {/* Testimonial */}
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          padding: spacing.md,
          borderRadius: borderRadius.lg,
          marginBottom: spacing.xl,
        }}
      >
        <View style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
          <Text style={{ fontSize: 16 }}>⭐⭐⭐⭐⭐</Text>
        </View>
        <Text style={{ fontSize: typography.fontSize.sm, color: 'white', marginBottom: spacing.xs, fontStyle: 'italic' }}>
          "Zuna ile çocuğumun iç dünyasını anlamak çok daha kolay oldu!"
        </Text>
        <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.8)' }}>
          - Ayşe A., Anne
        </Text>
      </View>

      <Pressable
        onPress={onNext}
        style={({ pressed }) => [
          {
            backgroundColor: 'white',
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
            color: colors.brand.primary,
            textAlign: 'center',
          }}
        >
          Devam Et →
        </Text>
      </Pressable>

      {!name && (
        <Pressable onPress={onNext} style={{ paddingVertical: spacing.md }}>
          <Text style={{ fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'center', textDecorationLine: 'underline' }}>
            Bu adımı atla
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// Step 5: Confirm
function ConfirmStep({
  email,
  name,
  childAge,
  agreedToTerms,
  setAgreedToTerms,
  onRegister,
  isLoading,
}: {
  email: string;
  name: string;
  childAge: number | undefined;
  agreedToTerms: boolean;
  setAgreedToTerms: (agreed: boolean) => void;
  onRegister: () => void;
  isLoading: boolean;
}) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingBottom: spacing.xl }}>
      <Text style={{ fontSize: typography.fontSize.xxxl, fontWeight: 'bold', color: 'white', marginBottom: spacing.md }}>
        Son Bir Adım! 🎊
      </Text>
      <Text style={{ fontSize: typography.fontSize.base, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.xxl }}>
        Bilgilerinizi kontrol edin ve maceraya başlayın!
      </Text>

      {/* Summary */}
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          padding: spacing.lg,
          borderRadius: borderRadius.xl,
          marginBottom: spacing.lg,
          ...shadows.md,
        }}
      >
        <View style={{ marginBottom: spacing.md }}>
          <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.7)', marginBottom: spacing.xs }}>
            E-POSTA
          </Text>
          <Text style={{ fontSize: typography.fontSize.base, color: 'white', fontWeight: '600' }}>
            {email}
          </Text>
        </View>
        {childAge && (
          <View style={{ marginBottom: spacing.md }}>
            <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.7)', marginBottom: spacing.xs }}>
              ÇOCUĞUN YAŞI
            </Text>
            <Text style={{ fontSize: typography.fontSize.base, color: 'white', fontWeight: '600' }}>
              {childAge} yaşında
            </Text>
          </View>
        )}
        {name && (
          <View>
            <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.7)', marginBottom: spacing.xs }}>
              İSİM
            </Text>
            <Text style={{ fontSize: typography.fontSize.base, color: 'white', fontWeight: '600' }}>
              {name}
            </Text>
          </View>
        )}
      </View>

      {/* Terms Agreement */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          backgroundColor: 'rgba(255,255,255,0.15)',
          padding: spacing.md,
          borderRadius: borderRadius.lg,
          marginBottom: spacing.xl,
          borderWidth: agreedToTerms ? 0 : 2,
          borderColor: agreedToTerms ? 'transparent' : 'rgba(255,255,255,0.3)',
        }}
      >
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setAgreedToTerms(!agreedToTerms);
          }}
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            backgroundColor: agreedToTerms ? 'white' : 'transparent',
            borderWidth: 2,
            borderColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.sm,
            marginTop: 2,
          }}
        >
          {agreedToTerms && <Text style={{ fontSize: 14, color: colors.brand.primary }}>✓</Text>}
        </Pressable>
        <Text style={{ flex: 1, fontSize: typography.fontSize.sm, color: 'white', lineHeight: typography.fontSize.sm * 1.5 }}>
          <Pressable
            onPress={() => {
              Linking.openURL('https://zuna.app/privacy');
            }}
          >
            <Text style={{ fontWeight: '600', textDecorationLine: 'underline' }}>Gizlilik Politikası</Text>
          </Pressable>
          <Text> ve </Text>
          <Pressable
            onPress={() => {
              Linking.openURL('https://zuna.app/terms');
            }}
          >
            <Text style={{ fontWeight: '600', textDecorationLine: 'underline' }}>Kullanım Şartları</Text>
          </Pressable>
          <Text>'nı okudum ve kabul ediyorum</Text>
        </Text>
      </View>

      {/* What you get */}
      <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.xl }}>
        <Text style={{ fontSize: typography.fontSize.sm, color: 'white', fontWeight: '600', marginBottom: spacing.sm }}>
          ✨ Hemen başladığınızda:
        </Text>
        {(() => {
          const benefits = [
            'Sınırsız çizim analizi',
            'Kişisel hikaye oluşturma',
            'Gelişim takibi ve raporlar',
            '7 gün ücretsiz deneme',
          ];
          return benefits.map((item, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
            <Text style={{ fontSize: 14, marginRight: spacing.xs }}>✓</Text>
            <Text style={{ fontSize: typography.fontSize.sm, color: 'rgba(255,255,255,0.9)' }}>{item}</Text>
          </View>
        ));
        })()}
      </View>

      <Pressable
        onPress={onRegister}
        disabled={isLoading || !agreedToTerms}
        style={({ pressed }) => [
          {
            backgroundColor: agreedToTerms ? 'white' : 'rgba(255,255,255,0.3)',
            paddingVertical: spacing.md + spacing.xs,
            borderRadius: borderRadius.xxxl,
            ...shadows.xl,
            transform: [{ scale: pressed ? 0.97 : 1 }],
            opacity: isLoading ? 0.6 : 1,
          },
        ]}
      >
        <Text
          style={{
            fontSize: typography.fontSize.md,
            fontWeight: 'bold',
            color: agreedToTerms ? colors.brand.primary : 'rgba(255,255,255,0.6)',
            textAlign: 'center',
          }}
        >
          {isLoading ? '⏳ Hesabınız Oluşturuluyor...' : 'Maceraya Başla! 🚀'}
        </Text>
      </Pressable>

      <Text style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: spacing.md }}>
        🔒 256-bit SSL şifrelemesi ile güvende
      </Text>
    </View>
  );
}
