import { Tabs } from "expo-router";
import { Camera, Sparkles, BookOpen, User } from "lucide-react-native";
import React from "react";
import { Colors } from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.coral,
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
      <Tabs.Screen
        name="index"
        options={{
          title: "Analiz",
          tabBarIcon: ({ color }) => <Camera size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="studio"
        options={{
          title: "Stüdyo",
          tabBarIcon: ({ color }) => <Sparkles size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stories"
        options={{
          title: "Hikayeler",
          tabBarIcon: ({ color }) => <BookOpen size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <User size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}
