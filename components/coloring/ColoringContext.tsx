/**
 * 🎨 ColoringContext - Centralized State Management for Interactive Coloring
 *
 * Provides state management for:
 * - Advanced brush settings (size, opacity, hardness, pressure)
 * - Color system (HSV, gradients, favorites)
 * - Tool management
 * - Layer & history management
 * - Device capability detection
 * - Animation & sound preferences
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ToolType = 'brush' | 'fill' | 'eraser' | 'sticker';

export type PerformanceTier = 'basic' | 'advanced' | 'premium';

export type ColorType = 'solid' | 'gradient';

export type TextureType = 'solid' | 'glitter' | 'scale' | 'dots';

export interface ColorPalette {
  id: string;
  type: ColorType;
  colors: string[]; // Single color for solid, 2+ colors for gradient
  name: string;
  emoji?: string;
}

export interface BrushSettings {
  size: number; // 5-50px
  opacity: number; // 0-1
  hardness: number; // 0-1 (0=soft, 1=hard)
  pressureSensitivity: boolean; // Enabled on premium tier
}

export interface ColorState {
  selectedPalette: ColorPalette;
  customColor: string | null; // From HSV wheel
  gradientColors: string[]; // For gradient tool
  opacity: number; // 0-1
  favoriteColors: string[]; // 10 slots
}

export interface FillPoint {
  id: string;
  x: number;
  y: number;
  color: string;
  radius: number;
  texture?: TextureType;
  intensity?: number;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export interface BrushStroke {
  id: string;
  path: any; // Skia Path object
  color: string;
  width: number;
  opacity: number;
  isEraser?: boolean;
}

export interface HistoryState {
  fills: FillPoint[];
  strokes: BrushStroke[];
  stickers: PlacedSticker[];
}

export interface DeviceCapabilities {
  tier: PerformanceTier;
  supportsGradients: boolean;
  supportsPressure: boolean;
  supportsAnimations: boolean;
  maxHistorySteps: number;
  maxCanvasSize: number;
  recommendedBrushSizes: { min: number; max: number };
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_BRUSH_SETTINGS: BrushSettings = {
  size: 15,
  opacity: 1,
  hardness: 0.5,
  pressureSensitivity: false,
};

const DEFAULT_COLOR_PALETTES: ColorPalette[] = [
  // Primary Colors
  { id: 'red', type: 'solid', colors: [Colors.secondary.coral], name: 'Kırmızı', emoji: '🔴' },
  { id: 'orange', type: 'solid', colors: ['#FFA500'], name: 'Turuncu', emoji: '🟠' },
  { id: 'yellow', type: 'solid', colors: ['#FFD93D'], name: 'Sarı', emoji: '🟡' },
  { id: 'green', type: 'solid', colors: ['#6BCB77'], name: 'Yeşil', emoji: '🟢' },
  { id: 'blue', type: 'solid', colors: ['#4D96FF'], name: 'Mavi', emoji: '🔵' },
  { id: 'purple', type: 'solid', colors: ['#9D4EDD'], name: 'Mor', emoji: '🟣' },
  { id: 'pink', type: 'solid', colors: ['#FF69B4'], name: 'Pembe', emoji: '💗' },

  // Additional Colors
  { id: 'brown', type: 'solid', colors: ['#8B4513'], name: 'Kahverengi', emoji: '🟤' },
  { id: 'black', type: 'solid', colors: ['#2C2C2C'], name: 'Siyah', emoji: '⚫' },
  { id: 'white', type: 'solid', colors: [Colors.neutral.white], name: 'Beyaz', emoji: '⚪' },
  { id: 'gray', type: 'solid', colors: ['#9E9E9E'], name: 'Gri', emoji: '🔘' },

  // Pastel Colors
  { id: 'pastel-pink', type: 'solid', colors: ['#FFB3D9'], name: 'Pastel Pembe', emoji: '🌸' },
  { id: 'pastel-blue', type: 'solid', colors: ['#B3D9FF'], name: 'Pastel Mavi', emoji: '💙' },
  { id: 'pastel-yellow', type: 'solid', colors: ['#FFF9B3'], name: 'Pastel Sarı', emoji: '⭐' },
  { id: 'pastel-green', type: 'solid', colors: ['#B3FFD9'], name: 'Pastel Yeşil', emoji: '🍃' },
  { id: 'pastel-purple', type: 'solid', colors: ['#E6B3FF'], name: 'Pastel Mor', emoji: '🦄' },

  // Vibrant/Neon Colors
  { id: 'neon-pink', type: 'solid', colors: ['#FF1493'], name: 'Neon Pembe', emoji: '💖' },
  { id: 'neon-green', type: 'solid', colors: ['#00FF00'], name: 'Neon Yeşil', emoji: '💚' },
  { id: 'neon-blue', type: 'solid', colors: ['#00D4FF'], name: 'Neon Mavi', emoji: '🔷' },
  { id: 'neon-orange', type: 'solid', colors: ['#FF6600'], name: 'Neon Turuncu', emoji: '🧡' },
];

// ============================================================================
// CONTEXT
// ============================================================================

interface ColoringContextType {
  // Tool state
  selectedTool: ToolType;
  setSelectedTool: (tool: ToolType) => void;

  // Brush settings
  brushSettings: BrushSettings;
  updateBrushSettings: (settings: Partial<BrushSettings>) => void;

  // Color state
  colorState: ColorState;
  setSelectedPalette: (palette: ColorPalette) => void;
  setCustomColor: (color: string) => void;
  setOpacity: (opacity: number) => void;
  addFavoriteColor: (color: string) => void;
  removeFavoriteColor: (color: string) => void;

  // Color palettes
  colorPalettes: ColorPalette[];

  // Layer state
  fillLayer: FillPoint[];
  setFillLayer: (fills: FillPoint[]) => void;
  strokeLayer: BrushStroke[];
  setStrokeLayer: (strokes: BrushStroke[]) => void;
  stickerLayer: PlacedSticker[];
  setStickerLayer: (stickers: PlacedSticker[]) => void;
  addSticker: (sticker: PlacedSticker) => void;
  removeSticker: (id: string) => void;
  updateSticker: (id: string, updates: Partial<PlacedSticker>) => void;

  // Texture state
  selectedTexture: TextureType;
  setSelectedTexture: (texture: TextureType) => void;

  // History
  history: HistoryState[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Device capabilities
  deviceCapabilities: DeviceCapabilities;

  // Settings
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;

  // Helpers
  triggerHaptic: (style?: Haptics.ImpactFeedbackStyle) => void;
  getCurrentColor: () => string;
}

const ColoringContext = createContext<ColoringContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function ColoringProvider({ children }: { children: React.ReactNode }) {
  // Tool state
  const [selectedTool, setSelectedTool] = useState<ToolType>('brush');

  // Brush settings
  const [brushSettings, setBrushSettings] = useState<BrushSettings>(DEFAULT_BRUSH_SETTINGS);

  // Color state
  const [colorState, setColorState] = useState<ColorState>({
    selectedPalette: DEFAULT_COLOR_PALETTES[0],
    customColor: null,
    gradientColors: [],
    opacity: 1,
    favoriteColors: [],
  });

  // Layer state
  const [fillLayer, setFillLayer] = useState<FillPoint[]>([]);
  const [strokeLayer, setStrokeLayer] = useState<BrushStroke[]>([]);
  const [stickerLayer, setStickerLayer] = useState<PlacedSticker[]>([]);

  // Texture state
  const [selectedTexture, setSelectedTexture] = useState<TextureType>('solid');

  // History state
  const [history, setHistory] = useState<HistoryState[]>([{ fills: [], strokes: [], stickers: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Device capabilities (will be detected on mount)
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    tier: 'basic',
    supportsGradients: false,
    supportsPressure: false,
    supportsAnimations: true,
    maxHistorySteps: 10,
    maxCanvasSize: 1024,
    recommendedBrushSizes: { min: 10, max: 30 },
  });

  // Settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load favorite colors from AsyncStorage on mount
  useEffect(() => {
    loadFavoriteColors();
  }, []);

  // Save favorite colors to AsyncStorage whenever they change
  useEffect(() => {
    saveFavoriteColors();
  }, [colorState.favoriteColors]);

  // ============================================================================
  // BRUSH SETTINGS
  // ============================================================================

  const updateBrushSettings = useCallback((settings: Partial<BrushSettings>) => {
    setBrushSettings(prev => ({ ...prev, ...settings }));
  }, []);

  // ============================================================================
  // COLOR MANAGEMENT
  // ============================================================================

  const setSelectedPalette = useCallback((palette: ColorPalette) => {
    setColorState(prev => ({ ...prev, selectedPalette: palette }));
  }, []);

  const setCustomColor = useCallback((color: string) => {
    setColorState(prev => ({ ...prev, customColor: color }));
  }, []);

  const setOpacity = useCallback((opacity: number) => {
    const clamped = Math.max(0, Math.min(1, opacity));
    setColorState(prev => ({ ...prev, opacity: clamped }));
  }, []);

  const addFavoriteColor = useCallback((color: string) => {
    setColorState(prev => {
      const favorites = [...prev.favoriteColors];
      if (favorites.includes(color)) return prev;

      // Max 10 favorites
      if (favorites.length >= 10) {
        favorites.shift(); // Remove oldest
      }
      favorites.push(color);

      return { ...prev, favoriteColors: favorites };
    });
  }, []);

  const removeFavoriteColor = useCallback((color: string) => {
    setColorState(prev => ({
      ...prev,
      favoriteColors: prev.favoriteColors.filter(c => c !== color),
    }));
  }, []);

  const loadFavoriteColors = async () => {
    try {
      const saved = await AsyncStorage.getItem('@coloring_favorite_colors');
      if (saved) {
        const colors = JSON.parse(saved);
        setColorState(prev => ({ ...prev, favoriteColors: colors }));
      }
    } catch (error) {
      console.error('Failed to load favorite colors:', error);
    }
  };

  const saveFavoriteColors = async () => {
    try {
      await AsyncStorage.setItem(
        '@coloring_favorite_colors',
        JSON.stringify(colorState.favoriteColors)
      );
    } catch (error) {
      console.error('Failed to save favorite colors:', error);
    }
  };

  // ============================================================================
  // HISTORY MANAGEMENT
  // ============================================================================

  // ============================================================================
  // STICKER MANAGEMENT
  // ============================================================================

  const addSticker = useCallback((sticker: PlacedSticker) => {
    setStickerLayer(prev => [...prev, sticker]);
  }, []);

  const removeSticker = useCallback((id: string) => {
    setStickerLayer(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateSticker = useCallback((id: string, updates: Partial<PlacedSticker>) => {
    setStickerLayer(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  // ============================================================================
  // HISTORY MANAGEMENT
  // ============================================================================

  const saveToHistory = useCallback(() => {
    const newState: HistoryState = {
      fills: [...fillLayer],
      strokes: [...strokeLayer],
      stickers: [...stickerLayer],
    };

    // Truncate future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);

    // Limit history size based on device tier
    const maxSteps = deviceCapabilities.maxHistorySteps;
    if (newHistory.length > maxSteps) {
      newHistory.shift();
    } else {
      setHistoryIndex(prev => prev + 1);
    }

    setHistory(newHistory);
  }, [fillLayer, strokeLayer, stickerLayer, history, historyIndex, deviceCapabilities.maxHistorySteps]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      setFillLayer(state.fills);
      setStrokeLayer(state.strokes);
      setStickerLayer(state.stickers || []);
      setHistoryIndex(newIndex);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      setFillLayer(state.fills);
      setStrokeLayer(state.strokes);
      setStickerLayer(state.stickers || []);
      setHistoryIndex(newIndex);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [historyIndex, history]);

  const clearHistory = useCallback(() => {
    setHistory([{ fills: [], strokes: [], stickers: [] }]);
    setHistoryIndex(0);
    setFillLayer([]);
    setStrokeLayer([]);
    setStickerLayer([]);
  }, []);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // ============================================================================
  // HELPERS
  // ============================================================================

  const triggerHaptic = useCallback((style = Haptics.ImpactFeedbackStyle.Medium) => {
    if (hapticsEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  }, [hapticsEnabled]);

  const getCurrentColor = useCallback(() => {
    if (colorState.customColor) {
      return colorState.customColor;
    }
    return colorState.selectedPalette.colors[0];
  }, [colorState]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: ColoringContextType = {
    selectedTool,
    setSelectedTool,
    brushSettings,
    updateBrushSettings,
    colorState,
    setSelectedPalette,
    setCustomColor,
    setOpacity,
    addFavoriteColor,
    removeFavoriteColor,
    colorPalettes: DEFAULT_COLOR_PALETTES,
    fillLayer,
    setFillLayer,
    strokeLayer,
    setStrokeLayer,
    stickerLayer,
    setStickerLayer,
    addSticker,
    removeSticker,
    updateSticker,
    selectedTexture,
    setSelectedTexture,
    history,
    historyIndex,
    canUndo,
    canRedo,
    saveToHistory,
    undo,
    redo,
    clearHistory,
    deviceCapabilities,
    soundEnabled,
    setSoundEnabled,
    hapticsEnabled,
    setHapticsEnabled,
    triggerHaptic,
    getCurrentColor,
  };

  return (
    <ColoringContext.Provider value={value}>
      {children}
    </ColoringContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useColoring() {
  const context = useContext(ColoringContext);
  if (!context) {
    throw new Error('useColoring must be used within ColoringProvider');
  }
  return context;
}
