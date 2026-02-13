/**
 * Not Found Screen
 * Handles 404 errors with proper authentication awareness
 */
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useAuth } from '@/lib/hooks/useAuth';
import { Home, ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { spacing, radius, typography } from '@/constants/design-system';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleGoHome = () => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Sayfa Bulunamadı', headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <Text style={styles.emoji}>🔍</Text>
        <Text style={[styles.title, { color: colors.text.primary }]}>Sayfa Bulunamadı</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.primary.sunset },
            pressed && styles.buttonPressed,
          ]}
          onPress={handleGoHome}
        >
          <Home size={20} color="#FFFFFF" />
          <Text style={[styles.buttonText, { color: Colors.neutral.white }]}>
            {isAuthenticated ? 'Ana Sayfaya Dön' : 'Giriş Sayfasına Dön'}
          </Text>
        </Pressable>

        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <ArrowLeft size={16} color={colors.primary.sunset} />
          <Text style={[styles.backLinkText, { color: colors.primary.sunset }]}>Geri Dön</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: Colors.background.primary,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: Colors.neutral.dark,
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: Colors.primary.sunset,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: typography.size.md,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    padding: spacing.sm,
  },
  backLinkText: {
    fontSize: typography.size.sm,
    color: Colors.primary.sunset,
  },
});
