export type TaskType =
  | "DAP"
  | "HTP"
  | "Aile"
  | "Kaktus"
  | "Agac"
  | "Bahce"
  | "Bender"
  | "Rey"
  | "Luscher";

export interface VisionObject {
  type:
    | "human"
    | "house"
    | "tree"
    | "cactus"
    | "sun"
    | "flower"
    | "window"
    | "door"
    | "path"
    | "other";
  size?: "tiny" | "small" | "medium" | "large";
  position?: "top_left" | "top_right" | "bottom_left" | "bottom_right" | "center";
  details?: Record<string, boolean | string | number>;
}

export interface AssessmentInput {
  app_version: string;
  schema_version: string;
  child: { age?: number; grade?: string; context?: string };
  task_type: TaskType;
  image_uri: string;
  vision_features?: Partial<VisionFeatures>;
  child_quote?: string;
}

export interface VisionFeatures {
  composition: { page_position: VisionObject["position"]; empty_space_ratio: number };
  pressure: "light" | "medium" | "heavy";
  erasure_marks: boolean;
  palette: string[];
  detected_objects: VisionObject[];
  relations?: { from: string; to: string; distance?: "near"|"mid"|"far"; note?: string }[];
}

export interface Hypothesis {
  theme:
    | "yakınlık_ozlemi"
    | "kaygi"
    | "guven_arayisi"
    | "ic_dunya"
    | "dis_dunya"
    | "aidiyet"
    | "savunma"
    | "agresyon"
    | "enerji"
    | "benlik_gucu"
    | "dikkat_organizasyon";
  confidence: number;
  evidence: string[];
}

export interface AssessmentOutput {
  task_type: TaskType;
  reflective_hypotheses: Hypothesis[];
  conversation_prompts: string[];
  activity_ideas: string[];
  safety_flags: { self_harm: boolean; abuse_concern: boolean };
  disclaimers: string[];
  feature_preview?: Partial<VisionFeatures>;
}
