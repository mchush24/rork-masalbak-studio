export type ABVariant = 'A'|'B';
let currentVariant: ABVariant | null = null;

export function pickVariant(): ABVariant {
  if (currentVariant) return currentVariant;
  currentVariant = Math.random() < 0.5 ? 'A' : 'B';
  return currentVariant;
}

export async function logEvent(name: string, data?: Record<string, any>) {
  try {
    console.log('[metric]', name, data || {});
  } catch {}
}

export function buildShareText(confidence: number, topTheme: string) {
  const pct = Math.round(confidence * 100);
  return `Çocuğumun çizimine nazik bir analiz yaptırdım. En güçlü ipucu: ${topTheme} (%${pct}). Sen de dene: app.link/indir`;
}

export function generateReferralCode(userId: string) {
  const r = Math.random().toString(36).slice(-2).toUpperCase();
  return (userId.slice(-6) + r).toUpperCase();
}
