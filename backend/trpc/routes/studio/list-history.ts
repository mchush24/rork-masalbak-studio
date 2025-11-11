import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { listStorybooks, listColorings } from "../../../lib/persist.js";

const historyInputSchema = z.object({
  user_id: z.string().nullable().optional(),
});

export const listStorybooksProcedure = publicProcedure
  .input(historyInputSchema)
  .query(async ({ input }: { input: z.infer<typeof historyInputSchema> }) => {
    console.log("[History] Listing storybooks");
    return await listStorybooks(input.user_id ?? null);
  });

export const listColoringsProcedure = publicProcedure
  .input(historyInputSchema)
  .query(async ({ input }: { input: z.infer<typeof historyInputSchema> }) => {
    console.log("[History] Listing colorings");
    return await listColorings(input.user_id ?? null);
  });
