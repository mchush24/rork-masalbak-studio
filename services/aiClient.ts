import { AssessmentInput, AssessmentOutput } from "@/types/AssessmentSchema";
import Constants from "expo-constants";

const API_BASE = Constants.expoConfig?.extra?.api || "http://localhost:4000";

export async function analyzeDrawingRemote(payload: AssessmentInput): Promise<AssessmentOutput> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Analyze failed: ${res.status}`);
  }
  return (await res.json()) as AssessmentOutput;
}
