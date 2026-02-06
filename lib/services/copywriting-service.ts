/**
 * Copywriting Service - Role-Aware Professional Copywriting
 * Part of #23: Profesyonel Copywriting Revizyonu
 *
 * Provides consistent, role-appropriate text throughout the app:
 * - Parent: Warm, encouraging, emoji-friendly, simple language
 * - Teacher: Professional but friendly, no emoji, moderate complexity
 * - Expert: Clinical, formal, technical terminology
 *
 * Usage:
 * const copy = useCopywriting();
 * <Text>{copy.analysis.title}</Text>
 * <Text>{copy.format('Analiz tamamlandı', { emoji: '✨' })}</Text>
 */

import { UserRole } from '@/lib/contexts/RoleContext';

// ============================================================================
// TYPES
// ============================================================================

export interface CopywritingTexts {
  // Navigation & Headers
  navigation: {
    home: string;
    analysis: string;
    history: string;
    profile: string;
    settings: string;
    studio: string;
    dashboard: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    welcomeBack: string;
    quickActions: string;
    recentActivity: string;
    noActivity: string;
    viewAll: string;
  };

  // Analysis
  analysis: {
    title: string;
    subtitle: string;
    quickAnalysis: string;
    quickAnalysisDesc: string;
    advancedAnalysis: string;
    advancedAnalysisDesc: string;
    selectImage: string;
    selectImageDesc: string;
    analyzing: string;
    complete: string;
    completeDesc: string;
    viewResults: string;
    newAnalysis: string;
    disclaimer: string;
  };

  // Results
  results: {
    title: string;
    summary: string;
    details: string;
    strengths: string;
    areasToWatch: string;
    recommendations: string;
    clinicalNotes: string;
    exportReport: string;
    shareResults: string;
    positive: string;
    attention: string;
    neutral: string;
  };

  // Children/Clients/Students
  subjects: {
    title: string;
    singular: string;
    plural: string;
    add: string;
    edit: string;
    remove: string;
    profile: string;
    age: string;
    lastActivity: string;
    noSubjects: string;
    addFirst: string;
  };

  // Empty States
  emptyStates: {
    noAnalyses: string;
    noHistory: string;
    noStories: string;
    noColorings: string;
    noClients: string;
    noStudents: string;
    noData: string;
    getStarted: string;
  };

  // Actions & CTAs
  actions: {
    start: string;
    continue: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    share: string;
    export: string;
    retry: string;
    confirm: string;
    back: string;
    next: string;
    done: string;
    close: string;
    learn_more: string;
  };

  // Status Messages
  status: {
    loading: string;
    saving: string;
    processing: string;
    uploading: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };

  // Error Messages
  errors: {
    generic: string;
    network: string;
    timeout: string;
    notFound: string;
    unauthorized: string;
    validation: string;
    uploadFailed: string;
    analysisFailed: string;
    saveFailed: string;
    tryAgain: string;
  };

  // Success Messages
  success: {
    saved: string;
    deleted: string;
    updated: string;
    shared: string;
    exported: string;
    analysisComplete: string;
    profileCreated: string;
    settingsUpdated: string;
  };

  // Confirmations
  confirmations: {
    delete: string;
    discard: string;
    logout: string;
    removeProfile: string;
    clearHistory: string;
  };

  // Studio
  studio: {
    title: string;
    subtitle: string;
    storyMode: string;
    storyModeDesc: string;
    coloringMode: string;
    coloringModeDesc: string;
    generating: string;
    ready: string;
  };

  // Reports
  reports: {
    title: string;
    generate: string;
    generating: string;
    download: string;
    share: string;
    pdfReport: string;
    clinicalReport: string;
    progressReport: string;
  };

  // Onboarding
  onboarding: {
    welcome: string;
    welcomeDesc: string;
    selectRole: string;
    selectRoleDesc: string;
    setupProfile: string;
    setupProfileDesc: string;
    ready: string;
    readyDesc: string;
  };

  // Gamification (only for parents)
  gamification: {
    level: string;
    xp: string;
    streak: string;
    badge: string;
    newBadge: string;
    achievement: string;
    progress: string;
  };

  // Professional (only for teachers/experts)
  professional: {
    client: string;
    clients: string;
    student: string;
    students: string;
    assessment: string;
    evaluation: string;
    normReference: string;
    percentile: string;
    zScore: string;
    clinicalNotes: string;
    batchAnalysis: string;
    compareResults: string;
  };
}

// ============================================================================
// PARENT COPYWRITING (Warm, Encouraging, Simple)
// ============================================================================

const PARENT_COPY: CopywritingTexts = {
  navigation: {
    home: 'Ana Sayfa',
    analysis: 'Çizim Analizi',
    history: 'Geçmiş',
    profile: 'Profil',
    settings: 'Ayarlar',
    studio: 'Hayal Atölyesi',
    dashboard: 'Ana Sayfa',
  },

  dashboard: {
    title: 'Merhaba!',
    subtitle: 'Bugün ne keşfedeceğiz?',
    welcomeBack: 'Tekrar hoş geldin!',
    quickActions: 'Hızlı Başla',
    recentActivity: 'Son Aktiviteler',
    noActivity: 'Henüz bir aktivite yok. Hadi başlayalım!',
    viewAll: 'Tümünü Gör',
  },

  analysis: {
    title: 'Çizim Analizi',
    subtitle: 'Çocuğunuzun dünyasını keşfedin',
    quickAnalysis: 'Hızlı Analiz',
    quickAnalysisDesc: 'Birkaç dakikada çocuğunuzun çizimini anlayın',
    advancedAnalysis: 'Detaylı Analiz',
    advancedAnalysisDesc: 'Daha kapsamlı bir değerlendirme için',
    selectImage: 'Çizim Seç',
    selectImageDesc: 'Fotoğraf çekin veya galeriden seçin',
    analyzing: 'Analiz ediliyor...',
    complete: 'Analiz Tamamlandı!',
    completeDesc: 'Sonuçlarınız hazır',
    viewResults: 'Sonuçları Gör',
    newAnalysis: 'Yeni Analiz',
    disclaimer: 'Bu içerik bilgilendirme amaçlıdır. Endişeleriniz varsa bir uzmana danışmanızı öneririz.',
  },

  results: {
    title: 'Sonuçlar',
    summary: 'Özet',
    details: 'Detaylar',
    strengths: 'Güçlü Yönler',
    areasToWatch: 'Dikkat Edilecekler',
    recommendations: 'Öneriler',
    clinicalNotes: 'Notlar',
    exportReport: 'Raporu İndir',
    shareResults: 'Paylaş',
    positive: 'Harika gidiyor!',
    attention: 'Birlikte geliştirebiliriz',
    neutral: 'Normal gelişim gösteriyor',
  },

  subjects: {
    title: 'Çocuklarım',
    singular: 'Çocuk',
    plural: 'Çocuklar',
    add: 'Çocuk Ekle',
    edit: 'Düzenle',
    remove: 'Kaldır',
    profile: 'Çocuk Profili',
    age: 'Yaş',
    lastActivity: 'Son Aktivite',
    noSubjects: 'Henüz çocuk profili eklenmemiş',
    addFirst: 'İlk çocuk profilini ekleyin',
  },

  emptyStates: {
    noAnalyses: 'Henüz analiz yapmadınız. İlk analizi başlatın!',
    noHistory: 'Henüz bir geçmişiniz yok. Hadi başlayalım!',
    noStories: 'Henüz masal yok. Birlikte oluşturalım!',
    noColorings: 'Henüz boyama yok. İlk boyamayı yapalım!',
    noClients: '',
    noStudents: '',
    noData: 'Henüz veri yok',
    getStarted: 'Başlayalım!',
  },

  actions: {
    start: 'Başlayalım!',
    continue: 'Devam Et',
    save: 'Kaydet',
    cancel: 'Vazgeç',
    delete: 'Sil',
    edit: 'Düzenle',
    share: 'Paylaş',
    export: 'İndir',
    retry: 'Tekrar Dene',
    confirm: 'Tamam',
    back: 'Geri',
    next: 'İleri',
    done: 'Bitti',
    close: 'Kapat',
    learn_more: 'Daha Fazla',
  },

  status: {
    loading: 'Yükleniyor...',
    saving: 'Kaydediliyor...',
    processing: 'İşleniyor...',
    uploading: 'Yükleniyor...',
    success: 'Başarılı!',
    error: 'Bir sorun oluştu',
    warning: 'Dikkat',
    info: 'Bilgi',
  },

  errors: {
    generic: 'Bir aksaklık oluştu. Endişelenmeyin, verileriniz güvende!',
    network: 'İnternet bağlantınızı kontrol edin',
    timeout: 'İşlem zaman aşımına uğradı. Tekrar deneyin',
    notFound: 'Aradığınız içerik bulunamadı',
    unauthorized: 'Bu işlem için giriş yapmanız gerekiyor',
    validation: 'Lütfen bilgileri kontrol edin',
    uploadFailed: 'Yükleme başarısız oldu. Tekrar deneyin',
    analysisFailed: 'Analiz yapılamadı. Tekrar deneyin',
    saveFailed: 'Kaydetme başarısız. Tekrar deneyin',
    tryAgain: 'Tekrar deneyin',
  },

  success: {
    saved: 'Kaydedildi!',
    deleted: 'Silindi',
    updated: 'Güncellendi!',
    shared: 'Paylaşıldı!',
    exported: 'İndirildi!',
    analysisComplete: 'Analiz tamamlandı!',
    profileCreated: 'Profil oluşturuldu!',
    settingsUpdated: 'Ayarlar güncellendi!',
  },

  confirmations: {
    delete: 'Silmek istediğinize emin misiniz?',
    discard: 'Değişiklikleri kaydetmeden çıkmak istiyor musunuz?',
    logout: 'Çıkış yapmak istediğinize emin misiniz?',
    removeProfile: 'Bu profili kaldırmak istediğinize emin misiniz?',
    clearHistory: 'Geçmişi temizlemek istediğinize emin misiniz?',
  },

  studio: {
    title: 'Hayal Atölyesi',
    subtitle: 'Çizimlerden sihirli içerikler',
    storyMode: 'Masal Oluştur',
    storyModeDesc: 'Çizimden kişiselleştirilmiş masal',
    coloringMode: 'Boyama Sayfası',
    coloringModeDesc: 'Yazdırılabilir boyama sayfası',
    generating: 'Oluşturuluyor...',
    ready: 'Hazır!',
  },

  reports: {
    title: 'Raporlar',
    generate: 'Rapor Oluştur',
    generating: 'Rapor hazırlanıyor...',
    download: 'İndir',
    share: 'Paylaş',
    pdfReport: 'PDF Rapor',
    clinicalReport: '',
    progressReport: 'İlerleme Raporu',
  },

  onboarding: {
    welcome: 'Hoş Geldiniz!',
    welcomeDesc: 'Çocuğunuzun dünyasını keşfetmeye hazır mısınız?',
    selectRole: 'Kim Olduğunuzu Seçin',
    selectRoleDesc: 'Size en uygun deneyimi sunalım',
    setupProfile: 'Profil Oluşturun',
    setupProfileDesc: 'Çocuğunuz hakkında biraz bilgi verin',
    ready: 'Hazırsınız!',
    readyDesc: 'Keşfetmeye başlayabilirsiniz',
  },

  gamification: {
    level: 'Seviye',
    xp: 'XP',
    streak: 'Gün Serisi',
    badge: 'Rozet',
    newBadge: 'Yeni Rozet!',
    achievement: 'Başarı',
    progress: 'İlerleme',
  },

  professional: {
    client: '',
    clients: '',
    student: '',
    students: '',
    assessment: '',
    evaluation: '',
    normReference: '',
    percentile: '',
    zScore: '',
    clinicalNotes: '',
    batchAnalysis: '',
    compareResults: '',
  },
};

// ============================================================================
// TEACHER COPYWRITING (Professional, Friendly, Moderate)
// ============================================================================

const TEACHER_COPY: CopywritingTexts = {
  navigation: {
    home: 'Panel',
    analysis: 'Değerlendirme',
    history: 'Kayıtlar',
    profile: 'Profil',
    settings: 'Ayarlar',
    studio: 'Atölye',
    dashboard: 'Öğretmen Paneli',
  },

  dashboard: {
    title: 'Öğretmen Paneli',
    subtitle: 'Sınıf ve öğrenci yönetimi',
    welcomeBack: 'Hoş geldiniz',
    quickActions: 'Hızlı İşlemler',
    recentActivity: 'Son İşlemler',
    noActivity: 'Henüz kayıtlı işlem bulunmuyor',
    viewAll: 'Tümünü Görüntüle',
  },

  analysis: {
    title: 'Öğrenci Değerlendirmesi',
    subtitle: 'Çizim tabanlı değerlendirme',
    quickAnalysis: 'Hızlı Değerlendirme',
    quickAnalysisDesc: 'Tek öğrenci için hızlı değerlendirme',
    advancedAnalysis: 'Detaylı Değerlendirme',
    advancedAnalysisDesc: 'Kapsamlı analiz ve raporlama',
    selectImage: 'Çizim Yükle',
    selectImageDesc: 'Öğrencinin çizimini yükleyin',
    analyzing: 'Değerlendiriliyor...',
    complete: 'Değerlendirme Tamamlandı',
    completeDesc: 'Sonuçlar hazır',
    viewResults: 'Sonuçları İncele',
    newAnalysis: 'Yeni Değerlendirme',
    disclaimer: 'Bu değerlendirme eğitim amaçlıdır. Detaylı değerlendirme için okul PDR birimine yönlendirin.',
  },

  results: {
    title: 'Değerlendirme Sonuçları',
    summary: 'Özet',
    details: 'Detaylı Görünüm',
    strengths: 'Güçlü Yönler',
    areasToWatch: 'Dikkat Gerektiren Alanlar',
    recommendations: 'Öneriler',
    clinicalNotes: 'Notlar',
    exportReport: 'Rapor Oluştur',
    shareResults: 'Paylaş',
    positive: 'Olumlu Göstergeler',
    attention: 'Takip Önerilir',
    neutral: 'Normal Sınırlar',
  },

  subjects: {
    title: 'Öğrencilerim',
    singular: 'Öğrenci',
    plural: 'Öğrenciler',
    add: 'Öğrenci Ekle',
    edit: 'Düzenle',
    remove: 'Kaldır',
    profile: 'Öğrenci Profili',
    age: 'Yaş',
    lastActivity: 'Son Değerlendirme',
    noSubjects: 'Henüz öğrenci kaydı bulunmuyor',
    addFirst: 'İlk öğrenciyi ekleyin',
  },

  emptyStates: {
    noAnalyses: 'Henüz değerlendirme yapılmamış. Yeni değerlendirme başlatın.',
    noHistory: 'Değerlendirme geçmişi bulunmuyor.',
    noStories: 'Hikaye kaydı bulunmuyor.',
    noColorings: 'Boyama kaydı bulunmuyor.',
    noClients: '',
    noStudents: 'Sınıfta kayıtlı öğrenci bulunmuyor.',
    noData: 'Veri bulunmuyor',
    getStarted: 'Başla',
  },

  actions: {
    start: 'Başla',
    continue: 'Devam',
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    share: 'Paylaş',
    export: 'Dışa Aktar',
    retry: 'Tekrar Dene',
    confirm: 'Onayla',
    back: 'Geri',
    next: 'İleri',
    done: 'Tamam',
    close: 'Kapat',
    learn_more: 'Detay',
  },

  status: {
    loading: 'Yükleniyor...',
    saving: 'Kaydediliyor...',
    processing: 'İşleniyor...',
    uploading: 'Yükleniyor...',
    success: 'İşlem başarılı',
    error: 'Hata oluştu',
    warning: 'Uyarı',
    info: 'Bilgi',
  },

  errors: {
    generic: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    network: 'Bağlantı hatası. Ağ bağlantınızı kontrol edin.',
    timeout: 'İşlem zaman aşımına uğradı.',
    notFound: 'İçerik bulunamadı.',
    unauthorized: 'Bu işlem için yetkiniz bulunmuyor.',
    validation: 'Girilen bilgileri kontrol edin.',
    uploadFailed: 'Yükleme başarısız.',
    analysisFailed: 'Değerlendirme tamamlanamadı.',
    saveFailed: 'Kaydetme başarısız.',
    tryAgain: 'Tekrar deneyin',
  },

  success: {
    saved: 'Kaydedildi',
    deleted: 'Silindi',
    updated: 'Güncellendi',
    shared: 'Paylaşıldı',
    exported: 'Dışa aktarıldı',
    analysisComplete: 'Değerlendirme tamamlandı',
    profileCreated: 'Profil oluşturuldu',
    settingsUpdated: 'Ayarlar güncellendi',
  },

  confirmations: {
    delete: 'Bu kaydı silmek istediğinize emin misiniz?',
    discard: 'Değişiklikler kaydedilmeyecek. Devam etmek istiyor musunuz?',
    logout: 'Oturumu kapatmak istiyor musunuz?',
    removeProfile: 'Bu profili silmek istediğinize emin misiniz?',
    clearHistory: 'Tüm geçmişi temizlemek istiyor musunuz?',
  },

  studio: {
    title: 'Çalışma Atölyesi',
    subtitle: 'Eğitim materyalleri oluşturun',
    storyMode: 'Hikaye Oluştur',
    storyModeDesc: 'Çizimden eğitici hikaye',
    coloringMode: 'Boyama Sayfası',
    coloringModeDesc: 'Yazdırılabilir çalışma sayfası',
    generating: 'Oluşturuluyor...',
    ready: 'Hazır',
  },

  reports: {
    title: 'Raporlar',
    generate: 'Rapor Oluştur',
    generating: 'Rapor hazırlanıyor...',
    download: 'İndir',
    share: 'Paylaş',
    pdfReport: 'PDF Rapor',
    clinicalReport: 'Detaylı Rapor',
    progressReport: 'Sınıf Raporu',
  },

  onboarding: {
    welcome: 'Hoş Geldiniz',
    welcomeDesc: 'Öğrenci değerlendirme araçlarına erişin',
    selectRole: 'Kullanıcı Türünü Seçin',
    selectRoleDesc: 'Size uygun özellikleri etkinleştirelim',
    setupProfile: 'Profil Ayarları',
    setupProfileDesc: 'Hesap bilgilerinizi tamamlayın',
    ready: 'Hazırsınız',
    readyDesc: 'Değerlendirmelere başlayabilirsiniz',
  },

  gamification: {
    level: 'Seviye',
    xp: 'Puan',
    streak: 'Seri',
    badge: 'Rozet',
    newBadge: 'Yeni Rozet',
    achievement: 'Başarı',
    progress: 'İlerleme',
  },

  professional: {
    client: 'Danışan',
    clients: 'Danışanlar',
    student: 'Öğrenci',
    students: 'Öğrenciler',
    assessment: 'Değerlendirme',
    evaluation: 'Değerlendirme',
    normReference: 'Norm Referans',
    percentile: 'Yüzdelik',
    zScore: 'Z-Skor',
    clinicalNotes: 'Notlar',
    batchAnalysis: 'Toplu Değerlendirme',
    compareResults: 'Sonuçları Karşılaştır',
  },
};

// ============================================================================
// EXPERT COPYWRITING (Clinical, Formal, Technical)
// ============================================================================

const EXPERT_COPY: CopywritingTexts = {
  navigation: {
    home: 'Dashboard',
    analysis: 'Değerlendirme',
    history: 'Vaka Geçmişi',
    profile: 'Profil',
    settings: 'Ayarlar',
    studio: 'Materyal',
    dashboard: 'Klinik Dashboard',
  },

  dashboard: {
    title: 'Klinik Dashboard',
    subtitle: 'Vaka ve değerlendirme yönetimi',
    welcomeBack: 'Hoş geldiniz',
    quickActions: 'Hızlı Erişim',
    recentActivity: 'Son İşlemler',
    noActivity: 'Kayıtlı işlem bulunmuyor',
    viewAll: 'Tümünü Görüntüle',
  },

  analysis: {
    title: 'Klinik Değerlendirme',
    subtitle: 'Projektif çizim analizi',
    quickAnalysis: 'Hızlı Tarama',
    quickAnalysisDesc: 'Ön değerlendirme için tarama',
    advancedAnalysis: 'Kapsamlı Değerlendirme',
    advancedAnalysisDesc: 'Norm referanslı detaylı analiz',
    selectImage: 'Çizim Yükle',
    selectImageDesc: 'Değerlendirme için çizimi yükleyin',
    analyzing: 'Analiz ediliyor...',
    complete: 'Değerlendirme Tamamlandı',
    completeDesc: 'Sonuçlar incelemeye hazır',
    viewResults: 'Sonuçları İncele',
    newAnalysis: 'Yeni Değerlendirme',
    disclaimer: 'Bu değerlendirme klinik karar destek aracıdır. Kesin tanı için kapsamlı klinik değerlendirme gereklidir.',
  },

  results: {
    title: 'Değerlendirme Sonuçları',
    summary: 'Klinik Özet',
    details: 'Detaylı Bulgular',
    strengths: 'Pozitif Göstergeler',
    areasToWatch: 'Klinik Dikkat Gerektiren Alanlar',
    recommendations: 'Klinik Öneriler',
    clinicalNotes: 'Klinik Notlar',
    exportReport: 'Rapor Oluştur',
    shareResults: 'Paylaş',
    positive: 'Pozitif Değerlendirme',
    attention: 'Klinik Takip Önerilir',
    neutral: 'Normal Sınırlar İçinde',
  },

  subjects: {
    title: 'Danışanlarım',
    singular: 'Danışan',
    plural: 'Danışanlar',
    add: 'Danışan Ekle',
    edit: 'Düzenle',
    remove: 'Kaldır',
    profile: 'Danışan Dosyası',
    age: 'Yaş',
    lastActivity: 'Son Değerlendirme',
    noSubjects: 'Kayıtlı danışan bulunmuyor',
    addFirst: 'Yeni danışan kaydı oluşturun',
  },

  emptyStates: {
    noAnalyses: 'Değerlendirme kaydı bulunmuyor.',
    noHistory: 'Vaka geçmişi bulunmuyor.',
    noStories: 'Materyal kaydı bulunmuyor.',
    noColorings: 'Materyal kaydı bulunmuyor.',
    noClients: 'Danışan kaydı bulunmuyor.',
    noStudents: '',
    noData: 'Veri bulunmuyor',
    getStarted: 'Başla',
  },

  actions: {
    start: 'Değerlendirmeye Başla',
    continue: 'Devam',
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    share: 'Paylaş',
    export: 'Dışa Aktar',
    retry: 'Tekrar Dene',
    confirm: 'Onayla',
    back: 'Geri',
    next: 'İleri',
    done: 'Tamamla',
    close: 'Kapat',
    learn_more: 'Detay',
  },

  status: {
    loading: 'Yükleniyor...',
    saving: 'Kaydediliyor...',
    processing: 'İşleniyor...',
    uploading: 'Yükleniyor...',
    success: 'İşlem tamamlandı',
    error: 'Hata',
    warning: 'Uyarı',
    info: 'Bilgi',
  },

  errors: {
    generic: 'İşlem sırasında hata oluştu. Tekrar deneyiniz.',
    network: 'Ağ bağlantısı kurulamadı.',
    timeout: 'İşlem zaman aşımına uğradı.',
    notFound: 'Kayıt bulunamadı.',
    unauthorized: 'Yetkilendirme hatası.',
    validation: 'Girilen verileri kontrol ediniz.',
    uploadFailed: 'Yükleme başarısız.',
    analysisFailed: 'Değerlendirme tamamlanamadı.',
    saveFailed: 'Kaydetme başarısız.',
    tryAgain: 'Tekrar dene',
  },

  success: {
    saved: 'Kaydedildi',
    deleted: 'Silindi',
    updated: 'Güncellendi',
    shared: 'Paylaşıldı',
    exported: 'Dışa aktarıldı',
    analysisComplete: 'Değerlendirme tamamlandı',
    profileCreated: 'Danışan dosyası oluşturuldu',
    settingsUpdated: 'Ayarlar güncellendi',
  },

  confirmations: {
    delete: 'Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?',
    discard: 'Kaydedilmemiş değişiklikler kaybolacak. Devam edilsin mi?',
    logout: 'Oturumu kapatmak istiyor musunuz?',
    removeProfile: 'Bu danışan dosyasını silmek istediğinize emin misiniz?',
    clearHistory: 'Tüm geçmişi temizlemek istiyor musunuz? Bu işlem geri alınamaz.',
  },

  studio: {
    title: 'Materyal Oluştur',
    subtitle: 'Klinik ve eğitim materyalleri',
    storyMode: 'Terapötik Hikaye',
    storyModeDesc: 'Kişiselleştirilmiş terapötik içerik',
    coloringMode: 'Çalışma Materyali',
    coloringModeDesc: 'Yazdırılabilir çalışma sayfası',
    generating: 'Oluşturuluyor...',
    ready: 'Hazır',
  },

  reports: {
    title: 'Raporlar',
    generate: 'Rapor Oluştur',
    generating: 'Rapor hazırlanıyor...',
    download: 'İndir',
    share: 'Paylaş',
    pdfReport: 'PDF Rapor',
    clinicalReport: 'Klinik Rapor',
    progressReport: 'İlerleme Raporu',
  },

  onboarding: {
    welcome: 'Hoş Geldiniz',
    welcomeDesc: 'Profesyonel değerlendirme araçlarına erişin',
    selectRole: 'Kullanıcı Türü',
    selectRoleDesc: 'Profesyonel profilinizi seçin',
    setupProfile: 'Profil Ayarları',
    setupProfileDesc: 'Hesap bilgilerinizi tamamlayın',
    ready: 'Kurulum Tamamlandı',
    readyDesc: 'Değerlendirmelere başlayabilirsiniz',
  },

  gamification: {
    level: 'Seviye',
    xp: 'Puan',
    streak: 'Seri',
    badge: 'Rozet',
    newBadge: 'Yeni Rozet',
    achievement: 'Başarı',
    progress: 'İlerleme',
  },

  professional: {
    client: 'Danışan',
    clients: 'Danışanlar',
    student: 'Öğrenci',
    students: 'Öğrenciler',
    assessment: 'Değerlendirme',
    evaluation: 'Klinik Değerlendirme',
    normReference: 'Norm Referansı',
    percentile: 'Percentile',
    zScore: 'Z-Skoru',
    clinicalNotes: 'Klinik Notlar',
    batchAnalysis: 'Toplu Değerlendirme',
    compareResults: 'Karşılaştırmalı Analiz',
  },
};

// ============================================================================
// COPYWRITING MAP
// ============================================================================

const COPYWRITING_MAP: Record<UserRole, CopywritingTexts> = {
  parent: PARENT_COPY,
  teacher: TEACHER_COPY,
  expert: EXPERT_COPY,
};

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class CopywritingService {
  private role: UserRole;
  private texts: CopywritingTexts;

  constructor(role: UserRole = 'parent') {
    this.role = role;
    this.texts = COPYWRITING_MAP[role];
  }

  /**
   * Get all texts for current role
   */
  getTexts(): CopywritingTexts {
    return this.texts;
  }

  /**
   * Get specific text category
   */
  get<K extends keyof CopywritingTexts>(category: K): CopywritingTexts[K] {
    return this.texts[category];
  }

  /**
   * Format text with optional emoji (respects role settings)
   */
  format(text: string, options?: { emoji?: string; prefix?: string; suffix?: string }): string {
    let result = text;

    // Only add emoji for parents
    if (options?.emoji && this.role === 'parent') {
      result = `${options.emoji} ${result}`;
    }

    if (options?.prefix) {
      result = `${options.prefix}${result}`;
    }

    if (options?.suffix) {
      result = `${result}${options.suffix}`;
    }

    return result;
  }

  /**
   * Get text with role-appropriate greeting
   */
  greet(name?: string): string {
    const greeting = this.texts.dashboard.welcomeBack;
    if (name && this.role === 'parent') {
      return `${greeting}, ${name}!`;
    }
    if (name) {
      return `${greeting}, ${name}`;
    }
    return greeting;
  }

  /**
   * Get role-specific placeholder for subject (child/student/client)
   */
  getSubjectLabel(plural = false): string {
    return plural ? this.texts.subjects.plural : this.texts.subjects.singular;
  }

  /**
   * Check if emoji should be shown for current role
   */
  shouldShowEmoji(): boolean {
    return this.role === 'parent';
  }

  /**
   * Get formality level
   */
  getFormality(): 'informal' | 'neutral' | 'formal' {
    switch (this.role) {
      case 'parent':
        return 'informal';
      case 'teacher':
        return 'neutral';
      case 'expert':
        return 'formal';
    }
  }

  /**
   * Update role and refresh texts
   */
  setRole(role: UserRole): void {
    this.role = role;
    this.texts = COPYWRITING_MAP[role];
  }

  /**
   * Get current role
   */
  getRole(): UserRole {
    return this.role;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

let serviceInstance: CopywritingService | null = null;

export function getCopywritingService(role?: UserRole): CopywritingService {
  if (!serviceInstance) {
    serviceInstance = new CopywritingService(role);
  } else if (role && serviceInstance.getRole() !== role) {
    serviceInstance.setRole(role);
  }
  return serviceInstance;
}

export function getCopyForRole(role: UserRole): CopywritingTexts {
  return COPYWRITING_MAP[role];
}

export default CopywritingService;
