# Email Verification Setup Guide

Email verification has been successfully implemented! Follow these steps to complete the setup:

## 1. Database Migration

Run the verification_codes table migration on your Supabase instance:

```bash
# Navigate to Supabase SQL Editor and run:
cat supabase/migrations/004_create_verification_codes_table.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

## 2. Get Resend API Key

1. Go to [Resend.com](https://resend.com) and create an account
2. Navigate to API Keys section
3. Create a new API key
4. Copy the API key (starts with `re_`)

## 3. Configure Environment Variables

Add the following environment variable to your Railway deployment:

```bash
RESEND_API_KEY=re_your_api_key_here
```

For local development, add to `.env`:
```
RESEND_API_KEY=re_your_api_key_here
```

## 4. Configure Email Domain (Optional but Recommended)

By default, emails are sent from `onboarding@resend.dev`. To use your own domain:

1. In Resend dashboard, go to Domains
2. Add your domain (e.g., `zuna.app`)
3. Add DNS records as instructed
4. Update `/Users/ecepekyalcin/rork-masalbak-studio/backend/lib/email.ts` line 11:
   ```typescript
   from: 'Zuna <onboarding@zuna.app>', // Change from resend.dev to your domain
   ```

## 5. How It Works

### Registration Flow:

1. **User enters email** → Backend generates 6-digit code and sends email
2. **User enters verification code** → Backend validates code
3. **Code verified** → User continues with age and name
4. **Registration complete** → User is logged in

### Key Files:

- **Email Service**: `/backend/lib/email.ts`
  - `sendVerificationEmail()` - Sends HTML email with code
  - `generateVerificationCode()` - Generates 6-digit code
  - `storeVerificationCode()` - Prepares code for storage

- **Backend Routes**:
  - `/backend/trpc/routes/auth/register.ts` - Modified to send verification email
  - `/backend/trpc/routes/auth/verify-email.ts` - New endpoint to verify codes

- **Frontend**: `/app/(onboarding)/register.tsx`
  - Added `VERIFY_CODE` step
  - `VerifyCodeStep` component with 6-digit input
  - `handleSendVerificationEmail()` - Triggers email sending
  - `handleVerifyCode()` - Validates the code

### Database Table:

```sql
verification_codes (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL
)
```

Codes expire after 10 minutes and are automatically cleaned up after verification.

## 6. Testing

Once configured, test the flow:

1. Start the app and navigate to registration
2. Enter an email address
3. Check your email for the verification code
4. Enter the 6-digit code
5. Complete registration

### Email Template Preview:

The email includes:
- Beautiful gradient design matching Zuna branding
- Large 6-digit verification code
- Personalized greeting with user's name
- 10-minute expiration notice
- Professional footer with Zuna branding

## 7. Monitoring

Check logs for email sending:
- `[Email] ✅ Verification email sent successfully:` - Email sent
- `[Auth] ✅ Email verified successfully:` - Code verified
- `[Email] Failed to send verification email:` - Email error

## Troubleshooting

### Email not receiving:
- Check spam/junk folder
- Verify RESEND_API_KEY is set correctly
- Check Resend dashboard for delivery status
- Ensure email address is valid

### Verification code invalid:
- Code expires after 10 minutes
- Each registration generates a new code
- Old codes are deleted after use

### Backend errors:
- Ensure database migration has been run
- Check that verification_codes table exists
- Verify RLS policies are set correctly
