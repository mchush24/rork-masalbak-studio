# Quick Start: Responsive Design

## 🚀 Get Started in 5 Minutes

This guide shows you how to make your components responsive using the Renkioo design system.

---

## Step 1: Import the Hook

```tsx
import { useResponsive } from "@/lib/hooks/useResponsive";
```

---

## Step 2: Use in Your Component

```tsx
function MyScreen() {
  const { isSmallScreen, screenPadding } = useResponsive();

  return (
    <View style={{ paddingHorizontal: screenPadding }}>
      <Text>Content here</Text>
    </View>
  );
}
```

---

## Step 3: Apply Responsive Styles

### Method 1: Conditional Inline Styles
```tsx
<Text style={[
  styles.title,
  isSmallScreen && { fontSize: typography.size.xl }
]}>
  Title
</Text>
```

### Method 2: Conditional Icons
```tsx
<Icon size={isSmallScreen ? 28 : 32} />
```

### Method 3: Using Helper Functions
```tsx
const { getFontSize, getIconSize } = useResponsive();

<Text style={{ fontSize: getFontSize("xl", "2xl") }}>Title</Text>
<Icon size={getIconSize(28, 32)} />
```

---

## Common Patterns

### Screen Padding
```tsx
const { screenPadding } = useResponsive();

<ScrollView contentContainerStyle={{ paddingHorizontal: screenPadding }}>
```
**Result:** 16px on small screens, 20px on large

### Responsive Typography
```tsx
const { isSmallScreen } = useResponsive();

<Text style={[
  styles.heading,
  isSmallScreen && { fontSize: typography.size["2xl"] }
]}>
```

### Responsive Cards
```tsx
<View style={[
  cardPresets.standard,
  isSmallScreen && { padding: spacing["4"] }
]}>
```

### Responsive Icons
```tsx
<Icon size={isSmallScreen ? 28 : 32} color={Colors.primary.sunset} />
```

### Responsive Gaps
```tsx
<View style={[
  styles.grid,
  isSmallScreen && { gap: spacing["2"] }
]}>
```

---

## Component Presets

Instead of writing custom styles, use presets:

### Cards
```tsx
import { cardPresets } from "@/constants/component-presets";

<View style={cardPresets.standard}>...</View>
<View style={cardPresets.glass}>...</View>
<View style={cardPresets.elevated}>...</View>
```

### Buttons
```tsx
import { buttonPresets } from "@/constants/component-presets";

<Pressable style={buttonPresets.primary.container}>
  <LinearGradient
    colors={[Colors.primary.sunset, Colors.primary.coral]}
    style={buttonPresets.primary.gradient}
  >
    <Text style={buttonPresets.primary.text}>Click Me</Text>
  </LinearGradient>
</Pressable>
```

### Headers
```tsx
import { headerPresets } from "@/constants/component-presets";

<View style={headerPresets.screen.container}>
  <View style={headerPresets.screen.iconContainer}>
    <Icon size={32} />
  </View>
  <Text style={headerPresets.screen.title}>Title</Text>
  <Text style={headerPresets.screen.subtitle}>Subtitle</Text>
</View>
```

---

## Complete Example

```tsx
import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import design system
import { useResponsive } from "@/lib/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { spacing, typography } from "@/constants/design-system";
import { cardPresets, buttonPresets } from "@/constants/component-presets";
import { textStyles } from "@/constants/design-utilities";

export default function MyScreen() {
  const insets = useSafeAreaInsets();
  const { isSmallScreen, screenPadding, getFontSize } = useResponsive();

  return (
    <LinearGradient
      colors={Colors.background.home}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: screenPadding,
          paddingTop: insets.top + (isSmallScreen ? 12 : 16),
          paddingBottom: insets.bottom + 24,
        }}
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: spacing["6"] }}>
          <Text style={[
            textStyles.h2,
            { fontSize: getFontSize("2xl", "3xl") }
          ]}>
            My Screen
          </Text>
          <Text style={textStyles.bodySmall}>
            Responsive design example
          </Text>
        </View>

        {/* Card */}
        <View style={[
          cardPresets.standard,
          isSmallScreen && { padding: spacing["4"] }
        ]}>
          <Text style={textStyles.h4}>Feature Card</Text>
          <Text style={textStyles.body}>
            This card adapts to screen size
          </Text>

          <Pressable style={buttonPresets.primary.container}>
            <LinearGradient
              colors={[Colors.primary.sunset, Colors.primary.coral]}
              style={buttonPresets.primary.gradient}
            >
              <Star size={20} color={Colors.neutral.white} />
              <Text style={buttonPresets.primary.text}>Action</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
```

---

## Available Hooks

### useResponsive()
```tsx
const {
  width,           // Screen width
  height,          // Screen height
  isSmallScreen,   // < 380px
  screenPadding,   // 16px or 20px
  getFontSize,     // Get responsive font size
  getIconSize,     // Get responsive icon size
  getSpacing,      // Get responsive spacing
} = useResponsive();
```

### useResponsiveLayout()
```tsx
const {
  gridColumns,     // 2 on small, 3 on medium, 4 on large
  cardPadding,     // Responsive card padding
  iconMedium,      // Responsive icon size
  buttonMedium,    // Responsive button height
} = useResponsiveLayout();
```

### useResponsiveTypography()
```tsx
const {
  h1,    // Responsive h1 font size
  h2,    // Responsive h2 font size
  body,  // Responsive body font size
} = useResponsiveTypography();
```

---

## Design Tokens

Always use design system tokens instead of hardcoded values:

### ✅ Good
```tsx
import { spacing, typography, radius } from "@/constants/design-system";

<View style={{
  padding: spacing["4"],
  borderRadius: radius.lg,
}}>
  <Text style={{ fontSize: typography.size.base }}>
```

### ❌ Bad
```tsx
<View style={{
  padding: 16,
  borderRadius: 16,
}}>
  <Text style={{ fontSize: 15 }}>
```

---

## Breakpoints

```typescript
xs: 320px   // Extra small phones
sm: 380px   // Small phones (main breakpoint)
md: 768px   // Tablets
lg: 1024px  // Large tablets
xl: 1280px  // Desktops
```

**Focus:** Screens < 380px (small phones like iPhone SE)

---

## Testing Your Code

### Quick Test
```tsx
// Toggle between small and large
const testSmall = true; // Set to true to test small screen
const isSmallScreen = testSmall ? true : width < 380;
```

### Chrome DevTools
1. Open DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select "iPhone SE" (375px width)
4. Test your component

### Real Devices
- Test on iPhone SE or similar (< 380px width)
- Test on iPhone 14 Pro (393px width)
- Verify touch targets are adequate (min 44px)

---

## Common Mistakes to Avoid

### ❌ Don't Use Magic Numbers
```tsx
// Bad
<View style={{ padding: 16 }}>
```

### ✅ Use Design Tokens
```tsx
// Good
<View style={{ padding: spacing["4"] }}>
```

### ❌ Don't Duplicate Responsive Logic
```tsx
// Bad - in every component
const isSmall = width < 380;
const pad = isSmall ? 16 : 20;
```

### ✅ Use the Hook
```tsx
// Good
const { isSmallScreen, screenPadding } = useResponsive();
```

### ❌ Don't Ignore Small Screens
```tsx
// Bad - fixed size
<Icon size={32} />
```

### ✅ Make It Responsive
```tsx
// Good
<Icon size={isSmallScreen ? 28 : 32} />
```

---

## Next Steps

1. **Read the full guide:** `constants/DESIGN_SYSTEM_GUIDE.md`
2. **See examples:** `constants/DESIGN_EXAMPLE.tsx`
3. **Check existing screens:** See how others implemented it
4. **Test your work:** Use the checklist in `RESPONSIVE_DESIGN_CHECKLIST.md`

---

## Need Help?

- **Examples:** Check `constants/DESIGN_EXAMPLE.tsx`
- **Full Guide:** Read `constants/DESIGN_SYSTEM_GUIDE.md`
- **Existing Code:** Look at `app/(tabs)/index.tsx` for reference
- **Testing:** See `RESPONSIVE_DESIGN_CHECKLIST.md`

---

**Remember:** Start with `useResponsive()` and use component presets for consistency!
