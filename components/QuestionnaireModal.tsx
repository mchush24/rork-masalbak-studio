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
                            color={Colors.primary.coral}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.neutral.darkest,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.neutral.medium,
    lineHeight: 22,
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
    fontSize: 14,
    color: "#92400E",
    lineHeight: 21,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  timeframeLabel: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.neutral.darkest,
    marginBottom: 16,
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
    fontSize: 15,
    color: Colors.neutral.darkest,
    lineHeight: 22,
    marginBottom: 14,
    fontWeight: "600" as const,
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
    borderColor: Colors.primary.coral,
  },
  answerText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.neutral.medium,
  },
  answerTextSelected: {
    color: Colors.primary.coral,
  },
  completeButton: {
    backgroundColor: Colors.primary.coral,
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 12,
    shadowColor: Colors.primary.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  completeButtonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.neutral.white,
    letterSpacing: 0.3,
  },
});
