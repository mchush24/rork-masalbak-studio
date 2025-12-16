import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView, Alert, ActivityIndicator, RefreshControl, Modal, TextInput, Switch } from "react-native";
import { User, Settings, Globe, Crown, Shield, HelpCircle, LogOut, ChevronRight, BookOpen, Palette, Brain, Edit2, History, Check, X, Bell, Lock, Sun, Moon, Smartphone, Baby, Plus, Trash2 } from "lucide-react-native";
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

type Language = "tr" | "en" | "de" | "ar";

const LANGUAGES: Record<Language, { name: string; nativeName: string; flag: string }> = {
  tr: { name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  en: { name: "English", nativeName: "English", flag: "🇬🇧" },
  de: { name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  ar: { name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
};

type Theme = "light" | "dark" | "auto";

const THEMES: Record<Theme, { icon: string; name: string; description: string }> = {
  light: { icon: "☀️", name: "Açık Tema", description: "Gündüz için ideal" },
  dark: { icon: "🌙", name: "Koyu Tema", description: "Gece için ideal" },
  auto: { icon: "🔄", name: "Otomatik", description: "Sistem ayarlarına göre" },
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showGeneralModal, setShowGeneralModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showChildrenModal, setShowChildrenModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');

  // Fetch user stats from backend
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.user.getUserStats.useQuery(
    { userId: user?.userId || '' },
    { enabled: !!user?.userId, refetchOnMount: true }
  );

  // Fetch user settings
  const { data: userSettings, refetch: refetchSettings } = trpc.user.getSettings.useQuery(
    { userId: user?.userId || '' },
    { enabled: !!user?.userId }
  );

  // Mutations
  const updateSettingsMutation = trpc.user.updateSettings.useMutation();
  const updateProfileMutation = trpc.user.updateProfile.useMutation();

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchSettings()]);
    setRefreshing(false);
  };

  const handleLanguageChange = async (language: Language) => {
    try {
      await updateSettingsMutation.mutateAsync({
        userId: user?.userId || '',
        language,
      });
      await refetchSettings();
      setShowLanguageModal(false);
      Alert.alert('✅ Başarılı', 'Dil tercihiniz kaydedildi.');
    } catch (error) {
      Alert.alert('❌ Hata', 'Dil değiştirilemedi. Lütfen tekrar deneyin.');
    }
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
    setEditName(user?.name || '');
    setShowProfileModal(true);
  };

  const handleProfileSave = async () => {
    if (!editName.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir isim girin.');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        userId: user?.userId || '',
        name: editName.trim(),
      });
      setShowProfileModal(false);
      Alert.alert('Başarılı', 'Profiliniz güncellendi!');
      // Refresh to get updated data
      await handleRefresh();
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleSettingToggle = async (setting: string, value: any) => {
    try {
      await updateSettingsMutation.mutateAsync({
        userId: user?.userId || '',
        [setting]: value,
      });
      await refetchSettings();
    } catch (error) {
      Alert.alert('Hata', 'Ayar güncellenemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleAddChild = async () => {
    if (!childName.trim() || !childAge.trim()) {
      Alert.alert('Uyarı', 'Lütfen isim ve yaş bilgilerini girin.');
      return;
    }

    const age = parseInt(childAge);
    if (isNaN(age) || age < 0 || age > 18) {
      Alert.alert('Uyarı', 'Lütfen geçerli bir yaş girin (0-18).');
      return;
    }

    try {
      const currentChildren = user?.children || [];
      const newChild = {
        name: childName.trim(),
        age: age,
      };

      await updateProfileMutation.mutateAsync({
        userId: user?.userId || '',
        children: [...currentChildren, newChild],
      });

      setChildName('');
      setChildAge('');
      setShowChildrenModal(false);
      Alert.alert('Başarılı', 'Çocuk profili eklendi!');
      await handleRefresh();
    } catch (error) {
      Alert.alert('Hata', 'Çocuk profili eklenemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleRemoveChild = async (index: number) => {
    try {
      const currentChildren = user?.children || [];
      const newChildren = currentChildren.filter((_: any, i: number) => i !== index);

      await updateProfileMutation.mutateAsync({
        userId: user?.userId || '',
        children: newChildren,
      });

      Alert.alert('Başarılı', 'Çocuk profili silindi!');
      await handleRefresh();
    } catch (error) {
      Alert.alert('Hata', 'Çocuk profili silinemedi. Lütfen tekrar deneyin.');
    }
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

          {/* Children Profiles */}
          <View style={styles.childrenSection}>
            <View style={styles.childrenHeader}>
              <Text style={styles.childrenTitle}>👶 Çocuk Profilleri</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.addChildButton,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setShowChildrenModal(true)}
              >
                <Plus size={20} color={Colors.neutral.white} />
              </Pressable>
            </View>

            {user?.children && user.children.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childrenList}>
                {user.children.map((child: any, index: number) => (
                  <View key={index} style={styles.childCard}>
                    <LinearGradient
                      colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
                      style={styles.childCardGradient}
                    >
                      <Baby size={32} color={Colors.neutral.white} />
                      <Text style={styles.childName}>{child.name}</Text>
                      <Text style={styles.childAge}>{child.age} yaş</Text>
                      <Pressable
                        style={({ pressed }) => [
                          styles.removeChildButton,
                          pressed && { opacity: 0.7 },
                        ]}
                        onPress={() => {
                          Alert.alert(
                            'Çocuk Profilini Sil',
                            `${child.name} adlı çocuk profilini silmek istediğinize emin misiniz?`,
                            [
                              { text: 'İptal', style: 'cancel' },
                              { text: 'Sil', style: 'destructive', onPress: () => handleRemoveChild(index) },
                            ]
                          );
                        }}
                      >
                        <Trash2 size={16} color={Colors.semantic.error} />
                      </Pressable>
                    </LinearGradient>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.addChildPrompt,
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setShowChildrenModal(true)}
              >
                <Baby size={40} color={Colors.neutral.light} />
                <Text style={styles.addChildPromptText}>Çocuk profili ekleyin</Text>
              </Pressable>
            )}
          </View>

          {/* Stats Cards */}
          {statsLoading ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator size="large" color={Colors.secondary.grass} />
            </View>
          ) : stats && (
            <View style={styles.statsContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.statCard,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => router.push('/history' as any)}
              >
                <LinearGradient
                  colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
                  style={styles.statCardGradient}
                >
                  <BookOpen size={32} color={Colors.neutral.white} />
                  <Text style={styles.statValue}>{stats.totalStorybooks || 0}</Text>
                  <Text style={styles.statLabel}>Masal</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.statCard,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => router.push('/history' as any)}
              >
                <LinearGradient
                  colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                  style={styles.statCardGradient}
                >
                  <Palette size={32} color={Colors.neutral.white} />
                  <Text style={styles.statValue}>{stats.totalColorings || 0}</Text>
                  <Text style={styles.statLabel}>Boyama</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.statCard,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => router.push('/history' as any)}
              >
                <LinearGradient
                  colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                  style={styles.statCardGradient}
                >
                  <Brain size={32} color={Colors.neutral.white} />
                  <Text style={styles.statValue}>{stats.totalAnalyses || 0}</Text>
                  <Text style={styles.statLabel}>Analiz</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İçeriklerim</Text>

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => router.push('/history' as any)}
            >
              <LinearGradient
                colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                style={styles.menuIcon}
              >
                <History size={24} color={Colors.neutral.white} />
              </LinearGradient>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Tüm İçeriklerim</Text>
                <View style={styles.menuRight}>
                  <Text style={styles.menuValue}>
                    {(stats?.totalAnalyses || 0) + (stats?.totalStorybooks || 0) + (stats?.totalColorings || 0)}
                  </Text>
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
              onPress={() => setShowLanguageModal(true)}
            >
              <LinearGradient
                colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                style={styles.menuIcon}
              >
                <Globe size={24} color={Colors.neutral.white} />
              </LinearGradient>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Dil / Language</Text>
                <View style={styles.menuRight}>
                  <Text style={styles.menuValue}>
                    {userSettings?.language ? LANGUAGES[userSettings.language as Language].nativeName : 'Türkçe'}
                  </Text>
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
              onPress={() => setShowNotificationsModal(true)}
            >
              <LinearGradient
                colors={[Colors.secondary.sunshine, Colors.secondary.sunshineLight]}
                style={styles.menuIcon}
              >
                <Bell size={24} color={Colors.neutral.white} />
              </LinearGradient>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Bildirimler</Text>
                <ChevronRight size={20} color={Colors.neutral.light} />
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => setShowPrivacyModal(true)}
            >
              <LinearGradient
                colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                style={styles.menuIcon}
              >
                <Lock size={24} color={Colors.neutral.white} />
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
              onPress={() => setShowThemeModal(true)}
            >
              <LinearGradient
                colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
                style={styles.menuIcon}
              >
                <Sun size={24} color={Colors.neutral.white} />
              </LinearGradient>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Tema</Text>
                <View style={styles.menuRight}>
                  <Text style={styles.menuValue}>
                    {userSettings?.theme === 'light' ? 'Açık' : userSettings?.theme === 'dark' ? 'Koyu' : 'Otomatik'}
                  </Text>
                  <ChevronRight size={20} color={Colors.neutral.light} />
                </View>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
              ]}
              onPress={() => setShowGeneralModal(true)}
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
              onPress={() => Alert.alert(
                '💡 Yardım Merkezi',
                '📧 E-posta: destek@masalbak.com\n\n' +
                '📱 Uygulama Versiyonu: 1.0.0\n\n' +
                '🌐 Web: www.masalbak.com\n\n' +
                'Sorularınız için bize ulaşın!',
                [{ text: 'Tamam' }]
              )}
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

        {/* Language Selector Modal */}
        <Modal
          visible={showLanguageModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowLanguageModal(false)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🌍 Dil Seçimi / Language</Text>
                <Pressable onPress={() => setShowLanguageModal(false)} style={styles.modalCloseButton}>
                  <X size={24} color={Colors.neutral.dark} />
                </Pressable>
              </View>

              <View style={styles.languageList}>
                {(Object.keys(LANGUAGES) as Language[]).map((langCode) => {
                  const lang = LANGUAGES[langCode];
                  const isSelected = userSettings?.language === langCode;

                  return (
                    <Pressable
                      key={langCode}
                      style={({ pressed }) => [
                        styles.languageItem,
                        isSelected && styles.languageItemSelected,
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={() => handleLanguageChange(langCode)}
                    >
                      <Text style={styles.languageFlag}>{lang.flag}</Text>
                      <View style={styles.languageInfo}>
                        <Text style={styles.languageName}>{lang.nativeName}</Text>
                        <Text style={styles.languageNameSecondary}>{lang.name}</Text>
                      </View>
                      {isSelected && (
                        <Check size={24} color={Colors.secondary.grass} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Profile Editor Modal */}
        <Modal
          visible={showProfileModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowProfileModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowProfileModal(false)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>✏️ Profili Düzenle</Text>
                <Pressable onPress={() => setShowProfileModal(false)} style={styles.modalCloseButton}>
                  <X size={24} color={Colors.neutral.dark} />
                </Pressable>
              </View>

              <View style={styles.profileEditForm}>
                <Text style={styles.inputLabel}>İsim</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Adınızı girin"
                  placeholderTextColor={Colors.neutral.light}
                  autoFocus
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.saveButton,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={handleProfileSave}
                >
                  <LinearGradient
                    colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                    style={styles.saveButtonGradient}
                  >
                    <Check size={20} color={Colors.neutral.white} />
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Notifications Modal */}
        <Modal
          visible={showNotificationsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNotificationsModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowNotificationsModal(false)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🔔 Bildirimler</Text>
                <Pressable onPress={() => setShowNotificationsModal(false)} style={styles.modalCloseButton}>
                  <X size={24} color={Colors.neutral.dark} />
                </Pressable>
              </View>

              <View style={styles.settingsForm}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Tüm Bildirimler</Text>
                  <Switch
                    value={userSettings?.notifications_enabled ?? true}
                    onValueChange={(value) => handleSettingToggle('notificationsEnabled', value)}
                    trackColor={{ false: Colors.neutral.light, true: Colors.secondary.grass }}
                    thumbColor={Colors.neutral.white}
                  />
                </View>
                <Text style={styles.settingDescription}>
                  Uygulama bildirimlerini açın veya kapatın
                </Text>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>E-posta Bildirimleri</Text>
                  <Switch
                    value={userSettings?.email_notifications ?? false}
                    onValueChange={(value) => handleSettingToggle('emailNotifications', value)}
                    trackColor={{ false: Colors.neutral.light, true: Colors.secondary.grass }}
                    thumbColor={Colors.neutral.white}
                  />
                </View>
                <Text style={styles.settingDescription}>
                  Önemli güncellemeleri e-posta ile alın
                </Text>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Push Bildirimleri</Text>
                  <Switch
                    value={userSettings?.push_notifications ?? true}
                    onValueChange={(value) => handleSettingToggle('pushNotifications', value)}
                    trackColor={{ false: Colors.neutral.light, true: Colors.secondary.grass }}
                    thumbColor={Colors.neutral.white}
                  />
                </View>
                <Text style={styles.settingDescription}>
                  Anlık bildirimler alın
                </Text>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Privacy Modal */}
        <Modal
          visible={showPrivacyModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPrivacyModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowPrivacyModal(false)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🔒 Gizlilik ve Güvenlik</Text>
                <Pressable onPress={() => setShowPrivacyModal(false)} style={styles.modalCloseButton}>
                  <X size={24} color={Colors.neutral.dark} />
                </Pressable>
              </View>

              <View style={styles.settingsForm}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Veri Paylaşım İzni</Text>
                  <Switch
                    value={userSettings?.data_sharing_consent ?? false}
                    onValueChange={(value) => handleSettingToggle('dataSharingConsent', value)}
                    trackColor={{ false: Colors.neutral.light, true: Colors.secondary.grass }}
                    thumbColor={Colors.neutral.white}
                  />
                </View>
                <Text style={styles.settingDescription}>
                  Anonim kullanım verilerini paylaşarak uygulamayı geliştirmemize yardımcı olun
                </Text>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Profil Görünürlüğü</Text>
                  <Pressable
                    style={styles.selectButton}
                    onPress={() => {
                      const newVisibility = userSettings?.profile_visibility === 'public' ? 'private' : 'public';
                      handleSettingToggle('profileVisibility', newVisibility as any);
                    }}
                  >
                    <Text style={styles.selectButtonText}>
                      {userSettings?.profile_visibility === 'public' ? '🌍 Herkese Açık' : '🔒 Gizli'}
                    </Text>
                  </Pressable>
                </View>
                <Text style={styles.settingDescription}>
                  Profilinizin görünürlüğünü ayarlayın
                </Text>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* General Settings Modal */}
        <Modal
          visible={showGeneralModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowGeneralModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowGeneralModal(false)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>⚙️ Genel Ayarlar</Text>
                <Pressable onPress={() => setShowGeneralModal(false)} style={styles.modalCloseButton}>
                  <X size={24} color={Colors.neutral.dark} />
                </Pressable>
              </View>

              <View style={styles.settingsForm}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Otomatik Kaydet</Text>
                  <Switch
                    value={userSettings?.auto_save ?? true}
                    onValueChange={(value) => handleSettingToggle('autoSave', value)}
                    trackColor={{ false: Colors.neutral.light, true: Colors.secondary.grass }}
                    thumbColor={Colors.neutral.white}
                  />
                </View>
                <Text style={styles.settingDescription}>
                  İçeriklerinizi otomatik olarak kaydedin
                </Text>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>İpuçlarını Göster</Text>
                  <Switch
                    value={userSettings?.show_tips ?? true}
                    onValueChange={(value) => handleSettingToggle('showTips', value)}
                    trackColor={{ false: Colors.neutral.light, true: Colors.secondary.grass }}
                    thumbColor={Colors.neutral.white}
                  />
                </View>
                <Text style={styles.settingDescription}>
                  Kullanım ipuçlarını görüntüle
                </Text>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Çocuk Kilidi</Text>
                  <Switch
                    value={userSettings?.child_lock_enabled ?? false}
                    onValueChange={(value) => handleSettingToggle('childLockEnabled', value)}
                    trackColor={{ false: Colors.neutral.light, true: Colors.secondary.grass }}
                    thumbColor={Colors.neutral.white}
                  />
                </View>
                <Text style={styles.settingDescription}>
                  Hassas içeriklere erişimi kısıtla
                </Text>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Theme Modal */}
        <Modal
          visible={showThemeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowThemeModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowThemeModal(false)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🎨 Tema Seçimi</Text>
                <Pressable onPress={() => setShowThemeModal(false)} style={styles.modalCloseButton}>
                  <X size={24} color={Colors.neutral.dark} />
                </Pressable>
              </View>

              <View style={styles.themeList}>
                {(Object.keys(THEMES) as Theme[]).map((theme) => {
                  const isSelected = (userSettings?.theme || 'light') === theme;
                  const themeInfo = THEMES[theme];

                  return (
                    <Pressable
                      key={theme}
                      style={({ pressed }) => [
                        styles.themeItem,
                        isSelected && styles.themeItemSelected,
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={async () => {
                        await handleSettingToggle('theme', theme);
                        setShowThemeModal(false);
                      }}
                    >
                      <Text style={styles.themeIcon}>{themeInfo.icon}</Text>
                      <View style={styles.themeInfo}>
                        <Text style={styles.themeName}>{themeInfo.name}</Text>
                        <Text style={styles.themeDescription}>{themeInfo.description}</Text>
                      </View>
                      {isSelected && (
                        <Check size={24} color={Colors.secondary.grass} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Children Modal */}
        <Modal
          visible={showChildrenModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowChildrenModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowChildrenModal(false)}
          >
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>👶 Çocuk Profili Ekle</Text>
                <Pressable onPress={() => setShowChildrenModal(false)} style={styles.modalCloseButton}>
                  <X size={24} color={Colors.neutral.dark} />
                </Pressable>
              </View>

              <View style={styles.profileEditForm}>
                <Text style={styles.inputLabel}>İsim</Text>
                <TextInput
                  style={styles.input}
                  value={childName}
                  onChangeText={setChildName}
                  placeholder="Çocuğunuzun adı"
                  placeholderTextColor={Colors.neutral.light}
                />

                <Text style={styles.inputLabel}>Yaş</Text>
                <TextInput
                  style={styles.input}
                  value={childAge}
                  onChangeText={setChildAge}
                  placeholder="Yaş (0-18)"
                  placeholderTextColor={Colors.neutral.light}
                  keyboardType="number-pad"
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.saveButton,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={handleAddChild}
                >
                  <LinearGradient
                    colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
                    style={styles.saveButtonGradient}
                  >
                    <Plus size={20} color={Colors.neutral.white} />
                    <Text style={styles.saveButtonText}>Ekle</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: layout.screenPadding,
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    width: "100%",
    maxWidth: 400,
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing["5"],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  modalTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  modalCloseButton: {
    padding: spacing["2"],
  },
  languageList: {
    padding: spacing["4"],
    gap: spacing["2"],
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing["4"],
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.lightest,
    gap: spacing["3"],
  },
  languageItemSelected: {
    backgroundColor: Colors.secondary.grassLight,
    borderWidth: 2,
    borderColor: Colors.secondary.grass,
  },
  languageFlag: {
    fontSize: typography.size["3xl"],
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
  },
  languageNameSecondary: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },
  // Profile Edit Form Styles
  profileEditForm: {
    padding: spacing["5"],
    gap: spacing["4"],
  },
  inputLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
    marginBottom: -spacing["2"],
  },
  input: {
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
    padding: spacing["4"],
    fontSize: typography.size.lg,
    color: Colors.neutral.darkest,
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  saveButton: {
    marginTop: spacing["2"],
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing["4"],
    borderRadius: radius.lg,
    gap: spacing["2"],
  },
  saveButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  // Settings Form Styles
  settingsForm: {
    padding: spacing["5"],
    gap: spacing["4"],
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing["1"],
  },
  settingLabel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
    flex: 1,
  },
  settingDescription: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    marginBottom: spacing["3"],
    lineHeight: typography.lineHeight.relaxed,
  },
  selectButton: {
    backgroundColor: Colors.secondary.grassLight,
    paddingHorizontal: spacing["4"],
    paddingVertical: spacing["2"],
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: Colors.secondary.grass,
  },
  selectButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
  },
  // Theme List Styles
  themeList: {
    padding: spacing["4"],
    gap: spacing["2"],
  },
  themeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing["4"],
    borderRadius: radius.lg,
    backgroundColor: Colors.neutral.lightest,
    gap: spacing["3"],
  },
  themeItemSelected: {
    backgroundColor: Colors.secondary.lavenderLight,
    borderWidth: 2,
    borderColor: Colors.secondary.lavender,
  },
  themeIcon: {
    fontSize: typography.size["3xl"],
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
  },
  themeDescription: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
  },
  // Children Section Styles
  childrenSection: {
    marginBottom: spacing["8"],
  },
  childrenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing["4"],
  },
  childrenTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  addChildButton: {
    backgroundColor: Colors.secondary.lavender,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.md,
  },
  childrenList: {
    marginHorizontal: -layout.screenPadding,
    paddingHorizontal: layout.screenPadding,
  },
  childCard: {
    marginRight: spacing["3"],
  },
  childCardGradient: {
    padding: spacing["5"],
    borderRadius: radius.xl,
    alignItems: "center",
    gap: spacing["2"],
    minWidth: 140,
    ...shadows.md,
  },
  childName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  childAge: {
    fontSize: typography.size.sm,
    color: Colors.neutral.white,
    opacity: 0.9,
  },
  removeChildButton: {
    position: "absolute",
    top: spacing["2"],
    right: spacing["2"],
    backgroundColor: Colors.neutral.white,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    ...shadows.sm,
  },
  addChildPrompt: {
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.xl,
    padding: spacing["8"],
    alignItems: "center",
    gap: spacing["3"],
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
    borderStyle: "dashed",
  },
  addChildPromptText: {
    fontSize: typography.size.md,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
});