import { Tabs } from "expo-router";
import { Home, Compass, Palette, TrendingUp, User } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import { Colors } from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.sunset,
        tabBarInactiveTintColor: Colors.neutral.light,
        headerShown: false,
        animation: 'shift',
        tabBarStyle: {
          backgroundColor: Colors.neutral.white,
          borderTopWidth: 1,
          borderTopColor: Colors.neutral.lighter,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      {/* Tab 1: Ana Sayfa */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color }) => <Home size={26} color={color} />,
        }}
      />
      {/* Tab 2: Keşfet - Social Feed */}
      <Tabs.Screen
        name="discover"
        options={{
          title: "Keşfet",
          tabBarIcon: ({ color }) => <Compass size={26} color={color} />,
        }}
      />
      {/* Tab 3: Analiz - Tüm yaratım araçları */}
      <Tabs.Screen
        name="hayal-atolyesi"
        options={{
          title: "Analiz",
          tabBarIcon: ({ color }) => <Palette size={26} color={color} />,
        }}
      />
      {/* Tab 4: Gelişim - İlerleme takibi */}
      <Tabs.Screen
        name="history"
        options={{
          title: "Gelişim",
          tabBarIcon: ({ color }) => <TrendingUp size={26} color={color} />,
        }}
      />
      {/* Tab 5: Hesabım - Profil ve ayarlar */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hesabım",
          tabBarIcon: ({ color }) => <User size={26} color={color} />,
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen name="quick-analysis" options={{ href: null }} />
      <Tabs.Screen name="studio" options={{ href: null }} />
      <Tabs.Screen name="stories" options={{ href: null }} />
      <Tabs.Screen name="advanced-analysis" options={{ href: null }} />
      <Tabs.Screen name="analysis-history" options={{ href: null }} />
      <Tabs.Screen name="coloring-history" options={{ href: null }} />
    </Tabs>
  );
}
