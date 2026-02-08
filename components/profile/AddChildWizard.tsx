/**
 * AddChildWizard - Multi-step wizard for adding a child profile
 *
 * Steps:
 * 1. Avatar selection
 * 2. Name input
 * 3. Age selection
 * 4. Confirmation
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { X, ChevronRight, ChevronLeft, Check, Baby, User, Calendar } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import {
  typography,
  spacing,
  radius,
  shadows,
  iconSizes,
  iconStroke,
} from '@/constants/design-system';
import { AvatarDisplay, AvatarPicker } from '@/components/AvatarPicker';

interface AddChildWizardProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (child: { name: string; age: number; avatarId?: string }) => void;
}

type WizardStep = 'avatar' | 'name' | 'age' | 'confirm';

const STEPS: WizardStep[] = ['avatar', 'name', 'age', 'confirm'];

const STEP_INFO: Record<WizardStep, { title: string; subtitle: string; icon: React.ReactNode }> = {
  avatar: {
    title: 'Avatar Seçin',
    subtitle: 'Çocuğunuz için bir karakter seçin',
    icon: (
      <Baby
        size={iconSizes.action}
        color={Colors.secondary.lavender}
        strokeWidth={iconStroke.standard}
      />
    ),
  },
  name: {
    title: 'İsim Girin',
    subtitle: 'Çocuğunuzun adını yazın',
    icon: (
      <User
        size={iconSizes.action}
        color={Colors.secondary.sky}
        strokeWidth={iconStroke.standard}
      />
    ),
  },
  age: {
    title: 'Yaş Seçin',
    subtitle: 'Çocuğunuzun yaşını seçin',
    icon: (
      <Calendar
        size={iconSizes.action}
        color={Colors.secondary.grass}
        strokeWidth={iconStroke.standard}
      />
    ),
  },
  confirm: {
    title: 'Onaylayın',
    subtitle: 'Bilgileri kontrol edin',
    icon: (
      <Check
        size={iconSizes.action}
        color={Colors.semantic.success}
        strokeWidth={iconStroke.standard}
      />
    ),
  },
};

const AGE_OPTIONS = Array.from({ length: 18 }, (_, i) => i + 1);

export function AddChildWizard({ visible, onClose, onComplete }: AddChildWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('avatar');
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>();
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState<number | undefined>();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const currentIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === STEPS.length - 1;

  const resetWizard = () => {
    setCurrentStep('avatar');
    setSelectedAvatar(undefined);
    setChildName('');
    setChildAge(undefined);
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const handleNext = () => {
    if (isLastStep) {
      if (childName && childAge) {
        onComplete({ name: childName, age: childAge, avatarId: selectedAvatar });
        handleClose();
      }
    } else {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'avatar':
        return true; // Avatar is optional
      case 'name':
        return childName.trim().length >= 2;
      case 'age':
        return childAge !== undefined;
      case 'confirm':
        return childName.trim().length >= 2 && childAge !== undefined;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'avatar':
        return (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContent}>
            <Pressable
              style={({ pressed }) => [
                styles.avatarSelector,
                pressed && styles.avatarSelectorPressed,
              ]}
              onPress={() => setShowAvatarPicker(true)}
            >
              <AvatarDisplay avatarId={selectedAvatar} size={100} />
              <Text style={styles.avatarSelectorText}>
                {selectedAvatar ? 'Değiştirmek için dokunun' : 'Avatar seçmek için dokunun'}
              </Text>
            </Pressable>
          </Animated.View>
        );

      case 'name':
        return (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContent}>
            <TextInput
              style={styles.nameInput}
              value={childName}
              onChangeText={setChildName}
              placeholder="Çocuğunuzun adı"
              placeholderTextColor={Colors.neutral.light}
              autoFocus
              maxLength={30}
            />
            {childName.length > 0 && childName.length < 2 && (
              <Text style={styles.validationText}>En az 2 karakter gerekli</Text>
            )}
          </Animated.View>
        );

      case 'age':
        return (
          <Animated.View entering={FadeInRight} exiting={FadeOutLeft} style={styles.stepContent}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ageGrid}
            >
              {AGE_OPTIONS.map(age => (
                <Pressable
                  key={age}
                  style={({ pressed }) => [
                    styles.ageButton,
                    childAge === age && styles.ageButtonSelected,
                    pressed && styles.ageButtonPressed,
                  ]}
                  onPress={() => setChildAge(age)}
                >
                  <Text
                    style={[styles.ageButtonText, childAge === age && styles.ageButtonTextSelected]}
                  >
                    {age}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.ageHint}>
              {childAge ? `${childAge} yaş seçildi` : 'Bir yaş seçin'}
            </Text>
          </Animated.View>
        );

      case 'confirm':
        return (
          <Animated.View entering={FadeIn} style={styles.stepContent}>
            <View style={styles.confirmCard}>
              <AvatarDisplay avatarId={selectedAvatar} size={80} />
              <View style={styles.confirmInfo}>
                <Text style={styles.confirmName}>{childName}</Text>
                <Text style={styles.confirmAge}>{childAge} yaşında</Text>
              </View>
            </View>
            <Text style={styles.confirmHint}>{'Bilgiler doğruysa "Tamamla" butonuna basın'}</Text>
          </Animated.View>
        );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {STEP_INFO[currentStep].icon}
              <View>
                <Text style={styles.headerTitle}>{STEP_INFO[currentStep].title}</Text>
                <Text style={styles.headerSubtitle}>{STEP_INFO[currentStep].subtitle}</Text>
              </View>
            </View>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <X
                size={iconSizes.action}
                color={Colors.neutral.medium}
                strokeWidth={iconStroke.standard}
              />
            </Pressable>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {STEPS.map((step, index) => (
              <View
                key={step}
                style={[
                  styles.progressDot,
                  index <= currentIndex && styles.progressDotActive,
                  index < currentIndex && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>

          {/* Content */}
          <View style={styles.content}>{renderStepContent()}</View>

          {/* Footer */}
          <View style={styles.footer}>
            {!isFirstStep && (
              <Pressable
                style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
                onPress={handleBack}
              >
                <ChevronLeft
                  size={iconSizes.small}
                  color={Colors.neutral.medium}
                  strokeWidth={iconStroke.standard}
                />
                <Text style={styles.backButtonText}>Geri</Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.nextButton,
                !canProceed() && styles.nextButtonDisabled,
                pressed && canProceed() && styles.nextButtonPressed,
              ]}
              onPress={handleNext}
              disabled={!canProceed()}
            >
              <LinearGradient
                colors={
                  canProceed()
                    ? isLastStep
                      ? [Colors.semantic.success, '#6EE7B7']
                      : [Colors.secondary.lavender, Colors.secondary.lavenderLight]
                    : [Colors.neutral.light, Colors.neutral.lighter]
                }
                style={styles.nextButtonGradient}
              >
                <Text
                  style={[styles.nextButtonText, !canProceed() && styles.nextButtonTextDisabled]}
                >
                  {isLastStep ? 'Tamamla' : 'Devam'}
                </Text>
                {!isLastStep && (
                  <ChevronRight
                    size={iconSizes.small}
                    color={canProceed() ? Colors.neutral.white : Colors.neutral.medium}
                    strokeWidth={iconStroke.standard}
                  />
                )}
                {isLastStep && (
                  <Check
                    size={iconSizes.small}
                    color={canProceed() ? Colors.neutral.white : Colors.neutral.medium}
                    strokeWidth={iconStroke.bold}
                  />
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>

      {/* Avatar Picker */}
      <AvatarPicker
        visible={showAvatarPicker}
        selectedAvatarId={selectedAvatar}
        onSelect={avatarId => {
          setSelectedAvatar(avatarId);
          setShowAvatarPicker(false);
        }}
        onClose={() => setShowAvatarPicker(false)}
      />
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.neutral.lighter,
  },
  progressDotActive: {
    backgroundColor: Colors.secondary.lavenderLight,
  },
  progressDotCompleted: {
    backgroundColor: Colors.secondary.lavender,
  },
  content: {
    padding: spacing.lg,
    minHeight: 200,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelector: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: Colors.neutral.lightest,
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
    borderStyle: 'dashed',
  },
  avatarSelectorPressed: {
    opacity: 0.8,
  },
  avatarSelectorText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  nameInput: {
    width: '100%',
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: typography.size.lg,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  validationText: {
    fontSize: typography.size.xs,
    color: Colors.semantic.error,
    marginTop: spacing.sm,
  },
  ageGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  ageButton: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.lightest,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  ageButtonSelected: {
    backgroundColor: Colors.secondary.grassLight,
    borderColor: Colors.secondary.grass,
  },
  ageButtonPressed: {
    opacity: 0.8,
  },
  ageButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.dark,
  },
  ageButtonTextSelected: {
    color: Colors.semantic.success,
  },
  ageHint: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  confirmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: Colors.secondary.grassLight,
  },
  confirmInfo: {
    flex: 1,
  },
  confirmName: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  confirmAge: {
    fontSize: typography.size.md,
    color: Colors.neutral.medium,
  },
  confirmHint: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
    gap: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    fontSize: typography.size.md,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  nextButton: {
    flex: 1,
    maxWidth: 200,
    marginLeft: 'auto',
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonPressed: {
    opacity: 0.9,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  nextButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  nextButtonTextDisabled: {
    color: Colors.neutral.medium,
  },
});

export default AddChildWizard;
