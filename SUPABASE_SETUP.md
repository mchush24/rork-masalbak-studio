# MasalBak • Supabase Kurulum Rehberi

## 📦 Genel Bakış
Bu uygulama, çocukların çizimlerini analiz eden ve masal kitapları/boyama sayfaları oluşturan bir platformdur. Supabase ile kalıcı veri depolama ve dosya yönetimi sağlanır.

## 🚀 1. Supabase Proje Kurulumu

### a) Hesap Oluşturma
1. [https://supabase.com](https://supabase.com) adresine gidin
2. "Start your project" butonuna tıklayın
3. GitHub hesabınızla giriş yapın
4. "New Project" ile yeni proje oluşturun
5. Proje adı: `masalbak` (veya istediğiniz bir isim)
6. Veritabanı şifresi belirleyin (güvenli tutun!)
7. Region: En yakın bölgeyi seçin (örn: Frankfurt)

### b) API Bilgilerini Alma
1. Supabase Dashboard'da Settings > API sekmesine gidin
2. Şu bilgileri kopyalayın:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhb...` (genel kullanım için)
   - **service_role key**: `eyJhb...` (server tarafı için - GİZLİ!)

## 💾 2. Storage Bucket Oluşturma

1. Supabase Dashboard'da **Storage** sekmesine gidin
2. **"New Bucket"** butonuna tıklayın
3. Bucket ayarları:
   - **Name**: `masalbak`
   - **Public bucket**: ✅ (İşaretli olsun)
   - **File size limit**: 50 MB
   - **Allowed MIME types**: Boş bırakın (tüm tiplere izin ver)
4. **"Create Bucket"** ile oluşturun

### Klasör Yapısı (Otomatik oluşacak)
```
masalbak/
├── images/      # Görseller (story, line-art)
├── pdf/         # PDF dosyaları
└── audio/       # TTS ses dosyaları
```

## 🗃️ 3. Veritabanı Şeması Oluşturma

1. Supabase Dashboard'da **SQL Editor** sekmesine gidin
2. **"New Query"** butonuna tıklayın
3. `schema.sql` dosyasının içeriğini kopyalayıp yapıştırın
4. **"Run"** butonuna basın

### Oluşturulan Tablolar
- **storybooks**: Masal kitabı kayıtları
- **colorings**: Boyama PDF kayıtları

## 🔐 4. Ortam Değişkenleri (ENV)

Backend için `.env` dosyası oluşturun:

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGc...  # service_role key buraya
SUPABASE_BUCKET=masalbak

# OpenAI (DALL-E 3 + TTS)
OPENAI_API_KEY=sk-...

# Server Port
PORT=4000

# Expo API URL (mobil app için)
EXPO_PUBLIC_API=http://192.168.1.100:4000  # Yerel IP'nizi yazın
```

### OpenAI API Key Alma
1. [https://platform.openai.com](https://platform.openai.com) adresine gidin
2. API Keys sekmesinden yeni key oluşturun
3. Billing ayarlarından kredi ekleyin ($5-$10 başlangıç için yeterli)

## 📱 5. Expo Config (Mobile)

`app.json` dosyasını güncelleyin:

```json
{
  "expo": {
    "extra": {
      "api": "http://192.168.1.100:4000"
    }
  }
}
```

**Not**: `192.168.1.100` yerine kendi yerel IP'nizi yazın. Bulma:
- Mac/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig` (Wireless LAN adapter altındaki IPv4)

## 🎨 6. Paket Kurulumu ve Çalıştırma

```bash
# Paketleri kur
bun install

# Backend'i çalıştır
bun dev

# Başka bir terminalde mobil uygulamayı çalıştır
cd .. && bun start
```

## 🔧 7. Test Etme

### Backend Test
```bash
curl http://localhost:4000/api/trpc/example.hi
```

Başarılıysa: `{"result":{"data":"Hello from tRPC!"}}`

### Storybook Test (Postman/Thunder Client)
```
POST http://localhost:4000/api/trpc/studio.createStorybook

Body (JSON):
{
  "title": "Test Masal",
  "pages": [
    { "text": "Bir varmış bir yokmuş..." },
    { "text": "Küçük kuş uçuyordu." },
    { "text": "Güneş battı, masal bitti." }
  ],
  "makePdf": true,
  "makeTts": true
}
```

## 📊 8. Supabase Dashboard'da Kontrol

### Storage'i Kontrol
1. Storage > masalbak bucket'ını açın
2. `images/`, `pdf/`, `audio/` klasörlerinde dosyalar görmelisiniz

### Veritabanını Kontrol
1. Table Editor > `storybooks` tablosunu açın
2. Kayıtları göreceksiniz

## 🎯 tRPC Endpoints

Mobile app şu endpoint'leri kullanır:

- `studio.createStorybook` - Masal kitabı oluştur (AI görsel + PDF + TTS)
- `studio.generateColoringPDF` - Boyama PDF oluştur (line-art dönüşümü)
- `studio.listStorybooks` - Kullanıcının masal geçmişi
- `studio.listColorings` - Kullanıcının boyama geçmişi

## 🐛 Sorun Giderme

### Supabase Bağlantı Hatası
```
Error: Supabase env missing
```
**Çözüm**: `.env` dosyasında `SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE` değişkenlerini kontrol edin.

### OpenAI API Hatası
```
Error: Incorrect API key provided
```
**Çözüm**: OpenAI API key'inizi kontrol edin. [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Puppeteer Hatası (PDF)
```
Error: Failed to launch chrome
```
**Çözüm**: 
```bash
# Chrome bağımlılıklarını kur (Linux)
sudo apt-get install -y libgbm1 libnss3 libxss1 libasound2

# macOS
brew install chromium
```

### Sharp Hatası (Line-art)
```
Error: Something went wrong installing the "sharp" module
```
**Çözüm**:
```bash
rm -rf node_modules
bun install
```

## 🎉 Başarılı Kurulum!

Artık uygulamanız:
- ✅ Masal kitapları oluşturabilir (DALL-E 3 görseller)
- ✅ PDF'ler üretebilir (Puppeteer)
- ✅ TTS ses dosyaları ekleyebilir (OpenAI TTS)
- ✅ Boyama sayfaları oluşturabilir (Sharp line-art)
- ✅ Tüm verileri Supabase'de saklayabilir

## 📞 Destek

Sorun yaşarsanız:
1. Supabase Dashboard > Logs sekmesini kontrol edin
2. Backend logs: `console.log` çıktılarına bakın
3. Mobile logs: Expo DevTools'da Console sekmesini açın
