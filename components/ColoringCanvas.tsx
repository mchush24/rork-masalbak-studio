import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
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
} from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { spacing, radius, shadows, typography } from '@/constants/design-system';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { ArrowLeft, X, Undo, Redo, Paintbrush, PaintBucket, Eraser } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
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
  type: 'solid' | 'gradient';
  colors: string[];
  name: string;
  emoji?: string;
};

type ToolType = 'brush' | 'fill' | 'eraser';

// 🎨 EXTENDED COLOR PALETTES - Solid + Gradients
const COLOR_PALETTES: ColorPalette[] = [
  // Solid colors
  { id: 'red', type: 'solid', colors: ['#FF6B6B'], name: 'Kırmızı', emoji: '🔴' },
  { id: 'orange', type: 'solid', colors: ['#FFA500'], name: 'Turuncu', emoji: '🟠' },
  { id: 'yellow', type: 'solid', colors: ['#FFD93D'], name: 'Sarı', emoji: '🟡' },
  { id: 'green', type: 'solid', colors: ['#6BCB77'], name: 'Yeşil', emoji: '🟢' },
  { id: 'blue', type: 'solid', colors: ['#4D96FF'], name: 'Mavi', emoji: '🔵' },
  { id: 'purple', type: 'solid', colors: ['#9D4EDD'], name: 'Mor', emoji: '🟣' },
  { id: 'pink', type: 'solid', colors: ['#FF69B4'], name: 'Pembe', emoji: '💗' },
  { id: 'brown', type: 'solid', colors: ['#8B4513'], name: 'Kahverengi', emoji: '🟤' },

  // Gradient patterns
  {
    id: 'rainbow',
    type: 'gradient',
    colors: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9D4EDD'],
    name: 'Gökkuşağı',
    emoji: '🌈',
  },
  {
    id: 'sunset',
    type: 'gradient',
    colors: ['#FF6B6B', '#FFA500', '#FFD93D'],
    name: 'Gün Batımı',
    emoji: '🌅',
  },
  {
    id: 'ocean',
    type: 'gradient',
    colors: ['#4D96FF', '#00CED1', '#20B2AA'],
    name: 'Okyanus',
    emoji: '🌊',
  },
  {
    id: 'forest',
    type: 'gradient',
    colors: ['#228B22', '#6BCB77', '#90EE90'],
    name: 'Orman',
    emoji: '🌲',
  },
  {
    id: 'fire',
    type: 'gradient',
    colors: ['#FF4500', '#FF6347', '#FFA500'],
    name: 'Ateş',
    emoji: '🔥',
  },
  {
    id: 'candy',
    type: 'gradient',
    colors: ['#FF69B4', '#FFB6C1', '#FFC0CB'],
    name: 'Şeker',
    emoji: '🍬',
  },
];

// Radius values for different tools (optimized for precise coloring)
const FILL_RADIUS = 70; // Large radius for fill tool
const BRUSH_RADIUS = 20; // Small radius for detailed brush strokes
const ERASER_RADIUS = 35; // Medium radius for precise erasing

// Memoized Circle component to prevent unnecessary re-renders
const MemoizedCircle = memo(function MemoizedCircle({ fill }: { fill: PathData }) {
  return <Circle cx={fill.x} cy={fill.y} r={fill.radius} fill={fill.color} opacity={0.6} />;
});

export function ColoringCanvas({ backgroundImage, onSave, onClose }: ColoringCanvasProps) {
  // History management for undo/redo
  const [history, setHistory] = useState<PathData[][]>([[]]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(COLOR_PALETTES[0]);
  const [selectedTool, setSelectedTool] = useState<ToolType>('fill');
  const [isSaving, setIsSaving] = useState(false);

  const canvasRef = useRef<View>(null);

  // Track canvas layout for coordinate conversion
  const [canvasLayout, setCanvasLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const fills = useMemo(() => history[currentIndex] || [], [history, currentIndex]);

  // Combined fills for rendering (includes pending brush strokes)
  const [, setRenderKey] = useState(0);
  // Accumulate brush strokes during drawing to batch them
  const pendingFillsRef = useRef<PathData[]>([]);

  // Memoized fills for rendering - only recalculates when fills change
  const allFillsForRender = useMemo(() => {
    return [...fills, ...pendingFillsRef.current];
  }, [fills]);

  // Add new fill with history tracking
  const _addFill = (newFill: PathData) => {
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
    Alert.alert('Tümünü Sil?', 'Tüm boyamalar silinecek. Emin misin?', [
      { text: 'Hayır', style: 'cancel' },
      {
        text: 'Evet, Sil',
        style: 'destructive',
        onPress: () => {
          setHistory([[]]);
          setCurrentIndex(0);
        },
      },
    ]);
  };

  // Touch state for brush painting
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const _canvasElementRef = useRef<HTMLElement | null>(null);

  // Refs to avoid stale closure issues in DOM event handlers
  const selectedToolRef = useRef(selectedTool);
  const selectedPaletteRef = useRef(selectedPalette);
  const fillsRef = useRef(fills);
  const currentIndexRef = useRef(currentIndex);

  // Keep refs in sync with state
  useEffect(() => {
    selectedToolRef.current = selectedTool;
  }, [selectedTool]);
  useEffect(() => {
    selectedPaletteRef.current = selectedPalette;
  }, [selectedPalette]);
  useEffect(() => {
    fillsRef.current = fills;
  }, [fills]);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Universal touch handler for single taps
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePressablePress = (evt: any) => {
    const touch = evt.nativeEvent;

    if (Platform.OS === 'web') {
      // Web: Use offsetX/offsetY which are relative to the target element
      if (touch.offsetX !== undefined && touch.offsetY !== undefined) {
        handleTap(touch.offsetX, touch.offsetY);
      } else {
        // Fallback: Use pageX/pageY if offsetX/offsetY are not available
        if (canvasLayout && touch.pageX !== undefined && touch.pageY !== undefined) {
          const x = touch.pageX - canvasLayout.x;
          const y = touch.pageY - canvasLayout.y;
          handleTap(x, y);
        }
      }
    } else {
      // Native: Use locationX/locationY
      const { locationX, locationY } = touch;
      if (locationX !== undefined && locationY !== undefined) {
        handleTap(locationX, locationY);
      }
    }
  };

  // Touch move handler for brush strokes (only active for brush and eraser tools)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTouchMove = (evt: any) => {
    if (!isDrawing) return;

    // Only enable continuous drawing for brush and eraser tools
    if (selectedTool !== 'brush' && selectedTool !== 'eraser') return;

    const touch = evt.nativeEvent;
    let x: number | undefined, y: number | undefined;

    if (Platform.OS === 'web') {
      // Web: Use offsetX/offsetY which are relative to the target element
      if (touch.offsetX !== undefined && touch.offsetY !== undefined) {
        x = touch.offsetX;
        y = touch.offsetY;
      } else if (canvasLayout && touch.pageX !== undefined && touch.pageY !== undefined) {
        // Fallback
        x = touch.pageX - canvasLayout.x;
        y = touch.pageY - canvasLayout.y;
      }
    } else {
      // Native: Use locationX/locationY
      const { locationX, locationY } = touch;
      if (locationX !== undefined && locationY !== undefined) {
        x = locationX;
        y = locationY;
      }
    }

    // Exit if coordinates are invalid
    if (x === undefined || y === undefined) return;

    // Interpolate points for smooth brush/eraser strokes
    if (lastPointRef.current) {
      const dx = x - lastPointRef.current.x;
      const dy = y - lastPointRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.ceil(distance / 10); // Add point every 10px

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const interpX = lastPointRef.current.x + dx * t;
        const interpY = lastPointRef.current.y + dy * t;
        handleTap(interpX, interpY, true); // Mark as brush stroke
      }
    } else {
      handleTap(x, y, true); // Mark as brush stroke
    }

    lastPointRef.current = { x, y };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTouchStart = (evt: any) => {
    setIsDrawing(true);
    lastPointRef.current = null;
    handlePressablePress(evt);
  };

  const handleTouchEnd = useCallback(() => {
    setIsDrawing(false);
    lastPointRef.current = null;

    // Commit pending brush strokes to history
    // Use refs to avoid stale closure issues
    if (pendingFillsRef.current.length > 0) {
      const newFills = [...fillsRef.current, ...pendingFillsRef.current];
      setHistory(prev => {
        const newHistory = prev.slice(0, currentIndexRef.current + 1);
        newHistory.push(newFills);
        return newHistory;
      });
      setCurrentIndex(prev => prev + 1);
      pendingFillsRef.current = [];
    }
  }, []); // Empty deps - uses refs for latest values

  // Web: Use native DOM events for accurate coordinate calculation
  const pressableRef = useRef<View>(null);

  // Create a stable handler for web events that uses refs
  const handleWebTap = useCallback((x: number, y: number, isBrushStroke: boolean) => {
    const tool = selectedToolRef.current;
    const palette = selectedPaletteRef.current;

    if (tool === 'eraser') {
      const eraserRadius = ERASER_RADIUS;
      const currentFills = [...fillsRef.current, ...pendingFillsRef.current];
      const newFills = currentFills.filter(fill => {
        const distance = Math.sqrt(Math.pow(fill.x - x, 2) + Math.pow(fill.y - y, 2));
        return distance > eraserRadius;
      });

      if (newFills.length !== currentFills.length) {
        pendingFillsRef.current = [];
        setHistory(prev => {
          const newHistory = prev.slice(0, currentIndexRef.current + 1);
          newHistory.push(newFills);
          return newHistory;
        });
        setCurrentIndex(prev => prev + 1);
      }
      return;
    }

    // For brush and fill tools, add color
    let fillColor: string;
    if (palette.type === 'solid') {
      fillColor = palette.colors[0];
    } else {
      const randomIndex = Math.floor(Math.random() * palette.colors.length);
      fillColor = palette.colors[randomIndex];
    }

    const radius = tool === 'brush' ? BRUSH_RADIUS : FILL_RADIUS;

    const newFill: PathData = {
      id: `fill-${Date.now()}-${Math.random()}`,
      x,
      y,
      color: fillColor,
      radius,
    };

    if (tool === 'brush' && isBrushStroke) {
      pendingFillsRef.current.push(newFill);
      setRenderKey(k => k + 1);
    } else {
      // For fill tool or first brush tap, add to history
      const newFills = [...fillsRef.current, newFill];
      setHistory(prev => {
        const newHistory = prev.slice(0, currentIndexRef.current + 1);
        newHistory.push(newFills);
        return newHistory;
      });
      setCurrentIndex(prev => prev + 1);
    }
  }, []);

  const commitPendingFills = useCallback(() => {
    if (pendingFillsRef.current.length > 0) {
      const newFills = [...fillsRef.current, ...pendingFillsRef.current];
      setHistory(prev => {
        const newHistory = prev.slice(0, currentIndexRef.current + 1);
        newHistory.push(newFills);
        return newHistory;
      });
      setCurrentIndex(prev => prev + 1);
      pendingFillsRef.current = [];
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || !pressableRef.current) return;

    // Get the DOM element from the ref
    const element = pressableRef.current as unknown as HTMLElement;
    if (!element || !element.addEventListener) return;

    let isMouseDown = false;
    let lastPoint: { x: number; y: number } | null = null;

    const getCoordinates = (e: MouseEvent): { x: number; y: number } => {
      const rect = element.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isMouseDown = true;
      lastPoint = null;
      const coords = getCoordinates(e);
      handleWebTap(coords.x, coords.y, false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const tool = selectedToolRef.current;
      if (tool !== 'brush' && tool !== 'eraser') return;

      const coords = getCoordinates(e);

      // Interpolate points for smooth strokes
      if (lastPoint) {
        const dx = coords.x - lastPoint.x;
        const dy = coords.y - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.ceil(distance / 10);

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const interpX = lastPoint.x + dx * t;
          const interpY = lastPoint.y + dy * t;
          handleWebTap(interpX, interpY, true);
        }
      } else {
        handleWebTap(coords.x, coords.y, true);
      }

      lastPoint = coords;
    };

    const handleMouseUp = () => {
      if (isMouseDown) {
        isMouseDown = false;
        lastPoint = null;
        commitPendingFills();
      }
    };

    const handleMouseLeave = () => {
      if (isMouseDown) {
        isMouseDown = false;
        lastPoint = null;
        commitPendingFills();
      }
    };

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleWebTap, commitPendingFills]);

  // Use useCallback with refs to avoid stale closure issues
  const handleTap = useCallback((x: number, y: number, isBrushStroke: boolean = false) => {
    const tool = selectedToolRef.current;
    const palette = selectedPaletteRef.current;

    if (tool === 'eraser') {
      // Eraser: Remove fills near the tap location
      const eraserRadius = ERASER_RADIUS;
      const currentFills = [...fillsRef.current, ...pendingFillsRef.current];
      const newFills = currentFills.filter(fill => {
        const distance = Math.sqrt(Math.pow(fill.x - x, 2) + Math.pow(fill.y - y, 2));
        // Remove fill if it's within eraser radius
        return distance > eraserRadius;
      });

      if (newFills.length !== currentFills.length) {
        // Clear pending fills and update history
        pendingFillsRef.current = [];
        setHistory(prev => {
          const newHistory = prev.slice(0, currentIndexRef.current + 1);
          newHistory.push(newFills);
          return newHistory;
        });
        setCurrentIndex(prev => prev + 1);
      }
      return;
    }

    // For brush and fill tools, add color
    let fillColor: string;
    if (palette.type === 'solid') {
      fillColor = palette.colors[0];
    } else {
      // For gradients, pick a random color from the gradient
      const randomIndex = Math.floor(Math.random() * palette.colors.length);
      fillColor = palette.colors[randomIndex];
    }

    // Determine radius based on tool
    const radius = tool === 'brush' ? BRUSH_RADIUS : FILL_RADIUS;

    const newFill: PathData = {
      id: `fill-${Date.now()}-${Math.random()}`,
      x,
      y,
      color: fillColor,
      radius,
    };

    // For brush strokes during active drawing, accumulate without creating history entries
    if (tool === 'brush' && isBrushStroke) {
      pendingFillsRef.current.push(newFill);
      // Force re-render to show the pending fills
      setRenderKey(k => k + 1);
    } else {
      // Add to history using refs for latest values
      const newFills = [...fillsRef.current, newFill];
      setHistory(prev => {
        const newHistory = prev.slice(0, currentIndexRef.current + 1);
        newHistory.push(newFills);
        return newHistory;
      });
      setCurrentIndex(prev => prev + 1);
    }
  }, []); // Empty deps - uses refs for latest values

  const handleSaveImage = async () => {
    try {
      setIsSaving(true);

      if (Platform.OS === 'web') {
        // Web: Create a new canvas and render the content
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          Alert.alert('Hata', 'Canvas context alınamadı');
          return;
        }

        // Draw white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Draw background image
        const img = new window.Image();
        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
            resolve(true);
          };
          img.onerror = reject;
          img.src = backgroundImage;
        });

        // Draw all fills (colored circles)
        fills.forEach(fill => {
          ctx.globalAlpha = 0.6;
          ctx.fillStyle = fill.color;
          ctx.beginPath();
          ctx.arc(fill.x, fill.y, fill.radius, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Convert to blob and download
        canvas.toBlob(blob => {
          if (!blob) {
            Alert.alert('Hata', 'Görüntü oluşturulamadı');
            return;
          }

          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `boyama-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);

          Alert.alert('✅ Kaydedildi!', 'Boyama sayfan indirildi.');
        }, 'image/png');
      } else {
        // Native: Use captureRef
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Galeriye kaydetmek için izin gerekiyor.');
          return;
        }

        if (!canvasRef.current) {
          Alert.alert('Hata', 'Canvas bulunamadı');
          return;
        }

        const uri = await captureRef(canvasRef, {
          format: 'png',
          quality: 1,
        });

        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert('✅ Kaydedildi!', 'Boyama sayfan galeriye kaydedildi.');
      }

      if (onSave) {
        onSave(fills);
      }
    } catch (error) {
      Alert.alert(
        'Hata',
        'Kaydetme sırasında bir hata oluştu: ' +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Wooden Frame Effect */}
      <LinearGradient
        colors={['#8B4513', '#A0522D', '#8B4513']}
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
                ref={pressableRef}
                style={styles.canvas}
                onLayout={event => {
                  const { x, y, width, height } = event.nativeEvent.layout;
                  setCanvasLayout({ x, y, width, height });
                }}
                // On web, use native DOM events (attached via useEffect) for accurate coordinates
                // On native, use React Native touch events
                {...(Platform.OS !== 'web'
                  ? {
                      onPressIn: handleTouchStart,
                      onTouchMove: handleTouchMove,
                      onPressOut: handleTouchEnd,
                      onTouchEnd: handleTouchEnd,
                    }
                  : {})}
              >
                <Svg height={CANVAS_SIZE} width={CANVAS_SIZE} pointerEvents="none">
                  {allFillsForRender.map(fill => (
                    <MemoizedCircle key={fill.id} fill={fill} />
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

            {/* Tool Selector */}
            <View style={styles.toolSelector}>
              <Pressable
                onPress={() => setSelectedTool('brush')}
                style={({ pressed }) => [
                  styles.toolButton,
                  styles.toolSelectorButton,
                  selectedTool === 'brush' && styles.toolSelectorButtonActive,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Paintbrush size={20} color={Colors.neutral.white} />
              </Pressable>

              <Pressable
                onPress={() => setSelectedTool('fill')}
                style={({ pressed }) => [
                  styles.toolButton,
                  styles.toolSelectorButton,
                  selectedTool === 'fill' && styles.toolSelectorButtonActive,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <PaintBucket size={20} color={Colors.neutral.white} />
              </Pressable>

              <Pressable
                onPress={() => setSelectedTool('eraser')}
                style={({ pressed }) => [
                  styles.toolButton,
                  styles.toolSelectorButton,
                  selectedTool === 'eraser' && styles.toolSelectorButtonActive,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Eraser size={20} color={Colors.neutral.white} />
              </Pressable>
            </View>

            {/* Color Palettes - Scrollable */}
            <ScrollView
              style={styles.paletteScroll}
              contentContainerStyle={styles.paletteContainer}
              showsVerticalScrollIndicator={false}
            >
              {COLOR_PALETTES.map(palette => (
                <Pressable
                  key={palette.id}
                  onPress={() => setSelectedPalette(palette)}
                  style={({ pressed }) => [
                    styles.paletteButton,
                    selectedPalette.id === palette.id && styles.paletteButtonSelected,
                    pressed && { transform: [{ scale: 0.95 }] },
                  ]}
                >
                  {palette.type === 'solid' ? (
                    <View
                      style={[styles.paletteColorBox, { backgroundColor: palette.colors[0] }]}
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
            pressed &&
              fills.length > 0 &&
              !isSaving && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
        >
          <LinearGradient
            colors={fills.length === 0 || isSaving ? ['#ccc', '#aaa'] : ['#6BCB77', '#4CAF50']}
            style={styles.saveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? '💾 Kaydediliyor...' : '💾 Kaydet ve Paylaş'}
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
    backgroundColor: '#2C1810', // Dark wood background
  },
  frameContainer: {
    flex: 1,
    padding: spacing['4'],
    borderRadius: radius.xl,
    margin: spacing['2'],
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing['3'],
  },

  // Canvas Area
  canvasArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasContainer: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.neutral.white,
    ...shadows.xl,
    borderWidth: 4,
    borderColor: '#654321', // Darker wood border
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  canvas: {
    width: '100%',
    height: '100%',
  },

  // Tool Panel (Right Side)
  toolPanel: {
    width: TOOL_PANEL_WIDTH,
    backgroundColor: '#654321',
    borderRadius: radius.xl,
    padding: spacing['2'],
    gap: spacing['3'],
    ...shadows.lg,
  },
  topActions: {
    gap: spacing['2'],
  },
  toolSelector: {
    gap: spacing['2'],
  },
  bottomActions: {
    gap: spacing['2'],
  },
  toolButton: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  backButton: {
    backgroundColor: '#4D96FF', // Blue
  },
  closeButton: {
    backgroundColor: '#FF6B6B', // Red
  },
  undoButton: {
    backgroundColor: '#4D96FF', // Blue
  },
  redoButton: {
    backgroundColor: '#FFA500', // Orange
  },
  toolButtonDisabled: {
    backgroundColor: '#888',
    opacity: 0.4,
  },
  toolSelectorButton: {
    backgroundColor: '#8B4513', // Brown wood color
  },
  toolSelectorButtonActive: {
    backgroundColor: '#FFD700', // Gold color when active
    borderWidth: 2,
    borderColor: Colors.neutral.white,
    ...shadows.xl,
  },

  // Color Palette Scroll
  paletteScroll: {
    flex: 1,
  },
  paletteContainer: {
    gap: spacing['2'],
    paddingVertical: spacing['2'],
  },
  paletteButton: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paletteButtonSelected: {
    borderColor: Colors.neutral.white,
    borderWidth: 3,
    ...shadows.lg,
  },
  paletteColorBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  selectedCheck: {
    fontSize: 24,
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.white,
  },

  // Save Button
  saveButton: {
    marginTop: spacing['3'],
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.xl,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['6'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: typography.size.xl,
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.white,
  },
});
