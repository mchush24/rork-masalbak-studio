import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { VisionFeatures } from '@/types/AssessmentSchema';

interface OverlayEvidenceProps {
  width: number;
  height: number;
  features?: Partial<VisionFeatures>;
}

export const OverlayEvidence: React.FC<OverlayEvidenceProps> = ({ width, height, features }) => {
  if (!features) return null;

  const pos = features.composition?.page_position || 'center';
  const W = width;
  const H = height;
  const boxW = W * 0.28;
  const boxH = H * 0.28;

  const positionMap: Record<string, { x: number; y: number }> = {
    top_left: { x: W * 0.05, y: H * 0.05 },
    top_right: { x: W * 0.67, y: H * 0.05 },
    bottom_left: { x: W * 0.05, y: H * 0.67 },
    bottom_right: { x: W * 0.67, y: H * 0.67 },
    center: { x: W * 0.36, y: H * 0.36 },
  };

  const coords = positionMap[pos] || positionMap.center;

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      <View
        style={[
          styles.overlay,
          {
            left: coords.x,
            top: coords.y,
            width: boxW,
            height: boxH,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  overlay: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#00AA77',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
});
