/**
 * AssistantEngine - Ioo coaching logic
 * Phase 9: Ioo Assistant System
 *
 * Provides context-aware tips and guidance:
 * - User type adaptation (parent, professional, teacher)
 * - Screen-specific tips
 * - Daily tip limit (no spam)
 * - Tip dismissal memory
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  DISMISSED_TIPS: '@renkioo_dismissed_tips',
  DAILY_TIP_COUNT: '@renkioo_daily_tip_count',
  LAST_TIP_DATE: '@renkioo_last_tip_date',
  USER_TYPE: '@renkioo_user_type',
};

export type UserType = 'parent' | 'professional' | 'teacher';

export type ScreenContext =
  | 'home'
  | 'analysis'
  | 'quick_analysis'
  | 'advanced_analysis'
  | 'analysis_result'
  | 'story'
  | 'story_reading'
  | 'coloring'
  | 'studio'
  | 'hayal_atolyesi'
  | 'profile'
  | 'history'
  | 'settings';

export interface AssistantTip {
  id: string;
  screen: ScreenContext;
  userTypes: UserType[];
  title: string;
  message: string;
  /** Optional link for more info */
  learnMoreUrl?: string;
  /** Is this a first-time only tip? */
  firstTimeOnly: boolean;
  /** Priority (higher = show first) */
  priority: number;
  /** Ioo mood for this tip */
  mood: 'happy' | 'curious' | 'thinking' | 'excited' | 'supportive';
}

// Tip database
const TIPS_DATABASE: AssistantTip[] = [
  // HOME SCREEN TIPS
  {
    id: 'home_welcome_parent',
    screen: 'home',
    userTypes: ['parent'],
    title: 'Hoş Geldiniz!',
    message: 'Buradan çocuğunuzun çizimlerini analiz edebilir, hikayeler okuyabilir ve birlikte boyama yapabilirsiniz.',
    firstTimeOnly: true,
    priority: 10,
    mood: 'happy',
  },
  {
    id: 'home_welcome_professional',
    screen: 'home',
    userTypes: ['professional'],
    title: 'Kontrol Panelinize Hoş Geldiniz',
    message: 'Danışanlarınızı sol menüden yönetebilir, analizleri buradan takip edebilirsiniz.',
    firstTimeOnly: true,
    priority: 10,
    mood: 'supportive',
  },
  {
    id: 'home_streak_tip',
    screen: 'home',
    userTypes: ['parent'],
    title: 'Seri Tutmak',
    message: 'Her gün uygulamayı kullanarak serinizi sürdürün! Düzenli kullanım, çocuğunuzun gelişimini takip etmenizi kolaylaştırır.',
    firstTimeOnly: false,
    priority: 5,
    mood: 'excited',
  },
  {
    id: 'home_story_suggestion',
    screen: 'home',
    userTypes: ['parent'],
    title: 'Hikaye Zamanı',
    message: 'Çocuğunuzla birlikte interaktif hikaye okumayı denediniz mi? Karar verme süreçlerini gözlemlemek için harika bir yol!',
    firstTimeOnly: false,
    priority: 4,
    mood: 'curious',
  },

  // QUICK ANALYSIS SCREEN TIPS
  {
    id: 'quick_analysis_first',
    screen: 'quick_analysis',
    userTypes: ['parent'],
    title: 'Hızlı Analiz',
    message: 'Fotoğraf çekin veya galeriden seçin. Hızlı analiz, anında duygusal temalar hakkında bilgi verir.',
    firstTimeOnly: true,
    priority: 10,
    mood: 'curious',
  },
  {
    id: 'quick_analysis_tip',
    screen: 'quick_analysis',
    userTypes: ['parent'],
    title: 'İyi Aydınlatma',
    message: 'Daha doğru sonuçlar için çizimi iyi ışık altında ve düz bir yüzeyde çekin.',
    firstTimeOnly: false,
    priority: 5,
    mood: 'thinking',
  },

  // ADVANCED ANALYSIS SCREEN TIPS
  {
    id: 'advanced_analysis_first_parent',
    screen: 'advanced_analysis',
    userTypes: ['parent'],
    title: 'Detaylı Analiz',
    message: 'Gelişmiş analiz, daha derinlemesine duygusal değerlendirme sunar. Çizim bağlamını da ekleyebilirsiniz.',
    firstTimeOnly: true,
    priority: 10,
    mood: 'curious',
  },
  {
    id: 'advanced_analysis_first_professional',
    screen: 'advanced_analysis',
    userTypes: ['professional'],
    title: 'Klinik Analiz Aracı',
    message: 'Projektif çizim testleri, DSM-5 tanı kriterleri yerine destekleyici veri sağlar. Klinik değerlendirmenin bir parçası olarak kullanın.',
    firstTimeOnly: true,
    priority: 10,
    mood: 'thinking',
  },
  {
    id: 'advanced_analysis_context',
    screen: 'advanced_analysis',
    userTypes: ['parent', 'professional'],
    title: 'Bağlam Önemli',
    message: 'Çizim hakkında bağlam bilgisi eklemek (ne zaman, nerede, neden çizildi) analizi zenginleştirir.',
    firstTimeOnly: false,
    priority: 6,
    mood: 'supportive',
  },

  // ANALYSIS SCREEN TIPS (General)
  {
    id: 'analysis_first_parent',
    screen: 'analysis',
    userTypes: ['parent'],
    title: 'İlk Analiziniz',
    message: 'Çocuğunuzun bir çizimini yükleyin. AI analizi, çizimde gözlemlenen duygusal temaları size sunacak.',
    firstTimeOnly: true,
    priority: 10,
    mood: 'curious',
  },
  {
    id: 'analysis_first_professional',
    screen: 'analysis',
    userTypes: ['professional'],
    title: 'Analiz Aracı',
    message: 'Projektif çizim testleri, DSM-5 tanı kriterleri yerine destekleyici veri sağlar. Klinik değerlendirmenin bir parçası olarak kullanın.',
    firstTimeOnly: true,
    priority: 10,
    mood: 'thinking',
  },
  {
    id: 'analysis_regular_tip',
    screen: 'analysis',
    userTypes: ['parent'],
    title: 'Düzenli Analiz',
    message: 'Düzenli çizim analizi, zaman içindeki değişimleri görmenize yardımcı olur.',
    firstTimeOnly: false,
    priority: 5,
    mood: 'supportive',
  },

  // ANALYSIS RESULT TIPS
  {
    id: 'result_disclaimer_parent',
    screen: 'analysis_result',
    userTypes: ['parent'],
    title: 'Önemli Not',
    message: 'Bu analiz profesyonel tanı yerine geçmez. Endişeleriniz varsa bir uzmana danışın.',
    firstTimeOnly: false,
    priority: 8,
    mood: 'supportive',
  },
  {
    id: 'result_export_professional',
    screen: 'analysis_result',
    userTypes: ['professional'],
    title: 'Rapor Dışa Aktarma',
    message: 'Analiz sonuçlarını PDF olarak dışa aktarabilir, dosyalama yapabilirsiniz.',
    firstTimeOnly: true,
    priority: 7,
    mood: 'thinking',
  },

  // STORY SCREEN TIPS
  {
    id: 'story_first_parent',
    screen: 'story',
    userTypes: ['parent'],
    title: 'İnteraktif Hikayeler',
    message: 'İnteraktif hikayelerde çocuğunuz seçimler yapar. Bu seçimler, düşünce kalıpları hakkında ipuçları verebilir.',
    firstTimeOnly: true,
    priority: 10,
    mood: 'excited',
  },
  {
    id: 'story_reading_tip',
    screen: 'story_reading',
    userTypes: ['parent'],
    title: 'Birlikte Okuyun',
    message: 'Hikayeyi çocuğunuzla birlikte okuyun ve seçimleri tartışın. Bu, bağ kurmanın harika bir yolu!',
    firstTimeOnly: false,
    priority: 5,
    mood: 'happy',
  },

  // COLORING SCREEN TIPS
  {
    id: 'coloring_first',
    screen: 'coloring',
    userTypes: ['parent'],
    title: 'Boyama Zamanı',
    message: 'Çocuğunuzla birlikte boyama, kaliteli vakit geçirmenin harika bir yolu.',
    firstTimeOnly: true,
    priority: 10,
    mood: 'happy',
  },
  {
    id: 'coloring_colors_tip',
    screen: 'coloring',
    userTypes: ['parent'],
    title: 'Renk Seçimleri',
    message: 'Renk seçimleri hakkında yargılayıcı olmayın, yaratıcılığı destekleyin.',
    firstTimeOnly: false,
    priority: 5,
    mood: 'supportive',
  },
  {
    id: 'coloring_save_tip',
    screen: 'coloring',
    userTypes: ['parent'],
    title: 'Eserleri Kaydedin',
    message: 'Tamamlanan boyamaları kaydedip analiz için kullanabilirsiniz.',
    firstTimeOnly: false,
    priority: 4,
    mood: 'excited',
  },

  // STUDIO SCREEN TIPS
  {
    id: 'studio_first',
    screen: 'studio',
    userTypes: ['parent'],
    title: 'Yaratıcı Stüdyo',
    message: 'Burada çocuğunuzla birlikte özgürce çizim yapabilirsiniz. Fırçalar, renkler ve araçlar sizi bekliyor!',
    firstTimeOnly: true,
    priority: 10,
    mood: 'excited',
  },
  {
    id: 'studio_free_draw',
    screen: 'studio',
    userTypes: ['parent'],
    title: 'Serbest Çizim',
    message: 'Serbest çizim, çocuğunuzun duygularını ifade etmesi için harika bir araç.',
    firstTimeOnly: false,
    priority: 5,
    mood: 'curious',
  },

  // HAYAL ATÖLYESİ SCREEN TIPS
  {
    id: 'hayal_atolyesi_first',
    screen: 'hayal_atolyesi',
    userTypes: ['parent'],
    title: 'Hayal Atölyesi',
    message: 'Hayal gücünü canlandıran aktiviteler burada! Çocuğunuzla birlikte yaratıcı serüvenlere çıkın.',
    firstTimeOnly: true,
    priority: 10,
    mood: 'excited',
  },
  {
    id: 'hayal_atolyesi_imagination',
    screen: 'hayal_atolyesi',
    userTypes: ['parent'],
    title: 'Hayal Gücü',
    message: 'Çocukların hayal gücü sınırsızdır. Onların fikirlerini yargılamadan dinleyin ve katılın.',
    firstTimeOnly: false,
    priority: 6,
    mood: 'supportive',
  },
  {
    id: 'hayal_atolyesi_play',
    screen: 'hayal_atolyesi',
    userTypes: ['parent'],
    title: 'Birlikte Oynayın',
    message: 'Bu aktiviteleri birlikte yapmak, çocuğunuzla bağınızı güçlendirir.',
    firstTimeOnly: false,
    priority: 4,
    mood: 'happy',
  },

  // PROFILE TIPS
  {
    id: 'profile_children',
    screen: 'profile',
    userTypes: ['parent'],
    title: 'Çocuk Profilleri',
    message: 'Her çocuk için ayrı profil oluşturarak analizleri düzenli tutabilirsiniz.',
    firstTimeOnly: true,
    priority: 8,
    mood: 'thinking',
  },

  // HISTORY TIPS
  {
    id: 'history_first',
    screen: 'history',
    userTypes: ['parent', 'professional'],
    title: 'Gelişim Takibi',
    message: 'Geçmiş analizleri inceleyerek zaman içindeki gelişimi gözlemleyebilirsiniz.',
    firstTimeOnly: true,
    priority: 8,
    mood: 'curious',
  },
  {
    id: 'history_compare',
    screen: 'history',
    userTypes: ['parent'],
    title: 'Karşılaştırın',
    message: 'Farklı dönemlerdeki çizimleri karşılaştırarak çocuğunuzun duygusal gelişimini takip edin.',
    firstTimeOnly: false,
    priority: 5,
    mood: 'thinking',
  },

  // SETTINGS TIPS
  {
    id: 'settings_first',
    screen: 'settings',
    userTypes: ['parent', 'professional', 'teacher'],
    title: 'Ayarlar',
    message: 'Buradan bildirim, ses ve titreşim tercihlerinizi yönetebilirsiniz.',
    firstTimeOnly: true,
    priority: 8,
    mood: 'thinking',
  },
  {
    id: 'settings_accessibility',
    screen: 'settings',
    userTypes: ['parent'],
    title: 'Erişilebilirlik',
    message: 'Daha rahat kullanım için yazı boyutunu ve kontrast ayarlarını değiştirebilirsiniz.',
    firstTimeOnly: false,
    priority: 5,
    mood: 'supportive',
  },

  // TEACHER-SPECIFIC TIPS
  {
    id: 'home_welcome_teacher',
    screen: 'home',
    userTypes: ['teacher'],
    title: 'Hoş Geldiniz!',
    message: 'Öğrencilerinizin yaratıcılığını keşfetmek için burada doğru araçları bulacaksınız.',
    firstTimeOnly: true,
    priority: 10,
    mood: 'happy',
  },
  {
    id: 'analysis_first_teacher',
    screen: 'advanced_analysis',
    userTypes: ['teacher'],
    title: 'Sınıf Aktivitesi',
    message: 'Öğrenci çizimlerini toplu olarak analiz edebilir, sınıf raporları oluşturabilirsiniz.',
    firstTimeOnly: true,
    priority: 10,
    mood: 'thinking',
  },
  {
    id: 'coloring_teacher',
    screen: 'coloring',
    userTypes: ['teacher'],
    title: 'Grup Boyama',
    message: 'Boyama aktivitelerini sınıfta birlikte yaparak takım çalışmasını destekleyin.',
    firstTimeOnly: true,
    priority: 9,
    mood: 'excited',
  },
];

class AssistantEngine {
  private static instance: AssistantEngine;
  private dismissedTips: Set<string> = new Set();
  private dailyTipCount: number = 0;
  private lastTipDate: string = '';
  private userType: UserType = 'parent';
  private isInitialized: boolean = false;

  private readonly MAX_DAILY_TIPS = 3;

  private constructor() {}

  static getInstance(): AssistantEngine {
    if (!AssistantEngine.instance) {
      AssistantEngine.instance = new AssistantEngine();
    }
    return AssistantEngine.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const [dismissedStr, countStr, dateStr, typeStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DISMISSED_TIPS),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_TIP_COUNT),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_TIP_DATE),
        AsyncStorage.getItem(STORAGE_KEYS.USER_TYPE),
      ]);

      if (dismissedStr) {
        this.dismissedTips = new Set(JSON.parse(dismissedStr));
      }

      const today = new Date().toDateString();
      if (dateStr === today) {
        this.dailyTipCount = countStr ? parseInt(countStr, 10) : 0;
      } else {
        // Reset daily count for new day
        this.dailyTipCount = 0;
        this.lastTipDate = today;
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_TIP_DATE, today);
        await AsyncStorage.setItem(STORAGE_KEYS.DAILY_TIP_COUNT, '0');
      }

      if (typeStr) {
        this.userType = typeStr as UserType;
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('[AssistantEngine] Init error:', error);
    }
  }

  async setUserType(type: UserType): Promise<void> {
    this.userType = type;
    await AsyncStorage.setItem(STORAGE_KEYS.USER_TYPE, type);
  }

  getUserType(): UserType {
    return this.userType;
  }

  /**
   * Get the next relevant tip for a screen
   */
  async getTipForScreen(screen: ScreenContext): Promise<AssistantTip | null> {
    await this.initialize();

    // Check daily limit
    if (this.dailyTipCount >= this.MAX_DAILY_TIPS) {
      return null;
    }

    // Filter tips by screen, user type, and not dismissed
    const relevantTips = TIPS_DATABASE.filter((tip) => {
      if (tip.screen !== screen) return false;
      if (!tip.userTypes.includes(this.userType)) return false;
      if (this.dismissedTips.has(tip.id)) return false;
      return true;
    });

    // Sort by priority (highest first)
    relevantTips.sort((a, b) => b.priority - a.priority);

    // Return the highest priority tip
    return relevantTips[0] || null;
  }

  /**
   * Dismiss a tip (don't show again)
   */
  async dismissTip(tipId: string, neverShowAgain: boolean = false): Promise<void> {
    if (neverShowAgain) {
      this.dismissedTips.add(tipId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.DISMISSED_TIPS,
        JSON.stringify([...this.dismissedTips])
      );
    }

    // Increment daily count
    this.dailyTipCount++;
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_TIP_COUNT, this.dailyTipCount.toString());
  }

  /**
   * Reset all dismissed tips
   */
  async resetDismissedTips(): Promise<void> {
    this.dismissedTips.clear();
    await AsyncStorage.removeItem(STORAGE_KEYS.DISMISSED_TIPS);
  }

  /**
   * Get Ioo tone based on user type
   */
  getIooTone(): { greeting: string; style: 'warm' | 'professional' | 'helpful' } {
    switch (this.userType) {
      case 'parent':
        return { greeting: 'Merhaba!', style: 'warm' };
      case 'professional':
        return { greeting: 'İyi günler.', style: 'professional' };
      case 'teacher':
        return { greeting: 'Hoş geldiniz!', style: 'helpful' };
      default:
        return { greeting: 'Merhaba!', style: 'warm' };
    }
  }
}

export const assistantEngine = AssistantEngine.getInstance();
export { AssistantEngine };
