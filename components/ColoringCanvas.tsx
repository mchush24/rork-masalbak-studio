import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  Image,
  Pressable,
  Text,
  Alert,
  Share,
  Platform,
} from "react-native";
import { Svg, Circle } from "react-native-svg";
import { Colors } from "@/constants/colors";
import { spacing, radius, shadows, typography } from "@/constants/design-system";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CANVAS_SIZE = SCREEN_WIDTH - 32;

type ColoringCanvasProps = {
  backgroundImage: string;
};

type PathData = {
  id: string;
  x: number;
  y: number;
  color: string;
  radius: number;
};

// 🎨 SADECE 6 TEMEL RENK - Çocuklar için basit!
const SIMPLE_COLORS = [
  { name: "Kırmızı", color: "#FF6B6B", emoji: "🔴" },
  { name: "Sarı", color: "#FFD93D", emoji: "🟡" },
  { name: "Mavi", color: "#4D96FF", emoji: "🔵" },
  { name: "Yeşil", color: "#6BCB77", emoji: "🟢" },
  { name: "Pembe", color: "#FF69B4", emoji: "💗" },
  { name: "Mor", color: "#9D4EDD", emoji: "🟣" },
];

// Sabit, büyük dolgu boyutu - çocuklar için kolay
const FILL_RADIUS = 100;

export function ColoringCanvas({ backgroundImage, onSave }: ColoringCanvasProps) {
  const [fills, setFills] = useState<PathData[]>([]);
  const [selectedColor, setSelectedColor] = useState(SIMPLE_COLORS[0].color);
  const [isSaving, setIsSaving] = useState(false);

  const canvasRef = useRef<View>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false, // No dragging, only tap
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        handleTap(locationX, locationY);
      },
    })
  ).current;

  const handleTap = (x: number, y: number) => {
    console.log(`[ColoringCanvas] 🎨 Tap at (${Math.round(x)}, ${Math.round(y)}) - Color: ${selectedColor}`);

    // Add a new fill circle at tap location
    const newFill: PathData = {
      id: `fill-${Date.now()}-${Math.random()}`,
      x,
      y,
      color: selectedColor,
      radius: FILL_RADIUS,
    };

    const newFills = [...fills, newFill];
    console.log(`[ColoringCanvas] ✅ Total fills: ${newFills.length}`);
    setFills(newFills);
  };

  const handleUndo = () => {
    if (fills.length > 0) {
      setFills(fills.slice(0, -1));
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
          onPress: () => setFills([]),
        },
      ]
    );
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
        if (navigator.share) {
          await navigator.share({
            title: "Boyama Sayfam",
            text: "Boyama sayfamı görün!",
            url: uri,
          });
        } else {
          Alert.alert("Bilgi", "Web'de paylaşma desteklenmiyor.");
        }
      } else {
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
      {/* Canvas */}
      <View style={styles.canvasContainer} ref={canvasRef} collapsable={false}>
        <Image
          source={{ uri: backgroundImage }}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
        <View style={styles.canvas} {...panResponder.panHandlers}>
          <Svg height={CANVAS_SIZE} width={CANVAS_SIZE} pointerEvents="none">
            {fills.map((fill) => (
              <Circle
                key={fill.id}
                cx={fill.x}
                cy={fill.y}
                r={fill.radius}
                fill={fill.color}
                opacity={0.7}
              />
            ))}
          </Svg>
        </View>
      </View>

      {/* 🎨 BÜYÜK RENK PALETİ - Çocuklar için kolay! */}
      <View style={styles.colorPalette}>
        {SIMPLE_COLORS.map((item) => (
          <Pressable
            key={item.color}
            onPress={() => setSelectedColor(item.color)}
            style={({ pressed }) => [
              styles.colorButton,
              selectedColor === item.color && styles.colorButtonSelected,
              pressed && { transform: [{ scale: 0.9 }] },
            ]}
          >
            <View
              style={[
                styles.colorCircle,
                { backgroundColor: item.color },
                selectedColor === item.color && styles.colorCircleSelected,
              ]}
            >
              {selectedColor === item.color && (
                <Text style={styles.selectedEmoji}>✓</Text>
              )}
            </View>
            <Text style={styles.colorLabel}>{item.emoji}</Text>
          </Pressable>
        ))}
      </View>

      {/* 🎮 KONTROL BUTONLARI - Emoji'li ve renkli! */}
      <View style={styles.controls}>
        <Pressable
          onPress={handleUndo}
          disabled={fills.length === 0}
          style={({ pressed }) => [
            styles.controlButton,
            styles.undoButton,
            fills.length === 0 && styles.controlButtonDisabled,
            pressed && fills.length > 0 && { transform: [{ scale: 0.95 }] },
          ]}
        >
          <Text style={styles.controlButtonEmoji}>↶</Text>
          <Text style={styles.controlButtonText}>Geri Al</Text>
        </Pressable>

        <Pressable
          onPress={handleClear}
          disabled={fills.length === 0}
          style={({ pressed }) => [
            styles.controlButton,
            styles.clearButton,
            fills.length === 0 && styles.controlButtonDisabled,
            pressed && fills.length > 0 && { transform: [{ scale: 0.95 }] },
          ]}
        >
          <Text style={styles.controlButtonEmoji}>🗑️</Text>
          <Text style={styles.controlButtonText}>Temizle</Text>
        </Pressable>
      </View>

      {/* 💾 KAYDET VE PAYLAŞ BUTONLARI */}
      <View style={styles.actionButtons}>
        <Pressable
          onPress={handleSaveImage}
          disabled={fills.length === 0 || isSaving}
          style={({ pressed }) => [
            styles.actionButton,
            styles.saveButton,
            (fills.length === 0 || isSaving) && styles.actionButtonDisabled,
            pressed && fills.length > 0 && !isSaving && { transform: [{ scale: 0.95 }] },
          ]}
        >
          <Text style={styles.actionButtonEmoji}>💾</Text>
          <Text style={styles.actionButtonText}>
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleShare}
          disabled={fills.length === 0}
          style={({ pressed }) => [
            styles.actionButton,
            styles.shareButton,
            fills.length === 0 && styles.actionButtonDisabled,
            pressed && fills.length > 0 && { transform: [{ scale: 0.95 }] },
          ]}
        >
          <Text style={styles.actionButtonEmoji}>📤</Text>
          <Text style={styles.actionButtonText}>Paylaş</Text>
        </Pressable>
      </View>

      {/* 📌 Seçili Renk Göstergesi */}
      <View style={styles.selectedColorIndicator}>
        <View style={[styles.selectedColorCircle, { backgroundColor: selectedColor }]} />
        <Text style={styles.selectedColorText}>
          {SIMPLE_COLORS.find((c) => c.color === selectedColor)?.name} seçili
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.lighter,
    padding: spacing["4"],
    gap: spacing["4"],
  },
  canvasContainer: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    alignSelf: "center",
    position: "relative",
    borderRadius: radius.xl,
    overflow: "hidden",
    ...shadows.xl,
    backgroundColor: Colors.neutral.white,
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

  // 🎨 Renk Paleti - BÜY ÜK ve KOLAY!
  colorPalette: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing["3"],
    padding: spacing["4"],
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    ...shadows.md,
  },
  colorButton: {
    alignItems: "center",
    gap: spacing["1"],
  },
  colorButtonSelected: {
    transform: [{ scale: 1.1 }],
  },
  colorCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: Colors.neutral.lighter,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.md,
  },
  colorCircleSelected: {
    borderColor: Colors.neutral.darkest,
    borderWidth: 5,
    ...shadows.lg,
  },
  selectedEmoji: {
    fontSize: 32,
    color: Colors.neutral.white,
    fontWeight: "900",
  },
  colorLabel: {
    fontSize: 20,
  },

  // 🎮 Kontrol Butonları
  controls: {
    flexDirection: "row",
    gap: spacing["3"],
  },
  controlButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    paddingVertical: spacing["4"],
    borderRadius: radius.xl,
    ...shadows.md,
  },
  undoButton: {
    backgroundColor: "#FFA500", // Turuncu
  },
  clearButton: {
    backgroundColor: "#FF6B6B", // Kırmızı
  },
  controlButtonDisabled: {
    backgroundColor: Colors.neutral.light,
    opacity: 0.5,
  },
  controlButtonEmoji: {
    fontSize: 24,
  },
  controlButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },

  // 💾 Kaydet ve Paylaş
  actionButtons: {
    flexDirection: "row",
    gap: spacing["3"],
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
    paddingVertical: spacing["5"],
    borderRadius: radius.xl,
    ...shadows.lg,
  },
  saveButton: {
    backgroundColor: "#6BCB77", // Yeşil
  },
  shareButton: {
    backgroundColor: "#9D4EDD", // Mor
  },
  actionButtonDisabled: {
    backgroundColor: Colors.neutral.light,
    opacity: 0.5,
  },
  actionButtonEmoji: {
    fontSize: 28,
  },
  actionButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },

  // 📌 Seçili Renk Göstergesi
  selectedColorIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["3"],
    padding: spacing["4"],
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  selectedColorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.neutral.darkest,
  },
  selectedColorText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
});
