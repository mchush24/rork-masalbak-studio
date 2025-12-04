import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  Image,
  Pressable,
  Text,
  ScrollView,
  Alert,
  Share,
  Platform,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { spacing, radius, shadows, typography } from "@/constants/design-system";
import { Eraser, Undo, RotateCcw, Palette, Download, Share2, Paintbrush, Droplet } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

type DrawMode = 'brush' | 'fill';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CANVAS_SIZE = SCREEN_WIDTH - 32;

type ColoringCanvasProps = {
  backgroundImage: string;
  onSave?: (paths: PathData[]) => void;
};

type PathData = {
  path: string;
  color: string;
  width: number;
};

type FillArea = {
  x: number;
  y: number;
  color: string;
};

const COLORS = [
  // Temel Renkler
  { name: "Kırmızı", color: "#FF6B6B" },
  { name: "Turuncu", color: "#FFA500" },
  { name: "Sarı", color: "#FFD93D" },
  { name: "Yeşil", color: "#6BCB77" },
  { name: "Mavi", color: "#4D96FF" },
  { name: "Mor", color: "#9D4EDD" },
  { name: "Pembe", color: "#FF69B4" },
  { name: "Kahverengi", color: "#8B4513" },

  // Ek Renkler
  { name: "Açık Mavi", color: "#87CEEB" },
  { name: "Turkuaz", color: "#40E0D0" },
  { name: "Lavanta", color: "#E6E6FA" },
  { name: "Mercan", color: "#FF7F50" },
  { name: "Altın", color: "#FFD700" },
  { name: "Gümüş", color: "#C0C0C0" },
  { name: "Koyu Yeşil", color: "#006400" },
  { name: "Koyu Mavi", color: "#00008B" },
  { name: "Bordo", color: "#800020" },
  { name: "Siyah", color: "#2D3748" },
  { name: "Gri", color: "#808080" },
  { name: "Beyaz", color: "#FFFFFF" },
];

const BRUSH_SIZES = [
  { size: 3, label: "İnce" },
  { size: 8, label: "Orta" },
  { size: 15, label: "Kalın" },
];

export function ColoringCanvas({ backgroundImage, onSave }: ColoringCanvasProps) {
  const [paths, setPaths] = useState<PathData[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].color);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].size);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [drawMode, setDrawMode] = useState<DrawMode>('brush');
  const [fillAreas, setFillAreas] = useState<FillArea[]>([]);

  const canvasRef = useRef<View>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => drawMode === 'brush',
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;

        if (drawMode === 'fill') {
          // Tap-to-fill mode
          handleFillArea(locationX, locationY);
        } else {
          // Brush mode
          setCurrentPath(`M ${locationX} ${locationY}`);
        }
      },
      onPanResponderMove: (evt) => {
        if (drawMode === 'brush') {
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath((prev) => `${prev} L ${locationX} ${locationY}`);
        }
      },
      onPanResponderRelease: () => {
        if (drawMode === 'brush' && currentPath) {
          setPaths([
            ...paths,
            {
              path: currentPath,
              color: selectedColor,
              width: brushSize,
            },
          ]);
          setCurrentPath("");
        }
      },
    })
  ).current;

  const handleFillArea = (x: number, y: number) => {
    // Simulated fill: Create a large circle at tap location
    // In a real implementation, this would use flood fill algorithm
    const radius = 50; // Fill radius
    const circlePath = `
      M ${x} ${y}
      m -${radius}, 0
      a ${radius},${radius} 0 1,0 ${radius * 2},0
      a ${radius},${radius} 0 1,0 -${radius * 2},0
    `;

    setPaths([
      ...paths,
      {
        path: circlePath,
        color: selectedColor,
        width: radius * 2,
      },
    ]);

    // Also add to fill areas for tracking
    setFillAreas([...fillAreas, { x, y, color: selectedColor }]);
  };

  const handleUndo = () => {
    if (paths.length > 0) {
      setPaths(paths.slice(0, -1));
    }
    if (fillAreas.length > 0) {
      setFillAreas(fillAreas.slice(0, -1));
    }
  };

  const handleClear = () => {
    Alert.alert(
      "Tümünü Temizle?",
      "Tüm boyamalar silinecek. Emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Temizle",
          style: "destructive",
          onPress: () => {
            setPaths([]);
            setFillAreas([]);
          },
        },
      ]
    );
  };

  const handleSaveImage = async () => {
    try {
      setIsSaving(true);

      // Request permissions
      if (Platform.OS !== "web") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("İzin Gerekli", "Galeriye kaydetmek için izin gerekiyor.");
          return;
        }
      }

      // Capture the canvas
      if (!canvasRef.current) {
        Alert.alert("Hata", "Canvas bulunamadı");
        return;
      }

      const uri = await captureRef(canvasRef, {
        format: "png",
        quality: 1,
      });

      if (Platform.OS === "web") {
        // Web: Download directly
        const link = document.createElement("a");
        link.href = uri;
        link.download = `boyama-${Date.now()}.png`;
        link.click();
      } else {
        // Mobile: Save to gallery
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("✨ Kaydedildi!", "Boyama sayfanız galeriye kaydedildi.");
      }

      onSave?.(paths);
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Hata", "Kaydetme sırasında bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      if (!canvasRef.current) return;

      const uri = await captureRef(canvasRef, {
        format: "png",
        quality: 1,
      });

      if (Platform.OS === "web") {
        // Web: Use Web Share API if available
        if (navigator.share) {
          await navigator.share({
            title: "Boyama Sayfam",
            text: "Boyama sayfamı görün!",
            url: uri,
          });
        } else {
          Alert.alert("Bilgi", "Web'de paylaşma desteklenmiyor. İndirme yapabilirsiniz.");
        }
      } else {
        // Mobile: Share with native share
        await Share.share({
          url: uri,
          message: "Boyama sayfamı görün! 🎨",
        });
      }
    } catch (error: any) {
      if (error.message !== "User did not share") {
        console.error("Share error:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Mode Toggle (Brush vs Fill) */}
      <View style={styles.modeToggleContainer}>
        <Pressable
          onPress={() => setDrawMode('brush')}
          style={({ pressed }) => [
            styles.modeButton,
            drawMode === 'brush' && styles.modeButtonActive,
            pressed && { opacity: 0.8 },
          ]}
        >
          <LinearGradient
            colors={drawMode === 'brush'
              ? [Colors.secondary.mint, Colors.secondary.mintLight]
              : [Colors.neutral.light, Colors.neutral.lighter]
            }
            style={styles.modeButtonGradient}
          >
            <Paintbrush size={20} color={drawMode === 'brush' ? Colors.neutral.white : Colors.neutral.dark} />
            <Text style={[
              styles.modeButtonText,
              drawMode === 'brush' && styles.modeButtonTextActive
            ]}>
              Fırça
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => setDrawMode('fill')}
          style={({ pressed }) => [
            styles.modeButton,
            drawMode === 'fill' && styles.modeButtonActive,
            pressed && { opacity: 0.8 },
          ]}
        >
          <LinearGradient
            colors={drawMode === 'fill'
              ? [Colors.secondary.sky, Colors.secondary.skyLight]
              : [Colors.neutral.light, Colors.neutral.lighter]
            }
            style={styles.modeButtonGradient}
          >
            <Droplet size={20} color={drawMode === 'fill' ? Colors.neutral.white : Colors.neutral.dark} />
            <Text style={[
              styles.modeButtonText,
              drawMode === 'fill' && styles.modeButtonTextActive
            ]}>
              Dolgu
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Color Palette Toggle */}
      <Pressable
        onPress={() => setShowColorPalette(!showColorPalette)}
        style={({ pressed }) => [
          styles.paletteToggle,
          pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
        ]}
      >
        <LinearGradient
          colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
          style={styles.paletteToggleGradient}
        >
          <Palette size={24} color={Colors.neutral.white} />
          <Text style={styles.paletteToggleText}>Renkler</Text>
        </LinearGradient>
      </Pressable>

      {/* Color Palette */}
      {showColorPalette && (
        <View style={styles.colorPaletteContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.colorPalette}
          >
            {COLORS.map((item) => (
              <Pressable
                key={item.color}
                onPress={() => {
                  setSelectedColor(item.color);
                  setShowColorPalette(false);
                }}
                style={({ pressed }) => [
                  styles.colorButton,
                  selectedColor === item.color && styles.colorButtonSelected,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.9 }] },
                ]}
              >
                <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
                {selectedColor === item.color && (
                  <View style={styles.colorCheckmark}>
                    <Text style={styles.colorCheckmarkText}>✓</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>

          {/* Brush Sizes */}
          <View style={styles.brushSizes}>
            {BRUSH_SIZES.map((item) => (
              <Pressable
                key={item.size}
                onPress={() => setBrushSize(item.size)}
                style={({ pressed }) => [
                  styles.brushSizeButton,
                  brushSize === item.size && styles.brushSizeButtonSelected,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text
                  style={[
                    styles.brushSizeText,
                    brushSize === item.size && styles.brushSizeTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Canvas */}
      <View style={styles.canvasContainer} ref={canvasRef} collapsable={false}>
        <Image
          source={{ uri: backgroundImage }}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
        <View
          style={styles.canvas}
          {...panResponder.panHandlers}
        >
          <Svg height={CANVAS_SIZE} width={CANVAS_SIZE}>
            {paths.map((p, index) => (
              <Path
                key={index}
                d={p.path}
                stroke={p.color}
                strokeWidth={p.width}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {currentPath && (
              <Path
                d={currentPath}
                stroke={selectedColor}
                strokeWidth={brushSize}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
        </View>
      </View>

      {/* Controls - Top Row */}
      <View style={styles.controls}>
        <Pressable
          onPress={handleUndo}
          disabled={paths.length === 0}
          style={({ pressed }) => [
            styles.controlButton,
            paths.length === 0 && styles.controlButtonDisabled,
            pressed && paths.length > 0 && { opacity: 0.8, transform: [{ scale: 0.95 }] },
          ]}
        >
          <Undo size={20} color={paths.length === 0 ? Colors.neutral.light : Colors.neutral.white} />
          <Text
            style={[
              styles.controlButtonText,
              paths.length === 0 && styles.controlButtonTextDisabled,
            ]}
          >
            Geri Al
          </Text>
        </Pressable>

        <Pressable
          onPress={handleClear}
          disabled={paths.length === 0}
          style={({ pressed }) => [
            styles.controlButton,
            paths.length === 0 && styles.controlButtonDisabled,
            pressed && paths.length > 0 && { opacity: 0.8, transform: [{ scale: 0.95 }] },
          ]}
        >
          <RotateCcw size={20} color={paths.length === 0 ? Colors.neutral.light : Colors.neutral.white} />
          <Text
            style={[
              styles.controlButtonText,
              paths.length === 0 && styles.controlButtonTextDisabled,
            ]}
          >
            Temizle
          </Text>
        </Pressable>
      </View>

      {/* Action Buttons - Bottom Row */}
      <View style={styles.actionButtons}>
        <Pressable
          onPress={handleSaveImage}
          disabled={paths.length === 0 || isSaving}
          style={({ pressed }) => [
            styles.actionButton,
            styles.saveButton,
            (paths.length === 0 || isSaving) && styles.controlButtonDisabled,
            pressed && paths.length > 0 && !isSaving && { opacity: 0.8, transform: [{ scale: 0.95 }] },
          ]}
        >
          <Download size={22} color={Colors.neutral.white} />
          <Text style={styles.actionButtonText}>
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleShare}
          disabled={paths.length === 0}
          style={({ pressed }) => [
            styles.actionButton,
            styles.shareButton,
            paths.length === 0 && styles.controlButtonDisabled,
            pressed && paths.length > 0 && { opacity: 0.8, transform: [{ scale: 0.95 }] },
          ]}
        >
          <Share2 size={22} color={Colors.neutral.white} />
          <Text style={styles.actionButtonText}>Paylaş</Text>
        </Pressable>
      </View>

      {/* Current Color Indicator */}
      <View style={styles.currentColorIndicator}>
        <View style={[styles.currentColorCircle, { backgroundColor: selectedColor }]} />
        <Text style={styles.currentColorText}>
          Seçili Renk - Fırça: {BRUSH_SIZES.find(b => b.size === brushSize)?.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.lighter,
  },
  modeToggleContainer: {
    flexDirection: "row",
    gap: spacing["3"],
    marginHorizontal: spacing["4"],
    marginTop: spacing["4"],
    marginBottom: spacing["2"],
  },
  modeButton: {
    flex: 1,
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  modeButtonActive: {
    transform: [{ scale: 1.02 }],
    ...shadows.lg,
  },
  modeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    paddingVertical: spacing["3"],
    paddingHorizontal: spacing["4"],
  },
  modeButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.dark,
  },
  modeButtonTextActive: {
    color: Colors.neutral.white,
  },
  paletteToggle: {
    marginHorizontal: spacing["4"],
    marginBottom: spacing["2"],
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.md,
  },
  paletteToggleGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    paddingVertical: spacing["3"],
    paddingHorizontal: spacing["5"],
  },
  paletteToggleText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  colorPaletteContainer: {
    backgroundColor: Colors.neutral.white,
    marginHorizontal: spacing["4"],
    marginBottom: spacing["4"],
    padding: spacing["4"],
    borderRadius: radius.xl,
    ...shadows.md,
  },
  colorPalette: {
    gap: spacing["3"],
    paddingVertical: spacing["2"],
  },
  colorButton: {
    position: "relative",
  },
  colorButtonSelected: {
    transform: [{ scale: 1.1 }],
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: Colors.neutral.white,
    ...shadows.md,
  },
  colorCheckmark: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: Colors.semantic.success,
    justifyContent: "center",
    alignItems: "center",
  },
  colorCheckmarkText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: typography.weight.bold,
  },
  brushSizes: {
    flexDirection: "row",
    gap: spacing["2"],
    marginTop: spacing["4"],
  },
  brushSizeButton: {
    flex: 1,
    paddingVertical: spacing["2"],
    paddingHorizontal: spacing["3"],
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.lighter,
    alignItems: "center",
  },
  brushSizeButtonSelected: {
    backgroundColor: Colors.secondary.lavender,
  },
  brushSizeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
  },
  brushSizeTextSelected: {
    color: Colors.neutral.white,
  },
  canvasContainer: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    alignSelf: "center",
    position: "relative",
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.xl,
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
  controls: {
    flexDirection: "row",
    gap: spacing["3"],
    padding: spacing["4"],
  },
  controlButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    backgroundColor: Colors.secondary.sky,
    paddingVertical: spacing["3"],
    borderRadius: radius.lg,
    ...shadows.md,
  },
  controlButtonDisabled: {
    backgroundColor: Colors.neutral.light,
  },
  controlButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  controlButtonTextDisabled: {
    color: Colors.neutral.medium,
  },
  currentColorIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    padding: spacing["3"],
    marginHorizontal: spacing["4"],
    marginBottom: spacing["4"],
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  currentColorCircle: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: Colors.neutral.light,
  },
  currentColorText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.dark,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing["3"],
    paddingHorizontal: spacing["4"],
    paddingBottom: spacing["4"],
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    paddingVertical: spacing["4"],
    borderRadius: radius.xl,
    ...shadows.lg,
  },
  saveButton: {
    backgroundColor: Colors.semantic.success,
  },
  shareButton: {
    backgroundColor: Colors.secondary.lavender,
  },
  actionButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
});
