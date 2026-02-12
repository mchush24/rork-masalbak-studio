/**
 * Smart Context Engine
 *
 * Akıllı karar motoru - kullanıcı bağlamını analiz eder ve
 * kişiselleştirilmiş yanıtlar üretir.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Child } from '@/lib/hooks/useAuth';

// ============================================
// TYPES
// ============================================

export interface UserContext {
  // Screen context
  screen: string;
  previousScreen?: string;
  timeOnScreen: number; // seconds

  // Child context
  child?: Child | null;

  // Session context
  sessionId: string;
  sessionStart: Date;
  messageCount: number;

  // Behavior context
  isFirstVisit: boolean;
  isFirstVisitToScreen: boolean;
  lastActivity?: string;
  hasUnfinishedWork: boolean;
  unfinishedWorkType?: 'coloring' | 'story' | 'analysis';

  // Time context
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;

  // Error context
  hasRecentError: boolean;
  errorType?: string;
}

export interface SmartResponse {
  message: string;
  quickReplies: SmartQuickReply[];
  tone: 'playful' | 'friendly' | 'helpful' | 'encouraging';
  priority: 'high' | 'medium' | 'low';
}

export interface SmartQuickReply {
  id: string;
  label: string;
  emoji?: string;
  action: 'send' | 'navigate' | 'custom';
  target?: string;
  priority: number;
}

export interface SessionMemory {
  sessionId: string;
  startTime: string;
  questions: string[];
  clickedReplies: string[];
  feedbackGiven: { messageId: string; feedback: 'positive' | 'negative' }[];
  topicsDiscussed: string[];
  lastScreen: string;
  childId?: string;
}

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
  SESSION_MEMORY: 'renkioo_session_memory',
  VISIT_HISTORY: 'renkioo_visit_history',
  USER_PREFERENCES: 'renkioo_user_preferences',
  UNFINISHED_WORK: 'renkioo_unfinished_work',
};

// ============================================
// SMART CONTEXT ENGINE
// ============================================

export class SmartContextEngine {
  private sessionMemory: SessionMemory | null = null;
  private visitHistory: Record<string, number> = {};

  constructor() {
    this.initializeSession();
  }

  // Initialize or restore session
  async initializeSession(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_MEMORY);
      if (stored) {
        const memory = JSON.parse(stored) as SessionMemory;
        // Check if session is still valid (within 30 minutes)
        const sessionAge = Date.now() - new Date(memory.startTime).getTime();
        if (sessionAge < 30 * 60 * 1000) {
          this.sessionMemory = memory;
          return;
        }
      }

      // Create new session
      this.sessionMemory = {
        sessionId: `session_${Date.now()}`,
        startTime: new Date().toISOString(),
        questions: [],
        clickedReplies: [],
        feedbackGiven: [],
        topicsDiscussed: [],
        lastScreen: 'home',
      };
      await this.saveSessionMemory();
    } catch (error) {
      console.error('[SmartContextEngine] Init error:', error);
    }
  }

  // Save session memory
  private async saveSessionMemory(): Promise<void> {
    if (this.sessionMemory) {
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION_MEMORY, JSON.stringify(this.sessionMemory));
    }
  }

  // Record user question
  async recordQuestion(question: string): Promise<void> {
    if (this.sessionMemory) {
      this.sessionMemory.questions.push(question);
      await this.saveSessionMemory();
    }
  }

  // Record clicked reply
  async recordClickedReply(replyId: string): Promise<void> {
    if (this.sessionMemory) {
      this.sessionMemory.clickedReplies.push(replyId);
      await this.saveSessionMemory();
    }
  }

  // Record feedback
  async recordFeedback(messageId: string, feedback: 'positive' | 'negative'): Promise<void> {
    if (this.sessionMemory) {
      this.sessionMemory.feedbackGiven.push({ messageId, feedback });
      await this.saveSessionMemory();
    }
  }

  // Record topic
  async recordTopic(topic: string): Promise<void> {
    if (this.sessionMemory && !this.sessionMemory.topicsDiscussed.includes(topic)) {
      this.sessionMemory.topicsDiscussed.push(topic);
      await this.saveSessionMemory();
    }
  }

  // Update last screen
  async updateScreen(screen: string): Promise<void> {
    if (this.sessionMemory) {
      this.sessionMemory.lastScreen = screen;
      await this.saveSessionMemory();
    }

    // Update visit history
    this.visitHistory[screen] = (this.visitHistory[screen] || 0) + 1;
  }

  // Check if first visit to screen
  async isFirstVisitToScreen(screen: string): Promise<boolean> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.VISIT_HISTORY);
      const history = stored ? JSON.parse(stored) : {};
      return !history[screen];
    } catch {
      return true;
    }
  }

  // Mark screen as visited
  async markScreenVisited(screen: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.VISIT_HISTORY);
      const history = stored ? JSON.parse(stored) : {};
      history[screen] = Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.VISIT_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('[SmartContextEngine] Mark visited error:', error);
    }
  }

  // Check for unfinished work
  async checkUnfinishedWork(): Promise<{ has: boolean; type?: string; data?: unknown }> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.UNFINISHED_WORK);
      if (stored) {
        const work = JSON.parse(stored);
        // Check if work is recent (within 24 hours)
        if (Date.now() - work.timestamp < 24 * 60 * 60 * 1000) {
          return { has: true, type: work.type, data: work.data };
        }
      }
      return { has: false };
    } catch {
      return { has: false };
    }
  }

  // Save unfinished work
  async saveUnfinishedWork(type: string, data: unknown): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.UNFINISHED_WORK,
      JSON.stringify({ type, data, timestamp: Date.now() })
    );
  }

  // Clear unfinished work
  async clearUnfinishedWork(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.UNFINISHED_WORK);
  }

  // Get time of day
  getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  // Get session memory
  getSessionMemory(): SessionMemory | null {
    return this.sessionMemory;
  }

  // Get message count
  getMessageCount(): number {
    return this.sessionMemory?.questions.length || 0;
  }
}

// ============================================
// PARENT-FOCUSED LANGUAGE ADAPTER
// ============================================

export class ParentLanguageAdapter {
  // Get greeting based on time of day (for parents)
  static getGreeting(timeOfDay: string): string {
    const greetings: Record<string, string[]> = {
      morning: ['Günaydın! ☀️', 'Günaydın! Size nasıl yardımcı olabilirim?'],
      afternoon: ['Merhaba! 👋', 'Merhaba! Size nasıl yardımcı olabilirim?'],
      evening: ['İyi akşamlar! 🌙', 'İyi akşamlar! Size nasıl yardımcı olabilirim?'],
      night: ['İyi geceler! 🌙', 'Geç saatte hoş geldiniz! Size nasıl yardımcı olabilirim?'],
    };

    const options = greetings[timeOfDay] || greetings.afternoon;
    return options[Math.floor(Math.random() * options.length)];
  }

  // Get child context message for parents
  static getChildContextMessage(child?: Child | null): string {
    if (!child) return '';

    const age = child.age;
    const name = child.name;

    if (age <= 3) {
      return `${name} (${age} yaş) için içerikler hazırlıyoruz. Bu yaş grubu için basit ve renkli görseller öneriyoruz.`;
    } else if (age <= 5) {
      return `${name} (${age} yaş) için okul öncesi düzeyde içerikler sunuyoruz.`;
    } else if (age <= 8) {
      return `${name} (${age} yaş) için ilkokul düzeyinde içerikler hazırlıyoruz.`;
    } else {
      return `${name} (${age} yaş) için daha detaylı ve gelişmiş içerikler sunuyoruz.`;
    }
  }

  // Get personalized tip based on child's age (for parents)
  static getAgeTip(child?: Child | null): string | null {
    if (!child) return null;

    const tips: Record<string, string[]> = {
      toddler: [
        '💡 İpucu: 0-3 yaş için büyük ve basit şekiller en uygun!',
        '💡 İpucu: Bu yaş grubunda birlikte boyama yapmanızı öneririz.',
      ],
      preschool: [
        '💡 İpucu: 4-5 yaş çocuklar hikaye anlatmayı çok sever!',
        '💡 İpucu: Çizim analizi bu yaşta duygusal gelişimi takip etmenize yardımcı olur.',
      ],
      school: [
        '💡 İpucu: 6-8 yaş çocuklar kendi masallarını oluşturmaktan keyif alır!',
        '💡 İpucu: Bu yaş grubunda detaylı boyama sayfaları deneyebilirsiniz.',
      ],
      preteen: [
        '💡 İpucu: 9+ yaş için daha karmaşık hikaye temaları sunuyoruz.',
        '💡 İpucu: Bu yaş grubunda çocuğunuzun kendi çizimlerini analiz etmesine izin verebilirsiniz.',
      ],
    };

    const ageGroup =
      child.age <= 3
        ? 'toddler'
        : child.age <= 5
          ? 'preschool'
          : child.age <= 8
            ? 'school'
            : 'preteen';

    const groupTips = tips[ageGroup];
    return groupTips[Math.floor(Math.random() * groupTips.length)];
  }

  // No message adaptation needed - always adult language
  static adaptMessage(message: string, _child?: Child | null): string {
    return message;
  }

  // No label adaptation needed - always adult language
  static adaptQuickReplyLabel(label: string, _child?: Child | null): string {
    return label;
  }
}

// ============================================
// SMART RESPONSE GENERATOR
// ============================================

export class SmartResponseGenerator {
  private contextEngine: SmartContextEngine;

  constructor(contextEngine: SmartContextEngine) {
    this.contextEngine = contextEngine;
  }

  // Generate smart welcome response (for parents/adults)
  async generateWelcome(context: {
    screen: string;
    child?: Child | null;
    isFirstVisit: boolean;
  }): Promise<SmartResponse> {
    const { screen, child, isFirstVisit } = context;
    const timeOfDay = this.contextEngine.getTimeOfDay();
    const unfinishedWork = await this.contextEngine.checkUnfinishedWork();
    const isFirstScreenVisit = await this.contextEngine.isFirstVisitToScreen(screen);

    // Mark screen as visited
    await this.contextEngine.markScreenVisited(screen);

    // Determine greeting (for parents)
    const greeting = ParentLanguageAdapter.getGreeting(timeOfDay);

    // Build message based on context
    let message = greeting;
    let quickReplies: SmartQuickReply[] = [];
    let tone: SmartResponse['tone'] = 'friendly';
    let priority: SmartResponse['priority'] = 'medium';

    // First time user - onboarding
    if (isFirstVisit) {
      message = `${greeting} Renkioo'ya hoş geldiniz! 🎉 Size neler yapabileceğinizi göstereyim mi?`;
      quickReplies = [
        { id: 'tour', label: 'Evet, gösterin', emoji: '🚀', action: 'send', priority: 1 },
        { id: 'skip-tour', label: 'Kendim keşfedeyim', emoji: '🔍', action: 'custom', priority: 2 },
      ];
      tone = 'encouraging';
      priority = 'high';
      return { message, quickReplies, tone, priority };
    }

    // Has unfinished work
    if (unfinishedWork.has) {
      const workTypeLabels: Record<string, string> = {
        coloring: 'boyama çalışmanız',
        story: 'masal oluşturma işleminiz',
        analysis: 'analiz işleminiz',
      };
      const label = workTypeLabels[unfinishedWork.type || ''] || 'çalışmanız';

      message = `${greeting} Yarım kalan ${label} var. Devam etmek ister misiniz?`;
      quickReplies = [
        {
          id: 'continue-work',
          label: 'Evet, devam et',
          emoji: '▶️',
          action: 'custom',
          priority: 1,
        },
        { id: 'new-work', label: 'Yeni başla', emoji: '✨', action: 'custom', priority: 2 },
      ];
      tone = 'helpful';
      priority = 'high';
      return { message, quickReplies, tone, priority };
    }

    // No child selected
    if (!child) {
      message = `${greeting} Önce hangi çocuğunuz için işlem yapmak istediğinizi seçer misiniz?`;
      quickReplies = [
        { id: 'select-child', label: 'Çocuk Seç', emoji: '👶', action: 'custom', priority: 1 },
      ];
      tone = 'helpful';
      priority = 'high';
      return { message, quickReplies, tone, priority };
    }

    // Screen-specific responses (for parents)
    const screenResponses = this.getScreenSpecificResponse(
      screen,
      child,
      isFirstScreenVisit,
      timeOfDay
    );
    message = `${greeting} ${screenResponses.message}`;
    quickReplies = screenResponses.quickReplies;
    tone = screenResponses.tone;

    return { message, quickReplies, tone, priority };
  }

  // Get screen-specific response (adult/parent language)
  private getScreenSpecificResponse(
    screen: string,
    child: Child,
    isFirstVisit: boolean,
    timeOfDay: string
  ): Omit<SmartResponse, 'priority'> {
    const childName = child.name;

    switch (screen) {
      case 'stories':
        return {
          message: isFirstVisit
            ? `${childName} için çizimlerden masallar oluşturabilirsiniz!`
            : `${childName} için yeni bir masal oluşturmak ister misiniz?`,
          quickReplies: [
            {
              id: 'how-story',
              label: 'Nasıl masal oluşturabilirim?',
              emoji: '📖',
              action: 'send',
              priority: 1,
            },
            {
              id: 'upload-drawing',
              label: 'Çizim Yükle',
              emoji: '📸',
              action: 'navigate',
              target: '/(tabs)/stories',
              priority: 2,
            },
            {
              id: 'theme-ideas',
              label: 'Tema Önerileri',
              emoji: '✨',
              action: 'send',
              priority: 3,
            },
            { id: 'help', label: 'Başka Yardım', emoji: '❓', action: 'send', priority: 4 },
          ],
          tone: 'helpful',
        };

      case 'coloring':
        return {
          message: isFirstVisit
            ? `${childName} için boyama sayfaları hazırlayabilirsiniz!`
            : `${childName} için boyama konusunda yardımcı olayım mı?`,
          quickReplies: [
            { id: 'color-tips', label: 'Renk önerileri', emoji: '🎨', action: 'send', priority: 1 },
            {
              id: 'how-save',
              label: 'Nasıl kaydederim?',
              emoji: '💾',
              action: 'send',
              priority: 2,
            },
            { id: 'how-print', label: 'Yazdırma', emoji: '🖨️', action: 'send', priority: 3 },
            { id: 'help', label: 'Başka Yardım', emoji: '❓', action: 'send', priority: 4 },
          ],
          tone: 'helpful',
        };

      case 'analysis':
        return {
          message: isFirstVisit
            ? `${childName}'in çizimlerini analiz ederek gelişimini takip edebilirsiniz.`
            : 'Çizim analizi hakkında yardımcı olayım mı?',
          quickReplies: [
            {
              id: 'what-analysis',
              label: 'Analiz ne işe yarar?',
              emoji: '🔍',
              action: 'send',
              priority: 1,
            },
            {
              id: 'how-interpret',
              label: 'Sonuçları nasıl yorumlarım?',
              emoji: '📊',
              action: 'send',
              priority: 2,
            },
            {
              id: 'start-analysis',
              label: 'Analiz Başlat',
              emoji: '🎨',
              action: 'navigate',
              target: '/(tabs)/analysis',
              priority: 3,
            },
            { id: 'help', label: 'Başka Yardım', emoji: '❓', action: 'send', priority: 4 },
          ],
          tone: 'helpful',
        };

      case 'profile':
        return {
          message: 'Profil ayarlarınızda yardımcı olayım mı?',
          quickReplies: [
            { id: 'add-child', label: 'Çocuk Ekle', emoji: '👶', action: 'send', priority: 1 },
            {
              id: 'account-settings',
              label: 'Hesap Ayarları',
              emoji: '⚙️',
              action: 'send',
              priority: 2,
            },
            { id: 'subscription', label: 'Abonelik', emoji: '💳', action: 'send', priority: 3 },
            { id: 'help', label: 'Başka Yardım', emoji: '❓', action: 'send', priority: 4 },
          ],
          tone: 'helpful',
        };

      case 'home':
      default:
        const suggestions = this.getHomeScreenSuggestions(child, timeOfDay);
        return {
          message: suggestions.message,
          quickReplies: suggestions.quickReplies,
          tone: 'friendly',
        };
    }
  }

  // Get home screen suggestions based on context (for parents)
  private getHomeScreenSuggestions(
    child: Child,
    timeOfDay: string
  ): { message: string; quickReplies: SmartQuickReply[] } {
    const childName = child.name;

    // Time-based suggestions for parents
    if (timeOfDay === 'evening' || timeOfDay === 'night') {
      return {
        message: `${childName} için uyumadan önce bir masal oluşturmak ister misiniz?`,
        quickReplies: [
          {
            id: 'create-story',
            label: 'Masal Oluştur',
            emoji: '📖',
            action: 'navigate',
            target: '/(tabs)/stories',
            priority: 1,
          },
          {
            id: 'coloring',
            label: 'Boyama Sayfası',
            emoji: '🖍️',
            action: 'navigate',
            target: '/(tabs)/coloring',
            priority: 2,
          },
          {
            id: 'what-can-do',
            label: 'Neler yapabilirim?',
            emoji: '🤔',
            action: 'send',
            priority: 3,
          },
        ],
      };
    }

    return {
      message: `${childName} için bugün ne yapmak istersiniz?`,
      quickReplies: [
        {
          id: 'create-story',
          label: 'Masal Oluştur',
          emoji: '📖',
          action: 'navigate',
          target: '/(tabs)/stories',
          priority: 1,
        },
        {
          id: 'coloring',
          label: 'Boyama Sayfası',
          emoji: '🖍️',
          action: 'navigate',
          target: '/(tabs)/coloring',
          priority: 2,
        },
        {
          id: 'analyze',
          label: 'Çizim Analiz Et',
          emoji: '🎨',
          action: 'navigate',
          target: '/(tabs)/analysis',
          priority: 3,
        },
        {
          id: 'what-can-do',
          label: 'Neler yapabilirim?',
          emoji: '🤔',
          action: 'send',
          priority: 4,
        },
      ],
    };
  }
}

// ============================================
// EXPORTS
// ============================================

// Singleton instance
let contextEngineInstance: SmartContextEngine | null = null;
let responseGeneratorInstance: SmartResponseGenerator | null = null;

export function getContextEngine(): SmartContextEngine {
  if (!contextEngineInstance) {
    contextEngineInstance = new SmartContextEngine();
  }
  return contextEngineInstance;
}

export function getResponseGenerator(): SmartResponseGenerator {
  if (!responseGeneratorInstance) {
    responseGeneratorInstance = new SmartResponseGenerator(getContextEngine());
  }
  return responseGeneratorInstance;
}

export default {
  getContextEngine,
  getResponseGenerator,
  ParentLanguageAdapter,
};
