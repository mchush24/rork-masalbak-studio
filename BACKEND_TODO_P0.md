# 🔴 P0 - KRİTİK TODO LİSTESİ (Bu Hafta Mutlaka Yapılmalı)

## 1. 🚨 API Key Güvenliği (ACIL!)

### Yapılacaklar:
- [ ] **OpenAI API Key'i iptal et ve yenisini al**
  - https://platform.openai.com/api-keys
  - Eski key'i sil
  - Yeni key oluştur

- [ ] **Supabase Service Role Key'i rotate et**
  - Supabase Dashboard → Settings → API
  - Service role key'i yenile

- [ ] **FAL.ai API Key'i yenile**
  - https://fal.ai/dashboard/keys
  - Eski key'i sil, yeni oluştur

- [ ] **Resend API Key'i yenile**
  - https://resend.com/api-keys
  - Eski key'i sil, yeni oluştur

### Adımlar:
```bash
# 1. Tüm servislerde key'leri iptal et
# 2. Yeni key'leri al
# 3. .env dosyasını güncelle (LOKAL)
# 4. Railway'de environment variables'ı güncelle
```

---

## 2. 🔒 .env Dosyası Güvenliği

### Yapılacaklar:
- [ ] **.env dosyasını .gitignore'a ekle**
```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

- [ ] **Git history'den .env'yi temizle**
```bash
# ÖNCE BACKUP AL!
cp .env .env.backup

# Git history'den sil
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (DİKKATLİ!)
git push origin --force --all
```

- [ ] **.env.example dosyası oluştur**
```bash
cp .env .env.example
# .env.example içindeki tüm değerleri placeholder'lara çevir
# Örnek: OPENAI_API_KEY=your_openai_key_here
```

---

## 3. 🔐 JWT Authentication Sistemi

### Yapılacaklar:

#### A. JWT Library Kur
```bash
npm install jsonwebtoken @types/jsonwebtoken
npm install bcryptjs @types/bcryptjs
```

#### B. JWT Helper Oluştur
- [ ] **Dosya: `backend/lib/auth/jwt.ts`**
```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface TokenPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'renkioo-studio',
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'renkioo-studio',
  });
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
```

#### C. .env'e JWT_SECRET Ekle
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# .env dosyasına ekle:
JWT_SECRET=your_generated_secret_here
```

---

## 4. 🛡️ Protected Procedure Oluştur

### Yapılacaklar:

#### A. Context'i Güncelle
- [ ] **Dosya: `backend/trpc/create-context.ts`**
```typescript
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { verifyToken } from "../lib/auth/jwt";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // Extract token from Authorization header
  const authHeader = opts.req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  let userId: string | null = null;

  if (token) {
    try {
      const payload = verifyToken(token);
      userId = payload.userId;
    } catch (error) {
      console.error('[Auth] Invalid token:', error);
      // Don't throw here, let procedures handle it
    }
  }

  return {
    req: opts.req,
    userId,
    isAuthenticated: !!userId,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Bu işlem için giriş yapmanız gerekiyor',
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // Now guaranteed to be defined
    },
  });
});
```

---

## 5. 🔄 Login Endpoint'ini Güncelle

### Yapılacaklar:
- [ ] **Dosya: `backend/trpc/routes/auth/login-with-password.ts`**
```typescript
import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { supabase } from "../../../../lib/supabase";
import { verifyPassword } from "../../../lib/password";
import { generateAccessToken, generateRefreshToken } from "../../../lib/auth/jwt";
import { TRPCError } from "@trpc/server";

const loginResponseSchema = z.object({
  success: z.boolean(),
  userId: z.string(),
  email: z.string(),
  name: z.string().optional(),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

export const loginWithPasswordProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }))
  .output(loginResponseSchema)
  .mutation(async ({ input }) => {
    // ... existing validation code ...

    // Generate JWT tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    return {
      success: true,
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  });
```

---

## 6. 🔒 Tüm User Endpoint'leri Protected Yap

### Yapılacaklar:

#### A. Update Profile
```typescript
// backend/trpc/routes/user/update-profile.ts
import { protectedProcedure } from "../../create-context"; // ← değişti

export const updateProfileProcedure = protectedProcedure // ← değişti
  .input(z.object({
    // userId artık gerekli değil - context'ten alınacak
    name: z.string().optional(),
    avatarUrl: z.string().optional(),
    // ...
  }))
  .mutation(async ({ ctx, input }) => {
    // ctx.userId otomatik olarak var (protectedProcedure'dan)
    const userId = ctx.userId;

    const { data, error } = await supabase
      .from("users")
      .update(input)
      .eq("id", userId) // ← context'ten gelen userId
      .select()
      .single();

    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    return data;
  });
```

#### B. Diğer User Endpoints
- [ ] `get-profile.ts` → `protectedProcedure`
- [ ] `get-user-stats.ts` → `protectedProcedure`
- [ ] `get-settings.ts` → `protectedProcedure`
- [ ] `update-settings.ts` → `protectedProcedure`

#### C. Analysis Endpoints
- [ ] `save-analysis.ts` → `protectedProcedure`
- [ ] `list-analyses.ts` → `protectedProcedure`
- [ ] `get-analysis.ts` → `protectedProcedure`
- [ ] `update-analysis.ts` → `protectedProcedure`
- [ ] `delete-analysis.ts` → `protectedProcedure`

#### D. Studio Endpoints
- [ ] `create-storybook.ts` → `protectedProcedure`
- [ ] `list-storybooks.ts` → `protectedProcedure`
- [ ] `delete-storybook.ts` → `protectedProcedure`
- [ ] Diğer tüm studio endpoints...

---

## 7. 🔐 RLS Policies Düzelt

### Yapılacaklar:
- [ ] **Dosya: `supabase/migrations/012_fix_rls_policies.sql`**
```sql
-- Migration: Fix Row Level Security Policies
-- Created: 2025-01-06
-- Description: Enable proper RLS with auth.uid() checks

-- ==========================================
-- 1. DROP EXISTING INSECURE POLICIES
-- ==========================================

-- Users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Analyses table
DROP POLICY IF EXISTS "Users can view their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can delete their own analyses" ON analyses;

-- User Settings table
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;

-- ==========================================
-- 2. CREATE SECURE POLICIES WITH auth.uid()
-- ==========================================

-- Users table - Secure policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Analyses table - Secure policies
CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON analyses FOR DELETE
  USING (auth.uid() = user_id);

-- User Settings table - Secure policies
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ==========================================
-- 3. STORYBOOKS & COLORINGS
-- ==========================================

-- Storybooks
CREATE POLICY "Users can view own storybooks"
  ON storybooks FOR SELECT
  USING (auth.uid() = user_id_fk);

CREATE POLICY "Users can insert own storybooks"
  ON storybooks FOR INSERT
  WITH CHECK (auth.uid() = user_id_fk);

CREATE POLICY "Users can delete own storybooks"
  ON storybooks FOR DELETE
  USING (auth.uid() = user_id_fk);

-- Colorings
CREATE POLICY "Users can view own colorings"
  ON colorings FOR SELECT
  USING (auth.uid() = user_id_fk);

CREATE POLICY "Users can insert own colorings"
  ON colorings FOR INSERT
  WITH CHECK (auth.uid() = user_id_fk);

CREATE POLICY "Users can delete own colorings"
  ON colorings FOR DELETE
  USING (auth.uid() = user_id_fk);
```

---

## 8. ⚡ Rate Limiting Ekle

### Yapılacaklar:

#### A. Rate Limit Package Kur
```bash
npm install @hono/rate-limiter
```

#### B. Rate Limit Middleware Oluştur
- [ ] **Dosya: `backend/middleware/rate-limit.ts`**
```typescript
import { rateLimiter } from '@hono/rate-limiter';

// Authentication endpoints - strict limits
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 dakika
  limit: 5, // 5 request
  standardHeaders: 'draft-6',
  keyGenerator: (c) => {
    // IP bazlı rate limiting
    return c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip') || 'unknown';
  },
});

// AI endpoints - protect from cost explosion
export const aiRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 dakika
  limit: 10, // 10 AI request per minute
  standardHeaders: 'draft-6',
  keyGenerator: (c) => {
    // User bazlı rate limiting (auth header'dan user çek)
    const token = c.req.header('authorization')?.replace('Bearer ', '');
    return token || c.req.header('x-forwarded-for') || 'unknown';
  },
});

// General API - moderate limits
export const apiRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 dakika
  limit: 100, // 100 request per minute
  standardHeaders: 'draft-6',
});
```

#### C. Hono App'e Ekle
- [ ] **Dosya: `backend/hono.ts`**
```typescript
import { authRateLimiter, aiRateLimiter, apiRateLimiter } from './middleware/rate-limit';

const app = new Hono();

// CORS
app.use("*", cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8081'],
  credentials: true,
}));

// General rate limiting for all endpoints
app.use('/api/*', apiRateLimiter);

// Specific rate limits (bunları tRPC route'larına da ekleyebiliriz)
// Auth endpoints için daha strict
// AI endpoints için cost protection

// ... rest of the code
```

---

## 9. 🌐 CORS Güvenliği

### Yapılacaklar:
- [ ] **Dosya: `backend/hono.ts`**
```typescript
import { cors } from "hono/cors";

// .env dosyasına ekle:
// ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.1.*,https://yourdomain.com

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:8081',
  'exp://192.168.1.*', // Expo development
];

app.use("*", cors({
  origin: (origin) => {
    // Allow Expo development (starts with exp://)
    if (origin.startsWith('exp://')) return origin;

    // Check against allowed origins
    if (allowedOrigins.includes(origin)) return origin;

    // Reject unknown origins in production
    if (process.env.NODE_ENV === 'production') {
      return null;
    }

    // Allow in development
    return origin;
  },
  credentials: true,
  maxAge: 86400,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
```

---

## 10. 🔍 Security Audit

### Yapılacaklar:
- [ ] **Tüm endpoint'leri kontrol et**
  - Her endpoint authentication gerektiriyor mu?
  - User ID validation yapılıyor mu?
  - Input validation yeterli mi?

- [ ] **Environment variables kontrolü**
  - .env Git'te yok mu?
  - Railway'de tüm secrets var mı?
  - JWT_SECRET güçlü mü?

- [ ] **Database kontrolü**
  - RLS policies aktif mi?
  - Policies doğru çalışıyor mu?
  - Test kullanıcısı ile dene

- [ ] **Rate limiting test**
  - Auth endpoints rate limit çalışıyor mu?
  - AI endpoints korumalı mı?

- [ ] **Manual test**
```bash
# 1. Token olmadan protected endpoint çağır → UNAUTHORIZED olmalı
curl http://localhost:3000/api/trpc/user.getProfile

# 2. Login yap, token al
curl -X POST http://localhost:3000/api/trpc/auth.loginWithPassword \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Token ile protected endpoint çağır → SUCCESS olmalı
curl http://localhost:3000/api/trpc/user.getProfile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ✅ P0 Checklist Özet

- [ ] 1. API Key'leri iptal et ve yenile
- [ ] 2. .env'yi Git'ten kaldır ve .gitignore'a ekle
- [ ] 3. JWT sistemi kur
- [ ] 4. Protected procedure oluştur
- [ ] 5. Login endpoint'ini güncelle
- [ ] 6. Tüm user endpoint'leri protected yap
- [ ] 7. RLS policies düzelt
- [ ] 8. Rate limiting ekle
- [ ] 9. CORS güvenliği sağla
- [ ] 10. Security audit yap

**Tahmini Süre:** 2-3 gün (full-time)
**Kritiklik:** 🔴 MAXIMUM - Production'a almadan MUTLAKA yapılmalı!
