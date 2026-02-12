import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Href } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  ChevronLeft,
  Send,
  BarChart3,
  Palette,
  Lightbulb,
  HelpCircle,
  Heart,
  ExternalLink,
} from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/lib/theme/ThemeProvider';
import { Ioo as IooMascot } from '@/components/Ioo';
import {
  spacing,
  radius,
  typography,
  shadows,
  iconSizes,
  iconStroke,
} from '@/constants/design-system';
import { trpc } from '@/lib/trpc';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Hızlı eylem chip'leri (ebeveynler için)
const QUICK_ACTIONS = [
  {
    id: 'analysis',
    icon: BarChart3,
    label: 'Analizimi Açıkla',
    color: Colors.secondary.lavender,
    message: 'Son analiz sonucumu açıklar mısın?',
  },
  {
    id: 'coloring',
    icon: Palette,
    label: 'Boyama Öner',
    color: Colors.secondary.mint,
    message: 'Bugün çocuğumla ne boyasak?',
  },
  {
    id: 'tips',
    icon: Lightbulb,
    label: 'Gelişim İpuçları',
    color: Colors.secondary.sunshine,
    message: 'Çocuk gelişimi hakkında ipuçları verir misin?',
  },
  {
    id: 'help',
    icon: HelpCircle,
    label: 'Nasıl Kullanırım?',
    color: Colors.secondary.rose,
    message: 'Uygulamayı nasıl kullanabilirim?',
  },
];

// Aksiyon tipi
interface ChatAction {
  type: 'navigate' | 'create' | 'open' | 'link';
  label: string;
  target: string;
  icon?: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  actionType?: string;
  actions?: ChatAction[];
  suggestedQuestions?: string[];
}

// Konuşma geçmişi için tip
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Günün saatine göre selamlama
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
};

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Auth guard - redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/(onboarding)/welcome');
    }
  }, [isAuthenticated, authLoading, router]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `${getTimeBasedGreeting()}! 👋\n\nBen Ioo, çocuğunuzun gelişim yolculuğunda yanınızdayım.\n\nSize nasıl yardımcı olabilirim?`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  // tRPC mutation for sending messages
  const sendMessageMutation = trpc.chatbot.sendMessage.useMutation();

  // Son analizi çek
  const { data: recentAnalysis } = trpc.analysis.list.useQuery(
    { limit: 1, offset: 0, sortBy: 'created_at', sortOrder: 'desc' },
    { staleTime: 60000 } // 1 dakika cache
  );

  // Çocuk bilgisini çek (kişiselleştirme için)
  const { data: childrenData } = trpc.user.getChildren.useQuery(
    undefined,
    { staleTime: 300000 } // 5 dakika cache
  );

  // İlk çocuğun bilgisi (birden fazla varsa)
  const primaryChild = childrenData?.children?.[0];
  const childAge = primaryChild?.age;
  const childName = primaryChild?.name;

  // Animasyon
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Mesaj gönder - Backend API'sine bağlı
  const sendMessage = async (text: string, _actionType?: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setShowQuickActions(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Konuşma geçmişini güncelle
    const newHistory: ConversationMessage[] = [
      ...conversationHistory,
      { role: 'user' as const, content: text },
    ];
    setConversationHistory(newHistory);

    // Ioo yanıt versin - Backend API
    setIsTyping(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        message: text,
        conversationHistory: newHistory.slice(-6), // Son 6 mesaj
        sessionId,
        currentScreen: 'chatbot',
        childAge: childAge,
        childName: childName,
      });

      const iooMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
        actions: response.actions as ChatAction[] | undefined,
        suggestedQuestions: response.suggestedQuestions,
      };

      setMessages(prev => [...prev, iooMessage]);

      // Konuşma geçmişine assistant yanıtını ekle
      setConversationHistory(prev => [
        ...prev,
        { role: 'assistant' as const, content: response.message },
      ]);
    } catch {
      // Chatbot error - show fallback message
      // Hata durumunda fallback mesaj
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Üzgünüm, şu an yanıt veremedim. Lütfen tekrar deneyin.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Tarih formatlama
  const formatAnalysisDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  };

  // Hızlı eylem seç
  const handleQuickAction = async (action: (typeof QUICK_ACTIONS)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Analiz açıklama için özel işlem
    if (action.id === 'analysis' && recentAnalysis?.analyses?.[0]) {
      const analysis = recentAnalysis.analyses[0];
      const analysisContext = `Son analizim: ${analysis.task_type}, tarih: ${formatAnalysisDate(analysis.created_at)}. Bu analizi açıklar mısın?`;
      sendMessage(analysisContext, action.id);
    } else if (action.id === 'analysis' && !recentAnalysis?.analyses?.[0]) {
      // Analiz yoksa özel mesaj
      const noAnalysisMessage: Message = {
        id: Date.now().toString(),
        text: action.message,
        isUser: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, noAnalysisMessage]);
      setShowQuickActions(false);

      setTimeout(() => {
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Henüz bir analiz yapmamışsınız. 🎨\n\nİlk analizinizi yapmak için ana sayfadan 'Yeni Analiz' butonuna tıklayın. Çocuğunuzun bir çizimini yükleyin, AI size detaylı bir değerlendirme sunacak!",
          isUser: false,
          timestamp: new Date(),
          actions: [
            {
              type: 'navigate' as const,
              label: 'Yeni Analiz Yap',
              target: '/(tabs)/analysis',
              icon: '📊',
            },
          ],
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 500);
    } else {
      sendMessage(action.message, action.id);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...colors.background.pageGradient] as [string, string, ...string[]]}
        style={[styles.gradient, { paddingTop: insets.top }]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border.light }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft
              size={iconSizes.navigation}
              color={colors.text.primary}
              strokeWidth={iconStroke.standard}
            />
          </Pressable>

          <Animated.View style={pulseStyle}>
            <IooMascot size="tiny" mood="happy" animated />
          </Animated.View>

          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Ioo</Text>
            <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
              Gelişim asistanınız
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Messages */}
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((message, index) => (
              <Animated.View
                key={message.id}
                entering={FadeInUp.delay(index * 100).springify()}
                style={[
                  styles.messageBubble,
                  message.isUser
                    ? styles.userBubble
                    : [
                        styles.iooBubble,
                        { backgroundColor: colors.surface.card, borderColor: colors.border.light },
                      ],
                ]}
              >
                {!message.isUser && index === 0 && (
                  <View
                    style={[
                      styles.iooAvatarSmall,
                      { backgroundColor: colors.secondary.lavender + '20' },
                    ]}
                  >
                    <Heart size={14} color={colors.secondary.lavender} />
                  </View>
                )}
                <Text
                  style={[
                    styles.messageText,
                    message.isUser
                      ? styles.userText
                      : [styles.iooText, { color: colors.text.primary }],
                  ]}
                >
                  {message.text}
                </Text>

                {/* Aksiyon Butonları */}
                {!message.isUser && message.actions && message.actions.length > 0 && (
                  <View style={styles.actionsContainer}>
                    {message.actions.map((action, actionIndex) => (
                      <Pressable
                        key={actionIndex}
                        style={({ pressed }) => [
                          styles.actionButton,
                          { backgroundColor: colors.secondary.lavender + '15' },
                          pressed && { opacity: 0.7 },
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          if (action.type === 'navigate' || action.type === 'create') {
                            // Validate target route before navigating
                            const validRoutes = [
                              '/(tabs)',
                              '/(tabs)/index',
                              '/(tabs)/discover',
                              '/(tabs)/hayal-atolyesi',
                              '/(tabs)/history',
                              '/(tabs)/profile',
                              '/(tabs)/analysis',
                              '/(tabs)/quick-analysis',
                              '/(tabs)/advanced-analysis',
                              '/(tabs)/stories',
                              '/analysis/',
                              '/interactive-story/',
                            ];
                            const isValid = validRoutes.some(
                              route => action.target === route || action.target?.startsWith(route)
                            );
                            if (isValid && action.target) {
                              router.push(action.target as Href);
                            } else {
                              console.warn('[Chatbot] Invalid navigation target:', action.target);
                            }
                          }
                        }}
                      >
                        <Text style={styles.actionButtonIcon}>{action.icon}</Text>
                        <Text
                          style={[styles.actionButtonText, { color: colors.secondary.lavender }]}
                        >
                          {action.label}
                        </Text>
                        <ExternalLink size={12} color={colors.secondary.lavender} />
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Önerilen Sorular */}
                {!message.isUser &&
                  message.suggestedQuestions &&
                  message.suggestedQuestions.length > 0 &&
                  index === messages.length - 1 && (
                    <View
                      style={[
                        styles.suggestedQuestionsContainer,
                        { borderTopColor: colors.border.light },
                      ]}
                    >
                      <Text
                        style={[styles.suggestedQuestionsTitle, { color: colors.text.tertiary }]}
                      >
                        İlgili sorular:
                      </Text>
                      {message.suggestedQuestions.map((question, qIndex) => (
                        <Pressable
                          key={qIndex}
                          style={({ pressed }) => [
                            styles.suggestedQuestionButton,
                            pressed && {
                              opacity: 0.7,
                              backgroundColor: colors.secondary.lavender + '15',
                            },
                          ]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            sendMessage(question);
                          }}
                        >
                          <Text
                            style={[
                              styles.suggestedQuestionText,
                              { color: colors.secondary.lavender },
                            ]}
                          >
                            {question}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
              </Animated.View>
            ))}

            {isTyping && (
              <Animated.View
                entering={FadeInUp.springify()}
                style={[
                  styles.messageBubble,
                  styles.iooBubble,
                  styles.typingBubble,
                  { backgroundColor: colors.surface.card, borderColor: colors.border.light },
                ]}
              >
                <View style={styles.typingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Hızlı Eylemler - Horizontal Chips */}
          {showQuickActions && (
            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={styles.quickActionsSection}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickActionsRow}
              >
                {QUICK_ACTIONS.map(action => (
                  <Pressable
                    key={action.id}
                    style={({ pressed }) => [
                      styles.quickActionChip,
                      { backgroundColor: colors.surface.card, borderColor: colors.border.light },
                      pressed && { transform: [{ scale: 0.97 }], opacity: 0.8 },
                    ]}
                    onPress={() => handleQuickAction(action)}
                  >
                    <action.icon
                      size={iconSizes.inline}
                      color={action.color}
                      strokeWidth={iconStroke.standard}
                    />
                    <Text style={[styles.quickActionLabel, { color: colors.text.primary }]}>
                      {action.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Input */}
          <View
            style={[
              styles.inputContainer,
              {
                paddingBottom: insets.bottom + 8,
                backgroundColor: colors.surface.card,
                borderTopColor: colors.border.light,
              },
            ]}
          >
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: isDark ? colors.neutral.lightest : Colors.neutral.lightest },
              ]}
            >
              <TextInput
                style={[styles.textInput, { color: colors.text.primary }]}
                placeholder="Bir soru sorun..."
                placeholderTextColor={colors.text.tertiary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.sendButton,
                  !inputText.trim() && [
                    styles.sendButtonDisabled,
                    { backgroundColor: colors.border.light },
                  ],
                  pressed && { transform: [{ scale: 0.9 }] },
                ]}
                onPress={() => sendMessage(inputText)}
                disabled={!inputText.trim()}
              >
                <Send size={20} color={inputText.trim() ? '#FFFFFF' : colors.text.tertiary} />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  backButton: {
    padding: spacing['2'],
    marginRight: spacing['2'],
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: spacing['3'],
  },
  headerTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.size.xs,
    color: Colors.text.secondary,
    fontWeight: typography.weight.medium,
    marginTop: 1,
  },
  headerSpacer: {
    width: 40,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing['4'],
    paddingBottom: spacing['6'],
  },
  messageBubble: {
    maxWidth: SCREEN_WIDTH * 0.78,
    padding: spacing['4'],
    borderRadius: radius.xl,
    marginBottom: spacing['3'],
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.secondary.lavender,
    borderBottomRightRadius: radius.xs,
  },
  iooBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.neutral.white,
    borderBottomLeftRadius: radius.xs,
    ...shadows.xs,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  messageText: {
    fontSize: typography.size.base,
    lineHeight: 22,
  },
  userText: {
    color: Colors.neutral.white,
  },
  iooText: {
    color: Colors.text.primary,
  },
  iooAvatarSmall: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: Colors.secondary.lavender + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2'],
  },
  typingBubble: {
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: Colors.neutral.light,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
  quickActionsSection: {
    paddingVertical: spacing['3'],
  },
  quickActionsRow: {
    paddingHorizontal: spacing['4'],
    gap: spacing['2'],
  },
  quickActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    paddingVertical: spacing['2.5'],
    paddingHorizontal: spacing['4'],
    borderRadius: radius.full,
    gap: spacing['2'],
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
    ...shadows.xs,
  },
  quickActionLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.text.primary,
  },
  inputContainer: {
    paddingHorizontal: spacing['4'],
    paddingTop: spacing['3'],
    backgroundColor: Colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.xl,
    paddingLeft: spacing['4'],
    paddingRight: spacing['2'],
    paddingVertical: spacing['2'],
  },
  textInput: {
    flex: 1,
    fontSize: typography.size.base,
    color: Colors.text.primary,
    maxHeight: 100,
    paddingVertical: spacing['2'],
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: Colors.secondary.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.neutral.lighter,
  },
  // Action butonları
  actionsContainer: {
    marginTop: spacing['3'],
    gap: spacing['2'],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary.lavender + '15',
    paddingVertical: spacing['2.5'],
    paddingHorizontal: spacing['3'],
    borderRadius: radius.lg,
    gap: spacing['2'],
  },
  actionButtonIcon: {
    fontSize: 16,
  },
  actionButtonText: {
    flex: 1,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.secondary.lavender,
  },
  // Önerilen sorular
  suggestedQuestionsContainer: {
    marginTop: spacing['3'],
    paddingTop: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lighter,
  },
  suggestedQuestionsTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.medium,
    marginBottom: spacing['2'],
  },
  suggestedQuestionButton: {
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['3'],
    borderRadius: radius.md,
    marginBottom: spacing['1'],
  },
  suggestedQuestionText: {
    fontSize: typography.size.sm,
    color: Colors.secondary.lavender,
    fontWeight: typography.weight.medium,
  },
});
