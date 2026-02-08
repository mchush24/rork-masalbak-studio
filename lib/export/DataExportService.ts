/**
 * Data Export Service
 * Phase 18: Professional Tools
 *
 * Export analysis data to CSV and JSON formats
 */

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { SavedAnalysis } from '@/types/analysis';
import { format } from 'date-fns';

export interface ExportOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeNotes?: boolean;
  includeImages?: boolean;
  clientId?: string;
}

export interface ExportResult {
  uri: string;
  fileName: string;
  mimeType: string;
  size: number;
}

class DataExportService {
  private static instance: DataExportService;

  private constructor() {}

  static getInstance(): DataExportService {
    if (!DataExportService.instance) {
      DataExportService.instance = new DataExportService();
    }
    return DataExportService.instance;
  }

  /**
   * Export analyses to CSV format
   */
  async exportToCsv(analyses: SavedAnalysis[], options?: ExportOptions): Promise<ExportResult> {
    // Filter by date range if specified
    const filtered = this.filterByOptions(analyses, options);

    // CSV headers
    const headers = [
      'ID',
      'Date',
      'Test Type',
      'Child Age',
      'Child Gender',
      'Confidence',
      'Uncertainty Level',
      'Insight Count',
      'Risk Flag Count',
      'Has Trauma Assessment',
      'Is Favorite',
      'Main Insights',
      'Notes',
    ];

    // Build CSV rows
    const rows = filtered.map(analysis => {
      const insights = analysis.analysisResult.insights.map(i => i.title).join('; ');

      return [
        analysis.id,
        format(new Date(analysis.createdAt), 'yyyy-MM-dd HH:mm'),
        analysis.taskType,
        analysis.childAge || '',
        analysis.childGender || '',
        Math.round((analysis.analysisResult.meta.confidence || 0) * 100) + '%',
        analysis.analysisResult.meta.uncertaintyLevel,
        analysis.analysisResult.insights.length,
        analysis.analysisResult.riskFlags.length,
        analysis.analysisResult.traumaAssessment ? 'Yes' : 'No',
        analysis.isFavorite ? 'Yes' : 'No',
        `"${insights.replace(/"/g, '""')}"`,
        options?.includeNotes && analysis.notes ? `"${analysis.notes.replace(/"/g, '""')}"` : '',
      ];
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    // Save to file using new API
    const fileName = `renkioo_export_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`;
    const file = new File(Paths.document, fileName);

    await file.create();
    await file.write(csvContent);

    const fileInfo = await file.info();

    return {
      uri: file.uri,
      fileName,
      mimeType: 'text/csv',
      size: fileInfo?.size || 0,
    };
  }

  /**
   * Export analyses to JSON format (full backup)
   */
  async exportToJson(analyses: SavedAnalysis[], options?: ExportOptions): Promise<ExportResult> {
    let filtered = this.filterByOptions(analyses, options);

    // Remove image URLs if not included
    if (!options?.includeImages) {
      filtered = filtered.map(a => ({
        ...a,
        imageUrl: undefined,
      }));
    }

    // Remove notes if not included
    if (!options?.includeNotes) {
      filtered = filtered.map(a => ({
        ...a,
        notes: undefined,
      }));
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      totalAnalyses: filtered.length,
      dateRange: options?.dateRange
        ? {
            start: options.dateRange.start.toISOString(),
            end: options.dateRange.end.toISOString(),
          }
        : null,
      analyses: filtered,
    };

    const jsonContent = JSON.stringify(exportData, null, 2);

    const fileName = `renkioo_backup_${format(new Date(), 'yyyy-MM-dd_HHmm')}.json`;
    const file = new File(Paths.document, fileName);

    await file.create();
    await file.write(jsonContent);

    const fileInfo = await file.info();

    return {
      uri: file.uri,
      fileName,
      mimeType: 'application/json',
      size: fileInfo?.size || 0,
    };
  }

  /**
   * Export single analysis to detailed JSON
   */
  async exportSingleAnalysis(
    analysis: SavedAnalysis,
    includeNotes: boolean = true
  ): Promise<ExportResult> {
    const exportData = {
      exportDate: new Date().toISOString(),
      analysis: {
        ...analysis,
        notes: includeNotes ? analysis.notes : undefined,
      },
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const sanitizedId = analysis.id.substring(0, 8);
    const fileName = `renkioo_analysis_${sanitizedId}_${format(
      new Date(analysis.createdAt),
      'yyyy-MM-dd'
    )}.json`;
    const file = new File(Paths.document, fileName);

    await file.create();
    await file.write(jsonContent);

    const fileInfo = await file.info();

    return {
      uri: file.uri,
      fileName,
      mimeType: 'application/json',
      size: fileInfo?.size || 0,
    };
  }

  /**
   * Generate summary statistics
   */
  generateStatistics(analyses: SavedAnalysis[]) {
    if (analyses.length === 0) {
      return {
        totalAnalyses: 0,
        averageConfidence: 0,
        testTypeDistribution: {},
        ageDistribution: {},
        riskFlagCount: 0,
        traumaCount: 0,
        favoriteCount: 0,
        dateRange: null,
      };
    }

    // Test type distribution
    const testTypeDistribution: Record<string, number> = {};
    analyses.forEach(a => {
      testTypeDistribution[a.taskType] = (testTypeDistribution[a.taskType] || 0) + 1;
    });

    // Age distribution
    const ageDistribution: Record<string, number> = {};
    analyses.forEach(a => {
      if (a.childAge) {
        const ageGroup =
          a.childAge <= 5 ? '3-5' : a.childAge <= 8 ? '6-8' : a.childAge <= 12 ? '9-12' : '13+';
        ageDistribution[ageGroup] = (ageDistribution[ageGroup] || 0) + 1;
      }
    });

    // Calculate averages and counts
    const totalConfidence = analyses.reduce(
      (sum, a) => sum + (a.analysisResult.meta.confidence || 0),
      0
    );

    const riskFlagCount = analyses.reduce((sum, a) => sum + a.analysisResult.riskFlags.length, 0);

    const traumaCount = analyses.filter(a => a.analysisResult.traumaAssessment).length;

    const favoriteCount = analyses.filter(a => a.isFavorite).length;

    // Date range
    const dates = analyses.map(a => new Date(a.createdAt).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    return {
      totalAnalyses: analyses.length,
      averageConfidence: Math.round((totalConfidence / analyses.length) * 100),
      testTypeDistribution,
      ageDistribution,
      riskFlagCount,
      traumaCount,
      favoriteCount,
      dateRange: {
        start: minDate.toISOString(),
        end: maxDate.toISOString(),
      },
    };
  }

  /**
   * Export statistics report
   */
  async exportStatistics(analyses: SavedAnalysis[]): Promise<ExportResult> {
    const stats = this.generateStatistics(analyses);

    const jsonContent = JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        statistics: stats,
      },
      null,
      2
    );

    const fileName = `renkioo_statistics_${format(new Date(), 'yyyy-MM-dd_HHmm')}.json`;
    const file = new File(Paths.document, fileName);

    await file.create();
    await file.write(jsonContent);

    const fileInfo = await file.info();

    return {
      uri: file.uri,
      fileName,
      mimeType: 'application/json',
      size: fileInfo?.size || 0,
    };
  }

  /**
   * Share exported file
   */
  async shareFile(result: ExportResult): Promise<void> {
    if (Platform.OS === 'web') {
      // For web, trigger download
      const link = document.createElement('a');
      link.href = result.uri;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Paylaşım bu cihazda desteklenmiyor');
    }

    await Sharing.shareAsync(result.uri, {
      mimeType: result.mimeType,
      dialogTitle: 'Dosyayı Paylaş',
    });
  }

  /**
   * Delete exported file
   */
  async deleteFile(uri: string): Promise<void> {
    try {
      const file = new File(uri);
      await file.delete();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  /**
   * Filter analyses by options
   */
  private filterByOptions(analyses: SavedAnalysis[], options?: ExportOptions): SavedAnalysis[] {
    let filtered = [...analyses];

    if (options?.dateRange) {
      const startTime = options.dateRange.start.getTime();
      const endTime = options.dateRange.end.getTime();

      filtered = filtered.filter(a => {
        const time = new Date(a.createdAt).getTime();
        return time >= startTime && time <= endTime;
      });
    }

    if (options?.clientId) {
      filtered = filtered.filter(a => a.userId === options.clientId);
    }

    return filtered;
  }
}

export const dataExportService = DataExportService.getInstance();
export default DataExportService;
