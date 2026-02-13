import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { MapPin, Lightbulb, Heart } from 'lucide-react-native';
import { shadows, typography } from '@/constants/design-system';

interface DrawingInsightCardProps {
  placement: string;
  interpretation: string;
  recommendation: string;
}

export function DrawingInsightCard({
  placement,
  interpretation,
  recommendation,
}: DrawingInsightCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <MapPin size={24} color="#9333EA" />
        </View>
        <Text style={styles.title}>Çizim Analizi</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.dot} />
          <Text style={styles.sectionTitle}>Yerleşim</Text>
        </View>
        <Text style={styles.sectionText}>{placement}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Lightbulb size={16} color={Colors.secondary.sunshine} />
          <Text style={styles.sectionTitle}>Yorum</Text>
        </View>
        <Text style={styles.sectionText}>{interpretation}</Text>
      </View>

      <View style={styles.divider} />

      <View style={[styles.section, styles.recommendationSection]}>
        <View style={styles.sectionHeader}>
          <Heart size={16} color={Colors.primary.sunset} />
          <Text style={styles.sectionTitle}>Öneri</Text>
        </View>
        <Text style={[styles.sectionText, styles.recommendationText]}>{recommendation}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 24,
    padding: 24,
    gap: 16,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E9D5FF',
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: typography.family.extrabold,
    color: Colors.neutral.darkest,
    letterSpacing: -0.3,
    flex: 1,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9333EA',
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: typography.family.bold,
    color: Colors.neutral.dark,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.neutral.dark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral.lighter,
  },
  recommendationSection: {
    backgroundColor: '#FFF9F0',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  recommendationText: {
    color: '#92400E',
    fontFamily: typography.family.medium,
  },
});
