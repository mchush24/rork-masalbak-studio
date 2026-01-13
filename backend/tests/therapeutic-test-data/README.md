# Terapötik Masal Test Veri Seti

## Amaç
Bu veri seti, travma tespiti ve terapötik hikaye oluşturma sisteminin test edilmesi ve ileride fine-tuning için kullanılması amacıyla oluşturulmuştur.

## Veri Yapısı

### 1. Çizim Açıklamaları (drawing_descriptions.jsonl)
Her satır bir test senaryosu içerir:
```json
{
  "id": "war_001",
  "category": "war",
  "description": "Çizimde askerler ve tanklar var. Gökyüzünde uçaklar. Bir ev yanıyor.",
  "visual_elements": ["askerler", "tank", "uçak", "yanan ev", "duman"],
  "expected_concern_type": "war",
  "expected_therapeutic_approach": "Barış ve güvenlik temalı",
  "severity": "high",
  "age_context": "6 yaş çocuk çizimi"
}
```

### 2. Tema Önerileri (theme_suggestions.jsonl)
Beklenen tema çıktıları:
```json
{
  "scenario_id": "war_001",
  "good_themes": [
    {"title": "Barışı Getiren Kelebek", "theme": "Savaşı durduran büyülü kelebek", "therapeutic_value": "high"},
    {"title": "Güvenli Liman", "theme": "Koruyucu kalkan altında huzur", "therapeutic_value": "high"}
  ],
  "bad_themes": [
    {"title": "Savaşan Askerler", "reason": "Travmayı tekrar eder"},
    {"title": "Bomba Patlaması", "reason": "Şiddeti normalleştirir"}
  ]
}
```

### 3. Hikaye Değerlendirmeleri (story_evaluations.jsonl)
Üretilen hikayelerin kalite değerlendirmesi:
```json
{
  "story_id": "story_war_001",
  "bibliotherapy_score": {
    "psychological_distance": 0.9,
    "externalization": 0.85,
    "empowerment": 0.8,
    "safety": 0.95,
    "hope": 0.9
  },
  "overall_therapeutic_value": 0.88,
  "expert_notes": "Karakter güçlenme arkı iyi, son umut verici"
}
```

## Kategoriler

| Kategori | Kod | Örnek Sayısı (Hedef) |
|----------|-----|---------------------|
| Savaş/Çatışma | war | 50 |
| Şiddet | violence | 50 |
| Doğal Afet | disaster | 50 |
| Kayıp | loss | 50 |
| Yalnızlık | loneliness | 30 |
| Korku | fear | 30 |
| İstismar | abuse | 30 |
| Aile Ayrılığı | family_separation | 30 |
| Ölüm/Yas | death | 30 |
| Normal (Kontrol) | normal | 100 |
| **TOPLAM** | | **450** |

## Veri Üretim Süreci

### Aşama 1: LLM ile Sentetik Açıklama Üretimi
GPT-4 kullanarak çizim açıklamaları üretilir.

### Aşama 2: Uzman İncelemesi
Çocuk psikoloğu tarafından gözden geçirme.

### Aşama 3: Ground Truth Etiketleme
Her örnek için beklenen çıktılar belirlenir.

### Aşama 4: Cross-validation
Farklı değerlendiriciler arası tutarlılık kontrolü.

## Etik Kurallar

1. **ASLA gerçek çocuk çizimleri kullanılmaz** (rıza/gizlilik)
2. Tüm veriler sentetik ve açıkça etiketlidir
3. Amaç yardım etmek, travma koleksiyonu yapmak değil
4. Minimum gerekli veri prensibi

## Kullanım

```bash
# Test suite çalıştırma
npm run test:therapeutic

# Değerlendirme raporları
npm run evaluate:therapeutic
```
