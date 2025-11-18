export async function estimatePressureHeuristic(imageUri: string): Promise<'light'|'medium'|'heavy'> {
  console.log("[Pressure] Estimating pressure for:", imageUri);
  return 'medium';
}
