/**
 * NoteEditor - Clinical note taking component
 * Phase 18: Professional Tools
 *
 * Rich note editor for professionals to add clinical observations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  FileText,
  Eye,
  AlertCircle,
  HelpCircle,
  Star,
  Tag,
  Pin,
  Clock,
  Save,
  X,
  Check,
  Bold,
  Italic,
  List,
  Link2,
} from 'lucide-react-native';
import { UIColors as Colors } from '@/constants/color-aliases';
import { zIndex } from '@/constants/design-system';
import { NoteType, AnalysisNote } from '@/types/analysis';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface NoteEditorProps {
  initialNote?: AnalysisNote;
  analysisId: string;
  onSave: (note: Partial<AnalysisNote>) => void;
  onCancel: () => void;
  isVisible: boolean;
}

const NOTE_TYPES: { type: NoteType; label: string; icon: React.ReactNode; color: string }[] = [
  {
    type: 'general',
    label: 'Genel',
    icon: <FileText size={16} />,
    color: Colors.neutral.gray,
  },
  {
    type: 'observation',
    label: 'Gözlem',
    icon: <Eye size={16} />,
    color: Colors.emotion.trust,
  },
  {
    type: 'question',
    label: 'Soru',
    icon: <HelpCircle size={16} />,
    color: Colors.emotion.anticipation,
  },
  {
    type: 'follow_up',
    label: 'Takip',
    icon: <Clock size={16} />,
    color: Colors.primary.purple,
  },
  {
    type: 'milestone',
    label: 'Milestone',
    icon: <Star size={16} />,
    color: Colors.emotion.joy,
  },
];

const SUGGESTED_TAGS = [
  'Dikkat Gerektiren',
  'Pozitif Gelişim',
  'Aile Görüşmesi',
  'Davranış',
  'Duygusal',
  'Sosyal',
  'Bilişsel',
  'Motor',
  'Dil',
  'Okul',
];

export function NoteEditor({
  initialNote,
  analysisId,
  onSave,
  onCancel,
  isVisible,
}: NoteEditorProps) {
  const [content, setContent] = useState(initialNote?.content || '');
  const [noteType, setNoteType] = useState<NoteType>(initialNote?.noteType || 'general');
  const [tags, setTags] = useState<string[]>(initialNote?.tags || []);
  const [isPinned, setIsPinned] = useState(initialNote?.isPinned || false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');

  const inputRef = useRef<TextInput>(null);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isVisible]);

  const animatedSaveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleSave = () => {
    if (!content.trim()) return;

    scale.value = withSpring(0.95, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });

    const note: Partial<AnalysisNote> = {
      ...(initialNote?.id ? { id: initialNote.id } : {}),
      analysisId,
      content: content.trim(),
      noteType,
      tags,
      isPinned,
      isSharedWithProfessional: false,
    };

    onSave(note);
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const insertTextFormat = (prefix: string, suffix: string = prefix) => {
    const input = inputRef.current;
    if (!input) return;

    // Simple formatting insertion
    setContent((prev) => `${prev}${prefix}${suffix}`);
  };

  if (!isVisible) return null;

  return (
    <Animated.View
      entering={SlideInDown.springify()}
      exiting={FadeOut}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {initialNote ? 'Notu Düzenle' : 'Yeni Not'}
          </Text>
          <Pressable style={styles.closeButton} onPress={onCancel}>
            <X size={20} color={Colors.neutral.gray} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Note Type Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Not Türü</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.typeSelector}
            >
              {NOTE_TYPES.map((item) => (
                <Pressable
                  key={item.type}
                  style={[
                    styles.typeChip,
                    noteType === item.type && {
                      backgroundColor: item.color + '20',
                      borderColor: item.color,
                    },
                  ]}
                  onPress={() => setNoteType(item.type)}
                >
                  <View style={{ opacity: noteType === item.type ? 1 : 0.5 }}>
                    {React.cloneElement(item.icon as React.ReactElement<{ color?: string }>, {
                      color: noteType === item.type ? item.color : Colors.neutral.gray,
                    })}
                  </View>
                  <Text
                    style={[
                      styles.typeChipText,
                      noteType === item.type && { color: item.color },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Content Input */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.sectionLabel}>Not İçeriği</Text>
              <View style={styles.formatButtons}>
                <Pressable
                  style={styles.formatButton}
                  onPress={() => insertTextFormat('**')}
                >
                  <Bold size={16} color={Colors.neutral.gray} />
                </Pressable>
                <Pressable
                  style={styles.formatButton}
                  onPress={() => insertTextFormat('_')}
                >
                  <Italic size={16} color={Colors.neutral.gray} />
                </Pressable>
                <Pressable
                  style={styles.formatButton}
                  onPress={() => insertTextFormat('\n- ')}
                >
                  <List size={16} color={Colors.neutral.gray} />
                </Pressable>
              </View>
            </View>
            <TextInput
              ref={inputRef}
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Notunuzu buraya yazın...&#10;&#10;Markdown desteklenir: **kalın**, _italik_, - liste"
              placeholderTextColor={Colors.neutral.gray}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{content.length} karakter</Text>
          </View>

          {/* Tags Section */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.sectionLabel}>Etiketler</Text>
              <Pressable
                style={styles.addTagButton}
                onPress={() => setShowTagInput(!showTagInput)}
              >
                <Tag size={14} color={Colors.primary.purple} />
                <Text style={styles.addTagText}>Ekle</Text>
              </Pressable>
            </View>

            {/* Custom tag input */}
            {showTagInput && (
              <Animated.View entering={FadeIn} style={styles.customTagInput}>
                <TextInput
                  style={styles.tagInput}
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Yeni etiket..."
                  placeholderTextColor={Colors.neutral.gray}
                  onSubmitEditing={addCustomTag}
                />
                <Pressable style={styles.tagAddButton} onPress={addCustomTag}>
                  <Check size={16} color={Colors.neutral.white} />
                </Pressable>
              </Animated.View>
            )}

            {/* Suggested tags */}
            <View style={styles.tagsContainer}>
              {SUGGESTED_TAGS.map((tag) => (
                <Pressable
                  key={tag}
                  style={[
                    styles.tagChip,
                    tags.includes(tag) && styles.tagChipActive,
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text
                    style={[
                      styles.tagChipText,
                      tags.includes(tag) && styles.tagChipTextActive,
                    ]}
                  >
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Selected custom tags */}
            {tags.filter((t) => !SUGGESTED_TAGS.includes(t)).length > 0 && (
              <View style={styles.customTags}>
                {tags
                  .filter((t) => !SUGGESTED_TAGS.includes(t))
                  .map((tag) => (
                    <Pressable
                      key={tag}
                      style={styles.customTagChip}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text style={styles.customTagText}>{tag}</Text>
                      <X size={12} color={Colors.primary.purple} />
                    </Pressable>
                  ))}
              </View>
            )}
          </View>

          {/* Options */}
          <View style={styles.section}>
            <Pressable
              style={styles.optionRow}
              onPress={() => setIsPinned(!isPinned)}
            >
              <Pin
                size={18}
                color={isPinned ? Colors.emotion.joy : Colors.neutral.gray}
                fill={isPinned ? Colors.emotion.joy : 'transparent'}
              />
              <Text style={styles.optionText}>Notu Sabitle</Text>
              <View
                style={[
                  styles.checkbox,
                  isPinned && styles.checkboxActive,
                ]}
              >
                {isPinned && <Check size={12} color={Colors.neutral.white} />}
              </View>
            </Pressable>
          </View>

          {/* Timestamp */}
          {initialNote && (
            <View style={styles.timestamp}>
              <Clock size={12} color={Colors.neutral.gray} />
              <Text style={styles.timestampText}>
                {format(new Date(initialNote.createdAt), 'd MMMM yyyy, HH:mm', {
                  locale: tr,
                })}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <Pressable style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>İptal</Text>
          </Pressable>
          <Animated.View style={animatedSaveStyle}>
            <Pressable
              style={[
                styles.saveButton,
                !content.trim() && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!content.trim()}
            >
              <Save size={18} color={Colors.neutral.white} />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.neutral.white,
    zIndex: zIndex.floating,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral.darkest,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral.dark,
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.neutral.light,
    backgroundColor: Colors.neutral.lightest,
  },
  typeChipText: {
    fontSize: 13,
    color: Colors.neutral.gray,
    fontWeight: '500',
  },
  formatButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  formatButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: Colors.neutral.lightest,
  },
  contentInput: {
    minHeight: 150,
    padding: 14,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: 12,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.neutral.darkest,
  },
  charCount: {
    fontSize: 11,
    color: Colors.neutral.gray,
    textAlign: 'right',
    marginTop: 8,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.primary.purple + '10',
    borderRadius: 16,
  },
  addTagText: {
    fontSize: 12,
    color: Colors.primary.purple,
    fontWeight: '500',
  },
  customTagInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: 12,
    fontSize: 14,
    color: Colors.neutral.darkest,
  },
  tagAddButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.neutral.lightest,
    borderWidth: 1,
    borderColor: Colors.neutral.light,
  },
  tagChipActive: {
    backgroundColor: Colors.primary.purple + '15',
    borderColor: Colors.primary.purple,
  },
  tagChipText: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  tagChipTextActive: {
    color: Colors.primary.purple,
    fontWeight: '500',
  },
  customTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
  },
  customTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.primary.purple + '15',
  },
  customTagText: {
    fontSize: 12,
    color: Colors.primary.purple,
    fontWeight: '500',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.neutral.darkest,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.neutral.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary.purple,
    borderColor: Colors.primary.purple,
  },
  timestamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  timestampText: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.neutral.lightest,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral.gray,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary.purple,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.neutral.white,
  },
});

export default NoteEditor;
