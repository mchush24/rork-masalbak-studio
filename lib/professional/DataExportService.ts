/**
 * Data Export Service — Professional Module
 *
 * Thin adapter wrapping the existing DataExportService for the professional UI.
 */

import { dataExportService } from '@/lib/export/DataExportService';
import type { SavedAnalysis } from '@/types/analysis';

export type ExportFormat = 'csv' | 'json';

interface AnalysisExportData {
  id: string;
  type: string;
  childName: string;
  childAge?: number;
  date: string;
  emotionalTones: { name: string; percentage: number; color: string }[];
  analysis: string;
  notes?: string;
}

export class DataExportService {
  /**
   * Export analysis data to CSV or JSON and share via the OS share sheet.
   */
  static async exportAndShare(
    analysisData: AnalysisExportData[],
    format: ExportFormat
  ): Promise<void> {
    // Map lightweight analysis data → SavedAnalysis[] shape expected by the export service
    const mapped: SavedAnalysis[] = analysisData.map(item => ({
      id: item.id,
      userId: '',
      taskType: item.type as SavedAnalysis['taskType'],
      childAge: item.childAge,
      language: 'tr' as SavedAnalysis['language'],
      analysisResult: {
        meta: {
          testType: item.type as SavedAnalysis['taskType'],
          language: 'tr' as SavedAnalysis['language'],
          confidence: 0,
          uncertaintyLevel: 'low' as const,
          dataQualityNotes: [],
        },
        insights: [],
        homeTips: [],
        riskFlags: [],
        traumaAssessment: null,
      },
      createdAt: item.date,
      updatedAt: item.date,
      notes: item.notes,
    }));

    const exportOptions = { includeNotes: true };

    const result =
      format === 'csv'
        ? await dataExportService.exportToCsv(mapped, exportOptions)
        : await dataExportService.exportToJson(mapped, exportOptions);

    await dataExportService.shareFile(result);
  }
}
