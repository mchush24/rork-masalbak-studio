import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Smile, Sun, Flower } from 'lucide-react-native';
import { spacing, borderRadius, typography, shadows } from '@/lib/design-tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;

interface AnalysisShareCardProps {
  summary: string;
  mood: 'happy' | 'neutral' | 'sad';
  onSave?: () => void;
}

export function AnalysisShareCard({ summary, mood, onSave }: AnalysisShareCardProps) {
  const getMoodEmoji = () => {
    switch (mood) {
      case 'happy':
        return '😊';
      case 'neutral':
        return '😐';
      case 'sad':
        return '😔';
      default:
        return '😊';
    }
  };

  const getMoodColor = () => {
    switch (mood) {
      case 'happy':
        return '#7ED99C';
      case 'neutral':
        return '#FFD56B';
      case 'sad':
        return '#FFB299';
      default:
        return '#7ED99C';
    }
  };

  return (
    <View style={[styles.container, shadows.xl]}>
      <LinearGradient
        colors={['#FFF9E6', '#FFE8CC', '#FFF5F2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Logo */}
        <View style={styles.header}>
          <Text style={styles.logoText}>
            RENK<Text style={styles.logoAccent}>İOO</Text>
          </Text>
        </View>

        {/* Decorative Elements */}
        <View style={styles.decorationContainer}>
          <View style={[styles.sunContainer, { backgroundColor: getMoodColor() }]}>
            <Sun size={32} color="white" strokeWidth={2} />
          </View>
        </View>

        {/* Character Illustration (Emoji-based) */}
        <View style={styles.characterContainer}>
          <View style={styles.characterCircle}>
            <Text style={styles.characterEmoji}>{getMoodEmoji()}</Text>
          </View>

          {/* Decorative flowers */}
          <View style={styles.flowerLeft}>
            <Flower size={28} color="#FF9B7A" fill="#FFB299" strokeWidth={1.5} />
          </View>
          <View style={styles.flowerRight}>
            <Flower size={24} color="#A78BFA" fill="#C4B5FD" strokeWidth={1.5} />
          </View>

          {/* Grass */}
          <View style={styles.grassContainer}>
            <View style={[styles.grass, { backgroundColor: '#7ED99C' }]} />
            <View style={[styles.grass, { backgroundColor: '#A8E8BA', marginLeft: -10 }]} />
            <View style={[styles.grass, { backgroundColor: '#7ED99C', marginLeft: -10 }]} />
          </View>
        </View>

        {/* Summary Text */}
        <View style={styles.textContainer}>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>

        {/* Bottom decoration */}
        <View style={styles.bottomDecoration}>
          <View style={[styles.dot, { backgroundColor: '#FF9B7A' }]} />
          <View style={[styles.dot, { backgroundColor: '#FFD56B' }]} />
          <View style={[styles.dot, { backgroundColor: '#7ED99C' }]} />
          <View style={[styles.dot, { backgroundColor: '#78C8E8' }]} />
          <View style={[styles.dot, { backgroundColor: '#A78BFA' }]} />
        </View>

        {/* Save Button */}
        {onSave && (
          <Pressable onPress={onSave} style={[styles.saveButton, shadows.md]}>
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </Pressable>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    aspectRatio: 0.75, // Portrait card
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    alignSelf: 'center',
    marginVertical: spacing.lg,
  },
  gradient: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '800',
    color: '#2E3F5C',
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: '#FF9B7A',
  },
  decorationContainer: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
  },
  sunContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
    position: 'relative',
  },
  characterCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFD56B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  characterEmoji: {
    fontSize: 64,
  },
  flowerLeft: {
    position: 'absolute',
    left: '15%',
    bottom: '30%',
  },
  flowerRight: {
    position: 'absolute',
    right: '15%',
    bottom: '35%',
  },
  grassContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  grass: {
    width: 40,
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  textContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 155, 122, 0.3)',
  },
  summaryText: {
    fontSize: typography.fontSize.base,
    color: '#2E3F5C',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.5,
  },
  bottomDecoration: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  saveButton: {
    backgroundColor: '#FF9B7A',
    borderRadius: borderRadius.xxxl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  saveButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.3,
  },
});
