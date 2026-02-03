/**
 * Dialog/Modal System
 * Phase 2: UX Enhancement
 *
 * Provides flexible dialog components:
 * - BaseDialog: Core modal wrapper
 * - ConfirmDialog: For destructive actions
 * - AlertDialog: For simple messages
 * - InputDialog: For text input
 */

import React, { useState, useCallback } from 'react';
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  X,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows, zIndex } from '@/constants/design-system';
import { useHapticFeedback } from '@/lib/haptics';
import { Ioo } from '@/components/Ioo';

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
}: BaseDialogProps) {
  const { tapLight } = useHapticFeedback();

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
        return FadeIn.duration(200); // Would use SlideInUp but keeping consistent
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
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        </AnimatedPressable>

        {/* Dialog */}
        <Animated.View
          entering={getEnteringAnimation()}
          exiting={getExitingAnimation()}
          style={[styles.dialog, style]}
        >
          {/* Close Button */}
          {showCloseButton && (
            <Pressable
              onPress={handleClosePress}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.6 },
              ]}
              hitSlop={8}
            >
              <X size={20} color={Colors.neutral.medium} />
            </Pressable>
          )}

          {/* Title */}
          {title && <Text style={styles.title}>{title}</Text>}

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

  const variantConfig = {
    danger: {
      icon: AlertTriangle,
      iconColor: Colors.semantic.error,
      confirmBg: Colors.semantic.error,
      iooMood: 'curious' as const,
    },
    warning: {
      icon: AlertTriangle,
      iconColor: Colors.semantic.warning,
      confirmBg: Colors.semantic.warning,
      iooMood: 'curious' as const,
    },
    info: {
      icon: Info,
      iconColor: Colors.secondary.sky,
      confirmBg: Colors.secondary.sky,
      iooMood: 'happy' as const,
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <BaseDialog visible={visible} onClose={onClose} showCloseButton={false}>
      <View style={styles.confirmContent}>
        {/* Ioo or Icon */}
        {showIoo ? (
          <View style={styles.iooContainer}>
            <Ioo mood={config.iooMood} size="sm" animated />
          </View>
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: `${config.iconColor}15` }]}>
            <IconComponent size={32} color={config.iconColor} />
          </View>
        )}

        {/* Text */}
        <Text style={styles.confirmTitle}>{title}</Text>
        <Text style={styles.confirmMessage}>{message}</Text>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleCancel}
            style={({ pressed }) => [
              styles.button,
              styles.cancelButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.cancelButtonText}>{cancelText}</Text>
          </Pressable>

          <Pressable
            onPress={handleConfirm}
            style={({ pressed }) => [
              styles.button,
              styles.confirmButton,
              { backgroundColor: config.confirmBg },
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={styles.confirmButtonText}>{confirmText}</Text>
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

  const variantConfig = {
    success: {
      icon: CheckCircle,
      iconColor: Colors.semantic.success,
      buttonBg: Colors.semantic.success,
      iooMood: 'happy' as const,
    },
    error: {
      icon: XCircle,
      iconColor: Colors.semantic.error,
      buttonBg: Colors.semantic.error,
      iooMood: 'sleepy' as const,
    },
    warning: {
      icon: AlertTriangle,
      iconColor: Colors.semantic.warning,
      buttonBg: Colors.semantic.warning,
      iooMood: 'curious' as const,
    },
    info: {
      icon: Info,
      iconColor: Colors.secondary.sky,
      buttonBg: Colors.secondary.sky,
      iooMood: 'happy' as const,
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <BaseDialog visible={visible} onClose={onClose} showCloseButton={false}>
      <View style={styles.alertContent}>
        {/* Ioo or Icon */}
        {showIoo ? (
          <View style={styles.iooContainer}>
            <Ioo mood={config.iooMood} size="sm" animated />
          </View>
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: `${config.iconColor}15` }]}>
            <IconComponent size={32} color={config.iconColor} />
          </View>
        )}

        {/* Text */}
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertMessage}>{message}</Text>

        {/* Button */}
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.alertButton,
            { backgroundColor: config.buttonBg },
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text style={styles.alertButtonText}>{buttonText}</Text>
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
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(() => {
    if (required && !value.trim()) {
      setError('Bu alan zorunludur');
      return;
    }
    success();
    onSubmit(value);
    onClose();
    setValue('');
    setError('');
  }, [value, required, success, onSubmit, onClose]);

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
        <Text style={styles.inputTitle}>{title}</Text>
        {message && <Text style={styles.inputMessage}>{message}</Text>}

        <TextInput
          style={[styles.textInput, error && styles.textInputError]}
          value={value}
          onChangeText={(text) => {
            setValue(text);
            if (error) setError('');
          }}
          placeholder={placeholder}
          placeholderTextColor={Colors.neutral.light}
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
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.cancelButtonText}>{cancelText}</Text>
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.button,
              styles.submitButton,
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

  // Confirm Dialog
  confirmContent: {
    alignItems: 'center',
  },
  iooContainer: {
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
  confirmTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['2'],
  },
  confirmMessage: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
    marginBottom: spacing['6'],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing['3'],
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: spacing['3'],
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.neutral.lighter,
  },
  cancelButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
  },
  confirmButton: {
    ...shadows.md,
  },
  confirmButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },

  // Alert Dialog
  alertContent: {
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['2'],
  },
  alertMessage: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
    marginBottom: spacing['6'],
  },
  alertButton: {
    width: '100%',
    paddingVertical: spacing['3'],
    borderRadius: radius.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  alertButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
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
  inputMessage: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    textAlign: 'center',
    marginBottom: spacing['4'],
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
