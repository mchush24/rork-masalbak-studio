import React from 'react';
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius } from '@/constants/design-system';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

type ThemeSuggestion = {
  title: string;
  theme: string;
  emoji: string;
};

type ThemeColors = {
  neutral: { dark: string; medium: string; darkest: string };
  primary: { sunset: string };
  cards: { story: { border: string } };
};

type ThemeSuggestionPanelProps = {
  suggestions: ThemeSuggestion[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  storyTitle: string;
  colors: ThemeColors;
};

export function ThemeSuggestionPanel({
  suggestions,
  selectedIndex,
  onSelect,
  storyTitle,
  colors,
}: ThemeSuggestionPanelProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.suggestionsContainer}>
      <View style={styles.suggestionsTitleRow}>
        <Text style={[styles.suggestionsTitle, { color: colors.neutral.dark }]}>
          ✨ Masal Teması Seçin
        </Text>
        {selectedIndex === null && !storyTitle.trim() && (
          <View style={[styles.requiredBadge, { backgroundColor: colors.primary.sunset }]}>
            <Text style={styles.requiredBadgeText}>Gerekli</Text>
          </View>
        )}
      </View>
      <Text style={[styles.suggestionsSubtitle, { color: colors.neutral.medium }]}>
        AI çiziminizi analiz etti ve size özel temalar önerdi:
      </Text>
      {suggestions.map((suggestion, index) => (
        <Pressable
          key={index}
          onPress={() => onSelect(index)}
          style={({ pressed }) => [
            styles.suggestionCard,
            selectedIndex === index && styles.suggestionCardSelected,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.suggestionEmoji}>{suggestion.emoji}</Text>
          <View style={styles.suggestionContent}>
            <Text style={[styles.suggestionTitle, { color: colors.neutral.darkest }]}>
              {suggestion.title}
            </Text>
            <Text style={[styles.suggestionTheme, { color: colors.neutral.medium }]}>
              {suggestion.theme}
            </Text>
          </View>
          {selectedIndex === index && (
            <Text style={[styles.suggestionCheck, { color: colors.cards.story.border }]}>✓</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  suggestionsContainer: {
    gap: spacing['2'],
    marginBottom: spacing['3'],
  },
  suggestionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['1'],
  },
  suggestionsTitle: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    fontFamily: typography.family.semibold,
    marginBottom: spacing['1'],
  },
  suggestionsSubtitle: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    marginBottom: spacing['2'],
  },
  requiredBadge: {
    backgroundColor: Colors.primary.sunset,
    paddingHorizontal: spacing['2'],
    paddingVertical: spacing['1'],
    borderRadius: radius.full,
  },
  requiredBadgeText: {
    color: Colors.neutral.white,
    fontSize: typography.size.xs,
    fontFamily: typography.family.bold,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isSmallDevice ? spacing['2'] : spacing['3'],
    padding: isSmallDevice ? spacing['2'] : spacing['3'],
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  suggestionCardSelected: {
    borderWidth: 2,
    borderColor: Colors.cards.story.border,
    backgroundColor: Colors.cards.story.bg[0] + '20',
  },
  suggestionEmoji: {
    fontSize: 32,
  },
  suggestionContent: {
    flex: 1,
    gap: spacing['1'],
  },
  suggestionTitle: {
    fontSize: isSmallDevice ? typography.size.sm : typography.size.base,
    color: Colors.neutral.darkest,
    fontFamily: typography.family.bold,
  },
  suggestionTheme: {
    fontSize: isSmallDevice ? typography.size.xs : typography.size.sm,
    color: Colors.neutral.medium,
    fontFamily: typography.family.regular,
  },
  suggestionCheck: {
    fontSize: 24,
    color: Colors.cards.story.border,
    fontFamily: typography.family.bold,
  },
});
