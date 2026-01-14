/**
 * GreetingService - Dinamik ve kişiselleştirilmiş selamlamalar
 *
 * Özellikler:
 * - Saate göre selamlama (sabah/öğlen/akşam/gece)
 * - Her zaman dilimi için çoklu varyasyon
 * - Türk özel günleri desteği
 * - Haftanın gününe özel mesajlar
 * - İlk ziyaret ve uzun aradan sonra dönüş mesajları
 *
 * Not: Seri ve milestone mesajları Rozetler sisteminde gösterilir
 */

// ============================================
// TYPES
// ============================================

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export type UserActivity = {
  lastVisit?: Date;
  isFirstVisit?: boolean;
};

export type Greeting = {
  title: string;
  subtitle: string;
  emoji?: string;
};

// ============================================
// TIME-BASED GREETINGS
// ============================================

const MORNING_GREETINGS: Greeting[] = [
  { title: 'Günaydın!', subtitle: 'Güne yaratıcı başlayalım', emoji: '☀️' },
  { title: 'Günaydın!', subtitle: 'Bugün harika şeyler olacak', emoji: '🌅' },
  { title: 'Günaydın!', subtitle: 'Hayaller kurmaya hazır mısın?', emoji: '✨' },
  { title: 'Günaydın!', subtitle: 'Fırçalar hazır, başlayalım!', emoji: '🖌️' },
  { title: 'Günaydın!', subtitle: 'Yeni bir gün, yeni hikayeler', emoji: '📖' },
  { title: 'Günaydın!', subtitle: 'Yaratıcılık zamanı!', emoji: '🎨' },
];

const AFTERNOON_GREETINGS: Greeting[] = [
  { title: 'Merhaba!', subtitle: 'Hayal kurma zamanı', emoji: '🌈' },
  { title: 'Merhaba!', subtitle: 'Bugün ne yaratacağız?', emoji: '🤔' },
  { title: 'Merhaba!', subtitle: 'Yaratıcılık molası!', emoji: '☕' },
  { title: 'Merhaba!', subtitle: 'Bir masal uzağındayız', emoji: '📚' },
  { title: 'Merhaba!', subtitle: 'Renklerin dünyasına hoş geldin', emoji: '🎨' },
  { title: 'Merhaba!', subtitle: 'Hayal gücü kapısı açıldı!', emoji: '🚪' },
];

const EVENING_GREETINGS: Greeting[] = [
  { title: 'İyi akşamlar!', subtitle: 'Gün bitmeden bir şeyler yaratalım', emoji: '🌅' },
  { title: 'İyi akşamlar!', subtitle: 'Akşam masalı zamanı', emoji: '🌙' },
  { title: 'İyi akşamlar!', subtitle: 'Günü güzel bitirelim', emoji: '✨' },
  { title: 'İyi akşamlar!', subtitle: 'Son bir çizim mi?', emoji: '🖍️' },
  { title: 'İyi akşamlar!', subtitle: 'Hayaller bizi bekliyor', emoji: '💫' },
  { title: 'İyi akşamlar!', subtitle: 'Yaratıcı bir akşam olsun', emoji: '🎭' },
];

const NIGHT_GREETINGS: Greeting[] = [
  { title: 'İyi geceler!', subtitle: 'Uyumadan önce bir masal?', emoji: '🌙' },
  { title: 'İyi geceler!', subtitle: 'Tatlı rüyalara hazırlık', emoji: '⭐' },
  { title: 'İyi geceler!', subtitle: 'Gece kuşları için masal', emoji: '🦉' },
  { title: 'İyi geceler!', subtitle: 'Rüyalara ilham verelim', emoji: '💤' },
  { title: 'İyi geceler!', subtitle: 'Son bir hikaye mi?', emoji: '📖' },
  { title: 'İyi geceler!', subtitle: 'Yıldızlar altında hayal kur', emoji: '🌟' },
];

// ============================================
// SPECIAL DAY GREETINGS (Turkish Holidays)
// ============================================

type SpecialDay = {
  month: number; // 1-12
  day: number;
  greeting: Greeting;
  // Some holidays have variable dates (like Ramadan/Eid)
  isVariable?: boolean;
};

const SPECIAL_DAYS: SpecialDay[] = [
  // Yılbaşı
  {
    month: 1,
    day: 1,
    greeting: {
      title: 'Mutlu Yıllar!',
      subtitle: 'Yeni yılda yeni masallar',
      emoji: '🎉',
    },
  },
  // 23 Nisan Ulusal Egemenlik ve Çocuk Bayramı
  {
    month: 4,
    day: 23,
    greeting: {
      title: '23 Nisan Kutlu Olsun!',
      subtitle: 'Bugün senin günün!',
      emoji: '🎈',
    },
  },
  // 19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı
  {
    month: 5,
    day: 19,
    greeting: {
      title: '19 Mayıs Kutlu Olsun!',
      subtitle: 'Gençliğin ve sporcuların bayramı',
      emoji: '🇹🇷',
    },
  },
  // 30 Ağustos Zafer Bayramı
  {
    month: 8,
    day: 30,
    greeting: {
      title: 'Zafer Bayramı Kutlu Olsun!',
      subtitle: 'Büyük zaferin yıl dönümü',
      emoji: '🎖️',
    },
  },
  // 29 Ekim Cumhuriyet Bayramı
  {
    month: 10,
    day: 29,
    greeting: {
      title: 'Cumhuriyet Bayramı Kutlu Olsun!',
      subtitle: '100 yaşında genç bir cumhuriyet',
      emoji: '🇹🇷',
    },
  },
  // 10 Kasım Atatürk'ü Anma Günü
  {
    month: 11,
    day: 10,
    greeting: {
      title: 'Atatürk\'ü Saygıyla Anıyoruz',
      subtitle: 'Fikirler ölmez',
      emoji: '🕯️',
    },
  },
  // Sevgililer Günü
  {
    month: 2,
    day: 14,
    greeting: {
      title: 'Sevgi Dolu Bir Gün!',
      subtitle: 'Sevdiklerine bir masal yarat',
      emoji: '💝',
    },
  },
  // Anneler Günü (Mayıs'ın 2. Pazar'ı - yaklaşık 10-14 Mayıs)
  {
    month: 5,
    day: 12, // Ortalama tarih
    greeting: {
      title: 'Anneler Günü Kutlu Olsun!',
      subtitle: 'Annen için özel bir şey yarat',
      emoji: '💐',
    },
  },
  // Babalar Günü (Haziran'ın 3. Pazar'ı - yaklaşık 15-21 Haziran)
  {
    month: 6,
    day: 16, // Ortalama tarih
    greeting: {
      title: 'Babalar Günü Kutlu Olsun!',
      subtitle: 'Baban için özel bir şey yarat',
      emoji: '👔',
    },
  },
  // Yeni yıl arifesi
  {
    month: 12,
    day: 31,
    greeting: {
      title: 'Yılbaşı Arifesi!',
      subtitle: 'Yeni yıla sayılı saatler',
      emoji: '🎊',
    },
  },
];

// ============================================
// DAY OF WEEK GREETINGS
// ============================================

const DAY_OF_WEEK_SUBTITLES: Record<number, string[]> = {
  0: [ // Pazar
    'Pazar günü yaratıcılık zamanı!',
    'Hafta sonu masallarla dolsun',
    'Ailece bir şeyler yaratalım',
  ],
  1: [ // Pazartesi
    'Yeni hafta, yeni hikayeler!',
    'Haftaya enerjik başlayalım',
    'Pazartesi neşesi!',
  ],
  2: [ // Salı
    'Bugün neler keşfedeceğiz?',
    'Salı sürprizi: Bir masal!',
    'Yaratıcılık devam ediyor',
  ],
  3: [ // Çarşamba
    'Haftanın ortası, motivasyon zamanı!',
    'Çarşamba çizimi zamanı',
    'Yarı yoldayız, devam!',
  ],
  4: [ // Perşembe
    'Hafta sonu yaklaşıyor!',
    'Perşembe ilhamı',
    'Bugün ne yaratacaksın?',
  ],
  5: [ // Cuma
    'Cuma neşesi! Hafta sonu geliyor',
    'Hafta sonu için hikaye biriktir',
    'Cuma yaratıcılık günü!',
  ],
  6: [ // Cumartesi
    'Cumartesi macerası başlasın!',
    'Hafta sonu = Masal zamanı',
    'Bugün her şey mümkün!',
  ],
};

// ============================================
// USER ACTIVITY BASED GREETINGS
// ============================================

const FIRST_VISIT_GREETING: Greeting = {
  title: 'Hoş Geldin!',
  subtitle: 'Maceraya hazır mısın?',
  emoji: '🌟',
};

const RETURNING_AFTER_LONG_ABSENCE: Greeting[] = [
  { title: 'Seni Özledik!', subtitle: 'Tekrar hoş geldin', emoji: '💜' },
  { title: 'Sonunda Döndün!', subtitle: 'Seni bekliyorduk', emoji: '🤗' },
  { title: 'Hoş Geldin!', subtitle: 'Çok özledik seni', emoji: '💫' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get current time of day
 */
function getTimeOfDay(date: Date = new Date()): TimeOfDay {
  const hour = date.getHours();

  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Get random item from array
 */
function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Check if date matches a special day
 */
function getSpecialDayGreeting(date: Date = new Date()): Greeting | null {
  const month = date.getMonth() + 1; // getMonth() is 0-indexed
  const day = date.getDate();

  const specialDay = SPECIAL_DAYS.find(
    (sd) => sd.month === month && sd.day === day
  );

  return specialDay?.greeting || null;
}

/**
 * Calculate days since last visit
 */
function getDaysSinceLastVisit(lastVisit?: Date): number {
  if (!lastVisit) return -1;

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastVisit.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Get time-based greeting with variations
 */
function getTimeBasedGreeting(timeOfDay: TimeOfDay): Greeting {
  switch (timeOfDay) {
    case 'morning':
      return getRandomItem(MORNING_GREETINGS);
    case 'afternoon':
      return getRandomItem(AFTERNOON_GREETINGS);
    case 'evening':
      return getRandomItem(EVENING_GREETINGS);
    case 'night':
      return getRandomItem(NIGHT_GREETINGS);
  }
}

/**
 * Get day of week subtitle
 */
function getDayOfWeekSubtitle(date: Date = new Date()): string | null {
  const dayOfWeek = date.getDay();
  const subtitles = DAY_OF_WEEK_SUBTITLES[dayOfWeek];

  // 30% chance to use day-of-week subtitle
  if (Math.random() < 0.3 && subtitles) {
    return getRandomItem(subtitles);
  }

  return null;
}

// ============================================
// MAIN SERVICE
// ============================================

export class GreetingService {
  /**
   * Get the best greeting based on all factors
   */
  static getGreeting(userActivity?: UserActivity): Greeting {
    const now = new Date();

    // 1. Check for special days first (highest priority)
    const specialDayGreeting = getSpecialDayGreeting(now);
    if (specialDayGreeting) {
      return specialDayGreeting;
    }

    // 2. Check user activity based greetings
    if (userActivity) {
      // First time visitor
      if (userActivity.isFirstVisit) {
        return FIRST_VISIT_GREETING;
      }

      // Returning after long absence (more than 7 days)
      const daysSinceLastVisit = getDaysSinceLastVisit(userActivity.lastVisit);
      if (daysSinceLastVisit > 7) {
        return getRandomItem(RETURNING_AFTER_LONG_ABSENCE);
      }
    }

    // 3. Get time-based greeting
    const timeOfDay = getTimeOfDay(now);
    const greeting = getTimeBasedGreeting(timeOfDay);

    // 4. Optionally override subtitle with day-of-week message
    const daySubtitle = getDayOfWeekSubtitle(now);
    if (daySubtitle) {
      return {
        ...greeting,
        subtitle: daySubtitle,
      };
    }

    return greeting;
  }

  /**
   * Get just the title (for simple use cases)
   */
  static getTitle(userActivity?: UserActivity): string {
    const greeting = this.getGreeting(userActivity);
    return greeting.emoji ? `${greeting.emoji} ${greeting.title}` : greeting.title;
  }

  /**
   * Get just the subtitle
   */
  static getSubtitle(userActivity?: UserActivity): string {
    return this.getGreeting(userActivity).subtitle;
  }

  /**
   * Get formatted greeting with emoji in title
   */
  static getFormattedGreeting(userActivity?: UserActivity): { title: string; subtitle: string } {
    const greeting = this.getGreeting(userActivity);
    return {
      title: greeting.emoji ? `${greeting.emoji} ${greeting.title}` : greeting.title,
      subtitle: greeting.subtitle,
    };
  }

  /**
   * Check if today is a special day
   */
  static isSpecialDay(): boolean {
    return getSpecialDayGreeting() !== null;
  }

  /**
   * Get current time of day
   */
  static getTimeOfDay(): TimeOfDay {
    return getTimeOfDay();
  }
}

// Default export for convenience
export default GreetingService;
