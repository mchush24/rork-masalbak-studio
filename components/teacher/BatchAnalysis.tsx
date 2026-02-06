/**
 * Batch Analysis Component
 * Analyze multiple student drawings at once
 * Part of #19: Öğretmen Modu - Sınıf Yönetimi UI
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  Upload,
  Users,
  Image,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react-native';
import { spacing, radius, shadows } from '@/constants/design-system';
import { ProfessionalColors } from '@/constants/colors';

interface StudentUpload {
  studentId: string;
  studentName: string;
  imageUri?: string;
  status: 'pending' | 'uploading' | 'analyzing' | 'completed' | 'error';
  progress?: number;
  result?: {
    score: number;
    percentile: number;
  };
  error?: string;
}

interface BatchAnalysisProps {
  students: { id: string; name: string }[];
  testType: string;
  onImageSelect: (studentId: string) => Promise<string | null>;
  onAnalyze: (uploads: { studentId: string; imageUri: string }[]) => Promise<void>;
  onComplete?: () => void;
}

const TEST_TYPES: Record<string, { label: string; description: string }> = {
  DAP: { label: 'İnsan Çizimi (DAP)', description: 'Bir insan figürü çizimi' },
  HTP: { label: 'Ev-Ağaç-İnsan (HTP)', description: 'Ev, ağaç ve insan çizimi' },
  Family: { label: 'Aile Çizimi', description: 'Aile üyeleri çizimi' },
  Bender: { label: 'Bender Gestalt', description: 'Geometrik şekil kopyalama' },
};

export function BatchAnalysis({
  students,
  testType,
  onImageSelect,
  onAnalyze,
  onComplete,
}: BatchAnalysisProps) {
  const [uploads, setUploads] = useState<StudentUpload[]>(
    students.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      status: 'pending',
    }))
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  const testInfo = TEST_TYPES[testType] || { label: testType, description: '' };

  const completedCount = uploads.filter((u) => u.status === 'completed').length;
  const errorCount = uploads.filter((u) => u.status === 'error').length;
  const readyCount = uploads.filter((u) => u.imageUri && u.status === 'pending').length;
  const totalProgress = uploads.length > 0 ? (completedCount / uploads.length) * 100 : 0;

  const handleSelectImage = useCallback(async (studentId: string) => {
    const uri = await onImageSelect(studentId);
    if (uri) {
      setUploads((prev) =>
        prev.map((u) =>
          u.studentId === studentId
            ? { ...u, imageUri: uri, status: 'pending', error: undefined }
            : u
        )
      );
    }
  }, [onImageSelect]);

  const handleRemoveImage = useCallback((studentId: string) => {
    setUploads((prev) =>
      prev.map((u) =>
        u.studentId === studentId
          ? { ...u, imageUri: undefined, status: 'pending', result: undefined }
          : u
      )
    );
  }, []);

  const handleStartAnalysis = useCallback(async () => {
    const readyUploads = uploads.filter((u) => u.imageUri && u.status === 'pending');
    if (readyUploads.length === 0) return;

    setIsAnalyzing(true);
    setIsPaused(false);

    // Process each upload
    for (const upload of readyUploads) {
      if (isPaused) break;

      // Update status to analyzing
      setUploads((prev) =>
        prev.map((u) =>
          u.studentId === upload.studentId ? { ...u, status: 'analyzing', progress: 0 } : u
        )
      );

      try {
        // Simulate analysis progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          setUploads((prev) =>
            prev.map((u) =>
              u.studentId === upload.studentId ? { ...u, progress: i } : u
            )
          );
        }

        // Mark as completed with mock result
        setUploads((prev) =>
          prev.map((u) =>
            u.studentId === upload.studentId
              ? {
                  ...u,
                  status: 'completed',
                  progress: 100,
                  result: {
                    score: Math.floor(Math.random() * 40) + 60,
                    percentile: Math.floor(Math.random() * 50) + 40,
                  },
                }
              : u
          )
        );
      } catch (error) {
        setUploads((prev) =>
          prev.map((u) =>
            u.studentId === upload.studentId
              ? { ...u, status: 'error', error: 'Analiz başarısız' }
              : u
          )
        );
      }
    }

    setIsAnalyzing(false);
  }, [uploads, isPaused]);

  const handlePauseResume = useCallback(() => {
    setIsPaused(!isPaused);
  }, [isPaused]);

  const handleRetry = useCallback((studentId: string) => {
    setUploads((prev) =>
      prev.map((u) =>
        u.studentId === studentId
          ? { ...u, status: 'pending', error: undefined }
          : u
      )
    );
  }, []);

  const getStatusIcon = (status: StudentUpload['status']) => {
    switch (status) {
      case 'completed':
        return <Check size={16} color="#10B981" />;
      case 'error':
        return <AlertCircle size={16} color="#EF4444" />;
      case 'analyzing':
      case 'uploading':
        return <ActivityIndicator size="small" color={ProfessionalColors.trust.primary} />;
      default:
        return null;
    }
  };

  const getStatusText = (upload: StudentUpload) => {
    switch (upload.status) {
      case 'completed':
        return `Tamamlandı - ${upload.result?.percentile}%`;
      case 'error':
        return upload.error || 'Hata oluştu';
      case 'analyzing':
        return `Analiz ediliyor... ${upload.progress}%`;
      case 'uploading':
        return 'Yükleniyor...';
      default:
        return upload.imageUri ? 'Hazır' : 'Görsel bekleniyor';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Toplu Değerlendirme</Text>
          <Text style={styles.subtitle}>
            {testInfo.label} • {students.length} öğrenci
          </Text>
        </View>
      </View>

      {/* Progress Overview */}
      <View style={styles.progressSection}>
        <View style={styles.progressStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Tamamlandı</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{readyCount}</Text>
            <Text style={styles.statLabel}>Hazır</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, errorCount > 0 && styles.errorText]}>{errorCount}</Text>
            <Text style={styles.statLabel}>Hata</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${totalProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(totalProgress)}%</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isAnalyzing ? (
            <Pressable
              style={({ pressed }) => [styles.pauseButton, pressed && styles.buttonPressed]}
              onPress={handlePauseResume}
            >
              {isPaused ? (
                <>
                  <Play size={18} color={ProfessionalColors.trust.primary} />
                  <Text style={styles.pauseButtonText}>Devam Et</Text>
                </>
              ) : (
                <>
                  <Pause size={18} color={ProfessionalColors.trust.primary} />
                  <Text style={styles.pauseButtonText}>Duraklat</Text>
                </>
              )}
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.startButton,
                readyCount === 0 && styles.startButtonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleStartAnalysis}
              disabled={readyCount === 0}
            >
              <Play size={18} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Analizi Başlat ({readyCount})</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Student Upload List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {uploads.map((upload) => {
          const isExpanded = expandedStudent === upload.studentId;

          return (
            <View key={upload.studentId} style={styles.studentCard}>
              <Pressable
                style={styles.studentCardHeader}
                onPress={() => setExpandedStudent(isExpanded ? null : upload.studentId)}
              >
                {/* Status Icon */}
                <View style={[
                  styles.statusIcon,
                  upload.status === 'completed' && styles.statusIconCompleted,
                  upload.status === 'error' && styles.statusIconError,
                ]}>
                  {getStatusIcon(upload.status) || (
                    upload.imageUri
                      ? <Image size={16} color={ProfessionalColors.trust.primary} />
                      : <Upload size={16} color={ProfessionalColors.text.tertiary} />
                  )}
                </View>

                {/* Student Info */}
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{upload.studentName}</Text>
                  <Text style={[
                    styles.statusText,
                    upload.status === 'completed' && styles.statusTextCompleted,
                    upload.status === 'error' && styles.statusTextError,
                  ]}>
                    {getStatusText(upload)}
                  </Text>
                </View>

                {/* Result Score */}
                {upload.result && (
                  <View style={styles.resultBadge}>
                    <Text style={styles.resultScore}>{upload.result.score}</Text>
                  </View>
                )}

                {/* Expand Icon */}
                {isExpanded ? (
                  <ChevronUp size={18} color={ProfessionalColors.text.tertiary} />
                ) : (
                  <ChevronDown size={18} color={ProfessionalColors.text.tertiary} />
                )}
              </Pressable>

              {/* Expanded Content */}
              {isExpanded && (
                <View style={styles.expandedContent}>
                  {upload.imageUri ? (
                    <View style={styles.imagePreview}>
                      <View style={styles.imagePlaceholder}>
                        <Image size={32} color={ProfessionalColors.text.tertiary} />
                        <Text style={styles.imagePlaceholderText}>Görsel yüklendi</Text>
                      </View>
                      {upload.status === 'pending' && (
                        <Pressable
                          style={styles.removeImageButton}
                          onPress={() => handleRemoveImage(upload.studentId)}
                        >
                          <X size={16} color="#DC2626" />
                        </Pressable>
                      )}
                    </View>
                  ) : (
                    <Pressable
                      style={({ pressed }) => [styles.uploadButton, pressed && styles.buttonPressed]}
                      onPress={() => handleSelectImage(upload.studentId)}
                    >
                      <Upload size={24} color={ProfessionalColors.trust.primary} />
                      <Text style={styles.uploadButtonText}>Görsel Yükle</Text>
                      <Text style={styles.uploadButtonHint}>{testInfo.description}</Text>
                    </Pressable>
                  )}

                  {/* Error Retry */}
                  {upload.status === 'error' && (
                    <Pressable
                      style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
                      onPress={() => handleRetry(upload.studentId)}
                    >
                      <RotateCcw size={16} color={ProfessionalColors.trust.primary} />
                      <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                    </Pressable>
                  )}

                  {/* Analysis Progress */}
                  {upload.status === 'analyzing' && upload.progress !== undefined && (
                    <View style={styles.analysisProgress}>
                      <View style={styles.progressBarBackground}>
                        <View style={[styles.progressBarFill, { width: `${upload.progress}%` }]} />
                      </View>
                    </View>
                  )}

                  {/* Completed Result */}
                  {upload.result && (
                    <View style={styles.resultDetails}>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Ham Puan</Text>
                        <Text style={styles.resultValue}>{upload.result.score}</Text>
                      </View>
                      <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Yüzdelik</Text>
                        <Text style={styles.resultValue}>{upload.result.percentile}%</Text>
                      </View>
                      <Pressable style={styles.viewReportButton}>
                        <FileText size={14} color={ProfessionalColors.trust.primary} />
                        <Text style={styles.viewReportText}>Raporu Gör</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Complete Button */}
      {completedCount === uploads.length && completedCount > 0 && (
        <Pressable
          style={({ pressed }) => [styles.completeButton, pressed && styles.buttonPressed]}
          onPress={onComplete}
        >
          <Check size={20} color="#FFFFFF" />
          <Text style={styles.completeButtonText}>Değerlendirmeyi Tamamla</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: spacing['4'],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerInfo: {},
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: ProfessionalColors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: ProfessionalColors.text.secondary,
    marginTop: 4,
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    margin: spacing['4'],
    borderRadius: radius.xl,
    padding: spacing['4'],
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...shadows.sm,
  },
  progressStats: {
    flexDirection: 'row',
    marginBottom: spacing['4'],
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: ProfessionalColors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: ProfessionalColors.text.tertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: spacing['2'],
  },
  errorText: {
    color: '#EF4444',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    marginBottom: spacing['4'],
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: ProfessionalColors.roles.teacher.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: ProfessionalColors.text.secondary,
    width: 40,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing['2'],
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ProfessionalColors.roles.teacher.primary,
    paddingVertical: 14,
    borderRadius: radius.lg,
  },
  startButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pauseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ProfessionalColors.trust.background,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: ProfessionalColors.trust.primary,
  },
  pauseButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: ProfessionalColors.trust.primary,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: spacing['4'],
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    marginBottom: spacing['2'],
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  studentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    padding: spacing['3'],
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconCompleted: {
    backgroundColor: '#ECFDF5',
  },
  statusIconError: {
    backgroundColor: '#FEF2F2',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '600',
    color: ProfessionalColors.text.primary,
  },
  statusText: {
    fontSize: 12,
    color: ProfessionalColors.text.tertiary,
    marginTop: 2,
  },
  statusTextCompleted: {
    color: '#059669',
  },
  statusTextError: {
    color: '#DC2626',
  },
  resultBadge: {
    backgroundColor: ProfessionalColors.trust.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resultScore: {
    fontSize: 16,
    fontWeight: '700',
    color: ProfessionalColors.trust.primary,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    padding: spacing['3'],
  },
  imagePreview: {
    position: 'relative',
  },
  imagePlaceholder: {
    backgroundColor: '#F9FAFB',
    borderRadius: radius.lg,
    padding: spacing['4'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 13,
    color: ProfessionalColors.text.tertiary,
    marginTop: spacing['2'],
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  uploadButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: radius.lg,
    padding: spacing['4'],
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ProfessionalColors.trust.primary,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: ProfessionalColors.trust.primary,
    marginTop: spacing['2'],
  },
  uploadButtonHint: {
    fontSize: 12,
    color: ProfessionalColors.text.tertiary,
    marginTop: 4,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: ProfessionalColors.trust.background,
    padding: spacing['3'],
    borderRadius: radius.lg,
    marginTop: spacing['3'],
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: ProfessionalColors.trust.primary,
  },
  analysisProgress: {
    marginTop: spacing['3'],
  },
  resultDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3'],
    marginTop: spacing['3'],
  },
  resultItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: radius.md,
    padding: spacing['2'],
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 11,
    color: ProfessionalColors.text.tertiary,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '700',
    color: ProfessionalColors.text.primary,
    marginTop: 2,
  },
  viewReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: ProfessionalColors.trust.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  viewReportText: {
    fontSize: 13,
    fontWeight: '600',
    color: ProfessionalColors.trust.primary,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    margin: spacing['4'],
    paddingVertical: 16,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default BatchAnalysis;
