import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  Modal,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { preprocessImage } from '@/utils/imagePreprocess';
import {
  Palette,
  ImagePlus,
  Sparkles,
  Download,
  X,
  Wand2,
  AlertTriangle,
  Heart,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';
import {
  layout,
  typography,
  spacing,
  radius,
  shadows,
  cardVariants,
  badgeStyles,
} from '@/constants/design-system';
import { useGenerateColoringPage } from '@/lib/hooks/useGenerateColoringPage';
import * as Linking from 'expo-linking';
import { ColoringCanvas } from '@/components/ColoringCanvas';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useLocalSearchParams } from 'expo-router';
import { showAlert } from '@/lib/platform';

export default function StudioScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();

  // Responsive breakpoints
  const isSmallScreen = width < 380;
  const screenPadding = isSmallScreen ? spacing['4'] : layout.screenPadding;

  // AI Boyama Sayfası States
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiDrawingImage, setAIDrawingImage] = useState<string | null>(null);
  const [showColoringCanvas, setShowColoringCanvas] = useState(false);
  const { generate, isGenerating, coloringPage, reset } = useGenerateColoringPage();

  // Content warning modal state
  const [showContentWarningModal, setShowContentWarningModal] = useState(false);

  // Comprehensive concern types based on ACEs (Adverse Childhood Experiences) and pediatric psychology
  type _ConcernType =
    | 'war'
    | 'violence'
    | 'disaster'
    | 'loss'
    | 'loneliness'
    | 'fear'
    | 'abuse'
    | 'family_separation'
    | 'death'
    | 'neglect'
    | 'bullying'
    | 'domestic_violence_witness'
    | 'parental_addiction'
    | 'parental_mental_illness'
    | 'medical_trauma'
    | 'anxiety'
    | 'depression'
    | 'low_self_esteem'
    | 'anger'
    | 'school_stress'
    | 'social_rejection'
    | 'displacement'
    | 'poverty'
    | 'cyberbullying'
    | 'other';

  // Human-readable labels for concern types (Turkish) - Based on ACEs framework
  const concernTypeLabels: Record<string, { label: string; emoji: string; color: string }> = {
    // Original categories
    war: { label: 'Savaş / Çatışma', emoji: '🕊️', color: Colors.neutral.medium },
    violence: { label: 'Şiddet', emoji: '💪', color: Colors.semantic.errorBold },
    disaster: { label: 'Doğal Afet', emoji: '🌈', color: Colors.semantic.amber },
    loss: { label: 'Kayıp / Ayrılık', emoji: '💝', color: Colors.secondary.violet },
    loneliness: { label: 'Yalnızlık', emoji: '🤗', color: '#3B82F6' },
    fear: { label: 'Korku', emoji: '⭐', color: Colors.semantic.successBold },
    abuse: { label: 'İstismar', emoji: '🛡️', color: '#EC4899' },
    family_separation: { label: 'Aile Ayrılığı', emoji: '❤️', color: '#F97316' },
    death: { label: 'Ölüm / Yas', emoji: '🦋', color: Colors.secondary.indigo },
    // ACEs Framework categories
    neglect: { label: 'İhmal', emoji: '🏠', color: Colors.secondary.violet },
    bullying: { label: 'Akran Zorbalığı', emoji: '🤝', color: Colors.semantic.amber },
    domestic_violence_witness: {
      label: 'Aile İçi Şiddete Tanıklık',
      emoji: '🏡',
      color: Colors.semantic.errorBold,
    },
    parental_addiction: {
      label: 'Ebeveyn Bağımlılığı',
      emoji: '🌱',
      color: Colors.semantic.successBold,
    },
    parental_mental_illness: { label: 'Ebeveyn Ruhsal Hastalığı', emoji: '💙', color: '#3B82F6' },
    // Pediatric psychology categories
    medical_trauma: { label: 'Tıbbi Travma', emoji: '🏥', color: '#06B6D4' },
    anxiety: { label: 'Kaygı', emoji: '🌿', color: '#22C55E' },
    depression: { label: 'Depresyon Belirtileri', emoji: '🌻', color: '#EAB308' },
    low_self_esteem: { label: 'Düşük Öz Saygı', emoji: '✨', color: '#A855F7' },
    anger: { label: 'Öfke', emoji: '🧘', color: '#F97316' },
    school_stress: { label: 'Okul Stresi', emoji: '📚', color: Colors.secondary.indigo },
    social_rejection: { label: 'Sosyal Dışlanma', emoji: '🌟', color: '#EC4899' },
    // Additional categories
    displacement: { label: 'Göç / Yerinden Edilme', emoji: '🏠', color: '#14B8A6' },
    poverty: { label: 'Ekonomik Zorluk', emoji: '💎', color: '#78716C' },
    cyberbullying: { label: 'Siber Zorbalık', emoji: '📱', color: Colors.secondary.violet },
    // Fallback
    other: { label: 'Diğer', emoji: '💜', color: Colors.neutral.gray400 },
  };

  // Hayal Atölyesi'nden gelen imageUri'yi otomatik kullan
  useEffect(() => {
    if (params.imageUri && typeof params.imageUri === 'string') {
      setAIDrawingImage(params.imageUri);
      setShowAIModal(true); // Modal'ı otomatik aç
    }
  }, [params.imageUri]);

  // AI Boyama Sayfası Fonksiyonları
  async function pickAIDrawingImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: true,
    });
    if (!res.canceled && res.assets?.length) {
      setAIDrawingImage(res.assets[0].uri);
    }
  }

  async function handleGenerateAIColoring() {
    if (!aiDrawingImage) {
      showAlert(t.studio.selectDrawingFirst);
      return;
    }

    try {
      // Preprocess image (handles HEIC conversion)
      const processedUri = await preprocessImage(aiDrawingImage);

      // Convert image to base64
      let imageBase64: string;
      if (Platform.OS === 'web') {
        if (processedUri.startsWith('data:')) {
          imageBase64 = processedUri.split(',')[1];
        } else {
          const response = await fetch(processedUri);
          const blob = await response.blob();
          imageBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              const base64Data = base64String.split(',')[1];
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      } else {
        let uri = processedUri;
        if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
          uri = `file://${uri}`;
        }
        imageBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });
      }

      const result = await generate(imageBase64, {
        style: 'simple',
        ageGroup: 5,
      });

      // Check for concerning content and show warning modal
      if (result?.contentAnalysis?.hasConcerningContent) {
        setShowContentWarningModal(true);
      } else {
        showAlert(t.studio.success, t.studio.coloringPageCreated);
      }
    } catch {
      showAlert(t.common.error, t.studio.coloringPageError);
    }
  }

  function handleDownloadColoring() {
    if (coloringPage?.imageUrl) {
      Linking.openURL(coloringPage.imageUrl);
    }
  }

  function handleCloseAIModal() {
    setShowAIModal(false);
    setAIDrawingImage(null);
    reset();
  }

  return (
    <LinearGradient
      colors={[...colors.background.studio] as [string, string, ...string[]]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: screenPadding,
            paddingTop: insets.top + (isSmallScreen ? 12 : 16),
            paddingBottom: insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <LinearGradient
              colors={[colors.secondary.mint, colors.cards.coloring.icon]}
              style={[styles.headerIcon, isSmallScreen && { width: 64, height: 64 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Palette size={isSmallScreen ? 28 : 32} color={Colors.neutral.white} />
            </LinearGradient>
          </View>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.neutral.darkest },
              isSmallScreen && { fontSize: typography.size['3xl'] },
            ]}
          >
            {t.studio.title}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: colors.neutral.medium },
              isSmallScreen && { fontSize: typography.size.sm, paddingHorizontal: spacing['2'] },
            ]}
          >
            {t.studio.subtitle}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={[styles.statsRow, isSmallScreen && { gap: spacing['2'] }]}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface.card },
              isSmallScreen && { padding: spacing['3'] },
            ]}
          >
            <Text
              style={[
                styles.statNumber,
                { color: colors.cards.coloring.icon },
                isSmallScreen && { fontSize: typography.size.xl },
              ]}
            >
              ∞
            </Text>
            <Text style={[styles.statLabel, { color: colors.neutral.medium }]}>
              {t.studio.unlimited}
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface.card },
              isSmallScreen && { padding: spacing['3'] },
            ]}
          >
            <Text
              style={[
                styles.statNumber,
                { color: colors.cards.coloring.icon },
                isSmallScreen && { fontSize: typography.size.xl },
              ]}
            >
              A4
            </Text>
            <Text style={[styles.statLabel, { color: colors.neutral.medium }]}>PDF</Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface.card },
              isSmallScreen && { padding: spacing['3'] },
            ]}
          >
            <Text
              style={[
                styles.statNumber,
                { color: colors.cards.coloring.icon },
                isSmallScreen && { fontSize: typography.size.xl },
              ]}
            >
              HD
            </Text>
            <Text style={[styles.statLabel, { color: colors.neutral.medium }]}>
              {t.studio.quality}
            </Text>
          </View>
        </View>

        {/* AI Coloring Card */}
        <LinearGradient
          colors={[colors.secondary.lavender, colors.secondary.lavenderLight]}
          style={styles.aiCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.aiCardHeader}>
            <View style={styles.aiBadge}>
              <Wand2 size={16} color={colors.secondary.lavender} />
              <Text style={[styles.aiBadgeText, { color: colors.secondary.lavender }]}>
                {t.studio.newFeature}
              </Text>
            </View>
          </View>

          <View style={[styles.aiIconContainer, isSmallScreen && { width: 72, height: 72 }]}>
            <Wand2 size={isSmallScreen ? 36 : 48} color={Colors.neutral.white} />
          </View>

          <Text style={[styles.aiCardTitle, isSmallScreen && { fontSize: typography.size.xl }]}>
            {t.studio.createInteractive}
          </Text>
          <Text
            style={[styles.aiCardDescription, isSmallScreen && { fontSize: typography.size.sm }]}
          >
            {t.studio.createInteractiveDesc}
          </Text>

          <Pressable
            onPress={() => setShowAIModal(true)}
            style={({ pressed }) => [styles.aiButton, pressed && styles.buttonPressed]}
          >
            <LinearGradient
              colors={[colors.neutral.white, colors.neutral.lighter]}
              style={styles.buttonGradient}
            >
              <Sparkles size={20} color={colors.secondary.lavender} />
              <Text style={[styles.aiButtonText, { color: colors.secondary.lavender }]}>
                {t.studio.tryNow}
              </Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>

        {/* Info Card */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.primary.soft, borderColor: colors.primary.blush },
          ]}
        >
          <View style={styles.infoIconContainer}>
            <Text style={styles.infoIcon}>💡</Text>
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: colors.neutral.darkest }]}>
              {t.studio.howItWorks}
            </Text>
            <Text style={[styles.infoText, { color: colors.neutral.dark }]}>
              {t.studio.howItWorksDesc}
            </Text>
          </View>
        </View>

        {/* Features Grid */}
        <View style={[styles.featuresGrid, isSmallScreen && { gap: spacing['2'] }]}>
          <View
            style={[
              styles.featureItem,
              { backgroundColor: colors.surface.card },
              isSmallScreen && { padding: spacing['3'] },
            ]}
          >
            <Text style={[styles.featureEmoji, isSmallScreen && { fontSize: 24 }]}>🎨</Text>
            <Text
              style={[
                styles.featureLabel,
                { color: colors.neutral.dark },
                isSmallScreen && { fontSize: typography.size.xs },
              ]}
            >
              {t.studio.preservesLines}
            </Text>
          </View>
          <View
            style={[
              styles.featureItem,
              { backgroundColor: colors.surface.card },
              isSmallScreen && { padding: spacing['3'] },
            ]}
          >
            <Text style={[styles.featureEmoji, isSmallScreen && { fontSize: 24 }]}>✨</Text>
            <Text
              style={[
                styles.featureLabel,
                { color: colors.neutral.dark },
                isSmallScreen && { fontSize: typography.size.xs },
              ]}
            >
              {t.studio.hdQuality}
            </Text>
          </View>
          <View
            style={[
              styles.featureItem,
              { backgroundColor: colors.surface.card },
              isSmallScreen && { padding: spacing['3'] },
            ]}
          >
            <Text style={[styles.featureEmoji, isSmallScreen && { fontSize: 24 }]}>📄</Text>
            <Text
              style={[
                styles.featureLabel,
                { color: colors.neutral.dark },
                isSmallScreen && { fontSize: typography.size.xs },
              ]}
            >
              {t.studio.a4Format}
            </Text>
          </View>
          <View
            style={[
              styles.featureItem,
              { backgroundColor: colors.surface.card },
              isSmallScreen && { padding: spacing['3'] },
            ]}
          >
            <Text style={[styles.featureEmoji, isSmallScreen && { fontSize: 24 }]}>⚡</Text>
            <Text
              style={[
                styles.featureLabel,
                { color: colors.neutral.dark },
                isSmallScreen && { fontSize: typography.size.xs },
              ]}
            >
              {t.studio.fastProcessing}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* AI Coloring Modal */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseAIModal}
      >
        {isGenerating ? (
          <LoadingAnimation type="painting" message={t.studio.creating} />
        ) : (
          <View style={styles.modalOverlay}>
            <BlurView
              intensity={Platform.OS === 'web' ? 0 : 80}
              tint="light"
              style={styles.modalBlurContainer}
            >
              <LinearGradient
                colors={['#E8FFF5', '#E0FFFF', '#F0FFF4'] as const}
                style={[
                  styles.modalContent,
                  { padding: isSmallScreen ? spacing['4'] : spacing['6'] },
                ]}
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: colors.neutral.darkest },
                      isSmallScreen && { fontSize: typography.size.xl },
                    ]}
                  >
                    {t.studio.interactiveColoring}
                  </Text>
                  <Pressable
                    onPress={handleCloseAIModal}
                    style={[styles.modalCloseButton, { backgroundColor: colors.neutral.lighter }]}
                  >
                    <X size={isSmallScreen ? 20 : 24} color={colors.neutral.darkest} />
                  </Pressable>
                </View>

                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  {/* Instructions */}
                  <View
                    style={[
                      styles.modalInstructions,
                      { backgroundColor: colors.primary.soft, borderColor: colors.primary.blush },
                    ]}
                  >
                    <Text style={[styles.instructionsTitle, { color: colors.neutral.darkest }]}>
                      {t.studio.howItWorks}
                    </Text>
                    <Text style={[styles.instructionsText, { color: colors.neutral.dark }]}>
                      {t.studio.instructions}
                    </Text>
                  </View>

                  {/* Image Picker */}
                  {aiDrawingImage && (
                    <View style={styles.modalImagePreview}>
                      <Image
                        source={{ uri: aiDrawingImage }}
                        style={styles.modalImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.modalImageLabel}>{t.studio.selectedDrawing}</Text>
                    </View>
                  )}

                  <Pressable
                    onPress={pickAIDrawingImage}
                    style={({ pressed }) => [
                      styles.modalPickButton,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={[colors.secondary.sky, colors.secondary.skyLight]}
                      style={styles.buttonGradient}
                    >
                      <ImagePlus size={20} color={Colors.neutral.white} />
                      <Text style={styles.buttonTextWhite}>
                        {aiDrawingImage ? t.studio.selectDifferentDrawing : t.studio.selectDrawing}
                      </Text>
                    </LinearGradient>
                  </Pressable>

                  {/* Generate Button */}
                  <Pressable
                    onPress={handleGenerateAIColoring}
                    disabled={!aiDrawingImage || isGenerating}
                    style={({ pressed }) => [
                      styles.modalGenerateButton,
                      (!aiDrawingImage || isGenerating) && styles.buttonDisabled,
                      pressed && !isGenerating && styles.buttonPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={
                        !aiDrawingImage || isGenerating
                          ? [colors.neutral.light, colors.neutral.medium]
                          : [colors.secondary.lavender, colors.secondary.lavenderLight]
                      }
                      style={styles.buttonGradient}
                    >
                      {isGenerating ? (
                        <ActivityIndicator color={Colors.neutral.white} />
                      ) : (
                        <Wand2 size={20} color={Colors.neutral.white} />
                      )}
                      <Text style={styles.buttonTextWhite}>
                        {isGenerating ? t.studio.creating : t.studio.generateColoringPage}
                      </Text>
                    </LinearGradient>
                  </Pressable>

                  {/* Result */}
                  {coloringPage && (
                    <View style={[styles.modalResult, { backgroundColor: colors.surface.card }]}>
                      <View
                        style={[
                          styles.modalResultBadge,
                          { backgroundColor: colors.secondary.lavenderLight },
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalResultBadgeText,
                            { color: colors.secondary.lavender },
                          ]}
                        >
                          {t.studio.ready}
                        </Text>
                      </View>

                      <Image
                        source={{ uri: coloringPage.imageUrl }}
                        style={styles.modalResultImage}
                        resizeMode="contain"
                      />

                      <Text style={[styles.modalResultDescription, { color: colors.neutral.dark }]}>
                        {coloringPage.analysis}
                      </Text>

                      <View style={styles.modalResultButtons}>
                        <Pressable
                          onPress={() => setShowColoringCanvas(true)}
                          style={({ pressed }) => [
                            styles.modalColorButton,
                            pressed && styles.buttonPressed,
                          ]}
                        >
                          <LinearGradient
                            colors={[colors.secondary.lavender, colors.secondary.lavenderLight]}
                            style={styles.buttonGradient}
                          >
                            <Palette size={20} color={Colors.neutral.white} />
                            <Text style={styles.buttonTextWhite}>{t.studio.startColoring}</Text>
                          </LinearGradient>
                        </Pressable>

                        <Pressable
                          onPress={handleDownloadColoring}
                          style={({ pressed }) => [
                            styles.modalDownloadButton,
                            pressed && styles.buttonPressed,
                          ]}
                        >
                          <LinearGradient
                            colors={[colors.semantic.success, colors.secondary.grassLight]}
                            style={styles.buttonGradient}
                          >
                            <Download size={20} color={Colors.neutral.white} />
                            <Text style={styles.buttonTextWhite}>{t.studio.download}</Text>
                          </LinearGradient>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </ScrollView>
              </LinearGradient>
            </BlurView>
          </View>
        )}
      </Modal>

      {/* Coloring Canvas Modal */}
      <Modal
        visible={showColoringCanvas}
        animationType="slide"
        onRequestClose={() => setShowColoringCanvas(false)}
      >
        <View style={[styles.canvasModalContainer, { backgroundColor: colors.neutral.lighter }]}>
          <View
            style={[
              styles.canvasModalHeader,
              {
                backgroundColor: colors.surface.card,
                paddingHorizontal: isSmallScreen ? spacing['4'] : spacing['6'],
                paddingVertical: isSmallScreen ? spacing['3'] : spacing['5'],
              },
            ]}
          >
            <Text
              style={[
                styles.canvasModalTitle,
                { color: colors.neutral.darkest },
                isSmallScreen && { fontSize: typography.size.xl },
              ]}
            >
              {t.studio.startColoringTitle}
            </Text>
            <Pressable
              onPress={() => setShowColoringCanvas(false)}
              style={[styles.modalCloseButton, { backgroundColor: colors.neutral.lighter }]}
            >
              <X size={isSmallScreen ? 20 : 24} color={colors.neutral.darkest} />
            </Pressable>
          </View>

          {coloringPage && (
            <ColoringCanvas
              backgroundImage={coloringPage.imageUrl}
              onClose={() => setShowColoringCanvas(false)}
              onSave={() => {
                showAlert(t.studio.great, t.studio.coloringSaved);
                setShowColoringCanvas(false);
              }}
            />
          )}
        </View>
      </Modal>

      {/* Content Warning Modal */}
      <Modal
        visible={showContentWarningModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowContentWarningModal(false)}
      >
        <View style={styles.warningModalOverlay}>
          <ScrollView
            style={{ maxHeight: '90%' }}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.contentWarningModal, { backgroundColor: colors.surface.card }]}>
              <View style={styles.warningIconContainer}>
                <AlertTriangle size={40} color={colors.secondary.sunshine} />
              </View>

              <Text style={[styles.warningTitle, { color: colors.neutral.darkest }]}>
                Ebeveyn Bildirimi
              </Text>

              {/* Concern Type Badge */}
              {coloringPage?.contentAnalysis?.concernType &&
                concernTypeLabels[coloringPage.contentAnalysis.concernType] && (
                  <View
                    style={[
                      styles.concernTypeBadge,
                      {
                        backgroundColor: `${concernTypeLabels[coloringPage.contentAnalysis.concernType].color}20`,
                      },
                    ]}
                  >
                    <Text style={styles.concernTypeEmoji}>
                      {concernTypeLabels[coloringPage.contentAnalysis.concernType].emoji}
                    </Text>
                    <Text
                      style={[
                        styles.concernTypeLabel,
                        {
                          color: concernTypeLabels[coloringPage.contentAnalysis.concernType].color,
                        },
                      ]}
                    >
                      {concernTypeLabels[coloringPage.contentAnalysis.concernType].label}
                    </Text>
                  </View>
                )}

              <Text style={[styles.warningDescription, { color: colors.neutral.dark }]}>
                Çocuğunuzun çiziminde dikkat edilmesi gereken duygusal içerik tespit edildi.
              </Text>

              {coloringPage?.contentAnalysis?.concernDescription && (
                <View style={styles.warningDetailBox}>
                  <Text style={[styles.warningDetailTitle, { color: colors.neutral.dark }]}>
                    Tespit Edilen İçerik:
                  </Text>
                  <Text style={[styles.warningDetailText, { color: colors.neutral.darkest }]}>
                    {coloringPage.contentAnalysis.concernDescription}
                  </Text>
                </View>
              )}

              {coloringPage?.contentAnalysis?.therapeuticApproach && (
                <View style={styles.therapeuticBox}>
                  <Text style={[styles.therapeuticTitle, { color: colors.secondary.violet }]}>
                    🎯 Terapötik Yaklaşım:
                  </Text>
                  <Text style={[styles.therapeuticText, { color: colors.neutral.dark }]}>
                    {coloringPage.contentAnalysis.therapeuticApproach}
                  </Text>
                </View>
              )}

              {coloringPage?.contentAnalysis?.therapeuticColoringTheme && (
                <View style={styles.coloringThemeBox}>
                  <Text style={styles.coloringThemeTitle}>🎨 Terapötik Boyama Teması:</Text>
                  <Text style={[styles.coloringThemeText, { color: colors.neutral.dark }]}>
                    {coloringPage.contentAnalysis.therapeuticColoringTheme}
                  </Text>
                </View>
              )}

              <View style={styles.warningInfoBox}>
                <Heart size={20} color={colors.primary.sunset} />
                <Text style={[styles.warningInfoText, { color: colors.neutral.dark }]}>
                  Bu boyama sayfası, çocuğunuzun duygularını güvenli bir şekilde işlemesine yardımcı
                  olmak için terapötik temalarla oluşturuldu. Boyama aktivitesi rahatlatıcı ve
                  iyileştirici bir etki sağlar.
                </Text>
              </View>

              <View
                style={[
                  styles.professionalNoteBox,
                  {
                    backgroundColor: isDark ? colors.surface.elevated : 'rgba(156, 163, 175, 0.1)',
                  },
                ]}
              >
                <Text style={[styles.professionalNoteText, { color: colors.neutral.medium }]}>
                  💡 Not: Bu uygulama profesyonel psikolojik destek yerine geçmez. Endişeleriniz
                  varsa bir çocuk psikoloğuna danışmanızı öneririz.
                </Text>
              </View>

              <Pressable
                style={styles.warningButton}
                onPress={() => setShowContentWarningModal(false)}
              >
                <LinearGradient
                  colors={[colors.primary.sunset, colors.secondary.sunshine]}
                  style={styles.warningButtonGradient}
                >
                  <Text style={styles.warningButtonText}>Anladım, Devam Et</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingHorizontal is now applied dynamically based on screen size
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing['8'],
  },
  headerIconContainer: {
    marginBottom: spacing['4'],
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xl,
  },
  headerTitle: {
    fontSize: typography.size['4xl'],
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['2'],
    letterSpacing: typography.letterSpacing.tight,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: typography.size.md,
    color: Colors.neutral.medium,
    textAlign: 'center',
    lineHeight: typography.size.md * typography.lineHeight.normal,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: spacing['3'],
    marginBottom: spacing['6'],
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing['4'],
    alignItems: 'center',
    ...shadows.sm,
  },
  statNumber: {
    fontSize: typography.size['2xl'],
    fontFamily: typography.family.extrabold,
    color: Colors.cards.coloring.icon,
    marginBottom: spacing['1'],
  },
  statLabel: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.medium,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
  },

  // Main Card
  mainCard: {
    ...cardVariants.hero,
    marginBottom: spacing['6'],
    borderWidth: 2,
    borderColor: Colors.cards.coloring.border,
  },
  featureBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    ...badgeStyles.default,
    backgroundColor: Colors.neutral.white,
    marginBottom: spacing['6'],
  },
  featureBadgeText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.semibold,
    color: Colors.cards.coloring.icon,
  },
  cardIconContainer: {
    alignItems: 'center',
    marginBottom: spacing['4'],
  },
  cardIcon: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  cardTitle: {
    fontSize: typography.size['3xl'],
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['2'],
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.tight,
  },
  cardDescription: {
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
    textAlign: 'center',
    marginBottom: spacing['8'],
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
  },

  // Input Section
  inputSection: {
    gap: spacing['4'],
  },
  inputContainer: {
    marginBottom: 0,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing['4'],
  },
  imageLabel: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },
  selectImageButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  createButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['6'],
  },
  buttonTextWhite: {
    fontSize: typography.size.base,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // Result Section
  resultSection: {
    marginTop: spacing['6'],
    gap: spacing['4'],
  },
  successBadge: {
    alignSelf: 'center',
    backgroundColor: Colors.semantic.successBg,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: Colors.semantic.success,
  },
  successBadgeText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
    color: Colors.semantic.success,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    backgroundColor: Colors.neutral.white,
    padding: spacing['4'],
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  resultIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: Colors.semantic.successBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: typography.size.base,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['1'],
  },
  resultUrl: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primary.soft,
    padding: spacing['5'],
    borderRadius: radius.xl,
    marginBottom: spacing['6'],
    borderWidth: 1,
    borderColor: Colors.primary.blush,
  },
  infoIconContainer: {
    marginRight: spacing['3'],
  },
  infoIcon: {
    fontSize: 32,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.size.base,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['1'],
  },
  infoText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
  },

  // Features Grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['3'],
  },
  featureItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.neutral.white,
    padding: spacing['4'],
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: spacing['2'],
  },
  featureLabel: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.dark,
    textAlign: 'center',
  },

  // AI Card Styles
  aiCard: {
    ...cardVariants.hero,
    marginBottom: spacing['6'],
    borderWidth: 2,
    borderColor: Colors.secondary.lavenderLight,
  },
  aiCardHeader: {
    marginBottom: spacing['4'],
  },
  aiBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    ...badgeStyles.default,
    backgroundColor: Colors.neutral.white,
  },
  aiBadgeText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.bold,
    color: Colors.secondary.lavender,
  },
  aiIconContainer: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['4'],
  },
  aiCardTitle: {
    fontSize: typography.size['2xl'],
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.white,
    marginBottom: spacing['2'],
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.tight,
  },
  aiCardDescription: {
    fontSize: typography.size.base,
    color: Colors.neutral.white,
    textAlign: 'center',
    marginBottom: spacing['6'],
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
    opacity: 0.95,
  },
  aiButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  aiButtonText: {
    fontSize: typography.size.base,
    fontFamily: typography.family.bold,
    color: Colors.secondary.lavender,
  },

  // Modal Styles - Glassmorphism
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalBlurContainer: {
    height: '90%',
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...shadows.xl,
  },
  modalContent: {
    flex: 1,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    // padding is now applied dynamically based on screen size
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['6'],
  },
  modalTitle: {
    fontSize: typography.size['2xl'],
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.darkest,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.lighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    flex: 1,
  },
  modalInstructions: {
    backgroundColor: Colors.primary.soft,
    padding: spacing['5'],
    borderRadius: radius.xl,
    marginBottom: spacing['6'],
    borderWidth: 1,
    borderColor: Colors.primary.blush,
  },
  instructionsTitle: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['2'],
  },
  instructionsText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
  },
  modalImagePreview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: spacing['4'],
    ...shadows.md,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalImageLabel: {
    position: 'absolute',
    bottom: spacing['3'],
    left: spacing['3'],
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.lg,
  },
  modalPickButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing['4'],
    ...shadows.md,
  },
  modalGenerateButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing['6'],
    ...shadows.lg,
  },
  modalResult: {
    backgroundColor: Colors.neutral.white,
    padding: spacing['6'],
    borderRadius: radius.xl,
    ...shadows.xl,
  },
  modalResultBadge: {
    alignSelf: 'center',
    backgroundColor: Colors.secondary.lavenderLight,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    marginBottom: spacing['4'],
  },
  modalResultBadgeText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
    color: Colors.secondary.lavender,
  },
  modalResultImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.xl,
    marginBottom: spacing['4'],
  },
  modalResultDescription: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    marginBottom: spacing['6'],
    lineHeight: typography.size.sm * typography.lineHeight.relaxed,
    textAlign: 'center',
  },
  modalResultButtons: {
    gap: spacing['3'],
  },
  modalColorButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.lg,
  },
  modalDownloadButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },

  // Canvas Modal Styles
  canvasModalContainer: {
    flex: 1,
    backgroundColor: Colors.neutral.lighter,
  },
  canvasModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // padding is now applied dynamically based on screen size
    backgroundColor: Colors.neutral.white,
    ...shadows.md,
  },
  canvasModalTitle: {
    fontSize: typography.size['2xl'],
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.darkest,
  },

  // Content Warning Modal Styles
  warningModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4'],
  },
  contentWarningModal: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius['2xl'],
    padding: spacing['6'],
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    ...shadows.xl,
  },
  warningIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 183, 77, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['4'],
  },
  warningTitle: {
    fontSize: typography.size.xl,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['3'],
  },
  warningDescription: {
    fontSize: typography.size.md,
    color: Colors.neutral.dark,
    textAlign: 'center',
    marginBottom: spacing['3'],
    lineHeight: 22,
  },
  concernTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    marginBottom: spacing['4'],
    gap: spacing['2'],
  },
  concernTypeEmoji: {
    fontSize: 20,
  },
  concernTypeLabel: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
  },
  warningDetailBox: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['4'],
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.sunset,
  },
  warningDetailTitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
    color: Colors.neutral.dark,
    marginBottom: spacing['2'],
  },
  warningDetailText: {
    fontSize: typography.size.md,
    color: Colors.neutral.darkest,
    fontFamily: typography.family.medium,
    lineHeight: 20,
  },
  therapeuticBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['4'],
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary.violet,
  },
  therapeuticTitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
    color: Colors.secondary.violet,
    marginBottom: spacing['2'],
  },
  therapeuticText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    lineHeight: 20,
  },
  coloringThemeBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['4'],
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },
  coloringThemeTitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
    color: '#22C55E',
    marginBottom: spacing['2'],
  },
  coloringThemeText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    lineHeight: 20,
  },
  warningInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 160, 122, 0.1)',
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['5'],
    gap: spacing['3'],
  },
  warningInfoText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    lineHeight: 20,
  },
  professionalNoteBox: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderRadius: radius.lg,
    padding: spacing['3'],
    marginBottom: spacing['4'],
    width: '100%',
  },
  professionalNoteText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    lineHeight: 18,
    textAlign: 'center',
  },
  warningButton: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  warningButtonGradient: {
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['6'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningButtonText: {
    color: Colors.neutral.white,
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
  },
});
