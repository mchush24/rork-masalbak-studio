import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Share,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { ResultCard } from "@/components/ResultCard";
import { OverlayEvidence } from "@/components/OverlayEvidence";
import { analyzeDrawingMock } from "@/services/localMock";
import { pickFromLibrary, captureWithCamera } from "@/services/imagePick";
import { logEvent, buildShareText } from "@/services/abTest";
import { strings, type Language } from "@/i18n/strings";
import type { TaskType, AssessmentInput, AssessmentOutput } from "@/types/AssessmentSchema";
import { Camera, ImageIcon, X, CheckCircle, Share2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function AdvancedAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const [uri, setUri] = useState<string | null>(null);
  const [age, setAge] = useState<string>("7");
  const [task, setTask] = useState<TaskType>("DAP");
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentOutput | null>(null);
  const [lang] = useState<Language>("tr");
  const screenWidth = Dimensions.get('window').width;

  const tasks: { type: TaskType; label: string; description: string }[] = [
    { type: "DAP", label: "Bir İnsan Çiz", description: "Koppitz" },
    { type: "HTP", label: "Ev-Ağaç-İnsan", description: "Buck" },
    { type: "Aile", label: "Aile Çiz", description: "Kinetik" },
    { type: "Kaktus", label: "Kaktüs Testi", description: "Savunma" },
    { type: "Agac", label: "Ağaç Testi", description: "Koch" },
    { type: "Bahce", label: "Bahçe Testi", description: "İlişkiler" },
    { type: "Bender", label: "Bender-Gestalt", description: "Görsel-Motor" },
    { type: "Rey", label: "Rey-Osterrieth", description: "Organizasyon" },
    { type: "Luscher", label: "Lüscher Renk", description: "Duygusal" },
  ];

  async function pickImage() {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    await logEvent('image_pick_gallery', { task });
    const imageUri = await pickFromLibrary();
    
    if (imageUri) {
      setUri(imageUri);
      setResult(null);
    }
  }

  async function openCamera() {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    await logEvent('image_pick_camera', { task });
    const imageUri = await captureWithCamera();
    
    if (imageUri) {
      setUri(imageUri);
      setResult(null);
    } else if (Platform.OS !== 'web') {
      Alert.alert('İzin Gerekli', 'Kamera kullanımı için izin vermeniz gerekiyor.');
    }
  }

  async function onAnalyze() {
    if (!uri) return;
    setLoading(true);

    await logEvent('analyze_click', { task, age });

    try {
      const payload: AssessmentInput = {
        app_version: "1.0.0",
        schema_version: "v1.2",
        child: { age: Number(age), grade: "1", context: "serbest" },
        task_type: task,
        image_uri: uri,
        child_quote: quote || undefined,
      };

      const out = await analyzeDrawingMock(payload);
      setResult(out);
      
      await logEvent('analyze_success', { 
        task, 
        hypotheses_count: out.reflective_hypotheses.length,
        has_safety_flags: out.safety_flags.self_harm || out.safety_flags.abuse_concern,
      });
      
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e: any) {
      console.error(e);
      await logEvent('analyze_error', { task, error: String(e) });
      Alert.alert("Hata", "Analiz sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function resetAnalysis() {
    setUri(null);
    setResult(null);
    logEvent('analysis_reset', { task });
  }

  async function shareResults() {
    if (!result) return;

    const topHypothesis = result.reflective_hypotheses[0];
    if (!topHypothesis) return;

    const shareMessage = buildShareText(
      topHypothesis.confidence,
      topHypothesis.theme
    );

    try {
      await Share.share({
        message: shareMessage,
      });
      await logEvent('share_results', { task });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{strings[lang].title}</Text>
          <Text style={styles.headerSubtitle}>
            {strings[lang].professionalTests}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{strings[lang].selectTestType}</Text>
          <View style={styles.taskGrid}>
            {tasks.map((t) => (
              <Pressable
                key={t.type}
                onPress={() => {
                  setTask(t.type);
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                style={[
                  styles.taskCard,
                  task === t.type && styles.taskCardActive,
                ]}
              >
                {task === t.type && (
                  <View style={styles.taskCheck}>
                    <CheckCircle size={18} color={Colors.primary.coral} />
                  </View>
                )}
                <Text style={[
                  styles.taskLabel,
                  task === t.type && styles.taskLabelActive,
                ]}>
                  {t.label}
                </Text>
                <Text style={styles.taskDescription}>{t.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{strings[lang].childInfo}</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{strings[lang].age}</Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                placeholder="7"
                style={styles.input}
                placeholderTextColor={Colors.neutral.light}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>{strings[lang].childQuote}</Text>
              <TextInput
                value={quote}
                onChangeText={setQuote}
                placeholder={strings[lang].childQuotePlaceholder}
                style={styles.input}
                placeholderTextColor={Colors.neutral.light}
              />
            </View>
          </View>
        </View>

        {!uri ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{strings[lang].selectImage}</Text>
            <View style={styles.actionButtons}>
              <Pressable
                onPress={openCamera}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.cameraButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Camera size={28} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>{strings[lang].takePhoto}</Text>
              </Pressable>

              <Pressable
                onPress={pickImage}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.galleryButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <ImageIcon size={28} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>{strings[lang].pickFromGallery}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.image} />
              <OverlayEvidence 
                width={screenWidth - 40} 
                height={(screenWidth - 40) * 0.75} 
                features={result?.feature_preview}
              />
              <Pressable onPress={resetAnalysis} style={styles.removeButton}>
                <X size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            <Pressable
              disabled={loading}
              onPress={onAnalyze}
              style={[styles.analyzeButton, loading && styles.buttonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.analyzeButtonText}>{strings[lang].analyze}</Text>
              )}
            </Pressable>
          </View>
        )}

        {result && (
          <View style={styles.section}>
            <ResultCard data={result} />
            
            <Pressable onPress={shareResults} style={styles.shareButton}>
              <Share2 size={20} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>{strings[lang].share}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            {strings[lang].infoText}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: Colors.neutral.darkest,
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.neutral.medium,
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.neutral.dark,
    marginBottom: 14,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
  },
  taskGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  taskCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 14,
    padding: 14,
    minWidth: "30%",
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
    position: "relative",
  },
  taskCardActive: {
    borderColor: Colors.primary.coral,
    backgroundColor: Colors.primary.soft,
  },
  taskCheck: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  taskLabel: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.neutral.darkest,
    marginBottom: 4,
  },
  taskLabelActive: {
    color: Colors.primary.coral,
  },
  taskDescription: {
    fontSize: 11,
    color: Colors.neutral.medium,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.neutral.dark,
  },
  input: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.neutral.darkest,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cameraButton: {
    backgroundColor: Colors.primary.coral,
  },
  galleryButton: {
    backgroundColor: Colors.secondary.mint,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.neutral.white,
    letterSpacing: 0.2,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  imageWrapper: {
    position: "relative",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.neutral.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 3,
  },
  removeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  analyzeButton: {
    backgroundColor: Colors.secondary.lavender,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: Colors.secondary.lavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.neutral.white,
    letterSpacing: 0.3,
  },
  infoCard: {
    backgroundColor: "#F0F9FF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#1E40AF",
    textAlign: "center",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.secondary.sky,
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    shadowColor: Colors.secondary.sky,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.neutral.white,
    letterSpacing: 0.3,
  },
});
