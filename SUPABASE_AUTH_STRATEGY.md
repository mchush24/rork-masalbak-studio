# Supabase Auth Integration Strategy

## Current State Analysis

### What We Have ✅
1. **localStorage-based auth** (`useAuth` hook)
   - UserSession interface
   - login/logout functions
   - Basic session persistence

2. **User registration backend** (`trpc.auth.register`)
   - Creates user in `users` table
   - No real authentication

3. **Users table** ready
   - Has `auth_user_id` field (currently unused)
   - RLS policies prepared

### What We Need ❌
1. Real authentication with Supabase Auth
2. Email/password login
3. Session management with JWT tokens
4. Email verification
5. Password reset
6. Secure RLS policies

---

## Integration Strategy

### Phase 1: Database Setup
**Goal**: Sync Supabase auth.users with our users table

```sql
-- Trigger: Auto-create user profile when auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Phase 2: Auth Helper Library
**File**: `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
```

### Phase 3: Update useAuth Hook
**Changes**:
- Replace localStorage with Supabase Auth
- Use `supabase.auth.signUp()`
- Use `supabase.auth.signInWithPassword()`
- Use `supabase.auth.signOut()`
- Listen to `onAuthStateChange`

### Phase 4: Update Backend Routes
**Changes**:
- Remove custom `trpc.auth.register`
- Remove custom `trpc.auth.completeOnboarding`
- Use Supabase Auth exclusively
- Update `users` table via triggers

### Phase 5: Update RLS Policies
**Changes**:
```sql
-- Example: Update storybooks policy
CREATE POLICY "Users can view their own storybooks" ON storybooks
  FOR SELECT USING (
    auth.uid()::text = (
      SELECT auth_user_id::text
      FROM users
      WHERE id = user_id
    )
  );
```

### Phase 6: Add New Screens
1. **Login Screen** (`app/(onboarding)/login.tsx`)
2. **Forgot Password** (`app/(onboarding)/forgot-password.tsx`)
3. **Reset Password** (deep link handler)

---

## Implementation Order

### Step 1: Setup (10 min)
- [x] Install @supabase/supabase-js
- [ ] Create `lib/supabase.ts`
- [ ] Update env variables
- [ ] Create auth trigger migration

### Step 2: Core Auth (30 min)
- [ ] Update `useAuth` hook
- [ ] Add auth state listener
- [ ] Update session handling

### Step 3: Screens (20 min)
- [ ] Update `register.tsx`
- [ ] Create `login.tsx`
- [ ] Create `forgot-password.tsx`

### Step 4: Backend (15 min)
- [ ] Remove old auth routes
- [ ] Update user creation logic
- [ ] Test backend integration

### Step 5: RLS (15 min)
- [ ] Update all RLS policies
- [ ] Test access control
- [ ] Verify security

### Step 6: Testing (10 min)
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test logout
- [ ] Test password reset

**Total Time**: ~1.5-2 hours

---

## Migration Path

### Option A: Clean Migration (RECOMMENDED)
1. Keep existing users in `users` table
2. Next login, they create Supabase Auth account
3. Link via email matching
4. Gradual migration

### Option B: Force Migration
1. All users must re-register
2. Clean slate
3. Simpler but disruptive

**Decision**: Option A (Graceful migration)

---

## Security Considerations

### 1. Row Level Security
- Enable RLS on all tables ✅ (already done)
- Update policies to use `auth.uid()`
- Test thoroughly

### 2. API Keys
- Use ANON key in frontend ✅
- Use SERVICE_ROLE key only in backend ✅
- Never expose service role key

### 3. Session Management
- Auto-refresh tokens ✅
- Persist sessions securely ✅
- Handle session expiry

### 4. Email Verification
- Enable in Supabase dashboard
- Handle unverified users
- Resend verification email

---

## Rollback Plan

If something breaks:
1. Keep old `useAuth` hook as backup
2. Feature flag for Supabase Auth
3. Can revert to localStorage quickly
4. No data loss (users table unchanged)

---

## Testing Checklist

- [ ] Signup with email/password
- [ ] Login with correct credentials
- [ ] Login with wrong credentials (should fail)
- [ ] Logout
- [ ] Session persistence (close/reopen app)
- [ ] Password reset email
- [ ] Email verification
- [ ] RLS policies working
- [ ] Backend routes secured
- [ ] Multi-device sessions

---

## Next Steps

1. Check if @supabase/supabase-js is installed
2. Create migration for auth trigger
3. Create lib/supabase.ts
4. Start updating useAuth hook

Let's begin! 🚀
