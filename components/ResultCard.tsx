import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { AssessmentOutput } from '@/types/AssessmentSchema';
import { shadows, typography } from '@/constants/design-system';
import { Colors } from '@/constants/colors';

export const ResultCard: React.FC<{
  data: AssessmentOutput;
  onDetails?: () => void;
}> = ({ data, onDetails }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Özet</Text>
      {data.reflective_hypotheses.slice(0, 3).map((h, i) => (
        <View key={i} style={styles.hypothesis}>
          <Text style={styles.hypothesisTitle}>
            • {h.theme.replaceAll('_', ' ')} — {(h.confidence * 100).toFixed(0)}%
          </Text>
          <Text style={styles.evidence}>Kanıt: {h.evidence.join(', ')}</Text>
        </View>
      ))}

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Sohbet Soruları</Text>
      {data.conversation_prompts.map((q, i) => (
        <Text key={i} style={styles.listItem}>
          • {q}
        </Text>
      ))}

      <Text style={[styles.sectionTitle, styles.marginTop]}>Etkinlik Önerileri</Text>
      {data.activity_ideas.map((q, i) => (
        <Text key={i} style={styles.listItem}>
          • {q}
        </Text>
      ))}

      {(data.safety_flags.self_harm || data.safety_flags.abuse_concern) && (
        <View style={styles.safetyAlert}>
          <Text style={styles.safetyTitle}>Güvenlik Uyarısı</Text>
          <Text style={styles.safetyText}>Uzman görüşü önerilir.</Text>
        </View>
      )}

      <Text style={styles.disclaimer}>{data.disclaimers.join(' ')}</Text>

      {onDetails && (
        <TouchableOpacity onPress={onDetails} style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>Detayları Gör</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    ...shadows.sm,
  },
  title: {
    fontSize: 18,
    fontFamily: typography.family.bold,
  },
  hypothesis: {
    paddingVertical: 6,
  },
  hypothesisTitle: {
    fontFamily: typography.family.semibold,
    marginBottom: 2,
  },
  evidence: {
    color: Colors.neutral.medium,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: typography.family.bold,
  },
  marginTop: {
    marginTop: 8,
  },
  listItem: {
    lineHeight: 20,
  },
  safetyAlert: {
    backgroundColor: '#fee',
    padding: 10,
    borderRadius: 8,
  },
  safetyTitle: {
    color: '#b00',
    fontFamily: typography.family.bold,
  },
  safetyText: {
    color: '#900',
  },
  disclaimer: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
  },
  detailsButton: {
    backgroundColor: '#0a7',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  detailsButtonText: {
    color: Colors.neutral.white,
    textAlign: 'center',
    fontFamily: typography.family.bold,
  },
});
