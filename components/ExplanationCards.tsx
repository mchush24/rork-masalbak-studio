import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Heart, Shield, AlertCircle } from 'lucide-react-native';
import { EXPLANATIONS } from '@/types/QuestionnaireSchema';

import { typography } from '@/constants/design-system';
interface ExplanationCardsProps {
  showSupport?: boolean;
}

export function ExplanationCards({ showSupport = false }: ExplanationCardsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Heart size={20} color={Colors.secondary.sky} />
          <Text style={styles.cardTitle}>{EXPLANATIONS.normalEmotionalExpression.title}</Text>
        </View>
        <Text style={styles.cardText}>{EXPLANATIONS.normalEmotionalExpression.text}</Text>
      </View>

      {showSupport && (
        <View style={[styles.card, styles.cardSupport]}>
          <View style={styles.cardHeader}>
            <Shield size={20} color="#DC2626" />
            <Text style={[styles.cardTitle, { color: '#DC2626' }]}>
              {EXPLANATIONS.supportNeeded.title}
            </Text>
          </View>
          <Text style={[styles.cardText, { color: '#991B1B' }]}>
            {EXPLANATIONS.supportNeeded.text}
          </Text>
        </View>
      )}

      <View style={[styles.card, styles.cardDisclaimer]}>
        <View style={styles.cardHeader}>
          <AlertCircle size={20} color={Colors.neutral.medium} />
          <Text style={[styles.cardTitle, { color: Colors.neutral.dark }]}>
            {EXPLANATIONS.disclaimer.title}
          </Text>
        </View>
        <Text style={[styles.cardText, { color: Colors.neutral.medium }]}>
          {EXPLANATIONS.disclaimer.text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  card: {
    backgroundColor: '#EFF6FF',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 10,
  },
  cardSupport: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  cardDisclaimer: {
    backgroundColor: Colors.neutral.gray100,
    borderColor: Colors.neutral.gray300,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: typography.family.bold,
    color: '#1E40AF',
    flex: 1,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1E3A8A',
  },
});
