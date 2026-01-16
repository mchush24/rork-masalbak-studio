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
    title: "Bir Insan Ciz (DAP - Koppitz)",
    ageRange: "5-12 yas",
    duration: "10-15 dakika",
    materials: [
      "A4 beyaz kagit (cizgisiz)",
      "HB kurşun kalem (silgisiz)",
      "Silgi (ayri, istenirse verilir)",
      "Kronometre"
    ],
    phases: [
      {
        name: "Hazirlik",
        instruction: "Kagidi dikey olarak cocugun onune koy. Kalemi kagit yanina birak.",
        notes: [
          "Sessiz, dikkat dagitici olmayan ortam sagla",
          "Cocuk rahat oturmali, masa yuksekligi uygun olmali"
        ]
      },
      {
        name: "Yonerge",
        instruction: "Bu kagida bir insan ciz. Istedigin gibi cizebilirsin. Bitirdiginde bana haber ver.",
        notes: [
          "Eger 'Nasil?' diye sorarsa: 'Istedigin gibi cizebilirsin' de",
          "Eger 'Kiz mi erkek mi?' diye sorarsa: 'Hangisini istersen' de",
          "Eger sadece yuz/bas cizerse: 'Simdi tum vucudu ciz' de"
        ]
      },
      {
        name: "Gozlem",
        instruction: "Cizim sirasinda sessizce gozlem yap ve not al.",
        duration: "Cocuk bitirene kadar",
        notes: [
          "Baslangic ve bitis saatini kaydet",
          "Hangi vucut parcasindan basladigini not et",
          "Silgi kullanimi varsa kac kez ve nerede",
          "Tereddut ettigi yerleri not et",
          "Kagidi dondurme davranisi"
        ]
      },
      {
        name: "Sorgulama (Opsiyonel)",
        instruction: "Cizim bittikten sonra sorular sor.",
        notes: [
          "Bu kim? (Kendisi mi, baskasi mi?)",
          "Kac yasinda?",
          "Ne yapiyor?",
          "Nasil hissediyor?"
        ]
      }
    ],
    observations: [
      "Cizim suresi (dk:sn)",
      "Baslangic noktasi (bas/govde/ayak)",
      "Cizim sirasi",
      "Silgi kullanimi (sayi ve bolge)",
      "Kalem basinci (hafif/normal/sert)",
      "Cizgi kalitesi (akici/kesik/titrek)",
      "Kagit dondurme",
      "Soz ifadeleri (varsa)"
    ],
    donts: [
      "Yonlendirme yapma (elleri de ciz, gozleri unutma vb.)",
      "Guzel/cirkin yorumu yapma",
      "Acele ettirme, sure kisitlamasi soyleme",
      "Cizim sirasinda sorular sorma",
      "Baska cocuklarin cizimlerini gosterme"
    ],
    captureHints: [
      "Sayfa duz, golgesiz fotografla",
      "Tum kagit alani kadraja girmeli",
      "Cizimin her detayi gorunmeli",
      "Dogal isik tercih edilmeli"
    ],
    scoringNotes: [
      "Koppitz-2 sistemine gore degerlendirilir",
      "30 gelisimsel gosterge kontrol edilir",
      "Yas normlarına gore yorumlanir"
    ],
    requiredImages: [
      { id: "human", label: "Insan Cizimi", description: "Cocugun cizdigi insan figuru" }
    ]
  },

  HTP: {
    title: "Ev-Agac-Insan (HTP - Buck)",
    ageRange: "5+ yas",
    duration: "30-45 dakika",
    materials: [
      "3 adet A4 beyaz kagit (her cizim icin ayri)",
      "HB kurşun kalem",
      "Silgi (ayri, istenirse verilir)",
      "Kronometre",
      "Renkli kalemler (opsiyonel ikinci aşama)"
    ],
    phases: [
      {
        name: "1. Ev Cizimi",
        instruction: "Bu kagida bir ev ciz. Istedigin turde bir ev olabilir. Bitirdiginde haber ver.",
        duration: "~10 dakika",
        notes: [
          "Kagidi yatay olarak ver",
          "Eger 'Nasil bir ev?' diye sorarsa: 'Istedigin turde' de",
          "Cizim sirasinda mudahale etme"
        ]
      },
      {
        name: "Ev Sorgulama (PDI)",
        instruction: "Cizim bittikten sonra asagidaki sorulari sor:",
        notes: [
          "Bu ev kac katli?",
          "Bu ev neden yapilmis? (tugla, ahsap vb.)",
          "Bu senin evin mi? Kimin evi?",
          "Bu evde kimler yasiyor?",
          "Bu ev nerede?",
          "Hangi odayi en cok seviyorsun?",
          "Bu ev mutlu mu, uzgun mu?"
        ]
      },
      {
        name: "2. Agac Cizimi",
        instruction: "Simdi bu kagida bir agac ciz. Bitirdiginde haber ver.",
        duration: "~10 dakika",
        notes: [
          "Yeni kagit ver (dikey)",
          "Eger 'Ne tur agac?' diye sorarsa: 'Istedigin tur' de"
        ]
      },
      {
        name: "Agac Sorgulama (PDI)",
        instruction: "Cizim bittikten sonra asagidaki sorulari sor:",
        notes: [
          "Bu ne tur bir agac?",
          "Bu agac kac yasinda?",
          "Bu agac canli mi?",
          "Bu agac nerede?",
          "Bu agaca en cok benzeyen kisi kim?",
          "Agacin neye ihtiyaci var?",
          "Agac yalniz mi, baska agaclar var mi?"
        ]
      },
      {
        name: "3. Insan Cizimi",
        instruction: "Simdi bu kagida bir insan ciz. Tam bir insan, sadece yuz degil. Bitirdiginde haber ver.",
        duration: "~10 dakika",
        notes: [
          "Yeni kagit ver (dikey)",
          "Eger 'Kiz mi erkek mi?' diye sorarsa: 'Hangisini istersen' de"
        ]
      },
      {
        name: "Insan Sorgulama (PDI)",
        instruction: "Cizim bittikten sonra asagidaki sorulari sor:",
        notes: [
          "Bu kim?",
          "Kac yasinda?",
          "Ne is yapiyor / Ne yapiyor simdi?",
          "Nasil hissediyor?",
          "Neyi en cok seviyor?",
          "Neden hoslanmiyor?",
          "Bu kisi icin en onemli sey ne?",
          "Bu kisinin bir dilegi olsa ne olurdu?"
        ]
      }
    ],
    observations: [
      "Her cizim icin ayri sure",
      "Cizim sirasi (ev: temel, cati, pencere vb.)",
      "Ogeler arasi oranlar",
      "Detay duzeyi",
      "Silme davranisi",
      "Spontan yorumlar",
      "Duygusal tepkiler"
    ],
    donts: [
      "Kapi/pencere/baca eklemesini isteme",
      "Uc cizimi tek sayfaya yaptirma",
      "Sira degisikligi yapma (Ev -> Agac -> Insan)",
      "Ornekler gosterme",
      "Cizim sirasinda sorular sorma",
      "Acele ettirme"
    ],
    captureHints: [
      "Her cizimi ayri fotografla",
      "Kagit tamamen kadraja girmeli",
      "Golge ve yansima olmamali",
      "Cizim sirasini not et"
    ],
    scoringNotes: [
      "Buck'in kalitatif analiz sistemi kullanilir",
      "Her oge icin standart yorumlar mevcuttur",
      "PDI cevaplari onemli bilgi saglar"
    ],
    requiredImages: [
      { id: "house", label: "Ev Cizimi", description: "Ilk cizilen ev figuru" },
      { id: "tree", label: "Agac Cizimi", description: "Ikinci cizilen agac figuru" },
      { id: "person", label: "Insan Cizimi", description: "Ucuncu cizilen insan figuru" }
    ]
  },

  Aile: {
    title: "Kinetik Aile Cizimi (KFD - Burns & Kaufman)",
    ageRange: "5-12 yas",
    duration: "15-30 dakika",
    materials: [
      "A4 beyaz kagit (yatay)",
      "HB kurşun kalem",
      "Silgi",
      "Renkli kalemler (opsiyonel)",
      "Kronometre"
    ],
    phases: [
      {
        name: "Yonerge",
        instruction: "Ailendeki herkesi, kendini de dahil ederek ciz. Herkes bir seyler yapiyor olsun. Carton figur degil, gercek insanlar ciz. Bitirdiginde haber ver.",
        notes: [
          "Kagidi yatay ver",
          "'Kinetik' onemli - hareket/aktivite olmali",
          "Eger 'Butun ailemi mi?' derse: 'Evet, seninle birlikte yasayanlari' de"
        ]
      },
      {
        name: "Gozlem",
        instruction: "Cizim sirasinda sessizce gozlem yap.",
        notes: [
          "Hangi aile uyesinden basladigini not et",
          "Cizim sirasini kaydet (cok onemli!)",
          "Kim buyuk, kim kucuk cizildi",
          "Kisiler arasi mesafeler",
          "Silinen/degistirilen figurler",
          "Tereddut edilen kisiler"
        ]
      },
      {
        name: "Sorgulama",
        instruction: "Cizim bittikten sonra asagidaki sorulari sor:",
        notes: [
          "Butun resmi anlatir misin?",
          "Bu kim? (her figur icin)",
          "Ne yapiyor? (her figur icin)",
          "Bu aile nasil hissediyor?",
          "En mutlu olan kim?",
          "En uzgun olan kim?",
          "Bu aile birlikte ne yapmaktan hoslanir?",
          "Sen bu resimde neredesin? Ne yapiyorsun?"
        ]
      }
    ],
    observations: [
      "Cizim sirasi (ilk cizilen genelde en onemli)",
      "Figurlerin buyukluk oranlari",
      "Figurler arasi mesafe (yakinlik/uzaklik)",
      "Figurlerin yonu (birbirine bakiyor mu?)",
      "Kim kimle gruplanmis",
      "Aktiviteler (birlikte mi, ayri mi?)",
      "Eksik aile uyeleri",
      "Eklenen uyeler (evcil hayvan, vefat etmis kisi)",
      "Bariyerler (figurler arasi cizgiler, nesneler)",
      "Kendini cizmediyse neden"
    ],
    donts: [
      "Rolleri dikte etme (anne yemek yapiyor olsun vb.)",
      "Eksik kisi hatirlatma (babani cizemdin mi?)",
      "Aktivite onerme",
      "Kim oldugunu tahmin etme, sor",
      "Buyukluk/kucukluk hakkinda yorum yapma"
    ],
    captureHints: [
      "Tum kagit kadraja girmeli",
      "Figurler arasi mesafeler gorunmeli",
      "Cizim sirasini not olarak ekle"
    ],
    scoringNotes: [
      "Burns & Kaufman sistemi kullanilir",
      "Aksiyonlar arasi iliski analizi",
      "Figur stilleri ve semboller degerlendirilir"
    ],
    requiredImages: [
      { id: "family", label: "Aile Cizimi", description: "Tum aile uyelerinin yer aldigi cizim" }
    ]
  },

  Kaktus: {
    title: "Kaktus Testi (Panfilova)",
    ageRange: "4-12 yas",
    duration: "10-15 dakika",
    materials: [
      "A4 beyaz kagit",
      "HB kurşun kalem",
      "Renkli kalemler/boya kalemleri (opsiyonel)",
      "Silgi"
    ],
    phases: [
      {
        name: "Yonerge",
        instruction: "Bu kagida bir kaktus ciz. Istedigin gibi cizebilirsin. Bitirdiginde haber ver.",
        notes: [
          "Kagidi dikey ver",
          "Hic bir yonlendirme yapma",
          "Saksi, cicek, col gibi eklentiler isteme"
        ]
      },
      {
        name: "Gozlem",
        instruction: "Cizim sirasinda sessizce gozlem yap.",
        notes: [
          "Nereden cizmeye basladigini not et",
          "Diken cizerken davranisi gozle",
          "Silgi kullanimi",
          "Renk secimi (renkli yapiliyorsa)"
        ]
      },
      {
        name: "Sorgulama",
        instruction: "Cizim bittikten sonra asagidaki sorulari sor:",
        notes: [
          "Bu kaktus nasil hissediyor?",
          "Bu kaktus mutlu mu, uzgun mu?",
          "Bu kaktus yalniz mi?",
          "Bu kaktusun yaninda baska bitkiler var mi?",
          "Bu kaktuse dokunsan ne olur?",
          "Bu kaktus ev mi yoksa dis mi? (saksi/toprak)",
          "Bu kaktusun neye ihtiyaci var?",
          "Bu kaktus buyuduğunde nasil olacak?"
        ]
      }
    ],
    observations: [
      "Kaktus boyutu (sayfaya orani)",
      "Diken sayisi ve yogunlugu",
      "Dikenlerin boyutu (uzun/kisa)",
      "Dikenlerin yonu (her yone/yukariya/asagiya)",
      "Cicek varligı",
      "Saksi var mi yok mu",
      "Kok gorünuyor mu",
      "Cevre ogeleri (diger bitkiler, gunes, toprak)",
      "Renk kullanimi",
      "Cizginin karakteri (sert/yumusak)"
    ],
    donts: [
      "Saksi/col/cicek/gunes eklemeyi isteme",
      "Dikenleri hatirlatma",
      "Ornek gosterme",
      "Renkli yapmasi gerektigi soyleme",
      "Cizim hakkinda yorum yapma"
    ],
    captureHints: [
      "Tum kagit gorunmeli",
      "Dikenlerin detayi secilmeli",
      "Renk kullanildiysa dogru renkleri yansitmali"
    ],
    scoringNotes: [
      "Panfilova degerlendirme kriterleri kullanilir",
      "Saldirganlik gostergeleri: buyuk diken, cok diken, sert cizgiler",
      "Kaygı gostergeleri: kucuk cizim, ic cizgiler, koyu renkler",
      "Icine kapanikilk: saksi, yalin cizim, cevre yok"
    ],
    requiredImages: [
      { id: "cactus", label: "Kaktus Cizimi", description: "Cocugun cizdigi kaktus" }
    ]
  },

  Agac: {
    title: "Agac Testi (Koch)",
    ageRange: "4+ yas",
    duration: "10-20 dakika",
    materials: [
      "A4 beyaz kagit",
      "HB kurşun kalem",
      "Silgi"
    ],
    phases: [
      {
        name: "Yonerge",
        instruction: "Bu kagida bir agac ciz. Meyve agaci disinda, istedigin turde bir agac. Bitirdiginde haber ver.",
        notes: [
          "Kagidi dikey ver",
          "'Meyve agaci disinda' onemli - stereotype onlenir",
          "Eger 'Ne tur?' derse: 'Meyve agaci haric istedigin tur' de"
        ]
      },
      {
        name: "Gozlem",
        instruction: "Cizim sirasinda sessizce gozlem yap.",
        notes: [
          "Cizim sirasi (govde/dallar/kok/tac)",
          "Kalem basinci",
          "Silgi kullanimi",
          "Toplam sure"
        ]
      },
      {
        name: "Sorgulama",
        instruction: "Cizim bittikten sonra asagidaki sorulari sor:",
        notes: [
          "Bu ne tur bir agac?",
          "Bu agac kac yasinda?",
          "Bu agac canli mi?",
          "Bu agac saglikli mi?",
          "Bu agac nerede yetisiyor?",
          "Bu agacin bir hikayesi olsa nasil olurdu?",
          "Bu agac nasil hissediyor?",
          "Bu agacin neye ihtiyaci var?"
        ]
      }
    ],
    observations: [
      "Agacin sayfadaki konumu (orta/sag/sol/yukari/asagi)",
      "Agacin boyutu",
      "Govde: kalinlik, yaralar, kovuklar, kabuk detayi",
      "Dallar: sayisi, yonu, kirik dallar, olukluk",
      "Kok: gorunuyor mu, buyuklugu, sekli",
      "Tac/yapraklar: yogunluk, sekil, mevsim",
      "Ek ogeler: meyve, kus, yuva, cicek, gunes",
      "Cizgi kalitesi: akici/kesik/titrek",
      "Genel izlenim: saglikli/hasta/cansiz"
    ],
    donts: [
      "Kok cizdirmeyi isteme",
      "Yaprak eklemeyi isteme",
      "Mevsim belirtme",
      "'Gercek bir agac' deme",
      "Ornek gosterme"
    ],
    captureHints: [
      "Tum kagit gorunmeli",
      "Agacin her detayi (kok, tac) net olmali",
      "Cizgi kalitesi anlasilabilmeli"
    ],
    scoringNotes: [
      "Koch'un 59 ozellik listesi referans alinir",
      "Govde = ego gucu, benlik",
      "Dallar = cevre ile iliski",
      "Kok = icguduler, bilincdisi",
      "Tac = fantezi, dusunce"
    ],
    requiredImages: [
      { id: "tree", label: "Agac Cizimi", description: "Cocugun cizdigi agac" }
    ]
  },

  Bahce: {
    title: "Bahce Testi",
    ageRange: "4+ yas",
    duration: "15-20 dakika",
    materials: [
      "A4 beyaz kagit",
      "Renkli kalemler/boya kalemleri",
      "Kurşun kalem (taslak icin opsiyonel)",
      "Silgi"
    ],
    phases: [
      {
        name: "Yonerge",
        instruction: "Bu kagida bir bahce ciz. Istedigin turde bir bahce olabilir. Bitirdiginde haber ver.",
        notes: [
          "Kagit yatay veya dikey verilebilir (cocuk secsin)",
          "Renkli kalem kullanmasi tesvik edilir",
          "Ne tur bahce oldugu sorulursa: 'Istedigin turde' de"
        ]
      },
      {
        name: "Gozlem",
        instruction: "Cizim sirasinda sessizce gozlem yap.",
        notes: [
          "Ilk cizilen oge",
          "Renk secimleri",
          "Bahcenin organizasyonu (duzenli/dagınik)",
          "Cit/duvar var mi"
        ]
      },
      {
        name: "Sorgulama",
        instruction: "Cizim bittikten sonra asagidaki sorulari sor:",
        notes: [
          "Bu bahce nerede?",
          "Bu bahceye kim bakiyor?",
          "Bu bahceye kimler geliyor?",
          "Bu bahcede ne yapmak istersin?",
          "Bu bahce nasil hissediyor?",
          "Bu bahcede en sevdiğin yer neresi?",
          "Bu bahcede olmamasini istediğin bir sey var mi?"
        ]
      }
    ],
    observations: [
      "Bahce sinirları (cit, duvar, yol)",
      "Bitki cesitliligi",
      "Renkler ve yogunluk",
      "Insan/hayvan figuru var mi",
      "Ev veya yapi var mi",
      "Su ogesi (havuz, ceşme)",
      "Yollar ve giriş",
      "Mevsim/hava durumu",
      "Bos alanlar"
    ],
    donts: [
      "Belirli cicek/agac isteme",
      "Cit/duvar eklemeyi isteme",
      "Renk onermede bulunma",
      "Ornekler gosterme"
    ],
    captureHints: [
      "Renklerin dogru yansidığindan emin ol",
      "Tum kagit gorunmeli",
      "Detaylar secilmeli"
    ],
    requiredImages: [
      { id: "garden", label: "Bahce Cizimi", description: "Cocugun cizdigi bahce" }
    ]
  },

  Bender: {
    title: "Bender-Gestalt II",
    ageRange: "4-85+ yas",
    duration: "Kopya: 5-10 dk, Hatırlama: 5 dk, Motor/Algı: 4-6 dk",
    materials: [
      "Bender-Gestalt II stimulus kartlari (16 kart)",
      "Cizgisiz beyaz kagit (birden fazla)",
      "2 adet HB kurşun kalem",
      "Silgi (istenirse)",
      "Kronometre",
      "Sert zemin/altlik"
    ],
    phases: [
      {
        name: "Hazirlik",
        instruction: "Masayi temizle, dikkat dagitici sey olmasin. Kagidi ve kalemi cocugun onune koy.",
        notes: [
          "Kagit dikey konumda",
          "Aydinlatma yeterli olmali",
          "Cocugun rahat oturduğundan emin ol"
        ]
      },
      {
        name: "Kopya Asamasi",
        instruction: "Sana bazi kartlar gosterecegim. Her kartta bir sekil var. Sekli bu kagida, gordugune en yakin sekilde ciz. Hazir misin?",
        duration: "5-10 dakika (16 kart)",
        notes: [
          "Karti cocugun tam onune, kagitın ustune koy",
          "Kart cizim BITENE kadar kaldirilmaz",
          "Her seklin suresini ayri kaydet (opsiyonel ama onerilen)",
          "Kagit dolunca yeni kagit ver (istenirse veya yer kalmayinca)",
          "Davranislari not et: sayma, kagit dondurme, karti dondurme istegi"
        ]
      },
      {
        name: "Hatırlama Asamasi",
        instruction: "Simdi, sana gosterdigim sekilleri hatirladigın kadar ciz. Kartlarda gordugune benzer sekilde cizmeye calis. Istedigin kadar zaman alabilirsin.",
        duration: "~5 dakika",
        notes: [
          "Kopya asamasindan HEMEN sonra yapilir",
          "Yeni, bos kagit ver",
          "Stimulus kartlar GOSTERILMEZ",
          "Yaklasik 2 dakika hatırlayamiyorsa dur",
          "Hatirladigi sekileri say"
        ]
      },
      {
        name: "Motor Test (Opsiyonel)",
        instruction: "Simdi sana baska kartlar gosterecegim. Her kartta uc sekil var. Ortadaki sekle en cok benzeyeni bul ve goster.",
        duration: "2-4 dakika",
        notes: [
          "4 maddelik motor test",
          "Her maddede 3 secenekli eslesme",
          "4 dakika sonra durdur"
        ]
      },
      {
        name: "Algi Testi (Opsiyonel)",
        instruction: "Simdi bu sekillere bak. Hangisi farkli goster.",
        duration: "2-4 dakika",
        notes: [
          "Algisal ayirt etme kapasitesini olcer",
          "Dusuk kopya performansinin nedenini anlamaya yarar"
        ]
      }
    ],
    observations: [
      "Her sekil icin sure",
      "Toplam kopya suresi",
      "Toplam hatırlama suresi",
      "Hatırlanan sekil sayisi",
      "Kagit dondurme davranisi",
      "Kart dondurme istegi",
      "Noktalari/dalgalari sayma",
      "Silgi kullanimi",
      "Cizime yeniden baslama",
      "Motor koordinasyon guçluğu",
      "Frustrasyon/kaygi belirtileri"
    ],
    donts: [
      "Kart sirasini ASLA atlama/degistirme",
      "Karti cizim bitmeden kaldirma",
      "Hiz/yavas ile ilgili yorum yapma",
      "Dogru/yanlis geri bildirim verme",
      "Sekli tarif etme/adlandirma",
      "Hatırlama oncesi ipucu verme",
      "Sure kisitlamasi soyleme"
    ],
    captureHints: [
      "Her sayfayi ayri fotografla",
      "Kopya ve Hatırlama kagitlarini ayir",
      "Sekillerin tamami net gorunmeli",
      "Sayfa duz, golgeler yok"
    ],
    scoringNotes: [
      "Global Skorlama Sistemi kullanilir",
      "Her sekil 0-4 arasi puanlanir",
      "Kopya Ham Puan + Hatırlama Ham Puan",
      "Yas normlarına gore standart puan",
      "Gorus-motor entegrasyon, motor beceri, algi ayri degerlendirilir"
    ],
    requiredImages: [
      { id: "copy", label: "Kopya Sayfasi", description: "Stimulus kartlara bakarak cizilen sayfa(lar)" },
      { id: "recall", label: "Hatırlama Sayfasi", description: "Bellekten cizilen sayfa", optional: true }
    ]
  },

  Rey: {
    title: "Rey-Osterrieth Karmasik Figur Testi (ROCF)",
    ageRange: "6-89 yas",
    duration: "30-45 dakika (gecikmeli hatırlama dahil)",
    materials: [
      "ROCF stimulus karti",
      "Bos beyaz kagitlar (en az 3)",
      "Renkli kalemler (6-8 farkli renk - cizim sirasi icin)",
      "Kronometre",
      "Not kagidi"
    ],
    phases: [
      {
        name: "Kopya Asamasi",
        instruction: "Bu sekle bak. Ayni sekli bu kagida olabildiğince dogru bir sekilde ciz. Acelemiz yok, istedigin kadar zaman alabilirsin.",
        duration: "Sinir yok, ortalama 5-10 dk",
        notes: [
          "Stimulus karti sabit tutulur, dondurulemez",
          "Renkli kalem yontemi: Her 30-60 sn'de renk degistir (cizim stratejisini anlamak icin)",
          "Alternatif: Cizim sirasini numaralandir",
          "Silgi kullanımı izin verilir",
          "Surenin kaydedilmeli",
          "ONEMLI: Hatırlama asamasi hakkinda ONCEDEN BILGI VERME"
        ]
      },
      {
        name: "Ani Hatırlama (Immediate Recall)",
        instruction: "Simdi az once cizdigin sekli hatirladigın kadar yeniden ciz. Bakmadan, sadece hatırladigın kadariyla ciz.",
        duration: "~3 dakika bekleme sonrasi",
        notes: [
          "Kopya bittikten 3 dakika sonra",
          "Stimulus ve kopya kaldirilir (cocuk gormez)",
          "Yeni bos kagit verilir",
          "Hatırlama istendigi ONCEDEN soylenmemisti - incidental memory",
          "Surenin kaydedilmeli"
        ]
      },
      {
        name: "Gecikmeli Hatırlama (Delayed Recall)",
        instruction: "Simdi en bastaki sekli tekrar hatırlayarak ciz. Bakmadan, hatırladigın kadariyla.",
        duration: "20-30 dakika sonra",
        notes: [
          "Ani hatırlamadan 20-30 dakika sonra",
          "Bu arada baska aktiviteler yapilabilir (ilgisiz gorevler)",
          "Yeni bos kagit",
          "Uzun sureli gorsel belleği olcer",
          "Surenin kaydedilmeli"
        ]
      },
      {
        name: "Tanıma (Recognition - Opsiyonel)",
        instruction: "Simdi sana bazi sekiller gosterecegim. Bunlardan hangileri en basta gordugün buyuk seklin parcasiydi?",
        notes: [
          "24 maddeli tanıma testi",
          "12 doğru, 12 yanlis (distractor)",
          "Kodlama vs. geriye getirme farkini anlama"
        ]
      }
    ],
    observations: [
      "Kopya suresi",
      "Ani hatırlama suresi",
      "Gecikmeli hatırlama suresi",
      "Cizim stratejisi (butuncu/parcaci/dagınık)",
      "Baslangic noktasi",
      "Organizasyon kalitesi",
      "Detay dogruluğu",
      "Yerlesim dogruluğu",
      "Silgi kullanimi",
      "Motor kontrol kalitesi"
    ],
    donts: [
      "Hatırlama asamasi oldugunu onceden soyleme (incidental memory!)",
      "Sure kisitlamasi soyleme",
      "Cizim sirasinda 'guzel, dogru' gibi geri bildirim verme",
      "Stimulus karti dondurmeye izin verme",
      "Hatırlama asamasinda ipucu verme",
      "Kopya ve hatırlama arasinda sekil hakkinda konusma"
    ],
    captureHints: [
      "Her asama icin ayri fotograf (Kopya, Ani, Gecikmeli)",
      "Renkli kalem kullanildiysa renk sirasi gorunmeli",
      "18 parcadan her biri gorunmeli",
      "Detaylar net olmali"
    ],
    scoringNotes: [
      "18 element, her biri 2 puan (max 36)",
      "Dogruluk (0, 0.5, 1) + Yerlesim (0, 0.5, 1)",
      "Kopya, Ani Hatırlama, Gecikmeli Hatırlama ayri puanlanir",
      "Yas normlarına gore percentil ve standart puan",
      "Organizasyon stratejisi ayrica degerlendirilir"
    ],
    requiredImages: [
      { id: "copy", label: "Kopya Cizimi", description: "Stimulus karta bakarak cizilen sekil" },
      { id: "immediate", label: "Ani Hatırlama", description: "3 dk sonra bellekten cizilen sekil" },
      { id: "delayed", label: "Gecikmeli Hatırlama", description: "20-30 dk sonra bellekten cizilen sekil", optional: true }
    ]
  },

  Luscher: {
    title: "Luscher Renk Testi (8 Renkli Kisa Form)",
    ageRange: "5+ yas",
    duration: "5-10 dakika",
    materials: [
      "8 adet standart Luscher renk karti",
      "Not kagidi ve kalem",
      "Notr gri zemin/masa ortusu (ideal)",
      "Dogal veya notr isik"
    ],
    phases: [
      {
        name: "Hazirlik",
        instruction: "8 renk kartini rasgele sirala ve cocugun onune yay.",
        notes: [
          "Isik notr olmali (sari/mavi tonlu olmasin)",
          "Kartlar birbirine yakin, hepsi gorunur",
          "Ideal: gri zemin uzerine kartlar",
          "Renkler: Mavi, Yesil, Kirmizi, Sari, Mor, Kahverengi, Siyah, Gri"
        ]
      },
      {
        name: "Birinci Secim Turu",
        instruction: "Bu renklere bak. Simdi en cok hosuna gideni sec. Hic dusunme, icinden geldigi gibi sec.",
        notes: [
          "Secilen karti kaldir ve numarasini not et",
          "Kalan 7 renk icin ayni soruyu tekrarla",
          "En begenileneden en az begenilene sira olusur",
          "8 rengin tamamı siralanana kadar devam",
          "Sira: 1. 2. 3. 4. 5. 6. 7. 8."
        ]
      },
      {
        name: "Ara",
        instruction: "2-3 dakika bekle. Farkli bir konu hakkinda kisa sohbet edilebilir.",
        duration: "2-3 dakika",
        notes: [
          "Renkler tekrar rasgele siralanir",
          "Onceki secimi hatirlamamasi icin kisa ara"
        ]
      },
      {
        name: "Ikinci Secim Turu",
        instruction: "Simdi tekrar ayni seyi yapacagiz. Onceki secimini hatirlamaya calisma. Simdi en cok hosuna giden rengi sec.",
        notes: [
          "Birinci turla AYNI prosedur",
          "Ikinci secim sirasi not edilir",
          "Iki tur arasindaki tutarlilik/farklılık onemli"
        ]
      }
    ],
    observations: [
      "1. tur tam sira",
      "2. tur tam sira",
      "Iki tur arasindaki farkliliklar",
      "Karar verme hizi",
      "Tereddut edilen renkler",
      "Spontan yorumlar (bu rengi sevmiyorum vb.)",
      "Fiziksel/duygusal tepkiler"
    ],
    donts: [
      "Renklerin anlamını aciklama",
      "Dogru/yanlis yorum yapma",
      "Neden bu rengi sectin diye sorma",
      "Secimi yonlendirme",
      "Onceki secimi hatirlatma",
      "Renk korlugu varsa testi uygulama"
    ],
    captureHints: [
      "Secim sirasini net bir sekilde not et",
      "Renk kartlarinin fotografı gerekli degil",
      "Iki tur secim sirasi yazili olarak kaydet"
    ],
    scoringNotes: [
      "Renk pozisyonları analiz edilir",
      "+/x/=/- kategorileri (istenen, beklenen, kayitsiz, reddedilen)",
      "Renk ciftleri yorumlanir",
      "1. ve 2. tur kiyaslanir (tutarlilik = duygusal istikrar)",
      "Luscher'in standart yorum tablolari kullanilir"
    ],
    requiredImages: [] // Luscher renk testi gorsel gerektirmez, sadece secim sirasi notu
  }
};

// Eski format ile geriye uyumluluk icin helper
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
