/**
 * Analysis Types
 * Shared between frontend and backend
 */

export type TaskType =
  | 'DAP'
  | 'HTP'
  | 'Family'
  | 'Cactus'
  | 'Tree'
  | 'Garden'
  | 'BenderGestalt2'
  | 'ReyOsterrieth'
  | 'Aile'
  | 'Kaktus'
  | 'Agac'
  | 'Bahce'
  | 'Bender'
  | 'Rey'
  | 'Luscher'
  | 'FreeDrawing';

export type Language = 'tr' | 'en' | 'ru' | 'tk' | 'uz';

export type RiskFlagType =
  | 'self_harm'
  | 'harm_others'
  | 'sexual_inappropriate'
  | 'violence'
  | 'severe_distress'
  | 'trend_regression';

export interface Insight {
  title: string;
  summary: string;
  evidence: string[];
  strength: 'weak' | 'moderate' | 'strong';
}

export interface HomeTip {
  title: string;
  steps: string[];
  why: string;
}

export interface RiskFlag {
  type: RiskFlagType;
  summary: string;
  action: 'consider_consulting_a_specialist';
}

export interface AnalysisMeta {
  testType: TaskType;
  age?: number;
  language: Language;
  confidence: number;
  uncertaintyLevel: 'low' | 'mid' | 'high';
  dataQualityNotes: string[];
}

export interface TraumaAssessment {
  hasTraumaticContent: boolean;
  contentTypes: string[];
  severity: 'low' | 'moderate' | 'high';
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
  childGender?: 'male' | 'female';
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

// ============================================
// Analysis Chat Types
// ============================================

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referencedInsightIndex?: number;
  metadata?: {
    suggestedQuestions?: string[];
    source?: 'faq' | 'ai' | 'context';
    confidence?: number;
  };
}

export interface AnalysisConversation {
  id: string;
  analysisId: string;
  userId: string;
  messages: ConversationMessage[];
  promptsCompleted: string[];
  sessionCount: number;
  lastMessageAt: string;
  childAge?: number;
  childName?: string;
  language: Language;
  createdAt: string;
  updatedAt: string;
}

export type NoteType = 'general' | 'observation' | 'question' | 'follow_up' | 'milestone';

export interface AnalysisNote {
  id: string;
  analysisId: string;
  userId: string;
  content: string;
  noteType: NoteType;
  tags: string[];
  referencedInsightIndex?: number;
  isSharedWithProfessional: boolean;
  sharedAt?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReflectionPrompt {
  id: string;
  question: string;
  emoji: string;
  category: 'observation' | 'emotional' | 'developmental' | 'action';
}

// Chat response from AI
export interface AnalysisChatResponse {
  message: string;
  suggestedQuestions: string[];
  referencedInsightIndex?: number;
  source: 'faq' | 'ai' | 'context';
  confidence?: number;
}

// Quick prompt chip for UI
export interface QuickPrompt {
  id: string;
  label: string;
  emoji?: string;
  question: string;
  category?: string;
}
