/**
 * CollaboratorCursors - İşbirlikçi İmleçleri
 *
 * Phase 3: Real-time Collaboration
 * - Diğer kullanıcıların imleç pozisyonları
 * - Animasyonlu imleç hareketi
 * - İsim etiketleri
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { shadows, zIndex } from '@/constants/design-system';
import { CursorPosition, CollaboratorInfo } from '@/lib/collab/CollaborationManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

interface CollaboratorCursorsProps {
  cursors: Map<string, CursorPosition>;
  collaborators: CollaboratorInfo[];
  canvasOffset?: { x: number; y: number };
}

interface CursorData {
  position: CursorPosition;
  collaborator: CollaboratorInfo;
}

// ============================================
// SINGLE CURSOR COMPONENT
// ============================================

interface SingleCursorProps {
  cursor: CursorPosition;
  collaborator: CollaboratorInfo;
  canvasOffset: { x: number; y: number };
}

function SingleCursor({ cursor, collaborator, canvasOffset }: SingleCursorProps) {
  const translateX = useRef(new Animated.Value(cursor.x)).current;
  const translateY = useRef(new Animated.Value(cursor.y)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Smooth cursor movement
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: cursor.x + canvasOffset.x,
        tension: 100,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: cursor.y + canvasOffset.y,
        tension: 100,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse when drawing
    if (cursor.isDrawing) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [cursor.x, cursor.y, cursor.isDrawing]);

  // Fade out after inactivity
  useEffect(() => {
    opacity.setValue(1);
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0.5,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 3000);

    return () => clearTimeout(timer);
  }, [cursor.x, cursor.y]);

  return (
    <Animated.View
      style={[
        styles.cursorContainer,
        {
          opacity,
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
        },
      ]}
      pointerEvents="none"
    >
      {/* Cursor dot */}
      <View
        style={[
          styles.cursorDot,
          { backgroundColor: collaborator.color },
          cursor.isDrawing && styles.cursorDotDrawing,
        ]}
      >
        {cursor.isDrawing && (
          <View
            style={[
              styles.cursorRing,
              { borderColor: collaborator.color },
            ]}
          />
        )}
      </View>

      {/* Name label */}
      <View
        style={[
          styles.nameLabel,
          { backgroundColor: collaborator.color },
        ]}
      >
        <Text style={styles.nameLabelText} numberOfLines={1}>
          {collaborator.name}
        </Text>
      </View>

      {/* Current color indicator */}
      {cursor.currentColor && cursor.isDrawing && (
        <View
          style={[
            styles.colorIndicator,
            { backgroundColor: cursor.currentColor },
          ]}
        />
      )}
    </Animated.View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CollaboratorCursors({
  cursors,
  collaborators,
  canvasOffset = { x: 0, y: 0 },
}: CollaboratorCursorsProps) {
  const cursorData: CursorData[] = [];

  cursors.forEach((cursor, id) => {
    const collaborator = collaborators.find(c => c.id === id);
    if (collaborator) {
      cursorData.push({ position: cursor, collaborator });
    }
  });

  if (cursorData.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {cursorData.map(({ position, collaborator }) => (
        <SingleCursor
          key={collaborator.id}
          cursor={position}
          collaborator={collaborator}
          canvasOffset={canvasOffset}
        />
      ))}
    </View>
  );
}

// ============================================
// COLLABORATORS LIST
// ============================================

interface CollaboratorsListProps {
  collaborators: CollaboratorInfo[];
  currentUserId: string;
}

export function CollaboratorsList({
  collaborators,
  currentUserId,
}: CollaboratorsListProps) {
  return (
    <View style={styles.listContainer}>
      {collaborators.map((collab, index) => (
        <View
          key={collab.id}
          style={[
            styles.collaboratorItem,
            { marginLeft: index > 0 ? -8 : 0 },
          ]}
        >
          <View
            style={[
              styles.collaboratorAvatar,
              { backgroundColor: collab.color },
              collab.id === currentUserId && styles.currentUserAvatar,
            ]}
          >
            <Text style={styles.collaboratorInitial}>
              {collab.name.charAt(0).toUpperCase()}
            </Text>
            {collab.isHost && (
              <View style={styles.hostBadge}>
                <Text style={styles.hostBadgeText}>👑</Text>
              </View>
            )}
          </View>
        </View>
      ))}
      {collaborators.length > 0 && (
        <View style={styles.collaboratorCount}>
          <Text style={styles.collaboratorCountText}>
            {collaborators.length}
          </Text>
        </View>
      )}
    </View>
  );
}

// ============================================
// ROOM CODE DISPLAY
// ============================================

interface RoomCodeDisplayProps {
  code: string;
  onShare?: () => void;
}

export function RoomCodeDisplay({ code, onShare }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handlePress = () => {
    setCopied(true);
    onShare?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.roomCodeContainer}>
      <Text style={styles.roomCodeLabel}>Oda Kodu</Text>
      <View style={styles.roomCodeBox}>
        <Text style={styles.roomCode}>{code}</Text>
      </View>
      <Text style={styles.roomCodeHint}>
        {copied ? '✅ Kopyalandı!' : 'Arkadaşlarınla paylaş'}
      </Text>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: zIndex.overlay,
  },

  // Cursor styles
  cursorContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  cursorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFF',
    ...shadows.sm,
  },
  cursorDotDrawing: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  cursorRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    top: -7,
    left: -7,
    opacity: 0.5,
  },
  nameLabel: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    maxWidth: 100,
  },
  nameLabelText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  colorIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },

  // Collaborators list styles
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  collaboratorItem: {
    zIndex: 1,
  },
  collaboratorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    ...shadows.sm,
  },
  currentUserAvatar: {
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  collaboratorInitial: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  hostBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hostBadgeText: {
    fontSize: 10,
  },
  collaboratorCount: {
    marginLeft: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  collaboratorCountText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Room code styles
  roomCodeContainer: {
    alignItems: 'center',
    padding: 16,
  },
  roomCodeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  roomCodeBox: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  roomCode: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  roomCodeHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});
