/**
 * PDF Report Service — Professional Module
 *
 * Thin adapter wrapping the existing PdfService for the professional UI.
 */

import { pdfService } from '@/lib/pdf/PdfService';
import type { SavedAnalysis } from '@/types/analysis';
import type { ClientInfo, PdfConfig } from '@/lib/pdf/PdfService';

export interface ReportAnalysis {
  id: string;
  type: string;
  childName: string;
  childAge?: number;
  date: string;
  emotionalTones: { name: string; percentage: number; color: string }[];
  analysis: string;
  clinicalNotes?: string;
  imageUri?: string;
}

export interface ReportOptions {
  clinicName?: string;
  clinicLogo?: string;
  professionalName?: string;
  professionalTitle?: string;
  language?: 'tr' | 'en';
  includeImage?: boolean;
  includeRecommendations?: boolean;
  includeNotes?: boolean;
}

export class PdfReportService {
  /**
   * Generate a PDF from a ReportAnalysis and share it via the OS share sheet.
   */
  static async generateAndShare(analysis: ReportAnalysis, options: ReportOptions): Promise<void> {
    // Map ReportOptions → PdfConfig
    const pdfConfig: Partial<PdfConfig> = {
      clinicName: options.clinicName,
      clinicLogo: options.clinicLogo,
      professionalName: options.professionalName,
      professionalTitle: options.professionalTitle,
      language: options.language ?? 'tr',
      includeRecommendations: options.includeRecommendations ?? true,
      includeTips: options.includeRecommendations ?? true,
      includeRiskFlags: true,
    };

    pdfService.setConfig(pdfConfig);

    // Map ReportAnalysis → minimal SavedAnalysis shape expected by pdfService
    const savedAnalysis: SavedAnalysis = {
      id: analysis.id,
      userId: '',
      taskType: analysis.type as SavedAnalysis['taskType'],
      childAge: analysis.childAge,
      language: (options.language ?? 'tr') as SavedAnalysis['language'],
      analysisResult: {
        meta: {
          testType: analysis.type as SavedAnalysis['taskType'],
          language: (options.language ?? 'tr') as SavedAnalysis['language'],
          confidence: 0,
          uncertaintyLevel: 'low',
          dataQualityNotes: [],
        },
        insights: [],
        homeTips: [],
        riskFlags: [],
        traumaAssessment: null,
      },
      imageUrl: analysis.imageUri,
      createdAt: analysis.date,
      updatedAt: analysis.date,
    };

    const clientInfo: ClientInfo = {
      name: analysis.childName,
      age: analysis.childAge,
    };

    const notes = options.includeNotes ? analysis.clinicalNotes : undefined;

    const pdfUri = await pdfService.exportToPdf(savedAnalysis, clientInfo, notes);
    await pdfService.sharePdf(pdfUri);
  }
}
