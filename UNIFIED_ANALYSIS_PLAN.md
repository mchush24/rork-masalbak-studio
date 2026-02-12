# Unified Analysis Screen - Implementation Checklist

> Quick + Advanced analiz ekranlarini tek ekranda birlestirme plani
> Tarih: 2026-02-12

---

## FASE 0: Hazirlik & Arastirma [TAMAMLANDI]

- [x] Mevcut quick-analysis.tsx analiz edildi (1,139 satir)
- [x] Mevcut advanced-analysis.tsx analiz edildi (2,056 satir)
- [x] Backend analyze-drawing.ts analiz edildi (672 satir)
- [x] protocols.ts analiz edildi (850 satir)
- [x] Rakip arastirmasi yapildi (crAion, ChildArtLab, Kidzo, vb.)
- [x] UX best practices arastirildi (progressive disclosure, tiered assessment)
- [x] Etik ve klinik kilavuzlar incelendi (APA 2025)
- [x] Navigasyon entry point'leri tespit edildi (10 dosya)
- [x] Shared component prop'lari dokumante edildi

---

## FASE 1: Test Config Extract [~15 dk]

### 1.1 test-config.ts olustur

- [ ] `constants/test-config.ts` dosyasi olustur
- [ ] `TestConfigItem` interface'ini tanimla (icon, gradient, description, duration, difficulty, ageRange, imageCount)
- [ ] `TEST_CONFIG` Record<TaskType, TestConfigItem> export et (advanced-analysis.tsx:122-204'ten)
- [ ] `TASK_TYPES` array'ini export et (advanced-analysis.tsx:207-217'den)
- [ ] TaskType import'unu `@/types/AssessmentSchema`'dan al

### 1.2 Dogrulama

- [ ] TypeScript hata kontrolu yap
- [ ] 9 test tipinin hepsinin dogru tanimlandigini dogrula

---

## FASE 2: Birlesiik Ekran Iskeleti [~30 dk]

### 2.1 Dosya olusturma

- [ ] `app/(tabs)/analysis.tsx` olustur

### 2.2 Import'lar

- [ ] React + React Native import'lari (useState, useRef, useEffect, useReducer, Platform, Alert, Animated, ScrollView, View, Text, Pressable, TextInput, Dimensions, Share, Linking)
- [ ] Expo import'lari (LinearGradient, Image, Haptics)
- [ ] Lucide icon import'lari (Brain, Camera, ImageIcon, Sparkles, X, Zap, Lightbulb, ChevronRight, ChevronDown, Info, CheckCircle, Shield, Star, FileText, AlertTriangle, Share2, MessageCircle)
- [ ] Uygulama import'lari:
  - [ ] `@/constants/colors` (Colors)
  - [ ] `@/constants/design-system` (layout, typography, spacing, radius, shadows, iconSizes, iconStroke)
  - [ ] `@/constants/test-config` (TEST_CONFIG, TASK_TYPES) [YENI]
  - [ ] `@/constants/protocols` (PROTOCOLS)
  - [ ] `@/lib/theme/ThemeProvider` (useTheme)
  - [ ] `@/lib/trpc` (trpc)
  - [ ] `@/lib/hooks/useAuth` (useAuth)
  - [ ] `@/lib/hooks/useFirstTimeUser` (useFirstTimeUser)
  - [ ] `@/lib/hooks/useAgeCollection` (useAgeCollection)
  - [ ] `@/lib/contexts/ChildContext` (useChild)
  - [ ] `@/hooks/useQuota` (useQuota)
  - [ ] `@/components/ui/Toast` (useToastHelpers)
  - [ ] `@/services/imagePick` (pickFromLibrary, captureWithCamera)
  - [ ] `@/utils/imagePreprocess` (preprocessImage)
  - [ ] `@/services/abTest` (buildShareText)
  - [ ] `@/i18n/strings` (strings)
  - [ ] `@/types/AssessmentSchema` (TaskType)
  - [ ] Mevcut bilesenler:
    - [ ] `@/components/analysis/AnalysisStepper` (AnalysisStepper, AnalysisStep)
    - [ ] `@/components/analysis/AnalysisLoadingOverlay` (AnalysisLoadingOverlay)
    - [ ] `@/components/FirstTimeWelcomeModal` (FirstTimeWelcomeModal)
    - [ ] `@/components/AgePickerModal` (AgePickerModal)
    - [ ] `@/components/quota/QuotaExceededModal` (QuotaExceededModal)
  - [ ] expo-router (useRouter, Href)
  - [ ] react-native-safe-area-context (useSafeAreaInsets)
  - [ ] expo-file-system/legacy (FileSystem) — platform: native only

### 2.3 Type tanimlari

- [ ] `BackendAnalysisResult` interface (insights, homeTips, riskFlags, disclaimer, meta, conversationGuide, professionalGuidance, traumaAssessment, trendNote)
- [ ] `AnalysisInsight` interface (title, summary, evidence[], strength)
- [ ] `HomeTip` interface (title, steps[], why)
- [ ] `RiskFlag` interface (type, summary, action)
- [ ] `AnalysisState` interface (tum state alanlari)
- [ ] `AnalysisAction` union type (tum action'lar)

### 2.4 Reducer

- [ ] `analysisReducer` fonksiyonu
- [ ] `initialState` tanimla
- [ ] Action handler'lari:
  - [ ] `TOGGLE_ADVANCED` — advancedExpanded toggle
  - [ ] `SET_TEST_TYPE` — testType degistir + imageUris sifirla + sonuclari sifirla
  - [ ] `SET_AGE` — childAge guncelle
  - [ ] `SET_QUOTE` — childQuote guncelle
  - [ ] `SET_IMAGE` — imageUris'e ekle
  - [ ] `CLEAR_IMAGE` — imageUris'den sil
  - [ ] `START_ANALYSIS` — step='analyzing', error=null
  - [ ] `ANALYSIS_SUCCESS` — step='results', analysisResult set, resultLayer=1
  - [ ] `ANALYSIS_ERROR` — error set, retryCount artir
  - [ ] `SET_RESULT_LAYER` — resultLayer guncelle (1/2/3)
  - [ ] `OPEN_PROTOCOL_SHEET` — protocolSheetTask set, showProtocolSheet=true
  - [ ] `CLOSE_PROTOCOL_SHEET` — showProtocolSheet=false
  - [ ] `RESET` — initialState'e don (testType ve childAge koru)

### 2.5 Ana bilesen iskeleti

- [ ] `export default function AnalysisScreen()` fonksiyonu
- [ ] Hook'lari bagla (useReducer, useRouter, useTheme, useSafeAreaInsets, useChild, useAuth, useFirstTimeUser, useAgeCollection, useQuota, useToastHelpers)
- [ ] tRPC mutation'lari tanimla (analyzeDrawing, saveAnalysis)
- [ ] Hesaplanmis degerler:
  - [ ] `currentStep` (state.step'ten AnalysisStep)
  - [ ] `requiredImages` (PROTOCOLS[state.testType].requiredImages)
  - [ ] `hasRequiredImages` (gerekli gosellerinin yuklenmis olup olmadigi)
  - [ ] `uploadedCount` / `requiredCount`
- [ ] Temel JSX yapisi: View > (Loading || LinearGradient > ScrollView)

---

## FASE 3: Gorsel Giris Bolumu [~45 dk]

### 3.1 Quick mode gorsel secimi

- [ ] "Galeriden Sec" butonu — `pickFromLibrary()` cagirir
- [ ] "Fotograf Cek" butonu — `captureWithCamera()` cagirir
- [ ] Gorsel secildiginde `dispatch({ type: 'SET_IMAGE', slotId: 'main', uri })` cagirir
- [ ] Platform check: web'de Haptics CAGIRMA

### 3.2 Gorsel onizleme

- [ ] Secilen gorseli goster (Image + 4:3 aspect ratio)
- [ ] Gorsel silme butonu (X icon, kirmizi daire)
- [ ] Silince: `dispatch({ type: 'CLEAR_IMAGE', slotId: 'main' })`

### 3.3 Multi-image grid (advanced mode)

- [ ] `advancedExpanded && testType !== 'DAP'` durumunda gorsel slotlari goster
- [ ] Her slot icin: numara, etiket (label), zorunlu/opsiyonel badge
- [ ] Her slot icin: description (varsa)
- [ ] Her slot icin: galeri/kamera butonlari veya gorsel preview
- [ ] Upload progress gostergesi (uploadedCount/requiredCount)
- [ ] Luscher icin ozel durum: "Gorsel Gerekmiyor" karti

### 3.4 convertToBase64 fonksiyonu

- [ ] `preprocessImage(uri)` cagir
- [ ] Web: fetch → blob → FileReader → base64
- [ ] Native: FileSystem.readAsStringAsync(uri, { encoding: 'base64' })
- [ ] data:image prefix'i temizle

---

## FASE 4: Advanced Mode Toggle [~45 dk]

### 4.1 Toggle butonu

- [ ] "Detayli Test Sec" satirini olustur
- [ ] ChevronDown/ChevronUp icon (advancedExpanded durumuna gore)
- [ ] Dokunuldiginda `dispatch({ type: 'TOGGLE_ADVANCED' })`
- [ ] Animated height transition (opsiyonel — basit display toggle ile baslayabilir)

### 4.2 Test carousel

- [ ] Yatay ScrollView (`horizontal`, `showsHorizontalScrollIndicator={false}`)
- [ ] 9 test karti: icon, isim, aciklama, sure, zorluk badge'leri
- [ ] Aktif kart vurgusu (gradient arka plan, check icon)
- [ ] Dokunuldiginda `dispatch({ type: 'SET_TEST_TYPE', testType: t })`

### 4.3 Secili test bilgi karti

- [ ] Gradient arka plan (testin renginde)
- [ ] Icon + baslik + yas araligi + sure
- [ ] "Protokol" butonu → `dispatch({ type: 'OPEN_PROTOCOL_SHEET', task })`
- [ ] Ilk faz instruction'i (italik)

### 4.4 Cocuk bilgileri

- [ ] Yas inputu — `useChild().selectedChild?.age` ile otomatik doldur, varsayilan 7
- [ ] Yas TextInput (number-pad, 2 karakter max)
- [ ] "Cocugun Sozleri" TextInput (multiline, opsiyonel)

---

## FASE 5: Analiz Calistirma [~45 dk]

### 5.1 Analiz butonu

- [ ] `hasRequiredImages` durumuna gore aktif/pasif
- [ ] Buton metni: aktif ise "Analiz Et" / pasif ise "X gorsel daha yukle"
- [ ] Sparkles icon
- [ ] Dokunuldiginda `handleAnalysis()` cagir

### 5.2 handleAnalysis fonksiyonu

- [ ] Kota uyarisi kontrolu (`shouldShowLowWarning()`)
- [ ] `dispatch({ type: 'START_ANALYSIS' })`
- [ ] Gorselleri base64'e cevir (tek veya coklu)
- [ ] `analyzeMutation.mutateAsync(...)` cagir:
  - [ ] Quick mode: `{ taskType: 'DAP', childAge, imageBase64, language: 'tr', userRole: 'parent', featuresJson: {} }`
  - [ ] Advanced mode: `{ taskType, childAge, images: [...], language: 'tr', userRole: 'parent', featuresJson: {} }`
- [ ] Basari: `dispatch({ type: 'ANALYSIS_SUCCESS', result })`
- [ ] Basari: DB'ye kaydet (`saveAnalysisMutation.mutateAsync(...)`)
- [ ] Basari: Haptics.notificationAsync (platform check)
- [ ] Hata — kota asimi: `showQuotaModal(true)`
- [ ] Hata — genel: `dispatch({ type: 'ANALYSIS_ERROR', error, retryCount })`
- [ ] Hata — retry: retryCount < 3 ise 2s/4s/6s sonra tekrar dene
- [ ] Hata — 3 retry sonrasi: Alert.alert (platform check — web'de alert yerine error banner)

### 5.3 DB kaydetme

- [ ] `saveAnalysisMutation.mutateAsync({...})` cagir (advanced-analysis:471-490 kalibindan)
- [ ] Parametreler: taskType, childAge, childName, originalImageUrl, childQuote, analysisResult, aiModel, aiConfidence, processingTimeMs, language
- [ ] Hata durumunda sessizce yakala (badge ve kayit hatalari analizi engellemez)

### 5.4 Loading overlay

- [ ] `state.step === 'analyzing'` ise AnalysisLoadingOverlay goster
- [ ] Props: message, estimatedDuration (TEST_CONFIG'den), testType

---

## FASE 6: Sonuc Bolumu — 3 Katmanli Progressive Disclosure [~1.5 saat]

### 6.1 Katman 1: Ozet Karti (her zaman gorunur)

- [ ] Emoji gostergesi: confidence >= 0.7 → mutlu, >= 0.4 → notr, < 0.4 → dikkatli
- [ ] Baslik: Ilk insight'in title'i veya "Analiz Tamamlandi"
- [ ] 1-2 cumle ozet: Ilk insight'in summary'si (ilk 2 cumle)
- [ ] Guven/belirsizlik metni (meta.confidence + meta.uncertaintyLevel)
- [ ] "Daha Fazla Gor" butonu → `dispatch({ type: 'SET_RESULT_LAYER', layer: 2 })`

### 6.2 Katman 2: Insight Kartlari (resultLayer >= 2 ise gorunur)

- [ ] Her insight icin kart:
  - [ ] Baslik
  - [ ] Ozet metin
  - [ ] Guc gostergesi: strong → yesil, moderate → sari, weak → turuncu
  - [ ] Guc badge metni: "Guclu bulgu" / "Orta bulgu" / "Zayif bulgu"
- [ ] "Detaylari Gor" butonu → `dispatch({ type: 'SET_RESULT_LAYER', layer: 3 })`

### 6.3 Katman 3: Detaylar (resultLayer >= 3 ise gorunur)

- [ ] Her insight icin kanit listesi (evidence array)
- [ ] Ev ipuclari bolumu:
  - [ ] Sparkles icon + "Evde Yapabilecekleriniz" basligi
  - [ ] Her ipucu icin: baslik, adimlar (numarali), gerekce (italik)
- [ ] Konusma rehberi (conversationGuide varsa):
  - [ ] Acilis sorulari
  - [ ] Takip sorulari
  - [ ] Yapilmamasi gerekenler
  - [ ] Terapotik yanitlar
- [ ] Profesyonel yonlendirme (professionalGuidance varsa):
  - [ ] Ne zaman uzman yardimi alinmali
  - [ ] Kime basvurulmali
  - [ ] Nasil hazirlanmali

### 6.4 Risk flagleri

- [ ] `riskFlags.length > 0` ise uyari kutusu goster
- [ ] Sari/turuncu arka plan, sol kenarda turuncu border
- [ ] Her risk icin: ozet + "Uzman gorusu onerilir"

### 6.5 Disclaimer

- [ ] Info arka plani, sol kenarda mavi border
- [ ] Disclaimer metni (italik)

### 6.6 Aksiyon butonlari

- [ ] "Paylas" → Share.share() ile paylasim metni
- [ ] "Ioo'ya Sor" → router.push('/chatbot')
- [ ] "Yeni Analiz" → `dispatch({ type: 'RESET' })`

---

## FASE 7: Protocol Bottom Sheet [~30 dk]

### 7.1 Sheet yapisi

- [ ] Overlay (koyu arka plan, dokunuldiginda kapat)
- [ ] Animated.View (alttan yukari kayma)
- [ ] Handle bar
- [ ] Header: test icon + baslik + yas araligi + sure + kapat butonu

### 7.2 Sheet icerigi (ScrollView)

- [ ] Materyaller bolumu (chip'ler)
- [ ] Uygulama asamalari (numarali kartlar + instruction + notlar)
- [ ] Gozlem noktalari (bullet list)
- [ ] Yapilmamasi gerekenler (kirmizi arka planli kartlar)
- [ ] Fotograf ipuclari (mavi arka planli kartlar)
- [ ] Skorlama notlari (sari arka planli kartlar, varsa)

### 7.3 Sheet footer

- [ ] "Bu Testi Sec" butonu → test sec + sheet kapat

---

## FASE 8: Modaller [~15 dk]

### 8.1 FirstTimeWelcomeModal

- [ ] `isFirstTime && !isCheckingFirstTime` ise 500ms sonra goster
- [ ] Dismiss'te `markAsReturningUser()` cagir

### 8.2 AgePickerModal

- [ ] Gorsel secildiginde + yas toplanmamissa goster
- [ ] Yas secildiginde `dispatch({ type: 'SET_AGE', age })` + `markAgeAsCollected()`
- [ ] Atlandiginda `markAgeAsCollected()`

### 8.3 QuotaExceededModal

- [ ] Kota asimi hatasinda goster
- [ ] Kapatildiginda `setShowQuotaModal(false)`

---

## FASE 9: Stiller [~45 dk]

### 9.1 StyleSheet

- [ ] Tum stiller `Colors.*` ve `colors.*` (tema) token'lari kullanir
- [ ] `layout`, `typography`, `spacing`, `radius`, `shadows` design-system'den
- [ ] Hardcoded hex renk KULLANMA
- [ ] Hedef: ~200 stil tanimi (380 birlesik yerine)

### 9.2 Stil gruplari

- [ ] container, gradientContainer, scrollContent
- [ ] header (kompakt)
- [ ] stepperContainer
- [ ] imageInput (butonlar, preview, grid)
- [ ] advancedToggle
- [ ] testCarousel (kartlar, badge'ler)
- [ ] selectedTestCard
- [ ] childInfo (yas input, soz input)
- [ ] analyzeButton
- [ ] results (ozet kart, insight kartlari, detaylar)
- [ ] riskSection
- [ ] disclaimerSection
- [ ] actionButtons
- [ ] protocolSheet (overlay, sheet, sections)
- [ ] errorBanner

---

## FASE 10: Navigasyon Guncellemeleri [~20 dk]

### 10.1 \_layout.tsx

- [ ] `<Tabs.Screen name="analysis" options={{ href: null }} />` ekle
- [ ] Eski `quick-analysis` ve `advanced-analysis` entry'leri KALSIN (backward compat)

### 10.2 index.tsx (home screen)

- [ ] Satir ~351: `/advanced-analysis` → `/(tabs)/analysis`
- [ ] Satir ~531: `/advanced-analysis` → `/(tabs)/analysis`
- [ ] Satir ~618: `/advanced-analysis` → `/(tabs)/analysis`

### 10.3 analysis-history.tsx

- [ ] Satir ~313: `/(tabs)/quick-analysis` → `/(tabs)/analysis`

### 10.4 hayal-atolyesi.tsx

- [ ] Satir ~84-87: `/(tabs)/advanced-analysis` → `/(tabs)/analysis`

### 10.5 chatbot.tsx

- [ ] Satir ~288: `/quick-analysis` → `/analysis`
- [ ] Satir ~384: validRoutes array'ine `/(tabs)/analysis` ekle

### 10.6 ProfessionalToolsSection.tsx

- [ ] Satir ~47: `/advanced-analysis` → `/analysis`
- [ ] Satir ~100: `/advanced-analysis` → `/analysis`
- [ ] Satir ~151: `/advanced-analysis` → `/analysis`

---

## FASE 11: Test & Dogrulama [~30 dk]

### 11.1 Quick mode happy path

- [ ] Ana sayfa → Analiz butonuna tikla → /analysis acilir
- [ ] Galeriden gorsel sec → preview gorunur
- [ ] "Analiz Et" bas → loading overlay → sonuc (Katman 1)
- [ ] "Daha Fazla Gor" → Katman 2 insight kartlari
- [ ] "Detaylari Gor" → Katman 3 ev ipuclari + konusma rehberi
- [ ] "Yeni Analiz" → ekran sifirlanir

### 11.2 Advanced mode happy path

- [ ] "Detayli Test Sec" → genisler
- [ ] HTP sec → 3 gorsel slotu gorunur
- [ ] 3 gorsel yukle → "AI Analizi Baslat" aktif
- [ ] Analiz Et → sonuc gelir

### 11.3 Edge case'ler

- [ ] Gorsel secmeden analiz butonuna basilamaz (disabled)
- [ ] Luscher: gorsel gerektirmez → direkt analiz
- [ ] Network hatasi → 3 retry → hata mesaji
- [ ] Kota asimi → QuotaExceededModal
- [ ] Ilk kullanim → FirstTimeWelcomeModal
- [ ] Ilk gorsel secimi → AgePickerModal

### 11.4 Platform testleri

- [ ] iOS: Haptics calisiyor
- [ ] Android: Haptics calisiyor
- [ ] Web: Haptics CAGRILMIYOR, Alert.alert yerine banner

### 11.5 Navigasyon testleri

- [ ] index.tsx "Analiz" butonu → /analysis
- [ ] index.tsx "Ilk Analizi Baslat" → /analysis
- [ ] index.tsx action modal "Detayli Analiz" → /analysis
- [ ] analysis-history "Yeni Analiz" → /analysis
- [ ] hayal-atolyesi gorsel secimi → /analysis
- [ ] chatbot navigasyon → /analysis
- [ ] ProfessionalToolsSection → /analysis

### 11.6 TypeScript

- [ ] Tum dosyalarda TS hata yok
- [ ] `npx tsc --noEmit` basarili

---

## Notlar

- Quick-analysis.tsx ve advanced-analysis.tsx SILINMEYECEK, sadece `href: null` kalacak (backward compat)
- Backend degisikligi YOK — ayni endpoint, ayni schema
- Yeni bilesen olusturma YOK — mevcut bilesenler tekrar kullanilacak
- test-config.ts disinda yeni dosya yok
