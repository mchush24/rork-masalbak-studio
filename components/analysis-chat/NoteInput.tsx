/**
 * Note Input Component
 *
 * Input for adding notes to an analysis
 */

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Hash } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import type { NoteType } from '@/types/analysis';

interface NoteInputProps {
  onSubmit: (content: string, noteType: NoteType, tags: string[]) => Promise<void>;
  isSubmitting?: boolean;
  placeholder?: string;
}

const NOTE_TYPES: { type: NoteType; label: string; emoji: string }[] = [
  { type: 'general', label: 'Genel', emoji: '📝' },
  { type: 'observation', label: 'Gözlem', emoji: '👁️' },
  { type: 'question', label: 'Soru', emoji: '❓' },
  { type: 'follow_up', label: 'Takip', emoji: '🔄' },
  { type: 'milestone', label: 'Kilometre Taşı', emoji: '🏆' },
];

const SUGGESTED_TAGS = [
  'davranış',
  'duygu',
  'gelişim',
  'okul',
  'sosyal',
  'sağlık',
  'uyku',
  'yemek',
];

export function NoteInput({
  onSubmit,
  isSubmitting = false,
  placeholder = 'Notunuzu yazın...',
}: NoteInputProps) {
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<NoteType>('general');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTags, setShowTags] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await onSubmit(content.trim(), selectedType, selectedTags);

    // Reset form
    setContent('');
    setSelectedTags([]);
    setShowTags(false);
  };

  const handleTypeSelect = (type: NoteType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(type);
  };

  const handleTagToggle = (tag: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  return (
    <View style={styles.container}>
      {/* Type Selector */}
      <View style={styles.typeSelector}>
        {NOTE_TYPES.map(item => (
          <Pressable
            key={item.type}
            onPress={() => handleTypeSelect(item.type)}
            style={({ pressed }) => [
              styles.typeChip,
              selectedType === item.type && styles.typeChipSelected,
              pressed && styles.typeChipPressed,
            ]}
          >
            <Text style={styles.typeEmoji}>{item.emoji}</Text>
            <Text
              style={[styles.typeLabel, selectedType === item.type && styles.typeLabelSelected]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={content}
          onChangeText={setContent}
          placeholder={placeholder}
          placeholderTextColor={Colors.neutral.light}
          multiline
          maxLength={2000}
          editable={!isSubmitting}
        />

        {/* Tags Toggle */}
        <View style={styles.inputActions}>
          <Pressable
            onPress={() => setShowTags(!showTags)}
            style={({ pressed }) => [
              styles.tagButton,
              selectedTags.length > 0 && styles.tagButtonActive,
              pressed && styles.tagButtonPressed,
            ]}
          >
            <Hash
              size={16}
              color={selectedTags.length > 0 ? Colors.primary.sunset : Colors.neutral.medium}
            />
            {selectedTags.length > 0 && <Text style={styles.tagCount}>{selectedTags.length}</Text>}
          </Pressable>

          <Pressable
            onPress={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            style={({ pressed }) => [
              styles.submitButton,
              (!content.trim() || isSubmitting) && styles.submitButtonDisabled,
              pressed && styles.submitButtonPressed,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={Colors.neutral.white} />
            ) : (
              <LinearGradient
                colors={[Colors.primary.sunset, Colors.primary.peach]}
                style={styles.submitButtonGradient}
              >
                <Plus size={20} color={Colors.neutral.white} />
                <Text style={styles.submitButtonText}>Ekle</Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>
      </View>

      {/* Tags Section */}
      {showTags && (
        <View style={styles.tagsContainer}>
          <Text style={styles.tagsLabel}>Etiketler:</Text>
          <View style={styles.tagsList}>
            {SUGGESTED_TAGS.map(tag => (
              <Pressable
                key={tag}
                onPress={() => handleTagToggle(tag)}
                style={({ pressed }) => [
                  styles.tagChip,
                  selectedTags.includes(tag) && styles.tagChipSelected,
                  pressed && styles.tagChipPressed,
                ]}
              >
                <Text
                  style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextSelected]}
                >
                  #{tag}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing['4'],
    ...shadows.md,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    marginBottom: spacing['3'],
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.lightest,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  typeChipSelected: {
    backgroundColor: Colors.primary.blush,
    borderColor: Colors.primary.sunset,
  },
  typeChipPressed: {
    opacity: 0.7,
  },
  typeEmoji: {
    fontSize: 14,
  },
  typeLabel: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    fontFamily: typography.family.medium,
  },
  typeLabelSelected: {
    color: Colors.primary.peach,
  },
  inputContainer: {
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
    overflow: 'hidden',
  },
  textInput: {
    minHeight: 80,
    maxHeight: 150,
    padding: spacing['3'],
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
    textAlignVertical: 'top',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing['2'],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
    backgroundColor: Colors.neutral.white,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    padding: spacing['2'],
    borderRadius: radius.md,
  },
  tagButtonActive: {
    backgroundColor: Colors.primary.blush,
  },
  tagButtonPressed: {
    opacity: 0.7,
  },
  tagCount: {
    fontSize: typography.size.xs,
    color: Colors.primary.sunset,
    fontFamily: typography.family.bold,
  },
  submitButton: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
  },
  submitButtonText: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },
  tagsContainer: {
    marginTop: spacing['3'],
    paddingTop: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
  },
  tagsLabel: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    marginBottom: spacing['2'],
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
  },
  tagChip: {
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.lightest,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  tagChipSelected: {
    backgroundColor: Colors.primary.blush,
    borderColor: Colors.primary.sunset,
  },
  tagChipPressed: {
    opacity: 0.7,
  },
  tagText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },
  tagTextSelected: {
    color: Colors.primary.peach,
    fontFamily: typography.family.medium,
  },
});
