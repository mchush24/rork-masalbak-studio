/**
 * Dialog/Modal System
 * Part of #3: Oturum Kurtarma Modal Düzeltmeleri
 *
 * Provides flexible, role-aware dialog components:
 * - BaseDialog: Core modal wrapper
 * - ConfirmDialog: For destructive actions
 * - AlertDialog: For simple messages
 * - InputDialog: For text input
 *
 * All dialogs adapt to user role (parent/teacher/expert)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react-native';
import { Colors, ProfessionalColors } from '@/constants/colors';
import {
  typography,
  spacing,
  radius,
  shadows,
  iconSizes,
  iconStroke,
  iconColors,
  buttonSizes,
  buttonStyles,
} from '@/constants/design-system';
import { useHapticFeedback } from '@/lib/haptics';
import { IooRoleAware } from '@/components/Ioo';
import { useRole, useMascotSettings, useIsProfessional } from '@/lib/contexts/RoleContext';

// ============================================
// BASE DIALOG
// ============================================

export interface BaseDialogProps {
  /** Whether dialog is visible */
  visible: boolean;
  /** Called when dialog should close */
  onClose: () => void;
  /** Dialog title */
  title?: string;
  /** Dialog content */
  children?: React.ReactNode;
  /** Show close button */
  showCloseButton?: boolean;
  /** Close on backdrop press */
  closeOnBackdrop?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Animation type */
  animation?: 'zoom' | 'fade' | 'slide';
  /** Professional mode override */
  forceProStyle?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BaseDialog({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  style,
  animation = 'zoom',
  forceProStyle = false,
}: BaseDialogProps) {
  const { tapLight } = useHapticFeedback();
  const isProfessional = useIsProfessional();
  const useProfessionalStyle = forceProStyle || isProfessional;

  const handleBackdropPress = useCallback(() => {
    if (closeOnBackdrop) {
      tapLight();
      onClose();
    }
  }, [closeOnBackdrop, tapLight, onClose]);

  const handleClosePress = useCallback(() => {
    tapLight();
    onClose();
  }, [tapLight, onClose]);

  const getEnteringAnimation = () => {
    switch (animation) {
      case 'fade':
        return FadeIn.duration(200);
      case 'slide':
        return FadeIn.duration(200);
      default:
        return ZoomIn.springify().damping(15);
    }
  };

  const getExitingAnimation = () => {
    switch (animation) {
      case 'fade':
        return FadeOut.duration(150);
      case 'slide':
        return FadeOut.duration(150);
      default:
        return ZoomOut.duration(150);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        {/* Backdrop */}
        <AnimatedPressable
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.backdrop}
          onPress={handleBackdropPress}
        >
          <BlurView
            intensity={useProfessionalStyle ? 10 : 20}
            tint={useProfessionalStyle ? 'light' : 'dark'}
            style={StyleSheet.absoluteFill}
          />
        </AnimatedPressable>

        {/* Dialog */}
        <Animated.View
          entering={getEnteringAnimation()}
          exiting={getExitingAnimation()}
          style={[styles.dialog, useProfessionalStyle && styles.dialogProfessional, style]}
        >
          {/* Close Button */}
          {showCloseButton && (
            <Pressable
              onPress={handleClosePress}
              style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.6 }]}
              hitSlop={8}
            >
              <X
                size={iconSizes.action}
                color={useProfessionalStyle ? ProfessionalColors.text.tertiary : iconColors.medium}
                strokeWidth={iconStroke.standard}
              />
            </Pressable>
          )}

          {/* Title */}
          {title && (
            <Text style={[styles.title, useProfessionalStyle && styles.titleProfessional]}>
              {title}
            </Text>
          )}

          {/* Content */}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================
// CONFIRM DIALOG
// ============================================

export interface ConfirmDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  showIoo?: boolean;
}

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  variant = 'danger',
  showIoo = true,
}: ConfirmDialogProps) {
  const { tapLight, warning, error } = useHapticFeedback();
  const { role } = useRole();
  const mascotSettings = useMascotSettings();
  const isProfessional = useIsProfessional();

  const handleConfirm = useCallback(() => {
    if (variant === 'danger') {
      error();
    } else {
      warning();
    }
    onConfirm();
    onClose();
  }, [variant, error, warning, onConfirm, onClose]);

  const handleCancel = useCallback(() => {
    tapLight();
    onClose();
  }, [tapLight, onClose]);

  // Check if mascot should be shown
  const shouldShowMascot = showIoo && mascotSettings.prominence !== 'hidden' && !isProfessional;

  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconColor: isProfessional ? '#DC2626' : Colors.semantic.error,
      iconBg: isProfessional ? '#FEF2F2' : `${Colors.semantic.error}15`,
      confirmBg: isProfessional ? '#DC2626' : Colors.semantic.error,
      iooMood: 'concerned' as const,
    },
    warning: {
      icon: AlertTriangle,
      iconColor: isProfessional ? '#D97706' : Colors.semantic.warning,
      iconBg: isProfessional ? '#FFFBEB' : `${Colors.semantic.warning}15`,
      confirmBg: isProfessional ? '#D97706' : Colors.semantic.warning,
      iooMood: 'curious' as const,
    },
    info: {
      icon: Info,
      iconColor: isProfessional ? ProfessionalColors.trust.primary : Colors.secondary.sky,
      iconBg: isProfessional ? ProfessionalColors.trust.background : `${Colors.secondary.sky}15`,
      confirmBg: isProfessional ? ProfessionalColors.trust.primary : Colors.secondary.sky,
      iooMood: 'happy' as const,
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  // Role-specific button text
  const roleText = useMemo(() => {
    if (role === 'expert') {
      return {
        confirm: variant === 'danger' ? 'Sil' : 'Onayla',
        cancel: 'Vazgeç',
      };
    }
    if (role === 'teacher') {
      return {
        confirm: confirmText,
        cancel: 'İptal Et',
      };
    }
    return {
      confirm: confirmText,
      cancel: cancelText,
    };
  }, [role, variant, confirmText, cancelText]);

  return (
    <BaseDialog visible={visible} onClose={onClose} showCloseButton={false}>
      <View style={styles.confirmContent}>
        {/* Mascot or Icon */}
        {shouldShowMascot ? (
          <View style={styles.mascotContainer}>
            <IooRoleAware
              mood={config.iooMood === 'concerned' ? 'sleepy' : config.iooMood}
              size="small"
              context="general"
              animated
            />
          </View>
        ) : (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: config.iconBg },
              isProfessional && styles.iconContainerProfessional,
            ]}
          >
            <IconComponent size={isProfessional ? 28 : 32} color={config.iconColor} />
          </View>
        )}

        {/* Text */}
        <Text style={[styles.confirmTitle, isProfessional && styles.confirmTitleProfessional]}>
          {title}
        </Text>
        <Text style={[styles.confirmMessage, isProfessional && styles.confirmMessageProfessional]}>
          {message}
        </Text>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleCancel}
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              isProfessional && styles.cancelButtonProfessional,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              style={[
                styles.cancelButtonText,
                isProfessional && styles.cancelButtonTextProfessional,
              ]}
            >
              {roleText.cancel}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleConfirm}
            style={({ pressed }) => [
              styles.button,
              styles.confirmButton,
              { backgroundColor: config.confirmBg },
              isProfessional && styles.confirmButtonProfessional,
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={styles.confirmButtonText}>{roleText.confirm}</Text>
          </Pressable>
        </View>
      </View>
    </BaseDialog>
  );
}

// ============================================
// ALERT DIALOG
// ============================================

export interface AlertDialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  showIoo?: boolean;
}

export function AlertDialog({
  visible,
  onClose,
  title,
  message,
  buttonText = 'Tamam',
  variant = 'info',
  showIoo = true,
}: AlertDialogProps) {
  const { tapLight, success, error, warning } = useHapticFeedback();
  const mascotSettings = useMascotSettings();
  const isProfessional = useIsProfessional();

  const handlePress = useCallback(() => {
    switch (variant) {
      case 'success':
        success();
        break;
      case 'error':
        error();
        break;
      case 'warning':
        warning();
        break;
      default:
        tapLight();
    }
    onClose();
  }, [variant, success, error, warning, tapLight, onClose]);

  // Check if mascot should be shown
  const shouldShowMascot = showIoo && mascotSettings.prominence !== 'hidden' && !isProfessional;

  const variantConfig = {
    success: {
      icon: CheckCircle,
      iconColor: isProfessional ? '#059669' : Colors.semantic.success,
      iconBg: isProfessional ? '#ECFDF5' : `${Colors.semantic.success}15`,
      buttonBg: isProfessional ? '#059669' : Colors.semantic.success,
      iooMood: 'happy' as const,
    },
    error: {
      icon: XCircle,
      iconColor: isProfessional ? '#DC2626' : Colors.semantic.error,
      iconBg: isProfessional ? '#FEF2F2' : `${Colors.semantic.error}15`,
      buttonBg: isProfessional ? '#DC2626' : Colors.semantic.error,
      iooMood: 'sleepy' as const,
    },
    warning: {
      icon: AlertTriangle,
      iconColor: isProfessional ? '#D97706' : Colors.semantic.warning,
      iconBg: isProfessional ? '#FFFBEB' : `${Colors.semantic.warning}15`,
      buttonBg: isProfessional ? '#D97706' : Colors.semantic.warning,
      iooMood: 'curious' as const,
    },
    info: {
      icon: Info,
      iconColor: isProfessional ? ProfessionalColors.trust.primary : Colors.secondary.sky,
      iconBg: isProfessional ? ProfessionalColors.trust.background : `${Colors.secondary.sky}15`,
      buttonBg: isProfessional ? ProfessionalColors.trust.primary : Colors.secondary.sky,
      iooMood: 'happy' as const,
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <BaseDialog visible={visible} onClose={onClose} showCloseButton={false}>
      <View style={styles.alertContent}>
        {/* Mascot or Icon */}
        {shouldShowMascot ? (
          <View style={styles.mascotContainer}>
            <IooRoleAware mood={config.iooMood} size="small" context="general" animated />
          </View>
        ) : (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: config.iconBg },
              isProfessional && styles.iconContainerProfessional,
            ]}
          >
            <IconComponent size={isProfessional ? 28 : 32} color={config.iconColor} />
          </View>
        )}

        {/* Text */}
        <Text style={[styles.alertTitle, isProfessional && styles.alertTitleProfessional]}>
          {title}
        </Text>
        <Text style={[styles.alertMessage, isProfessional && styles.alertMessageProfessional]}>
          {message}
        </Text>

        {/* Button */}
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.alertButton,
            { backgroundColor: config.buttonBg },
            isProfessional && styles.alertButtonProfessional,
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text style={styles.alertButtonText}>{isProfessional ? 'Kapat' : buttonText}</Text>
        </Pressable>
      </View>
    </BaseDialog>
  );
}

// ============================================
// INPUT DIALOG
// ============================================

export interface InputDialogProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  message?: string;
  placeholder?: string;
  initialValue?: string;
  submitText?: string;
  cancelText?: string;
  inputType?: 'text' | 'number' | 'email';
  maxLength?: number;
  required?: boolean;
}

export function InputDialog({
  visible,
  onClose,
  onSubmit,
  title,
  message,
  placeholder = '',
  initialValue = '',
  submitText = 'Gönder',
  cancelText = 'İptal',
  inputType = 'text',
  maxLength,
  required = false,
}: InputDialogProps) {
  const { tapLight, success } = useHapticFeedback();
  const isProfessional = useIsProfessional();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(() => {
    if (required && !value.trim()) {
      setError(isProfessional ? 'Bu alan zorunludur' : 'Lütfen bir değer girin');
      return;
    }
    success();
    onSubmit(value);
    onClose();
    setValue('');
    setError('');
  }, [value, required, isProfessional, success, onSubmit, onClose]);

  const handleCancel = useCallback(() => {
    tapLight();
    onClose();
    setValue(initialValue);
    setError('');
  }, [tapLight, onClose, initialValue]);

  const getKeyboardType = () => {
    switch (inputType) {
      case 'number':
        return 'numeric';
      case 'email':
        return 'email-address';
      default:
        return 'default';
    }
  };

  return (
    <BaseDialog visible={visible} onClose={handleCancel}>
      <View style={styles.inputContent}>
        <Text style={[styles.inputTitle, isProfessional && styles.inputTitleProfessional]}>
          {title}
        </Text>
        {message && (
          <Text style={[styles.inputMessage, isProfessional && styles.inputMessageProfessional]}>
            {message}
          </Text>
        )}

        <TextInput
          style={[
            styles.textInput,
            isProfessional && styles.textInputProfessional,
            error && styles.textInputError,
          ]}
          value={value}
          onChangeText={text => {
            setValue(text);
            if (error) setError('');
          }}
          placeholder={placeholder}
          placeholderTextColor={
            isProfessional ? ProfessionalColors.text.tertiary : Colors.neutral.light
          }
          keyboardType={getKeyboardType()}
          maxLength={maxLength}
          autoFocus
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleCancel}
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              isProfessional && styles.cancelButtonProfessional,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              style={[
                styles.cancelButtonText,
                isProfessional && styles.cancelButtonTextProfessional,
              ]}
            >
              {cancelText}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.button,
              styles.submitButton,
              isProfessional && styles.submitButtonProfessional,
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={styles.submitButtonText}>{submitText}</Text>
          </Pressable>
        </View>
      </View>
    </BaseDialog>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Base Dialog
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialog: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: Colors.neutral.white,
    borderRadius: radius['2xl'],
    padding: spacing['6'],
    ...shadows.xl,
  },
  dialogProfessional: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: ProfessionalColors.border.light,
    ...shadows.md,
  },
  closeButton: {
    position: 'absolute',
    top: spacing['4'],
    right: spacing['4'],
    padding: spacing['1'],
    zIndex: 10,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['4'],
  },
  titleProfessional: {
    fontSize: typography.size.lg,
    color: ProfessionalColors.text.primary,
  },

  // Confirm/Alert Content
  confirmContent: {
    alignItems: 'center',
  },
  alertContent: {
    alignItems: 'center',
  },
  mascotContainer: {
    marginBottom: spacing['4'],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['4'],
  },
  iconContainerProfessional: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
  },
  confirmTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['2'],
  },
  confirmTitleProfessional: {
    fontSize: typography.size.lg,
    color: ProfessionalColors.text.primary,
  },
  confirmMessage: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
    marginBottom: spacing['6'],
  },
  confirmMessageProfessional: {
    fontSize: typography.size.sm,
    color: ProfessionalColors.text.secondary,
    marginBottom: spacing['5'],
  },
  alertTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['2'],
  },
  alertTitleProfessional: {
    fontSize: typography.size.lg,
    color: ProfessionalColors.text.primary,
  },
  alertMessage: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
    marginBottom: spacing['6'],
  },
  alertMessageProfessional: {
    fontSize: typography.size.sm,
    color: ProfessionalColors.text.secondary,
    marginBottom: spacing['5'],
  },

  // Buttons - Using standardized button tokens
  buttonRow: {
    flexDirection: 'row',
    gap: spacing['3'],
    width: '100%',
  },
  button: {
    flex: 1,
    minHeight: buttonSizes.md.height,
    paddingVertical: buttonSizes.md.paddingVertical,
    paddingHorizontal: buttonSizes.md.paddingHorizontal,
    borderRadius: buttonSizes.md.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.neutral.lighter,
  },
  cancelButtonProfessional: {
    backgroundColor: Colors.neutral.gray100,
  },
  cancelButtonText: {
    fontSize: buttonSizes.md.fontSize,
    fontWeight: buttonSizes.md.fontWeight,
    color: Colors.neutral.dark,
  },
  cancelButtonTextProfessional: {
    color: ProfessionalColors.text.secondary,
  },
  confirmButton: {
    ...buttonStyles.elevated,
  },
  confirmButtonProfessional: {
    // Same as default for consistency
  },
  confirmButtonText: {
    fontSize: buttonSizes.md.fontSize,
    fontWeight: buttonSizes.md.fontWeight,
    color: Colors.neutral.white,
  },
  alertButton: {
    width: '100%',
    minHeight: buttonSizes.md.height,
    paddingVertical: buttonSizes.md.paddingVertical,
    borderRadius: buttonSizes.md.borderRadius,
    alignItems: 'center',
    ...buttonStyles.elevated,
  },
  alertButtonProfessional: {
    // Same as default for consistency
  },
  alertButtonText: {
    fontSize: buttonSizes.md.fontSize,
    fontWeight: buttonSizes.md.fontWeight,
    color: Colors.neutral.white,
  },

  // Input Dialog
  inputContent: {
    width: '100%',
  },
  inputTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['2'],
  },
  inputTitleProfessional: {
    fontSize: typography.size.lg,
    color: ProfessionalColors.text.primary,
  },
  inputMessage: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    textAlign: 'center',
    marginBottom: spacing['4'],
  },
  inputMessageProfessional: {
    color: ProfessionalColors.text.secondary,
  },
  textInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
    borderRadius: radius.lg,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    fontSize: typography.size.base,
    color: Colors.neutral.darkest,
    marginBottom: spacing['4'],
  },
  textInputProfessional: {
    borderWidth: 1,
    borderColor: ProfessionalColors.border.medium,
    color: ProfessionalColors.text.primary,
  },
  textInputError: {
    borderColor: Colors.semantic.error,
  },
  errorText: {
    fontSize: typography.size.sm,
    color: Colors.semantic.error,
    marginBottom: spacing['4'],
  },
  submitButton: {
    backgroundColor: Colors.primary.sunset,
    ...shadows.md,
  },
  submitButtonProfessional: {
    backgroundColor: ProfessionalColors.trust.primary,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  submitButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
});

export default {
  BaseDialog,
  ConfirmDialog,
  AlertDialog,
  InputDialog,
};
