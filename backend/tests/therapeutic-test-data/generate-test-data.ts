/**
 * Therapeutic Story Test Data Generator
 *
 * Bu script, terapötik hikaye sistemini test etmek için
 * sentetik çizim açıklamaları ve beklenen çıktılar üretir.
 *
 * Kullanım: npx ts-node generate-test-data.ts
 */

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Test kategorileri ve örnekleri
interface TestCategory {
  code: string;
  name_tr: string;
  name_en: string;
  description: string;
  visual_elements_examples: string[];
  therapeutic_approach: string;
  sample_count: number;
}

const TEST_CATEGORIES: TestCategory[] = [
  {
    code: 'war',
    name_tr: 'Savaş/Çatışma',
    name_en: 'War/Conflict',
    description: 'Savaş sahneleri, askerler, silahlar, yıkım içeren çizimler',
    visual_elements_examples: ['askerler', 'tank', 'uçak', 'bomba', 'yıkılmış bina', 'duman', 'ateş'],
    therapeutic_approach: 'Barış ve güvenlik temalı metaforlar, koruyucu kahramanlar',
    sample_count: 10 // Test için 10, production için 50
  },
  {
    code: 'violence',
    name_tr: 'Şiddet',
    name_en: 'Violence',
    description: 'Kavga, yaralanma, fiziksel şiddet içeren çizimler',
    visual_elements_examples: ['dövüşen figürler', 'kan', 'yaralı karakter', 'bağıran yüzler', 'yumruk'],
    therapeutic_approach: 'Güç ve kontrol kazanma, dışsallaştırma',
    sample_count: 10
  },
  {
    code: 'disaster',
    name_tr: 'Doğal Afet',
    name_en: 'Natural Disaster',
    description: 'Deprem, sel, yangın gibi doğal afet sahneleri',
    visual_elements_examples: ['yıkılmış ev', 'çatlaklar', 'su baskını', 'yangın', 'enkaz', 'kırık eşyalar'],
    therapeutic_approach: 'Yeniden inşa, topluluk desteği, dayanıklılık',
    sample_count: 10
  },
  {
    code: 'loss',
    name_tr: 'Kayıp',
    name_en: 'Loss',
    description: 'Ölüm, ayrılık, kayıp temalı çizimler',
    visual_elements_examples: ['mezar', 'boş sandalye', 'eksik aile üyesi', 'gözyaşları', 'karanlık bulutlar'],
    therapeutic_approach: 'Anı ve bağlantı, sevginin devamı',
    sample_count: 10
  },
  {
    code: 'loneliness',
    name_tr: 'Yalnızlık',
    name_en: 'Loneliness',
    description: 'İzolasyon, yalnızlık, dışlanma içeren çizimler',
    visual_elements_examples: ['tek başına figür', 'uzak köşe', 'boş alan', 'arkası dönük karakter', 'duvar'],
    therapeutic_approach: 'Bağlantı ve aidiyet, beklenmedik dostluk',
    sample_count: 10
  },
  {
    code: 'fear',
    name_tr: 'Korku',
    name_en: 'Fear',
    description: 'Korku, kabus, tehdit içeren çizimler',
    visual_elements_examples: ['canavar', 'karanlık', 'gözler', 'gölgeler', 'korkmuş yüz', 'kaçan figür'],
    therapeutic_approach: 'Korkunun dışsallaştırılması ve yenilmesi',
    sample_count: 10
  },
  {
    code: 'abuse',
    name_tr: 'İstismar',
    name_en: 'Abuse',
    description: 'Güç dengesizliği, korunmasızlık içeren çizimler',
    visual_elements_examples: ['büyük-küçük figür', 'ağlayan çocuk', 'saklanma', 'kapalı kapı', 'korku ifadesi'],
    therapeutic_approach: 'Güvenlik, ses bulma, değerlilik',
    sample_count: 10
  },
  {
    code: 'family_separation',
    name_tr: 'Aile Ayrılığı',
    name_en: 'Family Separation',
    description: 'Boşanma, aile bölünmesi içeren çizimler',
    visual_elements_examples: ['iki ayrı ev', 'ortadan bölünmüş aile', 'çizgi ile ayrılmış figürler', 'uzak ebeveyn'],
    therapeutic_approach: 'Sevginin devamı, iki yuvada aidiyet',
    sample_count: 10
  },
  {
    code: 'death',
    name_tr: 'Ölüm/Yas',
    name_en: 'Death/Grief',
    description: 'Ölüm ve yas temalı çizimler',
    visual_elements_examples: ['melek kanatları', 'bulutlardaki figür', 'yıldız', 'çiçek', 'anı nesnesi'],
    therapeutic_approach: 'Dönüşüm metaforu, sevginin sonsuzluğu',
    sample_count: 10
  },

  // === ACEs FRAMEWORK CATEGORIES ===
  {
    code: 'neglect',
    name_tr: 'İhmal',
    name_en: 'Neglect',
    description: 'Fiziksel veya duygusal ihmal içeren çizimler',
    visual_elements_examples: ['karanlık ev', 'boş buzdolabı', 'bakımsız çocuk', 'yırtık kıyafet', 'yalnız figür', 'boş oda'],
    therapeutic_approach: 'Sıcak yuva, sevgi dolu ilgi, değerlilik',
    sample_count: 5
  },
  {
    code: 'bullying',
    name_tr: 'Akran Zorbalığı',
    name_en: 'Bullying',
    description: 'Okul veya arkadaş ortamında zorbalık içeren çizimler',
    visual_elements_examples: ['grup tarafından çevrelenmiş çocuk', 'ağlayan yüz', 'itilen figür', 'dışlanan karakter', 'gösterilen parmaklar'],
    therapeutic_approach: 'Cesaret, gerçek dostlar, iç güzellik',
    sample_count: 5
  },
  {
    code: 'domestic_violence_witness',
    name_tr: 'Aile İçi Şiddete Tanıklık',
    name_en: 'Witnessing Domestic Violence',
    description: 'Ebeveynler arasında şiddete tanıklık içeren çizimler',
    visual_elements_examples: ['kavga eden figürler', 'saklanan çocuk', 'kulakları kapatan figür', 'korku ifadesi', 'bağıran yüzler'],
    therapeutic_approach: 'Güvenli sığınak, huzur, koruyucu melek',
    sample_count: 5
  },
  {
    code: 'parental_addiction',
    name_tr: 'Ebeveyn Bağımlılığı',
    name_en: 'Parental Addiction',
    description: 'Ebeveynin alkol veya madde bağımlılığı içeren çizimler',
    visual_elements_examples: ['şişeler', 'yatan yetişkin', 'endişeli çocuk', 'karanlık oda', 'sigara'],
    therapeutic_approach: 'Yardım melekleri, güneşli yarınlar, umut',
    sample_count: 5
  },
  {
    code: 'parental_mental_illness',
    name_tr: 'Ebeveyn Ruhsal Hastalığı',
    name_en: 'Parental Mental Illness',
    description: 'Anne veya babanın ruhsal hastalığını yansıtan çizimler',
    visual_elements_examples: ['yatakta yatan ebeveyn', 'ağlayan anne/baba', 'karanlık oda', 'endişeli çocuk', 'kapalı perdeler'],
    therapeutic_approach: 'Bulutların üstündeki güneş, güçlü minik kalp',
    sample_count: 5
  },

  // === PEDIATRIC PSYCHOLOGY CATEGORIES ===
  {
    code: 'medical_trauma',
    name_tr: 'Tıbbi Travma',
    name_en: 'Medical Trauma',
    description: 'Hastane, tedavi, hastalık korkusu içeren çizimler',
    visual_elements_examples: ['hastane', 'iğne', 'doktor', 'yatak', 'makineler', 'beyaz önlük'],
    therapeutic_approach: 'Cesur küçük savaşçı, iyileşen kahraman',
    sample_count: 5
  },
  {
    code: 'anxiety',
    name_tr: 'Kaygı',
    name_en: 'Anxiety',
    description: 'Endişe ve kaygı belirtileri içeren çizimler',
    visual_elements_examples: ['titrek çizgiler', 'büyük gözler', 'küçük figür', 'soru işaretleri', 'tehdit bulutları'],
    therapeutic_approach: 'Küçülen endişe, sakin göl, cesaret adımları',
    sample_count: 5
  },
  {
    code: 'depression',
    name_tr: 'Depresyon Belirtileri',
    name_en: 'Depression',
    description: 'Üzüntü ve depresyon belirtileri içeren çizimler',
    visual_elements_examples: ['koyu renkler', 'güneşsiz gökyüzü', 'ağlayan yüz', 'gri tonlar', 'yalnız figür'],
    therapeutic_approach: 'Güneşi arayan çiçek, umut tohumu',
    sample_count: 5
  },
  {
    code: 'low_self_esteem',
    name_tr: 'Düşük Öz Saygı',
    name_en: 'Low Self-Esteem',
    description: 'Düşük öz saygı ve kendine güvensizlik içeren çizimler',
    visual_elements_examples: ['çok küçük kendisi', 'köşede figür', 'silik çizgiler', 'başı önde karakter'],
    therapeutic_approach: 'Eşsiz yıldız, iç hazine, özel sen',
    sample_count: 5
  },
  {
    code: 'anger',
    name_tr: 'Öfke',
    name_en: 'Anger',
    description: 'Öfke ve saldırganlık belirtileri içeren çizimler',
    visual_elements_examples: ['kırmızı renkler', 'patlamalar', 'kırık objeler', 'bağıran figür', 'saldırgan duruş'],
    therapeutic_approach: 'Öfke canavarını evcilleştirmek, duygu ustası',
    sample_count: 5
  },
  {
    code: 'school_stress',
    name_tr: 'Okul Stresi',
    name_en: 'School Stress',
    description: 'Okul ve akademik stres içeren çizimler',
    visual_elements_examples: ['okul binası', 'kitap yığınları', 'sınav kağıdı', 'kırmızı notlar', 'ağlayan öğrenci'],
    therapeutic_approach: 'Kendi hızında koşan tavşan, öğrenme macerası',
    sample_count: 5
  },
  {
    code: 'social_rejection',
    name_tr: 'Sosyal Dışlanma',
    name_en: 'Social Rejection',
    description: 'Akran grubu tarafından dışlanma içeren çizimler',
    visual_elements_examples: ['gruptan uzak figür', 'kapalı kapı', 'duvar', 'arkası dönük grup', 'yalnız köşe'],
    therapeutic_approach: 'Farklı olan güzel, gerçek arkadaş',
    sample_count: 5
  },

  // === ADDITIONAL CATEGORIES ===
  {
    code: 'displacement',
    name_tr: 'Göç/Yerinden Edilme',
    name_en: 'Displacement/Migration',
    description: 'Göç veya yerinden edilme deneyimi içeren çizimler',
    visual_elements_examples: ['bavullar', 'yolculuk', 'farklı evler', 'uzaktaki eski ev', 'yeni ortam'],
    therapeutic_approach: 'Yeni yuva aynı kalp, cesur yolcu',
    sample_count: 5
  },
  {
    code: 'poverty',
    name_tr: 'Ekonomik Zorluk',
    name_en: 'Poverty',
    description: 'Maddi zorluk ve yoksunluk içeren çizimler',
    visual_elements_examples: ['boş tabak', 'yırtık kıyafet', 'eksik eşyalar', 'küçük ev', 'paylaşılan şeyler'],
    therapeutic_approach: 'Gerçek hazine, kalp zengini, güçlü aile',
    sample_count: 5
  },
  {
    code: 'cyberbullying',
    name_tr: 'Siber Zorbalık',
    name_en: 'Cyberbullying',
    description: 'Online zorbalık ve dijital taciz içeren çizimler',
    visual_elements_examples: ['telefon', 'tablet', 'kötü mesajlar', 'üzgün emoji', 'ağlayan yüz'],
    therapeutic_approach: 'Dijital kahraman, güvenli ekran',
    sample_count: 5
  },

  // === CONTROL GROUP ===
  {
    code: 'normal',
    name_tr: 'Normal (Kontrol)',
    name_en: 'Normal (Control)',
    description: 'Travmatik içerik olmayan normal çocuk çizimleri',
    visual_elements_examples: ['güneş', 'ev', 'aile', 'hayvanlar', 'çiçekler', 'gökkuşağı', 'oyuncaklar'],
    therapeutic_approach: 'Standart pozitif temalar',
    sample_count: 20
  }
];

// Çizim açıklaması üretme prompt'u
async function generateDrawingDescription(category: TestCategory, index: number): Promise<object> {
  const ageRange = [4, 5, 6, 7, 8, 9, 10];
  const randomAge = ageRange[Math.floor(Math.random() * ageRange.length)];

  const prompt = `Sen bir çocuk psikoloğu ve sanat terapistisin. ${randomAge} yaşında bir çocuğun çizdiği bir resmi tarif et.

SENARYO: ${category.name_tr} temalı bir çizim
AÇIKLAMA: ${category.description}

Çizimde bulunabilecek görsel öğeler: ${category.visual_elements_examples.join(', ')}

GÖREV: Bu kategoride gerçekçi bir çocuk çizimi açıklaması yaz. Çocuğun bakış açısından, basit çizgi ve şekillerle nasıl ifade edileceğini düşün.

KURALLAR:
1. Çocuk çizimi tarzında ol (basit, sembolik)
2. Renk kullanımını belirt
3. Figürlerin konumunu ve boyutunu açıkla
4. Duygusal ifadeleri dahil et
5. 3-5 cümle uzunluğunda ol

JSON formatında yanıt ver:
{
  "description": "Çizimin detaylı açıklaması",
  "visual_elements": ["öğe1", "öğe2", ...],
  "colors_used": ["renk1", "renk2", ...],
  "emotional_indicators": ["gösterge1", "gösterge2", ...],
  "child_age": ${randomAge}
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return {
      id: `${category.code}_${String(index).padStart(3, '0')}`,
      category: category.code,
      category_name: category.name_tr,
      expected_concern_type: category.code === 'normal' ? null : category.code,
      expected_therapeutic_approach: category.therapeutic_approach,
      severity: category.code === 'normal' ? 'none' : ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      ...parsed
    };
  } catch (error) {
    console.error(`Error generating description for ${category.code}_${index}:`, error);
    return {
      id: `${category.code}_${String(index).padStart(3, '0')}`,
      category: category.code,
      error: 'Generation failed'
    };
  }
}

// Tema önerileri için beklenen çıktı üretme
async function generateExpectedThemes(description: object): Promise<object> {
  const desc = description as any;

  if (desc.category === 'normal') {
    return {
      scenario_id: desc.id,
      good_themes: [
        { title: 'Mutlu Macera', theme: 'Eğlenceli keşif hikayesi', therapeutic_value: 'standard' }
      ],
      bad_themes: [],
      notes: 'Normal çizim - standart temalar uygun'
    };
  }

  const prompt = `Sen bir çocuk psikolojisi ve bibliotherapy uzmanısın.

ÇOCUK ÇİZİMİ:
${desc.description}

KATEGORİ: ${desc.category_name}
ÇOCUK YAŞI: ${desc.child_age}

GÖREV: Bu çizim için uygun terapötik masal temaları öner ve ASLA önerilmemesi gereken temaları listele.

TERAPÖTİK PRENSİPLER:
- Psikolojik mesafe (metafor kullan)
- Dışsallaştırma (travmayı ayrı bir varlık yap)
- Güçlendirme (karakter kontrol kazansın)
- Güvenlik (koruyucu figürler)
- Umut (pozitif sonuç)

JSON formatında yanıt ver:
{
  "good_themes": [
    {
      "title": "Tema başlığı",
      "theme": "Tema açıklaması",
      "therapeutic_value": "high/medium",
      "bibliotherapy_principle": "hangi prensip uygulanıyor"
    }
  ],
  "bad_themes": [
    {
      "title": "Kötü tema örneği",
      "reason": "Neden uygun değil"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 800
    });

    const content = response.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);

    return {
      scenario_id: desc.id,
      ...parsed
    };
  } catch (error) {
    console.error(`Error generating themes for ${desc.id}:`, error);
    return {
      scenario_id: desc.id,
      error: 'Theme generation failed'
    };
  }
}

// Ana üretim fonksiyonu
async function generateTestDataset() {
  console.log('🚀 Terapötik Test Veri Seti Üretimi Başlıyor...\n');

  const outputDir = path.join(__dirname, 'generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const allDescriptions: object[] = [];
  const allThemes: object[] = [];

  for (const category of TEST_CATEGORIES) {
    console.log(`\n📁 Kategori: ${category.name_tr} (${category.sample_count} örnek)`);

    for (let i = 1; i <= category.sample_count; i++) {
      process.stdout.write(`  Üretiliyor: ${i}/${category.sample_count}...\r`);

      // Çizim açıklaması üret
      const description = await generateDrawingDescription(category, i);
      allDescriptions.push(description);

      // Beklenen temalar üret
      const themes = await generateExpectedThemes(description);
      allThemes.push(themes);

      // Rate limit için bekle
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`  ✅ ${category.name_tr} tamamlandı!`);
  }

  // Dosyaları kaydet
  const descriptionsPath = path.join(outputDir, 'drawing_descriptions.jsonl');
  const themesPath = path.join(outputDir, 'expected_themes.jsonl');

  fs.writeFileSync(
    descriptionsPath,
    allDescriptions.map(d => JSON.stringify(d)).join('\n')
  );

  fs.writeFileSync(
    themesPath,
    allThemes.map(t => JSON.stringify(t)).join('\n')
  );

  console.log('\n' + '='.repeat(50));
  console.log('✅ VERİ SETİ OLUŞTURULDU!');
  console.log(`📄 Çizim açıklamaları: ${descriptionsPath}`);
  console.log(`📄 Beklenen temalar: ${themesPath}`);
  console.log(`📊 Toplam örnek: ${allDescriptions.length}`);
  console.log('='.repeat(50));
}

// Çalıştır
generateTestDataset().catch(console.error);
