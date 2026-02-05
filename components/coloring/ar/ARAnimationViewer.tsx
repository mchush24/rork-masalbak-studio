/**
 * ARAnimationViewer - Artırılmış Gerçeklik Animasyon Görüntüleyici
 *
 * Phase 3: AR Animation (Quiver-like)
 * - Boyamaları 3D animasyonlara dönüştürme
 * - Kamera tabanlı AR deneyimi
 * - Farklı animasyon temaları
 * - Ses efektleri ile senkronize animasyon
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
  Image,
  Platform,
} from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { shadows, textShadows } from '@/constants/design-system';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

export type AnimationTheme =
  | 'float'       // Yüzen hareket
  | 'bounce'      // Zıplama
  | 'spin'        // Dönme
  | 'wave'        // Dalga
  | 'breathe'     // Nefes alma
  | 'dance'       // Dans
  | 'fly'         // Uçuş
  | 'sparkle';    // Parıltı

interface AnimationConfig {
  id: AnimationTheme;
  name: string;
  icon: string;
  description: string;
}

interface ARAnimationViewerProps {
  imageUri: string;
  artworkTitle?: string;
  onClose: () => void;
  onCapture?: (capturedUri: string) => void;
}

// ============================================
// ANIMATION THEMES
// ============================================

const ANIMATION_THEMES: AnimationConfig[] = [
  { id: 'float', name: 'Süzül', icon: '🎈', description: 'Hafifçe yüzer' },
  { id: 'bounce', name: 'Zıpla', icon: '🏀', description: 'Neşeyle zıplar' },
  { id: 'spin', name: 'Dön', icon: '🌀', description: 'Yavaşça döner' },
  { id: 'wave', name: 'Dalga', icon: '🌊', description: 'Dalga gibi hareket' },
  { id: 'breathe', name: 'Nefes', icon: '💨', description: 'Nefes alır verir' },
  { id: 'dance', name: 'Dans', icon: '💃', description: 'Ritimle sallanır' },
  { id: 'fly', name: 'Uç', icon: '🦋', description: 'Gökyüzünde uçar' },
  { id: 'sparkle', name: 'Parla', icon: '✨', description: 'Işıl ışıl parlar' },
];

// ============================================
// ANIMATED ARTWORK COMPONENT
// ============================================

interface AnimatedArtworkProps {
  imageUri: string;
  theme: AnimationTheme;
  isPlaying: boolean;
}

function AnimatedArtwork({ imageUri, theme, isPlaying }: AnimatedArtworkProps) {
  // Animation values
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Sparkle animations
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPlaying) {
      // Reset all animations
      translateY.setValue(0);
      translateX.setValue(0);
      scale.setValue(1);
      rotate.setValue(0);
      return;
    }

    let animation: Animated.CompositeAnimation;

    switch (theme) {
      case 'float':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: -20,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'bounce':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: -40,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1.1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.delay(500),
          ])
        );
        break;

      case 'spin':
        animation = Animated.loop(
          Animated.timing(rotate, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          })
        );
        break;

      case 'wave':
        animation = Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(translateY, {
                toValue: -15,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: 15,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(rotate, {
                toValue: 0.02,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(rotate, {
                toValue: -0.02,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
          ])
        );
        break;

      case 'breathe':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.15,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'dance':
        animation = Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: 15,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.timing(rotate, {
                toValue: 0.05,
                duration: 250,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: -15,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.timing(rotate, {
                toValue: -0.05,
                duration: 250,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: 15,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.timing(rotate, {
                toValue: 0.05,
                duration: 250,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(translateX, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.timing(rotate, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
              }),
            ]),
            Animated.delay(500),
          ])
        );
        break;

      case 'fly':
        animation = Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(translateY, {
                toValue: -50,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(translateX, {
                toValue: 30,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(translateX, {
                toValue: -30,
                duration: 1500,
                useNativeDriver: true,
              }),
              Animated.timing(translateX, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]),
          ])
        );
        break;

      case 'sparkle':
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.05,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        );

        // Sparkle effects
        Animated.loop(
          Animated.stagger(300, [
            Animated.sequence([
              Animated.timing(sparkle1, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(sparkle1, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(sparkle2, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(sparkle2, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(sparkle3, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.timing(sparkle3, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
          ])
        ).start();
        break;

      default:
        return;
    }

    animation.start();

    return () => {
      animation.stop();
    };
  }, [theme, isPlaying]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.artworkContainer}>
      <Animated.View
        style={[
          styles.artworkWrapper,
          {
            transform: [
              { translateY },
              { translateX },
              { scale },
              { rotate: theme === 'spin' ? rotateInterpolate : rotate.interpolate({
                inputRange: [-1, 1],
                outputRange: ['-15deg', '15deg'],
              }) },
            ],
          },
        ]}
      >
        {/* Shadow */}
        <View style={styles.artworkShadow} />

        {/* Main Image */}
        <Image
          source={{ uri: imageUri }}
          style={styles.artworkImage}
          resizeMode="contain"
        />

        {/* Sparkle Effects */}
        {theme === 'sparkle' && (
          <>
            <Animated.Text
              style={[
                styles.sparkle,
                styles.sparkle1,
                { opacity: sparkle1 },
              ]}
            >
              ✨
            </Animated.Text>
            <Animated.Text
              style={[
                styles.sparkle,
                styles.sparkle2,
                { opacity: sparkle2 },
              ]}
            >
              ⭐
            </Animated.Text>
            <Animated.Text
              style={[
                styles.sparkle,
                styles.sparkle3,
                { opacity: sparkle3 },
              ]}
            >
              💫
            </Animated.Text>
          </>
        )}
      </Animated.View>
    </View>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ARAnimationViewer({
  imageUri,
  artworkTitle = 'Eserim',
  onClose,
  onCapture,
}: ARAnimationViewerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<AnimationTheme>('float');
  const [isPlaying, setIsPlaying] = useState(true);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [isARMode, setIsARMode] = useState(true);

  const cameraRef = useRef<CameraView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCapture = async () => {
    if (cameraRef.current && onCapture) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          onCapture(photo.uri);
        }
      } catch (error) {
        console.error('Capture error:', error);
      }
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleARMode = () => {
    setIsARMode(!isARMode);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Kamera izni isteniyor...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>📷</Text>
          <Text style={styles.permissionTitle}>Kamera İzni Gerekli</Text>
          <Text style={styles.permissionText}>
            AR özelliğini kullanmak için kamera iznine ihtiyacımız var.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={onClose}>
            <Text style={styles.permissionButtonText}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <Modal visible animationType="fade" statusBarTranslucent>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Camera or Gradient Background */}
        {isARMode ? (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          />
        ) : (
          <LinearGradient
            colors={['#667eea', '#764ba2', '#f093fb']}
            style={styles.gradientBackground}
          />
        )}

        {/* Animated Artwork Overlay */}
        <AnimatedArtwork
          imageUri={imageUri}
          theme={selectedTheme}
          isPlaying={isPlaying}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>{artworkTitle}</Text>
            <Text style={styles.subtitle}>canlandı!</Text>
          </View>

          <TouchableOpacity
            style={styles.modeButton}
            onPress={toggleARMode}
          >
            <Text style={styles.modeButtonText}>
              {isARMode ? '🎨' : '📷'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Theme Selector */}
        {showThemeSelector && (
          <View style={styles.themeSelector}>
            <Text style={styles.themeSelectorTitle}>Animasyon Seç</Text>
            <View style={styles.themeGrid}>
              {ANIMATION_THEMES.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeItem,
                    selectedTheme === theme.id && styles.themeItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedTheme(theme.id);
                    setShowThemeSelector(false);
                  }}
                >
                  <Text style={styles.themeIcon}>{theme.icon}</Text>
                  <Text style={styles.themeName}>{theme.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Theme Button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowThemeSelector(!showThemeSelector)}
          >
            <Text style={styles.controlIcon}>
              {ANIMATION_THEMES.find(t => t.id === selectedTheme)?.icon}
            </Text>
            <Text style={styles.controlLabel}>Animasyon</Text>
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
          >
            <View style={styles.captureButtonInner}>
              <Text style={styles.captureIcon}>📸</Text>
            </View>
          </TouchableOpacity>

          {/* Play/Pause Button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={togglePlay}
          >
            <Text style={styles.controlIcon}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
            <Text style={styles.controlLabel}>
              {isPlaying ? 'Durdur' : 'Oynat'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            📱 Kamerayı hareket ettir ve eserini gerçek dünyada gör!
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ============================================
// AR BUTTON (Trigger)
// ============================================

interface ARButtonProps {
  onPress: () => void;
  size?: number;
}

export function ARButton({ onPress, size = 48 }: ARButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.arButton,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={[styles.arButtonGradient, { borderRadius: size / 2 }]}
        >
          <Text style={[styles.arButtonText, { fontSize: size * 0.35 }]}>
            AR
          </Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },

  // Artwork
  artworkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkWrapper: {
    width: SCREEN_WIDTH * 0.7,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkShadow: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    bottom: -10,
    transform: [{ scaleY: 0.3 }],
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 32,
  },
  sparkle1: {
    top: -20,
    right: 10,
  },
  sparkle2: {
    bottom: 20,
    left: -10,
  },
  sparkle3: {
    top: 40,
    left: 20,
  },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    ...textShadows.lg,
  },
  subtitle: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
    ...textShadows.lg,
  },
  modeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 22,
  },

  // Theme Selector
  themeSelector: {
    position: 'absolute',
    bottom: 150,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 16,
  },
  themeSelectorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeItem: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  themeItemSelected: {
    backgroundColor: '#E8E4FF',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  themeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  themeName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },

  // Bottom Controls
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  controlLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF',
    padding: 4,
  },
  captureButtonInner: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureIcon: {
    fontSize: 28,
  },

  // Instructions
  instructions: {
    position: 'absolute',
    bottom: 130,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  instructionsText: {
    color: '#FFF',
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },

  // Permission
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // AR Button
  arButton: {
    ...shadows.colored('#667eea'),
  },
  arButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arButtonText: {
    color: '#FFF',
    fontWeight: '800',
  },
});
