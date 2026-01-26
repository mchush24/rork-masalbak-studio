import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { RenkooColors } from '@/constants/colors';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  borderRadius?: number;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  style,
  intensity = 70,
  tint = 'light',
  borderRadius = 24,
}) => {
  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[styles.blurView, { borderRadius }]}
      />
      <View style={[styles.border, { borderRadius }]} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: RenkooColors.glass.surface,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: RenkooColors.glass.border,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

export default GlassContainer;
