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
import { Brain, Camera, ImageIcon } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { PROTOCOLS } from "@/constants/protocols";
import { strings } from "@/i18n/strings";
import { preprocessImage } from "@/utils/imagePreprocess";
import { ResultCard } from "@/components/ResultCard";
import { OverlayEvidence } from "@/components/OverlayEvidence";
import { analyzeDrawingMock } from "@/services/localMock";
import { buildShareText } from "@/services/abTest";
import { pickFromLibrary, captureWithCamera } from "@/services/imagePick";
import type { AssessmentInput, TaskType } from "@/types/AssessmentSchema";

const lang = "tr";

export default function AdvancedAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const [uri, setUri] = useState<string | null>(null);
  const [age, setAge] = useState<string>("7");
  const [task, setTask] = useState<TaskType>("DAP");
  const [quote, setQuote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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

  async function onPickFromLibrary() {
    const selectedUri = await pickFromLibrary();
    if (selectedUri) setUri(selectedUri);
  }

  async function onCaptureWithCamera() {
    const capturedUri = await captureWithCamera();
    if (capturedUri) setUri(capturedUri);
  }

  async function onAnalyze() {
    if (!uri) return;
    setLoading(true);
    try {
      const cleanUri = await preprocessImage(uri);
      const payload: AssessmentInput = {
        app_version: "1.0.0",
        schema_version: "v1.2",
        child: { age: Number(age), grade: "1", context: "serbest" },
        task_type: task,
        image_uri: cleanUri,
        child_quote: quote || undefined,
      };
      const out = await analyzeDrawingMock(payload);
      setResult(out);
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Brain size={32} color="#9333EA" />
          </View>
          <Text style={styles.headerTitle}>{strings[lang].title}</Text>
          <Pressable
            onPress={() => openSheet(task)}
            style={styles.consultButton}
          >
            <Text style={styles.consultButtonText}>
              {strings[lang].expertConsult}
            </Text>
          </Pressable>
        </View>

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
          <Pressable onPress={onPickFromLibrary} style={styles.pickerButton}>
            <ImageIcon size={20} color="#fff" />
            <Text style={styles.pickerButtonText}>Galeriden Seç</Text>
          </Pressable>
          <Pressable onPress={onCaptureWithCamera} style={styles.pickerButton}>
            <Camera size={20} color="#fff" />
            <Text style={styles.pickerButtonText}>Fotoğraf Çek</Text>
          </Pressable>
        </View>

        {/* Image + Overlay */}
        {uri && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri }}
              resizeMode="cover"
              style={styles.image}
            />
            <OverlayEvidence
              width={W - 40}
              height={200}
              features={result?.feature_preview}
            />
          </View>
        )}

        {/* Analyze button */}
        <Pressable
          disabled={!uri || loading}
          onPress={onAnalyze}
          style={[
            styles.analyzeButton,
            (!uri || loading) && styles.buttonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.analyzeButtonText}>
              {strings[lang].analyze}
            </Text>
          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: Colors.secondary.lavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.neutral.darkest,
    marginBottom: 12,
  },
  consultButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  consultButtonText: {
    fontWeight: "700" as const,
    color: "#333",
  },
  testChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  chipActive: {
    backgroundColor: "#0a7",
  },
  chipPressed: {
    backgroundColor: "#ddd",
  },
  chipText: {
    color: "#333",
    fontWeight: "700" as const,
    fontSize: 14,
  },
  chipTextActive: {
    color: "#fff",
  },
  protocolHint: {
    backgroundColor: "#FFF6E5",
    borderLeftWidth: 4,
    borderLeftColor: "#FFA500",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  protocolTitle: {
    fontWeight: "700" as const,
    color: "#A65F00",
    fontSize: 15,
  },
  protocolText: {
    color: "#A65F00",
    marginTop: 4,
    fontSize: 13,
  },
  protocolSubtext: {
    color: "#A65F00",
    marginTop: 4,
    fontSize: 11,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.neutral.dark,
  },
  ageInput: {
    backgroundColor: Colors.neutral.white,
    padding: 10,
    borderRadius: 8,
    minWidth: 60,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  quoteInput: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    minWidth: 150,
  },
  pickerButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  pickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#444",
    padding: 14,
    borderRadius: 12,
  },
  pickerButtonText: {
    color: Colors.neutral.white,
    fontWeight: "700" as const,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  analyzeButton: {
    backgroundColor: "#0a7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: Colors.neutral.white,
    textAlign: "center",
    fontWeight: "700" as const,
    fontSize: 16,
  },
  shareButton: {
    backgroundColor: "#227BE0",
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  shareButtonText: {
    color: Colors.neutral.white,
    textAlign: "center",
    fontWeight: "700" as const,
  },
  disclaimerCard: {
    backgroundColor: "#FDECEC",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  disclaimerTitle: {
    color: "#B00020",
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  disclaimerText: {
    color: "#B00020",
    fontSize: 13,
  },
  tipToast: {
    position: "absolute",
    top: 12,
    left: 16,
    right: 16,
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 12,
  },
  tipTitle: {
    color: "#fff",
    fontWeight: "800" as const,
  },
  tipText: {
    color: "#fff",
    marginTop: 4,
    fontSize: 12,
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    alignSelf: "center",
    borderRadius: 2,
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sheetTitle: {
    fontWeight: "800" as const,
    fontSize: 16,
  },
  sheetSectionTitle: {
    marginTop: 12,
    fontWeight: "700" as const,
    marginBottom: 4,
  },
  sheetListItem: {
    lineHeight: 20,
    marginBottom: 2,
  },
  sheetCloseButton: {
    marginTop: 12,
    alignSelf: "flex-end",
  },
  sheetCloseButtonText: {
    color: "#0a7",
    fontWeight: "700" as const,
  },
});
