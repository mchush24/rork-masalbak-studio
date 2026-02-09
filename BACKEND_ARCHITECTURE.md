# Renkioo Backend Architecture & Roadmap

> Son guncelleme: 2026-02-09 | Durum: Production (Railway)

---

## 1. Mevcut Mimari

### 1.1 Stack

| Katman       | Teknoloji                                      | Versiyon |
| ------------ | ---------------------------------------------- | -------- |
| Runtime      | Node.js                                        | 22+      |
| Framework    | Hono                                           | 4.10.4   |
| API          | tRPC                                           | 11.7.1   |
| Validation   | Zod                                            | 4.1.12   |
| Database     | Supabase PostgreSQL                            | -        |
| Storage      | Supabase Storage (masalbak bucket)             | -        |
| Auth         | Custom JWT (jsonwebtoken + bcryptjs)           | -        |
| AI - Analiz  | OpenAI GPT-4o-mini (Vision)                    | -        |
| AI - Masal   | OpenAI GPT-4 Turbo                             | -        |
| AI - Chatbot | Anthropic Claude Haiku (fallback: GPT-4o-mini) | -        |
| AI - Gorsel  | FAL.ai Flux 2.0 Pro ($0.003/gorsel)            | -        |
| Email        | Resend                                         | -        |
| Hosting      | Railway                                        | -        |

### 1.2 Dizin Yapisi

```
backend/
├── server.ts                     # Entry point, graceful shutdown
├── hono.ts                       # Hono app (CORS, security headers, rate limit)
├── trpc/
│   ├── app-router.ts             # Ana router (10 alt-router)
│   ├── create-context.ts         # JWT auth, request context
│   ├── middleware/
│   │   └── rate-limit.ts         # tRPC procedure-level rate limiting
│   └── routes/                   # 49 dosya, ~46 procedure
│       ├── auth/                 # 10 endpoint
│       ├── user/                 # 9 endpoint
│       ├── studio/               # 14 endpoint
│       ├── analysis/             # 5 endpoint
│       ├── interactive-story/    # 5 endpoint
│       ├── badges/               # 3 endpoint
│       ├── coloring/             # 2 endpoint
│       ├── chatbot.ts            # 8+ endpoint
│       ├── analysis-chat.ts      # 3 endpoint
│       ├── analysis-notes.ts     # CRUD
│       └── social-feed.ts        # 12 endpoint
├── lib/                          # 33 modul, ~14,500 satir
│   ├── auth/jwt.ts               # Access + Refresh token
│   ├── supabase.ts               # Shared client (legacy)
│   ├── supabase-secure.ts        # Per-request RLS client
│   ├── badge-service.ts          # 80+ rozet, 1570 satir
│   ├── chatbot.ts                # AI asistan, 60+ FAQ, 2000+ satir
│   ├── circuit-breaker.ts        # AI resilience pattern
│   ├── generate-interactive-story.ts
│   ├── generate-story-from-analysis-v2.ts
│   ├── image-generation.ts       # Flux 2.0 Pro (FAL.ai)
│   ├── email.ts                  # Resend entegrasyonu
│   ├── password.ts               # bcrypt hash/verify
│   └── ...
├── middleware/
│   └── rate-limit.ts             # Hono HTTP-level rate limiting
├── health/
│   └── index.ts                  # /live, /ready, /health, /metrics
├── migrations/                   # 20 SQL migration
└── types/                        # TypeScript tip tanimlari
```

### 1.3 Calisir Durumdaki Ozellikler

#### Auth (10 procedure)

- [x] `auth.register` - Email + verification code (6 digit, 10 dk TTL)
- [x] `auth.verifyEmail` - Kod dogrulama + JWT uretimi
- [x] `auth.loginWithPassword` - Sifre ile giris + JWT
- [x] `auth.refreshToken` - Access token yenileme (30 gun refresh)
- [x] `auth.requestPasswordReset` - Sifre sifirlama kodu
- [x] `auth.resetPassword` - Sifre sifirlama
- [x] `auth.setPassword` - Ilk sifre olusturma
- [x] `auth.checkEmail` - Email kontrolu
- [x] `auth.updateBiometric` - Biyometrik giris tercihi
- [x] `auth.completeOnboarding` - Onboarding tamamlama

#### User (9 procedure)

- [x] `user.getProfile` - Profil bilgileri
- [x] `user.updateProfile` - Profil guncelleme
- [x] `user.getChildren` - Cocuk profilleri (JSONB)
- [x] `user.updateChildren` - Cocuk ekleme/duzenleme
- [x] `user.getSettings` - Dil, tema, bildirim tercihleri
- [x] `user.updateSettings` - Ayar guncelleme
- [x] `user.getUserStats` - Analiz/masal/boyama sayilari + streak
- [x] `user.deleteAccount` - GDPR uyumlu hesap silme (cascade)
- [x] `user.exportData` - GDPR veri ihracati (JSON)

#### Studio - Cizim Analizi

- [x] `studio.analyzeDrawing` - GPT-4 Vision ile cizim analizi
  - 10+ test tipi: DAP, HTP, Family, Cactus, Tree, Garden, Bender, Rey, Luscher
  - Max 10 gorsel, her biri 5MB
  - Travma degerlendirme (24 kategori: ACEs framework)
  - 5 dil destegi (TR, EN, RU, TK, UZ)
  - Ebeveyn konusma rehberi + profesyonel yonlendirme

#### Studio - Masal Olusturma

- [x] `studio.createStorybook` - AI masal (GPT-4 Turbo + Flux 2.0)
- [x] `studio.generateStoryFromDrawing` - Cizimden masal
- [x] `studio.suggestStoryThemes` - Tema onerileri
- [x] `studio.getStorybook` / `listStorybooks` / `deleteStorybook`

#### Studio - Boyama

- [x] `studio.generateColoringPDF` - Boyama PDF uretimi (Puppeteer)
- [x] `studio.generateColoringFromDrawing` - Cizimden boyama sayfasi
- [x] `studio.suggestColors` - AI renk paleti
- [x] `studio.saveCompletedColoring` - Bitirilen boyama kaydi
- [x] `studio.getColoring` / `listColorings` / `deleteColoring`

#### Interaktif Masal (5 procedure)

- [x] `interactiveStory.generate` - Dallanan hikaye uretimi
- [x] `interactiveStory.makeChoice` - Secim yap, sonraki bolum
- [x] `interactiveStory.getSession` - Oturum devam ettirme
- [x] `interactiveStory.generateParentReport` - Kisilik raporu (7 ozellik)
- [x] `interactiveStory.list` - Hikayeleri listele

#### Rozet Sistemi (3 procedure)

- [x] `badges.list` - Kazanilan rozetler
- [x] `badges.getProgress` - Ilerleme takibi
- [x] `badges.checkNew` - Yeni rozet kontrolu
- [x] BadgeService: 80+ rozet, otomatik odullendirme

#### Chatbot (8+ procedure)

- [x] `chatbot.sendMessage` - AI asistan (FAQ + Claude/GPT fallback)
- [x] `chatbot.getFAQs` - 60+ FAQ (kategorili)
- [x] `chatbot.search` - FAQ arama
- [x] `chatbot.getProactiveSuggestion` - Ekran bazli oneri
- [x] Duygu algilama, intent siniflandirma, circuit breaker

#### Social Feed (12 procedure)

- [x] `socialFeed.getDiscoverFeed` - Birlesik kesif akisi
- [x] `socialFeed.getDailyTip` / `listExpertTips` - Uzman ipuclari
- [x] `socialFeed.getDailySuggestions` / `listActivities` - Aktivite onerileri
- [x] `socialFeed.listGallery` / `submitToGallery` / `likeGalleryItem`
- [x] `socialFeed.listStories` / `submitStory` / `likeStory`
- [x] Moderasyon destegi (is_approved flag)

#### Diger

- [x] `analysisChat.sendMessage` - Analiz uzerine soru-cevap
- [x] `analysisNotes.*` - Ebeveyn not sistemi
- [x] `coloring.recordActivity` / `getStats` - Boyama istatistikleri

### 1.4 Guvenlik Mekanizmalari

| Mekanizma            | Durum     | Detay                                                    |
| -------------------- | --------- | -------------------------------------------------------- |
| JWT Auth             | Calisiyor | Access (7 gun) + Refresh (30 gun), issuer/audience check |
| Password Hash        | Calisiyor | bcrypt 12 round                                          |
| Rate Limiting (HTTP) | Calisiyor | General: 100/15dk, Auth: 5/15dk, AI: 10/saat             |
| Rate Limiting (tRPC) | Calisiyor | Auth: 5/15dk, AI-anon: 10/saat, AI-auth: 20/saat         |
| Security Headers     | Calisiyor | OWASP uyumlu (X-Frame, CSP, HSTS, XSS, nosniff)          |
| CORS                 | Calisiyor | Allowlist + wildcard, localhost dev                      |
| Input Validation     | Calisiyor | Tum endpoint'lerde Zod schema                            |
| RLS                  | Kismen    | supabase-secure.ts ile per-request context               |
| Env Validation       | Calisiyor | Startup'ta 15+ degisken kontrolu                         |
| Circuit Breaker      | Calisiyor | AI provider'lar icin (3 hata -> open)                    |
| Graceful Shutdown    | Calisiyor | SIGTERM/SIGINT, 10sn timeout                             |

### 1.5 Veritabani Tablolari

#### Core

- `users` - Profil, cocuk bilgileri (JSONB), abonelik, kota
- `verification_codes` - Email dogrulama kodlari (10 dk TTL)
- `user_settings` - Tema, dil, bildirim, gizlilik tercihleri
- `analyses` - Cizim analiz sonuclari (JSONB), FK: `user_id`
- `storybooks` - Masallar (pages JSONB), FK: `user_id_fk`
- `colorings` - Boyama sayfalari, FK: `user_id_fk`

#### Gamification

- `user_badges` - Kazanilan rozetler
- `user_activity` - Gunluk aktivite takibi (streak)
- `user_coloring_stats` - Boyama metrikleri

#### Interactive Story

- `interactive_story_sessions` - Hikaye oturumlari
- `parent_choice_reports` - Kisilik raporlari
- `choice_analytics` - Secim verileri

#### Social

- `expert_tips` - Uzman ipuclari
- `activity_suggestions` - Aktivite onerileri
- `community_gallery` - Topluluk galerisi (moderasyonlu)
- `success_stories` - Basari hikayeleri
- `gallery_likes` / `story_likes` - Begeni tablolari

#### Chatbot

- `chatbot_faqs` - FAQ veritabani
- `chatbot_embeddings` - Semantik arama vektorleri
- `chatbot_unanswered_queries` - Cevaplanamayan soru analitigi

#### Diger

- `analysis_chat_threads` - Analiz uzerine sohbet gecmisi

---

## 2. Bilinen Sorunlar

### 2.1 Kritik (P0) - TUMU COZULDU

**~~BUG-01: `user_id` vs `user_id_fk` tutarsizligi~~** DOGRULANDI

- Tum sorgular dogru kolonu kullaniyor (analyses→user_id, storybooks/colorings→user_id_fk)

**~~BUG-02: Verification code race condition~~** DUZELTILDI

- Token uretimi kod silinmeden onceye tasindi + brute-force korunasi eklendi

**~~BUG-03: Error message leakage~~** DUZELTILDI

- 6 dosyada 7 hata mesaji sanitize edildi (Turkce, kullanici dostu)

### 2.2 Yuksek Oncelik (P1) - COGU COZULDU

**~~PERF-01: BadgeService N+1 sorgu~~** DUZELTILDI

- getUserStats(): 6 sequential → Promise.all (paralel)
- checkAndAwardBadges(): N ayrı INSERT → 1 batch upsert
- recordActivity(): Badge kontrolleri parallelized

**~~PERF-02: TTS audio uretimi sirayla~~** DUZELTILDI

- `story.ts`: for-loop → Promise.all (paralel uretim)

**~~PERF-03: Puppeteer memory leak~~** DUZELTILDI

- `story.ts` ve `coloring.ts`: try-finally ile browser.close() garanti

**~~SEC-01: Refresh token revocation yok~~** DUZELTILDI

- `refresh_tokens` tablosu, token rotation, logout endpoint, sifre degisiminde revoke

**SEC-02: Rate limiting in-memory** (ERTELENDI)

- Tek instance'da yeterli, scale-up'ta Upstash Redis'e gecilecek

### 2.3 Orta Oncelik (P2)

**ARCH-01: Iki farkli Supabase client**

- `supabase.ts` -> `supabase` (eski, dogrudan export)
- `supabase-secure.ts` -> `supa` (Proxy) + `getSecureClient()` (RLS)
- Route'lar hangisini kullanacagini karistiriyor

**~~ARCH-02: Health check placeholder'lari~~** DUZELTILDI

- `checkDatabase()` gercek Supabase ping yapiyor
- `checkExternalAPIs()` gercek OpenAI ping yapiyor
- `checkDisk()` placeholder kaldirildi

**PERF-04: OpenAI streaming kullanilmiyor**

- 15 dosyada OpenAI cagrisi var, hicbiri stream kullanmiyor
- Kullanici tam yaniti beklemek zorunda

**PERF-05: Eksik DB index'ler**

- `user_activity(user_id, activity_date)` - streak sorgulari icin
- `gallery_likes(gallery_id, user_id)` - composit index
- `story_likes(story_id, user_id)` - composit index

**~~SEC-03: CSRF korumasii yok~~** DUZELTILDI

- Content-Type application/json zorlamasi + JWT Bearer auth (cookie-free)

**~~SEC-04: Request body size limit yok~~** DUZELTILDI

- Genel 1MB, tRPC 10MB body limit eklendi

---

## 3. Roadmap

### Faz 1: Kritik Bug Fix (1-2 gun) - TAMAMLANDI (2026-02-09)

- [x] `user_id` / `user_id_fk` tutarsizligi dogrulandı - tüm sorgular dogru
- [x] Verification code race condition fix
  - `verify-email.ts`: Token üretimi kod silinmeden önceye taşındı
- [x] Error message sanitization (7 mesaj, 6 dosya)
  - `register.ts`, `set-password.ts`, `update-biometric.ts`, `complete-onboarding.ts`
- [x] Puppeteer `try-finally` eklendi
  - `coloring.ts` ve `story.ts` PDF üretiminde browser.close() garanti
- [x] TTS `Promise.all()` fix
  - `story.ts` ses üretimi paralel (for-loop → Promise.all)

### Faz 2: Guvenlik Sertlestirme (3-5 gun) - TAMAMLANDI (2026-02-09)

- [x] Request body size limit
  - Hono middleware: genel 1MB, tRPC 10MB (base64 görseller)
- [x] Verification code brute-force koruması
  - Exponential backoff: 3 başarısız → 1dk, 6 → 5dk, 9+ → 15dk lockout
- [x] Refresh token revocation
  - `refresh_tokens` tablosu (migration 023)
  - `lib/auth/refresh-tokens.ts` utility modülü
  - Login, verify-email, refresh-token'da token hash kaydı
  - Token rotation: refresh'te eski token revoke
  - `auth.logout` endpoint (tek cihaz / tüm cihazlar)
  - Şifre sıfırlamada tüm tokenlar revoke
  - delete-account cascade'e eklendi
- [x] CSRF koruması
  - Content-Type: application/json zorlaması (POST requests)
  - JWT Bearer auth zaten cookie-based degil → doğal CSRF koruması
- [ ] Rate limiting Redis migrasyonu (Upstash) - ERTELENDI
  - Tek Railway instance'da in-memory yeterli
  - `trpc/middleware/rate-limit.ts` satirlar 298-322'de hazir migration notu
  - Scale-up aninda `@upstash/ratelimit` ile geçiş yapılacak

### Faz 3: Performans Optimizasyonu (1 hafta) - BUYUK OLCUDE TAMAMLANDI (2026-02-09)

- [x] BadgeService N+1 fix
  - `getUserStats()`: 6 sequential → 6 parallel (Promise.all) ~5x hız
  - `checkAndAwardBadges()`: N ayrı INSERT → 1 batch upsert
  - `recordActivity()`: Time/special badge checks parallelized
- [ ] OpenAI streaming response - ERTELENDI
  - `analyzeDrawing`, `createStorybook`, `interactiveStory.generate`
  - tRPC subscription veya SSE altyapisi gerekli
- [x] DB index'leri eklendi (migration 024)
  - `community_gallery(created_at DESC) WHERE is_approved = true`
  - `success_stories(created_at DESC) WHERE is_approved = true`
  - `analyses(user_id, created_at DESC)`
  - `storybooks(user_id_fk, created_at DESC)`
  - `colorings(user_id_fk, created_at DESC)`
  - `refresh_tokens(user_id) WHERE revoked_at IS NULL`
  - Not: `user_activity`, `gallery_likes`, `story_likes` composite indexleri zaten mevcut
- [x] Supabase client standardizasyonu - ANALIZ TAMAMLANDI
  - Public route'lar doğru şekilde shared client kullanıyor
  - Protected route'lar (social-feed.ts) service role ile çalışıyor - RLS bypass
  - Tam standardizasyon için RLS policy migrasyonu gerekli (P2)
- [x] Response caching eklendi
  - `lib/cache.ts`: Reusable TTLCache utility
  - `getDailyTip`: 1 saat cache
  - `getDiscoverFeed`: 5 dakika cache (childAge bazlı key)

### Faz 4: Altyapi Iyilestirme (1-2 hafta) - KISMEN TAMAMLANDI (2026-02-09)

- [ ] Background job queue - ERTELENDI
  - BullMQ veya Upstash QStash (harici servis gerekli)
  - Puppeteer PDF uretimi -> worker queue
  - Uzun AI operasyonlari -> async job + polling/webhook
- [ ] Redis caching layer - ERTELENDI
  - In-memory TTLCache ile baslangic yapildi (Faz 3)
  - Scale-up'ta Upstash Redis'e gecilecek
- [x] Health check tamamlama
  - `checkDatabase()`: Gercek Supabase ping (SELECT from users)
  - `checkExternalAPIs()`: Gercek OpenAI API ping (GET /v1/models, 5sn timeout)
  - `checkDisk()` placeholder kaldirildi
- [x] Monitoring genisletme
  - `lib/monitoring.ts`: Per-procedure request count, error count, avg latency
  - tRPC monitoring middleware (tum procedure'lara otomatik)
  - `/metrics` endpoint'e Prometheus-uyumlu trpc_requests_total, trpc_errors_total, trpc_latency_avg_ms eklendi
  - AI API maliyet takibi → P2 (loglama altyapisi gerekli)

### Faz 5: Eksik Ozellikler (2-4 hafta)

- [ ] File upload endpoint
  - `storage.uploadFile` - base64 -> Supabase Storage
  - Avatar yukleme
  - Dosya boyutu / kota kontrolu
- [ ] Activity logging (analytics)
  - `activity_logs` tablosu olustur
  - `analytics.logEvent` / `analytics.getUserStats` procedure
  - Kullanici davranis takibi
- [ ] Quota management
  - `users.quota_used` alani var ama enforce edilmiyor
  - Free: 5 analiz/ay, 3 masal/ay
  - Pro: 50 analiz/ay, 20 masal/ay
  - Premium: Sinirsiz
- [ ] Subscription tier enforcement
  - Middleware seviyesinde tier kontrolu
  - Kota asildiginda bilgilendirme
- [ ] Push notification altyapisi
  - Expo push notifications
  - Badge kazanma bildirimleri
  - Gunluk aktivite hatirlticilari

### Faz 6: Olceklendirme (Gelecek)

- [ ] Multi-instance deployment
  - Redis-backed session + rate limiting (Faz 2 ile tamamlanir)
  - Stateless backend tasarimi (zaten buyuk olcude oyle)
- [ ] CDN entegrasyonu
  - Supabase Storage onunde CDN
  - Statik icerik caching
- [ ] Database read replicas
  - Analitik sorgulari icin ayri read replica
- [ ] OpenTelemetry
  - Distributed tracing
  - AI operasyon izleme

---

## 4. AI Entegrasyonlari

| Servis    | Kullanim         | Model                  | Maliyet            |
| --------- | ---------------- | ---------------------- | ------------------ |
| OpenAI    | Cizim analizi    | GPT-4o-mini (Vision)   | ~$0.01/analiz      |
| OpenAI    | Masal uretimi    | GPT-4 Turbo            | ~$0.03/masal       |
| OpenAI    | Embeddings       | text-embedding-3-small | ~$0.001/sorgu      |
| Anthropic | Chatbot fallback | Claude 3.5 Haiku       | ~$0.005/mesaj      |
| FAL.ai    | Gorsel uretimi   | Flux 2.0 Pro           | $0.003/gorsel      |
| Resend    | Email            | -                      | Ucretsiz (100/gun) |

---

## 5. Environment Variables

### Zorunlu

```
SUPABASE_URL                   # Supabase proje URL
SUPABASE_SERVICE_ROLE_KEY      # Backend admin key
OPENAI_API_KEY                 # GPT-4, embeddings
JWT_SECRET                     # Min 32 karakter
PORT                           # Default: 3000
```

### Opsiyonel

```
ANTHROPIC_API_KEY              # Claude fallback (chatbot)
FAL_API_KEY                    # Flux 2.0 gorsel uretimi
RESEND_API_KEY                 # Email dogrulama
RESEND_FROM_EMAIL              # Gonderen email
NODE_ENV                       # production | development
ALLOWED_ORIGINS                # CORS whitelist (virgul ayirmali)
LOG_LEVEL                      # debug | info | warn | error
ENABLE_CHATBOT_EMBEDDINGS      # true | false
```

---

## 6. Guvenlik Skoru (Subat 2026)

| Kategori           | Skor       | Not                                      |
| ------------------ | ---------- | ---------------------------------------- |
| SQL Injection      | 10/10      | Tum sorgular Supabase ORM                |
| Input Validation   | 9/10       | Zod her yerde                            |
| Security Headers   | 9/10       | OWASP uyumlu                             |
| CORS               | 9/10       | Allowlist + wildcard                     |
| Secrets Management | 8/10       | Env validation, maskeleme                |
| Authentication     | 9/10       | JWT + refresh token revocation + logout  |
| Logging            | 8/10       | Yapilandirilmis, hata mesajlari sanitize |
| Authorization      | 7/10       | Protected procedure, FK dogrulandi       |
| Rate Limiting      | 7/10       | In-memory + brute-force korunasi         |
| Error Handling     | 8/10       | Sanitize edildi, Turkce mesajlar         |
| **Genel**          | **8.5/10** | Faz 1-4 sonrasi (Subat 2026)             |

---

## 7. Performans Metrikleri (Tahmini)

| Metrik                   | Simdi               | Faz 3 Sonrasi          |
| ------------------------ | ------------------- | ---------------------- |
| Badge kontrolu           | 2-5 sn (100+ sorgu) | 100-200 ms             |
| Masal uretimi            | ~60 sn (sirayl TTS) | ~10 sn                 |
| PDF uretimi              | 3-5 sn (blocking)   | 500ms-1sn              |
| API response (cached)    | 200-500 ms          | 50-100 ms              |
| OpenAI algilanan bekleme | Tam yanit bekleme   | Streaming (%30 azalma) |
