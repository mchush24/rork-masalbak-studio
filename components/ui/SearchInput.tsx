/**
 * SearchInput Component
 * Phase 2: UX Enhancement
 *
 * Search input with:
 * - Debounced search
 * - Clear button
 * - Loading state
 * - Suggestions support
 * - Filter chips integration
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Keyboard,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInDown,
} from 'react-native-reanimated';
import { Search, X, Loader2, Clock, TrendingUp } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows, zIndex } from '@/constants/design-system';
import { useHapticFeedback } from '@/lib/haptics';

interface FilterChip {
  id: string;
  label: string;
  active?: boolean;
}

interface Suggestion {
  id: string;
  text: string;
  type?: 'recent' | 'trending' | 'suggestion';
}

interface SearchInputProps extends Omit<TextInputProps, 'onChangeText'> {
  /** Current search value */
  value: string;
  /** Called when search value changes (debounced) */
  onSearch: (query: string) => void;
  /** Called immediately on text change */
  onChangeText?: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Debounce delay in ms */
  debounceDelay?: number;
  /** Show loading state */
  isLoading?: boolean;
  /** Search suggestions */
  suggestions?: Suggestion[];
  /** Called when suggestion is selected */
  onSuggestionPress?: (suggestion: Suggestion) => void;
  /** Filter chips */
  filters?: FilterChip[];
  /** Called when filter is toggled */
  onFilterPress?: (filter: FilterChip) => void;
  /** Auto focus on mount */
  autoFocus?: boolean;
  /** Show suggestions dropdown */
  showSuggestions?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Input container style */
  inputContainerStyle?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SearchInput({
  value,
  onSearch,
  onChangeText,
  placeholder = 'Ara...',
  debounceDelay = 300,
  isLoading = false,
  suggestions = [],
  onSuggestionPress,
  filters = [],
  onFilterPress,
  autoFocus = false,
  showSuggestions = true,
  style,
  inputContainerStyle,
  ...textInputProps
}: SearchInputProps) {
  const { tapLight } = useHapticFeedback();
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  // Animation values
  const scale = useSharedValue(1);
  const borderWidth = useSharedValue(1);

  // Sync with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced search
  const handleTextChange = useCallback((text: string) => {
    setLocalValue(text);
    onChangeText?.(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      onSearch(text);
    }, debounceDelay);
  }, [onSearch, onChangeText, debounceDelay]);

  // Clear search
  const handleClear = useCallback(() => {
    tapLight();
    setLocalValue('');
    onChangeText?.('');
    onSearch('');
    inputRef.current?.focus();
  }, [tapLight, onChangeText, onSearch]);

  // Focus handling
  // Note: borderWidth is a Reanimated shared value (stable ref)
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    borderWidth.value = withSpring(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    borderWidth.value = withSpring(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Suggestion press
  const handleSuggestionPress = useCallback((suggestion: Suggestion) => {
    tapLight();
    setLocalValue(suggestion.text);
    onSearch(suggestion.text);
    onSuggestionPress?.(suggestion);
    Keyboard.dismiss();
  }, [tapLight, onSearch, onSuggestionPress]);

  // Filter press
  const handleFilterPress = useCallback((filter: FilterChip) => {
    tapLight();
    onFilterPress?.(filter);
  }, [tapLight, onFilterPress]);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
  }));

  const showSuggestionsDropdown = showSuggestions && isFocused && suggestions.length > 0;

  const getSuggestionIcon = (type?: string) => {
    switch (type) {
      case 'recent':
        return <Clock size={16} color={Colors.neutral.medium} />;
      case 'trending':
        return <TrendingUp size={16} color={Colors.secondary.grass} />;
      default:
        return <Search size={16} color={Colors.neutral.light} />;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Search Input */}
      <Animated.View
        style={[
          styles.inputContainer,
          containerAnimatedStyle,
          isFocused && styles.inputContainerFocused,
          inputContainerStyle,
        ]}
      >
        <Search
          size={20}
          color={isFocused ? Colors.primary.sunset : Colors.neutral.medium}
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={localValue}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.neutral.light}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          {...textInputProps}
        />

        {/* Loading / Clear Button */}
        {isLoading ? (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.iconButton}
          >
            <Loader2 size={18} color={Colors.primary.sunset} />
          </Animated.View>
        ) : localValue.length > 0 ? (
          <AnimatedPressable
            entering={FadeIn}
            exiting={FadeOut}
            onPress={handleClear}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && { opacity: 0.6 },
            ]}
            hitSlop={8}
          >
            <X size={18} color={Colors.neutral.medium} />
          </AnimatedPressable>
        ) : null}
      </Animated.View>

      {/* Filter Chips */}
      {filters.length > 0 && (
        <Animated.View
          entering={FadeIn.delay(100)}
          style={styles.filtersContainer}
        >
          <FlatList
            horizontal
            data={filters}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleFilterPress(item)}
                style={({ pressed }) => [
                  styles.filterChip,
                  item.active && styles.filterChipActive,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    item.active && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            )}
          />
        </Animated.View>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestionsDropdown && (
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          style={styles.suggestionsContainer}
        >
          {suggestions.map((suggestion, index) => (
            <Pressable
              key={suggestion.id}
              onPress={() => handleSuggestionPress(suggestion)}
              style={({ pressed }) => [
                styles.suggestionItem,
                index === 0 && styles.suggestionItemFirst,
                index === suggestions.length - 1 && styles.suggestionItemLast,
                pressed && { backgroundColor: Colors.neutral.lightest },
              ]}
            >
              {getSuggestionIcon(suggestion.type)}
              <Text style={styles.suggestionText} numberOfLines={1}>
                {suggestion.text}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

// Pre-built search with recent searches
interface SearchWithHistoryProps extends Omit<SearchInputProps, 'suggestions' | 'onSuggestionPress'> {
  /** Recent search history */
  recentSearches?: string[];
  /** Called when a recent search is selected */
  onRecentSelect?: (query: string) => void;
  /** Called to clear history */
  onClearHistory?: () => void;
}

export function SearchWithHistory({
  recentSearches = [],
  onRecentSelect,
  onClearHistory,
  ...props
}: SearchWithHistoryProps) {
  const suggestions: Suggestion[] = recentSearches.map((text, index) => ({
    id: `recent-${index}`,
    text,
    type: 'recent',
  }));

  const handleSuggestionPress = useCallback((suggestion: Suggestion) => {
    onRecentSelect?.(suggestion.text);
  }, [onRecentSelect]);

  return (
    <View>
      <SearchInput
        {...props}
        suggestions={suggestions}
        onSuggestionPress={handleSuggestionPress}
      />
      {recentSearches.length > 0 && onClearHistory && (
        <Pressable
          onPress={onClearHistory}
          style={styles.clearHistoryButton}
        >
          <Text style={styles.clearHistoryText}>Geçmişi Temizle</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    gap: spacing['3'],
    ...shadows.sm,
  },
  inputContainerFocused: {
    borderColor: Colors.primary.sunset,
    ...shadows.colored(Colors.primary.sunset),
  },
  input: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.darkest,
    padding: 0,
  },
  iconButton: {
    padding: spacing['1'],
  },
  clearButton: {
    padding: spacing['1'],
    backgroundColor: Colors.neutral.lighter,
    borderRadius: radius.full,
  },

  // Filters
  filtersContainer: {
    marginTop: spacing['3'],
  },
  filtersList: {
    gap: spacing['2'],
    paddingHorizontal: spacing['1'],
  },
  filterChip: {
    paddingVertical: spacing['1.5'],
    paddingHorizontal: spacing['3'],
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1.5,
    borderColor: Colors.neutral.lighter,
  },
  filterChipActive: {
    backgroundColor: Colors.primary.sunset,
    borderColor: Colors.primary.sunset,
  },
  filterChipText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
  },
  filterChipTextActive: {
    color: Colors.neutral.white,
  },

  // Suggestions
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: spacing['2'],
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
    ...shadows.lg,
    zIndex: zIndex.floating,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightest,
  },
  suggestionItemFirst: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  suggestionText: {
    flex: 1,
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
  },

  // History
  clearHistoryButton: {
    alignSelf: 'center',
    marginTop: spacing['3'],
    padding: spacing['2'],
  },
  clearHistoryText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
});

export default SearchInput;
