/**
 * Role-Aware Greeting Service
 * Part of #23: Profesyonel Copywriting Revizyonu
 *
 * Extends the base GreetingService with role-aware greetings.
 * - Parents: Playful, emoji-rich greetings
 * - Teachers: Professional but friendly greetings
 * - Experts: Formal, minimal greetings
 */

import { UserRole } from '@/lib/contexts/RoleContext';
import { GreetingService, Greeting, TimeOfDay } from './greeting-service';

// ============================================================================
// ROLE-BASED GREETING CONFIGURATIONS
// ============================================================================

interface RoleGreetingConfig {
  morningGreetings: Greeting[];
  afternoonGreetings: Greeting[];
  eveningGreetings: Greeting[];
  nightGreetings: Greeting[];
  firstVisit: Greeting;
  returningAfterAbsence: Greeting[];
  useEmoji: boolean;
}

// ============================================================================
// PARENT GREETINGS (Playful, Warm)
// ============================================================================

const PARENT_GREETINGS: RoleGreetingConfig = {
  morningGreetings: [
    { title: 'Günaydın!', subtitle: 'Güne yaratıcı başlayalım', emoji: '☀️' },
    { title: 'Günaydın!', subtitle: 'Bugün harika şeyler olacak', emoji: '🌅' },
    { title: 'Günaydın!', subtitle: 'Hayaller kurmaya hazır mısın?', emoji: '✨' },
    { title: 'Günaydın!', subtitle: 'Fırçalar hazır, başlayalım!', emoji: '🖌️' },
    { title: 'Günaydın!', subtitle: 'Yeni bir gün, yeni hikayeler', emoji: '📖' },
  ],
  afternoonGreetings: [
    { title: 'Merhaba!', subtitle: 'Hayal kurma zamanı', emoji: '🌈' },
    { title: 'Merhaba!', subtitle: 'Bugün ne yaratacağız?', emoji: '🤔' },
    { title: 'Merhaba!', subtitle: 'Yaratıcılık molası!', emoji: '☕' },
    { title: 'Merhaba!', subtitle: 'Renklerin dünyasına hoş geldin', emoji: '🎨' },
  ],
  eveningGreetings: [
    { title: 'İyi akşamlar!', subtitle: 'Gün bitmeden bir şeyler yaratalım', emoji: '🌅' },
    { title: 'İyi akşamlar!', subtitle: 'Akşam masalı zamanı', emoji: '🌙' },
    { title: 'İyi akşamlar!', subtitle: 'Günü güzel bitirelim', emoji: '✨' },
  ],
  nightGreetings: [
    { title: 'İyi geceler!', subtitle: 'Uyumadan önce bir masal?', emoji: '🌙' },
    { title: 'İyi geceler!', subtitle: 'Tatlı rüyalara hazırlık', emoji: '⭐' },
  ],
  firstVisit: {
    title: 'Hoş Geldin!',
    subtitle: 'Maceraya hazır mısın?',
    emoji: '🌟',
  },
  returningAfterAbsence: [
    { title: 'Seni Özledik!', subtitle: 'Tekrar hoş geldin', emoji: '💜' },
    { title: 'Sonunda Döndün!', subtitle: 'Seni bekliyorduk', emoji: '🤗' },
  ],
  useEmoji: true,
};

// ============================================================================
// TEACHER GREETINGS (Professional, Friendly)
// ============================================================================

const TEACHER_GREETINGS: RoleGreetingConfig = {
  morningGreetings: [
    { title: 'Günaydın', subtitle: 'Sınıfınız hazır' },
    { title: 'Günaydın', subtitle: 'Verimli bir gün dileriz' },
    { title: 'Günaydın', subtitle: 'Öğrenci değerlendirmeleriniz bekliyor' },
  ],
  afternoonGreetings: [
    { title: 'İyi günler', subtitle: 'Değerlendirmelere devam edin' },
    { title: 'İyi günler', subtitle: 'Sınıf paneline hoş geldiniz' },
  ],
  eveningGreetings: [
    { title: 'İyi akşamlar', subtitle: 'Günlük özet hazır' },
    { title: 'İyi akşamlar', subtitle: 'Değerlendirmelerinizi gözden geçirin' },
  ],
  nightGreetings: [
    { title: 'İyi akşamlar', subtitle: 'Günlük çalışmalarınız kaydedildi' },
  ],
  firstVisit: {
    title: 'Hoş Geldiniz',
    subtitle: 'Öğretmen paneline erişiminiz aktif',
  },
  returningAfterAbsence: [
    { title: 'Hoş Geldiniz', subtitle: 'Bekleyen değerlendirmeleriniz var' },
  ],
  useEmoji: false,
};

// ============================================================================
// EXPERT GREETINGS (Formal, Minimal)
// ============================================================================

const EXPERT_GREETINGS: RoleGreetingConfig = {
  morningGreetings: [
    { title: 'Günaydın', subtitle: 'Değerlendirmeleriniz bekliyor' },
    { title: 'Günaydın', subtitle: 'Klinik panel aktif' },
  ],
  afternoonGreetings: [
    { title: 'İyi günler', subtitle: 'Vaka dosyalarınız güncel' },
    { title: 'İyi günler', subtitle: 'Değerlendirme paneli' },
  ],
  eveningGreetings: [
    { title: 'İyi akşamlar', subtitle: 'Günün değerlendirmesi tamamlandı' },
  ],
  nightGreetings: [
    { title: 'İyi akşamlar', subtitle: 'Verileriniz kaydedildi' },
  ],
  firstVisit: {
    title: 'Hoş Geldiniz',
    subtitle: 'Profesyonel değerlendirme araçlarına erişiminiz aktif',
  },
  returningAfterAbsence: [
    { title: 'Hoş Geldiniz', subtitle: 'Bekleyen değerlendirmeler mevcut' },
  ],
  useEmoji: false,
};

// ============================================================================
// GREETING CONFIGURATION MAP
// ============================================================================

const ROLE_GREETING_MAP: Record<UserRole, RoleGreetingConfig> = {
  parent: PARENT_GREETINGS,
  teacher: TEACHER_GREETINGS,
  expert: EXPERT_GREETINGS,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

// ============================================================================
// ROLE-AWARE GREETING SERVICE
// ============================================================================

export class RoleAwareGreetingService {
  private role: UserRole;
  private config: RoleGreetingConfig;

  constructor(role: UserRole = 'parent') {
    this.role = role;
    this.config = ROLE_GREETING_MAP[role];
  }

  /**
   * Get the best greeting based on role and time
   */
  getGreeting(options?: { isFirstVisit?: boolean; daysSinceLastVisit?: number }): Greeting {
    // Check for special days first (using base service for Turkish holidays)
    if (GreetingService.isSpecialDay() && this.role === 'parent') {
      return GreetingService.getGreeting();
    }

    // First time visitor
    if (options?.isFirstVisit) {
      return this.config.firstVisit;
    }

    // Returning after long absence (more than 7 days)
    if (options?.daysSinceLastVisit && options.daysSinceLastVisit > 7) {
      return getRandomItem(this.config.returningAfterAbsence);
    }

    // Time-based greeting
    const timeOfDay = getTimeOfDay();
    switch (timeOfDay) {
      case 'morning':
        return getRandomItem(this.config.morningGreetings);
      case 'afternoon':
        return getRandomItem(this.config.afternoonGreetings);
      case 'evening':
        return getRandomItem(this.config.eveningGreetings);
      case 'night':
        return getRandomItem(this.config.nightGreetings);
    }
  }

  /**
   * Get formatted greeting with optional emoji
   */
  getFormattedGreeting(options?: { isFirstVisit?: boolean; daysSinceLastVisit?: number }): {
    title: string;
    subtitle: string;
  } {
    const greeting = this.getGreeting(options);
    return {
      title: this.config.useEmoji && greeting.emoji
        ? `${greeting.emoji} ${greeting.title}`
        : greeting.title,
      subtitle: greeting.subtitle,
    };
  }

  /**
   * Get just the title
   */
  getTitle(options?: { isFirstVisit?: boolean; daysSinceLastVisit?: number }): string {
    const formatted = this.getFormattedGreeting(options);
    return formatted.title;
  }

  /**
   * Get just the subtitle
   */
  getSubtitle(options?: { isFirstVisit?: boolean; daysSinceLastVisit?: number }): string {
    return this.getGreeting(options).subtitle;
  }

  /**
   * Check if emoji should be shown
   */
  shouldShowEmoji(): boolean {
    return this.config.useEmoji;
  }

  /**
   * Update role
   */
  setRole(role: UserRole): void {
    this.role = role;
    this.config = ROLE_GREETING_MAP[role];
  }

  /**
   * Get current role
   */
  getRole(): UserRole {
    return this.role;
  }

  /**
   * Get current time of day
   */
  getTimeOfDay(): TimeOfDay {
    return getTimeOfDay();
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

let serviceInstance: RoleAwareGreetingService | null = null;

export function getRoleAwareGreetingService(role?: UserRole): RoleAwareGreetingService {
  if (!serviceInstance) {
    serviceInstance = new RoleAwareGreetingService(role);
  } else if (role && serviceInstance.getRole() !== role) {
    serviceInstance.setRole(role);
  }
  return serviceInstance;
}

export default RoleAwareGreetingService;
