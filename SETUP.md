# Renkioo Studio - Backend Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier is fine)
- OpenAI API key

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# App
NODE_ENV=development
PORT=3000
```

### Database Setup

1. **Create Supabase Project**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Copy your project URL and keys

2. **Run Database Migration**
   ```bash
   # Option 1: Using Supabase CLI
   supabase db push

   # Option 2: Manual (Supabase Dashboard)
   # Go to SQL Editor in Supabase Dashboard
   # Paste and run: supabase/migrations/001_create_users_and_settings.sql
   ```

3. **Verify Tables Created**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

   Expected tables:
   - `users`
   - `user_settings`
   - `storybooks`
   - `colorings`

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Run the App

```bash
# Start Metro bundler
npm start

# Run on web
npm run web

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 📊 Database Schema

### Users Table
Stores user profiles, children info, preferences, and quotas.

**Key Fields:**
- `email` - User email (unique)
- `name` - Display name
- `children` - JSONB array of children [{name, age, birthDate}]
- `preferences` - JSONB user preferences
- `subscription_tier` - free/pro/premium
- `quota_used` - Usage tracking

### User Settings Table
Stores user preferences and application settings.

**Key Fields:**
- `theme` - light/dark/auto
- `language` - tr/en/ru/tk/uz
- `notifications_enabled` - Boolean
- `auto_save` - Boolean

### Storybooks & Colorings Tables
Extended with:
- `favorited` - Mark as favorite
- `tags` - Array of tags
- `metadata` - JSONB for extensibility

## 🔧 Backend API Routes

### User Management
- `trpc.user.getProfile` - Get user profile
- `trpc.user.updateProfile` - Update profile
- `trpc.user.getUserStats` - Get user statistics
- `trpc.user.getSettings` - Get user settings
- `trpc.user.updateSettings` - Update settings

### Studio (Existing)
- `trpc.studio.analyzeDrawing` - AI drawing analysis
- `trpc.studio.createStorybook` - Generate storybook
- `trpc.studio.generateColoringPDF` - Generate coloring PDF
- `trpc.studio.listStorybooks` - List user storybooks
- `trpc.studio.listColorings` - List user colorings

### Auth (Existing)
- `trpc.auth.register` - Register new user
- `trpc.auth.completeOnboarding` - Complete onboarding

## 📱 Frontend Integration

### Profile Screen
Now displays:
- User stats (storybooks, colorings, analyses)
- Pull-to-refresh functionality
- Edit profile button
- Real-time data from backend

### Using tRPC in Components

```typescript
import { trpc } from '@/lib/trpc';

// In your component
const { data: profile } = trpc.user.getProfile.useQuery(
  { userId: user.userId }
);

const updateMutation = trpc.user.updateProfile.useMutation();

const handleUpdate = async () => {
  await updateMutation.mutateAsync({
    userId: user.userId,
    name: 'New Name',
  });
};
```

## 🧪 Testing

### Test User Profile Routes

```bash
# Using the app
1. Register a new user
2. Go to Profile tab
3. Verify stats display correctly
4. Pull down to refresh
5. Check console logs for API calls
```

### Manual API Testing

```typescript
// In browser console or test file
const stats = await fetch('http://localhost:3000/api/trpc/user.getUserStats', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'your-user-id'
  })
});
```

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
- Verify `.env` file exists and has correct values
- Check Supabase project is active
- Verify network connectivity

### "User not found"
- Check user exists in database
- Verify userId is correct
- Check RLS policies allow access

### "Stats not loading"
- Check user has created content
- Verify userId in storybooks/colorings table
- Check backend logs for errors

## 📚 Next Steps

1. **Implement Supabase Auth Integration**
   - Replace localStorage with Supabase Auth
   - Add email verification
   - Password reset functionality

2. **Add Analysis History**
   - Create analyses table
   - Save analysis results
   - Display history

3. **File Upload Management**
   - Supabase Storage integration
   - Image upload/download
   - Quota management

4. **Analytics Tracking**
   - User behavior tracking
   - Usage metrics
   - A/B testing

## 🔒 Security Notes

- Never commit `.env` file
- Use environment variables for all secrets
- Enable RLS policies in production
- Validate all user inputs
- Rate limit API endpoints

## 📖 Documentation

- [Backend Architecture](./BACKEND_ARCHITECTURE.md) - Complete backend design
- [API Reference](./API_REFERENCE.md) - Coming soon
- [Database Schema](./SUPABASE_SCHEMA.sql) - Original schema
