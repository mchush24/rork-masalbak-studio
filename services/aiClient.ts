import { AssessmentInput, AssessmentOutput } from "@/types/AssessmentSchema";

const API_BASE = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || "http://localhost:4000";

export async function analyzeDrawingRemote(payload: AssessmentInput): Promise<AssessmentOutput> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Analyze failed: ${res.status} - ${text}`);
  }
  
  return (await res.json()) as AssessmentOutput;
}
