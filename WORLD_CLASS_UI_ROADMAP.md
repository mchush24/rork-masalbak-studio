# RENKIOO - DÜNYA STANDARTLARINA ULAŞMA YOL HARİTASI

**Tarih:** 30 Ocak 2026
**Versiyon:** 1.0
**Durum:** Kapsamlı Analiz ve 21 Fazlı İmplementasyon Planı

---

## HEDEF KİTLE TANIMI

> **ÖNEMLİ:** Bu uygulama öncelikli olarak **YETİŞKİNLER** için tasarlanmıştır:
> - Ebeveynler (çocuklarının duygusal gelişimini takip eden)
> - Öğretmenler (öğrencilerini değerlendiren)
> - Çocuk psikologları ve pedagoglar
> - Aile danışmanları
>
> **Çocuklar** sadece **yetişkin gözetiminde** interaktif boyama yapacak.
> Bu nedenle UI/UX, profesyonel ve sofistike ama sıcak olmalı.

---

## BÖLÜM 1: MEVCUT DURUM ANALİZİ

### 1.1 Güçlü Yönler (Zaten İyi Olan)

| Alan | Durum | Puan |
|------|-------|------|
| Renk Sistemi | Kapsamlı, duygusal zonlar tanımlı | 8/10 |
| Tipografi | Tutarlı scale mevcut | 7/10 |
| Komponent Kütüphanesi | 90+ bileşen | 8/10 |
| Gamifikasyon Temeli | XP, Streak, Badge sistemi var | 7/10 |
| Erişilebilirlik Temeli | Touch target, screen reader desteği | 6/10 |
| Çoklu Dil | 4 dil desteği (TR, EN, DE, RU) | 7/10 |
| Maskot (Ioo) | Sevimli, ebeveyn-çocuk bağı simgesi | 6/10 |

### 1.2 Zayıf Yönler (İyileştirme Gereken)

| Alan | Sorun | Öncelik |
|------|-------|---------|
| Onboarding | Profesyonel değer önerisi eksik | KRİTİK |
| Micro-interactions | Yetersiz, hissedilmiyor | KRİTİK |
| Haptic Feedback | Tutarsız, eksik | YÜKSEK |
| Sound Design | YOK | YÜKSEK |
| Skeleton Loaders | Basit, cansız | ORTA |
| Empty States | Tasarlanmamış | ORTA |
| Error States | Standart, sıkıcı | ORTA |
| Celebration | Konfeti var ama yetersiz | YÜKSEK |
| Tutorial System | Tooltip var ama pasif | ORTA |
| Profesyonel Araçlar | Raporlama ve paylaşım eksik | YÜKSEK |

### 1.3 Dünya Standartları ile Karşılaştırma

**Referans Uygulamalar:**
- **Headspace** - Meditasyon (yetişkin, premium UX)
- **Calm** - Wellness (yetişkin, zarif tasarım)
- **Notion** - Productivity (profesyonel, esnek)
- **Duolingo** - Eğitim (gamifikasyon ustası)

```
                    Renkioo    Headspace   Calm      Notion    Duolingo
                    --------   ---------  -------   -------   ---------
Onboarding UX         5/10       9/10      9/10      8/10      10/10
Micro-interactions    4/10       9/10      10/10     7/10      10/10
Sound Design          0/10       10/10     10/10     3/10       9/10
Haptic Feedback       3/10       8/10      8/10      5/10       9/10
Prof. Araçlar         4/10       7/10      6/10      10/10      5/10
Animation Quality     5/10       10/10     10/10     6/10       9/10
Empty States          2/10       9/10      9/10      8/10       9/10
Error Handling        3/10       8/10      8/10      8/10       8/10
Data Visualization    3/10       8/10      7/10      9/10       7/10
Tutorial/Coaching     4/10       8/10      8/10      9/10       9/10
Personalization       3/10       9/10      9/10      10/10      9/10
Accessibility         5/10       8/10      8/10      9/10       8/10
                    --------   ---------  -------   -------   ---------
TOPLAM              41/120     103/120   102/120   92/120    102/120
YÜZDE                 34%        86%       85%       77%        85%
```

**Not:** Renkioo'nun hedefi Notion'ın profesyonelliği + Headspace'in sıcaklığı kombinasyonu.

### 1.4 Kritik Eksiklikler

1. **Ses Tasarımı Yok** - Dünya standartı uygulamaların %95'i ses kullanıyor
2. **Profesyonel Değer Önerisi Belirsiz** - Neden bu uygulamayı kullanmalı?
3. **Kullanıcı Tipi Ayrımı Yok** - Ebeveyn ve profesyonel aynı deneyimi yaşıyor
4. **Raporlama Araçları Yetersiz** - Profesyoneller PDF/dışa aktarma bekliyor
5. **Veri Görselleştirme Eksik** - Zaman içi gelişim grafikleri yok
6. **Coaching/Yardım Pasif** - Ioo sadece dekoratif, bilgi vermiyor
7. **Boş Durumlar Kasvetli** - İlk kullanımda yönlendirme yok
8. **Hata Durumları Soğuk** - Empati ve çözüm önerisi yok
9. **Çoklu Danışan Yönetimi Eksik** - Profesyoneller için kritik
10. **Güvenlik/Gizlilik Vurgusu Zayıf** - Ebeveynler ve profesyoneller için önemli

---

## BÖLÜM 2: 20 FAZLI İMPLEMENTASYON PLANI

---

### PHASE 1: SES ALTYAPISI (Sound Foundation)
**Süre:** 1 gün | **Öncelik:** KRİTİK | **Dosyalar:** Yeni

#### Hedef
Uygulama genelinde ses efektleri için altyapı oluştur.

#### Görevler
```
□ lib/audio/SoundManager.ts oluştur
  - expo-av ile ses yönetimi
  - Ses açma/kapama ayarı
  - Ses seviyesi kontrolü
  - Preload sistemi

□ lib/audio/sounds.ts - Ses sabitleri
  - UI_TAP: Buton tıklama
  - UI_SUCCESS: Başarı sesi
  - UI_ERROR: Hata sesi
  - UI_SWOOSH: Geçiş sesi
  - UI_POP: Popup sesi
  - CELEBRATION_FANFARE: Kutlama
  - CELEBRATION_CONFETTI: Konfeti
  - XP_GAIN: XP kazanma
  - LEVEL_UP: Seviye atlama
  - BADGE_UNLOCK: Rozet açma
  - STREAK_FIRE: Streak sesi
  - IOO_HAPPY: Ioo mutlu
  - IOO_CURIOUS: Ioo meraklı
  - IOO_CELEBRATE: Ioo kutlama

□ assets/sounds/ klasörü
  - Ücretsiz ses efektleri indir (freesound.org, mixkit.co)
  - MP3 ve OGG formatları
  - Maksimum 50KB per ses

□ hooks/useSound.ts
  - playSound(soundName) fonksiyonu
  - Ayarları kontrol et
  - Platform kontrolü (web sessiz)

□ SoundSettings component
  - Profil sayfasına ekle
  - Ses açık/kapalı toggle
  - Ses seviyesi slider
```

#### Kabul Kriterleri
- [ ] 15+ farklı ses efekti yüklenmiş
- [ ] Ses açma/kapama çalışıyor
- [ ] AsyncStorage'da ayar saklanıyor
- [ ] Web'de graceful degradation

---

### PHASE 2: HAPTIC SİSTEMİ GELİŞTİRME
**Süre:** 0.5 gün | **Öncelik:** YÜKSEK | **Dosyalar:** lib/haptics/

#### Hedef
Tutarlı ve anlamlı haptic feedback sistemi.

#### Görevler
```
□ lib/haptics/HapticService.ts
  - Expo Haptics wrapper
  - Platform kontrolü
  - Ayar kontrolü (haptic açık/kapalı)

□ Haptic pattern tanımları:
  - TAP_LIGHT: Buton, seçim
  - TAP_MEDIUM: Onay, toggle
  - TAP_HEAVY: Silme, uyarı
  - SUCCESS: Başarı (selection + light)
  - ERROR: Hata (heavy + heavy)
  - WARNING: Uyarı (medium + medium)
  - CELEBRATION: Kutlama (pattern: light-medium-light-heavy)
  - LEVEL_UP: Seviye (pattern: heavy-heavy-heavy)
  - XP_TICK: XP artışı (light rapid)

□ Tüm butonlara haptic ekle
  - JellyButton: TAP_MEDIUM
  - Button primary: TAP_MEDIUM
  - Button danger: TAP_HEAVY
  - IconButton: TAP_LIGHT

□ HapticSettings component
  - Haptic açık/kapalı toggle
  - Profil sayfasına ekle
```

#### Kabul Kriterleri
- [ ] Tüm butonlarda haptic var
- [ ] Başarı/hata durumlarında farklı pattern
- [ ] Kullanıcı kapatabilir
- [ ] iOS ve Android'de çalışıyor

---

### PHASE 3: SKELETON LOADER YENİLEME
**Süre:** 0.5 gün | **Öncelik:** ORTA | **Dosyalar:** components/ui/

#### Hedef
Canlı, ilgi çekici loading durumları.

#### Görevler
```
□ components/ui/SkeletonLoader.tsx güncelle
  - Gradient shimmer efekti (soldan sağa)
  - Reanimated ile smooth animasyon
  - Rounded corners (içerikle uyumlu)

□ Skeleton varyantları:
  - SkeletonCard: Kart placeholder
  - SkeletonText: Metin satırları
  - SkeletonAvatar: Yuvarlak profil
  - SkeletonImage: Resim alanı
  - SkeletonButton: Buton placeholder

□ Özel skeleton'lar:
  - FeatureCardSkeleton
  - ActivityItemSkeleton
  - AnalysisCardSkeleton
  - StoryCardSkeleton

□ Shimmer renkleri:
  - Base: Colors.neutral.lighter
  - Highlight: Colors.neutral.white
  - Animasyon: 1.5s loop
```

#### Kabul Kriterleri
- [ ] Tüm liste ekranlarında skeleton var
- [ ] Shimmer efekti smooth çalışıyor
- [ ] İçerikle aynı layout
- [ ] 60fps performans

---

### PHASE 4: EMPTY STATE TASARIMI
**Süre:** 1 gün | **Öncelik:** YÜKSEK | **Dosyalar:** components/ui/

#### Hedef
Boş durumları fırsata çevir, kullanıcıyı motive et.

#### Görevler
```
□ components/ui/EmptyState.tsx oluştur
  Props:
  - illustration: 'no-analysis' | 'no-stories' | 'no-coloring' | 'no-history' | 'welcome'
  - title: string
  - description: string
  - actionLabel?: string
  - onAction?: () => void
  - mascotMood?: 'happy' | 'curious' | 'excited'

□ İllüstrasyonlar (Ioo ile):
  - no-analysis: Ioo büyüteçle bakıyor, "Henüz analiz yok"
  - no-stories: Ioo kitap tutuyor, "Hikaye zamanı!"
  - no-coloring: Ioo boya fırçasıyla, "Renklere hazır mısın?"
  - no-history: Ioo takvime bakıyor, "Macera başlasın!"
  - welcome: Ioo el sallıyor, "Hoş geldin!"
  - search-empty: Ioo meraklı, "Bulamadım ama..."
  - error: Ioo üzgün ama umutlu, "Bir şeyler ters gitti"

□ Animasyonlar:
  - Ioo entrance: scale 0 → 1 (spring)
  - Text fade in: 200ms delay
  - Button slide up: 400ms delay
  - Ioo idle: floating animation

□ Entegrasyon:
  - history.tsx → no-history
  - analysis-history.tsx → no-analysis
  - coloring-history.tsx → no-coloring
  - stories.tsx → no-stories
```

#### Kabul Kriterleri
- [ ] 7 farklı empty state illüstrasyonu
- [ ] Ioo her empty state'te görünüyor
- [ ] CTA butonu ile aksiyon
- [ ] Animasyonlar smooth

---

### PHASE 5: ERROR STATE TASARIMI
**Süre:** 0.5 gün | **Öncelik:** ORTA | **Dosyalar:** components/ui/

#### Hedef
Hataları insancıl ve çözüm odaklı göster.

#### Görevler
```
□ components/ui/ErrorState.tsx oluştur
  Props:
  - type: 'network' | 'server' | 'auth' | 'notfound' | 'generic'
  - title?: string (override)
  - description?: string (override)
  - onRetry?: () => void
  - onGoBack?: () => void
  - showSupport?: boolean

□ Hata tipleri ve mesajları:
  - network: "İnternet bağlantısı yok" + "Bağlantını kontrol et"
  - server: "Sunucuya ulaşamadık" + "Biraz sonra tekrar dene"
  - auth: "Oturum süresi doldu" + "Tekrar giriş yap"
  - notfound: "Aradığın şey bulunamadı" + "Ana sayfaya dön"
  - generic: "Bir şeyler ters gitti" + "Tekrar dene"

□ Görsel:
  - Ioo üzgün ama destekleyici ifade
  - Soft gradient background (kırmızımsı değil!)
  - İkon: Bulut + çarpı, kalkan, vs.
  - Retry butonu prominent

□ ErrorBoundary güncelle
  - ErrorState kullan
  - Crash report gönder (opsiyonel)
```

#### Kabul Kriterleri
- [ ] 5 farklı hata tipi
- [ ] Her biri çözüm önerisi sunuyor
- [ ] Retry mekanizması çalışıyor
- [ ] Kullanıcı korkmuyor

---

### PHASE 6: ONBOARDING - PROFESYONEL DEĞER ÖNERİSİ
**Süre:** 2 gün | **Öncelik:** KRİTİK | **Dosyalar:** app/(onboarding)/

#### Hedef
Profesyonel ve ebeveynlere güven veren, değer önerisini net anlatan onboarding.

#### Görevler
```
□ Yetişkin odaklı konsept:
  "Çocuğunuzun duygusal dünyasını anlamanın bilimsel yolu.
   Çizim analizi, interaktif hikayeler ve dijital boyama ile
   çocuğunuzun iç dünyasına güvenli bir pencere açın."

□ app/(onboarding)/value-proposition.tsx - 5 sahne

  SAHNE 1: "Çocuklar Konuşur, Farklı Bir Dilde"
  - Çocuk çizimi illüstrasyonu
  - "Çocuklar duygularını kelimelerle ifade edemeyebilir"
  - "Ama çizimleri, hikayeleri, renk seçimleri çok şey anlatır"
  - Profesyonel, temiz tasarım

  SAHNE 2: "Bilimsel Yaklaşım"
  - AI analiz ikonu + psikoloji sembolleri
  - "Yapay zeka destekli çizim analizi"
  - "Çocuk psikolojisi uzmanlarıyla geliştirildi"
  - Güvenilirlik vurgusu

  SAHNE 3: "Araçlarınız"
  - 4 ana özellik kartı (grid)
  - Çizim Analizi: "Çizimlerdeki duygusal ipuçları"
  - İnteraktif Hikayeler: "Karar alma süreçlerini gözlemleyin"
  - Dijital Boyama: "Yaratıcılığı destekleyin"
  - Gelişim Takibi: "Zaman içindeki değişimleri görün"

  SAHNE 4: "Gizlilik & Güvenlik"
  - Kalkan ikonu
  - "Çocuğunuzun verileri sadece sizin"
  - "Uçtan uca şifreleme"
  - "KVKK ve GDPR uyumlu"
  - Profesyoneller için: "Danışan gizliliği korunur"

  SAHNE 5: "Başlayalım"
  - Ioo tanıtımı (yardımcı maskot olarak)
  - "Ioo, bu yolculukta size eşlik edecek"
  - CTA: "Hesap Oluştur" + "Giriş Yap"
  - Sofistike ama sıcak tasarım

□ Animasyonlar:
  - Sahne geçişleri: Smooth fade + subtle slide
  - İllüstrasyonlar: Reveal animations
  - Metin: Staggered fade-in
  - Profesyonel, abartısız

□ Skip mekanizması:
  - "Atla" her zaman görünür
  - Profesyoneller vakit kaybetmek istemez
```

#### Kabul Kriterleri
- [ ] Profesyonel görünüm, güven veriyor
- [ ] Değer önerisi 30 saniyede anlaşılıyor
- [ ] Gizlilik vurgusu var
- [ ] Her sahne atlanabilir
- [ ] Hem ebeveyn hem profesyonel için uygun ton

---

### PHASE 7: KULLANICI PROFİLİ & KİŞİSELLEŞTİRME
**Süre:** 1 gün | **Öncelik:** YÜKSEK | **Dosyalar:** app/(onboarding)/

#### Hedef
Kullanıcı tipine göre deneyimi özelleştir, gereksiz özellikleri gizle.

#### Görevler
```
□ app/(onboarding)/user-profile.tsx

  ADIM 1: "Kullanım Amacı"
  - "Renkioo'yu nasıl kullanacaksınız?"
  - Seçenekler (tek seçim):
    □ Ebeveyn - "Çocuğumun duygusal gelişimini takip etmek istiyorum"
    □ Psikolog/Pedagog - "Danışanlarımla çalışmak için kullanacağım"
    □ Öğretmen - "Sınıfımdaki öğrencileri değerlendirmek istiyorum"
    □ Aile Danışmanı - "Ailelerle çalışırken kullanacağım"

  ADIM 2: "Deneyim Seviyesi" (Profesyoneller için)
  - "Çocuk psikolojisi alanındaki deneyiminiz?"
  - Seçenekler:
    □ Öğrenci/Stajyer
    □ 1-3 yıl deneyimli
    □ 4-10 yıl deneyimli
    □ 10+ yıl uzman

  ADIM 2b: "Aile Yapısı" (Ebeveynler için)
  - "Kaç çocuğunuz var?"
  - Seçenekler: 1, 2, 3, 4+
  - Her çocuk için yaş bilgisi

  ADIM 3: "Öncelikli İhtiyaçlar"
  - "En çok hangi konularda destek istiyorsunuz?"
  - Seçenekler (çoklu, max 3):
    □ Duygusal farkındalık geliştirme
    □ İletişim sorunlarını anlama
    □ Travma/stres belirtilerini tanıma
    □ Yaratıcılığı destekleme
    □ Gelişimsel takip yapma
    □ Profesyonel raporlama

  ADIM 4: "Tercihler"
  - "Uygulama deneyiminizi nasıl istersiniz?"
  - Bildirimler: Günlük hatırlatma / Haftalık özet / Kapalı
  - Dil: TR / EN / DE / RU
  - Tema: Açık / Koyu / Sistem

□ Kullanıcı tipine göre farklılıklar:

  EBEVEYN modu:
  - Daha sıcak, destekleyici dil
  - Gamifikasyon aktif (streak, XP)
  - "Çocuğunuzla kaliteli vakit" vurgusu
  - Basitleştirilmiş raporlar

  PROFESYONEL modu:
  - Daha klinik, objektif dil
  - Gamifikasyon opsiyonel/kapalı
  - Detaylı analiz raporları
  - Çoklu danışan yönetimi
  - Dışa aktarma özellikleri (PDF, CSV)
  - Not alma sistemi

  ÖĞRETMEN modu:
  - Sınıf yönetimi özellikleri
  - Toplu değerlendirme
  - Veli ile paylaşım araçları
  - Basit raporlar

□ Veri kullanımı:
  - UI dili ve tonu
  - Görünür özellikler
  - Varsayılan ayarlar
  - Raporlama formatı
```

#### Kabul Kriterleri
- [ ] 3 farklı kullanıcı modu
- [ ] Her mod için özelleştirilmiş deneyim
- [ ] Profesyoneller için detaylı araçlar
- [ ] Ebeveynler için sıcak deneyim
- [ ] Skip seçeneği var

---

### PHASE 8: CELEBRATION SİSTEMİ (Kutlama 2.0)
**Süre:** 1.5 gün | **Öncelik:** YÜKSEK | **Dosyalar:** components/celebrations/

#### Hedef
Duolingo seviyesinde heyecan verici kutlamalar.

#### Görevler
```
□ components/celebrations/CelebrationOrchestrator.tsx
  - Tüm kutlamaları yöneten merkezi sistem
  - Queue mekanizması (üst üste gelirse sırala)
  - Priority sistemi (level up > badge > xp)

□ Kutlama tipleri:

  1. XP_GAIN (Küçük):
     - Ekranın üstünde "+50 XP" text
     - Altın renk, yukarı kayarak çıkış
     - Ses: coin/ding
     - Süre: 1.5s

  2. STREAK_MILESTONE (Orta):
     - Ateş ikonu büyür
     - "7 Gün! Harikasın!" text
     - Turuncu parçacıklar
     - Ses: fire whoosh
     - Süre: 2.5s

  3. BADGE_UNLOCK (Büyük):
     - Full screen overlay (yarı transparan)
     - Rozet ortada, scale 0 → 1.2 → 1
     - Parıltı efekti arkasında
     - Konfeti patlaması
     - Rozet adı ve açıklaması
     - Ses: fanfare + sparkle
     - Süre: 4s
     - "Paylaş" butonu

  4. LEVEL_UP (Çok Büyük):
     - Full screen takeover
     - Sayı animasyonu (3 → 4)
     - Altın ışık patlaması
     - Ioo kutlama dansı
     - Yeni unvan gösterimi
     - Konfeti + parıltılar
     - Ses: epic level up fanfare
     - Süre: 5s
     - "Devam" butonu

  5. FIRST_ANALYSIS (Milestone):
     - Özel tasarım
     - "İlk Analizin Tamamlandı!"
     - Ioo alkışlıyor
     - Rozet veriliyor
     - Ses: achievement

  6. STREAK_SAVE (Güvenlik):
     - "Streak'in güvende!"
     - Kalkan ikonu
     - Yeşil glow
     - Ses: shield up

□ Konfeti sistemi:
  - 50+ parçacık
  - Renk paleti: Altın, mor, pembe, turkuaz
  - Fizik simülasyonu (yerçekimi, hava direnci)
  - Farklı şekiller: yıldız, kalp, daire

□ Parıltı (Sparkle) sistemi:
  - SVG tabanlı yıldızlar
  - Rastgele pozisyon ve boyut
  - Pulse animasyonu
  - 10-20 parçacık
```

#### Kabul Kriterleri
- [ ] 6 farklı kutlama tipi
- [ ] Her birinde ses efekti
- [ ] Konfeti fizik simülasyonu
- [ ] Ioo kutlama animasyonu
- [ ] 60fps performans

---

### PHASE 9: IOO YARDIMCI SİSTEMİ (Yetişkinler İçin)
**Süre:** 1.5 gün | **Öncelik:** YÜKSEK | **Dosyalar:** components/coaching/

#### Hedef
Ioo yetişkin kullanıcılara rehberlik yapan, bilgilendirici bir yardımcı olsun.

#### Görevler
```
□ components/coaching/IooAssistant.tsx
  - Ekranın köşesinde mini Ioo (subtle, profesyonel)
  - Tıklanınca yardım paneli
  - Bağlama göre ipuçları ve bilgiler

□ components/coaching/AssistantTip.tsx
  - Profesyonel konuşma balonu
  - İkon + metin + kaynak linki (opsiyonel)
  - Kapatma butonu
  - "Bir daha gösterme" seçeneği

□ Yardım senaryoları (EBEVEYN MODU):

  ANASAYFA:
  - İlk ziyaret: "Hoş geldiniz! Buradan çocuğunuzun çizimlerini analiz edebilir, hikayeler okuyabilir ve birlikte boyama yapabilirsiniz."
  - Haftalık özet: "Bu hafta 3 analiz yaptınız. Çocuğunuzun gelişimini takip etmeye devam edin."
  - Öneri: "Çocuğunuzla birlikte interaktif hikaye okumayı denediniz mi?"

  ANALİZ EKRANI:
  - İlk analiz: "Çocuğunuzun bir çizimini yükleyin. AI analizi, çizimde gözlemlenen duygusal temaları size sunacak."
  - Sonuç ekranı: "Bu analiz profesyonel tanı yerine geçmez. Endişeleriniz varsa bir uzmana danışın."
  - İpucu: "Düzenli çizim analizi, zaman içindeki değişimleri görmenize yardımcı olur."

  HİKAYE EKRANI:
  - İlk hikaye: "İnteraktif hikayelerde çocuğunuz seçimler yapar. Bu seçimler, düşünce kalıpları hakkında ipuçları verebilir."
  - Hikaye sonu: "Çocuğunuzun seçimlerini veli raporunda inceleyebilirsiniz."

  BOYAMA EKRANI:
  - İlk boyama: "Çocuğunuzla birlikte boyama, kaliteli vakit geçirmenin harika bir yolu."
  - İpucu: "Renk seçimleri hakkında yargılayıcı olmayın, yaratıcılığı destekleyin."

□ Yardım senaryoları (PROFESYONEL MODU):

  ANASAYFA:
  - İlk ziyaret: "Kontrol panelinize hoş geldiniz. Danışanlarınızı sol menüden yönetebilirsiniz."
  - Hatırlatma: "3 danışanınız için bu hafta analiz girişi yapılmadı."

  ANALİZ EKRANI:
  - Klinik not: "Projektif çizim testleri, DSM-5 tanı kriterleri yerine destekleyici veri sağlar."
  - Raporlama: "Analiz sonuçlarını PDF olarak dışa aktarabilir, dosyalama yapabilirsiniz."

  DANIŞAN YÖNETİMİ:
  - İpucu: "Her danışan için ayrı dosya oluşturarak geçmiş analizlere kolayca erişebilirsiniz."

□ Coaching mantığı:
  - lib/coaching/AssistantEngine.ts
  - Kullanıcı tipine göre ton ayarla
  - Profesyonellere daha az ipucu (zaten biliyorlar)
  - Ebeveynlere daha destekleyici
  - Günde max 3 ipucu (spam değil)

□ Ioo stilleri kullanıcı tipine göre:
  - Ebeveyn: Sıcak, destekleyici, arkadaş canlısı
  - Profesyonel: Saygılı, bilgilendirici, minimal
  - Öğretmen: Yardımsever, pratik odaklı
```

#### Kabul Kriterleri
- [ ] Kullanıcı tipine göre farklı ton
- [ ] 20+ yardım senaryosu
- [ ] Profesyonellere klinik bilgiler
- [ ] Ebeveynlere güven verici mesajlar
- [ ] Kapatılabilir, spam yapmıyor

---

### PHASE 10: FEATURE CARD ANİMASYONLARI
**Süre:** 1 gün | **Öncelik:** ORTA | **Dosyalar:** components/

#### Hedef
Ana sayfa kartlarını canlı ve davetkar yap.

#### Görevler
```
□ FeatureCard.tsx güncellemesi:

  HOVER/PRESS efekti:
  - Scale: 1 → 0.98 (press)
  - Gölge: yukarı kalk
  - Border glow: subtle pulse
  - Haptic: light tap

  IDLE animasyonları (opsiyonel, ayardan kapatılabilir):
  - Subtle breathing (scale 1 → 1.01)
  - İkon micro-rotation (±3 derece)
  - Gradient shift (renk tonları kayar)

  ATTENTION animasyonu (yeni özellik varsa):
  - Pulsing border
  - "YENİ" badge animasyonu
  - Sparkle efekti köşede

□ Staggered entrance:
  - Kartlar sırayla gelsin
  - Her kart 100ms gecikme
  - Slide up + fade in
  - Spring physics

□ Card interaction feedback:
  - Tıklanınca ripple efekti
  - Success durumunda yeşil flash
  - Loading durumunda pulse

□ Premium card indicator:
  - Gradient border (gold)
  - Crown/star ikonu
  - "PRO" badge
```

#### Kabul Kriterleri
- [ ] Press efekti tüm kartlarda
- [ ] Staggered entrance çalışıyor
- [ ] Attention state belirgin
- [ ] Performans sorunu yok

---

### PHASE 11: INPUT & FORM ANİMASYONLARI
**Süre:** 0.5 gün | **Öncelik:** ORTA | **Dosyalar:** components/

#### Hedef
Form deneyimini akıcı ve hatasız yap.

#### Görevler
```
□ Input.tsx güncellemesi:

  FOCUS animasyonu:
  - Border color transition (200ms)
  - Label float up (material design tarzı)
  - Subtle glow ekleme

  ERROR animasyonu:
  - Shake (3 kez, 5px)
  - Kırmızı border flash
  - Error mesajı slide down
  - Haptic: error pattern

  SUCCESS animasyonu:
  - Yeşil border flash
  - Checkmark ikonu appear
  - Haptic: success

  TYPING feedback:
  - Character counter animasyonu
  - Password strength bar transition
  - Real-time validation indicators

□ Form geçişleri:
  - Multi-step formlarda slide animasyonu
  - Progress bar smooth fill
  - Step indicator animations

□ Button states:
  - Loading: spinner + text fade
  - Success: checkmark morph
  - Error: X morph + shake
```

#### Kabul Kriterleri
- [ ] Focus/blur animasyonları smooth
- [ ] Error feedback hissediliyor
- [ ] Validation görsel olarak net
- [ ] Form submission feedback

---

### PHASE 12: NAVİGASYON GEÇİŞLERİ
**Süre:** 1 gün | **Öncelik:** ORTA | **Dosyalar:** app/

#### Hedef
Ekran geçişlerini akıcı ve anlamlı yap.

#### Görevler
```
□ Screen transitions:

  TAB geçişleri:
  - Cross-fade (varsayılan)
  - Tab indicator slide animasyonu
  - İkon scale pulse (aktif tab)

  STACK geçişleri:
  - iOS: Native slide
  - Android: Shared element transitions
  - Modal: Bottom sheet slide up

  MODAL geçişleri:
  - Backdrop fade in (200ms)
  - Content scale + slide (spring)
  - Dismiss: reverse + faster

□ Shared Element Transitions:
  - Analiz kartı → Analiz detay (kart genişler)
  - Hikaye kartı → Hikaye okuma (kapak genişler)
  - Profil avatar → Avatar seçici (büyür)

□ Tab bar animasyonları:
  - Aktif ikon: scale 1 → 1.1
  - Label: fade in
  - Indicator: sliding underline

□ Gesture-based navigation:
  - Swipe back (iOS native)
  - Pull to dismiss (modals)
  - Velocity-based animations
```

#### Kabul Kriterleri
- [ ] Tab geçişleri smooth
- [ ] Modal animasyonları tutarlı
- [ ] Shared element en az 2 yerde
- [ ] 60fps tüm geçişlerde

---

### PHASE 13: LOADING STATES 2.0
**Süre:** 1 gün | **Öncelik:** ORTA | **Dosyalar:** components/

#### Hedef
Bekleme sürelerini eğlenceli yap.

#### Görevler
```
□ LoadingAnimation.tsx güncellemesi:

  Mevcut tipler + yeniler:
  - painting: Fırça boyuyor (mevcut)
  - analyzing: Ioo büyüteçle bakıyor (yeni)
  - thinking: Ioo düşünüyor, soru işaretleri (yeni)
  - loading_story: Kitap sayfaları çevriliyor (yeni)
  - uploading: Buluta ok gidiyor (yeni)
  - processing: Gear döndürme (yeni)
  - magic: Ioo sihirli değnek sallıyor (yeni)

□ İpucu sistemi:
  - Loading sırasında dönen ipuçları
  - "Biliyor muydun?" formatı
  - Her 3 saniyede değişir
  - İpuçları lokalize

□ Progress feedback:
  - Determinate: gerçek ilerleme varsa yüzde
  - Indeterminate: animasyonlu tahmin
  - "Bu genelde 10 saniye sürer" mesajı

□ Micro-copy:
  - "Bir saniye, bakıyorum..."
  - "Neredeyse bitti!"
  - "Hmm, bu ilginç bir çizim..."
  - "Büyük bir analiz hazırlıyorum..."

□ Cancel mekanizması:
  - Uzun süren işlemlerde iptal butonu
  - "İptal" → onay dialogu
```

#### Kabul Kriterleri
- [ ] 7 farklı loading animasyonu
- [ ] Dönen ipuçları var
- [ ] Progress gösterimi
- [ ] Cancel mekanizması çalışıyor

---

### PHASE 14: TOOLTIP & TUTORIAL SİSTEMİ
**Süre:** 1 gün | **Öncelik:** ORTA | **Dosyalar:** components/tutorial/

#### Hedef
Yeni özellikleri keşfettir, öğrenme eğrisini düşür.

#### Görevler
```
□ components/tutorial/SpotlightTutorial.tsx
  - Bir elementi highlight et (karanlık overlay)
  - Tooltip ile açıklama
  - "Sonraki" / "Bitir" butonları
  - Step indicator dots

□ Tutorial senaryoları:

  İLK ANASAYFA:
  1. XP barını göster: "Burası senin seviyeni gösteriyor"
  2. Streak'i göster: "Her gün kullan, streak büyüsün"
  3. Feature kartları: "Buradan özelliklere ulaş"
  4. Profil: "Çocuk profillerini buradan yönet"

  İLK ANALİZ:
  1. Fotoğraf seç: "Bir çizim fotoğrafı yükle"
  2. Analiz türü: "Farklı analiz türlerini dene"
  3. Başlat: "Hazır olunca başlat"

  İLK BOYAMA:
  1. Renk paleti: "Buradan renk seç"
  2. Fırça: "Fırça boyutunu ayarla"
  3. Doldur: "Tıkla ve alanı doldur"
  4. Kaydet: "Eserini kaydetmeyi unutma"

□ Tooltip component:
  - Arrow pointing to element
  - Glassmorphism background
  - Close button
  - "Bir daha gösterme" checkbox

□ Tutorial tracking:
  - Hangi tutorial'lar görüldü
  - AsyncStorage'da kayıt
  - Reset option in settings
```

#### Kabul Kriterleri
- [ ] Spotlight overlay çalışıyor
- [ ] 3 ana tutorial senaryosu
- [ ] İlerleme kaydediliyor
- [ ] Skip/reset mümkün

---

### PHASE 15: PULL TO REFRESH & GESTURES
**Süre:** 0.5 gün | **Öncelik:** DÜŞÜK | **Dosyalar:** Çeşitli

#### Hedef
Gesture'ları sezgisel ve tatmin edici yap.

#### Görevler
```
□ Custom Pull to Refresh:
  - Ioo aşağı iniyor → spin → yukarı çıkıyor
  - Renk değişimi (progress'e göre)
  - Haptic: medium (tetiklendiğinde)
  - Success: Ioo thumbs up

□ Swipe actions:
  - Liste itemlarında swipe to delete
  - Swipe to favorite
  - Haptic feedback at threshold

□ Long press menus:
  - Context menu animasyonu
  - Blur background
  - Bounce in effect

□ Pinch to zoom:
  - Analiz görsellerinde
  - Boyama tuvaliinde
  - Smooth zoom + pan
```

#### Kabul Kriterleri
- [ ] Pull to refresh özelleştirilmiş
- [ ] Swipe actions en az 1 listede
- [ ] Haptic tüm gesture'larda

---

### PHASE 16: DARK MODE DESTEK
**Süre:** 1.5 gün | **Öncelik:** ORTA | **Dosyalar:** constants/, components/

#### Hedef
Karanlık mod ile göz yorgunluğunu azalt.

#### Görevler
```
□ constants/colors.ts güncelleme:

  Dark mode renk paleti:
  - Background: #0A0E1A → #1A1E2E
  - Surface: #1E2235
  - Card: #252A3D
  - Text primary: #FFFFFF
  - Text secondary: #A0A5B8
  - Accent colors: Daha parlak tonlar

□ Theme context:
  - lib/contexts/ThemeContext.tsx
  - useTheme() hook
  - System preference detection
  - Manual override option

□ Component updates:
  - Tüm sabit renkleri theme-aware yap
  - Gölgeleri dark mode'a adapte et
  - Border'ları görünür yap

□ Ioo dark mode:
  - Gece versiyonu (uyku şapkası?)
  - Daha yumuşak renkler
  - Glow effect daha belirgin

□ Settings UI:
  - Tema seçici: Açık / Koyu / Sistem
  - Preview göster
  - Instant apply
```

#### Kabul Kriterleri
- [ ] Tüm ekranlar dark mode destekli
- [ ] Sistem ayarına uyum
- [ ] Göz yormayan kontrastlar
- [ ] Ioo dark versiyonu var

---

### PHASE 17: ACCESSIBILITY 2.0
**Süre:** 1 gün | **Öncelik:** ORTA | **Dosyalar:** Çeşitli

#### Hedef
WCAG AAA ve çocuk erişilebilirliği.

#### Görevler
```
□ Reduce Motion tam destek:
  - Tüm animasyonlarda kontrol
  - Alternatif statik geçişler
  - Accessibility context

□ Font scaling:
  - Dynamic type support
  - Layout'lar esnek
  - Minimum 16px base

□ Color blind modes:
  - Deuteranopia (kırmızı-yeşil)
  - Protanopia (kırmızı)
  - Tritanopia (mavi-sarı)
  - High contrast mode

□ Screen reader improvements:
  - Tüm ikonlara accessibilityLabel
  - Anlamlı navigation hints
  - Dynamic announcements

□ Motor accessibility:
  - Ekstra büyük touch targets (ayar)
  - Dwell time support
  - Switch control uyumluluğu

□ Cognitive accessibility:
  - Basit dil seçeneği
  - Daha az animasyon modu
  - Daha az bilgi modu
```

#### Kabul Kriterleri
- [ ] VoiceOver/TalkBack test edilmiş
- [ ] 3 renk körlüğü modu
- [ ] Font scaling çalışıyor
- [ ] Reduce motion tam

---

### PHASE 18: PROFESYONEL ARAÇLAR
**Süre:** 2 gün | **Öncelik:** YÜKSEK | **Dosyalar:** app/, components/

#### Hedef
Psikologlar, pedagoglar ve öğretmenler için gelişmiş araçlar.

#### Görevler
```
□ PDF Rapor Dışa Aktarma:
  - Analiz sonuçlarını PDF olarak kaydet
  - Şirket/klinik logosu ekleme (ayarlardan)
  - Profesyonel rapor şablonu
  - Tarih, danışan bilgisi, analiz özeti
  - react-native-pdf-lib veya web API

□ Danışan/Öğrenci Yönetimi (Profesyonel mod):
  - Danışan listesi ekranı
  - Danışan profili (isim, yaş, notlar)
  - Danışana ait tüm analizler
  - Danışan bazlı filtreleme
  - Arşivleme özelliği

□ Gelişim Grafiği:
  - Zaman içi analiz karşılaştırması
  - Duygu trendi grafiği
  - Victory Native veya react-native-chart-kit
  - Haftalık/aylık/yıllık görünüm

□ Not Alma Sistemi:
  - Analiz üzerine klinik not ekleme
  - Markdown desteği
  - Zaman damgalı notlar
  - Arama özelliği

□ Veri Dışa Aktarma:
  - CSV export (tüm analizler)
  - JSON export (yedekleme)
  - Seçili tarih aralığı

□ Güvenlik & Gizlilik:
  - Uygulama kilidi (PIN/biometrik)
  - Oturum zaman aşımı ayarı
  - Veri silme (GDPR hakkı)
  - Gizlilik politikası ekranı

□ Profesyonel mod UI:
  - Daha minimal, veri odaklı
  - Gamifikasyon kapatılabilir
  - Dashboard istatistikleri
  - Hızlı erişim kısayolları
```

#### Kabul Kriterleri
- [ ] PDF rapor oluşturuluyor
- [ ] Danışan yönetimi çalışıyor
- [ ] Gelişim grafiği görüntüleniyor
- [ ] Not ekleme/düzenleme çalışıyor
- [ ] CSV/JSON export çalışıyor
- [ ] Uygulama kilidi aktif

---

### PHASE 19: PERFORMANS OPTİMİZASYONU
**Süre:** 1 gün | **Öncelik:** ORTA | **Dosyalar:** Çeşitli

#### Hedef
60fps, düşük bellek, hızlı açılış.

#### Görevler
```
□ Animasyon optimizasyonu:
  - useNativeDriver: true (mümkün olan her yerde)
  - Reanimated 3 worklet'leri
  - Gereksiz re-render engelleme

□ Image optimizasyonu:
  - Lazy loading
  - Progressive loading
  - WebP format
  - Proper caching

□ Bundle optimizasyonu:
  - Tree shaking kontrolü
  - Lazy imports
  - Chunk splitting

□ Memory management:
  - Liste virtualization
  - Image cleanup
  - Animation cleanup

□ Startup optimizasyonu:
  - Splash screen timing
  - Critical path optimization
  - Deferred loading

□ Profiling:
  - React DevTools Profiler
  - Flipper integration
  - Performance monitoring
```

#### Kabul Kriterleri
- [ ] 60fps tüm animasyonlarda
- [ ] Cold start < 3 saniye
- [ ] Memory leak yok
- [ ] Lighthouse score > 90

---

### PHASE 20: A/B TEST ALTYAPISI
**Süre:** 1 gün | **Öncelik:** DÜŞÜK | **Dosyalar:** lib/experiments/

#### Hedef
Özellik değişikliklerini ölçülebilir yap.

#### Görevler
```
□ lib/experiments/ExperimentService.ts
  - Feature flag sistemi
  - Variant assignment
  - Analytics entegrasyonu

□ Experiment types:
  - UI experiments (buton rengi, metin)
  - Flow experiments (onboarding varyantları)
  - Feature experiments (yeni özellik A/B)

□ Dashboard:
  - Active experiments listesi
  - Conversion metrics
  - Statistical significance

□ Implementation:
  - useExperiment(experimentId) hook
  - ExperimentBoundary component
  - Fallback handling
```

#### Kabul Kriterleri
- [ ] Flag sistemi çalışıyor
- [ ] En az 1 experiment tanımlı
- [ ] Analytics bağlantısı var
- [ ] Override mekanizması

---

### PHASE 21: POLISH & DELIGHT (Son Rötuşlar)
**Süre:** 2 gün | **Öncelik:** ORTA | **Dosyalar:** Çeşitli

#### Hedef
Mükemmeliyetçi detaylar, "vay be" anları.

#### Görevler
```
□ Easter eggs:
  - Ioo'ya 10 kez tıkla → özel animasyon
  - Gizli renk paleti (konami code?)
  - Doğum günü sürprizi

□ Seasonal themes:
  - Yeni yıl: Kar efekti, Ioo şapkalı
  - Sevgililer: Kalp parçacıkları
  - Yaz: Güneş gözlüklü Ioo
  - Cadılar bayramı: Balkabağı Ioo

□ Delight moments:
  - 100. analiz özel kutlama
  - 1 yıllık kullanıcı rozeti
  - "OG User" badge

□ Sound polish:
  - Ambient background (opsiyonel)
  - Smooth audio transitions
  - Volume ducking

□ Visual polish:
  - Tüm shadow'ları kontrol
  - Tüm spacing'leri kontrol
  - Tüm border radius'ları kontrol
  - Tüm renk tonlamalarını kontrol

□ Copy polish:
  - Tüm metinleri gözden geçir
  - Tutarlı ton of voice
  - Typo kontrolü
  - Lokalizasyon kontrolü

□ Final QA:
  - Her ekran screenshot
  - Her flow video kayıt
  - Edge case testleri
  - Device compatibility
```

#### Kabul Kriterleri
- [ ] 3+ easter egg
- [ ] 2+ seasonal theme hazır
- [ ] Tüm metinler gözden geçirilmiş
- [ ] 0 görsel tutarsızlık

---

## BÖLÜM 3: ÖNCELİK MATRİSİ

```
                        DÜŞÜK ETKİ          YÜKSEK ETKİ
                    ┌─────────────────┬─────────────────┐
                    │                 │                 │
    DÜŞÜK EFOR      │  Phase 15       │  Phase 3        │
                    │  (Gestures)     │  (Skeletons)    │
                    │  Phase 20       │  Phase 11       │
                    │  (A/B Test)     │  (Form Anim)    │
                    ├─────────────────┼─────────────────┤
                    │                 │                 │
    YÜKSEK EFOR     │  Phase 16       │  Phase 1 ⭐     │
                    │  (Dark Mode)    │  (Sound)        │
                    │                 │  Phase 6 ⭐     │
                    │                 │  (Onboarding)   │
                    │                 │  Phase 7 ⭐     │
                    │                 │  (User Profile) │
                    │                 │  Phase 9 ⭐     │
                    │                 │  (Assistant)    │
                    │                 │  Phase 18 ⭐⭐   │
                    │                 │  (Prof. Tools)  │
                    └─────────────────┴─────────────────┘
```

**En Kritik (⭐⭐):** Phase 18 - Profesyonel Araçlar
  → Bu uygulama profesyonellere hitap ediyorsa, PDF rapor ve danışan yönetimi ŞART.

## BÖLÜM 4: UYGULAMA SIRASI

### Sprint 1 (1 Hafta) - TEMEL ALTYAPI
1. Phase 1: Sound System ⭐
2. Phase 2: Haptic System
3. Phase 3: Skeleton Loaders

### Sprint 2 (1 Hafta) - İLK İZLENİM
4. Phase 6: Onboarding & Değer Önerisi ⭐
5. Phase 7: Kullanıcı Profili & Kişiselleştirme ⭐
6. Phase 4: Empty States

### Sprint 3 (1 Hafta) - COŞKU & REHBERLİK
7. Phase 8: Celebration System
8. Phase 9: Ioo Yardımcı Sistemi ⭐
9. Phase 5: Error States

### Sprint 4 (1 Hafta) - PROFESYONEL ARAÇLAR ⭐
10. Phase 18: Profesyonel Araçlar (PDF, Danışan Yönetimi, Grafikler)

### Sprint 5 (1 Hafta) - ANİMASYON & GEÇİŞ
11. Phase 10: Feature Cards
12. Phase 11: Form Animations
13. Phase 12: Navigation

### Sprint 6 (1 Hafta) - LOADING & TUTORIAL
14. Phase 13: Loading States
15. Phase 14: Tutorial System
16. Phase 15: Gestures

### Sprint 7 (1 Hafta) - ERİŞİLEBİLİRLİK & PERFORMANS
17. Phase 16: Dark Mode
18. Phase 17: Accessibility
19. Phase 19: Performance

### Sprint 8 (1 Hafta) - FİNAL
20. Phase 20: A/B Testing
21. Phase 21: Polish & Delight

---

## BÖLÜM 5: BAŞARI METRİKLERİ

### Hedef Puanlar (Dünya Standartları ile)

| Metrik | Şimdi | Hedef | Dünya Standardı |
|--------|-------|-------|-----------------|
| Onboarding Completion | ~60% | 90%+ | 85-95% |
| Day 1 Retention | ~25% | 50%+ | 40-60% |
| Day 7 Retention | ~10% | 30%+ | 20-35% |
| App Store Rating | 4.2 | 4.8+ | 4.7+ |
| NPS Score | ? | 60+ | 50+ |
| Accessibility Score | 60% | 95%+ | 90%+ |
| Performance Score | 70 | 95+ | 90+ |

### Kullanıcı Deneyimi Hedefleri

**Ebeveynler İçin:**
- [ ] İlk 10 saniyede "bu bana yardımcı olacak" hissi
- [ ] Onboarding'de güven ve profesyonellik
- [ ] Çocuğumun dünyasını anlamaya başladım hissi
- [ ] Analiz sonuçlarında "aha" anları
- [ ] Uygulama kullanmak için heyecan

**Profesyoneller İçin:**
- [ ] "Bu iş akışımı kolaylaştıracak" ilk izlenimi
- [ ] Verimli, zaman kaybettirmeyen arayüz
- [ ] Profesyonel raporlar oluşturabilme
- [ ] Danışan verilerini güvenle saklayabilme
- [ ] Meslektaşlara tavsiye etme isteği

---

## BÖLÜM 6: KAYNAKLAR

### Ses Efektleri
- [Mixkit](https://mixkit.co/free-sound-effects/) - Ücretsiz
- [Freesound](https://freesound.org/) - CC lisanslı
- [Zapsplat](https://www.zapsplat.com/) - Ücretsiz kayıt ile

### İkon & İllüstrasyon
- [unDraw](https://undraw.co/) - Ücretsiz illüstrasyonlar
- [Lucide](https://lucide.dev/) - Mevcut ikon seti (zaten kullanılıyor)
- [Lordicon](https://lordicon.com/) - Animasyonlu ikonlar

### Animasyon Referansları
- [Mobbin](https://mobbin.com/) - UI pattern kütüphanesi
- [Dribbble](https://dribbble.com/) - Animasyon inspirasyonları
- [LottieFiles](https://lottiefiles.com/) - Hazır Lottie animasyonları

### Araştırma & Best Practices
- [Ramotion - UX for Kids](https://www.ramotion.com/blog/ux-design-for-kids/)
- [Aufait UX - Child-Friendly UI](https://www.aufaitux.com/blog/ui-ux-designing-for-children/)
- [Motion UI Trends 2026](https://lomatechnology.com/blog/motion-ui-trends-2026/)
- [Ethical Gamification](https://thedecisionlab.com/insights/technology/design-is-becoming-behavioral-heres-how-to-ethically-implement-gamification)

---

## BÖLÜM 7: NOTLAR

### Bu Dokümanı Kullanma

1. **Phase seçimi:** Her seferinde 1-2 phase ile başla
2. **Context koruma:** Phase'i ver, sadece o phase'e odaklan
3. **Test et:** Her phase sonrası test et, sonra diğerine geç
4. **İterasyon:** Geri bildirime göre düzelt

### Örnek Prompt

```
"Phase 6: Onboarding Story implementasyonu yap.
WORLD_CLASS_UI_ROADMAP.md dosyasındaki görevleri takip et.
Sadece bu phase'e odaklan, diğerlerine dokunma."
```

### Dikkat Edilecekler

- Her phase bağımsız test edilebilir olmalı
- Mevcut çalışan özellikleri bozma
- Her değişiklik için git commit
- TypeScript hatası bırakma
- Console.log'ları production'da kaldır

---

**Hazırlayan:** Claude (Deep Analysis Mode)
**Tarih:** 30 Ocak 2026
**Sonraki Güncelleme:** Her phase tamamlandığında

---

*"İyi bir uygulama, kullanıcının fark etmediği binlerce küçük detaydan oluşur."*
