/**
 * Data Privacy Settings Component
 * KVKK/GDPR compliant data management UI for professionals
 * Part of #18: Uzman/Klinisyen Modu UI Tasarımı
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import {
  Shield,
  Lock,
  Trash2,
  Download,
  FileText,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Database,
  UserX,
  RefreshCw,
} from 'lucide-react-native';
import { spacing, radius, shadows, typography } from '@/constants/design-system';
import { Colors, ProfessionalColors } from '@/constants/colors';

interface DataRetentionSettings {
  analysisRetentionDays: number;
  clientDataRetentionDays: number;
  autoDeleteEnabled: boolean;
  anonymizeOnDelete: boolean;
}

interface ConsentRecord {
  id: string;
  clientName: string;
  consentType: 'processing' | 'storage' | 'sharing' | 'research';
  grantedAt: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'revoked';
}

interface DataPrivacySettingsProps {
  retentionSettings: DataRetentionSettings;
  consentRecords: ConsentRecord[];
  onUpdateRetention: (settings: DataRetentionSettings) => void;
  onExportData: (type: 'all' | 'client' | 'analysis') => void;
  onDeleteData: (type: 'all' | 'client' | 'analysis', clientId?: string) => void;
  onAnonymizeData: (clientId: string) => void;
  onRefreshConsents: () => void;
}

const CONSENT_TYPE_LABELS: Record<string, { label: string; description: string }> = {
  processing: { label: 'Veri İşleme', description: 'Kişisel verilerin işlenmesi' },
  storage: { label: 'Veri Saklama', description: 'Verilerin sistemde saklanması' },
  sharing: { label: 'Veri Paylaşımı', description: 'Üçüncü taraflarla paylaşım' },
  research: { label: 'Araştırma', description: 'Bilimsel araştırma amaçlı kullanım' },
};

const RETENTION_OPTIONS = [
  { value: 30, label: '30 gün' },
  { value: 90, label: '3 ay' },
  { value: 180, label: '6 ay' },
  { value: 365, label: '1 yıl' },
  { value: 730, label: '2 yıl' },
  { value: 1825, label: '5 yıl' },
  { value: -1, label: 'Süresiz' },
];

export function DataPrivacySettings({
  retentionSettings,
  consentRecords,
  onUpdateRetention,
  onExportData,
  onDeleteData,

  onRefreshConsents,
}: DataPrivacySettingsProps) {
  const [showRetentionPicker, setShowRetentionPicker] = useState<'analysis' | 'client' | null>(
    null
  );
  const [localSettings, setLocalSettings] = useState(retentionSettings);

  const handleRetentionChange = (type: 'analysis' | 'client', days: number) => {
    const newSettings = {
      ...localSettings,
      [type === 'analysis' ? 'analysisRetentionDays' : 'clientDataRetentionDays']: days,
    };
    setLocalSettings(newSettings);
    onUpdateRetention(newSettings);
    setShowRetentionPicker(null);
  };

  const handleToggle = (key: 'autoDeleteEnabled' | 'anonymizeOnDelete') => {
    const newSettings = {
      ...localSettings,
      [key]: !localSettings[key],
    };
    setLocalSettings(newSettings);
    onUpdateRetention(newSettings);
  };

  const confirmDelete = (type: 'all' | 'client' | 'analysis') => {
    const titles = {
      all: 'Tüm Verileri Sil',
      client: 'Danışan Verilerini Sil',
      analysis: 'Analiz Verilerini Sil',
    };

    Alert.alert(titles[type], 'Bu işlem geri alınamaz. Devam etmek istediğinizden emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => onDeleteData(type),
      },
    ]);
  };

  const getRetentionLabel = (days: number) => {
    const option = RETENTION_OPTIONS.find(o => o.value === days);
    return option?.label || `${days} gün`;
  };

  const activeConsents = consentRecords.filter(c => c.status === 'active').length;
  const expiredConsents = consentRecords.filter(c => c.status === 'expired').length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* KVKK Compliance Banner */}
      <View style={styles.complianceBanner}>
        <View style={styles.bannerHeader}>
          <Shield size={24} color="#059669" />
          <View style={styles.bannerHeaderText}>
            <Text style={styles.bannerTitle}>KVKK/GDPR Uyumlu</Text>
            <Text style={styles.bannerSubtitle}>Veri koruma standartlarına uygun</Text>
          </View>
          <CheckCircle size={20} color="#059669" />
        </View>
        <View style={styles.complianceChecks}>
          <View style={styles.checkItem}>
            <CheckCircle size={14} color="#059669" />
            <Text style={styles.checkText}>Şifrelenmiş veri saklama</Text>
          </View>
          <View style={styles.checkItem}>
            <CheckCircle size={14} color="#059669" />
            <Text style={styles.checkText}>Aydınlatılmış onam takibi</Text>
          </View>
          <View style={styles.checkItem}>
            <CheckCircle size={14} color="#059669" />
            <Text style={styles.checkText}>Veri taşınabilirliği</Text>
          </View>
          <View style={styles.checkItem}>
            <CheckCircle size={14} color="#059669" />
            <Text style={styles.checkText}>Silme/Anonimleştirme hakkı</Text>
          </View>
        </View>
      </View>

      {/* Consent Records Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Users size={20} color={ProfessionalColors.trust.primary} />
            <Text style={styles.sectionTitle}>Onam Kayıtları</Text>
          </View>
          <Pressable onPress={onRefreshConsents} style={styles.refreshButton}>
            <RefreshCw size={16} color={ProfessionalColors.trust.primary} />
          </Pressable>
        </View>

        <View style={styles.consentSummary}>
          <View style={styles.consentStat}>
            <Text style={styles.consentStatValue}>{activeConsents}</Text>
            <Text style={styles.consentStatLabel}>Aktif</Text>
          </View>
          <View style={styles.consentDivider} />
          <View style={styles.consentStat}>
            <Text style={[styles.consentStatValue, expiredConsents > 0 && styles.warningText]}>
              {expiredConsents}
            </Text>
            <Text style={styles.consentStatLabel}>Süresi Dolmuş</Text>
          </View>
          <View style={styles.consentDivider} />
          <View style={styles.consentStat}>
            <Text style={styles.consentStatValue}>{consentRecords.length}</Text>
            <Text style={styles.consentStatLabel}>Toplam</Text>
          </View>
        </View>

        {/* Recent Consents */}
        {consentRecords.slice(0, 3).map(consent => (
          <View key={consent.id} style={styles.consentItem}>
            <View style={styles.consentItemLeft}>
              <Text style={styles.consentClientName}>{consent.clientName}</Text>
              <Text style={styles.consentType}>
                {CONSENT_TYPE_LABELS[consent.consentType]?.label || consent.consentType}
              </Text>
            </View>
            <View
              style={[
                styles.consentStatusBadge,
                consent.status === 'active' && styles.statusActive,
                consent.status === 'expired' && styles.statusExpired,
                consent.status === 'revoked' && styles.statusRevoked,
              ]}
            >
              <Text
                style={[
                  styles.consentStatusText,
                  consent.status === 'active' && styles.statusActiveText,
                  consent.status === 'expired' && styles.statusExpiredText,
                  consent.status === 'revoked' && styles.statusRevokedText,
                ]}
              >
                {consent.status === 'active'
                  ? 'Aktif'
                  : consent.status === 'expired'
                    ? 'Doldu'
                    : 'İptal'}
              </Text>
            </View>
          </View>
        ))}

        {consentRecords.length > 3 && (
          <Pressable style={styles.seeMoreButton}>
            <Text style={styles.seeMoreText}>Tüm Onamları Görüntüle</Text>
            <ChevronRight size={16} color={ProfessionalColors.trust.primary} />
          </Pressable>
        )}
      </View>

      {/* Data Retention Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Clock size={20} color={ProfessionalColors.trust.primary} />
            <Text style={styles.sectionTitle}>Veri Saklama Süreleri</Text>
          </View>
        </View>

        <Pressable style={styles.settingRow} onPress={() => setShowRetentionPicker('analysis')}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Analiz Verileri</Text>
            <Text style={styles.settingDescription}>Çizim analizleri ve sonuçlar</Text>
          </View>
          <View style={styles.settingValue}>
            <Text style={styles.settingValueText}>
              {getRetentionLabel(localSettings.analysisRetentionDays)}
            </Text>
            <ChevronRight size={16} color={ProfessionalColors.text.tertiary} />
          </View>
        </Pressable>

        <Pressable style={styles.settingRow} onPress={() => setShowRetentionPicker('client')}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Danışan Verileri</Text>
            <Text style={styles.settingDescription}>Kişisel bilgiler ve profiller</Text>
          </View>
          <View style={styles.settingValue}>
            <Text style={styles.settingValueText}>
              {getRetentionLabel(localSettings.clientDataRetentionDays)}
            </Text>
            <ChevronRight size={16} color={ProfessionalColors.text.tertiary} />
          </View>
        </Pressable>

        {/* Retention Picker */}
        {showRetentionPicker && (
          <View style={styles.pickerContainer}>
            {RETENTION_OPTIONS.map(option => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.pickerOption,
                  pressed && styles.pickerOptionPressed,
                  (showRetentionPicker === 'analysis'
                    ? localSettings.analysisRetentionDays
                    : localSettings.clientDataRetentionDays) === option.value &&
                    styles.pickerOptionSelected,
                ]}
                onPress={() => handleRetentionChange(showRetentionPicker, option.value)}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    (showRetentionPicker === 'analysis'
                      ? localSettings.analysisRetentionDays
                      : localSettings.clientDataRetentionDays) === option.value &&
                      styles.pickerOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.toggleRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Otomatik Silme</Text>
            <Text style={styles.settingDescription}>Süre dolunca otomatik sil</Text>
          </View>
          <Switch
            value={localSettings.autoDeleteEnabled}
            onValueChange={() => handleToggle('autoDeleteEnabled')}
            trackColor={{ false: Colors.neutral.gray200, true: ProfessionalColors.trust.primary }}
            thumbColor={Colors.neutral.white}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Silmede Anonimleştir</Text>
            <Text style={styles.settingDescription}>İstatistik amaçlı anonim veri tut</Text>
          </View>
          <Switch
            value={localSettings.anonymizeOnDelete}
            onValueChange={() => handleToggle('anonymizeOnDelete')}
            trackColor={{ false: Colors.neutral.gray200, true: ProfessionalColors.trust.primary }}
            thumbColor={Colors.neutral.white}
          />
        </View>
      </View>

      {/* Data Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Database size={20} color={ProfessionalColors.trust.primary} />
            <Text style={styles.sectionTitle}>Veri İşlemleri</Text>
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.actionGroup}>
          <Text style={styles.actionGroupTitle}>Veri Dışa Aktarma</Text>
          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            onPress={() => onExportData('all')}
          >
            <Download size={18} color={ProfessionalColors.trust.primary} />
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonText}>Tüm Verileri Dışa Aktar</Text>
              <Text style={styles.actionButtonDescription}>JSON/CSV formatında</Text>
            </View>
            <ChevronRight size={16} color={ProfessionalColors.text.tertiary} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            onPress={() => onExportData('client')}
          >
            <FileText size={18} color={ProfessionalColors.trust.primary} />
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonText}>Danışan Raporu</Text>
              <Text style={styles.actionButtonDescription}>Veri taşınabilirliği (KVKK Md.10)</Text>
            </View>
            <ChevronRight size={16} color={ProfessionalColors.text.tertiary} />
          </Pressable>
        </View>

        {/* Delete Options */}
        <View style={[styles.actionGroup, styles.dangerGroup]}>
          <Text style={[styles.actionGroupTitle, styles.dangerTitle]}>Tehlikeli Bölge</Text>

          <View style={styles.warningBanner}>
            <AlertTriangle size={16} color="#DC2626" />
            <Text style={styles.warningText}>Bu işlemler geri alınamaz</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.dangerButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={() => confirmDelete('analysis')}
          >
            <Trash2 size={18} color="#DC2626" />
            <View style={styles.actionButtonContent}>
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                Analiz Verilerini Sil
              </Text>
              <Text style={styles.actionButtonDescription}>Tüm analiz sonuçları silinir</Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.dangerButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={() => confirmDelete('client')}
          >
            <UserX size={18} color="#DC2626" />
            <View style={styles.actionButtonContent}>
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                Danışan Verilerini Sil
              </Text>
              <Text style={styles.actionButtonDescription}>Tüm kişisel veriler silinir</Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.dangerButtonFull,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={() => confirmDelete('all')}
          >
            <Trash2 size={18} color={Colors.neutral.white} />
            <Text style={styles.dangerButtonFullText}>Tüm Verileri Sil</Text>
          </Pressable>
        </View>
      </View>

      {/* Security Info */}
      <View style={styles.securityInfo}>
        <Lock size={16} color={ProfessionalColors.text.tertiary} />
        <Text style={styles.securityText}>
          Tüm veriler AES-256 şifreleme ile korunmaktadır. Veri işleme faaliyetleri KVKK ve GDPR
          standartlarına uygundur.
        </Text>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.gray50,
  },
  complianceBanner: {
    backgroundColor: '#ECFDF5',
    margin: spacing['4'],
    borderRadius: radius.xl,
    padding: spacing['4'],
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginBottom: spacing['3'],
  },
  bannerHeaderText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontFamily: typography.family.bold,
    color: '#047857',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
  },
  complianceChecks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '48%',
  },
  checkText: {
    fontSize: 12,
    color: '#047857',
  },
  section: {
    backgroundColor: Colors.neutral.white,
    marginHorizontal: spacing['4'],
    marginBottom: spacing['3'],
    borderRadius: radius.xl,
    padding: spacing['4'],
    borderWidth: 1,
    borderColor: Colors.neutral.gray100,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing['3'],
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: typography.family.bold,
    color: ProfessionalColors.text.primary,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ProfessionalColors.trust.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentSummary: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: radius.lg,
    padding: spacing['3'],
    marginBottom: spacing['3'],
  },
  consentStat: {
    flex: 1,
    alignItems: 'center',
  },
  consentStatValue: {
    fontSize: 24,
    fontFamily: typography.family.bold,
    color: ProfessionalColors.text.primary,
  },
  consentStatLabel: {
    fontSize: 11,
    color: ProfessionalColors.text.tertiary,
    marginTop: 2,
  },
  consentDivider: {
    width: 1,
    backgroundColor: Colors.neutral.gray200,
    marginHorizontal: spacing['2'],
  },
  warningText: {
    color: '#DC2626',
  },
  consentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing['2'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  consentItemLeft: {
    flex: 1,
  },
  consentClientName: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.primary,
  },
  consentType: {
    fontSize: 12,
    color: ProfessionalColors.text.secondary,
    marginTop: 2,
  },
  consentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#ECFDF5',
  },
  statusExpired: {
    backgroundColor: '#FEF3C7',
  },
  statusRevoked: {
    backgroundColor: '#FEE2E2',
  },
  consentStatusText: {
    fontSize: 11,
    fontFamily: typography.family.semibold,
  },
  statusActiveText: {
    color: '#059669',
  },
  statusExpiredText: {
    color: '#D97706',
  },
  statusRevokedText: {
    color: '#DC2626',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: spacing['3'],
    marginTop: spacing['2'],
  },
  seeMoreText: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.trust.primary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.primary,
  },
  settingDescription: {
    fontSize: 12,
    color: ProfessionalColors.text.tertiary,
    marginTop: 2,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValueText: {
    fontSize: 14,
    color: ProfessionalColors.trust.primary,
    fontFamily: typography.family.medium,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing['3'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray100,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing['2'],
    paddingVertical: spacing['3'],
    backgroundColor: '#FAFAFA',
    borderRadius: radius.lg,
    padding: spacing['3'],
    marginVertical: spacing['2'],
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.neutral.gray200,
  },
  pickerOptionPressed: {
    opacity: 0.7,
  },
  pickerOptionSelected: {
    backgroundColor: ProfessionalColors.trust.background,
    borderColor: ProfessionalColors.trust.primary,
  },
  pickerOptionText: {
    fontSize: 13,
    color: ProfessionalColors.text.primary,
  },
  pickerOptionTextSelected: {
    color: ProfessionalColors.trust.primary,
    fontFamily: typography.family.semibold,
  },
  actionGroup: {
    marginTop: spacing['3'],
  },
  actionGroupTitle: {
    fontSize: 13,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.secondary,
    marginBottom: spacing['2'],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
    backgroundColor: '#FAFAFA',
    borderRadius: radius.lg,
    marginBottom: spacing['2'],
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: ProfessionalColors.text.primary,
  },
  actionButtonDescription: {
    fontSize: 12,
    color: ProfessionalColors.text.tertiary,
    marginTop: 2,
  },
  dangerGroup: {
    marginTop: spacing['4'],
    paddingTop: spacing['3'],
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  dangerTitle: {
    color: '#DC2626',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    backgroundColor: '#FEF2F2',
    padding: spacing['2'],
    borderRadius: radius.md,
    marginBottom: spacing['3'],
  },
  dangerButton: {
    backgroundColor: '#FEF2F2',
  },
  dangerButtonText: {
    color: '#DC2626',
  },
  dangerButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2'],
    padding: spacing['3'],
    backgroundColor: '#DC2626',
    borderRadius: radius.lg,
    marginTop: spacing['2'],
  },
  dangerButtonFullText: {
    fontSize: 14,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.white,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['2'],
    marginHorizontal: spacing['4'],
    marginTop: spacing['2'],
    padding: spacing['3'],
    backgroundColor: Colors.neutral.gray50,
    borderRadius: radius.lg,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: ProfessionalColors.text.tertiary,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default DataPrivacySettings;
