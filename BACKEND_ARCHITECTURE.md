# Renkioo Backend Architecture - Comprehensive Design

## 📋 Executive Summary

Bu belge, Renkioo Studio uygulamasının tam backend entegrasyonu için gerekli mimariyi tanımlar.

### Mevcut Durum Analizi

#### ✅ Entegre Edilmiş Özellikler (60%)
1. **Çizim Analizi** (index.tsx + advanced-analysis.tsx)
   - `trpc.studio.analyzeDrawing` ✅
   - OpenAI GPT-4 Vision entegrasyonu ✅

2. **Masal Oluşturma** (stories.tsx)
   - `trpc.studio.createStorybook` ✅
   - `trpc.studio.listStorybooks` ✅

3. **Boyama PDF** (studio.tsx)
   - `trpc.studio.generateColoringPDF` ✅
   - `trpc.studio.generateColoringFromDrawing` ✅

4. **Kullanıcı Kayıt** (register.tsx)
   - `trpc.auth.register` ✅
   - `trpc.auth.completeOnboarding` ✅

#### ❌ Eksik/Yarım Özellikler (40%)
1. **Kullanıcı Profil Yönetimi** (profile.tsx)
   - Sadece localStorage kullanıyor
   - Backend'de profil güncelleme yok
   - Çocuk bilgisi yönetimi yok

2. **Geçmiş ve İstatistikler**
   - Analiz geçmişi kaydedilmiyor
   - Boyama geçmişi gösterilmiyor (`listColorings` kullanılmıyor)
   - Kullanıcı istatistikleri yok

3. **Oturum Yönetimi**
   - Gerçek auth yok (Supabase Auth kullanılmıyor)
   - Token yönetimi yok
   - Session persistence zayıf

4. **Dosya Yönetimi**
   - Supabase Storage entegrasyonu yok
   - Kullanıcı yükleme geçmişi yok
   - Dosya boyutu/quota kontrolü yok

---

## 🏗️ Kapsamlı Backend Mimarisi

### 1. Database Schema (Supabase PostgreSQL)

#### 1.1 Users Table (Genişletilmiş)
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Auth bilgileri (Supabase Auth ile senkronize)
  email TEXT UNIQUE NOT NULL,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Profil bilgileri
  name TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'tr' CHECK (language IN ('tr', 'en', 'ru', 'tk', 'uz')),

  -- Çocuk bilgileri (birden fazla çocuk için JSONB)
  children JSONB DEFAULT '[]'::jsonb,
  -- Örnek: [{"name": "Ali", "age": 5, "birthDate": "2019-01-15"}]

  -- Kullanıcı tercihleri
  preferences JSONB DEFAULT '{}'::jsonb,
  -- Örnek: {"theme": "light", "notifications": true, "autoSave": true}

  -- Abonelik bilgileri
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,

  -- Kullanım kotaları
  quota_used JSONB DEFAULT '{"analyses": 0, "storybooks": 0, "colorings": 0}'::jsonb,
  quota_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '1 month'),

  -- Metadata
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step TEXT
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_subscription ON users(subscription_tier, subscription_expires_at);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);
```

#### 1.2 Analyses Table (Yeni)
```sql
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- İlişkiler
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Analiz detayları
  task_type TEXT NOT NULL CHECK (task_type IN ('DAP', 'HTP', 'Family', 'Cactus', 'Tree', 'Garden', 'BenderGestalt2', 'ReyOsterrieth')),
  child_age INTEGER,
  child_name TEXT,

  -- Görsel bilgileri
  original_image_url TEXT,
  processed_image_url TEXT,
  drawing_description TEXT,
  child_quote TEXT,

  -- Analiz sonuçları (JSONB for flexibility)
  analysis_result JSONB NOT NULL,
  -- Örnek yapı:
  -- {
  --   "insights": [...],
  --   "homeTips": [...],
  --   "riskFlags": [...],
  --   "meta": {...}
  -- }

  -- AI metadata
  ai_model TEXT DEFAULT 'gpt-4-vision-preview',
  ai_confidence DECIMAL(3, 2),
  processing_time_ms INTEGER,

  -- Kullanıcı etkileşimi
  favorited BOOLEAN DEFAULT false,
  notes TEXT,
  tags TEXT[],
  shared BOOLEAN DEFAULT false,

  -- Metadata
  language TEXT DEFAULT 'tr',
  cultural_context TEXT
);

-- Indexes
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_analyses_task_type ON analyses(task_type);
CREATE INDEX idx_analyses_favorited ON analyses(favorited) WHERE favorited = true;

-- RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analyses" ON analyses
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert their own analyses" ON analyses
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own analyses" ON analyses
  FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete their own analyses" ON analyses
  FOR DELETE USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));
```

#### 1.3 Storybooks Table (Genişletilmiş)
```sql
-- Mevcut tabloya eklenecek kolonlar
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS favorited BOOLEAN DEFAULT false;
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS shared BOOLEAN DEFAULT false;
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'tr';
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS source_drawing_url TEXT;
ALTER TABLE storybooks ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_storybooks_favorited ON storybooks(favorited) WHERE favorited = true;
CREATE INDEX IF NOT EXISTS idx_storybooks_language ON storybooks(language);
```

#### 1.4 Colorings Table (Genişletilmiş)
```sql
-- Mevcut tabloya eklenecek kolonlar
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS favorited BOOLEAN DEFAULT false;
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS original_drawing_url TEXT;
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS coloring_image_url TEXT;
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS style TEXT DEFAULT 'simple' CHECK (style IN ('simple', 'detailed', 'educational'));
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS age_group INTEGER;
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS completion_time_seconds INTEGER;
ALTER TABLE colorings ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_colorings_favorited ON colorings(favorited) WHERE favorited = true;
CREATE INDEX IF NOT EXISTS idx_colorings_style ON colorings(style);
```

#### 1.5 Activity_Logs Table (Yeni - Analytics)
```sql
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- İlişkiler
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Event bilgileri
  event_type TEXT NOT NULL CHECK (event_type IN (
    'analysis_created', 'storybook_created', 'coloring_created',
    'analysis_viewed', 'storybook_viewed', 'coloring_viewed',
    'profile_updated', 'settings_changed', 'login', 'logout',
    'subscription_purchased', 'feature_used'
  )),
  event_category TEXT NOT NULL CHECK (event_category IN ('auth', 'content', 'engagement', 'monetization')),

  -- Event metadata
  event_data JSONB DEFAULT '{}'::jsonb,
  -- Örnek: {"feature": "advanced_analysis", "taskType": "DAP", "processingTime": 2500}

  -- Session tracking
  session_id TEXT,
  device_info JSONB,
  -- Örnek: {"platform": "ios", "version": "1.0.0", "device": "iPhone 13"}

  -- Geo/Performance
  ip_address INET,
  user_agent TEXT,
  performance_metrics JSONB
);

-- Indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_event_type ON activity_logs(event_type);
CREATE INDEX idx_activity_logs_event_category ON activity_logs(event_category);

-- RLS (admin-only or aggregate analytics)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs" ON activity_logs
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));
```

#### 1.6 User_Settings Table (Yeni)
```sql
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Genel ayarlar
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'tr' CHECK (language IN ('tr', 'en', 'ru', 'tk', 'uz')),

  -- Bildirim tercihleri
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,

  -- Gizlilik ayarları
  profile_visibility TEXT DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private')),
  data_sharing_consent BOOLEAN DEFAULT false,
  analytics_consent BOOLEAN DEFAULT true,

  -- Uygulama davranışları
  auto_save BOOLEAN DEFAULT true,
  show_tips BOOLEAN DEFAULT true,
  child_lock_enabled BOOLEAN DEFAULT false,

  -- Özel ayarlar (JSONB for extensibility)
  custom_settings JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR ALL USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));
```

---

### 2. Backend API Routes (tRPC)

#### 2.1 User Management Routes

**File:** `backend/trpc/routes/user/get-profile.ts`
```typescript
import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { supabase } from "@/backend/lib/supabase";

export const getProfileProcedure = publicProcedure
  .input(z.object({ userId: z.string().uuid() }))
  .query(async ({ input }) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", input.userId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  });
```

**File:** `backend/trpc/routes/user/update-profile.ts`
```typescript
export const updateProfileProcedure = publicProcedure
  .input(z.object({
    userId: z.string().uuid(),
    name: z.string().optional(),
    children: z.array(z.object({
      name: z.string(),
      age: z.number(),
      birthDate: z.string().optional(),
    })).optional(),
    preferences: z.record(z.any()).optional(),
  }))
  .mutation(async ({ input }) => {
    const { userId, ...updates } = input;

    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  });
```

#### 2.2 Analysis History Routes

**File:** `backend/trpc/routes/analysis/list-analyses.ts`
```typescript
export const listAnalysesProcedure = publicProcedure
  .input(z.object({
    userId: z.string().uuid(),
    limit: z.number().default(20),
    offset: z.number().default(0),
    taskType: z.enum(["DAP", "HTP", "Family", "Cactus", "Tree", "Garden", "BenderGestalt2", "ReyOsterrieth"]).optional(),
    favoritedOnly: z.boolean().optional(),
  }))
  .query(async ({ input }) => {
    let query = supabase
      .from("analyses")
      .select("*", { count: "exact" })
      .eq("user_id", input.userId)
      .order("created_at", { ascending: false })
      .range(input.offset, input.offset + input.limit - 1);

    if (input.taskType) {
      query = query.eq("task_type", input.taskType);
    }

    if (input.favoritedOnly) {
      query = query.eq("favorited", true);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return {
      analyses: data,
      total: count || 0,
      hasMore: (input.offset + input.limit) < (count || 0),
    };
  });
```

**File:** `backend/trpc/routes/analysis/save-analysis.ts`
```typescript
export const saveAnalysisProcedure = publicProcedure
  .input(z.object({
    userId: z.string().uuid(),
    taskType: z.enum(["DAP", "HTP", "Family", "Cactus", "Tree", "Garden", "BenderGestalt2", "ReyOsterrieth"]),
    childAge: z.number().optional(),
    childName: z.string().optional(),
    originalImageUrl: z.string().optional(),
    drawingDescription: z.string().optional(),
    childQuote: z.string().optional(),
    analysisResult: z.any(),
    aiModel: z.string().optional(),
    aiConfidence: z.number().optional(),
    processingTimeMs: z.number().optional(),
  }))
  .mutation(async ({ input }) => {
    const { data, error } = await supabase
      .from("analyses")
      .insert({
        user_id: input.userId,
        task_type: input.taskType,
        child_age: input.childAge,
        child_name: input.childName,
        original_image_url: input.originalImageUrl,
        drawing_description: input.drawingDescription,
        child_quote: input.childQuote,
        analysis_result: input.analysisResult,
        ai_model: input.aiModel || "gpt-4-vision-preview",
        ai_confidence: input.aiConfidence,
        processing_time_ms: input.processingTimeMs,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  });
```

#### 2.3 Analytics Routes

**File:** `backend/trpc/routes/analytics/log-event.ts`
```typescript
export const logEventProcedure = publicProcedure
  .input(z.object({
    userId: z.string().uuid().optional(),
    eventType: z.enum([
      "analysis_created", "storybook_created", "coloring_created",
      "analysis_viewed", "storybook_viewed", "coloring_viewed",
      "profile_updated", "settings_changed", "login", "logout",
      "subscription_purchased", "feature_used"
    ]),
    eventCategory: z.enum(["auth", "content", "engagement", "monetization"]),
    eventData: z.record(z.any()).optional(),
    sessionId: z.string().optional(),
    deviceInfo: z.record(z.any()).optional(),
  }))
  .mutation(async ({ input }) => {
    await supabase.from("activity_logs").insert({
      user_id: input.userId,
      event_type: input.eventType,
      event_category: input.eventCategory,
      event_data: input.eventData,
      session_id: input.sessionId,
      device_info: input.deviceInfo,
    });

    return { success: true };
  });
```

**File:** `backend/trpc/routes/analytics/get-user-stats.ts`
```typescript
export const getUserStatsProcedure = publicProcedure
  .input(z.object({ userId: z.string().uuid() }))
  .query(async ({ input }) => {
    // Aggregate statistics
    const [analysesCount, storybooksCount, coloringsCount] = await Promise.all([
      supabase.from("analyses").select("*", { count: "exact", head: true }).eq("user_id", input.userId),
      supabase.from("storybooks").select("*", { count: "exact", head: true }).eq("user_id", input.userId),
      supabase.from("colorings").select("*", { count: "exact", head: true }).eq("user_id", input.userId),
    ]);

    return {
      totalAnalyses: analysesCount.count || 0,
      totalStorybooks: storybooksCount.count || 0,
      totalColorings: coloringsCount.count || 0,
    };
  });
```

---

### 3. File Storage Strategy (Supabase Storage)

#### 3.1 Bucket Structure
```
masalbak/
├── drawings/
│   ├── {userId}/
│   │   ├── {analysisId}/
│   │   │   ├── original.png
│   │   │   └── processed.png
├── storybooks/
│   ├── {userId}/
│   │   ├── {storybookId}/
│   │   │   ├── page-1.png
│   │   │   ├── page-2.png
│   │   │   └── storybook.pdf
├── colorings/
│   ├── {userId}/
│   │   ├── {coloringId}/
│   │   │   ├── original.png
│   │   │   └── coloring.png
├── avatars/
│   └── {userId}.png
```

#### 3.2 Upload Route
**File:** `backend/trpc/routes/storage/upload-file.ts`
```typescript
export const uploadFileProcedure = publicProcedure
  .input(z.object({
    userId: z.string().uuid(),
    fileBase64: z.string(),
    fileName: z.string(),
    bucket: z.enum(["drawings", "storybooks", "colorings", "avatars"]),
    folder: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const { userId, fileBase64, fileName, bucket, folder } = input;

    // Convert base64 to buffer
    const buffer = Buffer.from(fileBase64, "base64");

    // Upload to Supabase Storage
    const filePath = folder
      ? `${bucket}/${userId}/${folder}/${fileName}`
      : `${bucket}/${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("masalbak")
      .upload(filePath, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) throw new Error(error.message);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("masalbak")
      .getPublicUrl(filePath);

    return { url: publicUrl, path: filePath };
  });
```

---

### 4. Authentication Enhancement (Supabase Auth)

#### 4.1 Auth Routes
**File:** `backend/trpc/routes/auth/login.ts`
```typescript
export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }))
  .mutation(async ({ input }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) throw new Error(error.message);

    // Get or create user profile
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("auth_user_id", data.user.id)
      .single();

    return {
      session: data.session,
      user: profile,
    };
  });
```

**File:** `backend/trpc/routes/auth/signup.ts`
```typescript
export const signupProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });

    if (authError) throw new Error(authError.message);

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .insert({
        email: input.email,
        name: input.name,
        auth_user_id: authData.user!.id,
      })
      .select()
      .single();

    if (profileError) throw new Error(profileError.message);

    return {
      session: authData.session,
      user: profile,
    };
  });
```

---

### 5. Migration Plan

#### Phase 1: Database Setup (Week 1)
- [ ] Create all new tables in Supabase
- [ ] Set up RLS policies
- [ ] Configure Supabase Storage buckets
- [ ] Test database connections

#### Phase 2: Core Backend (Week 2)
- [ ] Implement user profile management routes
- [ ] Implement analysis history routes
- [ ] Implement analytics routes
- [ ] Implement file upload routes

#### Phase 3: Authentication (Week 3)
- [ ] Integrate Supabase Auth
- [ ] Update useAuth hook
- [ ] Implement session management
- [ ] Add auth middleware

#### Phase 4: Frontend Integration (Week 4)
- [ ] Update profile.tsx with backend
- [ ] Add analysis history view
- [ ] Add coloring history view
- [ ] Add user statistics dashboard

#### Phase 5: Testing & Polish (Week 5)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Error handling refinement
- [ ] Documentation

---

## 📊 Implementation Priority

### 🔴 Critical (Do First)
1. **User Profile Backend** - Profil yönetimi
2. **Analysis History** - Analiz geçmişi kaydetme
3. **Supabase Auth Integration** - Gerçek authentication

### 🟡 High Priority
4. **File Upload Management** - Supabase Storage
5. **User Statistics** - Kullanım istatistikleri
6. **Coloring History** - Boyama geçmişi

### 🟢 Medium Priority
7. **Analytics Tracking** - Kullanıcı davranış analizi
8. **Settings Management** - Ayarlar backend'i
9. **Quota Management** - Kullanım kotaları

### 🔵 Nice to Have
10. **Share Functionality** - İçerik paylaşımı
11. **Favorites System** - Favori işaretleme
12. **Tags System** - Etiketleme sistemi

---

## 🎯 Next Steps

Hangi özelliği önce uygulamak istersiniz?

1. **User Profile Management** (Recommended)
2. **Analysis History**
3. **Supabase Auth Integration**
4. **Other (specify)**
