import { z } from "zod";
import { publicProcedure } from "../../create-context";
import { listStorybooks, listColorings } from "../../../lib/persist.js";

export const listStorybooksProcedure = publicProcedure
  .input(z.object({ user_id: z.string().nullable().optional() }))
  .query(async ({ input }) => {
    return await listStorybooks(input.user_id ?? null);
  });

export const listColoringsProcedure = publicProcedure
  .input(z.object({ user_id: z.string().nullable().optional() }))
  .query(async ({ input }) => {
    return await listColorings(input.user_id ?? null);
  });
