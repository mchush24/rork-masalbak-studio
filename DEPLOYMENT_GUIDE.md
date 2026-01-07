# 🚀 Localhost'tan Çıkma Rehberi - Masalbak Studio

Backend'in zaten Railway'de! Şimdi mobil uygulamayı gerçek cihazlarda çalıştırmanın 3 yolu var.

---

## 📱 SEÇENEK 1: AYNI WiFi'DE TEST (EN KOLAY - 5 DK)

Bu yöntem geliştirme için en hızlısı. Bilgisayarınla telefonun aynı WiFi'de olması yeterli.

### Adımlar:

1. **Backend'i çalıştır** (zaten Railway'de çalışıyor ama lokal test için):
```bash
npm run backend
```

2. **Bilgisayarın IP adresini öğren**:
```bash
# macOS/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows:
ipconfig
```
Örnek çıktı: `192.168.1.100`

3. **.env dosyasını güncelle** (sadece lokal test için):
```bash
# Geçici olarak değiştir:
EXPO_PUBLIC_API=http://192.168.1.100:3000
EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.1.100:3000
```

4. **Expo uygulamasını başlat**:
```bash
npm start
```

5. **QR kodu tara**:
   - iOS: Kamera uygulamasıyla QR'ı tara
   - Android: Expo Go uygulamasıyla QR'ı tara

**✅ Avantajlar:**
- Hızlı test
- Hot reload çalışır
- Debug kolay

**❌ Dezavantajlar:**
- Aynı WiFi'de olmalı
- Backend lokal ise bilgisayar açık olmalı
- Production değil, development mode

---

## 📦 SEÇENEK 2: DEVELOPMENT BUILD (ORTA SEVİYE - 30 DK)

Expo Go sınırlamalarını aşmak için native kod içeren bir build.

### Kurulum:

1. **EAS CLI kur**:
```bash
npm install -g eas-cli
```

2. **Expo hesabına giriş yap**:
```bash
eas login
```

3. **EAS projesini başlat**:
```bash
eas build:configure
```

4. **Development build oluştur**:

**iOS için** (macOS gerekli):
```bash
eas build --profile development --platform ios
```

**Android için**:
```bash
eas build --profile development --platform android
```

5. **Build tamamlanınca** (15-30 dk):
   - iOS: TestFlight'a yüklenecek (Apple Developer hesabı gerekli - $99/yıl)
   - Android: APK indir ve telefona yükle

6. **Expo Dev Client ile çalıştır**:
```bash
npm start --dev-client
```

**✅ Avantajlar:**
- Native modüller kullanılabilir
- WiFi'ye bağımlı değil
- Hot reload hala çalışır

**❌ Dezavantajlar:**
- İlk kurulum uzun
- iOS için Apple Developer hesabı gerekli
- Hala development mode

---

## 🏭 SEÇENEK 3: PRODUCTION BUILD (TAM ÇÖZÜM - 1-2 SAAT)

App Store ve Google Play Store'a yüklemek için.

### A. eas.json Oluştur:

```bash
eas build:configure
```

Otomatik oluşacak, ama manuel de ekleyebilirsin:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### B. app.config.js Güncelle:

```javascript
export default {
  expo: {
    name: "Masalbak Studio",
    slug: "masalbak-studio",
    version: "1.0.0",

    // Production için önemli:
    extra: {
      eas: {
        projectId: "YOUR_PROJECT_ID" // eas build:configure ile gelecek
      }
    },

    // iOS
    ios: {
      bundleIdentifier: "com.masalbak.studio",
      buildNumber: "1",
      supportsTablet: true
    },

    // Android
    android: {
      package: "com.masalbak.studio",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      }
    }
  }
};
```

### C. Production Build Oluştur:

**iOS için**:
```bash
eas build --profile production --platform ios
```

**Android için**:
```bash
eas build --profile production --platform android
```

### D. Store'lara Yükle:

**iOS - App Store:**
```bash
# TestFlight'a yükle:
eas submit --platform ios

# Veya manuel:
# 1. App Store Connect'e git
# 2. Yeni uygulama oluştur
# 3. Build'i yükle
# 4. Review için gönder
```

**Android - Google Play:**
```bash
# Play Console'a yükle:
eas submit --platform android

# Veya manuel:
# 1. Google Play Console'a git
# 2. Yeni uygulama oluştur
# 3. AAB dosyasını yükle
# 4. Review için gönder
```

---

## 🔧 ENVİRONMENT VARIABLES

Production'da environment variables'ı EAS Secrets ile yönet:

```bash
# Secret ekle:
eas secret:create --scope project --name EXPO_PUBLIC_API --value https://rork-masalbak-studio-production.up.railway.app

eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value YOUR_SUPABASE_URL

eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_ANON_KEY

# Secrets listele:
eas secret:list
```

---

## 🎯 ÖNERİLEN AKIŞ

### Geliştirme Sırasında:
1. **Lokal test**: `npm start` + Expo Go (Seçenek 1)
2. **Native test**: Development build (Seçenek 2)

### Production'a Alırken:
1. **Preview build**: Test için APK oluştur
   ```bash
   eas build --profile preview --platform android
   ```

2. **Production build**: Store'lara yükle
   ```bash
   eas build --profile production --platform all
   ```

---

## 📋 CHECKLIST - PRODUCTION ÖNCESI

- [ ] `.env` dosyasındaki tüm secretlar EAS Secrets'a taşındı mı?
- [ ] `app.config.js` içinde `bundleIdentifier` ve `package` unique mi?
- [ ] Icon ve splash screen hazır mı? (1024x1024 icon, 2048x2048 splash)
- [ ] App Store / Play Store'da uygulama sayfası oluşturuldu mu?
- [ ] Privacy policy ve terms of service hazır mı?
- [ ] Backend production'da çalışıyor mu? ✅ (Railway'de çalışıyor)
- [ ] Test kullanıcılarıyla production build test edildi mi?

---

## 🆘 SORUN GİDERME

### "EAS CLI not found"
```bash
npm install -g eas-cli
```

### "No development build installed"
Development build oluşturman gerekiyor (Seçenek 2)

### "Build failed"
1. `eas build:configure` komutuyla tekrar başlat
2. Log'ları incele: `eas build:list`
3. Native dependencies kurulu mu kontrol et

### "Environment variables undefined"
Production'da `.env` dosyası çalışmaz, EAS Secrets kullan:
```bash
eas secret:create --scope project --name VAR_NAME --value VAR_VALUE
```

---

## 💰 MALİYETLER

**Expo EAS:**
- Free tier: 30 build/month (yeterli)
- Production tier: $29/month (sınırsız build)

**Apple Developer:**
- $99/yıl (iOS için zorunlu)

**Google Play:**
- $25 (bir kerelik)

---

## 🚀 HIZLI BAŞLANGIÇ

En hızlı yol:

```bash
# 1. Android APK oluştur (ücretsiz):
npm install -g eas-cli
eas login
eas build:configure
eas build --profile preview --platform android

# 2. 15 dk bekle, APK'yı indir

# 3. Telefona yükle ve test et!
```

---

## 📚 KAYNAKLAR

- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
- [EAS Pricing](https://expo.dev/pricing)
