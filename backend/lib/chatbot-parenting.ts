/**
 * ChatBot Parenting FAQ Database
 *
 * Ebeveyn rehberliği ve çocuk gelişimi FAQ'ları
 */

export interface ParentingFAQItem {
  id: string;
  keywords: string[];
  patterns: string[];  // Cümle kalıpları
  question: string;
  answer: string;
  category: 'behavioral' | 'emotional' | 'developmental' | 'social' | 'physical' | 'parenting_tips';
  ageRange?: string;  // "2-4", "4-6", "6-10", "all"
  priority: number;
  needsEmpathy: boolean;
  suggestProfessional?: boolean;
}

// ============================================
// PARENTING FAQ DATABASE (30+ FAQ)
// ============================================

export const PARENTING_FAQ_DATABASE: ParentingFAQItem[] = [
  // ============================================
  // BEHAVIORAL ISSUES (Davranış Sorunları)
  // ============================================
  {
    id: 'parenting_001',
    keywords: ['resim', 'çizim', 'yapmak', 'istemiyor', 'çizmek', 'aktivite'],
    patterns: ['resim yapmak istemiyor', 'çizim yapmıyor', 'resim çizmek istemiyor'],
    question: 'Çocuğum resim yapmak istemiyor, ne yapmalıyım?',
    answer: `**Çocuğunuzun resim yapmak istememesi çok normal!** 🌟

Her çocuk kendini farklı şekillerde ifade eder.

**Neden istemeyebilir:**
• Mükemmeliyetçilik - "Güzel yapamıyorum" korkusu
• Başka aktivitelere daha çok ilgi duyuyor
• Yorgunluk veya dikkat dağınıklığı
• Geçmişte eleştirilmiş hissetmiş olabilir
• O an ruh hali uygun değil

**Yapabilecekleriniz:**
1. 🚫 **Baskı yapmayın** - Zorlamak ilgiyi daha da azaltır
2. 🎨 **Alternatifler sunun** - Boyama, hamur, kolaj, parmak boyası
3. 👨‍👩‍👧 **Birlikte yapın** - Siz de yanında çizin, mükemmel olmasın
4. 🏆 **Süreci övün** - Sonucu değil, denemeyi takdir edin
5. ⏱️ **Kısa tutun** - 5-10 dakikalık aktiviteler yeterli
6. 🎯 **İlgi alanını bulun** - Dinozor seviyorsa dinozor boyama

**Renkioo'da deneyebileceğiniz:**
Boyama sayfalarımız baskısız, eğlenceli bir başlangıç olabilir! Hazır şekiller üzerinde boyama, boş sayfa korkusunu azaltır.

💡 **Unutmayın:** Hiçbir çocuk tüm aktiviteleri sevmek zorunda değil. Çocuğunuzun kendine özgü ilgi alanlarını keşfedin ve destekleyin.`,
    category: 'behavioral',
    ageRange: 'all',
    priority: 10,
    needsEmpathy: true
  },
  {
    id: 'parenting_002',
    keywords: ['paylaşmak', 'paylaşmıyor', 'vermek', 'vermiyor', 'oyuncak', 'kardeş'],
    patterns: ['paylaşmak istemiyor', 'paylaşmıyor', 'oyuncaklarını vermiyor'],
    question: 'Çocuğum paylaşmak istemiyor, ne yapmalıyım?',
    answer: `**Paylaşmamak gelişimsel olarak normaldir!** 💙

Özellikle 2-4 yaş arası çocuklar için "benim" kavramı çok önemlidir.

**Yaşa göre beklentiler:**
• **2-3 yaş:** Paylaşmayı anlamaz, normal
• **3-4 yaş:** Yetişkin yardımıyla paylaşabilir
• **4-5 yaş:** Sıra kavramını öğrenir
• **5+ yaş:** Paylaşmanın sosyal değerini anlar

**Yapabilecekleriniz:**
1. 👀 **Zorlamayın** - "Hemen ver!" yerine "Birazdan sıra ona geçecek"
2. ⏰ **Sıra sistemi kurun** - Zamanlayıcı kullanın
3. 🎁 **Özel oyuncak hakkı** - Bazı oyuncaklar paylaşılmayabilir
4. 🌟 **Modelleyin** - "Ben seninle kurabiyemi paylaşıyorum"
5. 👏 **Övün** - Paylaştığında fark edin ve takdir edin

**Kardeş durumunda:**
Her çocuğun kendine ait bazı eşyaları olsun. Her şeyi paylaşmak zorunda değiller.

💡 **Not:** Paylaşmayı zorlamak, çocukta eşyalarına karşı daha koruyucu olmasına neden olabilir.`,
    category: 'behavioral',
    ageRange: '2-6',
    priority: 9,
    needsEmpathy: true
  },
  {
    id: 'parenting_003',
    keywords: ['dinlemiyor', 'söz', 'dinlemek', 'inat', 'inatçı', 'karşı geliyor'],
    patterns: ['söz dinlemiyor', 'dinlemiyor', 'inatçı', 'karşı geliyor'],
    question: 'Çocuğum söz dinlemiyor, ne yapmalıyım?',
    answer: `**"Söz dinlememek" aslında gelişimin bir parçası!** 🌱

Çocuklar bağımsızlık geliştirirken sınırları test ederler.

**Neden dinlemiyor olabilir:**
• Bağımsızlık ihtiyacı (özellikle 2-3 ve ergenlik)
• Dikkat çekme isteği
• Yönerge çok karmaşık
• Yorgun, aç veya uykusuz
• Güç mücadelesi

**Etkili stratejiler:**
1. 📍 **Göz teması kurun** - Aynı seviyeye inin, gözlerine bakın
2. 🎯 **Kısa ve net olun** - "Oyuncakları topla" vs. uzun açıklamalar
3. ⏳ **Seçenek sunun** - "Önce dişlerini mi fırçalarsın, pijamanı mı giyersin?"
4. ⚡ **Tutarlı olun** - Söylediğinizi yapın, boş tehditler vermeyin
5. 👂 **Dinleyin siz de** - Çocuğunuzun düşüncelerini sorun
6. 🤝 **İşbirliği yapın** - "Birlikte yapalım mı?"

**İşe yarayan cümleler:**
• "Oyuncakları topladığında park için hazır olacaksın" ✅
• "Hemen topla yoksa parka gitmiyoruz!" ❌

💡 **Unutmayın:** Sürekli itaat eden çocuk değil, düşünen ve sorgulayan çocuk yetiştiriyorsunuz.`,
    category: 'behavioral',
    ageRange: 'all',
    priority: 10,
    needsEmpathy: true
  },
  {
    id: 'parenting_004',
    keywords: ['öfke', 'sinir', 'kızgın', 'bağırıyor', 'çığlık', 'nöbet', 'tantrum'],
    patterns: ['öfke nöbeti', 'sinir krizi', 'çığlık atıyor', 'bağırıyor'],
    question: 'Çocuğum öfke nöbetleri geçiriyor, ne yapmalıyım?',
    answer: `**Öfke nöbetleri 1-4 yaş arasında çok yaygındır!** 💪

Çocuklar duygularını henüz yönetmeyi öğrenmedi.

**Neden oluyor:**
• Dil becerileri duygularını ifade etmeye yetmiyor
• Hayal kırıklığı yönetimi henüz gelişmemiş
• Yorgunluk, açlık, aşırı uyarılma
• Bağımsızlık isteği ile sınırlar çatışıyor

**Nöbet sırasında:**
1. 🧘 **Sakin kalın** - Sizin sakinliğiniz bulaşıcıdır
2. 🛡️ **Güvende tutun** - Kendine/başkalarına zarar vermesini engelleyin
3. 🚫 **Mantık aramayın** - O an mantıklı konuşma işe yaramaz
4. 🤗 **Yanında olun** - "Buradayım, geçecek"
5. ⏳ **Bekleyin** - Genellikle 1-3 dakika sürer

**Nöbet sonrasında:**
• Sarılın, sakinleştiğini takdir edin
• "Çok kızgındın, zor oldu değil mi?"
• Ne olduğunu kısa konuşun (daha sonra)

**Önleme:**
• Düzenli uyku ve beslenme
• Geçişlere hazırlık ("5 dakika sonra parktan gideceğiz")
• Seçenek sunma

⚠️ **Dikkat:** 4 yaş sonrası sık ve şiddetli nöbetler devam ederse, uzman desteği faydalı olabilir.`,
    category: 'emotional',
    ageRange: '1-4',
    priority: 10,
    needsEmpathy: true,
    suggestProfessional: false
  },

  // ============================================
  // EMOTIONAL ISSUES (Duygusal Sorunlar)
  // ============================================
  {
    id: 'parenting_005',
    keywords: ['karanlık', 'korkuyor', 'korku', 'gece', 'ışık', 'yalnız'],
    patterns: ['karanlıktan korkuyor', 'gece korkuyor', 'yalnız kalmak istemiyor'],
    question: 'Çocuğum karanlıktan korkuyor, ne yapmalıyım?',
    answer: `**Karanlık korkusu 2-6 yaş arasında çok yaygındır!** 🌙

Bu dönemde hayal gücü gelişir ama gerçekle hayal ayrımı henüz net değildir.

**Neden oluyor:**
• Hayal gücü gelişiyor, canavarlar "gerçek" gibi hissediyor
• Görsel olmadan çevre tanıdık gelmiyor
• Bilinmeyenden korku doğal bir savunma mekanizması

**Yapabilecekleriniz:**
1. 💡 **Gece lambası kullanın** - Hafif, sıcak ışık
2. 🧸 **Koruyucu nesne** - Özel oyuncak veya battaniye
3. 🚫 **Korkuyu küçümsemeyin** - "Korkulacak bir şey yok" yerine "Korkmak normal"
4. 🔦 **El feneri verin** - Kontrol hissi verir
5. 📖 **Karanlık temalı kitaplar** - "Karanlıktan korkan küçük ayı" gibi
6. 🎮 **Karanlık oyunları** - Gündüz, perde kapalı gölge oyunları

**Yatmadan önce ritüel:**
• Odayı birlikte kontrol edin ("Bak, dolabın içi boş")
• Canavar spreyi (su spreyi, "Canavar Kovucu" etiketiyle)
• Kapıyı aralık bırakın

💡 **Not:** Çoğu çocuk 7-8 yaşında bu korkuyu atlatır.`,
    category: 'emotional',
    ageRange: '2-6',
    priority: 9,
    needsEmpathy: true
  },
  {
    id: 'parenting_006',
    keywords: ['kabus', 'kötü rüya', 'uyanıyor', 'ağlayarak', 'gece', 'rüya'],
    patterns: ['kabus görüyor', 'kötü rüya', 'gece ağlayarak uyanıyor'],
    question: 'Çocuğum kabus görüyor, ne yapmalıyım?',
    answer: `**Kabuslar 3-6 yaş arasında yaygındır!** 🌙

Hayal gücü ve duyguları işlemenin doğal bir parçasıdır.

**Kabus anında:**
1. 🤗 **Sarılın, güvence verin** - "Buradayım, güvendesin"
2. 💡 **Hafif ışık açın** - Gerçekliği görmesine yardımcı olur
3. 🗣️ **Dinleyin** - İsterse rüyayı anlatsın (zorlamayın)
4. 🧘 **Sakinleştirin** - Derin nefesler, hafif müzik

**Önleme için:**
• Yatmadan önce korkutucu içerik yok (TV, oyun)
• Sakin yatma rutini
• Yeterli uyku (uykusuzluk kabusları artırır)
• Gündüz stresini azaltın

**Kabus vs Gece Terörü:**
| Kabus | Gece Terörü |
|-------|-------------|
| REM uykusunda | Derin uykuda |
| Uyanır, hatırlar | Uyanmaz, hatırlamaz |
| Sakinleştirilebilir | Müdahale etmeyin, bekleyin |

⚠️ **Dikkat:** Haftada birkaç kez şiddetli kabuslar, gündüz anksiyete ile birlikteyse, uzman görüşü faydalı olabilir.`,
    category: 'emotional',
    ageRange: '3-8',
    priority: 9,
    needsEmpathy: true
  },
  {
    id: 'parenting_007',
    keywords: ['ayrılık', 'kaygı', 'anksiyete', 'bırakmak', 'istemiyor', 'okul', 'kreş'],
    patterns: ['ayrılık kaygısı', 'bırakmak istemiyor', 'peşimden gelmiyor'],
    question: 'Çocuğum ayrılık kaygısı yaşıyor, ne yapmalıyım?',
    answer: `**Ayrılık kaygısı gelişimin normal bir parçasıdır!** 💙

8-14 ay ve 2-3 yaş dönemlerinde pik yapar.

**Normal ayrılık kaygısı:**
• Ebeveyn ayrılırken kısa süreli üzüntü
• Birkaç dakika içinde sakinleşir
• Günlük aktivitelere katılabilir

**Şiddetli ayrılık kaygısı belirtileri:**
• Aşırı sıkıntı, uzun süren ağlama
• Fiziksel belirtiler (karın ağrısı, bulantı)
• Okula/kreşe gitmeyi reddetme
• Uyku sorunları

**Yapabilecekleriniz:**
1. 👋 **Vedalaşın** - Kaçarak gitmeyin, kısa ve güvenli veda
2. ⏰ **Döneceğinizi belirtin** - "Uyuduktan sonra geleceğim"
3. 📦 **Geçiş nesnesi** - Sizin kokunuzu taşıyan eşya
4. 🎯 **Kısa ayrılıklar** - Yavaş yavaş süreyi artırın
5. 🤝 **Bakıcı ile tanışma** - Siz varken tanışsın
6. 📞 **Tutarlı olun** - Döneceğinizi söylediyseniz dönün

**Okul/Kreş için:**
• Önceden ziyaret edin
• Kısa süreli başlayın
• Öğretmenle işbirliği yapın

⚠️ 4 yaş sonrası şiddetli ve kalıcı ayrılık kaygısında profesyonel destek öneririz.`,
    category: 'emotional',
    ageRange: 'all',
    priority: 10,
    needsEmpathy: true,
    suggestProfessional: false
  },
  {
    id: 'parenting_008',
    keywords: ['utangaç', 'çekingen', 'konuşmuyor', 'yabancı', 'sosyal', 'içe kapanık'],
    patterns: ['çok utangaç', 'yabancılarla konuşmuyor', 'içine kapanık'],
    question: 'Çocuğum çok utangaç, ne yapmalıyım?',
    answer: `**Utangaçlık bir kişilik özelliğidir, sorun değil!** 🌸

Dışa dönük olmak zorunda değiller.

**Utangaçlık vs Sosyal Anksiyete:**
• **Utangaçlık:** Yeni durumlarda çekingen, zamanla ısınır
• **Sosyal anksiyete:** Sosyal durumlardan kaçınma, günlük yaşamı etkiler

**Yapabilecekleriniz:**
1. 🏷️ **Etiketlemeyin** - "O utangaç" yerine "Isınması biraz zaman alıyor"
2. 🚫 **Zorlamayın** - Performans baskısı kaygıyı artırır
3. 👥 **Küçük gruplar** - Birebir veya 2-3 kişilik aktiviteler
4. 🎭 **Hazırlayın** - Yeni durumları önceden anlatın
5. 💪 **Güçlü yanları vurgulayın** - İyi dinleyici, düşünceli, gözlemci
6. 🏠 **Güvenli alan** - Evde rahat ifade etsin

**Sosyal beceri geliştirme:**
• Rol yapma oyunları evde
• İlgi alanı grupları (resim, müzik, spor)
• Bir arkadaşla başlamak

💡 **Unutmayın:** Dünyada başarılı, mutlu birçok içe dönük insan var. Çocuğunuzun olduğu gibi kabul edin.`,
    category: 'social',
    ageRange: 'all',
    priority: 8,
    needsEmpathy: true
  },

  // ============================================
  // DEVELOPMENTAL (Gelişimsel)
  // ============================================
  {
    id: 'parenting_009',
    keywords: ['geride', 'gecikme', 'gelişim', 'normal', 'yaşıtları', 'akranları'],
    patterns: ['yaşına göre geride', 'normal mi', 'gelişim geriliği', 'akranlarından geride'],
    question: 'Çocuğum yaşına göre geride mi?',
    answer: `**Her çocuğun gelişim hızı farklıdır!** 📊

Gelişim "ortalamalar" etrafında geniş bir yelpazedir.

**Gelişim alanları:**
• **Motor:** Oturma, yürüme, koşma, ince motor
• **Dil:** Anlama, konuşma, kelime hazinesi
• **Sosyal-Duygusal:** Etkileşim, empati, duygular
• **Bilişsel:** Problem çözme, bellek, dikkat

**Dikkat edilecekler:**
✅ Kendi hızında ilerleme var mı?
✅ İlgi ve merak gösteriyor mu?
✅ Çevreyle etkileşim kuruyor mu?

**Ne zaman uzman görüşü:**
• Daha önce yaptığı becerileri kaybettiyse
• Göz teması kurmuyorsa
• 2 yaşında hiç kelime yoksa
• Motor becerilerde belirgin gecikme

**Renkioo'da:**
Çizim analizlerimiz gelişimsel bir değerlendirme sağlamaz, yalnızca duygusal ifadeyi yansıtır.

💡 **Önemli:** Karşılaştırma yerine çocuğunuzun kendi ilerlemesine odaklanın. Endişeleriniz varsa, çocuk doktorunuzla görüşün.`,
    category: 'developmental',
    ageRange: 'all',
    priority: 10,
    needsEmpathy: true,
    suggestProfessional: true
  },
  {
    id: 'parenting_010',
    keywords: ['yaratıcılık', 'destekle', 'geliştir', 'hayal gücü', 'sanat', 'resim'],
    patterns: ['yaratıcılığı nasıl', 'hayal gücünü geliştirmek', 'sanatsal yeteneği'],
    question: 'Çocuğumun yaratıcılığını nasıl desteklerim?',
    answer: `**Yaratıcılık her çocukta vardır, sadece ortam ister!** 🎨

**Yapabilecekleriniz:**
1. 🎨 **Malzeme sağlayın** - Kağıt, boya, hamur, doğal malzemeler
2. 🚫 **Yönlendirmeyin** - "Güneş sarı olmalı" demeyin
3. 🔍 **Süreci övün** - "Ne güzel renkler kullanmışsın!" (sonuç değil)
4. ❓ **Sorular sorun** - "Bu ne anlatıyor?" "Sonra ne olacak?"
5. 🎭 **Hayal oyunları** - Rol yapma, kutu evler, kale yapma
6. 📖 **Kitap okuyun** - Hayal gücünü besler
7. 😴 **Can sıkıntısına izin verin** - Her an dolu program yaratıcılığı öldürür

**Kaçınılması gerekenler:**
❌ Eleştirmek veya düzeltmek
❌ "Doğru" yol göstermek
❌ Karşılaştırmak
❌ Her zaman örnek vermek

**Renkioo'da:**
Boyama sayfalarımız başlangıç noktası olabilir - ama asıl sihir çocuğunuzun kendi çizimlerinde!

💡 **Not:** Dağınıklık yaratıcılığın bir parçasıdır. Temizlik sonra yapılabilir!`,
    category: 'parenting_tips',
    ageRange: 'all',
    priority: 8,
    needsEmpathy: false
  },

  // ============================================
  // PHYSICAL/DAILY ROUTINES (Fiziksel/Günlük Rutinler)
  // ============================================
  {
    id: 'parenting_011',
    keywords: ['uyku', 'uyumuyor', 'yatmak', 'istemiyor', 'gece', 'uyanıyor'],
    patterns: ['uyumak istemiyor', 'yatmıyor', 'gece uyanıyor', 'uyku sorunu'],
    question: 'Çocuğum uyumak istemiyor, ne yapmalıyım?',
    answer: `**Uyku mücadelesi çok yaygın bir ebeveynlik deneyimi!** 🌙

**Yaşa göre uyku ihtiyacı:**
• 1-2 yaş: 11-14 saat (gündüz dahil)
• 3-5 yaş: 10-13 saat
• 6-12 yaş: 9-11 saat

**Neden yatmak istemeyebilir:**
• FOMO - Bir şey kaçıracak korkusu
• Ayrılık kaygısı
• Fazla uyarılmış/yorgun
• Gündüz uykusu çok/az
• Tutarsız rutin

**Etkili uyku rutini:**
1. ⏰ **Aynı saat** - Her gün aynı yatma saati
2. 📱 **Ekran yok** - Yatmadan 1 saat önce
3. 🛁 **Sakin aktiviteler** - Banyo, kitap, ninni
4. 🌡️ **Uygun ortam** - Serin, karanlık, sessiz
5. 📖 **Tahmin edilebilir sıra** - Diş fırçalama → Pijama → Kitap → Öpücük
6. ⏱️ **Geçişe hazırlık** - "10 dakika sonra yatma zamanı"

**İşe yarayan yaklaşımlar:**
• Uykudan önce seçenek: "Mavi pijama mı, yeşil mi?"
• Pozitif çağrışım: "Yarın parka gideceğiz, dinlenmiş olman lazım"
• Tutarlılık: İstisnalar kafa karıştırır

💡 **Not:** Değişiklikler birkaç hafta sürebilir, sabırlı olun.`,
    category: 'physical',
    ageRange: 'all',
    priority: 9,
    needsEmpathy: true
  },
  {
    id: 'parenting_012',
    keywords: ['yemek', 'yemiyor', 'seçici', 'iştah', 'beslenme', 'sebze'],
    patterns: ['yemek yemiyor', 'seçici yiyici', 'sebze yemiyor', 'iştahsız'],
    question: 'Çocuğum yemek yemiyor / çok seçici, ne yapmalıyım?',
    answer: `**Seçici yeme 2-6 yaş arasında çok yaygındır!** 🥦

Bu dönemde neofobi (yeni yiyecek korkusu) normaldir.

**Neden seçici:**
• Kontrol ihtiyacı (bağımsızlık dönemi)
• Tat tomurcukları hassas
• Doku hassasiyeti
• Yeni yiyecek korkusu

**Yapabilecekleriniz:**
1. 🍽️ **Baskı yapmayın** - "Bir lokma daha!" stresi artırır
2. 🔄 **Tekrar sunun** - 10-15 kez görmesi gerekebilir
3. 👨‍👩‍👧 **Birlikte yiyin** - Model olun
4. 🎨 **Eğlenceli sunun** - Şekiller, renkler, isimler
5. 👩‍🍳 **Mutfağa dahil edin** - Hazırlamaya katılsın
6. ⏰ **Düzenli öğünler** - Atıştırmalık sınırlı
7. 🆕 **Yeni + Tanıdık** - Tabakta her ikisi de olsun

**Kaçınılacaklar:**
❌ Yemek yerse ödül vermek
❌ "Bitirmezsen tatlı yok" şantajı
❌ Alternatif yemek hazırlamak
❌ Yemek zamanını stresli hale getirmek

⚠️ **Dikkat:** Kilo kaybı, enerji düşüklüğü, çok sınırlı yiyecek listesi varsa doktora başvurun.`,
    category: 'physical',
    ageRange: '2-8',
    priority: 9,
    needsEmpathy: true
  },
  {
    id: 'parenting_013',
    keywords: ['ekran', 'telefon', 'tablet', 'tv', 'televizyon', 'bağımlı', 'izliyor'],
    patterns: ['ekran süresi', 'tablet bağımlısı', 'sürekli ekran', 'telefon istiyor'],
    question: 'Çocuğum sürekli ekran/tablet istiyor, ne yapmalıyım?',
    answer: `**Ekran yönetimi modern ebeveynliğin en zor konularından!** 📱

**Önerilen ekran süreleri (AAP):**
• 0-18 ay: Görüntülü arama hariç yok
• 18-24 ay: Ebeveynle birlikte, kaliteli içerik
• 2-5 yaş: Günde max 1 saat
• 6+ yaş: Tutarlı sınırlar koyun

**Ekran yerine:**
🎨 Sanat aktiviteleri
📖 Kitap okuma
🏃 Dış mekan oyunları
🧩 Yapboz, lego, masa oyunları
🎭 Hayal oyunları

**Sağlıklı ekran kullanımı için:**
1. ⏰ **Net sınırlar** - "Yemekten sonra 30 dakika"
2. 📍 **Ortak alanda** - Odada değil, salonda
3. 👀 **İçerik kontrolü** - Ne izlediğini bilin
4. 🎬 **Birlikte izleyin** - Konuşun, sorular sorun
5. 📱 **Örnek olun** - Siz de ekran başında değilseniz
6. ⏰ **Zamanlayıcı kullanın** - Çocuk da görsün

**Geçiş kolaylaştırıcılar:**
• "Bu bölüm bitince kapatıyoruz"
• Sonraki aktiviteyi cazip yapın
• Ani değil, kademeli azaltma

💡 **Renkioo farkı:** Dijital boyama, pasif izlemeden farklı olarak aktif yaratıcılık içerir!`,
    category: 'parenting_tips',
    ageRange: 'all',
    priority: 10,
    needsEmpathy: true
  },

  // ============================================
  // SOCIAL ISSUES (Sosyal Konular)
  // ============================================
  {
    id: 'parenting_014',
    keywords: ['arkadaş', 'edinemiyor', 'yalnız', 'oynamıyor', 'dışlanıyor'],
    patterns: ['arkadaş edinemiyor', 'arkadaşı yok', 'kimseyle oynamıyor'],
    question: 'Çocuğum arkadaş edinemiyor, ne yapmalıyım?',
    answer: `**Arkadaşlık becerileri öğrenilen becerilerdir!** 👫

**Yaşa göre arkadaşlık:**
• **2-3 yaş:** Paralel oyun (yan yana ama ayrı)
• **3-4 yaş:** İşbirlikçi oyun başlar
• **4-5 yaş:** "En iyi arkadaş" kavramı
• **6+ yaş:** Grup dinamikleri, klikler

**Yapabilecekleriniz:**
1. 🏠 **Ev davetleri** - Kontrollü ortamda pratik
2. 👤 **Bir çocukla başlayın** - Grup değil, birebir
3. 🎯 **Ortak ilgi alanı** - Aynı şeyi seven çocuklarla
4. 🎭 **Evde pratik** - Rol yapma: "Selam, adın ne?"
5. 📖 **Sosyal hikayeler** - Arkadaşlık temalı kitaplar
6. 👀 **Gözlemleyin** - Nerede zorlanıyor?

**Öğretilecek beceriler:**
• Sıra bekleme
• Paylaşma
• Kaybetmeyi kabullenme
• "Oynayabilir miyim?" demeyi

**Dikkat:**
❌ Zorla arkadaş ayarlamak
❌ "Neden arkadaşın yok?" baskısı
❌ Popüler olmaya zorlamak

💡 **Not:** Bazı çocuklar doğal olarak daha az arkadaşla daha derin bağ kurar. Bu da sağlıklıdır.`,
    category: 'social',
    ageRange: 'all',
    priority: 9,
    needsEmpathy: true
  },
  {
    id: 'parenting_015',
    keywords: ['okul', 'gitmek', 'istemiyor', 'kreş', 'anaokulu', 'ağlıyor'],
    patterns: ['okula gitmek istemiyor', 'kreşte ağlıyor', 'okul korkusu'],
    question: 'Çocuğum okula/kreşe gitmek istemiyor, ne yapmalıyım?',
    answer: `**Okul reddi çok yaygın bir durumdur!** 🏫

**Olası nedenler:**
• Ayrılık kaygısı
• Sosyal zorluklar (arkadaş bulamama, dışlanma)
• Akademik kaygı (başaramama korkusu)
• Zorbalık
• Öğretmenle uyumsuzluk
• Ev ortamında değişiklik (yeni kardeş, taşınma)

**Yapabilecekleriniz:**
1. 🗣️ **Dinleyin** - "Okul hakkında en çok neyi sevmiyorsun?"
2. 🤝 **Okulla işbirliği** - Öğretmenle görüşün
3. 📍 **Spesifik olun** - "Her gün mi, bazı günler mi?"
4. 🌅 **Sabah rutini** - Öngörülebilir, sakin
5. 🎯 **Küçük hedefler** - "Bugün sadece resim dersine kadar"
6. 🏆 **Olumluya odaklanın** - "En çok neyi seviyorsun orada?"

**Yapmamanız gerekenler:**
❌ Evde kalmasına izin vermek (davranışı pekiştirir)
❌ "Büyük çocuklar ağlamaz" demek
❌ Öğretmeni/okulu kötülemek
❌ Uzun vedalar

⚠️ **Profesyonel destek düşünün eğer:**
• Fiziksel belirtiler varsa (karın ağrısı, baş ağrısı)
• 2 haftadan uzun sürüyorsa
• Okuldan kaçma davranışı varsa`,
    category: 'social',
    ageRange: '3-12',
    priority: 10,
    needsEmpathy: true,
    suggestProfessional: false
  },
  {
    id: 'parenting_016',
    keywords: ['kardeş', 'kavga', 'kıskanç', 'vuruyor', 'geçimsizlik'],
    patterns: ['kardeşler kavga ediyor', 'kardeşini kıskanıyor', 'kardeşiyle geçinemiyor'],
    question: 'Çocuklarım sürekli kavga ediyor, ne yapmalıyım?',
    answer: `**Kardeş kavgaları evrensel bir deneyimdir!** 👧👦

Aslında sosyal beceri gelişimi için fırsattır.

**Neden kavga ederler:**
• Dikkat rekabeti
• Farklı gelişim aşamaları
• Kıskançlık
• Can sıkıntısı
• Güç mücadelesi

**Müdahale stratejileri:**
1. 🚫 **Hakem olmayın** - "Kim başlattı?" sormayın
2. 🧘 **Sakin kalın** - Sizin tepkiniz örnek
3. 🎯 **Her ikisini de dinleyin** - Sırayla
4. 💡 **Çözüm buldurtun** - "Nasıl çözebilirsiniz?"
5. 🛡️ **Fiziksel şiddete sıfır tolerans** - Ayırın, sakinleşene kadar bekleyin

**Önleme:**
• Her çocuğa özel zaman ayırın
• Karşılaştırmaktan kaçının ("Ablan yapabiliyor")
• Kendi alanları olsun
• Pozitif etkileşimleri övün

**Hakem olmanız gereken durumlar:**
• Fiziksel zarar riski
• Güç dengesizliği (yaş farkı büyükse)
• Zorbalık belirtileri

💡 **Not:** Bir miktar çatışma normaldir ve problem çözme becerisi geliştirir.`,
    category: 'behavioral',
    ageRange: 'all',
    priority: 9,
    needsEmpathy: true
  },

  // ============================================
  // PARENTING TIPS (Ebeveynlik İpuçları)
  // ============================================
  {
    id: 'parenting_017',
    keywords: ['özgüven', 'güven', 'cesaret', 'korku', 'denemek'],
    patterns: ['özgüvenini nasıl artırırım', 'cesareti yok', 'kendine güvenmiyor'],
    question: 'Çocuğumun özgüvenini nasıl artırabilirim?',
    answer: `**Özgüven, deneyimlerle inşa edilir!** 💪

**Özgüven oluşturan yaklaşımlar:**
1. 🎯 **Gerçekçi övgü** - "Çok çalıştın" > "En zekisin"
2. 💪 **Çaba odaklı övgü** - Sonuç değil süreç
3. 🧩 **Başarılabilir görevler** - Yaşına uygun sorumluluklar
4. ❌ **Hatasını düzeltmeyin** - Kendi çözsün
5. 🗣️ **Duyguları adlandırın** - "Hayal kırıklığına uğradın"
6. 🤝 **Seçenek sunun** - Kontrol hissi verir
7. 💙 **Koşulsuz sevgi** - Başarısız olsa da değerli

**Kaçınılacaklar:**
❌ "Sen yapamazsın, ben yapayım"
❌ Abartılı övgü ("En iyisi sensin!")
❌ Başkalarıyla karşılaştırma
❌ Hataları eleştirmek
❌ Aşırı koruma

**Ev içi sorumluluklar (yaşa göre):**
• 2-3 yaş: Oyuncak toplama
• 4-5 yaş: Yatağını düzeltme
• 6-7 yaş: Sofra hazırlığına yardım
• 8+ yaş: Kendi odasını toplama

💡 **Anahtar:** "Yapamazsın" yerine "Henüz yapamıyorsun" (growth mindset)`,
    category: 'parenting_tips',
    ageRange: 'all',
    priority: 8,
    needsEmpathy: false
  },
  {
    id: 'parenting_018',
    keywords: ['ceza', 'disiplin', 'sınır', 'kural', 'dayak', 'bağırmak'],
    patterns: ['nasıl ceza vermeliyim', 'disiplin yöntemleri', 'sınır koymak'],
    question: 'Çocuğuma nasıl sınır koymalıyım / disiplin uygulamalıyım?',
    answer: `**Disiplin, ceza değil öğretmektir!** 📚

**Etkili disiplin ilkeleri:**
1. 🎯 **Net ve tutarlı kurallar** - Herkes aynı kuralları uygular
2. 💙 **Sevgi ile sınır** - "Hayır" demek sevgisizlik değil
3. 🧠 **Yaşa uygun beklenti** - 2 yaşından impulse control beklemeyin
4. ⚡ **Anında sonuç** - Gecikmeli ceza bağlantı kurmaz
5. 🔗 **Mantıksal sonuçlar** - Oyuncak kırdı → o oyuncakla oynayamaz

**Ceza yerine:**
• **Doğal sonuçlar:** Montunu giymedi → üşüdü
• **Mantıksal sonuçlar:** Duvara çizdi → temizlemeye yardım eder
• **Mola:** Sakinleşme köşesi (ceza değil, düzenleme)
• **Ayrıcalık kaybı:** Tablet yokken kitap var

**Kesinlikle kaçınılacaklar:**
❌ Fiziksel ceza (tokatı vb.)
❌ Aşağılama, küçük düşürme
❌ Sevgi geri çekme ("Artık seni sevmiyorum")
❌ Tutarsızlık (bazen izin, bazen ceza)
❌ Boş tehditler

**Pozitif disiplin:**
✅ İstenen davranışı övün
✅ Dikkatinizi olumluya verin
✅ Yönlendirin: "Koşma" yerine "Yürü"

💡 **Hatırlayın:** Amaç itaat değil, özdenetim geliştirmek.`,
    category: 'parenting_tips',
    ageRange: 'all',
    priority: 9,
    needsEmpathy: false
  },

  // ============================================
  // PROFESSIONAL REFERRAL (Uzman Yönlendirme)
  // ============================================
  {
    id: 'parenting_019',
    keywords: ['uzman', 'psikolog', 'doktor', 'tedavi', 'terapi', 'endişe'],
    patterns: ['ne zaman uzmana', 'psikolog gerekli mi', 'doktora götürmeli miyim'],
    question: 'Ne zaman profesyonel yardım almalıyım?',
    answer: `**Uzman desteği almak güçlülük göstergesidir!** 👨‍⚕️

**Şu durumlarda profesyonel desteği düşünün:**

**Davranışsal:**
• Şiddetli ve sık öfke nöbetleri (4+ yaş)
• Sürekli agresif davranış
• Kendine veya başkalarına zarar verme
• Aşırı korku veya kaygı
• Okul/kreş reddi (2+ hafta)

**Gelişimsel:**
• Daha önce kazanılmış becerilerin kaybı
• Yaşıtlarından belirgin gecikme
• Göz teması kurmama
• 2 yaşında kelime yok

**Duygusal:**
• Uzun süreli mutsuzluk
• İlgi kaybı (oyun, arkadaş)
• Uyku/yeme bozuklukları
• Aşırı içe kapanma

**Kimden yardım alınır:**
• **Çocuk doktoru:** İlk değerlendirme
• **Çocuk psikoloğu:** Davranış, duygusal sorunlar
• **Çocuk psikiyatristi:** İlaç gerekebilecek durumlar
• **Gelişim uzmanı:** Motor, dil gecikmeleri
• **Oyun terapisti:** Küçük çocuklar için

💙 **Unutmayın:** Erken müdahale her zaman daha etkilidir. Sormak zarar vermez, beklemek verebilir.`,
    category: 'parenting_tips',
    ageRange: 'all',
    priority: 10,
    needsEmpathy: true,
    suggestProfessional: true
  },
  {
    id: 'parenting_020',
    keywords: ['çizim', 'anlam', 'yorumlama', 'resim', 'ifade'],
    patterns: ['çizimlerinden ne anlamalıyım', 'resmi ne anlatıyor', 'çizim yorumlama'],
    question: 'Çocuğumun çizimlerinden ne anlamalıyım?',
    answer: `**Çizimler duyguların pencereleridir - ama dikkatli yorumlanmalı!** 🎨

**Çizimlerde dikkat edilecekler:**
• Kullanılan renkler ve çeşitlilik
• Figürlerin boyutları ve yerleşimi
• Aile üyelerinin çizimi
• Tekrarlayan temalar
• Baskı ve çizgi kalitesi

**Dikkat edilmesi gerekenler:**
⚠️ Tek bir çizimden yorum yapmayın
⚠️ Çocuğa sorun: "Bu ne anlatıyor?"
⚠️ Yaşa göre değerlendirin
⚠️ Kültürel faktörleri düşünün

**Ne zaman dikkat etmeli:**
• Sürekli karanlık/üzgün temalar
• Aile çizimlerinde kendini dışarıda bırakma
• Ani değişiklikler (renkli → siyah)
• Tekrarlayan şiddet temaları

**Renkioo'da:**
Çizim analizimiz yapay zeka desteklidir ve genel eğilimleri gösterir. Kesin tanı veya değerlendirme sağlamaz.

💡 **Önemli:** Çizim analizi profesyonel psikolojik değerlendirmenin yerini tutmaz. Ciddi endişeleriniz varsa, uzman görüşü alın.`,
    category: 'parenting_tips',
    ageRange: 'all',
    priority: 8,
    needsEmpathy: false
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Normalize text for matching
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ğ]/g, 'g')
    .replace(/[ü]/g, 'u')
    .replace(/[ş]/g, 's')
    .replace(/[ı]/g, 'i')
    .replace(/[ö]/g, 'o')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find best matching parenting FAQ
 */
export function findParentingFAQ(message: string): ParentingFAQItem | null {
  const normalized = normalizeText(message);
  const words = normalized.split(' ');

  let bestMatch: ParentingFAQItem | null = null;
  let bestScore = 0;

  for (const faq of PARENTING_FAQ_DATABASE) {
    let score = 0;

    // Check pattern matches (highest weight)
    for (const pattern of faq.patterns) {
      if (normalized.includes(normalizeText(pattern))) {
        score += 5;
      }
    }

    // Check keyword matches
    for (const keyword of faq.keywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (words.includes(normalizedKeyword) || normalized.includes(normalizedKeyword)) {
        score += 2;
      }
    }

    // Priority bonus
    score += (faq.priority / 10);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  // Minimum threshold for match
  if (bestScore >= 4) {
    return bestMatch;
  }

  return null;
}

/**
 * Get FAQ by ID
 */
export function getParentingFAQById(id: string): ParentingFAQItem | null {
  return PARENTING_FAQ_DATABASE.find(faq => faq.id === id) || null;
}

/**
 * Get FAQs by category
 */
export function getParentingFAQsByCategory(category: ParentingFAQItem['category']): ParentingFAQItem[] {
  return PARENTING_FAQ_DATABASE.filter(faq => faq.category === category);
}

/**
 * Get all parenting FAQs
 */
export function getAllParentingFAQs(): ParentingFAQItem[] {
  return PARENTING_FAQ_DATABASE;
}

/**
 * Get suggested follow-up questions for a parenting topic
 */
export function getParentingFollowUps(category: ParentingFAQItem['category']): string[] {
  const followUps: Record<string, string[]> = {
    behavioral: [
      'Bu davranış ne kadar süredir devam ediyor?',
      'Hangi durumlarda daha çok ortaya çıkıyor?',
      'Başka ne denememi önerirsiniz?'
    ],
    emotional: [
      'Çocuğumla bu konuyu nasıl konuşabilirim?',
      'Ne zaman profesyonel yardım almalıyım?',
      'Evde yapabileceğim başka şeyler var mı?'
    ],
    developmental: [
      'Bu yaş için normal mi?',
      'Ne zaman endişelenmeliyim?',
      'Gelişimini nasıl destekleyebilirim?'
    ],
    social: [
      'Sosyal becerilerini nasıl geliştirebilirim?',
      'Arkadaşlık için ne yapabilirim?',
      'Okul/kreş hakkında ne yapmalıyım?'
    ],
    physical: [
      'Rutinleri nasıl oluşturabilirim?',
      'Ne kadar süre normal?',
      'Doktora başvurmalı mıyım?'
    ],
    parenting_tips: [
      'Başka öneriniz var mı?',
      'Yaşına göre ne beklemeliyim?',
      'Daha fazla kaynak önerebilir misiniz?'
    ]
  };

  return followUps[category] || followUps.parenting_tips;
}
