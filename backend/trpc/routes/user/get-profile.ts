import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { supa as supabase } from "../../../lib/supabase.js";

const getProfileInputSchema = z.object({
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
});

export const getProfileProcedure = publicProcedure
  .input(getProfileInputSchema)
  .query(async ({ input }) => {
    console.log("[getProfile] Fetching profile:", input);

    let query = supabase.from("users").select("*");

    if (input.userId) {
      query = query.eq("id", input.userId);
    } else if (input.email) {
      query = query.eq("email", input.email);
    } else {
      throw new Error("Either userId or email must be provided");
    }

    const { data, error } = await query.single();

    if (error) {
      console.error("[getProfile] Error:", error);
      throw new Error(error.message);
    }

    console.log("[getProfile] Profile found:", data?.email);
    return data;
  });
