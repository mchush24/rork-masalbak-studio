import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, borderRadius, shadows, typography } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

interface BiometricEnrollmentModalProps {
  visible: boolean;
  biometricType: 'FaceID' | 'TouchID' | 'Fingerprint' | 'None';
  onEnroll: () => void;
  onSkip: () => void;
}

export function BiometricEnrollmentModal({
  visible,
  biometricType,
  onEnroll,
  onSkip,
}: BiometricEnrollmentModalProps) {
  const getBiometricName = () => {
    switch (biometricType) {
      case 'FaceID':
        return 'Face ID';
      case 'TouchID':
        return 'Touch ID';
      case 'Fingerprint':
        return 'Parmak İzi';
      default:
        return 'Biyometrik';
    }
  };

  const getBiometricIcon = () => {
    if (biometricType === 'FaceID') return '👤';
    return '👆';
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={Colors.gradients.accessible as unknown as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Icon */}
            <Text style={styles.icon}>{getBiometricIcon()}</Text>

            {/* Title */}
            <Text style={styles.title}>{getBiometricName()} ile Hızlı Giriş</Text>

            {/* Description */}
            <Text style={styles.description}>
              Bir sonraki girişinizde şifre girmeden {getBiometricName()} ile hızlıca giriş
              yapabilirsiniz.
            </Text>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefit}>✓ Daha hızlı giriş</Text>
              <Text style={styles.benefit}>✓ Güvenli ve pratik</Text>
              <Text style={styles.benefit}>✓ İstediğiniz zaman kapatabilirsiniz</Text>
            </View>

            {/* Buttons */}
            <Pressable
              onPress={onEnroll}
              style={({ pressed }) => [styles.enrollButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.enrollButtonText}>{getBiometricName()}&apos;yi Etkinleştir</Text>
            </Pressable>

            <Pressable onPress={onSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Şimdi Değil</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.xl,
  },
  gradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: '700',
    color: 'white',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.size.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.size.base * 1.5,
  },
  benefitsContainer: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  benefit: {
    fontSize: typography.size.sm,
    color: 'white',
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  enrollButton: {
    backgroundColor: 'white',
    borderRadius: borderRadius.xxxl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: '100%',
    marginBottom: spacing.md,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  enrollButtonText: {
    fontSize: typography.size.base,
    fontWeight: '700',
    color: Colors.primary.sunset,
    textAlign: 'center',
  },
  skipButton: {
    paddingVertical: spacing.sm,
  },
  skipButtonText: {
    fontSize: typography.size.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
