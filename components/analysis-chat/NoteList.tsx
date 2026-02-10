/**
 * Note List Component
 *
 * Displays list of notes with actions
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  Pin,
  Trash2,
  Edit2,
  Share2,
  MoreVertical,
  StickyNote,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows, zIndex } from '@/constants/design-system';
import type { AnalysisNote, NoteType } from '@/types/analysis';

interface NoteListProps {
  notes: AnalysisNote[];
  isLoading?: boolean;
  onEdit?: (note: AnalysisNote) => void;
  onDelete?: (noteId: string) => void;
  onPin?: (noteId: string, isPinned: boolean) => void;
  onShare?: (noteId: string, share: boolean) => void;
  emptyMessage?: string;
}

export function NoteList({
  notes,
  isLoading = false,
  onEdit,
  onDelete,
  onPin,
  onShare,
  emptyMessage = 'Henüz not eklenmemiş',
}: NoteListProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.sunset} />
        <Text style={styles.loadingText}>Notlar yükleniyor...</Text>
      </View>
    );
  }

  if (notes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StickyNote size={48} color={Colors.neutral.light} />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <NoteItem
          note={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onPin={onPin}
          onShare={onShare}
        />
      )}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

interface NoteItemProps {
  note: AnalysisNote;
  onEdit?: (note: AnalysisNote) => void;
  onDelete?: (noteId: string) => void;
  onPin?: (noteId: string, isPinned: boolean) => void;
  onShare?: (noteId: string, share: boolean) => void;
}

function NoteItem({ note, onEdit, onDelete, onPin, onShare }: NoteItemProps) {
  const [showActions, setShowActions] = React.useState(false);

  const handleAction = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
    setShowActions(false);
  };

  return (
    <View style={[styles.noteCard, note.isPinned && styles.noteCardPinned]}>
      {/* Header */}
      <View style={styles.noteHeader}>
        <View style={styles.noteHeaderLeft}>
          <NoteTypeIndicator type={note.noteType} />
          {note.isPinned && (
            <View style={styles.pinnedBadge}>
              <Pin size={10} color={Colors.secondary.sunshine} />
            </View>
          )}
        </View>
        <Pressable
          onPress={() => setShowActions(!showActions)}
          style={({ pressed }) => [
            styles.moreButton,
            pressed && styles.moreButtonPressed,
          ]}
        >
          <MoreVertical size={18} color={Colors.neutral.medium} />
        </Pressable>
      </View>

      {/* Content */}
      <Text style={styles.noteContent}>{note.content}</Text>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {note.tags.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.noteFooter}>
        <Text style={styles.noteDate}>
          {formatDate(note.createdAt)}
        </Text>
        {note.isSharedWithProfessional && (
          <View style={styles.sharedBadge}>
            <Share2 size={10} color={Colors.secondary.grass} />
            <Text style={styles.sharedText}>Uzmanla paylaşıldı</Text>
          </View>
        )}
      </View>

      {/* Actions Dropdown */}
      {showActions && (
        <View style={styles.actionsDropdown}>
          {onPin && (
            <Pressable
              onPress={() => handleAction(() => onPin(note.id, !note.isPinned))}
              style={styles.actionItem}
            >
              <Pin size={16} color={note.isPinned ? Colors.secondary.sunshine : Colors.neutral.medium} />
              <Text style={styles.actionText}>
                {note.isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
              </Text>
            </Pressable>
          )}
          {onEdit && (
            <Pressable
              onPress={() => handleAction(() => onEdit(note))}
              style={styles.actionItem}
            >
              <Edit2 size={16} color={Colors.neutral.medium} />
              <Text style={styles.actionText}>Düzenle</Text>
            </Pressable>
          )}
          {onShare && (
            <Pressable
              onPress={() => handleAction(() => onShare(note.id, !note.isSharedWithProfessional))}
              style={styles.actionItem}
            >
              <Share2 size={16} color={note.isSharedWithProfessional ? Colors.secondary.grass : Colors.neutral.medium} />
              <Text style={styles.actionText}>
                {note.isSharedWithProfessional ? 'Paylaşımı Kaldır' : 'Uzmanla Paylaş'}
              </Text>
            </Pressable>
          )}
          {onDelete && (
            <Pressable
              onPress={() => handleAction(() => onDelete(note.id))}
              style={[styles.actionItem, styles.actionItemDanger]}
            >
              <Trash2 size={16} color={Colors.semantic.error} />
              <Text style={styles.actionTextDanger}>Sil</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

function NoteTypeIndicator({ type }: { type: NoteType }) {
  const getConfig = (): { emoji: string; label: string; color: string } => {
    switch (type) {
      case 'observation':
        return { emoji: '👁️', label: 'Gözlem', color: Colors.secondary.sky };
      case 'question':
        return { emoji: '❓', label: 'Soru', color: Colors.secondary.lavender };
      case 'follow_up':
        return { emoji: '🔄', label: 'Takip', color: Colors.secondary.sunshine };
      case 'milestone':
        return { emoji: '🏆', label: 'Kilometre Taşı', color: Colors.secondary.grass };
      default:
        return { emoji: '📝', label: 'Genel', color: Colors.neutral.medium };
    }
  };

  const config = getConfig();

  return (
    <View style={[styles.typeIndicator, { backgroundColor: `${config.color}20` }]}>
      <Text style={styles.typeEmoji}>{config.emoji}</Text>
      <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['8'],
    gap: spacing['3'],
  },
  loadingText: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['8'],
    gap: spacing['3'],
  },
  emptyText: {
    fontSize: typography.size.base,
    color: Colors.neutral.light,
    textAlign: 'center',
  },
  listContent: {
    padding: spacing['4'],
  },
  separator: {
    height: spacing['3'],
  },
  noteCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing['4'],
    ...shadows.sm,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  noteCardPinned: {
    borderColor: Colors.secondary.sunshine,
    borderWidth: 2,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing['3'],
  },
  noteHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    paddingHorizontal: spacing['2'],
    paddingVertical: spacing['1'],
    borderRadius: radius.full,
  },
  typeEmoji: {
    fontSize: 12,
  },
  typeLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
  pinnedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: `${Colors.secondary.sunshine}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonPressed: {
    backgroundColor: Colors.neutral.lightest,
  },
  noteContent: {
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
    lineHeight: 22,
    marginBottom: spacing['3'],
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['1'],
    marginBottom: spacing['3'],
  },
  tagChip: {
    backgroundColor: Colors.neutral.lightest,
    paddingHorizontal: spacing['2'],
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  tagText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteDate: {
    fontSize: typography.size.xs,
    color: Colors.neutral.light,
  },
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
  },
  sharedText: {
    fontSize: typography.size.xs,
    color: Colors.secondary.grass,
  },
  actionsDropdown: {
    position: 'absolute',
    top: 50,
    right: spacing['3'],
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing['2'],
    ...shadows.lg,
    zIndex: zIndex.floating,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    padding: spacing['3'],
    borderRadius: radius.md,
  },
  actionItemDanger: {
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
    marginTop: spacing['1'],
    paddingTop: spacing['3'],
  },
  actionText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
  },
  actionTextDanger: {
    fontSize: typography.size.sm,
    color: Colors.semantic.error,
  },
});
