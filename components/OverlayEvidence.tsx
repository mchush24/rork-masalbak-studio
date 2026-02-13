import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
interface VisionFeatures {
  composition?: { page_position?: string };
}

export const OverlayEvidence: React.FC<{
  width: number;
  height: number;
  features?: Partial<VisionFeatures>;
}> = ({ width, height, features }) => {
  if (!features) return null;

  const pos = features.composition?.page_position || 'center';
  const rects: { x: number; y: number; w: number; h: number; label: string }[] = [];
  const W = width,
    H = height;
  const box = { w: W * 0.28, h: H * 0.28 };
  const map: Record<string, { x: number; y: number }> = {
    top_left: { x: W * 0.05, y: H * 0.05 },
    top_right: { x: W * 0.67, y: H * 0.05 },
    bottom_left: { x: W * 0.05, y: H * 0.67 },
    bottom_right: { x: W * 0.67, y: H * 0.67 },
    center: { x: W * 0.36, y: H * 0.36 },
  };
  rects.push({ x: map[pos].x, y: map[pos].y, w: box.w, h: box.h, label: 'Yerleşim' });

  return (
    <View style={{ position: 'absolute', left: 0, top: 0, width, height }} pointerEvents="none">
      <Svg width={width} height={height}>
        {rects.map((r, i) => (
          <React.Fragment key={i}>
            <Rect
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              fill="none"
              strokeWidth={2}
              stroke="#00AA77"
            />
            <SvgText x={r.x + 4} y={r.y + 16} fontSize={12} fill="#00AA77">
              {r.label}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};
