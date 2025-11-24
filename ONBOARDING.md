# Kullanıcı Karşılama ve Kayıt Sistemi

## Genel Bakış

Masalbak Studio için kullanıcı karşılama (onboarding) ve e-posta tabanlı kayıt sistemi kuruldu.

## Özellikler

### 1. Karşılama Ekranları
- **Welcome Screen**: Uygulamayı tanıtan ana karşılama ekranı
- **Tour Screen**: 4 adımlı uygulamayı tanıtma turu:
  - Çizim Analizi
  - Hikaye Oluşturma
  - Boyama Sayfaları
  - Gelişim Takibi

### 2. Kullanıcı Kaydı
- E-posta tabanlı basit kayıt sistemi
- İsteğe bağlı isim alanı
- Supabase ile kullanıcı verisi saklama
- AsyncStorage ile yerel oturum yönetimi

### 3. Akıllı Yönlendirme
- Yeni kullanıcılar otomatik olarak onboarding'e yönlendirilir
- Kayıtlı kullanıcılar direkt ana uygulamaya gider
- Oturum kalıcılığı (app kapatılıp açılsa bile)

## Kurulum

### 1. Supabase Tablosu Oluşturma

Supabase Dashboard'da SQL Editor'ü açın ve `supabase-setup.sql` dosyasını çalıştırın:

```bash
# SQL dosyasını görmek için:
cat supabase-setup.sql
```

Bu şunları oluşturur:
- `users` tablosu
- E-posta index'i
- Otomatik updated_at trigger'ı
- Row Level Security (RLS) policy'leri

### 2. Environment Variables

`.env` dosyanızda şunların olduğundan emin olun:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your-service-role-key
```

### 3. Backend'i Başlatma

```bash
npm run backend
```

### 4. Frontend'i Başlatma

```bash
npm run dev
```

## Kullanım

### İlk Kullanıcı Akışı

1. Uygulama açılır → **Welcome Screen** gösterilir
2. "Başlayalım" → **Tour Screen** (4 adım)
3. "Kayıt Ol" → **Register Screen**
4. E-posta girişi ve kayıt
5. Otomatik olarak ana uygulamaya yönlendirilir

### Kayıtlı Kullanıcı Akışı

1. Uygulama açılır → Direkt **Ana Uygulama** (Tabs)

## API Endpoints

### `auth.register`
Yeni kullanıcı kaydı veya mevcut kullanıcı girişi.

**Input:**
```typescript
{
  email: string;
  name?: string;
}
```

**Output:**
```typescript
{
  userId: string;
  email: string;
  isNewUser: boolean;
}
```

### `auth.completeOnboarding`
Kullanıcının onboarding'i tamamladığını işaretler.

**Input:**
```typescript
{
  userId: string;
}
```

**Output:**
```typescript
{
  success: boolean;
}
```

## Dosya Yapısı

```
app/
├── (onboarding)/
│   ├── _layout.tsx       # Onboarding navigation
│   ├── welcome.tsx       # Karşılama ekranı
│   ├── tour.tsx          # Tanıtım turu
│   └── register.tsx      # Kayıt formu
├── (tabs)/               # Ana uygulama
└── _layout.tsx           # Root navigation + auth logic

lib/
├── hooks/
│   └── useAuth.ts        # Auth hook (login, logout, session)
├── supabase.ts           # Supabase client
└── trpc.ts               # tRPC client

backend/
└── trpc/
    └── routes/
        └── auth/
            ├── register.ts              # Kayıt endpoint
            └── complete-onboarding.ts   # Onboarding tamamlama
```

## Özelleştirme

### Onboarding Tour Adımlarını Değiştirme

`app/(onboarding)/tour.tsx` dosyasındaki `tourSteps` array'ini düzenleyin:

```typescript
const tourSteps = [
  {
    emoji: '🎨',
    title: 'Başlık',
    description: 'Açıklama metni',
  },
  // ... daha fazla adım
];
```

### Renk Temasını Değiştirme

Tüm onboarding ekranları `LinearGradient` kullanıyor. Renkleri değiştirmek için:

```typescript
<LinearGradient
  colors={['#667eea', '#764ba2', '#f093fb']}  // Buradan değiştir
  className="flex-1"
>
```

## Güvenlik

- ✅ Row Level Security (RLS) aktif
- ✅ E-posta validasyonu
- ✅ Service role sadece backend'de kullanılıyor
- ✅ Client-side oturum AsyncStorage'da güvenli
- ⚠️ Şu anda şifre yok (gelecekte eklenebilir)

## Sonraki Adımlar

1. ✅ Backend Supabase entegrasyonu
2. ✅ Onboarding UI/UX
3. ✅ Kullanıcı kaydı
4. ✅ Oturum yönetimi
5. 🔜 E-posta doğrulama (isteğe bağlı)
6. 🔜 Şifre koruması (isteğe bağlı)
7. 🔜 OAuth sosyal login (Google, Apple)

## Test

Testi sıfırlamak için (yeni kullanıcı gibi davranmak):

```typescript
// useAuth hook'u kullanarak
const { logout } = useAuth();
await logout();

// Veya direkt AsyncStorage'ı temizle
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```
