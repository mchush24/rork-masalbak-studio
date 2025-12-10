import { Tabs } from "expo-router";
import { Home, User, Clock, Sparkles } from "lucide-react-native";
import React from "react";
import { Colors } from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.sunset,
        tabBarInactiveTintColor: Colors.neutral.light,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.neutral.white,
          borderTopWidth: 1,
          borderTopColor: Colors.neutral.lighter,
          elevation: 0,
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowColor: Colors.neutral.darkest,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600" as const,
          marginTop: -3,
          fontFamily: "System",
        },
      }}
    >
      {/* Main Navigation - 4 Tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color }) => <Home size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="hayal-atolyesi"
        options={{
          title: "Hayal Atölyesi",
          tabBarIcon: ({ color }) => <Sparkles size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Geçmiş",
          tabBarIcon: ({ color }) => <Clock size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <User size={26} color={color} />,
        }}
      />
      {/* Hidden/Secondary screens - accessible from Home or Hayal Atölyesi */}
      <Tabs.Screen
        name="quick-analysis"
        options={{
          href: null, // Accessible from Home
        }}
      />
      <Tabs.Screen
        name="studio"
        options={{
          href: null, // Accessible from Hayal Atölyesi
        }}
      />
      <Tabs.Screen
        name="stories"
        options={{
          href: null, // Accessible from Hayal Atölyesi
        }}
      />
      <Tabs.Screen
        name="advanced-analysis"
        options={{
          href: null, // Accessible from Home or Hayal Atölyesi
        }}
      />
      <Tabs.Screen
        name="analysis-history"
        options={{
          href: null, // Backward compatibility
        }}
      />
      <Tabs.Screen
        name="coloring-history"
        options={{
          href: null, // Backward compatibility
        }}
      />
    </Tabs>
  );
}
