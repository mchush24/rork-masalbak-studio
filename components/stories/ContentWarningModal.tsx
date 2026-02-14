import React from 'react';
import { StyleSheet, Text, View, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { AlertTriangle, Heart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { typography, spacing, radius, shadows } from '@/constants/design-system';

type ConcernType =
  | 'war'
  | 'violence'
  | 'disaster'
  | 'loss'
  | 'loneliness'
  | 'fear'
  | 'abuse'
  | 'family_separation'
  | 'death'
  | 'neglect'
  | 'bullying'
  | 'domestic_violence_witness'
  | 'parental_addiction'
  | 'parental_mental_illness'
  | 'medical_trauma'
  | 'anxiety'
  | 'depression'
  | 'low_self_esteem'
  | 'anger'
  | 'school_stress'
  | 'social_rejection'
  | 'displacement'
  | 'poverty'
  | 'cyberbullying'
  | 'other';

type ContentAnalysis = {
  hasConcerningContent: boolean;
  concernType?: ConcernType | null;
  concernDescription?: string | null;
  therapeuticApproach?: string | null;
};

type ThemeColors = {
  surface: { card: string; elevated: string };
  neutral: { darkest: string; dark: string; medium: string };
  secondary: { sunshine: string; violet: string };
  primary: { sunset: string };
};

type ContentWarningModalProps = {
  visible: boolean;
  contentWarning: ContentAnalysis | null;
  onClose: () => void;
  colors: ThemeColors;
  isDark: boolean;
  concernTypeLabels: Record<string, { label: string; emoji: string; color: string }>;
};

export function ContentWarningModal({
  visible,
  contentWarning,
  onClose,
  colors,
  isDark,
  concernTypeLabels,
}: ContentWarningModalProps) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ScrollView
          style={{ maxHeight: '90%' }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.contentWarningModal, { backgroundColor: colors.surface.card }]}>
            <View style={styles.warningIconContainer}>
              <AlertTriangle size={40} color={colors.secondary.sunshine} />
            </View>

            <Text style={[styles.warningTitle, { color: colors.neutral.darkest }]}>
              Ebeveyn Bildirimi
            </Text>

            {/* Concern Type Badge */}
            {contentWarning?.concernType && concernTypeLabels[contentWarning.concernType] && (
              <View
                style={[
                  styles.concernTypeBadge,
                  {
                    backgroundColor: `${concernTypeLabels[contentWarning.concernType].color}20`,
                  },
                ]}
              >
                <Text style={styles.concernTypeEmoji}>
                  {concernTypeLabels[contentWarning.concernType].emoji}
                </Text>
                <Text
                  style={[
                    styles.concernTypeLabel,
                    { color: concernTypeLabels[contentWarning.concernType].color },
                  ]}
                >
                  {concernTypeLabels[contentWarning.concernType].label}
                </Text>
              </View>
            )}

            <Text style={[styles.warningDescription, { color: colors.neutral.dark }]}>
              Çocuğunuzun çiziminde dikkat edilmesi gereken duygusal içerik tespit edildi.
            </Text>

            {contentWarning?.concernDescription && (
              <View style={styles.warningDetailBox}>
                <Text style={[styles.warningDetailTitle, { color: colors.neutral.dark }]}>
                  Tespit Edilen İçerik:
                </Text>
                <Text style={[styles.warningDetailText, { color: colors.neutral.darkest }]}>
                  {contentWarning.concernDescription}
                </Text>
              </View>
            )}

            {contentWarning?.therapeuticApproach && (
              <View style={styles.therapeuticBox}>
                <Text style={[styles.therapeuticTitle, { color: colors.secondary.violet }]}>
                  🎯 Terapötik Yaklaşım:
                </Text>
                <Text style={[styles.therapeuticText, { color: colors.neutral.dark }]}>
                  {contentWarning.therapeuticApproach}
                </Text>
              </View>
            )}

            <View style={styles.warningInfoBox}>
              <Heart size={20} color={colors.primary.sunset} />
              <Text style={[styles.warningInfoText, { color: colors.neutral.dark }]}>
                Önerilen masal temaları, bibliotherapy (kitap terapisi) prensipleri doğrultusunda
                çocuğunuzun duygularını güvenli bir şekilde işlemesine yardımcı olmak için özel
                olarak seçildi. Bu hikayeler dolaylı yoldan iyileşmeyi destekler.
              </Text>
            </View>

            <View
              style={[
                styles.professionalNoteBox,
                {
                  backgroundColor: isDark ? colors.surface.elevated : 'rgba(156, 163, 175, 0.1)',
                },
              ]}
            >
              <Text style={[styles.professionalNoteText, { color: colors.neutral.medium }]}>
                💡 Not: Bu uygulama profesyonel psikolojik destek yerine geçmez. Endişeleriniz varsa
                bir çocuk psikoloğuna danışmanızı öneririz.
              </Text>
            </View>

            <TouchableOpacity style={styles.warningButton} onPress={onClose}>
              <LinearGradient
                colors={[colors.primary.sunset, colors.secondary.sunshine]}
                style={styles.warningButtonGradient}
              >
                <Text style={styles.warningButtonText}>Anladım, Devam Et</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['4'],
  },
  contentWarningModal: {
    backgroundColor: Colors.neutral.white,
    borderRadius: radius['2xl'],
    padding: spacing['6'],
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    ...shadows.xl,
  },
  warningIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 183, 77, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['4'],
  },
  warningTitle: {
    fontSize: typography.size.xl,
    fontFamily: typography.family.bold,
    color: Colors.neutral.darkest,
    textAlign: 'center',
    marginBottom: spacing['3'],
  },
  warningDescription: {
    fontSize: typography.size.md,
    color: Colors.neutral.dark,
    textAlign: 'center',
    marginBottom: spacing['3'],
    lineHeight: 22,
  },
  warningDetailBox: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['4'],
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.sunset,
  },
  warningDetailTitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
    color: Colors.neutral.dark,
    marginBottom: spacing['2'],
  },
  warningDetailText: {
    fontSize: typography.size.md,
    color: Colors.neutral.darkest,
    fontFamily: typography.family.medium,
    lineHeight: 20,
  },
  warningInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 160, 122, 0.1)',
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['5'],
    gap: spacing['3'],
  },
  warningInfoText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    lineHeight: 20,
  },
  warningButton: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  warningButtonGradient: {
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['6'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningButtonText: {
    color: Colors.neutral.white,
    fontSize: typography.size.md,
    fontFamily: typography.family.bold,
  },
  concernTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['2'],
    borderRadius: radius.full,
    marginBottom: spacing['4'],
    gap: spacing['2'],
  },
  concernTypeEmoji: {
    fontSize: 20,
  },
  concernTypeLabel: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.semibold,
  },
  therapeuticBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: radius.lg,
    padding: spacing['4'],
    marginBottom: spacing['4'],
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary.violet,
  },
  therapeuticTitle: {
    fontSize: typography.size.sm,
    fontFamily: typography.family.bold,
    color: Colors.secondary.violet,
    marginBottom: spacing['2'],
  },
  therapeuticText: {
    fontSize: typography.size.sm,
    color: Colors.neutral.dark,
    lineHeight: 20,
  },
  professionalNoteBox: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderRadius: radius.lg,
    padding: spacing['3'],
    marginBottom: spacing['4'],
    width: '100%',
  },
  professionalNoteText: {
    fontSize: typography.size.xs,
    color: Colors.neutral.medium,
    lineHeight: 18,
    textAlign: 'center',
  },
});
