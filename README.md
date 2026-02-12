# Renkioo

**Çocuğunuzun iç dünyasını birlikte keşfedelim.**

Renkioo, ebeveynlerin, öğretmenlerin ve çocuk uzmanlarının çocukların duygusal dünyasını çizimler, hikayeler ve yaratıcı araçlarla keşfetmesini sağlayan AI destekli gelişim platformudur.

## Ne Yapabilirsiniz?

- **AI Çizim Analizi** - Çocuğunuzun çizimlerindeki duygusal ipuçlarını keşfedin
- **İnteraktif Hikayeler** - Karar süreçlerini gözlemleyin
- **Dijital Boyama Stüdyosu** - Yaratıcılığı destekleyin
- **Gelişim Takibi** - Haftalık ve aylık raporlarla ilerlemeyi görün

## Platform & Stack

| Katman            | Teknoloji                                   |
| ----------------- | ------------------------------------------- |
| **Mobil & Web**   | Expo 54, React Native 0.81, React 19        |
| **Routing**       | Expo Router (dosya tabanlı)                 |
| **Backend**       | Hono + tRPC (Railway)                       |
| **Veritabanı**    | Supabase (PostgreSQL + Auth)                |
| **AI**            | OpenAI (çizim analizi, hikaye üretimi, TTS) |
| **Tip Güvenliği** | TypeScript, end-to-end tRPC                 |

**Platformlar:** iOS, Android, Web

## Kurulum

### Gereksinimler

- Node.js >= 22.0.0
- npm veya bun

### Adımlar

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. .env dosyasını oluştur (.env.example'dan kopyala)
cp .env.example .env

# 3. Geliştirme sunucusunu başlat
npm start

# Web için
npm run web

# Tunnel modu (farklı ağdan test için)
npm run start:tunnel
```

## Komutlar

| Komut                   | Açıklama                          |
| ----------------------- | --------------------------------- |
| `npm start`             | Expo geliştirme sunucusunu başlat |
| `npm run start:tunnel`  | Tunnel modu ile başlat            |
| `npm run start:web`     | Web modunda başlat                |
| `npm run web`           | Web preview                       |
| `npm run backend`       | Backend sunucusunu başlat         |
| `npm run backend:watch` | Backend'i watch modunda başlat    |
| `npm run ios`           | iOS simulator'da çalıştır         |
| `npm run android`       | Android emulator'da çalıştır      |

## Proje Yapısı

```
├── app/                    # Ekranlar (Expo Router)
│   ├── (onboarding)/      # Onboarding akışı (welcome, value-prop, register)
│   ├── (tabs)/            # Ana tab navigasyonu (5 tab + gizli ekranlar)
│   ├── analysis/          # Analiz detay ekranları
│   └── interactive-story/ # İnteraktif hikaye okuyucu
├── backend/               # Backend API (Hono + tRPC)
│   ├── routers/          # tRPC router'ları
│   ├── lib/              # Cache, monitoring, auth modülleri
│   └── routes/           # REST endpoint'leri
├── components/            # React Native bileşenleri
│   ├── navigation/       # AnimatedTabBar (floating glassmorphism)
│   ├── analysis/         # Analiz akışı bileşenleri
│   ├── coloring/         # Boyama stüdyosu
│   ├── gamification/     # Rozet, XP, streak sistemi
│   └── ui/               # Genel UI bileşenleri
├── constants/            # Renk sistemi, design tokens, protokoller
├── lib/                  # Hook'lar, context'ler, servisler
├── assets/               # Logo, maskot görselleri, fontlar
└── types/                # TypeScript tip tanımları
```

## Marka

Detaylı marka rehberi için: [`BRANDING.md`](./BRANDING.md)

- **Uygulama:** Renkioo (ana marka)
- **Maskot:** Ioo (yardımcı rehber)
- **Hedef Kitle:** Ebeveynler, öğretmenler, çocuk uzmanları
- **Ton:** Sıcak, güven veren, teşvik edici

## Ortam Değişkenleri

`.env` dosyasında gerekli değişkenler:

```env
# Backend
PORT=3000
OPENAI_API_KEY=your_openai_key
FAL_API_KEY=your_fal_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Frontend
EXPO_PUBLIC_API=https://your-backend-url.railway.app
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Deploy

### Backend (Railway)

Backend Railway'de deploy edilmiş durumda:
`https://rork-masalbak-studio-production.up.railway.app`

### Mobil Uygulama (EAS Build)

```bash
# EAS CLI'ı yükle
npm install -g @expo/eas-cli

# iOS için build
eas build --platform ios

# Android için build
eas build --platform android

# Store'a gönder
eas submit --platform ios
eas submit --platform android
```

## Sorun Giderme

### Uygulama yüklenmiyor?

1. Telefon ve bilgisayarın aynı WiFi'da olduğundan emin olun
2. Tunnel modu deneyin: `npm run start:tunnel`
3. Cache'i temizleyin: `npx expo start --clear`

### Build hatası?

1. node_modules'i silin ve tekrar yükleyin:
   ```bash
   rm -rf node_modules
   npm install
   ```
2. Metro cache'i temizleyin:
   ```bash
   npx expo start --clear
   ```

## Lisans

Tescilli yazılım. Tüm hakları saklıdır.
