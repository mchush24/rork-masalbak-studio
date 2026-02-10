/**
 * IooMascot3D - Native Version (iOS/Android)
 * Uses @react-three/fiber/native with expo-gl
 */

import React, { Suspense, useRef, memo, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { Asset } from 'expo-asset';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { Colors } from '@/constants/colors';

export type IooMood = 'neutral' | 'happy' | 'excited' | 'curious' | 'love' | 'calm' | 'thinking' | 'sleepy' | 'concerned' | 'sad';
export type IooSize = 'xs' | 'sm' | 'md' | 'tiny' | 'small' | 'medium' | 'lg' | 'large' | 'hero' | 'giant';

const SIZE_MAP: Record<IooSize, number> = {
  xs: 80, sm: 100, md: 140, tiny: 100, small: 140,
  medium: 180, lg: 220, large: 260, hero: 320, giant: 400,
};

interface IooProps {
  size?: IooSize | number;
  mood?: IooMood;
  animated?: boolean;
  showGlow?: boolean;
  onPress?: () => void;
  autoRotate?: boolean;
}

function IooModel({ autoRotate = true }: { autoRotate?: boolean }) {
  const modelRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadModel() {
      try {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        dracoLoader.setDecoderConfig({ type: 'js' });
        loader.setDRACOLoader(dracoLoader);

        // Native: Use expo-asset
        const asset = Asset.fromModule(require('../assets/models/ioo-mascot.glb'));
        await asset.downloadAsync();
        const modelUri = asset.localUri || asset.uri;

        if (!mounted) return;

        loader.load(
          modelUri,
          (gltf) => { if (mounted) setModel(gltf.scene); },
          undefined,
          (error) => console.error('Error loading 3D model:', error)
        );
      } catch (error) {
        console.error('Error loading model:', error);
      }
    }

    loadModel();
    return () => { mounted = false; };
  }, []);

  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
      if (autoRotate) {
        modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
      }
      const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      modelRef.current.scale.setScalar(breathe * 1.5);
    }
  });

  if (!model) return null;
  return <group ref={modelRef}><primitive object={model} /></group>;
}

export const IooMascot3D = memo(function IooMascot3D({
  size = 'medium',
  animated = true,
  showGlow = true,
  onPress,
  autoRotate = true,
}: IooProps) {
  const dimensions = typeof size === 'number' ? size : SIZE_MAP[size];

  const Content = (
    <View style={[styles.container, { width: dimensions, height: dimensions }]}>
      <Canvas
        style={styles.canvas}
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#ffd6e0" />
        <pointLight position={[0, 2, 2]} intensity={0.5} color={Colors.secondary.lavender} />
        <Suspense fallback={null}>
          <IooModel autoRotate={autoRotate && animated} />
        </Suspense>
      </Canvas>
      {showGlow && (
        <View style={[styles.glow, { width: dimensions * 0.8, height: dimensions * 0.8 }]} />
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{Content}</Pressable>;
  }
  return Content;
});

const styles = StyleSheet.create({
  container: { position: 'relative', overflow: 'visible' },
  canvas: { flex: 1, backgroundColor: 'transparent' },
  glow: {
    position: 'absolute', top: '10%', left: '10%',
    backgroundColor: 'rgba(167, 139, 250, 0.15)', borderRadius: 1000, zIndex: -1,
  },
});

export default IooMascot3D;
