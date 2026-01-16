# Renkioo Design System Guide

Complete guide for using the Renkioo design system utilities.

## Table of Contents

1. [Responsive Design](#responsive-design)
2. [Style Utilities](#style-utilities)
3. [Component Presets](#component-presets)
4. [Best Practices](#best-practices)

---

## Responsive Design

### Using the `useResponsive` Hook

The easiest way to handle responsive design:

```tsx
import { useResponsive } from "@/lib/hooks/useResponsive";

function MyComponent() {
  const { isSmallScreen, screenPadding, getFontSize } = useResponsive();

  return (
    <View style={{ paddingHorizontal: screenPadding }}>
      <Text style={{ fontSize: getFontSize("sm", "base") }}>
        Responsive Text
      </Text>
    </View>
  );
}
```

### Available Hook Values

```tsx
const {
  // Screen dimensions
  width,
  height,

  // Breakpoint checks
  isXs,          // < 380px
  isSm,          // 380px - 768px
  isMd,          // 768px - 1024px
  isLg,          // 1024px - 1280px
  isXl,          // >= 1280px

  // Helper checks
  isSmallScreen,   // < 380px
  isMediumScreen,  // >= 768px
  isLargeScreen,   // >= 1024px

  // Responsive padding
  screenPadding,   // 16px on small, 20px on large

  // Helper functions
  getValue,        // Get value based on breakpoint
  getSpacing,      // Get responsive spacing
  getFontSize,     // Get responsive font size
  getIconSize,     // Get responsive icon size
} = useResponsive();
```

### Responsive Layout Hook

```tsx
import { useResponsiveLayout } from "@/lib/hooks/useResponsive";

function MyComponent() {
  const {
    gridColumns,      // 2 on small, 3 on medium, 4 on large
    cardPadding,      // Responsive card padding
    iconMedium,       // Responsive icon size
    avatarLarge,      // Responsive avatar size
    buttonMedium,     // Responsive button height
  } = useResponsiveLayout();
}
```

### Responsive Typography Hook

```tsx
import { useResponsiveTypography } from "@/lib/hooks/useResponsive";

function MyComponent() {
  const {
    h1,          // Responsive h1 size
    h2,          // Responsive h2 size
    body,        // Responsive body size
    button,      // Responsive button text size
  } = useResponsiveTypography();

  return <Text style={{ fontSize: h1 }}>Title</Text>;
}
```

### Manual Responsive Values

```tsx
import { useWindowDimensions } from "react-native";
import {
  isSmallScreen,
  getResponsiveValue,
} from "@/constants/design-utilities";

function MyComponent() {
  const { width } = useWindowDimensions();
  const small = isSmallScreen(width);

  // Get different values per breakpoint
  const padding = getResponsiveValue(width, {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    default: 20,
  });
}
```

---

## Style Utilities

### Flex Utilities

```tsx
import { flex } from "@/constants/design-utilities";

// Center content
<View style={flex.center}>...</View>

// Row layout
<View style={flex.row}>...</View>

// Row with center alignment
<View style={flex.rowCenter}>...</View>

// Row with space-between
<View style={flex.rowBetween}>...</View>

// Column with center alignment
<View style={flex.columnCenter}>...</View>

// Flex wrap
<View style={[flex.row, flex.wrap]}>...</View>
```

### Creating Common Styles

```tsx
import {
  createCard,
  createBadge,
  createIconContainer,
  createGlassmorphism,
} from "@/constants/design-utilities";

// Card with shadow
const cardStyle = createCard("lg", "6", "2xl");

// Badge with custom colors
const { container, text } = createBadge("#FF6B6B", "#FFFFFF");

// Circular icon container
const iconStyle = createIconContainer(48, "#FF6B6B");

// Glass effect
const glassStyle = createGlassmorphism(0.7, 0.3, false);
```

### Text Style Presets

```tsx
import { textStyles } from "@/constants/design-utilities";

<Text style={textStyles.h1}>Heading 1</Text>
<Text style={textStyles.h2}>Heading 2</Text>
<Text style={textStyles.body}>Body text</Text>
<Text style={textStyles.caption}>Caption text</Text>
<Text style={textStyles.label}>Label text</Text>
<Text style={textStyles.button}>Button text</Text>
```

### Position Utilities

```tsx
import { position } from "@/constants/design-utilities";

// Absolute positioning
<View style={position.absolute}>...</View>

// Fill entire parent
<View style={position.absoluteFill}>...</View>

// Top of parent
<View style={position.absoluteTop}>...</View>

// Bottom of parent
<View style={position.absoluteBottom}>...</View>

// Center of parent
<View style={position.absoluteCenter}>...</View>
```

### Border Utilities

```tsx
import {
  createBorder,
  bottomBorder,
  topBorder,
} from "@/constants/design-utilities";

// Full border
const style1 = createBorder(1, Colors.neutral.lighter, "lg");

// Bottom border only
const style2 = bottomBorder(1, Colors.neutral.lighter);

// Top border only
const style3 = topBorder(1, Colors.neutral.lighter);
```

### Grid Utilities

```tsx
import {
  createGridContainer,
  createGridItem,
} from "@/constants/design-utilities";

<View style={createGridContainer("3")}>
  <View style={createGridItem(2, "3")}>...</View>
  <View style={createGridItem(2, "3")}>...</View>
</View>
```

---

## Component Presets

### Button Presets

```tsx
import { buttonPresets } from "@/constants/component-presets";

// Primary button with gradient
<Pressable style={buttonPresets.primary.container}>
  <LinearGradient
    colors={[...]}
    style={buttonPresets.primary.gradient}
  >
    <Icon />
    <Text style={buttonPresets.primary.text}>Primary</Text>
  </LinearGradient>
</Pressable>

// Secondary outline button
<Pressable style={buttonPresets.secondary.container}>
  <View style={buttonPresets.secondary.inner}>
    <Text style={buttonPresets.secondary.text}>Secondary</Text>
  </View>
</Pressable>

// Icon button
<Pressable style={buttonPresets.icon.container}>
  <Icon size={24} />
</Pressable>
```

### Card Presets

```tsx
import { cardPresets } from "@/constants/component-presets";

// Standard card
<View style={cardPresets.standard}>...</View>

// Glass card
<View style={cardPresets.glass}>...</View>

// Elevated card
<View style={cardPresets.elevated}>...</View>

// Flat card
<View style={cardPresets.flat}>...</View>
```

### Header Presets

```tsx
import { headerPresets } from "@/constants/component-presets";

// Screen header (centered)
<View style={headerPresets.screen.container}>
  <LinearGradient style={headerPresets.screen.iconContainer}>
    <Icon size={32} />
  </LinearGradient>
  <Text style={headerPresets.screen.title}>Title</Text>
  <Text style={headerPresets.screen.subtitle}>Subtitle</Text>
</View>

// Inline header (with back button)
<View style={headerPresets.inline.container}>
  <Pressable style={headerPresets.inline.backButton}>
    <ArrowLeft />
  </Pressable>
  <View style={headerPresets.inline.iconContainer}>
    <Icon />
  </View>
  <View style={headerPresets.inline.textContainer}>
    <Text style={headerPresets.inline.title}>Title</Text>
    <Text style={headerPresets.inline.subtitle}>Subtitle</Text>
  </View>
</View>
```

### List Item Presets

```tsx
import { listItemPresets } from "@/constants/component-presets";

// Standard list item
<Pressable style={listItemPresets.standard.container}>
  <View style={listItemPresets.standard.iconContainer}>
    <Icon />
  </View>
  <View style={listItemPresets.standard.content}>
    <Text style={listItemPresets.standard.title}>Title</Text>
    <Text style={listItemPresets.standard.subtitle}>Subtitle</Text>
  </View>
  <ChevronRight style={listItemPresets.standard.chevron} />
</Pressable>
```

### Modal Presets

```tsx
import { modalPresets } from "@/constants/component-presets";

// Bottom sheet modal
<Modal visible={show} animationType="slide" transparent>
  <View style={modalPresets.bottomSheet.overlay}>
    <View style={modalPresets.bottomSheet.content}>
      <View style={modalPresets.bottomSheet.handle} />
      <View style={modalPresets.bottomSheet.header}>
        <Text style={modalPresets.bottomSheet.title}>Title</Text>
        <CloseButton />
      </View>
      {/* Content */}
    </View>
  </View>
</Modal>
```

### Badge Presets

```tsx
import { badgePresets } from "@/constants/component-presets";

// Solid badge
const solid = badgePresets.solid(Colors.primary.sunset);
<View style={solid.container}>
  <Text style={solid.text}>New</Text>
</View>

// Outlined badge
const outlined = badgePresets.outlined(Colors.secondary.grass);
<View style={outlined.container}>
  <Text style={outlined.text}>Active</Text>
</View>

// Soft badge
const soft = badgePresets.soft(
  Colors.secondary.lavender,
  Colors.secondary.lavenderLight
);
<View style={soft.container}>
  <Text style={soft.text}>Featured</Text>
</View>
```

### Empty State Presets

```tsx
import { emptyStatePresets } from "@/constants/component-presets";

<View style={emptyStatePresets.default.container}>
  <View style={emptyStatePresets.default.iconContainer}>
    <Icon size={64} color={Colors.neutral.light} />
  </View>
  <Text style={emptyStatePresets.default.title}>No Items</Text>
  <Text style={emptyStatePresets.default.description}>
    Description here
  </Text>
</View>
```

---

## Best Practices

### 1. Always Use Responsive Hooks

```tsx
// ✅ Good
const { isSmallScreen, screenPadding } = useResponsive();

// ❌ Bad - hardcoded values
const padding = 20;
```

### 2. Use Component Presets for Consistency

```tsx
// ✅ Good
<View style={cardPresets.standard}>...</View>

// ❌ Bad - custom styles everywhere
<View style={{ backgroundColor: "white", padding: 20, ... }}>...</View>
```

### 3. Leverage Text Style Presets

```tsx
// ✅ Good
<Text style={textStyles.h2}>Title</Text>

// ❌ Bad
<Text style={{ fontSize: 28, fontWeight: "800", ... }}>Title</Text>
```

### 4. Use Flex Utilities

```tsx
// ✅ Good
<View style={flex.rowBetween}>...</View>

// ❌ Bad
<View style={{
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
}}>...</View>
```

### 5. Compose Styles When Needed

```tsx
import { composeStyles, conditionalStyle } from "@/constants/design-utilities";

const style = composeStyles(
  baseStyle,
  isActive && activeStyle,
  conditionalStyle(isPressed, pressedStyle)
);
```

### 6. Use Design System Tokens

```tsx
import { spacing, radius, shadows } from "@/constants/design-system";

// ✅ Good
const style = {
  padding: spacing["4"],
  borderRadius: radius.lg,
  ...shadows.md,
};

// ❌ Bad
const style = {
  padding: 16,
  borderRadius: 16,
  shadowOffset: { width: 0, height: 4 },
  ...
};
```

---

## Examples

### Complete Responsive Component

```tsx
import { View, Text, Pressable } from "react-native";
import { useResponsive } from "@/lib/hooks/useResponsive";
import { cardPresets, buttonPresets } from "@/constants/component-presets";
import { textStyles, flex } from "@/constants/design-utilities";

function FeatureCard() {
  const { isSmallScreen, screenPadding, getFontSize } = useResponsive();

  return (
    <View
      style={[
        cardPresets.standard,
        { marginHorizontal: screenPadding },
        isSmallScreen && { padding: spacing["4"] },
      ]}
    >
      <Text
        style={[
          textStyles.h3,
          { fontSize: getFontSize("xl", "2xl") },
        ]}
      >
        Feature Title
      </Text>

      <View style={[flex.rowBetween, { marginTop: spacing["4"] }]}>
        <Pressable style={buttonPresets.primary.container}>
          <LinearGradient
            colors={[Colors.primary.sunset, Colors.primary.coral]}
            style={buttonPresets.primary.gradient}
          >
            <Text style={buttonPresets.primary.text}>Action</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}
```

---

## Migration Guide

### From Inline Styles to Design System

**Before:**
```tsx
<View
  style={{
    padding: 20,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  }}
>
  <Text style={{ fontSize: 28, fontWeight: "800" }}>Title</Text>
</View>
```

**After:**
```tsx
import { cardPresets } from "@/constants/component-presets";
import { textStyles } from "@/constants/design-utilities";

<View style={cardPresets.standard}>
  <Text style={textStyles.h2}>Title</Text>
</View>
```

### From Manual Responsive to Hooks

**Before:**
```tsx
const { width } = useWindowDimensions();
const isSmall = width < 380;
const padding = isSmall ? 16 : 20;
```

**After:**
```tsx
const { isSmallScreen, screenPadding } = useResponsive();
```

---

## Resources

- **Design System Tokens**: `/constants/design-system.ts`
- **Design Utilities**: `/constants/design-utilities.ts`
- **Component Presets**: `/constants/component-presets.ts`
- **Responsive Hooks**: `/lib/hooks/useResponsive.ts`
- **Colors**: `/constants/colors.ts`

---

**Questions or Suggestions?**
Contact the design system maintainers or create an issue.
