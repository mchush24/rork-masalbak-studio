/**
 * Chat Message Component
 *
 * Displays individual chat messages with insight references
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { InsightTag } from './InsightTag';
import type { Insight } from '@/types/analysis';

// Theme colors for consistency
const THEME = {
  primary: Colors.primary.sunset,
  primaryDark: '#E88A6A',
  primaryLight: Colors.primary.peach,
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referencedInsightIndex?: number;
  suggestedQuestions?: string[];
}

interface ChatMessageProps {
  message: Message;
  insights?: Insight[];
  onInsightClick?: (index: number) => void;
  onSuggestedQuestionClick?: (question: string) => void;
}

export function ChatMessage({
  message,
  insights,
  onInsightClick,
  onSuggestedQuestionClick,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const referencedInsight =
    message.referencedInsightIndex !== undefined
      ? insights?.[message.referencedInsightIndex]
      : null;

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {/* Referenced Insight Tag */}
      {referencedInsight && (
        <InsightTag
          insight={referencedInsight}
          index={message.referencedInsightIndex!}
          onPress={onInsightClick}
        />
      )}

      {/* Message Bubble */}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {isUser ? (
          <LinearGradient
            colors={[THEME.primary, THEME.primaryDark]}
            style={styles.userBubbleGradient}
          >
            <Text style={styles.userText}>{message.content}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.assistantBubbleInner}>
            <Text style={styles.assistantText}>{message.content}</Text>
          </View>
        )}
      </View>

      {/* Suggested Questions (for assistant messages) */}
      {!isUser && message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsLabel}>Önerilen sorular:</Text>
          <View style={styles.suggestionsList}>
            {message.suggestedQuestions.map((question, index) => (
              <Pressable
                key={index}
                onPress={() => onSuggestedQuestionClick?.(question)}
                style={({ pressed }) => [
                  styles.suggestionChip,
                  pressed && styles.suggestionChipPressed,
                ]}
              >
                <Text style={styles.suggestionText}>{question}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Timestamp */}
      <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing['3'],
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  userBubble: {
    borderBottomRightRadius: radius.sm,
  },
  userBubbleGradient: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
  },
  assistantBubble: {
    backgroundColor: Colors.neutral.lightest,
    borderBottomLeftRadius: radius.sm,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  assistantBubbleInner: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
  },
  userText: {
    fontSize: typography.size.base,
    color: Colors.neutral.white,
    lineHeight: 22,
  },
  assistantText: {
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
    lineHeight: 22,
  },
  suggestionsContainer: {
    marginTop: spacing['2'],
    width: '100%',
  },
  suggestionsLabel: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    marginBottom: spacing['1'],
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['1'],
  },
  suggestionChip: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.full,
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderWidth: 1,
    borderColor: THEME.primaryLight,
  },
  suggestionChipPressed: {
    backgroundColor: THEME.primaryLight,
    borderColor: THEME.primary,
  },
  suggestionText: {
    fontSize: typography.size.xs,
    color: THEME.primary,
    fontFamily: typography.family.medium,
  },
  timestamp: {
    fontSize: typography.size.xs,
    color: Colors.neutral.light,
    marginTop: spacing['1'],
  },
  userTimestamp: {
    textAlign: 'right',
  },
  assistantTimestamp: {
    textAlign: 'left',
  },
});
