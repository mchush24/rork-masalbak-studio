import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Share,
  Dimensions,
  Animated,
  Easing,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Brain, Camera, ImageIcon, Sparkles, TrendingUp, Award, CheckCircle } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import {
  layout,
  typography,
  spacing,
  radius,
  shadows,
} from "@/constants/design-system";
import { PROTOCOLS } from "@/constants/protocols";
import { strings } from "@/i18n/strings";
import { preprocessImage } from "@/utils/imagePreprocess";
import { ResultCard } from "@/components/ResultCard";
import { OverlayEvidence } from "@/components/OverlayEvidence";
import { buildShareText } from "@/services/abTest";
import { pickFromLibrary, captureWithCamera } from "@/services/imagePick";
import type { AssessmentInput, TaskType } from "@/types/AssessmentSchema";
import { trpc } from "@/lib/trpc";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";

const lang = "tr";

export default function AdvancedAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const [uri, setUri] = useState<string | null>(null);
  const [imageHeight, setImageHeight] = useState<number>(300);
  const [age, setAge] = useState<string>("7");
  const [task, setTask] = useState<TaskType>("DAP");
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // tRPC mutation for analysis
  const analyzeMutation = trpc.studio.analyzeDrawing.useMutation();

  const [sheetTask, setSheetTask] = useState<TaskType>("DAP");
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const [tip, setTip] = useState<{ title: string; text: string } | null>(null);
  const tipOpacity = useRef(new Animated.Value(0)).current;

  function openSheet(forTask: TaskType) {
    setSheetTask(forTask);
    setSheetOpen(true);
    Animated.timing(sheetAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  }

  function closeSheet() {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.in(Easing.cubic),
    }).start(({ finished }) => {
      if (finished) setSheetOpen(false);
    });
  }

  function showTip(title: string, text: string) {
    setTip({ title, text });
    Animated.timing(tipOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(tipOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start(() => setTip(null));
      }, 1400);
    });
  }

  function calculateImageHeight(imageUri: string) {
    const screenWidth = Dimensions.get("window").width - 40;
    const screenHeight = Dimensions.get("window").height;

    console.log("[ImageHeight] 📐 Screen dimensions:", {
      screenWidth,
      screenHeight,
    });

    Image.getSize(
      imageUri,
      (width, height) => {
        console.log("[ImageHeight] 🖼️ Original image dimensions:", { width, height });

        const aspectRatio = height / width;
        const calculatedHeight = screenWidth * aspectRatio;

        // For drawing analysis, we need to see the FULL image
        // Most child drawings are vertical (portrait orientation)
        // Use the full calculated height to preserve aspect ratio and show entire drawing
        const finalHeight = calculatedHeight;

        console.log("[ImageHeight] 📊 Calculated dimensions:", {
          aspectRatio: aspectRatio.toFixed(2),
          calculatedHeight: calculatedHeight.toFixed(0),
          finalHeight: finalHeight.toFixed(0),
          willScroll: calculatedHeight > screenHeight * 0.6
        });

        setImageHeight(finalHeight);
      },
      (error) => {
        console.error("[ImageHeight] ❌ Error getting image size:", error);
        setImageHeight(600); // Increased fallback for better visibility
      }
    );
  }

  async function onPickFromLibrary() {
    const selectedUri = await pickFromLibrary();
    if (selectedUri) {
      setUri(selectedUri);
      calculateImageHeight(selectedUri);
    }
  }

  async function onCaptureWithCamera() {
    const capturedUri = await captureWithCamera();
    if (capturedUri) {
      setUri(capturedUri);
      calculateImageHeight(capturedUri);
    }
  }

  async function onAnalyze() {
    if (!uri) return;
    setLoading(true);
    try {
      const cleanUri = await preprocessImage(uri);

      // Convert image to base64
      let imageBase64: string;
      if (Platform.OS === "web") {
        if (cleanUri.startsWith("data:")) {
          imageBase64 = cleanUri.split(",")[1];
        } else {
          const response = await fetch(cleanUri);
          const blob = await response.blob();
          imageBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = reader.result as string;
              const base64Data = base64String.split(",")[1];
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      } else {
        let fileUri = cleanUri;
        if (!fileUri.startsWith("file://") && !fileUri.startsWith("content://")) {
          fileUri = `file://${fileUri}`;
        }
        imageBase64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: "base64",
        });
      }

      // Call backend via tRPC
      const backendResult = await analyzeMutation.mutateAsync({
        taskType: task,
        childAge: Number(age),
        imageBase64: imageBase64,
        language: "tr",
        userRole: "parent",
        featuresJson: {},
      });

      // Transform backend response to match AssessmentOutput schema expected by ResultCard
      const transformedResult = {
        task_type: task,
        reflective_hypotheses: backendResult.insights.map((insight: any) => ({
          theme: insight.title,
          confidence: insight.strength === "strong" ? 0.8 : insight.strength === "moderate" ? 0.6 : 0.4,
          evidence: insight.evidence,
        })),
        conversation_prompts: backendResult.conversationGuide?.openingQuestions || [
          "Bu çizimde neler oluyor?",
          "En sevdiğin kısım neresi?",
        ],
        activity_ideas: backendResult.homeTips.flatMap((tip: any) => tip.steps),
        safety_flags: {
          self_harm: backendResult.riskFlags.some((flag: any) => flag.type === "self_harm"),
          abuse_concern: backendResult.riskFlags.some((flag: any) =>
            flag.type === "harm_others" || flag.type === "sexual_inappropriate"
          ),
        },
        disclaimers: [backendResult.disclaimer],
        feature_preview: undefined,
      };

      setResult(transformedResult);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Bilinmeyen bir hata oluştu";
      Alert.alert("Hata", errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function onSelectTaskShort(t: TaskType) {
    setTask(t);
    openSheet(t);
  }

  function onSelectTaskLong(t: TaskType) {
    const p = PROTOCOLS[t];
    showTip(p.title, `${p.steps[0]}  /  ${p.donts[0]}`);
  }

  async function onShare() {
    if (!result) return;
    try {
      const top = result.reflective_hypotheses?.[0];
      const text = buildShareText(
        top?.confidence || 0.6,
        top?.theme?.replaceAll("_", " ") || "nazik ipucu"
      );
      await Share.share({ message: text });
    } catch (e) {
      console.log(e);
    }
  }

  const W = Dimensions.get("window").width;
  const H = Dimensions.get("window").height;
  const sheetHeight = Math.min(420, H * 0.58);
  const translateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetHeight + 24, 0],
  });
  const overlayOpacity = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.background.analysis as any}
        style={styles.gradientContainer}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with gradient icon */}
          <View style={styles.header}>
            <LinearGradient
              colors={[Colors.cards.analysis.icon, Colors.secondary.sky]}
              style={styles.headerIcon}
            >
              <Brain size={layout.icon.medium} color={Colors.neutral.white} />
            </LinearGradient>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{strings[lang].title}</Text>
              <Text style={styles.headerSubtitle}>Çocuk psikolojisi uzmanı desteğiyle</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <LinearGradient
              colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
              style={styles.statCard}
            >
              <TrendingUp size={24} color={Colors.neutral.white} />
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statLabel}>Doğruluk</Text>
            </LinearGradient>

            <LinearGradient
              colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
              style={styles.statCard}
            >
              <Award size={24} color={Colors.neutral.white} />
              <Text style={styles.statNumber}>9+</Text>
              <Text style={styles.statLabel}>Test Türü</Text>
            </LinearGradient>

            <LinearGradient
              colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
              style={styles.statCard}
            >
              <CheckCircle size={24} color={Colors.neutral.white} />
              <Text style={styles.statNumber}>∞</Text>
              <Text style={styles.statLabel}>Analiz</Text>
            </LinearGradient>
          </View>

          {/* Consult Button */}
          <Pressable
            onPress={() => openSheet(task)}
            style={({ pressed }) => [
              styles.consultButton,
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            <LinearGradient
              colors={[Colors.cards.analysis.icon, Colors.secondary.sky]}
              style={styles.consultButtonGradient}
            >
              <Sparkles size={20} color={Colors.neutral.white} />
              <Text style={styles.consultButtonText}>
                {strings[lang].expertConsult}
              </Text>
            </LinearGradient>
          </Pressable>

        {/* Test selection chips */}
        <View style={styles.testChips}>
          {(
            [
              "DAP",
              "HTP",
              "Aile",
              "Kaktus",
              "Agac",
              "Bahce",
              "Bender",
              "Rey",
              "Luscher",
            ] as TaskType[]
          ).map((t) => (
            <Pressable
              key={t}
              onPress={() => onSelectTaskShort(t)}
              onLongPress={() => onSelectTaskLong(t)}
              style={({ pressed }) => [
                styles.chip,
                task === t && styles.chipActive,
                pressed && styles.chipPressed,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  task === t && styles.chipTextActive,
                ]}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Protocol hint */}
        <View style={styles.protocolHint}>
          <Text style={styles.protocolTitle}>{PROTOCOLS[task].title}</Text>
          <Text style={styles.protocolText}>
            {PROTOCOLS[task].steps[0]} — {PROTOCOLS[task].steps[1] || ""}
          </Text>
          <Text style={styles.protocolSubtext}>
            (Detay için test adına dokun: protokol alttan açılır • uzun bas:
            hızlı ipucu)
          </Text>
        </View>

        {/* Age and quote */}
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Yaş:</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            style={styles.ageInput}
          />
          <Text style={styles.inputLabel}>Çocuk sözü:</Text>
          <TextInput
            value={quote}
            onChangeText={setQuote}
            placeholder="Bu ben ve annem…"
            style={styles.quoteInput}
          />
        </View>

          {/* Image picker buttons */}
          <View style={styles.pickerButtons}>
            <Pressable
              onPress={onPickFromLibrary}
              style={({ pressed }) => [
                styles.pickerButtonWrapper,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                style={styles.pickerButton}
              >
                <ImageIcon size={24} color={Colors.neutral.white} />
                <Text style={styles.pickerButtonText}>Galeriden Seç</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={onCaptureWithCamera}
              style={({ pressed }) => [
                styles.pickerButtonWrapper,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={[Colors.neutral.medium, Colors.neutral.dark]}
                style={styles.pickerButton}
              >
                <Camera size={24} color={Colors.neutral.white} />
                <Text style={styles.pickerButtonText}>Fotoğraf Çek</Text>
              </LinearGradient>
            </Pressable>
          </View>

        {/* Image + Overlay */}
        {uri && (
          <View style={[styles.imageContainer, { height: imageHeight }]}>
            <Image
              source={{ uri }}
              resizeMode="contain"
              style={[styles.image, { height: imageHeight }]}
              onLoad={() => console.log("[Image] Full image loaded successfully")}
              onError={(error) => console.error("[Image] Error loading image:", error)}
            />
            <OverlayEvidence
              width={W - 40}
              height={imageHeight}
              features={result?.feature_preview}
            />
          </View>
        )}

          {/* Analyze button */}
          <Pressable
            disabled={!uri || loading}
            onPress={onAnalyze}
            style={({ pressed }) => [
              styles.analyzeButtonWrapper,
              (!uri || loading) && styles.buttonDisabled,
              pressed && !(!uri || loading) && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            <LinearGradient
              colors={[Colors.cards.analysis.icon, Colors.secondary.sky]}
              style={styles.analyzeButton}
            >
              {loading ? (
                <ActivityIndicator color={Colors.neutral.white} />
              ) : (
                <>
                  <Sparkles size={24} color={Colors.neutral.white} />
                  <Text style={styles.analyzeButtonText}>
                    {strings[lang].analyze}
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

        {/* Result card + Share */}
        {result && (
          <>
            <ResultCard data={result} onDetails={() => {}} />
            <Pressable onPress={onShare} style={styles.shareButton}>
              <Text style={styles.shareButtonText}>Paylaş</Text>
            </Pressable>
            <View style={styles.disclaimerCard}>
              <Text style={styles.disclaimerTitle}>Uyarı</Text>
              <Text style={styles.disclaimerText}>
                {strings[lang].disclaimer}
              </Text>
            </View>
          </>
        )}
        </ScrollView>
      </LinearGradient>

      {/* Quick tip toast */}
      {tip && (
        <Animated.View
          style={[styles.tipToast, { opacity: tipOpacity }]}
        >
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <Text style={styles.tipText}>{tip.text}</Text>
        </Animated.View>
      )}

      {/* Bottom sheet overlay */}
      {sheetOpen && (
        <>
          <Pressable
            onPress={closeSheet}
            style={styles.sheetOverlayTouchable}
          >
            <Animated.View
              style={[
                styles.sheetOverlay,
                { opacity: overlayOpacity },
              ]}
            />
          </Pressable>
          <Animated.View
            style={[
              styles.sheet,
              { height: sheetHeight, transform: [{ translateY }] },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Brain size={22} color="#0a7" />
              <Text style={styles.sheetTitle}>
                {PROTOCOLS[sheetTask].title}
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sheetSectionTitle}>Adımlar:</Text>
              {PROTOCOLS[sheetTask].steps.map((s, i) => (
                <Text key={i} style={styles.sheetListItem}>
                  • {s}
                </Text>
              ))}
              <Text style={styles.sheetSectionTitle}>Yapma:</Text>
              {PROTOCOLS[sheetTask].donts.map((d, i) => (
                <Text key={i} style={styles.sheetListItem}>
                  × {d}
                </Text>
              ))}
              {PROTOCOLS[sheetTask].captureHints?.length ? (
                <>
                  <Text style={styles.sheetSectionTitle}>
                    Fotoğraf İpucu:
                  </Text>
                  {PROTOCOLS[sheetTask].captureHints!.map((c, i) => (
                    <Text key={i} style={styles.sheetListItem}>
                      • {c}
                    </Text>
                  ))}
                </>
              ) : null}
            </ScrollView>
            <Pressable onPress={closeSheet} style={styles.sheetCloseButton}>
              <Text style={styles.sheetCloseButtonText}>Kapat</Text>
            </Pressable>
          </Animated.View>
        </>
      )}
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing["6"],
    gap: spacing["4"],
  },
  headerIcon: {
    width: layout.icon.mega,
    height: layout.icon.mega,
    borderRadius: radius.xl,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.lg,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["1"],
    letterSpacing: typography.letterSpacing.tight,
  },
  headerSubtitle: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing["3"],
    marginBottom: spacing["5"],
  },
  statCard: {
    flex: 1,
    padding: spacing["4"],
    borderRadius: radius.lg,
    alignItems: "center",
    gap: spacing["2"],
  },
  statNumber: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.white,
  },
  statLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.white,
    opacity: 0.9,
  },
  consultButton: {
    marginBottom: spacing["4"],
  },
  consultButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    paddingVertical: spacing["3"],
    paddingHorizontal: spacing["5"],
    borderRadius: radius.lg,
  },
  consultButtonText: {
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
    fontSize: typography.size.md,
  },
  testChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing["2"],
    marginBottom: spacing["4"],
  },
  chip: {
    paddingVertical: spacing["2"],
    paddingHorizontal: spacing["3"],
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.lightest,
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  chipActive: {
    backgroundColor: Colors.cards.analysis.icon,
    borderColor: Colors.cards.analysis.icon,
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipText: {
    color: Colors.neutral.darkest,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.sm,
  },
  chipTextActive: {
    color: Colors.neutral.white,
  },
  protocolHint: {
    backgroundColor: Colors.semantic.warningBg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.semantic.warning,
    padding: spacing["3"],
    borderRadius: radius.md,
    marginBottom: spacing["4"],
  },
  protocolTitle: {
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    fontSize: typography.size.base,
  },
  protocolText: {
    color: Colors.neutral.dark,
    marginTop: spacing["1"],
    fontSize: typography.size.sm,
  },
  protocolSubtext: {
    color: Colors.neutral.medium,
    marginTop: spacing["1"],
    fontSize: typography.size.xs,
    fontStyle: "italic",
  },
  inputRow: {
    flexDirection: "row",
    gap: spacing["2"],
    alignItems: "center",
    marginBottom: spacing["4"],
    flexWrap: "wrap",
  },
  inputLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
  },
  ageInput: {
    backgroundColor: Colors.neutral.white,
    padding: spacing["3"],
    borderRadius: radius.md,
    minWidth: 60,
    borderWidth: 2,
    borderColor: Colors.cards.analysis.border,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
  },
  quoteInput: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    padding: spacing["3"],
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: Colors.cards.analysis.border,
    minWidth: 150,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
  },
  pickerButtons: {
    flexDirection: "row",
    gap: spacing["3"],
    marginBottom: spacing["4"],
  },
  pickerButtonWrapper: {
    flex: 1,
  },
  pickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    padding: spacing["4"],
    borderRadius: radius.lg,
  },
  pickerButtonText: {
    color: Colors.neutral.white,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  imageContainer: {
    position: "relative",
    marginBottom: spacing["4"],
    width: "100%",
    borderRadius: radius.lg,
    // Removed overflow: "hidden" to ensure full image is visible for analysis
    // overflow: "hidden",
    ...shadows.md,
  },
  image: {
    width: "100%",
    borderRadius: radius.lg,
  },
  analyzeButtonWrapper: {
    marginBottom: spacing["4"],
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    padding: spacing["4"],
    borderRadius: radius.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: Colors.neutral.white,
    textAlign: "center",
    fontWeight: typography.weight.bold,
    fontSize: typography.size.md,
  },
  shareButton: {
    backgroundColor: Colors.secondary.sky,
    padding: spacing["4"],
    borderRadius: radius.lg,
    marginTop: spacing["4"],
    marginBottom: spacing["2"],
    ...shadows.md,
  },
  shareButtonText: {
    color: Colors.neutral.white,
    textAlign: "center",
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
  disclaimerCard: {
    backgroundColor: Colors.semantic.errorBg,
    padding: spacing["3"],
    borderRadius: radius.md,
    marginTop: spacing["2"],
    marginBottom: spacing["5"],
    borderLeftWidth: 4,
    borderLeftColor: Colors.semantic.error,
  },
  disclaimerTitle: {
    color: Colors.semantic.error,
    fontWeight: typography.weight.bold,
    marginBottom: spacing["1"],
    fontSize: typography.size.base,
  },
  disclaimerText: {
    color: Colors.semantic.error,
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.normal * typography.size.sm,
  },
  tipToast: {
    position: "absolute",
    top: spacing["3"],
    left: spacing["4"],
    right: spacing["4"],
    backgroundColor: Colors.neutral.darkest,
    borderRadius: radius.lg,
    padding: spacing["3"],
    ...shadows.xl,
  },
  tipTitle: {
    color: Colors.neutral.white,
    fontWeight: typography.weight.extrabold,
    fontSize: typography.size.base,
  },
  tipText: {
    color: Colors.neutral.white,
    marginTop: spacing["1"],
    fontSize: typography.size.sm,
  },
  sheetOverlayTouchable: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: "#000",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: radius["2xl"],
    borderTopRightRadius: radius["2xl"],
    padding: spacing["4"],
    ...shadows.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral.lighter,
    alignSelf: "center",
    borderRadius: radius.sm,
    marginBottom: spacing["3"],
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
    marginBottom: spacing["3"],
  },
  sheetTitle: {
    fontWeight: typography.weight.extrabold,
    fontSize: typography.size.lg,
    color: Colors.neutral.darkest,
  },
  sheetSectionTitle: {
    marginTop: spacing["3"],
    fontWeight: typography.weight.bold,
    marginBottom: spacing["2"],
    fontSize: typography.size.base,
    color: Colors.neutral.darkest,
  },
  sheetListItem: {
    lineHeight: typography.lineHeight.normal * typography.size.base,
    marginBottom: spacing["1"],
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
  },
  sheetCloseButton: {
    marginTop: spacing["3"],
    alignSelf: "flex-end",
    paddingVertical: spacing["2"],
    paddingHorizontal: spacing["4"],
    backgroundColor: Colors.cards.analysis.icon,
    borderRadius: radius.md,
  },
  sheetCloseButtonText: {
    color: Colors.neutral.white,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.base,
  },
});
