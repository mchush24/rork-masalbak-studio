export type ABVariant = 'A' | 'B';

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

export const safetyBanner = {
  text: 'Bu sonuçlar hipotezdir; kaygı varsa okul PDR/uzmana danışın.',
  color: '#B00020',
};

export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (retries <= 0) throw e;
    return withRetry(fn, retries - 1);
  }
}
