/**
 * Analysis Types
 * Shared between frontend and backend
 */

export type TaskType =
  | "DAP"
  | "HTP"
  | "Family"
  | "Cactus"
  | "Tree"
  | "Garden"
  | "BenderGestalt2"
  | "ReyOsterrieth"
  | "Aile"
  | "Kaktus"
  | "Agac"
  | "Bahce"
  | "Bender"
  | "Rey"
  | "Luscher";

export type Language = "tr" | "en" | "ru" | "tk" | "uz";

export type RiskFlagType =
  | "self_harm"
  | "harm_others"
  | "sexual_inappropriate"
  | "violence"
  | "severe_distress"
  | "trend_regression";

export interface Insight {
  title: string;
  summary: string;
  evidence: string[];
  strength: "weak" | "moderate" | "strong";
}

export interface HomeTip {
  title: string;
  steps: string[];
  why: string;
}

export interface RiskFlag {
  type: RiskFlagType;
  summary: string;
  action: "consider_consulting_a_specialist";
}

export interface AnalysisMeta {
  testType: TaskType;
  age?: number;
  language: Language;
  confidence: number;
  uncertaintyLevel: "low" | "mid" | "high";
  dataQualityNotes: string[];
}

export interface TraumaAssessment {
  hasTraumaticContent: boolean;
  contentTypes: string[];
  severity: "low" | "moderate" | "high";
  professionalRecommendation: string;
  immediateActions: string[];
}

export interface AnalysisResponse {
  meta: AnalysisMeta;
  insights: Insight[];
  homeTips: HomeTip[];
  riskFlags: RiskFlag[];
  traumaAssessment: TraumaAssessment | null;
  conversationGuide?: {
    openingQuestions: string[];
    followUpTopics: string[];
    avoidTopics: string[];
  };
  professionalGuidance?: {
    whenToSeek: string[];
    resources: { name: string; url?: string }[];
  };
}

export interface SavedAnalysis {
  id: string;
  userId: string;
  taskType: TaskType;
  childAge?: number;
  childGender?: "male" | "female";
  language: Language;
  analysisResult: AnalysisResponse;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  notes?: string;
}

// Emotional indicator for UI display
export interface EmotionalIndicator {
  icon: string;
  label: string;
  color: string;
  insight: Insight;
}
