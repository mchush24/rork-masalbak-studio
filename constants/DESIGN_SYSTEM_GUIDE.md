# Renkioo Design System Guide

Ebeveynler icin profesyonel tasarim sistemi. Headspace/Calm estetiginde, sicak ve guven veren.

## Dosya Yapisi

| Dosya                        | Icerik                                                             |
| ---------------------------- | ------------------------------------------------------------------ |
| `constants/colors.ts`        | Renk paleti (Colors, DarkColors, ProfessionalColors, RenkooColors) |
| `constants/design-system.ts` | Tum tasarim tokenlari (typography, spacing, shadows, vb.)          |
| `lib/hooks/useResponsive.ts` | Responsive hook'lar                                                |

---

## Renkler (`constants/colors.ts`)

### Temel Renk Kullanimi

```tsx
import { Colors } from '@/constants/colors';

// Ana marka renkleri
Colors.primary.sunset; // #FF9B7A - Ana buton ve vurgular
Colors.primary.peach; // #FFB299 - Hover ve acik tonlar
Colors.primary.soft; // #FFF5F2 - Yumusak arka plan

// Ikincil renkler
Colors.secondary.lavender; // #A78BFA - Premium, yaraticilik
Colors.secondary.sky; // #78C8E8 - Bilgi, sakinlik
Colors.secondary.grass; // #7ED99C - Basari, buyume
Colors.secondary.sunshine; // #FFD56B - Dikkat, enerji
Colors.secondary.rose; // #FFB5D8 - Masal, hikaye
Colors.secondary.mint; // #6FEDD6 - Boyama, yaraticilik

// Notr tonlar
Colors.neutral.darkest; // #2D3748 - Ana metin
Colors.neutral.dark; // #4A5568 - Ikincil metin
Colors.neutral.medium; // #718096 - Yardimci metin
Colors.neutral.lighter; // #E2E8F0 - Kenarliklar
Colors.neutral.white; // #FFFFFF

// Semantik renkler
Colors.semantic.success; // #68D89B
Colors.semantic.warning; // #FFB55F
Colors.semantic.error; // #FF8A80
Colors.semantic.info; // #78C8E8

// Arka plan
Colors.background.page; // #FAFBFC - Tum sayfalarda tek arka plan
Colors.background.card; // #FFFFFF - Kart arka plani
```

### Gradient Kullanimi

```tsx
import { Colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

// Sayfa arka plan gradient'i
<LinearGradient colors={Colors.background.pageGradient} />

// Kart gradient'leri
<LinearGradient colors={Colors.cards.story.bg} />
<LinearGradient colors={Colors.cards.analysis.bg} />

// Tema gradient'leri
<LinearGradient colors={Colors.gradients.sunset} />
<LinearGradient colors={Colors.gradients.calm} />
```

### Opaklık Yardımcısı

```tsx
import { withOpacity } from '@/constants/colors';

const semiTransparent = withOpacity(Colors.primary.sunset, 0.5);
// → 'rgba(255, 155, 122, 0.5)'
```

---

## Typography (`constants/design-system.ts`)

```tsx
import { typography } from '@/constants/design-system';

// Boyut tokenlari (hardcoded px KULLANMAYIN!)
typography.size.xs; // 11px - Caption, timestamp
typography.size.sm; // 13px - Label, helper text
typography.size.base; // 15px - Body text
typography.size.md; // 17px - Lead text
typography.size.lg; // 20px - Card title
typography.size.xl; // 24px - Section header
typography.size['2xl']; // 28px - Page subtitle
typography.size['3xl']; // 32px - Page title
typography.size['4xl']; // 40px - Hero

// Agirlik tokenlari (string KULLANMAYIN!)
typography.weight.regular; // '400'
typography.weight.medium; // '500'
typography.weight.semibold; // '600'
typography.weight.bold; // '700'
typography.weight.extrabold; // '800'

// Satir yuksekligi
typography.lineHeight.tight; // 1.2 - Basliklar
typography.lineHeight.normal; // 1.5 - Body text
typography.lineHeightPx.lg; // 30px - lg boyut icin
```

---

## Spacing & Radius

```tsx
import { spacing, radius } from '@/constants/design-system';

// Spacing (8pt grid)
spacing.xs; // 4px
spacing.sm; // 8px
spacing.md; // 16px
spacing.lg; // 24px
spacing.xl; // 32px
spacing.xxl; // 48px

// Numerik spacing
spacing['1']; // 4px
spacing['2']; // 8px
spacing['4']; // 16px
spacing['8']; // 32px

// Border radius
radius.xs; // 4px
radius.sm; // 8px
radius.md; // 12px
radius.lg; // 16px
radius.xl; // 20px
radius['2xl']; // 24px
radius.full; // 9999px (tam yuvarlak)
```

---

## Shadows

```tsx
import { shadows } from '@/constants/design-system';

// Hazir shadow presetleri (web + native otomatik)
shadows.none; // Golgesiz
shadows.xs; // Cok hafif
shadows.sm; // Hafif
shadows.md; // Orta
shadows.lg; // Belirgin
shadows.xl; // Guclu

// Renkli shadow
shadows.colored(Colors.primary.sunset);

// Ozel shadow
import { createShadow } from '@/constants/design-system';
createShadow(offsetY, blur, opacity, elevation, color);
```

---

## Surface Effects

### Glassmorphism

```tsx
import { glassmorphism } from '@/constants/design-system';

<View style={glassmorphism.light}>  // Acik cam efekti
<View style={glassmorphism.medium}> // Orta cam efekti
<View style={glassmorphism.dark}>   // Koyu cam efekti
```

### Claymorphism (YENi)

Yumusak, 3D kil efekti - pillowy gorunum.

```tsx
import { claymorphism } from '@/constants/design-system';

// Temel kart
<View style={claymorphism.card}>
  <Text>Soft clay card</Text>
</View>

// Basilmis durum
<Pressable style={({ pressed }) => [
  pressed ? claymorphism.cardPressed : claymorphism.card
]}>

// Renk varyantlari
<View style={claymorphism.warm}>  // Seftali/sunset tonu
<View style={claymorphism.cool}>  // Mavi/mint tonu

// Buton stili (daha kucuk radius)
<Pressable style={claymorphism.button}>
```

### Neumorphism

```tsx
import { neumorphism } from '@/constants/design-system';

<View style={neumorphism.raised}>  // Kabartma efekti
<View style={neumorphism.pressed}> // Basilmis efekti
```

---

## Icon System

```tsx
import { iconSizes, iconStroke, iconColors } from '@/constants/design-system';

// Boyutlar (kontekse gore)
<Heart size={iconSizes.badge} />       // 14px - Kucuk badge
<Heart size={iconSizes.action} />      // 20px - Standart aksiyon
<Heart size={iconSizes.navigation} />  // 24px - Navigasyon
<Heart size={iconSizes.feature} />     // 32px - Feature kart
<Heart size={iconSizes.empty} />       // 64px - Empty state

// Ozel kontekst boyutlari
iconSizes.tabBar    // 24px
iconSizes.fab       // 24px
iconSizes.listItem  // 20px
iconSizes.input     // 20px

// Cizgi kalinligi
<Heart strokeWidth={iconStroke.thin} />      // 1.5px - Profesyonel mod
<Heart strokeWidth={iconStroke.standard} />  // 2px - Normal (varsayilan)
<Heart strokeWidth={iconStroke.bold} />      // 2.5px - Vurgulu

// Renkler
<Heart color={iconColors.primary} />   // sunset
<Heart color={iconColors.success} />   // yesil
<Heart color={iconColors.muted} />     // soluk
<Heart color={iconColors.inverted} />  // beyaz (koyu arka plan icin)

// Ozellik-bazli renkler
iconColors.stories   // lavender
iconColors.coloring  // peach
iconColors.analysis  // sky

// Rol bazli ayarlama
import { getRoleStrokeWidth, getRoleIconSize } from '@/constants/design-system';

const strokeWidth = getRoleStrokeWidth(isProfessional); // thin veya standard
const size = getRoleIconSize(iconSizes.action, isProfessional); // %90 kucultur
```

---

## Button System

```tsx
import { buttonVariants, buttonSizes, buttonStyles } from '@/constants/design-system';

// Varyantlar (renk)
buttonVariants.primary   // sunset bg, beyaz text
buttonVariants.secondary // sky bg, beyaz text
buttonVariants.outline   // transparent bg, border
buttonVariants.ghost     // transparent bg, sunset text
buttonVariants.danger    // error bg, beyaz text
buttonVariants.success   // grass bg, beyaz text

// Boyutlar
buttonSizes.xs  // 28px - icon-only
buttonSizes.sm  // 36px - kompakt
buttonSizes.md  // 44px - varsayilan (Apple HIG touch target)
buttonSizes.lg  // 52px - belirgin CTA
buttonSizes.xl  // 60px - hero CTA

// Her boyut sunlari iceriyor:
// height, paddingHorizontal, paddingVertical,
// fontSize, fontWeight, iconSize, borderRadius

// Ornek kullanim
<Pressable style={[
  buttonStyles.base,
  {
    backgroundColor: buttonVariants.primary.backgroundColor,
    height: buttonSizes.md.height,
    borderRadius: buttonSizes.md.borderRadius,
    paddingHorizontal: buttonSizes.md.paddingHorizontal,
  },
  buttonStyles.elevated,
]}>
  <Text style={{
    color: buttonVariants.primary.color,
    fontSize: buttonSizes.md.fontSize,
    fontWeight: buttonSizes.md.fontWeight,
  }}>
    Kaydet
  </Text>
</Pressable>

// Icon buton
<Pressable style={buttonStyles.iconButton.md}>
  <Icon size={buttonSizes.md.iconSize} />
</Pressable>

// Yuvarlak buton
<Pressable style={buttonStyles.circularButton.lg}>
  <Icon size={buttonSizes.lg.iconSize} />
</Pressable>
```

---

## Card Variants

```tsx
import { cardVariants } from '@/constants/design-system';

<View style={cardVariants.hero}>     // Buyuk, belirgin kart
<View style={cardVariants.feature}>  // Orta ozellik karti
<View style={cardVariants.small}>    // Kucuk kart
<View style={cardVariants.flat}>     // Golgesiz, borderli kart
```

---

## Z-Index Katmanlari

```tsx
import { zIndex } from '@/constants/design-system';

// Katman sirasi (alttan uste):
zIndex.base; // 0   - Normal elemanlar
zIndex.raised; // 10  - Kabartmali kartlar
zIndex.dropdown; // 20  - Dropdown menuler
zIndex.sticky; // 30  - Sticky header'lar
zIndex.overlay; // 40  - Arka plan overlay'leri
zIndex.modal; // 50  - Modal dialog'lar
zIndex.popover; // 60  - Popover'lar
zIndex.toast; // 70  - Toast bildirimleri
zIndex.tooltip; // 80  - Tooltip'ler
zIndex.floating; // 100 - FAB butonlari
```

---

## Animasyon

```tsx
import { animation } from '@/constants/design-system';

// Sureler
Animated.timing(anim, {
  duration: animation.duration.fast, // 200ms
  duration: animation.duration.normal, // 300ms
  duration: animation.duration.slow, // 400ms
});

// Spring konfigurasyonlari
Animated.spring(anim, {
  ...animation.spring.gentle, // { tension: 120, friction: 14 }
  ...animation.spring.bouncy, // { tension: 180, friction: 12 }
  ...animation.spring.snappy, // { tension: 300, friction: 20 }
});
```

---

## Responsive Design

```tsx
import { useResponsive } from '@/lib/hooks/useResponsive';

function MyComponent() {
  const { isSmallScreen, screenPadding, getFontSize } = useResponsive();

  return (
    <View style={{ paddingHorizontal: screenPadding }}>
      <Text style={{ fontSize: getFontSize('sm', 'base') }}>Responsive Text</Text>
    </View>
  );
}
```

### Responsive Layout

```tsx
import { useResponsiveLayout } from '@/lib/hooks/useResponsive';

const {
  gridColumns, // 2 kucuk, 3 orta, 4 buyuk ekran
  cardPadding, // Responsive kart padding
  iconMedium, // Responsive icon boyutu
} = useResponsiveLayout();
```

---

## Interaction States

```tsx
import { interaction } from '@/constants/design-system';

<Pressable style={({ pressed }) => [
  pressed && {
    transform: [{ scale: interaction.press.scale }],    // 0.96
    opacity: interaction.press.opacity,                  // 0.8
  },
]}>

// Disabled durum
<View style={{ opacity: interaction.disabled.opacity }}> // 0.4
```

---

## Badges & Chips

```tsx
import { badgeStyles, chipStyles } from '@/constants/design-system';

// Badge
<View style={badgeStyles.primary}>
  <Text style={{ color: Colors.neutral.white }}>Yeni</Text>
</View>

// Chip (secim butonu)
<Pressable style={isSelected ? chipStyles.selected : chipStyles.default}>
  <Text>Filtre</Text>
</Pressable>
```

---

## En Iyi Uygulamalar

### KULLANIN

```tsx
// Tasarim tokenlari
fontSize: typography.size.base
fontWeight: typography.weight.semibold
padding: spacing.md
borderRadius: radius.lg
...shadows.md

// Renk tokenlari
color: Colors.neutral.darkest
backgroundColor: Colors.background.card
borderColor: Colors.neutral.lighter

// Icon tokenlari
size={iconSizes.action}
strokeWidth={iconStroke.standard}
color={iconColors.primary}
```

### KULLANMAYIN

```tsx
// Hardcoded degerler
fontSize: 16; // → typography.size.md
fontWeight: '600'; // → typography.weight.semibold
padding: 20; // → spacing['5']
borderRadius: 12; // → radius.md
color: '#2D3748'; // → Colors.neutral.darkest
color: '#FF9B7A'; // → Colors.primary.sunset
```

---

## Platform Notlari

- **Shadows**: `shadows.*` otomatik olarak web'de `boxShadow`, native'de `shadow*` kullanir
- **Haptics**: `Platform.OS !== 'web'` kontrolu gerekli
- **useNativeDriver**: Web'de `false` olmali
- **Dark Mode**: `DarkColors` ile uyumluluk kontrol edilmeli

---

## Kaynaklar

- **Renk Paleti**: `constants/colors.ts`
- **Tasarim Tokenlari**: `constants/design-system.ts`
- **Responsive Hook'lar**: `lib/hooks/useResponsive.ts`
