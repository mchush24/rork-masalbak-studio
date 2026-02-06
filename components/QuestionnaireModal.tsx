import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { Colors } from "@/constants/colors";
import { X, CheckCircle2 } from "lucide-react-native";
import { typography, spacing, radius, shadows } from "@/constants/design-system";
import {
  QUESTIONNAIRE_QUESTIONS,
  QUESTIONNAIRE_INTRO,
  type QuestionnaireAnswer,
  type FrequencyAnswer,
} from "@/types/QuestionnaireSchema";
import * as Haptics from "expo-haptics";

interface QuestionnaireModalProps {
  visible: boolean;
  onComplete: (answers: QuestionnaireAnswer[]) => void;
  onClose: () => void;
}

export function QuestionnaireModal({
  visible,
  onComplete,
  onClose,
}: QuestionnaireModalProps) {
  const [answers, setAnswers] = useState<Record<string, FrequencyAnswer>>({});

  const handleAnswer = (questionId: string, answer: FrequencyAnswer) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleComplete = () => {
    const answersArray: QuestionnaireAnswer[] = Object.entries(answers).map(
      ([questionId, answer]) => ({
        questionId,
        answer,
      })
    );
    onComplete(answersArray);
  };

  const allAnswered = QUESTIONNAIRE_QUESTIONS.every((q) => answers[q.id]);
  const answerLabels: Record<FrequencyAnswer, string> = {
    never: "Hayır",
    sometimes: "Bazen",
    often: "Sık",
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{QUESTIONNAIRE_INTRO.title}</Text>
              <Text style={styles.subtitle}>
                {QUESTIONNAIRE_INTRO.subtitle}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.neutral.dark} />
            </Pressable>
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteText}>{QUESTIONNAIRE_INTRO.note}</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.timeframeLabel}>
              {QUESTIONNAIRE_INTRO.timeframe}
            </Text>

            {QUESTIONNAIRE_QUESTIONS.map((question) => (
              <View key={question.id} style={styles.questionCard}>
                <Text style={styles.questionText}>{question.text}</Text>
                <View style={styles.answersRow}>
                  {(
                    ["never", "sometimes", "often"] as FrequencyAnswer[]
                  ).map((answer) => {
                    const isSelected = answers[question.id] === answer;
                    return (
                      <Pressable
                        key={answer}
                        onPress={() => handleAnswer(question.id, answer)}
                        style={[
                          styles.answerButton,
                          isSelected && styles.answerButtonSelected,
                        ]}
                      >
                        {isSelected && (
                          <CheckCircle2
                            size={16}
                            color={Colors.primary.sunset}
                            style={{ marginRight: 4 }}
                          />
                        )}
                        <Text
                          style={[
                            styles.answerText,
                            isSelected && styles.answerTextSelected,
                          ]}
                        >
                          {answerLabels[answer]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable
            disabled={!allAnswered}
            onPress={handleComplete}
            style={[
              styles.completeButton,
              !allAnswered && styles.completeButtonDisabled,
            ]}
          >
            <Text style={styles.completeButtonText}>
              {allAnswered ? "Tamamla" : "Tüm soruları cevaplayın"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: "90%",
    ...shadows.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.darkest,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing['1.5'],
  },
  subtitle: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    lineHeight: typography.lineHeightPx.base,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral.lighter,
    justifyContent: "center",
    alignItems: "center",
  },
  noteCard: {
    backgroundColor: "#FFF9F0",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FBBF24",
    marginBottom: 20,
  },
  noteText: {
    fontSize: typography.size.sm,
    color: "#92400E",
    lineHeight: typography.lineHeightPx.sm,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  timeframeLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['4'],
  },
  questionCard: {
    backgroundColor: Colors.background.primary,
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  questionText: {
    fontSize: typography.size.base,
    color: Colors.neutral.darkest,
    lineHeight: typography.lineHeightPx.base,
    marginBottom: spacing['3'],
    fontWeight: typography.weight.semibold,
  },
  answersRow: {
    flexDirection: "row",
    gap: 8,
  },
  answerButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.neutral.white,
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  answerButtonSelected: {
    backgroundColor: Colors.primary.soft,
    borderColor: Colors.primary.sunset,
  },
  answerText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.medium,
  },
  answerTextSelected: {
    color: Colors.primary.sunset,
  },
  completeButton: {
    backgroundColor: Colors.primary.sunset,
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 12,
    ...shadows.colored(Colors.primary.sunset),
  },
  completeButtonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
    letterSpacing: typography.letterSpacing.normal,
  },
});
