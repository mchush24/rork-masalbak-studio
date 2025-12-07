import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { listStorybooks, listColorings, deleteStorybook, deleteColoring } from "../../../lib/persist.js";

const historyInputSchema = z.object({
  user_id: z.string().nullable().optional(),
});

const deleteStorybookInputSchema = z.object({
  storybookId: z.string().uuid(),
});

const deleteColoringInputSchema = z.object({
  coloringId: z.string().uuid(),
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

export const deleteStorybookProcedure = publicProcedure
  .input(deleteStorybookInputSchema)
  .mutation(async ({ input }: { input: z.infer<typeof deleteStorybookInputSchema> }) => {
    console.log("[History] Deleting storybook:", input.storybookId);
    return await deleteStorybook(input.storybookId);
  });

export const deleteColoringProcedure = publicProcedure
  .input(deleteColoringInputSchema)
  .mutation(async ({ input }: { input: z.infer<typeof deleteColoringInputSchema> }) => {
    console.log("[History] Deleting coloring:", input.coloringId);
    return await deleteColoring(input.coloringId);
  });
