/**
 * 🤖 Renkioo Chatbot - Yardım Asistanı
 *
 * Hibrit yaklaşım:
 * 1. FAQ eşleştirme (ücretsiz)
 * 2. AI fallback - Claude Haiku veya GPT-4o-mini (düşük maliyet)
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// Check which AI provider is available (at runtime)
function hasAnthropicKey(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

function hasOpenAIKey(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

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
}

interface FAQItem {
  keywords: string[];
  question: string;
  answer: string;
  category: 'story' | 'drawing' | 'analysis' | 'interactive' | 'account' | 'general';
}

// ============================================
// FAQ DATABASE (Ücretsiz Cevaplar)
// ============================================

const FAQ_DATABASE: FAQItem[] = [
  // === HİKAYE OLUŞTURMA ===
  {
    keywords: ['hikaye', 'masal', 'oluştur', 'nasıl', 'yap'],
    question: 'Nasıl hikaye/masal oluşturabilirim?',
    answer: `📖 **Masal Oluşturma Adımları:**

1. Alt menüden "Masallar" sekmesine gidin
2. Sağ üstteki + butonuna tıklayın
3. Çocuğunuzun çizimini yükleyin
4. AI size tema önerileri sunacak
5. Bir tema seçin veya kendi başlığınızı yazın
6. "Masal Oluştur" butonuna tıklayın

✨ Yaklaşık 1-2 dakika içinde görsellerle birlikte kişiselleştirilmiş bir masal hazır olacak!`,
    category: 'story',
  },
  {
    keywords: ['interaktif', 'seçim', 'macera', 'interactive'],
    question: 'İnteraktif masal nedir?',
    answer: `🎮 **İnteraktif Masal:**

Çocuğunuzun hikayede aktif rol aldığı özel bir masal türüdür!

**Nasıl Çalışır:**
- Hikaye ilerlerken çocuğunuz seçimler yapar
- Her seçim hikayenin gidişatını değiştirir
- Seçimler kişilik özelliklerini yansıtır

**Ebeveyn Raporu:**
- Çocuğunuzun seçimlerinin analizi
- Empati, cesaret, merak gibi özelliklerin değerlendirmesi
- Aktivite önerileri

Masal oluştururken "İnteraktif Masal" seçeneğini seçerek deneyebilirsiniz!`,
    category: 'interactive',
  },
  {
    keywords: ['pdf', 'indir', 'kaydet', 'paylaş'],
    question: 'Masalı PDF olarak nasıl indirebilirim?',
    answer: `📄 **PDF İndirme:**

1. Masallar sekmesinden masalınızı açın
2. Sağ üstteki paylaş/indir ikonuna tıklayın
3. "PDF İndir" seçeneğini seçin

PDF dosyası cihazınıza kaydedilecek ve istediğiniz zaman yazdırabilir veya paylaşabilirsiniz!

💡 İpucu: PDF'ler otomatik olarak oluşturulur, ekstra bir işlem gerekmez.`,
    category: 'story',
  },

  // === ÇİZİM ANALİZİ ===
  {
    keywords: ['analiz', 'çizim', 'değerlendirme', 'psikoloji', 'ne anlama'],
    question: 'Çizim analizi ne anlama geliyor?',
    answer: `🎨 **Çizim Analizi:**

AI, çocuğunuzun çizimlerini çocuk psikolojisi prensipleri doğrultusunda değerlendirir.

**Nelere Bakılır:**
- Renk kullanımı ve tercihleri
- Figürlerin boyutu ve konumu
- Detay seviyesi
- Genel kompozisyon

**Önemli Not:**
⚠️ Bu analiz profesyonel psikolojik değerlendirme yerine geçmez. Eğlenceli bir içgörü aracı olarak tasarlanmıştır. Endişeleriniz varsa bir uzmana danışmanızı öneririz.`,
    category: 'analysis',
  },
  {
    keywords: ['gelişim', 'yaş', 'uygun', 'seviye'],
    question: 'Hangi yaş grubu için uygun?',
    answer: `👶 **Yaş Uygunluğu:**

Renkioo Studio 2-12 yaş arası çocuklar için tasarlanmıştır.

**Yaşa Göre Özellikler:**
- **2-4 yaş:** Basit hikayeler, büyük görseller
- **5-7 yaş:** Orta uzunlukta masallar, interaktif seçenekler
- **8-12 yaş:** Daha detaylı hikayeler, karmaşık temalar

Profil ayarlarından çocuğunuzun yaşını girerek içeriklerin ona göre uyarlanmasını sağlayabilirsiniz.`,
    category: 'general',
  },

  // === HESAP & AYARLAR ===
  {
    keywords: ['çocuk', 'ekle', 'profil', 'kayıt'],
    question: 'Çocuk profili nasıl eklerim?',
    answer: `👧 **Çocuk Profili Ekleme:**

1. Alt menüden "Profil" sekmesine gidin
2. "Çocuk Ekle" butonuna tıklayın
3. Çocuğunuzun adını ve yaşını girin
4. İsteğe bağlı olarak cinsiyet seçin

Birden fazla çocuk ekleyebilirsiniz! Her çocuk için ayrı hikayeler ve analizler tutulur.`,
    category: 'account',
  },
  {
    keywords: ['ücretsiz', 'ücret', 'fiyat', 'maliyet', 'premium'],
    question: 'Uygulama ücretsiz mi?',
    answer: `💰 **Fiyatlandırma:**

Temel özellikler ücretsizdir:
- Çizim yükleme
- Masal oluşturma (günlük limit)
- Basit analizler

Premium özellikler için abonelik gerekebilir. Detaylı bilgi için uygulama içi ayarlara bakabilirsiniz.`,
    category: 'account',
  },

  // === TEKNİK ===
  {
    keywords: ['hata', 'çalışmıyor', 'sorun', 'bug', 'problem'],
    question: 'Bir sorun yaşıyorum, ne yapmalıyım?',
    answer: `🔧 **Sorun Giderme:**

1. **Uygulamayı yeniden başlatın**
2. **İnternet bağlantınızı kontrol edin**
3. **Uygulamayı güncelleyin**

Sorun devam ederse:
- Profil > Ayarlar > Destek bölümünden bize ulaşın
- Hatanın ekran görüntüsünü paylaşın

Yardımcı olmaktan mutluluk duyarız! 💜`,
    category: 'general',
  },
  {
    keywords: ['güvenli', 'veri', 'gizlilik', 'privacy'],
    question: 'Verilerim güvende mi?',
    answer: `🔒 **Gizlilik & Güvenlik:**

Çocuğunuzun güvenliği bizim için en önemli önceliktir.

**Güvenlik Önlemleri:**
- Tüm veriler şifreli olarak saklanır
- Çizimler ve hikayeler sadece size özeldir
- Üçüncü taraflarla paylaşılmaz
- KVKK uyumlu veri işleme

Gizlilik politikamızı Ayarlar > Gizlilik bölümünden inceleyebilirsiniz.`,
    category: 'account',
  },
];

// ============================================
// FAQ MATCHING (Keyword-based)
// ============================================

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[?!.,]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

function findFAQMatch(userMessage: string): FAQItem | null {
  const normalized = normalizeText(userMessage);
  const words = normalized.split(/\s+/);

  let bestMatch: FAQItem | null = null;
  let bestScore = 0;

  for (const faq of FAQ_DATABASE) {
    let score = 0;
    const normalizedKeywords = faq.keywords.map(normalizeText);

    for (const keyword of normalizedKeywords) {
      // Exact word match
      if (words.includes(keyword)) {
        score += 2;
      }
      // Partial match (keyword in message)
      else if (normalized.includes(keyword)) {
        score += 1;
      }
    }

    // Require at least 2 keyword matches
    if (score > bestScore && score >= 2) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  return bestMatch;
}

// ============================================
// AI FALLBACK (Claude Haiku)
// ============================================

const SYSTEM_PROMPT = `Sen Renkioo Studio uygulamasının yardımcı asistanısın. Türkçe konuşuyorsun.

Renkioo Studio, çocukların çizimlerinden AI ile kişiselleştirilmiş masallar oluşturan bir uygulamadır.

Temel özellikler:
- Çizim yükleme ve AI analizi
- Çizimden masal oluşturma
- İnteraktif masallar (seçimli hikayeler)
- Çizim psikolojik analizi
- PDF indirme
- Çoklu çocuk profili desteği

Kuralların:
1. Kısa ve öz cevaplar ver (max 3-4 cümle)
2. Samimi ve yardımsever ol
3. Emoji kullan ama abartma
4. Uygulama dışı konularda kibarca yönlendir
5. Teknik detaylara girme, basit tut
6. Ebeveynlere hitap ediyorsun

Cevaplarında doğrudan konuya gir, "Tabii ki!" veya "Elbette!" gibi gereksiz girişler yapma.`;

async function getAIResponse(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  // Build messages array with history (last 6 messages for context)
  const recentHistory = conversationHistory.slice(-6);

  // Try Anthropic first if available, otherwise use OpenAI
  if (hasAnthropicKey()) {
    console.log('[Chatbot] Using Claude Haiku');
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
    return textBlock?.text || 'Üzgünüm, şu an yanıt veremedim. Lütfen tekrar deneyin.';
  }

  if (hasOpenAIKey()) {
    console.log('[Chatbot] Using GPT-4o-mini');
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

    return response.choices[0]?.message?.content || 'Üzgünüm, şu an yanıt veremedim. Lütfen tekrar deneyin.';
  }

  throw new Error('No AI provider available. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY.');
}

// ============================================
// MAIN CHAT FUNCTION
// ============================================

export async function processChat(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<ChatResponse> {
  // 1. Try FAQ match first (free)
  const faqMatch = findFAQMatch(userMessage);

  if (faqMatch) {
    console.log('[Chatbot] FAQ match found:', faqMatch.question);
    return {
      message: faqMatch.answer,
      source: 'faq',
      suggestedQuestions: getSuggestedQuestions(faqMatch.category),
    };
  }

  // 2. Fallback to AI (low cost)
  console.log('[Chatbot] No FAQ match, using AI...');
  try {
    const aiResponse = await getAIResponse(userMessage, conversationHistory);
    return {
      message: aiResponse,
      source: 'ai',
      suggestedQuestions: getGeneralSuggestions(),
    };
  } catch (error) {
    console.error('[Chatbot] AI error:', error);
    return {
      message: 'Üzgünüm, şu an teknik bir sorun yaşıyorum. Lütfen biraz sonra tekrar deneyin veya sık sorulan sorulara göz atın. 🙏',
      source: 'ai',
      suggestedQuestions: getGeneralSuggestions(),
    };
  }
}

// ============================================
// SUGGESTED QUESTIONS
// ============================================

function getSuggestedQuestions(category: string): string[] {
  const suggestions: Record<string, string[]> = {
    story: [
      'İnteraktif masal nedir?',
      'PDF nasıl indirilir?',
      'Masal ne kadar sürede hazır olur?',
    ],
    interactive: [
      'Nasıl masal oluşturabilirim?',
      'Ebeveyn raporu ne işe yarar?',
      'Hangi yaş grubu için uygun?',
    ],
    analysis: [
      'Çizimler güvende mi?',
      'Sonuçlar ne kadar güvenilir?',
      'Profesyonel destek almalı mıyım?',
    ],
    account: [
      'Nasıl çocuk profili eklerim?',
      'Verilerim güvende mi?',
      'Uygulama ücretsiz mi?',
    ],
    general: [
      'Nasıl masal oluşturabilirim?',
      'Çizim analizi ne demek?',
      'İnteraktif masal nedir?',
    ],
  };

  return suggestions[category] || suggestions.general;
}

function getGeneralSuggestions(): string[] {
  return [
    'Nasıl masal oluşturabilirim?',
    'Çizim analizi ne anlama geliyor?',
    'İnteraktif masal nedir?',
  ];
}

// ============================================
// GET ALL FAQ QUESTIONS (for UI)
// ============================================

export function getAllFAQQuestions(): { question: string; category: string }[] {
  return FAQ_DATABASE.map(faq => ({
    question: faq.question,
    category: faq.category,
  }));
}
