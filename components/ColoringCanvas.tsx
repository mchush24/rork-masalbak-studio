import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  Text,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { Svg, Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { spacing, radius, shadows, typography } from "@/constants/design-system";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import { ArrowLeft, X, Undo, Redo } from "lucide-react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const TOOL_PANEL_WIDTH = 100;
const CANVAS_SIZE = Math.min(SCREEN_WIDTH - TOOL_PANEL_WIDTH - 48, SCREEN_HEIGHT - 180);

type ColoringCanvasProps = {
  backgroundImage: string;
  onSave?: (paths: PathData[]) => void;
  onClose?: () => void;
};

type PathData = {
  id: string;
  x: number;
  y: number;
  color: string;
  radius: number;
};

type ColorPalette = {
  id: string;
  type: "solid" | "gradient";
  colors: string[];
  name: string;
  emoji?: string;
};

// 🎨 EXTENDED COLOR PALETTES - Solid + Gradients
const COLOR_PALETTES: ColorPalette[] = [
  // Solid colors
  { id: "red", type: "solid", colors: ["#FF6B6B"], name: "Kırmızı", emoji: "🔴" },
  { id: "orange", type: "solid", colors: ["#FFA500"], name: "Turuncu", emoji: "🟠" },
  { id: "yellow", type: "solid", colors: ["#FFD93D"], name: "Sarı", emoji: "🟡" },
  { id: "green", type: "solid", colors: ["#6BCB77"], name: "Yeşil", emoji: "🟢" },
  { id: "blue", type: "solid", colors: ["#4D96FF"], name: "Mavi", emoji: "🔵" },
  { id: "purple", type: "solid", colors: ["#9D4EDD"], name: "Mor", emoji: "🟣" },
  { id: "pink", type: "solid", colors: ["#FF69B4"], name: "Pembe", emoji: "💗" },
  { id: "brown", type: "solid", colors: ["#8B4513"], name: "Kahverengi", emoji: "🟤" },

  // Gradient patterns
  { id: "rainbow", type: "gradient", colors: ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#9D4EDD"], name: "Gökkuşağı", emoji: "🌈" },
  { id: "sunset", type: "gradient", colors: ["#FF6B6B", "#FFA500", "#FFD93D"], name: "Gün Batımı", emoji: "🌅" },
  { id: "ocean", type: "gradient", colors: ["#4D96FF", "#00CED1", "#20B2AA"], name: "Okyanus", emoji: "🌊" },
  { id: "forest", type: "gradient", colors: ["#228B22", "#6BCB77", "#90EE90"], name: "Orman", emoji: "🌲" },
  { id: "fire", type: "gradient", colors: ["#FF4500", "#FF6347", "#FFA500"], name: "Ateş", emoji: "🔥" },
  { id: "candy", type: "gradient", colors: ["#FF69B4", "#FFB6C1", "#FFC0CB"], name: "Şeker", emoji: "🍬" },
];

// Sabit, büyük dolgu boyutu
const FILL_RADIUS = 80;

export function ColoringCanvas({ backgroundImage, onSave, onClose }: ColoringCanvasProps) {
  // History management for undo/redo
  const [history, setHistory] = useState<PathData[][]>([[]]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(COLOR_PALETTES[0]);
  const [isSaving, setIsSaving] = useState(false);

  const canvasRef = useRef<View>(null);

  const fills = history[currentIndex] || [];

  // Add new fill with history tracking
  const addFill = (newFill: PathData) => {
    const newFills = [...fills, newFill];
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newFills);
    setHistory(newHistory);
    setCurrentIndex(currentIndex + 1);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleClear = () => {
    Alert.alert(
      "Tümünü Sil?",
      "Tüm boyamalar silinecek. Emin misin?",
      [
        { text: "Hayır", style: "cancel" },
        {
          text: "Evet, Sil",
          style: "destructive",
          onPress: () => {
            setHistory([[]]);
            setCurrentIndex(0);
          },
        },
      ]
    );
  };

  // Universal touch handler
  const handlePressablePress = (evt: any) => {
    const touch = evt.nativeEvent;

    if (Platform.OS === 'web') {
      const target = evt.currentTarget;
      if (target) {
        const rect = target.getBoundingClientRect?.();
        if (rect) {
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          handleTap(x, y);
        }
      }
    } else {
      const { locationX, locationY } = touch;
      if (locationX !== undefined && locationY !== undefined) {
        handleTap(locationX, locationY);
      }
    }
  };

  const handleTap = (x: number, y: number) => {
    console.log(`[ColoringCanvas] 🎨 Tap at (${Math.round(x)}, ${Math.round(y)}) - Palette: ${selectedPalette.name}`);

    // Determine color from palette
    let fillColor: string;
    if (selectedPalette.type === "solid") {
      fillColor = selectedPalette.colors[0];
    } else {
      // For gradients, pick a random color from the gradient
      const randomIndex = Math.floor(Math.random() * selectedPalette.colors.length);
      fillColor = selectedPalette.colors[randomIndex];
    }

    const newFill: PathData = {
      id: `fill-${Date.now()}-${Math.random()}`,
      x,
      y,
      color: fillColor,
      radius: FILL_RADIUS,
    };

    addFill(newFill);
  };

  const handleSaveImage = async () => {
    try {
      setIsSaving(true);

      if (Platform.OS !== "web") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("İzin Gerekli", "Galeriye kaydetmek için izin gerekiyor.");
          return;
        }
      }

      if (!canvasRef.current) {
        Alert.alert("Hata", "Canvas bulunamadı");
        return;
      }

      const uri = await captureRef(canvasRef, {
        format: "png",
        quality: 1,
      });

      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = uri;
        link.download = `boyama-${Date.now()}.png`;
        link.click();
      } else {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("✅ Kaydedildi!", "Boyama sayfan galeriye kaydedildi.");
      }

      if (onSave) {
        onSave(fills);
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Hata", "Kaydetme sırasında bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Wooden Frame Effect */}
      <LinearGradient
        colors={["#8B4513", "#A0522D", "#8B4513"]}
        style={styles.frameContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.contentContainer}>
          {/* Canvas Area */}
          <View style={styles.canvasArea}>
            <View style={styles.canvasContainer} ref={canvasRef} collapsable={false}>
              <Image
                source={{ uri: backgroundImage }}
                style={styles.backgroundImage}
                resizeMode="contain"
              />
              <Pressable
                style={styles.canvas}
                onPress={handlePressablePress}
              >
                <Svg height={CANVAS_SIZE} width={CANVAS_SIZE} pointerEvents="none">
                  {fills.map((fill) => (
                    <Circle
                      key={fill.id}
                      cx={fill.x}
                      cy={fill.y}
                      r={fill.radius}
                      fill={fill.color}
                      opacity={0.6}
                    />
                  ))}
                </Svg>
              </Pressable>
            </View>
          </View>

          {/* Right Tool Panel */}
          <View style={styles.toolPanel}>
            {/* Top Actions */}
            <View style={styles.topActions}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.toolButton,
                  styles.backButton,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <ArrowLeft size={24} color={Colors.neutral.white} />
              </Pressable>

              <Pressable
                onPress={handleClear}
                disabled={fills.length === 0}
                style={({ pressed }) => [
                  styles.toolButton,
                  styles.closeButton,
                  fills.length === 0 && styles.toolButtonDisabled,
                  pressed && fills.length > 0 && { opacity: 0.8 },
                ]}
              >
                <X size={24} color={Colors.neutral.white} />
              </Pressable>
            </View>

            {/* Color Palettes - Scrollable */}
            <ScrollView
              style={styles.paletteScroll}
              contentContainerStyle={styles.paletteContainer}
              showsVerticalScrollIndicator={false}
            >
              {COLOR_PALETTES.map((palette) => (
                <Pressable
                  key={palette.id}
                  onPress={() => setSelectedPalette(palette)}
                  style={({ pressed }) => [
                    styles.paletteButton,
                    selectedPalette.id === palette.id && styles.paletteButtonSelected,
                    pressed && { transform: [{ scale: 0.95 }] },
                  ]}
                >
                  {palette.type === "solid" ? (
                    <View
                      style={[
                        styles.paletteColorBox,
                        { backgroundColor: palette.colors[0] },
                      ]}
                    />
                  ) : (
                    <LinearGradient
                      colors={palette.colors as [string, string, ...string[]]}
                      style={styles.paletteColorBox}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                  )}
                  {selectedPalette.id === palette.id && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedCheck}>✓</Text>
                    </View>
                  )}
                </Pressable>
              ))}
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
              <Pressable
                onPress={handleUndo}
                disabled={currentIndex === 0}
                style={({ pressed }) => [
                  styles.toolButton,
                  styles.undoButton,
                  currentIndex === 0 && styles.toolButtonDisabled,
                  pressed && currentIndex > 0 && { opacity: 0.8 },
                ]}
              >
                <Undo size={24} color={Colors.neutral.white} />
              </Pressable>

              <Pressable
                onPress={handleRedo}
                disabled={currentIndex === history.length - 1}
                style={({ pressed }) => [
                  styles.toolButton,
                  styles.redoButton,
                  currentIndex === history.length - 1 && styles.toolButtonDisabled,
                  pressed && currentIndex < history.length - 1 && { opacity: 0.8 },
                ]}
              >
                <Redo size={24} color={Colors.neutral.white} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Save Button - Bottom Center */}
        <Pressable
          onPress={handleSaveImage}
          disabled={fills.length === 0 || isSaving}
          style={({ pressed }) => [
            styles.saveButton,
            (fills.length === 0 || isSaving) && styles.saveButtonDisabled,
            pressed && fills.length > 0 && !isSaving && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
        >
          <LinearGradient
            colors={fills.length === 0 || isSaving ? ["#ccc", "#aaa"] : ["#6BCB77", "#4CAF50"]}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "💾 Kaydediliyor..." : "💾 Kaydet ve Paylaş"}
            </Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2C1810", // Dark wood background
  },
  frameContainer: {
    flex: 1,
    padding: spacing["4"],
    borderRadius: radius.xl,
    margin: spacing["2"],
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
    gap: spacing["3"],
  },

  // Canvas Area
  canvasArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  canvasContainer: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: Colors.neutral.white,
    ...shadows.xl,
    borderWidth: 4,
    borderColor: "#654321", // Darker wood border
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  canvas: {
    width: "100%",
    height: "100%",
  },

  // Tool Panel (Right Side)
  toolPanel: {
    width: TOOL_PANEL_WIDTH,
    backgroundColor: "#654321",
    borderRadius: radius.xl,
    padding: spacing["2"],
    gap: spacing["3"],
    ...shadows.lg,
  },
  topActions: {
    gap: spacing["2"],
  },
  bottomActions: {
    gap: spacing["2"],
  },
  toolButton: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.md,
  },
  backButton: {
    backgroundColor: "#4D96FF", // Blue
  },
  closeButton: {
    backgroundColor: "#FF6B6B", // Red
  },
  undoButton: {
    backgroundColor: "#4D96FF", // Blue
  },
  redoButton: {
    backgroundColor: "#FFA500", // Orange
  },
  toolButtonDisabled: {
    backgroundColor: "#888",
    opacity: 0.4,
  },

  // Color Palette Scroll
  paletteScroll: {
    flex: 1,
  },
  paletteContainer: {
    gap: spacing["2"],
    paddingVertical: spacing["2"],
  },
  paletteButton: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paletteButtonSelected: {
    borderColor: Colors.neutral.white,
    borderWidth: 3,
    ...shadows.lg,
  },
  paletteColorBox: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  selectedCheck: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.neutral.white,
  },

  // Save Button
  saveButton: {
    marginTop: spacing["3"],
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.xl,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    paddingVertical: spacing["4"],
    paddingHorizontal: spacing["6"],
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.white,
  },
});
