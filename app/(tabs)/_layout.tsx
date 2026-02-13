import { Tabs } from 'expo-router';
import { Home, Palette, Brain, TrendingUp, User } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Colors } from '@/constants/colors';
import { iconSizes, iconStroke } from '@/constants/design-system';
import { FloatingTabBar } from '@/components/navigation/AnimatedTabBar';

export default function TabLayout() {
  // TODO (#34): Implement dynamic badge counts using AsyncStorage "last seen" tracking.
  // Future implementation:
  //   - Track last-seen counts per tab (e.g. analysis count, story count)
  //   - Compare with current tRPC query counts
  //   - Show badge = (current - lastSeen) when > 0
  //   - Clear badge on tab focus via navigation listener
  const badges = useMemo<Record<string, number>>(() => ({}), []);

  return (
    <Tabs
      tabBar={props => <FloatingTabBar {...props} badges={badges} />}
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.sunset,
        tabBarInactiveTintColor: Colors.neutral.light,
        headerShown: false,
        animation: 'shift',
        sceneStyle: { paddingBottom: 96 },
      }}
    >
      {/* Tab 1: Ana Sayfa */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, focused }) => (
            <Home
              size={iconSizes.tabBar}
              strokeWidth={focused ? iconStroke.bold : iconStroke.thin}
              color={color}
              fill={focused ? color : 'none'}
            />
          ),
        }}
      />
      {/* Tab 2: Stüdyo - Yaratım araçları */}
      <Tabs.Screen
        name="hayal-atolyesi"
        options={{
          title: 'Stüdyo',
          tabBarIcon: ({ color, focused }) => (
            <Palette
              size={iconSizes.tabBar}
              strokeWidth={focused ? iconStroke.bold : iconStroke.thin}
              color={color}
              fill={focused ? color : 'none'}
            />
          ),
        }}
      />
      {/* Tab 3: Analiz - Çizim analizi (center tab, always bold/filled via CenterTabButton) */}
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analiz',
          tabBarIcon: ({ color }) => (
            <Brain
              size={iconSizes.tabBar}
              strokeWidth={iconStroke.bold}
              color={color}
              fill={color}
            />
          ),
        }}
      />
      {/* Tab 4: Gelişim - İlerleme takibi */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'Gelişim',
          tabBarIcon: ({ color, focused }) => (
            <TrendingUp
              size={iconSizes.tabBar}
              strokeWidth={focused ? iconStroke.bold : iconStroke.thin}
              color={color}
            />
          ),
        }}
      />
      {/* Tab 5: Profil - Profil ve ayarlar */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <User
              size={iconSizes.tabBar}
              strokeWidth={focused ? iconStroke.bold : iconStroke.thin}
              color={color}
              fill={focused ? color : 'none'}
            />
          ),
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen name="discover" options={{ href: null }} />
      <Tabs.Screen name="quick-analysis" options={{ href: null }} />
      <Tabs.Screen name="studio" options={{ href: null }} />
      <Tabs.Screen name="stories" options={{ href: null }} />
      <Tabs.Screen name="advanced-analysis" options={{ href: null }} />
      <Tabs.Screen name="analysis-history" options={{ href: null }} />
      <Tabs.Screen name="coloring-history" options={{ href: null }} />
    </Tabs>
  );
}
