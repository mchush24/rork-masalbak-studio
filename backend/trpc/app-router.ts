import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { createStorybookProcedure } from "./routes/studio/create-storybook";
import { generateColoringPDFProcedure } from "./routes/studio/generate-coloring-pdf";
import { listStorybooksProcedure, listColoringsProcedure } from "./routes/studio/list-history";
import { analyzeDrawingProcedure } from "./routes/studio/analyze-drawing";
import { registerProcedure } from "./routes/auth/register";
import { completeOnboardingProcedure } from "./routes/auth/complete-onboarding";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    register: registerProcedure,
    completeOnboarding: completeOnboardingProcedure,
  }),
  studio: createTRPCRouter({
    createStorybook: createStorybookProcedure,
    generateColoringPDF: generateColoringPDFProcedure,
    listStorybooks: listStorybooksProcedure,
    listColorings: listColoringsProcedure,
    analyzeDrawing: analyzeDrawingProcedure,
  }),
});

export type AppRouter = typeof appRouter;
