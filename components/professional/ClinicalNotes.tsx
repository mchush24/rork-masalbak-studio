/**
 * Clinical Notes Component
 * Phase 18: Professional Tools
 *
 * Note-taking system for professionals
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  StickyNote,
  Save,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react-native';
import { UIColors as Colors } from '@/constants/color-aliases';
import { useFeedback } from '@/hooks/useFeedback';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Note {
  id: string;
  content: string;
  timestamp: string;
  tags: string[];
}

interface ClinicalNotesProps {
  analysisId: string;
  initialNotes?: Note[];
  onNoteSave?: (note: Note) => void;
  onNoteDelete?: (noteId: string) => void;
  autoSave?: boolean;
}

const PREDEFINED_TAGS = [
  'Dikkat Gerektiren',
  'Olumlu Gelisim',
  'Takip Gerekli',
  'Aile ile Paylas',
  'Onemli',
];

export function ClinicalNotes({
  analysisId,
  initialNotes = [],
  onNoteSave,
  onNoteDelete,
  autoSave = true,
}: ClinicalNotesProps) {
  const { feedback } = useFeedback();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [currentNote, setCurrentNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Load notes from storage
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const stored = await AsyncStorage.getItem(\`clinical_notes_\${analysisId}\`);
        if (stored) {
          setNotes(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load notes:', error);
      }
    };
    loadNotes();
  }, [analysisId]);

  // Save notes to storage
  const saveToStorage = useCallback(async (updatedNotes: Note[]) => {
    try {
      await AsyncStorage.setItem(\`clinical_notes_\${analysisId}\`, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  }, [analysisId]);

  const handleSaveNote = async () => {
    if (!currentNote.trim()) return;
    
    feedback('tap');
    setIsSaving(true);

    const newNote: Note = {
      id: Date.now().toString(),
      content: currentNote.trim(),
      timestamp: new Date().toISOString(),
      tags: selectedTags,
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    await saveToStorage(updatedNotes);
    
    setCurrentNote('');
    setSelectedTags([]);
    setIsSaving(false);
    feedback('success');
    onNoteSave?.(newNote);
  };

  const handleDeleteNote = async (noteId: string) => {
    feedback('tap');
    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);
    await saveToStorage(updatedNotes);
    onNoteDelete?.(noteId);
  };

  const toggleTag = (tag: string) => {
    feedback('tap');
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleNoteExpand = (noteId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Animated.View entering={FadeIn} style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <StickyNote size={20} color={Colors.secondary.lavender} />
          <Text style={styles.headerTitle}>Klinik Notlar</Text>
          <Text style={styles.noteCount}>{notes.length} not</Text>
        </View>

        {/* New Note Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Yeni not ekle..."
            placeholderTextColor={Colors.neutral.light}
            multiline
            value={currentNote}
            onChangeText={setCurrentNote}
          />
          
          {/* Tag Selector */}
          <Pressable
            onPress={() => { feedback('tap'); setShowTagSelector(!showTagSelector); }}
            style={styles.tagToggle}
          >
            <Tag size={16} color={Colors.neutral.medium} />
            <Text style={styles.tagToggleText}>
              {selectedTags.length > 0 ? \`\${selectedTags.length} etiket\` : 'Etiket ekle'}
            </Text>
            {showTagSelector ? (
              <ChevronUp size={16} color={Colors.neutral.medium} />
            ) : (
              <ChevronDown size={16} color={Colors.neutral.medium} />
            )}
          </Pressable>

          {showTagSelector && (
            <Animated.View entering={FadeInDown} style={styles.tagsContainer}>
              {PREDEFINED_TAGS.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[
                    styles.tagPill,
                    selectedTags.includes(tag) && styles.tagPillSelected,
                  ]}
                >
                  <Text style={[
                    styles.tagPillText,
                    selectedTags.includes(tag) && styles.tagPillTextSelected,
                  ]}>
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </Animated.View>
          )}

          {/* Save Button */}
          <Pressable
            onPress={handleSaveNote}
            disabled={!currentNote.trim() || isSaving}
            style={[styles.saveButton, !currentNote.trim() && styles.saveButtonDisabled]}
          >
            <Save size={18} color={Colors.neutral.white} />
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </Pressable>
        </View>

        {/* Notes List */}
        <ScrollView style={styles.notesList} showsVerticalScrollIndicator={false}>
          {notes.map((note, index) => (
            <Animated.View
              key={note.id}
              entering={FadeInDown.delay(index * 50)}
              style={styles.noteCard}
            >
              <Pressable onPress={() => toggleNoteExpand(note.id)}>
                <View style={styles.noteHeader}>
                  <View style={styles.noteTime}>
                    <Clock size={12} color={Colors.neutral.medium} />
                    <Text style={styles.noteTimeText}>{formatDate(note.timestamp)}</Text>
                  </View>
                  <Pressable onPress={() => handleDeleteNote(note.id)} style={styles.deleteButton}>
                    <Trash2 size={14} color={Colors.status.error} />
                  </Pressable>
                </View>

                <Text
                  style={styles.noteContent}
                  numberOfLines={expandedNotes.has(note.id) ? undefined : 3}
                >
                  {note.content}
                </Text>

                {note.tags.length > 0 && (
                  <View style={styles.noteTags}>
                    {note.tags.map((tag) => (
                      <View key={tag} style={styles.noteTagPill}>
                        <Text style={styles.noteTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
            </Animated.View>
          ))}

          {notes.length === 0 && (
            <View style={styles.emptyState}>
              <StickyNote size={40} color={Colors.neutral.lighter} />
              <Text style={styles.emptyText}>Henuz not eklenmemis</Text>
              <Text style={styles.emptySubtext}>
                Gozlemlerinizi kaydetmek icin not ekleyin
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, backgroundColor: Colors.neutral.white, borderRadius: 20, padding: 20,
    marginHorizontal: 16, marginVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral.dark, flex: 1 },
  noteCount: { fontSize: 13, color: Colors.neutral.medium, backgroundColor: Colors.neutral.lighter,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  inputContainer: { backgroundColor: Colors.neutral.lighter, borderRadius: 16, padding: 16, marginBottom: 16 },
  textInput: { fontSize: 15, color: Colors.neutral.dark, minHeight: 80, textAlignVertical: 'top' },
  tagToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: Colors.neutral.light, marginTop: 8 },
  tagToggleText: { flex: 1, fontSize: 13, color: Colors.neutral.medium },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tagPill: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.neutral.white,
    borderRadius: 16, borderWidth: 1, borderColor: Colors.neutral.light },
  tagPillSelected: { backgroundColor: Colors.secondary.lavender, borderColor: Colors.secondary.lavender },
  tagPillText: { fontSize: 12, color: Colors.neutral.dark },
  tagPillTextSelected: { color: Colors.neutral.white },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.secondary.lavender, paddingVertical: 12, borderRadius: 12, gap: 8, marginTop: 12 },
  saveButtonDisabled: { backgroundColor: Colors.neutral.light },
  saveButtonText: { fontSize: 15, fontWeight: '600', color: Colors.neutral.white },
  notesList: { flex: 1 },
  noteCard: { backgroundColor: Colors.neutral.lighter, borderRadius: 12, padding: 16, marginBottom: 12 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  noteTime: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  noteTimeText: { fontSize: 11, color: Colors.neutral.medium },
  deleteButton: { padding: 4 },
  noteContent: { fontSize: 14, color: Colors.neutral.dark, lineHeight: 20 },
  noteTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  noteTagPill: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: \`\${Colors.secondary.lavender}20\`,
    borderRadius: 8 },
  noteTagText: { fontSize: 10, color: Colors.secondary.lavender, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, fontWeight: '600', color: Colors.neutral.medium, marginTop: 12 },
  emptySubtext: { fontSize: 13, color: Colors.neutral.light, marginTop: 4, textAlign: 'center' },
});

export default ClinicalNotes;
