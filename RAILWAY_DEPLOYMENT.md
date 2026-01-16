# Railway Deployment Guide

This document outlines what needs to be configured in Railway for deploying the Renkioo Studio application.

---

## Prerequisites

1. **Railway Account**: Create account at [railway.app](https://railway.app)
2. **Supabase Project**: Ensure your Supabase project is set up and running
3. **OpenAI API Key**: Required for AI features

---

## Railway Configuration

### 1. Environment Variables

Add these environment variables in Railway's dashboard:

#### Backend Configuration
```bash
# Server Port
PORT=3000

# OpenAI API Key (for image generation and analysis)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (Backend - Service Role)
SUPABASE_URL=https://amtxpjngxgfuqhyiotqu.supabase.co
SUPABASE_SERVICE_ROLE=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_BUCKET=masalbak

# Frontend Environment Variables
EXPO_PUBLIC_SUPABASE_URL=https://amtxpjngxgfuqhyiotqu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EXPO_PUBLIC_API=https://your-railway-app.railway.app
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-railway-app.railway.app
```

#### Important Notes:
- **DO NOT** use SERVICE_ROLE key for `EXPO_PUBLIC_SUPABASE_ANON_KEY` - use the ANON key instead
- Replace `your-railway-app.railway.app` with your actual Railway domain
- Service role key should ONLY be used on the backend for admin operations

---

### 2. Supabase Database Setup

#### Run Migrations

Execute these migration files in order on your Supabase database:

1. **001_create_users_and_settings.sql** - Creates users and user_settings tables
2. **002_create_analyses_table.sql** - Creates analyses table with auto-quota tracking
3. **003_auth_trigger.sql** - **CRITICAL**: Creates trigger to sync Supabase Auth with users table

#### How to Run Migrations:

**Option A: Supabase Dashboard (Recommended)**
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Navigate to "SQL Editor"
4. Copy and paste each migration file content
5. Click "Run" for each migration

**Option B: Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref amtxpjngxgfuqhyiotqu

# Run migrations
supabase db push
```

---

### 3. Verify Auth Trigger

After running migration 003, verify the trigger is working:

```sql
-- Test 1: Check if trigger exists
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Expected Result:
-- trigger_name: on_auth_user_created
-- event_manipulation: INSERT
-- event_object_table: users (auth.users)
-- action_statement: EXECUTE FUNCTION public.handle_new_user()

-- Test 2: Check if function exists
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user'
  AND routine_schema = 'public';

-- Expected Result:
-- routine_name: handle_new_user
-- routine_type: FUNCTION
```

---

### 4. Update RLS Policies (If Not Already Done)

Ensure Row Level Security policies are using `auth.uid()`:

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

-- Example: Update analyses policy
CREATE POLICY "Users can view their own analyses" ON analyses
  FOR SELECT USING (
    auth.uid()::text = (
      SELECT auth_user_id::text
      FROM users
      WHERE id = user_id
    )
  );

-- Example: Update colorings policy
CREATE POLICY "Users can view their own colorings" ON colorings
  FOR SELECT USING (
    auth.uid()::text = (
      SELECT auth_user_id::text
      FROM users
      WHERE id = user_id
    )
  );
```

---

### 5. Railway Service Configuration

#### Build Settings
Railway should auto-detect the build configuration from `package.json`. No additional configuration needed.

#### Start Command
```bash
npm run backend
```

Or if you want to run both frontend and backend (not recommended for production):
```bash
npm start
```

#### Port Configuration
- Railway will automatically assign a port via the `PORT` environment variable
- Make sure your backend listens on `process.env.PORT || 3000`

---

### 6. Supabase Email Templates (Optional but Recommended)

Configure email templates for better user experience:

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Customize these templates:
   - **Confirm Signup**: Welcome message
   - **Magic Link**: Login link (if using magic links)
   - **Reset Password**: Password reset instructions
   - **Email Change**: Confirm email change

Example Password Reset Template:
```html
<h2>Şifre Sıfırlama</h2>
<p>Merhaba,</p>
<p>Renkioo hesabınızın şifresini sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
<p><a href="{{ .ConfirmationURL }}">Şifremi Sıfırla</a></p>
<p>Bu bağlantı 1 saat geçerlidir.</p>
<p>Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
```

---

### 7. Deployment Checklist

Before deploying to Railway, ensure:

- [x] All migrations are run on Supabase
- [x] Auth trigger (003_auth_trigger.sql) is verified
- [x] Environment variables are set in Railway
- [x] RLS policies are updated to use `auth.uid()`
- [x] Email templates are configured (optional)
- [x] ANON key (not SERVICE_ROLE) is used for frontend
- [x] Railway domain is updated in `EXPO_PUBLIC_API`

---

### 8. Testing After Deployment

#### Test 1: Health Check
```bash
curl https://your-railway-app.railway.app/health
# Expected: 200 OK
```

#### Test 2: Sign Up Flow
1. Open mobile app
2. Go to register screen
3. Enter email, password, name
4. Complete registration
5. Check Supabase Dashboard → Authentication → Users
6. Verify user appears in both `auth.users` AND `users` table

#### Test 3: Sign In Flow
1. Sign out from app
2. Go to login screen
3. Enter email and password
4. Verify successful login
5. Check app profile screen shows user data

#### Test 4: Backend Integration
1. Create a storybook
2. Verify it appears in `storybooks` table
3. Check RLS policy: only visible to authenticated user

---

## Troubleshooting

### Problem: Users not appearing in `users` table after signup

**Solution**: Check if auth trigger is installed:
```sql
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

If missing, run migration 003_auth_trigger.sql again.

---

### Problem: `Auth user not found` error

**Cause**: Using SERVICE_ROLE key instead of ANON key in frontend

**Solution**:
1. Go to Supabase Dashboard → Settings → API
2. Copy "anon public" key (NOT service_role)
3. Update `EXPO_PUBLIC_SUPABASE_ANON_KEY` in Railway

---

### Problem: RLS policy denying access

**Cause**: Policies not updated to use `auth.uid()`

**Solution**: Update policies to check `auth_user_id` field:
```sql
ALTER POLICY "policy_name" ON table_name
  USING (
    auth.uid()::text = (
      SELECT auth_user_id::text FROM users WHERE id = user_id
    )
  );
```

---

## Security Best Practices

1. **Never commit secrets to git**
   - Use `.env` file locally (already in .gitignore)
   - Use Railway environment variables for production

2. **Use ANON key for frontend**
   - SERVICE_ROLE bypasses RLS - DANGEROUS!
   - Always use ANON key in mobile app

3. **Enable RLS on all tables**
   ```sql
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
   ```

4. **Regularly rotate API keys**
   - OpenAI API key
   - Supabase keys (if compromised)

5. **Monitor Supabase logs**
   - Check for unusual auth activity
   - Monitor API usage

---

## Next Steps

Once deployed to Railway:

1. Update mobile app with Railway URL
2. Test complete auth flow
3. Monitor logs for errors
4. Set up analytics (optional)
5. Configure error tracking (Sentry, etc.)

---

## Support

If you encounter issues:

1. Check Railway logs: `railway logs`
2. Check Supabase logs: Dashboard → Logs
3. Verify environment variables are set correctly
4. Test backend endpoints with curl/Postman

---

**Last Updated**: 2025-11-27
**Related Documents**:
- `SUPABASE_AUTH_STRATEGY.md` - Complete auth integration strategy
- `SETUP.md` - Local development setup
- `BACKEND_ARCHITECTURE.md` - Backend architecture overview
