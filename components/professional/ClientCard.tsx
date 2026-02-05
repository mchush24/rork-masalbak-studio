/**
 * ClientCard - Single client display card
 * Phase 18: Professional Tools
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  User,
  ChevronRight,
  FileText,
  Calendar,
  Archive,
  MoreHorizontal,
} from 'lucide-react-native';
import { UIColors as Colors } from '@/constants/color-aliases';
import { shadows } from '@/constants/design-system';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface Client {
  id: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female';
  parentName?: string;
  phone?: string;
  email?: string;
  notes?: string;
  tags?: string[];
  analysisCount: number;
  lastAnalysisDate?: string;
  createdAt: string;
  isArchived?: boolean;
}

interface ClientCardProps {
  client: Client;
  onPress: () => void;
  onLongPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ClientCard({ client, onPress, onLongPress }: ClientCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      Colors.primary.purple,
      Colors.emotion.joy,
      Colors.emotion.trust,
      Colors.emotion.anticipation,
      '#10B981',
      '#3B82F6',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <AnimatedPressable
      style={[styles.container, animatedStyle, client.isArchived && styles.archived]}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: getAvatarColor(client.name) }]}>
        <Text style={styles.avatarText}>{getInitials(client.name)}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {client.name}
          </Text>
          {client.isArchived && (
            <View style={styles.archivedBadge}>
              <Archive size={12} color={Colors.neutral.gray} />
              <Text style={styles.archivedText}>Arşiv</Text>
            </View>
          )}
        </View>

        <View style={styles.metaRow}>
          {client.age && (
            <View style={styles.metaItem}>
              <User size={12} color={Colors.neutral.gray} />
              <Text style={styles.metaText}>{client.age} yaş</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <FileText size={12} color={Colors.neutral.gray} />
            <Text style={styles.metaText}>{client.analysisCount} analiz</Text>
          </View>
          {client.lastAnalysisDate && (
            <View style={styles.metaItem}>
              <Calendar size={12} color={Colors.neutral.gray} />
              <Text style={styles.metaText}>
                {format(new Date(client.lastAnalysisDate), 'd MMM', { locale: tr })}
              </Text>
            </View>
          )}
        </View>

        {/* Tags */}
        {client.tags && client.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {client.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {client.tags.length > 3 && (
              <View style={styles.tagMore}>
                <Text style={styles.tagMoreText}>+{client.tags.length - 3}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Arrow */}
      <ChevronRight size={20} color={Colors.neutral.gray} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...shadows.xs,
  },
  archived: {
    opacity: 0.7,
    backgroundColor: Colors.neutral.lighter,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral.darkest,
  },
  archivedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neutral.lighter,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  archivedText: {
    fontSize: 10,
    color: Colors.neutral.gray,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.primary.purple + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 10,
    color: Colors.primary.purple,
    fontWeight: '500',
  },
  tagMore: {
    backgroundColor: Colors.neutral.lighter,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagMoreText: {
    fontSize: 10,
    color: Colors.neutral.gray,
  },
});

export default ClientCard;
