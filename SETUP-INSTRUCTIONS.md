# MasalBak Kurulum Talimatları

## 📋 Kurulum Adımları

### 1. Supabase Database Kurulumu

1. Supabase Dashboard'unuza gidin: https://app.supabase.com
2. Sol menüden **SQL Editor**'ü açın
3. `schema.sql` dosyasının içeriğini kopyalayıp SQL Editor'e yapıştırın
4. **RUN** butonuna tıklayın
5. Tabloların oluştuğunu doğrulayın: `Table Editor` > `storybooks` ve `colorings` tablolarını görmelisiniz

### 2. Supabase Storage Kurulumu

1. Sol menüden **Storage**'a gidin
2. **Create bucket** butonuna tıklayın
3. Bucket adı: `masalbak`
4. **Public bucket** seçeneğini aktif edin (✅)
5. **Create bucket** ile oluşturun

**Klasör Yapısı (otomatik oluşacak):**
```
masalbak/
├── images/     (Masal görselleri ve çizgi sanatı görselleri)
├── pdf/        (Masal PDF'leri ve boyama PDF'leri)
└── audio/      (Masal TTS ses dosyaları)
```

### 3. Supabase API Anahtarlarını Alın

1. Supabase Dashboard > **Project Settings** > **API**
2. Aşağıdaki değerleri kopyalayın:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE` (gizli tutun!)

### 4. OpenAI API Key Alın

1. https://platform.openai.com/api-keys adresine gidin
2. **Create new secret key** ile yeni anahtar oluşturun
3. Anahtarı kopyalayın → `OPENAI_API_KEY`

### 5. ENV Dosyasını Güncelleyin

`.env` dosyasını açın ve placeholder değerleri gerçek değerlerle değiştirin:

```env
# Backend API Port
PORT=4000

# OpenAI API Key (for image generation and TTS)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx
SUPABASE_BUCKET=masalbak

# Expo Public API URL (for mobile app)
EXPO_PUBLIC_API=http://localhost:4000
```

**Not:** Production'da `EXPO_PUBLIC_API`'yi gerçek sunucu URL'iniz olarak değiştirin.

### 6. Uygulamayı Başlatın

```bash
# Bağımlılıkları yükleyin (eğer henüz yüklemediyseniz)
bun install

# Uygulamayı başlatın
bun start
```

### 7. Test Edin

1. **Studio** sekmesine gidin
2. **Masal Kitabı Oluştur** butonuna tıklayın
3. İşlem tamamlandığında PDF linkini göreceksiniz
4. Alternatif olarak, bir görsel seçip **Boyama PDF Oluştur** yapın

## 🔍 Sorun Giderme

### Hata: "Supabase env missing"
- `.env` dosyasındaki `SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE` değerlerini kontrol edin

### Hata: "OpenAI API error"
- `OPENAI_API_KEY` değerini kontrol edin
- OpenAI hesabınızda kredi olduğundan emin olun

### Hata: "Storage bucket not found"
- Supabase'te `masalbak` adında public bucket oluşturduğunuzdan emin olun

### PDF oluşturulamıyor
- Puppeteer için gerekli sistem bağımlılıkları eksik olabilir
- Linux'ta: `apt-get install -y chromium-browser`
- macOS'ta: Otomatik olarak gelir

### Görseller yüklenmiyor
- Supabase Storage bucket'ın **public** olduğundan emin olun
- Storage policies'lerini kontrol edin

## 📊 Veritabanı Yapısı

### `storybooks` Tablosu
- `id`: UUID (Primary Key)
- `user_id`: TEXT (Kullanıcı ID'si, nullable)
- `title`: TEXT (Masal başlığı)
- `pages`: JSONB (Sayfa içerikleri array)
- `pdf_url`: TEXT (PDF linki, nullable)
- `voice_urls`: JSONB (TTS ses dosyaları array, nullable)
- `created_at`: TIMESTAMPTZ (Oluşturulma zamanı)

### `colorings` Tablosu
- `id`: UUID (Primary Key)
- `user_id`: TEXT (Kullanıcı ID'si, nullable)
- `title`: TEXT (Boyama başlığı)
- `pdf_url`: TEXT (PDF linki)
- `page_count`: INT (Sayfa sayısı)
- `created_at`: TIMESTAMPTZ (Oluşturulma zamanı)

## 🎯 API Endpoints (tRPC)

### `studio.createStorybook`
Çocuk masalı oluşturur (AI görseller + PDF + TTS)

**Input:**
```typescript
{
  title: string;
  pages: { text: string; prompt?: string }[];
  lang?: "tr" | "en";
  makePdf?: boolean;
  makeTts?: boolean;
  user_id?: string | null;
}
```

### `studio.generateColoringPDF`
Çizimden boyama PDF'i oluşturur

**Input:**
```typescript
{
  title: string;
  pages: string[]; // data:image base64 URIs
  size?: "A4" | "A3";
  user_id?: string | null;
}
```

### `studio.listStorybooks`
Oluşturulan masalları listeler

**Input:**
```typescript
{
  user_id?: string | null;
}
```

### `studio.listColorings`
Oluşturulan boyama PDF'lerini listeler

**Input:**
```typescript
{
  user_id?: string | null;
}
```

## 💡 Öneriler

1. **Production'da:**
   - `EXPO_PUBLIC_API`'yi gerçek domain'e güncelleyin
   - Supabase RLS politikalarını kullanıcı kimlik doğrulamasına göre sıkılaştırın
   - Rate limiting ekleyin (OpenAI API maliyetleri için)

2. **Güvenlik:**
   - `.env` dosyasını asla commit etmeyin
   - `SUPABASE_SERVICE_ROLE` anahtarını sadece backend'de kullanın
   - Frontend'de `SUPABASE_ANON_KEY` kullanın

3. **Maliyet Optimizasyonu:**
   - DALL-E 3 çağrıları pahalıdır (~$0.04/görsel)
   - TTS çağrıları daha ucuzdur (~$0.015/1K karakter)
   - Cache stratejisi düşünün

## ✅ Kontrol Listesi

- [ ] Supabase projesi oluşturuldu
- [ ] Database schema (`schema.sql`) çalıştırıldı
- [ ] Storage bucket (`masalbak`) oluşturuldu ve public yapıldı
- [ ] OpenAI API key alındı
- [ ] Supabase API keys kopyalandı
- [ ] `.env` dosyası güncellendi
- [ ] Uygulama başlatıldı (`bun start`)
- [ ] Studio'da test yapıldı

## 🎉 Başarılı!

Artık MasalBak Studio'yu kullanabilirsiniz:
- ✨ AI destekli masal kitapları oluşturun
- 🎨 Çizimlerden boyama PDF'leri yapın
- 📚 Geçmiş çalışmalarınızı görüntüleyin
- 📤 Oluşturduğunuz içerikleri paylaşın
