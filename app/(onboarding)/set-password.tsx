import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Eye, EyeOff } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/hooks/useAuth';
import { spacing, borderRadius, shadows, typography, colors, textShadows } from '@/lib/design-tokens';

export default function SetPasswordScreen() {
  const params = useLocalSearchParams();
  const userId = params.userId as string;
  const email = params.email as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { setUserSession, completeOnboarding } = useAuth();
  const setPasswordMutation = trpc.auth.setPassword.useMutation();

  const handleSetPassword = async () => {
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await setPasswordMutation.mutateAsync({
        password,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // User session and tokens should already be set from email verification
      await completeOnboarding();

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('[SetPassword] Error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Hata', error.message || 'Şifre oluşturulurken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={colors.gradients.accessible}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, padding: spacing.lg, justifyContent: 'center' }}
      >
        <Text style={{ fontSize: typography.fontSize.xxl, fontWeight: '700', color: 'white', marginBottom: spacing.sm, textAlign: 'center', ...textShadows.lg }}>
          Şifre Oluşturun
        </Text>
        <Text style={{ fontSize: typography.fontSize.base, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.xl, textAlign: 'center', fontWeight: '500' }}>
          Hesabınızı güvence altına almak için bir şifre belirleyin
        </Text>

        {/* Password Input */}
        <View style={{ backgroundColor: 'white', borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadows.lg, flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Şifreniz (min 6 karakter)"
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
          onPress={handleSetPassword}
          disabled={!password || !confirmPassword || isLoading}
          style={({ pressed }) => [
            {
              backgroundColor: password && confirmPassword && !isLoading ? 'white' : 'rgba(255,255,255,0.3)',
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
            <Text style={{ fontSize: typography.fontSize.md, fontWeight: 'bold', color: password && confirmPassword ? colors.brand.primary : 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
              Şifreyi Kaydet
            </Text>
          )}
        </Pressable>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
