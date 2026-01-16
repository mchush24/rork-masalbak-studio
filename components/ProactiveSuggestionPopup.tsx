/**
 * 💡 Proactive Suggestion Popup
 *
 * Ekran bazlı otomatik yardım önerileri gösteren popup
 * Faz 3B: Proaktif Öneriler
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MessageCircle,
  X,
  ChevronRight,
  Lightbulb,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { trpc } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

interface ProactiveSuggestionPopupProps {
  screen: string;
  onQuestionPress?: (question: string) => void;
  onOpenChat?: () => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  delay?: number; // ms before showing
  idleTimeout?: number; // ms of idle before showing idle trigger
}

type TriggerType = 'enter' | 'idle' | 'error' | 'first_visit';

// ============================================
// STORAGE KEYS
// ============================================

const VISITED_SCREENS_KEY = 'renkioo_visited_screens';
const DISMISSED_SUGGESTIONS_KEY = 'renkioo_dismissed_suggestions';

// ============================================
// MAIN COMPONENT
// ============================================

export function ProactiveSuggestionPopup({
  screen,
  onQuestionPress,
  onOpenChat,
  position = 'bottom-left',
  delay = 1500,
  idleTimeout = 30000,
}: ProactiveSuggestionPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState<TriggerType | null>(null);
  const [hasShownForScreen, setHasShownForScreen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch suggestion based on screen and trigger
  const suggestionQuery = trpc.chatbot.getProactiveSuggestion.useQuery(
    { screen, trigger: currentTrigger || 'enter' },
    { enabled: !!currentTrigger && !hasShownForScreen }
  );

  // Check if first visit
  useEffect(() => {
    checkFirstVisit();
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [screen]);

  // Show popup when suggestion is available
  useEffect(() => {
    if (suggestionQuery.data?.found && suggestionQuery.data.suggestion && !hasShownForScreen) {
      showPopup();
    }
  }, [suggestionQuery.data]);

  const checkFirstVisit = async () => {
    try {
      // Check dismissed suggestions
      const dismissedRaw = await AsyncStorage.getItem(DISMISSED_SUGGESTIONS_KEY);
      const dismissed = dismissedRaw ? JSON.parse(dismissedRaw) : [];

      // Don't show if user dismissed this screen's suggestions today
      const todayKey = `${screen}_${new Date().toDateString()}`;
      if (dismissed.includes(todayKey)) {
        setHasShownForScreen(true);
        return;
      }

      // Check visited screens
      const visitedRaw = await AsyncStorage.getItem(VISITED_SCREENS_KEY);
      const visited = visitedRaw ? JSON.parse(visitedRaw) : [];

      if (!visited.includes(screen)) {
        // First visit - show after delay
        setTimeout(() => {
          setCurrentTrigger('first_visit');
        }, delay);

        // Mark as visited
        await AsyncStorage.setItem(
          VISITED_SCREENS_KEY,
          JSON.stringify([...visited, screen])
        );
      } else {
        // Not first visit - show enter trigger after delay
        setTimeout(() => {
          setCurrentTrigger('enter');
        }, delay);

        // Setup idle timer
        setupIdleTimer();
      }
    } catch (error) {
      console.error('[ProactiveSuggestion] Error checking first visit:', error);
      // Fallback to enter trigger
      setTimeout(() => {
        setCurrentTrigger('enter');
      }, delay);
    }
  };

  const setupIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      if (!isVisible && !hasShownForScreen) {
        setCurrentTrigger('idle');
      }
    }, idleTimeout);
  };

  const showPopup = () => {
    setIsVisible(true);
    setHasShownForScreen(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const hidePopup = async () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });

    // Mark as dismissed for today
    try {
      const dismissedRaw = await AsyncStorage.getItem(DISMISSED_SUGGESTIONS_KEY);
      const dismissed = dismissedRaw ? JSON.parse(dismissedRaw) : [];
      const todayKey = `${screen}_${new Date().toDateString()}`;
      if (!dismissed.includes(todayKey)) {
        await AsyncStorage.setItem(
          DISMISSED_SUGGESTIONS_KEY,
          JSON.stringify([...dismissed, todayKey])
        );
      }
    } catch (error) {
      console.error('[ProactiveSuggestion] Error saving dismissed:', error);
    }
  };

  const handleQuestionPress = (question: string) => {
    hidePopup();
    if (onQuestionPress) {
      onQuestionPress(question);
    } else if (onOpenChat) {
      onOpenChat();
    }
  };

  const handleOpenChat = () => {
    hidePopup();
    if (onOpenChat) {
      onOpenChat();
    }
  };

  // Don't render if no suggestion or not visible
  if (!isVisible || !suggestionQuery.data?.found || !suggestionQuery.data.suggestion) {
    return null;
  }

  const suggestion = suggestionQuery.data.suggestion;

  // Position styles
  const positionStyle = {
    'bottom-left': { bottom: 100, left: 16 },
    'bottom-right': { bottom: 100, right: 16 },
    'top-left': { top: 100, left: 16 },
    'top-right': { top: 100, right: 16 },
  }[position];

  return (
    <Animated.View
      style={[
        styles.container,
        positionStyle,
        {
          opacity: slideAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
            {
              scale: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Lightbulb size={16} color="#0D9488" />
          </View>
          <Text style={styles.headerTitle}>Yardım mı lazım?</Text>
        </View>
        <Pressable onPress={hidePopup} style={styles.closeButton}>
          <X size={16} color={Colors.neutral.medium} />
        </Pressable>
      </View>

      {/* Message */}
      <Text style={styles.message}>{suggestion.message}</Text>

      {/* Quick Questions */}
      <View style={styles.questionsContainer}>
        {suggestion.questions.slice(0, 3).map((question, idx) => (
          <Pressable
            key={idx}
            style={({ pressed }) => [
              styles.questionButton,
              pressed && styles.questionButtonPressed,
            ]}
            onPress={() => handleQuestionPress(question)}
          >
            <Text style={styles.questionText} numberOfLines={1}>
              {question}
            </Text>
            <ChevronRight size={14} color="#0D9488" />
          </Pressable>
        ))}
      </View>

      {/* Open Chat Button */}
      <Pressable
        style={({ pressed }) => [
          styles.openChatButton,
          pressed && { opacity: 0.8 },
        ]}
        onPress={handleOpenChat}
      >
        <LinearGradient
          colors={['#0D9488', '#14B8A6']}
          style={styles.openChatGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <MessageCircle size={16} color="#FFF" />
          <Text style={styles.openChatText}>Sohbeti Aç</Text>
        </LinearGradient>
      </Pressable>

      {/* Arrow pointer */}
      <View style={[
        styles.arrow,
        position.includes('left') ? styles.arrowLeft : styles.arrowRight,
        position.includes('bottom') ? styles.arrowBottom : styles.arrowTop,
      ]} />
    </Animated.View>
  );
}

// ============================================
// HOOK: useProactiveSuggestion
// ============================================

export function useProactiveSuggestion(screen: string) {
  const [showPopup, setShowPopup] = useState(false);

  const openPopup = () => setShowPopup(true);
  const closePopup = () => setShowPopup(false);

  return {
    showPopup,
    openPopup,
    closePopup,
    ProactiveSuggestionComponent: showPopup ? (
      <ProactiveSuggestionPopup screen={screen} />
    ) : null,
  };
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: SCREEN_WIDTH - 32,
    maxWidth: 320,
    backgroundColor: '#FFF',
    borderRadius: radius['2xl'],
    padding: spacing['4'],
    ...shadows.lg,
    zIndex: 999,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['3'],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral.lightest,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Message
  message: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    lineHeight: 20,
    marginBottom: spacing['3'],
  },

  // Questions
  questionsContainer: {
    gap: spacing['2'],
    marginBottom: spacing['3'],
  },
  questionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['3'],
    backgroundColor: 'rgba(13, 148, 136, 0.05)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.1)',
  },
  questionButtonPressed: {
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
  },
  questionText: {
    flex: 1,
    fontSize: typography.size.xs,
    color: Colors.neutral.dark,
    marginRight: spacing['2'],
  },

  // Open Chat
  openChatButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  openChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['2.5'],
    paddingHorizontal: spacing['4'],
  },
  openChatText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: '#FFF',
  },

  // Arrow
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
  arrowLeft: {
    left: 24,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowRight: {
    right: 24,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowBottom: {
    bottom: -8,
    borderTopWidth: 8,
    borderBottomWidth: 0,
    borderTopColor: '#FFF',
  },
  arrowTop: {
    top: -8,
    borderTopWidth: 0,
    borderBottomWidth: 8,
    borderBottomColor: '#FFF',
  },
});

export default ProactiveSuggestionPopup;
