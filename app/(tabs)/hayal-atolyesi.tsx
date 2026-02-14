import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import {
  Camera,
  ImagePlus,
  BookOpen,
  Palette,
  Brain,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { layout, typography, spacing, radius, shadows } from '@/constants/design-system';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermissions } from 'expo-camera';
import { showAlert } from '@/lib/platform';

export default function HayalAtolyesiScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark: _isDark } = useTheme();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [_showCamera, _setShowCamera] = useState(false);

  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets?.length) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        showAlert('Kamera İzni', 'Kamera kullanmak için izin vermelisiniz.');
        return;
      }
    }
    // Navigate to camera screen or show camera view
    showAlert('Kamera', 'Kamera özelliği yakında eklenecek!');
  };

  const handleCreateStory = () => {
    if (!selectedImage) {
      showAlert('Görsel Seç', 'Lütfen önce bir çizim yükleyin.');
      return;
    }
    // Navigate to stories with the image
    router.push({
      pathname: '/(tabs)/stories',
      params: { imageUri: selectedImage },
    } as const);
  };

  const handleCreateColoring = () => {
    if (!selectedImage) {
      showAlert('Görsel Seç', 'Lütfen önce bir çizim yükleyin.');
      return;
    }
    // Navigate to studio with the image
    router.push({
      pathname: '/(tabs)/studio',
      params: { imageUri: selectedImage },
    } as const);
  };

  const handleAnalyze = () => {
    if (!selectedImage) {
      showAlert('Görsel Seç', 'Lütfen önce bir çizim yükleyin.');
      return;
    }
    // Navigate to advanced analysis with the image
    router.push({
      pathname: '/(tabs)/analysis',
      params: { imageUri: selectedImage },
    } as const);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <LinearGradient
        colors={[...colors.background.pageGradient] as [string, string, ...string[]]}
        style={[styles.gradientContainer, { paddingTop: insets.top }]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={[colors.secondary.mint, colors.secondary.mintLight] as [string, string]}
              style={styles.headerIcon}
            >
              <Sparkles size={layout.icon.medium} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                🌟 Hayal Atölyesi
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
                Çizimini yükle, hayal et, yarat!
              </Text>
            </View>
          </View>

          {/* Upload Section */}
          <View style={styles.uploadSection}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Çizimini Yükle
            </Text>

            {selectedImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={[styles.imagePreview, { backgroundColor: colors.neutral.lightest }]}
                  contentFit="contain"
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.changeImageButton,
                    { backgroundColor: colors.surface.card },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={[styles.changeImageText, { color: colors.text.primary }]}>
                    Farklı Çizim Seç
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.uploadButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.uploadButton,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={pickImageFromLibrary}
                >
                  <LinearGradient
                    colors={[colors.secondary.mint, colors.secondary.mintLight] as [string, string]}
                    style={styles.uploadButtonGradient}
                  >
                    <ImagePlus size={32} color="#FFFFFF" />
                    <Text style={styles.uploadButtonText}>Galeriden Seç</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.uploadButton,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={takePicture}
                >
                  <LinearGradient
                    colors={[colors.secondary.sky, colors.secondary.skyLight] as [string, string]}
                    style={styles.uploadButtonGradient}
                  >
                    <Camera size={32} color="#FFFFFF" />
                    <Text style={styles.uploadButtonText}>Fotoğraf Çek</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>

          {/* Creation Options */}
          {selectedImage && (
            <View style={styles.optionsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Ne Yaratmak İstersin?
              </Text>

              {/* Story Option */}
              <Pressable
                style={({ pressed }) => [
                  styles.optionCard,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={handleCreateStory}
              >
                <LinearGradient
                  colors={[...colors.cards.story.bg] as [string, string]}
                  style={styles.optionCardGradient}
                >
                  <View style={styles.optionIconContainer}>
                    <BookOpen size={40} color="#FFFFFF" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>📖 AI Masal</Text>
                    <Text style={styles.optionDescription}>
                      Çiziminden ilham alan 5 sayfa hikaye kitabı oluştur
                    </Text>
                    <View style={styles.optionFeatures}>
                      <View style={styles.optionFeature}>
                        <Text style={styles.optionFeatureText}>✨ AI Powered</Text>
                      </View>
                      <View style={styles.optionFeature}>
                        <Text style={styles.optionFeatureText}>📄 PDF</Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={24} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>

              {/* Coloring Option */}
              <Pressable
                style={({ pressed }) => [
                  styles.optionCard,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={handleCreateColoring}
              >
                <LinearGradient
                  colors={[colors.secondary.sky, colors.secondary.skyLight] as [string, string]}
                  style={styles.optionCardGradient}
                >
                  <View style={styles.optionIconContainer}>
                    <Palette size={40} color="#FFFFFF" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>🎨 Boyama Sayfası</Text>
                    <Text style={styles.optionDescription}>
                      {"Çiziminden basitleştirilmiş boyama PDF'i oluştur"}
                    </Text>
                    <View style={styles.optionFeatures}>
                      <View style={styles.optionFeature}>
                        <Text style={styles.optionFeatureText}>🖨️ Yazdırılabilir</Text>
                      </View>
                      <View style={styles.optionFeature}>
                        <Text style={styles.optionFeatureText}>📄 PDF</Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={24} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>

              {/* Analysis Option */}
              <Pressable
                style={({ pressed }) => [
                  styles.optionCard,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={handleAnalyze}
              >
                <LinearGradient
                  colors={
                    [colors.secondary.lavender, colors.secondary.lavenderLight] as [string, string]
                  }
                  style={styles.optionCardGradient}
                >
                  <View style={styles.optionIconContainer}>
                    <Brain size={40} color="#FFFFFF" />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>🔍 Detaylı Analiz</Text>
                    <Text style={styles.optionDescription}>
                      9 farklı projektif test ile derinlemesine analiz
                    </Text>
                    <View style={styles.optionFeatures}>
                      <View style={styles.optionFeature}>
                        <Text style={styles.optionFeatureText}>🧠 Psikolojik</Text>
                      </View>
                      <View style={styles.optionFeature}>
                        <Text style={styles.optionFeatureText}>📊 Raporlu</Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={24} color="#FFFFFF" />
                </LinearGradient>
              </Pressable>
            </View>
          )}

          {/* Info Card */}
          {!selectedImage && (
            <View style={[styles.infoCard, { backgroundColor: colors.surface.card }]}>
              <Text style={[styles.infoTitle, { color: colors.text.primary }]}>💡 İpucu</Text>
              <Text style={[styles.infoText, { color: colors.text.secondary }]}>
                Çocuğunuzun çizimini yükleyin. Ardından istediğiniz yaratıcı içeriği seçin: masal,
                boyama veya detaylı analiz!
              </Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  gradientContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
    paddingVertical: spacing['6'],
  },
  headerIcon: {
    width: layout.icon.mega,
    height: layout.icon.mega,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.size['3xl'],
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.darkest,
    letterSpacing: typography.letterSpacing.tight,
  },
  headerSubtitle: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    marginTop: spacing['1'],
    fontFamily: typography.family.medium,
  },
  sectionTitle: {
    fontSize: typography.size.xl,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['4'],
  },
  // Upload Section
  uploadSection: {
    marginBottom: spacing['6'],
  },
  uploadButtons: {
    gap: spacing['3'],
  },
  uploadButton: {
    borderRadius: radius.xl,
    ...shadows.md,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['4'],
    paddingVertical: spacing['5'],
    paddingHorizontal: spacing['6'],
    borderRadius: radius.xl,
  },
  uploadButtonText: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  imagePreviewContainer: {
    gap: spacing['3'],
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: radius.xl,
    backgroundColor: Colors.neutral.lightest,
  },
  changeImageButton: {
    backgroundColor: Colors.neutral.white,
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  changeImageText: {
    fontSize: typography.size.base,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.dark,
  },
  // Options Section
  optionsSection: {
    marginBottom: spacing['6'],
  },
  optionCard: {
    marginBottom: spacing['4'],
    borderRadius: radius.xl,
    ...shadows.lg,
  },
  optionCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['5'],
    borderRadius: radius.xl,
    gap: spacing['4'],
  },
  optionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    gap: spacing['2'],
  },
  optionTitle: {
    fontSize: typography.size.xl,
    fontFamily: typography.family.bold,
    color: Colors.neutral.white,
  },
  optionDescription: {
    fontSize: typography.size.sm,
    color: Colors.neutral.white,
    opacity: 0.95,
    lineHeight: typography.size.sm * 1.5,
  },
  optionFeatures: {
    flexDirection: 'row',
    gap: spacing['2'],
    marginTop: spacing['1'],
  },
  optionFeature: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing['1'],
    paddingHorizontal: spacing['3'],
    borderRadius: radius.md,
  },
  optionFeatureText: {
    fontSize: typography.size.xs,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },
  // Info Card
  infoCard: {
    backgroundColor: Colors.neutral.white,
    padding: spacing['5'],
    borderRadius: radius.xl,
    ...shadows.sm,
    marginBottom: spacing['6'],
  },
  infoTitle: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['2'],
  },
  infoText: {
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
    lineHeight: typography.size.base * 1.6,
  },
});
