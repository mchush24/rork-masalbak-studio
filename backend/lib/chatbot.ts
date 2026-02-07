/**
 * Renkioo Chatbot - Yardim Asistani v3.0
 *
 * Hibrit yaklasim:
 * 1. Intent & Duygu algılama (ebeveyn endişeleri öncelikli)
 * 2. Ebeveyn rehberliği FAQ'ları (30+ soru)
 * 3. Genel FAQ eslestirme (55+ soru)
 * 4. Turkce synonym ve normalizasyon destegi
 * 5. AI fallback - Claude Haiku veya GPT-4o-mini
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// Circuit breaker for AI provider resilience
import {
  CircuitBreaker,
  CircuitOpenError,
  withRetry,
  isRetryableError,
  isRateLimitError,
} from "./circuit-breaker.js";

// New modules for parenting support
import {
  detectUserIntent,
  isParentingConcern,
  detectEmotion,
  detectSeverity,
  UserIntent,
} from './chatbot-intent';
import {
  findParentingFAQ,
  getParentingFollowUps,
  ParentingFAQItem,
} from './chatbot-parenting';
import {
  buildEmpatheticResponse,
  wrapWithEmpathy,
  getParentingQuickReplies,
  getSuggestedQuestions as getEmpathySuggestions,
} from './chatbot-empathy';

// Faz 6: Analytics for unanswered queries
import {
  logUnansweredQuery,
  normalizeTextForAnalytics,
  UnansweredReason,
} from './chatbot-analytics';

import { createLogger } from './logger.js';
const log = createLogger('Chatbot');

// Check which AI provider is available (at runtime)
function hasAnthropicKey(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

function hasOpenAIKey(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

// Circuit breakers for AI providers
const anthropicCircuit = new CircuitBreaker({
  name: "anthropic-chatbot",
  failureThreshold: 3,
  resetTimeout: 60000, // 1 minute
});

const openaiCircuit = new CircuitBreaker({
  name: "openai-chatbot",
  failureThreshold: 3,
  resetTimeout: 60000,
});

// ============================================
// TYPES
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'faq' | 'ai';
}

export interface ChatResponse {
  message: string;
  source: 'faq' | 'ai';
  suggestedQuestions?: string[];
  matchedFAQ?: string;
  confidence?: number;
  // Faz 3E: Akıllı Yönlendirme
  actions?: ChatAction[];
  // Faz 3A: Konuşma Bağlamı
  detectedTopic?: string;
}

// Faz 3E: Akıllı Yönlendirme - Aksiyon tipleri
export interface ChatAction {
  type: 'navigate' | 'create' | 'open' | 'link';
  label: string;
  target: string; // route veya URL
  icon?: string;
}

// Faz 3B: Proaktif Öneriler - Ekran bazlı öneriler
export interface ProactiveSuggestion {
  id: string;
  screen: string;
  trigger: 'enter' | 'idle' | 'error' | 'first_visit';
  message: string;
  questions: string[];
  priority: number;
}

interface FAQItem {
  id: string;
  keywords: string[];
  synonyms?: string[][];
  question: string;
  answer: string;
  category: FAQCategory;
  priority?: number;
}

type FAQCategory = 'story' | 'drawing' | 'analysis' | 'interactive' | 'account' | 'general' | 'coloring' | 'technical';

// ============================================
// TURKCE SYNONYM VERITABANI
// ============================================

const TURKISH_SYNONYMS: Record<string, string[]> = {
  // Fiiller
  'olustur': ['yap', 'yarat', 'hazirla', 'uret', 'meydana getir'],
  'indir': ['yukle', 'kaydet', 'al', 'download'],
  'yukle': ['upload', 'ekle', 'gonderi', 'at'],
  'sil': ['kaldir', 'cikar', 'temizle', 'yoket'],
  'degistir': ['duzenle', 'edit', 'guncelle', 'ayarla'],
  'paylas': ['gonder', 'ilet', 'share'],
  'bak': ['gor', 'incele', 'kontrol et', 'gozden gecir'],

  // Isimler
  'masal': ['hikaye', 'oyku', 'story', 'tale'],
  'cizim': ['resim', 'sekil', 'gorsel', 'drawing', 'picture'],
  'cocuk': ['yavru', 'evlat', 'kid', 'child', 'bebek', 'minnik'],
  'analiz': ['degerlendirme', 'inceleme', 'rapor', 'analysis'],
  'hesap': ['profil', 'kullanici', 'account', 'uyelik'],
  'fiyat': ['ucret', 'maliyet', 'para', 'price', 'cost'],
  'sorun': ['problem', 'hata', 'bug', 'sikinti', 'error', 'issue'],
  'yardim': ['destek', 'support', 'help', 'asistan'],

  // Sifatlar
  'ucretsiz': ['bedava', 'free', 'parasiz', 'gratuit'],
  'guvenli': ['emniyetli', 'safe', 'secure', 'korunakli'],
  'hizli': ['cabuk', 'seri', 'fast', 'quick'],
  'kolay': ['basit', 'simple', 'easy', 'zahmetsiz'],

  // Sorular
  'nasil': ['ne sekilde', 'ne yapmaliyim', 'how', 'hangi yolla'],
  'neden': ['nicin', 'sebep', 'why', 'ne icin'],
  'ne zaman': ['nezaman', 'when', 'hangi tarih'],
  'nerede': ['where', 'hangi yer', 'nerden'],
};

// ============================================
// FAQ DATABASE (55+ Soru)
// ============================================

const FAQ_DATABASE: FAQItem[] = [
  // ============================================
  // MASAL OLUSTURMA (12 FAQ)
  // ============================================
  {
    id: 'story_001',
    keywords: ['hikaye', 'masal', 'olustur', 'nasil', 'yap', 'baslat'],
    question: 'Nasil hikaye/masal olusturabilirim?',
    answer: `**Masal Olusturma Adimlari:**

1. Alt menuден "Masallar" sekmesine gidin
2. Sag ustteki + butonuna tiklayin
3. Cocugunuzun cizimini yukleyin
4. AI size tema onerileri sunacak
5. Bir tema secin veya kendi basliginizi yazin
6. "Masal Olustur" butonuna tiklayin

Yaklasik 1-2 dakika icinde gorsellerle birlikte kisisellestirilmis bir masal hazir olacak!`,
    category: 'story',
    priority: 10,
  },
  {
    id: 'story_002',
    keywords: ['pdf', 'indir', 'kaydet', 'paylas', 'yazdir', 'cikti', 'nasil', 'download'],
    question: 'Masali PDF olarak nasil indirebilirim?',
    answer: `**PDF Indirme:**

1. Masallar sekmesinden masalinizi acin
2. Sag ustteki paylas/indir ikonuna tiklayin
3. "PDF Indir" secenegini secin

PDF dosyasi cihaziniza kaydedilecek ve istediginiz zaman yazdirabilir veya paylasabilirsiniz!

Ipucu: PDF'ler otomatik olarak olusturulur, ekstra bir islem gerekmez.`,
    category: 'story',
    priority: 8,
  },
  {
    id: 'story_003',
    keywords: ['sure', 'zaman', 'dakika', 'ne kadar', 'bekle', 'hazir'],
    question: 'Masal ne kadar surede hazir olur?',
    answer: `**Masal Olusturma Suresi:**

- **Standart masal:** 1-2 dakika
- **Interaktif masal:** 2-3 dakika
- **Uzun/detayli masal:** 3-4 dakika

Sure, internet hiziniza ve sectiginiz masal turune gore degisebilir. Olusturma sirasinda ilerleme cubugunu gorebilirsiniz.`,
    category: 'story',
    priority: 7,
  },
  {
    id: 'story_004',
    keywords: ['tema', 'konu', 'baslik', 'oner', 'sec', 'fikir'],
    question: 'Masal temalari nasil belirleniyor?',
    answer: `**Tema Secimi:**

AI, cocugunuzun cizimini analiz ederek uygun temalar onerir:
- Cizimdeki karakterler ve nesneler
- Renk paleti ve duygu tonu
- Cocugunuzun yasi

**Secenekler:**
- Onerilen temalardan birini secebilirsiniz
- Kendi ozel basliginizi yazabilirsiniz
- "Surpriz" secenegiyle AI'in secmesine izin verebilirsiniz`,
    category: 'story',
    priority: 6,
  },
  {
    id: 'story_005',
    keywords: ['uzunluk', 'sayfa', 'kisa', 'uzun', 'kelime'],
    question: 'Masal uzunlugunu ayarlayabilir miyim?',
    answer: `**Masal Uzunlugu:**

Masal olusturmadan once uzunluk secebilirsiniz:
- **Kisa (2-3 sayfa):** 2-4 yas icin ideal
- **Orta (4-6 sayfa):** 5-7 yas icin
- **Uzun (7-10 sayfa):** 8+ yas icin

Cocugunuzun profilindeki yas bilgisine gore varsayilan uzunluk otomatik ayarlanir.`,
    category: 'story',
    priority: 5,
  },
  {
    id: 'story_006',
    keywords: ['gorsel', 'resim', 'illustrasyon', 'cizim', 'masal icindeki'],
    question: 'Masallardaki gorseller nasil olusturuluyor?',
    answer: `**Masal Gorselleri:**

Her masal icin ozel gorseller AI tarafindan olusturulur:
- Cocugunuzun cizim stiline uygun
- Hikayeyle uyumlu sahneler
- Cocuk dostu ve guvenli icerik

Her sayfada ortalama 1 gorsel bulunur. Gorseller otomatik olusturulur, ekstra bir islem gerekmez.`,
    category: 'story',
    priority: 5,
  },
  {
    id: 'story_007',
    keywords: ['duzenle', 'degistir', 'edit', 'guncelle', 'metin'],
    question: 'Olusturulan masali duzenleyebilir miyim?',
    answer: `**Masal Duzenleme:**

Su an icin olusturulan masallar dogrudan duzenlenemiyor. Ancak:
- Yeni bir masal olusturabilirsiniz
- Farkli tema secebilirsiniz
- Baska bir cizim kullanabilirsiniz

Gelecek guncellemelerde duzenleme ozelligi eklenecektir.`,
    category: 'story',
    priority: 4,
  },
  {
    id: 'story_008',
    keywords: ['kaydet', 'arsiv', 'gecmis', 'eski', 'bul', 'nerede'],
    question: 'Eski masallarimi nerede bulabilirim?',
    answer: `**Masal Arsivi:**

Tum masallariniz otomatik olarak kaydedilir:
1. "Masallar" sekmesine gidin
2. Cocuk profilini secin
3. Kronolojik sirada tum masallari gorun

Masallari tarihe, temaya veya cocuga gore filtreleyebilirsiniz.`,
    category: 'story',
    priority: 6,
  },
  {
    id: 'story_009',
    keywords: ['sesli', 'oku', 'dinle', 'ses', 'audio', 'anlatim'],
    question: 'Masallari sesli dinleyebilir miyim?',
    answer: `**Sesli Masal:**

Evet! Masallari sesli dinleyebilirsiniz:
1. Masali acin
2. Play/Oynat butonuna basin
3. AI sesiyle masal okunur

Sesi duraklatabilir, ileri/geri sarabilirsiniz. Uyku zamanlayicisi ozelligi de mevcuttur.`,
    category: 'story',
    priority: 7,
  },
  {
    id: 'story_010',
    keywords: ['sil', 'kaldir', 'cikar', 'yok et', 'temizle'],
    question: 'Bir masali nasil silebilirim?',
    answer: `**Masal Silme:**

1. Silmek istediginiz masali acin
2. Sag ust kosedeki menu ikonuna tiklayin
3. "Masali Sil" secenegini secin
4. Onay verin

Dikkat: Silinen masallar geri getirilemez!`,
    category: 'story',
    priority: 4,
  },
  {
    id: 'story_011',
    keywords: ['limit', 'sinir', 'kac', 'tane', 'gunluk', 'aylik'],
    question: 'Gunluk kac masal olusturabilirim?',
    answer: `**Masal Limitleri:**

- **Ucretsiz plan:** Gunluk 3 masal
- **Premium plan:** Sinirsiz masal

Limit her gun gece yarisi sifirlanir. Premium'a gecis icin Ayarlar > Abonelik bolumune bakin.`,
    category: 'story',
    priority: 6,
  },
  {
    id: 'story_012',
    keywords: ['dil', 'ingilizce', 'language', 'turkce', 'cevir'],
    question: 'Masallar hangi dilde olusturuluyor?',
    answer: `**Masal Dili:**

Su an masallar yalnizca Turkce olarak olusturuluyor. Gelecekte Ingilizce ve diger diller eklenecektir.

Ayarlar > Tercihler bolumunden varsayilan dili secebilirsiniz.`,
    category: 'story',
    priority: 3,
  },

  // ============================================
  // CIZIM ANALIZI (10 FAQ)
  // ============================================
  {
    id: 'analysis_001',
    keywords: ['analiz', 'cizim', 'degerlendirme', 'psikoloji', 'ne anlama', 'anlam', 'nedir', 'ne', 'resim'],
    question: 'Cizim analizi ne anlama geliyor?',
    answer: `**Cizim Analizi:**

AI, cocugunuzun cizimlerini cocuk psikolojisi prensipleri dogrultusunda degerlendirir.

**Nelere Bakilir:**
- Renk kullanimi ve tercihleri
- Figurlerin boyutu ve konumu
- Detay seviyesi
- Genel kompozisyon

**Onemli Not:**
Bu analiz profesyonel psikolojik degerlendirme yerine gecmez. Eglenceli bir icgoru araci olarak tasarlanmistir.`,
    category: 'analysis',
    priority: 10,
  },
  {
    id: 'analysis_002',
    keywords: ['guvenilir', 'dogru', 'isabetli', 'gercek', 'bilimsel'],
    question: 'Cizim analizi ne kadar guvenilir?',
    answer: `**Analiz Guvenirligi:**

Analizlerimiz:
- Cocuk psikolojisi literaturune dayanir
- Genel egilimler ve gozlemler sunar
- Eglenceli ve egitici amaclidir

**Unutmayin:**
- Her cocuk benzersizdir
- Tek bir cizim tum resmi vermez
- Endiseniz varsa uzmana danisin`,
    category: 'analysis',
    priority: 8,
  },
  {
    id: 'analysis_003',
    keywords: ['renk', 'anlam', 'kirmizi', 'mavi', 'siyah', 'tercih'],
    question: 'Renk tercihleri ne anlama geliyor?',
    answer: `**Renk Anlamlari:**

- **Kirmizi:** Enerji, heyecan, bazen ofke
- **Mavi:** Sakinlik, huzur, dusuncelilik
- **Yesil:** Doga sevgisi, denge
- **Sari:** Mutluluk, iyimserlik
- **Siyah:** Guc, bazen kaygı (ama normal!)
- **Pembe/Mor:** Yaraticilik, hayal gucu

Renk tercihleri yasla degisir ve her zaman derin bir anlam tasimayabilir.`,
    category: 'analysis',
    priority: 7,
  },
  {
    id: 'analysis_004',
    keywords: ['endise', 'kaygi', 'korku', 'normal', 'mi', 'uzman'],
    question: 'Cizimde endiselenmem gereken bir sey var mi?',
    answer: `**Endise Isareti mi?**

Cogu cizim ozelligi tamamen normaldir. Ancak sunlar dikkat cekici olabilir:
- Surekli karanlik temalar
- Aile uyelerinin olmamasi/cok kucuk cizilmesi
- Siddet iceren sahneler

**Onemli:** Tek bir cizime bakmak yerine zamana yayilan kaliplara bakin. Ciddi endiseniz varsa bir cocuk psikoloğuna danisin.`,
    category: 'analysis',
    priority: 9,
  },
  {
    id: 'analysis_005',
    keywords: ['yas', 'gelisim', 'normal', 'seviye', 'beklenen'],
    question: 'Cocugumun cizimleri yasina uygun mu?',
    answer: `**Yasa Gore Cizim Gelisimi:**

- **2-3 yas:** Karalamalar, daireler
- **3-4 yas:** Basit figurler, "bas-bacak" insanlar
- **4-5 yas:** Daha detayli figurler, ev/gunes
- **5-7 yas:** Sahneler, hikaye anlatimi
- **7+ yas:** Perspektif, detay, gercekcilik

Her cocuk kendi hizinda gelisir. Karsilastirma yerine ilerlemeye odaklanin.`,
    category: 'analysis',
    priority: 7,
  },
  {
    id: 'analysis_006',
    keywords: ['rapor', 'sonuc', 'nerede', 'gor', 'bul'],
    question: 'Analiz raporunu nerede gorebilirim?',
    answer: `**Analiz Raporu:**

1. Cizim yukledikten sonra "Analiz Et" butonuna basin
2. Sonuclar birkaç saniye icinde gorunur
3. "Detayli Rapor" ile daha fazla bilgi alin

Raporlar "Analizler" sekmesinde de arsivlenir.`,
    category: 'analysis',
    priority: 6,
  },
  {
    id: 'analysis_007',
    keywords: ['karsilastir', 'onceki', 'ilerleme', 'gelisim', 'degisim'],
    question: 'Onceki cizimlerle karsilastirabilir miyim?',
    answer: `**Gelisim Takibi:**

Evet! "Analizler" sekmesinde:
- Zamana gore cizimleri goruntuleyin
- Gelisim grafiklerini inceleyin
- Degisen temaları karsilastirin

Bu ozellik cocugunuzun sanatsal ve duygusal gelisimini takip etmenize yardimci olur.`,
    category: 'analysis',
    priority: 5,
  },
  {
    id: 'analysis_008',
    keywords: ['aile', 'resmi', 'anne', 'baba', 'kardes'],
    question: 'Aile resmi ne anlatiyor?',
    answer: `**Aile Resmi Analizi:**

Cocuklarin aile resimleri genellikle:
- Aile ici iliskileri yansitir
- Kendini konumlandirmayi gosterir
- Duygusal baglari ifade eder

**Dikkat:**
- Buyuk cizilen = onemli/etkili
- Yakin cizilen = duygusal yakinlik
- Eksik bireyler her zaman olumsuz degil

Tek resme dayanarak yorum yapmaktan kacinin.`,
    category: 'analysis',
    priority: 6,
  },
  {
    id: 'analysis_009',
    keywords: ['canavar', 'korkunc', 'karanlik', 'siddet', 'kavga'],
    question: 'Cocugum korkunc seyler ciziyor, normal mi?',
    answer: `**Korkunc Temalar:**

Canavarlar ve karanlik temalar genellikle NORMALDIR:
- Korkulari isleme yontemi
- Hayal gucunun bir parcasi
- Medyadan etkilenme

**Ne zaman dikkat etmeli:**
- Surekli ve yogun siddet
- Kendine zarar temalari
- Ani ve dramatik degisimler

Bu durumlarda bir uzmanla konusmanizi oneririz.`,
    category: 'analysis',
    priority: 8,
  },
  {
    id: 'analysis_010',
    keywords: ['aktivite', 'oneri', 'etkinlik', 'ne yapabilirim'],
    question: 'Analize gore ne yapabilirim?',
    answer: `**Aktivite Onerileri:**

Her analizden sonra kisisellestirilmis oneriler sunuyoruz:
- Sanat aktiviteleri
- Oyun onerileri
- Konusma baslangic noktalari
- Kitap/film onerileri

Oneriler cocugunuzun yasina ve cizimdeki temalara gore uyarlanir.`,
    category: 'analysis',
    priority: 5,
  },

  // ============================================
  // INTERAKTIF MASAL (8 FAQ)
  // ============================================
  {
    id: 'interactive_001',
    keywords: ['interaktif', 'secim', 'macera', 'interactive', 'secimli', 'nedir', 'ne'],
    question: 'Interaktif masal nedir?',
    answer: `**Interaktif Masal:**

Cocugunuzun hikayede aktif rol aldigi ozel bir masal turudur!

**Nasil Calisir:**
- Hikaye ilerlerken cocugunuz secimler yapar
- Her secim hikayenin gidisatini degistirir
- Secimler kisilik ozelliklerini yansitir

**Ebeveyn Raporu:**
- Cocugunuzun secimlerinin analizi
- Empati, cesaret, merak gibi ozelliklerin degerlendirmesi

Masal olusturuken "Interaktif Masal" secenegini secerek deneyebilirsiniz!`,
    category: 'interactive',
    priority: 10,
  },
  {
    id: 'interactive_002',
    keywords: ['ebeveyn', 'rapor', 'secim', 'analiz', 'sonuc'],
    question: 'Ebeveyn raporu ne ise yarar?',
    answer: `**Ebeveyn Raporu:**

Interaktif masaldan sonra sunulan detayli analiz:

**Icerir:**
- Yapilan secimlerin ozeti
- Kisilik egilimlerinin degerlendirmesi
- Empati, cesaret, merak skorlari
- Onerilen aktiviteler

Rapor, cocugunuzu daha iyi anlamaniza yardimci olur.`,
    category: 'interactive',
    priority: 8,
  },
  {
    id: 'interactive_003',
    keywords: ['secim', 'kac', 'tane', 'nokta', 'karar'],
    question: 'Interaktif masalda kac secim noktasi var?',
    answer: `**Secim Noktalari:**

Her interaktif masalda ortalama:
- 4-6 secim noktasi
- Her noktada 2-3 secenek
- Farkli sonlara ulasan yollar

Masalin uzunluguna gore secim sayisi degisebilir.`,
    category: 'interactive',
    priority: 5,
  },
  {
    id: 'interactive_004',
    keywords: ['tekrar', 'farkli', 'son', 'yeniden', 'baska'],
    question: 'Farkli secimlerle tekrar oynayabilir miyim?',
    answer: `**Tekrar Oynama:**

Evet! Ayni masali farkli secimlerle tekrar oynayabilirsiniz:
1. Masali acin
2. "Yeniden Baslat" butonuna basin
3. Farkli secimler yapin

Her farkli kombinasyon kaydedilir ve karsilastirabilirsiniz.`,
    category: 'interactive',
    priority: 6,
  },
  {
    id: 'interactive_005',
    keywords: ['yas', 'kucuk', 'buyuk', 'uygun', 'zor'],
    question: 'Interaktif masal kac yas icin uygun?',
    answer: `**Yas Uygunlugu:**

- **3-4 yas:** Basit secimler, ebeveyn yardimi ile
- **5-7 yas:** Bagimsiz oynayabilir
- **8+ yas:** Karmasik secimler, derin hikayeler

Secim zorluğu cocugunuzun yasina gore otomatik ayarlanir.`,
    category: 'interactive',
    priority: 7,
  },
  {
    id: 'interactive_006',
    keywords: ['birlikte', 'beraber', 'aile', 'oyna'],
    question: 'Cocugumla birlikte oynayabilir miyim?',
    answer: `**Birlikte Oynama:**

Kesinlikle! Interaktif masallar aile aktivitesi olarak harika:
- Birlikte secimleri tartisin
- Cocugunuzun dusuncelerini dinleyin
- Alternatif sonuclari kesfedin

Bu, kaliteli vakit gecirmenin guzel bir yolu!`,
    category: 'interactive',
    priority: 6,
  },
  {
    id: 'interactive_007',
    keywords: ['kaydet', 'ilerleme', 'devam', 'birak', 'sonra'],
    question: 'Interaktif masali yarim birakabilir miyim?',
    answer: `**Ilerleme Kaydetme:**

Evet, ilerlemeniz otomatik kaydedilir:
- Istediginiz zaman cikin
- "Devam Et" ile kaldiginiz yerden baslayin
- Tum secimler hatirlanir

Masal 7 gun icinde tamamlanmazsa bastan baslar.`,
    category: 'interactive',
    priority: 5,
  },
  {
    id: 'interactive_008',
    keywords: ['premium', 'ucretsiz', 'sinir', 'limit'],
    question: 'Interaktif masallar premium mi?',
    answer: `**Interaktif Masal Erisimi:**

- **Ucretsiz plan:** Ayda 2 interaktif masal
- **Premium plan:** Sinirsiz interaktif masal

Premium'a gecis icin Ayarlar > Abonelik bolumune bakin.`,
    category: 'interactive',
    priority: 6,
  },

  // ============================================
  // BOYAMA (8 FAQ)
  // ============================================
  {
    id: 'coloring_001',
    keywords: ['boyama', 'boya', 'renklendirme', 'coloring', 'nasil', 'yapilir', 'calisir', 'color'],
    question: 'Boyama ozelligi nasil calisir?',
    answer: `**Boyama Ozelligi:**

Cocugunuzun cizimlerinden boyama sayfalari olusturabilirsiniz:
1. "Boyama" sekmesine gidin
2. Bir cizim secin veya yukleyin
3. AI siyah-beyaz boyama sayfasi olusturur
4. Dijital olarak boyayin veya yazdirup kagit uzerinde boyayin

Renkli kalemler, fircalar ve efektler mevcuttur!`,
    category: 'coloring',
    priority: 10,
  },
  {
    id: 'coloring_002',
    keywords: ['yazdir', 'kagit', 'cikti', 'print'],
    question: 'Boyama sayfasini yazdirabilirim miyim?',
    answer: `**Yazdirma:**

1. Boyama sayfasini acin
2. Sag ustteki yazdir ikonuna tiklayin
3. A4 boyutunda PDF olusturulur
4. Yazicidan cikti alin

Ipucu: 120+ gr kagit kullanmak daha iyi sonuc verir.`,
    category: 'coloring',
    priority: 7,
  },
  {
    id: 'coloring_003',
    keywords: ['kalem', 'firca', 'arac', 'tool', 'secenek'],
    question: 'Hangi boyama araclari var?',
    answer: `**Boyama Araclari:**

- **Renkli kalemler:** Klasik boyama
- **Sulu boya:** Akmali efekt
- **Pastel:** Yumusak dokular
- **Firca:** Farkli kalinliklar
- **Doldurma:** Tek tikla bolge boyama
- **Silgi:** Hatalari duzeltme

Renk paleti sinirsiz ve ozellestirilsbilir!`,
    category: 'coloring',
    priority: 6,
  },
  {
    id: 'coloring_004',
    keywords: ['kaydet', 'galeri', 'bitir', 'tamamla'],
    question: 'Boyadigim resmi nasil kaydederim?',
    answer: `**Kaydetme:**

- **Otomatik kayit:** Her darbede kaydedilir
- **Galeri:** Tum boyamalar "Galerilerim"de
- **Paylasim:** Sosyal medyada paylasin
- **Indirme:** PNG veya PDF olarak indirin

Yarim kalan boyamalara istediginiz zaman devam edebilirsiniz.`,
    category: 'coloring',
    priority: 6,
  },
  {
    id: 'coloring_005',
    keywords: ['hazir', 'sablon', 'template', 'ornek'],
    question: 'Hazir boyama sablonlari var mi?',
    answer: `**Hazir Sablonlar:**

Evet! 100+ hazir boyama sayfasi:
- Hayvanlar
- Masallar
- Dogа
- Araclar
- Mevsimler

Her hafta yeni sablonlar ekleniyor. "Boyama > Kesfet" bolumunden ulasabilirsiniz.`,
    category: 'coloring',
    priority: 5,
  },
  {
    id: 'coloring_006',
    keywords: ['zorluk', 'kolay', 'zor', 'detay', 'seviye'],
    question: 'Boyama zorluk seviyesi ayarlanabilir mi?',
    answer: `**Zorluk Seviyeleri:**

- **Kolay:** Buyuk alanlar, az detay (2-4 yas)
- **Orta:** Daha fazla bolum (5-7 yas)
- **Zor:** Ince detaylar (8+ yas)

Cizimden boyama sayfasi olustururken zorluk secebilirsiniz.`,
    category: 'coloring',
    priority: 5,
  },
  {
    id: 'coloring_007',
    keywords: ['ses', 'muzik', 'efekt', 'sound'],
    question: 'Boyama sirasinda ses efektleri var mi?',
    answer: `**Ses Efektleri:**

Evet! Boyama deneyimini zenginlestiren sesler:
- Kalem cizikirkenki ses
- Boya akisi efekti
- Tamamlama kutlama sesi
- Arka plan muzigi

Ayarlar > Ses bolumunden acip kapatabilirsiniz.`,
    category: 'coloring',
    priority: 3,
  },
  {
    id: 'coloring_008',
    keywords: ['coklu', 'oyuncu', 'birlikte', 'isbirlikli'],
    question: 'Birden fazla kisi ayni anda boyayabilir mi?',
    answer: `**Coklu Oyuncu:**

Su an bu ozellik mevcut degil, ancak gelecek guncellemelerde eklenecek:
- Aile boyama oturumu
- Gercek zamanli isbirligi
- Uzaktan birlikte boyama

Gelismeler icin bizi takip edin!`,
    category: 'coloring',
    priority: 2,
  },

  // ============================================
  // HESAP & AYARLAR (10 FAQ)
  // ============================================
  {
    id: 'account_001',
    keywords: ['cocuk', 'ekle', 'profil', 'kayit', 'yeni'],
    question: 'Cocuk profili nasil eklerim?',
    answer: `**Cocuk Profili Ekleme:**

1. Alt menuден "Profil" sekmesine gidin
2. "Cocuk Ekle" butonuna tiklayin
3. Cocugunuzun adini ve yasini girin
4. Istege bagli olarak cinsiyet secin

Birden fazla cocuk ekleyebilirsiniz! Her cocuk icin ayri hikayeler ve analizler tutulur.`,
    category: 'account',
    priority: 10,
  },
  {
    id: 'account_002',
    keywords: ['ucretsiz', 'ucret', 'fiyat', 'maliyet', 'premium', 'abonelik', 'bedava', 'free', 'parasiz', 'para'],
    question: 'Uygulama ucretsiz mi?',
    answer: `**Fiyatlandirma:**

**Ucretsiz Plan:**
- Gunluk 3 masal
- Sinirli analiz
- Temel boyama araclari

**Premium Plan:**
- Sinirsiz masal
- Tum analiz ozellikleri
- Tum boyama araclari
- Reklamsiz deneyim

Detayli bilgi icin Ayarlar > Abonelik bolumune bakin.`,
    category: 'account',
    priority: 9,
  },
  {
    id: 'account_003',
    keywords: ['sifre', 'degistir', 'password', 'unutum', 'reset'],
    question: 'Sifremi nasil degistirebilirim?',
    answer: `**Sifre Degistirme:**

1. Profil > Ayarlar > Guvenlik
2. "Sifre Degistir" butonuna tiklayin
3. Mevcut sifrenizi girin
4. Yeni sifrenizi iki kez girin
5. Kaydedin

Sifrenizi unuttuysaniz "Sifremi Unuttum" secenegini kullanin.`,
    category: 'account',
    priority: 6,
  },
  {
    id: 'account_004',
    keywords: ['hesap', 'sil', 'kaldir', 'kapat', 'iptal'],
    question: 'Hesabimi nasil silebilirim?',
    answer: `**Hesap Silme:**

1. Profil > Ayarlar > Hesap
2. "Hesabi Sil" secenegine tiklayin
3. Sebebi belirtin (istege bagli)
4. Onay verin

**Dikkat:** Bu islem geri alinamaz! Tum verileriniz silinir.`,
    category: 'account',
    priority: 5,
  },
  {
    id: 'account_005',
    keywords: ['bildirim', 'notification', 'uyari', 'mesaj'],
    question: 'Bildirimleri nasil yonetebilirim?',
    answer: `**Bildirim Ayarlari:**

Profil > Ayarlar > Bildirimler:
- **Gunluk hatirlatici:** Masal okuma zamani
- **Yeni ozellikler:** Guncelleme duyurulari
- **Ipuclari:** Kullanim onerileri

Her bildirim turunu ayri ayri acip kapatabilirsiniz.`,
    category: 'account',
    priority: 4,
  },
  {
    id: 'account_006',
    keywords: ['veri', 'indir', 'export', 'yedek', 'backup'],
    question: 'Verilerimi indirebilir miyim?',
    answer: `**Veri Indirme:**

Evet! KVKK kapsaminda tum verilerinizi indirebilirsiniz:
1. Profil > Ayarlar > Gizlilik
2. "Verilerimi Indir" butonuna tiklayin
3. ZIP dosyasi olusturulur

Icerdikleri: Masallar, cizsimler, analizler, profil bilgileri.`,
    category: 'account',
    priority: 5,
  },
  {
    id: 'account_007',
    keywords: ['cihaz', 'telefon', 'tablet', 'senkron', 'sync'],
    question: 'Birden fazla cihazda kullanabilir miyim?',
    answer: `**Coklu Cihaz:**

Evet! Hesabinizla istediginiz cihazda giris yapin:
- Telefon
- Tablet
- Bilgisayar (yaklnda)

Tum verileriniz otomatik senkronize olur.`,
    category: 'account',
    priority: 6,
  },
  {
    id: 'account_008',
    keywords: ['iptal', 'abonelik', 'premium', 'vazgec'],
    question: 'Premium aboneligimi nasil iptal ederim?',
    answer: `**Abonelik Iptali:**

1. Profil > Ayarlar > Abonelik
2. "Aboneligi Iptal Et" tiklayin
3. Iptal sebebini belirtin
4. Onaylayin

Donem sonuna kadar premium ozellikler aktif kalir. Istediginiz zaman yeniden abone olabilirsiniz.`,
    category: 'account',
    priority: 7,
  },
  {
    id: 'account_009',
    keywords: ['guvenli', 'veri', 'gizlilik', 'privacy', 'kvkk'],
    question: 'Verilerim guvende mi?',
    answer: `**Gizlilik & Guvenlik:**

Cocugunuzun guvenligi bizim icin en onemli onceliktir.

**Guvenlik Onlemleri:**
- Tum veriler sifreli olarak saklanir
- Cizimler ve hikayeler sadece size ozeldir
- Ucuncu taraflarla paylasilmaz
- KVKK uyumlu veri isleme

Gizlilik politikamizi Ayarlar > Gizlilik bolumunden inceleyebilirsiniz.`,
    category: 'account',
    priority: 9,
  },
  {
    id: 'account_010',
    keywords: ['destek', 'iletisim', 'contact', 'email', 'yardim'],
    question: 'Destekle nasil iletisime gecerim?',
    answer: `**Destek Iletisimi:**

Birkaс yol var:
1. **Uygulama ici:** Profil > Destek > Mesaj Gonder
2. **E-posta:** destek@renkioo.com
3. **SSS:** Bu chatbot ile cogu soruya cevap bulabilirsiniz

Genellikle 24 saat icinde yanit veriyoruz.`,
    category: 'account',
    priority: 8,
  },

  // ============================================
  // TEKNIK & SORUN GIDERME (7 FAQ)
  // ============================================
  {
    id: 'technical_001',
    keywords: ['hata', 'calismıyor', 'sorun', 'bug', 'problem', 'error'],
    question: 'Bir sorun yasiyorum, ne yapmaliyim?',
    answer: `**Sorun Giderme:**

1. **Uygulamayi yeniden baslatin**
2. **Internet baglantinizi kontrol edin**
3. **Uygulamayi guncelleyin**

Sorun devam ederse:
- Profil > Ayarlar > Destek bolumunden bize ulasin
- Hatanin ekran goruntusunu paylasin

Yardimci olmaktan mutluluk duyariz!`,
    category: 'technical',
    priority: 10,
  },
  {
    id: 'technical_002',
    keywords: ['yavas', 'slow', 'donuyor', 'takiliyor', 'kasıyor'],
    question: 'Uygulama yavas calisiyor, ne yapabilirim?',
    answer: `**Performans Iyilestirme:**

1. **Onbellek temizleyin:** Ayarlar > Depolama > Onbellek Temizle
2. **Arka plan uygulamalarini kapatin**
3. **Cihazinizi yeniden baslatin**
4. **Uygulamayi guncelleyin**

Eski cihazlarda performans dusuk olabilir.`,
    category: 'technical',
    priority: 7,
  },
  {
    id: 'technical_003',
    keywords: ['guncelle', 'update', 'versiyon', 'yeni', 'surum'],
    question: 'Uygulamayi nasil guncellerim?',
    answer: `**Guncelleme:**

- **iOS:** App Store > Guncellemeler > Renkioo
- **Android:** Play Store > Uygulamalarim > Guncelle

Otomatik guncelleme icin cihaz ayarlarinizi kontrol edin. En son surumu kullanmanizi oneririz.`,
    category: 'technical',
    priority: 6,
  },
  {
    id: 'technical_004',
    keywords: ['internet', 'baglanti', 'offline', 'cevrimdisi'],
    question: 'Internet olmadan kullanabilir miyim?',
    answer: `**Cevrimdisi Kullanim:**

Sinirli ozellikler cevrimdisi calisir:
- Onceden indirilen masallari okuma
- Kaydedilmis boyama sayfalari
- Galeri görüntüleme

Masal olusturma ve analiz icin internet gereklidir.`,
    category: 'technical',
    priority: 5,
  },
  {
    id: 'technical_005',
    keywords: ['alan', 'depolama', 'yer', 'storage', 'dolu'],
    question: 'Uygulama ne kadar depolama kullaniyor?',
    answer: `**Depolama Kullanimi:**

- **Uygulama:** ~100-150 MB
- **Icerikler:** Kullanima gore degisir

Yer acmak icin:
1. Ayarlar > Depolama
2. Onbellek temizle
3. Eski masallari silin

Ortalama kullanim: 200-500 MB arasi.`,
    category: 'technical',
    priority: 4,
  },
  {
    id: 'technical_006',
    keywords: ['cihaz', 'uyumluluk', 'telefon', 'tablet', 'gereksinim'],
    question: 'Hangi cihazlarda calisir?',
    answer: `**Cihaz Uyumlulugu:**

- **iOS:** iPhone 8+, iPad (5. nesil+), iOS 14+
- **Android:** Android 8.0+, 3GB+ RAM

Daha eski cihazlarda bazi ozellikler kisitli olabilir.`,
    category: 'technical',
    priority: 5,
  },
  {
    id: 'technical_007',
    keywords: ['giris', 'login', 'acilamiyor', 'giremiyorum'],
    question: 'Giris yapamiyorum, ne yapmaliyim?',
    answer: `**Giris Sorunlari:**

1. E-posta adresinizi kontrol edin
2. "Sifremi Unuttum" ile sifre sifirlayin
3. Sosyal giris kullandiysan ayni yontemi secin
4. Internet baglantinizi kontrol edin

Hala sorun varsa destek@renkioo.com adresine yazin.`,
    category: 'technical',
    priority: 8,
  },

  // ============================================
  // GENEL (5 FAQ)
  // ============================================
  {
    id: 'general_001',
    keywords: ['gelisim', 'yas', 'uygun', 'seviye', 'kac', 'grubu'],
    question: 'Hangi yas grubu icin uygun?',
    answer: `**Yas Uygunlugu:**

Renkioo Studio 2-12 yas arasi cocuklar icin tasarlanmistir.

**Yasa Gore Ozellikler:**
- **2-4 yas:** Basit hikayeler, buyuk gorseller
- **5-7 yas:** Orta uzunlukta masallar, interaktif secenekler
- **8-12 yas:** Daha detayli hikayeler, karmasik temalar

Profil ayarlarindan cocugunuzun yasini girerek iceriklerin ona gore uyarlanmasini saglayabilirsiniz.`,
    category: 'general',
    priority: 9,
  },
  {
    id: 'general_002',
    keywords: ['ne', 'renkioo', 'uygulama', 'nedir', 'hakkinda'],
    question: 'Renkioo Studio nedir?',
    answer: `**Renkioo Studio:**

Cocuklarin cizimlerinden AI ile kisisellestirilmis masallar olusturan bir uygulamadir.

**Temel Ozellikler:**
- Cizimden masal olusturma
- Cizim psikolojik analizi
- Interaktif secimli hikayeler
- Dijital boyama
- PDF indirme ve paylasim

Ebeveynler icin tasarlanan bu uygulama, cocuklarin yaraticiligini destekler.`,
    category: 'general',
    priority: 10,
  },
  {
    id: 'general_003',
    keywords: ['guvenlik', 'cocuk', 'icerik', 'uygun', 'filtre'],
    question: 'Icerikler cocuklar icin guvenli mi?',
    answer: `**Icerik Guvenligi:**

Tum icerikler cocuk guvenliggi goz onunde bulundurularak olusturulur:
- Yasa uygun temalar
- Siddet icermeyen hikayeler
- Olumlu mesajlar
- Ebeveyn kontrolleri

AI modelleri cocuk dostu ciktilar uretmek icin ozel olarak ayarlanmistir.`,
    category: 'general',
    priority: 9,
  },
  {
    id: 'general_004',
    keywords: ['oneri', 'fikir', 'feedback', 'geri', 'bildirim'],
    question: 'Onerilerimi nasil iletebilirim?',
    answer: `**Geri Bildirim:**

Fikirleriniz bizim icin degerli!

1. Profil > Ayarlar > Geri Bildirim
2. Onerinizi yazin
3. Istege bagli olarak ekran goruntusu ekleyin
4. Gonderin

Her oneriyi dikkatle degerlendiriyoruz.`,
    category: 'general',
    priority: 5,
  },
  {
    id: 'general_005',
    keywords: ['merhaba', 'selam', 'hey', 'nasilsin', 'iyi', 'gunler'],
    question: 'Selamlama',
    answer: `Merhaba! Ben Renkioo'nun yardimci asistaniyim. Size nasil yardimci olabilirim?

Sik sorulan konular:
- Masal olusturma
- Cizim analizi
- Hesap ayarlari
- Teknik destek

Bir soru sormaktan cekinmeyin!`,
    category: 'general',
    priority: 1,
  },
];

// ============================================
// TURKCE NORMALIZASYON (Gelistirilmis)
// ============================================

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[?!.,;:'"()[\]{}]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'i')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/\s+/g, ' ')
    .trim();
}

function expandWithSynonyms(words: string[]): string[] {
  const expanded = new Set<string>(words);

  for (const word of words) {
    // Dogrudan synonym eslesmesi
    if (TURKISH_SYNONYMS[word]) {
      TURKISH_SYNONYMS[word].forEach(syn => expanded.add(normalizeText(syn)));
    }

    // Ters arama (synonym listesinde mi?)
    for (const [key, synonyms] of Object.entries(TURKISH_SYNONYMS)) {
      if (synonyms.map(s => normalizeText(s)).includes(word)) {
        expanded.add(normalizeText(key));
        synonyms.forEach(syn => expanded.add(normalizeText(syn)));
      }
    }
  }

  return Array.from(expanded);
}

// ============================================
// FAQ MATCHING (Gelistirilmis)
// ============================================

interface FAQMatchResult {
  faq: FAQItem;
  score: number;
  confidence: number;
}

function findFAQMatch(userMessage: string): FAQMatchResult | null {
  const normalized = normalizeText(userMessage);
  const words = normalized.split(/\s+/);
  const expandedWords = expandWithSynonyms(words);

  const results: FAQMatchResult[] = [];

  for (const faq of FAQ_DATABASE) {
    let score = 0;
    let matchedKeywords = 0;
    const normalizedKeywords = faq.keywords.map(normalizeText);

    // Keyword eslesmesi
    for (const keyword of normalizedKeywords) {
      // Tam kelime eslesmesi (orijinal)
      if (words.includes(keyword)) {
        score += 3;
        matchedKeywords++;
      }
      // Synonym eslesmesi
      else if (expandedWords.includes(keyword)) {
        score += 2;
        matchedKeywords++;
      }
      // Kismi eslesme (sadece 3+ karakter keywordler icin)
      else if (keyword.length >= 3 && normalized.includes(keyword)) {
        score += 1;
        matchedKeywords += 0.5;
      }
    }

    // Priority bonusu (daha etkili)
    score += (faq.priority || 0) * 0.2;

    // Kategori-spesifik keyword bonusu
    // Eger soru icinde kategoriyle ilgili onemli kelimeler varsa bonus ver
    const categoryBonus = getCategoryBonus(normalized, faq.category);
    score += categoryBonus;

    // Dinamik minimum esik: kisa sorular icin daha dusuk
    const minThreshold = words.length <= 3 ? 1.5 : 2;

    if (score >= minThreshold && matchedKeywords >= 1) {
      const maxPossibleScore = normalizedKeywords.length * 3 + (faq.priority || 0) * 0.2 + 2;
      const confidence = Math.min((score / maxPossibleScore) * 100, 100);

      results.push({ faq, score, confidence });
    }
  }

  if (results.length === 0) {
    return null;
  }

  // En yuksek skora gore sirala
  results.sort((a, b) => b.score - a.score);

  return results[0];
}

// Kategori-spesifik bonus fonksiyonu
function getCategoryBonus(normalizedMessage: string, category: FAQCategory): number {
  const categoryKeywords: Record<FAQCategory, string[]> = {
    story: ['masal', 'hikaye', 'oyku', 'olustur', 'pdf'],
    analysis: ['analiz', 'cizim', 'resim', 'degerlendirme', 'psikoloji'],
    interactive: ['interaktif', 'secim', 'secimli', 'macera'],
    coloring: ['boyama', 'boya', 'renk'],
    account: ['hesap', 'profil', 'ucretsiz', 'premium', 'abonelik', 'fiyat', 'bedava'],
    technical: ['sorun', 'hata', 'problem', 'calısmiyor', 'yavas'],
    drawing: ['cizim', 'resim', 'gorsel'],
    general: ['renkioo', 'uygulama', 'yas'],
  };

  const keywords = categoryKeywords[category] || [];
  let bonus = 0;

  for (const keyword of keywords) {
    if (normalizedMessage.includes(keyword)) {
      bonus += 1;
    }
  }

  return Math.min(bonus, 2); // Maximum 2 bonus
}

// ============================================
// AI FALLBACK (Claude Haiku)
// ============================================

const SYSTEM_PROMPT = `Sen Renkioo Studio uygulamasinin yardimci asistanisin. Turkce konusuyorsun.

Renkioo Studio, cocuklarin cizimlerinden AI ile kisisellestirilmis masallar olusturan bir uygulamadir.

Temel ozellikler:
- Cizim yukleme ve AI analizi
- Cizimden masal olusturma
- Interaktif masallar (secimli hikayeler)
- Cizim psikolojik analizi
- Dijital boyama
- PDF indirme
- Coklu cocuk profili destegi

Kurallarin:
1. Kisa ve oz cevaplar ver (max 3-4 cumle)
2. Samimi ve yardimsever ol
3. Emoji kullan ama abartma
4. Uygulama disi konularda kibarca yonlendir
5. Teknik detaylara girme, basit tut
6. Ebeveynlere hitap ediyorsun

Cevaplarinda dogrudan konuya gir, "Tabii ki!" veya "Elbette!" gibi gereksiz girisler yapma.`;

async function getAIResponse(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  // Build messages array with history (last 6 messages for context)
  const recentHistory = conversationHistory.slice(-6);

  const errors: Error[] = [];

  // Helper: Call Anthropic with circuit breaker and retry
  async function callAnthropic(): Promise<string> {
    const client = new Anthropic();
    const messages: Anthropic.MessageParam[] = [
      ...recentHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages,
    });

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );
    return textBlock?.text || 'Uzgunum, su an yanit veremedim. Lutfen tekrar deneyin.';
  }

  // Helper: Call OpenAI with circuit breaker and retry
  async function callOpenAI(): Promise<string> {
    const client = new OpenAI();
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...recentHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      messages,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'Uzgunum, su an yanit veremedim. Lutfen tekrar deneyin.';
  }

  // Try Anthropic first (primary provider)
  if (hasAnthropicKey() && !anthropicCircuit.isOpen()) {
    try {
      log.debug('Trying Claude Haiku (primary)');
      const result = await anthropicCircuit.call(() =>
        withRetry(callAnthropic, {
          maxRetries: 2,
          baseDelayMs: 500,
          shouldRetry: isRetryableError,
        })
      );
      return result;
    } catch (error) {
      errors.push(error as Error);
      if (error instanceof CircuitOpenError) {
        log.warn('Anthropic circuit is open, trying fallback');
      } else if (isRateLimitError(error)) {
        log.warn('Anthropic rate limited, trying fallback');
      } else {
        log.warn('Anthropic failed', { error: (error as Error).message });
      }
    }
  }

  // Fallback to OpenAI
  if (hasOpenAIKey() && !openaiCircuit.isOpen()) {
    try {
      log.debug('Trying GPT-4o-mini (fallback)');
      const result = await openaiCircuit.call(() =>
        withRetry(callOpenAI, {
          maxRetries: 2,
          baseDelayMs: 500,
          shouldRetry: isRetryableError,
        })
      );
      return result;
    } catch (error) {
      errors.push(error as Error);
      if (error instanceof CircuitOpenError) {
        log.warn('OpenAI circuit is open');
      } else if (isRateLimitError(error)) {
        log.warn('OpenAI rate limited');
      } else {
        log.warn('OpenAI failed', { error: (error as Error).message });
      }
    }
  }

  // Both providers failed or unavailable
  if (errors.length > 0) {
    log.error('All AI providers failed', undefined, { errors: errors.map(e => e.message) });
    throw new Error(`All AI providers failed. Last error: ${errors[errors.length - 1].message}`);
  }

  throw new Error('No AI provider available. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY.');
}

// ============================================
// EMBEDDING SEARCH (Lazy Import)
// ============================================

// Embedding modulu lazy load edilir - sadece gerektiginde yukler
let embeddingsModule: typeof import('./chatbot-embeddings.js') | null = null;

async function getEmbeddingsModule() {
  if (!embeddingsModule && process.env.ENABLE_CHATBOT_EMBEDDINGS === 'true') {
    try {
      embeddingsModule = await import('./chatbot-embeddings.js');
    } catch (error) {
      log.warn('Embeddings module could not be loaded', { error: String(error) });
    }
  }
  return embeddingsModule;
}

// ============================================
// MAIN CHAT FUNCTION
// ============================================

export async function processChat(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [],
  options: { useEmbeddings?: boolean; sessionId?: string; userId?: string; childAge?: number; childName?: string; currentScreen?: string } = {}
): Promise<ChatResponse> {
  const startTime = Date.now();
  const { useEmbeddings = process.env.ENABLE_CHATBOT_EMBEDDINGS === 'true', childAge, childName, currentScreen } = options;
  const normalizedMessage = normalizeTextForAnalytics(userMessage);

  // 0. DETECT USER INTENT & EMOTION (NEW!)
  const userIntent = detectUserIntent(userMessage);
  log.debug('Intent detected', {
    type: userIntent.type,
    emotion: userIntent.emotion,
    severity: userIntent.severity,
    needsEmpathy: userIntent.needsEmpathy,
    confidence: userIntent.confidence.toFixed(2)
  });

  // 0.1 Check for PARENTING CONCERN first (highest priority)
  if (userIntent.type === 'parenting_concern' ||
      userIntent.type === 'child_development' ||
      userIntent.type === 'emotional_support') {

    const parentingFAQ = findParentingFAQ(userMessage);

    if (parentingFAQ) {
      log.info('Parenting FAQ match', { question: parentingFAQ.question, childAge });

      // Build empathetic response with age-specific content
      const empatheticResponse = buildEmpatheticResponse({
        emotion: userIntent.emotion,
        severity: userIntent.severity,
        topic: parentingFAQ.category,
        faq: parentingFAQ,
        includeValidation: userIntent.needsEmpathy,
        includeReassurance: true,
        includeProfessionalReferral: parentingFAQ.suggestProfessional || userIntent.needsProfessionalReferral,
        childAge,
        childName,
      });

      // Log interaction
      logInteraction(options, userMessage, empatheticResponse.fullResponse, 'faq', parentingFAQ.id, 95, startTime);

      // Get parenting-specific follow-ups
      const suggestedQuestions = getParentingFollowUps(parentingFAQ.category);

      return {
        message: empatheticResponse.fullResponse,
        source: 'faq',
        suggestedQuestions,
        matchedFAQ: parentingFAQ.id,
        confidence: 95,
        actions: [], // Parenting FAQs don't need action buttons
        detectedTopic: `parenting_${parentingFAQ.category}`,
      };
    }
  }

  // 1. Try keyword-based FAQ match (free, fast)
  const faqMatch = findFAQMatch(userMessage);

  if (faqMatch && faqMatch.confidence >= 40) {
    log.info('FAQ match found', { question: faqMatch.faq.question, confidence: faqMatch.confidence.toFixed(1) + '%' });

    // Log interaction (async, non-blocking)
    logInteraction(options, userMessage, faqMatch.faq.answer, 'faq', faqMatch.faq.id, faqMatch.confidence, startTime);

    // Faz 3A: Konu tespiti
    const detectedTopic = detectConversationTopic([
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ]);

    // Faz 3E: Aksiyon butonları
    const actions = getActionsForCategory(faqMatch.faq.category, faqMatch.faq.id);

    // Faz 3A: Konuya göre takip soruları veya standart öneriler
    const suggestedQuestions = detectedTopic
      ? getContextualFollowUps(detectedTopic)
      : getSuggestedQuestions(faqMatch.faq.category);

    return {
      message: faqMatch.faq.answer,
      source: 'faq',
      suggestedQuestions,
      matchedFAQ: faqMatch.faq.id,
      confidence: faqMatch.confidence,
      actions,
      detectedTopic,
    };
  }

  // 2. Try semantic search with embeddings (if enabled)
  if (useEmbeddings) {
    try {
      const embeddings = await getEmbeddingsModule();
      if (embeddings) {
        const normalized = normalizeText(userMessage);
        const words = normalized.split(/\s+/);

        // Hibrit arama: embedding + keyword
        const results = await embeddings.hybridSearch(userMessage, words, {
          embeddingWeight: 0.7,
          keywordWeight: 0.3,
          matchThreshold: 0.4,
          matchCount: 3,
        });

        if (results.length > 0 && results[0].combinedScore >= 0.5) {
          const bestMatch = results[0];
          const confidence = bestMatch.combinedScore * 100;

          log.debug('Embedding match found', { question: bestMatch.question, score: bestMatch.combinedScore.toFixed(3) });

          // Log interaction
          logInteraction(options, userMessage, bestMatch.answer, 'embedding', bestMatch.id, confidence, startTime);

          // Faz 3A: Konu tespiti
          const detectedTopic = detectConversationTopic([
            ...conversationHistory,
            { role: 'user', content: userMessage },
          ]);

          // Faz 3E: Aksiyon butonları
          const actions = getActionsForCategory(bestMatch.category as FAQCategory, bestMatch.id);

          // Faz 3A: Konuya göre takip soruları
          const suggestedQuestions = detectedTopic
            ? getContextualFollowUps(detectedTopic)
            : getSuggestedQuestions(bestMatch.category as FAQCategory);

          return {
            message: bestMatch.answer,
            source: 'faq', // UI icin 'faq' olarak goster
            suggestedQuestions,
            matchedFAQ: bestMatch.id,
            confidence,
            actions,
            detectedTopic,
          };
        }
      }
    } catch (error) {
      log.warn('Embedding search failed, falling back to AI', { error: String(error) });
    }
  }

  // 3. Try lower confidence FAQ match
  if (faqMatch && faqMatch.confidence >= 30) {
    log.debug('Low confidence FAQ match', { question: faqMatch.faq.question, confidence: faqMatch.confidence.toFixed(1) + '%' });

    logInteraction(options, userMessage, faqMatch.faq.answer, 'faq', faqMatch.faq.id, faqMatch.confidence, startTime);

    // Faz 6: Log low confidence match for review
    if (faqMatch.confidence < 40) {
      logUnansweredQuery({
        userId: options.userId,
        sessionId: options.sessionId,
        query: userMessage,
        normalizedQuery: normalizedMessage,
        detectedIntent: userIntent.type,
        detectedEmotion: userIntent.emotion,
        reason: 'low_confidence',
        confidence: faqMatch.confidence,
        attemptedFaqId: faqMatch.faq.id,
        currentScreen,
        childAge,
        conversationLength: conversationHistory.length,
      }).catch((err) => logger.debug('[Chatbot] Non-blocking log failed:', err?.message));
    }

    // Faz 3A: Konu tespiti
    const detectedTopic = detectConversationTopic([
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ]);

    // Faz 3E: Aksiyon butonları
    const actions = getActionsForCategory(faqMatch.faq.category, faqMatch.faq.id);

    return {
      message: faqMatch.faq.answer,
      source: 'faq',
      suggestedQuestions: detectedTopic
        ? getContextualFollowUps(detectedTopic)
        : getSuggestedQuestions(faqMatch.faq.category),
      matchedFAQ: faqMatch.faq.id,
      confidence: faqMatch.confidence,
      actions,
      detectedTopic,
    };
  }

  // 4. Fallback to AI (low cost)
  log.debug('No FAQ match, using AI');
  try {
    const aiResponse = await getAIResponse(userMessage, conversationHistory);

    logInteraction(options, userMessage, aiResponse, 'ai', undefined, undefined, startTime);

    // Faz 6: Log unanswered query (AI fallback)
    logUnansweredQuery({
      userId: options.userId,
      sessionId: options.sessionId,
      query: userMessage,
      normalizedQuery: normalizedMessage,
      detectedIntent: userIntent.type,
      detectedEmotion: userIntent.emotion,
      reason: 'ai_fallback',
      confidence: faqMatch?.confidence,
      attemptedFaqId: faqMatch?.faq.id,
      currentScreen,
      childAge,
      conversationLength: conversationHistory.length,
      aiResponse,
    }).catch((err) => logger.debug('[Chatbot] Non-blocking log failed:', err?.message));

    // Faz 3A: Konu tespiti
    const detectedTopic = detectConversationTopic([
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ]);

    // Faz 3E: Mesajdan aksiyon tespit et
    const actions = detectActionsFromMessage(userMessage);

    return {
      message: aiResponse,
      source: 'ai',
      suggestedQuestions: detectedTopic
        ? getContextualFollowUps(detectedTopic)
        : getGeneralSuggestions(),
      actions: actions.length > 0 ? actions : undefined,
      detectedTopic,
    };
  } catch (error) {
    log.error('AI error', error);

    const errorResponse = 'Uzgunum, su an teknik bir sorun yasiyorum. Lutfen biraz sonra tekrar deneyin veya sik sorulan sorulara goz atin.';
    logInteraction(options, userMessage, errorResponse, 'ai', undefined, undefined, startTime);

    // Faz 6: Log error case
    logUnansweredQuery({
      userId: options.userId,
      sessionId: options.sessionId,
      query: userMessage,
      normalizedQuery: normalizedMessage,
      detectedIntent: userIntent.type,
      detectedEmotion: userIntent.emotion,
      reason: 'error',
      currentScreen,
      childAge,
      conversationLength: conversationHistory.length,
    }).catch((err) => logger.debug('[Chatbot] Non-blocking log failed:', err?.message));

    return {
      message: errorResponse,
      source: 'ai',
      suggestedQuestions: getGeneralSuggestions(),
    };
  }
}

// Log interaction helper (non-blocking)
async function logInteraction(
  options: { sessionId?: string; userId?: string },
  message: string,
  response: string,
  source: 'faq' | 'embedding' | 'ai',
  matchedFaqId?: string,
  confidence?: number,
  startTime?: number
) {
  // Sadece embedding modulu yukluyse logla
  const embeddings = await getEmbeddingsModule();
  if (embeddings) {
    embeddings.logChatbotInteraction({
      sessionId: options.sessionId,
      userId: options.userId,
      message,
      response: response.substring(0, 500), // Truncate for storage
      source,
      matchedFaqId,
      confidence,
      responseTimeMs: startTime ? Date.now() - startTime : undefined,
    }).catch((err) => logger.debug('[Chatbot] Logging error (ignored):', err?.message));
  }
}

// ============================================
// SUGGESTED QUESTIONS
// ============================================

function getSuggestedQuestions(category: FAQCategory): string[] {
  const suggestions: Record<FAQCategory, string[]> = {
    story: [
      'Interaktif masal nedir?',
      'PDF nasil indirilir?',
      'Masal ne kadar surede hazir olur?',
    ],
    interactive: [
      'Nasil masal olusturabilirim?',
      'Ebeveyn raporu ne ise yarar?',
      'Hangi yas grubu icin uygun?',
    ],
    analysis: [
      'Cizimler guvende mi?',
      'Sonuclar ne kadar guvenilir?',
      'Renk tercihleri ne anlama geliyor?',
    ],
    drawing: [
      'Cizim analizi ne demek?',
      'Nasil cizim yuklerim?',
      'Cizim formatlari neler?',
    ],
    account: [
      'Nasil cocuk profili eklerim?',
      'Verilerim guvende mi?',
      'Uygulama ucretsiz mi?',
    ],
    coloring: [
      'Boyama araclari neler?',
      'Yazdirabilirim miyim?',
      'Hazir sablonlar var mi?',
    ],
    technical: [
      'Uygulama yavas calisiyor',
      'Giris yapamiyorum',
      'Nasil guncellerim?',
    ],
    general: [
      'Nasil masal olusturabilirim?',
      'Cizim analizi ne demek?',
      'Interaktif masal nedir?',
    ],
  };

  return suggestions[category] || suggestions.general;
}

function getGeneralSuggestions(): string[] {
  return [
    'Nasil masal olusturabilirim?',
    'Cizim analizi ne anlama geliyor?',
    'Interaktif masal nedir?',
  ];
}

// ============================================
// FAQ INDEX MAP (O(1) lookup optimization)
// ============================================

// Pre-computed FAQ map for O(1) lookups instead of O(n) array.find()
const FAQ_MAP: Map<string, FAQItem> = new Map(
  FAQ_DATABASE.map(faq => [faq.id, faq])
);

// ============================================
// GET ALL FAQ QUESTIONS (for UI)
// ============================================

export function getAllFAQQuestions(): { question: string; category: string; id: string }[] {
  return FAQ_DATABASE.map(faq => ({
    id: faq.id,
    question: faq.question,
    category: faq.category,
  }));
}

// ============================================
// GET FAQ BY ID (O(1) with Map lookup)
// ============================================

export function getFAQById(id: string): FAQItem | undefined {
  return FAQ_MAP.get(id);
}

// ============================================
// GET MULTIPLE FAQs BY IDs (batch lookup)
// ============================================

export function getFAQsByIds(ids: string[]): Map<string, FAQItem> {
  const result = new Map<string, FAQItem>();
  for (const id of ids) {
    const faq = FAQ_MAP.get(id);
    if (faq) {
      result.set(id, faq);
    }
  }
  return result;
}

// ============================================
// GET FAQ COUNT
// ============================================

export function getFAQCount(): { total: number; byCategory: Record<string, number> } {
  const byCategory: Record<string, number> = {};

  for (const faq of FAQ_DATABASE) {
    byCategory[faq.category] = (byCategory[faq.category] || 0) + 1;
  }

  return {
    total: FAQ_DATABASE.length,
    byCategory,
  };
}

// ============================================
// SEARCH FAQ (for admin/debug)
// ============================================

export function searchFAQ(query: string): FAQItem[] {
  const normalized = normalizeText(query);

  return FAQ_DATABASE.filter(faq => {
    const questionNorm = normalizeText(faq.question);
    const answerNorm = normalizeText(faq.answer);
    const keywordsNorm = faq.keywords.map(normalizeText).join(' ');

    return questionNorm.includes(normalized) ||
           answerNorm.includes(normalized) ||
           keywordsNorm.includes(normalized);
  });
}

// ============================================
// GET FAQ DATABASE (for embeddings sync)
// ============================================

export function getFAQDatabase(): FAQItem[] {
  return FAQ_DATABASE;
}

// ============================================
// FAZ 3A: KONUŞMA BAĞLAMI (Context Management)
// ============================================

/**
 * Konuşma geçmişinden mevcut konuyu tespit et
 */
export function detectConversationTopic(
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
): string | undefined {
  if (conversationHistory.length === 0) return undefined;

  // Son 4 mesajı analiz et
  const recentMessages = conversationHistory.slice(-4);
  const allText = recentMessages.map(m => normalizeText(m.content)).join(' ');

  // Konu tespiti için keyword grupları
  const topicKeywords: Record<string, string[]> = {
    'story_creation': ['masal', 'hikaye', 'olustur', 'yarat', 'tema', 'baslik'],
    'drawing_analysis': ['analiz', 'cizim', 'resim', 'degerlendirme', 'renk', 'psikoloji'],
    'interactive_story': ['interaktif', 'secim', 'macera', 'ebeveyn raporu'],
    'coloring': ['boyama', 'boya', 'renk', 'firca', 'kalem'],
    'account_settings': ['hesap', 'profil', 'ayar', 'sifre', 'abonelik'],
    'technical_support': ['hata', 'sorun', 'calısmiyor', 'yavas', 'giris'],
  };

  let bestTopic: string | undefined;
  let bestScore = 0;

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (allText.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  }

  return bestScore >= 2 ? bestTopic : undefined;
}

/**
 * Konuya göre takip soruları öner
 */
export function getContextualFollowUps(topic: string): string[] {
  const followUps: Record<string, string[]> = {
    'story_creation': [
      'PDF olarak nasıl indirebilirim?',
      'Masal uzunluğunu ayarlayabilir miyim?',
      'Sesli dinleyebilir miyim?',
    ],
    'drawing_analysis': [
      'Sonuçlar ne kadar güvenilir?',
      'Renk tercihleri ne anlama geliyor?',
      'Endişelenmem gereken bir şey var mı?',
    ],
    'interactive_story': [
      'Ebeveyn raporu ne işe yarar?',
      'Farklı seçimlerle tekrar oynayabilir miyim?',
      'Kaç yaş için uygun?',
    ],
    'coloring': [
      'Yazdırabilir miyim?',
      'Hangi araçlar var?',
      'Hazır şablonlar var mı?',
    ],
    'account_settings': [
      'Verilerim güvende mi?',
      'Birden fazla cihazda kullanabilir miyim?',
      'Premium özellikleri neler?',
    ],
    'technical_support': [
      'Uygulamayı nasıl güncellerim?',
      'İnternet olmadan kullanabilir miyim?',
      'Destek ile nasıl iletişime geçerim?',
    ],
  };

  return followUps[topic] || getGeneralSuggestions();
}

// ============================================
// FAZ 3E: AKILLI YÖNLENDİRME (Smart Routing)
// ============================================

/**
 * FAQ kategorisine göre aksiyon butonları oluştur
 */
export function getActionsForCategory(category: FAQCategory, faqId?: string): ChatAction[] {
  const actionMap: Record<FAQCategory, ChatAction[]> = {
    story: [
      { type: 'navigate', label: 'Masal Oluştur', target: '/(tabs)/stories', icon: '📖' },
      { type: 'navigate', label: 'Masallarım', target: '/(tabs)/stories', icon: '📚' },
    ],
    analysis: [
      { type: 'navigate', label: 'Çizim Analiz Et', target: '/(tabs)/analysis', icon: '🎨' },
      { type: 'navigate', label: 'Analizlerim', target: '/(tabs)/analysis', icon: '📊' },
    ],
    interactive: [
      { type: 'navigate', label: 'İnteraktif Masal Başlat', target: '/(tabs)/stories', icon: '🎮' },
    ],
    coloring: [
      { type: 'navigate', label: 'Boyama Sayfası Aç', target: '/(tabs)/coloring', icon: '🖍️' },
      { type: 'navigate', label: 'Boyamalarım', target: '/(tabs)/coloring', icon: '🎨' },
    ],
    account: [
      { type: 'navigate', label: 'Hesap Ayarları', target: '/(tabs)/profile', icon: '⚙️' },
      { type: 'navigate', label: 'Çocuk Profili Ekle', target: '/(tabs)/profile', icon: '👶' },
    ],
    technical: [
      { type: 'navigate', label: 'Destek', target: '/(tabs)/profile', icon: '🔧' },
      { type: 'link', label: 'E-posta Gönder', target: 'mailto:destek@renkioo.com', icon: '✉️' },
    ],
    drawing: [
      { type: 'navigate', label: 'Çizim Yükle', target: '/(tabs)/analysis', icon: '📷' },
    ],
    general: [
      { type: 'navigate', label: 'Ana Sayfa', target: '/(tabs)', icon: '🏠' },
    ],
  };

  // Bazı özel FAQ'lar için spesifik aksiyonlar
  const specificActions: Record<string, ChatAction[]> = {
    'story_002': [{ type: 'navigate', label: 'PDF İndir', target: '/(tabs)/stories', icon: '📄' }],
    'story_009': [{ type: 'navigate', label: 'Sesli Masal Dinle', target: '/(tabs)/stories', icon: '🔊' }],
    'coloring_002': [{ type: 'navigate', label: 'Yazdır', target: '/(tabs)/coloring', icon: '🖨️' }],
    'account_001': [{ type: 'navigate', label: 'Çocuk Ekle', target: '/(tabs)/profile', icon: '➕' }],
  };

  if (faqId && specificActions[faqId]) {
    return specificActions[faqId];
  }

  return actionMap[category] || [];
}

/**
 * Mesaj içeriğine göre aksiyon tespit et
 */
export function detectActionsFromMessage(message: string): ChatAction[] {
  const normalized = normalizeText(message);
  const actions: ChatAction[] = [];

  // Masal oluşturma niyeti
  if (normalized.includes('masal olustur') || normalized.includes('hikaye yap')) {
    actions.push({ type: 'create', label: 'Şimdi Masal Oluştur', target: '/(tabs)/stories', icon: '✨' });
  }

  // Analiz niyeti
  if (normalized.includes('analiz') && (normalized.includes('yap') || normalized.includes('et'))) {
    actions.push({ type: 'create', label: 'Çizim Analiz Et', target: '/(tabs)/analysis', icon: '🔍' });
  }

  // Boyama niyeti
  if (normalized.includes('boyama') && (normalized.includes('baslat') || normalized.includes('ac'))) {
    actions.push({ type: 'navigate', label: 'Boyamaya Başla', target: '/(tabs)/coloring', icon: '🎨' });
  }

  return actions;
}

// ============================================
// FAZ 3B: PROAKTİF ÖNERİLER
// ============================================

const PROACTIVE_SUGGESTIONS: ProactiveSuggestion[] = [
  // Ana Sayfa
  {
    id: 'home_welcome',
    screen: 'home',
    trigger: 'first_visit',
    message: 'Renkioo\'ya hoş geldiniz! Size nasıl yardımcı olabilirim?',
    questions: ['Nasıl masal oluştururum?', 'Çizim analizi ne demek?', 'Uygulama ücretsiz mi?'],
    priority: 10,
  },
  {
    id: 'home_idle',
    screen: 'home',
    trigger: 'idle',
    message: 'Bir şey mi arıyorsunuz? Yardımcı olabilirim!',
    questions: ['Ne yapabilirim?', 'Öne çıkan özellikler neler?'],
    priority: 5,
  },

  // Masal Sayfası
  {
    id: 'stories_enter',
    screen: 'stories',
    trigger: 'enter',
    message: 'Masal oluşturmaya hazır mısınız?',
    questions: ['Nasıl masal oluşturabilirim?', 'Masal ne kadar sürede hazır olur?', 'PDF indirebilir miyim?'],
    priority: 8,
  },
  {
    id: 'stories_first',
    screen: 'stories',
    trigger: 'first_visit',
    message: 'İlk masalınızı oluşturmaya hazır mısınız? Çocuğunuzun çiziminden kişiselleştirilmiş bir masal yaratabiliriz!',
    questions: ['Nasıl başlarım?', 'Tema nasıl seçilir?', 'İnteraktif masal nedir?'],
    priority: 10,
  },
  {
    id: 'stories_error',
    screen: 'stories',
    trigger: 'error',
    message: 'Bir sorun mu yaşıyorsunuz? Size yardımcı olabilirim.',
    questions: ['Masal oluşturulamıyor', 'Çok uzun sürüyor', 'Hata alıyorum'],
    priority: 10,
  },

  // Analiz Sayfası
  {
    id: 'analysis_enter',
    screen: 'analysis',
    trigger: 'enter',
    message: 'Çocuğunuzun çizimini analiz etmek ister misiniz?',
    questions: ['Çizim analizi ne demek?', 'Sonuçlar güvenilir mi?', 'Renk tercihleri ne anlama geliyor?'],
    priority: 8,
  },
  {
    id: 'analysis_first',
    screen: 'analysis',
    trigger: 'first_visit',
    message: 'Çizim analizi, çocuğunuzun duygusal dünyasını anlamanıza yardımcı olur. Merak ettiğiniz bir şey var mı?',
    questions: ['Bu ne işe yarıyor?', 'Endişelenmeli miyim?', 'Sonuçları nasıl yorumlamalıyım?'],
    priority: 10,
  },

  // Boyama Sayfası
  {
    id: 'coloring_enter',
    screen: 'coloring',
    trigger: 'enter',
    message: 'Boyama zamanı! 🎨',
    questions: ['Hangi araçlar var?', 'Yazdırabilir miyim?', 'Hazır şablonlar var mı?'],
    priority: 7,
  },
  {
    id: 'coloring_first',
    screen: 'coloring',
    trigger: 'first_visit',
    message: 'Çocuğunuzun çiziminden boyama sayfası oluşturabilir veya hazır şablonları kullanabilirsiniz!',
    questions: ['Nasıl çalışır?', 'Çizimimden boyama sayfası yapabilir miyim?', 'Kaydetme nasıl çalışır?'],
    priority: 10,
  },

  // Profil Sayfası
  {
    id: 'profile_enter',
    screen: 'profile',
    trigger: 'enter',
    message: 'Hesap ayarlarınızla ilgili yardıma ihtiyacınız var mı?',
    questions: ['Çocuk profili nasıl eklerim?', 'Şifremi nasıl değiştiririm?', 'Verilerim güvende mi?'],
    priority: 6,
  },
  {
    id: 'profile_first',
    screen: 'profile',
    trigger: 'first_visit',
    message: 'Profilinizi tamamlayın ve çocuğunuzu ekleyin. Böylece içerikler yaşına göre uyarlanır!',
    questions: ['Çocuk profili ekle', 'Neden çocuk yaşı önemli?', 'Premium özellikleri neler?'],
    priority: 10,
  },
];

/**
 * Ekran ve tetikleyiciye göre proaktif öneri getir
 */
export function getProactiveSuggestion(
  screen: string,
  trigger: 'enter' | 'idle' | 'error' | 'first_visit'
): ProactiveSuggestion | null {
  const suggestions = PROACTIVE_SUGGESTIONS
    .filter(s => s.screen === screen && s.trigger === trigger)
    .sort((a, b) => b.priority - a.priority);

  return suggestions[0] || null;
}

/**
 * Tüm ekranlar için proaktif önerileri getir
 */
export function getAllProactiveSuggestions(): ProactiveSuggestion[] {
  return PROACTIVE_SUGGESTIONS;
}

/**
 * Belirli bir ekran için tüm önerileri getir
 */
export function getSuggestionsForScreen(screen: string): ProactiveSuggestion[] {
  return PROACTIVE_SUGGESTIONS.filter(s => s.screen === screen);
}

// ============================================
// AI PROVIDER HEALTH CHECK
// ============================================

/**
 * Get AI provider circuit breaker stats for monitoring
 */
export function getAIProviderStats(): {
  anthropic: { state: string; failures: number; available: boolean };
  openai: { state: string; failures: number; available: boolean };
} {
  const anthropicStats = anthropicCircuit.getStats();
  const openaiStats = openaiCircuit.getStats();

  return {
    anthropic: {
      state: anthropicStats.state,
      failures: anthropicStats.failures,
      available: hasAnthropicKey() && !anthropicCircuit.isOpen(),
    },
    openai: {
      state: openaiStats.state,
      failures: openaiStats.failures,
      available: hasOpenAIKey() && !openaiCircuit.isOpen(),
    },
  };
}

/**
 * Reset AI provider circuit breakers (for admin/testing)
 */
export function resetAIProviderCircuits(): void {
  anthropicCircuit.reset();
  openaiCircuit.reset();
  log.info('AI provider circuits reset');
}
