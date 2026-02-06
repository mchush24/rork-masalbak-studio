/**
 * RoleContext - User Role & UI Mode Management
 *
 * Manages user roles (Parent, Teacher, Expert) and adapts UI accordingly.
 * Each role has different:
 * - UI complexity level
 * - Gamification visibility
 * - Mascot prominence
 * - Copywriting tone
 * - Feature access
 *
 * Part of #16: Professional/Adult-Focused UI Revision
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * User roles in the application
 * - parent: Simplified UI, guided experience, gamification enabled
 * - teacher: Classroom management, batch operations, moderate complexity
 * - expert: Full clinical tools, detailed scoring, no gamification
 */
export type UserRole = 'parent' | 'teacher' | 'expert';

/**
 * Gamification settings per role
 */
export interface GamificationSettings {
  showXP: boolean;
  showBadges: boolean;
  showStreak: boolean;
  showCelebrations: boolean;
  enabled: boolean;
}

/**
 * Mascot visibility settings per role
 */
export interface MascotSettings {
  showOnDashboard: boolean;
  showOnEmptyStates: boolean;
  showOnErrors: boolean;
  showOnLoading: boolean;
  showAsChat: boolean;
  prominence: 'high' | 'medium' | 'low' | 'hidden';
}

/**
 * Copywriting tone settings per role
 */
export interface CopywritingSettings {
  formality: 'informal' | 'neutral' | 'formal';
  useEmoji: boolean;
  technicalLevel: 'simple' | 'moderate' | 'technical';
  encouragementLevel: 'high' | 'medium' | 'low';
}

/**
 * Feature access per role
 */
export interface FeatureAccess {
  clinicalScoring: boolean;
  normReferences: boolean;
  pdfReports: boolean;
  batchOperations: boolean;
  clientManagement: boolean;
  classroomManagement: boolean;
  developmentCharts: boolean;
  comparativeAnalysis: boolean;
  auditLog: boolean;
}

/**
 * Complete role configuration
 */
export interface RoleConfig {
  role: UserRole;
  displayName: string;
  description: string;
  gamification: GamificationSettings;
  mascot: MascotSettings;
  copywriting: CopywritingSettings;
  features: FeatureAccess;
}

/**
 * Role context type
 */
interface RoleContextType {
  // Current state
  role: UserRole;
  config: RoleConfig;
  isLoading: boolean;
  isOnboarded: boolean;

  // Actions
  setRole: (role: UserRole) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetRole: () => Promise<void>;

  // Helper hooks
  shouldShowGamification: (feature: keyof GamificationSettings) => boolean;
  shouldShowMascot: (context: keyof MascotSettings) => boolean;
  getFormattedText: (key: string, texts: RoleBasedTexts) => string;
}

/**
 * Role-based text variants
 */
export interface RoleBasedTexts {
  parent: string;
  teacher: string;
  expert: string;
}

// ============================================================================
// ROLE CONFIGURATIONS
// ============================================================================

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  parent: {
    role: 'parent',
    displayName: 'Ebeveyn',
    description: 'Çocuğunuzun gelişimini takip edin',
    gamification: {
      showXP: true,
      showBadges: true,
      showStreak: true,
      showCelebrations: true,
      enabled: true,
    },
    mascot: {
      showOnDashboard: true,
      showOnEmptyStates: true,
      showOnErrors: true,
      showOnLoading: true,
      showAsChat: true,
      prominence: 'high',
    },
    copywriting: {
      formality: 'informal',
      useEmoji: true,
      technicalLevel: 'simple',
      encouragementLevel: 'high',
    },
    features: {
      clinicalScoring: false,
      normReferences: false,
      pdfReports: true,
      batchOperations: false,
      clientManagement: false,
      classroomManagement: false,
      developmentCharts: true,
      comparativeAnalysis: false,
      auditLog: false,
    },
  },

  teacher: {
    role: 'teacher',
    displayName: 'Öğretmen',
    description: 'Sınıfınızı değerlendirin',
    gamification: {
      showXP: false,
      showBadges: false,
      showStreak: false,
      showCelebrations: false,
      enabled: false, // Can be enabled in settings
    },
    mascot: {
      showOnDashboard: false,
      showOnEmptyStates: true,
      showOnErrors: true,
      showOnLoading: false,
      showAsChat: true,
      prominence: 'low',
    },
    copywriting: {
      formality: 'neutral',
      useEmoji: false,
      technicalLevel: 'moderate',
      encouragementLevel: 'medium',
    },
    features: {
      clinicalScoring: false,
      normReferences: false,
      pdfReports: true,
      batchOperations: true,
      clientManagement: false,
      classroomManagement: true,
      developmentCharts: true,
      comparativeAnalysis: true,
      auditLog: false,
    },
  },

  expert: {
    role: 'expert',
    displayName: 'Uzman / Klinisyen',
    description: 'Profesyonel değerlendirme araçları',
    gamification: {
      showXP: false,
      showBadges: false,
      showStreak: false,
      showCelebrations: false,
      enabled: false,
    },
    mascot: {
      showOnDashboard: false,
      showOnEmptyStates: false,
      showOnErrors: true,
      showOnLoading: false,
      showAsChat: true,
      prominence: 'hidden',
    },
    copywriting: {
      formality: 'formal',
      useEmoji: false,
      technicalLevel: 'technical',
      encouragementLevel: 'low',
    },
    features: {
      clinicalScoring: true,
      normReferences: true,
      pdfReports: true,
      batchOperations: true,
      clientManagement: true,
      classroomManagement: false,
      developmentCharts: true,
      comparativeAnalysis: true,
      auditLog: true,
    },
  },
};

// ============================================================================
// ROLE-BASED TEXTS (Common UI Strings)
// ============================================================================

export const ROLE_TEXTS = {
  // ============================================
  // GREETINGS
  // ============================================
  greeting_morning: {
    parent: 'Günaydın! Bugün nasıl bir keşif yapalım?',
    teacher: 'Günaydın. Sınıfınız hazır.',
    expert: 'Günaydın. Değerlendirmeleriniz bekliyor.',
  },
  greeting_afternoon: {
    parent: 'İyi günler! Çocuğunuzla güzel vakit geçirin.',
    teacher: 'İyi günler. Öğrenci takibine devam edin.',
    expert: 'İyi günler. Vaka dosyalarınız güncel.',
  },
  greeting_evening: {
    parent: 'İyi akşamlar! Günün nasıl geçti?',
    teacher: 'İyi akşamlar. Günlük özet hazır.',
    expert: 'İyi akşamlar. Günün değerlendirmesi tamamlandı.',
  },

  // ============================================
  // DASHBOARD
  // ============================================
  dashboard_title: {
    parent: 'Ana Sayfa',
    teacher: 'Öğretmen Paneli',
    expert: 'Klinik Dashboard',
  },
  dashboard_subtitle: {
    parent: 'Çocuğunuzun dünyasını keşfedin',
    teacher: 'Sınıf ve öğrenci yönetimi',
    expert: 'Vaka ve değerlendirme yönetimi',
  },
  dashboard_welcome: {
    parent: 'Tekrar hoş geldin!',
    teacher: 'Hoş geldiniz',
    expert: 'Hoş geldiniz',
  },

  // ============================================
  // ANALYSIS
  // ============================================
  analysis_title: {
    parent: 'Çizim Analizi',
    teacher: 'Öğrenci Değerlendirmesi',
    expert: 'Klinik Değerlendirme',
  },
  analysis_subtitle: {
    parent: 'Çocuğunuzun dünyasını keşfedin',
    teacher: 'Çizim tabanlı değerlendirme',
    expert: 'Projektif çizim analizi',
  },
  analysis_quick: {
    parent: 'Hızlı Analiz',
    teacher: 'Hızlı Değerlendirme',
    expert: 'Hızlı Tarama',
  },
  analysis_quick_desc: {
    parent: 'Birkaç dakikada çocuğunuzun çizimini anlayın',
    teacher: 'Tek öğrenci için hızlı değerlendirme',
    expert: 'Ön değerlendirme için tarama',
  },
  analysis_advanced: {
    parent: 'Detaylı Analiz',
    teacher: 'Detaylı Değerlendirme',
    expert: 'Kapsamlı Değerlendirme',
  },
  analysis_advanced_desc: {
    parent: 'Daha kapsamlı bir değerlendirme için',
    teacher: 'Kapsamlı analiz ve raporlama',
    expert: 'Norm referanslı detaylı analiz',
  },
  analysis_processing: {
    parent: 'Analiz ediliyor...',
    teacher: 'Değerlendiriliyor...',
    expert: 'Analiz ediliyor...',
  },
  analysis_complete: {
    parent: 'Analiz Tamamlandı!',
    teacher: 'Değerlendirme Tamamlandı',
    expert: 'Değerlendirme Tamamlandı',
  },
  analysis_disclaimer: {
    parent: 'Bu içerik bilgilendirme amaçlıdır. Endişeleriniz varsa bir uzmana danışmanızı öneririz.',
    teacher: 'Bu değerlendirme eğitim amaçlıdır. Detaylı değerlendirme için okul PDR birimine yönlendirin.',
    expert: 'Bu değerlendirme klinik karar destek aracıdır. Kesin tanı için kapsamlı klinik değerlendirme gereklidir.',
  },

  // ============================================
  // CTAs (Call to Actions)
  // ============================================
  cta_new_analysis: {
    parent: 'Çizim Analiz Et',
    teacher: 'Öğrenciyi Değerlendir',
    expert: 'Yeni Değerlendirme',
  },
  cta_start: {
    parent: 'Başlayalım!',
    teacher: 'Başla',
    expert: 'Değerlendirmeye Başla',
  },
  cta_continue: {
    parent: 'Devam Edelim',
    teacher: 'Devam Et',
    expert: 'Devam',
  },
  cta_save: {
    parent: 'Kaydet',
    teacher: 'Kaydet',
    expert: 'Kaydet',
  },
  cta_cancel: {
    parent: 'Vazgeç',
    teacher: 'İptal',
    expert: 'İptal',
  },
  cta_done: {
    parent: 'Bitti!',
    teacher: 'Tamam',
    expert: 'Tamamla',
  },
  cta_view_results: {
    parent: 'Sonuçları Gör',
    teacher: 'Sonuçları İncele',
    expert: 'Sonuçları İncele',
  },
  cta_export: {
    parent: 'İndir',
    teacher: 'Dışa Aktar',
    expert: 'Dışa Aktar',
  },
  cta_share: {
    parent: 'Paylaş',
    teacher: 'Paylaş',
    expert: 'Paylaş',
  },

  // ============================================
  // RESULTS
  // ============================================
  result_title: {
    parent: 'Sonuçlar',
    teacher: 'Değerlendirme Sonuçları',
    expert: 'Değerlendirme Sonuçları',
  },
  result_summary: {
    parent: 'Özet',
    teacher: 'Özet',
    expert: 'Klinik Özet',
  },
  result_positive: {
    parent: 'Harika gidiyor! 🌟',
    teacher: 'Olumlu göstergeler',
    expert: 'Pozitif değerlendirme',
  },
  result_attention: {
    parent: 'Birlikte geliştirebiliriz 💪',
    teacher: 'Dikkat gerektiren alan',
    expert: 'Klinik takip önerilir',
  },
  result_neutral: {
    parent: 'Normal gelişim gösteriyor',
    teacher: 'Normal sınırlar',
    expert: 'Normal sınırlar içinde',
  },
  result_strengths: {
    parent: 'Güçlü Yönler',
    teacher: 'Güçlü Yönler',
    expert: 'Pozitif Göstergeler',
  },
  result_areas_to_watch: {
    parent: 'Dikkat Edilecekler',
    teacher: 'Dikkat Gerektiren Alanlar',
    expert: 'Klinik Dikkat Gerektiren Alanlar',
  },
  result_recommendations: {
    parent: 'Öneriler',
    teacher: 'Öneriler',
    expert: 'Klinik Öneriler',
  },

  // ============================================
  // EMPTY STATES
  // ============================================
  empty_analyses: {
    parent: 'İlk analizinizi yaparak çocuğunuzun dünyasını keşfedin!',
    teacher: 'Öğrenci değerlendirmesi bulunmuyor. Yeni değerlendirme başlatın.',
    expert: 'Değerlendirme kaydı bulunmuyor.',
  },
  empty_history: {
    parent: 'Henüz bir geçmişiniz yok. Hadi başlayalım!',
    teacher: 'Değerlendirme geçmişi boş.',
    expert: 'Vaka geçmişi bulunmuyor.',
  },
  empty_subjects: {
    parent: 'Henüz çocuk profili eklenmemiş',
    teacher: 'Sınıfta kayıtlı öğrenci bulunmuyor',
    expert: 'Kayıtlı danışan bulunmuyor',
  },
  empty_stories: {
    parent: 'Henüz masal yok. Birlikte oluşturalım!',
    teacher: 'Hikaye kaydı bulunmuyor.',
    expert: 'Materyal kaydı bulunmuyor.',
  },
  empty_colorings: {
    parent: 'Henüz boyama yok. İlk boyamayı yapalım!',
    teacher: 'Boyama kaydı bulunmuyor.',
    expert: 'Materyal kaydı bulunmuyor.',
  },

  // ============================================
  // ERROR MESSAGES
  // ============================================
  error_generic: {
    parent: 'Bir aksaklık oluştu. Endişelenmeyin, verileriniz güvende!',
    teacher: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    expert: 'İşlem sırasında hata oluştu. Tekrar deneyiniz.',
  },
  error_network: {
    parent: 'İnternet bağlantınızı kontrol edin.',
    teacher: 'Bağlantı hatası. Ağ bağlantınızı kontrol edin.',
    expert: 'Ağ bağlantısı kurulamadı.',
  },
  error_timeout: {
    parent: 'İşlem zaman aşımına uğradı. Tekrar deneyin.',
    teacher: 'İşlem zaman aşımına uğradı.',
    expert: 'İşlem zaman aşımına uğradı.',
  },
  error_upload: {
    parent: 'Yükleme başarısız oldu. Tekrar deneyin.',
    teacher: 'Yükleme başarısız.',
    expert: 'Yükleme başarısız.',
  },
  error_analysis: {
    parent: 'Analiz yapılamadı. Tekrar deneyin.',
    teacher: 'Değerlendirme tamamlanamadı.',
    expert: 'Değerlendirme tamamlanamadı.',
  },

  // ============================================
  // SUCCESS MESSAGES
  // ============================================
  success_saved: {
    parent: 'Kaydedildi!',
    teacher: 'Kaydedildi',
    expert: 'Kaydedildi',
  },
  success_deleted: {
    parent: 'Silindi',
    teacher: 'Silindi',
    expert: 'Silindi',
  },
  success_analysis: {
    parent: 'Analiz tamamlandı!',
    teacher: 'Değerlendirme tamamlandı',
    expert: 'Değerlendirme tamamlandı',
  },
  success_export: {
    parent: 'İndirildi!',
    teacher: 'Dışa aktarıldı',
    expert: 'Dışa aktarıldı',
  },

  // ============================================
  // SUBJECTS (Child/Student/Client)
  // ============================================
  children_title: {
    parent: 'Çocuklarım',
    teacher: 'Öğrencilerim',
    expert: 'Danışanlarım',
  },
  child_singular: {
    parent: 'Çocuk',
    teacher: 'Öğrenci',
    expert: 'Danışan',
  },
  child_plural: {
    parent: 'Çocuklar',
    teacher: 'Öğrenciler',
    expert: 'Danışanlar',
  },
  add_child: {
    parent: 'Çocuk Ekle',
    teacher: 'Öğrenci Ekle',
    expert: 'Danışan Ekle',
  },
  child_profile: {
    parent: 'Çocuk Profili',
    teacher: 'Öğrenci Profili',
    expert: 'Danışan Dosyası',
  },

  // ============================================
  // LABELS
  // ============================================
  score_label: {
    parent: 'Durum',
    teacher: 'Puan',
    expert: 'Skor',
  },
  percentile_label: {
    parent: 'Karşılaştırma',
    teacher: 'Yüzdelik',
    expert: 'Percentile',
  },
  age_label: {
    parent: 'Yaş',
    teacher: 'Yaş',
    expert: 'Yaş',
  },
  date_label: {
    parent: 'Tarih',
    teacher: 'Tarih',
    expert: 'Değerlendirme Tarihi',
  },
  notes_label: {
    parent: 'Notlar',
    teacher: 'Gözlem Notları',
    expert: 'Klinik Notlar',
  },

  // ============================================
  // CONFIRMATIONS
  // ============================================
  confirm_delete: {
    parent: 'Silmek istediğinize emin misiniz?',
    teacher: 'Bu kaydı silmek istediğinize emin misiniz?',
    expert: 'Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?',
  },
  confirm_discard: {
    parent: 'Değişiklikleri kaydetmeden çıkmak istiyor musunuz?',
    teacher: 'Değişiklikler kaydedilmeyecek. Devam etmek istiyor musunuz?',
    expert: 'Kaydedilmemiş değişiklikler kaybolacak. Devam edilsin mi?',
  },
  confirm_logout: {
    parent: 'Çıkış yapmak istediğinize emin misiniz?',
    teacher: 'Oturumu kapatmak istiyor musunuz?',
    expert: 'Oturumu kapatmak istiyor musunuz?',
  },

  // ============================================
  // STATUS
  // ============================================
  status_loading: {
    parent: 'Yükleniyor...',
    teacher: 'Yükleniyor...',
    expert: 'Yükleniyor...',
  },
  status_saving: {
    parent: 'Kaydediliyor...',
    teacher: 'Kaydediliyor...',
    expert: 'Kaydediliyor...',
  },
  status_processing: {
    parent: 'İşleniyor...',
    teacher: 'İşleniyor...',
    expert: 'İşleniyor...',
  },

  // ============================================
  // PROFESSIONAL SPECIFIC
  // ============================================
  professional_assessment: {
    parent: '',
    teacher: 'Değerlendirme',
    expert: 'Klinik Değerlendirme',
  },
  professional_norm_reference: {
    parent: '',
    teacher: 'Norm Referans',
    expert: 'Norm Referansı',
  },
  professional_clinical_notes: {
    parent: '',
    teacher: 'Notlar',
    expert: 'Klinik Notlar',
  },
  professional_batch_analysis: {
    parent: '',
    teacher: 'Toplu Değerlendirme',
    expert: 'Toplu Değerlendirme',
  },
  professional_compare: {
    parent: '',
    teacher: 'Sonuçları Karşılaştır',
    expert: 'Karşılaştırmalı Analiz',
  },
} as const;

// ============================================================================
// STORAGE KEYS
// ============================================================================

const ROLE_STORAGE_KEY = '@renkioo_user_role';
const ONBOARDING_STORAGE_KEY = '@renkioo_role_onboarded';

// ============================================================================
// CONTEXT
// ============================================================================

const RoleContext = createContext<RoleContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface RoleProviderProps {
  children: ReactNode;
  defaultRole?: UserRole;
}

export function RoleProvider({
  children,
  defaultRole = 'parent'
}: RoleProviderProps) {
  const [role, setRoleState] = useState<UserRole>(defaultRole);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Load saved role on mount
  useEffect(() => {
    loadRole();
  }, []);

  const loadRole = async () => {
    try {
      const [savedRole, onboarded] = await Promise.all([
        AsyncStorage.getItem(ROLE_STORAGE_KEY),
        AsyncStorage.getItem(ONBOARDING_STORAGE_KEY),
      ]);

      if (savedRole && ['parent', 'teacher', 'expert'].includes(savedRole)) {
        setRoleState(savedRole as UserRole);
      }

      setIsOnboarded(onboarded === 'true');
    } catch (error) {
      console.error('Failed to load role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setRole = useCallback(async (newRole: UserRole) => {
    try {
      await AsyncStorage.setItem(ROLE_STORAGE_KEY, newRole);
      setRoleState(newRole);
    } catch (error) {
      console.error('Failed to save role:', error);
      throw error;
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
      setIsOnboarded(true);
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      throw error;
    }
  }, []);

  const resetRole = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ROLE_STORAGE_KEY),
        AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY),
      ]);
      setRoleState('parent');
      setIsOnboarded(false);
    } catch (error) {
      console.error('Failed to reset role:', error);
      throw error;
    }
  }, []);

  // Get current role config
  const config = useMemo(() => ROLE_CONFIGS[role], [role]);

  // Helper: Check if gamification feature should be shown
  const shouldShowGamification = useCallback(
    (feature: keyof GamificationSettings) => {
      return config.gamification[feature] ?? false;
    },
    [config]
  );

  // Helper: Check if mascot should be shown in context
  const shouldShowMascot = useCallback(
    (context: keyof MascotSettings) => {
      const value = config.mascot[context];
      if (typeof value === 'boolean') return value;
      if (context === 'prominence') return value !== 'hidden';
      return false;
    },
    [config]
  );

  // Helper: Get role-formatted text
  const getFormattedText = useCallback(
    (key: string, texts: RoleBasedTexts) => {
      return texts[role] || texts.parent;
    },
    [role]
  );

  const value = useMemo<RoleContextType>(
    () => ({
      role,
      config,
      isLoading,
      isOnboarded,
      setRole,
      completeOnboarding,
      resetRole,
      shouldShowGamification,
      shouldShowMascot,
      getFormattedText,
    }),
    [
      role,
      config,
      isLoading,
      isOnboarded,
      setRole,
      completeOnboarding,
      resetRole,
      shouldShowGamification,
      shouldShowMascot,
      getFormattedText,
    ]
  );

  // Don't render until role is loaded
  if (isLoading) {
    return null;
  }

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Main hook to access role context
 */
export function useRole(): RoleContextType {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

/**
 * Hook to get role-specific text
 */
export function useRoleText(textKey: keyof typeof ROLE_TEXTS): string {
  const { role } = useRole();
  const texts = ROLE_TEXTS[textKey];
  return texts[role] || texts.parent;
}

/**
 * Hook to check feature access
 */
export function useFeatureAccess(feature: keyof FeatureAccess): boolean {
  const { config } = useRole();
  return config.features[feature] ?? false;
}

/**
 * Hook to check if gamification is enabled
 */
export function useGamification(): GamificationSettings & { isEnabled: boolean } {
  const { config } = useRole();
  return {
    ...config.gamification,
    isEnabled: config.gamification.enabled,
  };
}

/**
 * Hook to get mascot settings
 */
export function useMascotSettings(): MascotSettings {
  const { config } = useRole();
  return config.mascot;
}

/**
 * Hook to get copywriting settings
 */
export function useCopywriting(): CopywritingSettings {
  const { config } = useRole();
  return config.copywriting;
}

/**
 * Hook to check if user is a professional (teacher or expert)
 */
export function useIsProfessional(): boolean {
  const { role } = useRole();
  return role === 'teacher' || role === 'expert';
}

/**
 * Hook to check if user is an expert/clinician
 */
export function useIsExpert(): boolean {
  const { role } = useRole();
  return role === 'expert';
}
