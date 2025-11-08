# ✅ MasalBak Supabase Entegrasyonu Tamamlandı

## 📦 Eklenen Paketler
- `@supabase/supabase-js` - Supabase client
- `openai` - DALL-E 3 görsel + TTS ses üretimi
- `puppeteer` - PDF oluşturma
- `sharp` - Görsel işleme (line-art dönüşümü)
- `expo-image-picker` - Mobil galeri/kamera erişimi

## 🗂️ Oluşturulan Dosyalar

### Backend
```
backend/
├── lib/
│   ├── supabase.ts         # Supabase client + uploadBuffer helper
│   ├── persist.ts           # Veritabanı CRUD işlemleri
│   ├── story.ts             # Masal kitabı üretimi (AI + PDF + TTS)
│   └── coloring.ts          # Boyama PDF üretimi (line-art + PDF)
└── trpc/routes/studio/
    ├── create-storybook.ts      # tRPC: Masal oluştur
    ├── generate-coloring-pdf.ts # tRPC: Boyama PDF
    └── list-history.ts          # tRPC: Geçmiş listeleri
```

### Mobile
```
services/
└── studio.ts               # Mobile servis (tRPC client wrapper)

app/(tabs)/
└── studio.tsx              # Studio ekranı (güncellendi)
```

### Dokümantasyon
```
schema.sql                  # Supabase veritabanı şeması
SUPABASE_SETUP.md          # Detaylı kurulum rehberi
.env.example               # Örnek environment variables
```

## 🎯 tRPC Endpoints

### 1. Masal Kitabı Oluştur
```typescript
trpc.studio.createStorybook.mutate({
  title: "Masal Başlığı",
  pages: [
    { text: "Sayfa 1 metni", prompt: "Görsel prompt (opsiyonel)" },
    { text: "Sayfa 2 metni" },
    // ...
  ],
  lang: "tr",
  makePdf: true,
  makeTts: true,
  user_id: null
})
```

**Çıktı:**
- Her sayfa için AI üretimi görsel (DALL-E 3)
- PDF dosyası (Puppeteer)
- TTS ses dosyaları (OpenAI TTS)
- Supabase'de kayıt

### 2. Boyama PDF Oluştur
```typescript
trpc.studio.generateColoringPDF.mutate({
  title: "Boyama Sayfası",
  pages: ["data:image/png;base64,..."],
  size: "A4",
  user_id: null
})
```

**Çıktı:**
- Line-art dönüşümü (Sharp)
- PDF dosyası
- Supabase'de kayıt

### 3. Geçmiş Listele
```typescript
// Masallar
trpc.studio.listStorybooks.query({ user_id: null })

// Boyamalar
trpc.studio.listColorings.query({ user_id: null })
```

## 🗄️ Veritabanı Şeması

### `storybooks` Tablosu
```sql
id          uuid (PK)
user_id     text
title       text
pages       jsonb         # [{ text, img_url }, ...]
pdf_url     text
voice_urls  jsonb         # ["url1.mp3", "url2.mp3", ...]
created_at  timestamptz
```

### `colorings` Tablosu
```sql
id          uuid (PK)
user_id     text
title       text
pdf_url     text
page_count  int
created_at  timestamptz
```

## ☁️ Supabase Storage Yapısı

```
masalbak/  (bucket)
├── images/
│   ├── story_*.png      # Masal görselleri
│   └── line_*.png       # Line-art görselleri
├── pdf/
│   ├── story_*.pdf      # Masal PDF'leri
│   └── coloring_*.pdf   # Boyama PDF'leri
└── audio/
    └── story_*_*.mp3    # TTS ses dosyaları
```

## 🔐 Gerekli Environment Variables

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGc...
SUPABASE_BUCKET=masalbak

# OpenAI
OPENAI_API_KEY=sk-...

# Server
PORT=4000

# Mobile
EXPO_PUBLIC_API=http://192.168.1.100:4000
```

## 🚀 Kurulum Adımları

### 1. Supabase Proje Kurulumu
```bash
# 1. https://supabase.com adresinden proje oluştur
# 2. Storage > New Bucket > masalbak (public)
# 3. SQL Editor'de schema.sql'i çalıştır
# 4. Settings > API'den key'leri kopyala
```

### 2. Environment Variables
```bash
# .env.example'ı kopyala
cp .env.example .env

# Değerleri doldur (Supabase + OpenAI)
nano .env
```

### 3. Paketleri Kur ve Çalıştır
```bash
# Root dizinde
bun install

# Backend'i çalıştır
bun dev

# Mobil uygulamayı çalıştır (başka terminal)
bun start
```

## 🧪 Test

### Backend Test
```bash
curl http://localhost:4000/api/trpc/example.hi
# Beklenen: {"result":{"data":"Hello from tRPC!"}}
```

### Masal Oluşturma Testi
Mobile app'te:
1. Studio tabına git
2. "Masal Kitabı Oluştur" butonuna bas
3. Bekle (AI üretimi zaman alır: ~30-60 saniye)
4. PDF linkini paylaş

### Boyama PDF Testi
Mobile app'te:
1. Studio tabına git
2. "Görsel Seç" butonuna bas
3. Bir çizim seç
4. "Boyama PDF Oluştur" butonuna bas
5. PDF linkini paylaş

## 📊 Performans ve Maliyet

### OpenAI Maliyetleri (Örnek)
- **DALL-E 3**: $0.04 / görsel
- **TTS**: $0.015 / 1K karakter
- **5 sayfalık masal**: ~$0.25

### İşlem Süreleri
- **Görsel üretimi**: 10-15 saniye/görsel
- **PDF oluşturma**: 2-3 saniye
- **TTS üretimi**: 3-5 saniye/sayfa
- **5 sayfalık masal toplam**: ~60-90 saniye

## 🐛 Bilinen Sorunlar ve Çözümler

### Puppeteer Linux Hatası
```bash
# Chrome bağımlılıklarını kur
sudo apt-get install -y libgbm1 libnss3 libxss1 libasound2
```

### Sharp Kurulum Hatası
```bash
rm -rf node_modules
bun install
```

### Supabase Bağlantı Hatası
- `.env` dosyasını kontrol et
- `SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE` doğru mu?
- Supabase projesinin aktif olduğundan emin ol

## 🎉 Özellikler

✅ AI ile masal görseli üretimi (DALL-E 3)
✅ Otomatik PDF oluşturma (Puppeteer)
✅ TTS ses dosyaları (OpenAI TTS)
✅ Line-art dönüşümü (Sharp)
✅ Boyama PDF üretimi
✅ Kalıcı veri depolama (Supabase)
✅ Dosya yönetimi (Supabase Storage)
✅ Geçmiş listeleme
✅ Paylaşım özellikleri

## 📚 Kaynaklar

- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Puppeteer](https://pptr.dev/)
- [Sharp](https://sharp.pixelplumbing.com/)
- [tRPC](https://trpc.io/)

## 🆘 Destek

Sorun yaşarsan kontrol et:
1. ✅ Supabase Dashboard > Logs
2. ✅ Backend console logs
3. ✅ Mobile Expo DevTools > Console
4. ✅ SUPABASE_SETUP.md dosyasını oku
