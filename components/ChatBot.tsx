/**
 * 🤖 ChatBot Component
 *
 * Floating yardım asistanı butonu ve chat modal'ı
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  X,
  Send,
  Bot,
  Sparkles,
  HelpCircle,
  ChevronRight,
  MessageSquare,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { USE_NATIVE_DRIVER } from '@/utils/animation';
import { typography, spacing, radius, shadows, zIndex } from '@/constants/design-system';
import { trpc } from '@/lib/trpc';
import { useChild } from '@/lib/contexts/ChildContext';
import type { Child } from '@/lib/hooks/useAuth';
import { useRouter, usePathname } from 'expo-router';
import * as Linking from 'expo-linking';
import { ProactiveSuggestionPopup } from './ProactiveSuggestionPopup';
import { QuickReplyChips, QUICK_REPLIES, QuickReply } from './chat/QuickReplyChips';
import { TypingBubble } from './chat/TypingIndicator';
import { AnimatedMessage } from './chat/AnimatedMessage';
import { InlineFeedback } from './chat/FeedbackButtons';
import {
  getContextEngine,
  getResponseGenerator,
  SmartQuickReply,
} from './chat/SmartContextEngine';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getKeyboardBehavior, getKeyboardVerticalOffset } from '@/lib/platform';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Conversation limits
const MAX_MESSAGES = 50; // Keep last 50 messages in memory
const MAX_HISTORY_FOR_API = 20; // Send last 20 to API (matches backend schema)

// Helper to limit messages array
const limitMessages = (messages: Message[]): Message[] => {
  if (messages.length <= MAX_MESSAGES) return messages;
  return messages.slice(-MAX_MESSAGES);
};

// Map route paths to screen names for proactive suggestions
const getScreenName = (pathname: string): string => {
  if (pathname.includes('/stories')) return 'stories';
  if (pathname.includes('/analysis')) return 'analysis';
  if (pathname.includes('/coloring')) return 'coloring';
  if (pathname.includes('/profile')) return 'profile';
  return 'home';
};

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
  quickReplies?: QuickReply[];
  hideQuickReplies?: boolean;
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ChatBot() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFAQ, setShowFAQ] = useState(true);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Child context
  const { selectedChild, setSelectedChild, children: userChildren } = useChild();

  // Current screen for proactive suggestions
  const currentScreen = getScreenName(pathname);

  // Smart Context Engine
  const contextEngine = getContextEngine();
  const responseGenerator = getResponseGenerator();

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
    staleTime: 1000 * 60 * 30, // 30 dakika cache - her açılışta yeniden yükleme
    gcTime: 1000 * 60 * 60, // 1 saat garbage collection
  });

  // Gentle pulse animation for floating button
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: USE_NATIVE_DRIVER,
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
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [isOpen]);

  // Check first visit on mount
  useEffect(() => {
    const checkFirstVisit = async () => {
      try {
        const visited = await AsyncStorage.getItem('renkioo_app_visited');
        setIsFirstVisit(!visited);
        if (!visited) {
          await AsyncStorage.setItem('renkioo_app_visited', 'true');
        }
      } catch {
        setIsFirstVisit(false);
      }
    };
    checkFirstVisit();
  }, []);

  // Smart welcome message - uses context engine for intelligent responses
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const generateSmartWelcome = async () => {
        try {
          const smartResponse = await responseGenerator.generateWelcome({
            screen: currentScreen,
            child: selectedChild,
            isFirstVisit,
          });

          // Convert SmartQuickReply to QuickReply
          const quickReplies: QuickReply[] = smartResponse.quickReplies.map(sr => ({
            id: sr.id,
            label: sr.label,
            emoji: sr.emoji,
            action: sr.action,
            target: sr.target,
          }));

          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content: smartResponse.message,
              source: 'faq',
              timestamp: new Date(),
              quickReplies,
            },
          ]);
          setShowFAQ(false);

          // Update context engine
          contextEngine.updateScreen(currentScreen);
        } catch (error) {
          console.error('[ChatBot] Smart welcome error:', error);
          // Fallback to simple welcome
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content: 'Merhaba! 👋 Ne yapmak istersin?',
              source: 'faq',
              timestamp: new Date(),
              quickReplies: QUICK_REPLIES.welcome,
            },
          ]);
          setShowFAQ(false);
        }
      };

      generateSmartWelcome();
    }
  }, [isOpen, currentScreen, selectedChild, isFirstVisit]);

  // Handle pending question from proactive suggestion
  useEffect(() => {
    if (isOpen && pendingQuestion && messages.length > 0) {
      handleFAQClick(pendingQuestion);
      setPendingQuestion(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pendingQuestion, messages.length]);

  // Proactive suggestion handlers
  const handleProactiveQuestionPress = (question: string) => {
    setPendingQuestion(question);
    setIsOpen(true);
  };

  const handleProactiveOpenChat = () => {
    setIsOpen(true);
  };

  // Auto-scroll to bottom - requestAnimationFrame ile daha responsive
  useEffect(() => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages]);

  // Handle quick reply selection
  const handleQuickReply = async (reply: QuickReply) => {
    // Record click in context engine
    contextEngine.recordClickedReply(reply.id);

    // Hide quick replies from the message that was clicked
    setMessages(prev => prev.map(msg => ({
      ...msg,
      hideQuickReplies: true,
    })));

    if (reply.action === 'navigate' && reply.target) {
      setIsOpen(false);
      setTimeout(() => {
        router.push(reply.target as any);
      }, 300);
      return;
    }

    if (reply.action === 'custom') {
      // Main menu - regenerate smart welcome
      if (reply.id === 'main-menu') {
        const smartResponse = await responseGenerator.generateWelcome({
          screen: currentScreen,
          child: selectedChild,
          isFirstVisit: false,
        });
        const quickReplies: QuickReply[] = smartResponse.quickReplies.map(sr => ({
          id: sr.id,
          label: sr.label,
          emoji: sr.emoji,
          action: sr.action,
          target: sr.target,
        }));
        setMessages([{
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: smartResponse.message,
          source: 'faq',
          timestamp: new Date(),
          quickReplies,
        }]);
        setShowFAQ(false);
        return;
      }

      // Select child - open child selector
      if (reply.id === 'select-child') {
        setShowChildSelector(true);
        return;
      }

      // Continue work - navigate to last activity
      if (reply.id === 'continue-work') {
        const unfinished = await contextEngine.checkUnfinishedWork();
        if (unfinished.has && unfinished.type) {
          const routes: Record<string, string> = {
            coloring: '/(tabs)/coloring',
            story: '/(tabs)/stories',
            analysis: '/(tabs)/analysis',
          };
          setIsOpen(false);
          setTimeout(() => {
            router.push(routes[unfinished.type!] as any);
          }, 300);
        }
        return;
      }

      // New work - clear unfinished and show options
      if (reply.id === 'new-work') {
        await contextEngine.clearUnfinishedWork();
        // Continue to send as message
      }

      // Skip tour
      if (reply.id === 'skip-tour') {
        const smartResponse = await responseGenerator.generateWelcome({
          screen: currentScreen,
          child: selectedChild,
          isFirstVisit: false,
        });
        const quickReplies: QuickReply[] = smartResponse.quickReplies.map(sr => ({
          id: sr.id,
          label: sr.label,
          emoji: sr.emoji,
          action: sr.action,
          target: sr.target,
        }));
        setMessages([{
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: smartResponse.message,
          source: 'faq',
          timestamp: new Date(),
          quickReplies,
        }]);
        return;
      }

      if (reply.id === 'retry') {
        // Retry last message logic could go here
        return;
      }
    }

    // For 'send' action, treat as a regular message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: reply.emoji ? `${reply.emoji} ${reply.label}` : reply.label,
      timestamp: new Date(),
    };

    setMessages(prev => limitMessages([...prev, userMessage]));
    setIsLoading(true);

    // Send to backend
    sendMessageMutation
      .mutateAsync({
        message: reply.label,
        conversationHistory: messages
          .filter(m => m.id !== 'welcome')
          .slice(-MAX_HISTORY_FOR_API)
          .map(m => ({ role: m.role, content: m.content })),
        childAge: selectedChild?.age,
        childName: selectedChild?.name,
        // Faz 6: Analytics için ekran bilgisi
        currentScreen,
      })
      .then(response => {
        // Determine which quick replies to show based on response
        let quickReplies: QuickReply[] = QUICK_REPLIES.afterAnswer;
        if (response.detectedTopic === 'story_creation') {
          quickReplies = QUICK_REPLIES.storyHelp;
        } else if (response.detectedTopic === 'coloring') {
          quickReplies = QUICK_REPLIES.coloringHelp;
        } else if (response.detectedTopic === 'analysis') {
          quickReplies = QUICK_REPLIES.analysisHelp;
        }
        // Faz 5: Ebeveyn sorularına özel quick replies
        else if (response.detectedTopic?.startsWith('parenting_')) {
          const parentingType = response.detectedTopic.replace('parenting_', '');
          switch (parentingType) {
            case 'behavioral':
              quickReplies = QUICK_REPLIES.parentingBehavioral;
              break;
            case 'emotional':
              quickReplies = QUICK_REPLIES.parentingEmotional;
              break;
            case 'developmental':
              quickReplies = QUICK_REPLIES.parentingDevelopmental;
              break;
            case 'social':
              quickReplies = QUICK_REPLIES.parentingSocial;
              break;
            case 'physical':
              quickReplies = QUICK_REPLIES.parentingPhysical;
              break;
            default:
              quickReplies = QUICK_REPLIES.parentingConcern;
          }
        }

        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.message,
            source: response.source,
            timestamp: new Date(),
            actions: response.actions as ChatAction[] | undefined,
            quickReplies,
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
            quickReplies: QUICK_REPLIES.error,
          },
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Send message
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => limitMessages([...prev, userMessage]));
    setInputText('');
    setIsLoading(true);
    setShowFAQ(false);

    try {
      // Build conversation history for context
      const history = messages
        .filter(m => m.id !== 'welcome')
        .slice(-MAX_HISTORY_FOR_API)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await sendMessageMutation.mutateAsync({
        message: userMessage.content,
        conversationHistory: history,
        // Faz 4: Yaşa göre özelleştirilmiş yanıtlar
        childAge: selectedChild?.age,
        childName: selectedChild?.name,
        // Faz 6: Analytics için ekran bilgisi
        currentScreen,
      });

      // Faz 5: Determine quick replies based on detected topic
      let quickReplies: QuickReply[] = QUICK_REPLIES.afterAnswer;
      if (response.detectedTopic === 'story_creation') {
        quickReplies = QUICK_REPLIES.storyHelp;
      } else if (response.detectedTopic === 'coloring') {
        quickReplies = QUICK_REPLIES.coloringHelp;
      } else if (response.detectedTopic === 'analysis') {
        quickReplies = QUICK_REPLIES.analysisHelp;
      } else if (response.detectedTopic?.startsWith('parenting_')) {
        const parentingType = response.detectedTopic.replace('parenting_', '');
        switch (parentingType) {
          case 'behavioral':
            quickReplies = QUICK_REPLIES.parentingBehavioral;
            break;
          case 'emotional':
            quickReplies = QUICK_REPLIES.parentingEmotional;
            break;
          case 'developmental':
            quickReplies = QUICK_REPLIES.parentingDevelopmental;
            break;
          case 'social':
            quickReplies = QUICK_REPLIES.parentingSocial;
            break;
          case 'physical':
            quickReplies = QUICK_REPLIES.parentingPhysical;
            break;
          default:
            quickReplies = QUICK_REPLIES.parentingConcern;
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        source: response.source,
        timestamp: new Date(),
        actions: response.actions as ChatAction[] | undefined,
        quickReplies,
      };

      setMessages(prev => limitMessages([...prev, assistantMessage]));
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
  const handleFAQClick = useCallback((question: string) => {
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
      setMessages(prev => limitMessages([...prev, userMessage]));
      setShowFAQ(false);
      setIsLoading(true);

      sendMessageMutation
        .mutateAsync({
          message: question,
          conversationHistory: [],
          childAge: selectedChild?.age,
          childName: selectedChild?.name,
          // Faz 6: Analytics için ekran bilgisi
          currentScreen,
        })
        .then(response => {
          // Faz 5: Determine quick replies based on detected topic
          let quickReplies: QuickReply[] = QUICK_REPLIES.afterAnswer;
          if (response.detectedTopic === 'story_creation') {
            quickReplies = QUICK_REPLIES.storyHelp;
          } else if (response.detectedTopic === 'coloring') {
            quickReplies = QUICK_REPLIES.coloringHelp;
          } else if (response.detectedTopic === 'analysis') {
            quickReplies = QUICK_REPLIES.analysisHelp;
          } else if (response.detectedTopic?.startsWith('parenting_')) {
            const parentingType = response.detectedTopic.replace('parenting_', '');
            switch (parentingType) {
              case 'behavioral':
                quickReplies = QUICK_REPLIES.parentingBehavioral;
                break;
              case 'emotional':
                quickReplies = QUICK_REPLIES.parentingEmotional;
                break;
              case 'developmental':
                quickReplies = QUICK_REPLIES.parentingDevelopmental;
                break;
              case 'social':
                quickReplies = QUICK_REPLIES.parentingSocial;
                break;
              case 'physical':
                quickReplies = QUICK_REPLIES.parentingPhysical;
                break;
              default:
                quickReplies = QUICK_REPLIES.parentingConcern;
            }
          }

          setMessages(prev => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: response.message,
              source: response.source,
              timestamp: new Date(),
              actions: response.actions as ChatAction[] | undefined,
              quickReplies,
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
  }, [selectedChild, currentScreen, sendMessageMutation]);

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
      {/* Floating Chat Button with Child Indicator */}
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
            pressed && styles.floatingButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Yardım asistanını aç"
          accessibilityHint="Sorularınız için chatbot'u açar"
        >
          <LinearGradient
            colors={['#0D9488', '#14B8A6', '#2DD4BF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.floatingButtonGradient}
          >
            <MessageSquare size={26} color="#FFF" strokeWidth={2} />
          </LinearGradient>
        </Pressable>

        {/* Child Avatar Badge */}
        {selectedChild ? (
          <View style={styles.childBadge}>
            <LinearGradient
              colors={selectedChild.gender === 'female'
                ? ['#F472B6', '#EC4899']
                : selectedChild.gender === 'male'
                ? ['#60A5FA', '#3B82F6']
                : ['#FB923C', '#F97316']}
              style={styles.childBadgeGradient}
            >
              <Text style={styles.childBadgeText}>
                {selectedChild.name?.[0]?.toUpperCase() || '?'}
              </Text>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.indicatorDot} />
        )}
      </Animated.View>

      {/* Proactive Suggestion Popup */}
      {!isOpen && (
        <ProactiveSuggestionPopup
          screen={currentScreen}
          onQuestionPress={handleProactiveQuestionPress}
          onOpenChat={handleProactiveOpenChat}
          position="bottom-left"
          delay={2000}
          idleTimeout={45000}
        />
      )}

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={getKeyboardBehavior()}
          keyboardVerticalOffset={getKeyboardVerticalOffset(64)}
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
              colors={['#0D9488', '#14B8A6']}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <View style={styles.botAvatar}>
                    <Bot size={24} color="#0D9488" />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>Renkioo Asistan</Text>
                    <Text style={styles.headerSubtitle}>Size yardımcı olmak için buradayım</Text>
                  </View>
                </View>
                <Pressable
                  onPress={handleClose}
                  style={styles.closeButton}
                  accessibilityRole="button"
                  accessibilityLabel="Chatbot'u kapat"
                >
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
              {messages.map((message, index) => (
                <View key={message.id} style={styles.messageWrapper}>
                  {/* Message Row: Icon + Bubble */}
                  <AnimatedMessage
                    type={message.role}
                    delay={0}
                    style={[
                      styles.messageBubble,
                      message.role === 'user'
                        ? styles.userBubble
                        : styles.assistantBubble,
                    ]}
                  >
                    {message.role === 'assistant' && (
                      <View style={styles.assistantIcon}>
                        <Bot size={16} color="#0D9488" />
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
                          <Sparkles size={10} color="#0D9488" />
                          <Text style={styles.aiIndicatorText}>AI yanıtı</Text>
                        </View>
                      )}
                      {/* Feedback Buttons for assistant messages */}
                      {message.role === 'assistant' && message.id !== 'welcome' && !message.id.startsWith('welcome-') && (
                        <View style={styles.feedbackContainer}>
                          <InlineFeedback
                            messageId={message.id}
                            onFeedback={(id, feedback) => {
                              console.log(`[ChatBot] Feedback for ${id}: ${feedback}`);
                              contextEngine.recordFeedback(id, feedback as 'positive' | 'negative');
                            }}
                          />
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
                              <ChevronRight size={14} color="#0D9488" />
                            </Pressable>
                          ))}
                        </View>
                      )}
                    </View>
                  </AnimatedMessage>

                  {/* Quick Reply Chips - BELOW the message in separate row */}
                  {message.role === 'assistant' &&
                   message.quickReplies &&
                   message.quickReplies.length > 0 &&
                   !message.hideQuickReplies && (
                    <View style={styles.quickRepliesContainer}>
                      <QuickReplyChips
                        replies={message.quickReplies}
                        onSelect={handleQuickReply}
                        visible={!isLoading}
                      />
                    </View>
                  )}
                </View>
              ))}

              {/* Animated Typing Indicator */}
              <TypingBubble
                visible={isLoading}
                avatarComponent={<Bot size={16} color="#0D9488" />}
              />

              {/* FAQ Section */}
              {showFAQ && faqQuery.data && (
                <View style={styles.faqSection}>
                  <View style={styles.faqHeader}>
                    <HelpCircle size={18} color="#0D9488" />
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
                          <ChevronRight size={16} color="#0D9488" />
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
                accessibilityLabel="Soru giriş alanı"
                accessibilityHint="Chatbot'a sormak istediğiniz soruyu yazın"
              />
              <Pressable
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
                style={({ pressed }) => [
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                  pressed && { opacity: 0.8 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Mesaj gönder"
                accessibilityState={{ disabled: !inputText.trim() || isLoading }}
              >
                <LinearGradient
                  colors={
                    inputText.trim() && !isLoading
                      ? ['#0D9488', '#14B8A6']
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
  // Floating Button - Minimalist Design
  floatingButton: {
    position: 'absolute',
    left: 20,
    zIndex: zIndex.floating,
  },
  floatingButtonInner: {
    borderRadius: 28,
    ...shadows.lg,
  },
  floatingButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  indicatorDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  childBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
    overflow: 'hidden',
    ...shadows.sm,
  },
  childBadgeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFF',
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
  // Outer wrapper for message + quick replies (column layout)
  messageWrapper: {
    flexDirection: 'column',
    gap: spacing["2"],
  },
  // Inner row for icon + bubble
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
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    maxWidth: '80%',
    padding: spacing["3"],
    borderRadius: radius.xl,
  },
  userContent: {
    backgroundColor: '#0D9488',
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
    color: '#0D9488',
  },

  // Feedback Buttons
  feedbackContainer: {
    marginTop: spacing["2"],
    paddingTop: spacing["1"],
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },

  // Quick Replies - positioned below message
  quickRepliesContainer: {
    marginTop: spacing["1"],
    marginLeft: 36, // Align with message content (after avatar)
    paddingRight: spacing["2"],
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
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.2)',
  },
  actionButtonPressed: {
    backgroundColor: 'rgba(13, 148, 136, 0.15)',
    transform: [{ scale: 0.98 }],
  },
  actionIcon: {
    fontSize: 16,
  },
  actionLabel: {
    flex: 1,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: '#0D9488',
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
    backgroundColor: 'rgba(13, 148, 136, 0.05)',
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
    color: '#0D9488',
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
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
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
    backgroundColor: '#0D9488',
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
    color: '#0D9488',
  },
  childOptionAge: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0D9488',
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
