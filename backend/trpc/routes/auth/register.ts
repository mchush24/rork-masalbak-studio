import { logger } from "../../../lib/utils.js";
import { publicProcedure } from "../../create-context.js";
import { z } from "zod";
import { supabase } from "../../../lib/supabase.js";
import { sendVerificationEmail, generateVerificationCode } from "../../../lib/email.js";
import { hashPassword, validatePasswordStrength } from "../../../lib/password.js";
import { authRateLimit } from "../../middleware/rate-limit.js";

const registerInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(), // Optional for backward compatibility
  name: z.string().optional(),
  childAge: z.number().int().min(1).max(18).optional(),
});

const registerResponseSchema = z.object({
  userId: z.string(),
  email: z.string(),
  isNewUser: z.boolean(),
});

export const registerProcedure = publicProcedure
  .use(authRateLimit)
  .input(registerInputSchema)
  .output(registerResponseSchema)
  .mutation(async ({ input }) => {
    logger.info("[Auth] 📧 Registering user:", input.email);

    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', input.email)
        .single();

      if (existingUser && !checkError) {
        logger.info("[Auth] ✅ User already exists:", existingUser.id);

        // User exists - send verification code for login
        const isLogin = existingUser.onboarding_completed;
        logger.info(`[Auth] 📧 ${isLogin ? 'Login' : 'Resume onboarding'} - sending verification code`);

        const verificationCode = generateVerificationCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        // Store verification code in database
        logger.info("[Auth] 💾 Storing verification code for existing user");
        const { error: insertError } = await supabase
          .from('verification_codes')
          .insert([
            {
              email: input.email,
              code: verificationCode,
              expires_at: expiresAt.toISOString(),
              created_at: new Date().toISOString(),
            },
          ]);

        if (insertError) {
          logger.error("[Auth] ❌ DB Error:", insertError);
          throw new Error(`Failed to store code: ${insertError.message}`);
        }
        logger.info("[Auth] ✅ Code stored in DB");

        // Send email
        logger.info("[Auth] 📧 Sending verification email to:", input.email);
        await sendVerificationEmail(input.email, verificationCode, existingUser.name);

        return {
          userId: existingUser.id,
          email: existingUser.email,
          isNewUser: false,
        };
      }

      // Generate verification code for new users
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Store verification code in database
      logger.info("[Auth] 💾 Storing verification code for new user");
      const { error: insertError2 } = await supabase
        .from('verification_codes')
        .insert([
          {
            email: input.email,
            code: verificationCode,
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString(),
          },
        ]);

      if (insertError2) {
        logger.error("[Auth] ❌ DB Error:", insertError2);
        throw new Error(`Failed to store code: ${insertError2.message}`);
      }
      logger.info("[Auth] ✅ Code stored in DB");

      // Send verification email
      logger.info("[Auth] 📧 Sending verification email to:", input.email);
      await sendVerificationEmail(input.email, verificationCode, input.name);

      // Hash password if provided
      let passwordHash: string | undefined;
      if (input.password) {
        logger.info("[Auth] 🔐 Hashing password for new user");
        const strength = validatePasswordStrength(input.password);
        if (!strength.isValid) {
          throw new Error(strength.feedback.join(', '));
        }
        passwordHash = await hashPassword(input.password);
      }

      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            email: input.email,
            name: input.name,
            child_age: input.childAge,
            password_hash: passwordHash,
            password_reset_required: !passwordHash, // Require password if not provided
            onboarding_completed: false,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (createError) {
        logger.error("[Auth] ❌ Error creating user:", createError);
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      logger.info("[Auth] ✅ User created successfully:", newUser.id);

      return {
        userId: newUser.id,
        email: newUser.email,
        isNewUser: true,
      };
    } catch (error) {
      logger.error("[Auth] ❌ Registration error:", error);
      throw new Error(
        `Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
