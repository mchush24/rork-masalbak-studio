# Renkioo - Çocuklar için Yaratıcı Masal Uygulaması

## Proje Bilgileri

**Platform**: iOS, Android ve Web
**Framework**: Expo Router + React Native
**Backend**: Hono + tRPC (Railway'de deploy)
**Database**: Supabase

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

## Kullanılabilir Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm start` | Expo geliştirme sunucusunu başlat |
| `npm run start:tunnel` | Tunnel modu ile başlat |
| `npm run start:web` | Web modunda başlat |
| `npm run web` | Web preview |
| `npm run backend` | Backend sunucusunu başlat |
| `npm run backend:watch` | Backend'i watch modunda başlat |
| `npm run ios` | iOS simulator'da çalıştır |
| `npm run android` | Android emulator'da çalıştır |

## Teknoloji Stack'i

- **React Native** - Cross-platform mobil geliştirme
- **Expo** - React Native platformu
- **Expo Router** - Dosya tabanlı routing
- **TypeScript** - Tip güvenliği
- **tRPC** - End-to-end type-safe API
- **React Query** - Server state yönetimi
- **Supabase** - Database ve authentication
- **Hono** - Hızlı backend framework
- **NativeWind** - Tailwind CSS for React Native

## Proje Yapısı

```
├── app/                    # Uygulama ekranları (Expo Router)
│   ├── (tabs)/            # Tab navigasyon ekranları
│   └── _layout.tsx        # Root layout
├── backend/               # Backend API (Hono + tRPC)
│   ├── routers/          # tRPC router'ları
│   └── server.ts         # Ana sunucu dosyası
├── components/            # React Native bileşenleri
├── lib/                   # Yardımcı kütüphaneler
├── stores/               # Zustand state store'ları
├── constants/            # Sabit değerler
├── assets/               # Statik dosyalar (resimler, fontlar)
└── types/                # TypeScript tip tanımları
```

## Test

```bash
# Telefonunuzda test etmek için
# 1. Expo Go uygulamasını indirin (iOS/Android)
# 2. npm start komutunu çalıştırın
# 3. QR kodu tarayın

# Web'de test
npm run web

# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

## Deploy

### Backend (Railway)

Backend zaten Railway'de deploy edilmiş durumda:
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
