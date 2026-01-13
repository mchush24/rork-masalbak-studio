/**
 * Quick Therapeutic System Test
 *
 * Hızlı manuel test için birkaç örnek senaryo
 *
 * Kullanım: npx ts-node quick-test.ts
 */

import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Test senaryoları - ACEs (Adverse Childhood Experiences) framework + Pediatric Psychology
const TEST_SCENARIOS = [
  // === ORIGINAL CATEGORIES ===
  {
    name: '🎖️ Savaş Senaryosu',
    description: 'Çocuk bir savaş sahnesi çizmiş. Tanklar, askerler ve yanan binalar var. Gökyüzünde uçaklar. Bir figür ağlıyor.',
    expectedConcern: 'war',
    expectedTherapeutic: true
  },
  {
    name: '🌊 Deprem Senaryosu',
    description: 'Yıkılmış evler çizilmiş. Yerde çatlaklar var. Bir aile el ele tutuşmuş. Gökyüzünde bulutlar.',
    expectedConcern: 'disaster',
    expectedTherapeutic: true
  },
  {
    name: '😢 Kayıp Senaryosu',
    description: 'Bir çocuk figürü tek başına. Yanında boş bir sandalye var. Gökyüzünde bir yıldız. Çocuğun gözlerinden yaşlar akıyor.',
    expectedConcern: 'loss',
    expectedTherapeutic: true
  },
  {
    name: '🌈 Normal Senaryo',
    description: 'Güneşli bir gün. Yeşil çimenler üzerinde bir ev. Evde mutlu bir aile. Bahçede köpek oynuyor. Gökkuşağı.',
    expectedConcern: null,
    expectedTherapeutic: false
  },
  {
    name: '👨‍👩‍👧 Aile Ayrılığı Senaryosu',
    description: 'İki ayrı ev çizilmiş. Ortada bir çizgi. Bir tarafta anne, diğer tarafta baba. Ortada küçük bir çocuk figürü.',
    expectedConcern: 'family_separation',
    expectedTherapeutic: true
  },

  // === ACEs FRAMEWORK CATEGORIES ===
  {
    name: '🏠 İhmal Senaryosu',
    description: 'Karanlık bir ev çizilmiş. İçinde küçük bir çocuk tek başına. Buzdolabı boş. Çocuk bakımsız görünüyor, yırtık kıyafetler. Anne baba yok.',
    expectedConcern: 'neglect',
    expectedTherapeutic: true
  },
  {
    name: '🤝 Akran Zorbalığı Senaryosu',
    description: 'Okul bahçesi çizilmiş. Bir grup çocuk bir çocuğu dışlamış. Ortada ağlayan tek çocuk. Diğerleri gülüyor ve işaret ediyor.',
    expectedConcern: 'bullying',
    expectedTherapeutic: true
  },
  {
    name: '🏡 Aile İçi Şiddet Senaryosu',
    description: 'Evde anne baba bağırıyor birbirine. Küçük çocuk köşede saklanmış, kulakları kapalı. Yüzünde korku ifadesi var.',
    expectedConcern: 'domestic_violence_witness',
    expectedTherapeutic: true
  },
  {
    name: '🍺 Ebeveyn Bağımlılığı Senaryosu',
    description: 'Kanepede yatan bir yetişkin figürü. Etrafında şişeler. Yanında endişeli bir çocuk bakıyor. Karanlık oda.',
    expectedConcern: 'parental_addiction',
    expectedTherapeutic: true
  },

  // === PEDIATRIC PSYCHOLOGY CATEGORIES ===
  {
    name: '🏥 Tıbbi Travma Senaryosu',
    description: 'Hastane odası çizilmiş. Yatakta küçük bir çocuk. İğneler, makineler var. Çocuğun yüzünde korku. Doktor beyaz önlüklü.',
    expectedConcern: 'medical_trauma',
    expectedTherapeutic: true
  },
  {
    name: '😰 Kaygı Senaryosu',
    description: 'Çocuk çok küçük çizilmiş, köşede. Etrafında büyük soru işaretleri ve bulutlar. Titrek çizgiler. Büyük korku dolu gözler.',
    expectedConcern: 'anxiety',
    expectedTherapeutic: true
  },
  {
    name: '🌧️ Depresyon Senaryosu',
    description: 'Karanlık renkler kullanılmış. Güneş yok. Çocuk tek başına ağlıyor. Gri bulutlar. Hiç renk yok, her yer koyu.',
    expectedConcern: 'depression',
    expectedTherapeutic: true
  },
  {
    name: '📚 Okul Stresi Senaryosu',
    description: 'Okul binası çizilmiş. Çocuk kitap yığınları altında ezilmiş görünüyor. Sınav kağıdında kocaman kırmızı F. Ağlayan çocuk.',
    expectedConcern: 'school_stress',
    expectedTherapeutic: true
  },

  // === ADDITIONAL CATEGORIES ===
  {
    name: '✈️ Göç/Yerinden Edilme Senaryosu',
    description: 'Bavullar çizilmiş. Bir aile yolda yürüyor. Arkada bıraktıkları ev küçük. Önlerinde bilinmeyen yeni bir yer.',
    expectedConcern: 'displacement',
    expectedTherapeutic: true
  }
];

// Theme suggestion prompt (ACEs framework + Pediatric Psychology)
const THEME_PROMPT = (description: string) => `Sen bir pediatri uzmanı, çocuk psikoloğu ve bibliotherapy (kitap terapisi) uzmanısın. Bu çocuk çizimini ACEs (Adverse Childhood Experiences) çerçevesinde dikkatle analiz et.

ÇİZİM AÇIKLAMASI:
${description}

## KAPSAMLI TRAVMA TESPİTİ VE SINIFLANDIRMA (ACEs + Pediatrik Psikoloji)

### TEMEL KATEGORİLER
1. SAVAŞ (war): Silahlar, askerler, bombalar, yıkılmış binalar
2. ŞİDDET (violence): Dövüşen figürler, yaralı karakterler, kan
3. DOĞAL AFET (disaster): Deprem yıkıntıları, sel, yangın
4. KAYIP (loss): Mezarlar, boş yerler, eksik aile üyeleri
5. YALNIZLIK (loneliness): Tek başına figürler, izole karakterler
6. KORKU (fear): Canavarlar, karanlık temalar, korkmuş ifadeler
7. İSTİSMAR (abuse): Ağlayan çocuklar, korunmasız pozisyonlar
8. AİLE AYRILIGI (family_separation): Bölünmüş aileler, ayrılmış figürler
9. ÖLÜM (death): Melekler, bulutlardaki figürler

### ACEs FRAMEWORK KATEGORİLERİ
10. İHMAL (neglect): Bakımsız görünüm, boş/karanlık ev, yalnız bırakılmış çocuk
11. ZORBALIK (bullying): Grup tarafından çevrelenmiş tek çocuk, ağlayan yüz, itilen figür
12. AİLE İÇİ ŞİDDETE TANIKLIK (domestic_violence_witness): Kavga eden ebeveynler, saklanan çocuk
13. EBEVEYN BAĞIMLILIĞI (parental_addiction): Şişeler, sigara, yatan/hareketsiz ebeveyn
14. EBEVEYN RUHSAL HASTALIĞI (parental_mental_illness): Üzgün/ağlayan ebeveyn, yatakta yatan anne/baba

### PEDİATRİK PSİKOLOJİ KATEGORİLERİ
15. TIBBİ TRAVMA (medical_trauma): Hastane, iğne, yatak, doktor
16. KAYGI (anxiety): Titrek çizgiler, büyük gözler, küçük figür
17. DEPRESYON (depression): Koyu renkler, ağlayan yüz, yalnız figür
18. DÜŞÜK ÖZ SAYGI (low_self_esteem): Çok küçük çizilmiş kendisi, köşede figür
19. ÖFKE (anger): Kırmızı renkler, saldırgan figürler, patlamalar
20. OKUL STRESİ (school_stress): Okul binası, kitaplar, sınav, ağlayan öğrenci
21. SOSYAL DIŞLANMA (social_rejection): Gruptan uzak tek figür, kapalı kapı

### EK KATEGORİLER
22. GÖÇ/YERİNDEN EDİLME (displacement): Yolculuk, bavul, farklı evler
23. EKONOMİK ZORLUK (poverty): Boş tabak, yırtık kıyafet, eksik eşyalar
24. SİBER ZORBALIK (cyberbullying): Telefon/tablet, üzgün yüz

Eğer travmatik içerik yoksa normal pozitif temalar öner.

JSON formatında yanıt ver:
{
  "contentAnalysis": {
    "hasConcerningContent": boolean,
    "concernType": "war" | "violence" | "disaster" | "loss" | "loneliness" | "fear" | "abuse" | "family_separation" | "death" | "neglect" | "bullying" | "domestic_violence_witness" | "parental_addiction" | "parental_mental_illness" | "medical_trauma" | "anxiety" | "depression" | "low_self_esteem" | "anger" | "school_stress" | "social_rejection" | "displacement" | "poverty" | "cyberbullying" | "other" | null,
    "concernDescription": "Açıklama veya null",
    "therapeuticApproach": "Yaklaşım veya null"
  },
  "suggestions": [
    {
      "title": "Tema başlığı",
      "theme": "Tema açıklaması",
      "emoji": "emoji"
    }
  ]
}`;

async function runQuickTest() {
  console.log('🧪 HIZLI TERAPÖTİK SİSTEM TESTİ\n');
  console.log('='.repeat(60) + '\n');

  let passed = 0;
  let failed = 0;

  for (const scenario of TEST_SCENARIOS) {
    console.log(`${scenario.name}`);
    console.log(`📝 Çizim: ${scenario.description.substring(0, 80)}...`);

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: THEME_PROMPT(scenario.description) }],
        temperature: 0.7,
        max_tokens: 800
      });

      const content = response.choices[0]?.message?.content || '{}';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const result = JSON.parse(jsonMatch ? jsonMatch[0] : content);

      const actualConcern = result.contentAnalysis?.concernType || null;
      const hasConcerning = result.contentAnalysis?.hasConcerningContent || false;

      // Doğruluk kontrolü
      const concernCorrect = actualConcern === scenario.expectedConcern;
      const therapeuticCorrect = hasConcerning === scenario.expectedTherapeutic;

      if (concernCorrect && therapeuticCorrect) {
        console.log(`✅ BAŞARILI`);
        console.log(`   Beklenen: ${scenario.expectedConcern || 'normal'} | Gerçek: ${actualConcern || 'normal'}`);
        passed++;
      } else {
        console.log(`❌ BAŞARISIZ`);
        console.log(`   Beklenen: ${scenario.expectedConcern || 'normal'} | Gerçek: ${actualConcern || 'normal'}`);
        failed++;
      }

      // Tema önerileri
      if (result.suggestions && result.suggestions.length > 0) {
        console.log(`   📚 Temalar:`);
        result.suggestions.slice(0, 2).forEach((s: any) => {
          console.log(`      ${s.emoji} ${s.title}`);
        });
      }

      if (result.contentAnalysis?.therapeuticApproach) {
        console.log(`   💜 Yaklaşım: ${result.contentAnalysis.therapeuticApproach.substring(0, 60)}...`);
      }

    } catch (error) {
      console.log(`❌ HATA: ${error}`);
      failed++;
    }

    console.log('');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('='.repeat(60));
  console.log(`\n📊 SONUÇ: ${passed}/${TEST_SCENARIOS.length} test geçti`);
  console.log(`   ✅ Başarılı: ${passed}`);
  console.log(`   ❌ Başarısız: ${failed}`);
  console.log(`   Başarı oranı: ${((passed / TEST_SCENARIOS.length) * 100).toFixed(1)}%`);
}

runQuickTest().catch(console.error);
