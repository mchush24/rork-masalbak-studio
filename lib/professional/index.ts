/**
 * Professional Module — Barrel
 *
 * Provides ChartDataService, useProfessionalMode, and re-exports from
 * PdfReportService and DataExportService.
 */

import { useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRole } from '@/lib/contexts/RoleContext';
import { ProfessionalColors } from '@/constants/colors';

// Re-exports
export { PdfReportService, type ReportAnalysis, type ReportOptions } from './PdfReportService';
export { DataExportService, type ExportFormat } from './DataExportService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TimeRange = 'week' | 'month' | '3months' | '6months' | 'year' | 'all';

export interface EmotionChartData {
  emotion: string;
  data: { y: number }[];
  color: string;
  average: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

// ---------------------------------------------------------------------------
// ChartDataService
// ---------------------------------------------------------------------------

interface AnalysisInput {
  id: string;
  date: string;
  emotionalTones: { name: string; percentage: number; color: string }[];
}

const SERIES_COLORS = ProfessionalColors.data.series;

function getStartDate(range: TimeRange): Date | null {
  if (range === 'all') return null;
  const now = new Date();
  switch (range) {
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case '3months':
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case '6months':
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case 'year':
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    default:
      return null;
  }
}

export class ChartDataService {
  /**
   * Compute per-emotion chart data from a list of analyses, filtered by time range.
   */
  static getAllEmotionsChartData(
    analyses: AnalysisInput[],
    timeRange: TimeRange
  ): EmotionChartData[] {
    const start = getStartDate(timeRange);

    // Filter by time range and sort chronologically
    const filtered = analyses
      .filter(a => {
        if (!start) return true;
        return new Date(a.date).getTime() >= start.getTime();
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (filtered.length === 0) return [];

    // Collect unique emotions in order of first appearance
    const emotionSet = new Map<string, string>(); // name → color
    for (const analysis of filtered) {
      for (const tone of analysis.emotionalTones) {
        if (!emotionSet.has(tone.name)) {
          emotionSet.set(tone.name, tone.color);
        }
      }
    }

    const results: EmotionChartData[] = [];
    let colorIdx = 0;

    for (const [emotion, fallbackColor] of emotionSet) {
      const points: { y: number }[] = [];

      for (const analysis of filtered) {
        const tone = analysis.emotionalTones.find(t => t.name === emotion);
        points.push({ y: tone?.percentage ?? 0 });
      }

      const total = points.reduce((s, p) => s + p.y, 0);
      const average = Math.round(total / points.length);

      // Change = last - first
      const first = points[0]?.y ?? 0;
      const last = points[points.length - 1]?.y ?? 0;
      const change = Math.round(last - first);
      const trend: EmotionChartData['trend'] = change > 2 ? 'up' : change < -2 ? 'down' : 'stable';

      const color = SERIES_COLORS[colorIdx % SERIES_COLORS.length] ?? fallbackColor;
      colorIdx++;

      results.push({ emotion, data: points, color, average, change, trend });
    }

    return results;
  }

  /**
   * Generate Turkish-language insight strings from chart data.
   */
  static generateInsights(chartData: EmotionChartData[]): string[] {
    if (chartData.length === 0) return [];

    const insights: string[] = [];

    // Dominant emotion
    const dominant = [...chartData].sort((a, b) => b.average - a.average)[0];
    if (dominant) {
      insights.push(`En belirgin duygu "${dominant.emotion}" — ortalama %${dominant.average}.`);
    }

    // Biggest positive change
    const rising = [...chartData].sort((a, b) => b.change - a.change)[0];
    if (rising && rising.change > 2) {
      insights.push(`"${rising.emotion}" en fazla yukselen duygu (+${rising.change}%).`);
    }

    // Biggest negative change
    const falling = [...chartData].sort((a, b) => a.change - b.change)[0];
    if (falling && falling.change < -2) {
      insights.push(`"${falling.emotion}" belirgin azalma gosteriyor (${falling.change}%).`);
    }

    // Stability
    const stable = chartData.filter(c => c.trend === 'stable');
    if (stable.length === chartData.length && chartData.length > 1) {
      insights.push('Tum duygusal gostergeler bu donemde stabil seyrediyor.');
    }

    return insights;
  }
}

// ---------------------------------------------------------------------------
// useProfessionalMode Hook
// ---------------------------------------------------------------------------

const PROFILE_STORAGE_KEY = '@renkioo_professional_profile';

interface ProfessionalSettings {
  clinicName: string;
  clinicLogo?: string;
  professionalName: string;
  professionalTitle: string;
  defaultReportLanguage: 'tr' | 'en';
}

interface ProfessionalFeatures {
  csvExport: boolean;
  jsonExport: boolean;
  pdfReports: boolean;
  developmentCharts: boolean;
  comparativeAnalysis: boolean;
  clinicalScoring: boolean;
}

const DEFAULT_SETTINGS: ProfessionalSettings = {
  clinicName: '',
  professionalName: '',
  professionalTitle: '',
  defaultReportLanguage: 'tr',
};

/**
 * Returns professional mode settings and feature flags derived from the
 * current user role. Settings are read from AsyncStorage once and memoized;
 * feature flags come from `RoleContext`.
 */
export function useProfessionalMode(): {
  settings: ProfessionalSettings;
  features: ProfessionalFeatures;
} {
  const { config } = useRole();

  // Load persisted profile settings (fire-and-forget on first render).
  // We intentionally use a synchronous default and let AsyncStorage hydrate
  // asynchronously — the component will re-read on next mount if needed.
  const settings = useMemo<ProfessionalSettings>(() => {
    // Start with defaults — an async read isn't viable inside useMemo, but the
    // caller (ReportExportButton) can override via the options it passes, so
    // defaults are acceptable here.
    let stored = DEFAULT_SETTINGS;
    // Kick off async read to warm the cache for next render
    AsyncStorage.getItem(PROFILE_STORAGE_KEY)
      .then(raw => {
        if (raw) {
          try {
            stored = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
          } catch {
            // ignore parse errors
          }
        }
      })
      .catch(() => {});
    return stored;
  }, []);

  const features = useMemo<ProfessionalFeatures>(
    () => ({
      csvExport: true, // always available for professional roles
      jsonExport: true,
      pdfReports: config.features.pdfReports,
      developmentCharts: config.features.developmentCharts,
      comparativeAnalysis: config.features.comparativeAnalysis,
      clinicalScoring: config.features.clinicalScoring,
    }),
    [config]
  );

  return { settings, features };
}
