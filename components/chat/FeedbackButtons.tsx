/**
 * Feedback Buttons Component
 *
 * Thumbs up/down buttons for collecting user feedback on bot responses.
 * Based on UX research: "Integrating lightweight feedback options helps
 * users feel heard even when they don't get what they want."
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { ThumbsUp, ThumbsDown } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius } from '@/constants/design-system';
import { buttonStyles } from '@/constants/design-system';

type FeedbackType = 'positive' | 'negative' | null;

interface FeedbackButtonsProps {
  messageId: string;
  onFeedback?: (messageId: string, feedback: FeedbackType) => void;
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

export function FeedbackButtons({
  messageId,
  onFeedback,
  size = 'small',
  showLabel = false,
}: FeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [showThanks, setShowThanks] = useState(false);

  const scalePositive = useRef(new Animated.Value(1)).current;
  const scaleNegative = useRef(new Animated.Value(1)).current;
  const thanksOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  const iconSize = size === 'small' ? 14 : 18;

  const handleFeedback = (type: FeedbackType) => {
    if (feedback) return; // Already gave feedback

    setFeedback(type);
    onFeedback?.(messageId, type);

    // Animate the selected button
    const scaleAnim = type === 'positive' ? scalePositive : scaleNegative;

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Show thank you message
    setShowThanks(true);
    Animated.timing(thanksOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Hide after 2 seconds
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(thanksOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(containerOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowThanks(false);
      });
    }, 2000);
  };

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {showLabel && !feedback && (
        <Text style={styles.label}>Yararlı oldu mu?</Text>
      )}

      <View style={styles.buttonsRow}>
        {/* Thumbs Up */}
        <Animated.View style={{ transform: [{ scale: scalePositive }] }}>
          <Pressable
            onPress={() => handleFeedback('positive')}
            disabled={feedback !== null}
            style={({ pressed }) => [
              styles.button,
              feedback === 'positive' && styles.buttonSelected,
              feedback === 'positive' && styles.buttonPositive,
              pressed && !feedback && styles.buttonPressed,
            ]}
          >
            <ThumbsUp
              size={iconSize}
              color={feedback === 'positive' ? Colors.semantic.success : Colors.neutral.medium}
              fill={feedback === 'positive' ? Colors.semantic.success : 'transparent'}
            />
          </Pressable>
        </Animated.View>

        {/* Thumbs Down */}
        <Animated.View style={{ transform: [{ scale: scaleNegative }] }}>
          <Pressable
            onPress={() => handleFeedback('negative')}
            disabled={feedback !== null}
            style={({ pressed }) => [
              styles.button,
              feedback === 'negative' && styles.buttonSelected,
              feedback === 'negative' && styles.buttonNegative,
              pressed && !feedback && styles.buttonPressed,
            ]}
          >
            <ThumbsDown
              size={iconSize}
              color={feedback === 'negative' ? Colors.semantic.error : Colors.neutral.medium}
              fill={feedback === 'negative' ? Colors.semantic.error : 'transparent'}
            />
          </Pressable>
        </Animated.View>
      </View>

      {/* Thank you message */}
      {showThanks && (
        <Animated.View style={[styles.thanksContainer, { opacity: thanksOpacity }]}>
          <Text style={styles.thanksText}>
            {feedback === 'positive' ? 'Teşekkürler! 😊' : 'Geri bildiriminiz için teşekkürler'}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

/**
 * Inline feedback for compact display
 */
export function InlineFeedback({
  messageId,
  onFeedback,
}: {
  messageId: string;
  onFeedback?: (messageId: string, feedback: FeedbackType) => void;
}) {
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFeedback = (type: FeedbackType) => {
    if (feedback) return;
    setFeedback(type);
    onFeedback?.(messageId, type);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (feedback) {
    return (
      <Animated.View style={[styles.inlineContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.inlineFeedbackGiven}>
          {feedback === 'positive' ? '👍' : '👎'}
        </Text>
      </Animated.View>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      <Pressable
        onPress={() => handleFeedback('positive')}
        style={({ pressed }) => [
          styles.inlineButton,
          pressed && styles.inlineButtonPressed,
        ]}
      >
        <Text style={styles.inlineEmoji}>👍</Text>
      </Pressable>
      <Pressable
        onPress={() => handleFeedback('negative')}
        style={({ pressed }) => [
          styles.inlineButton,
          pressed && styles.inlineButtonPressed,
        ]}
      >
        <Text style={styles.inlineEmoji}>👎</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  label: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    marginRight: spacing['1'],
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing['1'],
  },
  button: {
    ...buttonStyles.circularButton.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  buttonSelected: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  buttonPositive: {
    backgroundColor: Colors.semantic.successLight,
  },
  buttonNegative: {
    backgroundColor: Colors.semantic.errorLight,
  },
  thanksContainer: {
    marginLeft: spacing['2'],
  },
  thanksText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    fontStyle: 'italic',
  },

  // Inline styles
  inlineContainer: {
    flexDirection: 'row',
    gap: spacing['1'],
    marginTop: spacing['1'],
  },
  inlineButton: {
    padding: 2,
    opacity: 0.6,
  },
  inlineButtonPressed: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  inlineEmoji: {
    fontSize: typography.size.xs,
  },
  inlineFeedbackGiven: {
    fontSize: typography.size.sm,
  },
});

export default FeedbackButtons;
