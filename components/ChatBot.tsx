/**
 * 🤖 ChatBot Component
 *
 * Floating yardım asistanı butonu ve chat modal'ı
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';
import { trpc } from '@/lib/trpc';
import { useChild } from '@/lib/contexts/ChildContext';
import type { Child } from '@/lib/hooks/useAuth';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================

interface ChatAction {
  type: 'navigate' | 'create' | 'open' | 'link';
  label: string;
  target: string;
  icon?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: 'faq' | 'ai';
  timestamp: Date;
  actions?: ChatAction[];
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ChatBot() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFAQ, setShowFAQ] = useState(true);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Child context
  const { selectedChild, setSelectedChild, children: userChildren } = useChild();

  // Handle action button press
  const handleActionPress = (action: ChatAction) => {
    if (action.type === 'link' && action.target.startsWith('mailto:')) {
      Linking.openURL(action.target);
    } else if (action.type === 'link') {
      Linking.openURL(action.target);
    } else {
      // Close chat and navigate
      setIsOpen(false);
      setTimeout(() => {
        router.push(action.target as any);
      }, 300);
    }
  };

  // Animation for floating button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // API mutations
  const sendMessageMutation = trpc.chatbot.sendMessage.useMutation();
  const faqQuery = trpc.chatbot.getFAQs.useQuery(undefined, {
    enabled: isOpen,
  });

  // Pulse animation for floating button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Bounce animation when opened
  useEffect(() => {
    if (isOpen) {
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [isOpen]);

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Merhaba! 👋 Ben Renkioo asistanıyım. Size nasıl yardımcı olabilirim?\n\nAşağıdaki sık sorulan sorulara göz atabilir veya doğrudan sorununuzu yazabilirsiniz.',
          source: 'faq',
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setShowFAQ(false);

    try {
      // Build conversation history for context
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const response = await sendMessageMutation.mutateAsync({
        message: userMessage.content,
        conversationHistory: history,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        source: response.source,
        timestamp: new Date(),
        actions: response.actions as ChatAction[] | undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('[ChatBot] Error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin. 🙏',
          source: 'ai',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle FAQ question click
  const handleFAQClick = (question: string) => {
    setInputText(question);
    // Auto-send after a brief delay
    setTimeout(() => {
      setInputText('');
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: question,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setShowFAQ(false);
      setIsLoading(true);

      sendMessageMutation
        .mutateAsync({
          message: question,
          conversationHistory: [],
        })
        .then(response => {
          setMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: response.message,
              source: response.source,
              timestamp: new Date(),
              actions: response.actions as ChatAction[] | undefined,
            },
          ]);
        })
        .catch(() => {
          setMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: 'Üzgünüm, bir hata oluştu. 🙏',
              source: 'ai',
              timestamp: new Date(),
            },
          ]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 100);
  };

  // Close and reset
  const handleClose = () => {
    setIsOpen(false);
    // Reset after animation
    setTimeout(() => {
      setMessages([]);
      setShowFAQ(true);
    }, 300);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {/* Floating Chat Button */}
      <Animated.View
        style={[
          styles.floatingButton,
          {
            bottom: insets.bottom + 80,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Pressable
          onPress={() => setIsOpen(true)}
          style={({ pressed }) => [
            styles.floatingButtonInner,
            pressed && { opacity: 0.8 },
          ]}
        >
          <LinearGradient
            colors={['#9333EA', '#7C3AED']}
            style={styles.floatingButtonGradient}
          >
            <MessageCircle size={28} color="#FFF" />
          </LinearGradient>
        </Pressable>
        {/* Notification dot */}
        <View style={styles.notificationDot}>
          <Text style={styles.notificationText}>?</Text>
        </View>
      </Animated.View>

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <Animated.View
            style={[
              styles.chatContainer,
              {
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                transform: [
                  {
                    translateY: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [SCREEN_HEIGHT, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Header */}
            <LinearGradient
              colors={['#9333EA', '#7C3AED']}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <View style={styles.botAvatar}>
                    <Bot size={24} color="#9333EA" />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>Renkioo Asistan</Text>
                    <Text style={styles.headerSubtitle}>Size yardımcı olmak için buradayım</Text>
                  </View>
                </View>
                <Pressable onPress={handleClose} style={styles.closeButton}>
                  <X size={24} color="#FFF" />
                </Pressable>
              </View>

              {/* Child Selector in Header */}
              {userChildren && userChildren.length > 0 && (
                <View style={styles.childSelectorContainer}>
                  <Pressable
                    onPress={() => setShowChildSelector(!showChildSelector)}
                    style={styles.childSelectorButton}
                  >
                    <View style={styles.childAvatar}>
                      <Text style={styles.childAvatarText}>
                        {selectedChild?.name?.[0]?.toUpperCase() || '?'}
                      </Text>
                    </View>
                    <Text style={styles.childName}>
                      {selectedChild?.name || 'Çocuk Seç'}
                    </Text>
                    <ChevronRight
                      size={16}
                      color="rgba(255,255,255,0.8)"
                      style={{ transform: [{ rotate: showChildSelector ? '90deg' : '0deg' }] }}
                    />
                  </Pressable>

                  {/* Child List Dropdown */}
                  {showChildSelector && (
                    <View style={styles.childDropdown}>
                      {userChildren.map((child: Child, index: number) => (
                        <Pressable
                          key={`${child.name}-${index}`}
                          onPress={() => {
                            setSelectedChild(child);
                            setShowChildSelector(false);
                          }}
                          style={[
                            styles.childOption,
                            selectedChild?.name === child.name && styles.childOptionSelected,
                          ]}
                        >
                          <View style={[
                            styles.childOptionAvatar,
                            selectedChild?.name === child.name && styles.childOptionAvatarSelected,
                          ]}>
                            <Text style={styles.childOptionAvatarText}>
                              {child.name?.[0]?.toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.childOptionInfo}>
                            <Text style={[
                              styles.childOptionName,
                              selectedChild?.name === child.name && styles.childOptionNameSelected,
                            ]}>
                              {child.name}
                            </Text>
                            <Text style={styles.childOptionAge}>
                              {child.age} yaşında
                            </Text>
                          </View>
                          {selectedChild?.name === child.name && (
                            <View style={styles.checkmark}>
                              <Text style={styles.checkmarkText}>✓</Text>
                            </View>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </LinearGradient>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map(message => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.role === 'user'
                      ? styles.userBubble
                      : styles.assistantBubble,
                  ]}
                >
                  {message.role === 'assistant' && (
                    <View style={styles.assistantIcon}>
                      <Bot size={16} color="#9333EA" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageContent,
                      message.role === 'user'
                        ? styles.userContent
                        : styles.assistantContent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        message.role === 'user' && styles.userText,
                      ]}
                    >
                      {message.content}
                    </Text>
                    {message.source === 'ai' && message.role === 'assistant' && (
                      <View style={styles.aiIndicator}>
                        <Sparkles size={10} color="#9333EA" />
                        <Text style={styles.aiIndicatorText}>AI yanıtı</Text>
                      </View>
                    )}
                    {/* Action Buttons */}
                    {message.actions && message.actions.length > 0 && (
                      <View style={styles.actionsContainer}>
                        {message.actions.map((action, idx) => (
                          <Pressable
                            key={idx}
                            style={({ pressed }) => [
                              styles.actionButton,
                              pressed && styles.actionButtonPressed,
                            ]}
                            onPress={() => handleActionPress(action)}
                          >
                            {action.icon && (
                              <Text style={styles.actionIcon}>{action.icon}</Text>
                            )}
                            <Text style={styles.actionLabel}>{action.label}</Text>
                            <ChevronRight size={14} color="#9333EA" />
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <View style={[styles.messageBubble, styles.assistantBubble]}>
                  <View style={styles.assistantIcon}>
                    <Bot size={16} color="#9333EA" />
                  </View>
                  <View style={[styles.messageContent, styles.assistantContent]}>
                    <View style={styles.typingIndicator}>
                      <ActivityIndicator size="small" color="#9333EA" />
                      <Text style={styles.typingText}>Yazıyor...</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* FAQ Section */}
              {showFAQ && faqQuery.data && (
                <View style={styles.faqSection}>
                  <View style={styles.faqHeader}>
                    <HelpCircle size={18} color="#9333EA" />
                    <Text style={styles.faqTitle}>Sık Sorulan Sorular</Text>
                  </View>
                  {faqQuery.data.categories.slice(0, 3).map(category => (
                    <View key={category.id} style={styles.faqCategory}>
                      <Text style={styles.faqCategoryTitle}>
                        {category.emoji} {category.name}
                      </Text>
                      {category.questions.slice(0, 2).map((faqItem, idx) => (
                        <Pressable
                          key={faqItem.id || idx}
                          style={({ pressed }) => [
                            styles.faqItem,
                            pressed && { opacity: 0.7 },
                          ]}
                          onPress={() => handleFAQClick(faqItem.question)}
                        >
                          <Text style={styles.faqQuestion}>{faqItem.question}</Text>
                          <ChevronRight size={16} color="#9333EA" />
                        </Pressable>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Sorunuzu yazın..."
                placeholderTextColor={Colors.neutral.medium}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
                returnKeyType="send"
                multiline
                maxLength={500}
              />
              <Pressable
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
                style={({ pressed }) => [
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <LinearGradient
                  colors={
                    inputText.trim() && !isLoading
                      ? ['#9333EA', '#7C3AED']
                      : [Colors.neutral.light, Colors.neutral.medium]
                  }
                  style={styles.sendButtonGradient}
                >
                  <Send size={20} color="#FFF" />
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Floating Button - LEFT side (child selector is on RIGHT)
  floatingButton: {
    position: 'absolute',
    left: 20,
    zIndex: 1000,
  },
  floatingButtonInner: {
    borderRadius: 30,
    ...shadows.lg,
  },
  floatingButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  notificationText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    marginTop: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  // Header
  header: {
    paddingVertical: spacing["4"],
    paddingHorizontal: spacing["4"],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing["3"],
  },
  botAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: typography.size.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing["4"],
    gap: spacing["3"],
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing["2"],
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  assistantBubble: {
    justifyContent: 'flex-start',
  },
  assistantIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    maxWidth: '80%',
    padding: spacing["3"],
    borderRadius: radius.xl,
  },
  userContent: {
    backgroundColor: '#9333EA',
    borderBottomRightRadius: 4,
  },
  assistantContent: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    ...shadows.sm,
  },
  messageText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.darkest,
    lineHeight: 20,
  },
  userText: {
    color: '#FFF',
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing["2"],
    opacity: 0.6,
  },
  aiIndicatorText: {
    fontSize: 10,
    color: '#9333EA',
  },

  // Action Buttons
  actionsContainer: {
    marginTop: spacing["3"],
    gap: spacing["2"],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing["2"],
    paddingVertical: spacing["2"],
    paddingHorizontal: spacing["3"],
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  actionButtonPressed: {
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    transform: [{ scale: 0.98 }],
  },
  actionIcon: {
    fontSize: 16,
  },
  actionLabel: {
    flex: 1,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: '#9333EA',
  },

  // Typing indicator
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing["2"],
  },
  typingText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },

  // FAQ Section
  faqSection: {
    marginTop: spacing["4"],
    backgroundColor: '#FFF',
    borderRadius: radius.xl,
    padding: spacing["4"],
    ...shadows.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing["2"],
    marginBottom: spacing["3"],
  },
  faqTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
  },
  faqCategory: {
    marginBottom: spacing["3"],
  },
  faqCategoryTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.medium,
    marginBottom: spacing["2"],
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing["2"],
    paddingHorizontal: spacing["3"],
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
    borderRadius: radius.lg,
    marginBottom: spacing["2"],
  },
  faqQuestion: {
    flex: 1,
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing["2"],
    padding: spacing["3"],
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightest,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: '#F1F3F4',
    borderRadius: radius.xl,
    paddingHorizontal: spacing["4"],
    paddingVertical: spacing["3"],
    fontSize: typography.size.sm,
    color: Colors.neutral.darkest,
  },
  sendButton: {
    borderRadius: 22,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Child Selector
  childSelectorContainer: {
    marginTop: spacing["3"],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: spacing["3"],
  },
  childSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing["2"],
    paddingVertical: spacing["2"],
    paddingHorizontal: spacing["3"],
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
  },
  childAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  childAvatarText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#9333EA',
  },
  childName: {
    flex: 1,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: '#FFF',
  },
  childDropdown: {
    marginTop: spacing["2"],
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  childOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing["3"],
    padding: spacing["3"],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightest,
  },
  childOptionSelected: {
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
  },
  childOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutral.lighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childOptionAvatarSelected: {
    backgroundColor: '#9333EA',
  },
  childOptionAvatarText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  childOptionInfo: {
    flex: 1,
  },
  childOptionName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
  },
  childOptionNameSelected: {
    color: '#9333EA',
  },
  childOptionAge: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
});

export default ChatBot;
