/**
 * ThemeSelector - Visual theme selection component
 *
 * Features:
 * - Visual preview of each theme
 * - Smooth transition animation
 * - System/Light/Dark options
 * - Real-time preview
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Sun, Moon, Smartphone, Check, X } from 'lucide-react-native';
import { Colors, DarkColors } from '@/constants/colors';
import { useTheme, ThemeMode } from '@/lib/contexts/ThemeContext';
import { typography, spacing, radius, shadows, iconSizes, iconStroke } from '@/constants/design-system';

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

interface ThemeOptionProps {
  mode: ThemeMode;
  label: string;
  description: string;
  icon: React.ReactNode;
  previewColors: string[];
  isSelected: boolean;
  onSelect: () => void;
}

function ThemeOption({ mode, label, description, icon, previewColors, isSelected, onSelect }: ThemeOptionProps) {
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(isSelected ? 1 : 0);

  React.useEffect(() => {
    borderOpacity.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  return (
    <Pressable
      onPress={onSelect}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
    >
      <Animated.View style={[styles.optionContainer, animatedStyle]}>
        {/* Selection Border */}
        <Animated.View style={[styles.selectionBorder, borderStyle]} />

        {/* Preview Area */}
        <LinearGradient
          colors={previewColors as [string, string, ...string[]]}
          style={styles.previewArea}
        >
          {/* Mini UI Preview */}
          <View style={[styles.previewCard, mode === 'dark' && styles.previewCardDark]}>
            <View style={[styles.previewHeader, mode === 'dark' && styles.previewHeaderDark]} />
            <View style={styles.previewContent}>
              <View style={[styles.previewLine, mode === 'dark' && styles.previewLineDark, { width: '80%' }]} />
              <View style={[styles.previewLine, mode === 'dark' && styles.previewLineDark, { width: '60%' }]} />
            </View>
          </View>
        </LinearGradient>

        {/* Info Area */}
        <View style={styles.infoArea}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          {isSelected && (
            <View style={styles.checkmark}>
              <Check size={iconSizes.small} color={Colors.semantic.success} strokeWidth={iconStroke.bold} />
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function ThemeSelector({ visible, onClose }: ThemeSelectorProps) {
  const { mode, setMode, isDark } = useTheme();

  const handleSelect = async (newMode: ThemeMode) => {
    await setMode(newMode);
  };

  const options: { mode: ThemeMode; label: string; description: string; icon: React.ReactNode; previewColors: string[] }[] = [
    {
      mode: 'light',
      label: 'Açık Tema',
      description: 'Parlak ve aydınlık görünüm',
      icon: <Sun size={iconSizes.action} color={Colors.secondary.sunshine} strokeWidth={iconStroke.standard} />,
      previewColors: ['#FFF8F0', '#F5E8FF', '#FFE8F5'],
    },
    {
      mode: 'dark',
      label: 'Koyu Tema',
      description: 'Gece için rahat görünüm',
      icon: <Moon size={iconSizes.action} color={Colors.secondary.lavender} strokeWidth={iconStroke.standard} />,
      previewColors: ['#12141D', '#1A1D28', '#201825'],
    },
    {
      mode: 'system',
      label: 'Sistem Teması',
      description: 'Cihaz ayarlarına göre otomatik',
      icon: <Smartphone size={iconSizes.action} color={Colors.secondary.sky} strokeWidth={iconStroke.standard} />,
      previewColors: ['#E8F0FF', '#1A1D28', '#FFE8F5'],
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.container}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                {isDark ? (
                  <Moon size={iconSizes.action} color={Colors.secondary.lavender} strokeWidth={iconStroke.standard} />
                ) : (
                  <Sun size={iconSizes.action} color={Colors.secondary.sunshine} strokeWidth={iconStroke.standard} />
                )}
                <View>
                  <Text style={styles.headerTitle}>Tema Seçimi</Text>
                  <Text style={styles.headerSubtitle}>Görünümü kişiselleştirin</Text>
                </View>
              </View>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <X size={iconSizes.action} color={Colors.neutral.medium} strokeWidth={iconStroke.standard} />
              </Pressable>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {options.map((option) => (
                <ThemeOption
                  key={option.mode}
                  {...option}
                  isSelected={mode === option.mode}
                  onSelect={() => handleSelect(option.mode)}
                />
              ))}
            </View>

            {/* Info Note */}
            <View style={styles.infoNote}>
              <Text style={styles.infoNoteText}>
                Tema değişikliği anında uygulanır. Sistem teması seçildiğinde cihaz ayarlarınız takip edilir.
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
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
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius['2xl'],
    width: '100%',
    maxWidth: 400,
    ...shadows.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  headerSubtitle: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
  },
  closeButton: {
    padding: spacing.xs,
  },
  optionsContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  optionContainer: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.neutral.lightest,
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  selectionBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: Colors.semantic.success,
    zIndex: 10,
  },
  previewArea: {
    height: 80,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCard: {
    width: '70%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: radius.md,
    padding: spacing.sm,
    ...shadows.sm,
  },
  previewCardDark: {
    backgroundColor: 'rgba(30, 33, 48, 0.9)',
  },
  previewHeader: {
    height: 8,
    width: '40%',
    backgroundColor: Colors.primary.sunset,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  previewHeaderDark: {
    backgroundColor: DarkColors.primary.sunset,
  },
  previewContent: {
    gap: 4,
  },
  previewLine: {
    height: 6,
    backgroundColor: Colors.neutral.lighter,
    borderRadius: 3,
  },
  previewLineDark: {
    backgroundColor: DarkColors.neutral.lighter,
  },
  infoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: Colors.neutral.white,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.lightest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  description: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: Colors.semantic.successBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoNote: {
    padding: spacing.md,
    paddingTop: 0,
  },
  infoNoteText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ThemeSelector;
