# Renkioo - Supabase Setup Rehberi

## 📋 Gerekli Adımlar

### 1. Supabase Projesi Oluşturma
1. [Supabase Dashboard](https://app.supabase.com) adresine gidin
2. "New Project" butonuna tıklayın
3. Proje adını "masalbak" olarak girin
4. Database şifresini kaydedin
5. Region seçin (Europe/Frankfurt önerilir)

### 2. Storage Bucket Oluşturma
1. Supabase Dashboard'da "Storage" sekmesine gidin
2. "Create a new bucket" butonuna tıklayın
3. Bucket adını **masalbak** olarak girin
4. "Public bucket" seçeneğini işaretleyin
5. "Create bucket" butonuna tıklayın

### 3. Database Schema Oluşturma
1. Supabase Dashboard'da "SQL Editor" sekmesine gidin
2. "New query" butonuna tıklayın
3. Root dizinindeki `schema.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'e yapıştırın
5. "Run" butonuna tıklayın

### 4. API Keys Alma
1. Supabase Dashboard'da "Settings" > "API" sekmesine gidin
2. Şu bilgileri kopyalayın:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon/public key**: `eyJ...` (kısa key)
   - **service_role key**: `eyJ...` (uzun key, GİZLİ!)

### 5. Environment Variables Ayarlama
Root dizinindeki `.env` dosyasını açın ve şu değerleri doldurun:

```env
# OpenAI API Key (https://platform.openai.com/api-keys adresinden alın)
OPENAI_API_KEY=sk-your-actual-key-here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your-anon-key-here
SUPABASE_SERVICE_ROLE=eyJhbGc...your-service-role-key-here
SUPABASE_BUCKET=masalbak

# API URL (mobil app için)
EXPO_PUBLIC_API=http://localhost:4000
```

### 6. Database Yapısı

#### `storybooks` Tablosu
| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | Primary key |
| user_id | TEXT | Kullanıcı ID (nullable) |
| title | TEXT | Masal başlığı |
| pages | JSONB | Sayfa içerikleri |
| pdf_url | TEXT | PDF dosya linki |
| voice_urls | JSONB | Ses dosya linkleri |
| created_at | TIMESTAMPTZ | Oluşturulma zamanı |

#### `colorings` Tablosu
| Sütun | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | Primary key |
| user_id | TEXT | Kullanıcı ID (nullable) |
| title | TEXT | Boyama sayfası başlığı |
| pdf_url | TEXT | PDF dosya linki |
| page_count | INT | Sayfa sayısı |
| created_at | TIMESTAMPTZ | Oluşturulma zamanı |

### 7. Storage Klasör Yapısı
Supabase Storage'da `masalbak` bucket'ında şu klasörler otomatik oluşturulacak:
- `images/` - Üretilen görseller ve line-art dosyaları
- `pdf/` - Masal ve boyama PDF'leri
- `audio/` - TTS ses dosyaları

### 8. OpenAI API Key Alma
1. [OpenAI Platform](https://platform.openai.com/api-keys) adresine gidin
2. "Create new secret key" butonuna tıklayın
3. Key'i kopyalayın ve `.env` dosyasına yapıştırın
4. **ÖNEMLİ**: Bu key'i asla paylaşmayın veya git'e commit etmeyin!

## 🚀 Çalıştırma

Tüm adımları tamamladıktan sonra:

```bash
# Paketleri yükleyin
bun install

# Backend'i başlatın
bun start
```

## ✅ Test Etme

Backend başladıktan sonra:
1. Mobil uygulamayı açın
2. "Stüdyo" sekmesine gidin
3. "Masal Kitabı Oluştur" butonuna tıklayın
4. İşlem tamamlandığında PDF linkini görmelisiniz

## 🔒 Güvenlik Notları
- `SUPABASE_SERVICE_ROLE` key'i asla client-side kodda kullanmayın
- `.env` dosyası `.gitignore` içinde olmalı
- Production ortamında environment variables'ı güvenli bir şekilde saklayın

## 🐛 Sorun Giderme

### "Supabase env missing" hatası
- `.env` dosyasının root dizinde olduğundan emin olun
- Tüm gerekli değerlerin doldurulduğunu kontrol edin

### "Bucket does not exist" hatası
- Supabase Storage'da `masalbak` bucket'ının oluşturulduğundan emin olun
- Bucket'ın public olarak işaretlendiğini kontrol edin

### "Table does not exist" hatası
- `schema.sql` dosyasının Supabase SQL Editor'de çalıştırıldığından emin olun
- SQL Editor'de hataları kontrol edin

### OpenAI API hatası
- API key'in doğru olduğundan emin olun
- OpenAI hesabınızda kredi olduğunu kontrol edin
