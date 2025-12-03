import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { supabase } from "../../../../lib/supabase";
import { sendVerificationEmail, generateVerificationCode } from "../../../lib/email";

const registerInputSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  childAge: z.number().int().min(1).max(18).optional(),
});

const registerResponseSchema = z.object({
  userId: z.string(),
  email: z.string(),
  isNewUser: z.boolean(),
});

export const registerProcedure = publicProcedure
  .input(registerInputSchema)
  .output(registerResponseSchema)
  .mutation(async ({ input }) => {
    console.log("[Auth] 📧 Registering user:", input.email);

    try {
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', input.email)
        .single();

      if (existingUser && !checkError) {
        console.log("[Auth] ✅ User already exists:", existingUser.id);

        // Send verification email for existing users too
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        // Store verification code in database
        console.log("[Auth] 💾 Storing code for existing user:", verificationCode);
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
          console.error("[Auth] ❌ DB Error:", insertError);
          throw new Error(`Failed to store code: ${insertError.message}`);
        }
        console.log("[Auth] ✅ Code stored in DB");

        // Send email
        console.log("[Auth] 📧 Sending email with code:", verificationCode);
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
      console.log("[Auth] 💾 Storing code for new user:", verificationCode);
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
        console.error("[Auth] ❌ DB Error:", insertError2);
        throw new Error(`Failed to store code: ${insertError2.message}`);
      }
      console.log("[Auth] ✅ Code stored in DB");

      // Send verification email
      console.log("[Auth] 📧 Sending email with code:", verificationCode);
      await sendVerificationEmail(input.email, verificationCode, input.name);

      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            email: input.email,
            name: input.name,
            child_age: input.childAge,
            onboarding_completed: false,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (createError) {
        console.error("[Auth] ❌ Error creating user:", createError);
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      console.log("[Auth] ✅ User created successfully:", newUser.id);

      return {
        userId: newUser.id,
        email: newUser.email,
        isNewUser: true,
      };
    } catch (error) {
      console.error("[Auth] ❌ Registration error:", error);
      throw new Error(
        `Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
