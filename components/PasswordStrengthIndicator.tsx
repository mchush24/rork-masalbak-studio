import { View, Text, StyleSheet } from 'react-native';
import { spacing, borderRadius, typography } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

interface PasswordStrengthIndicatorProps {
  password: string;
  showFeedback?: boolean;
}

export function PasswordStrengthIndicator({
  password,
  _showFeedback = true,
}: PasswordStrengthIndicatorProps) {
  // Calculate strength
  let score = 0;

  // Minimum requirement: 6 characters
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const strength = Math.min(4, score);

  // Colors based on strength
  const colors = ['#EF4444', Colors.semantic.amber, '#EAB308', '#10B981', '#059669'];
  const labels = ['Çok Zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok Güçlü'];

  if (!password) return null;

  return (
    <View style={styles.container}>
      {/* Strength bars */}
      <View style={styles.barsContainer}>
        {[0, 1, 2, 3, 4].map(index => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                backgroundColor: index <= strength ? colors[strength] : Colors.neutral.gray200,
              },
            ]}
          />
        ))}
      </View>

      {/* Label */}
      <Text style={[styles.label, { color: colors[strength] }]}>{labels[strength]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  barsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: borderRadius.sm,
  },
  label: {
    fontSize: typography.size.xs,
    fontWeight: '600',
  },
});
