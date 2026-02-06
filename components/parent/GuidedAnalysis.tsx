/**
 * Guided Analysis Component
 * Step-by-step guided analysis flow for parents
 * Part of #20: Ebeveyn Modu - Rehberli Deneyim UI
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Camera,
  Image,
  Upload,
  ChevronRight,
  ChevronLeft,
  Check,
  Info,
  Lightbulb,
  HelpCircle,
  Play,
  Sparkles,
} from 'lucide-react-native';
import { spacing, radius, shadows } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  tips: string[];
  isCompleted: boolean;
}

interface GuidedAnalysisProps {
  childName: string;
  childAge: number;
  testType: string;
  onSelectImage: () => Promise<string | null>;
  onTakePhoto: () => Promise<string | null>;
  onStartAnalysis: (imageUri: string) => void;
  onCancel: () => void;
}

const ANALYSIS_STEPS: Omit<AnalysisStep, 'isCompleted'>[] = [
  {
    id: 'prepare',
    title: 'Hazırlık',
    description: 'Çocuğunuzun rahat bir ortamda çizim yapmasını sağlayın.',
    tips: [
      'Sessiz ve iyi aydınlatılmış bir ortam seçin',
      'Düz beyaz kağıt ve yumuşak uçlu kalem hazırlayın',
      'Çocuğunuza zaman baskısı yapmayın',
      'Çizim sırasında yönlendirme yapmayın',
    ],
  },
  {
    id: 'drawing',
    title: 'Çizim Yaptırma',
    description: 'Çocuğunuza çizim konusunu söyleyin ve bekleyin.',
    tips: [
      '"Bir insan çiz" gibi basit bir talimat verin',
      'Nasıl çizmesi gerektiğini göstermeyin',
      'Çizim bittiğinde çocuğunuza teşekkür edin',
      'Çizimi eleştirmeyin veya değerlendirmeyin',
    ],
  },
  {
    id: 'capture',
    title: 'Görsel Yükleme',
    description: 'Çizimin net bir fotoğrafını çekin veya galeriden seçin.',
    tips: [
      'Çizimi düz bir yüzeye koyun',
      'İyi aydınlatma altında fotoğraf çekin',
      'Kağıdın tamamı görüntüde olmalı',
      'Gölge düşmemesine dikkat edin',
    ],
  },
  {
    id: 'analyze',
    title: 'Analiz',
    description: 'Yapay zeka çizimi analiz edecek ve sonuçları gösterecek.',
    tips: [
      'Analiz birkaç saniye sürebilir',
      'Sonuçlar gelişimsel norm verilerine göre değerlendirilir',
      'Her çizim benzersizdir ve önemlidir',
      'Sonuçları çocuğunuzla paylaşmak zorunda değilsiniz',
    ],
  },
];

export function GuidedAnalysis({
  childName,
  childAge,
  testType,
  onSelectImage,
  onTakePhoto,
  onStartAnalysis,
  onCancel,
}: GuidedAnalysisProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(true);

  const step = ANALYSIS_STEPS[currentStep];
  const isLastStep = currentStep === ANALYSIS_STEPS.length - 1;
  const isCaptureStep = step.id === 'capture';
  const isAnalyzeStep = step.id === 'analyze';

  const handleNext = () => {
    if (isLastStep && imageUri) {
      onStartAnalysis(imageUri);
    } else if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel();
    }
  };

  const handleTakePhoto = async () => {
    const uri = await onTakePhoto();
    if (uri) {
      setImageUri(uri);
      // Auto-advance to analyze step
      if (currentStep < ANALYSIS_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleSelectImage = async () => {
    const uri = await onSelectImage();
    if (uri) {
      setImageUri(uri);
      // Auto-advance to analyze step
      if (currentStep < ANALYSIS_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const getTestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DAP: 'İnsan Çizimi',
      HTP: 'Ev-Ağaç-İnsan',
      Family: 'Aile Çizimi',
      Tree: 'Ağaç Çizimi',
    };
    return labels[type] || type;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.primary.sky, Colors.primary.mint]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.childInfo}>
            <Text style={styles.childName}>{childName}</Text>
            <Text style={styles.testInfo}>{childAge} yaş • {getTestTypeLabel(testType)}</Text>
          </View>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>{currentStep + 1}/{ANALYSIS_STEPS.length}</Text>
          </View>
        </View>

        {/* Progress Dots */}
        <View style={styles.progressDots}>
          {ANALYSIS_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
                index < currentStep && styles.progressDotCompleted,
              ]}
            >
              {index < currentStep && <Check size={10} color="#FFFFFF" />}
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step Title */}
        <View style={styles.stepHeader}>
          <View style={styles.stepIcon}>
            {step.id === 'prepare' && <Lightbulb size={28} color={Colors.primary.sunset} />}
            {step.id === 'drawing' && <Sparkles size={28} color={Colors.primary.sunset} />}
            {step.id === 'capture' && <Camera size={28} color={Colors.primary.sunset} />}
            {step.id === 'analyze' && <Play size={28} color={Colors.primary.sunset} />}
          </View>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>

        {/* Tips Section */}
        <Pressable
          style={styles.tipsContainer}
          onPress={() => setShowTips(!showTips)}
        >
          <View style={styles.tipsHeader}>
            <Info size={18} color={Colors.primary.sky} />
            <Text style={styles.tipsTitle}>Faydalı İpuçları</Text>
            <View style={[styles.tipsToggle, showTips && styles.tipsToggleActive]}>
              <Text style={styles.tipsToggleText}>{showTips ? 'Gizle' : 'Göster'}</Text>
            </View>
          </View>

          {showTips && (
            <View style={styles.tipsList}>
              {step.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <View style={styles.tipBullet} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}
        </Pressable>

        {/* Capture Step - Image Selection */}
        {isCaptureStep && (
          <View style={styles.captureSection}>
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <View style={styles.imagePlaceholder}>
                  <Image size={48} color={Colors.primary.sunset} />
                  <Text style={styles.imagePlaceholderText}>Görsel yüklendi</Text>
                </View>
                <Pressable
                  style={styles.changeImageButton}
                  onPress={handleSelectImage}
                >
                  <Text style={styles.changeImageText}>Değiştir</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.captureButtons}>
                <Pressable
                  style={({ pressed }) => [styles.captureButton, pressed && styles.captureButtonPressed]}
                  onPress={handleTakePhoto}
                >
                  <View style={styles.captureButtonIcon}>
                    <Camera size={32} color={Colors.primary.sunset} />
                  </View>
                  <Text style={styles.captureButtonTitle}>Fotoğraf Çek</Text>
                  <Text style={styles.captureButtonHint}>Kamera ile</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.captureButton, pressed && styles.captureButtonPressed]}
                  onPress={handleSelectImage}
                >
                  <View style={styles.captureButtonIcon}>
                    <Upload size={32} color={Colors.primary.mint} />
                  </View>
                  <Text style={styles.captureButtonTitle}>Galeriden Seç</Text>
                  <Text style={styles.captureButtonHint}>Mevcut fotoğraf</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* Analyze Step - Ready Message */}
        {isAnalyzeStep && imageUri && (
          <View style={styles.readySection}>
            <View style={styles.readyIcon}>
              <Sparkles size={48} color={Colors.primary.sunset} />
            </View>
            <Text style={styles.readyTitle}>Analiz İçin Hazır!</Text>
            <Text style={styles.readyDescription}>
              {childName}'ın çizimi yüklendi. Analizi başlatmak için aşağıdaki butona tıklayın.
            </Text>
          </View>
        )}

        {/* Help Link */}
        <Pressable style={styles.helpLink}>
          <HelpCircle size={16} color={Colors.primary.sky} />
          <Text style={styles.helpLinkText}>Yardıma mı ihtiyacınız var?</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
          onPress={handleBack}
        >
          <ChevronLeft size={20} color={Colors.neutral.dark} />
          <Text style={styles.backButtonText}>
            {currentStep === 0 ? 'İptal' : 'Geri'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            (!isAnalyzeStep || imageUri) && styles.nextButtonEnabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleNext}
          disabled={isAnalyzeStep && !imageUri}
        >
          <Text style={[
            styles.nextButtonText,
            (!isAnalyzeStep || imageUri) && styles.nextButtonTextEnabled,
          ]}>
            {isLastStep ? 'Analizi Başlat' : 'Devam Et'}
          </Text>
          {!isLastStep && (
            <ChevronRight size={20} color={!isAnalyzeStep || imageUri ? '#FFFFFF' : Colors.neutral.medium} />
          )}
          {isLastStep && (
            <Play size={18} color={imageUri ? '#FFFFFF' : Colors.neutral.medium} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: spacing['6'],
    paddingBottom: spacing['4'],
    paddingHorizontal: spacing['4'],
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['4'],
  },
  childInfo: {},
  childName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  stepIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['3'],
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  progressDotCompleted: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: spacing['4'],
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: spacing['4'],
  },
  stepIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary.softPeach,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3'],
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.neutral.darker,
    marginBottom: spacing['2'],
  },
  stepDescription: {
    fontSize: 15,
    color: Colors.neutral.dark,
    textAlign: 'center',
    lineHeight: 22,
  },
  tipsContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: radius.xl,
    padding: spacing['4'],
    marginBottom: spacing['4'],
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  tipsTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary.sky,
  },
  tipsToggle: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tipsToggleActive: {
    backgroundColor: Colors.primary.sky,
  },
  tipsToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary.sky,
  },
  tipsList: {
    marginTop: spacing['3'],
    gap: spacing['2'],
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['2'],
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary.sky,
    marginTop: 7,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.neutral.dark,
    lineHeight: 20,
  },
  captureSection: {
    marginBottom: spacing['4'],
  },
  captureButtons: {
    flexDirection: 'row',
    gap: spacing['3'],
  },
  captureButton: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: radius.xl,
    padding: spacing['4'],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  captureButtonPressed: {
    borderColor: Colors.primary.sunset,
    backgroundColor: Colors.primary.softPeach,
  },
  captureButtonIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3'],
    ...shadows.sm,
  },
  captureButtonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral.darker,
    marginBottom: 2,
  },
  captureButtonHint: {
    fontSize: 12,
    color: Colors.neutral.medium,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.primary.softPeach,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3'],
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: Colors.primary.sunset,
    marginTop: spacing['2'],
  },
  changeImageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral.dark,
  },
  readySection: {
    alignItems: 'center',
    backgroundColor: Colors.primary.softPeach,
    borderRadius: radius.xl,
    padding: spacing['6'],
    marginBottom: spacing['4'],
  },
  readyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['3'],
    ...shadows.sm,
  },
  readyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral.darker,
    marginBottom: spacing['2'],
  },
  readyDescription: {
    fontSize: 15,
    color: Colors.neutral.dark,
    textAlign: 'center',
    lineHeight: 22,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing['3'],
  },
  helpLinkText: {
    fontSize: 14,
    color: Colors.primary.sky,
    fontWeight: '500',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: spacing['3'],
    padding: spacing['4'],
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.lg,
    backgroundColor: '#F3F4F6',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral.dark,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: radius.lg,
    backgroundColor: '#E5E7EB',
  },
  nextButtonEnabled: {
    backgroundColor: Colors.primary.sunset,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral.medium,
  },
  nextButtonTextEnabled: {
    color: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default GuidedAnalysis;
