import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Switch,
  Dimensions,
} from 'react-native';
import {
  Settings,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  BookOpen,
  Palette,
  Brain,
  Edit2,
  History,
  Check,
  X,
  Bell,
  Lock,
  Sun,
  Baby,
  Plus,
  Award,
  RefreshCw,
  Volume2,
  Vibrate,
  Shield,
  Users,
  Download,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Href } from 'expo-router';
import { useAuth } from '@/lib/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Colors } from '@/constants/colors';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useRole, ROLE_CONFIGS, type UserRole } from '@/lib/contexts/RoleContext';
import { AvatarPicker, AvatarDisplay } from '@/components/AvatarPicker';
import { BadgeGrid, BadgeUnlockModal } from '@/components/badges';
import { type BadgeRarity } from '@/constants/badges';
import { TokenUsageCard } from '@/components/quota/TokenUsageCard';
import { useQuota } from '@/hooks/useQuota';
import * as FileSystem from 'expo-file-system/legacy';
import { showConfirmDialog, showAlert, isWeb } from '@/lib/platform';
import {
  layout,
  typography,
  spacing,
  radius,
  shadows,
  textShadows,
  iconSizes,
  iconStroke,
} from '@/constants/design-system';
import { SoundSettings, HapticSettings, AppLockSettings } from '@/components/settings';
import { ChildProfileCard, AddChildWizard, DataExportOptions } from '@/components/profile';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

type Language = 'tr' | 'en' | 'de' | 'ru';
type Theme = 'light' | 'dark' | 'auto';

export default function ProfileScreen() {
  // Constants - defined inside component
  const LANGUAGES: Record<Language, { name: string; nativeName: string; flag: string }> = {
    tr: { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
    de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  };

  const DEFAULT_THEME: Theme = 'light';
  const THEMES: Record<Theme, { icon: string; name: string; description: string }> = {
    light: { icon: '☀️', name: 'Açık Tema', description: 'Gündüz için ideal' },
    dark: { icon: '🌙', name: 'Koyu Tema', description: 'Gece için ideal' },
    auto: { icon: '🔄', name: 'Otomatik', description: 'Sistem ayarlarına göre' },
  };

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout, refreshUserFromBackend } = useAuth();
  const { t, language, setLanguage: setAppLanguage } = useLanguage();
  const { role, setRole, config: roleConfig } = useRole();
  const [refreshing, setRefreshing] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showGeneralModal, setShowGeneralModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showChildrenModal, setShowChildrenModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showChildAvatarPicker, setShowChildAvatarPicker] = useState(false);
  const [editName, setEditName] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [selectedChildAvatarId, setSelectedChildAvatarId] = useState<string | undefined>();
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [showHapticModal, setShowHapticModal] = useState(false);
  const [showAppLockModal, setShowAppLockModal] = useState(false);
  const [showAddChildWizard, setShowAddChildWizard] = useState(false);
  const [showDataExportModal, setShowDataExportModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<{
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: BadgeRarity;
    isUnlocked?: boolean;
    progress?: {
      current: number;
      target: number;
      percentage: number;
    };
  } | null>(null);

  // Fetch user stats from backend
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = trpc.user.getUserStats.useQuery(undefined, { enabled: !!user?.userId, refetchOnMount: true });

  // Fetch user settings
  const { data: userSettings, refetch: refetchSettings } = trpc.user.getSettings.useQuery(
    undefined,
    { enabled: !!user?.userId }
  );

  // Fetch user badges
  const {
    data: badgesData,
    isLoading: badgesLoading,
    refetch: refetchBadges,
  } = trpc.badges.getUserBadges.useQuery(undefined, { enabled: !!user?.userId });

  // Fetch badge progress
  const { data: badgeProgress, refetch: refetchBadgeProgress } =
    trpc.badges.getBadgeProgress.useQuery(undefined, { enabled: !!user?.userId });

  // Quota data
  const { refetch: refetchQuota } = useQuota();

  // Sync user's backend language setting with local language context
  React.useEffect(() => {
    if (userSettings?.language && userSettings.language !== language) {
      setAppLanguage(userSettings.language as Language).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSettings?.language]);

  // Mutations
  const updateSettingsMutation = trpc.user.updateSettings.useMutation();
  const updateProfileMutation = trpc.user.updateProfile.useMutation();
  const uploadAvatarMutation = trpc.user.uploadAvatar.useMutation();

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchStats(),
      refetchSettings(),
      refetchBadges(),
      refetchBadgeProgress(),
      refetchQuota(),
    ]);
    setRefreshing(false);
  };

  const handleLanguageChange = async (selectedLang: Language) => {
    try {
      // Update local language context
      await setAppLanguage(selectedLang);

      // Update backend
      await updateSettingsMutation.mutateAsync({
        language: selectedLang,
      });
      await refetchSettings();
      setShowLanguageModal(false);
      showAlert(t.common.success, t.settings.language + ' ' + t.common.save.toLowerCase());
    } catch {
      showAlert(t.common.error, t.settings.language + ' ' + t.common.error.toLowerCase());
    }
  };

  const handleLogout = async () => {
    showConfirmDialog(
      t.profile.logout,
      t.profile.logoutConfirm,
      async () => {
        await logout();
        router.replace('/');
      },
      undefined,
      {
        confirmText: t.profile.logout,
        cancelText: t.common.cancel,
        destructive: true,
      }
    );
  };

  const handleEditProfile = () => {
    setShowAvatarPicker(true);
  };

  const handleAvatarChange = async (avatarId: string) => {
    try {
      await updateProfileMutation.mutateAsync({
        avatarUrl: avatarId, // Using avatarUrl field to store avatarId for now
      });
      await refreshUserFromBackend();
      showAlert(t.common.success, 'Avatar güncellendi!');
    } catch {
      showAlert(t.common.error, 'Avatar güncellenemedi. Lütfen tekrar deneyin.');
    }
  };

  const handlePhotoAvatarSelected = async (uri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imageData = `data:image/jpeg;base64,${base64}`;
      const result = await uploadAvatarMutation.mutateAsync({ imageData });
      // Update profile with the returned URL
      await updateProfileMutation.mutateAsync({
        avatarUrl: result.avatarUrl,
      });
      await refreshUserFromBackend();
      showAlert(t.common.success, 'Profil fotoğrafı güncellendi!');
    } catch {
      showAlert(t.common.error, 'Fotoğraf yüklenemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleEditName = () => {
    setEditName(user?.name || '');
    setShowProfileModal(true);
  };

  const handleProfileSave = async () => {
    if (!editName.trim()) {
      showAlert(t.common.error, t.profile.name);
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        name: editName.trim(),
      });
      setShowProfileModal(false);
      showAlert(t.common.success, t.profile.editProfile + ' ' + t.common.success.toLowerCase());
      await refreshUserFromBackend();
    } catch {
      showAlert(t.common.error, t.profile.editProfile + ' ' + t.common.error.toLowerCase());
    }
  };

  const handleSettingToggle = async (setting: string, value: boolean | string | number) => {
    try {
      await updateSettingsMutation.mutateAsync({
        [setting]: value,
      });
      await refetchSettings();
    } catch {
      showAlert('Hata', 'Ayar güncellenemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleAddChild = async () => {
    if (!childName.trim() || !childAge.trim()) {
      showAlert('Uyarı', 'Lütfen isim ve yaş bilgilerini girin.');
      return;
    }

    const age = parseInt(childAge);
    if (isNaN(age) || age < 0 || age > 18) {
      showAlert('Uyarı', 'Lütfen geçerli bir yaş girin (0-18).');
      return;
    }

    try {
      const currentChildren = user?.children || [];
      const newChild = {
        name: childName.trim(),
        age: age,
        avatarId: selectedChildAvatarId,
      };

      await updateProfileMutation.mutateAsync({
        children: [...currentChildren, newChild],
      });

      setChildName('');
      setChildAge('');
      setSelectedChildAvatarId(undefined);
      setShowChildrenModal(false);
      showAlert('Başarılı', 'Çocuk profili eklendi!');
      await refreshUserFromBackend();
    } catch {
      showAlert('Hata', 'Çocuk profili eklenemedi. Lütfen tekrar deneyin.');
    }
  };

  // Handle add child from wizard
  const handleAddChildFromWizard = async (childData: {
    name: string;
    age: number;
    avatarId?: string;
  }) => {
    try {
      const currentChildren = user?.children || [];
      const newChild = {
        name: childData.name,
        age: childData.age,
        avatarId: childData.avatarId,
      };

      await updateProfileMutation.mutateAsync({
        children: [...currentChildren, newChild],
      });

      showAlert('Başarılı', `${childData.name} profili eklendi!`);
      await refreshUserFromBackend();
    } catch {
      showAlert('Hata', 'Çocuk profili eklenemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleRemoveChild = async (index: number) => {
    try {
      const currentChildren = user?.children || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newChildren = currentChildren.filter((_: any, i: number) => i !== index);

      await updateProfileMutation.mutateAsync({
        children: newChildren,
      });

      showAlert('Başarılı', 'Çocuk profili silindi!');
      await refreshUserFromBackend();
    } catch {
      showAlert('Hata', 'Çocuk profili silinemedi. Lütfen tekrar deneyin.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={Colors.background.pageGradient} style={styles.gradientContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            !isWeb ? (
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            ) : undefined
          }
        >
          {/* Web Refresh Button */}
          {isWeb && (
            <Pressable
              style={({ pressed }) => [
                styles.webRefreshButton,
                pressed && { opacity: 0.7 },
                refreshing && { opacity: 0.5 },
              ]}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={20} color={Colors.secondary.grass} />
              <Text style={styles.webRefreshText}>{refreshing ? 'Yenileniyor...' : 'Yenile'}</Text>
            </Pressable>
          )}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Pressable onPress={handleEditProfile}>
                <AvatarDisplay avatarId={user?.avatarUrl} size={layout.icon.mega + 24} />
              </Pressable>
              <Pressable style={styles.editButton} onPress={handleEditProfile}>
                <Edit2 size={16} color={Colors.neutral.white} />
              </Pressable>
            </View>
            <Pressable onPress={handleEditName}>
              <Text style={styles.userName}>{user?.name || 'Hoş Geldiniz'}</Text>
            </Pressable>
            <Text style={styles.userEmail}>{user?.email || 'RenkiOO Kullanıcısı'}</Text>
          </View>

          {/* Children Profiles */}
          <View style={styles.childrenSection}>
            <View style={styles.childrenHeader}>
              <View style={styles.childrenTitleRow}>
                <Baby
                  size={iconSizes.small}
                  color={Colors.secondary.lavender}
                  strokeWidth={iconStroke.standard}
                />
                <Text style={styles.childrenTitle}>{t.profile.children}</Text>
                {user?.children && user.children.length > 0 && (
                  <View style={styles.childrenCount}>
                    <Text style={styles.childrenCountText}>{user.children.length}</Text>
                  </View>
                )}
              </View>
              <Pressable
                style={({ pressed }) => [styles.addChildButton, pressed && { opacity: 0.7 }]}
                onPress={() => setShowAddChildWizard(true)}
              >
                <Plus
                  size={iconSizes.small}
                  color={Colors.neutral.white}
                  strokeWidth={iconStroke.bold}
                />
              </Pressable>
            </View>

            {user?.children && user.children.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.childrenList}
              >
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {user.children.map((child: any, index: number) => (
                  <ChildProfileCard
                    key={index}
                    child={{
                      name: child.name,
                      age: child.age,
                      avatarId: child.avatarId,
                      lastActivity: child.lastActivity,
                      analysisCount: child.analysisCount,
                    }}
                    index={index}
                    onDelete={() => {
                      showConfirmDialog(
                        'Çocuk Profilini Sil',
                        `${child.name} adlı çocuk profilini silmek istediğinize emin misiniz?`,
                        () => handleRemoveChild(index),
                        undefined,
                        { confirmText: 'Sil', cancelText: 'İptal', destructive: true }
                      );
                    }}
                  />
                ))}
              </ScrollView>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.addChildPrompt, pressed && { opacity: 0.7 }]}
                onPress={() => setShowAddChildWizard(true)}
              >
                <Baby
                  size={iconSizes.hero}
                  color={Colors.neutral.light}
                  strokeWidth={iconStroke.thin}
                />
                <Text style={styles.addChildPromptText}>Çocuk profili ekleyin</Text>
                <Text style={styles.addChildPromptHint}>
                  Adım adım rehberlik ile kolayca ekleyin
                </Text>
              </Pressable>
            )}
          </View>

          {/* Stats Cards */}
          {statsLoading ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator size="large" color={Colors.secondary.grass} />
            </View>
          ) : (
            stats && (
              <View style={styles.statsContainer}>
                <Pressable
                  style={({ pressed }) => [
                    styles.statCard,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={() => router.push('/history' as Href)}
                >
                  <LinearGradient
                    colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
                    style={styles.statCardGradient}
                  >
                    <BookOpen size={32} color={Colors.neutral.white} />
                    <Text style={styles.statValue}>{stats.totalStorybooks || 0}</Text>
                    <Text style={styles.statLabel}>{t.profile.stories}</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.statCard,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={() => router.push('/history' as Href)}
                >
                  <LinearGradient
                    colors={[Colors.secondary.sky, Colors.secondary.skyLight]}
                    style={styles.statCardGradient}
                  >
                    <Palette size={32} color={Colors.neutral.white} />
                    <Text style={styles.statValue}>{stats.totalColorings || 0}</Text>
                    <Text style={styles.statLabel}>{t.profile.colorings}</Text>
                  </LinearGradient>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.statCard,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                  ]}
                  onPress={() => router.push('/history' as Href)}
                >
                  <LinearGradient
                    colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                    style={styles.statCardGradient}
                  >
                    <Brain size={32} color={Colors.neutral.white} />
                    <Text style={styles.statValue}>{stats.totalAnalyses || 0}</Text>
                    <Text style={styles.statLabel}>{t.profile.analyses}</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )
          )}

          <View style={styles.settingsSection}>
            <Text style={styles.settingsGroupTitle}>{t.profile.stats}</Text>
            <View style={styles.settingsGroup}>
              <Pressable
                style={({ pressed }) => [styles.compactMenuItem, pressed && { opacity: 0.7 }]}
                onPress={() => router.push('/history' as Href)}
              >
                <View
                  style={[styles.compactMenuIcon, { backgroundColor: 'rgba(126, 217, 156, 0.15)' }]}
                >
                  <History size={18} color={Colors.secondary.grass} />
                </View>
                <Text style={styles.compactMenuLabel}>{t.profile.stats}</Text>
                <Text style={styles.compactMenuValue}>
                  {(stats?.totalAnalyses || 0) +
                    (stats?.totalStorybooks || 0) +
                    (stats?.totalColorings || 0)}
                </Text>
                <ChevronRight size={16} color={Colors.neutral.light} />
              </Pressable>
            </View>
          </View>

          {/* Rozetler (Badges) Section */}
          <View style={styles.section}>
            <View style={styles.badgesSectionHeader}>
              <View style={styles.badgesTitleRow}>
                <Award size={20} color={Colors.primary.sunset} />
                <Text style={styles.sectionTitle}>Rozetlerim</Text>
              </View>
              {badgesData?.badges && (
                <View style={styles.badgesCountBadge}>
                  <Text style={styles.badgesCountText}>{badgesData.badges.length} kazanıldı</Text>
                </View>
              )}
            </View>
            <View style={styles.badgesContainer}>
              <BadgeGrid
                userBadges={badgesData?.badges || []}
                progress={badgeProgress?.progress || []}
                isLoading={badgesLoading}
                showProgress={true}
                onBadgePress={(badgeId, isUnlocked, badgeInfo) => {
                  // badgeInfo tüm rozet verilerini constants'dan alınabilir
                  const unlockedBadge = badgesData?.badges.find(b => b.id === badgeId);
                  const progressInfo = badgeProgress?.progress?.find(p => p.id === badgeId);

                  if (unlockedBadge) {
                    // Açık rozet
                    setSelectedBadge({
                      id: unlockedBadge.id,
                      name: unlockedBadge.name,
                      description: unlockedBadge.description,
                      icon: unlockedBadge.icon,
                      rarity: unlockedBadge.rarity as BadgeRarity,
                      isUnlocked: true,
                    });
                  } else if (badgeInfo) {
                    // Kilitli rozet - badgeInfo from constants
                    setSelectedBadge({
                      id: badgeInfo.id,
                      name: badgeInfo.name,
                      description: badgeInfo.description,
                      icon: badgeInfo.icon,
                      rarity: badgeInfo.rarity as BadgeRarity,
                      isUnlocked: false,
                      progress: progressInfo
                        ? {
                            current: progressInfo.current,
                            target: progressInfo.target,
                            percentage: progressInfo.percentage,
                          }
                        : undefined,
                    });
                  }
                  setShowBadgeModal(true);
                }}
              />
            </View>
          </View>

          {/* HESAP Group */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsGroupTitle}>HESAP</Text>
            <View style={styles.settingsGroup}>
              <Pressable
                style={({ pressed }) => [styles.compactMenuItem, pressed && { opacity: 0.7 }]}
                onPress={() => setShowLanguageModal(true)}
              >
                <View
                  style={[styles.compactMenuIcon, { backgroundColor: 'rgba(120, 200, 232, 0.15)' }]}
                >
                  <Globe size={18} color={Colors.secondary.sky} />
                </View>
                <Text style={styles.compactMenuLabel}>{t.settings.language}</Text>
                <Text style={styles.compactMenuValue}>
                  {userSettings?.language
                    ? LANGUAGES[userSettings.language as Language].nativeName
                    : 'Türkçe'}
                </Text>
                <ChevronRight size={16} color={Colors.neutral.light} />
              </Pressable>
              <View style={styles.compactMenuDivider} />
              <Pressable
                style={({ pressed }) => [styles.compactMenuItem, pressed && { opacity: 0.7 }]}
                onPress={() => setShowRoleModal(true)}
              >
                <View
                  style={[styles.compactMenuIcon, { backgroundColor: 'rgba(126, 217, 156, 0.15)' }]}
                >
                  <Users size={18} color={Colors.secondary.grass} />
                </View>
                <Text style={styles.compactMenuLabel}>Kullanıcı Rolü</Text>
                <Text style={styles.compactMenuValue}>{roleConfig.displayName}</Text>
                <ChevronRight size={16} color={Colors.neutral.light} />
              </Pressable>
            </View>
          </View>

          {/* Token Usage / Subscription Card */}
          <View style={styles.settingsSection}>
            <TokenUsageCard />
          </View>

          {/* TERCİHLER Group */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsGroupTitle}>TERCİHLER</Text>
            <View style={styles.settingsGroup}>
              <Pressable
                style={({ pressed }) => [styles.compactMenuItem, pressed && { opacity: 0.7 }]}
                onPress={() => setShowNotificationsModal(true)}
              >
                <View
                  style={[styles.compactMenuIcon, { backgroundColor: 'rgba(255, 213, 107, 0.15)' }]}
                >
                  <Bell size={18} color={Colors.secondary.sunshine} />
                </View>
                <Text style={styles.compactMenuLabel}>{t.settings.notifications}</Text>
                <ChevronRight size={16} color={Colors.neutral.light} />
              </Pressable>
              <View style={styles.compactMenuDivider} />
              <Pressable
                style={({ pressed }) => [styles.compactMenuItem, pressed && { opacity: 0.7 }]}
                onPress={() => setShowThemeModal(true)}
              >
                <View
                  style={[styles.compactMenuIcon, { backgroundColor: 'rgba(167, 139, 250, 0.15)' }]}
                >
                  <Sun size={18} color={Colors.secondary.lavender} />
                </View>
                <Text style={styles.compactMenuLabel}>{t.settings.theme}</Text>
                <Text style={styles.compactMenuValue}>
                  {userSettings?.theme === 'light'
                    ? 'Açık'
                    : userSettings?.theme === 'dark'
                      ? 'Koyu'
                      : 'Otomatik'}
                </Text>
                <ChevronRight size={16} color={Colors.neutral.light} />
              </Pressable>
              <View style={styles.compactMenuDivider} />
              <Pressable
                style={({ pressed }) => [styles.compactMenuItem, pressed && { opacity: 0.7 }]}
                onPress={() => setShowSoundModal(true)}
              >
                <View
                  style={[styles.compactMenuIcon, { backgroundColor: 'rgba(120, 200, 232, 0.15)' }]}
                >
                  <Volume2 size={18} color={Colors.secondary.sky} />
                </View>
                <Text style={styles.compactMenuLabel}>Ses Ayarları</Text>
                <ChevronRight size={16} color={Colors.neutral.light} />
              </Pressable>
              <View style={styles.compactMenuDivider} />
              <Pressable
                style={({ pressed }) => [styles.compactMenuItem, pressed && { opacity: 0.7 }]}
                onPress={() => setShowHapticModal(true)}
              >
                <View
                  style={[styles.compactMenuIcon, { backgroundColor: 'rgba(167, 139, 250, 0.15)' }]}
                >
                  <Vibrate size={18} color={Colors.secondary.lavender} />
                </View>
                <Text style={styles.compactMenuLabel}>Titreşim Ayarları</Text>
                <ChevronRight size={16} color={Colors.neutral.light} />
              </Pressable>
            </View>
          </View>

          {/* GÜVENLİK Group */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsGroupTitle}>GÜVENLİK</Text>
            <View style={styles.settingsGroup}>
              <Pressable
                style={({ pressed }) => [styles.compactMenuItem, pressed && { opacity: 0.7 }]}
                onPress={() => setShowPrivacyModal(true)}
              >
                <View
                  style={[styles.compactMenuIcon, { backgroundColor: 'rgba(126, 217, 156, 0.15)' }]}
                >
                  <Lock size={18} color={Colors.secondary.grass} />
                </View>
                <Text style={styles.compactMenuLabel}>{t.settings.privacy}</Text>
                <ChevronRight size={16} color={Colors.neutral.light} />
              </Pressable>
              <View style={styles.compactMenuDivider} />
              <Pressable
                style={({ pressed }) => [styles.compactMenuItem, pressed && { opacity: 0.7 }]}
                onPress={() => setShowAppLockModal(true)}
              >
                <View
                  style={[styles.compactMenuIcon, { backgroundColor: 'rgba(126, 217, 156, 0.15)' }]}
                >
                  <Shield size={18} color={Colors.secondary.grass} />
                </View>
                <Text style={styles.compactMenuLabel}>Uygulama Kilidi</Text>
                <ChevronRight size={16} color={Colors.neutral.light} />
              </Pressable>
              <View style={styles.compactMenuDivider} />
              <Pressable
                style={({ pressed }) => [styles.compactMenuItem, pressed && { opacity: 0.7 }]}
                onPress={() => setShowGeneralModal(true)}
              >
                <View
                  style={[styles.compactMenuIcon, { backgroundColor: 'rgba(160, 174, 192, 0.15)' }]}
                >
                  <Settings size={18} color={Colors.neutral.medium} />
                </View>
                <Text style={styles.compactMenuLabel}>{t.settings.general}</Text>
                <ChevronRight size={16} color={Colors.neutral.light} />
              </Pressable>
            </View>
          </View>

          {/* VERİ Group */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsGroupTitle}>VERİ</Text>
            <View style={styles.settingsGroup}>
              <Pressable
                style={({ pressed }) => [styles.compactMenuItem, pressed && { opacity: 0.7 }]}
                onPress={() => setShowDataExportModal(true)}
              >
                <View
                  style={[styles.compactMenuIcon, { backgroundColor: 'rgba(120, 200, 232, 0.15)' }]}
                >
                  <Download size={18} color={Colors.secondary.sky} />
                </View>
                <Text style={styles.compactMenuLabel}>Verilerimi İndir</Text>
                <ChevronRight size={16} color={Colors.neutral.light} />
              </Pressable>
            </View>
          </View>

          {/* DESTEK Group */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsGroupTitle}>DESTEK</Text>
            <View style={styles.settingsGroup}>
              <Pressable
                style={({ pressed }) => [styles.compactMenuItem, pressed && { opacity: 0.7 }]}
                onPress={() =>
                  showAlert(
                    t.settings.help,
                    'E-posta: destek@renkioo.com\n\n' +
                      'Uygulama Versiyonu: 1.0.0\n\n' +
                      'Web: www.renkioo.com\n\n' +
                      'Sorularınız için bize ulaşın!'
                  )
                }
              >
                <View
                  style={[styles.compactMenuIcon, { backgroundColor: 'rgba(255, 213, 107, 0.15)' }]}
                >
                  <HelpCircle size={18} color={Colors.secondary.sunshine} />
                </View>
                <Text style={styles.compactMenuLabel}>{t.settings.help}</Text>
                <ChevronRight size={16} color={Colors.neutral.light} />
              </Pressable>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.settingsSection}>
            <Pressable
              style={({ pressed }) => [styles.logoutCompactButton, pressed && { opacity: 0.7 }]}
              onPress={handleLogout}
            >
              <View
                style={[styles.compactMenuIcon, { backgroundColor: 'rgba(255, 138, 128, 0.15)' }]}
              >
                <LogOut size={18} color={Colors.semantic.error} />
              </View>
              <Text style={styles.logoutCompactText}>{t.profile.logout}</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Renkioo v1.0.0</Text>
            <Text style={styles.footerText}>Çocukların renkli hayal dünyası</Text>
          </View>
        </ScrollView>

        {/* Language Selector Modal */}
        <Modal
          visible={showLanguageModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowLanguageModal(false)}>
            <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🌍 {t.settings.language} / Language</Text>
                <Pressable
                  onPress={() => setShowLanguageModal(false)}
                  style={styles.modalCloseButton}
                >
                  <X size={24} color={Colors.neutral.dark} />
                </Pressable>
              </View>

              <View style={styles.languageList}>
                {(Object.keys(LANGUAGES) as Language[]).map(langCode => {
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
                      {isSelected && <Check size={24} color={Colors.secondary.grass} />}
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
          <Pressable style={styles.modalOverlay} onPress={() => setShowProfileModal(false)}>
            <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>✏️ {t.profile.editProfile}</Text>
                <Pressable
                  onPress={() => setShowProfileModal(false)}
                  style={styles.modalCloseButton}
                >
                  <X size={24} color={Colors.neutral.dark} />
                </Pressable>
              </View>

              <View style={styles.profileEditForm}>
                <Text style={styles.inputLabel}>{t.profile.name}</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder={t.profile.name}
                  placeholderTextColor={Colors.neutral.light}
                  autoFocus
                />

                <Pressable
                  style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.8 }]}
                  onPress={handleProfileSave}
                >
                  <LinearGradient
                    colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                    style={styles.saveButtonGradient}
                  >
                    <Check size={20} color={Colors.neutral.white} />
                    <Text style={styles.saveButtonText}>{t.common.save}</Text>
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
          <Pressable style={styles.modalOverlay} onPress={() => setShowNotificationsModal(false)}>
            <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🔔 {t.settings.notifications}</Text>
                <Pressable
                  onPress={() => setShowNotificationsModal(false)}
                  style={styles.modalCloseButton}
                >
                  <X size={24} color={Colors.neutral.dark} />
                </Pressable>
              </View>

              <View style={styles.settingsForm}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t.settings.notificationsEnabled}</Text>
                  <Switch
                    value={userSettings?.notifications_enabled ?? true}
                    onValueChange={value => handleSettingToggle('notificationsEnabled', value)}
                    trackColor={{ false: Colors.neutral.light, true: Colors.secondary.grass }}
                    thumbColor={Colors.neutral.white}
                  />
                </View>
                <Text style={styles.settingDescription}>
                  Uygulama bildirimlerini açın veya kapatın
                </Text>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t.settings.emailNotifications}</Text>
                  <Switch
                    value={userSettings?.email_notifications ?? false}
                    onValueChange={value => handleSettingToggle('emailNotifications', value)}
                    trackColor={{ false: Colors.neutral.light, true: Colors.secondary.grass }}
                    thumbColor={Colors.neutral.white}
                  />
                </View>
                <Text style={styles.settingDescription}>{t.settings.emailNotifications}</Text>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t.settings.pushNotifications}</Text>
                  <Switch
                    value={userSettings?.push_notifications ?? true}
                    onValueChange={value => handleSettingToggle('pushNotifications', value)}
                    trackColor={{ false: Colors.neutral.light, true: Colors.secondary.grass }}
                    thumbColor={Colors.neutral.white}
                  />
                </View>
                <Text style={styles.settingDescription}>Anlık bildirimler alın</Text>
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
          <Pressable style={styles.modalOverlay} onPress={() => setShowPrivacyModal(false)}>
            <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🔒 {t.settings.privacy}</Text>
                <Pressable
                  onPress={() => setShowPrivacyModal(false)}
                  style={styles.modalCloseButton}
                >
                  <X size={24} color={Colors.neutral.dark} />
                </Pressable>
              </View>

              <View style={styles.settingsForm}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t.settings.dataSharingConsent}</Text>
                  <Switch
                    value={userSettings?.data_sharing_consent ?? false}
                    onValueChange={value => handleSettingToggle('dataSharingConsent', value)}
                    trackColor={{ false: Colors.neutral.light, true: Colors.secondary.grass }}
                    thumbColor={Colors.neutral.white}
                  />
                </View>
                <Text style={styles.settingDescription}>
                  Anonim kullanım verilerini paylaşarak uygulamayı geliştirmemize yardımcı olun
                </Text>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t.settings.profileVisibility}</Text>
                  <Pressable
                    style={styles.selectButton}
                    onPress={() => {
                      const newVisibility =
                        userSettings?.profile_visibility === 'public' ? 'private' : 'public';
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      handleSettingToggle('profileVisibility', newVisibility as any);
                    }}
                  >
                    <Text style={styles.selectButtonText}>
                      {userSettings?.profile_visibility === 'public'
                        ? '🌍 Herkese Açık'
                        : '🔒 Gizli'}
                    </Text>
                  </Pressable>
                </View>
                <Text style={styles.settingDescription}>Profilinizin görünürlüğünü ayarlayın</Text>
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
          <Pressable style={styles.modalOverlay} onPress={() => setShowGeneralModal(false)}>
            <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>⚙️ {t.settings.general}</Text>
                <Pressable
                  onPress={() => setShowGeneralModal(false)}
                  style={styles.modalCloseButton}
                >
                  <X size={24} color={Colors.neutral.dark} />
                </Pressable>
              </View>

              <View style={styles.settingsForm}>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t.settings.autoSave}</Text>
                  <Switch
                    value={userSettings?.auto_save ?? true}
                    onValueChange={value => handleSettingToggle('autoSave', value)}
                    trackColor={{ false: Colors.neutral.light, true: Colors.secondary.grass }}
                    thumbColor={Colors.neutral.white}
                  />
                </View>
                <Text style={styles.settingDescription}>
                  İçeriklerinizi otomatik olarak kaydedin
                </Text>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t.settings.showTips}</Text>
                  <Switch
                    value={userSettings?.show_tips ?? true}
                    onValueChange={value => handleSettingToggle('showTips', value)}
                    trackColor={{ false: Colors.neutral.light, true: Colors.secondary.grass }}
                    thumbColor={Colors.neutral.white}
                  />
                </View>
                <Text style={styles.settingDescription}>{t.settings.showTips}</Text>

                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{t.settings.childLock}</Text>
                  <Switch
                    value={userSettings?.child_lock_enabled ?? false}
                    onValueChange={value => handleSettingToggle('childLockEnabled', value)}
                    trackColor={{ false: Colors.neutral.light, true: Colors.secondary.grass }}
                    thumbColor={Colors.neutral.white}
                  />
                </View>
                <Text style={styles.settingDescription}>Hassas içeriklere erişimi kısıtla</Text>
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
          <Pressable style={styles.modalOverlay} onPress={() => setShowThemeModal(false)}>
            <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🎨 {t.settings.theme}</Text>
                <Pressable onPress={() => setShowThemeModal(false)} style={styles.modalCloseButton}>
                  <X size={24} color={Colors.neutral.dark} />
                </Pressable>
              </View>

              <View style={styles.themeList}>
                {(Object.keys(THEMES) as Theme[]).map(theme => {
                  const isSelected = (userSettings?.theme || DEFAULT_THEME) === theme;
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
                      {isSelected && <Check size={24} color={Colors.secondary.grass} />}
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
          <Pressable style={styles.modalOverlay} onPress={() => setShowChildrenModal(false)}>
            <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>👶 {t.profile.addChild}</Text>
                <Pressable
                  onPress={() => setShowChildrenModal(false)}
                  style={styles.modalCloseButton}
                >
                  <X size={24} color={Colors.neutral.dark} />
                </Pressable>
              </View>

              <View style={styles.profileEditForm}>
                <Text style={styles.inputLabel}>Avatar</Text>
                <Pressable
                  style={styles.avatarSelector}
                  onPress={() => setShowChildAvatarPicker(true)}
                >
                  <AvatarDisplay avatarId={selectedChildAvatarId} size={64} />
                  <Text style={styles.avatarSelectorText}>
                    {selectedChildAvatarId ? 'Avatar Değiştir' : 'Avatar Seç'}
                  </Text>
                </Pressable>

                <Text style={styles.inputLabel}>{t.profile.childName}</Text>
                <TextInput
                  style={styles.input}
                  value={childName}
                  onChangeText={setChildName}
                  placeholder={t.profile.childName}
                  placeholderTextColor={Colors.neutral.light}
                />

                <Text style={styles.inputLabel}>{t.profile.childAge}</Text>
                <TextInput
                  style={styles.input}
                  value={childAge}
                  onChangeText={setChildAge}
                  placeholder={t.profile.childAge + ' (0-18)'}
                  placeholderTextColor={Colors.neutral.light}
                  keyboardType="number-pad"
                />

                <Pressable
                  style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.8 }]}
                  onPress={handleAddChild}
                >
                  <LinearGradient
                    colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
                    style={styles.saveButtonGradient}
                  >
                    <Plus size={20} color={Colors.neutral.white} />
                    <Text style={styles.saveButtonText}>{t.common.add}</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Avatar Picker for Profile */}
        <AvatarPicker
          visible={showAvatarPicker}
          selectedAvatarId={user?.avatarUrl}
          onSelect={handleAvatarChange}
          onPhotoSelected={handlePhotoAvatarSelected}
          onClose={() => setShowAvatarPicker(false)}
        />

        {/* Avatar Picker for Child */}
        <AvatarPicker
          visible={showChildAvatarPicker}
          selectedAvatarId={selectedChildAvatarId}
          onSelect={avatarId => {
            setSelectedChildAvatarId(avatarId);
            setShowChildAvatarPicker(false);
          }}
          onClose={() => setShowChildAvatarPicker(false)}
        />

        {/* Badge Unlock Modal */}
        <BadgeUnlockModal
          visible={showBadgeModal}
          onClose={() => {
            setShowBadgeModal(false);
            setSelectedBadge(null);
          }}
          badge={selectedBadge}
        />

        {/* Sound Settings Modal */}
        <SoundSettings visible={showSoundModal} onClose={() => setShowSoundModal(false)} />

        {/* Haptic Settings Modal */}
        <HapticSettings visible={showHapticModal} onClose={() => setShowHapticModal(false)} />

        {/* App Lock Settings Modal */}
        <AppLockSettings visible={showAppLockModal} onClose={() => setShowAppLockModal(false)} />

        {/* Role Selection Modal */}
        <Modal
          visible={showRoleModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowRoleModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowRoleModal(false)}>
            <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>👤 Kullanıcı Rolü</Text>
                <Pressable onPress={() => setShowRoleModal(false)} style={styles.modalCloseButton}>
                  <X size={24} color={Colors.neutral.dark} />
                </Pressable>
              </View>

              <View style={styles.themeList}>
                {(Object.keys(ROLE_CONFIGS) as UserRole[]).map(roleKey => {
                  const roleInfo = ROLE_CONFIGS[roleKey];
                  const isSelected = role === roleKey;

                  return (
                    <Pressable
                      key={roleKey}
                      style={({ pressed }) => [
                        styles.themeItem,
                        isSelected && styles.themeItemSelected,
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={async () => {
                        await setRole(roleKey);
                        setShowRoleModal(false);
                        showAlert('Başarılı', `Rol "${roleInfo.displayName}" olarak değiştirildi.`);
                      }}
                    >
                      <Text style={styles.themeIcon}>
                        {roleKey === 'parent' ? '👨‍👩‍👧' : roleKey === 'teacher' ? '👩‍🏫' : '🩺'}
                      </Text>
                      <View style={styles.themeInfo}>
                        <Text style={styles.themeName}>{roleInfo.displayName}</Text>
                        <Text style={styles.themeDescription}>{roleInfo.description}</Text>
                      </View>
                      {isSelected && <Check size={24} color={Colors.secondary.grass} />}
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ paddingHorizontal: spacing['4'], paddingBottom: spacing['4'] }}>
                <Text
                  style={{
                    fontSize: typography.size.xs,
                    color: Colors.neutral.medium,
                    textAlign: 'center',
                  }}
                >
                  {"Rolünüz UI'ı ve kullanılabilir özellikleri değiştirir"}
                </Text>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Add Child Wizard */}
        <AddChildWizard
          visible={showAddChildWizard}
          onClose={() => setShowAddChildWizard(false)}
          onComplete={handleAddChildFromWizard}
        />

        {/* Data Export Options */}
        <DataExportOptions
          visible={showDataExportModal}
          onClose={() => setShowDataExportModal(false)}
          onDeleteAccount={() => {
            setShowDataExportModal(false);
            showConfirmDialog(
              'Hesabı Sil',
              'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinecektir.',
              () => {
                // Account deletion is handled via support email for safety
                showAlert(
                  'Bilgi',
                  'Hesap silme işlemi için destek@renkioo.com adresine e-posta gönderin.'
                );
              },
              undefined,
              { confirmText: 'Hesabı Sil', cancelText: 'Vazgeç', destructive: true }
            );
          }}
        />
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
    alignItems: 'center',
    marginBottom: spacing['10'],
  },
  avatarContainer: {
    marginBottom: spacing['5'],
    position: 'relative',
  },
  avatar: {
    width: layout.icon.mega + 24,
    height: layout.icon.mega + 24,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: Colors.neutral.white,
    ...shadows.xl,
  },
  editButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: Colors.secondary.sky,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.neutral.white,
    ...shadows.md,
  },
  statsLoading: {
    paddingVertical: spacing['10'],
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: isSmallDevice ? spacing['2'] : spacing['3'],
    marginBottom: spacing['8'],
  },
  statCard: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: isSmallDevice ? spacing['4'] : spacing['5'],
    borderRadius: radius.xl,
    alignItems: 'center',
    gap: isSmallDevice ? spacing['2'] : spacing['3'],
    ...shadows.md,
  },
  statValue: {
    fontSize: isSmallDevice ? typography.size['2xl'] : typography.size['3xl'],
    fontWeight: typography.weight.extrabold,
    color: Colors.neutral.white,
    letterSpacing: typography.letterSpacing.tight,
    ...textShadows.md,
  },
  statLabel: {
    fontSize: isSmallDevice ? typography.size.xs : typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.white,
    opacity: 0.95,
    textTransform: 'uppercase' as const,
    letterSpacing: typography.letterSpacing.wide,
    ...textShadows.sm,
  },
  userName: {
    fontSize: isSmallDevice ? typography.size['2xl'] : typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing['2'],
    letterSpacing: typography.letterSpacing.tight,
    ...textShadows.sm,
  },
  userEmail: {
    fontSize: isSmallDevice ? typography.size.sm : typography.size.md,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  section: {
    marginBottom: spacing['8'],
  },
  sectionTitle: {
    fontSize: isSmallDevice ? typography.size.xs : typography.size.sm,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.medium,
    textTransform: 'uppercase' as const,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing['4'],
    paddingHorizontal: spacing['1'],
  },
  // Compact Settings Styles
  settingsSection: {
    marginBottom: spacing['4'],
  },
  settingsGroupTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.medium,
    textTransform: 'uppercase' as const,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing['2'],
    paddingHorizontal: spacing['1'],
  },
  settingsGroup: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  compactMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    backgroundColor: Colors.neutral.white,
  },
  compactMenuDivider: {
    height: 1,
    backgroundColor: Colors.neutral.lightest,
    marginLeft: 56,
  },
  compactMenuIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing['3'],
  },
  compactMenuLabel: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: Colors.neutral.darkest,
  },
  compactMenuValue: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    marginRight: spacing['2'],
  },
  logoutCompactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    ...shadows.sm,
  },
  logoutCompactText: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: Colors.semantic.error,
  },
  badge: {
    backgroundColor: Colors.secondary.sunshineLight,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: Colors.secondary.sunshine,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: '#8B5A00',
    letterSpacing: typography.letterSpacing.wide,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing['8'],
    gap: spacing['2'],
  },
  footerText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.screenPadding,
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: radius.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isSmallDevice ? spacing['4'] : spacing['5'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  modalTitle: {
    fontSize: isSmallDevice ? typography.size.lg : typography.size.xl,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
    ...textShadows.sm,
  },
  modalCloseButton: {
    padding: spacing['2'],
  },
  languageList: {
    padding: spacing['4'],
    gap: spacing['2'],
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isSmallDevice ? spacing['3'] : spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    gap: spacing['3'],
  },
  languageItemSelected: {
    backgroundColor: Colors.secondary.grassLight,
    borderWidth: 2,
    borderColor: Colors.secondary.grass,
  },
  languageFlag: {
    fontSize: typography.size['3xl'],
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: isSmallDevice ? typography.size.base : typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
  },
  languageNameSecondary: {
    fontSize: isSmallDevice ? typography.size.xs : typography.size.sm,
    color: Colors.neutral.medium,
  },
  // Profile Edit Form Styles
  profileEditForm: {
    padding: isSmallDevice ? spacing['4'] : spacing['5'],
    gap: spacing['4'],
  },
  inputLabel: {
    fontSize: isSmallDevice ? typography.size.xs : typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.dark,
    marginBottom: -spacing['2'],
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: radius.lg,
    padding: isSmallDevice ? spacing['3'] : spacing['4'],
    fontSize: isSmallDevice ? typography.size.base : typography.size.lg,
    color: Colors.neutral.darkest,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  saveButton: {
    marginTop: spacing['2'],
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['4'],
    borderRadius: radius.lg,
    gap: spacing['2'],
  },
  saveButtonText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.white,
  },
  // Settings Form Styles
  settingsForm: {
    padding: isSmallDevice ? spacing['4'] : spacing['5'],
    gap: spacing['4'],
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['1'],
  },
  settingLabel: {
    fontSize: isSmallDevice ? typography.size.sm : typography.size.md,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
    flex: 1,
  },
  settingDescription: {
    fontSize: isSmallDevice ? typography.size.xs : typography.size.sm,
    color: Colors.neutral.medium,
    marginBottom: spacing['3'],
    lineHeight: 20,
  },
  selectButton: {
    backgroundColor: Colors.secondary.grassLight,
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
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
    padding: spacing['4'],
    gap: spacing['2'],
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isSmallDevice ? spacing['3'] : spacing['4'],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    gap: spacing['3'],
  },
  themeItemSelected: {
    backgroundColor: Colors.secondary.lavenderLight,
    borderWidth: 2,
    borderColor: Colors.secondary.lavender,
  },
  themeIcon: {
    fontSize: typography.size['3xl'],
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: isSmallDevice ? typography.size.base : typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: Colors.neutral.darkest,
  },
  themeDescription: {
    fontSize: isSmallDevice ? typography.size.xs : typography.size.sm,
    color: Colors.neutral.medium,
  },
  // Children Section Styles
  childrenSection: {
    marginBottom: spacing['8'],
  },
  childrenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['4'],
  },
  childrenTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  childrenTitle: {
    fontSize: isSmallDevice ? typography.size.base : typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  childrenCount: {
    backgroundColor: Colors.secondary.lavenderLight,
    paddingHorizontal: spacing['2'],
    paddingVertical: spacing['1'],
    borderRadius: radius.full,
  },
  childrenCountText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: Colors.secondary.lavender,
  },
  addChildButton: {
    backgroundColor: Colors.secondary.lavender,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  childrenList: {
    marginHorizontal: -layout.screenPadding,
    paddingHorizontal: layout.screenPadding,
  },
  childCard: {
    marginRight: spacing['3'],
  },
  childCardGradient: {
    padding: spacing['5'],
    borderRadius: radius.xl,
    alignItems: 'center',
    gap: spacing['2'],
    minWidth: 140,
    ...shadows.md,
  },
  childName: {
    fontSize: isSmallDevice ? typography.size.base : typography.size.lg,
    fontWeight: typography.weight.bold,
    color: Colors.neutral.darkest,
  },
  childAge: {
    fontSize: isSmallDevice ? typography.size.xs : typography.size.sm,
    color: Colors.neutral.medium,
    opacity: 0.9,
  },
  removeChildButton: {
    position: 'absolute',
    top: spacing['2'],
    right: spacing['2'],
    backgroundColor: Colors.neutral.white,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  addChildPrompt: {
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.xl,
    padding: spacing['8'],
    alignItems: 'center',
    gap: spacing['3'],
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
    borderStyle: 'dashed',
  },
  addChildPromptText: {
    fontSize: typography.size.md,
    color: Colors.neutral.medium,
    fontWeight: typography.weight.medium,
  },
  addChildPromptHint: {
    fontSize: typography.size.xs,
    color: Colors.neutral.light,
    fontWeight: typography.weight.regular,
    marginTop: -spacing['2'],
  },
  childCardContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: isSmallDevice ? spacing['4'] : spacing['5'],
    borderRadius: radius.xl,
    alignItems: 'center',
    gap: spacing['2'],
    minWidth: isSmallDevice ? 120 : 140,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...shadows.md,
  },
  // Avatar Selector Styles
  avatarSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['4'],
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
    padding: spacing['4'],
    borderWidth: 2,
    borderColor: Colors.neutral.lighter,
  },
  avatarSelectorText: {
    fontSize: typography.size.md,
    color: Colors.neutral.dark,
    fontWeight: typography.weight.semibold,
  },
  // Web Refresh Button
  webRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.lg,
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['4'],
    marginBottom: spacing['4'],
    borderWidth: 2,
    borderColor: Colors.secondary.grassLight,
    ...shadows.sm,
  },
  webRefreshText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: Colors.secondary.grass,
  },
  // Badges Section Styles
  badgesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  badgesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  badgesCountBadge: {
    backgroundColor: 'rgba(255, 155, 122, 0.15)',
    paddingHorizontal: spacing['3'],
    paddingVertical: spacing['1'],
    borderRadius: radius.full,
  },
  badgesCountText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: Colors.primary.sunset,
  },
  badgesContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius.xl,
    padding: isSmallDevice ? spacing['3'] : spacing['4'],
    borderWidth: 2,
    borderColor: 'rgba(255, 155, 122, 0.2)',
    ...shadows.lg,
  },
});
