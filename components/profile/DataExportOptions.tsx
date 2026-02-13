/**
 * DataExportOptions - Data export and management options
 *
 * Features:
 * - Export all data (JSON/PDF)
 * - Export analyses
 * - Export children data
 * - Delete account option
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Download,
  FileText,
  Database,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import {
  typography,
  spacing,
  radius,
  shadows,
  iconSizes,
  iconStroke,
} from '@/constants/design-system';

interface DataExportOptionsProps {
  visible: boolean;
  onClose: () => void;
  onExportAll?: () => Promise<void>;
  onExportAnalyses?: () => Promise<void>;
  onDeleteAccount?: () => void;
}

type ExportStatus = 'idle' | 'loading' | 'success' | 'error';

export function DataExportOptions({
  visible,
  onClose,
  onExportAll,
  onExportAnalyses,
  onDeleteAccount,
}: DataExportOptionsProps) {
  const [exportStatus, setExportStatus] = useState<ExportStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleExport = async (
    exportFn?: () => Promise<void>,
    message: string = 'Veriler dışa aktarılıyor...'
  ) => {
    if (!exportFn) {
      setExportStatus('error');
      setStatusMessage('Bu özellik yakında aktif olacak');
      setTimeout(() => {
        setExportStatus('idle');
        setStatusMessage('');
      }, 2000);
      return;
    }

    setExportStatus('loading');
    setStatusMessage(message);

    try {
      await exportFn();
      setExportStatus('success');
      setStatusMessage('Verileriniz başarıyla dışa aktarıldı!');
      setTimeout(() => {
        setExportStatus('idle');
        setStatusMessage('');
      }, 3000);
    } catch (_error) {
      setExportStatus('error');
      setStatusMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
      setTimeout(() => {
        setExportStatus('idle');
        setStatusMessage('');
      }, 3000);
    }
  };

  const renderStatusOverlay = () => {
    if (exportStatus === 'idle') return null;

    return (
      <View style={styles.statusOverlay}>
        {exportStatus === 'loading' && (
          <>
            <ActivityIndicator size="large" color={Colors.secondary.lavender} />
            <Text style={styles.statusText}>{statusMessage}</Text>
          </>
        )}
        {exportStatus === 'success' && (
          <>
            <CheckCircle
              size={iconSizes.hero}
              color={Colors.semantic.success}
              strokeWidth={iconStroke.standard}
            />
            <Text style={[styles.statusText, { color: Colors.semantic.success }]}>
              {statusMessage}
            </Text>
          </>
        )}
        {exportStatus === 'error' && (
          <>
            <AlertTriangle
              size={iconSizes.hero}
              color={Colors.semantic.error}
              strokeWidth={iconStroke.standard}
            />
            <Text style={[styles.statusText, { color: Colors.semantic.error }]}>
              {statusMessage}
            </Text>
          </>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Database
                size={iconSizes.action}
                color={Colors.secondary.lavender}
                strokeWidth={iconStroke.standard}
              />
              <View>
                <Text style={styles.headerTitle}>Veri Yönetimi</Text>
                <Text style={styles.headerSubtitle}>Verilerinizi dışa aktarın veya silin</Text>
              </View>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X
                size={iconSizes.action}
                color={Colors.neutral.medium}
                strokeWidth={iconStroke.standard}
              />
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Export All Data */}
            <Pressable
              style={({ pressed }) => [styles.optionCard, pressed && styles.optionCardPressed]}
              onPress={() => handleExport(onExportAll, 'Tüm veriler dışa aktarılıyor...')}
            >
              <LinearGradient
                colors={[Colors.secondary.lavender, Colors.secondary.lavenderLight]}
                style={styles.optionIcon}
              >
                <Download
                  size={iconSizes.action}
                  color={Colors.neutral.white}
                  strokeWidth={iconStroke.standard}
                />
              </LinearGradient>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Tüm Verilerimi İndir</Text>
                <Text style={styles.optionDescription}>
                  Profil, çocuklar, analizler ve ayarlar dahil tüm verilerinizi JSON formatında
                  indirin
                </Text>
              </View>
            </Pressable>

            {/* Export Analyses */}
            <Pressable
              style={({ pressed }) => [styles.optionCard, pressed && styles.optionCardPressed]}
              onPress={() => handleExport(onExportAnalyses, 'Analizler dışa aktarılıyor...')}
            >
              <LinearGradient
                colors={[Colors.secondary.grass, Colors.secondary.grassLight]}
                style={styles.optionIcon}
              >
                <FileText
                  size={iconSizes.action}
                  color={Colors.neutral.white}
                  strokeWidth={iconStroke.standard}
                />
              </LinearGradient>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Analizleri İndir</Text>
                <Text style={styles.optionDescription}>
                  Tüm çizim analizlerinizi PDF raporu olarak indirin
                </Text>
              </View>
            </Pressable>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Delete Account */}
            <Pressable
              style={({ pressed }) => [
                styles.optionCard,
                styles.dangerCard,
                pressed && styles.optionCardPressed,
              ]}
              onPress={onDeleteAccount}
            >
              <LinearGradient
                colors={[Colors.semantic.error, Colors.semantic.errorLight]}
                style={styles.optionIcon}
              >
                <Trash2
                  size={iconSizes.action}
                  color={Colors.neutral.white}
                  strokeWidth={iconStroke.standard}
                />
              </LinearGradient>
              <View style={styles.optionInfo}>
                <Text style={[styles.optionTitle, styles.dangerText]}>Hesabımı Sil</Text>
                <Text style={styles.optionDescription}>
                  Tüm verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                </Text>
              </View>
            </Pressable>

            {/* Info Note */}
            <View style={styles.infoNote}>
              <AlertTriangle
                size={iconSizes.inline}
                color={Colors.neutral.medium}
                strokeWidth={iconStroke.standard}
              />
              <Text style={styles.infoNoteText}>
                KVKK kapsamında verilerinizi istediğiniz zaman talep edebilirsiniz.
              </Text>
            </View>
          </View>

          {/* Status Overlay */}
          {renderStatusOverlay()}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius['2xl'],
    width: '100%',
    maxWidth: 400,
    ...shadows.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lighter,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
  },
  headerSubtitle: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: Colors.neutral.lighter,
  },
  optionCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  dangerCard: {
    borderColor: Colors.semantic.errorLight,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    marginBottom: spacing.xs,
  },
  dangerText: {
    color: Colors.semantic.error,
  },
  optionDescription: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral.lighter,
    marginVertical: spacing.sm,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: Colors.neutral.lightest,
    borderRadius: radius.lg,
  },
  infoNoteText: {
    flex: 1,
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    lineHeight: 18,
  },
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusText: {
    fontSize: typography.size.md,
    fontFamily: typography.family.semibold,
    color: Colors.neutral.dark,
    textAlign: 'center',
  },
});

export default DataExportOptions;
