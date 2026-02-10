/**
 * Analysis Chat Sheet
 *
 * Bottom sheet modal for chatting with Ioo about analysis results
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { X, Send, Sparkles, StickyNote } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { trpc } from '@/lib/trpc';
import { Ioo } from '@/components/Ioo';
import { AnimatedMessage } from '@/components/chat/AnimatedMessage';
import { ChatMessage } from './ChatMessage';
import { QuickPrompts } from './QuickPrompts';
import { ReflectionCard } from './ReflectionCard';
import { getKeyboardBehavior, getKeyboardVerticalOffset } from '@/lib/platform';
import type { AnalysisResponse } from '@/types/analysis';

// Theme colors for consistency
const THEME = {
  primary: Colors.primary.sunset,
  primaryDark: '#E88A6A',
  secondary: Colors.secondary.lavender,
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referencedInsightIndex?: number;
  suggestedQuestions?: string[];
}

interface AnalysisChatSheetProps {
  analysisId: string;
  analysisResult: AnalysisResponse;
  childAge?: number;
  childName?: string;
  isVisible: boolean;
  onClose: () => void;
  onOpenNotes?: () => void;
}

export function AnalysisChatSheet({
  analysisId,
  analysisResult,
  childAge,
  childName,
  isVisible,
  onClose,
  onOpenNotes,
}: AnalysisChatSheetProps) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showReflection, setShowReflection] = useState(false);

  // tRPC mutations
  const sendMessageMutation = trpc.analysisChat.sendMessage.useMutation();
  const startConversationMutation = trpc.analysisChat.startConversation.useMutation();
  const quickPromptsQuery = trpc.analysisChat.getQuickPrompts.useQuery(
    { analysisId },
    { enabled: isVisible }
  );
  const reflectionPromptsQuery = trpc.analysisChat.getReflectionPrompts.useQuery();

  // Start conversation when sheet opens
  useEffect(() => {
    if (isVisible && !conversationId) {
      startConversationMutation.mutate(
        { analysisId },
        {
          onSuccess: (data) => {
            setConversationId(data.conversation.id);
            if (!data.isNew && data.conversation.messages?.length > 0) {
              setMessages(data.conversation.messages);
              setShowWelcome(false);
            }
          },
        }
      );
    }
  }, [isVisible, analysisId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (text: string, insightIndex?: number) => {
    if (!text.trim() || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
      referencedInsightIndex: insightIndex,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setShowWelcome(false);

    try {
      const response = await sendMessageMutation.mutateAsync({
        analysisId,
        message: text.trim(),
        conversationId: conversationId || undefined,
        referencedInsightIndex: insightIndex,
      });

      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId);
      }

      const assistantMessage: Message = {
        id: response.assistantMessage.id,
        role: 'assistant',
        content: response.assistantMessage.content,
        timestamp: response.assistantMessage.timestamp,
        referencedInsightIndex: response.assistantMessage.referencedInsightIndex,
        suggestedQuestions: response.suggestedQuestions,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Show reflection prompt after a few messages
      if (messages.length >= 4 && !showReflection) {
        setShowReflection(true);
      }
    } catch (error) {
      console.error('Send message error:', error);
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Üzgünüm, yanıt oluşturamadım. Lütfen tekrar deneyin.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [analysisId, conversationId, isLoading, messages.length, showReflection]);

  const handleQuickPromptSelect = (question: string) => {
    handleSendMessage(question);
  };

  const handleInsightClick = (insightIndex: number) => {
    const insight = analysisResult.insights?.[insightIndex];
    if (insight) {
      handleSendMessage(`"${insight.title}" hakkında daha fazla bilgi verir misin?`, insightIndex);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <BlurView intensity={20} style={styles.blurContainer}>
        <View style={[styles.sheetContainer, { paddingBottom: insets.bottom }]}>
          {/* Header */}
          <LinearGradient
            colors={['#1A2332', '#2E3F5C']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Ioo size="sm" mood="curious" animated={true} />
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>Ioo ile Sohbet</Text>
                  <Text style={styles.headerSubtitle}>
                    Analiz hakkında konuşalım
                  </Text>
                </View>
              </View>
              <View style={styles.headerActions}>
                {onOpenNotes && (
                  <Pressable
                    onPress={onOpenNotes}
                    style={({ pressed }) => [
                      styles.headerButton,
                      pressed && styles.headerButtonPressed,
                    ]}
                  >
                    <StickyNote size={20} color="white" />
                  </Pressable>
                )}
                <Pressable
                  onPress={handleClose}
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed && styles.closeButtonPressed,
                  ]}
                >
                  <X size={24} color="white" />
                </Pressable>
              </View>
            </View>
          </LinearGradient>

          {/* Chat Content */}
          <KeyboardAvoidingView
            behavior={getKeyboardBehavior()}
            keyboardVerticalOffset={getKeyboardVerticalOffset()}
            style={styles.keyboardAvoid}
          >
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Welcome Section */}
              {showWelcome && (
                <View style={styles.welcomeSection}>
                  <AnimatedMessage type="assistant">
                    <View style={styles.welcomeCard}>
                      <Ioo size="md" mood="happy" animated={true} />
                      <Text style={styles.welcomeTitle}>
                        Merhaba{childName ? ` ${childName}'in ebeveyni` : ''}!
                      </Text>
                      <Text style={styles.welcomeText}>
                        Bu analiz hakkında sorularını yanıtlayabilirim.
                        Aşağıdaki sorulardan birini seçebilir veya kendi sorunuzu yazabilirsiniz.
                      </Text>
                    </View>
                  </AnimatedMessage>

                  {/* Quick Prompts */}
                  <QuickPrompts
                    prompts={quickPromptsQuery.data?.quickPrompts || []}
                    onSelect={handleQuickPromptSelect}
                    isLoading={quickPromptsQuery.isLoading}
                  />
                </View>
              )}

              {/* Messages */}
              {messages.map((message, index) => (
                <AnimatedMessage
                  key={message.id}
                  type={message.role}
                  delay={index === messages.length - 1 ? 50 : 0}
                >
                  <ChatMessage
                    message={message}
                    insights={analysisResult.insights}
                    onInsightClick={handleInsightClick}
                    onSuggestedQuestionClick={handleQuickPromptSelect}
                  />
                </AnimatedMessage>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <AnimatedMessage type="assistant">
                  <View style={styles.typingIndicator}>
                    <ActivityIndicator size="small" color={THEME.primary} />
                    <Text style={styles.typingText}>Ioo düşünüyor...</Text>
                  </View>
                </AnimatedMessage>
              )}

              {/* Reflection Card */}
              {showReflection && reflectionPromptsQuery.data?.prompts && (
                <ReflectionCard
                  prompts={reflectionPromptsQuery.data.prompts}
                  onSelect={handleQuickPromptSelect}
                  onDismiss={() => setShowReflection(false)}
                />
              )}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Bir soru yazın..."
                  placeholderTextColor={Colors.neutral.medium}
                  multiline
                  maxLength={500}
                  returnKeyType="send"
                  onSubmitEditing={() => handleSendMessage(inputText)}
                  editable={!isLoading}
                />
                <Pressable
                  onPress={() => handleSendMessage(inputText)}
                  disabled={!inputText.trim() || isLoading}
                  style={({ pressed }) => [
                    styles.sendButton,
                    (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                    pressed && styles.sendButtonPressed,
                  ]}
                >
                  <LinearGradient
                    colors={
                      inputText.trim() && !isLoading
                        ? [THEME.primary, THEME.primaryDark]
                        : ['#E0E0E0', '#CCCCCC']
                    }
                    style={styles.sendButtonGradient}
                  >
                    <Send size={20} color="white" />
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.xl,
  },
  header: {
    paddingTop: spacing['4'],
    paddingBottom: spacing['3'],
    paddingHorizontal: spacing['4'],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    marginLeft: spacing['3'],
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  headerSubtitle: {
    fontSize: typography.size.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing['4'],
    paddingBottom: spacing['6'],
  },
  welcomeSection: {
    marginBottom: spacing['4'],
  },
  welcomeCard: {
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
    padding: spacing['4'],
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.dark,
    marginTop: spacing['3'],
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    textAlign: 'center',
    marginTop: spacing['2'],
    lineHeight: 20,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing['3'],
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
    alignSelf: 'flex-start',
    gap: spacing['2'],
  },
  typingText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontStyle: 'italic',
  },
  inputContainer: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
    backgroundColor: Colors.neutral.white,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing['2'],
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    fontSize: typography.size.base,
    color: Colors.neutral.dark,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  sendButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
