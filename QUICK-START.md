# 🚀 Renkioo - Hızlı Başlangıç

## Ne Yapacağız?

Çocuk çizimlerinden **AI destekli masal kitapları** ve **boyama PDF'leri** oluşturacağız.

## 3 Adımda Kurulum

### 1️⃣ Supabase Setup (5 dakika)

**Database:**
```bash
# 1. https://app.supabase.com > SQL Editor
# 2. schema.sql dosyasını kopyala-yapıştır
# 3. RUN butonuna tıkla
```

**Storage:**
```bash
# 1. Storage > Create bucket
# 2. Name: masalbak
# 3. Public: ✅ Aktif
# 4. Create
```

**API Keys:**
```bash
# Project Settings > API
# Kopyala: URL, anon key, service_role key
```

### 2️⃣ ENV Dosyasını Güncelle (2 dakika)

`.env` dosyasını aç ve değiştir:

```env
OPENAI_API_KEY=sk-proj-gerçek_key_buraya
SUPABASE_URL=https://gerçek_url_buraya.supabase.co
SUPABASE_ANON_KEY=gerçek_anon_key_buraya
SUPABASE_SERVICE_ROLE=gerçek_service_role_buraya
```

### 3️⃣ Başlat (1 dakika)

```bash
bun install
bun start
```

## ✨ Kullanım

1. **Studio** sekmesine git
2. **Masal Kitabı Oluştur** veya **Boyama PDF Oluştur** seç
3. Bekle ve paylaş!

## 🎯 Özellikler

- ✅ **AI Masal Kitabı**: DALL-E 3 görselleri + PDF + TTS seslendirme
- ✅ **Boyama PDF**: Çizimden otomatik line-art dönüşümü
- ✅ **Supabase Kayıt**: Tüm içerikler veritabanında
- ✅ **Paylaşım**: Direkt link paylaşımı

## 💰 Maliyetler (OpenAI)

- DALL-E 3: ~$0.04/görsel
- TTS: ~$0.015/1K karakter
- **Örnek masal (5 sayfa + ses)**: ~$0.25

## 🆘 Sorun mu var?

Detaylı kurulum: `SETUP-INSTRUCTIONS.md`

---

**Not:** İlk çalıştırmada Puppeteer Chrome'u indirecek (~150MB). Biraz zaman alabilir.
