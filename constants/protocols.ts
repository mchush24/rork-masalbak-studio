export interface ProtocolPhase {
  name: string;
  instruction: string;
  duration?: string;
  notes?: string[];
}

export interface RequiredImage {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
}

export interface Protocol {
  title: string;
  ageRange: string;
  duration: string;
  materials: string[];
  phases: ProtocolPhase[];
  observations: string[];
  donts: string[];
  captureHints: string[];
  scoringNotes?: string[];
  requiredImages: RequiredImage[];
}

export const PROTOCOLS: Record<string, Protocol> = {
  DAP: {
    title: "Bir İnsan Çiz (DAP - Koppitz)",
    ageRange: "5-12 yaş",
    duration: "10-15 dakika",
    materials: [
      "A4 beyaz kağıt (çizgisiz)",
      "HB kurşun kalem (silgisiz)",
      "Silgi (ayrı, istenirse verilir)",
      "Kronometre"
    ],
    phases: [
      {
        name: "Hazırlık",
        instruction: "Kağıdı dikey olarak çocuğun önüne koy. Kalemi kağıt yanına bırak.",
        notes: [
          "Sessiz, dikkat dağıtıcı olmayan ortam sağla",
          "Çocuk rahat oturmalı, masa yüksekliği uygun olmalı"
        ]
      },
      {
        name: "Yönerge",
        instruction: "Bu kağıda bir insan çiz. İstediğin gibi çizebilirsin. Bitirdiğinde bana haber ver.",
        notes: [
          "Eğer 'Nasıl?' diye sorarsa: 'İstediğin gibi çizebilirsin' de",
          "Eğer 'Kız mı erkek mi?' diye sorarsa: 'Hangisini istersen' de",
          "Eğer sadece yüz/baş çizerse: 'Şimdi tüm vücudu çiz' de"
        ]
      },
      {
        name: "Gözlem",
        instruction: "Çizim sırasında sessizce gözlem yap ve not al.",
        duration: "Çocuk bitirene kadar",
        notes: [
          "Başlangıç ve bitiş saatini kaydet",
          "Hangi vücut parçasından başladığını not et",
          "Silgi kullanımı varsa kaç kez ve nerede",
          "Tereddüt ettiği yerleri not et",
          "Kağıdı döndürme davranışı"
        ]
      },
      {
        name: "Sorgulama (Opsiyonel)",
        instruction: "Çizim bittikten sonra sorular sor.",
        notes: [
          "Bu kim? (Kendisi mi, başkası mı?)",
          "Kaç yaşında?",
          "Ne yapıyor?",
          "Nasıl hissediyor?"
        ]
      }
    ],
    observations: [
      "Çizim süresi (dk:sn)",
      "Başlangıç noktası (baş/gövde/ayak)",
      "Çizim sırası",
      "Silgi kullanımı (sayı ve bölge)",
      "Kalem basıncı (hafif/normal/sert)",
      "Çizgi kalitesi (akıcı/kesik/titrek)",
      "Kağıt döndürme",
      "Söz ifadeleri (varsa)"
    ],
    donts: [
      "Yönlendirme yapma (elleri de çiz, gözleri unutma vb.)",
      "Güzel/çirkin yorumu yapma",
      "Acele ettirme, süre kısıtlaması söyleme",
      "Çizim sırasında sorular sorma",
      "Başka çocukların çizimlerini gösterme"
    ],
    captureHints: [
      "Sayfa düz, gölgesiz fotoğrafla",
      "Tüm kağıt alanı kadraja girmeli",
      "Çizimin her detayı görünmeli",
      "Doğal ışık tercih edilmeli"
    ],
    scoringNotes: [
      "Koppitz-2 sistemine göre değerlendirilir",
      "30 gelişimsel gösterge kontrol edilir",
      "Yaş normlarına göre yorumlanır"
    ],
    requiredImages: [
      { id: "human", label: "İnsan Çizimi", description: "Çocuğun çizdiği insan figürü" }
    ]
  },

  HTP: {
    title: "Ev-Ağaç-İnsan (HTP - Buck)",
    ageRange: "5+ yaş",
    duration: "30-45 dakika",
    materials: [
      "3 adet A4 beyaz kağıt (her çizim için ayrı)",
      "HB kurşun kalem",
      "Silgi (ayrı, istenirse verilir)",
      "Kronometre",
      "Renkli kalemler (opsiyonel ikinci aşama)"
    ],
    phases: [
      {
        name: "1. Ev Çizimi",
        instruction: "Bu kağıda bir ev çiz. İstediğin türde bir ev olabilir. Bitirdiğinde haber ver.",
        duration: "~10 dakika",
        notes: [
          "Kağıdı yatay olarak ver",
          "Eğer 'Nasıl bir ev?' diye sorarsa: 'İstediğin türde' de",
          "Çizim sırasında müdahale etme"
        ]
      },
      {
        name: "Ev Sorgulama (PDI)",
        instruction: "Çizim bittikten sonra aşağıdaki soruları sor:",
        notes: [
          "Bu ev kaç katlı?",
          "Bu ev neden yapılmış? (tuğla, ahşap vb.)",
          "Bu senin evin mi? Kimin evi?",
          "Bu evde kimler yaşıyor?",
          "Bu ev nerede?",
          "Hangi odayı en çok seviyorsun?",
          "Bu ev mutlu mu, üzgün mü?"
        ]
      },
      {
        name: "2. Ağaç Çizimi",
        instruction: "Şimdi bu kağıda bir ağaç çiz. Bitirdiğinde haber ver.",
        duration: "~10 dakika",
        notes: [
          "Yeni kağıt ver (dikey)",
          "Eğer 'Ne tür ağaç?' diye sorarsa: 'İstediğin tür' de"
        ]
      },
      {
        name: "Ağaç Sorgulama (PDI)",
        instruction: "Çizim bittikten sonra aşağıdaki soruları sor:",
        notes: [
          "Bu ne tür bir ağaç?",
          "Bu ağaç kaç yaşında?",
          "Bu ağaç canlı mı?",
          "Bu ağaç nerede?",
          "Bu ağaca en çok benzeyen kişi kim?",
          "Ağacın neye ihtiyacı var?",
          "Ağaç yalnız mı, başka ağaçlar var mı?"
        ]
      },
      {
        name: "3. İnsan Çizimi",
        instruction: "Şimdi bu kağıda bir insan çiz. Tam bir insan, sadece yüz değil. Bitirdiğinde haber ver.",
        duration: "~10 dakika",
        notes: [
          "Yeni kağıt ver (dikey)",
          "Eğer 'Kız mı erkek mi?' diye sorarsa: 'Hangisini istersen' de"
        ]
      },
      {
        name: "İnsan Sorgulama (PDI)",
        instruction: "Çizim bittikten sonra aşağıdaki soruları sor:",
        notes: [
          "Bu kim?",
          "Kaç yaşında?",
          "Ne iş yapıyor / Ne yapıyor şimdi?",
          "Nasıl hissediyor?",
          "Neyi en çok seviyor?",
          "Neden hoşlanmıyor?",
          "Bu kişi için en önemli şey ne?",
          "Bu kişinin bir dileği olsa ne olurdu?"
        ]
      }
    ],
    observations: [
      "Her çizim için ayrı süre",
      "Çizim sırası (ev: temel, çatı, pencere vb.)",
      "Öğeler arası oranlar",
      "Detay düzeyi",
      "Silme davranışı",
      "Spontan yorumlar",
      "Duygusal tepkiler"
    ],
    donts: [
      "Kapı/pencere/baca eklemesini isteme",
      "Üç çizimi tek sayfaya yaptırma",
      "Sıra değişikliği yapma (Ev -> Ağaç -> İnsan)",
      "Örnekler gösterme",
      "Çizim sırasında sorular sorma",
      "Acele ettirme"
    ],
    captureHints: [
      "Her çizimi ayrı fotoğrafla",
      "Kağıt tamamen kadraja girmeli",
      "Gölge ve yansıma olmamalı",
      "Çizim sırasını not et"
    ],
    scoringNotes: [
      "Buck'ın kalitatif analiz sistemi kullanılır",
      "Her öğe için standart yorumlar mevcuttur",
      "PDI cevapları önemli bilgi sağlar"
    ],
    requiredImages: [
      { id: "house", label: "Ev Çizimi", description: "İlk çizilen ev figürü" },
      { id: "tree", label: "Ağaç Çizimi", description: "İkinci çizilen ağaç figürü" },
      { id: "person", label: "İnsan Çizimi", description: "Üçüncü çizilen insan figürü" }
    ]
  },

  Aile: {
    title: "Kinetik Aile Çizimi (KFD - Burns & Kaufman)",
    ageRange: "5-12 yaş",
    duration: "15-30 dakika",
    materials: [
      "A4 beyaz kağıt (yatay)",
      "HB kurşun kalem",
      "Silgi",
      "Renkli kalemler (opsiyonel)",
      "Kronometre"
    ],
    phases: [
      {
        name: "Yönerge",
        instruction: "Ailendeki herkesi, kendini de dahil ederek çiz. Herkes bir şeyler yapıyor olsun. Çöp adam değil, gerçek insanlar çiz. Bitirdiğinde haber ver.",
        notes: [
          "Kağıdı yatay ver",
          "'Kinetik' önemli - hareket/aktivite olmalı",
          "Eğer 'Bütün ailemi mi?' derse: 'Evet, seninle birlikte yaşayanları' de"
        ]
      },
      {
        name: "Gözlem",
        instruction: "Çizim sırasında sessizce gözlem yap.",
        notes: [
          "Hangi aile üyesinden başladığını not et",
          "Çizim sırasını kaydet (çok önemli!)",
          "Kim büyük, kim küçük çizildi",
          "Kişiler arası mesafeler",
          "Silinen/değiştirilen figürler",
          "Tereddüt edilen kişiler"
        ]
      },
      {
        name: "Sorgulama",
        instruction: "Çizim bittikten sonra aşağıdaki soruları sor:",
        notes: [
          "Bütün resmi anlatır mısın?",
          "Bu kim? (her figür için)",
          "Ne yapıyor? (her figür için)",
          "Bu aile nasıl hissediyor?",
          "En mutlu olan kim?",
          "En üzgün olan kim?",
          "Bu aile birlikte ne yapmaktan hoşlanır?",
          "Sen bu resimde neredesin? Ne yapıyorsun?"
        ]
      }
    ],
    observations: [
      "Çizim sırası (ilk çizilen genelde en önemli)",
      "Figürlerin büyüklük oranları",
      "Figürler arası mesafe (yakınlık/uzaklık)",
      "Figürlerin yönü (birbirine bakıyor mu?)",
      "Kim kimle gruplanmış",
      "Aktiviteler (birlikte mi, ayrı mı?)",
      "Eksik aile üyeleri",
      "Eklenen üyeler (evcil hayvan, vefat etmiş kişi)",
      "Bariyerler (figürler arası çizgiler, nesneler)",
      "Kendini çizmediyse neden"
    ],
    donts: [
      "Rolleri dikte etme (anne yemek yapıyor olsun vb.)",
      "Eksik kişi hatırlatma (babanı çizemedim mi?)",
      "Aktivite önerme",
      "Kim olduğunu tahmin etme, sor",
      "Büyüklük/küçüklük hakkında yorum yapma"
    ],
    captureHints: [
      "Tüm kağıt kadraja girmeli",
      "Figürler arası mesafeler görünmeli",
      "Çizim sırasını not olarak ekle"
    ],
    scoringNotes: [
      "Burns & Kaufman sistemi kullanılır",
      "Aksiyonlar arası ilişki analizi",
      "Figür stilleri ve semboller değerlendirilir"
    ],
    requiredImages: [
      { id: "family", label: "Aile Çizimi", description: "Tüm aile üyelerinin yer aldığı çizim" }
    ]
  },

  Kaktus: {
    title: "Kaktüs Testi (Panfilova)",
    ageRange: "4-12 yaş",
    duration: "10-15 dakika",
    materials: [
      "A4 beyaz kağıt",
      "HB kurşun kalem",
      "Renkli kalemler/boya kalemleri (opsiyonel)",
      "Silgi"
    ],
    phases: [
      {
        name: "Yönerge",
        instruction: "Bu kağıda bir kaktüs çiz. İstediğin gibi çizebilirsin. Bitirdiğinde haber ver.",
        notes: [
          "Kağıdı dikey ver",
          "Hiçbir yönlendirme yapma",
          "Saksı, çiçek, çöl gibi eklentiler isteme"
        ]
      },
      {
        name: "Gözlem",
        instruction: "Çizim sırasında sessizce gözlem yap.",
        notes: [
          "Nereden çizmeye başladığını not et",
          "Diken çizerken davranışı gözle",
          "Silgi kullanımı",
          "Renk seçimi (renkli yapılıyorsa)"
        ]
      },
      {
        name: "Sorgulama",
        instruction: "Çizim bittikten sonra aşağıdaki soruları sor:",
        notes: [
          "Bu kaktüs nasıl hissediyor?",
          "Bu kaktüs mutlu mu, üzgün mü?",
          "Bu kaktüs yalnız mı?",
          "Bu kaktüsün yanında başka bitkiler var mı?",
          "Bu kaktüse dokunsan ne olur?",
          "Bu kaktüs evde mi yoksa dışarıda mı? (saksı/toprak)",
          "Bu kaktüsün neye ihtiyacı var?",
          "Bu kaktüs büyüdüğünde nasıl olacak?"
        ]
      }
    ],
    observations: [
      "Kaktüs boyutu (sayfaya oranı)",
      "Diken sayısı ve yoğunluğu",
      "Dikenlerin boyutu (uzun/kısa)",
      "Dikenlerin yönü (her yöne/yukarıya/aşağıya)",
      "Çiçek varlığı",
      "Saksı var mı yok mu",
      "Kök görünüyor mu",
      "Çevre öğeleri (diğer bitkiler, güneş, toprak)",
      "Renk kullanımı",
      "Çizginin karakteri (sert/yumuşak)"
    ],
    donts: [
      "Saksı/çöl/çiçek/güneş eklemeyi isteme",
      "Dikenleri hatırlatma",
      "Örnek gösterme",
      "Renkli yapması gerektiğini söyleme",
      "Çizim hakkında yorum yapma"
    ],
    captureHints: [
      "Tüm kağıt görünmeli",
      "Dikenlerin detayı seçilmeli",
      "Renk kullanıldıysa doğru renkleri yansıtmalı"
    ],
    scoringNotes: [
      "Panfilova değerlendirme kriterleri kullanılır",
      "Saldırganlık göstergeleri: büyük diken, çok diken, sert çizgiler",
      "Kaygı göstergeleri: küçük çizim, iç çizgiler, koyu renkler",
      "İçine kapanıklık: saksı, yalın çizim, çevre yok"
    ],
    requiredImages: [
      { id: "cactus", label: "Kaktüs Çizimi", description: "Çocuğun çizdiği kaktüs" }
    ]
  },

  Agac: {
    title: "Ağaç Testi (Koch)",
    ageRange: "4+ yaş",
    duration: "10-20 dakika",
    materials: [
      "A4 beyaz kağıt",
      "HB kurşun kalem",
      "Silgi"
    ],
    phases: [
      {
        name: "Yönerge",
        instruction: "Bu kağıda bir ağaç çiz. Meyve ağacı dışında, istediğin türde bir ağaç. Bitirdiğinde haber ver.",
        notes: [
          "Kağıdı dikey ver",
          "'Meyve ağacı dışında' önemli - stereotype önlenir",
          "Eğer 'Ne tür?' derse: 'Meyve ağacı hariç istediğin tür' de"
        ]
      },
      {
        name: "Gözlem",
        instruction: "Çizim sırasında sessizce gözlem yap.",
        notes: [
          "Çizim sırası (gövde/dallar/kök/taç)",
          "Kalem basıncı",
          "Silgi kullanımı",
          "Toplam süre"
        ]
      },
      {
        name: "Sorgulama",
        instruction: "Çizim bittikten sonra aşağıdaki soruları sor:",
        notes: [
          "Bu ne tür bir ağaç?",
          "Bu ağaç kaç yaşında?",
          "Bu ağaç canlı mı?",
          "Bu ağaç sağlıklı mı?",
          "Bu ağaç nerede yetişiyor?",
          "Bu ağacın bir hikayesi olsa nasıl olurdu?",
          "Bu ağaç nasıl hissediyor?",
          "Bu ağacın neye ihtiyacı var?"
        ]
      }
    ],
    observations: [
      "Ağacın sayfadaki konumu (orta/sağ/sol/yukarı/aşağı)",
      "Ağacın boyutu",
      "Gövde: kalınlık, yaralar, kovuklar, kabuk detayı",
      "Dallar: sayısı, yönü, kırık dallar, oluk",
      "Kök: görünüyor mu, büyüklüğü, şekli",
      "Taç/yapraklar: yoğunluk, şekil, mevsim",
      "Ek öğeler: meyve, kuş, yuva, çiçek, güneş",
      "Çizgi kalitesi: akıcı/kesik/titrek",
      "Genel izlenim: sağlıklı/hasta/cansız"
    ],
    donts: [
      "Kök çizdirmeyi isteme",
      "Yaprak eklemeyi isteme",
      "Mevsim belirtme",
      "'Gerçek bir ağaç' deme",
      "Örnek gösterme"
    ],
    captureHints: [
      "Tüm kağıt görünmeli",
      "Ağacın her detayı (kök, taç) net olmalı",
      "Çizgi kalitesi anlaşılabilmeli"
    ],
    scoringNotes: [
      "Koch'un 59 özellik listesi referans alınır",
      "Gövde = ego gücü, benlik",
      "Dallar = çevre ile ilişki",
      "Kök = içgüdüler, bilinçdışı",
      "Taç = fantezi, düşünce"
    ],
    requiredImages: [
      { id: "tree", label: "Ağaç Çizimi", description: "Çocuğun çizdiği ağaç" }
    ]
  },

  Bahce: {
    title: "Bahçe Testi",
    ageRange: "4+ yaş",
    duration: "15-20 dakika",
    materials: [
      "A4 beyaz kağıt",
      "Renkli kalemler/boya kalemleri",
      "Kurşun kalem (taslak için opsiyonel)",
      "Silgi"
    ],
    phases: [
      {
        name: "Yönerge",
        instruction: "Bu kağıda bir bahçe çiz. İstediğin türde bir bahçe olabilir. Bitirdiğinde haber ver.",
        notes: [
          "Kağıt yatay veya dikey verilebilir (çocuk seçsin)",
          "Renkli kalem kullanması teşvik edilir",
          "Ne tür bahçe olduğu sorulursa: 'İstediğin türde' de"
        ]
      },
      {
        name: "Gözlem",
        instruction: "Çizim sırasında sessizce gözlem yap.",
        notes: [
          "İlk çizilen öğe",
          "Renk seçimleri",
          "Bahçenin organizasyonu (düzenli/dağınık)",
          "Çit/duvar var mı"
        ]
      },
      {
        name: "Sorgulama",
        instruction: "Çizim bittikten sonra aşağıdaki soruları sor:",
        notes: [
          "Bu bahçe nerede?",
          "Bu bahçeye kim bakıyor?",
          "Bu bahçeye kimler geliyor?",
          "Bu bahçede ne yapmak istersin?",
          "Bu bahçe nasıl hissediyor?",
          "Bu bahçede en sevdiğin yer neresi?",
          "Bu bahçede olmamasını istediğin bir şey var mı?"
        ]
      }
    ],
    observations: [
      "Bahçe sınırları (çit, duvar, yol)",
      "Bitki çeşitliliği",
      "Renkler ve yoğunluk",
      "İnsan/hayvan figürü var mı",
      "Ev veya yapı var mı",
      "Su öğesi (havuz, çeşme)",
      "Yollar ve giriş",
      "Mevsim/hava durumu",
      "Boş alanlar"
    ],
    donts: [
      "Belirli çiçek/ağaç isteme",
      "Çit/duvar eklemeyi isteme",
      "Renk önermede bulunma",
      "Örnekler gösterme"
    ],
    captureHints: [
      "Renklerin doğru yansıdığından emin ol",
      "Tüm kağıt görünmeli",
      "Detaylar seçilmeli"
    ],
    requiredImages: [
      { id: "garden", label: "Bahçe Çizimi", description: "Çocuğun çizdiği bahçe" }
    ]
  },

  Bender: {
    title: "Bender-Gestalt II",
    ageRange: "4-85+ yaş",
    duration: "Kopya: 5-10 dk, Hatırlama: 5 dk, Motor/Algı: 4-6 dk",
    materials: [
      "Bender-Gestalt II stimulus kartları (16 kart)",
      "Çizgisiz beyaz kağıt (birden fazla)",
      "2 adet HB kurşun kalem",
      "Silgi (istenirse)",
      "Kronometre",
      "Sert zemin/altlık"
    ],
    phases: [
      {
        name: "Hazırlık",
        instruction: "Masayı temizle, dikkat dağıtıcı şey olmasın. Kağıdı ve kalemi çocuğun önüne koy.",
        notes: [
          "Kağıt dikey konumda",
          "Aydınlatma yeterli olmalı",
          "Çocuğun rahat oturduğundan emin ol"
        ]
      },
      {
        name: "Kopya Aşaması",
        instruction: "Sana bazı kartlar göstereceğim. Her kartta bir şekil var. Şekli bu kağıda, gördüğüne en yakın şekilde çiz. Hazır mısın?",
        duration: "5-10 dakika (16 kart)",
        notes: [
          "Kartı çocuğun tam önüne, kağıdın üstüne koy",
          "Kart çizim BİTENE kadar kaldırılmaz",
          "Her şeklin süresini ayrı kaydet (opsiyonel ama önerilen)",
          "Kağıt dolunca yeni kağıt ver (istenirse veya yer kalmayınca)",
          "Davranışları not et: sayma, kağıt döndürme, kartı döndürme isteği"
        ]
      },
      {
        name: "Hatırlama Aşaması",
        instruction: "Şimdi, sana gösterdiğim şekilleri hatırladığın kadar çiz. Kartlarda gördüğüne benzer şekilde çizmeye çalış. İstediğin kadar zaman alabilirsin.",
        duration: "~5 dakika",
        notes: [
          "Kopya aşamasından HEMEN sonra yapılır",
          "Yeni, boş kağıt ver",
          "Stimulus kartlar GÖSTERİLMEZ",
          "Yaklaşık 2 dakika hatırlayamıyorsa dur",
          "Hatırladığı şekilleri say"
        ]
      },
      {
        name: "Motor Test (Opsiyonel)",
        instruction: "Şimdi sana başka kartlar göstereceğim. Her kartta üç şekil var. Ortadaki şekle en çok benzeyeni bul ve göster.",
        duration: "2-4 dakika",
        notes: [
          "4 maddelik motor test",
          "Her maddede 3 seçenekli eşleşme",
          "4 dakika sonra durdur"
        ]
      },
      {
        name: "Algı Testi (Opsiyonel)",
        instruction: "Şimdi bu şekillere bak. Hangisi farklı göster.",
        duration: "2-4 dakika",
        notes: [
          "Algısal ayırt etme kapasitesini ölçer",
          "Düşük kopya performansının nedenini anlamaya yarar"
        ]
      }
    ],
    observations: [
      "Her şekil için süre",
      "Toplam kopya süresi",
      "Toplam hatırlama süresi",
      "Hatırlanan şekil sayısı",
      "Kağıt döndürme davranışı",
      "Kart döndürme isteği",
      "Noktaları/dalgaları sayma",
      "Silgi kullanımı",
      "Çizime yeniden başlama",
      "Motor koordinasyon güçlüğü",
      "Frustrasyon/kaygı belirtileri"
    ],
    donts: [
      "Kart sırasını ASLA atlama/değiştirme",
      "Kartı çizim bitmeden kaldırma",
      "Hız/yavaş ile ilgili yorum yapma",
      "Doğru/yanlış geri bildirim verme",
      "Şekli tarif etme/adlandırma",
      "Hatırlama öncesi ipucu verme",
      "Süre kısıtlaması söyleme"
    ],
    captureHints: [
      "Her sayfayı ayrı fotoğrafla",
      "Kopya ve Hatırlama kağıtlarını ayır",
      "Şekillerin tamamı net görünmeli",
      "Sayfa düz, gölgeler yok"
    ],
    scoringNotes: [
      "Global Skorlama Sistemi kullanılır",
      "Her şekil 0-4 arası puanlanır",
      "Kopya Ham Puan + Hatırlama Ham Puan",
      "Yaş normlarına göre standart puan",
      "Görüş-motor entegrasyon, motor beceri, algı ayrı değerlendirilir"
    ],
    requiredImages: [
      { id: "copy", label: "Kopya Sayfası", description: "Stimulus kartlara bakarak çizilen sayfa(lar)" },
      { id: "recall", label: "Hatırlama Sayfası", description: "Bellekten çizilen sayfa", optional: true }
    ]
  },

  Rey: {
    title: "Rey-Osterrieth Karmaşık Figür Testi (ROCF)",
    ageRange: "6-89 yaş",
    duration: "30-45 dakika (gecikmeli hatırlama dahil)",
    materials: [
      "ROCF stimulus kartı",
      "Boş beyaz kağıtlar (en az 3)",
      "Renkli kalemler (6-8 farklı renk - çizim sırası için)",
      "Kronometre",
      "Not kağıdı"
    ],
    phases: [
      {
        name: "Kopya Aşaması",
        instruction: "Bu şekle bak. Aynı şekli bu kağıda olabildiğince doğru bir şekilde çiz. Acelemiz yok, istediğin kadar zaman alabilirsin.",
        duration: "Sınır yok, ortalama 5-10 dk",
        notes: [
          "Stimulus kartı sabit tutulur, döndürülemez",
          "Renkli kalem yöntemi: Her 30-60 sn'de renk değiştir (çizim stratejisini anlamak için)",
          "Alternatif: Çizim sırasını numaralandır",
          "Silgi kullanımına izin verilir",
          "Süre kaydedilmeli",
          "ÖNEMLİ: Hatırlama aşaması hakkında ÖNCEDEN BİLGİ VERME"
        ]
      },
      {
        name: "Ani Hatırlama (Immediate Recall)",
        instruction: "Şimdi az önce çizdiğin şekli hatırladığın kadar yeniden çiz. Bakmadan, sadece hatırladığın kadarıyla çiz.",
        duration: "~3 dakika bekleme sonrası",
        notes: [
          "Kopya bittikten 3 dakika sonra",
          "Stimulus ve kopya kaldırılır (çocuk görmez)",
          "Yeni boş kağıt verilir",
          "Hatırlama istendiği ÖNCEDEN söylenmemişti - incidental memory",
          "Süre kaydedilmeli"
        ]
      },
      {
        name: "Gecikmeli Hatırlama (Delayed Recall)",
        instruction: "Şimdi en baştaki şekli tekrar hatırlayarak çiz. Bakmadan, hatırladığın kadarıyla.",
        duration: "20-30 dakika sonra",
        notes: [
          "Ani hatırlamadan 20-30 dakika sonra",
          "Bu arada başka aktiviteler yapılabilir (ilgisiz görevler)",
          "Yeni boş kağıt",
          "Uzun süreli görsel belleği ölçer",
          "Süre kaydedilmeli"
        ]
      },
      {
        name: "Tanıma (Recognition - Opsiyonel)",
        instruction: "Şimdi sana bazı şekiller göstereceğim. Bunlardan hangileri en başta gördüğün büyük şeklin parçasıydı?",
        notes: [
          "24 maddeli tanıma testi",
          "12 doğru, 12 yanlış (distractor)",
          "Kodlama vs. geri getirme farkını anlama"
        ]
      }
    ],
    observations: [
      "Kopya süresi",
      "Ani hatırlama süresi",
      "Gecikmeli hatırlama süresi",
      "Çizim stratejisi (bütüncü/parçacı/dağınık)",
      "Başlangıç noktası",
      "Organizasyon kalitesi",
      "Detay doğruluğu",
      "Yerleşim doğruluğu",
      "Silgi kullanımı",
      "Motor kontrol kalitesi"
    ],
    donts: [
      "Hatırlama aşaması olduğunu önceden söyleme (incidental memory!)",
      "Süre kısıtlaması söyleme",
      "Çizim sırasında 'güzel, doğru' gibi geri bildirim verme",
      "Stimulus kartı döndürmeye izin verme",
      "Hatırlama aşamasında ipucu verme",
      "Kopya ve hatırlama arasında şekil hakkında konuşma"
    ],
    captureHints: [
      "Her aşama için ayrı fotoğraf (Kopya, Ani, Gecikmeli)",
      "Renkli kalem kullanıldıysa renk sırası görünmeli",
      "18 parçadan her biri görünmeli",
      "Detaylar net olmalı"
    ],
    scoringNotes: [
      "18 element, her biri 2 puan (max 36)",
      "Doğruluk (0, 0.5, 1) + Yerleşim (0, 0.5, 1)",
      "Kopya, Ani Hatırlama, Gecikmeli Hatırlama ayrı puanlanır",
      "Yaş normlarına göre persentil ve standart puan",
      "Organizasyon stratejisi ayrıca değerlendirilir"
    ],
    requiredImages: [
      { id: "copy", label: "Kopya Çizimi", description: "Stimulus karta bakarak çizilen şekil" },
      { id: "immediate", label: "Ani Hatırlama", description: "3 dk sonra bellekten çizilen şekil" },
      { id: "delayed", label: "Gecikmeli Hatırlama", description: "20-30 dk sonra bellekten çizilen şekil", optional: true }
    ]
  },

  Luscher: {
    title: "Lüscher Renk Testi (8 Renkli Kısa Form)",
    ageRange: "5+ yaş",
    duration: "5-10 dakika",
    materials: [
      "8 adet standart Lüscher renk kartı",
      "Not kağıdı ve kalem",
      "Nötr gri zemin/masa örtüsü (ideal)",
      "Doğal veya nötr ışık"
    ],
    phases: [
      {
        name: "Hazırlık",
        instruction: "8 renk kartını rastgele sırala ve çocuğun önüne yay.",
        notes: [
          "Işık nötr olmalı (sarı/mavi tonlu olmasın)",
          "Kartlar birbirine yakın, hepsi görünür",
          "İdeal: gri zemin üzerine kartlar",
          "Renkler: Mavi, Yeşil, Kırmızı, Sarı, Mor, Kahverengi, Siyah, Gri"
        ]
      },
      {
        name: "Birinci Seçim Turu",
        instruction: "Bu renklere bak. Şimdi en çok hoşuna gideni seç. Hiç düşünme, içinden geldiği gibi seç.",
        notes: [
          "Seçilen kartı kaldır ve numarasını not et",
          "Kalan 7 renk için aynı soruyu tekrarla",
          "En beğenilenden en az beğenilene sıra oluşur",
          "8 rengin tamamı sıralanana kadar devam",
          "Sıra: 1. 2. 3. 4. 5. 6. 7. 8."
        ]
      },
      {
        name: "Ara",
        instruction: "2-3 dakika bekle. Farklı bir konu hakkında kısa sohbet edilebilir.",
        duration: "2-3 dakika",
        notes: [
          "Renkler tekrar rastgele sıralanır",
          "Önceki seçimi hatırlamaması için kısa ara"
        ]
      },
      {
        name: "İkinci Seçim Turu",
        instruction: "Şimdi tekrar aynı şeyi yapacağız. Önceki seçimini hatırlamaya çalışma. Şimdi en çok hoşuna giden rengi seç.",
        notes: [
          "Birinci turla AYNI prosedür",
          "İkinci seçim sırası not edilir",
          "İki tur arasındaki tutarlılık/farklılık önemli"
        ]
      }
    ],
    observations: [
      "1. tur tam sıra",
      "2. tur tam sıra",
      "İki tur arasındaki farklılıklar",
      "Karar verme hızı",
      "Tereddüt edilen renkler",
      "Spontan yorumlar (bu rengi sevmiyorum vb.)",
      "Fiziksel/duygusal tepkiler"
    ],
    donts: [
      "Renklerin anlamını açıklama",
      "Doğru/yanlış yorum yapma",
      "Neden bu rengi seçtin diye sorma",
      "Seçimi yönlendirme",
      "Önceki seçimi hatırlatma",
      "Renk körlüğü varsa testi uygulama"
    ],
    captureHints: [
      "Seçim sırasını net bir şekilde not et",
      "Renk kartlarının fotoğrafı gerekli değil",
      "İki tur seçim sırası yazılı olarak kaydet"
    ],
    scoringNotes: [
      "Renk pozisyonları analiz edilir",
      "+/x/=/- kategorileri (istenen, beklenen, kayıtsız, reddedilen)",
      "Renk çiftleri yorumlanır",
      "1. ve 2. tur kıyaslanır (tutarlılık = duygusal istikrar)",
      "Lüscher'in standart yorum tabloları kullanılır"
    ],
    requiredImages: [] // Lüscher renk testi görsel gerektirmez, sadece seçim sırası notu
  }
};

// Eski format ile geriye uyumluluk için helper
export const getSimpleProtocol = (key: string) => {
  const protocol = PROTOCOLS[key];
  if (!protocol) return null;

  return {
    title: protocol.title,
    steps: protocol.phases.map(p =>
      p.notes && p.notes.length > 0
        ? `${p.name}: ${p.instruction}`
        : p.instruction
    ),
    donts: protocol.donts,
    captureHints: protocol.captureHints
  };
};

// Tum protokol anahtarlarini export et
export const PROTOCOL_KEYS = Object.keys(PROTOCOLS) as Array<keyof typeof PROTOCOLS>;
