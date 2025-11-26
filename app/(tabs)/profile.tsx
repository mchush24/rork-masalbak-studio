import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { User, Settings, Globe, Crown, Shield, HelpCircle, LogOut, ChevronRight, BookOpen, Palette, Brain, Edit2, History } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Colors } from "@/constants/colors";
import {
  layout,
  typography,
  spacing,
  radius,
  shadows,
} from "@/constants/design-system";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user stats from backend
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.user.getUserStats.useQuery(
    { userId: user?.userId || '' },
    { enabled: !!user?.userId, refetchOnMount: true }
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setRefreshing(false);
  };

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

  const handleEditProfile = () => {
    Alert.alert('Profil Düzenle', 'Profil düzenleme özelliği yakında eklenecek!');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.background.profile as any}
        style={styles.gradientContainer}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                style={styles.avatar}
              >
                <User size={layout.icon.large} color={Colors.neutral.white} />
              </LinearGradient>
              <Pressable
                style={styles.editButton}
                onPress={handleEditProfile}
              >
                <Edit2 size={16} color={Colors.neutral.white} />
              </Pressable>
            </View>
            <Text style={styles.userName}>{user?.name || 'Hoş Geldiniz'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'MasalBak Kullanıcısı'}</Text>
          </View>

          {/* Stats Cards */}
          {statsLoading ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator size="large" color={Colors.secondary.grass} />
            </View>
          ) : stats && (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
                  style={styles.statCardGradient}
                >
                  <BookOpen size={32} color={Colors.neutral.white} />
                  <Text style={styles.statValue}>{stats.totalStorybooks || 0}</Text>
                  <Text style={styles.statLabel}>Masal</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                  style={styles.statCardGradient}
                >
                  <Palette size={32} color={Colors.neutral.white} />
                  <Text style={styles.statValue}>{stats.totalColorings || 0}</Text>
                  <Text style={styles.statLabel}>Boyama</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                  style={styles.statCardGradient}
                >
                  <Brain size={32} color={Colors.neutral.white} />
                  <Text style={styles.statValue}>{stats.totalAnalyses || 0}</Text>
                  <Text style={styles.statLabel}>Analiz</Text>
                </LinearGradient>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İçeriklerim</Text>

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => Alert.alert("Analiz Geçmişi", "Analiz geçmişi ekranı yakında eklenecek!")}
            >
              <LinearGradient
                colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                style={styles.menuIcon}
              >
                <History size={24} color={Colors.neutral.white} />
              </LinearGradient>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Analiz Geçmişi</Text>
                <View style={styles.menuRight}>
                  <Text style={styles.menuValue}>{stats?.totalAnalyses || 0}</Text>
                  <ChevronRight size={20} color={Colors.neutral.light} />
                </View>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => Alert.alert("Boyama Geçmişi", "Boyama geçmişi ekranı yakında eklenecek!")}
            >
              <LinearGradient
                colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                style={styles.menuIcon}
              >
                <Palette size={24} color={Colors.neutral.white} />
              </LinearGradient>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Boyama Geçmişi</Text>
                <View style={styles.menuRight}>
                  <Text style={styles.menuValue}>{stats?.totalColorings || 0}</Text>
                  <ChevronRight size={20} color={Colors.neutral.light} />
                </View>
              </View>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ayarlar</Text>

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                style={styles.menuIcon}
              >
                <Globe size={24} color={Colors.neutral.white} />
              </LinearGradient>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Dil</Text>
                <View style={styles.menuRight}>
                  <Text style={styles.menuValue}>Türkçe</Text>
                  <ChevronRight size={20} color={Colors.neutral.light} />
                </View>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
                style={styles.menuIcon}
              >
                <Crown size={24} color={Colors.neutral.white} />
              </LinearGradient>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Abonelik</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Yakında</Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                style={styles.menuIcon}
              >
                <Shield size={24} color={Colors.neutral.white} />
              </LinearGradient>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Gizlilik ve Güvenlik</Text>
                <ChevronRight size={20} color={Colors.neutral.light} />
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={[Colors.neutral.medium, Colors.neutral.light]}
                style={styles.menuIcon}
              >
                <Settings size={24} color={Colors.neutral.white} />
              </LinearGradient>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Genel Ayarlar</Text>
                <ChevronRight size={20} color={Colors.neutral.light} />
              </View>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Destek</Text>

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={[Colors.secondary.sunshine, Colors.secondary.sunshineLight]}
                style={styles.menuIcon}
              >
                <HelpCircle size={24} color={Colors.neutral.white} />
              </LinearGradient>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Yardım Merkezi</Text>
                <ChevronRight size={20} color={Colors.neutral.light} />
              </View>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                styles.logoutButton,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
              onPress={handleLogout}
            >
              <LinearGradient
                colors={[Colors.semantic.error, Colors.semantic.errorLight]}
                style={styles.menuIcon}
              >
                <LogOut size={24} color={Colors.neutral.white} />
              </LinearGradient>
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
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  gradientContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing["10"],
  },
  avatarContainer: {
    marginBottom: spacing["5"],
    position: "relative",
  },
  avatar: {
    width: layout.icon.mega + 24,
    height: layout.icon.mega + 24,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
    borderColor: Colors.neutral.white,
    ...shadows.xl,
  },
  editButton: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: Colors.secondary.sky,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.neutral.white,
    ...shadows.md,
  },
  statsLoading: {
    paddingVertical: spacing["10"],
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    gap: spacing["3"],
    marginBottom: spacing["8"],
  },
  statCard: {
    flex: 1,
  },
  statCardGradient: {
    padding: spacing["5"],
    borderRadius: radius.xl,
    alignItems: "center",
    gap: spacing["3"],
    ...shadows.md,
  },
  statValue: {
    fontSize: typography.size["3xl"],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.white,
    letterSpacing: typography.letterSpacing.tight,
  },
  statLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.white,
    opacity: 0.9,
    textTransform: "uppercase" as const,
    letterSpacing: typography.letterSpacing.wide,
  },
  userName: {
    fontSize: typography.size["3xl"],
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing["2"],
    letterSpacing: typography.letterSpacing.tight,
  },
  userEmail: {
    fontSize: typography.size.md,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  section: {
    marginBottom: spacing["8"],
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.medium,
    textTransform: "uppercase" as const,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing["4"],
    paddingHorizontal: spacing["1"],
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: spacing["5"],
    marginBottom: spacing["3"],
    ...shadows.md,
  },
  menuIcon: {
    width: layout.icon.huge + 8,
    height: layout.icon.huge + 8,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing["4"],
  },
  menuContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuLabel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
    letterSpacing: typography.letterSpacing.tight,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing["2"],
  },
  menuValue: {
    fontSize: typography.size.base,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  badge: {
    backgroundColor: Colors.secondary.sunshineLight,
    paddingHorizontal: spacing["4"],
    paddingVertical: spacing["2"],
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: Colors.secondary.sunshine,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: "#8B5A00",
    letterSpacing: typography.letterSpacing.wide,
  },
  footer: {
    alignItems: "center",
    paddingVertical: spacing["8"],
    gap: spacing["2"],
  },
  footerText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  logoutButton: {
    borderColor: Colors.semantic.errorLight,
    borderWidth: 2,
  },
  logoutText: {
    color: Colors.semantic.error,
  },
});