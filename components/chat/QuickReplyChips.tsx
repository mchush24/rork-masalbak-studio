/**
 * Quick Reply Chips Component
 *
 * Suggested action buttons that appear after bot messages.
 * Based on UX research: chips should be visually distinct,
 * disappear after use, and limited to 3-4 options max.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';

export interface QuickReply {
  id: string;
  label: string;
  emoji?: string;
  action?: 'send' | 'navigate' | 'custom';
  target?: string;
}

interface QuickReplyChipsProps {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
  visible?: boolean;
  animated?: boolean;
}

export function QuickReplyChips({
  replies,
  onSelect,
  visible = true,
  animated = true,
}: QuickReplyChipsProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible && animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!visible) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible || replies.length === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        animated && {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {replies.map((reply, index) => (
          <QuickReplyChip
            key={reply.id}
            reply={reply}
            onPress={() => onSelect(reply)}
            delay={index * 50}
            animated={animated}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

interface QuickReplyChipProps {
  reply: QuickReply;
  onPress: () => void;
  delay?: number;
  animated?: boolean;
}

function QuickReplyChip({
  reply,
  onPress,
  delay = 0,
  animated = true,
}: QuickReplyChipProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }, delay);
      return () => clearTimeout(timer);
    } else {
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
    }
  }, [delay, animated]);

  const handlePress = () => {
    // Bounce animation on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.chipWrapper,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.chip,
          pressed && styles.chipPressed,
        ]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8FAFC']}
          style={styles.chipGradient}
        >
          {reply.emoji && (
            <Text style={styles.chipEmoji}>{reply.emoji}</Text>
          )}
          <Text style={styles.chipLabel}>{reply.label}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// Pre-defined quick reply sets for common scenarios
export const QUICK_REPLIES = {
  // Default welcome - general options
  welcome: [
    { id: 'create-story', label: 'Masal Oluştur', emoji: '📖', action: 'navigate' as const, target: '/(tabs)/stories' },
    { id: 'analyze', label: 'Çizim Analiz Et', emoji: '🎨', action: 'navigate' as const, target: '/(tabs)/analysis' },
    { id: 'coloring', label: 'Boyama Yap', emoji: '🖍️', action: 'navigate' as const, target: '/(tabs)/coloring' },
    { id: 'help', label: 'Yardım', emoji: '❓', action: 'send' as const },
  ],
  afterAnswer: [
    { id: 'helpful-yes', label: 'Evet, teşekkürler', emoji: '👍', action: 'send' as const },
    { id: 'helpful-no', label: 'Hayır, başka sorum var', emoji: '🤔', action: 'send' as const },
    { id: 'main-menu', label: 'Ana Menü', emoji: '🏠', action: 'custom' as const },
  ],
  storyHelp: [
    { id: 'upload-drawing', label: 'Çizim Yükle', emoji: '📸', action: 'navigate' as const, target: '/(tabs)/stories' },
    { id: 'see-example', label: 'Örnek Gör', emoji: '👀', action: 'send' as const },
    { id: 'themes', label: 'Tema Önerileri', emoji: '✨', action: 'send' as const },
  ],
  coloringHelp: [
    { id: 'color-suggest', label: 'Renk Öner', emoji: '🎨', action: 'send' as const },
    { id: 'save-work', label: 'Nasıl Kaydederim?', emoji: '💾', action: 'send' as const },
    { id: 'print', label: 'Yazdırma', emoji: '🖨️', action: 'send' as const },
  ],
  analysisHelp: [
    { id: 'what-is', label: 'Analiz Nedir?', emoji: '🔍', action: 'send' as const },
    { id: 'meaning', label: 'Sonuçlar Ne Anlama Geliyor?', emoji: '📊', action: 'send' as const },
    { id: 'concern', label: 'Endişelenmeli miyim?', emoji: '💭', action: 'send' as const },
  ],
  error: [
    { id: 'retry', label: 'Tekrar Dene', emoji: '🔄', action: 'custom' as const },
    { id: 'contact', label: 'Destek', emoji: '📧', action: 'send' as const },
  ],

  // Screen-specific welcome messages
  welcomeStories: [
    { id: 'how-story', label: 'Nasıl masal oluşturabilirim?', emoji: '📖', action: 'send' as const },
    { id: 'upload-drawing', label: 'Çizim Yükle', emoji: '📸', action: 'navigate' as const, target: '/(tabs)/stories' },
    { id: 'theme-ideas', label: 'Tema Önerileri', emoji: '✨', action: 'send' as const },
    { id: 'other-help', label: 'Başka Yardım', emoji: '❓', action: 'send' as const },
  ],
  welcomeAnalysis: [
    { id: 'what-analysis', label: 'Analiz ne işe yarar?', emoji: '🔍', action: 'send' as const },
    { id: 'how-interpret', label: 'Sonuçları nasıl yorumlayım?', emoji: '📊', action: 'send' as const },
    { id: 'start-analysis', label: 'Analiz Başlat', emoji: '🎨', action: 'navigate' as const, target: '/(tabs)/analysis' },
    { id: 'other-help', label: 'Başka Yardım', emoji: '❓', action: 'send' as const },
  ],
  welcomeColoring: [
    { id: 'color-tips', label: 'Renk önerileri', emoji: '🎨', action: 'send' as const },
    { id: 'how-save', label: 'Nasıl kaydederim?', emoji: '💾', action: 'send' as const },
    { id: 'how-print', label: 'Yazdırma', emoji: '🖨️', action: 'send' as const },
    { id: 'other-help', label: 'Başka Yardım', emoji: '❓', action: 'send' as const },
  ],
  welcomeProfile: [
    { id: 'add-child', label: 'Çocuk Ekle', emoji: '👶', action: 'send' as const },
    { id: 'account-settings', label: 'Hesap Ayarları', emoji: '⚙️', action: 'send' as const },
    { id: 'subscription', label: 'Abonelik', emoji: '💳', action: 'send' as const },
    { id: 'other-help', label: 'Başka Yardım', emoji: '❓', action: 'send' as const },
  ],
  welcomeHome: [
    { id: 'what-can-do', label: 'Neler yapabilirim?', emoji: '🤔', action: 'send' as const },
    { id: 'create-story', label: 'Masal Oluştur', emoji: '📖', action: 'navigate' as const, target: '/(tabs)/stories' },
    { id: 'try-coloring', label: 'Boyama Yap', emoji: '🖍️', action: 'navigate' as const, target: '/(tabs)/coloring' },
    { id: 'analyze', label: 'Çizim Analiz Et', emoji: '🎨', action: 'navigate' as const, target: '/(tabs)/analysis' },
  ],
};

// Get screen-specific welcome quick replies
export const getWelcomeQuickReplies = (screen: string): QuickReply[] => {
  switch (screen) {
    case 'stories':
      return QUICK_REPLIES.welcomeStories;
    case 'analysis':
      return QUICK_REPLIES.welcomeAnalysis;
    case 'coloring':
      return QUICK_REPLIES.welcomeColoring;
    case 'profile':
      return QUICK_REPLIES.welcomeProfile;
    case 'home':
      return QUICK_REPLIES.welcomeHome;
    default:
      return QUICK_REPLIES.welcome;
  }
};

// Get screen-specific welcome message
export const getWelcomeMessage = (screen: string): string => {
  switch (screen) {
    case 'stories':
      return 'Merhaba! 📖 Masal oluşturmak mı istiyorsun?';
    case 'analysis':
      return 'Merhaba! 🔍 Çizim analizi hakkında yardımcı olayım mı?';
    case 'coloring':
      return 'Merhaba! 🎨 Boyama yaparken yardımcı olayım mı?';
    case 'profile':
      return 'Merhaba! 👋 Profil ayarlarında yardımcı olayım mı?';
    case 'home':
      return 'Merhaba! 👋 Bugün ne yapmak istersin?';
    default:
      return 'Merhaba! 👋 Ne yapmak istersin?';
  }
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing['2'],
  },
  scrollContent: {
    paddingHorizontal: spacing['2'],
    gap: spacing['2'],
  },
  chipWrapper: {
    marginRight: spacing['2'],
  },
  chip: {
    borderRadius: radius.full,
    overflow: 'hidden',
    ...shadows.sm,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['3'],
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.2)',
    borderRadius: radius.full,
    gap: spacing['1'],
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.dark,
  },
});

export default QuickReplyChips;
