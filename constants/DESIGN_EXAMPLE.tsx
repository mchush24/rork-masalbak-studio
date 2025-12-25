/**
 * Design System Usage Examples
 *
 * Practical examples showing how to use the design system utilities
 * Copy these patterns for your components!
 */

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Heart, Star, Bell } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Design System Imports
import { useResponsive } from "@/lib/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { spacing, radius, shadows } from "@/constants/design-system";
import {
  flex,
  textStyles,
  createCard,
  createBadge,
  createIconContainer,
} from "@/constants/design-utilities";
import {
  cardPresets,
  buttonPresets,
  headerPresets,
  listItemPresets,
  badgePresets,
} from "@/constants/component-presets";

// ============================================
// EXAMPLE 1: Responsive Card Component
// ============================================

export function ResponsiveCardExample() {
  const { isSmallScreen, screenPadding, getFontSize } = useResponsive();

  return (
    <View
      style={[
        cardPresets.standard,
        { marginHorizontal: screenPadding },
        isSmallScreen && { padding: spacing["4"] },
      ]}
    >
      <Text style={[textStyles.h3, { fontSize: getFontSize("xl", "2xl") }]}>
        Card Title
      </Text>
      <Text style={textStyles.body}>
        This card automatically adjusts its padding and font sizes based on
        screen width.
      </Text>
    </View>
  );
}

// ============================================
// EXAMPLE 2: Header with Back Button
// ============================================

export function ResponsiveHeaderExample() {
  const { isSmallScreen, getIconSize } = useResponsive();

  return (
    <View style={headerPresets.inline.container}>
      <Pressable
        style={[
          headerPresets.inline.backButton,
          isSmallScreen && { width: 36, height: 36 },
        ]}
      >
        <Text>←</Text>
      </Pressable>

      <LinearGradient
        colors={[Colors.primary.sunset, Colors.primary.peach]}
        style={[
          headerPresets.inline.iconContainer,
          isSmallScreen && { width: 56, height: 56 },
        ]}
      >
        <Star size={getIconSize(28, 32)} color={Colors.neutral.white} />
      </LinearGradient>

      <View style={headerPresets.inline.textContainer}>
        <Text
          style={[
            headerPresets.inline.title,
            isSmallScreen && { fontSize: 20 },
          ]}
        >
          Page Title
        </Text>
        <Text style={headerPresets.inline.subtitle}>Subtitle goes here</Text>
      </View>
    </View>
  );
}

// ============================================
// EXAMPLE 3: Button with Icon
// ============================================

export function GradientButtonExample() {
  return (
    <Pressable
      style={({ pressed }) => [
        buttonPresets.primary.container,
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
      ]}
    >
      <LinearGradient
        colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
        style={buttonPresets.primary.gradient}
      >
        <Heart size={20} color={Colors.neutral.white} />
        <Text style={buttonPresets.primary.text}>Like</Text>
      </LinearGradient>
    </Pressable>
  );
}

// ============================================
// EXAMPLE 4: List Item with Icon
// ============================================

export function ListItemExample() {
  const { isSmallScreen, getIconSize } = useResponsive();

  return (
    <Pressable
      style={({ pressed }) => [
        listItemPresets.standard.container,
        isSmallScreen && { padding: spacing["3"] },
        pressed && { opacity: 0.8 },
      ]}
    >
      <LinearGradient
        colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
        style={[
          listItemPresets.standard.iconContainer,
          isSmallScreen && { width: 40, height: 40 },
        ]}
      >
        <Bell size={getIconSize(20, 24)} color={Colors.neutral.white} />
      </LinearGradient>

      <View style={listItemPresets.standard.content}>
        <Text style={listItemPresets.standard.title}>Notification Title</Text>
        <Text style={listItemPresets.standard.subtitle}>
          Description goes here
        </Text>
      </View>

      <View style={listItemPresets.standard.chevron}>
        <Text>›</Text>
      </View>
    </Pressable>
  );
}

// ============================================
// EXAMPLE 5: Badge Variations
// ============================================

export function BadgeExamples() {
  const solidBadge = badgePresets.solid(Colors.semantic.success);
  const outlinedBadge = badgePresets.outlined(Colors.secondary.lavender);
  const softBadge = badgePresets.soft(
    Colors.secondary.sunshine,
    Colors.secondary.sunshineLight
  );

  return (
    <View style={[flex.row, { gap: spacing["2"] }]}>
      <View style={solidBadge.container}>
        <Text style={solidBadge.text}>Success</Text>
      </View>

      <View style={outlinedBadge.container}>
        <Text style={outlinedBadge.text}>Outlined</Text>
      </View>

      <View style={softBadge.container}>
        <Text style={softBadge.text}>Soft</Text>
      </View>
    </View>
  );
}

// ============================================
// EXAMPLE 6: Glass Card
// ============================================

export function GlassCardExample() {
  return (
    <View style={cardPresets.glass}>
      <Text style={textStyles.h4}>Glass Effect</Text>
      <Text style={textStyles.body}>
        This card has a glassmorphism effect with transparency and blur.
      </Text>
    </View>
  );
}

// ============================================
// EXAMPLE 7: Grid Layout
// ============================================

export function GridExample() {
  const { isSmallScreen } = useResponsive();

  return (
    <View style={[flex.row, flex.wrap, { gap: spacing["3"] }]}>
      {[1, 2, 3, 4].map((item) => (
        <View
          key={item}
          style={[
            cardPresets.standard,
            {
              flex: 1,
              minWidth: isSmallScreen ? "45%" : "30%",
              minHeight: 120,
            },
          ]}
        >
          <Text style={textStyles.label}>Item {item}</Text>
        </View>
      ))}
    </View>
  );
}

// ============================================
// EXAMPLE 8: Complete Screen Layout
// ============================================

export function CompleteScreenExample() {
  const insets = useSafeAreaInsets();
  const { isSmallScreen, screenPadding } = useResponsive();

  return (
    <LinearGradient
      colors={Colors.background.studio}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: screenPadding,
          paddingTop: insets.top + (isSmallScreen ? 12 : 16),
          paddingBottom: insets.bottom + 24,
        }}
      >
        {/* Centered Header */}
        <View style={headerPresets.screen.container}>
          <LinearGradient
            colors={[Colors.primary.sunset, Colors.primary.peach]}
            style={[
              headerPresets.screen.iconContainer,
              isSmallScreen && { width: 64, height: 64 },
            ]}
          >
            <Star size={isSmallScreen ? 28 : 32} color={Colors.neutral.white} />
          </LinearGradient>
          <Text
            style={[
              headerPresets.screen.title,
              isSmallScreen && { fontSize: 32 },
            ]}
          >
            Screen Title
          </Text>
          <Text style={headerPresets.screen.subtitle}>
            Welcome to this screen
          </Text>
        </View>

        {/* Stats Row */}
        <View
          style={[
            flex.row,
            { gap: spacing["3"], marginBottom: spacing["6"] },
          ]}
        >
          {[
            { label: "Total", value: "150" },
            { label: "Active", value: "42" },
            { label: "Done", value: "108" },
          ].map((stat, index) => (
            <View
              key={index}
              style={[
                createCard("sm", isSmallScreen ? "3" : "4", "lg"),
                { flex: 1, alignItems: "center" },
              ]}
            >
              <Text style={[textStyles.h3, { color: Colors.primary.sunset }]}>
                {stat.value}
              </Text>
              <Text style={textStyles.caption}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Feature Cards */}
        <ResponsiveCardExample />
      </ScrollView>
    </LinearGradient>
  );
}

// ============================================
// USAGE IN YOUR COMPONENTS
// ============================================

/*

// Import what you need:
import { useResponsive } from "@/lib/hooks/useResponsive";
import { cardPresets, buttonPresets } from "@/constants/component-presets";
import { flex, textStyles } from "@/constants/design-utilities";

// In your component:
function MyComponent() {
  const { isSmallScreen, screenPadding, getFontSize } = useResponsive();

  return (
    <View style={{ paddingHorizontal: screenPadding }}>
      <View style={cardPresets.standard}>
        <Text style={[textStyles.h3, { fontSize: getFontSize("xl", "2xl") }]}>
          Title
        </Text>
      </View>
    </View>
  );
}

*/
