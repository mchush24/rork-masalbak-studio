/**
 * History Screen Type Definitions
 *
 * Type-safe definitions inferred from tRPC router outputs
 */

import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "./trpc";

// Infer all router outputs
type RouterOutput = inferRouterOutputs<AppRouter>;

// Analysis types
export type AnalysisListOutput = RouterOutput["analysis"]["list"];
export type Analysis = AnalysisListOutput["analyses"][number];

// Storybook types
export type Storybook = RouterOutput["studio"]["listStorybooks"][number];

// Coloring types
export type Coloring = RouterOutput["studio"]["listColorings"][number];

// Analysis result structure (commonly used in analysis)
export interface AnalysisInsight {
  title: string;
  summary: string;
  details?: string;
}

export interface AnalysisTip {
  title: string;
  description?: string;
}

export interface AnalysisRiskFlag {
  type: string;
  summary: string;
  severity?: string;
}

export interface AnalysisResult {
  insights?: AnalysisInsight[];
  tips?: AnalysisTip[];
  riskFlags?: AnalysisRiskFlag[];
  summary?: string;
  recommendations?: string[];
}

// Extended Analysis type with typed analysis_result
export interface TypedAnalysis extends Omit<Analysis, 'analysis_result'> {
  analysis_result?: AnalysisResult | null;
}

// Storybook page structure
export interface StorybookPage {
  img_url?: string;
  text?: string;
  page_number?: number;
}

// Extended Storybook type with typed pages
export interface TypedStorybook extends Omit<Storybook, 'pages'> {
  pages?: StorybookPage[];
  voice_urls?: string[];
}
