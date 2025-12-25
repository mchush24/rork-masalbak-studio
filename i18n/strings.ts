export type Language = "tr" | "en" | "de" | "ru";

export type TranslationKeys = {
  // Common
  common: {
    welcome: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    success: string;
    error: string;
    loading: string;
  };

  // Profile
  profile: {
    title: string;
    editProfile: string;
    name: string;
    email: string;
    language: string;
    theme: string;
    logout: string;
    logoutConfirm: string;
    children: string;
    addChild: string;
    childName: string;
    childAge: string;
    removeChild: string;
    stats: string;
    stories: string;
    colorings: string;
    analyses: string;
  };

  // Settings
  settings: {
    title: string;
    general: string;
    notifications: string;
    privacy: string;
    theme: string;
    language: string;
    subscription: string;
    help: string;
    notificationsEnabled: string;
    emailNotifications: string;
    pushNotifications: string;
    dataSharingConsent: string;
    profileVisibility: string;
    autoSave: string;
    showTips: string;
    childLock: string;
  };

  // Home
  home: {
    title: string;
    subtitle: string;
    quickAnalysis: string;
    quickAnalysisDesc: string;
    dreamWorkshop: string;
    dreamWorkshopDesc: string;
    advancedAnalysis: string;
    advancedAnalysisDesc: string;
    recentActivity: string;
    viewAll: string;
    noActivity: string;
    welcome: string;
    getStarted: string;
  };

  // History
  history: {
    title: string;
    all: string;
    stories: string;
    colorings: string;
    analyses: string;
    empty: string;
    emptyDesc: string;
    createFirst: string;
    deleteConfirm: string;
    deleteSuccess: string;
    favorite: string;
    unfavorite: string;
    share: string;
    delete: string;
  };

  // Studio (Dream Workshop)
  studio: {
    title: string;
    subtitle: string;
    selectImage: string;
    selectImageDesc: string;
    takePhoto: string;
    fromGallery: string;
    storyMode: string;
    storyModeDesc: string;
    coloringMode: string;
    coloringModeDesc: string;
    generate: string;
    generating: string;
    generatingStory: string;
    generatingColoring: string;
    save: string;
    saving: string;
    share: string;
    retry: string;
    selectMode: string;
    selectTheme: string;
    adventure: string;
    educational: string;
    fantasy: string;
    friendship: string;
    nature: string;
    simple: string;
    detailed: string;
    educational_style: string;
    // Coloring Studio specific
    defaultTitle: string;
    selectImageFirst: string;
    pdfReady: string;
    pdfReadyDesc: string;
    cancel: string;
    shareMessage: string;
    selectDrawingFirst: string;
    success: string;
    coloringPageCreated: string;
    coloringPageError: string;
    unlimited: string;
    quality: string;
    aiPowered: string;
    createColoringPage: string;
    createColoringDesc: string;
    titlePlaceholder: string;
    selectedImage: string;
    selectDifferentImage: string;
    creating: string;
    generatePDF: string;
    successfullyCreated: string;
    newFeature: string;
    createInteractive: string;
    createInteractiveDesc: string;
    tryNow: string;
    howItWorks: string;
    howItWorksDesc: string;
    preservesLines: string;
    hdQuality: string;
    a4Format: string;
    fastProcessing: string;
    interactiveColoring: string;
    instructions: string;
    selectedDrawing: string;
    selectDifferentDrawing: string;
    selectDrawing: string;
    generateColoringPage: string;
    ready: string;
    startColoring: string;
    download: string;
    startColoringTitle: string;
    great: string;
    coloringSaved: string;
  };

  // Legacy (for backward compatibility)
  legacy: {
    title: string;
    pick: string;
    analyze: string;
    details: string;
    disclaimer: string;
    expertConsult: string;
    quickTip: string;
  };
};

export const strings: Record<Language, TranslationKeys> = {
  tr: {
    common: {
      welcome: 'Hoş Geldiniz',
      save: 'Kaydet',
      cancel: 'İptal',
      delete: 'Sil',
      edit: 'Düzenle',
      add: 'Ekle',
      success: 'Başarılı',
      error: 'Hata',
      loading: 'Yükleniyor...',
    },
    profile: {
      title: 'Profil',
      editProfile: 'Profili Düzenle',
      name: 'İsim',
      email: 'E-posta',
      language: 'Dil',
      theme: 'Tema',
      logout: 'Çıkış Yap',
      logoutConfirm: 'Hesabınızdan çıkmak istediğinize emin misiniz?',
      children: 'Çocuk Profilleri',
      addChild: 'Çocuk Profili Ekle',
      childName: 'Çocuğun Adı',
      childAge: 'Yaş',
      removeChild: 'Çocuk Profilini Sil',
      stats: 'İstatistikler',
      stories: 'Masal',
      colorings: 'Boyama',
      analyses: 'Analiz',
    },
    settings: {
      title: 'Ayarlar',
      general: 'Genel Ayarlar',
      notifications: 'Bildirimler',
      privacy: 'Gizlilik ve Güvenlik',
      theme: 'Tema',
      language: 'Dil',
      subscription: 'Abonelik',
      help: 'Yardım Merkezi',
      notificationsEnabled: 'Tüm Bildirimler',
      emailNotifications: 'E-posta Bildirimleri',
      pushNotifications: 'Push Bildirimleri',
      dataSharingConsent: 'Veri Paylaşım İzni',
      profileVisibility: 'Profil Görünürlüğü',
      autoSave: 'Otomatik Kaydet',
      showTips: 'İpuçlarını Göster',
      childLock: 'Çocuk Kilidi',
    },
    home: {
      title: 'Renkioo',
      subtitle: 'Çocukların renkli hayal dünyası',
      quickAnalysis: 'Hızlı Analiz',
      quickAnalysisDesc: 'Çocuğunuzun çizimini anında analiz edin',
      dreamWorkshop: 'Hayal Atölyesi',
      dreamWorkshopDesc: 'Çizimden masal ve boyama sayfası oluşturun',
      advancedAnalysis: 'Detaylı Analiz',
      advancedAnalysisDesc: 'Uzman destekli kapsamlı analiz',
      recentActivity: 'Son Aktiviteler',
      viewAll: 'Tümünü Gör',
      noActivity: 'Henüz aktivite yok',
      welcome: 'Hoş Geldiniz',
      getStarted: 'Başlayalım',
    },
    history: {
      title: 'Geçmiş',
      all: 'Tümü',
      stories: 'Masallar',
      colorings: 'Boyamalar',
      analyses: 'Analizler',
      empty: 'Henüz içerik yok',
      emptyDesc: 'İlk içeriğinizi oluşturmak için başlayın',
      createFirst: 'İlk İçeriğinizi Oluşturun',
      deleteConfirm: 'Silmek istediğinize emin misiniz?',
      deleteSuccess: 'Başarıyla silindi',
      favorite: 'Favorilere Ekle',
      unfavorite: 'Favorilerden Çıkar',
      share: 'Paylaş',
      delete: 'Sil',
    },
    studio: {
      title: 'Boyama Stüdyosu',
      subtitle: 'Çizimlerden sihirli boyama sayfaları ✨',
      selectImage: 'Görsel Seç',
      selectImageDesc: 'Fotoğraf çek veya galeriden seç',
      takePhoto: 'Fotoğraf Çek',
      fromGallery: 'Galeriden Seç',
      storyMode: 'Masal Modu',
      storyModeDesc: 'Çizimden özel bir masal oluştur',
      coloringMode: 'Boyama Modu',
      coloringModeDesc: 'Boyama sayfası oluştur',
      generate: 'Oluştur',
      generating: 'Oluşturuluyor...',
      generatingStory: 'Masal oluşturuluyor...',
      generatingColoring: 'Boyama sayfası oluşturuluyor...',
      save: 'Kaydet',
      saving: 'Kaydediliyor...',
      share: 'Paylaş',
      retry: 'Tekrar Dene',
      selectMode: 'Mod Seçin',
      selectTheme: 'Tema Seçin',
      adventure: 'Macera',
      educational: 'Eğitici',
      fantasy: 'Fantezi',
      friendship: 'Arkadaşlık',
      nature: 'Doğa',
      simple: 'Basit',
      detailed: 'Detaylı',
      educational_style: 'Eğitici',
      // Coloring Studio specific
      defaultTitle: 'Benim Boyama Sayfam',
      selectImageFirst: 'Lütfen önce bir çizim seç.',
      pdfReady: '🎉 Boyama PDF Hazır!',
      pdfReadyDesc: 'PDF başarıyla oluşturuldu. Şimdi paylaşabilir veya indirebilirsiniz.',
      cancel: 'Vazgeç',
      shareMessage: 'Renkioo Boyama PDF:',
      selectDrawingFirst: 'Lütfen önce bir çizim seç.',
      success: '✨ Başarılı!',
      coloringPageCreated: 'Boyama sayfası oluşturuldu! Şimdi indirebilir veya uygulamada boyayabilirsiniz.',
      coloringPageError: 'Boyama sayfası oluşturulamadı. Lütfen tekrar deneyin.',
      unlimited: 'Sınırsız',
      quality: 'Kalite',
      aiPowered: 'Yapay Zeka Destekli',
      createColoringPage: '🖨️ PDF Boyama Sayfası (Yazdırılabilir)',
      createColoringDesc: 'Çizimden PDF boyama sayfası oluştur - Yazdır ve boya',
      titlePlaceholder: 'Başlık (ör: Benim Boyama Sayfam)',
      selectedImage: 'Seçilen Görsel',
      selectDifferentImage: 'Farklı Görsel Seç',
      creating: 'Oluşturuluyor...',
      generatePDF: 'PDF Oluştur ve İndir',
      successfullyCreated: '✓ Başarıyla Oluşturuldu',
      newFeature: 'YENİ ÖZELLIK',
      createInteractive: '🎨 İnteraktif Boyama - PDF + Dijital',
      createInteractiveDesc: 'Hem PDF indir hem de uygulamada dijital olarak boya! AI ile güçlendirilmiş boyama deneyimi.',
      tryNow: 'Hemen Dene',
      howItWorks: 'Nasıl Çalışır?',
      howItWorksDesc: 'Çizimi seçin, yapay zeka otomatik olarak arka planı temizler ve profesyonel boyama sayfası oluşturur.',
      preservesLines: 'Çizgiyi Korur',
      hdQuality: 'HD Kalite',
      a4Format: 'A4 Format',
      fastProcessing: 'Hızlı İşlem',
      interactiveColoring: 'İnteraktif Boyama Faaliyeti',
      instructions: '1. Çocuğunuzun çizimini seçin\n2. AI, çizimi analiz edip yeni bir boyama sayfası oluşturur\n3. İndirebilir veya uygulamada boyayabilirsiniz!',
      selectedDrawing: 'Seçilen Çizim',
      selectDifferentDrawing: 'Farklı Çizim Seç',
      selectDrawing: 'Çizim Seç',
      generateColoringPage: 'Boyama Sayfası Oluştur',
      ready: '✨ Hazır!',
      startColoring: 'Boyamaya Başla',
      download: 'İndir',
      startColoringTitle: 'Boyamaya Başla! 🎨',
      great: '✨ Harika!',
      coloringSaved: 'Boyanmış sayfanız kaydedildi!',
    },
    legacy: {
      title: 'Çocuk Çizimi Analizi',
      pick: 'Görsel Seç / Çek',
      analyze: 'Analiz Et',
      details: 'Detayları Gör',
      disclaimer: 'Bu içerik eğitsel amaçlıdır; klinik teşhis yerine geçmez. Güvenlik şüphesi varsa okul PDR birimine danışın.',
      expertConsult: 'Uzmana Danış',
      quickTip: 'Hızlı İpucu',
    },
  },
  en: {
    common: {
      welcome: 'Welcome',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      success: 'Success',
      error: 'Error',
      loading: 'Loading...',
    },
    profile: {
      title: 'Profile',
      editProfile: 'Edit Profile',
      name: 'Name',
      email: 'Email',
      language: 'Language',
      theme: 'Theme',
      logout: 'Logout',
      logoutConfirm: 'Are you sure you want to logout?',
      children: 'Children Profiles',
      addChild: 'Add Child Profile',
      childName: 'Child Name',
      childAge: 'Age',
      removeChild: 'Remove Child Profile',
      stats: 'Statistics',
      stories: 'Stories',
      colorings: 'Colorings',
      analyses: 'Analyses',
    },
    settings: {
      title: 'Settings',
      general: 'General Settings',
      notifications: 'Notifications',
      privacy: 'Privacy & Security',
      theme: 'Theme',
      language: 'Language',
      subscription: 'Subscription',
      help: 'Help Center',
      notificationsEnabled: 'All Notifications',
      emailNotifications: 'Email Notifications',
      pushNotifications: 'Push Notifications',
      dataSharingConsent: 'Data Sharing Consent',
      profileVisibility: 'Profile Visibility',
      autoSave: 'Auto Save',
      showTips: 'Show Tips',
      childLock: 'Child Lock',
    },
    home: {
      title: 'Renkioo',
      subtitle: 'Children\'s colorful world of imagination',
      quickAnalysis: 'Quick Analysis',
      quickAnalysisDesc: 'Instantly analyze your child\'s drawing',
      dreamWorkshop: 'Dream Workshop',
      dreamWorkshopDesc: 'Create stories and coloring pages from drawings',
      advancedAnalysis: 'Advanced Analysis',
      advancedAnalysisDesc: 'Expert-backed comprehensive analysis',
      recentActivity: 'Recent Activity',
      viewAll: 'View All',
      noActivity: 'No activity yet',
      welcome: 'Welcome',
      getStarted: 'Get Started',
    },
    history: {
      title: 'History',
      all: 'All',
      stories: 'Stories',
      colorings: 'Colorings',
      analyses: 'Analyses',
      empty: 'No content yet',
      emptyDesc: 'Start creating your first content',
      createFirst: 'Create Your First Content',
      deleteConfirm: 'Are you sure you want to delete?',
      deleteSuccess: 'Successfully deleted',
      favorite: 'Add to Favorites',
      unfavorite: 'Remove from Favorites',
      share: 'Share',
      delete: 'Delete',
    },
    studio: {
      title: 'Coloring Studio',
      subtitle: 'Magical coloring pages from drawings ✨',
      selectImage: 'Select Image',
      selectImageDesc: 'Take photo or choose from gallery',
      takePhoto: 'Take Photo',
      fromGallery: 'From Gallery',
      storyMode: 'Story Mode',
      storyModeDesc: 'Create a unique story from drawing',
      coloringMode: 'Coloring Mode',
      coloringModeDesc: 'Create coloring page',
      generate: 'Generate',
      generating: 'Generating...',
      generatingStory: 'Generating story...',
      generatingColoring: 'Generating coloring page...',
      save: 'Save',
      saving: 'Saving...',
      share: 'Share',
      retry: 'Try Again',
      selectMode: 'Select Mode',
      selectTheme: 'Select Theme',
      adventure: 'Adventure',
      educational: 'Educational',
      fantasy: 'Fantasy',
      friendship: 'Friendship',
      nature: 'Nature',
      simple: 'Simple',
      detailed: 'Detailed',
      educational_style: 'Educational',
      // Coloring Studio specific
      defaultTitle: 'My Coloring Page',
      selectImageFirst: 'Please select a drawing first.',
      pdfReady: '🎉 Coloring PDF Ready!',
      pdfReadyDesc: 'PDF created successfully. You can now share or download it.',
      cancel: 'Cancel',
      shareMessage: 'Renkioo Coloring PDF:',
      selectDrawingFirst: 'Please select a drawing first.',
      success: '✨ Success!',
      coloringPageCreated: 'Coloring page created! You can now download it or color it in the app.',
      coloringPageError: 'Could not create coloring page. Please try again.',
      unlimited: 'Unlimited',
      quality: 'Quality',
      aiPowered: 'AI Powered',
      createColoringPage: '🖨️ PDF Coloring Page (Printable)',
      createColoringDesc: 'Create PDF coloring page from drawing - Print and color',
      titlePlaceholder: 'Title (e.g. My Coloring Page)',
      selectedImage: 'Selected Image',
      selectDifferentImage: 'Select Different Image',
      creating: 'Creating...',
      generatePDF: 'Create PDF and Download',
      successfullyCreated: '✓ Successfully Created',
      newFeature: 'NEW FEATURE',
      createInteractive: '🎨 Interactive Coloring - PDF + Digital',
      createInteractiveDesc: 'Download PDF and color digitally in the app! AI-powered coloring experience.',
      tryNow: 'Try Now',
      howItWorks: 'How It Works?',
      howItWorksDesc: 'Select the drawing, AI automatically cleans the background and creates a professional coloring page.',
      preservesLines: 'Preserves Lines',
      hdQuality: 'HD Quality',
      a4Format: 'A4 Format',
      fastProcessing: 'Fast Processing',
      interactiveColoring: 'Interactive Coloring Activity',
      instructions: '1. Select your child\'s drawing\n2. AI analyzes the drawing and creates a new coloring page\n3. You can download it or color it in the app!',
      selectedDrawing: 'Selected Drawing',
      selectDifferentDrawing: 'Select Different Drawing',
      selectDrawing: 'Select Drawing',
      generateColoringPage: 'Generate Coloring Page',
      ready: '✨ Ready!',
      startColoring: 'Start Coloring',
      download: 'Download',
      startColoringTitle: 'Start Coloring! 🎨',
      great: '✨ Great!',
      coloringSaved: 'Your colored page has been saved!',
    },
    legacy: {
      title: 'Child Drawing Analysis',
      pick: 'Pick / Capture',
      analyze: 'Analyze',
      details: 'See Details',
      disclaimer: 'This content is educational; not a clinical diagnosis. Consult school counselor if concerned.',
      expertConsult: 'Consult Expert',
      quickTip: 'Quick Tip',
    },
  },
  de: {
    common: {
      welcome: 'Willkommen',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      success: 'Erfolgreich',
      error: 'Fehler',
      loading: 'Laden...',
    },
    profile: {
      title: 'Profil',
      editProfile: 'Profil bearbeiten',
      name: 'Name',
      email: 'E-Mail',
      language: 'Sprache',
      theme: 'Thema',
      logout: 'Abmelden',
      logoutConfirm: 'Möchten Sie sich wirklich abmelden?',
      children: 'Kinderprofile',
      addChild: 'Kinderprofil hinzufügen',
      childName: 'Name des Kindes',
      childAge: 'Alter',
      removeChild: 'Kinderprofil entfernen',
      stats: 'Statistiken',
      stories: 'Geschichten',
      colorings: 'Ausmalbilder',
      analyses: 'Analysen',
    },
    settings: {
      title: 'Einstellungen',
      general: 'Allgemeine Einstellungen',
      notifications: 'Benachrichtigungen',
      privacy: 'Datenschutz & Sicherheit',
      theme: 'Thema',
      language: 'Sprache',
      subscription: 'Abonnement',
      help: 'Hilfe-Center',
      notificationsEnabled: 'Alle Benachrichtigungen',
      emailNotifications: 'E-Mail-Benachrichtigungen',
      pushNotifications: 'Push-Benachrichtigungen',
      dataSharingConsent: 'Datenweitergabe-Einwilligung',
      profileVisibility: 'Profil-Sichtbarkeit',
      autoSave: 'Automatisch speichern',
      showTips: 'Tipps anzeigen',
      childLock: 'Kindersicherung',
    },
    home: {
      title: 'Renkioo',
      subtitle: 'Die bunte Fantasiewelt der Kinder',
      quickAnalysis: 'Schnellanalyse',
      quickAnalysisDesc: 'Analysieren Sie die Zeichnung Ihres Kindes sofort',
      dreamWorkshop: 'Traumwerkstatt',
      dreamWorkshopDesc: 'Erstellen Sie Geschichten und Malvorlagen aus Zeichnungen',
      advancedAnalysis: 'Erweiterte Analyse',
      advancedAnalysisDesc: 'Umfassende Analyse mit Expertenunterstützung',
      recentActivity: 'Letzte Aktivitäten',
      viewAll: 'Alle anzeigen',
      noActivity: 'Noch keine Aktivität',
      welcome: 'Willkommen',
      getStarted: 'Loslegen',
    },
    history: {
      title: 'Verlauf',
      all: 'Alle',
      stories: 'Geschichten',
      colorings: 'Ausmalbilder',
      analyses: 'Analysen',
      empty: 'Noch kein Inhalt',
      emptyDesc: 'Beginnen Sie mit der Erstellung Ihres ersten Inhalts',
      createFirst: 'Erstellen Sie Ihren ersten Inhalt',
      deleteConfirm: 'Möchten Sie wirklich löschen?',
      deleteSuccess: 'Erfolgreich gelöscht',
      favorite: 'Zu Favoriten hinzufügen',
      unfavorite: 'Aus Favoriten entfernen',
      share: 'Teilen',
      delete: 'Löschen',
    },
    studio: {
      title: 'Malstudio',
      subtitle: 'Magische Malvorlagen aus Zeichnungen ✨',
      selectImage: 'Bild auswählen',
      selectImageDesc: 'Foto aufnehmen oder aus Galerie wählen',
      takePhoto: 'Foto aufnehmen',
      fromGallery: 'Aus Galerie',
      storyMode: 'Geschichtenmodus',
      storyModeDesc: 'Erstellen Sie eine einzigartige Geschichte aus der Zeichnung',
      coloringMode: 'Malmodus',
      coloringModeDesc: 'Malvorlage erstellen',
      generate: 'Erstellen',
      generating: 'Wird erstellt...',
      generatingStory: 'Geschichte wird erstellt...',
      generatingColoring: 'Malvorlage wird erstellt...',
      save: 'Speichern',
      saving: 'Wird gespeichert...',
      share: 'Teilen',
      retry: 'Erneut versuchen',
      selectMode: 'Modus auswählen',
      selectTheme: 'Thema auswählen',
      adventure: 'Abenteuer',
      educational: 'Lehrreich',
      fantasy: 'Fantasie',
      friendship: 'Freundschaft',
      nature: 'Natur',
      simple: 'Einfach',
      detailed: 'Detailliert',
      educational_style: 'Lehrreich',
      // Coloring Studio specific
      defaultTitle: 'Meine Malvorlage',
      selectImageFirst: 'Bitte wählen Sie zuerst eine Zeichnung aus.',
      pdfReady: '🎉 Mal-PDF Fertig!',
      pdfReadyDesc: 'PDF erfolgreich erstellt. Sie können es jetzt teilen oder herunterladen.',
      cancel: 'Abbrechen',
      shareMessage: 'Renkioo Mal-PDF:',
      selectDrawingFirst: 'Bitte wählen Sie zuerst eine Zeichnung aus.',
      success: '✨ Erfolgreich!',
      coloringPageCreated: 'Malvorlage erstellt! Sie können es jetzt herunterladen oder in der App ausmalen.',
      coloringPageError: 'Malvorlage konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
      unlimited: 'Unbegrenzt',
      quality: 'Qualität',
      aiPowered: 'KI-gestützt',
      createColoringPage: '🖨️ PDF Malvorlage (Druckbar)',
      createColoringDesc: 'PDF-Malvorlage aus Zeichnung erstellen - Drucken und ausmalen',
      titlePlaceholder: 'Titel (z.B. Meine Malvorlage)',
      selectedImage: 'Ausgewähltes Bild',
      selectDifferentImage: 'Anderes Bild Auswählen',
      creating: 'Wird erstellt...',
      generatePDF: 'PDF Erstellen und Herunterladen',
      successfullyCreated: '✓ Erfolgreich Erstellt',
      newFeature: 'NEUE FUNKTION',
      createInteractive: '🎨 Interaktives Ausmalen - PDF + Digital',
      createInteractiveDesc: 'PDF herunterladen und digital in der App ausmalen! KI-gestütztes Malerlebnis.',
      tryNow: 'Jetzt Ausprobieren',
      howItWorks: 'Wie Funktioniert Es?',
      howItWorksDesc: 'Wählen Sie die Zeichnung aus, KI bereinigt automatisch den Hintergrund und erstellt eine professionelle Malvorlage.',
      preservesLines: 'Erhält Linien',
      hdQuality: 'HD-Qualität',
      a4Format: 'A4-Format',
      fastProcessing: 'Schnelle Verarbeitung',
      interactiveColoring: 'Interaktive Malaktivität',
      instructions: '1. Wählen Sie die Zeichnung Ihres Kindes aus\n2. KI analysiert die Zeichnung und erstellt eine neue Malvorlage\n3. Sie können es herunterladen oder in der App ausmalen!',
      selectedDrawing: 'Ausgewählte Zeichnung',
      selectDifferentDrawing: 'Andere Zeichnung Auswählen',
      selectDrawing: 'Zeichnung Auswählen',
      generateColoringPage: 'Malvorlage Erstellen',
      ready: '✨ Bereit!',
      startColoring: 'Mit Ausmalen Beginnen',
      download: 'Herunterladen',
      startColoringTitle: 'Mit Ausmalen Beginnen! 🎨',
      great: '✨ Großartig!',
      coloringSaved: 'Ihre ausgemalte Seite wurde gespeichert!',
    },
    legacy: {
      title: 'Kinderzeichnung Analyse',
      pick: 'Auswählen / Aufnehmen',
      analyze: 'Analysieren',
      details: 'Details anzeigen',
      disclaimer: 'Dieser Inhalt ist für Bildungszwecke; keine klinische Diagnose. Wenden Sie sich bei Bedenken an den Schulberater.',
      expertConsult: 'Experten konsultieren',
      quickTip: 'Schneller Tipp',
    },
  },
  ru: {
    common: {
      welcome: 'Добро пожаловать',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Изменить',
      add: 'Добавить',
      success: 'Успешно',
      error: 'Ошибка',
      loading: 'Загрузка...',
    },
    profile: {
      title: 'Профиль',
      editProfile: 'Редактировать профиль',
      name: 'Имя',
      email: 'Электронная почта',
      language: 'Язык',
      theme: 'Тема',
      logout: 'Выход',
      logoutConfirm: 'Вы уверены, что хотите выйти?',
      children: 'Профили детей',
      addChild: 'Добавить профиль ребенка',
      childName: 'Имя ребенка',
      childAge: 'Возраст',
      removeChild: 'Удалить профиль ребенка',
      stats: 'Статистика',
      stories: 'Сказки',
      colorings: 'Раскраски',
      analyses: 'Анализы',
    },
    settings: {
      title: 'Настройки',
      general: 'Общие настройки',
      notifications: 'Уведомления',
      privacy: 'Конфиденциальность и безопасность',
      theme: 'Тема',
      language: 'Язык',
      subscription: 'Подписка',
      help: 'Центр помощи',
      notificationsEnabled: 'Все уведомления',
      emailNotifications: 'Уведомления по email',
      pushNotifications: 'Push-уведомления',
      dataSharingConsent: 'Согласие на передачу данных',
      profileVisibility: 'Видимость профиля',
      autoSave: 'Автосохранение',
      showTips: 'Показывать подсказки',
      childLock: 'Детская блокировка',
    },
    home: {
      title: 'Renkioo',
      subtitle: 'Красочный мир детского воображения',
      quickAnalysis: 'Быстрый анализ',
      quickAnalysisDesc: 'Мгновенно проанализируйте рисунок вашего ребенка',
      dreamWorkshop: 'Мастерская мечты',
      dreamWorkshopDesc: 'Создавайте сказки и раскраски из рисунков',
      advancedAnalysis: 'Расширенный анализ',
      advancedAnalysisDesc: 'Всесторонний анализ с поддержкой экспертов',
      recentActivity: 'Последняя активность',
      viewAll: 'Показать все',
      noActivity: 'Пока нет активности',
      welcome: 'Добро пожаловать',
      getStarted: 'Начать',
    },
    history: {
      title: 'История',
      all: 'Все',
      stories: 'Сказки',
      colorings: 'Раскраски',
      analyses: 'Анализы',
      empty: 'Пока нет контента',
      emptyDesc: 'Начните создавать свой первый контент',
      createFirst: 'Создайте свой первый контент',
      deleteConfirm: 'Вы уверены, что хотите удалить?',
      deleteSuccess: 'Успешно удалено',
      favorite: 'Добавить в избранное',
      unfavorite: 'Удалить из избранного',
      share: 'Поделиться',
      delete: 'Удалить',
    },
    studio: {
      title: 'Студия раскрасок',
      subtitle: 'Волшебные раскраски из рисунков ✨',
      selectImage: 'Выбрать изображение',
      selectImageDesc: 'Сделать фото или выбрать из галереи',
      takePhoto: 'Сделать фото',
      fromGallery: 'Из галереи',
      storyMode: 'Режим сказки',
      storyModeDesc: 'Создайте уникальную сказку из рисунка',
      coloringMode: 'Режим раскраски',
      coloringModeDesc: 'Создать раскраску',
      generate: 'Создать',
      generating: 'Создание...',
      generatingStory: 'Создание сказки...',
      generatingColoring: 'Создание раскраски...',
      save: 'Сохранить',
      saving: 'Сохранение...',
      share: 'Поделиться',
      retry: 'Попробовать снова',
      selectMode: 'Выберите режим',
      selectTheme: 'Выберите тему',
      adventure: 'Приключение',
      educational: 'Образовательный',
      fantasy: 'Фантазия',
      friendship: 'Дружба',
      nature: 'Природа',
      simple: 'Простой',
      detailed: 'Детальный',
      educational_style: 'Образовательный',
      // Coloring Studio specific
      defaultTitle: 'Моя раскраска',
      selectImageFirst: 'Пожалуйста, сначала выберите рисунок.',
      pdfReady: '🎉 PDF раскраска готова!',
      pdfReadyDesc: 'PDF успешно создан. Теперь вы можете поделиться или скачать его.',
      cancel: 'Отмена',
      shareMessage: 'Renkioo PDF раскраска:',
      selectDrawingFirst: 'Пожалуйста, сначала выберите рисунок.',
      success: '✨ Успешно!',
      coloringPageCreated: 'Раскраска создана! Теперь вы можете скачать её или раскрасить в приложении.',
      coloringPageError: 'Не удалось создать раскраску. Пожалуйста, попробуйте снова.',
      unlimited: 'Неограниченно',
      quality: 'Качество',
      aiPowered: 'На базе ИИ',
      createColoringPage: '🖨️ PDF раскраска (для печати)',
      createColoringDesc: 'Создать PDF раскраску из рисунка - Печать и раскрашивание',
      titlePlaceholder: 'Название (например, Моя раскраска)',
      selectedImage: 'Выбранное изображение',
      selectDifferentImage: 'Выбрать другое изображение',
      creating: 'Создание...',
      generatePDF: 'Создать PDF и скачать',
      successfullyCreated: '✓ Успешно создано',
      newFeature: 'НОВАЯ ФУНКЦИЯ',
      createInteractive: '🎨 Интерактивная раскраска - PDF + Цифровая',
      createInteractiveDesc: 'Скачайте PDF и раскрашивайте цифровым способом в приложении! Раскраска на базе ИИ.',
      tryNow: 'Попробовать сейчас',
      howItWorks: 'Как это работает?',
      howItWorksDesc: 'Выберите рисунок, ИИ автоматически очистит фон и создаст профессиональную раскраску.',
      preservesLines: 'Сохраняет линии',
      hdQuality: 'HD качество',
      a4Format: 'Формат A4',
      fastProcessing: 'Быстрая обработка',
      interactiveColoring: 'Интерактивная раскраска',
      instructions: '1. Выберите рисунок вашего ребенка\n2. ИИ анализирует рисунок и создает новую раскраску\n3. Вы можете скачать её или раскрасить в приложении!',
      selectedDrawing: 'Выбранный рисунок',
      selectDifferentDrawing: 'Выбрать другой рисунок',
      selectDrawing: 'Выбрать рисунок',
      generateColoringPage: 'Создать раскраску',
      ready: '✨ Готово!',
      startColoring: 'Начать раскрашивать',
      download: 'Скачать',
      startColoringTitle: 'Начать раскрашивать! 🎨',
      great: '✨ Отлично!',
      coloringSaved: 'Ваша раскрашенная страница сохранена!',
    },
    legacy: {
      title: 'Анализ детского рисунка',
      pick: 'Выбрать / Сфотографировать',
      analyze: 'Анализировать',
      details: 'Показать детали',
      disclaimer: 'Этот контент является образовательным; не является клиническим диагнозом. При сомнениях обратитесь к школьному консультанту.',
      expertConsult: 'Консультация специалиста',
      quickTip: 'Быстрый совет',
    },
  },
};
