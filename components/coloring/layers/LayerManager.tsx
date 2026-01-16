/**
 * LayerManager - Profesyonel Katman Sistemi
 *
 * Phase 3: Layer System
 * - Çoklu katman desteği
 * - Katman görünürlüğü ve kilitleme
 * - Katman sıralama (drag & drop)
 * - Karıştırma modları
 * - Opaklık kontrolü
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  PanResponder,
  Image,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  thumbnail?: string;
  order: number;
  isBackground?: boolean;
}

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn';

interface LayerManagerProps {
  layers: Layer[];
  activeLayerId: string;
  onLayerSelect: (layerId: string) => void;
  onLayerVisibilityChange: (layerId: string, visible: boolean) => void;
  onLayerLockChange: (layerId: string, locked: boolean) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  onLayerBlendModeChange: (layerId: string, blendMode: BlendMode) => void;
  onLayerReorder: (fromIndex: number, toIndex: number) => void;
  onLayerAdd: () => void;
  onLayerDelete: (layerId: string) => void;
  onLayerDuplicate: (layerId: string) => void;
  onLayerMergeDown: (layerId: string) => void;
  onLayerRename: (layerId: string, name: string) => void;
}

// ============================================
// BLEND MODE CONFIG
// ============================================

const BLEND_MODES: { id: BlendMode; name: string; icon: string }[] = [
  { id: 'normal', name: 'Normal', icon: '◼️' },
  { id: 'multiply', name: 'Çarpma', icon: '✖️' },
  { id: 'screen', name: 'Ekran', icon: '📺' },
  { id: 'overlay', name: 'Kaplama', icon: '🔲' },
  { id: 'darken', name: 'Koyulaştır', icon: '🌑' },
  { id: 'lighten', name: 'Açıklaştır', icon: '🌕' },
  { id: 'color-dodge', name: 'Renk Soldurma', icon: '💫' },
  { id: 'color-burn', name: 'Renk Yakma', icon: '🔥' },
];

// ============================================
// LAYER ITEM COMPONENT
// ============================================

interface LayerItemProps {
  layer: Layer;
  isActive: boolean;
  onSelect: () => void;
  onVisibilityToggle: () => void;
  onLockToggle: () => void;
  onOpacityChange: (opacity: number) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isDragging?: boolean;
}

function LayerItem({
  layer,
  isActive,
  onSelect,
  onVisibilityToggle,
  onLockToggle,
  onOpacityChange,
  onDelete,
  onDuplicate,
  isDragging = false,
}: LayerItemProps) {
  const [showOptions, setShowOptions] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleLongPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
    setShowOptions(!showOptions);
  };

  return (
    <Animated.View
      style={[
        styles.layerItem,
        isActive && styles.layerItemActive,
        isDragging && styles.layerItemDragging,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.layerContent}
        onPress={onSelect}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
      >
        {/* Drag Handle */}
        <View style={styles.dragHandle}>
          <Text style={styles.dragHandleIcon}>⋮⋮</Text>
        </View>

        {/* Thumbnail */}
        <View style={styles.thumbnail}>
          {layer.thumbnail ? (
            <Image
              source={{ uri: layer.thumbnail }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Text style={styles.thumbnailPlaceholderText}>
                {layer.isBackground ? '🖼️' : '📄'}
              </Text>
            </View>
          )}
        </View>

        {/* Layer Info */}
        <View style={styles.layerInfo}>
          <Text style={styles.layerName} numberOfLines={1}>
            {layer.name}
          </Text>
          <View style={styles.layerMeta}>
            <Text style={styles.layerOpacity}>{Math.round(layer.opacity * 100)}%</Text>
            {layer.blendMode !== 'normal' && (
              <Text style={styles.layerBlendMode}>
                {BLEND_MODES.find(b => b.id === layer.blendMode)?.name}
              </Text>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {/* Visibility Toggle */}
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={onVisibilityToggle}
          >
            <Text style={styles.quickActionIcon}>
              {layer.visible ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>

          {/* Lock Toggle */}
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={onLockToggle}
            disabled={layer.isBackground}
          >
            <Text style={[
              styles.quickActionIcon,
              layer.isBackground && styles.quickActionDisabled,
            ]}>
              {layer.locked ? '🔒' : '🔓'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Expanded Options */}
      {showOptions && (
        <View style={styles.expandedOptions}>
          {/* Opacity Slider */}
          <View style={styles.opacityRow}>
            <Text style={styles.opacityLabel}>Opaklık</Text>
            <View style={styles.opacitySlider}>
              {[25, 50, 75, 100].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.opacityButton,
                    layer.opacity * 100 === val && styles.opacityButtonActive,
                  ]}
                  onPress={() => onOpacityChange(val / 100)}
                >
                  <Text style={[
                    styles.opacityButtonText,
                    layer.opacity * 100 === val && styles.opacityButtonTextActive,
                  ]}>
                    {val}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Layer Actions */}
          <View style={styles.layerActions}>
            <TouchableOpacity
              style={styles.layerActionButton}
              onPress={onDuplicate}
            >
              <Text style={styles.layerActionIcon}>📋</Text>
              <Text style={styles.layerActionText}>Çoğalt</Text>
            </TouchableOpacity>

            {!layer.isBackground && (
              <TouchableOpacity
                style={[styles.layerActionButton, styles.deleteButton]}
                onPress={onDelete}
              >
                <Text style={styles.layerActionIcon}>🗑️</Text>
                <Text style={[styles.layerActionText, styles.deleteText]}>Sil</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </Animated.View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function LayerManager({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerVisibilityChange,
  onLayerLockChange,
  onLayerOpacityChange,
  onLayerBlendModeChange,
  onLayerReorder,
  onLayerAdd,
  onLayerDelete,
  onLayerDuplicate,
  onLayerMergeDown,
  onLayerRename,
}: LayerManagerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showBlendModes, setShowBlendModes] = useState(false);
  const panelHeight = useRef(new Animated.Value(1)).current;

  const sortedLayers = [...layers].sort((a, b) => b.order - a.order);

  const togglePanel = () => {
    Animated.spring(panelHeight, {
      toValue: isExpanded ? 0 : 1,
      tension: 65,
      friction: 11,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const activeLayer = layers.find(l => l.id === activeLayerId);

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={togglePanel}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>📚</Text>
          <Text style={styles.headerTitle}>Katmanlar</Text>
          <View style={styles.layerCountBadge}>
            <Text style={styles.layerCountText}>{layers.length}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {/* Add Layer Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={onLayerAdd}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
          {/* Expand Toggle */}
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Layer List */}
      <Animated.View
        style={[
          styles.layerList,
          {
            maxHeight: panelHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 400],
            }),
            opacity: panelHeight,
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sortedLayers.map((layer) => (
            <LayerItem
              key={layer.id}
              layer={layer}
              isActive={layer.id === activeLayerId}
              onSelect={() => onLayerSelect(layer.id)}
              onVisibilityToggle={() => onLayerVisibilityChange(layer.id, !layer.visible)}
              onLockToggle={() => onLayerLockChange(layer.id, !layer.locked)}
              onOpacityChange={(opacity) => onLayerOpacityChange(layer.id, opacity)}
              onDelete={() => onLayerDelete(layer.id)}
              onDuplicate={() => onLayerDuplicate(layer.id)}
            />
          ))}
        </ScrollView>
      </Animated.View>

      {/* Blend Mode Selector */}
      {showBlendModes && activeLayer && (
        <View style={styles.blendModeSelector}>
          <Text style={styles.blendModeTitle}>Karıştırma Modu</Text>
          <View style={styles.blendModeGrid}>
            {BLEND_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.blendModeItem,
                  activeLayer.blendMode === mode.id && styles.blendModeItemActive,
                ]}
                onPress={() => {
                  onLayerBlendModeChange(activeLayerId, mode.id);
                  setShowBlendModes(false);
                }}
              >
                <Text style={styles.blendModeIcon}>{mode.icon}</Text>
                <Text style={styles.blendModeName}>{mode.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Active Layer Quick Bar */}
      {activeLayer && isExpanded && (
        <View style={styles.quickBar}>
          <TouchableOpacity
            style={styles.quickBarButton}
            onPress={() => setShowBlendModes(!showBlendModes)}
          >
            <Text style={styles.quickBarIcon}>🎨</Text>
            <Text style={styles.quickBarLabel}>
              {BLEND_MODES.find(b => b.id === activeLayer.blendMode)?.name || 'Normal'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBarButton}
            onPress={() => onLayerMergeDown(activeLayerId)}
            disabled={activeLayer.isBackground || activeLayer.order === 0}
          >
            <Text style={styles.quickBarIcon}>⬇️</Text>
            <Text style={styles.quickBarLabel}>Birleştir</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ============================================
// LAYER UTILS
// ============================================

export function createLayer(
  name: string,
  order: number,
  isBackground = false
): Layer {
  return {
    id: `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    visible: true,
    locked: isBackground,
    opacity: 1,
    blendMode: 'normal',
    order,
    isBackground,
  };
}

export function createDefaultLayers(): Layer[] {
  return [
    createLayer('Arka Plan', 0, true),
    createLayer('Katman 1', 1),
  ];
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  layerCountBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  layerCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: -2,
  },
  expandIcon: {
    fontSize: 12,
    color: '#666',
  },

  // Layer List
  layerList: {
    overflow: 'hidden',
  },
  scrollView: {
    maxHeight: 300,
  },
  scrollContent: {
    padding: 8,
    gap: 8,
  },

  // Layer Item
  layerItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  layerItemActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  layerItemDragging: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  layerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
  },
  dragHandle: {
    paddingHorizontal: 4,
  },
  dragHandleIcon: {
    fontSize: 16,
    color: '#999',
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholderText: {
    fontSize: 18,
  },
  layerInfo: {
    flex: 1,
  },
  layerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  layerMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  layerOpacity: {
    fontSize: 11,
    color: '#666',
  },
  layerBlendMode: {
    fontSize: 11,
    color: '#6366F1',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 4,
  },
  quickActionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 16,
  },
  quickActionDisabled: {
    opacity: 0.3,
  },

  // Expanded Options
  expandedOptions: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 12,
    gap: 12,
  },
  opacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  opacityLabel: {
    fontSize: 12,
    color: '#666',
    width: 50,
  },
  opacitySlider: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  opacityButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  opacityButtonActive: {
    backgroundColor: '#6366F1',
  },
  opacityButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  opacityButtonTextActive: {
    color: '#FFF',
  },
  layerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  layerActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  layerActionIcon: {
    fontSize: 14,
  },
  layerActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  deleteText: {
    color: '#DC2626',
  },

  // Blend Mode Selector
  blendModeSelector: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  blendModeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  blendModeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  blendModeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  blendModeItemActive: {
    backgroundColor: '#6366F1',
  },
  blendModeIcon: {
    fontSize: 12,
  },
  blendModeName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
  },

  // Quick Bar
  quickBar: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  quickBarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  quickBarIcon: {
    fontSize: 14,
  },
  quickBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
});
