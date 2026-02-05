# Renkioo - Geliştirici Rehberi

Bu rehber, Renkioo projesine katkıda bulunmak isteyen geliştiriciler için hazırlanmıştır.

## 📋 İçindekiler

- [Gereksinimler](#gereksinimler)
- [Kurulum](#kurulum)
- [Proje Yapısı](#proje-yapısı)
- [Geliştirme Akışı](#geliştirme-akışı)
- [Kod Standartları](#kod-standartları)
- [Test Yazma](#test-yazma)
- [API Geliştirme](#api-geliştirme)
- [Component Geliştirme](#component-geliştirme)
- [Deployment](#deployment)

---

## Gereksinimler

### Sistem Gereksinimleri

- **Node.js:** ≥ 22.0.0
- **npm:** ≥ 10.0.0
- **Xcode:** 15+ (iOS geliştirme için)
- **Android Studio:** Hedgehog+ (Android geliştirme için)
- **Git:** ≥ 2.40

### Önerilen Araçlar

- **VS Code** veya **Cursor** - TypeScript ve React Native için optimize edilmiş
- **React Native Debugger** - Debugging için
- **Expo Go** - Hızlı test için mobil uygulama

---

## Kurulum

### 1. Repository'yi Klonla

```bash
git clone https://github.com/renkioo/renkioo.git
cd renkioo
```

### 2. Bağımlılıkları Yükle

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarla

```bash
cp .env.example .env
```

`.env` dosyasını düzenle:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# API
EXPO_PUBLIC_API=http://localhost:3000

# OpenAI (Backend)
OPENAI_API_KEY=your_openai_key

# Sentry (Optional)
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### 4. Backend'i Başlat

```bash
npm run backend
```

### 5. Expo'yu Başlat

```bash
npm start
```

### 6. Platformda Çalıştır

- **iOS Simulator:** `i` tuşuna bas
- **Android Emulator:** `a` tuşuna bas
- **Web:** `w` tuşuna bas
- **Expo Go:** QR kodu tara

---

## Proje Yapısı

```
renkioo/
├── app/                    # Expo Router sayfaları
│   ├── (onboarding)/       # Onboarding akışı
│   ├── (tabs)/             # Tab navigation sayfaları
│   └── _layout.tsx         # Root layout
├── backend/                # Hono + tRPC backend
│   ├── trpc/               # tRPC router ve procedures
│   ├── middleware/         # Rate limiting, auth
│   └── docs/               # API documentation
├── components/             # React Native componentleri
│   ├── __tests__/          # Component testleri
│   ├── __stories__/        # Storybook stories
│   └── ui/                 # Base UI componentleri
├── lib/                    # Utility libraries
│   ├── accessibility/      # Erişilebilirlik utilities
│   ├── animations/         # Animation hooks
│   ├── layout/             # Responsive layout
│   ├── performance/        # Performance optimization
│   ├── query/              # React Query config
│   ├── typography/         # Typography system
│   └── validation/         # Zod schemas
├── constants/              # Sabitler
│   ├── colors.ts           # Renk paleti
│   └── design-system.ts    # Design tokens
├── scripts/                # Build & utility scripts
└── e2e/                    # Detox E2E testleri
```

---

## Geliştirme Akışı

### Branch Stratejisi

- `main` - Production-ready kod
- `develop` - Development branch
- `feature/*` - Yeni özellikler
- `fix/*` - Bug fix'ler
- `docs/*` - Dokümantasyon

### Pull Request Süreci

1. `develop` branch'inden yeni branch oluştur:
   ```bash
   git checkout -b feature/my-feature develop
   ```

2. Değişikliklerini yap ve commit et:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Pre-commit hooks otomatik çalışacak (lint + format)

4. PR oluştur ve review bekle

### Commit Mesaj Formatı

[Conventional Commits](https://www.conventionalcommits.org/) kullan:

```
type(scope): description

feat:     Yeni özellik
fix:      Bug fix
docs:     Dokümantasyon
style:    Kod formatı
refactor: Refactoring
test:     Test ekleme/güncelleme
chore:    Build/config değişiklikleri
```

Örnekler:
```bash
git commit -m "feat(auth): add password reset flow"
git commit -m "fix(analysis): handle empty image error"
git commit -m "docs: update API documentation"
```

---

## Kod Standartları

### TypeScript

- **Strict mode** aktif
- `any` kullanma - proper typing kullan
- Interface'leri component props için kullan

```typescript
// ✅ Doğru
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

// ❌ Yanlış
const Button = (props: any) => { ... }
```

### React Native

- **Functional components** kullan
- **Hooks** kullan (class components değil)
- **Memoization** için `useMemo` ve `useCallback`

```typescript
// ✅ Doğru
const MyComponent = memo(function MyComponent({ data }: Props) {
  const processedData = useMemo(() => expensiveOperation(data), [data]);
  const handlePress = useCallback(() => { ... }, []);

  return <View>...</View>;
});
```

### Stil Yazımı

- **StyleSheet.create** kullan
- Inline style'lardan kaçın
- Design tokens kullan

```typescript
// ✅ Doğru
const styles = StyleSheet.create({
  container: {
    padding: spacing['4'],
    backgroundColor: Colors.background.primary,
    borderRadius: radius.lg,
  },
});

// ❌ Yanlış
<View style={{ padding: 16, backgroundColor: '#fff' }}>
```

### Import Sıralaması

```typescript
// 1. React & React Native
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Third-party libraries
import Animated from 'react-native-reanimated';

// 3. Internal modules (absolute paths)
import { Colors } from '@/constants/colors';
import { useAuth } from '@/lib/auth';

// 4. Relative imports
import { Button } from '../Button';
```

---

## Test Yazma

### Unit Tests

```bash
# Tüm testleri çalıştır
npm test

# Watch mode
npm run test:watch

# Coverage raporu
npm run test:coverage
```

### Component Test Örneği

```typescript
// components/__tests__/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button title="Test" onPress={() => {}} />
    );
    expect(getByText('Test')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Test" onPress={onPress} />
    );
    fireEvent.press(getByText('Test'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### E2E Tests (Detox)

```bash
# Build (ilk seferde)
npm run e2e:build:ios

# Test çalıştır
npm run e2e:test:ios
```

---

## API Geliştirme

### tRPC Route Ekleme

```typescript
// backend/trpc/routes/example.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const exampleRouter = router({
  // Public endpoint
  getItems: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      return { items: [] };
    }),

  // Protected endpoint (requires auth)
  createItem: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      return { success: true };
    }),
});
```

### Route'u App Router'a Ekle

```typescript
// backend/trpc/app-router.ts
import { exampleRouter } from './routes/example';

export const appRouter = router({
  // ...existing routes
  example: exampleRouter,
});
```

---

## Component Geliştirme

### Yeni Component Oluşturma

1. Component dosyasını oluştur:

```typescript
// components/MyComponent.tsx
import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface MyComponentProps {
  title: string;
  style?: ViewStyle;
}

export const MyComponent = memo(function MyComponent({
  title,
  style,
}: MyComponentProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.background.primary,
  },
  title: {
    fontSize: 16,
    color: Colors.neutral.dark,
  },
});
```

2. Test dosyasını oluştur:

```typescript
// components/__tests__/MyComponent.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders title correctly', () => {
    const { getByText } = render(<MyComponent title="Hello" />);
    expect(getByText('Hello')).toBeTruthy();
  });
});
```

3. Story dosyasını oluştur:

```typescript
// components/__stories__/MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from '../MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/MyComponent',
  component: MyComponent,
};

export default meta;

export const Default: StoryObj<typeof MyComponent> = {
  args: {
    title: 'Example Title',
  },
};
```

---

## Deployment

### Staging

```bash
# EAS Build
eas build --profile preview --platform all
```

### Production

```bash
# EAS Build
eas build --profile production --platform all

# EAS Submit
eas submit --platform ios
eas submit --platform android
```

---

## Yardımcı Komutlar

```bash
# Lint kontrolü
npm run lint

# Lint düzeltme
npm run lint:fix

# Type kontrolü
npm run typecheck

# Format kontrolü
npm run format:check

# Format düzeltme
npm run format

# Bundle analizi
npm run analyze:bundle

# Image optimizasyonu
npm run optimize:images
```

---

## Sorun Giderme

### Metro Bundler Sorunları

```bash
# Cache temizle
npx expo start --clear
```

### iOS Build Sorunları

```bash
cd ios
pod install --repo-update
cd ..
```

### Android Build Sorunları

```bash
cd android
./gradlew clean
cd ..
```

---

## Destek

- **GitHub Issues:** Bug raporları ve özellik istekleri
- **Discord:** Topluluk tartışmaları
- **Email:** dev@renkioo.com

---

Katkılarınız için teşekkürler! 🎨
