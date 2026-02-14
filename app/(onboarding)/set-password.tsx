import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Eye, EyeOff } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/lib/hooks/useAuth';
import { getErrorMessage } from '@/lib/utils/error';
import { spacing, borderRadius, shadows, typography, textShadows } from '@/constants/design-system';
import { useTheme } from '@/lib/theme/ThemeProvider';

export default function SetPasswordScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const _userId = params.userId as string;
  const _email = params.email as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const setPasswordMutation = trpc.auth.setPassword.useMutation();

  const safeAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSetPassword = async () => {
    if (password.length < 6) {
      safeAlert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (password !== confirmPassword) {
      safeAlert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    setIsLoading(true);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await setPasswordMutation.mutateAsync({
        password,
      });

      if (Platform.OS !== 'web')
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // User session and tokens should already be set from email verification
      await completeOnboarding();

      router.replace('/(tabs)');
    } catch (error) {
      console.error('[SetPassword] Error:', error);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      safeAlert('Hata', getErrorMessage(error) || 'Şifre oluşturulurken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[...colors.gradients.accessible] as unknown as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, padding: spacing.lg, justifyContent: 'center' }}
      >
        <Text
          style={{
            fontSize: typography.size['2xl'],
            fontFamily: typography.family.bold,
            color: 'white',
            marginBottom: spacing.sm,
            textAlign: 'center',
            ...textShadows.lg,
          }}
        >
          Şifre Oluşturun
        </Text>
        <Text
          style={{
            fontSize: typography.size.base,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: spacing.xl,
            textAlign: 'center',
            fontFamily: typography.family.medium,
          }}
        >
          Hesabınızı güvence altına almak için bir şifre belirleyin
        </Text>

        {/* Password Input */}
        <View
          style={{
            backgroundColor: colors.surface.card,
            borderRadius: borderRadius.xl,
            padding: spacing.md,
            marginBottom: spacing.md,
            ...shadows.lg,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Şifreniz (min 6 karakter)"
            placeholderTextColor={colors.text.tertiary}
            secureTextEntry={!showPassword}
            maxLength={128}
            style={{
              flex: 1,
              fontSize: typography.size.base,
              color: colors.text.primary,
              padding: spacing.sm,
              fontFamily: typography.family.medium,
            }}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: spacing.sm }}>
            {showPassword ? (
              <EyeOff size={20} color={colors.text.tertiary} />
            ) : (
              <Eye size={20} color={colors.text.tertiary} />
            )}
          </Pressable>
        </View>

        {/* Confirm Password */}
        <View
          style={{
            backgroundColor: colors.surface.card,
            borderRadius: borderRadius.xl,
            padding: spacing.md,
            marginBottom: spacing.xl,
            ...shadows.lg,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Şifrenizi tekrar girin"
            placeholderTextColor={colors.text.tertiary}
            secureTextEntry={!showConfirmPassword}
            maxLength={128}
            style={{
              flex: 1,
              fontSize: typography.size.base,
              color: colors.text.primary,
              padding: spacing.sm,
              fontFamily: typography.family.medium,
            }}
          />
          <Pressable
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{ padding: spacing.sm }}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color={colors.text.tertiary} />
            ) : (
              <Eye size={20} color={colors.text.tertiary} />
            )}
          </Pressable>
        </View>

        <Pressable
          onPress={handleSetPassword}
          disabled={!password || !confirmPassword || isLoading}
          style={({ pressed }) => [
            {
              backgroundColor:
                password && confirmPassword && !isLoading
                  ? colors.surface.card
                  : 'rgba(255,255,255,0.3)',
              paddingVertical: spacing.lg,
              borderRadius: borderRadius.xxxl,
              ...shadows.lg,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.primary.sunset} />
          ) : (
            <Text
              style={{
                fontSize: typography.size.md,
                fontFamily: typography.family.bold,
                color:
                  password && confirmPassword ? colors.primary.sunset : 'rgba(255,255,255,0.6)',
                textAlign: 'center',
              }}
            >
              Şifreyi Kaydet
            </Text>
          )}
        </Pressable>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
