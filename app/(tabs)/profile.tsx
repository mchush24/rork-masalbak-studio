import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView, Alert } from "react-native";
import { User, Settings, Globe, Crown, Shield, HelpCircle, LogOut } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/hooks/useAuth";
import { Colors } from "@/constants/colors";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(onboarding)/welcome');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={48} color="#FF6B6B" />
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || 'Hoş Geldiniz'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'MasalBak Kullanıcısı'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ayarlar</Text>

          <Pressable style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Globe size={24} color="#6B7280" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Dil</Text>
              <Text style={styles.menuValue}>Türkçe</Text>
            </View>
          </Pressable>

          <Pressable style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Crown size={24} color="#6B7280" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Abonelik</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Yakında</Text>
              </View>
            </View>
          </Pressable>

          <Pressable style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Shield size={24} color="#6B7280" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Gizlilik ve Güvenlik</Text>
            </View>
          </Pressable>

          <Pressable style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Settings size={24} color="#6B7280" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Genel Ayarlar</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destek</Text>

          <Pressable style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <HelpCircle size={24} color="#6B7280" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Yardım Merkezi</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Pressable
            style={[styles.menuItem, styles.logoutButton]}
            onPress={handleLogout}
          >
            <View style={[styles.menuIcon, styles.logoutIcon]}>
              <LogOut size={24} color="#EF4444" />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, styles.logoutText]}>Çıkış Yap</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>MasalBak v1.0.0</Text>
          <Text style={styles.footerText}>
            Çocukların hayal dünyasını keşfedin
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  avatarContainer: {
    marginBottom: 18,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: Colors.primary.soft,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: Colors.neutral.white,
    shadowColor: Colors.primary.coral,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  userName: {
    fontSize: 26,
    fontWeight: "700" as const,
    color: Colors.neutral.darkest,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.neutral.medium,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.neutral.medium,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  menuIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuLabel: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.neutral.darkest,
    letterSpacing: -0.2,
  },
  menuValue: {
    fontSize: 16,
    color: Colors.neutral.medium,
  },
  badge: {
    backgroundColor: "#FFF9F0",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.secondary.sunshine,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#8B5A00",
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: Colors.neutral.light,
  },
});